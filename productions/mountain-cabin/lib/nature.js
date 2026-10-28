// Wald, Felsen, Garten, Hühner, Holzstapel, Spuren. Wind über Shader-Uniform (aus t berechnet).
import { BIG_ROCK, CABIN, WOODPILE, GARDEN, COOP, POOL, CLIFF_DIR, TRAIL, HIKE, SUMMIT, LAKE } from './layout.js';
import { clamp01, smooth } from './noise.js';
import { mergeVertices } from '/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';

function distToPolyline(x, z, pts) {
  let best = 1e9;
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1];
    const [bx, bz] = pts[i];
    const dx = bx - ax;
    const dz = bz - az;
    const u = clamp01(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz));
    best = Math.min(best, Math.hypot(x - (ax + u * dx), z - (az + u * dz)));
  }
  return best;
}

// Wind-Shader: Biegung mit Höhe, Phase aus Instanzposition
export function windify(material, uniforms, heightScale = 10) {
  material.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uniforms.uTime;
    sh.uniforms.uWind = uniforms.uWind;
    sh.vertexShader = 'uniform float uTime; uniform float uWind;\n' + sh.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       #ifdef USE_INSTANCING
         vec2 ip = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);
       #else
         vec2 ip = vec2(0.0);
       #endif
       float hh = max(0.0, position.y) / ${heightScale.toFixed(1)};
       float ph = ip.x * 0.37 + ip.y * 0.23;
       float gust = 0.6 + 0.4 * sin(uTime * 0.7 + ip.x * 0.02);
       float s = (sin(uTime * 1.9 + ph) * 0.6 + sin(uTime * 3.7 + ph * 1.7) * 0.25) * uWind * gust;
       transformed.x += s * hh * hh * 0.9 + uWind * 0.35 * hh * hh * gust;
       transformed.z += s * hh * hh * 0.35;`,
    );
  };
  material.customProgramCacheKey = () => 'wind' + heightScale;
}

function pineGeometry(THREE, rng, tiers = 9, seg = 10) {
  const parts = [];
  const trunk = new THREE.CylinderGeometry(0.12, 0.22, 2.2, 6, 1, true);
  trunk.translate(0, 1.1, 0);
  const tc = new Float32Array(trunk.attributes.position.count * 3).fill(0);
  for (let i = 0; i < tc.length; i += 3) tc.set([0.12, 0.08, 0.05], i);
  trunk.setAttribute('color', new THREE.BufferAttribute(tc, 3));
  parts.push(trunk);
  for (let k = 0; k < tiers; k++) {
    const f = k / (tiers - 1);
    const r = 2.1 * Math.pow(1 - f * 0.86, 1.1);
    const h = (1.7 * 9 / tiers) * (1 - f * 0.3);
    const y = 1.0 + (k * 1.02 * 9) / tiers;
    const cone = new THREE.ConeGeometry(r, h, seg, 1, true);
    cone.rotateY(rng.range(0, 6.28));
    cone.translate(0, y + h / 2, 0);
    const pos = cone.attributes.position;
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const vy = pos.getY(i) - y;
      const rr = Math.hypot(pos.getX(i), pos.getZ(i));
      if (rr > 0.05) {
        const j = 1 + rng.range(-0.28, 0.15);
        pos.setX(i, pos.getX(i) * j);
        pos.setZ(i, pos.getZ(i) * j);
        // Äste hängen an der Spitze nach unten durch
        pos.setY(i, pos.getY(i) + rng.range(-0.22, 0.04) - (vy < 0.15 ? 0.35 * (rr / r) : 0));
      }
      const shade = 0.5 + 0.5 * (vy / h) + 0.15 * f + rng.range(-0.06, 0.06);
      col.set([0.038 * shade, 0.072 * shade, 0.05 * shade], i * 3);
    }
    cone.computeVertexNormals();
    cone.setAttribute('color', new THREE.BufferAttribute(col, 3));
    parts.push(cone);
  }
  // zusammenführen
  let n = 0;
  for (const p of parts) n += (p.index ? p.index.count : p.attributes.position.count);
  const out = new THREE.BufferGeometry();
  const P = [];
  const Nn = [];
  const C = [];
  for (const p of parts) {
    const g = p.index ? p.toNonIndexed() : p;
    P.push(...g.attributes.position.array);
    Nn.push(...g.attributes.normal.array);
    C.push(...g.attributes.color.array);
  }
  out.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3));
  out.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  void n;
  return out;
}

export function rockGeometry(THREE, rng, noise, detail = 3) {
  let g = new THREE.IcosahedronGeometry(1, detail);
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  g = mergeVertices(g);
  const pos = g.attributes.position;
  const off = rng.range(0, 100);
  const col = new Float32Array(pos.count * 3);
  // Bruchflächen: einige zufällige Ebenen schneiden den Block ab
  const cuts = [];
  for (let i = 0; i < 5; i++) {
    const n = [rng.range(-1, 1), rng.range(-0.6, 1), rng.range(-1, 1)];
    const l = Math.hypot(...n);
    cuts.push([n[0] / l, n[1] / l, n[2] / l, rng.range(0.55, 0.85)]);
  }
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const d = 1 + 0.22 * noise.fbm(x * 1.6 + off, z * 1.6 + y * 1.3, 4) + 0.06 * noise.n2(x * 7 + off, y * 7 + z * 3);
    x *= d;
    y *= d;
    z *= d;
    for (const [nx, ny, nz, c] of cuts) {
      const p = x * nx + y * ny + z * nz;
      if (p > c) {
        const k = (p - c) * 0.85;
        x -= nx * k;
        y -= ny * k;
        z -= nz * k;
      }
    }
    if (y < -0.35) y = -0.35 + (y + 0.35) * 0.3;
    pos.setXYZ(i, x, y, z);
    const moss = smooth((y - 0.15) / 0.45) * (0.55 + 0.45 * noise.n2(x * 3 + off, z * 3));
    const lichen = Math.max(0, noise.n2(x * 9 + off, y * 9 - z * 4)) * 0.08;
    const g0 = 0.2 + 0.07 * noise.n2(x * 4, y * 4 + off) + 0.05 * noise.fbm(x * 12, z * 12 + y * 7, 2) + lichen;
    col.set([g0 * (1 - moss) + 0.07 * moss, g0 * 0.97 * (1 - moss) + 0.1 * moss, g0 * 0.93 * (1 - moss) + 0.035 * moss], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

export function createNature(THREE, tex, rng, terrain) {
  const g = new THREE.Group();
  const H = terrain.height;
  const uniforms = { uTime: { value: 0 }, uWind: { value: 0.15 } };

  // --- Bäume ---
  const pine = pineGeometry(THREE, rng, 9, 10);
  const pineLo = pineGeometry(THREE, rng, 5, 7);
  const treeMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 });
  windify(treeMat, uniforms, 10);
  const keepClear = (x, z) => {
    if (Math.hypot(x, z) < 22) return true;
    if (x > 4 && x < 15 && z > -4 && z < 12) return true; // Garten/Stall
    if (distToPolyline(x, z, TRAIL) < 2.6) return true;
    if (distToPolyline(x, z, HIKE) < 3.0) return true;
    if (Math.hypot(x - POOL.x, z - POOL.z) < 14) return true;
    if (Math.hypot(x - SUMMIT.x, z - SUMMIT.z) < 26) return true;
    // freie Sicht von der Veranda ins Tal (Korridor nach −z)
    if (z < -6 && z > -140 && Math.abs(x + 2 + z * 0.1) < 14 + -z * 0.35) return true;
    return Math.hypot((x - LAKE.x) / LAKE.rx, (z - LAKE.z) / LAKE.rz) < 1.15;
  };
  const near = [];
  const far = [];
  const tryPlace = (x, z, list, scale) => {
    if (keepClear(x, z)) return;
    const h = H(x, z);
    if (h > 420 + 60 * terrain.noise.n2(x / 200, z / 200)) return;
    const s = terrain.slope(x, z, 2);
    if (s > 0.85) return;
    // Waldlichtungen über Rauschen
    const dens = terrain.noise.fbm(x / 140, z / 140, 3);
    if (dens < -0.12 && Math.hypot(x, z) > 60) return;
    list.push([x, h - 0.15, z, scale * rng.range(0.75, 1.3), rng.range(0, Math.PI * 2)]);
  };
  for (let i = 0; i < 4200; i++) {
    const a = rng.range(0, Math.PI * 2);
    const r = 22 + Math.pow(rng.next(), 0.8) * 260;
    tryPlace(Math.cos(a) * r, 30 + Math.sin(a) * r, near, 1.1);
  }
  for (let i = 0; i < 9000; i++) {
    const x = rng.range(-1500, 1300);
    const z = rng.range(-1700, 900);
    if (Math.abs(x) < 280 && z > -250 && z < 300) continue;
    tryPlace(x, z, far, 1.6);
  }
  const makeInst = (list, shadow, geo = pine) => {
    const m = new THREE.InstancedMesh(geo, treeMat, list.length);
    const d = new THREE.Object3D();
    const c = new THREE.Color();
    list.forEach(([x, y, z, s, r], i) => {
      d.position.set(x, y, z);
      d.rotation.set(rng.range(-0.03, 0.03), r, rng.range(-0.03, 0.03));
      d.scale.set(s, s * rng.range(0.9, 1.2), s);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      const v = rng.range(0.8, 1.25);
      m.setColorAt(i, c.setRGB(v, v * rng.range(0.95, 1.08), v));
    });
    m.castShadow = shadow;
    m.receiveShadow = true;
    m.frustumCulled = false;
    return m;
  };
  const treesNear = makeInst(near, true);
  const treesFar = makeInst(far, false, pineLo);
  g.add(treesNear, treesFar);
  // Einzelne Vordergrund-Kiefern nahe der Hütte (für Bildtiefe) – ebenfalls Instanzen
  const hero = [[-13, -9], [-16, -3], [15, -12], [-10, 16], [6, 17], [-24, 6], [18, 3]];
  const heroList = hero.map(([x, z]) => [x, H(x, z) - 0.1, z, rng.range(1.15, 1.4), rng.range(0, 6.28)]);
  const treesHero = makeInst(heroList, true);
  g.add(treesHero);

  // --- Gras (Büschel nahe der Hütte) ---
  const blade = new THREE.ConeGeometry(0.012, 0.26, 3, 1, true);
  blade.translate(0, 0.13, 0);
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x55682e, roughness: 0.9, side: THREE.DoubleSide });
  windify(grassMat, uniforms, 0.35);
  const grassPts = [];
  for (let i = 0; i < 70000; i++) {
    const a = rng.range(0, Math.PI * 2);
    const r = 4 + Math.pow(rng.next(), 0.9) * 42;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (x > CABIN.x0 - 1.2 && x < CABIN.x1 + 1.2 && z > -6.2 && z < CABIN.z1 + 1) continue;
    if (distToPolyline(x, z, TRAIL) < 0.7) continue;
    if (x > 6 && x < 11.5 && z > -2.5 && z < 3.5) continue;
    grassPts.push([x, z]);
  }
  const grass = new THREE.InstancedMesh(blade, grassMat, grassPts.length);
  {
    const d = new THREE.Object3D();
    const c = new THREE.Color();
    grassPts.forEach(([x, z], i) => {
      d.position.set(x, H(x, z) - 0.02, z);
      d.rotation.set(rng.range(-0.35, 0.35), rng.range(0, 6.28), rng.range(-0.35, 0.35));
      const s = rng.range(0.6, 1.5);
      d.scale.set(s, s * rng.range(0.8, 1.4), s);
      d.updateMatrix();
      grass.setMatrixAt(i, d.matrix);
      const v = rng.range(0.6, 1.25);
      const dryish = rng.next() < 0.25 ? 1.35 : 1;
      grass.setColorAt(i, c.setRGB(v * rng.range(0.9, 1.15) * dryish, v * (dryish > 1 ? 1.12 : 1), v * 0.75));
    });
  }
  grass.receiveShadow = true;
  grass.frustumCulled = false;
  g.add(grass);

  // --- Felsen ---
  const rockMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, envMapIntensity: 0.5 });
  const rocks = [];
  const addRock = (x, z, s, sy = 0.7, rot = 0, sink = 0.3) => {
    const m = new THREE.Mesh(rockGeometry(THREE, rng, terrain.noise), rockMat);
    m.position.set(x, H(x, z) - sink * s * sy, z);
    m.scale.set(s, s * sy, s * rng.range(0.8, 1.2));
    m.rotation.y = rot || rng.range(0, 6.28);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    rocks.push(m);
    return m;
  };
  // entlang des Pfads
  for (let i = 2; i < TRAIL.length; i++) {
    const [x, z] = TRAIL[i];
    addRock(x + rng.range(2.2, 4) * (i % 2 ? 1 : -1), z + rng.range(-1.5, 1.5), rng.range(0.4, 1.1));
  }
  // großer Fels in der Kurve vor dem Wasserfall (verdeckt das Ziel)
  const bigRock = addRock(BIG_ROCK.x, BIG_ROCK.z, BIG_ROCK.s, 1.0, 0.4, 0.25);
  // Becken- und Felswandsteine
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const rr = POOL.r + rng.range(0.4, 1.8);
    const x = POOL.x + Math.cos(a) * rr;
    const z = POOL.z + Math.sin(a) * rr;
    const toward = (Math.cos(a) * CLIFF_DIR[0] + Math.sin(a) * CLIFF_DIR[1]);
    if (toward < -0.7) continue; // Zugang frei lassen
    addRock(x, z, rng.range(0.7, 1.6) * (toward > 0.3 ? 1.5 : 1), 0.6);
  }
  for (let i = 0; i < 22; i++) {
    const lat = rng.range(-16, 16);
    const al = 9.5 + rng.range(-1.5, 1.2);
    const x = POOL.x + CLIFF_DIR[0] * al - CLIFF_DIR[1] * lat;
    const z = POOL.z + CLIFF_DIR[1] * al + CLIFF_DIR[0] * lat;
    if (Math.abs(lat) < 2.6) continue; // Fallrinne
    const m = addRock(x, z, rng.range(2.5, 4.5), rng.range(1.2, 2.2), 0, 0.1);
    m.position.y = H(x, z) - rng.range(2, 8);
  }
  // Aussichtspunkt: Felsplatte und Blöcke
  for (let i = 0; i < 14; i++) {
    const a = rng.range(0, Math.PI * 2);
    const r = rng.range(3, 14);
    addRock(SUMMIT.x + Math.cos(a) * r, SUMMIT.z + Math.sin(a) * r, rng.range(0.8, 2.4), 0.6);
  }
  const ledge = addRock(SUMMIT.x - 1.5, SUMMIT.z - 5, 3.2, 0.45, 0.3, 0.55);
  // verstreute Felsen am Wanderweg und auf der Wiese
  for (let i = 1; i < HIKE.length - 1; i++) addRock(HIKE[i][0] + rng.range(2, 4) * (i % 2 ? 1 : -1), HIKE[i][1] + rng.range(-2, 2), rng.range(0.6, 1.6));
  for (const [x, z, s] of [[-11, -14, 1.1], [9, -16, 0.9], [-18, -22, 1.4], [14, -26, 1.2], [-6, -19, 0.6]]) addRock(x, z, s);

  // --- Holzstapel + Hackklotz ---
  const woodTex = tex.bark();
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0xc9a27a, roughness: 0.9 });
  const endMat = new THREE.MeshStandardMaterial({ color: 0xc89a66, roughness: 0.8 });
  const logGeo = new THREE.CylinderGeometry(0.11, 0.12, 0.55, 9);
  logGeo.rotateX(Math.PI / 2);
  const pile = new THREE.InstancedMesh(logGeo, [woodMat, endMat, endMat], 120);
  {
    const d = new THREE.Object3D();
    let k = 0;
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 10 - (row % 2); col++) {
        if (k >= 120) break;
        d.position.set(WOODPILE.x - 1.1 + col * 0.235 + (row % 2) * 0.12, 0.12 + row * 0.205, WOODPILE.z + rng.range(-0.04, 0.04));
        d.rotation.set(0, rng.range(-0.08, 0.08), rng.range(0, 6.28));
        d.scale.setScalar(rng.range(0.9, 1.08));
        d.updateMatrix();
        pile.setMatrixAt(k++, d.matrix);
      }
    }
    pile.count = k;
  }
  pile.castShadow = true;
  pile.receiveShadow = true;
  g.add(pile);
  // Schutzdach über dem Stapel
  const shedMat = new THREE.MeshStandardMaterial({ color: 0x4b3a2c, roughness: 0.9 });
  for (const x of [WOODPILE.x - 1.35, WOODPILE.x + 1.25]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.6, 0.09), shedMat);
    p.position.set(x, 0.8, WOODPILE.z + 0.35);
    p.castShadow = true;
    g.add(p);
  }
  const shedRoof = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.06, 1.1), shedMat);
  shedRoof.position.set(WOODPILE.x - 0.05, 1.68, WOODPILE.z + 0.05);
  shedRoof.rotation.x = -0.18;
  shedRoof.castShadow = true;
  g.add(shedRoof);
  // lose Scheite (werden im Sturm aufgehoben)
  const loose = [];
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(logGeo, [woodMat, endMat, endMat]);
    m.position.set(WOODPILE.x + 0.3 + i * 0.28, 0.1, WOODPILE.z - 1.25 + (i % 2) * 0.15);
    m.rotation.y = 0.3 + i * 0.4;
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    loose.push(m);
  }
  const block = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.33, 0.5, 14), [woodMat, endMat, endMat]);
  block.position.set(WOODPILE.x + 1.8, 0.25, WOODPILE.z - 1.6);
  block.castShadow = true;
  g.add(block);
  const axe = new THREE.Group();
  axe.position.set(WOODPILE.x + 1.8, 0.52, WOODPILE.z - 1.6);
  axe.rotation.z = 0.5;
  g.add(axe);
  const ah = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.75, 8), new THREE.MeshStandardMaterial({ color: 0x9a7448, roughness: 0.7 }));
  ah.position.y = 0.37;
  axe.add(ah);
  const ab = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.025), new THREE.MeshStandardMaterial({ color: 0x555a5e, metalness: 0.8, roughness: 0.35 }));
  ab.position.set(0.05, 0.02, 0);
  axe.add(ab);

  // --- Garten: Hochbeete mit Salat, Kohl, Karotten, Tropfen ---
  const bedMat = new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 0.9 });
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x2a1d14, roughness: 1 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x5f9a35, roughness: 0.55, envMapIntensity: 0.8 });
  const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x3f6f3a, roughness: 0.5, envMapIntensity: 0.8 });
  const carrotTop = new THREE.MeshStandardMaterial({ color: 0x4f8a2a, roughness: 0.7 });
  const dropMat = new THREE.MeshStandardMaterial({ color: 0xdfeaf0, roughness: 0.02, metalness: 0.2, envMapIntensity: 2.5 });
  const plants = [];
  const carrots = [];
  for (let b = 0; b < 3; b++) {
    const bx = GARDEN.x - 1.5 + b * 1.5;
    const bed = new THREE.Group();
    bed.position.set(bx, 0, GARDEN.z);
    g.add(bed);
    for (const [w, d, x, z] of [[1.0, 0.06, 0, -1.2], [1.0, 0.06, 0, 1.2], [0.06, 2.4, -0.5, 0], [0.06, 2.4, 0.5, 0]]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.32, d), bedMat);
      m.position.set(x, 0.16, z);
      m.castShadow = true;
      m.receiveShadow = true;
      bed.add(m);
    }
    const soil = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.26, 2.34), soilMat);
    soil.position.y = 0.13;
    soil.receiveShadow = true;
    bed.add(soil);
    for (let k = 0; k < 6; k++) {
      const pz = -0.95 + k * 0.38;
      for (const px of [-0.22, 0.22]) {
        const p = new THREE.Group();
        p.position.set(px, 0.26, pz);
        bed.add(p);
        if (b === 1) {
          // Karotten: Kraut + orange Rübe (sichtbar beim Herausziehen)
          for (let f = 0; f < 6; f++) {
            const c = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.22, 4), carrotTop);
            c.position.set(rng.range(-0.02, 0.02), 0.11, rng.range(-0.02, 0.02));
            c.rotation.set(rng.range(-0.4, 0.4), 0, rng.range(-0.4, 0.4));
            p.add(c);
          }
          const root = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.16, 10), new THREE.MeshStandardMaterial({ color: 0xd8691e, roughness: 0.6 }));
          root.rotation.x = Math.PI;
          root.position.y = -0.08;
          p.add(root);
          carrots.push(p);
        } else {
          const n = 7;
          for (let f = 0; f < n; f++) {
            const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), b === 0 ? leafMat : leafMat2);
            const a = (f / n) * Math.PI * 2 + rng.range(-0.2, 0.2);
            leaf.position.set(Math.cos(a) * 0.05, 0.03, Math.sin(a) * 0.05);
            leaf.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7);
            leaf.scale.set(1, 0.5, 0.75);
            leaf.castShadow = true;
            p.add(leaf);
          }
          for (let dd = 0; dd < 3; dd++) {
            const drop = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 6), dropMat);
            const a = rng.range(0, 6.28);
            drop.position.set(Math.cos(a) * 0.07, 0.06, Math.sin(a) * 0.07);
            p.add(drop);
          }
        }
        plants.push({ p, ph: rng.range(0, 6.28) });
      }
    }
  }
  // Zaun um den Garten
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x8a7458, roughness: 0.95 });
  const fx0 = GARDEN.x - 2.6;
  const fx1 = GARDEN.x + 2.6;
  const fz0 = GARDEN.z - 2.0;
  const fz1 = GARDEN.z + 2.0;
  const fenceLine = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.ceil(len / 1.2);
    for (let i = 0; i <= n; i++) {
      const x = ax + ((bx - ax) * i) / n;
      const z = az + ((bz - az) * i) / n;
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.95, 0.07), fenceMat);
      p.position.set(x, 0.47, z);
      p.castShadow = true;
      g.add(p);
    }
    for (const y of [0.4, 0.8]) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, len), fenceMat);
      r.position.set((ax + bx) / 2, y, (az + bz) / 2);
      r.rotation.y = Math.atan2(bx - ax, bz - az);
      r.castShadow = true;
      g.add(r);
    }
  };
  fenceLine(fx0, fz0, fx1, fz0);
  fenceLine(fx1, fz0, fx1, fz1);
  fenceLine(fx1, fz1, fx0, fz1);
  fenceLine(fx0, fz1, fx0, fz0 + 1.2);
  // Gießkanne
  const can = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.26, 16), new THREE.MeshStandardMaterial({ color: 0x5a6b5e, metalness: 0.6, roughness: 0.4 }));
  can.position.set(GARDEN.x - 2.2, 0.13, GARDEN.z - 1.4);
  can.castShadow = true;
  g.add(can);
  // Korb (Ernte, Eier)
  const basket = new THREE.Group();
  const basketMat = new THREE.MeshStandardMaterial({ color: 0x9c7a46, roughness: 0.95 });
  const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.16, 18, 1, true), basketMat);
  bb.material.side = THREE.DoubleSide;
  bb.position.y = 0.08;
  basket.add(bb);
  const bbot = new THREE.Mesh(new THREE.CircleGeometry(0.16, 18).rotateX(-Math.PI / 2), basketMat);
  bbot.position.y = 0.01;
  basket.add(bbot);
  const bh = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.012, 6, 20, Math.PI), basketMat);
  bh.position.y = 0.16;
  basket.add(bh);
  basket.position.set(GARDEN.x - 1.05, 0.0, GARDEN.z - 1.6);
  basket.traverse((o) => o.isMesh && (o.castShadow = true));
  g.add(basket);

  // --- Hühnerstall + Hühner ---
  const coop = new THREE.Group();
  coop.position.set(COOP.x, 0, COOP.z);
  g.add(coop);
  const coopMat = new THREE.MeshStandardMaterial({ map: tex.planks([140, 70, 50], 7), roughness: 0.85 });
  const coopBox = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 1.4), coopMat);
  coopBox.position.y = 0.9;
  coopBox.castShadow = true;
  coopBox.receiveShadow = true;
  coop.add(coopBox);
  for (const [x, z] of [[-0.85, -0.65], [0.85, -0.65], [-0.85, 0.65], [0.85, 0.65]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), shedMat);
    leg.position.set(x, 0.15, z);
    coop.add(leg);
  }
  const coopRoof = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 1.75), new THREE.MeshStandardMaterial({ color: 0x3e3a36, roughness: 0.8 }));
  coopRoof.position.y = 1.58;
  coopRoof.rotation.x = 0.22;
  coopRoof.castShadow = true;
  coop.add(coopRoof);
  // Nestkasten mit Klappe an der Vorderseite (−z)
  const nest = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.45), coopMat);
  nest.position.set(0.3, 0.85, -0.9);
  nest.castShadow = true;
  coop.add(nest);
  const nestIn = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.38), new THREE.MeshStandardMaterial({ color: 0xc9b06a, roughness: 1 }));
  nestIn.position.set(0.3, 0.86, -0.92);
  coop.add(nestIn);
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0.3, 1.075, -0.68);
  coop.add(lidPivot);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.04, 0.5), coopMat);
  lid.position.z = -0.25;
  lid.castShadow = true;
  lidPivot.add(lid);
  const eggMat = new THREE.MeshStandardMaterial({ color: 0xc8956a, roughness: 0.45 });
  const eggs = [];
  for (let i = 0; i < 3; i++) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.028, 14, 10), eggMat);
    e.scale.set(1, 1.3, 1);
    e.position.set(0.15 + i * 0.13, 0.92, -0.92 + (i % 2) * 0.05);
    e.castShadow = true;
    coop.add(e);
    eggs.push(e);
  }
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 1.0), coopMat);
  ramp.position.set(-0.5, 0.35, -1.05);
  ramp.rotation.x = 0.55;
  coop.add(ramp);
  // Auslauf-Zaun (Pfosten + feines Drahtgeflecht als halbtransparente Fläche)
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false, roughness: 0.6, metalness: 0.5 });
  const runX0 = COOP.x - 2.6;
  const runX1 = COOP.x + 1.3;
  const runZ0 = COOP.z - 4.2;
  const runZ1 = COOP.z - 0.9;
  for (const [ax, az, bx, bz] of [[runX0, runZ0, runX1, runZ0], [runX0, runZ0, runX0, runZ1], [runX1, runZ0, runX1, runZ1]]) {
    const len = Math.hypot(bx - ax, bz - az);
    const w = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.9), wireMat);
    w.position.set((ax + bx) / 2, 0.45, (az + bz) / 2);
    w.rotation.y = Math.atan2(bz - az, bx - ax) * -1;
    g.add(w);
    const n = Math.ceil(len / 1.3);
    for (let i = 0; i <= n; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.0, 0.05), fenceMat);
      p.position.set(ax + ((bx - ax) * i) / n, 0.5, az + ((bz - az) * i) / n);
      p.castShadow = true;
      g.add(p);
    }
  }
  const chickens = [];
  const hen = (col) => {
    const c = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), m);
    body.scale.set(0.8, 0.85, 1.15);
    body.position.y = 0.22;
    body.castShadow = true;
    c.add(body);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 8), m);
    tail.position.set(0, 0.32, -0.17);
    tail.rotation.x = -0.9;
    c.add(tail);
    const neck = new THREE.Group();
    neck.position.set(0, 0.3, 0.12);
    c.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), m);
    head.position.set(0, 0.1, 0.04);
    neck.add(head);
    const comb = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.05, 0.07), new THREE.MeshStandardMaterial({ color: 0xc0201a, roughness: 0.6 }));
    comb.position.set(0, 0.16, 0.04);
    neck.add(comb);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.045, 6), new THREE.MeshStandardMaterial({ color: 0xd8a030, roughness: 0.5 }));
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.1, 0.11);
    neck.add(beak);
    for (const s of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 5), new THREE.MeshStandardMaterial({ color: 0xd8a030 }));
      leg.position.set(s * 0.045, 0.06, 0);
      c.add(leg);
    }
    g.add(c);
    return { c, neck };
  };
  const henCols = [0x8a4a22, 0xe8e0d0, 0x6a3a1a, 0xa86030, 0xf0ece4];
  for (let i = 0; i < 5; i++) {
    const h = hen(henCols[i]);
    chickens.push({ ...h, cx: runX0 + 0.7 + i * 0.65, cz: runZ0 + 0.8 + (i % 3) * 0.8, ph: rng.range(0, 6.28), sp: rng.range(0.3, 0.6) });
  }

  // --- Spuren (Hirsch) im weichen Boden entlang des Pfads ---
  const mudMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.45, envMapIntensity: 0.9, polygonOffset: true, polygonOffsetFactor: -2, transparent: true, opacity: 0.85, alphaMap: tex.mudMask(), depthWrite: false });
  const printMat = new THREE.MeshStandardMaterial({ color: 0x120c08, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -4 });
  const tracks = new THREE.Group();
  g.add(tracks);
  const hoof = new THREE.CircleGeometry(0.045, 12);
  hoof.rotateX(-Math.PI / 2);
  hoof.scale(1, 1, 1.7);
  let acc = 0;
  for (let i = 1; i < 6; i++) {
    const [ax, az] = TRAIL[i - 1];
    const [bx, bz] = TRAIL[i];
    const len = Math.hypot(bx - ax, bz - az);
    const dir = Math.atan2(bx - ax, bz - az);
    // nasser Streifen
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.55, len + 0.3, 4, 8), mudMat);
    strip.rotation.x = -Math.PI / 2;
    strip.rotation.z = -dir;
    const mx = (ax + bx) / 2;
    const mz = (az + bz) / 2;
    strip.position.set(mx, H(mx, mz) + 0.03, mz);
    strip.receiveShadow = true;
    tracks.add(strip);
    for (let s = 0.4; s < len; s += 0.62) {
      const side = (Math.floor((acc + s) / 0.62) % 2 ? 1 : -1) * 0.11;
      const x = ax + ((bx - ax) * s) / len + Math.cos(dir) * side;
      const z = az + ((bz - az) * s) / len - Math.sin(dir) * side;
      for (const k of [-1, 1]) {
        const p = new THREE.Mesh(hoof, printMat);
        p.position.set(x + Math.cos(dir) * k * 0.028, H(x, z) + 0.045, z - Math.sin(dir) * k * 0.028);
        p.rotation.y = dir + k * 0.12;
        tracks.add(p);
      }
    }
    acc += len;
  }

  return { group: g, uniforms, treeMat, grassMat, rockMat, leafMat, bigRock, ledge, loose, plants, carrots, eggs, lidPivot, chickens, coop, basket, tracks, mudMat, pile };
}
