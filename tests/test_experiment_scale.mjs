// EXPERIMENT 2026-11-01 (Branch experiment/reference-insights-2026-11): additive Teile für Maßstabsreisen.
// crane-Kamera (log-gleichmäßige Kranfahrt), HUD-Modus geo (Stufen mit gleichem Faktor), Hook-Typ flashforward.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeline } from '../tools/build_timeline.mjs';
import { shotKeys } from '../pipeline/runtime/kit/camera.js';
import { prepare, hudAt } from '../pipeline/runtime/timeline.js';
import { HOOK } from '../tools/validate_production.mjs';

test('crane: Keys auf from/to, Höhe geometrisch, Ende = Aufsicht', () => {
  const r = shotKeys({ preset: 'crane', target: [0, 1, 0], targetTo: [0, 100, 0], dist: 2, distTo: 50, height: 0.5, heightTo: 400, from: 2, to: 6 });
  assert.equal(r.keys[0].t, 2);
  assert.equal(r.keys.at(-1).t, 6);
  assert.equal(r.framing, 'high');
  const ys = r.keys.map((k) => k.pos[1] - k.look[1]);
  // log-gleichmäßig: Verhältnis aufeinanderfolgender Höhen konstant
  const q = ys.slice(1).map((y, i) => y / ys[i]);
  for (const x of q) assert.ok(Math.abs(x - q[0]) < 1e-2, `Faktor ${x} ≠ ${q[0]}`);
});

test('HUD geo: jede Stufe verdoppelt (0,1 mm → 0,2 → 0,4 → 0,8 → 1,6)', () => {
  const B = {
    recipe: 'B1', fps: 30, hud: { start: 0.1, decimals: 1 },
    beats: [
      { id: 'a', dur: 4, place: 'p', mood: 'neutral', camera: { preset: 'push', target: [0, 1, 0] }, hud: { label: 'mm', to: 1.6, mode: 'geo', steps: 4, window: [0.5, 3.5] }, events: [{ id: 'e', at: 1 }] },
      { id: 'b', dur: 4, place: 'q', mood: 'happy', camera: { preset: 'low', target: [0, 1, 0] }, hud: { label: 'km', decimals: 0, to: 1600, mode: 'geo', steps: 10, window: [0.2, 3.8] }, events: [{ id: 'f', at: 1 }] },
    ],
  };
  const tl = buildTimeline(B);
  const vals = tl.hud[0].value.keys.slice(1).map(([, v]) => v);
  assert.deepEqual(vals, [0.2, 0.4, 0.8, 1.6]);
  assert.equal(tl.hud[0].decimals, 1);
  assert.equal(tl.hud[1].decimals, 0);
  const ptl = prepare(tl);
  assert.equal(Math.round(hudAt(ptl, 7.9).value), 1600);
});

test('Hook-Typ flashforward: Beweis ≤ 2 s wie proof', () => {
  assert.ok(HOOK.types.includes('flashforward'));
  assert.equal(HOOK.proofMax.flashforward, 2.0);
});
