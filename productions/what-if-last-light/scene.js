// What if yours was the last light? – System V3 (Guide 18.13). Alle Zeiten aus beats.json (kit.beatClock), Positionen der
// Hauptfigur aus beats[].data.you. Licht: kühle Mondnacht als Grundstimmung, EIN warmer Akzent = dein Licht.
import { createKit } from '/pipeline/runtime/kit/index.js';

export async function build({ THREE, scene, camera, renderer, rng, timeline, fetchJson }) {
  const kit = createKit({ THREE, scene, renderer, rng });
  const { atmo, masses, props: P, ramp, clamp01 } = kit;
  const B = kit.beatClock(timeline);
  const ev = B.ev;
  const lights = kit.setupLook({ scene, renderer }, 'night');
  const NIGHT_PAL = atmo.palette('night');
  const WARM = 0xffcf8a;

  // ---------------------------------------------------------------- Stimmungen
  const LOOK_CITY = { ...kit.LOOKS.neonNight, sky: 0x141a33, fog: [0x1a2140, 30, 260] };
  const LOOK_DARK = { sky: 0x080d1d, fog: [0x0a1022, 30, 220], hemi: [0x7484b8, 0x0f0f18, 1.05], sun: [0xb0c0ff, 0.75], exposure: 1.35 };
  const LOOK_OUT = { ...LOOK_DARK, hemi: [0x7a8cc8, 0x10101a, 0.95], sun: [0xbfcaff, 0.7], exposure: 1.4 };
  const LOOK_AVENUE = { ...LOOK_DARK, hemi: [0x8090c8, 0x141420, 1.5], sun: [0xc0ccff, 1.0], exposure: 1.4 };
  const LOOK_SPACE = { sky: 0x010208, fog: null, hemi: [0x223055, 0x020204, 0.12], sun: [0xfff2e0, 1.4], exposure: 1.0 };

  // ---------------------------------------------------------------- Sets (je Ort eine Gruppe, nur der aktive ist sichtbar)
  const sets = {};
  const set = (name) => {
    if (!sets[name]) {
      sets[name] = new THREE.Group();
      scene.add(sets[name]);
    }
    return sets[name];
  };
  const add = (name, ...objs) => objs.forEach((o) => set(name).add(o.root || o));
  const ORIGIN = { rooftop: [0, 0, 0], street: [200, 0, 0], avenue: [400, 0, -30], plaza: [600, 0, 0], park: [800, 0, 0], space: [0, 0, 5000] };

  // Hauptfigur: ein Objekt für alle Beats (Kontinuität), dunkel gekleidet → der Akzent ist das Licht
  const you = kit.human({ shirt: 0x3a4258, pants: 0x1f2430, hair: 'short', hairColor: 0x2a1d16, skin: kit.SKIN[1] });
  scene.add(you.root);
  // Dein Licht am Körper: Lichtkegel + Lichtinsel + Leuchtpunkt (lokale Koordinaten der Figur, Figur schaut nach +z)
  const torch = new THREE.Group();
  you.root.add(torch);
  const beam = atmo.spotCone({ pos: [0, 0, 0], target: [0.1, -1.2, 7], color: WARM, intensity: 160, angle: 0.36, penumbra: 0.45, coneOpacity: 0.07, housing: false });
  const halo = atmo.lampPool({ pos: [0, 0.35, 0.45], color: WARM, intensity: 5, dist: 9, bulb: 0 });
  const glint = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), atmo.glow(WARM, 4)); // Lampe am Handy (klein)
  torch.add(glint);
  torch.add(beam.root, halo.root);
  const handPhone = P.phone({ mode: 'lock', time: '11:58', date: 'Friday', glow: 1.0 });
  you.hands.right.add(handPhone);
  handPhone.position.set(0, -0.12, 0.05);
  handPhone.rotation.set(-1.2, 0, 0);

  // Ich-Perspektive (Hook, Akku): eigene Hände, Handy in der rechten Hand, Lampe zeigt nach vorn
  const me = kit.firstPerson({ camera, scene, sleeve: 0x3a4258, skin: kit.SKIN[1] });
  const povPhone = P.phone({ mode: 'lock', time: '11:58', date: 'Friday', glow: 1.0 });
  me.hold(povPhone, 'R', { pos: [0, 0.05, -0.02], rot: [-0.35, 0, 0], scale: 0.8 });
  const povBeam = atmo.spotCone({ pos: [0.12, -0.3, -0.7], target: [0.6, -3.0, -14], color: WARM, intensity: 220, angle: 0.33, coneOpacity: 0.05, housing: false });
  const povHalo = atmo.lampPool({ pos: [0.1, -0.15, -0.9], color: WARM, intensity: 1.5, dist: 3, bulb: 0 });
  me.root.add(povBeam.root, povHalo.root);

  // Sterne + Milchstraße (eine Instanz, wandert zum aktiven Ort)
  const stars = kit.space.stars({ layers: [[1400, 500, 1.8], [1800, 900, 1.3]] });
  scene.add(stars);
  const milky = atmo.milkyWay({ radius: 420, tilt: -0.75, yaw: 0.35, count: 12000, glow: 0.75 }); // Band über −z (Blickrichtung Park/Pointe)
  scene.add(milky.root);

  // ---------------------------------------------------------------- Dach (Hook)
  add('rooftop', atmo.ground('concrete', 18, 18, { color: 0x5b6068, perMeter: 0.6 }));
  for (const [x, z, w, d] of [[0, -6, 18, 0.3], [-9, 0, 0.3, 12], [9, 0, 0.3, 12]]) add('rooftop', kit.box(w, 1.0, d, 0x4a4f58, [x, 0, z]));
  add('rooftop', kit.box(2, 2.4, 2, 0x444a54, [-5, 0, 3])); // Treppenhaus
  // Skyline in drei Ringen (fern → nah), Lichter erlöschen als Welle
  const rings = [[260, 70, -0.6], [170, 60, 0.25], [100, 48, 0.6]].map(([radius, count, delay], i) => {
    const s = masses.skyline({ center: [0, -40, 0], radius, count, minH: 20, maxH: 70 + i * 10, color: NIGHT_PAL.pick(i), night: true, seed: 31 + i, arc: [-1.1, 1.1] });
    add('rooftop', s);
    return { s, delay };
  });
  const nearBuildings = [[-14, -16], [12, -20], [-24, -34], [22, -40]].map(([x, z], i) => {
    const b = P.building({ w: 8, floors: 6, d: 8, color: NIGHT_PAL.pick(i + 2), win: 0x1c2230, lit: 1 });
    b.position.set(x, -20, z);
    add('rooftop', b);
    return b;
  });
  const neighbor = kit.human({ shirt: 0x6b6f78, pants: 0x2b2f38, hair: 'long', hairColor: 0x3b2a20, skin: kit.SKIN[0] });
  const neighborPhone = P.phone({ mode: 'lock', time: '11:58', date: 'Friday', glow: 1.0 });
  neighbor.hands.right.add(neighborPhone);
  neighborPhone.position.set(0, -0.12, 0.05);
  neighborPhone.rotation.set(-1.2, 0, 0);
  // Licht des Nachbar-Handys auf seinem Gesicht – erlischt beim Beweis-Ereignis (lesbar ohne Text)
  const neighborGlow = atmo.lampPool({ pos: [0, 0.15, 0.25], color: 0x9fb8ff, intensity: 2.2, dist: 2.5, bulb: 0 });
  neighbor.hands.right.add(neighborGlow.root);
  add('rooftop', neighbor.root);

  // ---------------------------------------------------------------- Straße (Akt 1)
  const S = ORIGIN.street;
  add('street', atmo.ground('cobble', 16, 90, { color: 0x55524e, perMeter: 0.7 }));
  set('street').children.at(-1).position.set(S[0], 0, -10);
  for (let i = 0; i < 6; i++) for (const side of [-1, 1]) {
    const b = P.building({ w: 9, floors: 4 + (i % 3), d: 7, color: NIGHT_PAL.pick(i + side), win: 0x161b26, lit: 0 });
    b.position.set(S[0] + side * 10.5, 0, -40 + i * 10.5);
    b.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    add('street', b);
  }
  const NEIGH = [[-4.2, 4, 0.9], [4.2, 6, -0.9], [-4.2, 9, 1.2], [4.2, 11, -1.1], [-3.8, 14, 0.7], [3.9, 16, -0.6]].map(([dx, dz, r], i) => {
    const h = kit.human({ shirt: NIGHT_PAL.pick(i + 1), pants: 0x24304a, hair: ['short', 'long', 'bun', 'short', 'spiky', 'bald'][i], skin: kit.SKIN[i % 6] });
    add('street', h.root);
    return { h, dx, dz, r };
  });
  const streetCrowd = masses.crowd({ count: 260, area: [-4.5, 4.5, 4, 26], face: [0, 0, -60], anim: 'bob', palette: NIGHT_PAL.base, seed: 41 });
  streetCrowd.root.position.set(S[0], 0, 0);
  add('street', streetCrowd);

  // ---------------------------------------------------------------- Avenue (Akt 1, Schauwert Masse)
  const A = ORIGIN.avenue;
  add('avenue', atmo.ground('asphalt', 22, 140, { perMeter: 0.4 }));
  set('avenue').children.at(-1).position.set(A[0], 0, -40);
  const cars = masses.carField({ rows: 11, cols: 4, gapX: 2.7, gapZ: 5.6, color: 0x3c4250, seed: 43 });
  cars.root.position.set(A[0], 0, -18);
  const avenueCrowd = masses.crowd({ count: 300, area: [-6, 6, -60, -14], face: [0, 0, -400], anim: 'bob', palette: NIGHT_PAL.base, seed: 45 });
  avenueCrowd.root.position.set(A[0], 0, -14);
  const farLight = atmo.lampPool({ pos: [A[0], 2.4, -78], color: WARM, intensity: 7000, dist: 160, bulb: 0.35 });
  add('avenue', cars, avenueCrowd, farLight, masses.skyline({ center: [A[0], 0, -40], radius: 120, count: 60, color: 0x2b3346, seed: 47 }));

  // ---------------------------------------------------------------- Platz (Akt 2/3)
  const PZ = ORIGIN.plaza;
  add('plaza', atmo.ground('cobble', 80, 80, { color: 0x5d5a55, perMeter: 0.6 }));
  set('plaza').children.at(-1).position.set(PZ[0], 0, 0);
  add('plaza', kit.box(4.6, 0.8, 4.6, 0x6b6f78, [PZ[0], 0, 0]), kit.box(1.2, 1.6, 1.2, 0x5b6068, [PZ[0] - 1.6, 0.8, -1.6]));
  const ring = [];
  for (let i = 0; i < 1600; i++) {
    const a = (i * 2.399963) % (Math.PI * 2);
    const r = 3.4 + 22 * Math.sqrt((i + 0.5) / 1600);
    ring.push([Math.cos(a) * r + 0.18 * Math.sin(i * 7.1), 0, Math.sin(a) * r + 0.18 * Math.cos(i * 5.3)]);
  }
  const plazaCrowd = masses.crowd({ positions: ring, face: [0, 0, 0], anim: 'cheer', palette: NIGHT_PAL.base, seed: 49 });
  plazaCrowd.root.position.set(PZ[0], 0, 0);
  add('plaza', plazaCrowd);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const b = P.building({ w: 10, floors: 5 + (i % 3), d: 8, color: NIGHT_PAL.pick(i), win: 0x161b26, lit: 0 });
    b.position.set(PZ[0] + Math.cos(a) * 36, 0, Math.sin(a) * 36);
    b.rotation.y = -a - Math.PI / 2;
    add('plaza', b);
  }

  // Pointe: Figuren vor der Kamera (Blick vom Brunnen nach −z), schauen nach oben
  const lookers = [[-1.6, -4.2], [1.2, -5.0], [-0.2, -6.4], [2.6, -7.2], [-2.8, -7.8], [0.9, -9.0]].map(([dx, dz], i) => {
    const h = kit.human({ shirt: NIGHT_PAL.pick(i + 3), pants: 0x24304a, hair: ['long', 'short', 'bun', 'spiky', 'short', 'long'][i], skin: kit.SKIN[(i + 2) % 6] });
    h.setPosition(PZ[0] + dx, 0, dz, 0.15 * Math.sin(i * 2));
    add('plaza', h.root);
    return h;
  });

  // ---------------------------------------------------------------- Park (Akt 2, Milchstraße)
  const K = ORIGIN.park;
  add('park', atmo.ground('grass', 90, 90, { color: 0x2f4a33, perMeter: 0.4 }));
  set('park').children.at(-1).position.set(K[0], 0, -20);
  for (const [x, z] of [[-14, -18], [12, -26], [-22, -40], [20, -46], [-6, -52]]) {
    const tr = P.tree({ h: 5, color: 0x22382a });
    tr.position.set(K[0] + x, 0, z);
    add('park', tr);
  }
  const parkCrowd = masses.crowd({ count: 520, area: [-18, 18, -34, -8], face: [1.5, 0, -2], anim: 'idle', palette: NIGHT_PAL.base, seed: 51 });
  parkCrowd.root.position.set(K[0], 0, 0);
  add('park', parkCrowd);

  // ---------------------------------------------------------------- Weltraum (dunkle Erde, ein Punkt)
  const land = await fetchJson('/pipeline/runtime/kit/assets/land_50m.json');
  const earth = kit.space.globe({ land, radius: 10 });
  const dotDir = kit.space.latLon(48, 10, 1).normalize();
  earth.root.quaternion.setFromUnitVectors(dotDir, new THREE.Vector3(0.25, 0.35, 1).normalize());
  earth.root.position.set(...ORIGIN.space);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), atmo.glow(WARM, 6));
  dot.position.copy(earth.surface(48, 10, 0.05));
  earth.spin.add(dot);
  add('space', earth.root);

  // ---------------------------------------------------------------- Hilfen
  const PLACE = Object.fromEntries(B.beats.map((b) => [b.id, b.place]));
  const youAt = (id) => B.beat(id).data?.you || [0, 0, 0, 0];
  const lookFor = (id, t) => {
    if (id === 'b_wave') return [LOOK_CITY, LOOK_DARK, ramp(t, ev('e_wave'), ev('e_wave') + 1.4)];
    if (id === 'b_space') return [LOOK_SPACE, LOOK_SPACE, 0];
    if (id === 'b_avenue') return [LOOK_AVENUE, LOOK_AVENUE, 0];
    if (t >= ev('e_out')) return [LOOK_OUT, LOOK_OUT, 0];
    return [LOOK_DARK, LOOK_DARK, 0];
  };
  // Akku-Verlauf (Bildschirm im POV): 23 % → 9 % (Wende) → 1 % → 0
  const batteryAt = (t) => {
    if (t < ev('e_battery')) return 23;
    if (t < ev('e_drop')) return 9;
    if (t < ev('e_one')) return 4;
    return 1;
  };
  let lastScreen = '';
  const setScreen = (phone, o) => {
    const key = JSON.stringify(o);
    if (phone.userData._k === key) return;
    phone.userData._k = key;
    phone.userData.setScreen(o);
  };
  // Lichtstärke deines Lichts: 1 bis zum Ende, flackert bei 1 %, aus nach e_out
  const torchK = (t) => {
    if (t >= ev('e_out')) return 0;
    if (t >= ev('e_one')) return 0.55 + 0.45 * (Math.sin(t * 37) > -0.2 ? 1 : 0.15) * (0.8 + 0.2 * Math.sin(t * 13));
    return 1;
  };

  return {
    update({ t }) {
      const b = B.active(t);
      const id = b.id;
      const place = PLACE[id];
      const lt = B.local(t, id);
      for (const [k, g] of Object.entries(sets)) g.visible = k === place;
      const o = ORIGIN[place];
      const [la, lb, lk] = lookFor(id, t);
      kit.applyLook({ scene, renderer, ...lights }, la, lb, lk);
      if (place === 'space') kit.sunAt(lights.sun, o, [-30, 12, -60]);
      else if (place === 'plaza' || place === 'avenue') kit.sunAt(lights.sun, o, [12, 26, 30]); // Mondlicht von der Kameraseite: Gesichter der Menge lesbar
      else kit.sunAt(lights.sun, o, [-20, 30, -24]);

      // Himmel: Sterne nach der Welle, Milchstraße im Park und nach dem Ausfall hell
      const afterWave = ramp(t, ev('e_wave') + 0.4, ev('e_wave') + 2.2);
      stars.visible = place !== 'space' ? afterWave > 0.02 : true;
      stars.position.set(o[0], o[1], o[2]);
      milky.root.position.set(o[0], o[1], o[2]);
      let mk = 0.25 * afterWave;
      if (place === 'park') mk = 0.35 + 0.65 * ramp(t, ev('e_stars') - 0.2, ev('e_stars') + 1.2);
      if (t >= ev('e_out')) mk = 0.35 + 0.65 * ramp(t, ev('e_lookup') - 0.6, ev('e_lookup') + 1.0);
      if (place === 'space') mk = 0;
      milky.set(mk);

      // Ich-Perspektive nur in pov-Beats; Hauptfigur dann unsichtbar (Kamera = ihre Augen)
      const pov = !!B.beats.find((x) => x.id === id && x.preset === 'pov');
      me.setVisible(pov);
      you.root.visible = !pov && place !== 'space' && place !== 'avenue' && id !== 'b_lookup';
      const k = torchK(t);
      beam.set(k);
      halo.set(k);
      povBeam.set(k);
      povHalo.set(k * 1.2);
      handPhone.visible = k > 0;
      glint.visible = k > 0;

      // ---------------- Dach
      if (place === 'rooftop') {
        for (const r of rings) r.s.material.emissiveIntensity = 1.4 * (1 - ramp(t, ev('e_wave') + r.delay - 0.15, ev('e_wave') + r.delay + 0.25));
        nearBuildings.forEach((nb, i) => nb.userData.setLit?.(1 - ramp(t, ev('e_wave') + 0.8 + i * 0.05, ev('e_wave') + 1.0 + i * 0.05)));
        neighborPhone.children[1].visible = t < ev('e_neighbor_dark');
        neighborGlow.set(t < ev('e_neighbor_dark') ? 1 : 0);
        // Nachbar: schaut auf die Stadt, Handy stirbt, dreht sich zu deinem Licht, kommt näher (Close-up)
        const turn = ramp(t, ev('e_neighbor_turn') - 0.1, ev('e_neighbor_turn') + 0.6);
        const step = ramp(t, ev('e_neighbor_close') - 0.4, ev('e_neighbor_close') + 0.8);
        neighbor.setPosition(-0.42 - 0.4 * step, 0, -0.25 + 0.95 * step, 0.55 + turn * 0.25 + step * 0.4);
        neighbor.act([{ t: 0, pose: 'phone', mood: 'neutral' }, { t: ev('e_neighbor_dark'), pose: 'shrug', mood: 'shock', blend: 0.15 }, { t: ev('e_neighbor_turn'), pose: 'stand', mood: 'worried', blend: 0.4 }, { t: ev('e_neighbor_close'), pose: 'reach', mood: 'worried', blend: 0.5 }], t);
        const [x, y, z, r] = youAt(id);
        you.setPosition(x, y, z, r);
        you.act([{ t: 0, pose: 'phone', mood: 'shock' }, { t: ev('e_gasp'), pose: 'point', mood: 'shock', blend: 0.4 }], t);
        torch.position.set(-0.22, 1.3, 0.3);
        torch.rotation.x = id === 'b_closeup' ? 0.9 : 0; // Nahaufnahme: Kegel zum Boden, nicht durch die Kamera
        // Ich-Perspektive: Handy zeigen, Lampe nach vorn
        me.act([{ t: 0, gesture: 'show' }, { t: ev('e_neighbor_dark') + 0.2, gesture: 'hold', blend: 0.5 }], t);
        setScreen(povPhone, { mode: 'lock', time: '11:58', date: 'Friday', glow: 1.0 });
      }

      // ---------------- Straße
      if (place === 'street') {
        const walk = Math.max(0, t - ev('e_follow'));
        const [x, y, z, r] = youAt(id);
        you.setPosition(x, y, z - walk * 0.9, r);
        you.act([{ t: 0, pose: 'point', mood: 'worried' }, { t: ev('e_follow'), pose: 'walk', speed: 1.4, mood: 'worried', blend: 0.4 }], t);
        torch.position.set(-0.22, 1.32, 0.35);
        NEIGH.forEach(({ h, dx, dz, r: rr }, i) => {
          const s = ramp(t, ev('e_doors') + i * 0.15, ev('e_step_out') + 1.2 + i * 0.1);
          const px = S[0] + dx * (1 - 0.6 * s);
          const pz = dz - walk * 0.9 * (t > ev('e_follow') ? 1 : 0);
          h.setPosition(px, 0, pz, Math.PI + rr * (1 - s));
          h.act([{ t: 0, pose: 'stand', mood: 'worried' }, { t: ev('e_doors') + i * 0.15, pose: 'walk', speed: 1.3, mood: 'worried', blend: 0.3 }], t);
        });
        streetCrowd.root.visible = id === 'b_stream';
        streetCrowd.root.position.z = -walk * 0.9;
        streetCrowd.update(t, { k: 1 });
      }

      // ---------------- Avenue
      if (place === 'avenue') {
        avenueCrowd.root.position.z = -lt * 1.1;
        avenueCrowd.update(t, { k: ramp(t, ev('e_drivers_out') - 0.6, ev('e_drivers_out') + 0.4) });
        farLight.set(0.8 + 0.2 * Math.sin(t * 2.3));
      }

      // ---------------- Platz
      if (place === 'plaza') {
        const [x, y, z, r] = youAt(id);
        you.setPosition(x, y, z, r);
        you.act([
          { t: B.beat('b_plaza').from, pose: 'reachUp', mood: 'happy' },
          { t: ev('e_smile'), pose: 'reachUp', mood: 'smug', blend: 0.4 },
          { t: B.beat('b_worry').from, pose: 'phone', mood: 'worried', blend: 0.4 },
          { t: B.beat('b_surge').from, pose: 'recoil', mood: 'panic', blend: 0.3 },
          { t: B.beat('b_out').from, pose: 'phone', mood: 'panic', blend: 0.3 },
          { t: ev('e_out'), pose: 'stand', mood: 'shock', blend: 0.2 },
          { t: ev('e_lookup') - 0.4, pose: 'lookUp', mood: 'relief', blend: 0.6 },
        ], t);
        const up = t < B.beat('b_worry').from;
        torch.position.set(up ? -0.32 : -0.22, up ? 2.25 : 1.32, up ? 0.05 : 0.32);
        const cheer = ramp(t, ev('e_roar') - 0.3, ev('e_roar') + 0.4) * (t < B.beat('b_worry').from ? 1 : 0.25);
        const surge = ramp(t, ev('e_surge') - 0.3, ev('e_surge') + 1.4) * (1 - ramp(t, ev('e_out'), ev('e_out') + 1.6));
        plazaCrowd.root.scale.set(1 - 0.12 * surge, 1, 1 - 0.12 * surge);
        plazaCrowd.update(t, { k: Math.max(cheer, 0.6 * surge) });
        lookers.forEach((h, i) => h.act([{ t: 0, pose: 'stand', mood: 'worried' }, { t: ev('e_lookup') - 0.3 + i * 0.12, pose: 'lookUp', mood: 'relief', blend: 0.7 }], t));
        // Akku im POV
        const lvl = t >= ev('e_out') ? 0 : batteryAt(t);
        setScreen(povPhone, { mode: 'battery', level: lvl, glow: 1.0 });
        me.act([{ t: B.beat('b_battery').from, gesture: 'show' }, { t: B.beat('b_onepercent').from, gesture: 'show' }], t);
        me.right.g.position.x += 0.004 * Math.sin(t * 31) * (id === 'b_onepercent' ? 1 : 0); // Zittern
      }

      // ---------------- Park
      if (place === 'park') {
        const [x, y, z, r] = youAt(id);
        you.setPosition(x, y, z, r);
        you.act([{ t: 0, pose: 'point', mood: 'happy' }], t);
        torch.position.set(-0.22, 1.32, 0.35);
        parkCrowd.update(t, { k: 0.3 });
      }

      // ---------------- Weltraum
      if (place === 'space') {
        earth.setSpin(0.02 * lt);
        dot.scale.setScalar(1 + 0.6 * ramp(t, ev('e_zoom') - 0.1, ev('e_zoom') + 0.3) * (0.7 + 0.3 * Math.sin(t * 6)));
      }

      // Post: kühles Grading, Bloom für das Licht und die Sterne; nach dem Ausfall Sterne betonen
      const fx = { bloom: 0.75, bloomThreshold: 0.72, grade: { saturation: 0.9, contrast: 1.06, tint: [0.97, 0.98, 1.05], lift: 0.004 } };
      if (place === 'space') Object.assign(fx, { bloom: 1.0, bloomThreshold: 0.6 });
      if (t >= ev('e_out')) Object.assign(fx, { bloom: 1.0, bloomThreshold: 0.55, grade: { saturation: 0.95, contrast: 1.08, tint: [0.95, 0.98, 1.07], lift: 0.01 } });
      return { fx };
    },
  };
}
