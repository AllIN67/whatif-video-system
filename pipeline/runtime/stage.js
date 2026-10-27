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

// Horizontale Gauß-Unschärfe: Szene → MSAA-Rendertarget → Blur-Shader → Bildschirm.
function createBlurPass(THREE, renderer) {
  const rt = new THREE.WebGLRenderTarget(1080, 1920, { samples: 4, type: THREE.HalfFloatType });
  rt.texture.wrapS = THREE.ClampToEdgeWrapping;
  rt.texture.wrapT = THREE.ClampToEdgeWrapping;
  rt.texture.colorSpace = THREE.LinearSRGBColorSpace;
  const TAPS = 24;
  const mat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: rt.texture }, sigma: { value: 0 }, texel: { value: 1 / 1080 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      uniform sampler2D tex; uniform float sigma; uniform float texel; varying vec2 vUv;
      void main(){
        vec4 acc = vec4(0.0); float wsum = 0.0;
        for (int i = -${TAPS}; i <= ${TAPS}; i++) {
          float x = float(i) / float(${TAPS}) * 3.0 * sigma;   // ±3σ abtasten
          float w = exp(-0.5 * (x * x) / (sigma * sigma));
          acc += texture2D(tex, vec2(clamp(vUv.x + x * texel, 0.0, 1.0), vUv.y)) * w;
          wsum += w;
        }
        gl_FragColor = acc / wsum;
        #include <colorspace_fragment>
      }`,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  const qScene = new THREE.Scene();
  qScene.add(quad);
  const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    render(scene, camera, sigmaPx) {
      renderer.setRenderTarget(rt);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      mat.uniforms.sigma.value = sigmaPx;
      renderer.render(qScene, qCam);
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
  const world = await sceneMod.build({ THREE, scene, camera, renderer, rng: createRng(seed), timeline: ptl, assetUrl: (p) => `${base}/${p}` });
  if (!world || typeof world.update !== 'function') throw new Error('scene.js: build() muss { update(state) } liefern');
  checkShadowReceivers(THREE, scene);

  const trEl = document.getElementById('transition');
  const blur = createBlurPass(THREE, renderer);

  // Ein Frame: alles nur aus dem Index ableiten.
  const frame = (n) => {
    if (n >= ptl.total) throw new Error(`Frame ${n} ≥ Gesamtlänge ${ptl.total}`);
    const cam = TL.cameraAt(ptl, n);
    const state = { frame: n, t: cam.t, fps: ptl.fps, shot: cam.shot, shotIndex: TL.shotIndexAt(ptl, n), total: ptl.total };
    world.update(state);
    camera.position.set(cam.pos[0], cam.pos[1], cam.pos[2]);
    camera.up.set(0, 1, 0);
    camera.lookAt(cam.look[0], cam.look[1], cam.look[2]);
    if (cam.yaw) camera.rotateY(cam.yaw);
    if (camera.fov !== cam.fov) {
      camera.fov = cam.fov;
      camera.updateProjectionMatrix();
    }
    trEl.style.background = cam.overlayColor || 'transparent';
    trEl.style.opacity = String(cam.overlay || 0);
    // Bewegungsunschärfe beim Whip: horizontale Gauß-Unschärfe als WebGL-Nachbearbeitung
    // (Randpixel werden wiederholt – keine dunklen Bildränder), Text bleibt scharf.
    if (cam.blur > 0.5) blur.render(scene, camera, cam.blur);
    else renderer.render(scene, camera);
    if (stage.overlay) stage.overlay.update(state);
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

  // Aufwärmen: Shader kompilieren und jede Einstellung einmal rendern, damit kein Frame
  // mit halb geladenem Zustand entsteht (früheres Problem: Bildsprünge beim Szenenwechsel).
  renderer.compile(scene, camera);
  for (const s of ptl.shots) frame(s.from);
  frame(0);
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
