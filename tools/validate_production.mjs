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

export function validate(timeline, text, { lang = 'en', wordTimes = null, requireBeats = false } = {}) {
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

  // HUD-Akzente gehören in ihr Segment (6.5)
  for (const [i, s] of hud.entries()) {
    const segEnd = i + 1 < hud.length ? hud[i + 1].from : dur;
    for (const f of s.flashes || []) {
      if (!['loss', 'gain', 'warn'].includes(f.kind)) E('6.3', `HUD „${s.id}“: Akzent „${f.kind}“ unbekannt (loss, gain, warn)`);
      if (f.t < s.from || f.t >= segEnd) E('6.5', `HUD „${s.id}“: Akzent bei ${f.t} s außerhalb des Segments ${s.from}–${segEnd} s`);
    }
  }
  // Endkarte (7.4): Text aus der Textdatei, ≤ 10 Wörter
  if (timeline.endcard) {
    const et = text.endcard?.title;
    if (!et) E('1.3', `Endkarte: endcard.title fehlt in text.${lang}.json`);
    else if (words(et) > 10) E('4', `Endkarte: ${words(et)} Wörter (max. 10)`);
    if (timeline.endcard.in >= dur) E('7.4', 'Endkarte beginnt nach Videoende');
  }

  // Produktionsstandard Stil B (Abschnitt 18) – nur für Zeitachsen aus beats.json (tools/build_timeline.mjs)
  if (timeline.beats) {
    checkStandardB(timeline, ptl, E, W);
    checkHook(timeline, E, W);
    checkStory(timeline, text, W);
  }
  else if (requireBeats) E('18.1', 'timeline.json ist nicht aus beats.json erzeugt – Stil-B-Produktionen brauchen productions/<slug>/beats.json (node tools/build_timeline.mjs)');

  return { errors, warnings };
}

// Messbare Regeln aus der Referenzanalyse R07/R19/R20 (Guide 18). Ziel: Monotonie, Kamera-Wiederholung,
// stillstehende HUDs und unsynchronen Ton schon VOR dem Rendern verhindern.
export const STANDARD_B = {
  beatMin: 1.8, // kürzester Beat (s); kürzere nur als Einschub (Reaktion), siehe beatMinInsert
  beatMinInsert: 1.0,
  beatMax: 6.0, // R07/R19: 4,0 s, R20: 1,5–5 s
  medianRange: [2.5, 4.6],
  minFramings: 4,
  maxFramingShare: 0.45,
  minPlacesB1: 5,
  minMoods: 4,
  minHudChangeShare: 0.7,
};

// Referenzniveau = vom Nutzer abgenommenes Testvideo productions/what-if-phone-battery-life (2026-10-30, Guide 18.11).
// Unterschreitung ist kein Fehler, aber eine Warnung, die im LOG begründet werden muss (nicht ohne Grund zurückfallen).
export const REFERENCE_B = {
  eventsPerBeat: 1.5, // Referenz 1,53
  framings: 6, // close, medium, wide, low, high, pov
  presets: 6, // Referenz 7
  moods: 6, // Referenz 8
  places: 6, // Referenz 7
  hudChangeShare: 1.0, // Referenz: HUD ändert sich in jedem Beat
  sfxEventShare: 0.9, // Referenz: alle Ereignisse mit Klang
  flashesPerBeat: 0.5, // Referenz 11 Akzente / 17 Beats
  hudLabels: 4, // Referenz 5 Segmente / 4 Labels
};

