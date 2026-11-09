// Bildsprache V4 (Qualitäts-Upgrade 2026-11-09, opt-in): Licht, Himmel, Luftperspektive und Nachbearbeitung nach den
// gemessenen Unterschieden zur Referenz (Analyse Mr omi, Code mromidev/claude-animated-shorts, MIT):
//   - warmes Hauptlicht + blau-violette Schatten (Himmelslicht kühl/violett, Sonne warm) statt grauer/brauner Schatten
//   - Himmel mit Verlauf (oben satter, Horizont hell) + Nebel in Horizontfarbe = Luftperspektive
//   - angehobene, farbige Schwarzwerte (ACES bleibt), Umriss-Linien (Ink), Tiefenunschärfe (DOF)
// Sättigung wird NICHT erhöht (CLAUDE.md): Lebendigkeit kommt aus Licht-/Schattenfarbe, Tiefe und Linien.
//
//   const L = kit.look4.setup({ scene, renderer }, 'night4');      // Lichter + Himmelskuppel (statt kit.setupLook)
//   // in update():
//   const fx = { ...kit.look4.apply({ scene, renderer, ...L }, 'night4'), bloom: 0.8 };   // liefert fx für stage.js
//   fx.dof = kit.look4.focus([x, y, z], { range: 0.6, max: 9 });                             // Fokus auf Motiv
//   return { fx };
//
// Bestehende Produktionen nutzen dieses Modul nicht → bit-identisch. Kein Zufall aus rng.

const lerp = (a, b, k) => a + (b - a) * k;
const lerpArr = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));

// fx-Vorgaben je Stimmung. ink/dof/tone/grade werden von stage.js (createPost) ausgewertet.
// Referenz: Linien ~3 px bei 1080p auf ~74 % der Kanten, fast schwarz (#221f2e), in der Ferne ausgeblendet.
// Linie wird VOR dem Tonemapping eingemischt; ACES drückt Dunkles weiter ab → hellere Eingabefarbe landet bei ≈ #221f2e
const INK = { strength: 1, color: 0x262233, threshold: 0.045, far: 160, width: 2 };
const fxOf = (o = {}) => ({
  // Tonemapping bleibt ACES (wie bisher): gemessen hielt „neutral“ die Sättigung +60 % höher (CLAUDE.md: nicht erhöhen),
  // ACES lässt sie unverändert, hebt Schwarz an und kühlt Schatten stärker (tools/look_metrics.py, Koma, 6 Bilder).
  ink: { ...INK, ...(o.ink || {}) },
  grade: { saturation: 1, contrast: 1.07, tint: [1, 1, 1], lift: 0, shadows: [0, 0, 0], highlights: [0, 0, 0], liftRGB: [0.03, 0.028, 0.045], ...(o.grade || {}) },
  vignette: o.vignette ?? 0.22,
});

