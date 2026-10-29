#!/usr/bin/env node
// Prüft eine Produktion VOR dem Rendern gegen die messbaren Regeln des Style-Guides.
// Nutzt dieselbe Zeitachsen-Logik wie der Render (pipeline/runtime/timeline.js) – keine Doppelimplementierung.
//
//   node tools/validate_production.mjs productions/<slug> [--lang en] [--json]
//
// Exit-Code: 0 = keine Fehler (Warnungen möglich), 1 = Fehler.
import fs from 'node:fs';
import path from 'node:path';
import { prepare, hudAt } from '../pipeline/runtime/timeline.js';
import { paginate } from '../pipeline/runtime/captions.js';

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const r2 = (x) => Math.round(x * 100) / 100;

// Länge (Style-Guide 10.1): harte Untergrenze für JEDES Video, alle Stile (A, B1, B2).
// Nicht überschreibbar – auch nicht über timeline.qa. Verlängert wird durch Dramaturgie, nicht durch Leerlauf
// (die Regel „Zustandsänderung spätestens alle 6 s“ unten verhindert Leerlauf technisch).
export const MIN_SECONDS = 60;
export const MAX_SECONDS_DEFAULT = 80;
export const RECOMMENDED_MIN_SECONDS = 61; // „über 1 Minute“ (Hypothese H6, Monetarisierung)

export function checkLength(timeline, E, W) {
  const dur = timeline.duration;
  const qa = timeline.qa || {};
  if (qa.min_seconds != null && qa.min_seconds < MIN_SECONDS) {
    E('10.1', `qa.min_seconds = ${qa.min_seconds} liegt unter der Mindestlänge ${MIN_SECONDS} s – nicht zulässig`);
  }
  const lo = Math.max(MIN_SECONDS, qa.min_seconds ?? MIN_SECONDS);
  const hi = qa.max_seconds ?? MAX_SECONDS_DEFAULT;
  if (hi < lo) E('10.1', `qa.max_seconds = ${hi} liegt unter der Mindestlänge ${lo} s`);
  if (dur < MIN_SECONDS) E('10.1', `Länge ${dur} s unter der Mindestlänge ${MIN_SECONDS} s (gilt für alle Stile)`);
  else if (dur < lo || dur > hi) E('10.1', `Länge ${dur} s außerhalb ${lo}–${hi} s`);
  if (dur >= MIN_SECONDS && dur < RECOMMENDED_MIN_SECONDS) {
    W('10.1', `Länge ${dur} s: ≥ ${RECOMMENDED_MIN_SECONDS} s empfohlen („über 1 Minute“, Hypothese H6)`);
  }
}

