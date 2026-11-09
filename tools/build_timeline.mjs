#!/usr/bin/env node
// Beat-Sheet → timeline.json (Stil B, Abschnitt 18 des Style-Guides).
//
//   node tools/build_timeline.mjs productions/<slug>        liest beats.json, schreibt timeline.json
//
// Warum: In früheren Produktionen standen Schnitte, Kamera, HUD-Werte, Textzeiten und Klangeinsätze getrennt von Hand
// in timeline.json und scene.js. Das führte zu verrutschten Soundeffekten, statischen Kameras und HUD-Werten, die sich
// nur selten änderten. Hier wird alles aus EINER Liste von Beats erzeugt:
//   - jeder Beat = ein Ort/eine Einstellung mit Kamera-Vorlage (pipeline/runtime/kit/camera.js)
//   - jedes Ereignis im Beat liefert gleichzeitig: Ereigniszeit für scene.js (kit.beatClock), Soundeffekt,
//     HUD-Sprung/Akzent und Kamerawackeln – auf denselben Frame gerundet
//   - Whip-Übergänge bekommen automatisch einen Luftzug, dessen Spitze auf dem Schnitt liegt
//   - Musik- und Atmosphären-Betten mit Überblendungen je Ort
//
// Format beats.json (alle Zeiten in Sekunden; Ereigniszeiten relativ zum Beat-Beginn):
// {
//   "recipe": "B1", "fps": 30, "seed": 7,
//   "title": { "in": 0, "out": 3.4 },
//   "hud": { "start": 100, "decimals": 0 },
//   "pointe": "plug_in",                         // Ereignis-ID oder Sekunde
//   "endcard": { "beat": "end", "at": 0.4 },     // optional
//   "hook": { "type": "proof|process|countdown|mystery", "proof": "<Ereignis-ID>", "question": "…", "stakes": "…", "withheld": "…" },  // Guide 18.12
//   "post": {...}, "motion_blur": [...],          // werden durchgereicht
//   "audio": { "fade_out": 1.2, "music": { "bpm": 112, "root": "D", "seed": 3, "gain_db": -9,
//              "sections": [{ "from": 0, "to": 20, "style": "pulse" }, …], "automation": [[t, dB], …] },
//              "ambience_gain_db": -16 },
//   "beats": [
//     { "id": "wake", "dur": 4.0, "place": "bedroom", "mood": "tired", "ambience": "room",
//       "transition": "cut" | "dip" | "whip" | "flash", "whip_dir": "left", "frames": 8,
//       "camera": { "preset": "push", "target": [0, 1.2, 0], "yaw": 20, … },
//       "line": "l_wake", "line_at": [0.3, -0.15],
//       "data": { "you": [x, y, z, rotY] },          // frei: Positionen für scene.js (B.beat(id).data) – eine Quelle für Szene und Kamera
//       "hud": { "label": "battery", "to": 92, "mode": "steps", "steps": 3, "window": [0.4, 3.4], "tick": "pop", "bar": [0, 100] },
//       "events": [{ "id": "alarm", "at": 0.6, "what": "Wecker klingelt", "sfx": "buzz", "gain_db": -6,
//                    "hud_to": 95, "flash": "loss", "shake": { "amp": 0.04, "dur": 0.6 }, "trigger": true,
//                    "premise": "visible" | "hud" }] }   // Prämissen-Konsequenz im Bild / nur im HUD (Guide 18.12); ohne = Kulisse
//   Version 3.0 (Guide 18.13, alles optional/additiv):
//   "story": { "stake": "…", "measure": "…", "question": "…", "turn": "<Ereignis-ID>" },
//   Beat-Felder "act": 1, "fact": { "text": "…", "source": "…" }, "showpiece": "mass|vista|glow", "pov": true;
//   Ereignis-Feld "setup_for": "<Ereignis-ID der Pointe/Wende>" = sichtbare Ursache, auf die sich die Pointe bezieht.
//   ]
// }
import fs from 'node:fs';
import path from 'node:path';
import { shotKeys } from '../pipeline/runtime/kit/camera.js';
import { interpolate } from '../pipeline/runtime/timeline.js';

