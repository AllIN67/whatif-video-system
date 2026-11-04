// Bühne im Browser. Ein Bild entsteht ausschließlich durch window.__stage.setFrame(n):
// Zeit t = n / fps, daraus Szene, Kamera, Übergang, HUD und Text – ohne Uhr, ohne Animationsschleife.
//
// URL-Parameter:
//   production=<Pfad relativ zum Repo, z. B. productions/_pipeline_test>
//   lang=en            Sprache der Textdatei text.<lang>.json
//   selftest=1|cheat   eingebaute Testszene (Pipeline-Tests)
import { installGuard, lock } from './guard.js';

const params = new URLSearchParams(location.search);
const stage = { ready: false, error: null };
window.__stage = stage;

async function fetchJson(url) {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.json();
}

function makeRenderer(THREE) {
  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setSize(1080, 1920, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = true;
  return renderer;
}

async function selftest(THREE, seed) {
  const { createRng } = await import('./rng.js');
  const renderer = makeRenderer(THREE);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8fb4d6);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.1, 500);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(20, 40, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400, 40, 40), new THREE.MeshStandardMaterial({ color: 0x6b8e4e, flatShading: true }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const rng = createRng(seed);
  for (let i = 0; i < 200; i++) {
    const h = rng.range(2, 20);
    const b = new THREE.Mesh(new THREE.BoxGeometry(3, h, 3), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(rng.next(), 0.4, 0.6), flatShading: true }));
    b.position.set(rng.range(-80, 80), h / 2, -rng.range(0, 160));
    b.castShadow = true;
    b.receiveShadow = true;
    scene.add(b);
  }
  renderer.compile(scene, camera);
  return {
    fps: 30,
    total: 300,
    frame(n) {
      const t = n / 30;
      camera.position.set(Math.sin(t * 0.3) * 10, 1.6 + t * 0.2, 20 - t * 2);
      camera.lookAt(0, 5, -40);
      if (params.get('selftest') === 'cheat') Date.now(); // muss im Render-Modus werfen
      renderer.render(scene, camera);
    },
  };
}

// Schattenempfänger mit riesigen Dreiecken erzeugen im Software-Renderer bei einzelnen Kameraposen falsche
// Schatten (gefunden in der Testproduktion, Frame 566). Deshalb beim Aufbau abbrechen statt still fehlerhaft rendern.
const MAX_RECEIVER_EDGE_M = 25;
function checkShadowReceivers(THREE, scene) {
  scene.updateMatrixWorld(true);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  scene.traverse((o) => {
    if (!o.isMesh || !o.receiveShadow || !o.geometry?.attributes?.position) return;
    const pos = o.geometry.attributes.position;
    const idx = o.geometry.index;
    const tri = idx ? idx.count / 3 : pos.count / 3;
    const step = Math.max(1, Math.floor(tri / 2000)); // Stichprobe für große Netze
    let max = 0;
    for (let i = 0; i < tri; i += step) {
      const ia = idx ? idx.getX(3 * i) : 3 * i;
      const ib = idx ? idx.getX(3 * i + 1) : 3 * i + 1;
      const ic = idx ? idx.getX(3 * i + 2) : 3 * i + 2;
      a.fromBufferAttribute(pos, ia).applyMatrix4(o.matrixWorld);
      b.fromBufferAttribute(pos, ib).applyMatrix4(o.matrixWorld);
      c.fromBufferAttribute(pos, ic).applyMatrix4(o.matrixWorld);
      max = Math.max(max, a.distanceTo(b), b.distanceTo(c), c.distanceTo(a));
    }
    if (max > MAX_RECEIVER_EDGE_M) {
      throw new Error(`Schattenempfänger "${o.name || o.type}" hat Dreiecke mit ${max.toFixed(0)} m Kantenlänge (max. ${MAX_RECEIVER_EDGE_M} m) – Geometrie unterteilen`);
    }
  });
}