export function checkStandardB(timeline, ptl, E, W) {
  const S = STANDARD_B;
  const beats = timeline.beats;
  const r2 = (x) => Math.round(x * 100) / 100;
  const lens = beats.map((b) => b.to - b.from);
  const sorted = [...lens].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  beats.forEach((b, i) => {
    const L = lens[i];
    if (L > S.beatMax + 1e-9) E('18.2', `Beat ${b.id}: ${r2(L)} s (max. ${S.beatMax} s – Referenzen wechseln alle 2–4 s)`);
    if (L < S.beatMinInsert - 1e-9) E('18.2', `Beat ${b.id}: ${r2(L)} s (min. ${S.beatMinInsert} s)`);
    else if (L < S.beatMin - 1e-9) W('18.2', `Beat ${b.id}: ${r2(L)} s – nur als Reaktions-Einschub sinnvoll`);
  });
  if (median < S.medianRange[0] || median > S.medianRange[1]) W('18.2', `Median-Beatlänge ${r2(median)} s außerhalb ${S.medianRange.join('–')} s`);

  // Kamera-Abwechslung (18.3)
  for (let i = 1; i < beats.length; i++) {
    const a = beats[i - 1];
    const b = beats[i];
    if (a.framing === b.framing && a.preset === b.preset) E('18.3', `Beats ${a.id} → ${b.id}: gleiche Kamera (${b.preset}/${b.framing}) zweimal hintereinander`);
  }
  // Whip aus Innenräumen dreht die Kamera in eine Wand (Testvideo 2026-10-30: 2-Frame-Flächen, QA-FAIL)
  const INTERIOR = new Set(['bedroom', 'kitchen', 'cafe', 'office', 'classroom']);
  ptl.shots.forEach((s, i) => {
    if (i > 0 && s.transition.type === 'whip' && INTERIOR.has(beats[i - 1]?.place)) W('18.3', `Whip von ${beats[i - 1].id} (Innenraum ${beats[i - 1].place}) – Abblende verwenden`);
  });
  const counts = {};
  for (const b of beats) counts[b.framing] = (counts[b.framing] || 0) + 1;
  const nF = Object.keys(counts).length;
  if (nF < S.minFramings) E('18.3', `nur ${nF} Bildgrößen (${Object.keys(counts).join(', ')}) – mindestens ${S.minFramings} (close, medium, wide, low, high, pov)`);
  for (const [k, n] of Object.entries(counts)) if (n / beats.length > S.maxFramingShare) W('18.3', `Bildgröße „${k}“ in ${n}/${beats.length} Beats (max. ${S.maxFramingShare * 100} %)`);

  // Orte, Gefühle (18.4)
  const places = new Set(beats.map((b) => b.place).filter(Boolean));
  if (timeline.recipe === 'B1' && places.size < S.minPlacesB1) E('18.4', `nur ${places.size} Orte (Rezept B1: ≥ ${S.minPlacesB1})`);
  const moods = new Set(beats.map((b) => b.mood).filter(Boolean));
  if (moods.size < S.minMoods) E('18.4', `nur ${moods.size} Gefühle der Hauptfigur (${[...moods].join(', ')}) – mindestens ${S.minMoods}, sichtbare Entwicklung`);
  for (const b of beats) if (!b.mood) W('18.4', `Beat ${b.id}: kein Gefühl (mood) der Hauptfigur angegeben`);

  // Jeder Beat hat ein sichtbares Ereignis (18.2) – R07/R19: jede 4-s-Szene enthält eine Aktion
  const evByBeat = {};
  for (const e of timeline.events || []) (evByBeat[e.beat] ||= []).push(e);
  for (const b of beats) if (!evByBeat[b.id]?.length) E('18.2', `Beat ${b.id}: kein Ereignis – jede Einstellung braucht eine sichtbare Aktion`);

  // HUD verändert sich in den meisten Beats (18.5)
  const hudShare = beats.filter((b) => b.hud_change).length / beats.length;
  if (hudShare < S.minHudChangeShare) E('18.5', `HUD ändert sich nur in ${Math.round(hudShare * 100)} % der Beats (min. ${S.minHudChangeShare * 100} %)`);

  // Ton (18.6): jedes Ereignis mit sfx hat einen Klang genau auf seinem Frame; Akzente/Auslöser brauchen Klang
  const sfx = timeline.audio?.sfx || [];
  const fps = ptl.fps;
  for (const e of timeline.events || []) {
    for (const name of e.sfx || []) {
      if (!sfx.some((s) => s.src === `gen:${name}` && Math.abs(s.t - e.t) < 0.5 / fps)) E('18.6', `Ereignis ${e.id}: Klang ${name} liegt nicht auf ${e.t} s`);
    }
    if ((e.flash || e.trigger) && !(e.sfx || []).length) W('18.6', `Ereignis ${e.id} (${e.flash ? 'HUD-Akzent' : 'Auslöser'}) ohne Klang`);
  }
  const keyEvents = (timeline.events || []).filter((e) => (e.sfx || []).length);
  if (keyEvents.length < beats.length * 0.6) W('18.6', `nur ${keyEvents.length} Ereignisse mit Klang bei ${beats.length} Beats`);
  // Wiederholung desselben Klangs direkt hintereinander (≥ 4×) wirkt mechanisch
  const evSfx = sfx.filter((s) => s.event && s.event !== 'hud_step' && !String(s.event).startsWith('cut:')).map((s) => s.src);
  for (let i = 3; i < evSfx.length; i++) if (evSfx[i] === evSfx[i - 1] && evSfx[i] === evSfx[i - 2] && evSfx[i] === evSfx[i - 3]) W('18.6', `Klang ${evSfx[i]} viermal hintereinander`);

  // Ende (18.7): Endkarte oder Frage an den Zuschauer
  if (!timeline.endcard) W('18.7', 'keine Endkarte (Frage an den Zuschauer / „Part 2?“)');

  // Referenzniveau (18.11): Werte des abgenommenen Testvideos; Unterschreitung im LOG begründen
  const R = REFERENCE_B;
  const ev = timeline.events || [];
  const under = (what, have, want) => W('18.11', `unter Referenzniveau: ${what} ${have} (Referenz ≥ ${want}) – im LOG begründen`);
  const epb = Math.round((ev.length / beats.length) * 100) / 100;
  if (epb < R.eventsPerBeat) under('Ereignisse pro Beat', epb, R.eventsPerBeat);
  if (nF < R.framings) under('Bildgrößen', nF, R.framings);
  const nP = new Set(beats.map((b) => b.preset)).size;
  if (nP < R.presets) under('Kamera-Vorlagen', nP, R.presets);
  if (moods.size < R.moods) under('Gefühle', moods.size, R.moods);
  if (places.size < R.places) under('Orte', places.size, R.places);
  if (hudShare < R.hudChangeShare) under('Anteil Beats mit HUD-Änderung', Math.round(hudShare * 100) / 100, R.hudChangeShare);
  const sfxShare = ev.length ? ev.filter((e) => (e.sfx || []).length).length / ev.length : 0;
  if (sfxShare < R.sfxEventShare) under('Anteil Ereignisse mit Klang', Math.round(sfxShare * 100) / 100, R.sfxEventShare);
  const fl = (timeline.hud || []).reduce((n, h) => n + (h.flashes || []).length, 0);
  if (fl / beats.length < R.flashesPerBeat) under('HUD-Akzente pro Beat', Math.round((fl / beats.length) * 100) / 100, R.flashesPerBeat);
  const labels = new Set((timeline.hud || []).map((h) => h.id)).size;
  if (labels < R.hudLabels) under('HUD-Labels', labels, R.hudLabels);
}

