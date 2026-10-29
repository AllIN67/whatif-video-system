// What if everyone could read your mind for 10 seconds? – Stil B, Rezept B1 (Eskalations-Zähler).
// Erzählung nur über Bild, Reaktionen, Gedankenblasen (Piktogramme, keine Schrift), HUD und Textzeilen.
// Alle Zeiten kommen aus timeline.json (shots, events) – hier keine eigenen Zeitkonstanten für Ereignisse.
import { createKit } from '/pipeline/runtime/kit/index.js';

// Ursprünge der Orte (müssen zum Generator der timeline.json passen)
const O = { class: [0, 0, 0], office: [40, 0, 0], meet: [80, 0, 0], cafe: [120, 0, 0], kitchen: [-40, 0, 0], bed: [-80, 0, 0], big: [-140, 0, 0], bus: [0, 0, 150], crowd: [150, 0, 150] };
const SHOT_PLACE = {
  hook: 'class', teacher: 'class', laugh: 'class', pizza: 'class', crush: 'class', tie: 'office', meeting: 'meet', date: 'cafe', busstop: 'bus',
  world: 'crowd', party: 'kitchen', onmyway: 'bed', nobody: 'big', planet: 'crowd', stop: 'crowd', pretend: 'class', twist: 'class', loop: 'class',
};