// Nachbearbeitung als WebGL-Pass: Szene → HDR-Rendertarget (MSAA) → Post-Shader → Bildschirm.
// Der Post-Shader macht in einem Durchgang: Richtungs-Unschärfe (Whip, schnelle Bewegung), chromatische
// Aberration (Aufprall), Tonemapping, Vignette, Filmkorn (aus dem Frame-Index geseedet → deterministisch)
// und Aufhellung (Blitz). Text-Ebene (HTML) liegt darüber und bleibt scharf.
// Bewegungsunschärfe: mehrere Teilbilder innerhalb der Belichtungszeit werden im Akkumulations-Target gemittelt.
function createPost(THREE, renderer) {
  const mk = (samples) => {
    const rt = new THREE.WebGLRenderTarget(1080, 1920, { samples, type: THREE.HalfFloatType });
    rt.texture.wrapS = rt.texture.wrapT = THREE.ClampToEdgeWrapping;
    rt.texture.colorSpace = THREE.LinearSRGBColorSpace;
    return rt;
  };
  const rtScene = mk(4);
  const rtAccum = mk(0);
  const TAPS = 24;
  const quad = (mat) => {
    const sc = new THREE.Scene();
    sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    return sc;
  };
  const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  // Akkumulation: Teilbild mit Gewicht 1/N additiv aufaddieren
  const accMat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: rtScene.texture }, w: { value: 1 } },
    vertexShader: vs,
    fragmentShader: 'uniform sampler2D tex; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tex, vUv) * w; }',
    blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, toneMapped: false, transparent: true,
  });
  const accScene = quad(accMat);
  const postMat = new THREE.ShaderMaterial({
    uniforms: {
      tex: { value: rtScene.texture }, blurVec: { value: new THREE.Vector2() }, texel: { value: new THREE.Vector2(1 / 1080, 1 / 1920) },
      vignette: { value: 0 }, grain: { value: 0 }, seed: { value: 0 }, chroma: { value: 0 }, flash: { value: 0 }, flashColor: { value: new THREE.Color(1, 1, 1) },
      radial: { value: 0 },
      // Version 3.0 (Analyse 6 Videos, Licht/Atmosphäre): Bloom (Leuchten um helle Lichtquellen/Neon/Spitzlichter) und
      // Color Grading (Sättigung, Kontrast, Farbstich, Anhebung). Standard = aus → bestehende Produktionen bit-identisch.
      bloom: { value: 0 }, bloomThreshold: { value: 0.9 }, bloomRadius: { value: 1 },
      gradeOn: { value: 0 }, gSat: { value: 1 }, gContrast: { value: 1 }, gTint: { value: new THREE.Vector3(1, 1, 1) }, gLift: { value: 0 },
    },
    vertexShader: vs,
    fragmentShader: `
      uniform sampler2D tex; uniform vec2 blurVec; uniform vec2 texel; uniform float vignette; uniform float grain;
      uniform float seed; uniform float chroma; uniform float flash; uniform vec3 flashColor; uniform float radial; varying vec2 vUv;
      uniform float bloom; uniform float bloomThreshold; uniform float bloomRadius; uniform float gradeOn; uniform float gSat; uniform float gContrast; uniform vec3 gTint; uniform float gLift;
      float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423) + seed * 0.1031); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
      vec3 sampleC(vec2 uv){
        if (chroma <= 0.0) return texture2D(tex, uv).rgb;
        vec2 d = (uv - 0.5) * chroma * texel.x;
        return vec3(texture2D(tex, uv + d).r, texture2D(tex, uv).g, texture2D(tex, uv - d).b);
      }
      void main(){
        vec3 col;
        // Richtungsunschärfe (Pixelvektor) + radiale Zoom-Unschärfe (Anteil des Abstands zur Bildmitte)
        vec2 bv = blurVec * texel + (vUv - 0.5) * radial;
        if (length(bv / texel) < 0.5) {
          col = sampleC(vUv);
        } else {
          vec3 acc = vec3(0.0); float ws = 0.0;
          for (int i = -${TAPS}; i <= ${TAPS}; i++) {
            float x = float(i) / float(${TAPS});
            float w = exp(-4.5 * x * x);
            acc += sampleC(clamp(vUv + bv * x, 0.0, 1.0)) * w; ws += w;
          }
          col = acc / ws;
        }
        if (bloom > 0.0) {
          // zwei Ringe à 12 Abtastungen: Anteil über der Schwelle (linearer HDR-Wert vor dem Tonemapping) streut nach außen
          vec3 b = vec3(0.0);
          for (int ring = 1; ring <= 2; ring++) {
            float rad = float(ring) * 9.0 * bloomRadius;
            for (int k = 0; k < 12; k++) {
              float a = (float(k) + 0.5 * float(ring)) * 0.5235988;
              vec3 c = texture2D(tex, clamp(vUv + vec2(cos(a), sin(a)) * rad * texel, 0.0, 1.0)).rgb;
              float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
              b += c * max(l - bloomThreshold, 0.0) / max(l, 1e-4) / float(ring);
            }
          }
          col += b / 18.0 * bloom;
        }
        col += flashColor * flash;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        // Vignette + Filmkorn im Ausgabe-Farbraum
        vec2 q = vUv - 0.5; q.x *= 1080.0 / 1920.0 * 1.6;
        float v = smoothstep(0.85, 0.2, length(q));
        gl_FragColor.rgb *= mix(1.0 - vignette, 1.0, v);
        float n = hash(gl_FragCoord.xy) + hash(gl_FragCoord.yx + 7.3) - 1.0;
        gl_FragColor.rgb += n * grain;
        if (gradeOn > 0.5) {
          vec3 g = gl_FragColor.rgb;
          float lu = dot(g, vec3(0.2126, 0.7152, 0.0722));
          g = mix(vec3(lu), g, gSat);
          g = (g - 0.5) * gContrast + 0.5;
          g = g * gTint + gLift;
          gl_FragColor.rgb = clamp(g, 0.0, 1.0);
        }
      }`,
    depthTest: false, depthWrite: false, toneMapped: true,
  });
  const postScene = quad(postMat);
  return {
    // samples: Teilbilder pro Frame; renderSample(i) setzt Szene/Kamera für Teilbild i und rendert nichts selbst.
    render(scene, camera, { samples = 1, setSample, fx }) {
      if (samples <= 1) {
        renderer.setRenderTarget(rtScene);
        renderer.render(scene, camera);
        postMat.uniforms.tex.value = rtScene.texture;
      } else {
        renderer.setRenderTarget(rtAccum);
        renderer.setClearColor(0x000000, 0);
        renderer.clear(true, true, true);
        accMat.uniforms.w.value = 1 / samples;
        for (let i = 0; i < samples; i++) {
          setSample(i);
          renderer.setRenderTarget(rtScene);
          renderer.render(scene, camera);
          renderer.setRenderTarget(rtAccum);
          renderer.autoClear = false;
          renderer.render(accScene, qCam);
          renderer.autoClear = true;
        }
        renderer.setClearColor(0x000000, 1);
        postMat.uniforms.tex.value = rtAccum.texture;
      }
      const u = postMat.uniforms;
      u.blurVec.value.set(fx.blurX || 0, fx.blurY || 0);
      u.radial.value = fx.radial || 0;
      u.vignette.value = fx.vignette ?? 0;
      u.grain.value = fx.grain ?? 0;
      u.seed.value = fx.seed || 0;
      u.chroma.value = fx.chroma || 0;
      u.flash.value = fx.flash || 0;
      u.bloom.value = fx.bloom || 0;
      u.bloomThreshold.value = fx.bloomThreshold ?? 0.9;
      u.bloomRadius.value = fx.bloomRadius ?? 1;
      const gr = fx.grade;
      u.gradeOn.value = gr ? 1 : 0;
      u.gSat.value = gr?.saturation ?? 1;
      u.gContrast.value = gr?.contrast ?? 1;
      u.gTint.value.set(...(gr?.tint ?? [1, 1, 1]));
      u.gLift.value = gr?.lift ?? 0;
      if (fx.flashColor) u.flashColor.value.set(fx.flashColor);
      else u.flashColor.value.setRGB(1, 1, 1);
      renderer.setRenderTarget(null);
      renderer.render(postScene, qCam);
    },
  };
}

