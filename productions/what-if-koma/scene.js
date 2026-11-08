// Was wäre, wenn du ins Koma fällst? – System V3 (Guide 18.13), Erzählform B4 (Überlebensbogen mit Zeitsprüngen).
// Alle Zeiten aus beats.json (kit.beatClock), Positionen aus beats[].data. Bildtexte auf Deutsch (Guide 18.14 D11).
// Farbhierarchie: gedämpfte Klinik-/Nachtwelt, EIN Akzent = Leas rostroter Mantel (sie ist die Konstante über zehn Jahre).
import { createKit } from '/pipeline/runtime/kit/index.js';

export async function build({ THREE, scene, camera, renderer, rng, timeline }) {
  const kit = createKit({ THREE, scene, renderer, rng });
  const { atmo, masses, props: P, hospital: H, ramp, clamp01, lerp } = kit;
  const B = kit.beatClock(timeline);
  const ev = B.ev;
  const lights = kit.setupLook({ scene, renderer }, 'night');

  const ORIGIN = { street: [0, 0, 0], icu: [200, 0, 0], apartment: [400, 0, 0], home: [600, 0, 0], wedding: [800, 0, 0], corridor: [1000, 0, 0] };
  const sets = {};
  const set = (name) => {
    if (!sets[name]) {
      sets[name] = new THREE.Group();
      scene.add(sets[name]);
    }
    return sets[name];
  };
  const add = (name, ...objs) => objs.forEach((o) => set(name).add(o.root || o));
  const D = (id) => B.beat(id).data || {};

  // Material austauschen, damit Farbe pro Figur änderbar ist (Kit-Materialien sind nach Farbe geteilt)
  const ownMat = (h, color) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0, flatShading: true });
    h.root.traverse((o) => {
      if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === color && !o.material.transparent) o.material = m;
    });
    return m;
  };

  // ---------------------------------------------------------------- Figuren (je ein Objekt für alle Beats)
  const COAT = 0xb5533c; // Akzent
  const you = kit.human({ shirt: 0x2c3a52, pants: 0x2a2f38, hair: 'short', hairColor: 0x3b2a20, skin: kit.SKIN[0] });
  const youShirt = ownMat(you, 0x2c3a52);
  scene.add(you.root);
  const youShoes = [];
  you.root.traverse((o) => { if (o.isMesh && o.material?.color?.getHex() === 0x2a2a2e) youShoes.push(o); });
  // wachsende Haare + Bart (Kopf-Koordinaten: Gesicht +z, oben +y, Kopf 0,30 × 0,34 × 0,30)
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x3b2a20, roughness: 0.95, flatShading: true });
  const hairSides = [-1, 1].map((sx) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.045, 1, 0.1), hairMat);
    you.head.add(m);
    return { m, sx };
  });
  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.31, 1, 0.06), hairMat);
  you.head.add(hairBack);
  const beard = new THREE.Mesh(new THREE.BoxGeometry(0.305, 1, 0.3), hairMat);
  you.head.add(beard);
  const stache = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.03), hairMat);
  stache.position.set(0, 0.095, 0.17);
  you.head.add(stache);
  const tube = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.022, 0.022), new THREE.MeshStandardMaterial({ color: 0xd8eef8, roughness: 0.3 }));
  tube.position.set(0, 0.115, 0.175);
  you.head.add(tube);
  const growHair = (k, beardK) => {
    const L = 0.06 + 0.5 * k;
    for (const { m, sx } of hairSides) {
      m.scale.y = L;
      m.position.set(sx * 0.165, 0.3 - L / 2, -0.1);
      m.visible = k > 0.02;
    }
    hairBack.scale.y = L;
    hairBack.position.set(0, 0.3 - L / 2, -0.17);
    hairBack.visible = k > 0.02;
    const bl = 0.015 + 0.06 * beardK;
    beard.scale.y = bl;
    beard.position.set(0, 0.06 - bl / 2 + 0.02 * beardK, 0.008);
    beard.visible = beardK > 0.02;
    stache.visible = beardK > 0.15;
  };

  const lea = kit.human({ shirt: COAT, pants: 0x3a3f4a, hair: 'long', hairColor: 0x5a3a24, skin: kit.SKIN[1] });
  const leaHair = ownMat(lea, 0x5a3a24);
  scene.add(lea.root);
  const mom = kit.human({ shirt: 0x7d8a72, pants: 0x4a4a52, hair: 'bun', hairColor: 0x6b5a4a, skin: kit.SKIN[0] });
  const momHair = ownMat(mom, 0x6b5a4a);
  scene.add(mom.root);
  const doc = kit.human({ shirt: 0xf1f1f1, pants: 0x6a8fa8, hair: 'bun', hairColor: 0x1d1d1f, skin: kit.SKIN[3] });
  scene.add(doc.root);
  const nurse = kit.human({ shirt: 0x6aa3b8, pants: 0x6aa3b8, hair: 'short', hairColor: 0x5a3a24, skin: kit.SKIN[2] });
  scene.add(nurse.root);
  const age = (m, from, to, k) => m.color.setHex(from).lerp(new THREE.Color(to), clamp01(k));

  // Gegenstände in Händen
  const penlight = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.13), atmo.glow(0xfff6e0, 3));
  doc.hold(penlight);
  penlight.position.set(0, -0.08, 0.08);
  const clip = kit.box(0.24, 0.32, 0.02, 0x8a6a4a);
  scene.add(clip);
  const yourPhone = H.chatPhone();
  const leaPhone = H.chatPhone();
  lea.hold(leaPhone.root);
  leaPhone.root.position.set(0, -0.1, 0.06);
  leaPhone.root.rotation.set(-1.15, 0, 0);
  const tray = kit.group(kit.box(0.42, 0.03, 0.3, 0xdfe4e8), kit.box(0.06, 0.08, 0.06, 0xf4f4f4, [0.1, 0.03, 0]), kit.box(0.05, 0.12, 0.05, 0x9fc8e8, [-0.08, 0.03, 0.05]));
  scene.add(tray);

  // Ich-Perspektive + Lider
  const me = kit.firstPerson({ camera, scene, sleeve: 0x2c3a52, skin: kit.SKIN[0] });
  const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x2c3a52, roughness: 0.92, flatShading: true });
  me.right.g.children[0].material = sleeveMat;
  me.left.g.children[0].material = sleeveMat;
  const povPhone = H.chatPhone({ size: 'big' });
  me.hold(povPhone.root, 'R', { pos: [-0.04, 0.02, -0.03], rot: [-0.35, 0.15, 0], scale: 0.3 });
  const benchPhone = H.chatPhone();
  add('corridor', benchPhone);
  const lidTex = (() => {
    const c = document.createElement('canvas');
    c.width = 8;
    c.height = 256;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, 'rgba(0,0,0,1)');
    gr.addColorStop(0.72, 'rgba(0,0,0,1)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 8, 256);
    return new THREE.CanvasTexture(c);
  })();
  const lids = [1, -1].map((s) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.16), new THREE.MeshBasicMaterial({ map: lidTex, transparent: true, depthTest: false, depthWrite: false, fog: false }));
    m.renderOrder = 999;
    if (s < 0) m.rotation.z = Math.PI;
    camera.add(m);
    return { m, s };
  });
  const setLids = (open) => {
    // open 0 = Spalt, 1 = ganz offen (Lider außerhalb des Bildes)
    for (const { m, s } of lids) {
      m.visible = open < 0.999;
      m.position.set(0, s * (0.048 + 0.1 * open), -0.12);
    }
  };

  // ---------------------------------------------------------------- 1) Straße bei Nacht, Regen
  const street = kit.places.street(ORIGIN.street, { length: 80, lit: 0.75, lampsOn: true, cars: false, palette: [0x5a4a46, 0x6b5a50, 0x4a4650, 0x5d5a5a, 0x6a6058] });
  add('street', street);
  const wet = new THREE.Mesh(new THREE.PlaneGeometry(8, 80, 1, 8), new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.18, metalness: 0.55 }));
  wet.rotation.x = -Math.PI / 2;
  wet.position.set(0, 0.004, 0);
  wet.receiveShadow = true;
  add('street', wet);
  for (let x = -3.4; x <= 3.4; x += 0.85) add('street', kit.box(0.48, 0.01, 3.0, 0xd8d8d2, [x, 0.006, 0.4], { cast: false }));
  for (const z of [-15, -5, 5, 15, 25]) add('street', atmo.lampPool({ pos: [-4.3, 4.6, z], intensity: 55, dist: 14, color: 0xffc98a }), atmo.lampPool({ pos: [4.3, 4.6, z + 5], intensity: 45, dist: 14, color: 0xffc98a }));
  const rain = kit.fx.rain({ center: [0, 0, 6], size: [16, 9, 34], count: 1400, speed: 15, color: 0xaebfd8 });
  add('street', rain);
  const car = P.car({ color: 0x7d838c, kind: 'sedan', lights: true });
  for (const sx of [-1, 1]) car.add(new THREE.Mesh(new THREE.CircleGeometry(0.16, 16), atmo.glow(0xfff4dc, 6)).translateX(sx * 0.62).translateY(0.62).translateZ(2.115));
  const headL = atmo.spotCone({ pos: [0, 0.65, 2.2], target: [0, 0.2, 14], color: 0xfff1d6, intensity: 420, angle: 0.42, coneOpacity: 0.09, housing: false });
  car.add(headL.root);
  const carGlow = atmo.lampPool({ pos: [0, 0.8, 3.0], color: 0xfff1d6, intensity: 30, dist: 9, bulb: 0 });
  car.add(carGlow.root);
  add('street', car);
  const blueL = atmo.lampPool({ pos: [1.5, 1.4, 4.5], color: 0x3a6dff, intensity: 30, dist: 14, bulb: 0 });
  const redL = atmo.lampPool({ pos: [2.5, 1.4, 3.0], color: 0xff3a3a, intensity: 20, dist: 12, bulb: 0 });
  add('street', blueL, redL);
  const groundLamp = atmo.lampPool({ pos: [-2.0, 3.2, 0.6], color: 0xffc98a, intensity: 22, dist: 7, bulb: 0 });
  add('street', groundLamp);
  add('street', yourPhone);
  const LOOK_STREET = { sky: 0x0b1120, fog: [0x121a2c, 10, 70], hemi: [0x6676a0, 0x101018, 0.75], sun: [0x8ea0d0, 0.35], exposure: 1.25 };

  // ---------------------------------------------------------------- 2) Intensivzimmer
  const icu = H.room(ORIGIN.icu);
  add('icu', icu);
  const flowerSets = [
    P.flowers({ colors: [0xf2f2f2, 0xf0c0cc, 0xe8e0a0, 0xffffff, 0xd9a0c8] }),
    P.flowers({ colors: [0xe8c86a, 0xf2e2b0, 0xffffff, 0xe0b080, 0xf0d890] }),
    P.flowers({ colors: [0xd9a0c8, 0xc0a0d8, 0xffffff, 0xe0c0e8, 0xf2f2f2] }),
  ];
  flowerSets.forEach((f) => {
    f.position.set(201.45, 0.72, -2.35);
    f.scale.setScalar(0.8);
    add('icu', f);
  });
  const teddy = kit.group(kit.cbox(0.2, 0.22, 0.14, 0x9a7a5a, [0, 0.11, 0]), kit.cbox(0.15, 0.14, 0.13, 0x9a7a5a, [0, 0.29, 0]), kit.cbox(0.05, 0.05, 0.03, 0x9a7a5a, [-0.06, 0.37, 0]), kit.cbox(0.05, 0.05, 0.03, 0x9a7a5a, [0.06, 0.37, 0]));
  teddy.position.set(201.3, 0.72, -2.2);
  teddy.rotation.y = -0.6;
  add('icu', teddy);
  const readLamp = atmo.lampPool({ pos: [201.3, 1.25, -2.3], color: 0xffc98a, intensity: 9, dist: 5, bulb: 0.05 });
  add('icu', readLamp);
  // Rückenlehne (Kopfteil hochgestellt) für Sitzen im Bett
  const backrest = kit.group(kit.box(0.88, 0.08, 0.95, 0xe9eef2), kit.box(0.6, 0.1, 0.4, 0xf6f8fa, [0, 0.08, 0.2]));
  backrest.position.set(200, 0.62, -2.72);
  backrest.rotation.x = 1.0;
  add('icu', backrest);
  const LOOK_ICU = { ...kit.LOOKS.clinical, hemi: [0xf4fbff, 0x9aa4ac, 1.25], sun: [0xfff4e6, 1.6], exposure: 1.0 };
  const LOOK_ICU_NIGHT = { sky: 0x0e1424, fog: null, hemi: [0x6c7cb0, 0x1a1a24, 0.55], sun: [0x8090c0, 0.15], exposure: 1.25 };
  const LOOK_ICU_WARM = { sky: 0xf3e2c8, fog: null, hemi: [0xfff0dc, 0x8a7a6a, 1.05], sun: [0xffcf8a, 2.2], exposure: 0.93 };

  // ---------------------------------------------------------------- 3) Wohnung (Lea allein, Nacht)
  const apt = kit.places.livingRoom(ORIGIN.apartment, { wall: 0x8a8070, floor: 0x6a4a34 });
  add('apartment', apt);
  const mugs = [kit.box(0.08, 0.1, 0.08, 0xe8e2d6, [399.35, 0.43, -0.9]), kit.box(0.08, 0.1, 0.08, 0x2c3a52, [399.75, 0.43, -0.95])];
  add('apartment', ...mugs);
  const jacket = kit.group(kit.box(0.5, 0.12, 0.6, 0x2c3a52), kit.box(0.14, 0.1, 0.5, 0x2c3a52, [0.28, 0.02, 0.05]));
  jacket.position.set(398.75, 0.44, -2.2);
  jacket.rotation.y = 0.3;
  add('apartment', jacket);
  add('apartment', atmo.lampPool({ pos: [401.0, 1.55, -2.5], color: 0xffb870, intensity: 38, dist: 7, bulb: 0 }));
  // Schlüssellicht von vorn: Tischlampe links vorn + kaltes Handylicht im Gesicht
  add('apartment', atmo.lampPool({ pos: [398.2, 1.3, -0.3], color: 0xffc080, intensity: 9, dist: 5, bulb: 0.06 }));
  const phoneGlow = atmo.lampPool({ pos: [399.6, 1.15, -1.7], color: 0xbcd4ff, intensity: 1.2, dist: 1.4, bulb: 0 });
  add('apartment', phoneGlow);
  const moon = atmo.spotCone({ pos: [397.4, 2.6, -4.5], target: [399.4, 0, -1.2], color: 0x8aa0e0, intensity: 40, angle: 0.4, coneOpacity: 0.05, housing: false });
  add('apartment', moon);
  const LOOK_APT = { sky: 0x0e1322, fog: null, hemi: [0x7080b0, 0x1a1616, 0.55], sun: [0x8aa0e0, 0.2], exposure: 1.25 };

  // ---------------------------------------------------------------- 4) Elternhaus (Tag)
  const home = kit.places.livingRoom(ORIGIN.home, { wall: 0xd8ccb6, floor: 0x9a6a42 });
  add('home', home);
  const dtable = P.table({ w: 1.4, d: 0.85, color: 0x8a5e3c });
  dtable.position.set(601.0, 0, -0.75);
  add('home', dtable);
  const dchairs = [[601.0, -1.45, 0], [600.05, -0.75, Math.PI / 2], [601.95, -0.75, -Math.PI / 2]].map(([x, z, r]) => {
    const c = P.chair(0x6b4a2e);
    c.position.set(x, 0, z);
    c.rotation.y = r;
    add('home', c);
    return c;
  });
  const plate = (x, z) => kit.group(kit.box(0.26, 0.02, 0.26, 0xf4f2ec), kit.box(0.18, 0.015, 0.18, 0xe8e4d8, [0, 0.015, 0]));
  for (const [x, z] of [[601.0, -1.12], [600.45, -0.75]]) {
    const p = plate();
    p.position.set(x, 0.75, z);
    add('home', p);
  }
  const tablePlate = plate();
  tablePlate.position.set(601.55, 0.75, -0.75);
  add('home', tablePlate);
  const handPlate = plate();
  mom.hold(handPlate);
  handPlate.position.set(0, -0.08, 0.12);
  handPlate.rotation.x = Math.PI / 2;
  add('home', atmo.spotCone({ pos: [597.8, 2.8, -2.8], target: [600.8, 0, -0.5], color: 0xfff0d8, intensity: 60, angle: 0.5, coneOpacity: 0.04, housing: false }));
  const LOOK_HOME = { ...kit.LOOKS.interior, hemi: [0xfff4e6, 0x8a7a6a, 1.35], sun: [0xffe6c4, 2.0] };

  // ---------------------------------------------------------------- 5) Hochzeit im Garten (goldene Stunde)
  const W0 = ORIGIN.wedding;
  add('wedding', atmo.ground('grass', 60, 60, { color: 0x6a8a4a, perMeter: 0.35 }).translateX(W0[0]));
  for (const [x, z, h] of [[-9, -8, 4.5], [-12, 4, 5.5], [8, -10, 5], [11, 6, 4.2], [-6, 12, 4.8], [14, -2, 5.2], [3, 14, 4.4]]) {
    const tr = P.tree({ h, color: 0x5f7f45 });
    tr.position.set(W0[0] + x, 0, z);
    add('wedding', tr);
  }
  add('wedding', masses.skyline({ center: [W0[0], 0, 0], radius: 70, color: 0xb0a898, seed: 41 }));
  // Bogen
  const arch = kit.group(kit.box(0.12, 2.6, 0.12, 0xf4efe6, [0, 0, -1.0]), kit.box(0.12, 2.6, 0.12, 0xf4efe6, [0, 0, 1.0]), kit.box(0.14, 0.14, 2.3, 0xf4efe6, [0, 2.55, 0]));
  for (let i = 0; i < 9; i++) arch.add(kit.cbox(0.16, 0.16, 0.16, [0xf2f2f2, 0xe8c8c8, 0xd8e0c0][i % 3], [0, 2.7, -1.0 + i * 0.25]));
  arch.position.set(W0[0] - 3.6, 0, 0);
  add('wedding', arch);
  add('wedding', atmo.stringLights({ from: [W0[0] - 3.6, 2.6, -1.0], to: [W0[0] + 3.5, 3.2, -3.0], count: 20, sag: 0.4 }), atmo.stringLights({ from: [W0[0] - 3.6, 2.6, 1.0], to: [W0[0] + 3.5, 3.2, 3.0], count: 20, sag: 0.4 }));
  const groom = kit.human({ shirt: 0x2b2f38, pants: 0x2b2f38, tie: 0xe8e2d6, hair: 'short', hairColor: 0x8a5a2e, skin: kit.SKIN[0] });
  const bride = kit.human({ shirt: 0xf4f2ee, pants: 0xf4f2ee, hair: 'bun', hairColor: 0x3b2a20, skin: kit.SKIN[2] });
  add('wedding', groom, bride);
  // Stuhlreihen (Blick −x zum Bogen), Gang bei z = 0; dein Stuhl: erste Reihe, rechts am Gang
  const CH = D('b_wedding').chair;
  const guests = [];
  const guestPal = [0x8a949e, 0x6f7a86, 0xa3abb3, 0x9c8a76, 0xcdbda8, 0x7d6c5c, 0x5b6470];
  let gi = 0;
  for (let r = 0; r < 3; r++) {
    for (const z of [-2.1, -1.45, -0.8, 0.8, 1.45, 2.1]) {
      const x = W0[0] - 2.0 + r * 1.0;
      const c = P.chair(0xf2ede4);
      c.position.set(x, 0, z);
      c.rotation.y = -Math.PI / 2;
      add('wedding', c);
      const mine = Math.abs(x - (CH[0] - 3.0)) < 0.01 && Math.abs(z - 0.8) < 0.01;
      if (mine) continue;
      const g = kit.human({ shirt: guestPal[gi % guestPal.length], pants: 0x3a3a42, hair: ['short', 'long', 'bun', 'short', 'bald'][gi % 5], hairColor: kit.HAIR[gi % 6], skin: kit.SKIN[gi % 6], scale: 0.97 + (gi % 3) * 0.02 });
      g.setPosition(x, 0, z, -Math.PI / 2);
      g.phase = gi * 0.37;
      add('wedding', g);
      guests.push(g);
      gi++;
    }
  }
  // Foto auf deinem Stuhl
  const photoTex = (() => {
    const c = document.createElement('canvas');
    c.width = 160;
    c.height = 200;
    const g = c.getContext('2d');
    g.fillStyle = '#d9cfbf';
    g.fillRect(0, 0, 160, 200);
    g.fillStyle = '#9fb6c6';
    g.fillRect(14, 14, 132, 172);
    g.fillStyle = '#2c3a52';
    g.fillRect(30, 130, 100, 60);
    g.fillStyle = '#e8c4a0';
    g.fillRect(48, 52, 64, 72);
    g.fillStyle = '#3b2a20';
    g.fillRect(44, 40, 72, 22);
    g.fillStyle = '#1f1a18';
    g.fillRect(62, 82, 9, 10);
    g.fillRect(89, 82, 9, 10);
    g.fillRect(68, 106, 24, 5);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const myChairX = W0[0] - 2.0;
  const photo = kit.group(kit.box(0.26, 0.32, 0.03, 0x3a2a1e));
  const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.28), new THREE.MeshStandardMaterial({ map: photoTex, roughness: 0.5 }));
  pm.position.set(0, 0.16, 0.017);
  photo.add(pm);
  photo.position.set(myChairX - 0.05, 0.47, 0.8);
  photo.rotation.set(-0.18, -Math.PI / 2, 0);
  add('wedding', photo);
  const rose = kit.group(kit.box(0.015, 0.25, 0.015, 0x4a7a3a), kit.cbox(0.06, 0.06, 0.06, 0xf4f2ee, [0, 0.26, 0]));
  rose.position.set(myChairX - 0.15, 0.47, 0.62);
  rose.rotation.z = 1.3;
  add('wedding', rose);
  const standing = masses.crowd({ count: 160, area: [W0[0] + 1.6, W0[0] + 9, -6, 6], face: [W0[0] - 3.6, 0, 0], anim: 'cheer', palette: guestPal, seed: 43 });
  add('wedding', standing);
  const confetti = atmo.confetti({ center: [W0[0] - 2.6, 3.4, 0], spread: [5, 5], count: 260, colors: [0xf4f2ee, 0xf0d8a8, 0xe8c8c8, 0xffffff], fall: 1.1, seed: 47, life: 5 });
  add('wedding', confetti);

  // ---------------------------------------------------------------- 6) Klinikflur
  const corr = H.corridor(ORIGIN.corridor, { sign: 'INTENSIVSTATION' });
  add('corridor', corr);
  const LOOK_CORR = { ...kit.LOOKS.clinical, hemi: [0xe8f0f6, 0x8a949c, 1.15], sun: [0xe8f2ff, 0.8], exposure: 1.0 };

  // ---------------------------------------------------------------- Hilfen
  const at = (arr) => arr;
  const chatOld = (statusSent) => ({
    mode: 'chat', name: 'Lea', cracked: true, top: 180,
    messages: [
      { from: 'them', text: 'Wo bleibst du?' },
      statusSent
        ? { from: 'me', text: 'Bin gleich da!', status: 'Zugestellt', statusColor: '#2f7bf6' }
        : { from: 'me', text: 'Bin gleich da!', status: '! Nicht zugestellt', statusColor: '#ff3b30' },
    ],
  });

  return {
    update({ t }) {
      const b = B.active(t);
      const id = b.id;
      const place = b.place;
      const lt = B.local(t, id);
      for (const [k, g] of Object.entries(sets)) g.visible = k === place;
      // Sichtbarkeit Figuren
      you.root.visible = ['street', 'icu'].includes(place) && id !== 'b_cross' && id !== 'b_eyes' && id !== 'b_phone';
      lea.root.visible = ['b_lea', 'b_text', 'b_doctor', 'b_night', 'b_bench', 'b_end', 'b_lapse'].includes(id);
      mom.root.visible = ['b_mom', 'b_doctor', 'b_lapse'].includes(id);
      doc.root.visible = ['b_icu', 'b_doctor'].includes(id);
      nurse.root.visible = ['b_icu', 'b_eyes'].includes(id);
      tray.visible = id === 'b_eyes';
      me.setVisible(['b_cross', 'b_eyes', 'b_phone'].includes(id));
      setLids(1);
      penlight.visible = id === 'b_icu';
      clip.visible = false;
      handPlate.visible = false;
      icu.monGlow.set(id === 'b_end' || id === 'b_face' ? 0.15 : 1);
      leaPhone.root.visible = ['b_text', 'b_lea'].includes(id);
      povPhone.root.visible = id === 'b_cross' || id === 'b_phone';
      yourPhone.root.visible = id === 'b_ground';
      backrest.visible = ['b_face', 'b_phone', 'b_end'].includes(id);
      readLamp.set(id === 'b_night' ? 1 : 0);
      icu.setCeiling(1);
      age(leaHair, 0x5a3a24, 0x5a3a24, 0);
      age(momHair, 0x6b5a4a, 0x6b5a4a, 0);
      icu.setWindow(0xcfe2f2, 0.85, 0.35);
      icu.setCards(id === 'b_icu' || id === 'b_lea' ? 0 : id === 'b_lapse' ? 0 : id === 'b_hair' ? 16 : 27);
      flowerSets.forEach((f, i) => (f.visible = i === (id === 'b_icu' ? -1 : id === 'b_lea' ? -1 : 0)));
      teddy.visible = !['b_icu', 'b_lea'].includes(id);
      icu.clock.set(10.2 + lt * 0.05);
      // Patienten-Grundzustand (Haare aus dem Zeitverlauf: 0 bei Tag 0 … 1 bei Jahr 10)
      const years = { b_icu: 0, b_lea: 0, b_lapse: 0, b_hair: null, b_doctor: 0.55, b_night: 0.8, b_eyes: 1, b_face: 1, b_phone: 1, b_end: 1, b_ground: 0 }[id];
      if (years != null) growHair(years, years);
      youShoes.forEach((m) => (m.visible = place !== 'icu'));
      tube.visible = ['b_icu', 'b_lea', 'b_lapse', 'b_hair', 'b_doctor', 'b_night'].includes(id);
      icu.bed.userData.blanket.visible = true;
      let fx = {};
      const mon = { bpm: 72 };

      // ---------------- Straße
      if (place === 'street') {
        kit.applyLook({ scene, renderer, ...lights }, LOOK_STREET);
        kit.sunAt(lights.sun, ORIGIN.street, [-10, 30, -12]);
        rain.update(t, 1);
        const cd = D('b_cross').car;
        const tHit = ev('e_impact');
        const ts = t - B.beat('b_cross').from;
        const dHit = tHit - B.beat('b_cross').from;
        const z = ts < dHit ? cd[2] - 14 * ts : cd[2] - 14 * dHit - 14 * Math.min(0.5, ts - dHit) * 0.5;
        car.position.set(cd[0], 0, Math.max(z, 3.1));
        car.rotation.y = cd[3];
        headL.set(1);
        if (id === 'b_cross') {
          youShirt.color.setHex(0x2c3a52);
          sleeveMat.color.setHex(0x2c3a52);
          const typed = 'Bin gleich da!'.slice(0, Math.max(0, Math.floor((ts + 0.6) * 14)));
          povPhone.set({ mode: 'chat', name: 'Lea', top: 180, messages: [{ from: 'them', text: 'Wo bleibst du?' }], input: typed });
          me.act([{ t: 0, gesture: 'hold' }, { t: ev('e_horn'), gesture: 'show', blend: 0.3 }, { t: tHit, gesture: 'flail', blend: 0.08 }], t);
          // Fliegt das Handy weg: nach dem Aufprall aus der Hand
          povPhone.root.visible = t < tHit + 0.05;
          povPhone.root.scale.setScalar(0.3);
          const flash = clamp01(1 - (t - tHit) / 0.5) * (t >= tHit ? 1 : 0);
          fx = { bloom: 1.0, bloomThreshold: 0.62, grade: { saturation: 0.88, contrast: 1.08, tint: [0.96, 0.98, 1.06] }, flash: flash * 0.9, flashColor: 0xffffff, radial: t >= tHit ? 0.6 * flash : 0 };
          car.visible = true;
        } else {
          car.visible = false;
          const [x, y, z2, r] = D('b_ground').you;
          you.setPosition(x, 0.0, z2, r);
          you.act([{ t: 0, pose: 'lie', mood: 'unconscious' }], t);
          const ph = D('b_ground').phone;
          yourPhone.root.position.set(ph[0], ph[1], ph[2]);
          yourPhone.root.rotation.order = 'YXZ';
          yourPhone.root.rotation.set(-Math.PI / 2, Math.PI / 2, 0);
          yourPhone.root.scale.setScalar(3.0);
          yourPhone.set(chatOld(false));
          const bl = t >= ev('e_blue') - 0.4 ? 1 : 0;
          const w = Math.sin(t * 9) > 0;
          blueL.set(bl * (w ? 1 : 0.15) * 2.2);
          redL.set(bl * (w ? 0.1 : 1) * 1.2);
          const dim = ramp(t, B.beat('b_ground').to - 1.0, B.beat('b_ground').to);
          fx = { bloom: 0.9, bloomThreshold: 0.6, vignette: 0.35 + 0.4 * dim, grade: { saturation: 0.85, contrast: 1.06, tint: [0.95, 0.98, 1.07], lift: -0.02 * dim } };
        }
        blueL.root.visible = id === 'b_ground';
        groundLamp.root.visible = id === 'b_ground';
        redL.root.visible = id === 'b_ground';
      }

      // ---------------- Intensivzimmer
      if (place === 'icu') {
        youShirt.color.setHex(0x9fb6c6);
        sleeveMat.color.setHex(0x9fb6c6);
        kit.sunAt(lights.sun, ORIGIN.icu, [7, 22, 16]);
        let look = LOOK_ICU;
        const [yx, yy, yz, yr] = D('b_icu').you;
        const lying = !['b_face', 'b_phone', 'b_end'].includes(id);
        if (lying) {
          you.setPosition(yx, yy, yz, yr);
        } else {
          const [sx, sy, sz] = D('b_face').you;
          you.setPosition(sx, sy, sz, 0);
        }
        // Grundstellung
        if (lying) you.act([{ t: 0, pose: 'lie', mood: 'unconscious' }], t);
        lea.setPosition(0, -50, 0); // aus dem Bild, wenn nicht gesetzt
        icu.chair.position.set(-1.05, 0, -1.0);

        if (id === 'b_icu') {
          doc.setPosition(201.0, 0, -1.85, -Math.PI / 2);
          const pl = ev('e_penlight');
          doc.act([{ t: 0, pose: 'stand', mood: 'worried' }, { t: pl - 0.4, pose: 'point', mood: 'worried', blend: 0.4 }, { t: ev('e_gcs'), pose: 'stand', mood: 'sad', blend: 0.4, look: [0.3, 0.1] }], t);
          if (t > ev('e_gcs')) doc.look(0.25 * Math.sin((t - ev('e_gcs')) * 9) , 0); // Kopfschütteln
          nurse.setPosition(199.05, 0, -1.3, Math.PI / 2 - 0.3);
          nurse.act([{ t: 0, pose: 'stand', mood: 'neutral' }, { t: ev('e_doctors'), pose: 'reach', mood: 'worried', blend: 0.5 }], t);
          fx = { bloom: 0.35, bloomThreshold: 0.85, grade: { saturation: 0.88, contrast: 1.04, tint: [0.98, 1.0, 1.03] } };
        }
        if (id === 'b_lea') {
          const [lx, , lz, lr] = D('b_lea').lea;
          const inT = ev('e_lea_in');
          const k = ramp(t, B.beat('b_lea').from, inT + 0.5);
          lea.setPosition(lx + 0.5 * (1 - k), 0, lz + 0.6 * (1 - k), lr);
          lea.act([{ t: B.beat('b_lea').from, pose: 'walk', speed: 1.6, mood: 'worried' }, { t: inT + 0.4, pose: 'stand', mood: 'worried', blend: 0.3 }, { t: ev('e_lea_sees'), pose: 'handMouth', mood: 'cry', blend: 0.15 }, { t: ev('e_lea_phone'), pose: 'phone', mood: 'cry', blend: 0.4 }], t);
          leaPhone.set(chatOld(false));
          fx = { bloom: 0.35, bloomThreshold: 0.85, grade: { saturation: 0.88, contrast: 1.04, tint: [0.98, 1.0, 1.04] } };
        }
        if (id === 'b_lapse') {
          // Zeitraffer: 2,4 Tageszyklen, Uhr rast, Karten wachsen, Besucher wechseln
          const cyc = lt * 2.4;
          const day = 0.5 + 0.5 * Math.sin((cyc - 0.25) * Math.PI * 2);
          const winter = ramp(t, ev('e_winter') - 0.2, ev('e_winter') + 0.3);
          const autumn = ramp(lt, 1.6, 2.4) * (1 - winter);
          const dayCol = winter > 0.5 ? 0xf4f8fc : autumn > 0.5 ? 0xf2dcb0 : 0xd6e8f6;
          const col = new THREE.Color(0x1a2440).lerp(new THREE.Color(dayCol), day);
          icu.setWindow(col.getHex(), 0.3 + 0.7 * day, day * (1 - winter * 0.6));
          icu.setCeiling(0.35 + 0.65 * (1 - day));
          look = { sky: 0xe6eef2, fog: null, hemi: [0xf4fbff, 0x9aa4ac, 0.7 + 0.6 * day], sun: [0xfff4e6, 0.3 + 1.4 * day], exposure: 1.0 + 0.12 * (1 - day) };
          icu.clock.set(lt * 2.4 * 24);
          icu.setCards(Math.floor(3 + 24 * ramp(lt, 0.3, 4.2)));
          const seg = Math.floor(lt * 5);
          flowerSets.forEach((f, i) => (f.visible = i === seg % 3));
          growHair(0.25 * ramp(lt, 0, 4.6), 0.2 * ramp(lt, 0, 4.6));
          const who = [1, 0, 2, 1, 0, 1, 2, 0, 1, 2, 1, 0, 2, 1, 1, 0, 2, 1, 0, 1, 2, 1, 0][seg] ?? 0;
          if (who === 1) {
            lea.setPosition(198.95, 0, -1.0, Math.PI / 2);
            lea.act([{ t: 0, pose: seg % 2 ? 'holdHand' : 'think', mood: 'sad', seated: 1 }], t);
          }
          mom.setPosition(who === 2 ? 201.1 : 0, who === 2 ? 0 : -50, who === 2 ? -0.9 : 0, -2.4);
          mom.act([{ t: 0, pose: 'stand', mood: 'sad' }], t);
          fx = { bloom: 0.45, bloomThreshold: 0.8, grade: { saturation: 0.9, contrast: 1.05, tint: [0.99, 1.0, 1.02] } };
        }
        if (id === 'b_hair') {
          const k = ramp(t, ev('e_hair') - 0.3, B.beat('b_hair').to - 0.3);
          const kb = ramp(t, ev('e_beard') - 0.3, B.beat('b_hair').to);
          growHair(0.25 + 0.4 * k, 0.2 + 0.45 * kb);
          icu.setWindow(0xf2e4c8, 1, 0.9);
          look = { ...LOOK_ICU, sun: [0xffe2b8, 2.0] };
          fx = { bloom: 0.4, bloomThreshold: 0.82, grade: { saturation: 0.9, contrast: 1.05, tint: [1.02, 1.0, 0.98] } };
        }
        if (id === 'b_doctor') {
          const [dx, , dz, dr] = D('b_doctor').doc;
          doc.setPosition(dx, 0, dz, dr);
          doc.act([{ t: 0, pose: 'stand', mood: 'sad' }, { t: ev('e_dr_talk') - 0.2, pose: 'point', mood: 'sad', blend: 0.4 }, { t: ev('e_mom_no') + 0.3, pose: 'shrug', mood: 'sad', blend: 0.5 }], t);
          clip.position.set(dx + Math.sin(dr) * 0.3 + Math.cos(dr) * 0.18, 1.0, dz + Math.cos(dr) * 0.3 - Math.sin(dr) * 0.18);
          clip.rotation.set(0, dr, 0.0);
          clip.rotation.x = -0.7;
          const [mx, , mz, mr] = D('b_doctor').mom;
          const mk = ramp(t, ev('e_mom_no') - 0.4, ev('e_mom_no') + 0.3);
          mom.setPosition(mx + 0.25 * mk, 0, mz, mr + 1.7 * mk);
          mom.act([{ t: 0, pose: 'stand', mood: 'worried' }, { t: ev('e_mom_no'), pose: 'yell', mood: 'angry', blend: 0.25 }], t);
          if (t > ev('e_mom_no') + 0.2 && t < ev('e_mom_no') + 1.6) mom.look(0.3 * Math.sin((t - ev('e_mom_no')) * 10), 0);
          age(momHair, 0x6b5a4a, 0xa8a8a8, 0.5);
          const [lx, , lz, lr] = D('b_doctor').lea;
          lea.setPosition(lx, 0, lz, lr);
          lea.act([{ t: 0, pose: 'think', mood: 'sad', seated: 1 }, { t: ev('e_lea_hold'), pose: 'holdHand', mood: 'cry', seated: 1, blend: 0.5 }], t);
          age(leaHair, 0x5a3a24, 0x8a8a8a, 0.25);
          icu.chair.position.set(lx - 200 + 0.0, 0, lz + 0.05);
          icu.setWindow(0xb8c4ce, 0.7, 0);
          look = { ...LOOK_ICU, hemi: [0xe8f0f6, 0x8a949c, 1.15], sun: [0xdfe8f0, 0.9] };
          fx = { bloom: 0.3, bloomThreshold: 0.85, grade: { saturation: 0.82, contrast: 1.07, tint: [0.97, 0.99, 1.04] } };
        }
        if (id === 'b_night') {
          look = LOOK_ICU_NIGHT;
          icu.setCeiling(0.04);
          icu.setWindow(0x1c2a50, 0.35, 0);
          const [lx, , lz, lr] = D('b_night').lea;
          icu.chair.position.set(lx - 200, 0, lz);
          lea.setPosition(lx, 0, lz, lr);
          age(leaHair, 0x5a3a24, 0x9a9a9a, 0.55);
          const tw = ev('e_twitch');
          lea.act([{ t: 0, pose: 'slump', mood: 'unconscious', seated: 1 }, { t: tw + 0.15, pose: 'recoil', mood: 'shock', seated: 1, blend: 0.12, local: true }, { t: ev('e_lea_up'), pose: 'reach', mood: 'relief', seated: 1, blend: 0.4 }], t);
          // Lider flattern 3× nach dem Zucken
          const s = t - tw;
          const flutter = s > 0 && s < 0.9 && Math.floor(s * 7) % 2 === 0;
          you.act([{ t: 0, pose: 'lie', mood: flutter ? 'worried' : 'unconscious' }], t);
          if (s > 0) {
            mon.bpm = 72 + 34 * clamp01(1 - (s - 0.8) / 1.2);
            mon.strong = 1 + 0.6 * clamp01(1 - s);
            mon.alarm = s < 1.4 ? 1 : 0;
          }
          fx = { bloom: 0.85, bloomThreshold: 0.6, grade: { saturation: 0.86, contrast: 1.08, tint: [0.98, 0.98, 1.05] } };
        }
        if (id === 'b_eyes') {
          // Ich-Perspektive aus dem Bett: Lider öffnen sich, Blinzeln, Deckenlicht überstrahlt
          const e0 = ev('e_eyes');
          const s = t - e0;
          let open = 0.0;
          if (s > 0) open = 0.35 * ramp(s, 0, 0.5);
          if (s > 0.8) open = 0.35 * (1 - ramp(s, 0.8, 0.95));
          if (s > 0.95) open = 0.7 * ramp(s, 0.95, 1.35);
          if (s > 1.6) open = 0.7 + 0.3 * ramp(s, 1.6, 2.2);
          setLids(open);
          me.act([{ t: 0, gesture: 'lie' }, { t: ev('e_hands'), gesture: 'reach', blend: 1.2 }], t);
          me.right.g.position.y += -0.04 + 0.02 * Math.sin(t * 2.1);
          const [nx, , nz, nr] = D('b_eyes').nurse;
          nurse.setPosition(nx - 0.25, 0, nz, nr);
          const dr = ev('e_drop');
          nurse.act([{ t: 0, pose: 'carry', mood: 'neutral' }, { t: dr - 0.15, pose: 'handMouth', mood: 'shock', blend: 0.12 }], t);
          const fall = clamp01((t - dr) / 0.35);
          tray.position.set(nx - 0.25, 1.05 - 1.02 * fall * fall, nz + 0.35);
          tray.rotation.set(fall * 0.9, 0, fall * 0.5);
          mon.bpm = 88;
          const blur = 1 - ramp(s, 0.3, 2.4);
          fx = { bloom: 0.6 + 0.9 * blur, bloomThreshold: 0.55, radial: 0.9 * blur, grade: { saturation: 0.82, contrast: 1.03, tint: [0.99, 1.0, 1.03], lift: 0.02 * blur } };
        }
        if (id === 'b_face') {
          const mk = ev('e_mirror');
          you.act([{ t: 0, pose: 'stand', mood: 'shock', seated: 1 }, { t: mk, pose: 'handMouth', mood: 'shock', seated: 1, blend: 0.4 }, { t: ev('e_weak'), pose: 'stand', mood: 'sad', seated: 1, blend: 0.18, look: [0.15, 0.12] }], t);
          icu.bed.userData.blanket.visible = true;
          fx = { bloom: 0.4, bloomThreshold: 0.82, grade: { saturation: 0.88, contrast: 1.05, tint: [0.99, 1.0, 1.02] } };
        }
        if (id === 'b_phone') {
          // Ich-Sicht im Bett sitzend: dein altes Handy
          const s0 = ev('e_unread');
          const sc = ev('e_scroll');
          const rs = ev('e_resend');
          if (t < s0) povPhone.set({ mode: 'lock', time: '9:12', date: 'Dienstag, 14. Oktober 2036', cracked: true });
          else if (t < sc) {
            povPhone.set({
              mode: 'chat', name: 'Lea', cracked: true, unread: '3.652', top: 180,
              messages: [
                { from: 'them', text: 'Tag 3.650. Ich bin noch da.' },
                { from: 'them', text: 'Tag 3.651. Mama war heute auch da.' },
                { from: 'them', text: 'Ich sitz draußen im Flur.' },
              ],
            });
          } else povPhone.set(chatOld(t >= rs));
          me.act([{ t: 0, gesture: 'show' }, { t: rs - 0.5, gesture: 'point', blend: 0.3 }, { t: rs + 0.25, gesture: 'show', blend: 0.4 }], t);
          povPhone.root.scale.setScalar(0.45);
          look = { ...LOOK_ICU, exposure: 0.86 };
          povPhone.root.position.set(0.04, 0.1, -0.03);
          fx = { bloom: 0.15, bloomThreshold: 0.92, grade: { saturation: 0.9, contrast: 1.04, tint: [0.99, 1.0, 1.02] } };
        }
        if (id === 'b_end') {
          look = LOOK_ICU_WARM;
          icu.setWindow(0xffe2b0, 1, 1.4);
          const arr = ev('e_arrive');
          const [lx, , lz, lr] = D('b_end').lea;
          const k = ramp(t, B.beat('b_end').from, arr);
          lea.setPosition(lx + 1.2 * (1 - k), 0, lz + 1.4 * (1 - k), lr);
          lea.act([{ t: B.beat('b_end').from, pose: 'run', speed: 2.2, mood: 'cry' }, { t: arr - 0.1, pose: 'hug', mood: 'cry', blend: 0.3 }, { t: ev('e_smile'), pose: 'hug', mood: 'relief', blend: 0.5 }], t);
          age(leaHair, 0x5a3a24, 0x9a9a9a, 0.6);
          you.act([{ t: 0, pose: 'stand', mood: 'shock', seated: 1 }, { t: arr, pose: 'hug', mood: 'cry', seated: 1, blend: 0.4 }, { t: ev('e_smile'), pose: 'hug', mood: 'relief', seated: 1, blend: 0.5 }], t);
          fx = { bloom: 0.5, bloomThreshold: 0.78, grade: { saturation: 0.92, contrast: 1.07, tint: [1.05, 1.0, 0.93] } };
        }
        icu.monitor.update(t, mon);
        kit.applyLook({ scene, renderer, ...lights }, look);
      }

      // ---------------- Wohnung
      if (place === 'apartment') {
        kit.applyLook({ scene, renderer, ...lights }, LOOK_APT);
        kit.sunAt(lights.sun, ORIGIN.apartment, [-10, 20, -8]);
        const [lx, , lz, lr] = D('b_text').lea;
        lea.setPosition(lx, 0, lz, lr);
        age(leaHair, 0x5a3a24, 0x5a3a24, 0);
        lea.act([{ t: 0, pose: 'phone', mood: 'sad', seated: 1 }, { t: ev('e_wait'), pose: 'slump', mood: 'cry', seated: 1, blend: 0.5 }], t);
        const typed = 'Wach bitte auf.'.slice(0, Math.max(0, Math.floor((t - ev('e_type')) * 10)));
        leaPhone.set(t < ev('e_send') ? { mode: 'chat', name: 'Schatz', messages: [], input: typed } : { mode: 'chat', name: 'Schatz', messages: [{ from: 'me', text: 'Wach bitte auf.', status: 'Zugestellt' }] });
        fx = { bloom: 0.7, bloomThreshold: 0.7, grade: { saturation: 0.86, contrast: 1.07, tint: [1.02, 0.99, 0.98] } };
      }

      // ---------------- Elternhaus
      if (place === 'home') {
        kit.applyLook({ scene, renderer, ...lights }, LOOK_HOME);
        kit.sunAt(lights.sun, ORIGIN.home, [-12, 22, 14]);
        const [mx, , mz, mr] = D('b_mom').mom;
        age(momHair, 0x6b5a4a, 0xa8a8a8, 0.2);
        const placed = t >= ev('e_plate') + 0.25 && t < ev('e_plate_back') + 0.2;
        tablePlate.visible = placed;
        handPlate.visible = !placed;
        mom.setPosition(mx, 0, mz, mr);
        mom.act([{ t: 0, pose: 'carry', mood: 'neutral' }, { t: ev('e_plate') - 0.2, pose: 'reach', mood: 'neutral', blend: 0.4 }, { t: ev('e_mom_stop'), pose: 'stand', mood: 'sad', blend: 0.5, look: [0.5, 0.15] }, { t: ev('e_plate_back') - 0.1, pose: 'reach', mood: 'sad', blend: 0.3 }, { t: ev('e_plate_back') + 0.4, pose: 'carry', mood: 'cry', blend: 0.4, look: [0, 0.1] }], t);
        fx = { bloom: 0.4, bloomThreshold: 0.85, grade: { saturation: 0.86, contrast: 1.04, tint: [1.03, 1.0, 0.96] } };
      }

      // ---------------- Hochzeit
      if (place === 'wedding') {
        kit.applyLook({ scene, renderer, ...lights }, 'goldenHour');
        kit.sunAt(lights.sun, [W0[0] - 1, 0, 0.8], [-16, 11, 9]);
        const kiss = ev('e_kiss');
        groom.setPosition(W0[0] - 3.1, 0, 0.32, -Math.PI / 2 + (t > kiss - 0.3 ? -0.9 : 0));
        bride.setPosition(W0[0] - 3.1, 0, -0.32, -Math.PI / 2 + (t > kiss - 0.3 ? -2.3 + Math.PI : 0));
        groom.act([{ t: 0, pose: 'holdHand', mood: 'happy' }, { t: kiss - 0.3, pose: 'hug', mood: 'laugh', blend: 0.3 }, { t: ev('e_cheer'), pose: 'cheer', mood: 'laugh', blend: 0.4 }], t);
        bride.act([{ t: 0, pose: 'holdHand', mood: 'happy' }, { t: kiss - 0.3, pose: 'hug', mood: 'laugh', blend: 0.3 }, { t: ev('e_cheer'), pose: 'cheer', mood: 'laugh', blend: 0.4 }], t);
        guests.forEach((g, i) => g.act([{ t: 0, pose: 'sit', mood: 'happy', seated: 1 }, { t: kiss + 0.1 + (i % 4) * 0.08, pose: 'cheer', mood: 'laugh', seated: 1, blend: 0.3, speed: 1.2 + (i % 3) * 0.2 }], t));
        standing.update(t, { k: ramp(t, kiss, kiss + 0.6) });
        confetti.update(t - kiss, 1);
        fx = { bloom: 0.6, bloomThreshold: 0.78, grade: { saturation: 0.9, contrast: 1.05, tint: [1.05, 1.0, 0.93] } };
      }

      // ---------------- Flur
      if (place === 'corridor') {
        kit.applyLook({ scene, renderer, ...lights }, LOOK_CORR);
        kit.sunAt(lights.sun, ORIGIN.corridor, [6, 22, 16]);
        const [lx, , lz] = D('b_bench').lea;
        const st = ev('e_lea_stand');
        const run = Math.max(0, t - st - 0.4);
        lea.setPosition(lx + run * 2.4, 0, lz + 0.15 * ramp(t, st, st + 0.4), run > 0 ? Math.PI / 2 : 0);
        age(leaHair, 0x5a3a24, 0x9a9a9a, 0.6);
        lea.act([{ t: 0, pose: 'sit', mood: 'tired', seated: 1, look: [0, 0.35] }, { t: ev('e_buzz') + 0.35, pose: 'handMouth', mood: 'shock', seated: 1, blend: 0.15, look: [0, 0.1] }, { t: st, pose: 'stand', mood: 'cry', seated: 0, blend: 0.35 }, { t: st + 0.4, pose: 'run', speed: 2.4, mood: 'cry', blend: 0.25 }], t);
        const lift = ramp(t, st, st + 0.4);
        benchPhone.root.position.set(lx - 0.02, 0.7 + 0.2 * lift, lz + 0.5);
        benchPhone.root.rotation.set(-0.75, 0, 0);
        benchPhone.root.scale.setScalar(2.7);
        benchPhone.root.visible = run <= 0;
        benchPhone.set(t < ev('e_buzz') ? { mode: 'lock', time: '9:13', date: 'Dienstag, 14. Oktober 2036' } : { mode: 'lock', time: '9:13', date: 'Dienstag, 14. Oktober 2036', banner: { name: 'Schatz', text: 'Bin gleich da!' } });
        fx = { bloom: 0.5, bloomThreshold: 0.78, grade: { saturation: 0.88, contrast: 1.05, tint: [0.98, 1.0, 1.03] } };
      }

      // Weiche Licht-Übergänge an Abblenden zwischen sehr hellen und dunklen/andersfarbigen Orten (Guide 18.2: Lichtstimmung
      // angleichen) – Belichtung in den letzten/ersten Zehnteln des Beats absenken, damit die 6-Frame-Abblende sauber bleibt.
      const FADE = { b_icu: [0.5, 0], b_hair: [0, 0.35], b_wedding: [0.35, 0], b_phone: [0, 0.35], b_bench: [0.35, 0] }[id];
      if (FADE) {
        let k = 1;
        if (FADE[0]) k = Math.min(k, ramp(lt, 0, FADE[0]));
        if (FADE[1]) k = Math.min(k, 1 - ramp(t, b.to - FADE[1], b.to));
        renderer.toneMappingExposure *= 0.3 + 0.7 * k;
      }
      return { fx };
    },
  };
}