// Format wie core.LOOKS + skyTop/skyHorizon/skyCurve (Himmelsverlauf) + fx. hemi[0] = Farbe der Schattenseiten.
export const LOOKS_V4 = {
  day4: {
    sky: 0xb7cfe8, skyTop: 0x4d84cf, skyHorizon: 0xc4d8ec, skyCurve: 0.55,
    fog: [0xc4d8ec, 35, 260], hemi: [0x9aa8e8, 0x7a6e62, 1.15], sun: [0xfff0d6, 2.9], exposure: 1.0,
    fx: fxOf({ grade: { shadows: [-0.012, -0.008, 0.03], highlights: [0.012, 0.006, -0.01] } }),
  },
  golden4: {
    sky: 0xf0c08e, skyTop: 0x9a7e9f, skyHorizon: 0xffd18a, skyCurve: 0.6,
    fog: [0xf0c493, 30, 200], hemi: [0x8e84cc, 0x6a5040, 0.95], sun: [0xffb066, 3.1], exposure: 1.0,
    fx: fxOf({ grade: { shadows: [-0.006, -0.012, 0.04], highlights: [0.02, 0.008, -0.016], liftRGB: [0.035, 0.026, 0.05] } }),
  },
  dusk4: {
    sky: 0x6a6f9a, skyTop: 0x2a3466, skyHorizon: 0xd99a86, skyCurve: 0.45,
    fog: [0x8a7d98, 25, 170], hemi: [0x7480c8, 0x2e2830, 0.8], sun: [0xffa36e, 1.6], exposure: 1.08,
    fx: fxOf({ grade: { shadows: [-0.005, -0.01, 0.04], highlights: [0.016, 0.004, -0.012], liftRGB: [0.03, 0.026, 0.055] } }),
  },
  night4: {
    sky: 0x141c3a, skyTop: 0x070b1e, skyHorizon: 0x2a3462, skyCurve: 0.5,
    fog: [0x1d2648, 12, 120], hemi: [0x5a68b4, 0x14121c, 0.6], sun: [0x9aaaf0, 0.4], exposure: 1.2,
    fx: fxOf({ ink: { strength: 0.75 }, grade: { shadows: [-0.006, -0.002, 0.03], liftRGB: [0.022, 0.026, 0.055] } }),
  },
  storm4: {
    sky: 0x4a5262, skyTop: 0x2c3240, skyHorizon: 0x6a7282, skyCurve: 0.5,
    fog: [0x5a6272, 10, 90], hemi: [0x8a96c0, 0x24262c, 0.85], sun: [0xc8d4e8, 0.5], exposure: 1.1,
    fx: fxOf({ grade: { shadows: [-0.004, 0, 0.026], liftRGB: [0.026, 0.03, 0.048] } }),
  },
  // Innenräume: Himmel nur durch Fenster sichtbar; Schattenseiten kühl, Lampenlicht warm
  interior4: {
    sky: 0xd6dce8, skyTop: 0x8fa8d0, skyHorizon: 0xe2e6ee, skyCurve: 0.5,
    fog: null, hemi: [0xc4ccf0, 0x8a7666, 1.25], sun: [0xffe6c2, 2.2], exposure: 1.0,
    fx: fxOf({ grade: { shadows: [-0.006, -0.004, 0.026], highlights: [0.012, 0.006, -0.008] } }),
  },
  clinical4: {
    sky: 0xe4ecf2, skyTop: 0x9cb6d6, skyHorizon: 0xeaf0f4, skyCurve: 0.5,
    fog: null, hemi: [0xd6def8, 0x96a0aa, 1.35], sun: [0xf2f6ff, 1.5], exposure: 1.0,
    fx: fxOf({ grade: { shadows: [-0.004, -0.002, 0.022], liftRGB: [0.03, 0.032, 0.045] } }),
  },
  nightRoom4: {
    sky: 0x121a30, skyTop: 0x0a0f22, skyHorizon: 0x26305a, skyCurve: 0.5,
    fog: null, hemi: [0x6a78c0, 0x221e28, 0.7], sun: [0xffcf94, 0.6], exposure: 1.2,
    fx: fxOf({ ink: { strength: 0.75 }, grade: { shadows: [-0.004, 0, 0.03], liftRGB: [0.024, 0.026, 0.055] } }),
  },
};

// ---- Automatischer Modus pro Produktion: beats.json "post": { "v4": true | { …Optionen } } ----
// stage.js ruft enableV4(cfg) VOR scene.build(); jedes createKit() hängt sich dann in setupLook/applyLook ein:
// bestehende Stimmungen werden umgerechnet (upgradeLook), eine Himmelskuppel kommt dazu, und stage.js holt pro Frame
// die fx der aktuellen Stimmung (composeFx). Szenen müssen dafür NICHT geändert werden.
let V4 = null; // null = aus
let current = null; // { A, B, k } der zuletzt angewandten Stimmung
let domeRef = null;
export const enableV4 = (cfg) => {
  V4 = cfg ? { ink: true, dof: true, sky: true, ...(cfg === true ? {} : cfg) } : null;
  current = null;
  domeRef = null;
};
export const v4Config = () => V4;

