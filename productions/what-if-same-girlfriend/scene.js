// What if every man had the same girlfriend? – 3D-Szene.
// Fünf Schauplätze in einer Szene, im Raum getrennt (x-Versatz); pro Einstellung ist genau einer sichtbar.
// Regel: jeder sichtbare Zustand ist eine reine Funktion von t – kein Zustand zwischen Frames.
const ORIGIN = { S: 0, C: 400, P: 800, R: 1200, A: 1600 };
const SET_OF = {
  s01_queue: 'S', s01b_door: 'S', s02_cabin: 'C', s03_pier: 'P', s04_restaurant: 'R', s05_flood: 'A', s06_crowd: 'S',
  s07_window: 'A', s08_friends: 'R', s09_alone: 'A', s10_off: 'A', s11_lightsout: 'S', s12_walk: 'S', s13_away: 'S',
};

// Signalfarbe (identisch mit brand.json): Noras Jacke, ihre Nachrichten, das Leuchten der Handys
const CORAL = 0xff5a72;
const DOOR = [-8.5, 0, 0]; // Noras Haustür (Straße)

// Zeiten (müssen zu timeline.json passen)
const T = {
  doorOpen: 3.966667, phonesOn: 6.5, pierPhone: 10.0, flood: 18.8, collapse: 22.6, crowd: 24.5, curtain: 31.3,
  ping: 35.0, phoneOff: 45.0, wave: 49.4, walk0: 53.5, pointe: 56.2,
};
const WALK = { x: -5.25, z0: 1.0, v: 1.29, w: Math.PI / (16 / 30) }; // 16 Frames pro Schritt
const WAVE_SPEED = 14; // m/s, Ausbreitung des Erlöschens

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const ramp = (t, a, b) => smooth((t - a) / (b - a));
const lerp = (a, b, x) => a + (b - a) * x;

