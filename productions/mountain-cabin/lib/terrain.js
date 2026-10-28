// Gelände: Höhenfunktion (eine Quelle für Mesh, Bäume, Requisiten und Kamera), Nah-, Mittel- und Fern-Mesh, See.
import { createNoise, smooth, lerp, clamp01 } from './noise.js';
import { POOL, CLIFF_DIR, SUMMIT, LAKE, TRAIL, HIKE } from './layout.js';

export const LAKE_LEVEL = -246;

function distToPolyline(x, z, pts) {
  let best = 1e9;
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1];
    const [bx, bz] = pts[i];
    const dx = bx - ax;
    const dz = bz - az;
    const L = dx * dx + dz * dz;
    const u = clamp01(((x - ax) * dx + (z - az) * dz) / L);
    best = Math.min(best, Math.hypot(x - (ax + u * dx), z - (az + u * dz)));
  }
  return best;
}

export function createTerrain(THREE, rng) {
  const N = createNoise(rng);

  function lakeMask(x, z) {
    return Math.hypot((x - LAKE.x) / LAKE.rx, (z - LAKE.z) / LAKE.rz) + 0.16 * N.fbm(x / 160 + 9, z / 160, 3);
  }

  function height(x, z) {
    const fwd = -z;
    // Hang vor der Hütte: konkav (nah steiler, fern flacher), damit der Talboden von der Veranda sichtbar ist
    const f0 = Math.max(0, fwd - 7);
    let h = -280 * (1 - Math.exp(-f0 / 560)) * smooth(f0 / 3);
    if (z > 0) h += 0.14 * z + 0.00035 * z * z;
    // Talflanken: Tal weitet sich mit der Entfernung
    const cx = -80 + 0.06 * Math.max(0, fwd);
    const halfW = 560 + 0.3 * Math.max(0, fwd);
    const side = Math.abs(x - cx) - halfW;
    const crag = N.fbm(x / 230, z / 230, 4);
    if (side > 0) {
      const rs = N.ridged(x / 1100 + 7, z / 1100 - 3, 5);
      // nahe der Hütte bewaldete Kuppen, talauswärts hohe Flanken
      const tall = smooth((fwd + 200) / 900);
      h += Math.pow(Math.min(1, side / 1000), 1.2) * (lerp(160, 520, tall) + lerp(200, 900, tall) * rs * rs + 120 * crag);
    }
    // ferne Bergkette (Gipfel mit Graten und Felsrippen)
    const far = smooth((fwd - 2300) / 1900);
    const rg = N.ridged(x / 1500 + 3.3, z / 1500 + 1.7, 6);
    h += far * (380 + 1500 * rg * rg + 170 * crag * (0.3 + rg));
    // zweite, fernere Kette (Tiefenstaffelung)
    const far2 = smooth((fwd - 6000) / 1500);
    const rg2 = N.ridged(x / 2200 - 4.1, z / 2200 + 2.2, 5);
    h += far2 * (900 + 1700 * rg2 * rg2);
    // Rücken hinter der Hütte
    if (z > 420) h += smooth((z - 420) / 1400) * (380 + 650 * N.ridged(x / 900 - 5, z / 900, 5));
    // Detail, wächst mit Entfernung zur Hütte
    const r = Math.hypot(x, z);
    const amp = 1.2 + Math.min(1, r / 280) * 16 + Math.min(1, r / 1400) * 70;
    h += amp * N.fbm(x / 170, z / 170, 6);
    // See: flaches Becken mit unregelmäßigem Ufer
    const e = lakeMask(x, z);
    if (e < 1.6) h = lerp(LAKE_LEVEL - 6, h, smooth((e - 0.85) / 0.75));
    // Aussichtshügel
    const ds = Math.hypot(x - SUMMIT.x, z - SUMMIT.z);
    h += 92 * Math.exp(-(ds * ds) / (2 * 60 * 60)) + 9 * Math.exp(-(ds * ds) / (2 * 14 * 14)) * (0.6 + N.fbm(x / 9, z / 9, 3));
    // Wasserfall: Felsstufe hinter dem Becken + Becken
    const px = x - POOL.x;
    const pz = z - POOL.z;
    const along = px * CLIFF_DIR[0] + pz * CLIFF_DIR[1];
    const lateral = Math.abs(-px * CLIFF_DIR[1] + pz * CLIFF_DIR[0]);
    const near = smooth((60 - Math.hypot(px, pz)) / 30);
    h += near * 17 * smooth((along - 7.5) / 2.5) * (1 - 0.5 * smooth((lateral - 22) / 20));
    const dp = Math.hypot(px, pz);
    h -= 1.6 * smooth((POOL.r + 1.5 - dp) / 3);
    // Pfade leicht eingeebnet
    const dt = distToPolyline(x, z, TRAIL);
    const dh = distToPolyline(x, z, HIKE);
    h -= 0.12 * smooth((1.4 - dt) / 1.0) + 0.1 * smooth((1.3 - dh) / 1.0);
    // Hüttenplateau
    const kc = Math.max(smooth((r - 15) / 24), smooth((fwd - 6.5) / 3));
    h = lerp(-0.03 + 0.015 * N.n2(x / 3, z / 3), h, kc);
    return h;
  }

  // Steigung per zentraler Differenz (für Farbe, Baumplatzierung)
  function slope(x, z, e = 1.5) {
    const hx = (height(x + e, z) - height(x - e, z)) / (2 * e);
    const hz = (height(x, z + e) - height(x, z - e)) / (2 * e);
    return Math.hypot(hx, hz);
  }

  function colorAt(x, z, h, s, out) {
    const n = N.fbm(x / 23, z / 23, 3);
    const nB = N.fbm(x / 7, z / 7, 2);
    const n2 = N.fbm(x / 400, z / 400, 3);
    const dry = N.fbm(x / 60 + 40, z / 60, 3);
    // Wiese: Grüntöne mit trockenen und feuchten Flecken
    let r = 0.15 + 0.05 * n + 0.06 * Math.max(0, dry) + 0.02 * nB;
    let g = 0.2 + 0.05 * n + 0.03 * n2 + 0.03 * Math.max(0, dry) + 0.02 * nB;
    let b = 0.07 + 0.01 * nB;
    // Waldboden dunkler in mittlerer Höhe (Ferne: dunkles Waldband)
    const forest = smooth((h + 240) / 60) * (1 - smooth((h - 420 - 80 * n2) / 140)) * smooth((Math.hypot(x, z) - 26) / 30);
    // Waldboden: Nadelstreu (braun) mit Moosflecken
    const moss = 0.5 + 0.5 * N.n2(x / 5 + 3, z / 5);
    r = lerp(r, lerp(0.075, 0.05, moss), forest * 0.85);
    g = lerp(g, lerp(0.07, 0.09, moss), forest * 0.85);
    b = lerp(b, 0.04, forest * 0.85);
    // Fels: steile Hänge und große Höhe, mit Schichtung
    const rock = clamp01(smooth((s - lerp(0.62, 0.95, 1 - smooth((h - 150) / 300))) / 0.35) + smooth((h - 600 - 100 * n2) / 260) * 0.8);
    const strata = 0.012 * Math.sin(h / 23 + n * 6);
    const rc = 0.2 + 0.07 * n + strata + 0.04 * nB;
    const warm = 0.5 + 0.5 * N.n2(x / 500, z / 500);
    r = lerp(r, rc * (1.0 + 0.1 * warm), rock);
    g = lerp(g, rc * (0.98 + 0.03 * warm), rock);
    b = lerp(b, rc * (1.02 - 0.08 * warm), rock);
    // Geröll am Hangfuß
    const scree = smooth((s - 0.45) / 0.2) * (1 - smooth((s - 0.75) / 0.2)) * smooth((h - 300) / 200) * 0.18;
    r = lerp(r, 0.34, scree);
    g = lerp(g, 0.33, scree);
    b = lerp(b, 0.31, scree);
    // Schnee oberhalb ~750 m relativ zur Hütte, auf Steilwänden nur in Rinnen
    const snowLine = 720 + 170 * n2 + 70 * n;
    const snow = smooth((h - snowLine) / 160) * (1 - smooth((s - 1.25 - 0.5 * nB) / 0.4));
    r = lerp(r, 0.88, snow);
    g = lerp(g, 0.9, snow);
    b = lerp(b, 0.95, snow);
    out[0] = r;
    out[1] = g;
    out[2] = b;
  }

  function buildMesh(cx, cz, sx, sz, segx, segz, lower = null) {
    const geo = new THREE.PlaneGeometry(sx, sz, segx, segz);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const c = [0, 0, 0];
    const e = Math.max(sx / segx, 1.5);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + cx;
      const z = pos.getZ(i) + cz;
      let h = height(x, z);
      if (lower) h -= lower(x, z);
      pos.setXYZ(i, x, h, z);
      colorAt(x, z, h, slope(x, z, e), c);
      col.set(c, i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    return geo;
  }

  const NEAR = { cx: 0, cz: 30, sx: 500, sz: 500, segx: 220, segz: 220 };
  const MID = { cx: -100, cz: -3800, sx: 8400, sz: 5600, segx: 300, segz: 200 };
  // Fernbereich: in Nah- und Mittelbereich abgesenkt (verdeckt), am Rand exakt
  const sink = (B, depth) => (x, z) => {
    const inside = Math.min(B.sx / 2 - Math.abs(x - B.cx), B.sz / 2 - Math.abs(z - B.cz));
    return inside > 0 ? depth * smooth(inside / (B.sx / 12)) : 0;
  };
  const lowNear = sink(NEAR, 3);
  const lowMid = sink(MID, 14);
  const nearMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 });
  const farMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
  // Nah-/Mittel-/Fern-Meshes erst bei Bedarf bauen (Node-Skripte brauchen nur die Höhenfunktion)
  let meshes = null;
  function build() {
    if (meshes) return meshes;
    const nearMesh = new THREE.Mesh(buildMesh(NEAR.cx, NEAR.cz, NEAR.sx, NEAR.sz, NEAR.segx, NEAR.segz), nearMat);
    nearMesh.receiveShadow = true;
    nearMesh.name = 'terrain-near';
    const midMesh = new THREE.Mesh(buildMesh(MID.cx, MID.cz, MID.sx, MID.sz, MID.segx, MID.segz, lowNear), farMat);
    midMesh.name = 'terrain-mid';
    const farMesh = new THREE.Mesh(buildMesh(0, -4000, 20000, 20000, 280, 280, (x, z) => Math.max(lowNear(x, z), lowMid(x, z))), farMat);
    farMesh.name = 'terrain-far';
    const lakeGeo = new THREE.CircleGeometry(1, 96);
    lakeGeo.rotateX(-Math.PI / 2);
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.scale.set(LAKE.rx * 1.45, 1, LAKE.rz * 1.45);
    lake.position.set(LAKE.x, LAKE_LEVEL, LAKE.z);
    meshes = { nearMesh, midMesh, farMesh, lake };
    return meshes;
  }
  const lakeMat = new THREE.MeshStandardMaterial({ color: 0x0a2430, roughness: 0.12, metalness: 0.1, envMapIntensity: 0.55 });

  return { height, slope, build, nearMat, farMat, lakeMat, noise: N, NEAR };
}
