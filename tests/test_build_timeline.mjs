// Beat-Sheet → Zeitachse: eine Zeitquelle für Bild, HUD und Ton; Produktionsstandard Stil B (Guide 18).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeline } from '../tools/build_timeline.mjs';
import { validate, checkStandardB, checkHookDraft } from '../tools/validate_production.mjs';
import { shotKeys, PRESET_NAMES } from '../pipeline/runtime/kit/camera.js';
import { prepare, hudAt } from '../pipeline/runtime/timeline.js';

const CAMS = [
  { preset: 'push', target: [0, 1.5, 0] },
  { preset: 'low', target: [0, 1.5, 0] },
  { preset: 'close', target: [0, 1.6, 0] },
  { preset: 'high', target: [0, 0, 0] },
  { preset: 'orbit', target: [0, 1.5, 0], dist: 6 },
];
const MOODS = ['neutral', 'worried', 'shock', 'happy', 'sad'];

function sheet(n = 16) {
  return {
    recipe: 'B1',
    fps: 30,
    seed: 3,
    title: { in: 0, out: 3.4 },
    hud: { start: 100 },
    pointe: 'e15',
    hook: { type: 'proof', proof: 'e0', question: 'How long can you last?', stakes: 'Every percent is your life.', withheld: 'The ending at home.' },
    endcard: { beat: 'b15', at: 0.3 },
    audio: { fade_out: 1.2 },
    beats: Array.from({ length: n }, (_, i) => ({
      id: `b${i}`,
      dur: 4,
      place: `p${i % 6}`,
      mood: MOODS[i % MOODS.length],
      transition: i === 0 ? 'cut' : i % 2 ? 'whip' : 'dip',
      camera: CAMS[i % CAMS.length],
      line: `l${i}`,
      hud: { label: i < 8 ? 'battery' : 'critical', to: 100 - (i + 1) * 5, mode: 'steps', steps: 2, window: [0.5, 3.0], tick: 'pop' },
      events: [{ id: `e${i}`, at: 1.0 + (i % 3) * 0.1, sfx: 'thud', flash: i % 4 === 0 ? 'loss' : undefined, trigger: i === 1, ...(i < 4 ? { premise: i % 2 ? 'hud' : 'visible' } : {}) }],
    })),
  };
}
const text = (n = 16) => ({
  lang: 'en',
  title: { text: 'What if your phone battery was your life?', highlight: 'battery' },
  hud: { battery: { label: 'BATTERY', unit: '%' }, critical: { label: 'CRITICAL', unit: '%' } },
  lines: Object.fromEntries(Array.from({ length: n }, (_, i) => [`l${i}`, `This is line number ${i} here.`])),
  endcard: { title: 'Would you survive a day?', sub: 'Part 2?' },
});

test('Kamera-Vorlagen: Keys auf from/to, Bildgröße gesetzt, unbekannte Vorlage wirft', () => {
  for (const p of PRESET_NAMES) {
    const o = { preset: p, target: [0, 1.5, 0], from: 2, to: 6, eye: [0, 1.6, 3], a: [0, 1, 0], b: [4, 1, 0] };
    const r = shotKeys(o);
    assert.equal(r.keys[0].t, 2);
    assert.equal(r.keys[r.keys.length - 1].t, 6);
    assert.ok(r.framing, p);
    for (const k of r.keys) assert.equal(k.pos.length, 3);
  }
  assert.throws(() => shotKeys({ preset: 'zoomzoom', target: [0, 0, 0], from: 0, to: 1 }), /unbekannt/);
});

test('Ereignis, Klang, HUD-Akzent und Wackeln liegen auf demselben Frame', () => {
  const tl = buildTimeline(sheet());
  const ptl = prepare(tl);
  assert.equal(tl.duration, 64);
  for (const e of tl.events) {
    assert.ok(Number.isInteger(Math.round(e.t * 30)) && Math.abs(e.t * 30 - Math.round(e.t * 30)) < 1e-6);
    const s = tl.audio.sfx.find((x) => x.event === e.id);
    assert.equal(s.t, e.t, `Klang zu ${e.id}`);
  }
  const fl = tl.hud.flatMap((h) => h.flashes || []);
  assert.ok(fl.length >= 3);
  for (const f of fl) assert.ok(tl.events.some((e) => e.t === f.t));
  assert.ok(ptl.shots.length === 16);
});

