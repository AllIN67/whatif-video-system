// Technische Testszene der Render-Pipeline (abstrakt, kein Inhaltsvideo).
// Regel: jeder sichtbare Zustand ist eine reine Funktion von state.t – kein Zustand zwischen Frames.
const IMPACT = [0, 0, -20];
const T_IGNITE = 4.0;
const T_IMPACT = 8.0;
const T_SKY = 26.0;
const T_RISE = 44.0;
const T_WAVE2 = 50.0;
const T_LIFT = 53.0;
const WAVE_SPEED = 26; // m/s (Szenenmaßstab)

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

// Abstand eines Punkts (x,z) zur Strecke a→b in der Grundebene
function distToSegment(x, z, a, b) {
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];
  const L = dx * dx + dz * dz;
  const u = L > 0 ? clamp01(((x - a[0]) * dx + (z - a[2]) * dz) / L) : 0;
  return Math.hypot(x - (a[0] + u * dx), z - (a[2] + u * dz));
}

export async function build({ THREE, scene, rng, timeline }) {
  // Freiräume: Kamerapositionen und bodennahe Sichtlinien zum Blickziel bleiben ohne Blöcke
  const corridors = [];
  for (const s of timeline.shots) {
    for (const k of s.camKeys) {
      if (k.pos[1] < 20) corridors.push([k.pos, k.look]);
    }
    for (let i = 1; i < s.camKeys.length; i++) corridors.push([s.camKeys[i - 1].pos, s.camKeys[i].pos]);
  }
  const blocked = (x, z) => corridors.some(([a, b]) => distToSegment(x, z, a, b) < 6.5);
  const C = (h) => new THREE.Color(h);
  const skyDay = C(0x9cc3e6);
  const skyOrange = C(0xf2a65a);
  const skyDusk = C(0x6f7fb0);
  scene.background = skyDay.clone();
  scene.fog = new THREE.Fog(skyDay.clone(), 60, 260);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x4a5a46, 1.25);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff3e0, 2.3);
  sun.position.set(40, 70, 30);
  sun.target.position.set(0, 0, -20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 1, far: 260 });
  sun.shadow.bias = -0.0006;
  scene.add(sun, sun.target);

  // Boden unterteilt (10-m-Felder): riesige Dreiecke führten bei einzelnen Kameraposen zu falschen Schatten (Frame 566)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800, 80, 80), new THREE.MeshStandardMaterial({ color: 0x7d9a62, flatShading: true }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Stadtraster aus Blöcken; Mitte (Einschlagstelle) bleibt frei
  const palette = [0xe8c39e, 0xd99a8c, 0xa9c3d9, 0xc7d6a3, 0xe3d7b8, 0xb7a7cf, 0x9fc9bf];
  const blocks = [];
  for (let i = -9; i <= 9; i++) {
    for (let j = -9; j <= 9; j++) {
      const x = i * 7 + rng.range(-1, 1);
      const z = -20 + j * 7 + rng.range(-1, 1);
      const d = Math.hypot(x - IMPACT[0], z - IMPACT[2]);
      if (d < 11 || blocked(x, z)) continue;
      const h = rng.range(3, 14) * (d < 30 ? 0.8 : 1);
      const w = rng.range(3.2, 5);
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), new THREE.MeshStandardMaterial({ color: rng.pick(palette), flatShading: true }));
      m.position.set(x, h / 2, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
      blocks.push({ m, h, d, phase: rng.range(0, Math.PI * 2), lift: rng.range(4, 10) });
    }
  }

  // Sonde
  const probeMat = new THREE.MeshStandardMaterial({ color: 0xff6b35, emissive: 0xff5a1f, emissiveIntensity: 0.0, flatShading: true });
  const probe = new THREE.Mesh(new THREE.IcosahedronGeometry(3, 1), probeMat);
  probe.castShadow = true;
  scene.add(probe);
  const glow = new THREE.PointLight(0xff7a3a, 0, 60, 1.6);
  scene.add(glow);

  // Druckwellen-Ringe
  const ringMat = (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const ring1 = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 96), ringMat(0xfff1d6));
  const ring2 = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 96), ringMat(0xffe0f0));
  for (const r of [ring1, ring2]) {
    r.rotation.x = -Math.PI / 2;
    r.position.set(IMPACT[0], 0.15, IMPACT[2]);
    scene.add(r);
  }

  // Trümmer: ballistische Bahnen aus festem Seed (InstancedMesh)
  const N = 260;
  const debris = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(0.45), new THREE.MeshStandardMaterial({ color: 0x5b4a42, flatShading: true }), N);
  debris.castShadow = true;
  const parts = [];
  for (let k = 0; k < N; k++) {
    const a = rng.range(0, Math.PI * 2);
    const sp = rng.range(6, 22);
    parts.push({ vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: rng.range(8, 26), rx: rng.range(-6, 6), ry: rng.range(-6, 6), s: rng.range(0.5, 1.6) });
  }
  scene.add(debris);
  const dummy = new THREE.Object3D();

  const tmpColor = new THREE.Color();
  return {
    update({ t }) {
      // Himmel/Licht: Tag → Orange (26–34 s) → Dämmerung (54–62 s), weich (Blitzregel)
      const kSky = smooth((t - T_SKY) / 8);
      const kDusk = smooth((t - 54) / 8);
      tmpColor.copy(skyDay).lerp(skyOrange, kSky).lerp(skyDusk, kDusk);
      scene.background.copy(tmpColor);
      scene.fog.color.copy(tmpColor);
      hemi.intensity = 1.25 + 0.35 * smooth((t - 20) / 6) - 0.3 * kDusk;
      sun.color.setHex(0xfff3e0).lerp(C(0xffb070), kSky);

      // Sonde: Fall (0–8 s, beschleunigt), liegt glühend, hebt ab 53 s wieder ab
      let py;
      if (t < T_IMPACT) py = 3 + 300 * Math.pow(1 - t / T_IMPACT, 3);
      else if (t < T_LIFT) py = 3;
      else py = 3 + 6 * Math.pow(t - T_LIFT, 2);
      probe.position.set(IMPACT[0], py, IMPACT[2]);
      probe.rotation.set(t * 0.6, t * 0.9, 0);
      const ignite = smooth((t - T_IGNITE) / 1.2);
      const pulse = t >= T_IMPACT ? 0.5 + 0.5 * Math.sin((t - T_IMPACT) * 3.0) : 0;
      probeMat.emissiveIntensity = 0.15 + 1.4 * ignite + 0.6 * pulse;
      glow.position.copy(probe.position);
      glow.intensity = 30 * ignite + (t >= T_IMPACT ? 260 * Math.exp(-(t - T_IMPACT) * 1.5) : 0);

      // Ringe
      const r1 = t >= T_IMPACT ? (t - T_IMPACT) * WAVE_SPEED : 0;
      ring1.scale.setScalar(Math.max(0.01, r1));
      ring1.material.opacity = t >= T_IMPACT ? 0.85 * Math.exp(-(t - T_IMPACT) / 6) : 0;
      const r2 = t >= T_WAVE2 ? (t - T_WAVE2) * WAVE_SPEED * 1.2 : 0;
      ring2.scale.setScalar(Math.max(0.01, r2));
      ring2.material.opacity = t >= T_WAVE2 ? 0.8 * Math.exp(-(t - T_WAVE2) / 4) : 0;

      // Blöcke: federn, wenn eine Welle sie erreicht; heben ab 44 s ab
      const rise = smooth((t - T_RISE) / 5);
      const settle = smooth((t - 56) / 5);
      for (const b of blocks) {
        let y = 0;
        const tw1 = T_IMPACT + b.d / WAVE_SPEED;
        if (t > tw1) y += 1.6 * Math.exp(-(t - tw1) * 2.2) * Math.abs(Math.sin((t - tw1) * 9));
        const tw2 = T_WAVE2 + b.d / (WAVE_SPEED * 1.2);
        if (t > tw2) y += 1.2 * Math.exp(-(t - tw2) * 2.0) * Math.abs(Math.sin((t - tw2) * 9));
        y += b.lift * rise * (1 - settle) * (0.85 + 0.15 * Math.sin(t * 1.3 + b.phase));
        b.m.position.y = b.h / 2 + y;
      }

      // Trümmer ab Einschlag (Schwerkraft 9,81), bleiben am Boden liegen
      for (let k = 0; k < N; k++) {
        const p = parts[k];
        const dt = t - T_IMPACT;
        if (dt < 0) {
          dummy.position.set(0, -50, 0);
        } else {
          const tLand = (2 * p.vy) / 9.81;
          const tt = Math.min(dt, tLand);
          dummy.position.set(IMPACT[0] + p.vx * tt, Math.max(0.2, 1 + p.vy * tt - 0.5 * 9.81 * tt * tt), IMPACT[2] + p.vz * tt);
          dummy.rotation.set(p.rx * tt, p.ry * tt, 0);
        }
        dummy.scale.setScalar(p.s);
        dummy.updateMatrix();
        debris.setMatrixAt(k, dummy.matrix);
      }
      debris.instanceMatrix.needsUpdate = true;
    },
  };
}
