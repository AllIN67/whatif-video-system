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

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const r2 = (x) => Math.round(x * 100) / 100;

export function validate(timeline, text, { lang = 'en' } = {}) {
  const errors = [];
  const warnings = [];
  const E = (rule, msg) => errors.push(`[${rule}] ${msg}`);
  const W = (rule, msg) => warnings.push(`[${rule}] ${msg}`);

  let ptl;
  try {
    ptl = prepare(timeline);
  } catch (e) {
    E('10.2', `Zeitachse ungültig: ${e.message}`);
    return { errors, warnings };
  }
  const dur = timeline.duration;

  // Länge (10.1). Abweichung nur mit Begründung in timeline.length_deviation = { min, max, reason }
  // (z. B. ausdrückliche Längenvorgabe des Auftraggebers) – dann Warnung statt Fehler.
  if (dur < 61 || dur > 80) {
    const dev = timeline.length_deviation;
    if (dev && typeof dev.reason === 'string' && dev.reason.trim().length >= 10 && dur >= dev.min && dur <= dev.max) {
      W('10.1', `Länge ${dur} s außerhalb 61–80 s – dokumentierte Abweichung (${dev.min}–${dev.max} s): ${dev.reason}`);
    } else E('10.1', `Länge ${dur} s außerhalb 61–80 s`);
  }

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
    for (const [i, s] of hud.entries()) {
      if (!text.hud?.[s.id]) E('1.3', `HUD-ID „${s.id}“ fehlt in text.${lang}.json`);
      const segEnd = i + 1 < hud.length ? hud[i + 1].from : dur;
      for (const f of s.flashes || []) {
        if (!['loss', 'warn'].includes(f.kind)) E('6.3', `HUD „${s.id}“: Akzent „${f.kind}“ unbekannt (loss, warn)`);
        if (f.t < s.from || f.t >= segEnd) E('6.5', `HUD „${s.id}“: Akzent bei ${f.t} s liegt außerhalb des Segments ${s.from}–${segEnd} s`);
      }
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

  // Endkarte (6.3, 7.4): Frage aus der Textdatei, ≤ 10 Wörter, steht bis zum Videoende
  const ec = timeline.endcard;
  if (ec) {
    const et = text.endcard?.title;
    if (!et) E('1.3', `Endkarte: endcard.title fehlt in text.${lang}.json`);
    else if (words(et) > 10) E('4', `Endkarte: ${words(et)} Wörter (max. 10)`);
    if (text.endcard?.sub && words(text.endcard.sub) > 10) E('4', `Endkarten-Unterzeile: ${words(text.endcard.sub)} Wörter (max. 10)`);
    if (ec.in >= dur) E('7.4', 'Endkarte beginnt nach Videoende');
    if (ec.out != null && ec.out < dur) W('7.4', `Endkarte endet bei ${ec.out} s vor dem Videoende`);
    if (ec.center != null && (ec.center < 0.10 || ec.center > 0.76)) E('6.3', `Endkarte: Mitte ${ec.center} außerhalb der Sicherheitszone`);
    for (const l of lines) if (l.out > ec.in + 1e-9) E('4', `${l.id} überlappt die Endkarte`);
  }

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
  const res = validate(tl, tx, { lang });
  if (args.includes('--json')) console.log(JSON.stringify(res, null, 1));
  else {
    for (const e of res.errors) console.log(`❌ ${e}`);
    for (const w of res.warnings) console.log(`⚠️  ${w}`);
    console.log(res.errors.length ? `FEHLER: ${res.errors.length}` : `OK (${res.warnings.length} Warnungen)`);
  }
  process.exit(res.errors.length ? 1 : 0);
}