export async function build({ THREE, scene, renderer, rng, timeline }) {
  const kit = createKit({ THREE, scene, renderer, rng });
  const { props: P, places: PL, ramp, lerp, smooth, SKIN, HAIR } = kit;
  const { sun } = kit.setupLook({ scene, renderer }, 'day');

  // ---------- Zeitachse ----------
  const fps = timeline.fps;
  const shots = timeline.shots.map((s) => ({ id: s.id, from: s.from / fps, to: s.to / fps, keys: s.camKeys, mode: s.camMode }));
  const ev = Object.fromEntries((timeline.events || []).map((e) => [e.id, e.t]));
  for (const k of Object.values(SHOT_PLACE)) if (!O[k]) throw new Error(`Ort ${k} fehlt`);
  const shotAt = (t) => {
    let cur = shots[0];
    for (const s of shots) if (t >= s.from) cur = s;
    return cur;
  };
  const S = Object.fromEntries(shots.map((s) => [s.id, s]));
  // Kameraposition der Einstellung zur Zeit t (für Blasen, die zur Kamera zeigen)
  const camPos = (s, t) => {
    const [a, b] = s.keys;
    const x = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
    const k = s.mode === 'inOut' ? smooth(x) : x;
    return new THREE.Vector3(lerp(a.pos[0], b.pos[0], k), lerp(a.pos[1], b.pos[1], k), lerp(a.pos[2], b.pos[2], k));
  };

  // ---------- Orte: jeder Ort ist eine Gruppe, sichtbar nur in seinen Einstellungen ----------
  const loc = {};
  for (const k of Object.keys(O)) {
    loc[k] = new THREE.Group();
    scene.add(loc[k]);
  }
  const add = (k, obj) => {
    loc[k].add(obj.root || obj);
    return obj;
  };
  const W = (k, x, y, z) => [O[k][0] + x, O[k][1] + y, O[k][2] + z];

  // ---------- Figuren ----------
  const YOU = { shirt: 0xe2703a, pants: 0x2d3e66, hair: 'short', hairColor: 0x3b2a20, skin: SKIN[1] };
  const CRUSH = { shirt: 0x2fa59a, pants: 0x3a3a48, hair: 'long', hairColor: 0x5a3a24, skin: SKIN[0] };
  const BOSS = { shirt: 0x2a2f3a, pants: 0x2a2f3a, hair: 'short', hairColor: 0x9a9a9a, tie: 0xe83fb4, skin: SKIN[0] };
  const EXTRA = [
    { shirt: 0x3a7ad9, hair: 'spiky', hairColor: HAIR[2], skin: SKIN[3] },
    { shirt: 0xe0b23a, hair: 'long', hairColor: HAIR[4], skin: SKIN[5] },
    { shirt: 0xd94a3a, hair: 'short', hairColor: HAIR[1], skin: SKIN[2] },
    { shirt: 0x8a5ac9, hair: 'bun', hairColor: HAIR[0], skin: SKIN[4] },
    { shirt: 0x4aa05a, hair: 'short', hairColor: HAIR[3], skin: SKIN[1] },
    { shirt: 0xeeeeee, hair: 'long', hairColor: HAIR[2], skin: SKIN[2] },
    { shirt: 0xe08a3a, hair: 'spiky', hairColor: HAIR[1], skin: SKIN[0] },
    { shirt: 0x333333, hair: 'bun', hairColor: HAIR[4], skin: SKIN[3] },
  ];
  const person = (k, look, x, y, z, rot = 0) => {
    const h = kit.human({ pants: 0x2d3e66, ...look });
    h.setPosition(...W(k, x, y, z), rot);
    add(k, h);
    h.base = { x: O[k][0] + x, y: O[k][1] + y, z: O[k][2] + z, rot };
    return h;
  };
  // Gierwinkel, mit dem eine Figur bei (x,z) zum Punkt (tx,tz) schaut (Figur blickt bei rot = 0 nach +z)
  const yawTo = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);

  // ---------- Gedankenblasen ----------
  // Jede Blase: Piktogramm, Ankerfigur (Kopf), Versatz, Auf-/Zu-Zeit, zugehörige Einstellungen (für Ausrichtung).
  const bubbles = [];
  const bubble = (k, icon, at, { open, close = Infinity, size = 1, slow = 1, tail = [-0.3, -0.62, 0] } = {}) => {
    const b = P.thoughtBubble({ icon, size, tail });
    b.position.set(...at);
    add(k, b);
    bubbles.push({ b, open, close, slow, place: k });
    return b;
  };
  const above = (h, dx = 0.42, dy = 0.78, dz = 0) => {
    // über dem Kopf (Kopfhöhe aus Pose: stehend ≈ 1,75, sitzend ≈ 1,28)
    const p = new THREE.Vector3();
    h.head.getWorldPosition(p);
    return [p.x + dx, p.y + 0.34 + dy, p.z + dz];
  };

  // =====================================================================
  // KLASSENZIMMER
  // =====================================================================
  const cls = add('class', PL.classroom(O.class));
  const seat = (r, c) => {
    const s = cls.spots.seats[r][c];
    return [s[0] - O.class[0], s[2] - O.class[2]];
  };
  // Lehrkraft: zu Beginn (und in der Schlusseinstellung) im Gang vor dir, sonst an der Tafel
  const teacher = person('class', { shirt: 0x7a4a9a, pants: 0x3a3a3a, hair: 'bun', hairColor: 0x7a7a7a, skin: SKIN[2], glasses: true }, 2.9, 0, -1.6, -0.37);
  const BOARD = { x: O.class[0] - 0.3, z: O.class[2] - 3.25, rot: 0.25 };
  const [yx, yz] = seat(1, 2);
  const you = person('class', YOU, yx, 0, yz, Math.PI);
  const [cx, cz] = seat(0, 1);
  const crush = person('class', CRUSH, cx, 0, cz, Math.PI);
  const [qx, qz] = seat(0, 0);
  const quiet = person('class', { shirt: 0x8a8f99, pants: 0x3a3a3a, hair: 'spiky', hairColor: HAIR[2], skin: SKIN[4], glasses: true }, qx, 0, qz, Math.PI);
  const extraSeats = [[1, 0], [1, 1], [2, 0], [2, 1], [2, 2]];
  const students = extraSeats.map(([r, c], i) => {
    const [x, z] = seat(r, c);
    const h = person('class', EXTRA[i], x, 0, z, Math.PI);
    h.idx = i;
    return h;
  });
  const classAll = [you, crush, quiet, ...students];
  for (const h of classAll) h.pose('sit');
  teacher.pose('stand');
  const yaw = (h, tx, tz) => yawTo(h.base.x, h.base.z, tx, tz);

  // Blasen im Klassenzimmer
  bubble('class', 'question', W('class', 2.55, 2.35, -1.55), { open: ev.teacher_pop, close: S.pizza.from, size: 0.85, tail: [0.3, -0.55, 0] });
  quiet.pose('sit');
  const qTop = above(quiet, 0, 0);
  bubble('class', 'pizza', [qTop[0] + 0.3, qTop[1] + 0.45, qTop[2]], { open: ev.pizza1, close: S.crush.from, size: 0.5 });
  bubble('class', 'pizza', [qTop[0] - 0.25, qTop[1] + 0.8, qTop[2]], { open: ev.pizza2, close: S.crush.from, size: 0.5, tail: [0.3, -0.5, 0] });
  bubble('class', 'pizza', [qTop[0] + 0.25, qTop[1] + 1.15, qTop[2]], { open: ev.pizza3, close: S.crush.from, size: 0.5, tail: [-0.3, -0.5, 0] });
  you.pose('sit');
  bubble('class', 'heart', above(you, 0.35, 0.5), { open: ev.heart_pop, close: S.tie.from, size: 0.8 });
  bubble('class', 'empty', above(you, -0.25, 0.55, 0.15), { open: ev.you_bubble, size: 0.95, slow: 0.35, tail: [0.3, -0.62, 0] });

  const updClass = (t) => {
    const sid = shotAt(t).id;
    // Lehrkraft
    if (t < S.pizza.from || t >= S.loop.from) teacher.setPosition(teacher.base.x, 0, teacher.base.z, teacher.base.rot);
    else teacher.setPosition(BOARD.x, 0, BOARD.z, BOARD.rot);
    if (t < S.laugh.from) {
      teacher.pose(t > ev.teacher_pop + 3.4 ? 'shrug' : 'stand', t * 0.5).mood(t < ev.teacher_pop + 0.6 ? 'neutral' : t < ev.teacher_pop + 3.6 ? 'worried' : 'shock');
      if (t > ev.teacher_pop + 0.6) teacher.look(0.25 * Math.sin((t - ev.teacher_pop) * 1.6), 0);
    } else if (t < S.pizza.from) {
      teacher.pose(t > ev.class_laugh + 0.2 ? 'facepalm' : 'stand', t).mood('sad');
    } else if (sid === 'pretend' || sid === 'twist' || sid === 'loop') {
      teacher.pose('stand', t * 0.4).mood(sid === 'pretend' ? 'happy' : 'shock');
      if (t >= ev.pointe) teacher.look(-0.5 * ramp(t, ev.pointe, ev.pointe + 0.6), 0);
    } else {
      teacher.pose('stand', t * 0.4).mood('worried');
    }

    // Schüler allgemein
    for (const h of students) {
      const p = h.idx * 0.37;
      h.setPosition(h.base.x, h.base.y, h.base.z, h.base.rot);
      if (t < ev.teacher_pop + 0.8) h.pose('sit').mood('neutral');
      else if (t < ev.class_laugh) h.pose('sit').mood('shock').look(0.3 * Math.sin(p * 9), 0);
      else if (t < S.crush.from) {
        // Lachen: wippen, zeigen, Arme hoch
        const kind = ['armsUp', 'point', 'stand', 'armsUp', 'point', 'stand'][h.idx];
        h.pose(kind, t * 2 + p, { seated: true }).mood('laugh');
        h.root.position.y = h.base.y + 0.03 * Math.abs(Math.sin((t + p) * 9));
        if (t > ev.kids_turn) h.look(yaw(h, quiet.base.x, quiet.base.z) - h.base.rot > 0 ? 0.6 : -0.6, 0);
      } else if (t < S.pretend.from) h.pose('sit').mood('shock').look(0.5 * ramp(t, ev.crush_turns, ev.crush_turns + 0.4) * (h.base.x < you.base.x ? -1 : 1), 0);
      else if (t < ev.pointe) {
        // so tun, als wäre nichts passiert: steif lächeln, Augen zur Seite
        h.pose('sit').mood('happy').look(0.18 * Math.sin((t - p) * 1.3), 0);
      } else {
        // Pointe: alle drehen sich zu dir
        const k = ramp(t, ev.pointe + h.idx * 0.06, ev.pointe + 0.6 + h.idx * 0.06);
        const target = yaw(h, you.base.x, you.base.z);
        let d = target - h.base.rot;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        h.setPosition(h.base.x, h.base.y, h.base.z, h.base.rot + d * 0.75 * k);
        h.pose('sit').mood('shock').look(Math.max(-1.1, Math.min(1.1, d * 0.4 * k)), 0);
      }
    }

    // Stiller Junge
    quiet.setPosition(quiet.base.x, quiet.base.y, quiet.base.z, quiet.base.rot);
    if (t < ev.pizza1) quiet.pose('sit').mood(t > ev.class_laugh ? 'laugh' : 'neutral');
    else if (t < S.crush.from) quiet.pose('sit').mood(t > ev.kids_turn ? 'worried' : 'happy').look(t > ev.kids_turn ? 0.35 * Math.sin(t * 5) : 0, 0.0);
    else if (t >= ev.pointe) quiet.pose('sit').mood('shock').look(-0.9 * ramp(t, ev.pointe, ev.pointe + 0.6), 0);
    else quiet.pose('sit').mood(t > S.pretend.from ? 'happy' : 'shock');

    // Schwarm
    crush.setPosition(crush.base.x, crush.base.y, crush.base.z, crush.base.rot);
    if (t < ev.crush_turns) {
      crush.pose('sit').mood(t > ev.class_laugh && t < S.crush.from ? 'laugh' : 'neutral');
      if (t > ev.kids_turn && t < S.crush.from) crush.look(0.8, 0);
    } else if (t < S.pretend.from) {
      const k = ramp(t, ev.crush_turns, ev.crush_turns + 0.45);
      crush.setPosition(crush.base.x, crush.base.y, crush.base.z, crush.base.rot - 1.6 * k);
      crush.pose('sit').mood('shock').look(-0.55 * k, 0);
    } else if (t < ev.crush_stands) {
      crush.pose('sit').mood('happy').look(0.15 * Math.sin(t * 1.4), 0);
    } else {
      // steht auf, dreht sich zur Klasse und fragt
      const k = ramp(t, ev.crush_stands, ev.crush_stands + 0.5);
      crush.setPosition(crush.base.x + 0.2 * k, crush.base.y, crush.base.z + 0.35 * k, crush.base.rot - Math.PI * 0.85 * k);
      crush.pose(t < ev.pointe ? 'shrug' : 'stand', (t - ev.crush_stands) * 0.8, { seated: 1 - k }).mood(t < ev.pointe ? 'worried' : 'happy');
      if (t >= ev.pointe) crush.look(0.6 * ramp(t, ev.pointe, ev.pointe + 0.5), 0);
    }

    // Du
    you.setPosition(you.base.x, you.base.y, you.base.z, you.base.rot);
    if (t < S.crush.from) {
      you.pose('sit').mood(t < ev.teacher_pop + 0.35 ? 'neutral' : t < ev.class_laugh ? 'shock' : 'laugh');
      if (t < S.teacher.from) you.look(-0.15 + 0.1 * ramp(t, 1.2, 2.2), 0);
      else if (t < S.laugh.from) you.look(0.35 * Math.sin((t - S.teacher.from) * 2.2), -0.06 * ramp(t, 5.0, 5.6)); // schaut sich ungläubig um
    } else if (t < S.tie.from) {
      const lookCrush = yaw(you, crush.base.x, crush.base.z) - you.base.rot;
      if (t < ev.crush_turns) you.pose('sit').mood('happy').look(lookCrush * 0.6, 0.12);
      else if (t < ev.facepalm) you.pose('sit').mood('shock').look(lookCrush * 0.6, 0.05);
      else you.pose('facepalm', 0, { seated: true }).mood('sad');
    } else if (t < ev.crush_stands) {
      you.pose('sit').mood('happy').look(-0.2 * Math.sin(t * 1.2), 0);
    } else if (t < ev.pointe) {
      you.pose('sit').mood('worried').look(-0.35, 0);
    } else {
      you.pose('sit').mood('shock').look(-0.2 + 0.08 * Math.sin(t * 7) * ramp(t, ev.you_bubble, ev.you_bubble + 0.5), 0);
    }
  };

  // =====================================================================
  // BÜRO (Krawatte)
  // =====================================================================
  add('office', PL.office(O.office));
  const boss1 = person('office', BOSS, 0.55, 0, 1.75, -0.45);
  const cow = person('office', { shirt: 0x4aa05a, hair: 'long', hairColor: HAIR[1], skin: SKIN[3] }, -0.75, 0, 2.15, 0.55);
  const officeBack = [[-2.8, -1.45], [2.8, -1.45], [-2.8, 0.95]].map(([x, z], i) => person('office', EXTRA[i + 2], x, 0, z, Math.PI));
  bubble('office', 'tie', above(cow, 0.5, 0.32), { open: ev.tie_pop, size: 0.8, tail: [-0.3, -0.5, 0] });
  const updOffice = (t) => {
    boss1.pose(t > ev.boss_angry + 0.4 ? 'point' : 'stand', t).mood(t < ev.boss_angry ? 'happy' : 'angry');
    boss1.setPosition(boss1.base.x, 0, boss1.base.z, boss1.base.rot - 0.5 * ramp(t, ev.boss_angry, ev.boss_angry + 0.35));
    cow.pose(t > ev.boss_angry + 0.2 ? 'shrug' : 'stand', t * 0.7).mood(t < ev.tie_pop ? 'neutral' : t < ev.boss_angry ? 'happy' : 'shock');
    for (const [i, h] of officeBack.entries()) h.pose('sit').mood('neutral').look(t > ev.boss_angry ? 0.5 * (i % 2 ? 1 : -1) : 0, 0);
  };

  // =====================================================================
  // BESPRECHUNG
  // =====================================================================
  {
    const g = PL.room({ w: 8, d: 6, wall: 0xcfd6dd, floor: 0x6f7f8f, stripes: false });
    g.position.set(...O.meet);
    loc.meet.add(g);
    const tb = P.table({ w: 3.4, d: 1.3, color: 0xe8e4dc });
    tb.position.set(...W('meet', -0.3, 0, -0.4));
    loc.meet.add(tb);
    const scr = kit.box(2.4, 1.3, 0.05, 0x1d2430, W('meet', -0.3, 1.0, -2.88), { mat: { emissive: 0x2a5a8a, emissiveIntensity: 0.5 } });
    loc.meet.add(scr);
  }
  const meetSeats = [-1.4, -0.5, 0.4, 1.3].map((x) => {
    const ch = P.chair(0x2a2a30);
    ch.position.set(...W('meet', x, 0, -1.4));
    loc.meet.add(ch);
    return x;
  });
  const meeters = meetSeats.map((x, i) => person('meet', EXTRA[(i + 3) % EXTRA.length], x, 0, -1.4, 0));
  const boss2 = person('meet', BOSS, -2.45, 0, -0.4, Math.PI / 2);
  for (const [i, h] of meeters.entries()) bubble('meet', 'mail', above(h.pose('sit'), 0.18 * (i % 2 ? -1 : 1), 0.62), { open: ev.mail_pops + i * 0.12, close: ev.meeting_leave + 0.35 + i * 0.1, size: 0.62 });
  const updMeet = (t) => {
    boss2.pose(t < ev.meeting_leave ? 'point' : 'shrug', t).mood(t < ev.mail_pops ? 'happy' : t < ev.meeting_leave ? 'worried' : 'sad');
    boss2.look(t > ev.meeting_leave ? 0.4 * ramp(t, ev.meeting_leave, ev.meeting_leave + 0.8) : 0, 0);
    for (const [i, h] of meeters.entries()) {
      const tl = t - ev.meeting_leave - i * 0.15;
      if (tl < 0) {
        h.setPosition(h.base.x, 0, h.base.z, 0);
        h.pose('sit').mood(t < ev.mail_pops ? 'tired' : t < ev.mail_pops + 0.6 ? 'shock' : 'happy').look(t > ev.mail_pops + 0.6 ? 0.4 * Math.sin(i + t * 2) : 0, 0);
      } else {
        // aufstehen (weich, 0,4 s) und Richtung Kamera/rechts hinausgehen
        const up = Math.min(1, tl / 0.4);
        const d = Math.max(0, tl - 0.4) * 1.3;
        h.setPosition(h.base.x + d * 0.75, 0, h.base.z + 0.45 * up + d * 0.66, 0.85 * up);
        if (up < 1) h.pose('stand', 0, { seated: 1 - up }).mood('happy');
        else h.pose('walk', (tl - 0.4) * 1.8).mood('happy');
      }
    }
  };

  // =====================================================================
  // CAFÉ (erstes Date)
  // =====================================================================
  const cafe = add('cafe', PL.cafe(O.cafe));
  const youDate = person('cafe', YOU, cafe.spots.seatL[0] - O.cafe[0], 0, cafe.spots.seatL[2] - O.cafe[2], Math.PI / 2);
  const date = person('cafe', { shirt: 0xd94a5a, pants: 0x2a2a30, hair: 'long', hairColor: HAIR[3], skin: SKIN[3] }, cafe.spots.seatR[0] - O.cafe[0], 0, cafe.spots.seatR[2] - O.cafe[2], -Math.PI / 2);
  bubble('cafe', 'door', above(youDate.pose('sit'), -0.15, 0.62, 0.1), { open: ev.door_pop, close: ev.date_leave, size: 0.7, tail: [0.1, -0.62, 0] });
  bubble('cafe', 'door', above(date.pose('sit'), 0.15, 0.62, 0.1), { open: ev.door_pop + 0.25, close: ev.date_leave, size: 0.7, tail: [-0.1, -0.62, 0] });
  const updCafe = (t) => {
    for (const [h, dir] of [[youDate, -1], [date, 1]]) {
      const tl = t - ev.date_leave;
      if (tl < 0) {
        h.setPosition(h.base.x, 0, h.base.z, h.base.rot);
        const m = t < ev.door_pop ? 'happy' : t < ev.date_look ? 'worried' : t < ev.date_relief ? 'shock' : 'laugh';
        h.pose('sit').mood(m);
        if (t > ev.date_relief) h.root.position.y = 0.025 * Math.abs(Math.sin(t * 9));
      } else {
        // beide stehen auf und gehen gemeinsam (lachend) nach vorn
        const up = Math.min(1, tl / 0.4);
        const d = Math.max(0, tl - 0.4) * 1.4;
        h.setPosition(h.base.x + dir * 0.15 * up + d * 0.1, 0, h.base.z + 0.4 * up + d, lerp(h.base.rot, 0.1, up));
        if (up < 1) h.pose('stand', 0, { seated: 1 - up }).mood('laugh');
        else h.pose('walk', (tl - 0.4) * 1.8).mood('laugh');
      }
    }
  };

  // =====================================================================
  // BUSHALTESTELLE
  // =====================================================================
  add('bus', PL.street(O.bus, { length: 70, clear: { side: 1, from: -6, to: 10 } }));
  const bus = P.bus();
  loc.bus.add(bus);
  const youBus = person('bus', YOU, 5.05, 0.12, 0.0, Math.PI / 2);
  const stranger = person('bus', { shirt: 0xe0b23a, pants: 0x6b5a45, hair: 'spiky', hairColor: HAIR[0], skin: SKIN[4], glasses: true }, 6.3, 0.12, -0.15, -Math.PI / 2);
  const shelter = kit.group(kit.box(2.6, 0.08, 1.2, 0x2a6fb0, [0, 2.4, 0]), kit.box(0.08, 2.4, 0.08, 0x333333, [-1.2, 0, -0.5]), kit.box(0.08, 2.4, 0.08, 0x333333, [1.2, 0, -0.5]), kit.box(2.5, 1.6, 0.04, 0x9fc4dd, [0, 0.6, -0.55], { mat: { transparent: true, opacity: 0.45 } }));
  shelter.position.set(...W('bus', 6.6, 0.12, -2.6));
  shelter.rotation.y = -Math.PI / 2;
  loc.bus.add(shelter);
  bubble('bus', 'stars2', above(stranger, 0.1, 0.38), { open: ev.stars_stranger, size: 0.75, tail: [0.0, -0.55, 0] });
  bubble('bus', 'stars1', above(youBus, -0.1, 0.38, 0.1), { open: ev.stars_you, size: 0.75, tail: [0.0, -0.55, 0] });
  const updBus = (t) => {
    const tl = t - S.busstop.from;
    bus.position.set(...W('bus', 2.6, 0, -34 + tl * 9));
    stranger.pose(t < ev.stars_stranger ? 'stand' : 'shrug', t * 0.6).mood(t < ev.stars_you + 0.3 ? 'neutral' : 'shock');
    stranger.look(t < ev.stars_stranger ? 0 : 0.1, t < ev.stars_stranger ? 0.15 * Math.sin(tl * 3) : 0);
    youBus.pose(t < ev.stars_you ? 'stand' : 'point', t).mood(t < ev.stars_stranger + 0.3 ? 'happy' : t < ev.stars_you ? 'shock' : 'angry');
  };

  // =====================================================================
  // STRASSE MIT MENGE (Welt)
  // =====================================================================
  add('crowd', PL.street(O.crowd, { length: 90, clear: { side: 1, from: 6, to: 26 } }));
  const crowdIcons = ['question', 'heart', 'pizza', 'mail', 'cake', 'zzz', 'tie', 'door', 'stars1', 'heart', 'pizza', 'question'];
  const crowdPeople = [];
  for (let i = 0; i < 46; i++) {
    const x = rng.range(-8.5, 8.5);
    const z = rng.range(-14, 3.5);
    const look = { skin: rng.pick(SKIN), hairColor: rng.pick(HAIR), hair: rng.pick(['short', 'short', 'long', 'bun', 'bald', 'spiky']), shirt: rng.pick([0xe0b23a, 0x3a7ad9, 0xd94a3a, 0x4aa05a, 0x8a5ac9, 0xe08a3a, 0xeeeeee, 0x333333]), pants: rng.pick([0x2d3e66, 0x3a3a3a, 0x6b5a45]) };
    const onWalk = Math.abs(x) > 4.2;
    // Nahe Figuren stehen und schauen zur Kamera (Gesichter lesbar), hintere gehen
    const h = person('crowd', look, x, onWalk ? 0.12 : 0, z, (z > 0 ? 0 : rng.pick([0, Math.PI])) + rng.range(-0.35, 0.35));
    h.still = z > 0;
    h.phase = rng.next();
    h.dist = Math.hypot(x - 0.8, z - 8);
    crowdPeople.push(h);
  }
  // Kaskade: zuerst die Nahen, dann nach hinten
  const byDist = [...crowdPeople].sort((a, b) => a.dist - b.dist);
  byDist.forEach((h, i) => {
    h.popAt = ev.crowd_pops + (i / byDist.length) * 2.4;
    h.earAt = ev.ear_pops + (i / byDist.length) * 1.8;
  });
  for (const [i, h] of crowdPeople.entries()) {
    const top = [h.base.x + 0.38, h.base.y + 2.5, h.base.z];
    bubble('crowd', crowdIcons[i % crowdIcons.length], top, { open: h.popAt, close: S.party.from, size: 0.95 });
    bubble('crowd', 'ear', [h.base.x + 0.38, h.base.y + 2.6, h.base.z], { open: h.earAt, close: ev.all_close, size: 1.1 });
  }
  const updCrowd = (t) => {
    for (const [i, h] of crowdPeople.entries()) {
      const p = h.phase * 10;
      if (t < S.party.from) {
        // Welt: gehen, bis die eigene Blase aufploppt – dann stehen bleiben und an den Kopf fassen
        const walking = !h.still && t < h.popAt + 0.25;
        const tw = Math.min(t, h.popAt + 0.25) - S.world.from;
        const dir = Math.cos(h.base.rot) >= 0 ? 1 : -1;
        h.setPosition(h.base.x, h.base.y, h.base.z + (h.still ? 0 : dir * tw * 0.9), h.base.rot);
        if (walking) h.pose('walk', (t + p) * 1.6).mood('neutral');
        else h.pose(i % 3 === 0 ? 'armsUp' : i % 3 === 1 ? 'facepalm' : 'shrug', t + p).mood(i % 2 ? 'shock' : 'worried');
      } else {
        h.setPosition(h.base.x, h.base.y, h.base.z, h.base.rot + (i % 2 ? 0.5 : -0.5));
        if (t < ev.all_close) h.pose(i % 4 === 0 ? 'armsUp' : 'stand', t + p).mood(t < h.earAt ? 'worried' : 'shock').look(0.3 * Math.sin(t * 2 + p), -0.25);
        else if (t < ev.relief) h.pose('stand', t + p).mood('shock');
        else h.pose(t < ev.relief + 0.8 ? 'slump' : 'stand', t + p).mood(t < ev.relief + 0.8 ? 'tired' : 'happy');
      }
    }
  };

  // =====================================================================
  // KÜCHE (Überraschungsparty)
  // =====================================================================
  add('kitchen', PL.kitchen(O.kitchen));
  const island = P.counter({ w: 2.4, color: 0xe8e4dc, top: 0x5d9a9a });
  island.position.set(...W('kitchen', -0.9, 0, -0.35));
  loc.kitchen.add(island);
  // Girlande (ohne Schrift) und Geschenke
  const flagCols = [0xe8365a, 0xf2b822, 0x3a7ad9, 0x4aa05a, 0x8a5ac9];
  for (let i = 0; i < 15; i++) {
    const x = -2.6 + i * 0.37;
    const flag = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.26, 3), kit.mat(flagCols[i % 5]));
    flag.rotation.z = Math.PI;
    flag.position.set(...W('kitchen', x, 2.5 - 0.1 * Math.sin((i / 14) * Math.PI), -2.35));
    loc.kitchen.add(flag);
  }
  [[-1.6, 0x3a7ad9, 0.3], [-0.9, 0xe8365a, 0.38], [-0.3, 0xf2b822, 0.26]].forEach(([x, c, s]) => {
    loc.kitchen.add(kit.box(s, s, s, c, W('kitchen', x, 0.93, -0.35)), kit.box(s + 0.02, s + 0.01, 0.05, 0xffffff, W('kitchen', x, 0.93, -0.35)));
  });
  const friends = [-1.85, -1.25, -0.65, -0.05].map((x, i) => person('kitchen', EXTRA[(i + 5) % EXTRA.length], x, -0.28, -1.15, 0));
  for (const [i, h] of friends.entries()) bubble('kitchen', 'cake', above(h.pose('sit'), 0.1 * (i % 2 ? -1 : 1), 0.62 + 0.12 * (i % 2)), { open: ev.cake_pops + i * 0.1, size: 0.6 });
  const bday = person('kitchen', { shirt: 0x3a7ad9, pants: 0x2d3e66, hair: 'short', hairColor: HAIR[3], skin: SKIN[2] }, 2.1, 0, -0.45, -1.5);
  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 6), kit.mat(0xf2b822));
  hat.position.set(0.04, 0.48, 0);
  hat.rotation.z = -0.2;
  bday.head.add(hat);
  const updKitchen = (t) => {
    for (const [i, h] of friends.entries()) {
      if (t < ev.friends_deflate) {
        h.setPosition(h.base.x, h.base.y, h.base.z, 0);
        h.pose('sit').mood(t < ev.bday_enter ? 'happy' : 'worried').look(0.25 * Math.sin(t * 2 + i), 0);
      } else {
        const k = ramp(t, ev.friends_deflate + i * 0.08, ev.friends_deflate + 0.4 + i * 0.08);
        h.setPosition(h.base.x, h.base.y * (1 - k), h.base.z, 0);
        h.pose('slump', t, { seated: 1 - k }).mood('sad');
      }
    }
    const tw = Math.max(0, t - ev.bday_enter);
    const walkT = Math.min(tw, 1.1);
    bday.setPosition(bday.base.x - walkT * 1.2, 0, bday.base.z, bday.base.rot + 0.9 * ramp(tw, 1.0, 1.4));
    if (tw <= 0) bday.pose('stand').mood('happy');
    else if (tw < 1.1) bday.pose('walk', tw * 1.8).mood('laugh');
    else bday.pose(t < ev.friends_deflate + 0.2 ? 'stand' : 'armsUp', t * 1.5).mood('laugh');
  };

  // =====================================================================
  // SCHLAFZIMMER („on my way“)
  // =====================================================================
  add('bed', PL.bedroom(O.bed, { clock: '9:47' }));
  const sleeper = person('bed', { shirt: 0x6a8fd0, pants: 0x6a8fd0, hair: 'spiky', hairColor: HAIR[1], skin: SKIN[5] }, 0.3, 0.55, -1.4, 0);
  const ph = P.phone({ mode: 'blank', bg: '#3a6ab0', glow: 0.8 });
  ph.position.set(0, -0.14, 0.09);
  ph.scale.setScalar(1.7);
  sleeper.hold(ph);
  sleeper.pose('liePhone');
  bubble('bed', 'zzz', [O.bed[0] + 0.9, 1.95, O.bed[2] - 1.9], { open: ev.zzz_pop, size: 0.85, tail: [-0.35, -0.55, 0] });
  const updBed = (t) => {
    const buzz = t > ev.phone_buzz && t < ev.phone_buzz + 0.5 ? 0.04 * Math.sin((t - ev.phone_buzz) * 90) : 0;
    sleeper.pose('liePhone').mood(t < ev.phone_buzz ? 'tired' : 'shock', t < ev.phone_buzz && (t % 1.7) < 0.12);
    ph.rotation.z = buzz;
  };

  // =====================================================================
  // GROSSRAUMBÜRO („nobody knows“)
  // =====================================================================
  const big = add('big', PL.office(O.big, { cols: 2, rows: 5, carpet: 0x55607a }));
  // vordere Reihe (an der Kamera) bleibt leer, damit die Kamera Abstand hat
  const workers = big.spots.desks.filter((_, i) => i % 5 !== 0).map((s, i) => {
    const h = person('big', EXTRA[i % EXTRA.length], s[0] - O.big[0], 0, s[2] - O.big[2], Math.PI);
    h.pose('sit');
    h.idx = i;
    return h;
  });
  for (const h of workers) {
    const top = above(h, 0.3, 0.55);
    bubble('big', 'question', top, { open: ev.office_pops + (h.idx % 4) * 0.3 + Math.floor(h.idx / 4) * 0.12, size: 0.62 });
  }
  const updBig = (t) => {
    for (const h of workers) {
      const own = ev.office_pops + (h.idx % 4) * 0.3 + Math.floor(h.idx / 4) * 0.12;
      if (t < own + 0.3) h.pose('sit').mood('neutral');
      else h.pose(h.idx % 3 === 0 ? 'shrug' : h.idx % 3 === 1 ? 'facepalm' : 'sit', t + h.idx, { seated: true }).mood(h.idx % 2 ? 'worried' : 'shock').look(0.3 * Math.sin(t * 1.5 + h.idx), 0);
    }
  };

  // ---------- Hauptschleife ----------
  const UPD = { class: updClass, office: updOffice, meet: updMeet, cafe: updCafe, bus: updBus, crowd: updCrowd, kitchen: updKitchen, bed: updBed, big: updBig };
  return {
    update({ t }) {
      const s = shotAt(t);
      const k = SHOT_PLACE[s.id];
      for (const [name, g] of Object.entries(loc)) g.visible = name === k;
      kit.sunAt(sun, O[k]);
      UPD[k](t);
      const cp = camPos(s, t);
      for (const B of bubbles) {
        if (B.place !== k) continue;
        B.b.userData.pop((t - B.open) * B.slow, t >= B.close ? t - B.close : -1);
        if (B.b.visible) B.b.lookAt(cp);
      }
    },
  };
}