export function validate(timeline, text, { lang = 'en', wordTimes = null } = {}) {
  const errors = [];
  const warnings = [];
  const E = (rule, msg) => errors.push(`[${rule}] ${msg}`);
  const W = (rule, msg) => warnings.push(`[${rule}] ${msg}`);
  if (timeline.profile === 'voiceover') return validateVoiceover(timeline, text, { lang, words: wordTimes, errors, warnings, E, W });

  let ptl;
  try {
    ptl = prepare(timeline);
  } catch (e) {
    E('10.2', `Zeitachse ungültig: ${e.message}`);
    return { errors, warnings };
  }
  const dur = timeline.duration;

  // Länge (10.1)
  checkLength(timeline, E, W);

  // Titel (2)
  const tt = timeline.title;
  const title = text.title?.text;
  if (!tt || !title) E('2', 'Titelfrage fehlt (timeline.title + text.title)');
  else {
    if (tt.in !== 0) E('2', `Titel muss ab Frame 0 stehen (in = ${tt.in})`);
    if (tt.out - tt.in < 2.5 || tt.out - tt.in > 4.5) E('2', `Titel steht ${r2(tt.out - tt.in)} s (erlaubt 2,5–4,0 s + Ausblendung)`);
    if (!/^What if\b/.test(title) && lang === 'en') E('2', 'Titel beginnt nicht mit „What if“');
    if (!title.trim().endsWith('?')) E('2', 'Titel endet nicht mit „?“');
    if (words(title) > 10) E('2', `Titel hat ${words(title)} Wörter (max. 10)`);
    const hl = text.title.highlight;
    if (hl && !title.includes(hl)) E('2', `Hervorhebung „${hl}“ kommt im Titel nicht vor`);
    if (hl && words(hl) > 1) W('2', `Hervorhebung „${hl}“ ist mehr als ein Wort`);
  }

  // HUD (2, 3.2)
  const hud = timeline.hud || [];
  if (hud.length === 0) E('2', 'HUD fehlt');
  else {
    if (hud[0].from !== 0) E('2', 'HUD muss ab Frame 0 sichtbar sein');
    const v0 = hudAt(ptl, 0).value;
    const v2 = hudAt(ptl, 2).value;
    const d = hud[0].decimals ?? 0;
    if (v0.toFixed(d) === v2.toFixed(d)) E('2', 'HUD-Wert ändert sich in den ersten 2 s nicht sichtbar');
    if (hud.length < 3) W('3.2', `nur ${hud.length - 1} HUD-Label-Wechsel (Empfehlung ≥ 2)`);
    for (const s of hud) {
      if (!text.hud?.[s.id]) E('1.3', `HUD-ID „${s.id}“ fehlt in text.${lang}.json`);
      if (s.final && !text.hud?.[s.id]?.final) E('1.3', `HUD „${s.id}“: Endtext (final) fehlt in der Textdatei`);
    }
  }

  // Untertitel (4)
  const lines = [...(timeline.lines || [])].sort((a, b) => a.in - b.in);
  if (lines.length < 12 || lines.length > 24) E('4', `${lines.length} Textzeilen (erlaubt 12–24)`);
  lines.forEach((l, i) => {
    const s = text.lines?.[l.id];
    if (s == null) {
      E('1.3', `Text-ID „${l.id}“ fehlt in text.${lang}.json`);
      return;
    }
    const w = words(s);
    if (w < 3 || w > 10) E('4', `${l.id}: ${w} Wörter (erlaubt 3–10): „${s}“`);
    const need = Math.max(1.8, w / 3 + 0.6);
    const len = l.out - l.in;
    if (len < need - 1e-9) E('4', `${l.id}: ${r2(len)} s sichtbar, nötig ≥ ${r2(need)} s`);
    if (len > 4.5 + 1e-9) E('4', `${l.id}: ${r2(len)} s sichtbar (max. 4,5 s)`);
    if (i > 0) {
      const gap = l.in - lines[i - 1].out;
      if (gap < 0) E('4', `${lines[i - 1].id} und ${l.id} überlappen`);
      else if (gap < 0.2 - 1e-9) E('4', `Pause zwischen ${lines[i - 1].id} und ${l.id} nur ${r2(gap)} s (min. 0,2 s)`);
    }
    if (l.out > dur) E('4', `${l.id} endet nach Videoende`);
  });
  if (lines.length && (lines[0].in < 3.5 || lines[0].in > 5.0)) W('2', `erste Zeile bei ${lines[0].in} s (Empfehlung 3,5–5,0 s)`);
  const used = new Set(lines.map((l) => l.id));
  for (const id of Object.keys(text.lines || {})) if (!used.has(id)) W('1.3', `Text-ID „${id}“ wird nicht verwendet`);

  // Auslösendes Ereignis ≤ 10 s (2)
  const events = timeline.events || [];
  const trigger = events.find((e) => e.trigger);
  if (!trigger) E('2', 'kein auslösendes Ereignis (events[].trigger) definiert');
  else if (trigger.t > 10) E('2', `auslösendes Ereignis bei ${trigger.t} s (spätestens 10 s)`);

  // Sichtbare Zustandsänderung spätestens alle 6 s (7.1)
  const changes = [0, ...ptl.shots.slice(1).map((s) => s.from / ptl.fps), ...events.map((e) => e.t), ...hud.map((h) => h.from), dur].sort((a, b) => a - b);
  for (let i = 1; i < changes.length; i++) {
    if (changes[i] - changes[i - 1] > 6 + 1e-9) E('7.1', `keine Zustandsänderung zwischen ${r2(changes[i - 1])} s und ${r2(changes[i])} s (> 6 s)`);
  }

  // Pointe und Ende (3.2, 7.4)
  if (timeline.pointe == null) E('3.2', 'Pointe (timeline.pointe) nicht festgelegt');
  else if (dur - timeline.pointe > 5 + 1e-9) E('7.4', `Video endet ${r2(dur - timeline.pointe)} s nach der Pointe (max. 5 s)`);

  // Blitzregel / Weißblenden (6.2, 7.2): höchstens 1 Weißblende pro 5 s
  const flashes = ptl.shots.filter((s) => s.transition.type === 'flash').map((s) => s.from / ptl.fps);
  for (let i = 1; i < flashes.length; i++) {
    if (flashes[i] - flashes[i - 1] < 5) E('7.2', `Weißblenden bei ${r2(flashes[i - 1])} s und ${r2(flashes[i])} s weniger als 5 s auseinander`);
  }

  // Seed für deterministische Effekte (8)
  if (!Number.isInteger(timeline.seed)) E('8', 'timeline.seed (ganzzahlig) fehlt – Effekte müssen geseedet sein');

  return { errors, warnings };
}

