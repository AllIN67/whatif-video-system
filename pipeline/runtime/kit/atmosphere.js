// Licht & Atmosphäre (Version 3.0, Analyse 6 Videos – VERSION_3_0_CONSOLIDATED_REVIEW.md Abschnitt D).
//
// Befund [M]: Unsere Videos sind farbiger/gesättigter als die Referenzen, wirken aber flacher. Die Referenzen
// arbeiten mit (1) sichtbaren Lichtquellen mit Lichtabfall, (2) Oberflächen mit Struktur, (3) Dunst/Tiefe,
// (4) Glanz/Spiegelung, (5) einer dominanten Lichtfarbe + kleinem Akzent. Dieses Modul liefert die Bausteine dafür.
//
//   const atmo = kit.atmo;                                   // Teil von createKit (additiv)
//   kit.setupLook({ scene, renderer }, 'neonNight');         // neue Stimmungen: haze, backlight, goldenHour, neonNight, clinical, underwater
//   scene.add(atmo.stringLights({ from: [-4, 3, 0], to: [4, 3, 0] }).root);
//   const spot = atmo.spotCone({ pos: [0, 5, 0], target: [0, 0, 0] }); scene.add(spot.root);
//   const floor = atmo.ground('cobble', 20, 20); scene.add(floor);
//   const pool = atmo.water({ w: 8, d: 4, mirror: true }); scene.add(pool.root); pool.update(t);
//
// Determinismus: Alle Muster/Streuungen nutzen einen EIGENEN Zufall (opts.seed), nie das gemeinsame rng aus build().
// So verschiebt dieses Modul die Zufallsfolge bestehender Szenen nicht (bestehende Produktionen bleiben bit-identisch).
import { createRng } from '../rng.js';
import { v4Config } from './look4.js';

// Zusätzliche Licht-Stimmungen. Format wie core.LOOKS. Bestehende Stimmungen werden nicht verändert.
export const LOOKS_V3 = {
  // heller Dunst: Tiefe durch Luftperspektive (B1, C1-Platz). Nebel beginnt nah, Hintergrund hellt auf.
  haze: { sky: 0xd5dce2, fog: [0xd5dce2, 10, 85], hemi: [0xf2f4f6, 0x7b7a72, 1.25], sun: [0xfff0d8, 2.0], exposure: 1.02 },
  // Gegenlicht: tiefe warme Sonne HINTER dem Motiv (atmo.sunBehind), dunklere Vorderseiten, heller Himmel
  backlight: { sky: 0xf1d6b0, fog: [0xeed2ad, 14, 110], hemi: [0xffe4c2, 0x4a4250, 0.75], sun: [0xffc27a, 3.4], exposure: 1.0 },
  // goldene Stunde: warm, lange Schatten, gedämpfte Kulisse
  goldenHour: { sky: 0xe9c79a, fog: [0xe6c49a, 25, 150], hemi: [0xffe7c8, 0x5d5249, 1.05], sun: [0xffb35c, 2.8], exposure: 1.0 },
  // Neon-Nacht: tiefes Blau-Violett, Licht kommt aus Lichtquellen (stringLights, neonStrip, lampPool), nicht vom Himmel
  neonNight: { sky: 0x0d0a24, fog: [0x1a1238, 18, 110], hemi: [0x5a5aa8, 0x120c1c, 0.5], sun: [0x8a7cff, 0.35], exposure: 1.15 },
  // Klinik/Labor: kühles Weiß, weiches Licht, wenig Schatten (C2 Krankenzimmer)
  clinical: { sky: 0xe6eef2, fog: null, hemi: [0xf4fbff, 0xa8b0b8, 1.6], sun: [0xe8f2ff, 1.3], exposure: 1.0 },
  // unter Wasser: Türkis, dichter Nebel, Licht von oben
  underwater: { sky: 0x1f6f86, fog: [0x1f6f86, 2, 26], hemi: [0x8fe3f0, 0x0d2a33, 1.1], sun: [0xbff6ff, 1.6], exposure: 1.05 },
};

