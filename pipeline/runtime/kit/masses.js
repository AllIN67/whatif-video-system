// Massen und Schauwert (Version 3.0, Analyse 6 Videos: C1 Feld mit Hunderten Autos, Stadien mit Tausenden Zuschauern;
// C2 Party mit Hunderten Figuren; unsere Sets hatten 1–20 Figuren). kit.crowd() baut vollständige Einzelfiguren
// (teuer); hier entstehen große Mengen per InstancedMesh – eine Zeichen-Operation je Bauteil, unabhängig von der Anzahl.
//
//   const fans = kit.masses.crowd({ count: 1500, area: [-20, 20, -40, -10], face: [0, 0, 0], anim: 'cheer' });
//   scene.add(fans.root);  … fans.update(t, { k: 1 })       // k = Jubel-Stärke 0…1
//   scene.add(kit.masses.stands({ width: 40, rows: 14, crowd: 0.85 }).root);
//   scene.add(kit.masses.carField({ rows: 12, cols: 20, color: 0xd8342c }).root);
//   scene.add(kit.masses.skyline({ center: [0, 0, 0], radius: 120, night: true }).root);
//
// Determinismus: eigener Zufall je Aufruf (opts.seed), nie das gemeinsame rng (bestehende Szenen bleiben bit-identisch).
// Figuren in der Masse sind vereinfacht (Kopf, Rumpf, Beine, Arme) – nah vor der Kamera weiterhin kit.human() verwenden.
import { createRng } from '../rng.js';
import { SKIN } from './human.js';

const SHIRTS = [0xd94a3a, 0x3a7ad9, 0xe0b23a, 0x4aa05a, 0xeeeeee, 0x333333, 0x8a5ac9, 0xe08a3a, 0x2a9d8f, 0xf1f1f1];
const PANTS = [0x2d3e66, 0x3a3a3a, 0x6b5a45, 0x24304a, 0x1f1f24];

