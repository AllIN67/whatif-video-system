// Stufe 5: Validierung vor dem Rendern – gültiges Beispiel + gezielte Regelverstöße.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from '../tools/validate_production.mjs';

const cam = (t) => ({ t, pos: [0, 1.6, 10], look: [0, 1.6, 0], fov: 50 });

function valid() {
  const shots = [];
  const bounds = [0, 5, 10, 15, 20, 26, 32, 38, 44, 50, 56, 62];
  for (let i = 0; i < bounds.length - 1; i++) {
    shots.push({ id: `s${i}`, from: bounds[i], to: bounds[i + 1], transition_in: { type: i === 0 ? 'cut' : 'dip', frames: i === 0 ? 0 : 4 }, camera: { keys: [cam(bounds[i]), cam(bounds[i + 1])] } });
  }
  const lines = [];
  const text = {};
  for (let i = 0; i < 14; i++) {
    const id = `l${String(i + 1).padStart(2, '0')}`;
    lines.push({ id, in: 4 + i * 4, out: 4 + i * 4 + 3 });
    text[id] = 'This line has exactly six words.';
  }
  return {
    timeline: {
      fps: 30, duration: 62, seed: 3, pointe: 58,
      title: { in: 0, out: 3.5 },
      hud: [
        { id: 'a', from: 0, value: { keys: [[0, 100], [20, 0]] } },
        { id: 'b', from: 20, value: { keys: [[20, 0], [40, 50]] } },
        { id: 'c', from: 40, value: { keys: [[40, 0], [62, 1]] }, final: { at: 58 } },
      ],
      lines, shots,
      events: [{ t: 8, id: 'impact', trigger: true }],
    },
    text: {
      lang: 'en',
      title: { text: 'What if the sky turned off?', highlight: 'sky' },
      hud: { a: { label: 'A' }, b: { label: 'B' }, c: { label: 'C', final: 'HERE' } },
      lines: text,
    },
  };
}

const run = (mut) => {
  const v = valid();
  mut(v);
  return validate(v.timeline, v.text);
};
const hasErr = (res, re) => res.errors.some((e) => re.test(e));

test('gültige Produktion: keine Fehler', () => {
  const r = run(() => {});
  assert.deepEqual(r.errors, []);
});

test('Regelverstöße werden einzeln erkannt', () => {
  const cases = [
    [(v) => { v.timeline.duration = 90; v.timeline.shots.at(-1).to = 90; }, /Länge 90/],
    [(v) => { v.timeline.qa = { min_seconds: 40 }; }, /Mindestlänge 60 s/],
    [(v) => { v.timeline.duration = 45; v.timeline.shots = v.timeline.shots.filter((x) => x.from < 45); v.timeline.shots.at(-1).to = 45; v.timeline.pointe = 42; v.timeline.lines = v.timeline.lines.filter((l) => l.out <= 45); v.timeline.hud[2].value.keys = [[40, 0], [45, 1]]; v.timeline.hud[2].final.at = 42; }, /unter der Mindestlänge 60 s/],
    [(v) => { v.text.title.text = 'What if the sky above every single city on our planet turned off?'; }, /Wörter \(max\. 10\)/],
    [(v) => { v.text.title.text = 'The sky turned off.'; v.text.title.highlight = 'sky'; }, /What if|„\?“/],
    [(v) => { v.timeline.title.in = 1; }, /ab Frame 0/],
    [(v) => { v.timeline.hud[0].value.keys = [[0, 100], [3, 100], [20, 0]]; }, /ersten 2 s nicht sichtbar/],
    [(v) => { v.timeline.lines = v.timeline.lines.slice(0, 8); }, /Textzeilen/],
    [(v) => { v.text.lines.l03 = 'Too short.'; }, /l03: 2 Wörter/],
    [(v) => { v.timeline.lines[2].out = v.timeline.lines[2].in + 1.2; }, /l03: 1\.2 s sichtbar/],
    [(v) => { v.timeline.lines[3].in = v.timeline.lines[2].out + 0.1; }, /Pause zwischen l03 und l04/],
    [(v) => { v.timeline.events[0].t = 12; }, /spätestens 10 s/],
    [(v) => { v.timeline.events = []; }, /kein auslösendes Ereignis/],
    [(v) => { v.timeline.pointe = 50; }, /nach der Pointe/],
    [(v) => { v.timeline.seed = undefined; }, /seed/],
    [(v) => { delete v.text.lines.l05; }, /Text-ID „l05“ fehlt/],
    [(v) => { v.timeline.shots[1].to = 8; v.timeline.shots[2].from = 8; v.timeline.shots[1].transition_in = { type: 'flash', frames: 6 }; v.timeline.shots[2].transition_in = { type: 'flash', frames: 6 }; }, /Weißblenden bei 5 s und 8 s/],
    [(v) => { v.timeline.shots[1].transition_in = { type: 'flash', frames: 6 }; v.timeline.shots[2].transition_in = { type: 'flash', frames: 6 }; }, null], // genau 5 s: erlaubt
    [(v) => { // 10 s ohne Änderung
      v.timeline.shots.splice(2, 2, { id: 'long', from: 10, to: 20, transition_in: { type: 'cut' }, camera: { keys: [cam(10), cam(20)] } });
      v.timeline.events = [{ t: 8, id: 'impact', trigger: true }];
    }, /keine Zustandsänderung zwischen 10 s und 20 s/],
    [(v) => { v.timeline.shots[1].from = 5.01; v.timeline.shots[0].to = 5.01; }, /Frame-Grenze/],
  ];
  for (const [mut, re] of cases) {
    const r = run(mut);
    if (re === null) {
      assert.deepEqual(r.errors, [], 'Grenzfall müsste erlaubt sein');
      continue;
    }
    assert.ok(hasErr(r, re), `erwartet Fehler ${re}, erhalten: ${JSON.stringify(r.errors)}`);
  }
});