// Bestehende Stimmung (core-Format) → V4: Schattenseiten blau-violett, Himmel mit Verlauf, Nebel in Horizontfarbe,
// fx-Vorgaben nach Helligkeit. Bereits definierte V4-Stimmungen (mit fx) bleiben unverändert.
const _cache = new Map();
export function upgradeLook(THREE, L) {
  if (!L || L.fx) return L;
  const key = JSON.stringify(L);
  if (_cache.has(key)) return _cache.get(key);
  const c = new THREE.Color();
  const hsl = { h: 0, s: 0, l: 0 };
  c.setHex(L.sky).getHSL(hsl, THREE.SRGBColorSpace);
  const dark = hsl.l < 0.28;
  const hex = (h, s, l) => c.setHSL(h, Math.min(1, Math.max(0, s)), Math.min(1, Math.max(0, l)), THREE.SRGBColorSpace).getHex(THREE.SRGBColorSpace);
  const mixHex = (a, b, k) => c.setHex(a).lerp(new THREE.Color(b), k).getHex();
  const skyTop = hex(hsl.h, hsl.s * 1.1 + 0.06, hsl.l * (dark ? 0.55 : 0.68));
  const skyHorizon = hex(hsl.h, hsl.s * 0.85, hsl.l * 1.1 + 0.05);
  // Nacht: nur leicht Richtung Violett-Grau (sonst kippt alles ins Blaue), Tag: deutlich blau-violett
  const hemiSky = mixHex(L.hemi[0], dark ? 0x7a7ea8 : 0x96a0ea, dark ? 0.2 : 0.42);
  const out = {
    ...L,
    skyTop, skyHorizon, skyCurve: 0.5,
    fog: L.fog ? [mixHex(L.fog[0], skyHorizon, 0.5), L.fog[1], L.fog[2] * 1.25] : null,
    // Licht-/Schattenkontrast: Himmelslicht (füllt Schatten) schwächer und kühler, Sonne etwas stärker und wärmer
    hemi: [hemiSky, L.hemi[1], L.hemi[2] * 0.8],
    sun: [dark ? L.sun[0] : mixHex(L.sun[0], 0xffd29a, 0.3), L.sun[1] * (dark ? 1.05 : 1.15)],
    fx: dark
      ? fxOf({ ink: { strength: 0.75 }, grade: { shadows: [-0.002, 0, 0.016], liftRGB: [0.024, 0.024, 0.038] } })
      : fxOf({ grade: { shadows: [-0.01, -0.006, 0.028], highlights: [0.01, 0.005, -0.008] } }),
  };
  _cache.set(key, out);
  return out;
}

// fx für stage.js: V4-Vorgaben der aktuellen Stimmung ← post (beats.json) ← fx der Szene. grade wird zusammengeführt
// (Szene behält Sättigung/Kontrast/Tönung, V4 ergänzt Schatten-/Lichtertönung + Schwarzwerte).
// Tiefenunschärfe automatisch auf den Kamera-Zielpunkt (look), sofern die Szene keine eigene dof setzt.
// beat (aus timeline.beats): beat.v4 = { ink, dof } überschreibt die Produktions-Optionen für diesen Beat
// (false = aus); Ich-Perspektive (beat.pov) bekommt keine automatische Unschärfe (Hände/Handy/Text im Vordergrund).
export function composeFx(post, sceneFx, camLook, beat = null) {
  if (!V4) return null;
  const bo = beat && beat.v4 && typeof beat.v4 === 'object' ? beat.v4 : {};
  const opt = { ...V4, ...bo };
  const base = current ? mixFxPlain(current.A.fx, current.B.fx, current.k) : fxOf();
  const fx = { ...base, ...post, ...sceneFx };
  delete fx.v4;
  fx.grade = { ...(base.grade || {}), ...(post.grade || {}), ...(sceneFx.grade || {}) };
  if (opt.ink === false) delete fx.ink;
  else if (typeof opt.ink === 'object') fx.ink = { ...(fx.ink || {}), ...opt.ink };
  const autoDof = opt.dof !== false && !(beat && beat.pov && bo.dof === undefined);
  if (sceneFx.dof === undefined && autoDof && camLook) {
    const d = typeof opt.dof === 'object' ? opt.dof : {};
    // nur Hintergrund: Vordergrund trägt bei uns oft Information (Handy, Schild, Zahl) und bleibt scharf
    fx.dof = { target: camLook, range: d.range ?? 0.9, max: d.max ?? 5, near: d.near ?? 0 };
  }
  if (fx.dof === false) delete fx.dof;
  return fx;
}

