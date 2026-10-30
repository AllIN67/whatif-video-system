// Würfel-Mensch mit Gesicht, Gelenken, Posen und Gefühlen – der Haupt-Baustein des Formats.
// Figur schaut in +z. Füße auf y = 0. Größe ≈ 1,78 m.
//
//   const h = kit.human({ shirt: 0xe0b23a, pants: 0x2d3e66, hair: 'short' });
//   scene.add(h.root);
//   // in update({ t }):
//   h.pose('walk', t * 1.6);   // Phase in Schritten (zyklisch)
//   h.mood('sad');
//
// Posen: stand, walk, run, wave, sit, armsUp, facepalm, phone, shrug, slump, lie, liePhone, point, carry,
//   cheer, jump*, recoil, lookUp, think, kneel, crouch, reach, pant, fall*, phoneTalk (* Einmal-Posen, act(): local)
//   Schauspiel mit weichen Übergängen: h.act(spur, t) – siehe unten
//   Oberkörper-Posen sitzend: h.pose('facepalm', p, { seated: true }) (Beine/Hüfte wie 'sit');
//   Aufstehen weich: h.pose('stand', p, { seated: 1 - k }) mit k 0 → 1
// Gefühle: neutral, happy, laugh, relief, sad, worried, panic, angry, shock, tired, smug
import { clamp01 } from './core.js';

export const SKIN = [0xe8c4a0, 0xd9a77e, 0xb07a52, 0x8a5a3b, 0x5e3b27, 0xf1d3b8];
export const HAIR = [0x3b2a20, 0x5a3a24, 0x1d1d1f, 0x8a5a2e, 0xc9a26b, 0x7a7a7a];