// Guide 18.14: sprachspezifische Regeln. Deutsch = Standard; Englisch bleibt unverändert prüfbar.
function validDe() {
  const v = valid();
  v.text = {
    lang: 'de',
    number_locale: 'de-DE',
    title: { text: 'Was wäre, wenn der Himmel ausgeht?', highlight: 'Himmel' },
    hud: { a: { label: 'HÖHE' }, b: { label: 'DRUCK' }, c: { label: 'STRASSE', final: 'HIER' } },
    lines: Object.fromEntries(Object.keys(v.text.lines).map((id) => [id, 'Diese Zeile hat genau sechs Wörter.'])),
  };
  return v;
}
const runDe = (mut, opts) => {
  const v = validDe();
  mut(v);
  return validate(v.timeline, v.text, opts);
};

test('Deutsch: gültige Produktion ohne Fehler, Sprache aus text.lang', () => {
  assert.deepEqual(runDe(() => {}).errors, []);
  assert.deepEqual(runDe(() => {}, { lang: 'de' }).errors, []);
  assert.deepEqual(runDe(() => {}).warnings.filter((w) => w.startsWith('[18.14]')), []);
});

test('Deutsch: Titelformel, Zahlenformat, Schriftzeichen, Sprachkennung', () => {
  assert.ok(hasErr(runDe((v) => { v.text.title.text = 'Was, wenn der Himmel ausgeht?'; }), /beginnt nicht mit „Was wäre, wenn“/));
  assert.ok(hasErr(runDe((v) => { v.text.title.text = 'What if the sky turned off?'; v.text.title.highlight = 'sky'; }), /beginnt nicht mit „Was wäre, wenn“/));
  assert.ok(runDe((v) => { delete v.text.number_locale; }).warnings.some((w) => /\[18\.14\].*de-DE/.test(w)));
  assert.ok(runDe((v) => { v.text.number_locale = 'en-US'; }).warnings.some((w) => /\[18\.14\].*de-DE/.test(w)));
  assert.ok(hasErr(runDe((v) => { v.text.hud.c.label = 'STRAẞE'; }), /„ẞ“.*„SS“/));
  assert.equal(hasErr(runDe((v) => { v.text.lines.l01 = 'Im Radio heißt es: „Bleibt drinnen.“ – sofort.'; }), /18\.14/), false);
  assert.ok(hasErr(runDe(() => {}, { lang: 'en' }), /trägt "lang": "de"/));
});

test('Englisch über lang en: Regeln unverändert', () => {
  const v = valid();
  assert.deepEqual(validate(v.timeline, v.text, { lang: 'en' }).errors, []);
  v.text.title.text = 'Was wäre, wenn der Himmel ausgeht?';
  v.text.title.highlight = 'Himmel';
  assert.ok(hasErr(validate(v.timeline, v.text, { lang: 'en' }), /beginnt nicht mit „What if“/));
  // keine deutschen Zusatzregeln für Englisch (Zahlenformat, Schriftzeichen)
  const w = valid();
  w.text.hud.a.label = 'STRAẞE';
  const r = validate(w.timeline, w.text, { lang: 'en' });
  assert.equal([...r.errors, ...r.warnings].some((m) => m.startsWith('[18.14]')), false);
});