function mixFxPlain(a = {}, b = {}, k) {
  if (a === b || k <= 0) return structuredClone(a);
  if (k >= 1) return structuredClone(b);
  const out = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[key], y = b[key];
    if (typeof x === 'number' && typeof y === 'number') out[key] = lerp(x, y, k);
    else if (Array.isArray(x) && Array.isArray(y)) out[key] = lerpArr(x, y, k);
    else if (x && y && typeof x === 'object' && typeof y === 'object') out[key] = mixFxPlain(x, y, k);
    else out[key] = structuredClone(k < 0.5 ? (x ?? y) : (y ?? x));
  }
  return out;
}

// Durchsichtiges/Partikel schreibt keine Tiefe → keine Umriss-Linien um Regen, Staub, Glas, Lichtkegel.
// Zusätzlich: „gemalte“ Oberfläche für alle Standard-Materialien – leichte Farbwolken in Weltkoordinaten (zwei Frequenzen)
// statt Plastik-Einheitsfarbe, plus Bodenschatten (unten 6 % dunkler über die ersten 0,4 m). Ohne UVs, deterministisch.
const MOTTLE_VS = ['#include <project_vertex>', `#include <project_vertex>
  vec4 v4wp = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    v4wp = instanceMatrix * v4wp;
  #endif
  vW4 = (modelMatrix * v4wp).xyz;`];
const MOTTLE_FS = ['#include <color_fragment>', `#include <color_fragment>
  {
    float n = v4vnoise(vW4 * 1.3) * 0.55 + v4vnoise(vW4 * 5.1) * 0.3 + v4vnoise(vW4 * 17.0) * 0.15;
    diffuseColor.rgb *= 1.0 + uV4Mottle * (n - 0.5);
    diffuseColor.rgb *= mix(1.0 - uV4Foot, 1.0, smoothstep(0.0, 0.4, vW4.y - uV4Floor));
  }`];
const NOISE = `varying vec3 vW4; uniform float uV4Mottle; uniform float uV4Foot; uniform float uV4Floor;
  float v4h(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float v4vnoise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(v4h(i), v4h(i + vec3(1,0,0)), f.x), mix(v4h(i + vec3(0,1,0)), v4h(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(v4h(i + vec3(0,0,1)), v4h(i + vec3(1,0,1)), f.x), mix(v4h(i + vec3(0,1,1)), v4h(i + vec3(1,1,1)), f.x), f.y), f.z); }`;
export function paintMaterial(m, { mottle = 0.16, foot = 0.06, floor = 0 } = {}) {
  if (!m || !m.isMeshStandardMaterial || m.userData.v4paint) return;
  m.userData.v4paint = true;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uV4Mottle = { value: m.map ? mottle * 0.5 : mottle };
    sh.uniforms.uV4Foot = { value: foot };
    sh.uniforms.uV4Floor = { value: floor };
    sh.vertexShader = 'varying vec3 vW4;\n' + sh.vertexShader.replace(...MOTTLE_VS);
    sh.fragmentShader = NOISE + '\n' + sh.fragmentShader.replace(...MOTTLE_FS);
  };
  m.customProgramCacheKey = () => 'v4paint';
  m.needsUpdate = true;
}

export function prepareScene(THREE, scene, { paint = true } = {}) {
  scene.traverse((o) => {
    if (o.name === 'look4.sky') return;
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    const particle = o.isPoints || o.isLine || o.isSprite;
    for (const m of ms) {
      if (particle || m.transparent || m.blending === THREE.AdditiveBlending) m.depthWrite = false;
      const glowing = m.emissive && m.emissiveIntensity > 0 && m.emissive.getHex() !== 0;
      if (paint && o.isMesh && !particle && !m.transparent && !glowing) paintMaterial(m);
    }
  });
}

