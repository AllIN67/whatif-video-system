// What if you folded paper 42 times? – Stil B, Rezept B1 mit Experiment „Maßstabsreise“ (Branch experiment/reference-insights-2026-11).
// Aufbau nur aus dem Baukasten. Zeiten aus timeline.json (erzeugt aus beats.json): B.beat(id), B.ev(id).
// Die Papierdicke kommt aus dem HUD-Wert (hudAt, intern mm) – Bild und Zahl können nicht auseinanderlaufen.
//
// Orte (je eine Gruppe, sichtbar nur im eigenen Beat):
//   class  Klassenzimmer am Ursprung (Tisch der Figur bei z 0,5)
//   yard   Schulhof bei x = 200 (Schulgebäude, Säule bricht durchs Dach)
//   city   Stadt bei x = 3000 (Maßstab 1 m, höchster Turm 828 m)
//   sky    Himmel bei z = −9000 (lokal y = Höhe − 10 km)
//   street Straße bei x = −300 (Menschen schauen zur Linie am Himmel)
//   space  Erde (r = 10) und Mond bei z = 30000; Säule entlang +y
import { createKit } from '/pipeline/runtime/kit/index.js';
import { hudAt } from '/pipeline/runtime/timeline.js';

export async function build({ THREE, scene, camera, renderer, rng, timeline, fetchJson }) {
  const kit = createKit({ THREE, scene, renderer, rng });
  const { props: P, places: PL, ramp, lerp, clamp01 } = kit;
  const B = kit.beatClock(timeline);
  const lights = kit.setupLook({ scene, renderer }, 'interior');
  const L = { scene, renderer, ...lights };
  const ev = B.ev;
  const at = (id) => B.beat(id).from;
  const pos = (id, key = 'you') => B.beat(id).data[key];
  const place = (h, p) => h.setPosition(p[0], p[1], p[2], p[3] ?? 0);

  const sets = {};
  const makeSet = (name) => {
    const g = new THREE.Group();
    scene.add(g);
    sets[name] = g;
    return g;
  };
  const SET_OF = { space: 'space', classroom: 'class', schoolyard: 'yard', city: 'city', sky: 'sky', street: 'street' };

  // Papierdicke (mm) → Faltung n (0,1 mm · 2ⁿ)
  const foldOf = (mm) => Math.max(0, Math.round(Math.log2(Math.max(0.1, mm) / 0.1)));
  const mmAt = (t) => hudAt(timeline, Math.max(0, t))?.value ?? 0.1;
  // Faltungs-Impuls: kurzes Aufploppen, wenn sich die Faltung gerade geändert hat
  const foldPulse = (t) => {
    const n = foldOf(mmAt(t));
    for (const d of [0.04, 0.08, 0.12, 0.16]) if (foldOf(mmAt(t - d)) !== n) return 1 - d / 0.2;
    return 0;
  };

  // ================================================================ Klassenzimmer
  const CLASS = makeSet('class');
  const room = PL.classroom([0, 0, 0]);
  CLASS.add(room.root);
  // Tisch + Stuhl der vorderen Reihe vor der Figur entfernen (verdecken die Nahaufnahmen von der Tafelseite)
  room.root.updateMatrixWorld(true);
  const _p = new THREE.Vector3();
  const hide = [];
  room.root.traverse((o) => {
    if (o === room.root || !o.isGroup) return;
    o.getWorldPosition(_p);
    if (Math.abs(_p.x) < 0.05 && Math.abs(_p.z + 1.1) < 0.05 || Math.abs(_p.x) < 0.05 && Math.abs(_p.z + 0.55) < 0.05) hide.push(o);
  });
  for (const o of hide) o.visible = false;
  // Decke mit Loch über dem Tisch (Platte bricht beim Durchstoß)
  const ceilY = 3.0;
  const ceilMat = { cast: false };
  const ceilParts = [
    kit.box(9, 0.14, 4.45, 0xf1ece2, [0, ceilY, -2.275 - 0.05], ceilMat), // vorne (Tafel-Seite)
    kit.box(9, 0.14, 3.55, 0xf1ece2, [0, ceilY, 2.725 + 0.05], ceilMat), // hinten
    kit.box(4.0, 0.14, 1.0, 0xf1ece2, [-2.5, ceilY, 0.45], ceilMat),
    kit.box(4.0, 0.14, 1.0, 0xf1ece2, [2.5, ceilY, 0.45], ceilMat),
  ];
  ceilParts[0].position.z = -2.275 - 0.05 + 0.0;
  for (const c of ceilParts) CLASS.add(c);
  const ceilTile = kit.box(1.0, 0.14, 1.0, 0xf1ece2, [0, ceilY, 0.45], ceilMat);
  CLASS.add(ceilTile);
  // Deckenlampen (Leuchtstreifen)
  for (const [x, z] of [[-2, -2], [2, -2], [-2, 2.6], [2, 2.6]]) CLASS.add(kit.box(1.4, 0.04, 0.25, 0xffffff, [x, ceilY - 0.05, z], { cast: false, mat: { emissive: 0xfff6e0, emissiveIntensity: 1.2 } }));
  const holeLight = new THREE.SpotLight(0xfff2d6, 0, 9, 0.5, 0.6, 1.2);
  holeLight.position.set(0, 6, 0.45);
  holeLight.target.position.set(0, 0.7, 0.6);
  CLASS.add(holeLight, holeLight.target);
  const sky0 = kit.box(1.0, 0.02, 1.0, 0xbfdcff, [0, ceilY + 0.6, 0.45], { cast: false, mat: { emissive: 0xbfe0ff, emissiveIntensity: 1.3 } });
  CLASS.add(sky0);
  const dust = kit.fx.burst({ count: 34, color: 0xe8e2d4, speed: 2.4, life: 1.2, size: 0.07 });
  CLASS.add(dust.root);
  const paperPuff = kit.fx.burst({ count: 18, color: 0xffffff, speed: 1.1, life: 0.6, size: 0.02 });
  CLASS.add(paperPuff.root);

  // Tafel: Papierflieger-Zeichnung (Vorbereitung der Pointe), Kreidestriche erscheinen beim Zeichnen
  const chalk = kit.mat(0xf4f4ee);
  const planeLines = [
    [[-0.9, 2.0], [0.5, 1.7]], [[0.5, 1.7], [-0.6, 1.45]], [[-0.6, 1.45], [-0.9, 2.0]], [[-0.6, 1.45], [-0.35, 1.75]], [[-0.35, 1.75], [0.5, 1.7]],
  ];
  const planeStrokes = planeLines.map(([[x0, y0], [x1, y1]]) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.03, 0.01), chalk);
    m.position.set(0.9 + (x0 + x1) / 2, (y0 + y1) / 2, -4.5 + 0.14);
    m.rotation.z = Math.atan2(y1 - y0, x1 - x0);
    CLASS.add(m);
    return m;
  });

  // Papier auf dem Tisch: Block, dessen Grundfläche bis Falte 5 halbiert wird, danach gleich bleibt (Prämisse)
  const DESK = [0, 0.72, 0.42];
  const deskStack = P.paperStack({ w: 0.21, d: 0.297, stripe: 0.004 });
  deskStack.position.set(...DESK);
  CLASS.add(deskStack);
  const footprint = (n) => {
    let a = 0.297;
    let b = 0.21;
    for (let i = 0; i < Math.min(n, 5); i++) {
      const h = a / 2;
      a = Math.max(h, b);
      b = Math.min(h, b);
    }
    return [b, a];
  };

  // Figuren
  const you = kit.human({ shirt: 0xd9342b, pants: 0x2d3e66, hair: 'spiky', hairColor: 0x2a1d16, skin: 0xd9a77e, scale: 0.94 });
  scene.add(you.root);
  const teacher = kit.human({ shirt: 0x5a7d6a, pants: 0x3a3a3a, hair: 'bun', hairColor: 0x7a7a7a, skin: 0xe8c4a0, tie: null });
  CLASS.add(teacher.root);
  const classmates = [[-1.9, -0.6], [1.9, -0.6], [-1.9, 1.0], [1.9, 2.6], [0, 2.6], [-1.9, 2.6]].map(([x, z], i) => {
    const h = kit.human({ shirt: [0x3a7ad9, 0x4aa05a, 0xe0b23a, 0x8a5ac9, 0xe08a3a, 0xeeeeee][i], hair: ['short', 'long', 'bun', 'short', 'long', 'bald'][i], skin: kit.SKIN[(i * 2) % 6], hairColor: kit.HAIR[i % 6], scale: 0.92 });
    h.setPosition(x, 0, z, Math.PI);
    h.phase = i * 0.37;
    CLASS.add(h.root);
    return h;
  });

  // ================================================================ Schulhof
  const YX = 200;
  const YARD = makeSet('yard');
  YARD.add(P.slab(120, 120, 0x8e9a7a, [YX, 0, 0]));
  YARD.add(P.slab(40, 22, 0xb9b2a4, [YX, 0.02, 12]));
  const school = P.building({ w: 18, d: 10, floors: 3, color: 0xc98e6a, lit: 0 });
  school.position.set(YX, 0, 0);
  YARD.add(school);
  YARD.add(kit.box(18.6, 0.5, 10.6, 0x8a5a45, [YX, 9.6, 0]));
  for (const [x, z] of [[-14, 10], [14, 9], [-18, 2], [19, 3], [-10, 22], [12, 24]]) {
    const tr = P.tree();
    tr.position.set(YX + x, 0, z);
    YARD.add(tr);
  }
  const yardStack = P.paperStack({ w: 1.0, d: 0.75, stripe: 0.05 });
  yardStack.position.set(YX, 0.72, 0);
  YARD.add(yardStack);
  const roofDust = kit.fx.burst({ count: 40, color: 0xb98a6a, speed: 7, life: 1.4, size: 0.25 });
  YARD.add(roofDust.root);
  const kids = [];
  for (let i = 0; i < 11; i++) {
    const k = kit.human({ shirt: rng.pick([0x3a7ad9, 0x4aa05a, 0xe0b23a, 0x8a5ac9, 0xe08a3a, 0xeeeeee, 0x2fb5a8]), pants: rng.pick([0x2d3e66, 0x3a3a3a, 0x24304a]), hair: rng.pick(['short', 'long', 'bun', 'spiky']), skin: rng.pick(kit.SKIN), hairColor: rng.pick(kit.HAIR), scale: rng.range(0.78, 0.9), headScale: 1.1 });
    k.setPosition(YX + rng.range(-8, 8), 0, rng.range(8.5, 15), Math.PI + rng.range(-0.3, 0.3));
    k.phase = rng.next();
    YARD.add(k.root);
    kids.push(k);
  }
  const friend = kit.human({ shirt: 0x3a7ad9, pants: 0x24304a, hair: 'short', skin: 0x8a5a3b, hairColor: 0x1d1d1f, scale: 0.93 });
  YARD.add(friend.root);
  const friendPhone = P.phone ? P.phone() : null;
  if (friendPhone) friend.hold(friendPhone);

  // ================================================================ Stadt
  const CX = 3000;
  const CITY = makeSet('city');
  CITY.add(P.slab(3200, 3200, 0x7d8a72, [CX, -0.2, 0]));
  CITY.add(P.slab(1300, 1300, 0x6a6f78, [CX, 0, 0]));
  for (let i = -7; i <= 7; i++) {
    for (let j = -7; j <= 7; j++) {
      if (Math.abs(i) <= 1 && Math.abs(j) <= 1) continue;
      const fl = Math.round(rng.range(3, 30) * (1 - Math.min(0.7, Math.hypot(i, j) / 14)));
      const b = P.building({ w: rng.range(22, 34), d: rng.range(22, 34), floors: Math.max(2, fl), color: rng.pick([0x8f9ba8, 0xa9b4bf, 0x7f8a96, 0xb5654a, 0xc98e6a, 0xd6c3a4]), lit: 0 });
      b.position.set(CX + i * 44 + rng.range(-4, 4), 0, j * 44 + rng.range(-4, 4));
      CITY.add(b);
    }
  }
  // Höchster Turm (828 m), gestuft wie ein Supertall – ohne Vorbild-Logo
  const TW = [CX - 150, 0, -130];
  const twMat = { mat: { metalness: 0.2, roughness: 0.5 } };
  CITY.add(kit.box(70, 300, 70, 0x9fb3c8, TW, twMat));
  CITY.add(kit.box(50, 230, 50, 0xa9bcd0, [TW[0], 300, TW[2]], twMat));
  CITY.add(kit.box(30, 170, 30, 0xb3c5d8, [TW[0], 530, TW[2]], twMat));
  CITY.add(kit.box(14, 80, 14, 0xc0d0e0, [TW[0], 700, TW[2]], twMat));
  CITY.add(kit.box(3, 48, 3, 0xdfe7ef, [TW[0], 780, TW[2]], twMat));
  const cityStack = P.paperStack({ w: 12, d: 9, stripe: 2 });
  cityStack.position.set(CX, 0, 0);
  CITY.add(cityStack);

  // ================================================================ Himmel (lokal y = Höhe − 10 km)
  const SKZ = -9000;
  const SKY = makeSet('sky');
  SKY.position.set(0, 0, SKZ);
  for (let i = 0; i < 46; i++) {
    const c = P.cloud({ size: rng.range(90, 220), puffs: 6 });
    c.position.set(rng.range(-2600, 2600), rng.range(-900, -650), rng.range(-2600, 2600));
    SKY.add(c);
  }
  const skyStack = P.paperStack({ w: 30, d: 22, stripe: 6, glow: 0.15 });
  skyStack.position.set(0, -10000, 0);
  SKY.add(skyStack);
  const jet = P.airliner();
  SKY.add(jet);
  const skyStars = kit.space.stars();
  SKY.add(skyStars);

  // ================================================================ Straße
  const SX = -300;
  const STREET = makeSet('street');
  const street = PL.street([SX, 0, 0], { length: 80, cars: true });
  STREET.add(street.root);
  const watchers = [];
  for (let i = 0; i < 9; i++) {
    const h = kit.human({ shirt: rng.pick([0x3a7ad9, 0x4aa05a, 0xe0b23a, 0x8a5ac9, 0xe08a3a, 0xeeeeee, 0x333333]), pants: rng.pick([0x2d3e66, 0x3a3a3a, 0x6b5a45]), hair: rng.pick(['short', 'long', 'bun', 'bald']), skin: rng.pick(kit.SKIN), hairColor: rng.pick(kit.HAIR), scale: rng.range(0.94, 1.04) });
    h.setPosition(SX + rng.range(-3.2, 3.2), 0, rng.range(-6, 2), Math.PI + rng.range(-0.25, 0.25));
    h.phase = rng.next();
    const ph = P.phone ? P.phone() : null;
    if (ph && i % 2 === 0) h.hold(ph);
    h.hasPhone = !!ph && i % 2 === 0;
    STREET.add(h.root);
    watchers.push(h);
  }
  const lineStack = P.paperStack({ w: 8, d: 6, stripe: 3, glow: 0.6 });
  lineStack.position.set(SX + 6, 0, -1100);
  STREET.add(lineStack);

  // ================================================================ Weltraum
  const S = [0, 0, 30000];
  const SPACE = makeSet('space');
  SPACE.position.set(...S);
  const land = await fetchJson('/pipeline/runtime/kit/assets/land_50m.json');
  const earth = kit.space.globe({ land, radius: 10 });
  // Europa nach oben drehen (Säule wächst „aus deinem Klassenzimmer“ Richtung +y)
  const up = kit.space.latLon(48, 10, 1).normalize();
  earth.root.quaternion.setFromUnitVectors(up, new THREE.Vector3(0, 1, 0));
  SPACE.add(earth.root);
  SPACE.add(kit.space.stars());
  const moon = P.moon({ radius: 8 });
  const MOON = [9.6, 150, 0];
  moon.position.set(...MOON);
  SPACE.add(moon);
  const spaceStack = P.paperStack({ w: 0.8, d: 0.6, stripe: 0.5, glow: 0.9 });
  spaceStack.position.set(0, 9.9, 0);
  SPACE.add(spaceStack);
  const tipFlash = kit.fx.burst({ count: 40, color: 0xfff3c8, speed: 9, life: 1.0, size: 0.35 });
  SPACE.add(tipFlash.root);
  const moonDust = kit.fx.burst({ count: 30, color: 0xcfcac0, speed: 3, life: 1.6, size: 0.18 });
  SPACE.add(moonDust.root);
  const spaceSun = new THREE.DirectionalLight(0xfff4e6, 3.0);
  spaceSun.position.set(60, 40, 50);
  SPACE.add(spaceSun);
  // Weltraum: Säulenlänge (Einheiten) – maßstäblich bis 2 Erdradien, darüber verkürzt bis zum Mond (150)
  const spaceLen = (km) => (km <= 12742 ? (10 * km) / 6371 : 20 + ((km - 12742) / (384400 - 12742)) * 130);

  // ================================================================ Lichtstimmungen
  const LOOK_SPACE = { sky: 0x02030a, fog: null, hemi: [0x6f86c8, 0x0a0a14, 0.45], sun: [0xfff4e6, 0.2], exposure: 1.0 };
  const LOOK_CITY = { ...kit.LOOKS.day, fog: [0xc9dcec, 900, 4200] };
  const LOOK_SKY = { sky: 0x5f93db, fog: [0x8fb5e8, 1500, 5200], hemi: [0xffffff, 0x9fb4d0, 1.5], sun: [0xfff4e2, 2.2], exposure: 1.0 };
  const LOOK_EDGE = { sky: 0x0d1a3c, fog: null, hemi: [0xb8c8f0, 0x101020, 0.9], sun: [0xfff4e2, 2.4], exposure: 1.0 };
  const LOOK_STREET = { ...kit.LOOKS.day, fog: [0xc9dcec, 300, 2600] };
  const CLIP = { class: [0.03, 120], yard: [0.1, 800], city: [1, 6000], sky: [1, 8000], street: [0.1, 4000], space: [0.05, 3000] };

  let lastSet = null;
  const tmp = new THREE.Vector3();

  return {
    update({ t }) {
      const b = B.active(t);
      const id = b.id;
      const setName = SET_OF[b.place];
      const mm = mmAt(t);
      const m = mm / 1000;
      const km = mm / 1e6;
      const n = foldOf(mm);
      const pulse = foldPulse(t);
      let flash = 0;

      if (setName !== lastSet) {
        for (const [k, g] of Object.entries(sets)) g.visible = k === setName;
        const [near, far] = CLIP[setName];
        camera.near = near;
        camera.far = far;
        camera.updateProjectionMatrix();
        lastSet = setName;
      }
      you.root.visible = setName === 'class' || id === 'yard_react';

      // ---------- Licht je Ort ----------
      if (setName === 'class') {
        kit.applyLook(L, 'interior');
        kit.sunAt(lights.sun, [0, 0, 0.5]);
      } else if (setName === 'yard') {
        kit.applyLook(L, 'day');
        kit.sunAt(lights.sun, [YX, 0, 6]);
      } else if (setName === 'city') {
        kit.applyLook(L, LOOK_CITY);
        kit.sunAt(lights.sun, [CX, 0, 0], [600, 900, 500]);
      } else if (setName === 'street') {
        kit.applyLook(L, LOOK_STREET);
        kit.sunAt(lights.sun, [SX, 0, 0]);
      } else if (setName === 'sky') {
        const k = id === 'edge' ? ramp(t, ev('sky_dark') - 1.2, ev('sky_dark') + 0.6) : 0;
        kit.applyLook(L, LOOK_SKY, LOOK_EDGE, k);
        kit.sunAt(lights.sun, [0, 0, SKZ], [400, 600, 300]);
      } else {
        kit.applyLook(L, LOOK_SPACE);
      }

      // ---------- Klassenzimmer ----------
      if (setName === 'class') {
        const crashed = t >= ev('crash_ceiling');
        ceilTile.visible = !crashed;
        sky0.visible = crashed;
        holeLight.intensity = crashed ? 14 * clamp01((t - ev('crash_ceiling')) / 0.6) : 0;
        dust.update(t - ev('crash_ceiling'), [0, ceilY, 0.45]);
        paperPuff.update(t - ev('slam_fold'), [DESK[0], DESK[1] + 0.03, DESK[2]]);
        // Papierblock: Höhe = Dicke (im Klassenzimmer gekappt, oberhalb der Decke unsichtbar)
        const [fw, fd] = footprint(n);
        const sq = 1 + 0.25 * pulse;
        deskStack.userData.body.scale.x = fw * (1 + 0.08 * pulse);
        deskStack.userData.body.scale.z = fd * (1 + 0.08 * pulse);
        deskStack.userData.setHeight(Math.min(m, 40) / sq + 0.0004);
        // Tafelzeichnung entsteht beim Zeichnen und bleibt
        const dk = (t - ev('teacher_draws')) / 1.4;
        planeStrokes.forEach((s, i) => (s.visible = dk * planeStrokes.length > i));

        // Figur
        place(you, pos('sheet'));
        if (id === 'sheet') {
          you.act([
            { t: at('sheet'), pose: 'reach', seated: 1, mood: 'neutral', look: [0, 0.25] },
            { t: ev('teacher_draws') + 0.6, mood: 'happy', blend: 0.4 },
          ], t);
        } else if (id === 'strain') {
          you.act([
            { t: at('strain'), pose: 'reach', seated: 1, mood: 'happy', look: [0, 0.3] },
            { t: at('strain') + 1.2, pose: 'pant', seated: 1, mood: 'worried', blend: 0.4 },
            { t: ev('stuck'), pose: 'reach', seated: 1, mood: 'angry', blend: 0.12 },
          ], t);
        } else if (id === 'slam') {
          you.act([
            { t: at('slam'), pose: 'facepalm', seated: 1, mood: 'angry' },
            { t: ev('slam_fold') - 0.15, pose: 'reach', seated: 1, mood: 'angry', blend: 0.12 },
            { t: ev('slam_fold') + 0.2, pose: 'recoil', seated: 1, mood: 'shock', blend: 0.12 },
            { t: ev('class_turns') + 0.3, mood: 'happy', blend: 0.4, look: [0, 0.2] },
          ], t);
        } else if (id === 'desk_tower') {
          you.act([
            { t: at('desk_tower'), pose: 'sit', seated: 1, mood: 'happy', look: [0, 0.1] },
            { t: ev('tower_head'), pose: 'lookUp', seated: 1, mood: 'laugh', blend: 0.3 },
          ], t);
        } else if (id === 'ceiling') {
          you.act([{ t: at('ceiling'), pose: 'lookUp', seated: 1, mood: 'shock' }], t);
        } else if (id === 'teacher') {
          you.act([
            { t: at('teacher'), pose: 'sit', seated: 1, mood: 'neutral', look: [0, 0.15] },
            { t: ev('teacher_hand') + 0.3, mood: 'worried', blend: 0.3 },
            { t: ev('you_gulp'), pose: 'lookUp', seated: 1, mood: 'worried', blend: 0.4 },
          ], t);
        } else {
          you.act([
            { t: at('pointe'), pose: 'sit', seated: 1, mood: 'worried', look: [0, 0.1] },
            { t: ev('point_up') - 0.1, pose: 'pointUp', seated: 1, mood: 'smug', blend: 0.18 },
          ], t);
        }
        you.root.visible = id !== 'ceiling'; // Ich-Perspektive

        // Lehrerin: an der Tafel (zeichnet), dreht sich um; ab Beat teacher am Tisch der Figur
        if (['teacher', 'pointe', 'end'].includes(id)) {
          place(teacher, pos('teacher', 'teacher'));
          teacher.act([
            { t: at('teacher'), pose: 'stand', mood: 'angry' },
            { t: ev('teacher_hand'), pose: 'reach', mood: 'angry', blend: 0.3 },
            { t: ev('teacher_looks'), pose: 'lookUp', mood: 'shock', blend: 0.3 },
          ], t);
        } else {
          place(teacher, pos('sheet', 'teacher'));
          const turned = t >= ev('teacher_turns');
          teacher.root.rotation.y = turned ? lerp(Math.PI, 0.2, clamp01((t - ev('teacher_turns')) / 0.5)) : Math.PI;
          teacher.act([
            { t: 0, pose: 'point', mood: 'neutral' },
            { t: ev('teacher_turns'), pose: 'stand', mood: 'shock', blend: 0.3 },
            { t: ev('crash_ceiling'), pose: 'recoil', mood: 'shock', blend: 0.1 },
          ], t);
        }
        // Mitschüler: drehen sich beim Faustschlag um, ducken sich beim Durchstoß, schauen am Ende nach oben
        classmates.forEach((h, i) => {
          const turn = t >= ev('class_turns') + i * 0.08;
          const k = { t: 0, pose: 'sit', seated: 1, mood: 'neutral', look: [0, 0.1] };
          h.act([
            k,
            { t: ev('class_turns') + i * 0.08, pose: 'sit', seated: 1, mood: 'shock', look: [h.root.position.x > 0 ? 0.8 : -0.8, 0], blend: 0.25 },
            { t: ev('tower_head'), pose: 'lookUp', seated: 1, mood: 'happy', blend: 0.4 },
            { t: ev('crash_ceiling') + 0.05, pose: 'recoil', seated: 1, mood: 'panic', blend: 0.12 },
            { t: ev('crash_ceiling') + 1.0, pose: 'lookUp', seated: 1, mood: 'shock', blend: 0.4 },
            { t: at('teacher'), pose: 'sit', seated: 1, mood: 'worried', look: [0, 0], blend: 0.3 },
            { t: ev('class_looks_up') - 0.4, pose: 'lookUp', seated: 1, mood: 'laugh', blend: 0.4 },
          ], t);
          void turn;
        });
      }

      // ---------- Schulhof ----------
      if (setName === 'yard') {
        yardStack.userData.setHeight(Math.min(m, 3000));
        roofDust.update(t - ev('roof_burst'), [YX, 9.8, 0]);
        kids.forEach((k, i) => {
          k.act([
            { t: at('yard'), pose: 'stand', mood: 'neutral' },
            { t: ev('roof_burst') + 0.1 + i * 0.05, pose: 'lookUp', mood: 'shock', blend: 0.2 },
            { t: ev('kids_point') + i * 0.07, pose: i % 3 === 0 ? 'cheer' : i % 3 === 1 ? 'pointUp' : 'lookUp', mood: i % 2 ? 'laugh' : 'shock', blend: 0.3 },
          ], t);
        });
        if (id === 'yard_react') {
          place(you, pos('yard_react'));
          you.act([
            { t: at('yard_react'), pose: 'lookUp', mood: 'shock' },
            { t: ev('you_cheer'), pose: 'cheer', mood: 'laugh', blend: 0.15 },
          ], t);
          place(friend, pos('yard_react', 'friend'));
          friend.act([
            { t: at('yard_react'), pose: 'lookUp', mood: 'shock' },
            { t: ev('friend_films'), pose: 'phone', mood: 'laugh', blend: 0.3 },
          ], t);
          friend.root.visible = true;
        } else friend.root.visible = false;
      }

      // ---------- Stadt ----------
      if (setName === 'city') {
        cityStack.userData.setHeight(Math.min(m, 9000));
        if (t >= ev('pass_tower')) flash = 0.12 * (1 - clamp01((t - ev('pass_tower')) / 0.3));
      }

      // ---------- Himmel ----------
      if (setName === 'sky') {
        skyStack.userData.setHeight(m);
        // Flugzeug: fliegt von rechts nach links knapp an der Säule vorbei, weicht beim Ereignis aus
        const s = t - at('plane');
        const sw = id === 'plane' ? ramp(t, ev('plane_swerve'), ev('plane_swerve') + 1.0) : 1;
        jet.position.set(120 - s * 60, 30 + 25 * sw, 40 + 90 * sw);
        jet.rotation.y = -Math.PI / 2 + 0.5 * sw;
        jet.userData.setBank(-0.9 * Math.sin(Math.PI * clamp01(sw * 0.9)));
        jet.visible = id === 'plane';
        // Sterne folgen der Kamera (Weltraumrand)
        camera.getWorldPosition(tmp);
        skyStars.position.set(tmp.x, tmp.y, tmp.z - SKZ);
        skyStars.visible = id === 'edge' && t > ev('sky_dark') - 0.6;
        skyStack.userData.setGlow(id === 'edge' ? 0.15 + 0.55 * ramp(t, ev('sky_dark') - 1.2, ev('sky_dark') + 0.6) : 0.15);
      }

      // ---------- Straße ----------
      if (setName === 'street') {
        lineStack.userData.setHeight(9000);
        lineStack.userData.setGlow(0.6 + 1.2 * (t >= ev('line_glow') ? Math.max(0, 1 - (t - ev('line_glow')) / 0.6) : 0));
        watchers.forEach((h, i) => {
          h.act([
            { t: at('watch'), pose: 'lookUp', mood: 'shock' },
            { t: ev('phones_up') + i * 0.1, pose: h.hasPhone ? 'phone' : i % 3 ? 'lookUp' : 'pointUp', mood: i % 2 ? 'laugh' : 'shock', blend: 0.35 },
          ], t);
          if (h.hasPhone) h.look(0, -0.7);
        });
      }

      // ---------- Weltraum ----------
      if (setName === 'space') {
        const len = spaceLen(km);
        spaceStack.userData.setHeight(len);
        const glow = 0.9 + 0.8 * pulse;
        spaceStack.userData.setGlow(glow);
        earth.clouds.rotation.y = t * 0.01;
        const tipAt = (e) => tipFlash.update(t - ev(e), [0, 9.9 + len, 0]);
        if (id === 'ff_moon') tipAt('ff_touch');
        else if (id === 'moon') tipAt('fold_42');
        else tipFlash.update(-1, [0, 0, 0]);
        moonDust.update(id === 'moon' ? t - ev('moon_dust') : -1, [MOON[0] - 7.6, MOON[1] - 1, 0]);
        moon.rotation.y = t * 0.02;
        if (id === 'ff_moon' && t >= ev('ff_touch')) flash = 0.08 * (1 - clamp01((t - ev('ff_touch')) / 0.35));
        if (id === 'moon' && t >= ev('fold_42')) flash = 0.25 * (1 - clamp01((t - ev('fold_42')) / 0.4));
        if (id === 'rewind') flash = 0.9 * ramp(t, ev('rw_land') - 0.15, ev('rw_land') + 0.1);
        if (id === 'globe' && t >= ev('longer_than_earth')) flash = 0.15 * (1 - clamp01((t - ev('longer_than_earth')) / 0.3));
      }

      return { fx: { flash } };
    },
  };
}