export async function build({ THREE, scene, rng, renderer }) {
  const C = (h) => new THREE.Color(h);
  const geoCache = new Map();
  const G = (key, make) => {
    if (!geoCache.has(key)) geoCache.set(key, make());
    return geoCache.get(key);
  };
  const M = (color, o = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.8, metalness: o.m ?? 0, emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1, transparent: !!o.op, opacity: o.op ?? 1 });
  const basic = (color, o = {}) => new THREE.MeshBasicMaterial({ color, transparent: !!o.op, opacity: o.op ?? 1, fog: o.fog ?? true });
  const glowMat = (color, op) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false });
  const mesh = (geo, mat, parent, x = 0, y = 0, z = 0, o = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = o.cast ?? true;
    m.receiveShadow = o.recv ?? false;
    if (parent) parent.add(m);
    return m;
  };
  const box = (w, h, d, mat, parent, x, y, z, o = {}) => mesh(new THREE.BoxGeometry(w, h, d, o.sx ?? 1, o.sy ?? 1, o.sz ?? 1), mat, parent, x, y, z, o);
  const ground = (w, d, mat, parent, x, y, z, seg = 2) => {
    const g = new THREE.PlaneGeometry(w, d, Math.max(1, Math.ceil(w / seg)), Math.max(1, Math.ceil(d / seg)));
    const m = mesh(g, mat, parent, x, y, z, { cast: false, recv: true });
    m.rotation.x = -Math.PI / 2;
    return m;
  };

  const sets = {};
  for (const k of Object.keys(ORIGIN)) {
    const g = new THREE.Group();
    g.position.x = ORIGIN[k];
    g.visible = false;
    scene.add(g);
    sets[k] = g;
  }

  // ---------------------------------------------------------------- Himmel (Verlauf + Leuchten am Horizont)
  function makeSky(parent, r) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { top: { value: C(0x000000) }, mid: { value: C(0x000000) }, bot: { value: C(0x000000) }, glowCol: { value: C(0x000000) }, glowDir: { value: new THREE.Vector3(0, 0, 1) }, glowAmt: { value: 0 } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bot; uniform vec3 glowCol; uniform vec3 glowDir; uniform float glowAmt; varying vec3 vDir;
        void main(){ vec3 d = normalize(vDir); float h = d.y;
          vec3 c = h > 0.0 ? mix(mid, top, pow(clamp(h * 1.6, 0.0, 1.0), 0.7)) : mix(mid, bot, clamp(-h * 4.0, 0.0, 1.0));
          float g = max(dot(d, normalize(glowDir)), 0.0);
          c += glowCol * glowAmt * pow(g, 5.0) * (1.0 - clamp(h * 2.2, 0.0, 1.0));
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24), mat);
    m.renderOrder = -10;
    m.castShadow = false;
    parent.add(m);
    return mat.uniforms;
  }
  const skyU = {};
  skyU.S = makeSky(sets.S, 260);
  skyU.C = makeSky(sets.C, 120);
  skyU.P = makeSky(sets.P, 300);
  skyU.R = makeSky(sets.R, 120);
  skyU.A = makeSky(sets.A, 160);

  // ---------------------------------------------------------------- Figuren (Einzelfiguren mit Gelenken)
  const PALETTE_TOP = [0x2c3a52, 0x3a3f45, 0x4d5a3a, 0x5a3a33, 0x7a6a55, 0x384b63, 0x5d5f62, 0x2f4a48, 0x6b5640, 0x45384f, 0x8a8d90, 0x253041];
  const PALETTE_BOTTOM = [0x23262c, 0x2f3540, 0x3b3a36, 0x464b52, 0x2a2f3a, 0x514636];
  const SKIN = [0xf1c8a8, 0xe0ac86, 0xc68a62, 0xa36a45, 0x7d4c31, 0x5a3624];
  const HAIR = [0x1f1611, 0x3b2a1e, 0x5a4330, 0x7a6a5a, 0x2a2420, 0x15110e];

  function person(o) {
    const k = (o.height ?? 1.76) / 1.76;
    const w = o.width ?? 1;
    const root = new THREE.Group();
    const hips = new THREE.Group();
    hips.position.y = 0.92 * k;
    root.add(hips);
    const chest = new THREE.Group();
    hips.add(chest);
    const topM = M(o.top, { r: o.topR ?? 0.85 });
    const botM = M(o.bottom, { r: 0.85 });
    const skinM = M(o.skin, { r: 0.6 });
    const shoeM = M(o.shoes ?? 0x18181a, { r: 0.55 });
    const hairM = M(o.hairColor ?? 0x241a14, { r: 0.7 });
    const sleeve = o.shortSleeves ? skinM : topM;
    const cap = (r, l) => G(`cap${r.toFixed(3)}_${l.toFixed(3)}`, () => new THREE.CapsuleGeometry(r, l, 4, 12));
    const sph = (r) => G(`sph${r.toFixed(3)}`, () => new THREE.SphereGeometry(r, 18, 12));
    mesh(sph(0.15 * k), botM, hips, 0, 0.0, 0).scale.set(1.05 * w, 0.75, 0.75);
    const torso = mesh(cap(0.16 * k, 0.34 * k), topM, chest, 0, 0.3 * k, 0);
    torso.scale.set(w, 1, 0.7);
    mesh(G(`neck${k}`, () => new THREE.CylinderGeometry(0.048 * k, 0.052 * k, 0.12 * k, 10)), skinM, chest, 0, 0.62 * k, 0);
    const head = new THREE.Group();
    head.position.y = 0.66 * k;
    chest.add(head);
    const skull = mesh(sph(0.115 * k), skinM, head, 0, 0.115 * k, 0.0);
    skull.scale.set(0.9, 1.06, 0.98);
    // Nase als Blickrichtungs-Hinweis (sehr klein)
    mesh(G('nose', () => new THREE.SphereGeometry(0.022, 8, 6)), skinM, head, 0, 0.1 * k, 0.11 * k, { cast: false });
    const capGeo = (r, th) => G(`hc${r.toFixed(3)}_${th}`, () => new THREE.SphereGeometry(r, 18, 10, 0, Math.PI * 2, 0, Math.PI * th));
    if (o.hair === 'short' || o.hair === 'bob') {
      const hc = mesh(capGeo(0.122 * k, o.hair === 'bob' ? 0.6 : 0.5), hairM, head, 0, 0.125 * k, -0.01 * k);
      hc.rotation.x = -0.45;
      hc.scale.set(0.95, 1.05, 1.02);
    }
    if (o.hair === 'bob') {
      const back = mesh(cap(0.1 * k, 0.12 * k), hairM, head, 0, 0.06 * k, -0.055 * k);
      back.scale.set(1.25, 1, 0.75);
      for (const sx of [-1, 1]) mesh(cap(0.04 * k, 0.12 * k), hairM, head, sx * 0.095 * k, 0.07 * k, 0.005, {}).rotation.z = sx * 0.12;
    }
    if (o.hair === 'beanie') {
      const b = mesh(capGeo(0.128 * k, 0.48), M(o.hatColor ?? 0x6b5a2a), head, 0, 0.13 * k, -0.005);
      b.rotation.x = -0.3;
    }
    if (o.hair === 'straw') {
      const hm = M(0xd8c27a, { r: 0.9 });
      mesh(G('brim', () => new THREE.CylinderGeometry(0.26, 0.27, 0.015, 24)), hm, head, 0, 0.2 * k, 0);
      mesh(G('crown', () => new THREE.CylinderGeometry(0.1, 0.125, 0.11, 18)), hm, head, 0, 0.26 * k, 0);
    }
    if (o.beard) {
      const bd = mesh(sph(0.1 * k), hairM, head, 0, 0.055 * k, 0.035 * k);
      bd.scale.set(0.95, 0.75, 0.85);
    }
    const sh = [];
    const el = [];
    const hand = [];
    for (const sx of [1, -1]) {
      const s = new THREE.Group();
      s.position.set(sx * 0.205 * k * w, 0.52 * k, 0);
      chest.add(s);
      mesh(cap(0.052 * k, 0.2 * k), sleeve === skinM ? topM : topM, s, 0, -0.14 * k, 0);
      const e = new THREE.Group();
      e.position.y = -0.29 * k;
      s.add(e);
      mesh(cap(0.045 * k, 0.19 * k), sleeve, e, 0, -0.13 * k, 0);
      const h = new THREE.Group();
      h.position.y = -0.27 * k;
      e.add(h);
      mesh(sph(0.046 * k), skinM, h, 0, 0, 0);
      sh.push(s);
      el.push(e);
      hand.push(h);
    }
    const hip = [];
    const knee = [];
    for (const sx of [1, -1]) {
      const hp = new THREE.Group();
      hp.position.set(sx * 0.09 * k * w, -0.02 * k, 0);
      hips.add(hp);
      mesh(cap(0.07 * k, 0.3 * k), botM, hp, 0, -0.21 * k, 0);
      const kn = new THREE.Group();
      kn.position.y = -0.44 * k;
      hp.add(kn);
      mesh(cap(0.058 * k, 0.3 * k), botM, kn, 0, -0.2 * k, 0);
      mesh(G(`foot${k}`, () => new THREE.BoxGeometry(0.095 * k, 0.07 * k, 0.24 * k)), shoeM, kn, 0, -0.43 * k, 0.05 * k);
      hip.push(hp);
      knee.push(kn);
    }
    if (o.parent) o.parent.add(root);
    const p = {
      root, hips, chest, head, sh, el, hand, hip, knee, k,
      pose(q) {
        chest.rotation.set(q.lean ?? 0, q.twist ?? 0, q.side ?? 0);
        head.rotation.set(q.hp ?? 0, q.hy ?? 0, q.hr ?? 0);
        const aL = q.aL ?? [0, 0, 0.06];
        const aR = q.aR ?? [0, 0, -0.06];
        sh[0].rotation.set(aL[0], aL[1] ?? 0, aL[2] ?? 0.06);
        sh[1].rotation.set(aR[0], aR[1] ?? 0, aR[2] ?? -0.06);
        el[0].rotation.set(q.eL ?? -0.1, 0, 0);
        el[1].rotation.set(q.eR ?? -0.1, 0, 0);
        hip[0].rotation.set(q.lL ?? 0, 0, q.lLz ?? 0);
        hip[1].rotation.set(q.lR ?? 0, 0, q.lRz ?? 0);
        knee[0].rotation.set(q.kL ?? 0, 0, 0);
        knee[1].rotation.set(q.kR ?? 0, 0, 0);
        hips.position.y = 0.92 * k + (q.bob ?? 0);
      },
    };
    p.pose({});
    return p;
  }
  // Gehzyklus: Phase ph; Fersenaufsatz bei ph = π/2 + nπ
  const walkPose = (ph, a = 1) => {
    const s = Math.sin(ph);
    const c = Math.cos(ph);
    return {
      lL: -0.42 * s * a, lR: 0.42 * s * a,
      kL: (0.08 + 0.75 * Math.max(0, c)) * a, kR: (0.08 + 0.75 * Math.max(0, -c)) * a,
      aL: [0.32 * s * a, 0, 0.07], aR: [-0.32 * s * a, 0, -0.07], eL: -0.25, eR: -0.25,
      bob: (0.028 * Math.abs(c) - 0.014) * a,
    };
  };
  const SIT = { lL: -1.52, lR: -1.52, kL: 1.5, kR: 1.5 };

  // Handy (Einzelfigur): Gehäuse + Bildschirm (leuchtet koralle) + Lichthof
  const screenOn = basic(CORAL, { fog: true });
  const screenOff = basic(0x0c0e13);
  function phone(parent, x = 0, y = 0, z = 0) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    box(0.075, 0.15, 0.012, M(0x15161a, { r: 0.4, m: 0.3 }), g, 0, 0, 0);
    const scr = mesh(G('scr', () => new THREE.PlaneGeometry(0.066, 0.135)), screenOff, g, 0, 0, 0.0065, { cast: false });
    const halo = mesh(G('halo', () => new THREE.SphereGeometry(1, 16, 10)), glowMat(CORAL, 0.0), g, 0, 0, 0.03, { cast: false });
    halo.scale.setScalar(0.075);
    return {
      g,
      set(on) {
        scr.material = on > 0.5 ? screenOn : screenOff;
        halo.material.opacity = 0.32 * on;
        halo.visible = on > 0.01;
      },
    };
  }

  // ---------------------------------------------------------------- Menge (Instanzen)
  // Jede Person: 2 Beine, Rumpf, Kopf, Haarkappe, Arm links (hängend), Arm rechts (beweglich), Gegenstand (Rose/Handy).
  function crowd(parent, people, { item, shadows = true }) {
    const N = people.length;
    const std = () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
    const parts = {
      leg: new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.072, 0.66, 2, 6), std(), N * 2),
      torso: new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.16, 0.34, 3, 8), std(), N),
      head: new THREE.InstancedMesh(new THREE.SphereGeometry(0.115, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), N),
      hair: new THREE.InstancedMesh(new THREE.SphereGeometry(0.122, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), std(), N),
      armL: new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.05, 0.5, 2, 6), std(), N),
      armR: new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.05, 0.5, 2, 6), std(), N),
    };
    if (item === 'rose') {
      parts.item = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.055, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 }), N);
      parts.stem = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.007, 0.007, 0.34, 5), new THREE.MeshStandardMaterial({ color: 0x2f5a2a }), N);
    } else {
      parts.item = new THREE.InstancedMesh(new THREE.BoxGeometry(0.075, 0.15, 0.014), new THREE.MeshBasicMaterial({ color: 0xffffff }), N);
      parts.glow = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshBasicMaterial({ color: CORAL, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }), N);
      parts.glow.castShadow = false;
    }
    for (const [name, m] of Object.entries(parts)) {
      m.castShadow = shadows && name !== 'glow';
      m.receiveShadow = false;
      m.frustumCulled = false;
      parent.add(m);
    }
    const col = new THREE.Color();
    people.forEach((p, i) => {
      parts.leg.setColorAt(2 * i, col.setHex(p.bottom));
      parts.leg.setColorAt(2 * i + 1, col.setHex(p.bottom));
      parts.torso.setColorAt(i, col.setHex(p.top));
      parts.armL.setColorAt(i, col.setHex(p.top));
      parts.armR.setColorAt(i, col.setHex(p.top));
      parts.head.setColorAt(i, col.setHex(p.skin));
      parts.hair.setColorAt(i, col.setHex(p.hair));
      if (item === 'rose') {
        parts.item.setColorAt(i, col.setHex(0xb3122a));
        parts.stem.setColorAt(i, col.setHex(0x2f5a2a));
      } else parts.item.setColorAt(i, col.setHex(CORAL));
    });
    const B = new THREE.Matrix4();
    const L = new THREE.Matrix4();
    const out = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const v = new THREE.Vector3();
    const s1 = new THREE.Vector3(1, 1, 1);
    const set = (m, i, mat) => m.setMatrixAt(i, mat);
    const local = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
      e.set(rx, ry, rz);
      q.setFromEuler(e);
      return L.compose(v.set(x, y, z), q, s1.set(sx, sy, sz));
    };
    const SH = 1.44;
    // st: (i) → { yaw, hy (Kopf), arm (Vorwärtswinkel rechter Arm), on (0..1 Bildschirm), dx, dz, bob }
    return {
      parts,
      update(st) {
        for (let i = 0; i < N; i++) {
          const p = people[i];
          const s = st(i, p);
          e.set(0, s.yaw ?? p.yaw, 0);
          q.setFromEuler(e);
          B.compose(v.set(p.x + (s.dx ?? 0), (p.y ?? 0) + (s.bob ?? 0), p.z + (s.dz ?? 0)), q, s1.set(p.k, p.k, p.k));
          set(parts.leg, 2 * i, out.multiplyMatrices(B, local(0.09, 0.45, 0)));
          set(parts.leg, 2 * i + 1, out.multiplyMatrices(B, local(-0.09, 0.45, 0)));
          set(parts.torso, i, out.multiplyMatrices(B, local(0, 1.22, 0, 0, 0, 0, 1, 1, 0.7)));
          set(parts.head, i, out.multiplyMatrices(B, local(0, 1.71, 0, 0, s.hy ?? 0, 0, 0.9, 1.06, 0.98)));
          set(parts.hair, i, out.multiplyMatrices(B, local(0, 1.72, 0, -0.45, s.hy ?? 0, 0, p.hairOn ? 0.95 : 0.0001, p.hairOn ? 1.05 : 0.0001, 1)));
          set(parts.armL, i, out.multiplyMatrices(B, local(0.205, SH - 0.29, 0, 0, 0, 0.07)));
          // rechter Arm: Drehpunkt Schulter, Winkel nach vorn (negativ = nach vorn/oben)
          const a = s.arm;
          const ca = Math.cos(a);
          const sa = Math.sin(a);
          set(parts.armR, i, out.multiplyMatrices(B, local(-0.205, SH - 0.29 * ca, -0.29 * sa, a, 0, 0)));
          const hx = -0.205;
          const hy = SH - 0.6 * ca;
          const hz = -0.6 * sa;
          if (item === 'rose') {
            set(parts.stem, i, out.multiplyMatrices(B, local(hx + 0.02, hy + 0.1, hz + 0.03, 0.25, 0, 0)));
            set(parts.item, i, out.multiplyMatrices(B, local(hx + 0.02, hy + 0.27, hz + 0.075)));
          } else {
            set(parts.item, i, out.multiplyMatrices(B, local(hx, hy + 0.05, hz + 0.02, a + Math.PI / 2 + 0.2, 0, 0)));
            const on = s.on ?? 0;
            set(parts.glow, i, out.multiplyMatrices(B, local(hx, hy + 0.05, hz + 0.04, 0, 0, 0, 0.26 * on + 1e-4, 0.26 * on + 1e-4, 0.26 * on + 1e-4)));
          }
        }
        for (const m of Object.values(parts)) m.instanceMatrix.needsUpdate = true;
      },
      setItemColor(i, hex) {
        parts.item.setColorAt(i, col.setHex(hex));
        parts.item.instanceColor.needsUpdate = true;
      },
    };
  }
  const randPerson = (o = {}) => ({
    top: rng.pick(PALETTE_TOP), bottom: rng.pick(PALETTE_BOTTOM), skin: rng.pick(SKIN), hair: rng.pick(HAIR),
    hairOn: rng.next() < 0.82, k: rng.range(0.94, 1.08), phase: rng.range(0, Math.PI * 2), ...o,
  });

  // ================================================================ SET S – Straße bei Dämmerung
  const S = sets.S;
  {
    ground(26, 320, M(0x2b2e34, { r: 0.92 }), S, 0, 0, 90, 4);
    const walk = M(0x5f5c58, { r: 0.95 });
    for (const sx of [-1, 1]) {
      const sw = box(4.6, 0.16, 320, walk, S, sx * 6.7, 0.08, 90, { sz: 32, sx: 2, recv: true, cast: false });
      sw.receiveShadow = true;
      box(0.18, 0.17, 320, M(0x77736d), S, sx * 4.45, 0.085, 90, { sz: 32, cast: false, recv: true });
    }
    // Mittellinie
    const dash = new THREE.InstancedMesh(new THREE.BoxGeometry(0.14, 0.01, 2.4), M(0xbdb7a6, { r: 0.7 }), 50);
    const dm = new THREE.Matrix4();
    for (let i = 0; i < 50; i++) dash.setMatrixAt(i, dm.makeTranslation(0, 0.006, -40 + i * 6));
    S.add(dash);
    // Häuserzeilen mit Fenstern
    const facadeCols = [0x6e4a3e, 0x8a6b55, 0x5a5a62, 0x7b6150, 0x4f4743, 0x96836c, 0x6a5348];
    const winPos = [];
    const buildRow = (sx) => {
      let z = -60;
      while (z < 250) {
        const wz = rng.range(8, 12);
        const isHers = sx < 0 && z <= 0 && z + wz > 0;
        const zc = isHers ? 0 : z + wz / 2;
        const width = isHers ? 11 : wz;
        const h = isHers ? 14 : rng.range(9, 19);
        const colr = isHers ? 0xb9a58a : rng.pick(facadeCols);
        box(10, h, width - 0.15, M(colr, { r: 0.92 }), S, sx * 14, h / 2, zc, { cast: false, recv: false });
        // Gesims
        box(0.5, 0.35, width, M(0x3a3430), S, sx * 9.1, h - 0.2, zc, { cast: false });
        const floors = Math.floor((h - 1.2) / 3.2);
        const cols = Math.floor(width / 2.4);
        for (let f = 0; f < floors; f++) {
          for (let c = 0; c < cols; c++) {
            const wz2 = zc - width / 2 + (c + 0.5) * (width / cols);
            const wy = 2.0 + f * 3.2;
            if (isHers && f === 0 && Math.abs(wz2) < 1.6) continue;
            const r = rng.next();
            winPos.push({ x: sx * 8.97, y: wy, z: wz2, ry: sx < 0 ? Math.PI / 2 : -Math.PI / 2, kind: r < 0.12 ? 'coral' : r < 0.62 ? 'lit' : 'dark' });
          }
        }
        if (isHers) z = 5.5;
        else z += wz;
      }
    };
    buildRow(-1);
    buildRow(1);
    const winMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.05, 1.55), new THREE.MeshBasicMaterial({ color: 0xffffff }), winPos.length);
    const frameMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 1.75, 1.25), M(0x2c2622), winPos.length);
    const wm = new THREE.Matrix4();
    const wq = new THREE.Quaternion();
    const wcol = new THREE.Color();
    winPos.forEach((w, i) => {
      wq.setFromEuler(new THREE.Euler(0, w.ry, 0));
      wm.compose(new THREE.Vector3(w.x + (w.ry > 0 ? 0.01 : -0.01), w.y, w.z), wq, new THREE.Vector3(1, 1, 1));
      winMesh.setMatrixAt(i, wm);
      frameMesh.setMatrixAt(i, new THREE.Matrix4().makeTranslation(w.x, w.y, w.z));
      winMesh.setColorAt(i, wcol.setHex(w.kind === 'lit' ? 0xffc98a : w.kind === 'coral' ? CORAL : 0x1d2230));
    });
    S.add(frameMesh, winMesh);
    winMesh.frustumCulled = false;
    S.userData.win = { winMesh, winPos };

    // Noras Haus: Treppe, Tür, Licht
    const stone = M(0x8d867c, { r: 0.95 });
    box(0.7, 0.61, 2.2, stone, S, -8.65, 0.305, 0, { recv: true });
    box(0.4, 0.46, 2.2, stone, S, -8.1, 0.23, 0, { recv: true });
    box(0.4, 0.31, 2.2, stone, S, -7.7, 0.155, 0, { recv: true });
    box(0.25, 2.6, 0.2, M(0x2f2a26), S, -8.95, 1.9, -0.68);
    box(0.25, 2.6, 0.2, M(0x2f2a26), S, -8.95, 1.9, 0.68);
    box(0.25, 0.25, 1.56, M(0x2f2a26), S, -8.95, 3.2, 0);
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-8.96, 0.61, -0.58);
    S.add(doorPivot);
    box(0.07, 2.45, 1.14, M(0x6b1f2a, { r: 0.55 }), doorPivot, 0, 1.225, 0.57);
    mesh(G('knob', () => new THREE.SphereGeometry(0.035, 10, 8)), M(0xc9a45a, { r: 0.3, m: 0.9 }), doorPivot, 0.06, 1.1, 1.0);
    const inside = box(0.05, 2.45, 1.16, basic(0xffd7a0), S, -9.4, 1.84, 0, { cast: false });
    box(0.3, 0.05, 1.6, M(0x2f2a26), S, -8.8, 3.45, 0);
    mesh(G('lampD', () => new THREE.SphereGeometry(0.1, 12, 8)), basic(0xffe2b0), S, -8.75, 3.25, 0, { cast: false });
    S.userData.door = doorPivot;
    S.userData.inside = inside;

    // Laternen
    const poleM = M(0x24272b, { r: 0.5, m: 0.6 });
    for (let z = -30; z < 200; z += 22) {
      for (const sx of [1]) {
        const zz = z + 11;
        mesh(G('pole', () => new THREE.CylinderGeometry(0.06, 0.08, 4.6, 8)), poleM, S, sx * 4.85, 2.3, zz);
        mesh(G('lamp', () => new THREE.SphereGeometry(0.2, 12, 8)), basic(0xffd59a), S, sx * 4.85, 4.65, zz, { cast: false });
        const halo = mesh(G('lhalo', () => new THREE.SphereGeometry(1, 12, 8)), glowMat(0xffb060, 0.1), S, sx * 4.85, 4.65, zz, { cast: false });
        halo.scale.setScalar(0.45);
      }
    }

    // Warteschlange auf dem Gehweg (links vor Noras Haus), Blick zur Tür (−z)
    const queue = [];
    for (let i = 0; i < 230; i++) queue.push(randPerson({ x: -6.2 + rng.range(-0.08, 0.08), z: 1.6 + i * 0.78 + rng.range(-0.05, 0.05), y: 0.16, yaw: Math.PI + rng.range(-0.12, 0.12) }));
    S.userData.queue = { people: queue, c: crowd(S, queue, { item: 'rose' }) };
    // Menge auf der Straße (ab Nacht), Blick zur Haustür
    const crowdP = [];
    const clear = (x, z) => Math.hypot(x - 1.05, z - 30.8) < 2.3 || (z > 27.5 && z < 34 && Math.abs(x - 1.05) < 1.7);
    for (let z = 4.0; z < 135; z += 0.78) {
      for (let x = -3.4; x <= 3.9; x += 0.74) {
        const px = x + rng.range(-0.18, 0.18);
        const pz = z + rng.range(-0.18, 0.18);
        if (clear(px, pz)) continue;
        const yaw = Math.atan2(DOOR[0] - px, DOOR[2] - pz) + rng.range(-0.25, 0.25);
        crowdP.push(randPerson({ x: px, z: pz, y: 0, yaw, dist: Math.hypot(px - DOOR[0], pz - DOOR[2]), turn: rng.range(-0.9, 0.9), delay: rng.range(0, 0.5) }));
      }
    }
    S.userData.crowd = { people: crowdP, c: crowd(S, crowdP, { item: 'phone', shadows: false }) };

    // Nora (Straße): koralle Jacke, dunkle Hose, Bob
    S.userData.nora = person({ parent: S, height: 1.68, width: 0.9, top: CORAL, topR: 0.7, bottom: 0x23252b, skin: 0xe6b896, hair: 'bob', hairColor: 0x3a2418, shoes: 0x2a1c18 });
  }

  // ================================================================ SET C – Hütte im Schnee, Nacht
  const Cs = sets.C;
  {
    ground(7, 7, M(0x6b4a32, { r: 0.85 }), Cs, 0, 0, 0, 1);
    const rug = mesh(new THREE.CircleGeometry(1.3, 32), M(0x7a3b2b, { r: 1 }), Cs, 0.6, 0.006, 0.2, { cast: false, recv: true });
    rug.rotation.x = -Math.PI / 2;
    const logA = M(0x7a5236, { r: 0.9 });
    const logB = M(0x694529, { r: 0.9 });
    const logX = (len) => G(`logx${len}`, () => new THREE.CylinderGeometry(0.14, 0.14, len, 10));
    for (let i = 0; i < 11; i++) {
      const y = 0.14 + i * 0.27;
      const mm = i % 2 ? logA : logB;
      // Rückwand mit Fenster (x 0,6..2,4; y 0,9..2,2)
      if (y < 0.85 || y > 2.25) {
        const l = mesh(logX(7), mm, Cs, 0, y, -3.1);
        l.rotation.z = Math.PI / 2;
      } else {
        const l1 = mesh(logX(4.1), mm, Cs, -1.45, y, -3.1);
        l1.rotation.z = Math.PI / 2;
        const l2 = mesh(logX(1.1), mm, Cs, 2.95, y, -3.1);
        l2.rotation.z = Math.PI / 2;
      }
      const lw = mesh(logX(7), mm, Cs, -3.5, y, 0);
      lw.rotation.x = Math.PI / 2;
      const rw = mesh(logX(7), mm, Cs, 3.5, y, 0);
      rw.rotation.x = Math.PI / 2;
    }
    box(7.2, 0.2, 7.2, M(0x3a2a1e), Cs, 0, 3.05, 0, { cast: false });
    const frameM = M(0x3d2a1c);
    box(1.9, 0.1, 0.25, frameM, Cs, 1.5, 0.86, -3.05);
    box(1.9, 0.1, 0.25, frameM, Cs, 1.5, 2.24, -3.05);
    box(0.08, 1.4, 0.2, frameM, Cs, 1.5, 1.55, -3.05);
    box(1.9, 0.06, 0.15, frameM, Cs, 1.5, 1.55, -3.05);
    // draußen: Schnee, Tannen
    const snow = M(0xdfe7f2, { r: 1 });
    ground(60, 40, snow, Cs, 0, 0.01, -25, 5);
    for (let i = 0; i < 26; i++) {
      const x = rng.range(-22, 22);
      const z = rng.range(-8, -40);
      const h = rng.range(3, 8);
      mesh(G('pine', () => new THREE.ConeGeometry(1, 1, 8)), M(0x1f3a32), Cs, x, h / 2, z).scale.set(h * 0.3, h, h * 0.3);
      mesh(G('pine', () => new THREE.ConeGeometry(1, 1, 8)), snow, Cs, x, h * 0.72, z, { cast: false }).scale.set(h * 0.17, h * 0.4, h * 0.17);
    }
    const flakes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.025, 6, 4), basic(0xffffff), 500);
    flakes.castShadow = false;
    flakes.frustumCulled = false;
    Cs.add(flakes);
    const fl = [];
    for (let i = 0; i < 500; i++) fl.push({ x: rng.range(-4, 6), y: rng.range(0, 6), z: rng.range(-3.6, -14), sp: rng.range(0.5, 0.9), ph: rng.range(0, 6.28) });
    Cs.userData.flakes = { flakes, fl };
    // Kamin links
    const stoneM = M(0x7a7670, { r: 1 });
    box(0.7, 1.4, 1.8, stoneM, Cs, -3.1, 0.7, -1.0, { recv: true });
    box(0.5, 1.6, 1.0, stoneM, Cs, -3.2, 2.2, -1.0);
    box(0.3, 0.75, 1.1, M(0x120c0a), Cs, -2.8, 0.5, -1.0, { cast: false });
    const fires = [];
    for (let i = 0; i < 5; i++) {
      const f = mesh(G('flame', () => new THREE.ConeGeometry(0.1, 0.4, 8)), basic(i % 2 ? 0xffb347 : 0xff7a2a), Cs, -2.72, 0.32, -1.32 + i * 0.16, { cast: false });
      fires.push({ f, ph: rng.range(0, 6.28) });
    }
    Cs.userData.fires = fires;
    // Sessel + Beistelltisch
    const chairM = M(0x4a2a22, { r: 0.8 });
    box(0.9, 0.42, 0.85, chairM, Cs, 0.3, 0.21, -0.8, { recv: true });
    box(0.9, 0.85, 0.2, chairM, Cs, 0.3, 0.7, -1.15, { recv: true });
    box(0.16, 0.6, 0.85, chairM, Cs, -0.13, 0.42, -0.8);
    box(0.16, 0.6, 0.85, chairM, Cs, 0.73, 0.42, -0.8);
    const tableM = M(0x5b3b26, { r: 0.6 });
    mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 20), tableM, Cs, 1.15, 0.6, -0.55, { recv: true });
    mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.58, 8), tableM, Cs, 1.15, 0.3, -0.55);
    mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 12), M(0xd9d2c4, { r: 0.5 }), Cs, 1.3, 0.67, -0.45);
    const man = person({ parent: Cs, height: 1.8, width: 1.08, top: 0x2f4a36, bottom: 0x4a4a4e, skin: 0xe8b48e, hair: 'beanie', hatColor: 0x8a6a2a, beard: true, hairColor: 0x5a3a22 });
    man.root.position.set(0.3, 0.45 - 0.92 * man.k + 0.02, -0.72);
    const phT = phone(Cs, 1.12, 0.627, -0.6);
    phT.g.rotation.x = -Math.PI / 2;
    const phH = phone(man.hand[0], 0, -0.06, 0.03);
    phH.g.rotation.set(-0.2, 0, 0);
    Cs.userData.cabin = { man, phT, phH };
  }

  // ================================================================ SET P – Steg in den Tropen, Mittag
  const Ps = sets.P;
  {
    const water = ground(500, 500, M(0x1b9db0, { r: 0.18, m: 0.1 }), Ps, 0, 0, 0, 10);
    water.receiveShadow = true;
    const plank = new THREE.InstancedMesh(new THREE.BoxGeometry(2.8, 0.08, 0.28), M(0x9c7a55, { r: 0.85 }), 130);
    plank.receiveShadow = true;
    plank.castShadow = true;
    const pm = new THREE.Matrix4();
    for (let i = 0; i < 130; i++) {
      pm.makeRotationY(rng.range(-0.01, 0.01));
      pm.setPosition(0, 0.96, -1.4 + i * 0.32);
      plank.setMatrixAt(i, pm);
      plank.setColorAt(i, new THREE.Color(rng.pick([0x9c7a55, 0x8f6f4c, 0xa88660])));
    }
    Ps.add(plank);
    for (let z = -1.3; z < 41; z += 3) for (const sx of [-1, 1]) mesh(G('post', () => new THREE.CylinderGeometry(0.11, 0.12, 2.2, 10)), M(0x5a4430), Ps, sx * 1.35, 0.0, z);
    // Insel mit Palmen, Segelboot
    const isl = mesh(new THREE.SphereGeometry(30, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(0x3f7a3a), Ps, -70, -6, -190);
    isl.scale.set(1.6, 0.35, 1);
    mesh(new THREE.CylinderGeometry(60, 62, 1, 32), M(0xe8d9a8), Ps, -70, -0.3, -190, { cast: false });
    for (let i = 0; i < 9; i++) {
      const x = -100 + i * 7 + rng.range(-2, 2);
      mesh(G('trunk', () => new THREE.CylinderGeometry(0.3, 0.45, 9, 6)), M(0x6b5238), Ps, x, 8, -176 + rng.range(-4, 4)).rotation.z = rng.range(-0.25, 0.25);
      mesh(G('crownP', () => new THREE.SphereGeometry(3, 8, 6)), M(0x2f6b2a), Ps, x, 12.5, -176).scale.set(1.4, 0.45, 1.4);
    }
    mesh(new THREE.BoxGeometry(5, 1, 1.6), M(0xf2efe8), Ps, 45, 0.4, -110);
    mesh(new THREE.ConeGeometry(2, 7, 3), M(0xffffff, { r: 0.6 }), Ps, 45, 4.6, -110, {}).scale.z = 0.08;
    mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.26, 14), M(0x3a6aa0), Ps, 0.75, 1.13, -0.75);
    const fisher = person({ parent: Ps, height: 1.78, width: 1.04, top: 0xe8e4da, bottom: 0x2d5a8a, skin: 0x9a6440, hair: 'straw', shortSleeves: true, shoes: 0x3a2a20 });
    fisher.root.position.set(0, 1.0 + 0.06 - 0.92 * fisher.k, -1.25);
    fisher.root.rotation.y = Math.PI;
    const rod = new THREE.Group();
    fisher.hand[0].add(rod);
    mesh(new THREE.CylinderGeometry(0.008, 0.016, 2.6, 6), M(0x3a2a1a), rod, 0, 1.2, 0.2).rotation.x = 0.35;
    const ph = phone(fisher.hand[1], 0, -0.05, 0.03);
    ph.g.rotation.set(-0.9, 0, 0);
    Ps.userData.pier = { fisher, ph };
  }

  // ================================================================ SET R – Restaurant am Abend
  const Rs = sets.R;
  {
    ground(16, 28, M(0x6a4632, { r: 0.6 }), Rs, 0, 0, -10, 2);
    // Teppichläufer im Gang
    ground(1.8, 24, M(0x5a1e24, { r: 1 }), Rs, 0, 0.004, -10, 2);
    const wallM = M(0x355a4a, { r: 0.85 });
    box(0.2, 3.6, 28, wallM, Rs, -8, 1.8, -10, { sz: 4, cast: false });
    box(0.2, 3.6, 28, wallM, Rs, 8, 1.8, -10, { sz: 4, cast: false });
    box(16, 3.6, 0.2, wallM, Rs, 0, 1.8, -24, { cast: false });
    box(16, 3.6, 0.2, wallM, Rs, 0, 1.8, 4.2, { cast: false });
    box(16.2, 0.15, 28.4, M(0x15100e), Rs, 0, 3.6, -10, { cast: false });
    const wain = M(0x14261f, { r: 0.7 });
    for (const sx of [-1, 1]) {
      box(0.06, 1.0, 28, wain, Rs, sx * 7.87, 0.5, -10, { cast: false });
      box(0.05, 0.05, 28, M(0xb08a4a, { r: 0.3, m: 0.9 }), Rs, sx * 7.84, 1.02, -10, { cast: false });
      for (let z = 1; z > -21; z -= 4.4) box(0.04, 1.6, 1.4, basic(0x18243f), Rs, sx * 7.88, 2.1, z, { cast: false });
    }
    const cloth = M(0xeae4da, { r: 0.9 });
    const chairM = M(0x3a2418, { r: 0.7 });
    const brass = M(0xb08a4a, { r: 0.35, m: 0.85 });
    const card = M(CORAL, { r: 0.6 });
    const men = [];
    const xs = [-5.2, -2.3, 2.3, 5.2];
    const zs = [-1.5, -4.7, -7.9, -11.1, -14.3, -17.5];
    for (const x of xs) {
      for (const z of zs) {
        mesh(G('ttop', () => new THREE.CylinderGeometry(0.5, 0.5, 0.05, 24)), cloth, Rs, x, 0.76, z, { recv: true });
        mesh(G('tleg', () => new THREE.CylinderGeometry(0.05, 0.22, 0.74, 10)), chairM, Rs, x, 0.37, z);
        // Kerze, Rose, koralle Reservierungskarte
        mesh(G('cand', () => new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8)), M(0xf2ead8), Rs, x + 0.12, 0.85, z + 0.05, { cast: false });
        mesh(G('flm', () => new THREE.SphereGeometry(0.02, 8, 6)), basic(0xffd27a), Rs, x + 0.12, 0.93, z + 0.05, { cast: false });
        mesh(G('chalo', () => new THREE.SphereGeometry(1, 10, 8)), glowMat(0xffa850, 0.18), Rs, x + 0.12, 0.93, z + 0.05, { cast: false }).scale.setScalar(0.09);
        mesh(G('vase', () => new THREE.CylinderGeometry(0.03, 0.04, 0.2, 10)), M(0xbcd8d8, { r: 0.1, op: 0.7 }), Rs, x - 0.1, 0.88, z - 0.05);
        mesh(G('rose', () => new THREE.IcosahedronGeometry(0.05, 1)), M(0xb3122a, { r: 0.5 }), Rs, x - 0.1, 1.03, z - 0.05);
        const c = mesh(G('card', () => new THREE.BoxGeometry(0.14, 0.08, 0.01)), card, Rs, x, 0.83, z - 0.12, { cast: false });
        c.rotation.x = -0.25;
        // Lampe darüber
        mesh(G('cord', () => new THREE.CylinderGeometry(0.006, 0.006, 1.6, 4)), M(0x111111), Rs, x, 2.8, z, { cast: false });
        mesh(G('shade', () => new THREE.ConeGeometry(0.22, 0.2, 18, 1, true)), brass, Rs, x, 1.95, z, { cast: false });
        mesh(G('bulb', () => new THREE.SphereGeometry(0.06, 10, 8)), basic(0xffe3b0), Rs, x, 1.88, z, { cast: false });
        // Mann außen, leerer Stuhl zum Gang
        const out = Math.sign(x);
        const yaw = out > 0 ? -Math.PI / 2 : Math.PI / 2;
        for (const side of [1, -1]) {
          const cx = x + side * out * 0.72;
          const cg = new THREE.Group();
          cg.position.set(cx, 0, z);
          cg.rotation.y = side > 0 ? yaw : yaw + Math.PI;
          Rs.add(cg);
          box(0.44, 0.05, 0.44, chairM, cg, 0, 0.45, 0, { recv: true });
          box(0.44, 0.5, 0.05, chairM, cg, 0, 0.72, -0.2);
          for (const lx of [-0.18, 0.18]) for (const lz of [-0.18, 0.18]) box(0.04, 0.45, 0.04, chairM, cg, lx, 0.225, lz, { cast: false });
        }
        const p = person({ parent: Rs, height: rng.range(1.7, 1.86), width: rng.range(0.98, 1.1), top: rng.pick(PALETTE_TOP), bottom: rng.pick(PALETTE_BOTTOM), skin: rng.pick(SKIN), hair: rng.next() < 0.8 ? 'short' : 'none', hairColor: rng.pick(HAIR) });
        p.root.position.set(x + out * 0.72, 0.47 - 0.92 * p.k + 0.02, z);
        p.root.rotation.y = yaw;
        men.push({ p, look: rng.pick(['phone', 'door', 'down', 'door']), ph: rng.range(0, 6.28) });
      }
    }
    // Theke am Ende mit zwei Freunden
    box(6, 1.1, 0.7, M(0x3a2216, { r: 0.5 }), Rs, 0, 0.55, -21.6, { recv: true });
    box(6.1, 0.06, 0.8, M(0x1c1210, { r: 0.25, m: 0.2 }), Rs, 0, 1.12, -21.6, { recv: true });
    box(6, 0.04, 0.4, brass, Rs, 0, 0.12, -21.2, { cast: false });
    box(7, 2.2, 0.3, M(0x2a1a12), Rs, 0, 1.9, -23.7, { cast: false });
    box(6.6, 1.6, 0.05, basic(0x5a3418), Rs, 0, 1.9, -23.53, { cast: false });
    const bottles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.04, 0.045, 0.3, 8), M(0xffffff, { r: 0.15, m: 0.1 }), 60);
    const bm = new THREE.Matrix4();
    for (let i = 0; i < 60; i++) {
      bm.makeTranslation(-3 + (i % 30) * 0.2, 1.4 + Math.floor(i / 30) * 0.6, -23.4);
      bottles.setMatrixAt(i, bm);
      bottles.setColorAt(i, new THREE.Color(rng.pick([0x3a6a3a, 0x7a4a1a, 0x9ab0b0, 0x5a2a2a])));
    }
    Rs.add(bottles);
    for (let s = 0; s < 3; s++) box(5.8, 0.03, 0.25, M(0x1c1210), Rs, 0, 1.24 + s * 0.6, -23.45, { cast: false });
    const stools = [];
    for (const sx of [-0.36, 0.36]) {
      const st = new THREE.Group();
      st.position.set(sx, 0, -20.75);
      Rs.add(st);
      mesh(G('stS', () => new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16)), M(0x2a1a14), st, 0, 0.75, 0, { recv: true });
      mesh(G('stL', () => new THREE.CylinderGeometry(0.03, 0.05, 0.74, 8)), brass, st, 0, 0.37, 0);
      stools.push(st);
    }
    const fA = person({ parent: Rs, height: 1.8, width: 1.06, top: 0x34507a, bottom: 0x2a2f3a, skin: 0xd8a27c, hair: 'short', hairColor: 0x2a1c14 });
    const fB = person({ parent: Rs, height: 1.77, width: 1.04, top: 0x6a6e72, bottom: 0x24262a, skin: 0x8a5a3a, hair: 'short', hairColor: 0x110d0a, beard: true });
    const phA = phone(Rs, -0.36, 1.16, -21.4);
    const phB = phone(Rs, 0.36, 1.16, -21.4);
    phA.g.rotation.x = -Math.PI / 2;
    phB.g.rotation.x = -Math.PI / 2;
    const glass = M(0xd9a24a, { r: 0.1, op: 0.75 });
    mesh(G('glass', () => new THREE.CylinderGeometry(0.04, 0.035, 0.13, 12)), glass, Rs, -0.62, 1.21, -21.35);
    mesh(G('glass', () => new THREE.CylinderGeometry(0.04, 0.035, 0.13, 12)), glass, Rs, 0.62, 1.21, -21.35);
    // Kellner
    const waiter = person({ parent: Rs, height: 1.78, width: 0.98, top: 0x151515, bottom: 0x151515, skin: 0xc68a62, hair: 'short', hairColor: 0x1a1410 });
    const tray = new THREE.Group();
    waiter.hand[1].add(tray);
    mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.015, 20), brass, tray, 0, 0.02, 0.1);
    for (let i = 0; i < 3; i++) mesh(G('glass', () => new THREE.CylinderGeometry(0.04, 0.035, 0.13, 12)), M(0xf2e6c8, { r: 0.1, op: 0.7 }), tray, -0.08 + i * 0.08, 0.09, 0.1);
    Rs.userData.rest = { men, fA, fB, phA, phB, waiter };
  }

  // ================================================================ SET A – Noras Wohnung (3. Stock), Nacht
  const As = sets.A;
  {
    ground(8, 7, M(0x8e6e50, { r: 0.7 }), As, 0, 0, -0.5, 1);
    const rug = ground(2.4, 1.8, M(0x4a5560, { r: 1 }), As, 1.4, 0.005, 0.1, 1);
    rug.position.y = 0.005;
    const wall = M(0xcfc4b4, { r: 0.95 });
    // Fensterwand z = −3 mit Öffnung x −1,8..1,8, y 0,5..2,6
    box(2.2, 2.9, 0.2, wall, As, -2.9, 1.45, -3.0, { recv: true });
    box(2.2, 2.9, 0.2, wall, As, 2.9, 1.45, -3.0, { recv: true });
    box(3.6, 0.5, 0.2, wall, As, 0, 0.25, -3.0, { recv: true });
    box(3.6, 0.3, 0.2, wall, As, 0, 2.75, -3.0, { recv: true });
    box(0.2, 2.9, 7, wall, As, -4, 1.45, 0.5, { recv: true, sz: 2 });
    box(0.2, 2.9, 7, wall, As, 4, 1.45, 0.5, { recv: true, sz: 2 });
    box(8, 2.9, 0.2, wall, As, 0, 1.45, 4, { recv: true });
    box(8.2, 0.12, 7.4, M(0xe2dbd0), As, 0, 2.95, 0.5, { cast: false });
    const fr = M(0x2a2a2c, { r: 0.5 });
    box(3.7, 0.06, 0.12, fr, As, 0, 0.53, -2.95);
    box(3.7, 0.06, 0.12, fr, As, 0, 2.58, -2.95);
    box(0.06, 2.1, 0.1, fr, As, 0, 1.55, -2.95);
    box(0.06, 2.1, 0.1, fr, As, -1.82, 1.55, -2.95);
    box(0.06, 2.1, 0.1, fr, As, 1.82, 1.55, -2.95);
    // Vorhänge (schließen sich bei T.curtain)
    const curM = M(0x8c8072, { r: 1 });
    const curtains = [];
    for (const sx of [-1, 1]) {
      const g = new THREE.Group();
      As.add(g);
      for (let i = 0; i < 5; i++) box(0.16, 2.3, 0.06, curM, g, sx * (i * 0.13), 1.48, (i % 2) * 0.05, { cast: true });
      curtains.push({ g, sx });
    }
    // Außen: Straße 9 m tiefer, gegenüberliegende Fassaden, Lichter der Menge
    ground(60, 40, M(0x1a1c20, { r: 1 }), As, 0, -9, -22, 5);
    const facade = M(0x3a3438, { r: 1 });
    for (let i = 0; i < 6; i++) box(9.5, 24, 8, facade, As, -24 + i * 10, 3, -38, { cast: false });
    const ow = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.0, 1.4), new THREE.MeshBasicMaterial({ color: 0xffffff }), 180);
    const owm = new THREE.Matrix4();
    for (let i = 0; i < 180; i++) {
      owm.makeTranslation(-27 + (i % 30) * 1.95, -6 + Math.floor(i / 30) * 3.2, -33.9);
      ow.setMatrixAt(i, owm);
      const r = rng.next();
      ow.setColorAt(i, new THREE.Color(r < 0.15 ? CORAL : r < 0.6 ? 0xffc98a : 0x1a1f2a));
    }
    As.add(ow);
    const orbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 6, 4), new THREE.MeshBasicMaterial({ color: CORAL }), 900);
    const oh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.35, 6, 4), new THREE.MeshBasicMaterial({ color: CORAL, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }), 900);
    const orbP = [];
    for (let i = 0; i < 900; i++) orbP.push({ x: rng.range(-22, 22), y: -7.5 + rng.range(-0.2, 0.25), z: rng.range(-6, -27), at: rng.next() });
    orbP.sort((a, b) => a.at - b.at);
    orbs.castShadow = false;
    oh.castShadow = false;
    orbs.frustumCulled = false;
    oh.frustumCulled = false;
    As.add(orbs, oh);
    // Küchentisch + Stühle
    const wood = M(0x6a4a32, { r: 0.6 });
    box(1.4, 0.05, 0.85, wood, As, -0.6, 0.75, -0.4, { recv: true });
    for (const lx of [-1.22, 0.02]) for (const lz of [-0.76, -0.04]) box(0.05, 0.73, 0.05, wood, As, lx, 0.365, lz);
    for (const cz of [0.35]) {
      box(0.42, 0.04, 0.42, wood, As, -0.6, 0.46, cz, { recv: true });
      box(0.42, 0.45, 0.04, wood, As, -0.6, 0.7, cz + 0.2);
    }
    mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.1, 12), M(0xf2f2ee, { r: 0.4 }), As, -1.0, 0.82, -0.6);
    // Pendelleuchte
    mesh(G('cord', () => new THREE.CylinderGeometry(0.006, 0.006, 1.0, 4)), M(0x111111), As, -0.6, 2.45, -0.4, { cast: false });
    mesh(new THREE.ConeGeometry(0.25, 0.22, 20, 1, true), M(0x2a2a2a, { r: 0.4 }), As, -0.6, 1.88, -0.4, { cast: false });
    mesh(new THREE.SphereGeometry(0.06, 10, 8), basic(0xffe2b8), As, -0.6, 1.8, -0.4, { cast: false });
    // Sofa an der rechten Wand, Blick −x
    const sofaM = M(0x3c5a5e, { r: 0.95 });
    box(0.85, 0.42, 2.2, sofaM, As, 2.55, 0.21, 0.1, { recv: true });
    box(0.25, 0.85, 2.2, sofaM, As, 2.98, 0.6, 0.1, { recv: true });
    box(0.85, 0.6, 0.25, sofaM, As, 2.55, 0.3, -1.05);
    box(0.85, 0.6, 0.25, sofaM, As, 2.55, 0.3, 1.25);
    box(0.5, 0.35, 0.15, M(0xd9b28a), As, 2.82, 0.58, 0.85).rotation.y = -0.3;
    // Stehlampe, Pflanze, Regal
    mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 6), M(0x222222, { m: 0.6, r: 0.4 }), As, 3.2, 0.75, -1.5);
    mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.28, 18, 1, true), M(0xf0e2c8, { r: 0.9, e: 0xffc070, ei: 0.6 }), As, 3.2, 1.55, -1.5, { cast: false });
    mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.35, 14), M(0x9a5a3a), As, -3.4, 0.175, -2.3);
    for (let i = 0; i < 7; i++) mesh(G('leaf', () => new THREE.SphereGeometry(0.22, 8, 6)), M(0x2f5a32), As, -3.4 + rng.range(-0.2, 0.2), 0.55 + i * 0.12, -2.3 + rng.range(-0.2, 0.2)).scale.set(1, 0.6, 1);
    box(0.35, 2.0, 1.6, M(0x5a4636), As, -3.75, 1.0, 1.4);
    for (let i = 0; i < 24; i++) box(0.25, rng.range(0.2, 0.3), 0.05, M(rng.pick([0x7a3a2a, 0x2a4a6a, 0xd9c8a0, 0x3a5a3a, 0x5a5a5a])), As, -3.6, 0.55 + Math.floor(i / 8) * 0.55, 0.8 + (i % 8) * 0.15);
    // Benachrichtigungs-Turm
    const NT = 150;
    const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.17, 0.022, 0.085), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, emissive: 0x401018, emissiveIntensity: 1 }), NT);
    tiles.castShadow = true;
    tiles.frustumCulled = false;
    const tl = [];
    for (let i = 0; i < NT; i++) {
      tiles.setColorAt(i, new THREE.Color(i % 3 === 2 ? 0xf4f1ec : CORAL));
      const a = rng.range(0, Math.PI * 2);
      const sp = rng.range(0.6, 2.2);
      tl.push({ ts: T.flood + 3.6 * Math.pow(i / NT, 0.62), yaw: rng.range(-0.5, 0.5), ox: rng.range(-0.012, 0.012), oz: rng.range(-0.012, 0.012), vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: rng.range(0.2, 1.4), spin: rng.range(-6, 6), delay: rng.range(0, 0.25) });
    }
    As.add(tiles);
    const nora = person({ parent: As, height: 1.68, width: 0.9, top: CORAL, topR: 0.9, bottom: 0x2b2d33, skin: 0xe6b896, hair: 'bob', hairColor: 0x3a2418, shoes: 0x2a1c18 });
    const phTable = phone(As, -0.45, 0.785, -0.3);
    phTable.g.rotation.x = -Math.PI / 2;
    const phHand = phone(nora.hand[1], 0.04, -0.05, 0.05);
    const phSofa = phone(As, 2.45, 0.43, 0.75);
    phSofa.g.rotation.x = -Math.PI / 2;
    As.userData.apt = { curtains, orbs, oh, orbP, tiles, tl, nora, phTable, phHand, phSofa };
  }

  // ---------------------------------------------------------------- Licht (feste Anzahl, pro Set umkonfiguriert → keine Shader-Neukompilierung)
  const hemi = new THREE.HemisphereLight(0xffffff, 0x333333, 1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  const pts = [0, 1, 2, 3].map(() => {
    const l = new THREE.PointLight(0xffffff, 0, 14, 2);
    scene.add(l);
    return l;
  });
  scene.fog = new THREE.Fog(0x000000, 10, 100);
  const tmpC = new THREE.Color();
  const mixHex = (a, b, x) => tmpC.setHex(a).lerp(C(b), x).clone();
  function setSky(u, top, mid, bot, glow, amt, dir) {
    u.top.value.copy(top instanceof THREE.Color ? top : C(top));
    u.mid.value.copy(mid instanceof THREE.Color ? mid : C(mid));
    u.bot.value.copy(bot instanceof THREE.Color ? bot : C(bot));
    u.glowCol.value.copy(glow instanceof THREE.Color ? glow : C(glow));
    u.glowAmt.value = amt;
    if (dir) u.glowDir.value.set(dir[0], dir[1], dir[2]);
  }
  function setSun(ox, pos, target, color, intensity, ext) {
    sun.position.set(ox + pos[0], pos[1], pos[2]);
    sun.target.position.set(ox + target[0], target[1], target[2]);
    sun.color.copy(color instanceof THREE.Color ? color : C(color));
    sun.intensity = intensity;
    Object.assign(sun.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, near: 1, far: 200 });
    sun.shadow.camera.updateProjectionMatrix();
  }
  function setPt(i, ox, p, color, intensity, dist = 14) {
    pts[i].position.set(ox + p[0], p[1], p[2]);
    pts[i].color.setHex(color);
    pts[i].intensity = intensity;
    pts[i].distance = dist;
  }
  const offPts = () => pts.forEach((l) => (l.intensity = 0));

  // Straßenstimmung über die Zeit: Dämmerung (0–6 s) → Nacht (24,5–53,5 s) → Morgen (53,5–61 s)
  function streetLook(t) {
    const night = ramp(t, 6, 24);
    const dawn = ramp(t, 53.5, 61);
    const top = mixHex(0x1c2c52, 0x060a18, night).lerp(C(0x33497a), dawn);
    const mid = mixHex(0xd98a62, 0x1a2140, night).lerp(C(0xf2a07a), dawn);
    const bot = mixHex(0x2a2226, 0x0a0b10, night).lerp(C(0x3a2a2a), dawn);
    const glowAmt = lerp(lerp(0.9, 0.12, night), 1.1, dawn);
    const glow = mixHex(0xff8a4a, 0xff6a5a, dawn);
    const fog = mixHex(0x6a4c58, 0x121828, night).lerp(C(0x8a6a72), dawn);
    return { top, mid, bot, glow, glowAmt, fog, night, dawn };
  }

  const qState = S.userData.queue;
  const cState = S.userData.crowd;
  const win = S.userData.win;
  const coralWin = win.winPos.map((w, i) => (w.kind === 'coral' ? i : -1)).filter((i) => i >= 0);
  const noraZ = (t) => WALK.z0 + WALK.v * Math.max(0, t - T.walk0);

  function updateStreet(t, shot) {
    const L = streetLook(t);
    setSky(skyU.S, L.top, L.mid, L.bot, L.glow, L.glowAmt, [0, 0.05, 1]);
    scene.fog.color.copy(L.fog);
    scene.fog.near = shot === 's06_crowd' ? 40 : 18;
    scene.fog.far = shot === 's06_crowd' ? 230 : 150;
    hemi.color.copy(mixHex(0x8a90c0, 0x3a4a70, L.night).lerp(C(0xb0a0b8), L.dawn));
    hemi.groundColor.copy(mixHex(0x40302c, 0x0e0e14, L.night).lerp(C(0x4a3a36), L.dawn));
    hemi.intensity = lerp(lerp(1.0, 0.95, L.night), 1.1, L.dawn);
    const sc = mixHex(0xffa070, 0x8aa0d8, L.night).lerp(C(0xffb898), L.dawn);
    setSun(0, [-14, 22, 70], [-5, 0, 8], sc, lerp(lerp(1.7, 0.8, L.night), 1.6, L.dawn), shot === 's06_crowd' ? 60 : 26);
    // Punktlichter: Haustür + Laternen nahe der Kamera
    const lampsNear = { s01_queue: [6, 18], s01b_door: [-4, 6], s06_crowd: [6, 18], s11_lightsout: [28, 18], s12_walk: [6, -4], s13_away: [6, 18] }[shot] || [6, 18];
    setPt(0, 0, [-8.4, 3.0, 0.0], 0xffc890, 9, 10);
    const lampI = shot === 's11_lightsout' ? 40 : 22;
    setPt(1, 0, [4.85, 4.5, lampsNear[0] - 11], 0xffc27a, lampI, 22);
    setPt(2, 0, [4.85, 4.5, lampsNear[0] + 11], 0xffc27a, lampI, 22);
    setPt(3, 0, [-7.5, 3.6, lampsNear[1]], 0xffc27a, 10, 16);
    if (shot === 's11_lightsout') setPt(3, 0, [1.0, 2.2, 27.0], CORAL, 6 * (1 - ramp(t, T.wave + 28 / WAVE_SPEED - 0.3, T.wave + 28 / WAVE_SPEED + 0.5)), 8);

    // Tür + Nora
    const door = S.userData.door;
    door.rotation.y = -1.7 * ramp(t, T.doorOpen, T.doorOpen + 0.5);
    S.userData.inside.visible = t > T.doorOpen;
    const n = S.userData.nora;
    if (t < 24) {
      // tritt aus der Tür auf den Treppenabsatz (Blick +x zur Straße), dreht den Kopf zur Schlange
      const tw = clamp01((t - 4.05) / 1.1);
      const x = -9.45 + 0.95 * tw;
      n.root.position.set(x, 0.61, 0.05);
      n.root.rotation.y = Math.PI / 2;
      const a = (1 - ramp(t, 4.9, 5.25)) * (t > 4.05 ? 1 : 0);
      const q = walkPose(WALK.w * (t - 4.05) + Math.PI / 2, a);
      q.hy = 0.75 * ramp(t, 5.0, 5.6);
      q.hp = 0.08;
      n.pose(q);
      n.root.visible = t > 4.0;
    } else if (t < T.walk0) {
      n.root.visible = false;
    } else {
      n.root.visible = true;
      const z = noraZ(t);
      n.root.position.set(WALK.x, 0.16, z);
      n.root.rotation.y = 0;
      const q = walkPose(WALK.w * (t - T.walk0));
      q.hy = shot === 's13_away' ? 0.05 * Math.sin(t * 0.8) : -0.12 + 0.08 * Math.sin(t * 0.9);
      q.hp = -0.05;
      n.pose(q);
    }

    // Schlange: Rosen erhoben; im Morgen senken die Männer die Rosen, sobald Nora vorbeigeht, und schauen ihr nach
    const passed = (p) => (t >= T.walk0 ? clamp01((noraZ(t) - p.z + 0.4) / 0.9) : 0);
    qState.c.update((i, p) => {
      const ps = passed(p);
      const sway = 0.02 * Math.sin(t * 1.1 + p.phase);
      let hy = 0.15 * Math.sin(t * 0.35 + p.phase);
      if (t < 24 && t > 4.2) hy = lerp(hy, 0.35, ramp(t, 4.2 + (p.z - 1.6) * 0.03, 4.9 + (p.z - 1.6) * 0.03) * (p.z < 30 ? 1 : 0.3));
      if (t >= T.walk0) hy = lerp(hy, Math.PI * 0.6, ps) * 1;
      return { arm: lerp(-0.75, -0.08, smooth(ps)), hy: Math.max(-1.6, Math.min(1.6, hy)), bob: sway * 0.2, yaw: p.yaw + 0.5 * ps };
    });
    // Menge: erst ab Nacht; Handys erhoben und leuchtend, erlöschen in einer Welle ab der Haustür
    const crowdOn = t >= T.crowd;
    for (const m of Object.values(cState.c.parts)) m.visible = crowdOn;
    if (crowdOn) {
      cState.c.update((i, p) => {
        const toff = T.wave + p.dist / WAVE_SPEED;
        const on = 1 - ramp(t, toff, toff + 0.12);
        const low = ramp(t, toff + 0.15 + p.delay, toff + 0.95 + p.delay);
        const turn = ramp(t, toff + 0.6 + p.delay, toff + 1.6 + p.delay);
        return { arm: lerp(-2.15, -0.15, low), on, hy: p.turn * turn + 0.05 * Math.sin(t * 0.5 + p.phase), bob: 0.01 * Math.sin(t * 1.3 + p.phase) };
      });
      // Bildschirmfarbe ist rein aus t bestimmt (kein Zwischenspeicher): dunkel ab toff
      cState.people.forEach((p, i) => cState.c.setItemColor(i, t >= T.wave + p.dist / WAVE_SPEED + 0.06 ? 0x111318 : CORAL));
    }
    // koralle Fenster erlöschen mit derselben Welle
    for (const i of coralWin) {
      const w = win.winPos[i];
      const d = Math.hypot(w.x - DOOR[0], w.z - DOOR[2]);
      win.winMesh.setColorAt(i, tmpC.setHex(t >= T.wave + d / WAVE_SPEED ? 0x262a36 : CORAL));
    }
    win.winMesh.instanceColor.needsUpdate = true;
  }

  function updateCabin(t) {
    const ox = ORIGIN.C;
    setSky(skyU.C, 0x070c1e, 0x1e2c4c, 0x0e1424, 0x6a80c0, 0.2, [0, 0.1, -1]);
    scene.fog.color.setHex(0x1a2440);
    scene.fog.near = 12;
    scene.fog.far = 55;
    hemi.color.setHex(0x8a7060);
    hemi.groundColor.setHex(0x20160f);
    hemi.intensity = 0.35;
    setSun(ox, [3, 9, -14], [0.5, 0, 0], 0x9fb8ff, 0.7, 8);
    const fl = 1 + 0.08 * Math.sin(t * 7.3) + 0.05 * Math.sin(t * 11.9 + 1.3);
    const { man, phT, phH } = Cs.userData.cabin;
    const on = ramp(t, T.phonesOn, T.phonesOn + 0.08);
    const pick = ramp(t, 7.0, 7.6);
    const lift = ramp(t, 7.6, 8.3);
    const inHand = t >= 7.55;
    setPt(0, ox, [-2.6, 0.6, -1.0], 0xff8a3a, 9 * fl, 9);
    setPt(1, ox, [1.6, 2.2, 1.0], 0xffd2a0, 1.6, 9);
    const php = inHand ? [0.45, 1.15, -0.35] : [1.12, 0.75, -0.6];
    setPt(2, ox, php, CORAL, (inHand ? 0.8 : 1.8) * on, 4);
    setPt(3, ox, [1.5, 1.6, -3.6], 0x9fb8ff, 2.5, 6);
    for (const f of Cs.userData.fires) f.f.scale.set(1, 0.85 + 0.25 * Math.sin(t * 9 + f.ph) + 0.1 * Math.sin(t * 13.7 + f.ph * 2), 1);
    const { flakes, fl: F } = Cs.userData.flakes;
    const m4 = new THREE.Matrix4();
    F.forEach((p, i) => {
      const y = ((p.y - p.sp * t) % 6 + 6) % 6;
      m4.makeTranslation(p.x + 0.25 * Math.sin(t * 0.8 + p.ph), y, p.z);
      flakes.setMatrixAt(i, m4);
    });
    flakes.instanceMatrix.needsUpdate = true;
    phT.set(on);
    phT.g.visible = !inHand;
    phH.set(on);
    phH.g.visible = inHand;
    const q = { ...SIT, lean: -0.12 + 0.18 * pick - 0.1 * lift, hy: 0.0 + 0.55 * ramp(t, 6.6, 7.0) * (1 - lift) - 0.1 * lift, hp: 0.15 + 0.35 * lift - 0.15 * ramp(t, 8.8, 9.3), twist: 0.25 * pick * (1 - lift) };
    q.aL = [lerp(-0.25, -0.75, pick) - 0.25 * lift, 0, lerp(0.06, 0.5, pick * (1 - lift)) - 0.25 * lift];
    q.eL = lerp(-0.4, -0.3, pick) - 1.2 * lift;
    q.aR = [-0.35, 0, -0.15];
    q.eR = -1.0;
    man.pose(q);
  }

  function updatePier(t) {
    const ox = ORIGIN.P;
    setSky(skyU.P, 0x2f86d6, 0xbfe6f4, 0x1b9db0, 0xffffff, 0.35, [0.4, 0.4, -1]);
    scene.fog.color.setHex(0xcbe8f2);
    scene.fog.near = 70;
    scene.fog.far = 420;
    hemi.color.setHex(0xcfe8ff);
    hemi.groundColor.setHex(0x3a7a80);
    hemi.intensity = 1.25;
    setSun(ox, [25, 50, 18], [0, 0, -2], 0xfff1d8, 3.0, 14);
    offPts();
    const { fisher, ph } = Ps.userData.pier;
    const on = ramp(t, T.pierPhone, T.pierPhone + 0.08);
    setPt(0, ox, [0.25, 1.4, -1.55], CORAL, 1.2 * on, 3);
    ph.set(on);
    const look = ramp(t, 10.05, 10.5);
    const back = ramp(t, 11.6, 12.3);
    fisher.pose({ ...SIT, kL: 1.35, kR: 1.25, lean: 0.12 + 0.15 * look, hp: 0.1 + 0.45 * look * (1 - back) - 0.05 * back, hy: -0.9 * back, aL: [-0.75, 0, 0.1], eL: -0.6, aR: [-0.45 - 0.25 * look, 0, -0.25], eR: -0.9 - 0.4 * look, bob: 0.005 * Math.sin(t * 1.5) });
  }

  function updateRestaurant(t, shot) {
    const ox = ORIGIN.R;
    setSky(skyU.R, 0x0a1022, 0x1a2442, 0x0a0a10, 0x000000, 0, [0, 0, 1]);
    scene.fog.color.setHex(0x1a120e);
    scene.fog.near = 14;
    scene.fog.far = 50;
    hemi.color.setHex(0xffd8b0);
    hemi.groundColor.setHex(0x3a2418);
    hemi.intensity = 0.95;
    setSun(ox, [3, 14, 6], [0, 0, -8], 0xffd9a8, 0.55, 18);
    const { men, fA, fB, phA, phB, waiter } = Rs.userData.rest;
    if (shot === 's04_restaurant') {
      setPt(0, ox, [-2.3, 1.8, -4.7], 0xffb870, 9, 7);
      setPt(1, ox, [2.3, 1.8, -4.7], 0xffb870, 9, 7);
      setPt(2, ox, [-2.3, 1.8, -11.1], 0xffb870, 9, 7);
      setPt(3, ox, [2.3, 1.8, -11.1], 0xffb870, 9, 7);
    } else {
      setPt(0, ox, [0, 2.2, -23.0], 0xffa860, 7, 7);
      setPt(1, ox, [0, 2.4, -21.6], 0xffc080, 9, 6);
      setPt(2, ox, [-2.3, 1.85, -17.5], 0xffb870, 5, 6);
      setPt(3, ox, [0.0, 1.9, -21.0], CORAL, 1.0 * ramp(t, T.ping, T.ping + 0.08) * (1 - ramp(t, 37.5, 38.5)), 3);
    }
    for (const m of men) {
      const sway = 0.04 * Math.sin(t * 0.6 + m.ph);
      const q = { ...SIT, lean: 0.05 };
      if (m.look === 'phone') Object.assign(q, { hp: 0.5, aR: [-0.5, 0, 0.3], eR: -1.3, aL: [-0.4, 0, -0.3], eL: -1.2, lean: 0.15 });
      else if (m.look === 'door') Object.assign(q, { hy: 0.9 * (m.p.root.rotation.y > 0 ? -1 : 1) + sway, hp: -0.05, aL: [-0.6, 0, 0.1], eL: -0.8 });
      else Object.assign(q, { hp: 0.35 + sway, aR: [-0.55, 0, -0.1], eR: -0.9, aL: [-0.55, 0, 0.1], eL: -0.9 });
      m.p.pose(q);
    }
    // Kellner kommt den Gang herauf
    const wz = -16 + 1.25 * clamp01((t - 13) / 5.5) * 5.5;
    waiter.root.position.set(0.55, 0, shot === 's04_restaurant' ? wz : -14.5);
    waiter.root.rotation.y = 0;
    const wq = walkPose(WALK.w * 0.95 * (t - 13), shot === 's04_restaurant' ? 1 : 0);
    wq.aR = [-1.25, 0, -0.1];
    wq.eR = -1.4;
    waiter.pose(wq);
    // Freunde an der Theke
    const on = ramp(t, T.ping, T.ping + 0.08);
    phA.set(on * (1 - ramp(t, 38.4, 38.6)));
    phB.set(on * (1 - ramp(t, 38.4, 38.6)));
    const lookDown = ramp(t, 35.05, 35.4) * (1 - ramp(t, 35.7, 36.0));
    const lookEach = ramp(t, 35.8, 36.2);
    const apart = ramp(t, 36.6, 37.4);
    fA.root.position.set(-0.36 - 0.25 * apart, 0.78 - 0.92 * fA.k + 0.02, -20.75);
    fA.root.rotation.y = Math.PI - 0.6 * apart;
    fB.root.position.set(0.36 + 0.25 * apart, 0.78 - 0.92 * fB.k + 0.02, -20.75);
    fB.root.rotation.y = Math.PI + 0.6 * apart;
    const base = { lL: -1.35, lR: -1.35, kL: 1.7, kR: 1.7, aL: [-0.7, 0, 0.15], eL: -0.9, aR: [-0.7, 0, -0.15], eR: -0.9 };
    fA.pose({ ...base, lean: 0.12, hp: 0.55 * lookDown + 0.05, hy: -0.85 * lookEach * (1 - apart * 0.6) + 0.25 * apart, twist: 0.25 * apart });
    fB.pose({ ...base, lean: 0.12, hp: 0.55 * lookDown + 0.05, hy: 0.85 * lookEach * (1 - apart * 0.6) - 0.25 * apart, twist: -0.25 * apart, aL: [-1.1 * apart - 0.5 * (1 - apart), 0, 0.5 * apart], eL: -1.6 * apart - 0.8 });
  }

  function updateApartment(t, shot) {
    const ox = ORIGIN.A;
    setSky(skyU.A, 0x05081a, 0x161c38, 0x08090e, 0xff5a72, 0.15, [0, -0.3, -1]);
    scene.fog.color.setHex(0x0e1222);
    scene.fog.near = 20;
    scene.fog.far = 90;
    hemi.color.setHex(0x6a6478);
    hemi.groundColor.setHex(0x1e1816);
    hemi.intensity = 0.42;
    const A = As.userData.apt;
    const close = ramp(t, T.curtain + 0.15, T.curtain + 1.1);
    setSun(ox, [-4, 9, -14], [0, 0, 0], 0x7088c8, 0.55 * (1 - 0.7 * close), 6);
    // Menge draußen wächst mit der Zeit
    const shown = Math.floor(900 * clamp01(0.15 + 0.85 * ramp(t, 18.5, 31)));
    const m4 = new THREE.Matrix4();
    A.orbP.forEach((o, i) => {
      const s = i < shown ? 1 : 0.0001;
      m4.makeScale(s, s, s);
      m4.setPosition(o.x, o.y + 0.03 * Math.sin(t * 1.4 + i), o.z);
      A.orbs.setMatrixAt(i, m4);
      A.oh.setMatrixAt(i, m4);
    });
    A.orbs.instanceMatrix.needsUpdate = true;
    A.oh.instanceMatrix.needsUpdate = true;
    for (const c of A.curtains) {
      // offen: am Rand (x = ±1,95 … ±2,5); geschlossen: Mitte
      const xo = c.sx * lerp(1.95, 0.08, close);
      c.g.position.set(xo, 0, -2.82);
      c.g.scale.x = lerp(1, 1.45, close);
    }
    // Phasen des Handys
    const n = A.nora;
    let phoneOn = 1;
    if (t >= T.phoneOff) phoneOn = 1 - ramp(t, T.phoneOff, T.phoneOff + 0.06);
    const buzz = [39.6, 41.2, 42.6, 43.7, 44.6].some((b) => t >= b && t < b + 0.4) ? 1 : 0;
    A.phTable.set(t < 24.5 ? 1 : 0);
    A.phTable.g.visible = shot === 's05_flood';
    A.phHand.g.visible = shot === 's09_alone' || (shot === 's10_off' && t < 47.6);
    A.phHand.set(phoneOn);
    A.phSofa.g.visible = shot === 's10_off' && t >= 47.6;
    A.phSofa.set(0);
    if (buzz) A.phHand.g.position.x = 0.04 + 0.004 * Math.sin(t * 190);
    else A.phHand.g.position.x = 0.04;
    // Licht
    setPt(0, ox, [3.2, 1.55, -1.5], 0xffc27a, 4.5, 9);
    setPt(1, ox, [-0.6, 1.75, -0.4], 0xffd8a8, shot === 's05_flood' ? 5 : 2.5, 8);
    setPt(2, ox, [0, 1.0, -2.6], CORAL, 4.5 * (1 - 0.8 * close), 8);
    const phPos = shot === 's05_flood' ? [-0.45, 0.95, -0.3] : [1.75, 0.95, 0.15];
    setPt(3, ox, phPos, CORAL, (shot === 's05_flood' ? 2.2 : 0.35) * phoneOn, 3);
    // Turm aus Benachrichtigungen
    const tm = new THREE.Matrix4();
    const tq = new THREE.Quaternion();
    const te = new THREE.Euler();
    const tv = new THREE.Vector3();
    const ts = new THREE.Vector3();
    const base = [-0.45, 0.79, -0.3];
    const sway = 0.06 * ramp(t, 21.0, 22.5) * Math.sin(t * 5.5);
    A.tl.forEach((p, i) => {
      const h = 0.012 + i * 0.0215;
      const born = ramp(t, p.ts, p.ts + 0.18);
      let x = base[0] + p.ox + sway * h * h * 1.8;
      let y = base[1] + h - 0.03 * (1 - born);
      let z = base[2] + p.oz;
      let rx = 0;
      let ry = p.yaw;
      const tc = T.collapse + p.delay * (h / 3.2);
      if (t > tc) {
        // Einsturz: ballistisch von der Turmposition, landet auf Boden bzw. Tisch
        const dt = t - tc;
        const vx = p.vx * (0.4 + h * 0.6);
        const vz = p.vz * (0.4 + h * 0.6);
        const floorY = Math.abs(x + vx * dt - base[0]) < 0.66 && Math.abs(z + vz * dt + 0.4 - base[2] - 0.1) < 0.4 ? 0.79 : 0.012;
        const tLand = (p.vy + Math.sqrt(p.vy * p.vy + 2 * 9.81 * Math.max(0, y - floorY))) / 9.81;
        const tt = Math.min(dt, tLand);
        x += vx * tt;
        z += vz * tt;
        y = Math.max(floorY, y + p.vy * tt - 0.5 * 9.81 * tt * tt);
        rx = p.spin * tt;
        ry += p.spin * 0.5 * tt;
      }
      te.set(rx, ry, 0);
      tq.setFromEuler(te);
      const s = born > 0 ? 0.3 + 0.7 * born : 0.0001;
      tm.compose(tv.set(x, y, z), tq, ts.set(s, s, s));
      A.tiles.setMatrixAt(i, tm);
    });
    A.tiles.instanceMatrix.needsUpdate = true;

    // Nora
    if (shot === 's05_flood') {
      n.root.position.set(-0.55, 0, -1.35 + 0.25 * ramp(t, 22.7, 23.3) * -1);
      n.root.rotation.y = 0;
      const up = ramp(t, 19.0, 20.0);
      const tower = ramp(t, 19.5, 22.4);
      const back = ramp(t, 22.65, 23.1);
      n.pose({ hp: lerp(0.35, -0.45, tower) + 0.2 * back, aL: [lerp(0, -2.6, up), 0, lerp(0.06, 0.55, up)], aR: [lerp(0, -2.6, up), 0, lerp(-0.06, -0.55, up)], eL: lerp(-0.1, -1.6, up), eR: lerp(-0.1, -1.6, up), lean: -0.05 - 0.15 * back, lL: -0.2 * back, kL: 0.2 * back });
    } else if (shot === 's07_window') {
      n.root.position.set(0.0, 0, -2.2);
      n.root.rotation.y = Math.PI;
      const reach = ramp(t, T.curtain - 0.25, T.curtain + 0.3) * (1 - ramp(t, T.curtain + 1.2, T.curtain + 1.8));
      const pull = ramp(t, T.curtain + 0.15, T.curtain + 1.1);
      n.pose({ hp: 0.32 - 0.1 * reach, hy: 0.08 * Math.sin(t * 0.6), aL: [-1.4 * reach, 0, lerp(0.06, 0.9 - 0.75 * pull, reach)], aR: [-1.4 * reach, 0, lerp(-0.06, -0.9 + 0.75 * pull, reach)], eL: -0.3 * reach - 0.1, eR: -0.3 * reach - 0.1, lean: 0.03 });
    } else {
      // auf dem Sofa (Blick −x), Ellbogen auf den Knien, Handy in den Händen
      n.root.position.set(2.32, 0.42 - 0.92 * n.k + 0.03, 0.15);
      n.root.rotation.y = -Math.PI / 2;
      const up = ramp(t, 46.3, 46.9);
      const lay = ramp(t, 47.0, 47.6) * (1 - ramp(t, 47.7, 48.1));
      const sitBack = ramp(t, 48.0, 48.8);
      const hold = 1 - ramp(t, 47.4, 47.7);
      n.pose({
        ...SIT, kL: 1.45, kR: 1.45,
        lean: lerp(0.28, -0.2, sitBack), hp: lerp(0.28, -0.08, up) - 0.08 * sitBack, hy: 0.4 * sitBack,
        aR: [lerp(-0.55 * hold - 0.2, -0.2, sitBack) + 0.3 * lay, 0, 0.32 * hold * (1 - sitBack) - 0.45 * lay - 0.05], eR: lerp(-1.15 * hold - 0.2, -0.3, sitBack),
        aL: [lerp(-0.55, -0.2, sitBack), 0, -0.32 * (1 - sitBack) + 0.05], eL: lerp(-1.15, -0.3, sitBack),
      });
    }
  }

  return {
    update({ t, shot }) {
      const key = SET_OF[shot];
      if (!key) throw new Error(`Unbekannte Einstellung ${shot}`);
      for (const k of Object.keys(sets)) sets[k].visible = k === key;
      if (key === 'S') updateStreet(t, shot);
      else if (key === 'C') updateCabin(t);
      else if (key === 'P') updatePier(t);
      else if (key === 'R') updateRestaurant(t, shot);
      else updateApartment(t, shot);
    },
  };
}
