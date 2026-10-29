// Würfel-Mensch mit Gesicht, Gelenken, Posen und Gefühlen – der Haupt-Baustein des Formats.
// Figur schaut in +z. Füße auf y = 0. Größe ≈ 1,78 m.
//
//   const h = kit.human({ shirt: 0xe0b23a, pants: 0x2d3e66, hair: 'short' });
//   scene.add(h.root);
//   // in update({ t }):
//   h.pose('walk', t * 1.6);   // Phase in Schritten (zyklisch)
//   h.mood('sad');
//
// Posen: stand, walk, run, wave, sit, armsUp, facepalm, phone, shrug, slump, lie, liePhone, point, carry
//   Oberkörper-Posen sitzend: h.pose('facepalm', p, { seated: true }) (Beine/Hüfte wie 'sit');
//   Aufstehen weich: h.pose('stand', p, { seated: 1 - k }) mit k 0 → 1
// Gefühle: neutral, happy, laugh, sad, angry, shock, tired, worried
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
    const seatLegs = (k = 1) => {
      body.position.y = -0.47 * k;
      legL.hip.rotation.x = legR.hip.rotation.x = (-Math.PI / 2) * k;
      legL.knee.rotation.x = legR.knee.rotation.x = (Math.PI / 2) * k;
    };

    // Gefühle über Brauen, Augen, Mund
    const MOODS = {
      neutral: { brow: 0, browY: 0, eye: 1, mouth: 0, open: 1 },
      happy: { brow: 0.1, browY: 0.01, eye: 0.8, mouth: 0.35, open: 1 },
      laugh: { brow: -0.15, browY: 0.018, eye: 0.3, mouth: 0.4, open: 2.6 },
      sad: { brow: -0.45, browY: 0, eye: 0.9, mouth: -0.35, open: 1 },
      worried: { brow: -0.35, browY: 0.012, eye: 1.1, mouth: -0.15, open: 1.4 },
      angry: { brow: 0.5, browY: -0.012, eye: 0.8, mouth: -0.25, open: 1.3 },
      shock: { brow: -0.1, browY: 0.025, eye: 1.4, mouth: 0, open: 3.4 },
      tired: { brow: -0.2, browY: -0.006, eye: 0.35, mouth: -0.1, open: 1 },
    };
    const mood = (name, blink = false) => {
      const M = MOODS[name];
      if (!M) throw new Error(`Unbekanntes Gefühl "${name}"`);
      for (const b of brows) {
        b.m.rotation.z = b.sx * M.brow; // brow < 0: innen hoch = traurig, brow > 0: innen runter = wütend
        b.m.position.y = 0.245 + M.browY;
      }
      for (const e of eyes) e.scale.y = blink ? 0.12 : M.eye;
      for (const h of mouth) {
        h.pivot.rotation.z = h.sx * M.mouth;
        h.m.scale.y = M.open;
      }
    };

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
