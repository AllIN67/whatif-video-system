// Qualitäts-Upgrade V4 (Bildsprache): opt-in über beats.json post.v4. Kernforderungen:
//  1. Ohne post.v4 ändert sich nichts (Kit-Hooks leer, Stimmungen unverändert, kein zusätzlicher Zufall).
//  2. Mit post.v4 werden bestehende Stimmungen umgerechnet und stage.js bekommt die fx der aktuellen Stimmung.
//  3. Automatische Tiefenunschärfe nur im Hintergrund (Vordergrund trägt Information), Sättigung nicht erhöht.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createKit } from '../pipeline/runtime/kit/index.js';
import { enableV4, upgradeLook, composeFx, LOOKS_V4 } from '../pipeline/runtime/kit/look4.js';
import { createRng } from '../pipeline/runtime/rng.js';

const ctx = new Proxy({}, { get: (o, k) => (k in o ? o[k] : () => ({})), set: (o, k, v) => ((o[k] = v), true) });
globalThis.document ??= { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) };

test('ohne post.v4: keine Hooks, Stimmungen unverändert, kein Himmel in der Szene', () => {
  enableV4(null);
  const scene = new THREE.Scene();
  const kit = createKit({ THREE, scene, renderer: null, rng: createRng(1) });
  assert.deepEqual(Object.keys(kit.core.hooks), []);
  const L = kit.setupLook({ scene, renderer: null }, 'day');
  assert.equal(L.look, kit.LOOKS.day);
  assert.equal(scene.children.some((o) => o.name === 'look4.sky'), false);
  assert.equal(composeFx({}, {}, [0, 0, 0]), null);
});

test('mit post.v4: Stimmung umgerechnet, Himmelskuppel, fx mit Linien/Grade/Unschärfe', () => {
  enableV4(true);
  const scene = new THREE.Scene();
  const kit = createKit({ THREE, scene, renderer: null, rng: createRng(1) });
  const L = kit.setupLook({ scene, renderer: null }, 'day');
  assert.ok(L.look.fx, 'umgerechnete Stimmung trägt fx');
  assert.notEqual(L.look.hemi[0], kit.LOOKS.day.hemi[0], 'Schattenseiten kühler');
  assert.ok(scene.children.some((o) => o.name === 'look4.sky'));
  kit.applyLook({ scene, renderer: null, ...L }, 'night');
  const fx = composeFx({ vignette: 0.2 }, { bloom: 0.5, grade: { saturation: 0.88 } }, [1, 2, 3]);
  assert.ok(fx.ink && fx.ink.strength > 0);
  assert.equal(fx.vignette, 0.2, 'post überschreibt V4-Vorgabe');
  assert.equal(fx.bloom, 0.5);
  assert.equal(fx.grade.saturation, 0.88, 'Szene behält ihre Sättigung');
  assert.ok(Array.isArray(fx.grade.liftRGB), 'V4 ergänzt farbige Schwarzwerte');
  assert.deepEqual(fx.dof.target, [1, 2, 3]);
  assert.equal(fx.dof.near, 0, 'automatische Unschärfe nur im Hintergrund');
  assert.equal(fx.tone, undefined, 'Tonemapping bleibt ACES (Sättigung nicht erhöhen)');
  enableV4(null);
});

test('post.v4-Optionen: Linien/Unschärfe abschaltbar, Szene kann dof selbst setzen', () => {
  enableV4({ ink: false, dof: false });
  const kit = createKit({ THREE, scene: new THREE.Scene(), renderer: null, rng: createRng(1) });
  kit.setupLook({ scene: new THREE.Scene(), renderer: null }, 'day');
  const fx = composeFx({}, {}, [0, 0, 0]);
  assert.equal(fx.ink, undefined);
  assert.equal(fx.dof, undefined);
  enableV4(true);
  createKit({ THREE, scene: new THREE.Scene(), renderer: null, rng: createRng(1) });
  assert.deepEqual(composeFx({}, { dof: { target: [5, 5, 5], max: 9 } }, [0, 0, 0]).dof, { target: [5, 5, 5], max: 9 });
  assert.equal(composeFx({}, { dof: false }, [0, 0, 0]).dof, undefined);
  enableV4(null);
});

test('upgradeLook: Sättigung der Grade nicht über 1, V4-Stimmungen bleiben unverändert', () => {
  const day = { sky: 0xb9d3ea, fog: [0xc9dcec, 40, 160], hemi: [0xffffff, 0x8a8f7a, 1.35], sun: [0xfff4e2, 2.4], exposure: 1.0 };
  const up = upgradeLook(THREE, day);
  assert.ok(up.fx.grade.saturation <= 1);
  assert.ok(up.hemi[2] < day.hemi[2], 'Himmelslicht schwächer → mehr Licht/Schatten-Kontrast');
  for (const L of Object.values(LOOKS_V4)) {
    assert.equal(upgradeLook(THREE, L), L);
    assert.ok(L.fx.grade.saturation <= 1);
  }
});

test('Beat-Optionen: POV ohne automatische Unschärfe, beat.v4 überschreibt Produktion', () => {
  enableV4(true);
  createKit({ THREE, scene: new THREE.Scene(), renderer: null, rng: createRng(1) });
  assert.equal(composeFx({}, {}, [0, 0, 0], { pov: true }).dof, undefined, 'POV: Vordergrund-Info bleibt scharf');
  assert.ok(composeFx({}, {}, [0, 0, 0], { pov: true, v4: { dof: { max: 4 } } }).dof, 'POV mit ausdrücklicher dof');
  assert.equal(composeFx({}, {}, [0, 0, 0], { v4: { ink: false } }).ink, undefined);
  assert.ok(composeFx({}, {}, [0, 0, 0], null).ink);
  enableV4(null);
});
