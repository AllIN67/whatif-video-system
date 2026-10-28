// Stufe 2: Zeitachse – Interpolation, Einstellungsgrenzen, Übergänge, HUD.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interpolate, prepare, shotIndexAt, transitionAt, cameraAt, fadeOpacity, hudAt, toFrame } from '../pipeline/runtime/timeline.js';

const cam = (t, x) => ({ t, pos: [x, 1.6, 0], look: [x, 1.6, -10], fov: 50 });
const base = () => ({
  fps: 30,
  duration: 4,
  shots: [
    { id: 'a', from: 0, to: 1, camera: { keys: [cam(0, 0), cam(1, 1)] } },
    { id: 'b', from: 1, to: 2, transition_in: { type: 'whip', frames: 10 }, camera: { keys: [cam(1, 5), cam(2, 6)] } },
    { id: 'c', from: 2, to: 3, transition_in: { type: 'dip', frames: 6 }, camera: { keys: [cam(2, 9), cam(3, 9)] } },
    { id: 'd', from: 3, to: 4, transition_in: { type: 'flash', frames: 8 }, camera: { keys: [cam(3, 0), cam(4, 0)] } },
  ],
  hud: [
    { id: 'h1', from: 0, value: { keys: [[0, 100], [2, 0]] } },
    { id: 'h2', from: 2, value: { keys: [[2, 0], [4, 50]] }, decimals: 1 },
  ],
});

test('interpolate: Grenzen, linear, ease, Vektoren, catmull durch Keyframes', () => {
  const k = [{ t: 0, v: 0 }, { t: 1, v: 10 }, { t: 2, v: 30 }];
  assert.equal(interpolate(k, -1), 0);
  assert.equal(interpolate(k, 5), 30);
  assert.equal(interpolate(k, 0.5, 'linear'), 5);
  assert.equal(interpolate(k, 0.5, 'inOut'), 5); // symmetrisch
  assert.ok(interpolate(k, 0.25, 'inOut') < 2.5); // langsamer Start
  assert.deepEqual(interpolate([{ t: 0, v: [0, 0] }, { t: 1, v: [2, 4] }], 0.5, 'linear'), [1, 2]);
  assert.equal(interpolate(k, 1, 'catmull'), 10);
  assert.throws(() => interpolate(k, 0.5, 'gibtsnicht'), /Unbekannte Ease/);
});

test('toFrame lehnt Zeiten zwischen Frames ab', () => {
  assert.equal(toFrame(2.5, 30, 'x'), 75);
  assert.throws(() => toFrame(1.01, 30, 'x'), /Frame-Grenze/);
});

test('prepare: gültige Zeitachse', () => {
  const p = prepare(base());
  assert.equal(p.total, 120);
  assert.deepEqual(p.shots.map((s) => [s.from, s.to]), [[0, 30], [30, 60], [60, 90], [90, 120]]);
});

test('prepare: Fehlerfälle', () => {
  const lueck = base(); lueck.shots[1].from = 1.1; lueck.shots[1].to = 2;
  assert.throws(() => prepare(lueck), /Lücke|Frame-Grenze/);
  const ende = base(); ende.duration = 5;
  assert.throws(() => prepare(ende), /Letzte Einstellung/);
  const start = base(); start.shots[0].transition_in = { type: 'dip', frames: 4 };
  assert.throws(() => prepare(start), /Erste Einstellung/);
  const tr = base(); tr.shots[1].transition_in = { type: 'wipe' };
  assert.throws(() => prepare(tr), /unbekannter Übergang/);
  const lang = base(); lang.shots[1].transition_in = { type: 'whip', frames: 20 };
  assert.throws(() => prepare(lang), /außerhalb/);
  const fps = base(); fps.fps = 24;
  assert.throws(() => prepare(fps), /30 fps/);
  const kurz = { fps: 30, duration: 0.1, shots: [{ id: 'x', from: 0, to: 0.1, camera: { keys: [cam(0, 0)] } }] };
  assert.throws(() => prepare(kurz), /4 Frames/);
});