export function createMasses(THREE, core) {
  const { mat, group } = core;
  const M4 = new THREE.Matrix4();
  const Q = new THREE.Quaternion();
  const E = new THREE.Euler();
  const V = new THREE.Vector3();
  const SC = new THREE.Vector3(1, 1, 1);
  const col = new THREE.Color();

  const inst = (geo, material, count, { shadow = false } = {}) => {
    const m = new THREE.InstancedMesh(geo, material, count);
    m.castShadow = shadow;
    m.receiveShadow = false;
    m.frustumCulled = false;
    return m;
  };
  const boxGeo = (w, h, d, oy = 0) => new THREE.BoxGeometry(w, h, d).translate(0, oy, 0);

  // Menschenmenge. area = [x0, x1, z0, z1] ODER positions = [[x, y, z], …]; face = Punkt, zu dem alle schauen
  // (Bühne/Spielfeld) – ohne face zufällige Blickrichtung. anim: idle | bob | cheer | wave. palette = Shirt-Farben.
  const crowd = ({ count = 400, area = [-10, 10, -10, 10], positions = null, y = 0, face = null, anim = 'bob', palette = SHIRTS, scale = 1, seed = 11, shadow = false } = {}) => {
    const r = createRng(seed);
    const n = positions ? positions.length : count;
    const root = group();
    const white = mat(0xffffff);
    const parts = {
      legs: inst(boxGeo(0.34, 0.9, 0.22, 0.45), white, n, { shadow }),
      torso: inst(boxGeo(0.46, 0.6, 0.26, 1.25), white, n, { shadow }),
      head: inst(boxGeo(0.28, 0.32, 0.28, 1.73), white, n, { shadow }),
      armL: inst(boxGeo(0.12, 0.58, 0.12, -0.29), white, n),
      armR: inst(boxGeo(0.12, 0.58, 0.12, -0.29), white, n),
      hair: inst(boxGeo(0.3, 0.09, 0.3, 1.92), white, n),
    };
    Object.values(parts).forEach((p) => root.add(p));
    const people = [];
    for (let i = 0; i < n; i++) {
      const p = positions ? positions[i] : [r.range(area[0], area[1]), y, r.range(area[2], area[3])];
      const yaw = face ? Math.atan2(face[0] - p[0], face[2] - p[2]) + r.range(-0.25, 0.25) : r.range(-Math.PI, Math.PI);
      const shirt = r.pick(palette);
      people.push({ p, yaw, s: scale * r.range(0.92, 1.06), ph: r.next(), sp: r.range(0.8, 1.3), cheer: r.next() });
      parts.legs.setColorAt(i, col.setHex(r.pick(PANTS)));
      parts.torso.setColorAt(i, col.setHex(shirt));
      parts.armL.setColorAt(i, col.setHex(shirt));
      parts.armR.setColorAt(i, col.setHex(shirt));
      parts.head.setColorAt(i, col.setHex(r.pick(SKIN)));
      parts.hair.setColorAt(i, col.setHex(r.pick([0x3b2a20, 0x1d1d1f, 0x5a3a24, 0xc9a26b, 0x7a7a7a])));
    }
    Object.values(parts).forEach((m) => (m.instanceColor.needsUpdate = true));
    const place = (mesh, i, x, yy, z, rx, ry, rz, s) => {
      E.set(rx, ry, rz);
      Q.setFromEuler(E);
      SC.setScalar(s);
      M4.compose(V.set(x, yy, z), Q, SC);
      mesh.setMatrixAt(i, M4);
    };
    const api = {
      root,
      count: n,
      // k = Animationsstärke (0 = still, 1 = volle Bewegung)
      update(t, { k = 1 } = {}) {
        for (let i = 0; i < n; i++) {
          const P = people[i];
          const w = (t * P.sp + P.ph) * Math.PI * 2;
          let hop = 0;
          let armUp = 0.15;
          if (anim === 'bob') hop = 0.03 * k * Math.max(0, Math.sin(w));
          if (anim === 'cheer') {
            hop = 0.12 * k * Math.max(0, Math.sin(w * 1.4));
            armUp = (2.4 + 0.3 * Math.sin(w * 1.4)) * k * (P.cheer > 0.25 ? 1 : 0.2);
          }
          if (anim === 'wave') armUp = (P.cheer > 0.5 ? 2.6 : 0.15) * k;
          const [x, y0, z] = P.p;
          const yy = y0 + hop;
          const s = P.s;
          const c = Math.cos(P.yaw);
          const sn = Math.sin(P.yaw);
          place(parts.legs, i, x, yy, z, 0, P.yaw, 0, s);
          place(parts.torso, i, x, yy, z, 0, P.yaw, 0, s);
          place(parts.head, i, x, yy, z, 0, P.yaw, 0, s);
          place(parts.hair, i, x, yy, z, 0, P.yaw, 0, s);
          const sh = 1.5 * s;
          const off = 0.29 * s;
          // Arme: Drehpunkt an der Schulter, seitlich ± off (in Blickrichtung gedreht)
          place(parts.armL, i, x + c * off, yy + sh, z - sn * off, 0, P.yaw, armUp + 0.05 * Math.sin(w), s);
          place(parts.armR, i, x - c * off, yy + sh, z + sn * off, 0, P.yaw, -armUp - 0.05 * Math.sin(w + 1), s);
        }
        Object.values(parts).forEach((m) => (m.instanceMatrix.needsUpdate = true));
        return api;
      },
    };
    api.update(0, { k: 0 });
    return api;
  };

  // Tribüne (Stadion/Halle) mit Zuschauern auf den Stufen. crowd = Belegung 0…1. Ursprung = Mitte der untersten Stufe,
  // Tribüne steigt nach −z an (Zuschauer schauen nach +z aufs Feld).
  const stands = ({ width = 40, rows = 12, rise = 0.45, depth = 0.85, color = 0x5a6270, seatColor = 0x2b4f8f, crowd: fill = 0.85, anim = 'bob', seed = 21, palette = SHIRTS } = {}) => {
    const r = createRng(seed);
    const root = group();
    for (let i = 0; i < rows; i++) {
      const step = core.box(width, rise, depth, i % 2 ? color : 0x666e7b, [0, i * rise, -i * depth], { cast: false });
      root.add(step);
    }
    root.add(core.box(width, 0.9, 0.2, seatColor, [0, 0, depth * 0.5 + 0.1], { cast: false })); // Bande
    const positions = [];
    const per = Math.floor(width / 0.62);
    for (let i = 0; i < rows; i++) for (let j = 0; j < per; j++) {
      if (r.next() > fill) continue;
      positions.push([-width / 2 + 0.31 + j * 0.62 + r.range(-0.05, 0.05), (i + 1) * rise - 0.35, -i * depth]);
    }
    const people = crowd({ positions, face: [0, 0, 60], anim, seed: seed + 1, palette, scale: 0.95 });
    root.add(people.root);
    return { root, people, update: (t, o) => people.update(t, o) };
  };

  // Feld/Parkplatz voller Autos (instanziert). color = eine Farbe (Masse eines Modells) oder null = gemischt.
  const carField = ({ rows = 10, cols = 16, gapX = 2.6, gapZ = 5.2, color = null, seed = 31, jitter = 0.08 } = {}) => {
    const r = createRng(seed);
    const n = rows * cols;
    const root = group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.25, flatShading: true });
    const glass = new THREE.MeshStandardMaterial({ color: 0x1d2630, roughness: 0.15, metalness: 0.4, flatShading: true });
    const body = inst(boxGeo(1.8, 0.55, 4.2, 0.45), bodyMat, n, { shadow: true });
    const cabin = inst(boxGeo(1.5, 0.4, 1.9, 0.92), bodyMat, n); // Dach in Wagenfarbe (aus der Luft lesbar)
    const windows = inst(boxGeo(1.56, 0.26, 2.0, 0.86), glass, n);
    const wheels = inst(boxGeo(1.9, 0.38, 3.0, 0.19), mat(0x151515), n);
    root.add(body, cabin, windows, wheels);
    const mix = [0xd8342c, 0x2f5fb0, 0xe8e8e8, 0x2a2a2e, 0x8a8f96, 0xe0b23a];
    let i = 0;
    for (let a = 0; a < rows; a++) for (let b = 0; b < cols; b++, i++) {
      const x = (b - (cols - 1) / 2) * gapX + r.range(-jitter, jitter);
      const z = -a * gapZ + r.range(-jitter, jitter);
      const yaw = r.range(-0.03, 0.03);
      for (const m of [body, cabin, windows, wheels]) {
        Q.setFromEuler(E.set(0, yaw, 0));
        M4.compose(V.set(x, 0, z), Q, SC.setScalar(1));
        m.setMatrixAt(i, M4);
      }
      body.setColorAt(i, col.setHex(color ?? r.pick(mix)));
      cabin.setColorAt(i, col);
    }
    body.instanceColor.needsUpdate = true;
    cabin.instanceColor.needsUpdate = true;
    return { root, count: n };
  };

  // Skyline-Kulisse auf einem Bogen hinter der Szene (Tiefe, „große Welt“). night: Fenster leuchten.
  // center = Standpunkt (Kamera-Bereich); Türme stehen im Abstand radius auf einem Bogen in −z-Richtung.
  const skyline = ({ center = [0, 0, 0], radius = 120, arc = [-0.9, 0.9], count = 70, minH = 15, maxH = 90, color = 0x5b6470, night = false, seed = 41, windowColor = 0xffd9a0 } = {}) => {
    const r = createRng(seed);
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = '#000';
    g.fillRect(0, 0, 64, 128);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 6; x++) {
      if (r.next() < (night ? 0.55 : 0)) {
        g.fillStyle = r.next() < 0.8 ? '#ffd9a0' : '#bfe0ff';
        g.fillRect(4 + x * 10, 4 + y * 8, 6, 4);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 3);
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true, emissive: night ? windowColor : 0x000000, emissiveMap: night ? tex : null, emissiveIntensity: night ? 1.4 : 0 });
    const towers = inst(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), m, count, { shadow: false });
    for (let i = 0; i < count; i++) {
      const a = arc[0] + (arc[1] - arc[0]) * (i + r.range(-0.3, 0.3)) / count;
      const rr = radius * r.range(0.85, 1.15);
      const w = r.range(6, 14);
      const h = r.range(minH, maxH) * (r.next() < 0.12 ? 1.6 : 1);
      M4.compose(V.set(center[0] + Math.sin(a) * rr, center[1], center[2] - Math.cos(a) * rr), Q.setFromEuler(E.set(0, -a, 0)), SC.set(w, h, r.range(6, 12)));
      towers.setMatrixAt(i, M4);
    }
    SC.set(1, 1, 1);
    const root = group(towers);
    return { root, material: m };
  };

  return { crowd, stands, carField, skyline };
}
