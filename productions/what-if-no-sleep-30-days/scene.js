// What if you couldn't sleep for 30 days? – Stil B, Rezept B1, Hook-Typ „process“ (Guide 18.12).
// Nur Baukasten. Alle Zeiten aus timeline.json (erzeugt aus beats.json): B.beat(id), B.ev(id). Positionen aus beats[].data.
// Wiederkehrendes Zeichen: die Z-Gedankenblase platzt, sobald der Körper einschlafen will – erst an Tag 30 bleibt sie stehen.
import { createKit } from '/pipeline/runtime/kit/index.js';

export async function build({ THREE, scene, renderer, rng, timeline }) {
  const kit = createKit({ THREE, scene, renderer, rng });
  const { props: P, places: PL, ramp, lerp, clamp01 } = kit;
  const B = kit.beatClock(timeline);
  const lights = kit.setupLook({ scene, renderer }, 'nightRoom');
  const L = { scene, renderer, ...lights };
  const ev = B.ev;
  const at = (id) => B.beat(id).from;
  const pos = (id, key = 'you') => B.beat(id).data[key];
  const tmp = new THREE.Vector3();

  // ---------- Orte ----------
  const bedroom = PL.bedroom([0, 0, 0], { clock: '6:59' });
  const office = PL.office([-90, 0, 0]);
  const classroom = PL.classroom([40, 0, 0]);
  const kitchen = PL.kitchen([-40, 0, 0]);
  const street = PL.street([100, 0, 0], { length: 90, lit: 1, clear: { side: -1, from: -6, to: 16 } });
  const park = PL.park([0, 0, 120]);
  for (const p of [bedroom, office, classroom, kitchen, street, park]) scene.add(p.root);

  // Schlafzimmer: Fenster-Himmel (Nacht → Morgendämmerung), Wecker 7:00 vor dem 6:59-Wecker, Nachtlicht
  const winSky = kit.box(1.4, 1.3, 0.02, 0x1a2440, [-1.6, 1.06, -2.36], { cast: false, mat: { emissive: 0x1a2440, emissiveIntensity: 1.0 } });
  scene.add(winSky);
  const skyNight = new THREE.Color(0x1a2a52);
  const skyDawn = new THREE.Color(0xffc890);
  const clock7 = P.alarmClock('7:00');
  clock7.position.set(1.4, 0.5, -1.985);
  scene.add(clock7);
  const moon = new THREE.PointLight(0x9fb4ff, 0, 6, 1.4);
  moon.position.set(-1.2, 2.0, -1.0);
  scene.add(moon);
  const lamp = new THREE.PointLight(0xffc98a, 0, 6, 1.6);
  lamp.position.set(1.5, 1.4, -1.2);
  scene.add(lamp);
  const fill = new THREE.PointLight(0xc8d4ff, 0, 9, 1.2);
  fill.position.set(0.6, 2.4, 1.6);
  scene.add(fill);

  // Schafe: 14 Springer + 18 am Boden (Nacht 1), wiederverwendet für die Halluzination auf der Straße
  const jumpers = Array.from({ length: 14 }, () => {
    const s = P.sheep();
    s.scale.setScalar(0.75);
    scene.add(s);
    return s;
  });
  const floorSpots = [];
  while (floorSpots.length < 18) {
    const x = rng.range(-2.3, 2.4);
    const z = rng.range(-2.0, 1.4);
    const onBed = x > -0.6 && x < 1.2 && z < -0.25;
    const nearStand = x > 1.1 && z < -1.6;
    if (onBed || nearStand || floorSpots.some((p) => Math.hypot(p[0] - x, p[1] - z) < 0.75)) continue;
    floorSpots.push([x, z, rng.range(-Math.PI, Math.PI), rng.next()]);
  }
  floorSpots.sort((a, b) => a[3] - b[3]);
  const floorSheep = floorSpots.map(() => {
    const s = P.sheep();
    s.scale.setScalar(0.8);
    scene.add(s);
    return s;
  });
  const crowdSheep = Array.from({ length: 6 }, () => {
    const s = P.sheep();
    s.scale.setScalar(1.25);
    scene.add(s);
    return s;
  });

  // Gedankenblasen (Z) und Platz-Effekt
  const bubble = P.thoughtBubble({ icon: 'zzz', size: 0.9 });
  scene.add(bubble);
  const popFx = kit.fx.burst({ color: 0xffffff, count: 20, speed: 1.4, life: 0.5, size: 0.04 });
  scene.add(popFx.root);
  const classBubbles = Array.from({ length: 9 }, () => {
    const b = P.thoughtBubble({ icon: 'zzz', size: 0.38 });
    scene.add(b);
    return b;
  });
  const confetti = [0xf5c04a, 0xff4d4d, 0x4aa0ff].map((color) => {
    const c = kit.fx.burst({ color, count: 30, speed: 3.0, life: 1.4, size: 0.06 });
    scene.add(c.root);
    return c;
  });
  const sheepFx = kit.fx.burst({ color: 0xf4f1ea, count: 24, speed: 1.6, life: 0.6, size: 0.07 });
  scene.add(sheepFx.root);

  // Küche: Toast-Stapel, fliegender Toast, Handy im Toaster
  const toastStack = Array.from({ length: 14 }, (_, i) => {
    const m = P.toast(false);
    m.rotation.x = -Math.PI / 2;
    m.position.set(-39.0 + (i % 2) * 0.02, 0.95 + i * 0.022, -2.0);
    scene.add(m);
    return m;
  });
  const flyToast = P.toast(false);
  scene.add(flyToast);
  const worldPhone = P.phone({ mode: 'battery', level: 100 });
  scene.add(worldPhone);

  // Straße: Laterne bei der Nacht-Totale, Pfütze, Regen
  const lampPost = P.streetLamp(true);
  lampPost.position.set(93.6, 0.12, 10.6);
  scene.add(lampPost);
  const lampLight = new THREE.PointLight(0xffd9a0, 0, 9, 1.3);
  lampLight.position.set(94.0, 3.6, 10.6);
  scene.add(lampLight);
  const puddle = P.puddle(0.8);
  puddle.position.set(94.8, 0.13, 6.6);
  scene.add(puddle);
  const rain = kit.fx.rain({ size: [16, 12, 20], count: 1000 });
  scene.add(rain.root);
  const pigeon = P.pigeon();
  scene.add(pigeon);

  // ---------- Figuren ----------
  const you = kit.human({ shirt: 0x4a7fd0, pants: 0x2d3e66, hair: 'short', hairColor: 0x3b2a20, skin: kit.SKIN[1], blinkSeed: 0.5 });
  scene.add(you.root);
  const handPhone = P.phone({ mode: 'battery', level: 100 });
  handPhone.position.set(0, -0.1, 0.07);
  handPhone.rotation.set(-1.2, 0, 0);
  you.hold(handPhone, 'right');

  const coworkers = office.spots.desks.filter((_, i) => i !== 3).map((d, i) => {
    const h = kit.human({ shirt: [0x3a7ad9, 0xeeeeee, 0xd94a3a, 0x4aa05a, 0x8a5ac9][i], pants: 0x2d3e66, hair: ['bun', 'short', 'long', 'bald', 'spiky'][i], skin: kit.SKIN[(i + 2) % 6], blinkSeed: i * 0.6 });
    h.setPosition(d[0], d[1], d[2], Math.PI);
    scene.add(h.root);
    return h;
  });
  const pupils = [];
  classroom.spots.seats.forEach((row, r) => row.forEach((s, c) => {
    if (r === 2 && c === 1) return; // eigener Platz (Ich-Perspektive)
    const i = pupils.length;
    const h = kit.human({ shirt: [0xe0b23a, 0x3a5a9a, 0xd94a3a, 0x4aa05a, 0xeeeeee, 0x8a5ac9, 0xe08a3a, 0x333333][i], pants: 0x3a3a3a, hair: ['bun', 'short', 'long', 'spiky', 'short', 'long', 'bald', 'bun'][i], skin: kit.SKIN[(i * 3) % 6], scale: 0.9, blinkSeed: i * 0.7 });
    h.setPosition(s[0], 0, s[2], Math.PI);
    scene.add(h.root);
    pupils.push(h);
  }));
  const teacher = kit.human({ shirt: 0x8a3a5a, pants: 0x24304a, hair: 'bun', hairColor: 0x7a7a7a, skin: kit.SKIN[0], glasses: true, blinkSeed: 2.2 });
  scene.add(teacher.root);
  const crowd = Array.from({ length: 6 }, (_, i) => {
    const h = kit.human({ shirt: [0xe0b23a, 0xd94a3a, 0x4aa05a, 0xeeeeee, 0x8a5ac9, 0xe08a3a][i], pants: [0x2d3e66, 0x3a3a3a, 0x6b5a45][i % 3], hair: ['bun', 'short', 'long', 'spiky', 'bald', 'long'][i], skin: kit.SKIN[(i * 2 + 1) % 6], blinkSeed: i + 4 });
    scene.add(h.root);
    return h;
  });
  // Halbkreis hinter der Figur (Kamera kommt von +x)
  const CROWD = [[93.4, 3.3], [93.0, 2.0], [93.4, 0.7], [94.4, 3.8], [94.3, 0.15], [95.5, 4.1]];

  // ---------- Hilfen ----------
  const place = (h, p, rot) => h.setPosition(p[0], p[1], p[2], rot ?? p[3] ?? 0);
  const LOOK = {
    hook: 'nightRoom', flood: 'nightRoom', alarm: 'interior', office: 'interior', classroom: 'interior', kitchen_hope: 'nightRoom',
    record: 'day', hallucinate: 'day', shock_close: 'day', kitchen_confused: 'interior', night_city: 'night', park: 'day',
    countdown: 'storm', sleep: 'nightRoom', twist: 'nightRoom',
  };
  const FATIGUE = { hook: 0, flood: 0.1, alarm: 0.35, office: 0.45, kitchen_hope: 0.5, record: 0.6, hallucinate: 0.65, shock_close: 0.75, kitchen_confused: 0.8, night_city: 0.85, park: 0.95, countdown: 1, sleep: 1, twist: 0.8 };

  // Schaf springt quer über das Bett (x-Richtung); s = Sekunden seit Absprung
  const jump = (sh, s, { T = 1.2, z = -1.3, x0 = -2.3, x1 = 2.4, peak = 0.85 } = {}) => {
    const k = s / T;
    sh.visible = k >= 0 && k <= 1;
    if (!sh.visible) return;
    sh.position.set(lerp(x0, x1, k), peak * 4 * k * (1 - k), z);
    sh.rotation.set(0, Math.PI / 2, -0.35 * (k - 0.5));
    sh.userData.tuck(Math.sin(Math.PI * k));
  };
  // Blase über dem Kopf: erscheint bei tOpen, platzt bei tClose (Platz-Effekt + Kopfposition)
  const headPos = (h, off = [0.25, 0.55, 0.05]) => {
    h.head.getWorldPosition(tmp);
    return [tmp.x + off[0], tmp.y + off[1], tmp.z + off[2]];
  };
  // Blase zeigt zur Kamera (Bildebene der Blase steht senkrecht zur Blickrichtung der Einstellung, yaw aus beats.json)
  const BUBBLE_YAW = { hook: 14, sleep: -10, twist: 30, office: 205, park: 62 };
  const BUBBLE_SIZE = { office: 0.6, park: 0.75, twist: 0.6, sleep: 0.8 };
  let curId = '';
  const showBubble = (t, tOpen, tClose, p) => {
    bubble.position.set(p[0], p[1], p[2]);
    bubble.rotation.set(0, ((BUBBLE_YAW[curId] ?? 0) * Math.PI) / 180, 0);
    bubble.scale.setScalar(0.9 * (BUBBLE_SIZE[curId] ?? 1));
    bubble.userData.pop(t - tOpen, tClose != null && t >= tClose ? t - tClose : -1);
    if (tClose != null) popFx.update(t - tClose, p);
  };

  return {
    update({ t }) {
      const b = B.active(t);
      const id = b.id;
      curId = id;
      const lt = t - b.from;
      let flash = 0;

      // Licht je Beat; Morgendämmerung und Schlafen als Überblendung
      if (id === 'flood') kit.applyLook(L, 'nightRoom', 'interior', ramp(t, ev('dawn'), ev('dawn') + 1.2));
      else kit.applyLook(L, LOOK[id]);
      const origin = id === 'classroom' ? [40, 0, 0] : id === 'night_city' ? [96, 0, 10] : b.data?.you || [0, 0, 0];
      kit.sunAt(lights.sun, origin);
      const bed = ['hook', 'flood', 'alarm', 'sleep', 'twist'].includes(id);
      moon.intensity = ['hook', 'flood', 'sleep', 'twist'].includes(id) ? (id === 'flood' ? 2.2 * (1 - ramp(t, ev('dawn'), ev('dawn') + 1.2)) : 2.2) : 0;
      lamp.intensity = id === 'sleep' ? 2.5 * (1 - ramp(t, ev('sleep_back') - 0.3, ev('sleep_back') + 0.6)) : id === 'twist' ? 0.8 + 3.0 * ramp(t, ev('alarm_final'), ev('alarm_final') + 0.2) : id === 'hook' || id === 'flood' ? 1.4 : 0;
      fill.intensity = ['hook', 'flood', 'sleep', 'twist'].includes(id) ? 1.6 : 0;
      winSky.material.emissive.copy(skyNight).lerp(skyDawn, id === 'flood' ? ramp(t, ev('dawn'), ev('dawn') + 1.2) : id === 'alarm' ? 1 : 0);
      winSky.material.color.copy(winSky.material.emissive);

      // Sichtbarkeit (zurücksetzen)
      you.root.visible = id !== 'classroom';
      you.fatigue(FATIGUE[id] ?? 0);
      handPhone.visible = id === 'kitchen_confused' && t < ev('phone_in');
      for (const s of [...jumpers, ...floorSheep, ...crowdSheep]) s.visible = false;
      for (const c of coworkers) c.root.visible = id === 'office';
      for (const p of pupils) p.root.visible = id === 'classroom';
      teacher.root.visible = id === 'classroom';
      for (const c of crowd) c.root.visible = false;
      for (const cb of classBubbles) cb.userData.pop(-1);
      bubble.userData.pop(-1);
      popFx.update(-1, [0, 0, 0]);
      sheepFx.update(-1, [0, 0, 0]);
      for (const c of confetti) c.update(-1, [0, 0, 0]);
      clock7.visible = id === 'alarm' || (id === 'twist' && t >= ev('alarm_final'));
      for (const m of toastStack) m.visible = false;
      flyToast.visible = false;
      worldPhone.visible = false;
      lampPost.visible = id === 'night_city';
      lampLight.intensity = id === 'night_city' ? 14 : 0;
      puddle.visible = id === 'countdown';
      rain.root.visible = id === 'countdown';
      pigeon.visible = id === 'park';
      for (const s of street.buildings) s.b.userData.setLit(id === 'night_city' ? 1 : 0);

      // ---------- Schlafzimmer ----------
      if (id === 'hook' || id === 'flood') {
        place(you, pos('hook'));
        you.act([
          { t: 0, pose: 'lie', mood: 'tired', look: [0, 0] },
          { t: ev('bubble_pop'), mood: 'shock', blend: 0.08 },
          { t: ev('sit_up') - 0.1, look: [0.55, 0.12], blend: 0.35 },
          { t: at('flood'), mood: 'tired', look: [0.3, 0.05], blend: 0.8 },
          { t: ev('dawn') + 0.3, mood: 'worried', look: [-0.6, 0], blend: 0.6 },
        ], t);
        if (id === 'hook') showBubble(t, -1, ev('bubble_pop'), headPos(you, [-0.15, 0.85, -0.1]));
        // Springer: Nacht 1 – Frame 0 zeigt bereits ein Schaf mitten im Sprung
        const launches = id === 'hook'
          ? [...Array.from({ length: 12 }, (_, i) => [-0.72 + i * 0.42, [-1.25, -0.95, -1.5][i % 3]]), [ev('sheep_more') - 0.62, -1.7]]
          : Array.from({ length: 14 }, (_, i) => [at('flood') - 0.3 + i * 0.27, [-1.3, -0.7, -1.0, -0.55, -1.2][i % 5]]);
        const T = id === 'hook' ? 1.2 : 0.95;
        const live = launches.filter(([l]) => t - l >= 0 && t - l <= T);
        live.slice(0, jumpers.length).forEach(([l, z], i) => jump(jumpers[i], t - l, { z, T }));
        // Herde am Boden (Nacht 1 wird voll)
        const n = id === 'flood' ? Math.floor(ramp(t, ev('sheep_wave') - 0.4, ev('dawn')) * floorSheep.length) : 0;
        floorSheep.forEach((s, i) => {
          if (i >= n) return;
          const [x, z, r] = floorSpots[i];
          s.visible = true;
          s.position.set(x, 0, z);
          s.rotation.set(0, r, 0);
          s.userData.gallop(0);
        });
      }
      if (id === 'alarm') {
        place(you, pos('alarm'));
        you.act([
          { t: at('alarm'), pose: 'stand', seated: 1, mood: 'tired', look: [0, 0] },
          { t: ev('alarm_rings'), mood: 'angry', look: [0.35, -0.1], blend: 0.2 },
          { t: ev('slap') - 0.25, pose: 'reach', seated: 1, look: [0.9, 0.1], blend: 0.15 },
          { t: ev('slap') + 0.35, pose: 'stand', seated: 1, mood: 'tired', look: [0.1, 0], blend: 0.4 },
        ], t);
        you.root.rotation.y = lerp(0, 0.9, ramp(t, ev('slap') - 0.35, ev('slap') - 0.05)) * (1 - ramp(t, ev('slap') + 0.3, ev('slap') + 0.7));
        const ring = t >= ev('alarm_rings') && t < ev('slap');
        clock7.position.set(1.4 + (ring ? 0.008 * Math.sin(t * 90) : 0), 0.5 + (ring ? 0.006 * Math.abs(Math.sin(t * 70)) : 0), -1.985);
      } else clock7.position.set(1.4, 0.5, -1.985);
      if (id === 'sleep') {
        const a = pos('sleep', 'sit');
        const z = pos('sleep');
        const k = ramp(t, ev('lie_down') - 0.2, ev('lie_down') + 0.25);
        you.setPosition(a[0], lerp(a[1], z[1], k), lerp(a[2], z[2], k), 0);
        you.act([
          { t: at('sleep'), pose: 'stand', seated: 1, mood: 'happy', look: [0, 0] },
          { t: ev('lie_down') - 0.2, pose: 'lie', blend: 0.45, mood: 'tired' },
          { t: ev('sleep_back') - 0.1, mood: 'relief', blend: 0.5 },
        ], t, { blink: t < ev('sleep_back') });
        if (t >= ev('sleep_back')) showBubble(t, ev('sleep_back'), null, headPos(you, [0.3, 0.55, -0.1]));
        // ein einzelnes Schaf, ganz langsam (Rückruf an Nacht 1)
        jump(jumpers[0], t - (ev('sleep_back') + 0.7), { T: 1.8, z: -0.8, peak: 1.2 });
      }
      if (id === 'twist') {
        place(you, pos('twist'));
        you.act([
          { t: at('twist'), pose: 'lie', mood: 'relief', look: [0, 0] },
          { t: ev('alarm_final'), mood: 'shock', look: [0.6, 0.1], blend: 0.08 },
          { t: ev('eyes_open') + 0.8, mood: 'panic', blend: 0.4 },
        ], t, { blink: false });
        showBubble(t, -10, ev('eyes_open'), headPos(you, [0.3, 0.55, -0.1]));
        const ring = t >= ev('alarm_final');
        clock7.position.set(1.4 + (ring ? 0.008 * Math.sin(t * 90) : 0), 0.5 + (ring ? 0.006 * Math.abs(Math.sin(t * 70)) : 0), -1.985);
      }

      // ---------- Büro (Tag 3) ----------
      if (id === 'office') {
        place(you, pos('office'));
        const n1 = ev('nod1');
        const n2 = ev('nod2');
        you.act([
          { t: at('office'), pose: 'stand', seated: 1, mood: 'tired', look: [0, 0.1] },
          { t: n1 - 0.75, look: [0, 0.5], blend: 0.6 },
          { t: n1, mood: 'shock', look: [0, -0.08], blend: 0.08 },
          { t: n1 + 0.5, mood: 'tired', blend: 0.4 },
          { t: n2 - 0.7, look: [0.1, 0.5], blend: 0.55 },
          { t: n2, mood: 'panic', look: [0, -0.1], blend: 0.08 },
        ], t, { blink: false });
        const p = headPos(you, [0.3, 0.5, 0.15]);
        if (t < n1 + 0.6) showBubble(t, n1 - 0.55, n1, p);
        else showBubble(t, n2 - 0.5, n2, p);
        coworkers.forEach((c, i) => c.act([
          { t: at('office'), pose: 'stand', seated: 1, mood: 'neutral', look: [0, 0] },
          { t: n2 + 0.15 + i * 0.1, look: [i % 2 ? 0.9 : -0.9, 0], mood: i % 2 ? 'shock' : 'worried', blend: 0.3 },
        ], t));
      }

      // ---------- Klassenzimmer (Tag 4, Ich-Perspektive) ----------
      if (id === 'classroom') {
        const e = ev('class_zzz');
        pupils.forEach((h, i) => {
          const ts = e + i * 0.13;
          h.act([
            { t: at('classroom'), pose: 'stand', seated: 1, mood: 'tired', look: [0, 0] },
            { t: ts, pose: 'slump', seated: 1, mood: 'relief', look: [0, 0.35], blend: 0.4 },
          ], t, { blink: t < ts });
          classBubbles[i].position.set(...headPos(h, [0.2, 0.45, 0]));
          classBubbles[i].userData.pop(t - ts - 0.2);
        });
        const tp = pos('classroom', 'teacher');
        teacher.setPosition(tp[0], 0, tp[2], tp[3]);
        const tsl = ev('teacher_sleeps');
        teacher.act([
          { t: at('classroom'), pose: 'point', mood: 'neutral', look: [0, 0] },
          { t: tsl - 0.6, pose: 'stand', mood: 'tired', blend: 0.4 },
          { t: tsl, pose: 'slump', mood: 'relief', look: [0, 0.4], blend: 0.3 },
        ], t, { blink: t < tsl });
        classBubbles[8].position.set(...headPos(teacher, [0.25, 0.5, 0]));
        classBubbles[8].userData.pop(t - tsl - 0.15);
      }

      // ---------- Küche ----------
      if (id === 'kitchen_hope') {
        place(you, pos('kitchen_hope'));
        const c = ev('cheer');
        you.act([
          { t: at('kitchen_hope'), pose: 'stand', mood: 'smug', look: [0.5, 0] },
          { t: ev('toast_stack') + 0.2, mood: 'happy', look: [0.35, -0.1], blend: 0.3 },
          { t: c, pose: 'jump', local: true, mood: 'laugh', look: [0, 0], blend: 0.1 },
          { t: c + 0.55, pose: 'cheer', speed: 1.2, blend: 0.2 },
        ], t);
        // Toast fliegt aus dem Toaster auf den Stapel – Stapel wächst
        const n = 3 + Math.floor(ramp(t, at('kitchen_hope'), at('kitchen_hope') + 3.6) * 11);
        toastStack.forEach((m, i) => (m.visible = i < n));
        const s = ((t - at('kitchen_hope')) % 0.33) / 0.33;
        flyToast.visible = n < toastStack.length;
        flyToast.position.set(lerp(-39.5, -39.0, s), 1.05 + 0.5 * Math.sin(Math.PI * s) + (0.95 + n * 0.022 - 1.05) * s, -2.05);
        flyToast.rotation.set(s * 6, 0, 0);
      }
      if (id === 'kitchen_confused') {
        const p = pos('kitchen_confused');
        const ti = ev('phone_in');
        const tp = ev('phone_pops');
        const turn = ramp(t, ti - 0.55, ti - 0.2) * (1 - ramp(t, ti + 0.35, ti + 0.75));
        you.setPosition(p[0], p[1], p[2], Math.PI * turn);
        you.act([
          { t: at('kitchen_confused'), pose: 'phone', mood: 'tired', look: [0, 0.05] },
          { t: ti - 0.3, pose: 'reach', blend: 0.2 },
          { t: ti + 0.35, pose: 'stand', mood: 'neutral', look: [0, 0], blend: 0.35 },
          { t: tp, pose: 'recoil', mood: 'shock', look: [0.3, -0.3], blend: 0.08 },
          { t: tp + 0.6, pose: 'shrug', mood: 'worried', blend: 0.4 },
        ], t, { blink: false });
        // Handy steckt im Toaster, dann fliegt es heraus und landet auf dem Boden vor der Figur
        if (t >= ti) {
          worldPhone.visible = true;
          const s = clamp01((t - tp) / 0.8);
          const a = [-39.5, 1.05, -2.1];
          const z = [-39.4, 0.02, -0.7];
          if (t < tp) {
            worldPhone.position.set(a[0], a[1] + 0.02 * Math.sin((t - ti) * 30) * ramp(t, tp - 0.4, tp), a[2]);
            worldPhone.rotation.set(0, Math.PI / 2, 0);
          } else {
            worldPhone.position.set(lerp(a[0], z[0], s), lerp(a[1], z[1], s) + 1.3 * Math.sin(Math.PI * s), lerp(a[2], z[2], s));
            worldPhone.rotation.set(s * 9, Math.PI / 2, s * 4);
          }
        }
      }

      // ---------- Straße ----------
      if (id === 'record' || id === 'hallucinate' || id === 'shock_close') {
        place(you, pos(id));
        const rb = ev('record_broken');
        if (id === 'record') {
          you.act([
            { t: at('record'), pose: 'stand', mood: 'smug', look: [0, 0] },
            { t: rb, pose: 'jump', local: true, mood: 'laugh', blend: 0.1 },
            { t: ev('crowd_lift'), pose: 'cheer', speed: 1.1, blend: 0.2 },
          ], t);
        } else if (id === 'hallucinate') {
          you.act([
            { t: at('hallucinate'), pose: 'cheer', speed: 1.1, mood: 'laugh' },
            { t: ev('first_sheep') + 0.1, pose: 'stand', mood: 'shock', look: [-0.8, 0], blend: 0.15 },
            { t: ev('all_sheep') + 0.1, pose: 'recoil', mood: 'panic', look: [0.5, 0], blend: 0.1 },
          ], t, { blink: false });
        } else {
          you.act([
            { t: at('shock_close'), pose: 'recoil', mood: 'panic', look: [0.2, 0] },
            { t: ev('recoil') + 0.5, pose: 'facepalm', blend: 0.3 },
          ], t, { blink: false });
        }
        crowd.forEach((h, i) => {
          const [x, z] = CROWD[i];
          const face = Math.atan2(94.6 - x, 2.0 - z);
          const tSheep = id === 'record' ? Infinity : i === 0 ? ev('first_sheep') : ev('all_sheep') + (i - 1) * 0.07;
          const isSheep = t >= tSheep;
          h.root.visible = !isSheep;
          h.setPosition(x, 0.12, z, face);
          h.act([
            { t: at('record'), pose: 'stand', mood: 'neutral', look: [0, 0] },
            { t: rb + 0.1 + i * 0.05, pose: 'cheer', speed: 1 + i * 0.12, mood: 'laugh', blend: 0.2 },
          ], t);
          const sh = crowdSheep[i];
          sh.visible = isSheep;
          sh.position.set(x, 0.12, z);
          sh.rotation.set(0, face, 0);
          sh.userData.gallop(isSheep ? 0.15 * Math.sin(t * 3 + i) : 0);
          if (t - tSheep >= 0 && t - tSheep < 0.6) sheepFx.update(t - tSheep, [x, 1.0, z]);
        });
        if (id === 'record') confetti.forEach((c, i) => c.update(t - rb - i * 0.12, [94.0 + i * 0.4, 2.4, 2.0 + (i - 1) * 1.2]));
      }
      if (id === 'night_city') {
        place(you, pos('night_city'));
        you.act([
          { t: at('night_city'), pose: 'stand', mood: 'tired', look: [0.6, -0.2] },
          { t: ev('windows_dark') + 0.4, mood: 'sad', look: [-0.5, -0.3], blend: 0.8 },
          { t: ev('last_window'), pose: 'lookUp', blend: 0.6 },
        ], t);
        // Fenster gehen nacheinander aus – zuletzt das Haus gegenüber
        const e0 = ev('windows_dark');
        const e1 = ev('last_window');
        street.buildings.forEach((s, i) => {
          const d = Math.abs(s.z - 10);
          const tOff = d < 4 ? e1 : e0 + ((i * 7) % 11) / 11 * (e1 - e0 - 0.3);
          s.b.userData.setLit(1 - ramp(t, tOff, tOff + 0.12));
        });
      }
      if (id === 'countdown') {
        const a = pos('countdown');
        const z = pos('countdown', 'youTo');
        you.setPosition(a[0], a[1], lerp(a[2], z[2], lt / (b.to - b.from)), 0);
        you.act([
          { t: at('countdown'), pose: 'run', speed: 1.7, mood: 'happy' },
          { t: ev('splash') - 0.2, pose: 'jump', local: true, blend: 0.1 },
          { t: ev('splash') + 0.4, pose: 'run', speed: 1.7, blend: 0.2 },
        ], t);
        rain.update(t, 1);
        rain.root.position.set(you.root.position.x - 2, 0, you.root.position.z - 6);
        popFx.update(t - ev('splash') - 0.35, [94.8, 0.2, you.root.position.z]);
      }

      // ---------- Park (Tag 28) ----------
      if (id === 'park') {
        place(you, pos('park'));
        const bt = ev('bubble_tries');
        you.act([
          { t: at('park'), pose: 'lie', mood: 'tired', look: [0, 0] },
          { t: ev('pigeon_lands') + 0.3, mood: 'sad', blend: 0.5 },
          { t: bt + 1.0, mood: 'panic', blend: 0.3 },
        ], t, { blink: false });
        // Blase entsteht und platzt dreimal
        const tries = [bt, bt + 0.5, bt + 1.0];
        const cur = tries.filter((x) => t >= x - 0.35).pop();
        if (cur != null) showBubble(t, cur - 0.35, cur, headPos(you, [0.25, 0.5, -0.1]));
        // Taube landet auf der Brust
        const hp = headPos(you, [0, 0, 0]);
        const chest = [hp[0] + 0.05, hp[1] + 0.14, hp[2] + 0.25]; // landet auf der Stirn/Brust – Augen bleiben offen
        const tl = ev('pigeon_lands');
        const k = ramp(t, tl - 0.8, tl);
        pigeon.position.set(lerp(chest[0] + 2.2, chest[0], k), lerp(chest[1] + 2.0, chest[1], k), lerp(chest[2] - 1.0, chest[2], k));
        pigeon.rotation.y = -1.2;
        pigeon.userData.flap(k < 1 ? t : 0);
      }

      return { fx: { flash } };
    },
  };
}