async function production(THREE, prodPath, seed) {
  const TL = await import('./timeline.js');
  const { createRng } = await import('./rng.js');
  const base = `/${prodPath.replace(/^\/+|\/+$/g, '')}`;
  const raw = await fetchJson(`${base}/timeline.json`);
  const ptl = TL.prepare(raw);
  const renderer = makeRenderer(THREE);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.1, 2000);
  const sceneMod = await import(`${base}/scene.js`);
  const world = await sceneMod.build({ THREE, scene, camera, renderer, rng: createRng(seed), timeline: ptl, assetUrl: (p) => `${base}/${p}`, fetchJson });
  if (!world || typeof world.update !== 'function') throw new Error('scene.js: build() muss { update(state) } liefern');
  checkShadowReceivers(THREE, scene);

  const trEl = document.getElementById('transition');
  const post = createPost(THREE, renderer);
  // { vignette, grain } für alle Frames. Filmkorn standardmäßig erst beim Endencode (pipeline/encode.mjs, FFmpeg-noise
  // mit festem Seed): Korn im Shader macht jedes PNG/FFV1-Bild groß und das Rendern deutlich langsamer.
  const postDefaults = { ...(raw.post || {}) };
  if (postDefaults.grain_in_shader !== true) delete postDefaults.grain;
  const mbSegs = raw.motion_blur || []; // [{ from, to, samples, shutter }] – Bewegungsunschärfe durch Teilbilder

  // Kamera + Szene für eine (ggf. gebrochene) Frame-Position f setzen. Liefert die Effekte der Szene.
  const apply = (n, f) => {
    const cam = TL.cameraAt(ptl, f);
    const state = { frame: n, subframe: f, t: f / ptl.fps, fps: ptl.fps, shot: cam.shot, shotIndex: TL.shotIndexAt(ptl, n), total: ptl.total };
    const out = world.update(state) || {};
    // Die Szene darf die Kamera selbst führen (z. B. Verfolgungsfahrten); Wackeln aus der Zeitachse kommt dazu.
    const c = out.camera || cam;
    const sh = out.camera ? cam.shakeOffset : [0, 0, 0];
    camera.position.set(c.pos[0] + sh[0], c.pos[1] + sh[1], c.pos[2] + sh[2]);
    camera.up.set(...(c.up || [0, 1, 0]));
    camera.lookAt(c.look[0], c.look[1], c.look[2]);
    if (cam.yaw) camera.rotateY(cam.yaw);
    if (c.roll) camera.rotateZ(c.roll);
    const fov = c.fov ?? 50;
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    return { cam, fx: out.fx || {} };
  };

  // Ein Frame: alles nur aus dem Index ableiten.
  const frame = (n) => {
    if (n >= ptl.total) throw new Error(`Frame ${n} ≥ Gesamtlänge ${ptl.total}`);
    const t = n / ptl.fps;
    const mb = mbSegs.find((m) => t >= m.from && t < m.to);
    const samples = mb ? mb.samples : 1;
    const shutter = mb ? mb.shutter ?? 0.5 : 0; // Anteil des Frame-Intervalls (0.5 = 180°-Verschluss)
    // Teilbilder bleiben in der aktuellen Einstellung (kein Mischen über einen Schnitt hinweg)
    const sh = ptl.shots[TL.shotIndexAt(ptl, n)];
    const subF = (i) => Math.min(sh.to - 1e-3, Math.max(sh.from, n + shutter * (samples > 1 ? i / (samples - 1) - 0.5 : 0)));
    let res = apply(n, n);
    const fx = { ...postDefaults, ...res.fx, seed: n };
    const cam = res.cam;
    trEl.style.background = cam.overlayColor || 'transparent';
    trEl.style.opacity = String(cam.overlay || 0);
    // Whip: horizontale Unschärfe (σ in px → Vektor über ±3σ); Effekte der Szene addieren sich.
    fx.blurX = (fx.blurX || 0) + (cam.blur > 0.5 ? 3 * cam.blur : 0);
    if (samples > 1) {
      post.render(scene, camera, { samples, fx, setSample: (i) => apply(n, subF(i)) });
      apply(n, n); // Zustand für Text-Ebene/Folgeaufrufe wieder auf den Frame selbst setzen
    } else {
      post.render(scene, camera, { samples: 1, fx });
    }
    if (stage.overlay) stage.overlay.update({ t, frame: n });
    if (stage.captions) stage.captions.update({ t, frame: n });
  };

  // Text-Ebene: nur wenn die Zeitachse Titel/HUD/Untertitel enthält
  if (raw.title || (raw.lines && raw.lines.length) || (raw.hud && raw.hud.length) || raw.sync_markers) {
    const lang = params.get('lang') || 'en';
    const brand = await fetchJson('/pipeline/runtime/brand.json');
    const text = await fetchJson(`${base}/text.${lang}.json`);
    const { createOverlay } = await import('./overlay.js');
    stage.overlay = await createOverlay({ root: document.getElementById('overlay'), brand, text, timeline: ptl });
    stage.layoutRects = () => stage.overlay.rects();
  }
  // Wort-für-Wort-Untertitel zum Sprecher + große animierte Zahlen/Einblendungen
  if (raw.captions || raw.callouts) {
    const lang = params.get('lang') || 'en';
    const text = await fetchJson(`${base}/text.${lang}.json`);
    const words = raw.captions ? await fetchJson(`${base}/${raw.captions.words}`) : null;
    const { createCaptions } = await import('./captions.js');
    stage.captions = await createCaptions({ root: document.getElementById('overlay'), text, timeline: ptl, words });
    stage.layoutRects = () => stage.captions.rects();
  }

  // Aufwärmen: Shader kompilieren und jede Einstellung einmal rendern, damit kein Frame
  // mit halb geladenem Zustand entsteht (früheres Problem: Bildsprünge beim Szenenwechsel).
  renderer.compile(scene, camera);
  for (const s of ptl.shots) frame(s.from);
  frame(0);
  // GPU-Warteschlange abarbeiten (Software-WebGL arbeitet asynchron): sonst blockiert der erste Screenshot
  // so lange, bis alle Aufwärm-Bilder fertig sind (bei aufwendigen Szenen > 30 s → Zeitüberschreitung).
  const gl = renderer.getContext();
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  return { fps: ptl.fps, total: ptl.total, seed, frame, timeline: ptl };
}

async function main() {
  const seed = Number(params.get('seed') || 1);
  installGuard(seed);
  const THREE = await import('three');
  let impl;
  if (params.get('selftest')) {
    impl = await selftest(THREE, seed);
  } else {
    const prod = params.get('production');
    if (!prod) throw new Error('Parameter production fehlt');
    impl = await production(THREE, prod, seed);
  }
  stage.fps = impl.fps;
  stage.total = impl.total;
  stage.setFrame = (n) => {
    if (!Number.isInteger(n) || n < 0) throw new Error(`Ungültiger Frame-Index ${n}`);
    impl.frame(n);
    return { n, t: n / impl.fps };
  };
  lock();
  stage.ready = true;
}

main().catch((e) => {
  stage.error = String(e && e.stack ? e.stack : e);
});
