// Baukasten-Grundlagen: Materialien, Kisten, Bodenplatten, Licht-Stimmungen.
// Alle Teile sind reine Geometrie – kein Zufall außer über das übergebene rng, keine Uhr.
// Stil-Ziel (siehe WHATIF_STYLE_GUIDE.md 6.1 + Abschnitt 16): stilisierte Würfel-Welt, weiche Schatten,
// matte Farben, viele Requisiten.

export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const smooth = (x) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
export const lerp = (a, b, k) => a + (b - a) * k;
// 0→1 zwischen t0 und t1 (geglättet)
export const ramp = (t, t0, t1) => smooth((t - t0) / (t1 - t0));

// Schattenempfänger dürfen keine Dreiecke > 25 m haben (stage.js prüft das) → Kisten fein unterteilen.
const seg = (d) => Math.max(1, Math.ceil(d / 8));

export function createCore(THREE) {
  const mats = new Map();
  // Matte, flach schattierte Materialien – gecacht, damit gleiche Farben ein Material teilen
  const mat = (color, opts = {}) => {
    const key = `${color}|${JSON.stringify(opts)}`;
    if (!mats.has(key)) {
      mats.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0, flatShading: true, ...opts }));
    }
    return mats.get(key);
  };

  // Kiste mit Mittelpunkt unten-mittig (y = Unterkante) – so lassen sich Möbel einfach auf den Boden stellen.
  const box = (w, h, d, color, pos = [0, 0, 0], opts = {}) => {
    const g = new THREE.BoxGeometry(w, h, d, seg(w), seg(h), seg(d));
    g.translate(0, h / 2, 0);
    const m = new THREE.Mesh(g, typeof color === 'object' && color.isMaterial ? color : mat(color, opts.mat));
    m.position.set(pos[0], pos[1], pos[2]);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = opts.receive !== false;
    return m;
  };

  // Kiste mit Mittelpunkt in der Mitte (für Körperteile, Gesicht)
  const cbox = (w, h, d, color, pos = [0, 0, 0], opts = {}) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof color === 'object' && color.isMaterial ? color : mat(color, opts.mat));
    m.position.set(pos[0], pos[1], pos[2]);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = opts.receive !== false;
    return m;
  };

  const group = (...children) => {
    const g = new THREE.Group();
    for (const c of children) if (c) g.add(c);
    return g;
  };

  // Licht-Stimmungen. Jede liefert set(k) zum weichen Überblenden innerhalb einer Szene nicht nötig –
  // Stimmungswechsel zwischen Orten passieren über getrennte Lichter je Ort (siehe places.js).
  const LOOKS = {
    day: { sky: 0xb9d3ea, fog: [0xc9dcec, 40, 160], hemi: [0xffffff, 0x8a8f7a, 1.35], sun: [0xfff4e2, 2.4], exposure: 1.0 },
    overcast: { sky: 0xb7c0c9, fog: [0xb7c0c9, 25, 110], hemi: [0xe8eef4, 0x7d8378, 1.7], sun: [0xe9eef2, 0.9], exposure: 1.0 },
    sunset: { sky: 0xe7b99a, fog: [0xe2b49a, 30, 140], hemi: [0xffe2c4, 0x6d5a52, 1.2], sun: [0xffb070, 2.6], exposure: 1.0 },
    night: { sky: 0x0b1020, fog: [0x0b1020, 30, 120], hemi: [0x6d7fb0, 0x1a1a22, 0.55], sun: [0x9fb2ff, 0.5], exposure: 1.1 },
    interior: { sky: 0xd9dee4, fog: null, hemi: [0xffffff, 0x9a8f86, 1.5], sun: [0xfff1dc, 1.9], exposure: 1.0 },
  };

  // Grundlicht + Tonemapping. sunTarget = Bereich, in dem scharfe Schatten liegen (Kamera-Arbeitsbereich).
  const setupLook = ({ scene, renderer }, name = 'day', { sunPos = [18, 30, 14], area = 40, target = [0, 0, 0] } = {}) => {
    const L = LOOKS[name];
    if (!L) throw new Error(`Unbekannte Licht-Stimmung "${name}"`);
    if (renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = L.exposure;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    scene.background = new THREE.Color(L.sky);
    scene.fog = L.fog ? new THREE.Fog(L.fog[0], L.fog[1], L.fog[2]) : null;
    const hemi = new THREE.HemisphereLight(L.hemi[0], L.hemi[1], L.hemi[2]);
    const sun = new THREE.DirectionalLight(L.sun[0], L.sun[1]);
    sun.position.set(target[0] + sunPos[0], target[1] + sunPos[1], target[2] + sunPos[2]);
    sun.target.position.set(target[0], target[1], target[2]);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -area, right: area, top: area, bottom: -area, near: 1, far: 200 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    sun.shadow.radius = 3;
    scene.add(hemi, sun, sun.target);
    return { hemi, sun, look: L };
  };

  return { mat, box, cbox, group, setupLook, LOOKS };
}