// Farbhierarchie (Regel 18.13 F): gedämpfte Kulissenfarben + EIN Akzent. Paletten liefern Kulissenfarben mit
// geringer Sättigung; der Akzent (Hauptfigur/Schlüsselobjekt) wird bewusst separat gesetzt.
export const PALETTES = {
  coolCity: { base: [0x6f7a86, 0x8a949e, 0x5b6470, 0xa3abb3, 0x4d5560], ground: 0x5d646b, accent: 0xd8342c },
  warmInterior: { base: [0xb8a48e, 0x9c8a76, 0xcdbda8, 0x7d6c5c, 0xe0d4c4], ground: 0x8a7562, accent: 0x2f6fd6 },
  night: { base: [0x2b3346, 0x3a4258, 0x232a3a, 0x4a5168, 0x1c2230], ground: 0x232833, accent: 0xff4fa3 },
  clinic: { base: [0xdfe6ea, 0xc9d3d9, 0xb4c0c8, 0xeef2f4, 0x9aa8b2], ground: 0xc4ccd2, accent: 0xe0475b },
  golden: { base: [0xb59a7a, 0xc9ae8c, 0x8f7a63, 0xd8c3a2, 0x6f5e4d], ground: 0x8c7660, accent: 0x1f8a8a },
};

export function createAtmosphere(THREE, core) {
  const { mat, group } = core;
  Object.assign(core.LOOKS, LOOKS_V3);

  // Leuchtendes Material: emissive, von Tonemapping erfasst, wirft keinen Schatten.
  const glow = (color, intensity = 2.2) =>
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.5, metalness: 0 });

  // Sonne gegenüber der Kamera setzen (Gegenlicht): Motiv bekommt Lichtkante, Vorderseite liegt im Schatten.
  const sunBehind = (sun, target, camPos, { height = 0.35, dist = 40 } = {}) => {
    const dx = target[0] - camPos[0];
    const dz = target[2] - camPos[2];
    const l = Math.hypot(dx, dz) || 1;
    sun.target.position.set(target[0], target[1], target[2]);
    sun.position.set(target[0] + (dx / l) * dist, target[1] + dist * height, target[2] + (dz / l) * dist);
    sun.target.updateMatrixWorld();
  };

  // Lichterkette zwischen zwei Punkten (Durchhang sag). light: Anzahl echter Punktlichter (teuer, ≤ 3 empfohlen).
  const stringLights = ({ from, to, count = 18, sag = 0.4, color = 0xffd9a0, bulb = 0.06, intensity = 2.4, light = 0, lightIntensity = 25, lightDist = 8 } = {}) => {
    const root = group();
    const bulbMat = glow(color, intensity);
    const geo = new THREE.SphereGeometry(bulb, 8, 6);
    const pts = [];
    for (let i = 0; i <= count; i++) {
      const k = i / count;
      const p = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k - sag * 4 * k * (1 - k), from[2] + (to[2] - from[2]) * k];
      pts.push(new THREE.Vector3(...p));
      const m = new THREE.Mesh(geo, bulbMat);
      m.position.set(p[0], p[1] - bulb * 1.2, p[2]);
      m.castShadow = false;
      root.add(m);
    }
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x1a1a1a })));
    const lights = [];
    for (let i = 0; i < light; i++) {
      const k = (i + 0.5) / light;
      const L = new THREE.PointLight(color, lightIntensity, lightDist, 2);
      L.position.set(from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k - sag * 4 * k * (1 - k) - 0.2, from[2] + (to[2] - from[2]) * k);
      root.add(L);
      lights.push(L);
    }
    return { root, material: bulbMat, lights, set: (k) => { bulbMat.emissiveIntensity = intensity * k; lights.forEach((L) => (L.intensity = lightIntensity * k)); } };
  };

  // Neon-Röhre/-Rahmen: shape 'line' (Länge w) oder 'rect' (Rahmen w×h); optional ein Punktlicht für Farbschein auf der Umgebung.
  const neonStrip = ({ shape = 'line', w = 2, h = 1, thick = 0.05, color = 0xff3fa4, intensity = 3, light = true, lightIntensity = 30, lightDist = 8 } = {}) => {
    const root = group();
    const m = glow(color, intensity);
    const bar = (len, horiz, x, y) => {
      const g = new THREE.BoxGeometry(horiz ? len : thick, horiz ? thick : len, thick);
      const b = new THREE.Mesh(g, m);
      b.position.set(x, y, 0);
      root.add(b);
    };
    if (shape === 'rect') {
      bar(w, true, 0, h / 2);
      bar(w, true, 0, -h / 2);
      bar(h, false, -w / 2, 0);
      bar(h, false, w / 2, 0);
    } else bar(w, true, 0, 0);
    let L = null;
    if (light) {
      L = new THREE.PointLight(color, lightIntensity, lightDist, 2);
      L.position.set(0, 0, 0.4);
      root.add(L);
    }
    return { root, material: m, light: L, set: (k) => { m.emissiveIntensity = intensity * k; if (L) L.intensity = lightIntensity * k; } };
  };

  // Scheinwerfer mit sichtbarem Lichtkegel (Kegel = additiv transparente Hülle, wirkt im Dunst wie ein Lichtstrahl).
  const spotCone = ({ pos, target, color = 0xfff1d6, intensity = 40, angle = 0.32, penumbra = 0.5, cone = true, coneOpacity = 0.12, shadow = false, dist = 0, housing = true } = {}) => {
    const root = group();
    const L = new THREE.SpotLight(color, intensity, dist, angle, penumbra, 2);
    L.position.set(...pos);
    L.target.position.set(...target);
    L.castShadow = shadow;
    if (shadow) L.shadow.mapSize.set(1024, 1024);
    root.add(L, L.target);
    let coneMesh = null;
    const coneMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: coneOpacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    if (cone) {
      const v = new THREE.Vector3(target[0] - pos[0], target[1] - pos[1], target[2] - pos[2]);
      const len = v.length();
      const g = new THREE.ConeGeometry(Math.tan(angle) * len, len, 24, 1, true);
      g.translate(0, -len / 2, 0); // Spitze im Ursprung
      coneMesh = new THREE.Mesh(g, coneMat);
      coneMesh.position.set(...pos);
      coneMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), v.normalize());
      coneMesh.castShadow = coneMesh.receiveShadow = false;
      root.add(coneMesh);
    }
    // housing: false für Lampen in der Hand/vor der Kamera (das leuchtende Gehäuse würde das Bild überdecken)
    if (housing) root.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.25, 12), glow(color, 3)).translateX(pos[0]).translateY(pos[1]).translateZ(pos[2]));
    return { root, light: L, cone: coneMesh, set: (k) => { L.intensity = intensity * k; coneMat.opacity = coneOpacity * k; } };
  };

  // Lichtinsel: Lampe + Punktlicht (Straßenlaterne nachts, Tischlampe) – erzeugt den Lichtabfall, der Nachtszenen Tiefe gibt.
  const lampPool = ({ pos, color = 0xffc98a, intensity = 90, dist = 12, bulb = 0.09 } = {}) => {
    const root = group();
    const L = new THREE.PointLight(color, intensity, dist, 2);
    L.position.set(...pos);
    root.add(L);
    if (bulb > 0) { // bulb: 0 = nur Licht, kein sichtbarer Glühkörper
      const b = new THREE.Mesh(new THREE.SphereGeometry(bulb, 10, 8), glow(color, 3));
      b.position.set(...pos);
      root.add(b);
    }
    return { root, light: L, set: (k) => (L.intensity = intensity * k) };
  };

  // Leuchtschild mit Text (Canvas-Textur, emissiv). Für Orte mit Charakter (Bar, Klinik, Kiosk, Stadion).
  const glowSign = ({ text = 'OPEN', w = 1.6, h = 0.5, color = '#ff4fa3', bg = '#120c1c', intensity = 1.6 } = {}) => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = Math.round((512 * h) / w);
    const g = c.getContext('2d');
    g.fillStyle = bg;
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = color;
    g.font = `700 ${Math.round(c.height * 0.62)}px Montserrat, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, c.width / 2, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: intensity, roughness: 0.6 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), m);
    return { root: mesh, material: m };
  };

  // ---------- Oberflächen mit Struktur (Canvas-Texturen, eigener Zufall) ----------
  const texCache = new Map();
  const surfaceTexture = (kind, { seed = 7, color } = {}) => {
    const key = `${kind}|${seed}|${color}|${v4Config() ? 'v4' : ''}`;
    if (texCache.has(key)) return texCache.get(key);
    if (v4Config()) {
      const t = surfaceTextureV4(kind, { seed, color });
      texCache.set(key, t);
      return t;
    }
    const r = createRng(seed);
    const N = 256;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const g = c.getContext('2d');
    const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;
    const shade = (n, f) => {
      const cl = (x) => Math.max(0, Math.min(255, Math.round(x)));
      return `rgb(${cl(((n >> 16) & 255) * f)},${cl(((n >> 8) & 255) * f)},${cl((n & 255) * f)})`;
    };
    const base = color ?? { cobble: 0x8d8780, brick: 0x9a5a46, planks: 0x8a6646, tiles: 0xd9dcdc, asphalt: 0x3d4045, concrete: 0xa7a59f, grass: 0x5f7f45 }[kind] ?? 0x999999;
    g.fillStyle = hex(base);
    g.fillRect(0, 0, N, N);
    if (kind === 'cobble') {
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
        g.fillStyle = shade(base, r.range(0.78, 1.12));
        const ox = (y % 2) * 16;
        g.beginPath();
        g.roundRect((x * 32 + ox + 2) % N, y * 32 + 2, 28, 28, 7);
        g.fill();
      }
    } else if (kind === 'brick') {
      for (let y = 0; y < 16; y++) for (let x = 0; x < 5; x++) {
        g.fillStyle = shade(base, r.range(0.8, 1.15));
        g.fillRect(((x * 56 + (y % 2) * 28) % N) + 1, y * 16 + 1, 54, 14);
      }
    } else if (kind === 'planks') {
      for (let x = 0; x < 8; x++) {
        g.fillStyle = shade(base, r.range(0.82, 1.12));
        g.fillRect(x * 32 + 1, 0, 30, N);
        g.fillStyle = shade(base, 0.7);
        g.fillRect(x * 32, Math.floor(r.range(0, N)), 32, 1);
        for (let k = 0; k < 6; k++) {
          g.fillStyle = shade(base, r.range(0.85, 0.95));
          g.fillRect(x * 32 + Math.floor(r.range(3, 28)), 0, 1, N);
        }
      }
    } else if (kind === 'tiles') {
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
        g.fillStyle = shade(base, r.range(0.94, 1.04));
        g.fillRect(x * 64 + 2, y * 64 + 2, 60, 60);
      }
    } else {
      // asphalt, concrete, grass: feines Rauschen + Flecken
      for (let i = 0; i < 2600; i++) {
        g.fillStyle = shade(base, r.range(0.82, 1.16));
        const s = r.range(1, kind === 'grass' ? 3 : 2.2);
        g.fillRect(r.range(0, N), r.range(0, N), s, kind === 'grass' ? s * 2.5 : s);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    texCache.set(key, tex);
    return tex;
  };

  // Bildsprache V4 (nur wenn post.v4): „handgemalte“ Texturen nach Referenz – dunkle Fugen (≈ 55 % der Grundfarbe),
  // Maserung/Pinselstriche, Kantenschatten je Stein/Brett, 512 px, Anisotropie 8. Gleiche Muster-Logik wie oben.
  const surfaceTextureV4 = (kind, { seed = 7, color } = {}) => {
    const r = createRng(seed);
    const N = 512;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const g = c.getContext('2d');
    const cl = (x) => Math.max(0, Math.min(255, Math.round(x)));
    const shade = (n, f, a = 1) => `rgba(${cl(((n >> 16) & 255) * f)},${cl(((n >> 8) & 255) * f)},${cl((n & 255) * f)},${a})`;
    const base = color ?? { cobble: 0x8d8780, brick: 0x9a5a46, planks: 0x8a6646, tiles: 0xd9dcdc, asphalt: 0x3d4045, concrete: 0xa7a59f, grass: 0x5f7f45 }[kind] ?? 0x999999;
    const strokes = (x0, y0, w, h, n, fMin, fMax, len, vertical = false) => {
      for (let i = 0; i < n; i++) {
        g.fillStyle = shade(base, r.range(fMin, fMax), r.range(0.25, 0.6));
        const x = x0 + r.range(0, w), y = y0 + r.range(0, h);
        if (vertical) g.fillRect(x, y, r.range(1, 2.2), r.range(len * 0.5, len * 1.5));
        else g.fillRect(x, y, r.range(len * 0.5, len * 1.5), r.range(1, 2.2));
      }
    };
    // Stein/Brett/Fliese: Fläche + Lichtkante oben/links + Schattenkante unten/rechts
    const block = (x, y, w, h, f, rad = 0) => {
      g.fillStyle = shade(base, f);
      g.beginPath();
      g.roundRect(x, y, w, h, rad);
      g.fill();
      g.fillStyle = shade(base, f * 1.12, 0.55);
      g.fillRect(x + rad * 0.5, y + 1, w - rad, 2);
      g.fillStyle = shade(base, f * 0.72, 0.6);
      g.fillRect(x + rad * 0.5, y + h - 3, w - rad, 2);
      g.fillRect(x + w - 3, y + rad * 0.5, 2, h - rad);
    };
    g.fillStyle = shade(base, kind === 'tiles' ? 0.78 : 0.55); // Fugenfarbe
    g.fillRect(0, 0, N, N);
    if (kind === 'cobble') {
      for (let y = 0; y < 10; y++) for (let x = 0; x < 9; x++) {
        const w = 52 + r.range(-6, 6), h = 46 + r.range(-5, 5);
        block(((x * 57 + (y % 2) * 28) % N) + 3, y * 51 + 3, w, h, r.range(0.8, 1.12), 12);
        strokes((x * 57) % N, y * 51, 50, 44, 6, 0.85, 1.1, 8);
      }
    } else if (kind === 'brick') {
      for (let y = 0; y < 22; y++) for (let x = 0; x < 6; x++) {
        const bx = ((x * 86 + (y % 2) * 43) % N) + 2, by = y * 23.3 + 2;
        block(bx, by, 82, 19, r.range(0.8, 1.14), 2);
        strokes(bx, by, 80, 17, 4, 0.82, 1.08, 10);
      }
    } else if (kind === 'planks') {
      for (let x = 0; x < 8; x++) {
        const f = r.range(0.84, 1.12);
        block(x * 64 + 2, -4, 60, N + 8, f, 0);
        strokes(x * 64 + 3, 0, 56, N, 46, 0.78, 0.96, 70, true); // Maserung
        for (let k = 0; k < 2; k++) { // Astlöcher
          const ax = x * 64 + r.range(14, 48), ay = r.range(20, N - 20);
          g.fillStyle = shade(base, 0.62, 0.8);
          g.beginPath();
          g.ellipse(ax, ay, r.range(3, 6), r.range(7, 12), 0, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = shade(base, 0.5);
        g.fillRect(x * 64, Math.floor(r.range(0, N)), 64, 2); // Stoßfuge
      }
    } else if (kind === 'tiles') {
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
        block(x * 128 + 3, y * 128 + 3, 122, 122, r.range(0.95, 1.04), 4);
        strokes(x * 128, y * 128, 122, 122, 10, 0.96, 1.04, 20);
      }
    } else {
      g.fillStyle = shade(base, 1);
      g.fillRect(0, 0, N, N);
      for (let i = 0; i < 9000; i++) {
        g.fillStyle = shade(base, r.range(0.8, 1.18), r.range(0.4, 0.9));
        const s = r.range(1, kind === 'grass' ? 4 : 3);
        g.fillRect(r.range(0, N), r.range(0, N), s, kind === 'grass' ? s * 3 : s);
      }
      if (kind === 'asphalt' || kind === 'concrete') for (let i = 0; i < 10; i++) { // Risse/Flecken
        g.strokeStyle = shade(base, 0.6, 0.5);
        g.lineWidth = 1.2;
        g.beginPath();
        let x = r.range(0, N), y = r.range(0, N);
        g.moveTo(x, y);
        for (let k = 0; k < 6; k++) g.lineTo((x += r.range(-30, 30)), (y += r.range(-30, 30)));
        g.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    return tex;
  };

  // Material mit Struktur; repeat = Kachelungen pro Meter (≈ 1 Textur je 2 m bei 0.5).
  const surface = (kind, { repeat = [1, 1], roughness = 0.9, seed, color } = {}) => {
    const map = surfaceTexture(kind, { seed, color }).clone();
    map.needsUpdate = true;
    map.repeat.set(repeat[0], repeat[1]);
    return new THREE.MeshStandardMaterial({ map, roughness, metalness: 0 });
  };

  // Bodenplatte mit Struktur (unterteilt: Schattenempfänger ≤ 25 m Kantenlänge, stage.js).
  const ground = (kind, w, d, { perMeter = 0.5, y = 0, seed, color } = {}) => {
    const geo = new THREE.PlaneGeometry(w, d, Math.max(1, Math.ceil(w / 8)), Math.max(1, Math.ceil(d / 8)));
    const m = new THREE.Mesh(geo, surface(kind, { repeat: [w * perMeter, d * perMeter], seed, color }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    m.receiveShadow = true;
    return m;
  };

  // Wasserfläche: Glanz + leichte Wellen; mirror = echte Spiegelung (zusätzlicher Render-Durchgang, ≈ doppelte Renderzeit
  // für Bilder mit Wasser). update(t) bewegt die Wellen deterministisch aus t.
  let ReflectorCls = null;
  const setReflector = (cls) => (ReflectorCls = cls);
  const water = ({ w = 8, d = 8, color = 0x2c8fb0, mirror = false, opacity = 0.82, waves = 0.03 } = {}) => {
    const root = group();
    const geo = new THREE.PlaneGeometry(w, d, Math.max(8, Math.ceil(w * 2)), Math.max(8, Math.ceil(d * 2)));
    const base = Float32Array.from(geo.attributes.position.array);
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.08, metalness: 0.25, transparent: !mirror && opacity < 1, opacity, flatShading: false });
    const surf = new THREE.Mesh(geo, m);
    surf.rotation.x = -Math.PI / 2;
    surf.receiveShadow = true;
    root.add(surf);
    let refl = null;
    if (mirror) {
      if (!ReflectorCls) throw new Error('water({ mirror: true }): Reflector nicht geladen – in build(): await kit.atmo.loadReflector()');
      refl = new ReflectorCls(new THREE.PlaneGeometry(w, d), { textureWidth: 540, textureHeight: 960, color: 0x8a9aa6, clipBias: 0.003 });
      refl.rotation.x = -Math.PI / 2;
      refl.position.y = -0.01;
      root.add(refl);
      m.transparent = true;
      m.opacity = 1 - 0.55;
    }
    const pos = geo.attributes.position;
    return {
      root,
      material: m,
      update(t) {
        if (!waves) return;
        for (let i = 0; i < pos.count; i++) {
          const x = base[3 * i];
          const y = base[3 * i + 1];
          pos.array[3 * i + 2] = waves * (Math.sin(x * 1.7 + t * 1.3) + Math.sin(y * 2.3 - t * 1.1)) * 0.5;
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
      },
    };
  };
  // Reflector nachladen (nur im Browser/bei Bedarf; hält createKit synchron).
  const loadReflector = async () => {
    if (!ReflectorCls) ReflectorCls = (await import('/node_modules/three/examples/jsm/objects/Reflector.js')).Reflector;
    return ReflectorCls;
  };

  // Schwebeteilchen im Licht (Staub, Pollen, Funken über einer Party): kleine leuchtende Punkte, die im Dunst/Spot
  // sichtbar werden und dem Bild auch in ruhigen Einstellungen Bewegung geben (Befund: Bewegung 3–15 s A < C).
  const dust = ({ center = [0, 1.5, 0], size = [6, 3, 6], count = 260, color = 0xfff1d6, sizeM = 0.018, intensity = 1.6, drift = 0.12, seed = 51 } = {}) => {
    const r = createRng(seed);
    const m = new THREE.InstancedMesh(new THREE.OctahedronGeometry(sizeM, 0), glow(color, intensity), count);
    m.frustumCulled = false;
    m.castShadow = m.receiveShadow = false;
    const seeds = Array.from({ length: count }, () => [r.next(), r.next(), r.next(), r.range(0.5, 1.5)]);
    const M = new THREE.Matrix4();
    const P = new THREE.Vector3();
    const Qi = new THREE.Quaternion();
    const S = new THREE.Vector3(1, 1, 1);
    return {
      root: m,
      update(t, k = 1) {
        m.visible = k > 0.01;
        for (let i = 0; i < count; i++) {
          const [a, b, c, sp] = seeds[i];
          const w = t * drift * sp;
          P.set(center[0] + (a - 0.5) * size[0] + 0.25 * Math.sin(w * 2.1 + a * 9), center[1] + (((b + w * 0.35) % 1) - 0.5) * size[1], center[2] + (c - 0.5) * size[2] + 0.25 * Math.cos(w * 1.7 + c * 7));
          S.setScalar(k * (0.6 + 0.4 * Math.sin(t * 3 * sp + a * 20)));
          M.compose(P, Qi, S);
          m.setMatrixAt(i, M);
        }
        m.instanceMatrix.needsUpdate = true;
      },
    };
  };

  // Konfetti/Schnipsel, die fallen und taumeln (Gewinn, Feier, Explosion von Papier/Geld). s = Sekunden seit Start.
  const confetti = ({ center = [0, 4, 0], spread = [6, 6], count = 300, colors = [0xffd23f, 0xff4f7b, 0x3fc1ff, 0x7cff6b, 0xffffff], fall = 1.4, size = [0.06, 0.03], seed = 61, life = 6 } = {}) => {
    const r = createRng(seed);
    const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(size[0], size[1]), new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.6 }), count);
    m.frustumCulled = false;
    const cl = new THREE.Color();
    const seeds = Array.from({ length: count }, (_, i) => {
      m.setColorAt(i, cl.setHex(r.pick(colors)));
      return [r.range(-0.5, 0.5) * spread[0], r.range(-0.5, 0.5) * spread[1], r.range(0, 1.5), r.range(0.7, 1.3), r.next() * 6];
    });
    m.instanceColor.needsUpdate = true;
    const M = new THREE.Matrix4();
    const P = new THREE.Vector3();
    const Qi = new THREE.Quaternion();
    const Eu = new THREE.Euler();
    const S = new THREE.Vector3(1, 1, 1);
    return {
      root: m,
      update(s) {
        const on = s >= 0 && s < life;
        m.visible = on;
        if (!on) return;
        for (let i = 0; i < count; i++) {
          const [x, z, dy, sp, ph] = seeds[i];
          P.set(center[0] + x + 0.3 * Math.sin(s * 2 * sp + ph), center[1] + dy - s * fall * sp, center[2] + z + 0.3 * Math.cos(s * 1.6 * sp + ph));
          Qi.setFromEuler(Eu.set(s * 5 * sp + ph, s * 3 + ph, s * 4 * sp));
          M.compose(P, Qi, S);
          m.setMatrixAt(i, M);
        }
        m.instanceMatrix.needsUpdate = true;
      },
    };
  };

  // Milchstraße: dichtes Sternenband + weiche Leuchtwolken über den Himmel (dunkler Himmel ohne Lichtverschmutzung).
  // Ergänzt 2026-11-05 für what-if-last-light. center = Standpunkt; tilt = Neigung des Bands (rad); set(k) blendet ein.
  const milkyWay = ({ center = [0, 0, 0], radius = 400, count = 9000, tilt = 0.5, yaw = 0, width = 0.12, seed = 71, glow = 0.55 } = {}) => {
    const r = createRng(seed);
    const root = group();
    root.position.set(...center);
    root.rotation.set(tilt, yaw, 0);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const gauss = () => (r.next() + r.next() + r.next() - 1.5) / 1.5;
    for (let i = 0; i < count; i++) {
      const a = r.range(0, Math.PI); // obere Himmelshälfte
      const b = gauss() * width * (r.next() < 0.25 ? 2.5 : 1);
      const x = Math.cos(a) * Math.cos(b);
      const y = Math.sin(a) * Math.cos(b);
      const z = Math.sin(b);
      pos.set([x * radius, y * radius, z * radius], i * 3);
      const w = r.range(0.55, 1);
      const warm = r.next() < 0.3;
      col.set([w, w * (warm ? 0.92 : 0.97), w * (warm ? 0.8 : 1.0)], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const ptsMat = new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 1, fog: false, depthWrite: false });
    root.add(new THREE.Points(geo, ptsMat));
    // Leuchtwolken entlang des Bands (Canvas-Verlauf, additiv)
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.45, 'rgba(255,255,255,0.35)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    const cloudMat = [];
    for (let i = 0; i < 26; i++) {
      const a = (i + r.next()) / 26 * Math.PI;
      const m = new THREE.SpriteMaterial({ map: tex, color: r.next() < 0.3 ? 0xd9c8ff : 0xcfe0ff, transparent: true, opacity: glow * r.range(0.25, 0.6), blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
      const s = new THREE.Sprite(m);
      s.position.set(Math.cos(a) * radius * 0.98, Math.sin(a) * radius * 0.98, gauss() * width * radius * 0.6);
      s.scale.setScalar(radius * r.range(0.18, 0.34));
      cloudMat.push([m, m.opacity]);
      root.add(s);
    }
    return { root, set: (k) => { ptsMat.opacity = k; cloudMat.forEach(([m, o]) => (m.opacity = o * k)); root.visible = k > 0.01; } };
  };

  // Gedämpfte Kulissenfarbe aus einer Palette (deterministisch über Index).
  const palette = (name) => {
    const P = PALETTES[name];
    if (!P) throw new Error(`Palette „${name}“ unbekannt (${Object.keys(PALETTES).join(', ')})`);
    return { ...P, pick: (i) => P.base[((i % P.base.length) + P.base.length) % P.base.length] };
  };

  return { LOOKS: LOOKS_V3, PALETTES, palette, glow, sunBehind, stringLights, neonStrip, spotCone, lampPool, glowSign, surfaceTexture, surface, ground, water, loadReflector, setReflector, dust, confetti, milkyWay };
}
