// Demo Version 3.0: Licht & Atmosphäre, Ich-Perspektive, Massen, Bloom/Grading – je Beat ein Ort.
// Kein Inhaltsvideo. Zweck: Vorschaubilder der neuen Kit-Teile (tools/still.mjs) und Vorlage für Produktionen.
import { createKit } from '/pipeline/runtime/kit/index.js';

export async function build({ THREE, scene, camera, renderer, rng, timeline }) {
  const kit = createKit({ THREE, scene, renderer, rng });
  const { atmo, masses, props: P } = kit;
  const B = kit.beatClock(timeline);
  const lights = kit.setupLook({ scene, renderer }, 'haze');
  await atmo.loadReflector();
  const sets = {};
  const add = (key, ...objs) => {
    sets[key] = sets[key] || new THREE.Group();
    for (const o of objs) sets[key].add(o.root || o);
    scene.add(sets[key]);
  };

  // 1) Café-Platz in Ich-Perspektive (C1-Prinzip: dir wird etwas übergeben). Dunst, Pflaster, Fassaden, Menge im Hintergrund.
  add('pov_cafe', atmo.ground('cobble', 60, 60, { perMeter: 0.6 }));
  const tbl = P.table({ w: 1.0, d: 1.0, color: 0x7a5a3e });
  tbl.position.set(0, 0, 0.1);
  const banker = kit.human({ shirt: 0xf1f1f1, pants: 0xf1f1f1, tie: 0x1d1d1f, hair: 'short', hairColor: 0x1d1d1f, skin: kit.SKIN[2], beard: 0x1d1d1f });
  banker.setPosition(0, 0, -1.05, 0);
  const bchair = P.chair(0x6b4a2e);
  bchair.position.set(0, 0, -1.25);
  add('pov_cafe', bchair);
  add('pov_cafe', tbl, banker.root);
  for (const [x, z, c] of [[-9, -16, 0xd9cbb2], [0, -20, 0xcbbca0], [9, -16, 0xd6c6aa], [-17, -10, 0xbfb29a], [17, -10, 0xc8b89c]]) {
    const b = P.building({ w: 8, floors: 6, d: 6, color: c, win: 0x7f93a6 });
    b.position.set(x, 0, z);
    add('pov_cafe', b);
  }
  add('pov_cafe', masses.skyline({ center: [0, 0, 0], radius: 70, color: 0xa9b3bc, seed: 3 }));
  const plazaCrowd = masses.crowd({ count: 140, area: [-14, 14, -14, -5], anim: 'idle', palette: [0x6f7a86, 0x8a949e, 0x5b6470, 0xa3abb3, 0xe8e2d6], seed: 5 });
  add('pov_cafe', plazaCrowd, atmo.stringLights({ from: [-6, 3.2, -3], to: [6, 3.2, -3], count: 22, sag: 0.5 }));
  const me = kit.firstPerson({ camera, scene, sleeve: 0x2f5fb0, skin: kit.SKIN[0], cuff: 0xf1f1f1 });
  const card = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.004, 0.054), new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.25, metalness: 0.6 }));
  const cardOnTable = card.clone();
  cardOnTable.position.set(0, 0.755, -0.25);
  add('pov_cafe', cardOnTable);

  // 2) Neon-Party am Pool (C2-Prinzip: Lichtquellen, Spiegelung, Masse). Neon-Nacht, Lichterketten, Bloom.
  const pool = atmo.water({ w: 10, d: 6, mirror: true, color: 0x1fa6c8 });
  pool.root.position.set(200, 0.02, -3);
  add('neon_party', atmo.ground('tiles', 40, 40, { color: 0xc9c2b4, perMeter: 0.8 }), pool);
  sets.neon_party.children[0].position.x = 200;
  const partyCrowd = masses.crowd({ count: 320, area: [189, 211, -16, -7.5], anim: 'cheer', face: [200, 0, -3], palette: [0xff4fa3, 0xffffff, 0x3fc1ff, 0xffd23f, 0x2b2b2b], seed: 7 });
  add('neon_party', partyCrowd);
  for (let i = 0; i < 4; i++) add('neon_party', atmo.stringLights({ from: [190, 4, -12 + i * 4], to: [210, 4, -12 + i * 4], count: 26, sag: 0.6, color: 0xffd9a0, light: i % 2 }));
  const n1 = atmo.neonStrip({ shape: 'rect', w: 6, h: 2, color: 0xff3fa4 });
  n1.root.position.set(200, 6, -16);
  const n2 = atmo.neonStrip({ w: 18, color: 0x3fc1ff });
  n2.root.position.set(200, 0.15, 0.2);
  add('neon_party', n1, n2, masses.skyline({ center: [200, 0, 0], radius: 110, night: true, color: 0x1c2233, seed: 9 }));
  const sparks = atmo.dust({ center: [200, 3, -4], size: [18, 5, 14], count: 300, color: 0xff9ad5, seed: 2 });
  add('neon_party', sparks);

  // 3) Stadion (C1-Schauwert „Masse“): Tribüne mit ≈ 1.000 Zuschauern, Scheinwerfer-Kegel, Gegenlicht.
  add('stadium', atmo.ground('grass', 70, 50, { color: 0x4f8a3c, perMeter: 0.3 }));
  sets.stadium.children[0].position.set(400, 0, -5);
  const st = masses.stands({ width: 56, rows: 18, crowd: 0.9, anim: 'cheer', seed: 13 });
  st.root.position.set(400, 0, -24);
  add('stadium', st);
  for (const x of [-20, 20]) {
    const s = atmo.spotCone({ pos: [400 + x, 18, -30], target: [400 + x * 0.3, 0, -6], color: 0xfff1d6, intensity: 300, angle: 0.28, coneOpacity: 0.07 });
    add('stadium', s);
  }
  for (const x of [-3, 2.5]) {
    const pl = kit.human({ shirt: x < 0 ? 0xf1f1f1 : 0xd8342c, pants: 0x1d1d1f, hair: 'short' });
    pl.setPosition(400 + x, 0, -8, x < 0 ? 0.6 : -2.4);
    pl.pose('run', 0.3);
    add('stadium', pl.root);
  }

  // 4) Feld voller roter Autos (C1 „every Ferrari“): Masse + Akzentfarbe + Gegenlicht über Dunst.
  add('car_field', atmo.ground('asphalt', 120, 120, { perMeter: 0.4 }));
  sets.car_field.children[0].position.set(600, 0, -30);
  const cars = masses.carField({ rows: 16, cols: 22, color: 0xd8342c, seed: 17 });
  cars.root.position.set(600, 0, -14);
  add('car_field', cars, masses.skyline({ center: [600, 0, 0], radius: 120, color: 0x9aa4ad, seed: 19 }));
  const buyer = kit.human({ shirt: 0x2f5fb0, pants: 0x2d3e66, hair: 'short', skin: kit.SKIN[0] });
  buyer.setPosition(600.8, 0, -8.6, Math.PI);
  add('car_field', buyer.root);

  // 5) Nachtstraße mit Lichtinseln (Gegenentwurf zu A2 41 s: Lichtquellen statt gleichmäßig blau abgedunkelt)
  add('night_street', atmo.ground('cobble', 40, 60, { color: 0x6b6863, perMeter: 0.7 }));
  sets.night_street.children[0].position.set(800, 0, 0);
  for (const [x, z] of [[-6, -6], [-6, 4], [6, -2]]) {
    const b = P.building({ w: 7, floors: 4, d: 6, color: 0x4a3f3c, win: 0x1c2230, lit: 0.6 });
    b.position.set(800 + x, 0, z);
    b.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    add('night_street', b);
  }
  for (const z of [-8, 0, 8]) {
    const lamp = P.streetLamp(true);
    lamp.position.set(797.6, 0, z);
    add('night_street', lamp, atmo.lampPool({ pos: [798, 3.8, z] }));
  }
  const sign = atmo.glowSign({ text: 'OPEN 24/7', w: 1.8, h: 0.5, color: '#ff4fa3' });
  sign.root.position.set(802.9, 3, 1);
  sign.root.rotation.y = -Math.PI / 2;
  const lampDust = atmo.dust({ center: [798, 2.5, 0], size: [3, 3, 14], count: 160, color: 0xffd9a0, seed: 23 });
  add('night_street', sign, lampDust);
  const walker = kit.human({ shirt: 0xd8342c, pants: 0x24304a, hair: 'short', skin: kit.SKIN[3] });
  add('night_street', walker.root);

  const LOOK = { pov_cafe: 'haze', neon_party: 'neonNight', stadium: 'goldenHour', car_field: 'backlight', night_street: 'neonNight' };
  const FX = {
    pov_cafe: { grade: { saturation: 0.88, contrast: 1.04, tint: [1.02, 1.0, 0.97] } },
    neon_party: { bloom: 0.9, bloomThreshold: 0.75, grade: { saturation: 1.0, contrast: 1.08, tint: [1.0, 0.97, 1.05] } },
    stadium: { bloom: 0.5, bloomThreshold: 0.85, grade: { saturation: 0.9, contrast: 1.06, tint: [1.04, 1.0, 0.94] } },
    car_field: { bloom: 0.4, grade: { saturation: 0.92, contrast: 1.05, tint: [1.04, 1.0, 0.95] } },
    night_street: { bloom: 0.8, bloomThreshold: 0.7, grade: { saturation: 0.9, contrast: 1.1, tint: [0.97, 0.98, 1.06] } },
  };
  const ORIGIN = { pov_cafe: [0, 0, 0], neon_party: [200, 0, -3], stadium: [400, 0, -10], car_field: [600, 0, -10], night_street: [800, 0, 0] };

  return {
    update({ t }) {
      const b = B.active(t);
      for (const [k, g] of Object.entries(sets)) g.visible = k === b.id;
      me.setVisible(b.id === 'pov_cafe');
      kit.applyLook({ scene, renderer, ...lights }, LOOK[b.id]);
      if (b.id === 'stadium' || b.id === 'car_field') atmo.sunBehind(lights.sun, ORIGIN[b.id], [ORIGIN[b.id][0], 2, 12], { height: 0.22 });
      else kit.sunAt(lights.sun, ORIGIN[b.id]);
      const lt = B.local(t, b.id);
      // Ich-Perspektive: Hände auf dem Tisch → Karte nehmen → zeigen
      const tc = B.ev('e_card');
      cardOnTable.visible = t < tc + 0.5;
      me.act([{ t: 0, gesture: 'table' }, { t: tc, gesture: 'reach', blend: 0.4 }, { t: tc + 0.5, gesture: 'show', blend: 0.5 }], t);
      if (t >= tc + 0.5 && !card.parent) me.hold(card, 'R', { pos: [0, 0.01, -0.02], rot: [1.2, 0, 0] });
      banker.act([{ t: 0, pose: 'placeLow', mood: 'smug', seated: 1 }, { t: tc + 0.3, pose: 'sit', mood: 'smug', blend: 0.5 }], t);
      plazaCrowd.update(t, { k: 0.5 });
      partyCrowd.update(t, { k: 1 });
      sparks.update(t, 1);
      pool.update(t);
      st.update(t, { k: 1 });
      walker.setPosition(799.4, 0, 2.2 - lt * 0.9, Math.PI);
      walker.act([{ t: 0, pose: 'walk', speed: 1.5, mood: 'worried' }], t);
      lampDust.update(t, 1);
      return { fx: FX[b.id] };
    },
  };
}