// Profil „voiceover“ = Stil A (Earth): Sprecher, Wort-für-Wort-Untertitel und Einblendungen statt Titel/HUD/Zeilen.
// Regeln: STYLE_A_EARTH.md. Mindestlänge 60 s wie alle Stile.
// Prüft die messbaren Regeln, die unabhängig vom Profil gelten, plus die Untertitel-/Einblendungs-Regeln.
function validateVoiceover(timeline, text, { words, errors, warnings, E, W }) {
  let ptl;
  try {
    ptl = prepare(timeline);
  } catch (e) {
    E('10.2', `Zeitachse ungültig: ${e.message}`);
    return { errors, warnings };
  }
  const dur = timeline.duration;
  checkLength(timeline, E, W);
  if (!timeline.qa) W('10.1', `kein qa-Längenbereich angegeben – ${MIN_SECONDS}–${MAX_SECONDS_DEFAULT} s angenommen`);

  // Sicherheitszone (6.3; TikTok: unten 20 %, rechts 15 % frei): Mittelpunkte der Einblendungen und Untertitel
  const safe = { y0: 0.1, y1: 0.8 };
  const cy = timeline.captions?.center_y;
  if (timeline.captions && (cy < 0.12 || cy > 0.36)) E('6.3', `Untertitel bei y = ${cy} (erwartet oberes Drittel 0,12–0,36)`);
  if (timeline.captions && (timeline.captions.max_width ?? 0.7) > 0.7 + 1e-9) E('6.3', 'Untertitelbreite > 70 % (rechter Rand 15 % frei)');
  for (const c of timeline.callouts || []) {
    if (!text.callouts?.[c.id]) E('1.3', `Callout-ID „${c.id}“ fehlt in der Textdatei`);
    if ((c.y ?? 0.5) < safe.y0 + 0.04 || (c.y ?? 0.5) > safe.y1 - 0.06) E('6.3', `Callout „${c.id}“ bei y = ${c.y} zu nah am Rand (Sicherheitszone ${safe.y0}–${safe.y1})`);
    if (c.out <= c.in || c.out > dur + 1e-9) E('4', `Callout „${c.id}“: Zeiten ${c.in}–${c.out} ungültig`);
  }
  if (timeline.callouts?.[0]?.in !== 0 && !(timeline.callouts || []).some((c) => c.in === 0)) E('2', 'Frame 0: keine Texteinblendung (Hook) ab 0 s');

  // Untertitel: höchstens max_words Wörter je Seite, keine Seite kürzer als 0,25 s, alles vor Videoende
  if (timeline.captions) {
    if (!words?.units) E('9.1', `Wortzeiten fehlen (${timeline.captions.words}) – tools/tts_kokoro.py ausführen`);
    else {
      const maxW = timeline.captions.max_words ?? 3;
      const pages = paginate(words.units.filter((u) => u.captions !== false), { maxWords: maxW });
      for (const p of pages) {
        const n = p.units.reduce((a, u) => a + u.display.trim().split(/\s+/).length, 0);
        const txt = p.units.map((u) => u.display).join(' ');
        if (n > maxW) E('4', `Untertitelseite „${txt}“ hat ${n} Wörter (max. ${maxW})`);
        if (p.out - p.in < 0.25) W('4', `Untertitelseite „${txt}“ nur ${r2(p.out - p.in)} s sichtbar`);
        if (p.out > dur) E('4', `Untertitel „${txt}“ endet nach Videoende`);
      }
      const speechEnd = words.speech_end ?? Math.max(...words.units.map((u) => u.end));
      if (speechEnd > dur - 0.3) E('7.4', `Sprache endet bei ${r2(speechEnd)} s, Video bei ${dur} s (≥ 0,3 s Luft nötig)`);
    }
  }

  // Auslösendes Ereignis, Zustandsänderungen, Pointe/Ende, Weißblenden, Seed (wie Standardprofil)
  const events = timeline.events || [];
  const trigger = events.find((e) => e.trigger);
  if (!trigger) E('2', 'kein auslösendes Ereignis (events[].trigger) definiert');
  else if (trigger.t > 10) E('2', `auslösendes Ereignis bei ${trigger.t} s (spätestens 10 s)`);
  const changes = [0, ...ptl.shots.slice(1).map((s) => s.from / ptl.fps), ...events.map((e) => e.t), dur].sort((a, b) => a - b);
  for (let i = 1; i < changes.length; i++) {
    if (changes[i] - changes[i - 1] > 6 + 1e-9) E('7.1', `keine Zustandsänderung zwischen ${r2(changes[i - 1])} s und ${r2(changes[i])} s (> 6 s)`);
  }
  if (timeline.pointe == null) E('3.2', 'Pointe (timeline.pointe) nicht festgelegt');
  else if (dur - timeline.pointe > 6 + 1e-9) W('7.4', `Video endet ${r2(dur - timeline.pointe)} s nach der Pointe (Style-Guide: max. 5 s)`);
  const flashes = ptl.shots.filter((s) => s.transition.type === 'flash').map((s) => s.from / ptl.fps);
  for (let i = 1; i < flashes.length; i++) if (flashes[i] - flashes[i - 1] < 5) E('7.2', `Weißblenden bei ${r2(flashes[i - 1])} s und ${r2(flashes[i])} s weniger als 5 s auseinander`);
  if (!Number.isInteger(timeline.seed)) E('8', 'timeline.seed (ganzzahlig) fehlt – Effekte müssen geseedet sein');
  if (!timeline.audio?.voice) W('9.1', 'Profil voiceover ohne audio.voice');
  return { errors, warnings };
}

export function loadWords(dir, timeline) {
  const f = timeline.captions?.words && path.join(dir, timeline.captions.words);
  return f && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !a.startsWith('--'));
  const lang = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : 'en';
  if (!dir) {
    console.error('Aufruf: node tools/validate_production.mjs productions/<slug> [--lang en] [--json]');
    process.exit(2);
  }
  const tl = JSON.parse(fs.readFileSync(path.join(dir, 'timeline.json'), 'utf8'));
  const tx = JSON.parse(fs.readFileSync(path.join(dir, `text.${lang}.json`), 'utf8'));
  const res = validate(tl, tx, { lang, wordTimes: loadWords(dir, tl) });
  if (args.includes('--json')) console.log(JSON.stringify(res, null, 1));
  else {
    for (const e of res.errors) console.log(`❌ ${e}`);
    for (const w of res.warnings) console.log(`⚠️  ${w}`);
    console.log(res.errors.length ? `FEHLER: ${res.errors.length}` : `OK (${res.warnings.length} Warnungen)`);
  }
  process.exit(res.errors.length ? 1 : 0);
}
