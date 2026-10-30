// What if your phone battery was your life? – Stil B, Rezept B1 (Testvideo der Systemüberarbeitung 2026-10-30).
// Aufbau nur aus dem Baukasten. Alle Zeiten kommen aus timeline.json (erzeugt aus beats.json): B.beat(id), B.ev(id).
// Positionen der Figuren stehen in beats.json → data (eine Quelle für Szene und Kamera).
import { createKit } from '/pipeline/runtime/kit/index.js';
import { hudAt } from '/pipeline/runtime/timeline.js';

export async function build({ THREE, scene, renderer, rng, timeline }) {
  const kit = createKit({ THREE, scene, renderer, rng });
  const { props: P, places: PL, ramp, lerp, clamp01 } = kit;
  const B = kit.beatClock(timeline);
  const lights = kit.setupLook({ scene, renderer }, 'day');
  const L = { scene, renderer, ...lights };

  // ---------- Orte ----------
  const bedroom = PL.bedroom([0, 0, 0], { clock: '6:59' });
  const kitchen = PL.kitchen([40, 0, 0]);
  const street = PL.street([100, 0, 0], { length: 90, lit: 0.45, clear: { side: -1, from: -10, to: 26 } });
  const cafe = PL.cafe([-40, 0, 0]);
  const office = PL.office([-90, 0, 0]);
  const park = PL.park([0, 0, 120]);
  for (const p of [bedroom, kitchen, street, cafe, office, park]) scene.add(p.root);

  // Stadt für die Totale (Stromausfall): Raster aus Gebäuden mit beleuchteten Fenstern
  const city = [];
  const cityC = [0, 0, -220];
  scene.add(P.slab(160, 160, 0x2c2f36, [cityC[0], 0, cityC[2]]));
  for (let i = -4; i <= 4; i++) {
    for (let j = -4; j <= 4; j++) {
      const b = P.building({ w: rng.range(7, 10), d: rng.range(7, 10), floors: rng.int(4, 14), color: rng.pick([0x8f9ba8, 0xa9b4bf, 0x7f8a96, 0xb5654a, 0xc98e6a]), lit: 0.6 });
      b.position.set(cityC[0] + i * 15 + rng.range(-1.5, 1.5), 0, cityC[2] + j * 15 + rng.range(-1.5, 1.5));
      b.rotation.y = rng.pick([0, Math.PI / 2, Math.PI, -Math.PI / 2]);
      scene.add(b);
      city.push({ b, d: Math.hypot(i + 3, j - 4) });
    }
  }

  // Requisiten am Straßenrand (Kamera-Gasse ohne Laternen/Bäume, deshalb gezielt ergänzt)
  const kiosk = P.kiosk();
  kiosk.position.set(92.9, 0.12, 13.0);
  kiosk.rotation.y = Math.PI / 2;
  scene.add(kiosk);
  for (const [x, z, f] of [[93.0, -3.5, 'hydrant'], [92.9, 4.5, 'trashCan'], [93.0, 20.5, 'hydrant']]) {
    const o = P[f]();
    o.position.set(x, 0.12, z);
    scene.add(o);
  }
  const bus = P.bus();
  scene.add(bus);
  const lightningBolt = P.lightning({ h: 34, seed: 7 });
  lightningBolt.position.set(86, 0, 30);
  scene.add(lightningBolt);
  const rain = kit.fx.rain({ size: [18, 12, 22], count: 1100 });
  scene.add(rain.root);
  // Zuhause: ein Fenster, das nach dem Stromausfall noch leuchtet
  const homeWin = kit.box(1.3, 1.6, 0.08, 0xffe4a8, [0, 0, 0], { cast: false, mat: { emissive: 0xffc870, emissiveIntensity: 1.4 } });
  homeWin.position.set(92.05, 4.0, 29.5);
  homeWin.rotation.y = Math.PI / 2;
  scene.add(homeWin);

  // Café: Steckdose an der Rückwand, Kabel des Fremden
  const outlet = P.wallOutlet();
  outlet.position.set(-42.2, 0.45, -2.9);
  scene.add(outlet);
  const strangerCable = P.charger({ a: [-42.2, 0.42, -2.86], b: [-41.9, 0.05, -2.2], sag: 0.05, color: 0x222222 });
  scene.add(strangerCable);

  // Park: Taube
  const pigeon = P.pigeon();
  scene.add(pigeon);

  // Schlafzimmer: Vorhang (nachts), Steckdose, Ladekabel (Kette, folgt der Hand), Lampenlicht
  const curtain = kit.box(1.7, 1.5, 0.05, 0x3b4a6b, [-1.6, 0.9, -2.36], { cast: false });
  scene.add(curtain);
  // Steckdosenleiste vor dem Bett (im Bild), damit das Einstecken sichtbar ist
  const strip = kit.group(kit.box(0.42, 0.06, 0.12, 0xf2f2f2), ...[0, 1, 2].map((i) => kit.box(0.05, 0.012, 0.05, 0x333333, [-0.12 + i * 0.12, 0.06, 0], { cast: false })));
  strip.position.set(0.95, 0, 0.25);
  scene.add(strip);
  const spark = kit.fx.burst({ color: 0x7dff9a, count: 24, speed: 1.1, life: 0.8, size: 0.02 });
  scene.add(spark.root);
  const cableLinks = Array.from({ length: 22 }, () => {
    const m = kit.cbox(0.022, 0.022, 0.022, 0xf2f2f2, [0, 0, 0], { cast: false });
    scene.add(m);
    return m;
  });
  const lampLight = new THREE.PointLight(0xffc98a, 0, 7, 1.6);
  lampLight.position.set(1.0, 1.7, 0.9);
  scene.add(lampLight);
  const phoneGlow = new THREE.PointLight(0x9fc4ff, 0, 2.2, 2);
  scene.add(phoneGlow);

  // ---------- Figuren ----------
  const you = kit.human({ shirt: 0xe2703a, pants: 0x2d3e66, hair: 'short', hairColor: 0x3b2a20, skin: kit.SKIN[1], blinkSeed: 0.7 });
  scene.add(you.root);
  const handPhone = P.phone({ mode: 'battery', level: 100 });
  handPhone.position.set(0, -0.1, 0.07);
  handPhone.rotation.set(-1.2, 0, 0);
  you.hold(handPhone, 'right');
  const bankYou = P.powerBank();
  bankYou.position.set(0, -0.1, 0.05);
  bankYou.rotation.set(-1.3, 0, 0);
  you.hold(bankYou, 'left');

  const stranger = kit.human({ shirt: 0x3f8f5a, pants: 0x3a3a3a, hair: 'spiky', hairColor: 0x1d1d1f, skin: kit.SKIN[3], blinkSeed: 1.9 });
  scene.add(stranger.root);
  const helper = kit.human({ shirt: 0x8a5ac9, pants: 0x24304a, hair: 'long', hairColor: 0xc9a26b, skin: kit.SKIN[0], blinkSeed: 2.4 });
  scene.add(helper.root);
  const bankHelper = P.powerBank();
  bankHelper.position.set(0, -0.1, 0.05);
  bankHelper.rotation.set(-1.3, 0, 0);
  helper.hold(bankHelper, 'right');
  const coworkers = office.spots.desks.filter((_, i) => i !== 3).map((d, i) => {
    const h = kit.human({ shirt: [0x3a7ad9, 0xeeeeee, 0xd94a3a, 0x4aa05a, 0x8a5ac9][i], pants: 0x2d3e66, hair: ['bun', 'short', 'long', 'bald', 'short'][i], skin: kit.SKIN[(i + 2) % 6], blinkSeed: i * 0.6 });
    h.setPosition(d[0], d[1], d[2], Math.PI);
    scene.add(h.root);
    return h;
  });
  const walkers = [0, 1, 2].map((i) => {
    const h = kit.human({ shirt: [0xe0b23a, 0x3a5a9a, 0xeeeeee][i], pants: 0x3a3a3a, hair: ['bun', 'short', 'bald'][i], skin: kit.SKIN[(i * 2 + 1) % 6], blinkSeed: i + 3 });
    scene.add(h.root);
    return h;
  });

  // ---------- Hilfen ----------
  const ev = B.ev;
  const at = (id) => B.beat(id).from;
  const pos = (id, key = 'you') => B.beat(id).data[key];
  const place = (h, p, rot) => h.setPosition(p[0], p[1], p[2], rot ?? p[3] ?? 0);
  const lerpP = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  let lastScreen = '';
  const setPhone = (o) => {
    const key = JSON.stringify(o);
    if (key === lastScreen) return;
    lastScreen = key;
    handPhone.userData.setScreen(o);
  };
  const LOOK = {
    wake: 'interior', kitchen: 'interior', bus: 'day', pant: 'day', cafe: 'sunset', cafe_react: 'sunset', office: 'interior', phone_low: 'interior',
    park: 'day', stranger: 'day', bank_dies: 'day', storm: 'storm', blackout: 'dusk', kiosk: 'storm', home: 'storm', plug: 'nightRoom', twist: 'nightRoom',
  };
  const tmp = new THREE.Vector3();
  // Stadt-Totale: Nebel weiter weg als in den Straßenszenen, sonst verschwindet die Stadt
  const CITY_DUSK = { ...kit.LOOKS.dusk, fog: [0x4d5a78, 120, 380] };
  const CITY_DARK = { ...kit.LOOKS.blackout, sky: 0x1c2640, fog: [0x1c2640, 120, 380], hemi: [0x8a9cd0, 0x1a1c26, 1.7], sun: [0x9fb0e0, 0.5], exposure: 1.35 };

  return {
    update({ t }) {
      const b = B.active(t);
      const id = b.id;
      const lt = t - b.from;
      let flash = 0;

      // Licht je Beat; Ereignis-Wechsel (Stromausfall) als Überblendung
      if (id === 'blackout') kit.applyLook(L, CITY_DUSK, CITY_DARK, ramp(t, ev('city_dark'), ev('city_dark') + 2.2));
      else if (id === 'twist') kit.applyLook(L, 'nightRoom', 'blackout', ramp(t, ev('lights_out'), ev('lights_out') + 0.25));
      else kit.applyLook(L, LOOK[id]);
      const sunOrigin = id === 'blackout' ? cityC : (b.data?.you || [0, 0, 0]);
      kit.sunAt(lights.sun, sunOrigin);

      // Sichtbarkeit je Ort
      you.root.visible = !['cafe', 'blackout'].includes(id);
      stranger.root.visible = id === 'cafe' || id === 'cafe_react';
      helper.root.visible = id === 'stranger' || id === 'bank_dies';
      pigeon.visible = ['park', 'stranger'].includes(id);
      curtain.visible = id === 'plug' || id === 'twist';
      rain.root.visible = ['storm', 'kiosk', 'home'].includes(id);
      lightningBolt.visible = false;
      for (const m of cableLinks) m.visible = false;
      lampLight.intensity = 0;
      phoneGlow.intensity = 0;
      bankYou.visible = id === 'stranger' && t >= ev('bank_given') || id === 'bank_dies';
      bankHelper.visible = id === 'stranger' && t < ev('bank_given');
      handPhone.visible = id !== 'bank_dies' && !(id === 'stranger' && t >= ev('bank_given'));

      // Fensterlicht: tagsüber aus, Gewitter an, nach dem Stromausfall aus
      const streetLit = id === 'storm' ? 1 : 0;
      for (const s of street.buildings) s.b.userData.setLit(streetLit);
      homeWin.visible = id === 'home';
      if (id === 'blackout') {
        const e = ev('city_dark');
        for (const c of city) c.b.userData.setLit(1 - ramp(t, e + c.d * 0.22, e + c.d * 0.22 + 0.12));
      }

      // Handy-Bildschirm zeigt den Akku = Lebensstand (aus dem HUD-Wert, gleiche Zahl)
      const lvl = Math.round(hudAt(timeline, t)?.value ?? 100);
      const charging = id === 'plug' && t >= ev('plug_in');
      if (id === 'office' && t < ev('call_answer') + 0.2) setPhone({ mode: 'call' });
      else setPhone({ mode: 'battery', level: lvl, charging });

      // ---------- Beats ----------
      if (id === 'wake') {
        place(you, pos('wake'));
        you.act([
          { t: at('wake'), pose: 'liePhone', mood: 'tired' },
          { t: ev('alarm'), mood: 'shock', blend: 0.1 },
          { t: ev('alarm') + 0.7, mood: 'tired' },
          { t: ev('first_tap'), mood: 'neutral' },
          { t: ev('first_tap') + 1.1, mood: 'worried' },
        ], t);
      }
      if (id === 'kitchen') {
        place(you, pos('kitchen'));
        you.act([
          { t: at('kitchen'), pose: 'phone', mood: 'neutral', look: [0, 0] },
          { t: ev('swipe1'), mood: 'worried', look: [0.1, 0.05] },
          { t: ev('swipe2'), look: [-0.1, 0.08] },
          { t: ev('toast_smoke') + 0.9, pose: 'shrug', blend: 0.4 },
          { t: ev('toast_smoke') + 1.6, pose: 'phone', mood: 'panic', blend: 0.35 },
        ], t);
      }
      // Rauch über dem Toaster (verbrennt unbemerkt)
      if (id === 'kitchen') {
        const s = t - ev('toast_smoke');
        flash = 0;
        if (s > 0) {
          const k = clamp01(s / 1.2);
          kitchen.toaster.position.y = 0.93 + 0.01 * Math.sin(s * 40) * (1 - k);
        }
      }

      if (id === 'bus') {
        // Gleichmäßige Geschwindigkeit wie die Begleitkamera (9:16: nur ≈ 28° horizontaler Bildwinkel)
        const a = pos('bus');
        const z = pos('bus', 'youTo');
        you.setPosition(a[0], a[1], lerp(a[2], z[2], lt / (b.to - b.from)), 0);
        you.act([
          { t: at('bus'), pose: 'run', speed: 1.7, mood: 'panic' },
          { t: ev('maps_open'), pose: 'phone', blend: 0.3, mood: 'shock' },
          { t: ev('maps_open') + 0.6, pose: 'walk', speed: 1.1, mood: 'panic', blend: 0.4 },
        ], t);
        const s = Math.max(0, t - ev('bus_leaves'));
        bus.position.set(102.6, 0, -6 + 1.2 * s + 0.9 * s * s);
      } else bus.position.set(102.6, 0, -6);
      if (id === 'pant') {
        place(you, pos('pant'));
        you.act([{ t: at('pant'), pose: 'pant', speed: 1, mood: 'tired' }], t);
      }

      // Straße: Passanten (Tiefe, Leben)
      walkers.forEach((w, i) => {
        w.root.visible = ['bus', 'pant'].includes(id);
        const p = (t * 0.9 + i * 7) % 26;
        w.setPosition(105.6 + (i % 2) * 0.8, 0.12, (i % 2 ? 14 - p : -12 + p), i % 2 ? Math.PI : 0);
        w.pose('walk', t * 1.4 + i * 0.3).mood('neutral');
      });

      if (id === 'cafe' || id === 'cafe_react') {
        const a = pos('cafe', 'stranger');
        const z = pos('cafe', 'strangerTo');
        const tTake = ev('outlet_taken');
        const k = ramp(t, at('cafe') + 0.6, tTake - 0.3);
        stranger.root.position.set(lerp(a[0], z[0], k), 0, lerp(a[2], z[2], k));
        stranger.root.rotation.y = k < 0.98 ? Math.atan2(z[0] - a[0], z[2] - a[2]) : lerp(Math.atan2(z[0] - a[0], z[2] - a[2]), z[3], ramp(t, tTake - 0.3, tTake));
        stranger.act([
          { t: at('cafe'), pose: 'stand', mood: 'neutral' },
          { t: at('cafe') + 0.6, pose: 'run', speed: 1.8, blend: 0.2 },
          { t: tTake - 0.35, pose: 'crouch', blend: 0.25 },
          { t: tTake + 0.5, look: [0.9, -0.1], mood: 'smug', blend: 0.4 },
        ], t);
        strangerCable.visible = t >= tTake;
      } else strangerCable.visible = false;
      if (id === 'cafe_react') {
        place(you, pos('cafe_react'));
        you.act([
          { t: at('cafe_react'), pose: 'stand', mood: 'shock', blend: 0.1 },
          { t: ev('glare'), pose: 'stand', mood: 'angry', blend: 0.2 },
        ], t);
      }

      if (id === 'office' || id === 'phone_low') {
        place(you, pos('office'));
        if (id === 'office') {
          you.act([
            { t: at('office'), pose: 'phone', mood: 'worried' },
            { t: ev('call_answer'), pose: 'phoneTalk', mood: 'panic', blend: 0.25 },
          ], t);
        } else {
          you.act([{ t: at('phone_low'), pose: 'phone', mood: 'panic' }], t);
        }
        coworkers.forEach((c, i) => {
          c.act([
            { t: at('office'), pose: 'stand', seated: 1, mood: 'neutral', look: [0, 0] },
            { t: ev('call_answer') + 0.2 + i * 0.12, look: [i % 2 ? 1.0 : -1.0, 0], mood: i % 2 ? 'shock' : 'worried', blend: 0.3 },
          ], t);
        });
      }

      if (id === 'park' || id === 'stranger' || id === 'bank_dies') {
        place(you, pos('park'));
        if (id === 'park') {
          you.act([
            { t: at('park'), pose: 'slump', seated: 1, mood: 'tired' },
            { t: ev('pigeon_lands') + 0.3, mood: 'sad', blend: 0.6 },
          ], t);
        } else if (id === 'stranger') {
          const tg = ev('bank_given');
          you.act([
            { t: at('stranger'), pose: 'slump', seated: 1, mood: 'tired', look: [0, 0] },
            { t: tg - 0.6, pose: 'stand', seated: 1, mood: 'shock', look: [0.6, 0], blend: 0.3 },
            { t: tg, pose: 'reach', seated: 1, mood: 'happy', blend: 0.2 },
            { t: ev('cheer') - 0.2, pose: 'stand', seated: 0, blend: 0.25 },
            { t: ev('cheer'), pose: 'jump', local: true, mood: 'laugh', blend: 0.1 },
            { t: ev('cheer') + 0.6, pose: 'cheer', speed: 1.2, blend: 0.2 },
          ], t);
          you.root.position.x = pos('park')[0] + 0.45 * ramp(t, ev('cheer') - 0.25, ev('cheer') + 0.1); // vor die Bank treten (kein Sprung)
          const hp = pos('stranger', 'helper');
          const k = ramp(t, at('stranger'), tg - 0.4);
          helper.setPosition(lerp(hp[0] + 1.2, hp[0], k), 0, lerp(hp[2] - 1.0, hp[2], k), lerp(-0.9, hp[3], k));
          helper.act([
            { t: at('stranger'), pose: 'walk', speed: 1.4, mood: 'happy' },
            { t: tg - 0.4, pose: 'reach', mood: 'happy', blend: 0.3 },
            { t: tg + 0.6, pose: 'wave', speed: 1, blend: 0.3 },
          ], t);
        } else {
          you.act([
            { t: at('bank_dies'), pose: 'carry', seated: 1, mood: 'happy' },
            { t: ev('bank_empty') + 0.2, mood: 'sad', blend: 0.4 },
          ], t);
          bankYou.userData.setLevel(t < ev('bank_empty') ? 0.25 : 0);
          const hp = pos('stranger', 'helper');
          helper.setPosition(hp[0] + 3 + 1.2 * lt, 0, hp[2] + 2, 0.6);
          helper.pose('walk', t * 1.4).mood('happy');
        }
        if (id !== 'bank_dies') bankYou.userData.setLevel(1);
        // Taube landet auf dem Kopf (Park) und bleibt dort
        you.head.getWorldPosition(tmp);
        const tl = ev('pigeon_lands');
        const k = ramp(t, tl - 0.9, tl);
        const head = [tmp.x, tmp.y + 0.4, tmp.z];
        const from = [head[0] + 2.5, head[1] + 2.2, head[2] - 1.5];
        const p = lerpP(from, head, k);
        pigeon.position.set(p[0], p[1], p[2]);
        pigeon.rotation.y = -0.9;
        pigeon.userData.flap(k < 1 ? t : 0);
        if (id === 'stranger' && t > ev('bank_given') - 0.6) {
          const s = t - (ev('bank_given') - 0.6);
          pigeon.position.set(head[0] + 1.6 * s, head[1] + 2.2 * s, head[2] - 0.8 * s);
          pigeon.userData.flap(t);
        }
      }

      if (id === 'storm') {
        const a = pos('storm');
        const z = pos('storm', 'youTo');
        you.setPosition(a[0], a[1], lerp(a[2], z[2], lt / (b.to - b.from)), 0);
        you.act([
          { t: at('storm'), pose: 'run', speed: 1.6, mood: 'worried' },
          { t: ev('lightning'), pose: 'recoil', mood: 'shock', blend: 0.08 },
          { t: ev('lightning') + 0.5, pose: 'run', speed: 1.6, mood: 'worried', blend: 0.3 },
        ], t);
        if (t >= ev('lightning') && t < ev('lightning') + 0.2) lightningBolt.visible = true;
        const s = t - ev('lightning');
        flash = s >= 0 && s < 0.3 ? 0.55 * (1 - s / 0.3) : 0;
        rain.update(t, ramp(t, ev('lightning'), ev('lightning') + 0.6));
        rain.root.position.set(you.root.position.x - 100 + 3, 0, you.root.position.z - 6);
      }
      if (id === 'kiosk') {
        const a = pos('kiosk', 'youFrom');
        const z = pos('kiosk');
        const k = ramp(t, at('kiosk'), ev('kiosk_tap') - 0.05);
        you.setPosition(lerp(a[0], z[0], k), z[1], lerp(a[2], z[2], k), k < 0.9 ? a[3] : lerp(a[3], 1.5 * Math.PI, ramp(t, ev('kiosk_tap') - 0.15, ev('kiosk_tap'))));
        if (t > ev('kiosk_tap') + 0.4) you.root.rotation.y = lerp(1.5 * Math.PI, z[3] + 2 * Math.PI, ramp(t, ev('kiosk_tap') + 0.4, ev('kneel')));
        you.act([
          { t: at('kiosk'), pose: 'run', speed: 1.7, mood: 'worried' },
          { t: ev('kiosk_tap') - 0.1, pose: 'reach', mood: 'panic', blend: 0.12 },
          { t: ev('kiosk_tap') + 0.4, pose: 'stand', mood: 'sad', blend: 0.3 },
          { t: ev('kneel'), pose: 'kneel', blend: 0.3, look: [0, 0.2] },
        ], t);
        kiosk.userData.setScreen(false);
        rain.update(t, 1);
        rain.root.position.set(-6, 0, 8);
      } else kiosk.userData.setScreen(id !== 'blackout');
      if (id === 'home') {
        const a = pos('home');
        const z = pos('home', 'youTo');
        you.setPosition(a[0], a[1], lerp(a[2], z[2], lt / (b.to - b.from)), 0);
        you.act([{ t: at('home'), pose: 'run', speed: 1.6, mood: 'worried', look: [-0.5, -0.1] }], t);
        rain.update(t, 1);
        rain.root.position.set(-5, 0, 16);
      }

      if (id === 'plug' || id === 'twist') {
        place(you, pos(id));
        lampLight.intensity = id === 'plug' || t < ev('lights_out') ? 5 : 0;
        if (id === 'plug') {
          you.act([
            { t: at('plug'), pose: 'phone', seated: 1, mood: 'worried' },
            { t: ev('plug_in') - 0.5, pose: 'reach', seated: 1, blend: 0.3 },
            { t: ev('plug_in'), pose: 'phone', seated: 1, mood: 'relief', blend: 0.3 },
            { t: ev('plug_in') + 1.2, pose: 'stand', seated: 1, look: [0, -0.25], blend: 0.6 },
          ], t);
        } else {
          you.act([
            { t: at('twist'), pose: 'phone', seated: 1, mood: 'relief' },
            { t: ev('lights_out'), pose: 'recoil', seated: 1, mood: 'shock', look: [0.3, -0.15], blend: 0.12 },
            { t: ev('lights_out') + 0.7, pose: 'phone', seated: 1, mood: 'panic', look: [0, 0], blend: 0.4 },
          ], t);
          // Nach dem Stromausfall beleuchtet nur noch das Handy das Gesicht
          if (t >= ev('lights_out')) {
            handPhone.getWorldPosition(tmp);
            phoneGlow.position.set(tmp.x, tmp.y + 0.25, tmp.z + 0.45);
            phoneGlow.intensity = 0.6;
          }
        }
        // Ladekabel von der Steckdose zur Hand, sobald eingesteckt
        if (id === 'twist' || t >= ev('plug_in')) {
          handPhone.getWorldPosition(tmp);
          const a = [0.95, 0.07, 0.25];
          const z = [tmp.x, tmp.y - 0.08, tmp.z];
          cableLinks.forEach((m, i) => {
            const k = (i + 0.5) / cableLinks.length;
            m.visible = true;
            m.position.set(lerp(a[0], z[0], k), Math.max(0.02, lerp(a[1], z[1], k) - 0.3 * Math.sin(Math.PI * k)), lerp(a[2], z[2], k));
          });
        }
      }

      // Funkenstoß beim Einstecken (Ereignis sichtbar machen)
      if (id === 'plug') {
        handPhone.getWorldPosition(tmp);
        spark.update(t - ev('plug_in'), [tmp.x, tmp.y, tmp.z]);
      } else spark.update(-1, [0, 0, 0]);
      return { fx: { flash } };
    },
  };
}
