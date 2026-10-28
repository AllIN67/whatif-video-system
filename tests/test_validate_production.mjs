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

test('Längenabweichung nur mit Begründung; Endkarte und HUD-Akzente werden geprüft', () => {
  const shorten = (v) => {
    v.timeline.duration = 56;
    v.timeline.shots.pop();
    v.timeline.shots.at(-1).to = 56;
    v.timeline.pointe = 52;
    v.timeline.lines = v.timeline.lines.filter((l) => l.out <= 50);
    v.timeline.hud[2].value.keys = [[40, 0], [56, 1]];
    v.timeline.hud[2].final.at = 52;
  };
  // ohne Begründung: Fehler
  let r = run((v) => shorten(v));
  assert.ok(hasErr(r, /Länge 56/), r.errors.join('\n'));
  // mit Begründung im Rahmen: nur Warnung
  r = run((v) => {
    shorten(v);
    v.timeline.length_deviation = { min: 45, max: 56, reason: 'Vorgabe des Auftraggebers' };
  });
  assert.ok(!hasErr(r, /Länge/), r.errors.join('\n'));
  assert.ok(r.warnings.some((w) => /dokumentierte Abweichung/.test(w)));
  // Begründung, aber Länge außerhalb des genannten Rahmens: Fehler
  r = run((v) => {
    shorten(v);
    v.timeline.length_deviation = { min: 45, max: 55, reason: 'Vorgabe des Auftraggebers' };
  });
  assert.ok(hasErr(r, /Länge 56/));
  // Endkarte ohne Text, Endkarte überlappt Untertitel, unbekannter Akzent
  const cases = [
    [(v) => { v.timeline.endcard = { in: 58 }; }, /endcard\.title fehlt/],
    [(v) => { v.timeline.endcard = { in: 50 }; v.text.endcard = { title: 'Would you?' }; }, /überlappt die Endkarte/],
    [(v) => { v.timeline.endcard = { in: 59, center: 0.9 }; v.text.endcard = { title: 'Would you?' }; }, /Sicherheitszone/],
    [(v) => { v.timeline.hud[0].flashes = [{ t: 1, kind: 'boom' }]; }, /unbekannt/],
    [(v) => { v.timeline.hud[0].flashes = [{ t: 30, kind: 'loss' }]; }, /außerhalb des Segments/],
  ];
  for (const [mut, re] of cases) {
    const res = run(mut);
    assert.ok(hasErr(res, re), `erwartet ${re}, erhalten: ${res.errors.join(' | ')}`);
  }
  // gültige Endkarte + Akzente: keine Fehler
  r = run((v) => {
    v.timeline.endcard = { in: 59.5, center: 0.3 };
    v.text.endcard = { title: 'Would you always tell the truth?', sub: 'Even if it hurt?' };
    v.timeline.hud[0].flashes = [{ t: 1, kind: 'loss' }, { t: 5, kind: 'warn' }];
  });
  assert.deepEqual(r.errors, []);
});