test('Whip-Luftzug: Spitze (0,35 s) liegt auf dem Schnitt', () => {
  const tl = buildTimeline(sheet());
  const whips = tl.shots.filter((s) => s.transition_in?.type === 'whip');
  assert.ok(whips.length > 3);
  for (const s of whips) {
    const w = tl.audio.sfx.find((x) => x.event === `cut:${s.id}`);
    assert.ok(w, `whoosh für ${s.id}`);
    assert.ok(Math.abs(w.t + 0.35 - s.from) <= 1 / 60 + 1e-6, `${w.t} ${s.from}`);
  }
});

test('HUD: Stufen springen genau auf den Keys, Werte stetig über Label-Wechsel', () => {
  const tl = buildTimeline(sheet());
  const ptl = prepare(tl);
  assert.equal(tl.hud.length, 2);
  // Beat 0: Fenster 0,5–3,0 s, 2 Stufen 100 → 95: 97/98 bei 0,5 s, 95 bei 3,0 s
  assert.equal(hudAt(ptl, 0.4).value, 100);
  assert.ok(hudAt(ptl, 0.5).value < 100);
  assert.equal(hudAt(ptl, 3.0).value, 95);
  const tChange = tl.hud[1].from;
  assert.equal(hudAt(ptl, tChange - 1 / 30).value, hudAt(ptl, tChange).value);
  assert.ok(hudAt(ptl, 0).value !== hudAt(ptl, 2).value, 'HUD ändert sich in den ersten 2 s');
});

test('Erzeugte Zeitachse besteht die Validierung inkl. Standard B', () => {
  const tl = buildTimeline(sheet());
  const r = validate(tl, text());
  assert.deepEqual(r.errors, []);
});

test('Standard B erkennt Kamera-Wiederholung, Beat ohne Ereignis, zu lange Beats, starren HUD, versetzten Klang', () => {
  const run = (mut) => {
    const B = sheet();
    mut(B);
    const tl = buildTimeline(B);
    return validate(tl, text()).errors.join('\n');
  };
  assert.match(run((B) => (B.beats[3].camera = B.beats[2].camera)), /gleiche Kamera/);
  assert.match(run((B) => (B.beats[5].events = [])), /kein Ereignis/);
  assert.match(run((B) => { B.beats[6].dur = 7; B.beats[7].dur = 1; B.beats[7].events[0].at = 0.5; B.beats[7].hud.window = [0.2, 0.8]; }), /max\. 6/);
  assert.match(run((B) => B.beats.forEach((b, i) => { if (i > 0) delete b.hud.to; if (i > 0) b.hud.label = b.hud.label; })), /HUD ändert sich nur/);
  assert.match(run((B) => B.beats.forEach((b) => (b.mood = 'neutral'))), /Gefühle/);
  const tl = buildTimeline(sheet());
  tl.audio.sfx.find((s) => s.event === 'e4').t += 0.1;
  const errs = [];
  checkStandardB(tl, prepare(tl), (r, m) => errs.push(m), () => {});
  assert.match(errs.join('\n'), /liegt nicht auf/);
});

test('Stil B ohne beats.json wird abgelehnt; technische Mindestwerte [18.11] als Warnung', () => {
  const tl = buildTimeline(sheet());
  const noBeats = { ...tl };
  delete noBeats.beats;
  assert.match(validate(noBeats, text(), { requireBeats: true }).errors.join('\n'), /beats\.json/);
  assert.equal(validate(noBeats, text()).errors.some((e) => /beats\.json/.test(e)), false);
  // Testfixture liegt unter den technischen Mindestwerten (5 Bildgrößen, 6 Orte, 1 Ereignis/Beat) → Warnungen, keine Fehler
  const r = validate(tl, text(), { requireBeats: true });
  assert.deepEqual(r.errors, []);
  assert.match(r.warnings.join('\n'), /unter technischem Mindestwert: Ereignisse pro Beat/);
});