export function createHumanFactory(THREE, core) {
  const { cbox, mat } = core;
  const TAU = Math.PI * 2;

  return function human(o = {}) {
    const skin = o.skin ?? SKIN[0];
    const shirt = o.shirt ?? 0xe0b23a;
    const pants = o.pants ?? 0x2d3e66;
    const shoes = o.shoes ?? 0x2a2a2e;
    const hairColor = o.hairColor ?? HAIR[0];
    const style = o.hair ?? 'short'; // short | long | bun | bald | spiky
    const s = o.scale ?? 1;

    const root = new THREE.Group();
    const body = new THREE.Group(); // wird für Sitzen/Liegen/Wippen verschoben
    root.add(body);

    // Hüfte als Ursprung des Oberkörpers
    const hips = new THREE.Group();
    hips.position.y = 0.95;
    body.add(hips);
    hips.add(cbox(0.46, 0.16, 0.26, pants, [0, 0, 0]));

    const spine = new THREE.Group();
    spine.position.y = 0.06;
    hips.add(spine);
    const torso = cbox(0.5, 0.6, 0.27, shirt, [0, 0.3, 0]);
    spine.add(torso);
    if (o.shirtStripe) spine.add(cbox(0.505, 0.07, 0.275, o.shirtStripe, [0, 0.36, 0], { cast: false }));
    if (o.tie) spine.add(cbox(0.06, 0.34, 0.02, o.tie, [0, 0.4, 0.145], { cast: false }));

    // Kopf
    const neck = new THREE.Group();
    neck.position.y = 0.62;
    spine.add(neck);
    neck.add(cbox(0.12, 0.08, 0.12, skin, [0, 0.03, 0]));
    const head = new THREE.Group();
    head.position.y = 0.07;
    neck.add(head);
    const HW = 0.3;
    const HH = 0.34;
    const HD = 0.3;
    head.add(cbox(HW, HH, HD, skin, [0, HH / 2, 0]));
    const fz = HD / 2 + 0.004; // Gesichtsebene
    const dark = mat(0x1f1a18);
    const eyes = [-1, 1].map((sx) => {
      const e = cbox(0.045, 0.05, 0.01, dark, [sx * 0.07, 0.19, fz], { cast: false, receive: false });
      head.add(e);
      return e;
    });
    const brows = [-1, 1].map((sx) => {
      const b = cbox(0.085, 0.022, 0.012, mat(hairColor), [sx * 0.07, 0.245, fz + 0.002], { cast: false, receive: false });
      head.add(b);
      return { m: b, sx };
    });
    head.add(cbox(0.05, 0.07, 0.03, skin, [0, 0.135, fz + 0.012])); // Nase
    // Wangen (Freude/Scham) und Schweißtropfen (Angst/Stress): bei kleinen Bildgrößen die deutlichsten Gefühlssignale
    const cheeks = [-1, 1].map((sx) => {
      const c = cbox(0.06, 0.03, 0.006, mat(0xe8857a), [sx * 0.105, 0.125, fz], { cast: false, receive: false });
      head.add(c);
      return c;
    });
    const sweat = cbox(0.035, 0.06, 0.035, mat(0x8fd3ff, { roughness: 0.2 }), [HW / 2 + 0.01, 0.27, fz - 0.03], { cast: false, receive: false });
    head.add(sweat);
    // Mund aus zwei Hälften → Lächeln/Traurig durch Kippen, Schock durch Öffnen
    const mouthMat = mat(0x6a2a24);
    const mouth = [-1, 1].map((sx) => {
      const pivot = new THREE.Group();
      pivot.position.set(0, 0.075, fz);
      const m = cbox(0.05, 0.018, 0.01, mouthMat, [sx * 0.025, 0, 0], { cast: false, receive: false });
      pivot.add(m);
      head.add(pivot);
      return { pivot, m, sx };
    });
    // Haare
    const hm = mat(hairColor);
    if (style !== 'bald') {
      head.add(cbox(HW + 0.03, 0.09, HD + 0.03, hm, [0, HH + 0.02, -0.005]));
      head.add(cbox(HW + 0.03, 0.18, 0.06, hm, [0, HH - 0.07, -HD / 2 - 0.01])); // Hinterkopf
      head.add(cbox(0.04, 0.12, HD * 0.7, hm, [HW / 2 + 0.01, HH - 0.05, -0.04]));
      head.add(cbox(0.04, 0.12, HD * 0.7, hm, [-HW / 2 - 0.01, HH - 0.05, -0.04]));
      head.add(cbox(HW * 0.7, 0.05, 0.05, hm, [-0.03, HH - 0.01, HD / 2 - 0.005])); // Pony
    }
    if (style === 'long') {
      head.add(cbox(HW + 0.05, 0.42, 0.08, hm, [0, HH - 0.25, -HD / 2 - 0.03]));
      for (const sx of [-1, 1]) head.add(cbox(0.06, 0.34, 0.12, hm, [sx * (HW / 2 + 0.02), HH - 0.2, -0.06]));
    }
    if (style === 'bun') head.add(cbox(0.14, 0.12, 0.14, hm, [0, HH + 0.1, -0.08]));
    if (style === 'spiky') for (let i = -1; i <= 1; i++) head.add(cbox(0.08, 0.1, 0.08, hm, [i * 0.09, HH + 0.1, 0]));
    if (o.glasses) {
      for (const sx of [-1, 1]) head.add(cbox(0.09, 0.07, 0.01, mat(0x222222, { transparent: true, opacity: 0.55 }), [sx * 0.07, 0.19, fz + 0.012], { cast: false }));
    }

    // Arme: Schulter-Gelenk → Oberarm → Ellbogen → Unterarm + Hand
    const makeArm = (sx) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(sx * 0.32, 0.55, 0);
      spine.add(shoulder);
      shoulder.add(cbox(0.13, 0.3, 0.14, shirt, [0, -0.13, 0]));
      const elbow = new THREE.Group();
      elbow.position.y = -0.28;
      shoulder.add(elbow);
      elbow.add(cbox(0.12, 0.26, 0.13, o.sleeves === 'short' ? skin : shirt, [0, -0.12, 0]));
      const hand = new THREE.Group();
      hand.position.y = -0.27;
      elbow.add(hand);
      hand.add(cbox(0.11, 0.11, 0.11, skin, [0, -0.04, 0]));
      return { shoulder, elbow, hand };
    };
    const armL = makeArm(1); // linke Hand der Figur (+x)
    const armR = makeArm(-1);

    // Beine
    const makeLeg = (sx) => {
      const hip = new THREE.Group();
      hip.position.set(sx * 0.12, -0.04, 0);
      hips.add(hip);
      hip.add(cbox(0.19, 0.46, 0.21, pants, [0, -0.22, 0]));
      const knee = new THREE.Group();
      knee.position.y = -0.44;
      hip.add(knee);
      knee.add(cbox(0.18, 0.42, 0.2, pants, [0, -0.2, 0]));
      knee.add(cbox(0.2, 0.09, 0.3, shoes, [0, -0.43, 0.04]));
      return { hip, knee };
    };
    const legL = makeLeg(1);
    const legR = makeLeg(-1);

    root.scale.setScalar(s);
    const joints = [hips, spine, neck, head, armL.shoulder, armL.elbow, armL.hand, armR.shoulder, armR.elbow, armR.hand, legL.hip, legL.knee, legR.hip, legR.knee];

    const reset = () => {
      for (const j of joints) j.rotation.set(0, 0, 0);
      body.position.set(0, 0, 0);
      body.rotation.set(0, 0, 0);
    };
    // Arme leicht vom Körper (sonst wirkt die Figur steif)
    const relax = () => {
      armL.shoulder.rotation.z = 0.08;
      armR.shoulder.rotation.z = -0.08;
      armL.elbow.rotation.x = -0.12;
      armR.elbow.rotation.x = -0.12;
    };

    const POSES = {
      stand(p) {
        relax();
        spine.rotation.x = 0.01 * Math.sin(p * TAU); // Atmen
      },
      walk(p) {
        const a = Math.sin(p * TAU);
        legL.hip.rotation.x = -0.45 * a;
        legR.hip.rotation.x = 0.45 * a;
        legL.knee.rotation.x = 0.7 * clamp01(Math.sin(p * TAU + Math.PI));
        legR.knee.rotation.x = 0.7 * clamp01(Math.sin(p * TAU));
        armL.shoulder.rotation.x = 0.4 * a;
        armR.shoulder.rotation.x = -0.4 * a;
        armL.shoulder.rotation.z = 0.06;
        armR.shoulder.rotation.z = -0.06;
        armL.elbow.rotation.x = armR.elbow.rotation.x = -0.25;
        body.position.y = 0.025 * Math.abs(Math.cos(p * TAU));
      },
      run(p) {
        const a = Math.sin(p * TAU);
        legL.hip.rotation.x = -0.85 * a;
        legR.hip.rotation.x = 0.85 * a;
        legL.knee.rotation.x = 1.3 * clamp01(Math.sin(p * TAU + Math.PI)) + 0.2;
        legR.knee.rotation.x = 1.3 * clamp01(Math.sin(p * TAU)) + 0.2;
        armL.shoulder.rotation.x = 0.8 * a;
        armR.shoulder.rotation.x = -0.8 * a;
        armL.elbow.rotation.x = armR.elbow.rotation.x = -1.4;
        spine.rotation.x = 0.18;
        body.position.y = 0.07 * Math.abs(Math.cos(p * TAU));
      },
      wave(p) {
        relax();
        armR.shoulder.rotation.z = -2.5;
        armR.shoulder.rotation.x = -0.2;
        armR.elbow.rotation.z = -0.35 * Math.sin(p * TAU * 2) - 0.2;
      },
      armsUp(p) {
        armL.shoulder.rotation.z = 2.7 + 0.08 * Math.sin(p * TAU * 2);
        armR.shoulder.rotation.z = -2.7 - 0.08 * Math.sin(p * TAU * 2);
        head.rotation.x = -0.15;
      },
      facepalm() {
        relax();
        armR.shoulder.rotation.x = -2.1;
        armR.shoulder.rotation.z = 0.35;
        armR.elbow.rotation.x = -1.75;
        head.rotation.x = 0.28;
        spine.rotation.x = 0.08;
      },
      phone() {
        relax();
        armR.shoulder.rotation.x = -0.55;
        armR.shoulder.rotation.z = 0.25;
        armR.elbow.rotation.x = -1.35;
        head.rotation.x = 0.35;
      },
      point() {
        relax();
        armR.shoulder.rotation.x = -1.5;
        armR.elbow.rotation.x = -0.05;
      },
      shrug(p) {
        const k = 0.5 + 0.5 * Math.sin(p * TAU);
        armL.shoulder.rotation.z = 0.35;
        armR.shoulder.rotation.z = -0.35;
        armL.elbow.rotation.x = armR.elbow.rotation.x = -1.4;
        armL.elbow.rotation.z = 0.6;
        armR.elbow.rotation.z = -0.6;
        neck.position.y = 0.62 - 0.03 * k;
        head.rotation.z = 0.12;
      },
      slump() {
        relax();
        spine.rotation.x = 0.28;
        head.rotation.x = 0.4;
        armL.shoulder.rotation.x = armR.shoulder.rotation.x = 0.1;
      },
      carry() {
        armL.shoulder.rotation.x = armR.shoulder.rotation.x = -0.35;
        armL.elbow.rotation.x = armR.elbow.rotation.x = -1.2;
        armL.shoulder.rotation.z = -0.15;
        armR.shoulder.rotation.z = 0.15;
      },
      sit() {
        relax();
        body.position.y = -0.47;
        legL.hip.rotation.x = legR.hip.rotation.x = -Math.PI / 2;
        legL.knee.rotation.x = legR.knee.rotation.x = Math.PI / 2;
        armL.shoulder.rotation.x = armR.shoulder.rotation.x = -0.4;
        armL.elbow.rotation.x = armR.elbow.rotation.x = -0.6;
      },
      // Liegend auf dem Rücken, Kopf Richtung −z. Bettoberkante über root.position.y einstellen.
      lie() {
        body.rotation.x = -Math.PI / 2;
        body.position.set(0, 0.16, 0.95);
        armL.shoulder.rotation.z = 0.12;
        armR.shoulder.rotation.z = -0.12;
      },
      // Liegend, Handy über dem Gesicht (rechte Hand; Handy mit hold() anhängen)
      liePhone() {
        POSES.lie();
        armR.shoulder.rotation.x = -1.25;
        armR.shoulder.rotation.z = 0.35;
        armR.elbow.rotation.x = -1.0;
        head.rotation.x = 0.25;
      },
    };
    // Sitzende Beine/Hüfte für beliebige Oberkörper-Posen; k = 1 sitzt, 0 steht (Zwischenwerte = Aufstehen/Hinsetzen)
    // Weitere Posen für Reaktionen und Handlung (Referenzen R07/R19/R20: Figuren reagieren sichtbar auf jedes Ereignis).
    // Einmal-Posen (jump, recoil, fall) erwarten als Phase die Zeit seit Beginn (act() übergibt sie mit local: true).
    Object.assign(POSES, {
      cheer(p) {
        POSES.armsUp(p);
        body.position.y = 0.06 * Math.abs(Math.sin(p * TAU * 1.5));
        armL.elbow.rotation.z = 0.3;
        armR.elbow.rotation.z = -0.3;
      },
      jump(p) {
        const k = clamp01(p / 0.55);
        relax();
        body.position.y = 0.38 * Math.sin(Math.PI * k);
        armL.shoulder.rotation.z = 0.08 + 2.2 * Math.sin(Math.PI * k);
        armR.shoulder.rotation.z = -0.08 - 2.2 * Math.sin(Math.PI * k);
        legL.knee.rotation.x = legR.knee.rotation.x = 0.6 * Math.sin(Math.PI * k);
        legL.hip.rotation.x = legR.hip.rotation.x = -0.3 * Math.sin(Math.PI * k);
      },
      recoil() {
        spine.rotation.x = -0.22;
        head.rotation.x = -0.2;
        armL.shoulder.rotation.x = armR.shoulder.rotation.x = -1.25;
        armL.shoulder.rotation.z = 0.35;
        armR.shoulder.rotation.z = -0.35;
        armL.elbow.rotation.x = armR.elbow.rotation.x = -1.3;
        legR.hip.rotation.x = 0.25;
        legL.hip.rotation.x = -0.1;
      },
      lookUp() {
        relax();
        head.rotation.x = -0.55;
        spine.rotation.x = -0.12;
      },
      think() {
        relax();
        armR.shoulder.rotation.x = -1.1;
        armR.shoulder.rotation.z = 0.5;
        armR.elbow.rotation.x = -2.1;
        armL.shoulder.rotation.x = -0.4;
        armL.shoulder.rotation.z = -0.45;
        armL.elbow.rotation.x = -1.4;
        head.rotation.z = 0.12;
        head.rotation.x = -0.08;
      },
      kneel() {
        body.position.y = -0.46;
        legL.hip.rotation.x = -1.55;
        legL.knee.rotation.x = 1.55;
        legR.hip.rotation.x = 0.05;
        legR.knee.rotation.x = 1.5;
        spine.rotation.x = 0.25;
        head.rotation.x = 0.35;
        armL.shoulder.rotation.x = armR.shoulder.rotation.x = -0.3;
        armL.elbow.rotation.x = armR.elbow.rotation.x = -0.4;
      },
      crouch() {
        body.position.y = -0.4;
        legL.hip.rotation.x = legR.hip.rotation.x = -1.35;
        legL.knee.rotation.x = legR.knee.rotation.x = 2.1;
        spine.rotation.x = 0.45;
        armL.shoulder.rotation.x = armR.shoulder.rotation.x = -1.0;
        armL.elbow.rotation.x = armR.elbow.rotation.x = -0.5;
      },
      reach() {
        relax();
        spine.rotation.x = 0.45;
        armR.shoulder.rotation.x = -1.35;
        armR.elbow.rotation.x = -0.15;
        head.rotation.x = -0.1;
      },
      pant(p) {
        spine.rotation.x = 0.62 + 0.04 * Math.sin(p * TAU * 2.2);
        head.rotation.x = -0.35;
        armL.shoulder.rotation.x = armR.shoulder.rotation.x = -0.75;
        armL.elbow.rotation.x = armR.elbow.rotation.x = -0.1;
        legL.hip.rotation.x = legR.hip.rotation.x = -0.25;
        legL.knee.rotation.x = legR.knee.rotation.x = 0.35;
        body.position.y = -0.05;
      },
      // Zusammensacken auf den Boden (Phase = Zeit seit Beginn, 0,5 s)
      fall(p) {
        const k = clamp01(p / 0.5);
        POSES.kneel();
        body.position.y = -0.46 * k;
        spine.rotation.x = 0.25 + 0.5 * k;
      },
      phoneTalk() {
        relax();
        armR.shoulder.rotation.x = -0.9;
        armR.shoulder.rotation.z = 0.5;
        armR.elbow.rotation.x = -2.3;
      },
    });
    const seatLegs = (k = 1) => {
      body.position.y = -0.47 * k;
      legL.hip.rotation.x = legR.hip.rotation.x = (-Math.PI / 2) * k;
      legL.knee.rotation.x = legR.knee.rotation.x = (Math.PI / 2) * k;
    };

    // Gefühle über Brauen, Augen, Mund, Wangen (cheek) und Schweißtropfen (sweat)
    const MOODS = {
      neutral: { brow: 0, browY: 0, eye: 1, mouth: 0, open: 1, cheek: 0, sweat: 0 },
      happy: { brow: 0.1, browY: 0.01, eye: 0.8, mouth: 0.35, open: 1, cheek: 1, sweat: 0 },
      laugh: { brow: -0.15, browY: 0.018, eye: 0.3, mouth: 0.4, open: 2.6, cheek: 1, sweat: 0 },
      relief: { brow: -0.25, browY: 0.012, eye: 0.25, mouth: 0.3, open: 1.2, cheek: 0.6, sweat: 0 },
      sad: { brow: -0.45, browY: 0, eye: 0.9, mouth: -0.35, open: 1, cheek: 0, sweat: 0 },
      worried: { brow: -0.35, browY: 0.012, eye: 1.1, mouth: -0.15, open: 1.4, cheek: 0, sweat: 1 },
      panic: { brow: -0.42, browY: 0.024, eye: 1.4, mouth: -0.3, open: 3.0, cheek: 0, sweat: 1 },
      angry: { brow: 0.5, browY: -0.012, eye: 0.8, mouth: -0.25, open: 1.3, cheek: 0.4, sweat: 0 },
      shock: { brow: -0.1, browY: 0.025, eye: 1.4, mouth: 0, open: 3.4, cheek: 0, sweat: 0 },
      tired: { brow: -0.2, browY: -0.006, eye: 0.35, mouth: -0.1, open: 1, cheek: 0, sweat: 0 },
      smug: { brow: 0.25, browY: 0, eye: 0.6, mouth: 0.25, open: 1, cheek: 0.3, sweat: 0 },
    };
    const MOOD_KEYS = Object.keys(MOODS.neutral);
    const setMood = (M, blink) => {
      for (const b of brows) {
        b.m.rotation.z = b.sx * M.brow; // brow < 0: innen hoch = traurig, brow > 0: innen runter = wütend
        b.m.position.y = 0.245 + M.browY;
      }
      for (const e of eyes) e.scale.y = blink ? 0.12 : M.eye;
      for (const h of mouth) {
        h.pivot.rotation.z = h.sx * M.mouth;
        h.m.scale.y = M.open;
      }
      for (const c of cheeks) {
        c.visible = M.cheek > 0.05;
        c.scale.set(M.cheek, M.cheek, 1);
      }
      sweat.visible = M.sweat > 0.05;
      sweat.scale.setScalar(Math.max(0.01, M.sweat));
    };
    const moodOf = (name) => {
      const M = MOODS[name];
      if (!M) throw new Error(`Unbekanntes Gefühl "${name}"`);
      return M;
    };
    const mood = (name, blink = false) => setMood(moodOf(name), blink);

    // Gelenkzustand als Zahlenfeld – Grundlage für weiche Überblendungen zwischen Posen (act()).
    const snap = () => {
      const a = [];
      for (const j of joints) a.push(j.rotation.x, j.rotation.y, j.rotation.z);
      a.push(body.position.x, body.position.y, body.position.z, body.rotation.x, body.rotation.y, body.rotation.z, neck.position.y);
      return a;
    };
    const unsnap = (a) => {
      let i = 0;
      for (const j of joints) j.rotation.set(a[i++], a[i++], a[i++]);
      body.position.set(a[i++], a[i++], a[i++]);
      body.rotation.set(a[i++], a[i++], a[i++]);
      neck.position.y = a[i++];
    };
    const smoothK = (x) => {
      const c = clamp01(x);
      return c * c * (3 - 2 * c);
    };
    const blinkSeed = (o.blinkSeed ?? Math.abs(Math.sin(shirt * 0.37 + (o.scale ?? 1) * 11))) * 3.1;

    const api = {
      root,
      head,
      hands: { left: armL.hand, right: armR.hand },
      pose(name, phase = 0, { seated = false } = {}) {
        const f = POSES[name];
        if (!f) throw new Error(`Unbekannte Pose "${name}"`);
        reset();
        neck.position.y = 0.62;
        f(phase);
        if (seated) seatLegs(seated === true ? 1 : clamp01(seated));
        return api;
      },
      mood(name, blink) {
        mood(name, blink);
        return api;
      },
      // Schauspiel-Spur: Posen, Gefühle und Blick werden zeitlich überblendet statt umgeschaltet
      // (frühere Produktionen: harte Posenwechsel in einem Frame → steif bzw. Sprung).
      //   h.act([{ t: 0, pose: 'stand', mood: 'neutral' },
      //          { t: 1.2, pose: 'recoil', mood: 'shock', blend: 0.15 },     // schnelle Reaktion
      //          { t: 2.0, pose: 'walk', speed: 1.6, look: [0.4, 0] }], t)
      // Schlüssel: t (s, absolut), pose, phase-Rate speed (Zyklen/s, Standard 1), local (Phase = Zeit seit t),
      // mood, look [yaw, pitch], seated (0…1), blend (s, Standard 0.3). Automatisches Blinzeln (blink: false aus).
      act(track, t, { blink = true } = {}) {
        if (!track.length) throw new Error('act: leere Spur');
        let i = 0;
        while (i + 1 < track.length && t >= track[i + 1].t) i++;
        const cur = track[i];
        const posed = (k) => {
          const ph = k.local ? Math.max(0, t - k.t) : t * (k.speed ?? 1);
          api.pose(k.pose, ph, { seated: k.seated ?? false });
          return snap();
        };
        // Pose: aktuelle Pose aus dem vorigen Schlüssel überblenden
        const prevPose = [...track.slice(0, i)].reverse().find((k) => k.pose);
        const curPose = cur.pose ? cur : prevPose;
        if (!curPose) throw new Error('act: erster Schlüssel braucht eine Pose');
        const B = posed(curPose);
        const bw = cur.pose && prevPose ? smoothK((t - cur.t) / (cur.blend ?? 0.3)) : 1;
        if (bw < 1) {
          const A = posed(prevPose);
          unsnap(A.map((v, j) => v + (B[j] - v) * bw));
        } else unsnap(B);
        // Gefühl: letzter gesetzter Wert, Überblendung vom vorigen
        const moods = track.slice(0, i + 1).filter((k) => k.mood);
        const mk = moods[moods.length - 1];
        const mp = moods[moods.length - 2];
        const M1 = moodOf(mk ? mk.mood : 'neutral');
        const mw = mp ? smoothK((t - mk.t) / (mk.blend ?? 0.25)) : 1;
        const M0 = mp ? moodOf(mp.mood) : M1;
        const M = {};
        for (const key of MOOD_KEYS) M[key] = M0[key] + (M1[key] - M0[key]) * mw;
        const bl = blink && M.eye > 0.5 && (t + blinkSeed) % 3.3 < 0.11;
        setMood(M, bl);
        // Blick
        const looks = track.slice(0, i + 1).filter((k) => k.look);
        const lk = looks[looks.length - 1];
        const lp = looks[looks.length - 2];
        if (lk) {
          const lw = lp ? smoothK((t - lk.t) / (lk.blend ?? 0.35)) : 1;
          const y0 = lp ? lp.look[0] : 0;
          const p0 = lp ? lp.look[1] : 0;
          api.look(y0 + (lk.look[0] - y0) * lw, p0 + (lk.look[1] - p0) * lw);
        }
        return api;
      },
      // Kopf drehen (Bogenmaß): links/rechts und nicken
      look(yaw = 0, pitch = 0) {
        neck.rotation.y = yaw;
        head.rotation.x += pitch;
        return api;
      },
      // Gegenstand an die rechte Hand hängen (z. B. Handy, Tasse, Regenschirm)
      hold(obj, side = 'right') {
        (side === 'right' ? armR.hand : armL.hand).add(obj);
        return api;
      },
      setPosition(x, y, z, rotY = 0) {
        root.position.set(x, y, z);
        root.rotation.y = rotY;
        return api;
      },
    };
    api.pose('stand').mood('neutral');
    return api;
  };
}
