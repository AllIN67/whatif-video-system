// What if the Earth stopped spinning for 1 second?
// Vier Orte (Weltraum, New-York-Straße, Küstenstadt, Nordpol) in einer Szene; je Einstellung ist genau ein Ort
// sichtbar. Kamera wird hier geführt (Verfolgungsfahrten, Bahnen um die Erde), Zeiten kommen aus timeline.json.
// Osten = +x in allen Bodenszenen (Bildschirm rechts): alles, was nicht verankert ist, fliegt nach rechts.
import { createKit } from '/pipeline/runtime/kit/index.js';

export async function build({ THREE, scene, renderer, rng, timeline, fetchJson }) {
  const kit = createKit({ THREE, scene, renderer, rng });
  const { props: P, clamp01, smooth, lerp } = kit;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const fps = timeline.fps;
  const SH = Object.fromEntries(timeline.shots.map((s) => [s.id, { from: s.from / fps, to: s.to / fps }]));
  const EV = Object.fromEntries(timeline.events.map((e) => [e.id, e.t]));
  const T = timeline.duration;
  const STOP = EV.stop;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const ease = (x) => smooth(x);
  const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
  const easeIn = (x) => Math.pow(clamp01(x), 3);
  const seg = (t, a, b) => clamp01((t - a) / (b - a));
  // abklingendes Wackeln (deterministisch aus t)
  const shake = (t, t0, dur, amp, f = 1) => {
    if (t < t0 || t > t0 + dur) return [0, 0, 0];
    const k = 1 - (t - t0) / dur;
    const a = amp * k * k;
    return [a * Math.sin(t * 61 * f + 0.4), a * 0.8 * Math.sin(t * 47 * f + 1.9), a * 0.5 * Math.sin(t * 53 * f + 2.7)];
  };
  const addV = (p, s) => [p[0] + s[0], p[1] + s[1], p[2] + s[2]];
  const arr = (v) => [v.x, v.y, v.z];

  // ================================================================ Orte
  const sets = {};
  const makeSet = (name, { bg, fog = null, exposure = 1.0 }) => {
    const g = new THREE.Group();
    g.visible = false;
    scene.add(g);
    sets[name] = { g, bg: new THREE.Color(bg), fog, exposure, lights: [] };
    return sets[name];
  };

  // ---------------------------------------------------------------- Weltraum (Ursprung)
  const SPACE = makeSet('space', { bg: 0x02030a });
  const land = await fetchJson('/pipeline/runtime/kit/assets/land_50m.json');
  const earth = kit.space.globe({ land, radius: 10 });
  SPACE.g.add(earth.root);
  const stars = kit.space.stars();
  SPACE.g.add(stars);
  const sunS = new THREE.DirectionalLight(0xfff4e6, 3.2);
  sunS.position.set(38, 30, 26);
  const ambS = new THREE.HemisphereLight(0x6f86c8, 0x0a0a14, 0.55);
  SPACE.g.add(sunS, ambS);
  const nyPin = earth.marker(40.71, -74.0, { color: 0xff3b30, size: 0.32 });
  const polePin = earth.marker(90, 0, { color: 0x3dff8a, size: 0.55 });
  // Sturmschichten für „die Atmosphäre schmirgelt die Oberfläche“: gestreckte Schlieren, Staubfarbe
  const stormMat = (opts) => {
    const map = kit.space.cloudTexture(opts);
    return new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: 0x6a5240, transparent: true, depthWrite: false, roughness: 1 });
  };
  const storm1 = new THREE.Mesh(new THREE.SphereGeometry(10.06, 160, 80), stormMat({ stretchX: 7, cover: 0.4, color: [196, 138, 84], alpha: 1.0 }));
  const storm2 = new THREE.Mesh(new THREE.SphereGeometry(10.12, 160, 80), stormMat({ stretchX: 10, cover: 0.44, color: [250, 240, 225], alpha: 1.0 }));
  SPACE.g.add(storm1, storm2);

  // ---------------------------------------------------------------- New York (Straße entlang x)
  const CX = 5000; // Ursprung des Stadt-Orts
  const CITY = makeSet('city', { bg: 0xf6cfa4, fog: [0xf2cba6, 60, 260], exposure: 1.18 });
  const street = kit.places.street([0, 0, 0], { length: 60, cars: false, palette: [0xb5654a, 0xc98e6a, 0x9a6d5a, 0x8f9ba8, 0xd6c3a4, 0x7d5a4a] });
  street.root.rotation.y = Math.PI / 2;
  street.root.position.set(CX, 0, 0);
  CITY.g.add(street.root);
  // Verlängerung nach Osten: Fahrbahn, Gehwege, leichte Hochhäuser (eine Masche je Gebäude), Laternen
  const cityExt = new THREE.Group();
  CITY.g.add(cityExt);
  const EXT0 = CX + 30;
  const EXT1 = CX + 520;
  cityExt.add(kit.box(EXT1 - EXT0 + 60, 0.1, 8, 0x3a3b40, [(EXT0 + EXT1) / 2 - 30, -0.1, 0]));
  for (const sz of [-1, 1]) cityExt.add(kit.box(EXT1 - EXT0 + 60, 0.18, 4, 0xc7c7c2, [(EXT0 + EXT1) / 2 - 30, -0.06, sz * 6]));
  for (let x = EXT0 - 30; x < EXT1; x += 4) cityExt.add(kit.box(2, 0.012, 0.15, 0xf2f2f2, [x, 0, 0], { cast: false }));
  const towerPal = [0xb5654a, 0xc98e6a, 0x9a6d5a, 0x8f9ba8, 0xd6c3a4, 0x7d5a4a, 0x6f7f8f, 0xa8a090];
  for (const sz of [-1, 1]) {
    let x = EXT0;
    while (x < EXT1) {
      const w = rng.range(9, 15);
      const h = rng.range(14, 46);
      const tw = P.tower({ w, h, d: 12, color: rng.pick(towerPal), lit: 0.15 });
      tw.position.set(x + w / 2, 0, sz * 14.5);
      // Platz für die Gebäude, die auseinandergerissen werden (Nordseite bei XB)
      if (!(sz < 0 && x + w > CX + 350 && x < CX + 410)) cityExt.add(tw);
      x += w + 0.4;
    }
    for (let x2 = EXT0; x2 < EXT1; x2 += 18) {
      const l = P.streetLamp(false);
      l.position.set(x2, 0.12, sz * 4.6);
      l.rotation.y = sz > 0 ? Math.PI : 0;
      cityExt.add(l);
    }
  }
  // Stadtraster für das Luftbild (nur Hochhausblöcke)
  const grid = new THREE.Group();
  CITY.g.add(grid);
  grid.add(kit.box(900, 0.1, 700, 0x55565c, [CX + 220, -0.25, 0], { receive: false, cast: false }));
  for (let gx = CX - 200; gx < CX + 640; gx += 34) {
    for (let gz = -320; gz < 320; gz += 30) {
      if (Math.abs(gz) < 26) continue; // die Hauptstraße frei lassen
      const n = rng.int(1, 3);
      for (let i = 0; i < n; i++) {
        const w = rng.range(10, 26 / n + 6);
        const h = rng.next() < 0.12 ? rng.range(60, 140) : rng.range(12, 48);
        const tw = P.tower({ w, h, d: rng.range(10, 22), color: rng.pick(towerPal), lit: 0.1 });
        tw.castShadow = false;
        tw.receiveShadow = false;
        tw.position.set(gx + rng.range(-3, 3) + i * (28 / n), 0, gz + rng.range(-3, 3));
        grid.add(tw);
      }
    }
  }
  // Licht Stadt (Abendstimmung)
  const hemiC = new THREE.HemisphereLight(0xfff0dc, 0x8a7a6a, 2.0);
  const sunC = new THREE.DirectionalLight(0xffc488, 3.3);
  sunC.castShadow = true;
  sunC.shadow.mapSize.set(2048, 2048);
  Object.assign(sunC.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 220 });
  sunC.shadow.bias = -0.0004;
  sunC.shadow.normalBias = 0.02;
  CITY.g.add(hemiC, sunC, sunC.target);
  const sunFollow = (light, x, y, z, off = [-18, 70, 14]) => {
    light.target.position.set(x, y, z);
    light.position.set(x + off[0], y + off[1], z + off[2]);
    light.target.updateMatrixWorld();
  };

  // Hauptfigur „You“ – überall gleiches Aussehen
  const LOOK = { shirt: 0xe2703a, pants: 0x2d3e66, hair: 'short', hairColor: 0x3b2a20, skin: kit.SKIN[1] };
  const you = kit.human(LOOK);
  CITY.g.add(you.root);
  const cup = P.mug(0xffffff);
  cup.scale.setScalar(1.3);
  cup.position.set(0, -0.32, 0.12);
  you.hold(cup);
  const X0 = CX + 2; // Standort der Figur
  // Passanten
  const walkers = kit.crowd(6, [CX - 14, CX + 16, -6.6, -4.6]);
  for (const w of walkers) CITY.g.add(w.root);
  // Autos auf der Fahrbahn (fliegen später mit)
  const carDefs = [
    { kind: 'taxi', color: 0xf2c418, x: -9, z: 2.4 },
    { kind: 'sedan', color: 0x2b4f8a, x: 9, z: -2.4 },
    { kind: 'taxi', color: 0xf2c418, x: 17, z: 2.4 },
    { kind: 'van', color: 0xd9d9d9, x: -18, z: -2.4 },
  ];
  const cars = carDefs.map((d) => {
    const c = P.car({ kind: d.kind, color: d.color });
    c.rotation.y = Math.PI / 2; // Front nach Osten
    CITY.g.add(c);
    return { c, ...d };
  });

  // Fliegende Dinge für die Weitwinkel-Einstellung (strömen von links nach rechts)
  const XW = CX + 260; // Kamerastandort „flywide“
  const flyers = [];
  const spawnFlyer = (obj, kind) => {
    CITY.g.add(obj.root || obj);
    flyers.push({ obj, kind, t0: rng.range(SH.flywide.from - 2.2, SH.flywide.to - 0.6), v: rng.range(15, 25), z: rng.range(-9, 3), y0: rng.range(0.4, 4.5), spin: [rng.range(-6, 6), rng.range(-4, 4), rng.range(-6, 6)] });
  };
  for (let i = 0; i < 20; i++) {
    const h = kit.human({ skin: rng.pick(kit.SKIN), hairColor: rng.pick(kit.HAIR), hair: rng.pick(['short', 'long', 'bun', 'spiky']), shirt: rng.pick([0x3a7ad9, 0xd94a3a, 0x4aa05a, 0x8a5ac9, 0xeeeeee, 0x333333, 0xe0b23a]), pants: rng.pick([0x2d3e66, 0x3a3a3a, 0x6b5a45]) });
    spawnFlyer(h, 'human');
  }
  for (let i = 0; i < 7; i++) spawnFlyer(P.car({ kind: rng.pick(['taxi', 'sedan', 'van']), color: rng.pick([0xf2c418, 0x2b4f8a, 0xb02a2a, 0xd9d9d9, 0x2a2a2e]) }), 'car');
  for (let i = 0; i < 10; i++) spawnFlyer(rng.pick([P.trashCan, P.hydrant, P.bench, P.cardboardBox, P.bush])(), 'thing');
  // Mitfliegende Begleiter in der Verfolgungsfahrt (relativ zu „You“)
  const buddies = [];
  for (let i = 0; i < 6; i++) {
    const h = kit.human({ skin: rng.pick(kit.SKIN), hairColor: rng.pick(kit.HAIR), hair: rng.pick(['short', 'long', 'bun']), shirt: rng.pick([0x3a7ad9, 0xd94a3a, 0x4aa05a, 0x8a5ac9, 0xeeeeee]), pants: rng.pick([0x2d3e66, 0x3a3a3a]) });
    CITY.g.add(h.root);
    buddies.push({ obj: h, dx: rng.range(-6, 9), z: rng.range(-8, -2.5), y: rng.range(0.8, 5.5), dv: rng.range(-3, 3), spin: [rng.range(-5, 5), rng.range(-3, 3), rng.range(-5, 5)] });
  }
  const buddyCars = [0, 1, 2].map((i) => {
    const c = P.car({ kind: ['taxi', 'sedan', 'taxi'][i], color: [0xf2c418, 0xb02a2a, 0xf2c418][i] });
    CITY.g.add(c);
    return { c, dx: [-7, 6, 12][i], z: [-5, -7.5, -4][i], y: [0.6, 3.8, 1.2][i], dv: [1.5, -2, 0.5][i], spin: [[0.6, 0.3, 2.2], [-1.4, 0.4, 1.6], [0.9, -0.5, -2.4]][i] };
  });
  // Staub-/Geschwindigkeitslinien (dünne helle Stäbe), werden in Wind-/Flug-Einstellungen bewegt
  const streakMat = new THREE.MeshBasicMaterial({ color: 0xfff1dc, transparent: true, opacity: 0.55, depthWrite: false });
  const streaks = [];
  for (let i = 0; i < 70; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1, 0.06, 0.06), streakMat);
    m.castShadow = false;
    CITY.g.add(m);
    streaks.push({ m, ph: rng.next(), y: rng.range(0.3, 9), z: rng.range(-10, 8), len: rng.range(3, 9), v: rng.range(50, 90) });
  }

  // Gebäude, die auseinandergerissen werden (Stockwerke als einzelne Platten)
  const XB = CX + 380;
  const ripBuildings = [];
  for (let b = 0; b < 3; b++) {
    const floors = [];
    const fl = 7 + b * 2;
    const w = 11;
    const col = [0xb5654a, 0x8f9ba8, 0xc98e6a][b];
    for (let f = 0; f < fl; f++) {
      const slab = P.tower({ w, h: 3.2, d: 10, color: col, lit: 0.1, roof: 0x7a7068 });
      slab.position.set(XB + (b - 1) * 13.5, f * 3.2, -14.5);
      CITY.g.add(slab);
      floors.push({ m: slab, base: slab.position.clone(), f, r: [rng.range(-0.4, 0.4), rng.range(-0.6, 0.6), rng.range(-0.8, -0.2)] });
    }
    ripBuildings.push(floors);
  }
  const debris = [];
  for (let i = 0; i < 90; i++) {
    const s = rng.range(0.25, 1.1);
    const m = kit.cbox(s, s * rng.range(0.3, 1), s, rng.pick([0x8a8178, 0x9fb4c8, 0xb5654a, 0x6b6b6b, 0xd6c3a4]));
    CITY.g.add(m);
    debris.push({ m, x: XB + rng.range(-22, 22), y: rng.range(0, 30), z: rng.range(-18, -9), v: rng.range(14, 40), vy: rng.range(-2, 6), spin: [rng.range(-8, 8), rng.range(-8, 8), rng.range(-8, 8)], t0: rng.range(15.15, 15.7) });
  }

  // Flugbahn im Luftbild: leuchtende Spur am Boden + Kopf
  const trailMat = new THREE.MeshBasicMaterial({ color: 0xffe135, toneMapped: false });
  const trailDots = [];
  for (let i = 0; i < 60; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.5, 7), trailMat);
    m.position.set(X0 + (i + 0.5) * (352 / 60), 1.5, 0);
    CITY.g.add(m);
    trailDots.push(m);
  }
  const trailHead = new THREE.Mesh(new THREE.SphereGeometry(7, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffe135, toneMapped: false }));
  CITY.g.add(trailHead);
  const startRing = new THREE.Mesh(new THREE.RingGeometry(9, 13, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, toneMapped: false }));
  startRing.rotation.x = -Math.PI / 2;
  startRing.position.set(X0, 1.2, 0);
  CITY.g.add(startRing);

  // Bäume für die Wind-Einstellungen (eigene, damit sie sich biegen lassen)
  const XWND = CX - 4; // Wind auf derselben Straße, Westteil
  const windTrees = [];
  for (let i = 0; i < 9; i++) {
    const t = P.tree({ h: 3.8 });
    const g = new THREE.Group();
    g.add(t);
    g.position.set(XWND - 26 + i * 7, 0.12, i % 2 ? -4.6 : -7.2);
    CITY.g.add(g);
    windTrees.push({ g, ph: rng.next() * 6 });
  }
  const windCar = P.car({ kind: 'taxi', color: 0xf2c418 });
  windCar.rotation.y = Math.PI / 2;
  CITY.g.add(windCar);
  const leaves = [];
  for (let i = 0; i < 120; i++) {
    const s = rng.range(0.15, 0.5);
    const m = kit.cbox(s, s * 0.15, s * 0.8, rng.pick([0x5a9a48, 0x4f8f3e, 0x8a7a50, 0xd8d0c0, 0xc9b07a]), [0, 0, 0], { cast: false });
    CITY.g.add(m);
    leaves.push({ m, ph: rng.next(), y: rng.range(0.2, 6), z: rng.range(-6, 1.5), v: rng.range(25, 55), spin: [rng.range(-12, 12), rng.range(-12, 12), rng.range(-12, 12)] });
  }

  // ---------------------------------------------------------------- Küstenstadt (Westküste: Ozean links)
  const KX = 8000;
  const COAST = makeSet('coast', { bg: 0xbcd7ea, fog: [0xc8dcea, 160, 700], exposure: 1.05 });
  const beach = kit.box(240, 0.6, 260, 0xe3cf9a, [KX + 120, -0.5, 0], { cast: false });
  const grass = kit.box(200, 0.62, 260, 0x6aa84f, [KX + 140, -0.5, 0], { cast: false });
  COAST.g.add(beach, grass);
  const houses = [];
  for (let i = 0; i < 70; i++) {
    const x = rng.range(26, 220);
    const z = rng.range(-110, 60);
    const big = rng.next() < 0.25;
    const h = big ? P.tower({ w: rng.range(8, 14), h: rng.range(14, 34), d: rng.range(8, 14), color: rng.pick(towerPal), lit: 0.1 }) : kit.group(kit.box(5, 3.2, 6, rng.pick([0xf2efe8, 0xe8c9a0, 0xd9a07a, 0xb8d0e0]), [0, 0, 0]), kit.box(5.6, 1.4, 6.6, rng.pick([0xb04a3a, 0x7a4a3a, 0x4a5a6a]), [0, 3.2, 0]));
    h.position.set(KX + x, 0, z);
    h.rotation.y = rng.range(-0.15, 0.15);
    COAST.g.add(h);
    houses.push({ h, base: h.position.clone(), rot: h.rotation.y, spin: rng.range(-0.8, 0.8) });
  }
  for (let i = 0; i < 60; i++) {
    const t = P.tree({ h: rng.range(3, 5), color: rng.pick([0x4f8f3e, 0x5a9a48]) });
    t.position.set(KX + rng.range(20, 230), 0, rng.range(-110, 60));
    COAST.g.add(t);
    houses.push({ h: t, base: t.position.clone(), rot: 0, spin: rng.range(-1, 1) });
  }
  // Ozean: unterteilte Fläche, Höhe pro Frame aus der Wellenfront berechnet (Ost = +x)
  const OW = 520;
  const OD = 280;
  const oGeo = new THREE.PlaneGeometry(OW, OD, 208, 70);
  oGeo.rotateX(-Math.PI / 2);
  oGeo.translate(KX - OW / 2 + 240, 0, -20);
  const oCol = new Float32Array(oGeo.attributes.position.count * 3);
  oGeo.setAttribute('color', new THREE.BufferAttribute(oCol, 3));
  const ocean = new THREE.Mesh(oGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.05, flatShading: true }));
  COAST.g.add(ocean);
  const oBase = Float32Array.from(oGeo.attributes.position.array);
  const hemiK = new THREE.HemisphereLight(0xfff0dc, 0x5a6a7a, 1.3);
  const sunK = new THREE.DirectionalLight(0xffc890, 2.4);
  sunK.position.set(KX - 80, 120, 90);
  sunK.target.position.set(KX + 40, 0, -20);
  COAST.g.add(hemiK, sunK, sunK.target);
  const waveFront = (t) => -170 + 74 * (t - SH.ocean.from); // x relativ zu KX
  const updateOcean = (t) => {
    const pos = oGeo.attributes.position;
    const xf = waveFront(t);
    const c1 = new THREE.Color(0x1d5f9e);
    const c2 = new THREE.Color(0x2f86c4);
    const foam = new THREE.Color(0xf4fbff);
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = oBase[3 * i] - KX;
      const z = oBase[3 * i + 2];
      let y = 0.35 * Math.sin(x * 0.12 + t * 2.2) * Math.cos(z * 0.09 + t * 1.3) - 0.4;
      // Wellenwand: hinter der Front erhöht, vorne steile Kante mit Kamm
      const d = xf - x; // >0 = hinter der Front
      const wall = 17;
      if (d > 0) {
        const behind = wall * (0.55 + 0.45 * Math.exp(-d / 60)) * smooth(d / 7);
        const crest = 4.5 * Math.exp(-((d - 3) * (d - 3)) / 10);
        y += behind + crest + 0.8 * Math.sin(z * 0.2 + x * 0.3 + t * 4);
      } else if (x > 0) {
        y = -3; // vor der Front liegt Land: Wasser darunter verstecken
      }
      pos.setY(i, y);
      const f = d > -1 && d < 12 ? Math.exp(-Math.abs(d - 2) / 4) : 0;
      tmp.copy(c1).lerp(c2, clamp01(y / 20 + 0.3)).lerp(foam, clamp01(f * 1.1 + (y > 18 ? 0.5 : 0)));
      oCol[3 * i] = tmp.r;
      oCol[3 * i + 1] = tmp.g;
      oCol[3 * i + 2] = tmp.b;
    }
    pos.needsUpdate = true;
    oGeo.attributes.color.needsUpdate = true;
    oGeo.computeVertexNormals();
    for (const hs of houses) {
      const d = xf - (hs.base.x - KX);
      const k = clamp01(d / 30);
      hs.h.position.set(hs.base.x + Math.max(0, d) * 0.55 * k, hs.base.y + 6 * k * (1 - k) * 2, hs.base.z);
      hs.h.rotation.set(0.0, hs.rot + hs.spin * k, -0.9 * k);
    }
  };
  // Gischt
  const spray = [];
  for (let i = 0; i < 80; i++) {
    const m = kit.cbox(rng.range(0.6, 1.6), rng.range(0.6, 1.6), rng.range(0.6, 1.6), 0xf4fbff, [0, 0, 0], { cast: false });
    COAST.g.add(m);
    spray.push({ m, z: rng.range(-120, 60), ph: rng.next(), h: rng.range(12, 30) });
  }

  // ---------------------------------------------------------------- Nordpol
  const PX = 11000;
  const POLE = makeSet('pole', { bg: 0x0b1530, fog: [0x10203d, 30, 140] });
  POLE.g.add(kit.box(300, 0.5, 300, 0xe8f0f8, [PX, -0.5, 0], { cast: false }));
  for (let i = 0; i < 50; i++) {
    const s = rng.range(0.8, 4);
    const m = kit.box(s * rng.range(1, 2), s * rng.range(0.3, 0.8), s, rng.pick([0xdfeaf5, 0xcfe0f0, 0xf4f8fc]), [PX + rng.range(-60, 60), 0, rng.range(-70, 10)]);
    m.rotation.y = rng.range(0, 3);
    if (Math.abs(m.position.x - PX) < 6 && m.position.z > -10) continue;
    POLE.g.add(m);
  }
  const poleSign = (() => {
    const g = new THREE.Group();
    const stripes = P.canvasTex(64, 512, (c, w, h) => {
      for (let i = 0; i < 16; i++) {
        c.fillStyle = i % 2 ? '#ffffff' : '#d42a2a';
        c.fillRect(0, (i * h) / 16, w, h / 16 + 1);
      }
    });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 2.6, 20), new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.6 }));
    post.position.y = 1.3;
    post.castShadow = true;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), new THREE.MeshStandardMaterial({ color: 0xffd34a, roughness: 0.3, metalness: 0.4 }));
    ball.position.y = 2.7;
    const board = P.sign('NORTH\nPOLE', { w: 1.1, h: 0.6, color: '#1b2a4a', bg: '#ffffff', post: false });
    board.position.set(0, 2.0, 0.15);
    g.add(post, ball, board);
    return g;
  })();
  poleSign.position.set(PX - 1.6, 0, -1.6);
  POLE.g.add(poleSign);
  const youPole = kit.human({ ...LOOK, shirt: 0xd8402e });
  youPole.setPosition(PX + 0.6, 0, -0.6, -0.25);
  POLE.g.add(youPole.root);
  const hemiP = new THREE.HemisphereLight(0x9fb8ff, 0x3a4a66, 1.35);
  const moonP = new THREE.DirectionalLight(0xc8dcff, 1.5);
  moonP.position.set(PX - 20, 30, 25);
  moonP.target.position.set(PX, 0, 0);
  moonP.castShadow = true;
  moonP.shadow.mapSize.set(1024, 1024);
  Object.assign(moonP.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 100 });
  POLE.g.add(hemiP, moonP, moonP.target);
  // Polarlicht: gewellte Bänder, additiv
  const auroras = [];
  for (let i = 0; i < 3; i++) {
    const geo = new THREE.PlaneGeometry(220, 34, 80, 1);
    const mat = new THREE.ShaderMaterial({
      uniforms: { col: { value: new THREE.Color([0x3dff9a, 0x46e0ff, 0x9a6bff][i]) }, k: { value: 0.75 - i * 0.18 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 col; uniform float k; varying vec2 vUv; void main(){ float a = smoothstep(0.0, 0.35, vUv.y) * (1.0 - smoothstep(0.35, 1.0, vUv.y)) * smoothstep(0.0, 0.15, vUv.x) * (1.0 - smoothstep(0.85, 1.0, vUv.x)); gl_FragColor = vec4(col * a * k, 1.0); }',
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(PX + (i - 1) * 25, 38 + i * 6, -110 - i * 15);
    POLE.g.add(m);
    auroras.push({ m, base: Float32Array.from(geo.attributes.position.array), ph: i * 1.7 });
  }
  const snow = [];
  for (let i = 0; i < 160; i++) {
    const m = kit.cbox(0.05, 0.05, 0.05, 0xffffff, [0, 0, 0], { cast: false });
    POLE.g.add(m);
    snow.push({ m, x: rng.range(-9, 9), z: rng.range(-9, 4), y0: rng.range(0, 8), v: rng.range(0.4, 1.0), ph: rng.next() * 6 });
  }

  // ================================================================ Zuordnung Einstellung → Ort
  const SET_OF = { hook: 'space', ny: 'space', street: 'city', stop: 'space', fly: 'city', flywide: 'city', buildings: 'city', distance: 'city', ocean: 'coast', wind1: 'city', wind2: 'city', atmo1: 'space', atmo2: 'space', twist: 'space', pole: 'pole', loop: 'space' };
  const shotAt = (t) => {
    let id = timeline.shots[0].id;
    for (const s of timeline.shots) if (t >= s.from / fps - 1e-9) id = s.id;
    return id;
  };

  // ================================================================ Erddrehung
  const W = 0.5; // sichtbare Drehgeschwindigkeit (stilisiert, rad/s)
  const spinAt = (t) => {
    if (t < STOP) return W * t;
    if (t < SH.twist.from) return W * STOP;
    if (t < SH.loop.from) return W * STOP + W * (t - SH.twist.from);
    return W * (t - T); // Schleife: endet exakt im Zustand von Frame 0
  };
  const cloudAt = (t) => {
    if (t < SH.twist.from) return W * t + 0.03 * t; // Wolken drehen nach dem Stopp einfach weiter
    if (t < SH.loop.from) return spinAt(t) + 0.4;
    return spinAt(t) + 0.03 * (t - T);
  };

  // Kamera des Hooks / der Schleife: tau = t (Hook) bzw. t − T (Schlussfahrt, tau < 0) – stetig in tau = 0
  const hookCam = (tau) => {
    const q = clamp01(-tau / 1.9);
    const th = (12 + 52 * smooth(q) * smooth(q)) * (Math.PI / 180);
    const d = 41 - 1.6 * tau + 12 * q * q;
    const al = -0.9 + 0.05 * tau - 0.5 * q * q;
    const pos = V3(d * Math.sin(th) * Math.cos(al), d * Math.cos(th), d * Math.sin(th) * Math.sin(al));
    // Erde etwas tiefer ins Bild (oben Platz für den Titel): Blickziel entlang der Bild-Oberkante verschieben
    const f = pos.clone().negate().normalize();
    const up = V3(0, 1, 0).sub(f.clone().multiplyScalar(f.y)).normalize();
    const look = up.multiplyScalar(3.2);
    return { pos: arr(pos), look: arr(look), fov: 50 };
  };
  const orbitCam = (lat, lon, dist, { lookAt = [0, 0, 0], fov = 45 } = {}) => {
    const p = kit.space.latLon(lat, lon, dist);
    return { pos: arr(p), look: lookAt, fov };
  };

  // ================================================================ Update
  let lastSet = null;
  return {
    update({ t }) {
      const id = shotAt(t);
      const setName = SET_OF[id];
      if (setName !== lastSet) {
        for (const [k, s] of Object.entries(sets)) s.g.visible = k === setName;
        const s = sets[setName];
        scene.background = s.bg;
        scene.fog = s.fog ? new THREE.Fog(s.fog[0], s.fog[1], s.fog[2]) : null;
        renderer.toneMappingExposure = s.exposure;
        lastSet = setName;
      }
      const fx = {};
      let cam;

      if (setName === 'space') {
        earth.setSpin(spinAt(t));
        earth.clouds.rotation.y = cloudAt(t);
        nyPin.visible = id === 'ny' || id === 'stop';
        nyPin.userData.pulse(t);
        nyPin.scale.setScalar(id === 'ny' ? easeOut(seg(t, EV.ny_pin, EV.ny_pin + 0.35)) : 1);
        polePin.visible = id === 'twist';
        polePin.userData.pulse(t);
        polePin.scale.setScalar(easeOut(seg(t, EV.pole - 0.05, EV.pole + 0.3)) * 1.4);
        const stormOn = id === 'atmo1' || id === 'atmo2';
        storm1.visible = storm2.visible = stormOn;
        earth.clouds.visible = !stormOn;
        earth.atmo.userData.setStrength(stormOn ? 1.5 : 1.0);
      }

      switch (id) {
        case 'hook':
          cam = hookCam(t);
          break;
        case 'loop':
          cam = hookCam(t - T);
          break;
        case 'ny': {
          // Schwung vom Pol hinunter nach New York (NY dreht mit – Kamera folgt)
          const k = ease(seg(t, SH.ny.from, SH.ny.to - 0.3));
          const a = hookCam(SH.ny.from);
          const ny = earth.world(40.71, -74.0);
          const nyDir = ny.clone().normalize();
          const pA = V3(...a.pos);
          const dA = pA.length();
          const dir = pA.clone().normalize().lerp(nyDir.clone().add(V3(0, -0.18, 0)).normalize(), k).normalize();
          const d = lerp(dA, 21, k);
          const look = V3(...a.look).lerp(ny.clone().multiplyScalar(0.92), k);
          cam = { pos: arr(dir.multiplyScalar(d)), look: arr(look), fov: lerp(50, 40, k) };
          break;
        }
        case 'stop': {
          // Erde von der Seite, New York im Blick; beim Stopp: Ruck, Blitz, Wolken gleiten weiter
          const lon = -74 + (spinAt(t) * 180) / Math.PI - 10;
          const base = orbitCam(22, lon, lerp(37, 33, seg(t, SH.stop.from, STOP)), { fov: 44 });
          const s = shake(t, STOP, 1.3, 0.55);
          cam = { ...base, pos: addV(base.pos, s) };
          const k = seg(t, STOP, STOP + 0.25);
          fx.flash = t >= STOP ? 0.55 * (1 - easeOut(k)) : 0;
          fx.chroma = t >= STOP ? 9 * (1 - k) : 0;
          fx.radial = t >= STOP ? 0.012 * (1 - easeOut(seg(t, STOP, STOP + 0.4))) : 0;
          break;
        }
        case 'atmo1': {
          // tiefer Orbit: Staub- und Wolkenschlieren rasen über die Oberfläche (Ost = Bildschirm rechts)
          const ts = t - SH.atmo1.from;
          storm1.rotation.y = 1.2 * ts + 0.3;
          storm2.rotation.y = 1.55 * ts;
          storm1.material.opacity = 0.9;
          const p = kit.space.latLon(18, -55 + 3 * ts, 19.5);
          const look = kit.space.latLon(28, -55 + 3 * ts + 6, 6);
          const s = shake(t, SH.atmo1.from, 2.6, 0.06);
          cam = { pos: addV(arr(p), s), look: arr(look), fov: 50 };
          break;
        }
        case 'atmo2': {
          const ts = t - SH.atmo1.from;
          const k = seg(t, SH.atmo2.from, SH.atmo2.to);
          const slow = 1 - 0.6 * ease(k);
          storm1.rotation.y = 0.3 + 1.2 * (SH.atmo2.from - SH.atmo1.from) + 1.2 * slow * (t - SH.atmo2.from);
          storm2.rotation.y = 1.55 * (SH.atmo2.from - SH.atmo1.from) + 1.55 * slow * (t - SH.atmo2.from);
          storm1.material.opacity = 0.9 * (1 - 0.35 * ease(k));
          const c = orbitCam(lerp(22, 12, ease(k)), lerp(-30, -18, k), lerp(19, 34, easeOut(k)), { fov: 46 });
          cam = c;
          void ts;
          break;
        }
        case 'twist': {
          // Ruhe nach dem Sturm: Kamera steigt zum Nordpol
          const k = ease(seg(t, SH.twist.from, SH.twist.to));
          const lon = (spinAt(t) * 180) / Math.PI * 0.2 - 40;
          cam = orbitCam(lerp(14, 72, k), lon, lerp(30, 21, k), { fov: 44, lookAt: [0, lerp(0, 6, k), 0] });
          break;
        }
        default:
          break;
      }

      if (setName === 'city') {
        // Grundzustände
        for (const fl of flyers) (fl.obj.root || fl.obj).visible = id === 'flywide';
        for (const b of buddies) b.obj.root.visible = id === 'fly';
        for (const b of buddyCars) b.c.visible = id === 'fly';
        for (const d of debris) d.m.visible = id === 'buildings';
        for (const m of trailDots) m.visible = false;
        trailHead.visible = startRing.visible = id === 'distance';
        for (const s of streaks) s.m.visible = false;
        for (const l of leaves) l.m.visible = id === 'wind1' || id === 'wind2';
        windCar.visible = id === 'wind1' || id === 'wind2';
        grid.visible = id === 'distance';
        you.root.visible = id === 'street' || id === 'fly';
        for (const w of walkers) w.root.visible = id === 'street';
        for (const c of cars) c.c.visible = id === 'street';
        sunC.castShadow = id !== 'distance';
        scene.fog.far = id === 'distance' ? 1400 : 260;
        scene.fog.near = id === 'distance' ? 300 : 60;
      }

      switch (id) {
        case 'street': {
          const ts = t - SH.street.from;
          const shrug = t > 6.55 ? 'shrug' : 'stand';
          you.setPosition(X0, 0.12, -5.3, 0.15);
          you.root.rotation.set(0, 0.15, 0);
          you.pose(shrug, ts).mood(t > 6.4 ? 'happy' : 'neutral').look(0, 0);
          cup.visible = shrug === 'stand';
          walkers.forEach((w, i) => {
            const dir = i % 2 ? 1 : -1;
            const p = w.phase * 10 + ts;
            w.setPosition(CX - 14 + ((p * 1.3 + i * 5.3) % 30), 0.12, i % 2 ? -6.3 : -4.6, dir > 0 ? Math.PI / 2 : -Math.PI / 2);
            if (dir < 0) w.root.position.x = CX + 16 - ((p * 1.3 + i * 5.3) % 30);
            w.pose('walk', p * 1.7).mood('neutral');
          });
          cars.forEach((c) => {
            c.c.position.set(CX + c.x + (c.z > 0 ? 1 : -1) * 4 * ts, 0, c.z);
            c.c.rotation.y = c.z > 0 ? Math.PI / 2 : -Math.PI / 2;
          });
          const k = ease(seg(t, SH.street.from, SH.street.to));
          cam = { pos: [X0 + lerp(2.4, 1.2, k), lerp(1.9, 1.7, k), lerp(3.4, 1.4, k)], look: [X0 - 0.1, 0.55, -5.3], fov: lerp(48, 40, k) };
          sunFollow(sunC, X0, 0, -3);
          break;
        }
        case 'fly': {
          // Verfolgungsfahrt: „You“ fliegt mit den anderen nach Osten, Boden rast vorbei
          const ts = t - SH.fly.from;
          const Vf = 42;
          const yx = X0 + 8 + Vf * ts;
          const yy = 2.3 + 0.9 * Math.sin(ts * 2.1);
          you.setPosition(yx, yy, -1.2, 0).pose('armsUp', ts * 3).mood('shock');
          you.root.rotation.set(0.5 * Math.sin(ts * 2.3), Math.PI / 2 + 0.6 * Math.sin(ts * 1.4), -1.1 - 0.5 * ts);
          cup.visible = false;
          for (const b of buddies) {
            b.obj.setPosition(yx + b.dx + b.dv * ts, b.y + 0.6 * Math.sin(ts * 2 + b.dx), b.z, 0).pose('armsUp', ts * 3 + b.dx).mood('shock');
            b.obj.root.rotation.set(b.spin[0] * ts * 0.4, b.spin[1] * ts * 0.4, b.spin[2] * ts * 0.4);
          }
          for (const b of buddyCars) {
            b.c.position.set(yx + b.dx + b.dv * ts, b.y + 0.5 * Math.sin(ts * 1.7 + b.dx), b.z);
            b.c.rotation.set(b.spin[0] * ts, Math.PI / 2 + b.spin[1] * ts, b.spin[2] * ts);
          }
          const s = shake(t, SH.fly.from, 3.0, 0.22, 1.3);
          cam = { pos: addV([yx - 1.2, 2.9, 6.8], s), look: [yx + 0.6, 2.1, -1.2], fov: 62, roll: -0.05 * Math.sin(ts * 3) };
          sunFollow(sunC, yx, 0, -2);
          break;
        }
        case 'flywide': {
          const ts = t - SH.flywide.from;
          for (const fl of flyers) {
            const o = fl.obj.root || fl.obj;
            const dt = t - fl.t0;
            const x = XW - 24 + fl.v * dt;
            const vis = x > XW - 50 && x < XW + 60;
            o.visible = vis;
            if (!vis) continue;
            o.position.set(x, fl.y0 + 1.6 * Math.sin(dt * 2.4) + (fl.kind === 'car' ? 0.4 : 0.8), fl.z);
            o.rotation.set(fl.spin[0] * dt * 0.5, fl.spin[1] * dt * 0.5 + Math.PI / 2, fl.spin[2] * dt * 0.5);
            if (fl.kind === 'human') fl.obj.pose('armsUp', dt * 3).mood('shock');
          }
          for (const s of streaks) {
            s.m.visible = true;
            const x = XW - 60 + (((s.ph * 120 + s.v * ts) % 120) + 120) % 120;
            s.m.position.set(x, s.y, s.z);
            s.m.scale.set(s.len, 1, 1);
          }
          const s = shake(t, SH.flywide.from, 2.5, 0.12, 1.1);
          cam = { pos: addV([XW - 2, 2.2, 8.5], s), look: [XW - 1, 3.0, -6], fov: 76 };
          sunFollow(sunC, XW, 0, -2);
          break;
        }
        case 'buildings': {
          const t0 = EV.buildings;
          for (const floors of ripBuildings) {
            for (const fl of floors) {
              const dt = Math.max(0, t - t0 - fl.f * 0.025);
              const push = (0.3 + fl.f * 0.3) * dt * dt * 3.2 + (fl.f > 0 ? fl.f * 0.35 * easeOut(dt * 4) : 0);
              fl.m.position.set(fl.base.x + push, fl.base.y + (fl.f > 0 ? Math.sin(dt * 3) * 0.5 * dt * fl.f * 0.3 : 0), fl.base.z + fl.r[0] * dt * 3);
              fl.m.rotation.set(fl.r[0] * dt * 0.8, fl.r[1] * dt * 0.8, fl.r[2] * dt * 1.0 * (fl.f > 0 ? 1 : 0));
            }
          }
          for (const d of debris) {
            const dt = t - d.t0;
            d.m.visible = dt > 0;
            if (dt <= 0) continue;
            d.m.position.set(d.x + d.v * dt, Math.max(0.2, d.y + d.vy * dt - 4.9 * dt * dt), d.z);
            d.m.rotation.set(d.spin[0] * dt, d.spin[1] * dt, d.spin[2] * dt);
          }
          for (const s of streaks) {
            s.m.visible = true;
            const ts = t - SH.buildings.from;
            s.m.position.set(XB - 50 + (((s.ph * 110 + s.v * ts) % 110) + 110) % 110, s.y * 1.6, s.z - 4);
            s.m.scale.set(s.len, 1, 1);
          }
          const k = seg(t, SH.buildings.from, SH.buildings.to);
          const s = shake(t, t0, 1.4, 0.35, 1.2);
          cam = { pos: addV([XB - 8 + 4 * k, 1.8, 7.4 - 1.5 * k], s), look: [XB + 1, 12, -14], fov: 72 };
          sunFollow(sunC, XB, 0, -8);
          break;
        }
        case 'distance': {
          // Luftbild in echtem Maßstab: 352 m (1.155 ft) in einer Sekunde
          const k = (EASE_INOUT)(seg(t, 16.8, 19.45));
          const hx = X0 + 352 * k;
          trailHead.position.set(hx, 2 + 26 * Math.sin(Math.PI * k), 0);
          trailDots.forEach((m, i) => {
            const f = (i + 0.5) / trailDots.length;
            m.visible = f <= k + 1e-6;
            m.position.y = 2 + 26 * Math.sin(Math.PI * f);
          });
          const kc = ease(seg(t, SH.distance.from, SH.distance.to));
          cam = { pos: [X0 + lerp(60, 250, kc), lerp(330, 300, kc), lerp(330, 300, kc)], look: [X0 + lerp(90, 260, kc), 0, -10], fov: 50 };
          break;
        }
        case 'wind1':
        case 'wind2': {
          const ts = t - SH.wind1.from;
          const gust = 0.75 + 0.25 * Math.sin(ts * 7.3) * Math.sin(ts * 3.1);
          for (const tr of windTrees) {
            tr.g.rotation.set(0, 0, -(0.85 + 0.2 * Math.sin(ts * 9 + tr.ph)) * gust);
          }
          // Taxi rutscht, kippt und überschlägt sich
          const cx = XWND - 30 + 14 * ts * ts * 0.5 + 4 * ts;
          windCar.position.set(cx, 0.6 * Math.max(0, ts - 1) + 0.3, 2.4);
          windCar.rotation.set(0, Math.PI / 2, -Math.max(0, ts - 0.8) * 2.2);
          for (const l of leaves) {
            const x = XWND - 40 + (((l.ph * 90 + l.v * ts) % 90) + 90) % 90;
            l.m.position.set(x, l.y + 0.5 * Math.sin(ts * 5 + l.ph * 9), l.z);
            l.m.rotation.set(l.spin[0] * ts, l.spin[1] * ts, l.spin[2] * ts);
          }
          for (const s of streaks) {
            s.m.visible = true;
            s.m.position.set(XWND - 50 + (((s.ph * 100 + s.v * ts) % 100) + 100) % 100, s.y * 0.7, s.z);
            s.m.scale.set(s.len, 1, 1);
          }
          if (id === 'wind1') {
            const k = ease(seg(t, SH.wind1.from, SH.wind1.to));
            const s = shake(t, SH.wind1.from, 2.3, 0.08, 1.4);
            cam = { pos: addV([XWND + lerp(-7, -3, k), 1.7, 3.2], s), look: [XWND - 5, 2.6, -6], fov: 66 };
          } else {
            const k = ease(seg(t, SH.wind2.from, SH.wind2.to));
            const s = shake(t, SH.wind2.from, 2.2, 0.1, 1.5);
            cam = { pos: addV([XWND - 34 + 3 * k, 0.9, 1.2], s), look: [XWND + 10, 2.4 + k, -0.8], fov: 58, roll: 0.04 };
          }
          sunFollow(sunC, XWND - 10, 0, 0);
          fx.blurX = 6;
          break;
        }
        case 'ocean': {
          updateOcean(t);
          const xf = waveFront(t);
          for (const sp of spray) {
            const dt = (t * 1.4 + sp.ph) % 1;
            sp.m.position.set(KX + xf - 2 + dt * 8, 14 + sp.h * Math.sin(Math.PI * dt), sp.z);
            sp.m.visible = xf > -150;
          }
          const k = ease(seg(t, SH.ocean.from, SH.ocean.to));
          const s = shake(t, SH.ocean.from + 1.6, 2.4, 0.4, 0.9);
          cam = { pos: addV([KX + lerp(-30, 40, k), lerp(42, 34, k), lerp(150, 120, k)], s), look: [KX + lerp(-20, 50, k), 4, -30], fov: 50 };
          break;
        }
        case 'pole': {
          const ts = t - SH.pole.from;
          youPole.pose('wave', ts * 1.6).mood('happy', ts > 1.2 && ts < 1.3);
          for (const a of auroras) {
            const pos = a.m.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
              const x = a.base[3 * i];
              pos.setZ(i, a.base[3 * i + 2] + 9 * Math.sin(x * 0.03 + t * 0.6 + a.ph));
              pos.setY(i, a.base[3 * i + 1] + 3 * Math.sin(x * 0.05 + t * 0.4 + a.ph));
            }
            pos.needsUpdate = true;
          }
          for (const s of snow) {
            const y = (((s.y0 - s.v * t) % 8) + 8) % 8;
            s.m.position.set(PX + s.x + 0.3 * Math.sin(t + s.ph), y, s.z);
          }
          const k = ease(seg(t, SH.pole.from, SH.pole.to));
          const a = lerp(0.35, -0.15, k);
          cam = { pos: [PX + 7.5 * Math.sin(a), lerp(1.7, 2.1, k), 7.5 * Math.cos(a)], look: [PX - 0.2, 0.75, -1], fov: 46 };
          break;
        }
        default:
          break;
      }
      if (!cam) throw new Error(`Keine Kamera für Einstellung ${id}`);
      if (setName === 'space') {
        // Sonne seitlich hinter der Kamera: sichtbare Seite beleuchtet, Tag-Nacht-Grenze am Rand
        const d = V3(...cam.pos).normalize();
        const side = V3(0, 1, 0).cross(d).normalize();
        sunS.position.copy(d.multiplyScalar(30).add(side.multiplyScalar(26)).add(V3(0, 14, 0)));
      }
      return { camera: cam, fx };
    },
  };
}

const EASE_INOUT = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
