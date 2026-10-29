// Baukasten-Demo: zeigt Figur, Gefühle, Posen und alle Orte des Kits in 6 kurzen Einstellungen.
// Kein Inhaltsvideo – dient als Vorlage, wie eine Produktion das Kit benutzt.
import { createKit } from '/pipeline/runtime/kit/index.js';

export async function build({ THREE, scene, renderer, rng }) {
  const kit = createKit({ THREE, scene, renderer, rng });
  const { props: P, places: PL, ramp, lerp } = kit;
  const { sun } = kit.setupLook({ scene, renderer }, 'day');

  // Orte – jeder an eigener Stelle der Welt
  const bedroom = PL.bedroom([0, 0, 0], { clock: '9:47' });
  const kitchen = PL.kitchen([40, 0, 0]);
  const street = PL.street([100, 0, 0], { length: 70, clear: { side: -1, from: -14, to: 22 } });
  const office = PL.office([-50, 0, 0]);
  const park = PL.park([0, 0, 120]);
  for (const p of [bedroom, kitchen, street, office, park]) scene.add(p.root);
  const sets = [
    { from: 0, origin: bedroom.origin },
    { from: 4, origin: kitchen.origin },
    { from: 8, origin: [97, 0, 0] },
    { from: 12, origin: office.origin },
    { from: 16, origin: park.origin },
  ];

  // Hauptfigur „You“ – in jedem Ort eine eigene Instanz (gleiches Aussehen = Kontinuität)
  const look = { shirt: 0xe2703a, pants: 0x2d3e66, hair: 'short', hairColor: 0x3b2a20, skin: kit.SKIN[1] };
  const you = Object.fromEntries(['bed', 'kitchen', 'street', 'office', 'park'].map((k) => {
    const h = kit.human(look);
    scene.add(h.root);
    return [k, h];
  }));
  you.bed.setPosition(0.3, 0.55, -1.4);
  you.kitchen.setPosition(40.3, 0, -1.25, Math.PI * 0.82);
  you.office.setPosition(-50.35, 0, 1.7, 0.25);
  you.park.setPosition(-2.35, 0, 119, Math.PI / 2);

  // Küche: verbrannter Toast + Rauch
  const toastPiece = P.toast(true);
  toastPiece.position.set(40.5, 1.1, -2.1);
  scene.add(toastPiece);
  const smoke = [];
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), new THREE.MeshStandardMaterial({ color: 0x2b2b2e, transparent: true, opacity: 0.8, flatShading: true }));
    scene.add(m);
    smoke.push({ m, off: i / 9 });
  }

  // Straße: Bus fährt davon, Figur rennt hinterher
  const bus = P.bus();
  bus.position.set(97.4, 0, 0);
  scene.add(bus);
  const stop = kit.group(P.sign('BUS', { w: 0.5, h: 0.5, color: '#ffffff', bg: '#2a6fb0' }));
  stop.position.set(95.2, 0.12, 2);
  scene.add(stop);

  // Büro: Chef zeigt zur Tür, Figur trägt Karton
  const boss = kit.human({ shirt: 0x2a2f3a, pants: 0x2a2f3a, hair: 'short', hairColor: 0x9a9a9a, tie: 0xb02a2a, skin: kit.SKIN[0] });
  boss.setPosition(-49.2, 0, 1.0, -0.9);
  scene.add(boss.root);
  const carton = P.cardboardBox();
  carton.position.set(0, -0.12, 0.28);
  carton.rotation.x = 0;
  you.office.hands.right.add(carton);
  carton.position.set(0.2, -0.3, 0.12);
  carton.scale.setScalar(0.9);
  const coworkers = kit.crowd(3, [-53.5, -46.5, -2.6, -0.4]);

  // Park: Schild + Farbfleck
  const wet = P.sign('WET\nPAINT', { w: 0.8, h: 0.6 });
  wet.position.set(-2.0, 0, 117.6);
  wet.rotation.y = 0.5;
  scene.add(wet);
  const passers = kit.crowd(4, [-8, 8, 100, 110]);

  // POV-Handy
  const ph = P.bigPhone({ mode: 'chat', name: 'Sarah', messages: [{ from: 'me', text: 'love you' }, { from: 'them', text: 'We need to talk.' }] });
  ph.position.set(0.1, 1.3, 124.9);
  ph.rotation.x = -0.12;
  scene.add(ph);
  const hand = kit.group(kit.cbox(0.22, 0.5, 0.18, kit.SKIN[1], [0, -0.3, -0.03]), kit.cbox(0.1, 0.22, 0.08, kit.SKIN[1], [-0.17, -0.05, 0.04]));
  hand.position.set(0.16, 1.16, 124.86);
  hand.rotation.x = -0.12;
  scene.add(hand);

  return {
    update({ t }) {
      const set = kit.activeSet(sets, t);
      kit.sunAt(sun, set.origin);

      // 0–4 s Bett: müde, blinzelt
      you.bed.pose('lie').mood('tired', t > 2.0 && t < 2.15);

      // 4–8 s Küche: Rauch steigt, Facepalm ab 5,5 s
      const tk = t - 4;
      you.kitchen.pose(tk > 1.5 ? 'facepalm' : 'stand', tk).mood(tk > 1.5 ? 'sad' : 'shock');
      for (const s of smoke) {
        const k = (tk * 0.45 + s.off) % 1;
        s.m.position.set(40.5 + 0.15 * Math.sin(k * 9 + s.off * 20), 1.2 + k * 1.4, -2.1 + 0.1 * Math.cos(k * 7));
        s.m.scale.setScalar(0.6 + k * 2.2);
        s.m.material.opacity = 0.75 * (1 - k);
      }

      // 8–12 s Straße: Bus fährt an, Figur rennt
      const ts = t - 8;
      bus.position.z = 2 + Math.max(0, ts - 0.5) ** 2 * 0.9;
      you.street.setPosition(94.6, 0.12, -4 + ts * 2.6).pose('run', ts * 1.7).mood('shock');

      // 12–16 s Büro
      const to = t - 12;
      you.office.pose('carry', to).mood('sad');
      boss.pose('point', to).mood('angry');
      coworkers.forEach((c, i) => c.pose('stand', to + i).mood('worried'));

      // 16–20 s Park: setzt sich auf frisch gestrichene Bank → Schock
      const tp = t - 16;
      you.park.pose('sit', tp).mood(tp > 1.6 ? 'shock' : 'tired');
      if (tp > 1.6) you.park.look(0.6, 0);
      passers.forEach((c, i) => {
        const p = c.phase * 10 + tp;
        c.root.position.x = -8 + ((p * 1.2 + i * 4) % 16);
        c.root.rotation.y = Math.PI / 2;
        c.pose('walk', p * 1.6).mood('neutral');
      });
    },
  };
}
