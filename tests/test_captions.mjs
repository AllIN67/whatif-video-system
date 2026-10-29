// Wort-für-Wort-Untertitel (Seitenbildung) und Validierung des Profils „voiceover“.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paginate } from '../pipeline/runtime/captions.js';
import { validate } from '../tools/validate_production.mjs';

const U = (display, start, end, extra = {}) => ({ display, start, end, key: false, brk: null, ...extra });

test('paginate: höchstens 3 Wörter, Umbruch am Satzende, Schlüsselbegriff allein', () => {
  const units = [
    U('Right', 0.0, 0.2), U('now', 0.25, 0.45), U('in', 0.5, 0.55), U('New', 0.6, 0.7), U('York,', 0.75, 1.0, { brk: 'clause' }),
    U('at', 1.1, 1.2), U('790 MPH', 1.25, 2.4, { key: true, brk: 'sentence' }),
    U('and', 2.6, 2.7), U('you', 2.75, 2.85), U('feel', 2.9, 3.1), U('it.', 3.15, 3.4, { brk: 'sentence' }),
  ];
  const pages = paginate(units, { maxWords: 3 });
  for (const p of pages) assert.ok(p.units.reduce((a, u) => a + u.display.split(/\s+/).length, 0) <= 3);
  // „at“ (kurz) wird nicht allein gezeigt, sondern vor den Schlüsselbegriff gestellt
  assert.ok(pages.some((p) => p.units.map((u) => u.display).join(' ') === 'at 790 MPH'));
  // keine Seite endet mit einem Funktionswort, wenn es vermeidbar ist
  assert.ok(!pages.some((p) => p.units.length > 1 && /^(in|the|of)$/i.test(p.units.at(-1).display)));
  // Seiten überlappen nicht
  for (let i = 1; i < pages.length; i++) assert.ok(pages[i].in >= pages[i - 1].out - 1e-9);
});

const vo = () => ({
  profile: 'voiceover', fps: 60, duration: 10, seed: 1, pointe: 8, qa: { min_seconds: 5, max_seconds: 12 },
  shots: [{ id: 'a', from: 0, to: 5, camera: { keys: [{ t: 0, pos: [0, 0, 5], look: [0, 0, 0] }] } }, { id: 'b', from: 5, to: 10, camera: { keys: [{ t: 5, pos: [0, 0, 5], look: [0, 0, 0] }] } }],
  events: [{ id: 'x', t: 3, trigger: true }],
  captions: { words: 'voice/words.json', center_y: 0.25, max_words: 3, max_width: 0.7 },
  callouts: [{ id: 'hook', kind: 'title', in: 0, out: 2, y: 0.26 }],
  audio: { voice: { src: 'v.wav', words: 'voice/words.json' } },
});
const text = { lang: 'en', callouts: { hook: { lines: ['Hi'] } } };
const words = { speech_end: 9, units: [U('Hello', 1, 1.5), U('world.', 1.6, 2, { brk: 'sentence' })] };

test('validate voiceover: gültige Produktion ohne Fehler', () => {
  const r = validate(vo(), text, { wordTimes: words });
  assert.deepEqual(r.errors, []);
});

test('validate voiceover: Regelverstöße', () => {
  const bad = (f) => {
    const t = vo();
    f(t);
    return validate(t, text, { wordTimes: words }).errors.join('\n');
  };
  assert.match(bad((t) => (t.duration = 13) && (t.shots[1].to = 13)), /Länge/);
  assert.match(bad((t) => (t.captions.center_y = 0.6)), /oberes Drittel/);
  assert.match(bad((t) => (t.callouts[0].y = 0.85)), /Sicherheitszone/);
  assert.match(bad((t) => (t.callouts[0].id = 'fehlt')), /fehlt in der Textdatei/);
  assert.match(bad((t) => (t.events[0].t = 12)), /spätestens 10 s/);
  assert.match(validate(vo(), text, { wordTimes: null }).errors.join('\n'), /Wortzeiten fehlen/);
  assert.match(validate(vo(), text, { wordTimes: { ...words, speech_end: 9.9 } }).errors.join('\n'), /Luft/);
});
