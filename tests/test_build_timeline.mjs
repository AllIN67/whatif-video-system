// Beat-Sheet → Zeitachse: eine Zeitquelle für Bild, HUD und Ton; Produktionsstandard Stil B (Guide 18).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeline } from '../tools/build_timeline.mjs';
import { validate, checkStandardB } from '../tools/validate_production.mjs';
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

test('Stil B ohne beats.json wird abgelehnt; Referenzniveau als Warnung', () => {
  const tl = buildTimeline(sheet());
  const noBeats = { ...tl };
  delete noBeats.beats;
  assert.match(validate(noBeats, text(), { requireBeats: true }).errors.join('\n'), /beats\.json/);
  assert.equal(validate(noBeats, text()).errors.some((e) => /beats\.json/.test(e)), false);
  // Testfixture liegt unter dem Referenzniveau (5 Bildgrößen, 6 Orte, 1 Ereignis/Beat) → Warnungen, keine Fehler
  const r = validate(tl, text(), { requireBeats: true });
  assert.deepEqual(r.errors, []);
  assert.match(r.warnings.join('\n'), /unter Referenzniveau: Ereignisse pro Beat/);
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

test('Hook-Standard 18.12: Referenzproduktion (Akku-Video) besteht den Einstieg nicht – beabsichtigt', async () => {
  const fs = await import('node:fs');
  const B = JSON.parse(fs.readFileSync(new URL('../productions/what-if-phone-battery-life/beats.json', import.meta.url), 'utf8'));
  const tl = buildTimeline(B);
  const tx = JSON.parse(fs.readFileSync(new URL('../productions/what-if-phone-battery-life/text.en.json', import.meta.url), 'utf8'));
  const r = validate(tl, tx, { requireBeats: true });
  const hookErr = r.errors.filter((e) => e.startsWith('[18.12]'));
  assert.ok(hookErr.some((e) => /keine sichtbare Prämissen-Konsequenz/.test(e)), hookErr.join('\n'));
  assert.ok(r.errors.every((e) => e.startsWith('[18.12]')), r.errors.join('\n'));
});