test('Hook-Standard 18.12: schwacher Einstieg wird erkannt, Hook-Typen nicht schablonenhaft', () => {
  const run = (mut) => {
    const B = sheet();
    mut(B);
    return validate(buildTimeline(B), text());
  };
  const errs = (mut) => run(mut).errors.join('\n');
  const warns = (mut) => run(mut).warnings.join('\n');
  assert.deepEqual(run(() => {}).errors, []);
  assert.match(errs((B) => delete B.hook), /hook fehlt/);
  assert.match(errs((B) => delete B.hook.question), /hook\.question fehlt/);
  assert.match(errs((B) => (B.hook.type = 'intro')), /unbekannt/);
  // Akku-Video-Muster: Auslöser ist nur ein HUD-Abzug → kein Beweis im Bild
  assert.match(errs((B) => (B.beats[0].events[0].premise = 'hud')), /keine sichtbare Prämissen-Konsequenz/);
  // Beweis zu spät für Typ proof, aber zulässig für mystery (R20: Geheimnis ab Frame 0, Schlag später)
  const late = (B) => { B.hook.proof = 'e1'; B.beats[1].events[0].premise = 'visible'; };
  assert.match(errs(late), /Hook-Typ proof: ≤ 2 s/);
  assert.equal(/Beweis-Ereignis/.test(errs((B) => { late(B); B.hook.type = 'mystery'; })), false);
  // nur Zahlenabzüge bis 15 s
  assert.match(errs((B) => { B.beats[2].events[0].premise = 'hud'; }), /im Bild sichtbare Prämissen-Konsequenzen/);
  // Füllstoff: Alltagsereignisse ohne Prämissenbezug im Hook-Fenster
  const filler = (B) => { B.beats[1].events.push({ id: 'toast', at: 2.0, what: 'Toast verbrennt' }, { id: 'bus', at: 2.6, what: 'Bus fährt ab' }); delete B.beats[3].events[0].premise; };
  const w = warns(filler);
  assert.match(w, /ohne Prämissenbezug \(.*toast.*bus/);
  assert.match(w, /Beat b3 .* ohne Prämissen-Ereignis/);
  // Pointe im Hook-Fenster verrät das Ende
  assert.match(errs((B) => (B.pointe = 'e2')), /Pointe .* im Hook-Fenster/);
});

test('Hook-Standard 18.12: Regressionstest Akku-Video (veraltet, Guide 18.11 Stufe 4) besteht den Einstieg nicht – beabsichtigt', async () => {
  const fs = await import('node:fs');
  const B = JSON.parse(fs.readFileSync(new URL('../productions/what-if-phone-battery-life/beats.json', import.meta.url), 'utf8'));
  const tl = buildTimeline(B);
  const tx = JSON.parse(fs.readFileSync(new URL('../productions/what-if-phone-battery-life/text.en.json', import.meta.url), 'utf8'));
  const r = validate(tl, tx, { requireBeats: true });
  const hookErr = r.errors.filter((e) => e.startsWith('[18.12]'));
  assert.ok(hookErr.some((e) => /keine sichtbare Prämissen-Konsequenz/.test(e)), hookErr.join('\n'));
  assert.ok(r.errors.every((e) => e.startsWith('[18.12]')), r.errors.join('\n'));
});

// Positivtests: vier verschiedene Hook-Typen (R19 Beweis, R07 Prozess, R06/R15 Countdown, R20 Geheimnis) bestehen –
// der Standard ist keine Akku-Schablone. Negativtests: typische schwache Einstiege.
function hookSheet({ type, proofAt, events }) {
  const B = sheet();
  B.hook = { type, proof: 'proof', question: 'Q?', stakes: 'S', withheld: 'W' };
  B.beats.forEach((b) => (b.events = [{ id: `e${b.id.slice(1)}`, at: 1.0, sfx: 'thud' }]));
  B.beats[0].events = [{ id: 'proof', at: proofAt, sfx: 'crash', premise: 'visible', trigger: true }];
  for (const [beat, id, at, premise] of events) B.beats[beat].events.push({ id, at, sfx: 'pop', ...(premise ? { premise } : {}) });
  B.pointe = 'e15';
  return B;
}
const hookErrors = (B) => validate(buildTimeline(B), text()).errors.filter((e) => e.startsWith('[18.12]'));
const hookWarnings = (B) => validate(buildTimeline(B), text()).warnings.filter((e) => e.startsWith('[18.12]'));
const STRONG = [[1, 'p1', 0.5, 'visible'], [2, 'p2', 0.5, 'visible'], [3, 'p3', 0.5, 'hud']];

test('18.12 positiv: Beweis (R19), Prozess (R07), Countdown (R06), Geheimnis (R20) bestehen ohne Hook-Fehler', () => {
  for (const [type, proofAt] of [['proof', 1.3], ['process', 0.1], ['countdown', 3.5], ['mystery', 3.9]]) {
    const B = hookSheet({ type, proofAt, events: STRONG });
    // Prämissen-Ereignis in jedem Beat des Hook-Fensters
    B.beats[0].events.push({ id: 'react', at: 2.5, premise: 'visible' });
    assert.deepEqual(hookErrors(B), [], type);
    assert.deepEqual(hookWarnings(B).filter((w) => !/ohne Prämissenbezug/.test(w)), [], type);
  }
});

test('18.12 negativ: Alltagseinstieg, Erklärung statt Beweis, zu später Beweis, Zahl statt Bild, Füllstoff', () => {
  // Aufwachen/Alltag ohne Prämisse bis 15 s → Beweis fehlt, zu wenige Prämissen-Ereignisse
  const daily = hookSheet({ type: 'proof', proofAt: 1.0, events: [] });
  daily.beats[0].events[0].premise = undefined;
  const e1 = hookErrors(daily).join('\n');
  assert.match(e1, /keine sichtbare Prämissen-Konsequenz/);
  assert.match(e1, /Prämissen-Ereignisse bis 15 s/);
  // Beweis erst nach 6 s bei Typ proof
  assert.match(hookErrors(hookSheet({ type: 'proof', proofAt: 1.0, events: STRONG })).join(''), /^$/);
  const late = hookSheet({ type: 'proof', proofAt: 3.9, events: STRONG });
  late.beats[0].dur = 4.0;
  assert.match(hookErrors(late).join('\n'), /≤ 2 s/);
  // nur HUD-Abzüge
  const hudOnly = hookSheet({ type: 'process', proofAt: 0.5, events: STRONG.map(([b, id, at]) => [b, id, at, 'hud']) });
  assert.match(hookErrors(hudOnly).join('\n'), /im Bild sichtbare/);
  // Füllstoff (Toast, Bus, Keuchen) zwischen den Prämissen-Ereignissen
  const filler = hookSheet({ type: 'proof', proofAt: 1.0, events: [...STRONG, [1, 'toast', 2.0], [2, 'bus', 2.0], [2, 'gasp', 3.0]] });
  assert.match(hookWarnings(filler).join('\n'), /ohne Prämissenbezug \(.*toast.*bus.*gasp/);
  // Lücke > 5 s ohne neue Konsequenz
  const gap = hookSheet({ type: 'proof', proofAt: 1.0, events: [[1, 'p1', 0.5, 'visible'], [3, 'p3', 1.5, 'visible']] });
  assert.match(hookWarnings(gap).join('\n'), /keine neue Prämissen-Konsequenz zwischen/);
});

test('18.12 Grenze (dokumentiert): falsche Selbstauskunft „visible“ wird NICHT erkannt', () => {
  // Akku-Muster, aber jedes Ereignis fälschlich als sichtbar markiert → Validator ohne Hook-Fehler.
  // Deshalb ist die Sichtprüfung H (quality_review.md) Pflicht; der Validator beurteilt keine Bilder.
  const B = hookSheet({ type: 'proof', proofAt: 1.5, events: [[1, 'swipe', 0.7, 'visible'], [2, 'toast', 1.0, 'visible'], [3, 'bus', 0.5, 'visible']] });
  assert.deepEqual(hookErrors(B), []);
});

test('18.12 Hook-Entwurf im LOG: drei ausgefüllte Ansätze + Wahl', () => {
  const W = [];
  const w = (r, m) => W.push(m);
  checkHookDraft(null, w);
  checkHookDraft('# LOG\n', w);
  checkHookDraft('### Hook-Entwurf\n| 1 | proof | a | b | c | d | ja |\n| 2 | | | | | | |\n', w);
  assert.equal(W.length, 4);
  W.length = 0;
  checkHookDraft('### Hook-Entwurf\n| 1 | proof | a | b | c | d | ja |\n| 2 | process | a | b | c | d | nein |\n| 3 | mystery | a | b | c | d | teils |\n- Gewählt: # 1 – weil\n', w);
  assert.deepEqual(W, []);
});