const r6 = (x) => Math.round(x * 1e6) / 1e6;

export function buildTimeline(B) {
  const fps = B.fps || 30;
  const snap = (s) => r6(Math.round(s * fps) / fps);
  if (!Array.isArray(B.beats) || B.beats.length === 0) throw new Error('beats.json: beats fehlt');
  const ids = new Set();
  let f = 0;
  const beats = B.beats.map((b, i) => {
    if (!b.id || ids.has(b.id)) throw new Error(`Beat ${i}: id fehlt oder doppelt`);
    ids.add(b.id);
    if (!(b.dur > 0)) throw new Error(`Beat ${b.id}: dur fehlt`);
    const f0 = f;
    f += Math.round(b.dur * fps);
    return { ...b, from: r6(f0 / fps), to: r6(f / fps), index: i };
  });
  const duration = beats[beats.length - 1].to;

  // Ereignisse (absolut, auf Frames)
  const events = [];
  for (const b of beats) {
    for (const e of b.events || []) {
      if (!e.id) throw new Error(`Beat ${b.id}: Ereignis ohne id`);
      if (ids.has(e.id)) throw new Error(`Ereignis-ID ${e.id} doppelt`);
      ids.add(e.id);
      const t = snap(b.from + e.at);
      if (t < b.from || t >= b.to) throw new Error(`Ereignis ${e.id}: at = ${e.at} liegt außerhalb des Beats ${b.id} (0–${r6(b.to - b.from)} s)`);
      events.push({ ...e, t, beat: b.id });
    }
  }
  const evT = (id) => {
    const e = events.find((x) => x.id === id);
    if (!e) throw new Error(`Ereignis ${id} unbekannt`);
    return e.t;
  };

  // Einstellungen + Kamera
  const shots = beats.map((b, i) => {
    if (!b.camera) throw new Error(`Beat ${b.id}: camera fehlt`);
    const cam = shotKeys({ ...b.camera, from: b.from, to: b.to });
    b.framing = cam.framing;
    const shot = { id: b.id, from: b.from, to: b.to, camera: { mode: cam.keys.length > 2 ? 'catmull' : 'linear', keys: cam.keys } };
    const tr = b.transition || 'cut';
    if (i > 0 && tr !== 'cut') {
      shot.transition_in = { type: tr };
      if (b.frames) shot.transition_in.frames = b.frames;
      if (tr === 'whip') shot.transition_in.direction = b.whip_dir || (i % 2 ? 'right' : 'left');
    }
    const shakes = (b.events || []).filter((e) => e.shake).map((e) => ({ t: snap(b.from + e.at), dur: e.shake.dur ?? 0.6, amp: e.shake.amp ?? 0.05, freq: e.shake.freq ?? 9 }));
    if (shakes.length) shot.shake = shakes;
    return shot;
  });

  // HUD: globale Werte-Spur mit Stufen ('hold') oder linearen Abschnitten; Label-Wechsel = neues Segment
  const H = B.hud || {};
  const keys = [[0, H.start ?? 0, 'linear']];
  const valueAt = (t) => interpolate(keys.map(([kt, v, e]) => ({ t: kt, v, ease: e })), t, 'linear');
  const segStarts = [];
  const ticks = [];
  let label = null;
  for (const b of beats) {
    const h = b.hud || {};
    if (h.label && h.label !== label) {
      if (label) b.labelChange = true;
      segStarts.push({ id: h.label, from: b.from, bar: h.bar, final: h.final, decimals: h.decimals });
      label = h.label;
    } else if (!label) throw new Error(`Beat ${b.id}: erster Beat braucht hud.label`);
    // Wertsprünge aus Ereignissen und Beat-Fenster in zeitlicher Reihenfolge
    const items = [];
    for (const e of b.events || []) if (e.hud_to != null) items.push({ t: snap(b.from + e.at), kind: 'jump', v: e.hud_to, tick: e.tick });
    if (h.to != null) {
      const [wa, wb] = h.window || [0.3, r6(b.to - b.from - 0.4)];
      items.push({ t: snap(b.from + wa), t2: snap(b.from + wb), kind: h.mode || 'steps', v: h.to, steps: h.steps ?? 4, tick: h.tick });
    }
    items.sort((a, c) => a.t - c.t);
    for (const it of items) {
      const last = keys[keys.length - 1];
      if (it.t < last[0]) throw new Error(`Beat ${b.id}: HUD-Zeiten nicht aufsteigend (${it.t} < ${last[0]})`);
      const cur = valueAt(it.t);
      if (it.kind === 'jump') {
        keys.push([it.t, it.v, 'hold']);
        if (it.tick) ticks.push({ t: it.t, sfx: it.tick });
      } else if (it.kind === 'linear') {
        if (it.t > last[0]) keys.push([it.t, cur, 'linear']);
        keys.push([it.t2, it.v, 'linear']);
      } else {
        // steps: gleich große Stufen · geo (EXPERIMENT 2026-11-01): Stufen mit gleichem Faktor (Verdopplung, Größenordnungen)
        const n = Math.max(1, it.steps);
        const geo = it.kind === 'geo' && cur > 0 && it.v > 0;
        for (let k = 0; k < n; k++) {
          const tk = snap(n === 1 ? it.t : it.t + ((it.t2 - it.t) * k) / (n - 1));
          const vk = geo ? cur * Math.pow(it.v / cur, (k + 1) / n) : cur + ((it.v - cur) * (k + 1)) / n;
          keys.push([tk, H.decimals ? Number(vk.toFixed(H.decimals)) : Math.round(vk), 'hold']);
          if (it.tick) ticks.push({ t: tk, sfx: it.tick });
        }
      }
    }
  }
  const hud = segStarts.map((s, i) => {
    const end = i + 1 < segStarts.length ? segStarts[i + 1].from : duration;
    const inner = keys.filter(([kt]) => kt > s.from && kt < end);
    const seg = { id: s.id, from: s.from, decimals: s.decimals ?? H.decimals ?? 0, value: { ease: 'linear', keys: [[s.from, valueAt(s.from)], ...inner] } };
    if (seg.value.keys.length === 1) seg.value.keys.push([r6(end), valueAt(s.from)]);
    if (s.bar) seg.bar = s.bar;
    else if (H.bar) seg.bar = H.bar;
    if (s.final) seg.final = { at: s.from };
    const fl = events.filter((e) => e.flash && e.t >= s.from && e.t < end).map((e) => ({ t: e.t, kind: e.flash }));
    if (fl.length) seg.flashes = fl;
    return seg;
  });

  // Textzeilen: eine Zeile pro Beat, blendet vor dem Schnitt aus
  const lines = [];
  for (const b of beats) {
    if (!b.line) continue;
    const [a, z] = b.line_at || [0.3, -0.15];
    lines.push({ id: b.line, in: snap(b.from + a), out: snap(z <= 0 ? b.to + z : b.from + z) });
  }

  // Ton: Ereignis-Klänge, Zählerschritte, Whip-Luftzüge, Musik, Atmosphären
  const A = B.audio || {};
  const sfx = [];
  for (const e of events) if (e.sfx) for (const name of [].concat(e.sfx)) sfx.push({ src: `gen:${name}`, t: e.t, gain_db: e.gain_db ?? -6, event: e.id });
  for (const k of ticks) sfx.push({ src: `gen:${k.sfx}`, t: k.t, gain_db: A.tick_gain_db ?? -14, event: 'hud_step' });
  for (const s of shots) {
    if (s.transition_in?.type === 'whip') {
      // whoosh 0,7 s mit Spitze bei 0,35 s → Spitze auf den Schnitt
      sfx.push({ src: 'gen:whoosh', t: snap(Math.max(0, s.from - 0.35)), gain_db: A.whoosh_gain_db ?? -11, event: `cut:${s.id}` });
    }
  }
  sfx.sort((a, c) => a.t - c.t);
  const beds = [];
  if (A.music) {
    beds.push({ src: 'music:main', start: 0, end: duration, gain_db: A.music.gain_db ?? -9, ...(A.music.automation ? { automation: A.music.automation } : {}) });
  }
  // Atmosphären: zusammenhängende Beats mit gleicher ambience = ein Bett mit 0,25-s-Rampen
  let run = null;
  const flush = () => {
    if (!run) return;
    const g = A.ambience_gain_db ?? -16;
    const a = run.from;
    const z = run.to;
    beds.push({ src: `gen:${run.name}`, start: a, end: z, gain_db: g, automation: [[a, -40], [r6(a + 0.25), 0], [r6(z - 0.25), 0], [z, -40]] });
    run = null;
  };
  for (const b of beats) {
    if (run && run.name === b.ambience) run.to = b.to;
    else {
      flush();
      if (b.ambience) run = { name: b.ambience, from: b.from, to: b.to };
    }
  }
  flush();
  const audio = { fade_out: A.fade_out ?? 1.2, beds, sfx };
  if (A.music) {
    const { gain_db, automation, ...plan } = A.music;
    audio.music = { main: { ...plan, duration } };
  }

  const pointe = typeof B.pointe === 'string' ? evT(B.pointe) : B.pointe;
  const tl = {
    _comment: 'ERZEUGT von tools/build_timeline.mjs aus beats.json – nicht von Hand ändern.',
    fps,
    duration,
    seed: B.seed ?? 1,
    recipe: B.recipe,
    pointe,
    title: B.title,
    shots,
    hud,
    lines,
    events: events.map((e) => ({ t: e.t, id: e.id, beat: e.beat, ...(e.trigger ? { trigger: true } : {}), ...(e.what ? { what: e.what } : {}), ...(e.sfx ? { sfx: [].concat(e.sfx) } : {}), ...(e.flash ? { flash: e.flash } : {}), ...(e.premise ? { premise: e.premise } : {}), ...(e.setup_for ? { setup_for: e.setup_for } : {}) })),
    beats: beats.map((b) => ({ id: b.id, from: b.from, to: b.to, place: b.place, mood: b.mood, framing: b.framing, preset: b.camera.preset, hud_change: !!(b.hud?.to != null || (b.events || []).some((e) => e.hud_to != null) || !!b.labelChange), ...(b.data ? { data: b.data } : {}), ...(b.act != null ? { act: b.act } : {}), ...(b.fact ? { fact: b.fact } : {}), ...(b.showpiece ? { showpiece: b.showpiece } : {}), ...(b.pov ? { pov: b.pov } : {}), ...(b.v4 != null ? { v4: b.v4 } : {}) })),
    audio,
  };
  if (B.post) tl.post = B.post;
  if (B.motion_blur) tl.motion_blur = B.motion_blur;
  if (B.qa) tl.qa = B.qa;
  if (B.hook) tl.hook = B.hook; // Hook-Standard 18.12: Typ, Beweis-Ereignis, Frage, Einsatz, Zurückgehaltenes
  // Version 3.0 / Guide 18.13: Story-Kern (Einsatz, Messgröße, Wende) und Pointe-ID (für die Ursachen-Prüfung setup_for)
  if (B.story) tl.story = B.story;
  if (B.story && typeof B.pointe === 'string') tl.pointe_id = B.pointe; // nur neue Produktionen: bestehende timeline.json bleiben identisch
  if (B.endcard) {
    const eb = beats.find((b) => b.id === B.endcard.beat);
    if (!eb) throw new Error(`endcard.beat ${B.endcard.beat} unbekannt`);
    tl.endcard = { in: snap(eb.from + (B.endcard.at ?? 0.3)), ...(B.endcard.center ? { center: B.endcard.center } : {}) };
  }
  return tl;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2];
  if (!dir) {
    console.error('Aufruf: node tools/build_timeline.mjs productions/<slug>');
    process.exit(2);
  }
  const B = JSON.parse(fs.readFileSync(path.join(dir, 'beats.json'), 'utf8'));
  const tl = buildTimeline(B);
  fs.writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify(tl, null, 1) + '\n');
  console.log(`timeline.json: ${tl.duration} s, ${tl.shots.length} Einstellungen, ${tl.events.length} Ereignisse, ${tl.audio.sfx.length} Klangeinsätze, ${tl.hud.length} HUD-Segmente, ${tl.lines.length} Zeilen`);
}
