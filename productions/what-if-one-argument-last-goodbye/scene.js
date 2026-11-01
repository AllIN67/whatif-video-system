// What if one argument was your last goodbye? – Stil B, Rezept B1 (Drama-Variante), 2026-11-01.
// Nur Baukasten-Teile. Zeiten ausschließlich aus timeline.json (erzeugt aus beats.json): B.beat(id), B.ev(id).
// Positionen der Figuren stehen in beats.json → data. Texte (Grabinschrift) aus text.en.json → scene.
import { createKit } from '/pipeline/runtime/kit/index.js';

export async function build({ THREE, scene, renderer, rng, timeline, assetUrl, fetchJson }) {
  const kit = createKit({ THREE, scene, renderer, rng });
  const { props: P, places: PL, ramp, lerp, clamp01 } = kit;
  const B = kit.beatClock(timeline);
  const text = await fetchJson(assetUrl('text.en.json'));
  const lights = kit.setupLook({ scene, renderer }, 'day');
  const L = { scene, renderer, ...lights };

  // ---------- Orte ----------
  const cem = PL.cemetery([0, 0, 0], { stoneText: text.scene?.stone || '' });
  const home = PL.livingRoom([40, 0, 0]);
  const front = PL.houseFront([0, 0, 120]);
  const ROAD_O = [200, 0, 0];
  const road = PL.nightRoad(ROAD_O, { length: 600, wet: true, signAt: 95 });
  for (const p of [cem, home, front, road]) scene.add(p.root);

  // ---------- Lichtstimmungen je Ort (Guide 18.4; Nachtszenen bewusst hell genug für lesbare Gesichter, 18.11) ----------
  const LK = {
    grave: { sky: 0xb4bec8, fog: [0xb4bec8, 22, 85], hemi: [0xf0f3f6, 0x7d8378, 1.65], sun: [0xf4efe6, 1.15], exposure: 1.0 },
    warm: { sky: 0xd9c8b0, fog: null, hemi: [0xffe8d0, 0x8a7060, 1.35], sun: [0xffd6a0, 1.7], exposure: 1.02 },
    tense: { sky: 0xb8bcc8, fog: null, hemi: [0xdde2ee, 0x5a5664, 1.15], sun: [0xf0e4d4, 1.35], exposure: 1.0 },
    night: { sky: 0x1e2944, fog: [0x1e2944, 35, 170], hemi: [0xa8b8e8, 0x343442, 1.45], sun: [0xc0ccff, 1.0], exposure: 1.3 },
    storm: { sky: 0x232a3c, fog: [0x232a3c, 18, 90], hemi: [0xa8b4d8, 0x2a2c36, 1.4], sun: [0xc0ccff, 0.85], exposure: 1.32 },
    black: { sky: 0x000000, fog: [0x000000, 1, 2], hemi: [0x000000, 0x000000, 0], sun: [0x000000, 0], exposure: 1.0 },
  };
  const LOOK = {
    hook: 'grave', mom_react: 'grave', home_happy: 'warm', argue: 'tense', kids_watch: 'tense', dad_slam: 'tense', keys_pov: 'tense',
    driveway: 'night', accelerate: 'night', driver_close: 'night', skid: 'storm', impact: 'storm', approach: 'storm', interior: 'storm',
    grave_flowers: 'grave', drawing_down: 'grave', understand: 'grave', hug: 'grave', msg1: 'black', msg2: 'black',
  };

  // ---------- Figuren (gleiche Objekte in allen Szenen – Kontinuität; Kleidungsfarben = Farben der Kinderzeichnung) ----------
  const dad = kit.human({ shirt: 0x2f62c0, pants: 0x2a2f3a, hair: 'short', hairColor: 0x3b2a20, beard: 0x4a2e1e, skin: kit.SKIN[1], blinkSeed: 0.4 });
  const mom = kit.human({ shirt: 0xc8457a, pants: 0x2d2d38, hair: 'long', hairColor: 0x8a5a2e, skin: kit.SKIN[0], blinkSeed: 1.3 });
  const boy = kit.human({ shirt: 0xe0702a, pants: 0x2d3e66, hair: 'short', hairColor: 0x3b2a20, skin: kit.SKIN[0], scale: 0.6, headScale: 1.45, blinkSeed: 2.2 });
  const tod = kit.human({ shirt: 0x3aa04a, pants: 0x6b5a45, hair: 'spiky', hairColor: 0xd9b04a, skin: kit.SKIN[5], scale: 0.5, headScale: 1.55, blinkSeed: 2.9 });
  for (const h of [dad, mom, boy, tod]) scene.add(h.root);

  // ---------- Requisiten ----------
  const drawing = P.drawing();
  scene.add(drawing);
  const flowers = P.flowers();
  scene.add(flowers);
  const keys = P.keys();
  scene.add(keys);
  const toyCar = P.sportsCar({ color: 0xb9bec6, glassOpacity: 0.9 });
  toyCar.scale.setScalar(0.055);
  scene.add(toyCar);
  const crayonBits = kit.fx.burst({ color: 0xe0303a, count: 10, speed: 0.9, life: 0.5, size: 0.015 });
  scene.add(crayonBits.root);

  const CAR_S = 1.22;
  const car = P.sportsCar({ color: 0xb9bec6 });
  car.scale.setScalar(CAR_S);
  scene.add(car);
  const carPhone = P.phone({ mode: 'call', caller: { skin: '#e8c4a0', hair: '#8a5a2e', long: true } });
  carPhone.position.set(0.12, 0.93, 0.46);
  carPhone.rotation.set(-0.35, Math.PI, 0); // Bildschirm zum Fahrer (−z)
  car.add(carPhone);
  let phoneOn = null;
  const carPhoneScreen = (on) => {
    if (on === phoneOn) return;
    phoneOn = on;
    carPhone.userData.setScreen(on ? { mode: 'call', caller: { skin: '#e8c4a0', hair: '#8a5a2e', long: true } } : { mode: 'off', bg: '#05060a' });
  };
  // Scheinwerferkegel
  const heads = [-1, 1].map((sx) => {
    const s = new THREE.SpotLight(0xfff2d8, 0, 45, 0.42, 0.5, 1.1);
    s.position.set(sx * 0.6, 0.76, 2.2);
    const tg = new THREE.Object3D();
    tg.position.set(sx * 0.5, 0.0, 12);
    car.add(s, tg);
    s.target = tg;
    return s;
  });
  const dashLight = new THREE.PointLight(0xffa860, 0, 2.2, 1.6);
  dashLight.position.set(0.38, 1.05, 0.25);
  car.add(dashLight);
  const phoneGlow = new THREE.PointLight(0x9fc4ff, 0, 1.8, 1.6);
  phoneGlow.position.set(0.25, 1.05, 0.3);
  car.add(phoneGlow);
  // kühles Fülllicht von außen (Straßenlaterne) aufs Gesicht des Fahrers – Gesicht lesbar (Guide 18.11)
  const faceLight = new THREE.PointLight(0xc8d4ff, 0, 3.2, 1.4);
  faceLight.position.set(1.45, 1.35, -0.1);
  car.add(faceLight);
  const hazardLight = new THREE.PointLight(0xff9a30, 0, 9, 1.4);
  hazardLight.position.set(0, 1.2, 0);
  car.add(hazardLight);

  const sparks = kit.fx.burst({ color: 0xffb040, count: 40, speed: 4.2, life: 0.7, size: 0.035 });
  const glass = kit.fx.burst({ color: 0xcfe8ff, count: 34, speed: 2.6, life: 0.9, size: 0.03 });
  scene.add(sparks.root, glass.root);
  const smoke = P.smoke({ count: 26 });
  scene.add(smoke);
  const exhaust = P.smoke({ count: 10, color: 0x8a9098 });
  exhaust.scale.setScalar(0.45);
  scene.add(exhaust);
  const rain = kit.fx.rain({ size: [22, 14, 26], count: 1300 });
  scene.add(rain.root);
  const leaves = P.leaves({ count: 70, size: [12, 5, 10] });
  scene.add(leaves);

  // Raumlichter
  const lampLight = new THREE.PointLight(0xffc98a, 0, 8, 1.5);
  lampLight.position.set(41.0, 1.9, -2.0);
  scene.add(lampLight);
  const porchLight = new THREE.PointLight(0xffd890, 0, 9, 1.4);
  porchLight.position.set(-1.9, 2.3, 118.6);
  scene.add(porchLight);
  const streetLight = new THREE.PointLight(0xffe2a0, 0, 16, 1.2);
  streetLight.position.set(7.2, 3.8, 132);
  scene.add(streetLight);
  // Laternenlicht auf der Fahrbahn: zwei Lichter folgen den nächsten Laternen (keine 20 Punktlichter)
  const roadLights = [0, 1, 2].map(() => {
    const l = new THREE.PointLight(0xffd8a0, 0, 22, 1.1);
    scene.add(l);
    return l;
  });
  const lampWorld = road.lamps.map((l) => [l.position.x + 0.38, 3.9, l.position.z]);
  const passLight = new THREE.PointLight(0xffd8a0, 0, 14, 1.3);
  scene.add(passLight);

  // ---------- Hilfen ----------
  const ev = B.ev;
  const at = (id) => B.beat(id).from;
  const dur = (id) => B.beat(id).to - B.beat(id).from;
  const D = (id, key) => B.beat(id).data[key];
  const place = (h, p, rot) => h.setPosition(p[0], p[1], p[2], rot ?? p[3] ?? 0);
  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const easeOut = (x) => 1 - (1 - clamp01(x)) ** 2;
  // Gegenstand in einer Hand (Weltposition der Hand + Versatz in Figurenrichtung)
  const toHand = (obj, h, side, off = [0, -0.06, 0.05], rot = null) => {
    const hand = h.hands[side];
    hand.updateWorldMatrix(true, false);
    tmp.set(off[0], off[1], off[2]);
    hand.localToWorld(tmp);
    obj.position.copy(tmp);
    if (rot) obj.rotation.set(rot[0], rot[1], rot[2]);
  };
  // Zeichnung zwischen beiden Händen (Bildseite zur Figur hin oder nach oben)
  const betweenHands = (obj, h, up = 0.0) => {
    h.hands.left.updateWorldMatrix(true, false);
    h.hands.right.updateWorldMatrix(true, false);
    h.hands.left.getWorldPosition(tmp);
    h.hands.right.getWorldPosition(tmp2);
    obj.position.set((tmp.x + tmp2.x) / 2, (tmp.y + tmp2.y) / 2 - 0.04 + up, (tmp.z + tmp2.z) / 2);
  };
  const seat = () => {
    car.updateWorldMatrix(true, true);
    car.userData.seatMarker.getWorldPosition(tmp);
    return [tmp.x, tmp.y - 0.4, tmp.z];
  };
  const placeCar = (x, z, rot) => {
    car.position.set(x, 0, z);
    car.rotation.set(0, rot, 0);
  };
  const driver = (track, t) => {
    const s = seat();
    dad.setPosition(s[0], s[1], s[2], car.rotation.y);
    dad.act(track, t);
  };
  const setRoadLights = (zRef, on) => {
    const near = lampWorld.map((p) => [Math.abs(p[2] + road.root.position.z - ROAD_O[2] - zRef), p]).sort((a, b) => a[0] - b[0]);
    roadLights.forEach((l, i) => {
      const p = near[i][1];
      l.position.set(p[0], p[1], p[2] + road.root.position.z - ROAD_O[2]);
      l.intensity = on ? 34 : 0;
    });
  };
  const blackLook = LK.black;

  return {
    update({ t }) {
      const b = B.active(t);
      const id = b.id;
      const lt = t - b.from;
      let flash = 0;

      // Licht je Beat; Lichtwechsel innerhalb eines Beats nur als Ereignis (Herzstillstand: Armaturen erlöschen)
      if (id === 'interior') kit.applyLook(L, LK.storm, { ...LK.storm, hemi: [0x6a78a0, 0x16181e, 0.75], exposure: 1.18 }, ramp(t, ev('flat'), ev('flat') + 0.9));
      else kit.applyLook(L, LK[LOOK[id]] || blackLook);
      const origin = { cemetery: [0, 0, 1.5], livingroom: [40, 0, -0.5], driveway: [3, 0, 122], road: [car.position.x, 0, car.position.z], car: [car.position.x, 0, car.position.z], crash_site: [201.5, 0, 128], black: [0, 0, -600] }[b.place];
      kit.sunAt(lights.sun, origin);

      // ---------- Sichtbarkeit ----------
      const inGrave = b.place === 'cemetery';
      const inHome = b.place === 'livingroom';
      const carScene = ['driveway', 'road', 'car', 'crash_site'].includes(b.place);
      boy.root.visible = inGrave || inHome;
      tod.root.visible = inGrave || inHome;
      mom.root.visible = inGrave || inHome;
      dad.root.visible = inHome || carScene;
      car.visible = carScene;
      toyCar.visible = inHome;
      keys.visible = inHome;
      flowers.visible = inGrave;
      drawing.visible = inGrave || inHome;
      rain.root.visible = false;
      leaves.visible = inGrave;
      smoke.visible = false;
      exhaust.visible = false;
      boy.head.visible = true;
      lampLight.intensity = inHome ? (id === 'home_happy' ? 6 : 4) : 0;
      porchLight.intensity = id === 'driveway' ? 5 : 0;
      streetLight.intensity = id === 'driveway' ? 30 : 0;
      roadLights.forEach((l) => (l.intensity = 0));
      passLight.intensity = 0;
      dashLight.intensity = 0;
      phoneGlow.intensity = 0;
      hazardLight.intensity = 0;
      faceLight.intensity = 0;
      for (const h of heads) h.intensity = 0;
      road.root.position.set(ROAD_O[0], ROAD_O[1], ROAD_O[2]);
      car.userData.setCrash(['impact', 'approach', 'interior'].includes(id) ? (id === 'impact' ? ramp(t, ev('crash_hit'), ev('crash_hit') + 0.12) : 1) : 0);
      for (const r of road.rails) r.r.userData.setDent(0);
      if (inGrave) leaves.userData.update(t, id === 'hug' ? 0.6 + 0.6 * ramp(t, ev('leaves'), ev('leaves') + 0.8) : 0.35);

      // ================= FRIEDHOF =================
      if (inGrave) {
        const bp = D(id, 'boy') || D('hook', 'boy');
        const mp = D(id, 'mom') || D('hook', 'mom');
        const tp = D(id, 'tod') || D('hook', 'tod');
        place(boy, bp);
        place(mom, mp);
        place(tod, tp);
        // Blumen: liegen erst nach der Rückkehr (flowers_down) auf dem Grab; vorher in der Hand der Mutter
        const fs = cem.spots.flowers;
        const flowersLaid = id !== 'grave_flowers' || t >= ev('flowers_down');
        const flowersVisible = !['hook', 'mom_react'].includes(id);
        flowers.visible = flowersVisible;
        // Zeichnung: im Hook in den Händen (wird abgesenkt), ab drawing_placed liegt sie auf dem Grab
        const ds = cem.spots.drawing;
        const laid = (id === 'drawing_down' && t >= ev('drawing_placed')) || ['understand', 'hug'].includes(id);

        if (id === 'hook') {
          boy.act([
            { t: at('hook'), pose: 'kneel', mood: 'sad', look: [0, 0.1] },
            { t: ev('drawing_lower') + 0.1, pose: 'placeLow', blend: 1.3 },
            { t: ev('look_up') - 0.15, pose: 'kneel', blend: 0.7, look: [0.5, -0.42], mood: 'worried' },
            { t: ev('look_up') + 0.9, mood: 'sad', blend: 0.8 },
          ], t);
          mom.act([{ t: at('hook'), pose: 'holdHand', mood: 'sad', look: [0, 0.15] }], t);
          tod.act([{ t: at('hook'), pose: 'reachUp', mood: 'neutral', look: [0.4, -0.3] }], t);
        }
        if (id === 'mom_react') {
          boy.head.visible = false; // Ich-Perspektive des Jungen
          boy.act([{ t: at('mom_react'), pose: 'kneel', mood: 'worried', look: [0.5, -0.42] }], t);
          const k = ramp(t, ev('mom_turn'), ev('mom_turn') + 0.7);
          mom.setPosition(mp[0], 0, mp[2], lerp(mp[3], D('mom_react', 'momFace'), k));
          mom.act([
            { t: at('mom_react'), pose: 'holdHand', mood: 'sad' },
            { t: ev('mom_turn'), pose: 'handMouth', mood: 'cry', blend: 0.55, look: [0, 0.18] },
            { t: ev('mom_kneel'), pose: 'kneel', blend: 0.8, look: [0, 0.1] },
            { t: ev('mom_kneel') + 0.9, pose: 'kneelHug', blend: 0.9 },
          ], t);
          tod.act([{ t: at('mom_react'), pose: 'stand', mood: 'worried', look: [0.6, -0.35] }], t);
        }
        if (id === 'grave_flowers') {
          const tf = ev('flowers_down');
          mom.act([
            { t: at('grave_flowers'), pose: 'holdHand', mood: 'sad', look: [0, 0.2] },
            { t: tf - 0.7, pose: 'placeLow', blend: 0.75 },
            { t: tf + 0.6, pose: 'kneel', blend: 0.6, mood: 'cry' },
          ], t);
          tod.act([
            { t: at('grave_flowers'), pose: 'reachUp', mood: 'neutral', look: [0.4, -0.25] },
            { t: tf - 0.6, pose: 'stand', blend: 0.6, look: [0.2, 0.2] },
            { t: tf + 0.2, pose: 'reachUp', blend: 0.5, mood: 'sad' },
          ], t);
          boy.act([
            { t: at('grave_flowers'), pose: 'carry', mood: 'sad', look: [0, 0.2] },
            { t: tf + 0.5, pose: 'kneel', blend: 0.7 },
          ], t);
        }
        if (id === 'drawing_down') {
          const tp2 = ev('drawing_placed');
          boy.act([
            { t: at('drawing_down'), pose: 'kneel', mood: 'sad', look: [0, 0.25] },
            { t: at('drawing_down') + 0.1, pose: 'placeLow', blend: 0.7 },
            { t: ev('smooth') + 0.4, pose: 'kneel', blend: 0.6 },
          ], t);
          mom.act([{ t: at('drawing_down'), pose: 'kneel', mood: 'cry' }], t);
          tod.act([{ t: at('drawing_down'), pose: 'reachUp', mood: 'sad' }], t);
          if (t < tp2) {
            betweenHands(drawing, boy, 0.02);
            drawing.rotation.set(0, Math.PI + 0.06, 0);
          }
        }
        if (id === 'understand') {
          boy.act([
            { t: at('understand'), pose: 'kneel', mood: 'sad', look: [0, -0.32] },
            { t: ev('realize'), mood: 'cry', blend: 0.9, look: [0.05, -0.38] },
            { t: ev('realize') + 1.0, pose: 'kneelHug', blend: 1.0, look: [0, -0.2] },
          ], t);
          mom.act([{ t: at('understand'), pose: 'kneel', mood: 'cry' }], t);
          tod.act([{ t: at('understand'), pose: 'reachUp', mood: 'sad' }], t);
        }
        if (id === 'hug') {
          const th = ev('hug_in');
          const k = ramp(t, at('hug'), th + 0.3);
          mom.setPosition(lerp(mp[0], -0.05, k), 0, lerp(mp[2], 2.62, k), mp[3]);
          mom.act([
            { t: at('hug'), pose: 'kneel', mood: 'cry' },
            { t: th - 0.3, pose: 'kneelHug', blend: 0.7, look: [0, 0.15] },
          ], t);
          const kb = ramp(t, at('hug') + 0.2, th + 0.4);
          boy.setPosition(lerp(bp[0], 0.18, kb), 0, lerp(bp[2], 2.3, kb), lerp(bp[3], 2 * Math.PI - 0.55, kb));
          boy.act([
            { t: at('hug'), pose: 'kneelHug', mood: 'cry' },
            { t: at('hug') + 0.25, pose: 'hug', blend: 0.6 },
          ], t);
          tod.setPosition(lerp(tp[0], -0.38, kb), 0, lerp(tp[2], 2.28, kb), lerp(tp[3], 2 * Math.PI + 0.5, kb));
          tod.act([
            { t: at('hug'), pose: 'reachUp', mood: 'sad' },
            { t: at('hug') + 0.3, pose: 'hug', blend: 0.5, mood: 'cry' },
          ], t);
        }
        // Zeichnung im Hook: zwischen den Händen über dem Grab (wird nie ganz abgelegt – die Frage unterbricht)
        if (id === 'hook') {
          betweenHands(drawing, boy, 0.02);
          drawing.rotation.set(0, Math.PI + 0.06, 0);
        }
        if (id === 'mom_react') drawing.visible = false;
        if (id === 'grave_flowers') {
          betweenHands(drawing, boy, 0.0);
          drawing.rotation.set(-1.25, Math.PI, 0);
        }
        if (laid) {
          // Glattstreichen: Zeichnung ruckt minimal unter der Hand
          const sm = id === 'drawing_down' && t > ev('smooth') && t < ev('smooth') + 0.4 ? 0.004 * Math.abs(Math.sin((t - ev('smooth')) * 30)) : 0;
          drawing.position.set(ds[0], ds[1] + sm, ds[2]);
          drawing.rotation.set(0, Math.PI + 0.06, 0); // Bild aufrecht für die Kamera vom Grabstein aus
        }
        if (flowersVisible) {
          if (flowersLaid) {
            flowers.position.set(fs[0], fs[1], fs[2]);
            flowers.rotation.set(-Math.PI / 2 + 0.12, 0.3, 0);
          } else {
            toHand(flowers, mom, 'right', [0, -0.08, 0.02]);
            flowers.rotation.set(0.5, 0, 0);
          }
        }
      }

      // ================= WOHNZIMMER (Rückblende) =================
      if (inHome) {
        const db = D(id, 'dad');
        const mb = D(id, 'mom');
        const bb = D(id, 'boy') || D('home_happy', 'boy');
        const tb = D(id, 'tod') || D('home_happy', 'tod');
        const ks = home.spots.keys;
        keys.position.set(ks[0], ks[1], ks[2]);
        keys.rotation.set(0, 0.4, 0);
        // Spielzeug-911 vor dem kleinen Bruder
        const tcRoll = id === 'home_happy' ? easeOut((t - ev('toy_car')) / 0.9) * 0.55 : id === 'argue' || id === 'kids_watch' || id === 'dad_slam' || id === 'keys_pov' ? 0.55 : 0;
        toyCar.position.set(D('home_happy', 'tod')[0] + 0.12 + tcRoll * 0.35, 0.0, D('home_happy', 'tod')[2] + 0.28 + tcRoll * 0.4);
        toyCar.rotation.set(0, 0.7, 0);
        home.door.userData.setOpen(0);
        // Sitzhöhe Sofa / Boden
        if (id === 'home_happy') {
          dad.setPosition(db[0], 0.12, db[2], db[3]);
          mom.setPosition(mb[0], 0.12, mb[2], mb[3]);
          dad.act([
            { t: at('home_happy'), pose: 'sit', mood: 'happy', look: [0.3, 0.2] },
            { t: ev('boy_show'), mood: 'laugh', blend: 0.25, look: [0.15, 0.3] },
            { t: ev('boy_show') + 0.9, pose: 'wave', seated: 1, blend: 0.4 },
          ], t);
          mom.act([
            { t: at('home_happy'), pose: 'sit', mood: 'happy', look: [-0.35, 0.15] },
            { t: ev('boy_show') + 0.1, mood: 'laugh', blend: 0.3, look: [-0.15, 0.3] },
          ], t);
          place(boy, bb);
          boy.act([
            { t: at('home_happy'), pose: 'placeLow', mood: 'happy', look: [0, 0.15] },
            { t: ev('boy_show') - 0.2, pose: 'showUp', seated: 0, blend: 0.4, mood: 'laugh', look: [0, -0.1] },
          ], t);
          tod.setPosition(tb[0], -0.2, tb[2], tb[3]);
          tod.act([
            { t: at('home_happy'), pose: 'sit', mood: 'happy', look: [0.3, 0.3] },
            { t: ev('toy_car'), pose: 'reach', seated: 1, blend: 0.2, mood: 'laugh' },
            { t: ev('toy_car') + 0.7, pose: 'cheer', seated: 1, speed: 1.4, blend: 0.3 },
          ], t);
          if (t < ev('boy_show') - 0.1) {
            const tbl = home.spots.table;
            drawing.position.set(bb[0], tbl[1] + 0.005, bb[2] + 0.45);
            drawing.rotation.set(0, Math.PI, 0);
          } else {
            betweenHands(drawing, boy, 0.08);
            drawing.rotation.set(Math.PI / 2, Math.PI, 0); // Bild zur Kamera (+z)
          }
        } else {
          // Kinder während des Streits: Junge kniet am Tisch, kleiner Bruder sitzt am Boden
          place(boy, bb);
          tod.setPosition(tb[0], -0.2, tb[2], tb[3]);
        }
        if (id === 'argue') {
          place(dad, db);
          place(mom, mb);
          mom.act([
            { t: at('argue'), pose: 'stand', mood: 'worried' },
            { t: ev('argue_start'), pose: 'point', mood: 'angry', blend: 0.2 },
            { t: ev('argue_start') + 0.8, pose: 'yell', speed: 0.9, blend: 0.4 },
            { t: ev('dad_yell') + 0.15, pose: 'recoil', mood: 'shock', blend: 0.12 },
            { t: ev('dad_yell') + 0.8, pose: 'shrug', speed: 0.7, mood: 'angry', blend: 0.4 },
          ], t);
          dad.act([
            { t: at('argue'), pose: 'stand', mood: 'worried' },
            { t: ev('argue_start') + 0.25, mood: 'angry', blend: 0.3 },
            { t: ev('argue_start') + 0.6, pose: 'facepalm', blend: 0.4 },
            { t: ev('dad_yell') - 0.1, pose: 'yell', speed: 1.4, blend: 0.18 },
          ], t);
          boy.act([{ t: at('argue'), pose: 'kneelHug', mood: 'worried', look: [0.35, -0.05] }], t);
          tod.act([{ t: at('argue'), pose: 'sit', mood: 'worried', look: [0.5, -0.1] }], t);
        }
        if (id === 'kids_watch') {
          boy.act([
            { t: at('kids_watch'), pose: 'kneelHug', mood: 'worried', look: [0.3, -0.05] },
            { t: ev('flinch'), pose: 'kneelHug', mood: 'shock', blend: 0.08, look: [0.15, 0.05] },
            { t: ev('flinch') + 0.5, mood: 'sad', blend: 0.5 },
          ], t);
          tod.act([
            { t: at('kids_watch'), pose: 'sit', mood: 'worried', look: [0.4, -0.1] },
            { t: ev('ears'), pose: 'coverEars', seated: 1, mood: 'cry', blend: 0.15, look: [0, 0.1] },
          ], t);
        }
        if (id === 'dad_slam') {
          place(dad, db);
          place(mom, mb);
          const ts = ev('slam');
          dad.act([
            { t: at('dad_slam'), pose: 'yell', speed: 1.3, mood: 'angry' },
            { t: ts - 0.35, pose: 'reach', blend: 0.25 },
            { t: ts + 0.35, pose: 'yell', speed: 1.1, blend: 0.45 },
          ], t);
          mom.act([
            { t: at('dad_slam'), pose: 'stand', mood: 'worried' },
            { t: ts + 0.05, pose: 'handMouth', mood: 'shock', blend: 0.12 },
          ], t);
          boy.act([
            { t: at('dad_slam'), pose: 'kneelHug', mood: 'worried', look: [0.5, -0.2] },
            { t: ts + 0.03, mood: 'shock', blend: 0.08 },
            { t: ev('boy_cry'), mood: 'cry', blend: 0.6 },
          ], t);
          tod.act([{ t: at('dad_slam'), pose: 'coverEars', seated: 1, mood: 'cry' }], t);
          crayonBits.update(t - ts, [D('home_happy', 'boy')[0] + 0.1, home.spots.table[1], -0.8]);
        } else crayonBits.update(-1, [0, 0, 0]);
        if (['argue', 'kids_watch', 'dad_slam'].includes(id)) {
          // Zeichnung an die Brust gedrückt
          betweenHands(drawing, boy, 0.04);
          drawing.rotation.set(Math.PI / 2, Math.PI + boy.root.rotation.y, 0);
        }
        if (id === 'keys_pov') {
          // Ich-Perspektive des Jungen: er selbst unsichtbar, seine hochgehaltene Zeichnung unten im Bild (Rückseite zur Kamera)
          boy.root.visible = false;
          place(boy, bb);
          const fw = [Math.sin(bb[3]), Math.cos(bb[3])];
          drawing.position.set(bb[0] + fw[0] * 0.42, 0.86, bb[2] + fw[1] * 0.42);
          drawing.rotation.set(-Math.PI / 2 + 0.25, bb[3], Math.PI, 'YXZ');
          tod.act([{ t: at('keys_pov'), pose: 'sit', mood: 'cry' }], t);
          // Weg des Vaters: Tisch → Kommode (Schlüssel) → Tür → hinaus
          const pth = D('keys_pov', 'dadPath');
          const tk = ev('keys_grab');
          const to = ev('door_open');
          const tx = at('keys_pov');
          let p;
          let dir;
          if (t < tk - 0.15) {
            const k = ramp(t, tx, tk - 0.15);
            p = [lerp(pth[0][0], pth[1][0], k), lerp(pth[0][1], pth[1][1], k)];
            dir = Math.atan2(pth[1][0] - pth[0][0], pth[1][1] - pth[0][1]);
          } else if (t < to) {
            const k = ramp(t, tk + 0.25, to);
            p = [lerp(pth[1][0], pth[2][0], k), lerp(pth[1][1], pth[2][1], k)];
            dir = t < tk + 0.25 ? Math.PI / 2 : Math.atan2(pth[2][0] - pth[1][0], pth[2][1] - pth[1][1]);
          } else {
            const k = ramp(t, to + 0.15, to + 0.9);
            p = [lerp(pth[2][0], pth[3][0], k), lerp(pth[2][1], pth[3][1], k)];
            dir = Math.PI / 2;
          }
          dad.setPosition(p[0], 0, p[1], dir);
          dad.root.visible = p[0] < 43.75;
          dad.act([
            { t: tx, pose: 'walk', speed: 1.9, mood: 'angry' },
            { t: tk - 0.2, pose: 'reach', blend: 0.15 },
            { t: tk + 0.2, pose: 'walk', speed: 1.9, blend: 0.2 },
            { t: to - 0.15, pose: 'reach', blend: 0.15 },
            { t: to + 0.15, pose: 'walk', speed: 1.9, blend: 0.2 },
          ], t);
          if (t >= tk) toHand(keys, dad, 'right', [0, -0.08, 0.02]);
          const dk = t < ev('door_slam') ? ramp(t, to, to + 0.3) : 1 - ramp(t, ev('door_slam') - 0.12, ev('door_slam'));
          home.door.userData.setOpen(dk);
          place(mom, D('keys_pov', 'mom'), lerp(D('keys_pov', 'mom')[3], Math.PI / 2 - 0.2, ramp(t, tx + 0.3, tk + 0.6)));
          mom.act([
            { t: tx, pose: 'handMouth', mood: 'cry' },
            { t: tk + 0.2, pose: 'reach', mood: 'cry', blend: 0.4 },
            { t: ev('door_slam'), pose: 'recoil', mood: 'shock', blend: 0.1 },
            { t: ev('door_slam') + 0.5, pose: 'handMouth', mood: 'cry', blend: 0.3 },
          ], t);
        }
      }

      // ================= AUTO / STRASSE =================
      if (carScene) {
        let spin = 0;
        let lightsOn = true;
        let brake = false;
        let hazard = false;
        let flicker = 1;
        if (id === 'driveway') {
          const c = D('driveway', 'car');
          placeCar(c[0], c[2], c[3]);
          const tdoor = ev('car_door');
          lightsOn = t >= ev('lights_on');
          if (t < tdoor - 0.15) {
            const a = D('driveway', 'dadFrom');
            const z = D('driveway', 'dadTo');
            const k = ramp(t, at('driveway'), tdoor - 0.25);
            dad.setPosition(lerp(a[0], z[0], k), 0, lerp(a[2], z[2], k), Math.atan2(z[0] - a[0], z[2] - a[2]));
            dad.act([
              { t: at('driveway'), pose: 'walk', speed: 1.9, mood: 'angry' },
              { t: tdoor - 0.3, pose: 'reach', blend: 0.2 },
            ], t);
            toHand(keys, dad, 'right', [0, -0.08, 0.02]);
            keys.visible = true;
          } else {
            driver([
              { t: at('driveway'), pose: 'drive', mood: 'angry', look: [0, 0.1] },
              { t: ev('engine_start'), mood: 'angry', look: [0.25, 0], blend: 0.3 },
            ], t);
          }
          // Motor läuft: Karosserie vibriert leicht, Abgaswolke
          if (t >= ev('engine_start')) {
            car.position.y = 0.006 * Math.sin(t * 90);
            exhaust.visible = true;
            exhaust.position.set(c[0], 0.35, c[2] - 2.75 * CAR_S);
            exhaust.userData.update(t - ev('engine_start'), 0.8 * (1 - ramp(t, ev('engine_start') + 0.8, at('driveway') + dur('driveway'))) + 0.2);
          }
        }
        if (id === 'accelerate') {
          const a = D('accelerate', 'car');
          const z = D('accelerate', 'carTo');
          const k = lt / dur('accelerate');
          const zc = lerp(a[2], z[2], k) + D('accelerate', 'pull') * k * k;
          placeCar(a[0], zc, 0);
          spin = (zc - a[2]) / (0.33 * CAR_S);
          driver([{ t: at('accelerate'), pose: 'drive', speed: 2, mood: 'angry', look: [0, 0.05] }], t);
          setRoadLights(zc, true);
        }
        if (id === 'driver_close') {
          const c = D('driver_close', 'car');
          placeCar(c[0], c[2], c[3]);
          const v = D('driver_close', 'speed');
          road.root.position.z = ROAD_O[2] - v * lt; // Welt fährt vorbei (Umgebungsbewegung)
          spin = (v * lt) / (0.33 * CAR_S);
          driver([
            { t: at('driver_close'), pose: 'drive', speed: 2.5, mood: 'angry', look: [0, 0.05] },
            { t: ev('phone_buzz') + 0.15, look: [-0.45, 0.25], blend: 0.3, mood: 'worried' },
            { t: ev('decline') - 0.3, pose: 'reach', blend: 0.2, mood: 'angry' },
            { t: ev('decline') + 0.25, pose: 'drive', speed: 2.5, blend: 0.3, look: [0, 0.05] },
          ], t);
          const ringing = t >= ev('phone_buzz') && t < ev('decline');
          carPhoneScreen(ringing);
          phoneGlow.intensity = ringing ? 1.3 : 0;
          dashLight.intensity = 1.0;
          // vorbeiziehendes Laternenlicht über dem Wagen
          const ph = (v * lt) % 28;
          passLight.position.set(c[0] - 3.4, 4.6, c[2] + 12 - ph);
          passLight.intensity = 14;
          setRoadLights(0, true);
        }
        if (id === 'skid' || id === 'impact') {
          rain.root.visible = true;
          rain.update(t, 1);
          rain.root.position.set(car.position.x, 0, car.position.z + 4);
        }
        if (id === 'skid') {
          const a = D('skid', 'carFrom');
          const z = D('skid', 'carTo');
          const k = lt / dur('skid');
          const kk = 1 - (1 - k) * (1 - k) * 0.35 - 0.65 * (1 - k);
          const wob = 0.34 * Math.sin((t - ev('skid_start')) * Math.PI * 2 * 0.85) * ramp(t, ev('skid_start'), ev('skid_start') + 0.4);
          placeCar(lerp(a[0], z[0], ramp(t, ev('skid_start'), at('skid') + dur('skid'))), lerp(a[2], z[2], kk), lerp(a[3], z[3], ramp(t, ev('countersteer'), at('skid') + dur('skid'))) + wob);
          car.userData.setSteer(-wob * 1.4);
          spin = lt * 60;
          brake = t >= ev('skid_start');
          driver([
            { t: at('skid'), pose: 'drive', speed: 2.5, mood: 'angry' },
            { t: ev('skid_start'), mood: 'panic', blend: 0.12, look: [0.2, 0] },
            { t: ev('countersteer'), pose: 'recoil', seated: 1, blend: 0.15 },
          ], t);
          setRoadLights(car.position.z, true);
        }
        if (id === 'impact') {
          const a = D('impact', 'carFrom');
          const z = D('impact', 'carRest');
          const th = ev('crash_hit');
          const k = ramp(t, at('impact'), th);
          const kl = clamp01((t - at('impact')) / (th - at('impact')));
          const back = t > th ? 0.18 * Math.sin(Math.PI * clamp01((t - th) / 0.35)) : 0;
          placeCar(lerp(a[0], z[0], kl) - back, lerp(a[2], z[2], kl * (2 - kl)) - back * 0.4, lerp(a[3], z[3], k) + (t > th ? 0.06 * Math.sin(Math.PI * clamp01((t - th) / 0.4)) : 0));
          spin = t < th ? lt * 55 : th * 0;
          brake = t < th;
          flicker = t > th ? (Math.sin(t * 41) > 0.35 ? 1 : 0) : 1;
          // Leitplanke beult an der Aufprallstelle ein
          const zHit = z[2] + 1.7;
          for (const r of road.rails) if (zHit > r.z0 + ROAD_O[2] && zHit < r.z1 + ROAD_O[2]) r.r.userData.setDent(ramp(t, th, th + 0.12), zHit - ROAD_O[2] - (r.z0 + r.z1) / 2);
          const hitPt = [z[0] + 2.05, 0.7, zHit];
          sparks.update(t - th, hitPt);
          glass.update(t - th - 0.02, [z[0] + 0.8, 1.25, z[2] + 0.9]);
          flash = t >= th && t < th + 0.12 ? 0.55 * (1 - (t - th) / 0.12) : 0;
          driver([
            { t: at('impact'), pose: 'recoil', seated: 1, mood: 'panic' },
            { t: th, pose: 'unconscious', mood: 'unconscious', blend: 0.12 },
          ], t);
          if (t > th) {
            smoke.visible = true;
            smoke.position.set(z[0] + 1.6, 0.8, z[2] + 1.3);
            smoke.userData.update(t - th, ramp(t, th, th + 1.0));
          }
          setRoadLights(car.position.z, true);
        } else {
          sparks.update(-1, [0, 0, 0]);
          glass.update(-1, [0, 0, 0]);
        }
        if (id === 'approach' || id === 'interior') {
          const c = D(id, 'car');
          placeCar(c[0], c[2], c[3]);
          const zHit = c[2] + 1.7;
          for (const r of road.rails) if (zHit > r.z0 + ROAD_O[2] && zHit < r.z1 + ROAD_O[2]) r.r.userData.setDent(1, zHit - ROAD_O[2] - (r.z0 + r.z1) / 2);
          rain.root.visible = true;
          rain.update(t, 1);
          rain.root.position.set(c[0], 0, c[2]);
          smoke.visible = true;
          smoke.position.set(c[0] + 1.6, 0.8, c[2] + 1.3);
          smoke.userData.update(t - ev('crash_hit'), id === 'interior' ? 0.6 : 0.9);
          hazard = t >= ev('hazard') && Math.floor((t - ev('hazard')) / 0.4) % 2 === 0;
          hazardLight.intensity = hazard ? 6 : 0;
          faceLight.intensity = id === 'interior' ? 2.2 : 1.2;
          flicker = Math.sin(t * 37) > 0.55 ? 1 : 0;
          const dead = id === 'interior' && t >= ev('flat');
          lightsOn = !dead;
          if (id === 'approach') {
            driver([{ t: at('approach'), pose: 'unconscious', mood: 'unconscious' }], t);
            dashLight.intensity = 0.7;
          } else {
            driver([
              { t: at('interior'), pose: 'drive', mood: 'unconscious', look: [0.75, -0.45] },
              { t: at('interior') + 0.05, pose: 'unconscious', blend: 0.05 },
              { t: ev('hand_slip') - 0.1, pose: 'unconscious', blend: 0.6, look: [0.75, -0.45] },
            ], t);
            const ringing = t >= ev('phone_ring') && t < ev('flat');
            carPhoneScreen(ringing);
            phoneGlow.intensity = ringing ? 1.4 * (0.75 + 0.25 * Math.sin(t * 9)) : 0;
            dashLight.intensity = 0.9 * (1 - ramp(t, ev('flat'), ev('flat') + 0.8));
          }
          setRoadLights(c[2], true);
        }
        car.userData.setSpin(spin);
        if (id !== 'skid') car.userData.setSteer(id === 'approach' || id === 'interior' ? 0.35 : 0);
        car.userData.setLights({ head: lightsOn, brake, hazard, flicker });
        heads.forEach((h, i) => (h.intensity = lightsOn ? (i === 0 || flicker > 0.5 ? 60 : 0) : 0));
        if (id !== 'driveway') keys.visible = false;
      }

      return { fx: { flash } };
    },
  };
}