export function createLook4(THREE, core) {
  Object.assign(core.LOOKS, LOOKS_V4);
  const col = (hex) => new THREE.Color(hex); // sRGB-Hex → linear (ColorManagement)

  // Himmelskuppel mit Verlauf; folgt der Kamera (onBeforeRender), steht hinter allem, ohne Nebel.
  const skyDome = ({ radius = 1500 } = {}) => {
    const mat = new THREE.ShaderMaterial({
      uniforms: { top: { value: col(0x4d84cf) }, horizon: { value: col(0xc4d8ec) }, curve: { value: 0.55 } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform float curve; varying vec3 vDir;
        void main(){ float y = normalize(vDir).y; float k = pow(clamp(y, 0.0, 1.0), curve);
          vec3 c = mix(horizon, top, k); if (y < 0.0) c = horizon * mix(1.0, 0.82, clamp(-y * 4.0, 0.0, 1.0));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: true, fog: false, toneMapped: true,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24), mat);
    mesh.name = 'look4.sky';
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = -1000;
    mesh.matrixAutoUpdate = false;
    mesh.onBeforeRender = (r, s, cam) => {
      mesh.matrixWorld.makeTranslation(cam.position.x, cam.position.y, cam.position.z);
      mesh.modelViewMatrix.multiplyMatrices(cam.matrixWorldInverse, mesh.matrixWorld);
    };
    return { mesh, mat };
  };

  const prepare = (scene) => prepareScene(THREE, scene);

  const resolve = (L) => {
    const o = typeof L === 'string' ? core.LOOKS[L] : L;
    if (!o) throw new Error(`look4: unbekannte Stimmung ${L}`);
    return o;
  };

  let dome = null;
  const _a = new THREE.Color();
  const _b = new THREE.Color();
  const setDome = (A, B, k) => {
    if (!dome) return;
    const u = dome.mat.uniforms;
    u.top.value.copy(_a.setHex(A.skyTop ?? A.sky)).lerp(_b.setHex(B.skyTop ?? B.sky), k);
    u.horizon.value.copy(_a.setHex(A.skyHorizon ?? A.sky)).lerp(_b.setHex(B.skyHorizon ?? B.sky), k);
    u.curve.value = lerp(A.skyCurve ?? 0.5, B.skyCurve ?? 0.5, k);
  };
  const addDome = (scene) => {
    if (dome) return dome;
    dome = domeRef && domeRef.parent === scene ? domeRef : skyDome();
    if (dome.mesh.parent !== scene) scene.add(dome.mesh);
    domeRef = dome;
    return dome;
  };

  // Automatischer Modus: in setupLook/applyLook einhängen (nur wenn die Produktion V4 eingeschaltet hat)
  if (V4) {
    core.hooks.map = (L) => upgradeLook(THREE, L);
    core.hooks.setup = ({ scene }, res, L) => {
      if (V4.sky !== false) addDome(scene);
      current = { A: L, B: L, k: 0 };
      setDome(L, L, 0);
    };
    core.hooks.apply = (A, B, k) => {
      current = { A, B, k };
      setDome(A, B, k);
    };
  }

  // Ersatz für kit.setupLook: gleiche Lichter (hemi + sun mit Schatten), dazu Himmelskuppel. prepare() einmal nach dem
  // Aufbau der Szene aufrufen (im automatischen Modus erledigt das stage.js).
  const setup = (ctx, name = 'day4', opts = {}) => {
    const L = core.setupLook(ctx, name, opts);
    addDome(ctx.scene);
    apply({ ...ctx, ...L }, name);
    return { ...L, dome };
  };

  const mixFx = mixFxPlain;

  // Stimmung anwenden (wie kit.applyLook, a/b/k zum Überblenden) + Himmel; liefert die fx-Vorgaben der Stimmung.
  const apply = (ctx, a, b = a, k = 0) => {
    const A = upgradeLook(THREE, resolve(a));
    const B = upgradeLook(THREE, resolve(b));
    core.applyLook(ctx, A, B, k);
    setDome(A, B, k);
    return mixFx(A.fx || fxOf(), B.fx || fxOf(), k);
  };

  // Tiefenunschärfe auf einen Weltpunkt (stage.js misst den Abstand erst NACH dem Setzen der Kamera).
  // range: kleiner = stärkere Unschärfe vor/hinter dem Fokus; max = größter Radius in px (1080p);
  // near: Anteil der Vordergrund-Unschärfe (0…1).
  const focus = (point, { range = 0.7, max = 8, near = 1 } = {}) => {
    const p = Array.isArray(point) ? point : [point.x, point.y, point.z];
    return { target: [p[0], p[1], p[2]], range, max, near };
  };

  return { LOOKS: LOOKS_V4, setup, apply, prepare, skyDome, focus, fxOf, mixFx, get dome() { return dome; } };
}