// Hook-Standard (Guide 18.12): Der Einstieg muss die Prämisse VORFÜHREN. Geprüft wird, was das Beat-Sheet erklärt
// (hook-Block, events[].premise); ob eine „visible“-Angabe stimmt, prüft QA H3 am Vorschaubild.
// Anlass: Akku-Video – Auslöser war ein HUD-Abzug von 1 %, bis 14 s nur Zahlenabzüge und Alltagsereignisse (REFERENCE_ANALYSIS 10).
export const HOOK = {
  window: 15, // s – Hook-Fenster (Analytics: ≈ 50 % Abgang bis 14 s)
  // flashforward (EXPERIMENT 2026-11-01, Referenz V4 „lightning“): Frame 0 zeigt den Höhepunkt (nicht die Pointe), dann Rücksprung.
  types: ['proof', 'process', 'countdown', 'mystery', 'flashforward'],
  proofMax: { proof: 2.0, process: 2.0, countdown: 10, mystery: 10, flashforward: 2.0 },
  minPremise: 3, // Prämissen-Ereignisse bis 15 s
  minVisible: 2, // davon im Bild
  maxGap: 5, // s zwischen zwei Prämissen-Ereignissen (ab dem Beweis)
  maxFillerShare: 1 / 3,
};

export function checkHook(timeline, E, W) {
  const H = HOOK;
  const r2 = (x) => Math.round(x * 100) / 100;
  const hk = timeline.hook;
  const events = timeline.events || [];
  if (!hk) {
    E('18.12', 'hook fehlt in beats.json (type, proof, question, stakes, withheld) – Einstieg nach Guide 18.12 entwerfen');
    return;
  }
  if (!H.types.includes(hk.type)) E('18.12', `hook.type „${hk.type}“ unbekannt (${H.types.join(', ')})`);
  for (const k of ['question', 'stakes', 'withheld']) if (!String(hk[k] || '').trim()) E('18.12', `hook.${k} fehlt`);
  const proof = events.find((e) => e.id === hk.proof);
  if (!proof) E('18.12', `hook.proof „${hk.proof}“ ist kein Ereignis`);
  else {
    const max = H.proofMax[hk.type] ?? 2;
    if (proof.premise !== 'visible') E('18.12', `Beweis-Ereignis ${proof.id} ist keine sichtbare Prämissen-Konsequenz (premise: "visible") – Unmöglichkeitstest: würde das Bild ohne Prämisse genauso aussehen?`);
    if (proof.t > max + 1e-9) E('18.12', `Beweis-Ereignis ${proof.id} bei ${proof.t} s (Hook-Typ ${hk.type}: ≤ ${max} s)`);
    if (!(proof.sfx || []).length) W('18.12', `Beweis-Ereignis ${proof.id} ohne Klang`);
  }
  const inWin = events.filter((e) => e.t < H.window);
  const prem = inWin.filter((e) => e.premise === 'visible' || e.premise === 'hud');
  const vis = prem.filter((e) => e.premise === 'visible');
  if (prem.length < H.minPremise) E('18.12', `nur ${prem.length} Prämissen-Ereignisse bis ${H.window} s (min. ${H.minPremise})`);
  if (vis.length < H.minVisible) E('18.12', `nur ${vis.length} im Bild sichtbare Prämissen-Konsequenzen bis ${H.window} s (min. ${H.minVisible}; HUD-Abzüge allein zeigen die Prämisse nicht)`);
  const start = proof ? proof.t : 0;
  const pts = [start, ...prem.map((e) => e.t).filter((t) => t > start), H.window].sort((a, b) => a - b);
  for (let i = 1; i < pts.length; i++) if (pts[i] - pts[i - 1] > H.maxGap + 1e-9) W('18.12', `keine neue Prämissen-Konsequenz zwischen ${r2(pts[i - 1])} s und ${r2(pts[i])} s (> ${H.maxGap} s)`);
  const filler = inWin.filter((e) => !e.premise);
  if (inWin.length && filler.length / inWin.length > H.maxFillerShare + 1e-9) {
    W('18.12', `${filler.length} von ${inWin.length} Ereignissen bis ${H.window} s ohne Prämissenbezug (${filler.map((e) => e.id).join(', ')}) – Füllstoff streichen oder zur Prämissen-Konsequenz machen`);
  }
  for (const b of timeline.beats || []) {
    if (b.from >= H.window) continue;
    if (!prem.some((e) => e.beat === b.id)) W('18.12', `Beat ${b.id} (${r2(b.from)} s) im Hook-Fenster ohne Prämissen-Ereignis`);
  }
  // Nichts vorwegnehmen (H8): Pointe und letztes HUD-Label nicht vor 15 s
  if (timeline.pointe != null && timeline.pointe < H.window) E('18.12', `Pointe bei ${timeline.pointe} s liegt im Hook-Fenster`);
  const hud = timeline.hud || [];
  if (hud.length > 1) {
    const last = hud[hud.length - 1].id;
    const early = hud.find((h) => h.id === last && h.from < H.window);
    if (early) W('18.12', `End-Label „${last}“ erscheint schon bei ${early.from} s – verrät den Endzustand`);
  }
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

// Version 3.0 – Story-Kern, Ursachen, Akte (Guide 18.13). Nur Warnungen: die Regeln beruhen auf einer Analyse von 6 Videos
// (VERSION_3_0_CONSOLIDATED_REVIEW.md) und sind Produktionsregeln, keine belegten Reichweiten-Ursachen. Geprüft wird nur
// Vorhandensein/Struktur; ob die Ursache OHNE TEXT lesbar ist, entscheidet die Sichtprüfung (quality_review.md C10).
export const STORY = { titleMaxWords: 7, minActs: 2, setupMinLead: 3.0, quietBeforePointe: [3.0, 0.5], showpieces: ['mass', 'vista', 'glow'] };
export function checkStory(timeline, text, W) {
  if (!timeline.story && !timeline.hook) return; // Produktionen vor 2.2 (ohne Hook-Feld) nicht nachträglich bewerten
  const S = STORY;
  const r2 = (x) => Math.round(x * 100) / 100;
  const st = timeline.story;
  const events = timeline.events || [];
  if (!st) W('18.13', 'story fehlt in beats.json (stake, measure, question, turn) – Story-Kern vor dem Beat-Sheet festlegen');
  else {
    for (const k of ['stake', 'measure', 'question']) if (!String(st[k] || '').trim()) W('18.13', `story.${k} fehlt`);
    if (!st.turn) W('18.13', 'story.turn fehlt (Ereignis-ID der Wende)');
    else {
      const tv = events.find((e) => e.id === st.turn);
      if (!tv) W('18.13', `story.turn „${st.turn}“ ist kein Ereignis`);
      else if (timeline.pointe != null && tv.t >= timeline.pointe) W('18.13', `Wende ${st.turn} (${tv.t} s) liegt nicht vor der Pointe (${timeline.pointe} s)`);
    }
  }
  // Pointe braucht eine früher gezeigte Ursache (A2: Rettung unlesbar, Pointe „the driver you saved“ ohne Bezug)
  if (timeline.pointe_id) {
    const setups = events.filter((e) => e.setup_for === timeline.pointe_id);
    if (!setups.length) W('18.13', `keine Ursache für die Pointe markiert (events[].setup_for = "${timeline.pointe_id}") – Aufbau → Auszahlung sichtbar machen`);
    for (const e of setups) {
      if (e.t > timeline.pointe - S.setupMinLead) W('18.13', `Ursache ${e.id} (${e.t} s) liegt weniger als ${S.setupMinLead} s vor der Pointe – zu spät, um als Vorbereitung zu wirken`);
      if (e.premise !== 'visible') W('18.13', `Ursache ${e.id} ist nicht als sichtbar markiert (premise: "visible") – Ursachen müssen im Bild lesbar sein`);
    }
  }
  // Akte: je Akt ein geprüfter Wissensanker und ein Schauwert-Bild
  const beats = timeline.beats || [];
  const acts = [...new Set(beats.filter((b) => b.act != null).map((b) => b.act))];
  if (!acts.length) W('18.13', 'Akte nicht markiert (beats[].act) – Wissensanker/Schauwert je Akt nicht prüfbar');
  else {
    if (acts.length < S.minActs) W('18.13', `nur ${acts.length} Akt(e) markiert (min. ${S.minActs})`);
    for (const a of acts) {
      const bs = beats.filter((b) => b.act === a);
      const facts = bs.filter((b) => b.fact);
      if (!facts.length) W('18.13', `Akt ${a}: kein Wissensanker (beats[].fact { text, source })`);
      for (const b of facts) if (!String(b.fact.source || '').trim()) W('18.13', `Beat ${b.id}: Wissensanker ohne Quelle (fact.source)`);
      const sp = bs.filter((b) => b.showpiece);
      if (!sp.length) W('18.13', `Akt ${a}: kein Schauwert-Bild (beats[].showpiece: ${S.showpieces.join(' | ')})`);
      for (const b of sp) if (!S.showpieces.includes(b.showpiece)) W('18.13', `Beat ${b.id}: showpiece „${b.showpiece}“ unbekannt (${S.showpieces.join(', ')})`);
    }
  }
  // Ruhe vor der Pointe (Ton als Dramaturgie): Abschnitt silence/calm, der kurz vor der Pointe endet oder sie überdeckt
  const secs = timeline.audio?.music?.main?.sections;
  if (secs && timeline.pointe != null) {
    const [pre, post] = S.quietBeforePointe;
    const p = timeline.pointe;
    const quiet = secs.some((x) => ['silence', 'calm'].includes(x.style) && x.to >= p - pre && x.from <= p + post);
    if (!quiet) W('18.13', `keine Ruhe (silence/calm) im Bereich ${r2(p - pre)}–${r2(p + post)} s vor der Pointe – Musik an die Dramaturgie koppeln`);
  }
  // Titel kurz (C-Referenzen 6–7 Wörter, 2 Zeilen)
  const title = text?.title?.text;
  if (title && title.trim().split(/\s+/).length > S.titleMaxWords) W('18.13', `Titel hat ${title.trim().split(/\s+/).length} Wörter (empfohlen ≤ ${S.titleMaxWords})`);
}

// Hook-Entwurf (18.12 H10) liegt nicht im Beat-Sheet, sondern im LOG. Nur über die Kommandozeile geprüft (Datei-basiert):
// drei ausgefüllte Zeilen der Tabelle „Hook-Entwurf“ und eine Wahl. Prüft Vorhandensein, nicht Qualität.
export function checkHookDraft(logText, W) {
  if (logText == null) return W('18.12', 'LOG.md fehlt – Hook-Entwurf (3 Ansätze) nicht dokumentiert');
  const i = logText.indexOf('Hook-Entwurf');
  if (i < 0) return W('18.12', 'LOG.md: Abschnitt „Hook-Entwurf“ fehlt (3 Ansätze, Guide 18.12 H10)');
  const rows = logText.slice(i).split('\n').filter((l) => /^\|\s*[123]\s*\|/.test(l));
  const filled = rows.filter((l) => l.split('|').slice(2, -1).filter((c) => c.trim()).length >= 4);
  if (filled.length < 3) W('18.12', `LOG.md: nur ${filled.length} von 3 Hook-Ansätzen ausgefüllt`);
  if (!/Gewählt:\s*#\s*\d/.test(logText.slice(i))) W('18.12', 'LOG.md: Wahl des Hook-Ansatzes („Gewählt: # …“) fehlt');
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
  // Stil B (alles außer Profil voiceover und technischen Test-Clips productions/_… / tests/…) braucht beats.json
  const rel = path.relative(process.cwd(), path.resolve(dir)).split(path.sep);
  const technical = rel[0] === 'tests' || (rel[0] === 'productions' && (rel[1] || '').startsWith('_'));
  const requireBeats = tl.profile !== 'voiceover' && !technical;
  const res = validate(tl, tx, { lang, wordTimes: loadWords(dir, tl), requireBeats });
  if (tl.beats && requireBeats) {
    const lf = path.join(dir, 'LOG.md');
    checkHookDraft(fs.existsSync(lf) ? fs.readFileSync(lf, 'utf8') : null, (r, m) => res.warnings.push(`[${r}] ${m}`));
  }
  if (args.includes('--json')) console.log(JSON.stringify(res, null, 1));
  else {
    for (const e of res.errors) console.log(`❌ ${e}`);
    for (const w of res.warnings) console.log(`⚠️  ${w}`);
    console.log(res.errors.length ? `FEHLER: ${res.errors.length}` : `OK (${res.warnings.length} Warnungen)`);
    if (tl.beats) console.log(`Hook-Sichtprüfung (Pflicht, quality_review.md H – der Validator ersetzt sie nicht):\n  node tools/still.mjs --production ${dir} --at 0,0.5,1,2,3,5,8,12,15`);
  }
  process.exit(res.errors.length ? 1 : 0);
}