test('Einstellungswechsel genau an der Frame-Grenze', () => {
  const p = prepare(base());
  assert.equal(shotIndexAt(p, 29), 0);
  assert.equal(shotIndexAt(p, 30), 1);
  assert.equal(shotIndexAt(p, 119), 3);
});

test('Übergänge: whip stetig und symmetrisch, dip/flash ohne Schwarz-/Weißbild', () => {
  const p = prepare(base());
  // whip um Frame 30, 10 Frames: 25..34
  assert.equal(transitionAt(p, 24).blur, 0);
  assert.equal(transitionAt(p, 35).blur, 0);
  const yaws = [];
  for (let f = 25; f < 35; f++) yaws.push(transitionAt(p, f).yaw);
  assert.ok(yaws.every((y) => Math.abs(y) <= (35 * Math.PI) / 180 + 1e-9));
  assert.ok(Math.max(...[25, 26, 27, 28, 29, 30, 31, 32, 33, 34].map((f) => transitionAt(p, f).blur)) > 20);
  // dip um Frame 60 (6 Frames: 57..62), Maximum ≤ 0.6
  const dips = [56, 57, 58, 59, 60, 61, 62, 63].map((f) => transitionAt(p, f).overlay);
  assert.equal(dips[0], 0);
  assert.equal(dips[7], 0);
  assert.ok(Math.max(...dips) <= 0.6 + 1e-9 && Math.max(...dips) > 0.4);
  // flash um Frame 90, Maximum ≤ 0.85
  const fl = [];
  for (let f = 84; f < 96; f++) fl.push(transitionAt(p, f).overlay);
  assert.ok(Math.max(...fl) <= 0.85 + 1e-9 && Math.max(...fl) > 0.6);
  assert.equal(fl[0], 0);
  assert.equal(fl[fl.length - 1], 0);
});

test('Kamera: Werte aus der aktiven Einstellung, keine Sprünge innerhalb einer Einstellung', () => {
  const p = prepare(base());
  assert.deepEqual(cameraAt(p, 0).pos, [0, 1.6, 0]);
  assert.equal(cameraAt(p, 30).shot, 'b');
  for (let f = 1; f < 25; f++) {
    const d = Math.abs(cameraAt(p, f).pos[0] - cameraAt(p, f - 1).pos[0]);
    assert.ok(d < 0.1, `Sprung bei Frame ${f}: ${d}`);
  }
});

test('Ein-/Ausblendung', () => {
  assert.equal(fadeOpacity(0.9, 1, 3), 0);
  assert.equal(fadeOpacity(1.125, 1, 3), 0.5);
  assert.equal(fadeOpacity(2, 1, 3), 1);
  assert.equal(fadeOpacity(3, 1, 3), 0);
});

test('HUD: Segmentwechsel, Wert, Fortschritt', () => {
  const p = prepare(base());
  assert.equal(hudAt(p, 0).value, 100);
  assert.equal(hudAt(p, 1).value, 50);
  assert.equal(hudAt(p, 1).progress, 0.5);
  assert.equal(hudAt(p, 2.5).id, 'h2');
  assert.equal(hudAt(p, 3).value, 25);
});

test('HUD: Sprung mit "hold" genau am Keyframe, feste Skala über "bar"', () => {
  const tl = base();
  tl.hud = [{ id: 'life', from: 0, value: { keys: [[0, 1000], [1.5, 999]], ease: 'hold' }, decimals: 0, bar: [0, 2000] }];
  const p = prepare(tl);
  assert.equal(hudAt(p, 1.5 - 1 / 30).value, 1000);
  assert.equal(hudAt(p, 1.5).value, 999);
  assert.equal(hudAt(p, 0).progress, 0.5); // bezogen auf bar, nicht auf die Keyframes
  assert.equal(hudAt(p, 2).progress, 999 / 2000);
});
