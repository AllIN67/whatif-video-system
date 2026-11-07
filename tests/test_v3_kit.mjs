// Version 3.0 (Analyse 6 Videos): additive Kit-Teile (Licht & Atmosphäre, Ich-Perspektive, Massen) und Story-Prüfung 18.13.
// Kernforderung: bestehende Produktionen bleiben unverändert → neue Teile verbrauchen KEINEN Zufall aus dem gemeinsamen rng,
// bestehende Licht-Stimmungen bleiben gleich, bestehende timeline.json werden identisch erzeugt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createKit } from '../pipeline/runtime/kit/index.js';
import { createCore } from '../pipeline/runtime/kit/core.js';
import { createRng } from '../pipeline/runtime/rng.js';
import { FP_POSES } from '../pipeline/runtime/kit/pov.js';
import { LOOKS_V3 } from '../pipeline/runtime/kit/atmosphere.js';
import { buildTimeline } from '../tools/build_timeline.mjs';
import { checkStory } from '../tools/validate_production.mjs';

// Das bestehende Kit zeichnet beim Erzeugen Canvas-Texturen (props_scale) – im Test genügt eine Attrappe ohne Ausgabe.
const ctx = new Proxy({}, { get: (o, k) => (k in o ? o[k] : () => ({})), set: (o, k, v) => ((o[k] = v), true) });
globalThis.document ??= { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) };

const countingRng = (seed = 1) => {
  const r = createRng(seed);
  const c = { n: 0 };
  return { c, rng: { next: () => (c.n++, r.next()), range: (a, b) => (c.n++, r.range(a, b)), int: (a, b) => (c.n++, r.int(a, b)), pick: (x) => (c.n++, r.pick(x)) } };
};

test('v3-Teile verbrauchen keinen gemeinsamen Zufall (bestehende Szenen bleiben bit-identisch)', () => {
  const { c, rng } = countingRng();
  const scene = new THREE.Scene();
  const kit = createKit({ THREE, scene, renderer: null, rng });
  const before = c.n;
  const camera = new THREE.PerspectiveCamera(50, 9 / 16, 0.1, 100);
  kit.masses.crowd({ count: 50 }).update(1.2);
  kit.masses.stands({ width: 10, rows: 3 });
  kit.masses.carField({ rows: 2, cols: 3 });
  kit.firstPerson({ camera, scene }).act([[0, 'rest'], [1, 'reach', 0.3]], 1.1);
  kit.atmo.stringLights({ from: [0, 3, 0], to: [4, 3, 0], light: 1 });
  kit.atmo.neonStrip({ shape: 'rect' });
  kit.atmo.spotCone({ pos: [0, 5, 0], target: [0, 0, 0] });
  kit.atmo.lampPool({ pos: [0, 4, 0] });
  kit.atmo.dust({}).update(2);
  kit.atmo.confetti({}).update(0.5);
  assert.equal(c.n, before, 'gemeinsames rng wurde von v3-Teilen benutzt');
});

test('bestehende Licht-Stimmungen unverändert, neue ergänzt', () => {
  const plain = createCore(THREE).LOOKS;
  const kit = createKit({ THREE, scene: new THREE.Scene(), renderer: null, rng: createRng(1) });
  for (const k of ['day', 'overcast', 'sunset', 'night', 'interior', 'dusk', 'storm', 'blackout', 'nightRoom']) assert.deepEqual(kit.LOOKS[k], plain[k], k);
  for (const k of Object.keys(LOOKS_V3)) assert.ok(kit.LOOKS[k], `Stimmung ${k} fehlt`);
  assert.ok(!('haze' in plain), 'v3-Stimmung darf core.LOOKS einer frischen Instanz nicht vorab enthalten');
});

test('Massen: gleicher Seed → gleiche Anordnung; Anzahl wie angefordert', () => {
  const kit = createKit({ THREE, scene: new THREE.Scene(), renderer: null, rng: createRng(1) });
  const a = kit.masses.crowd({ count: 30, seed: 4 }).update(0.7);
  const b = kit.masses.crowd({ count: 30, seed: 4 }).update(0.7);
  const ma = a.root.children[0].instanceMatrix.array;
  const mb = b.root.children[0].instanceMatrix.array;
  assert.equal(a.count, 30);
  assert.deepEqual(Array.from(ma), Array.from(mb));
  const c = kit.masses.crowd({ count: 30, seed: 5 }).update(0.7);
  assert.notDeepEqual(Array.from(c.root.children[0].instanceMatrix.array), Array.from(ma));
  assert.equal(kit.masses.carField({ rows: 3, cols: 4 }).count, 12);
});

test('Ich-Perspektive: Kamera in der Szene, Gesten weich überblendet, beide Spurformate', () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 9 / 16, 0.1, 100);
  const kit = createKit({ THREE, scene, renderer: null, rng: createRng(1) });
  const fp = kit.firstPerson({ camera, scene, scale: 1 });
  assert.equal(camera.parent, scene);
  assert.equal(fp.root.parent, camera);
  fp.pose('reach');
  const z1 = fp.right.g.position.z;
  assert.ok(Math.abs(z1 - FP_POSES.reach.R[2]) < 0.01);
  fp.act([[0, 'rest'], [1, 'reach', 0.4]], 1.2); // halb überblendet
  const zm = fp.right.g.position.z;
  assert.ok(zm < FP_POSES.rest.R[2] && zm > FP_POSES.reach.R[2], `Überblendung ${zm}`);
  fp.act([{ t: 0, gesture: 'rest' }, { t: 1, gesture: 'reach', blend: 0.4 }], 1.2);
  assert.equal(fp.right.g.position.z, zm);
  assert.equal(fp.left.g.position.x, -fp.right.g.position.x, 'linke Hand gespiegelt');
  const thing = new THREE.Object3D();
  fp.hold(thing, 'L');
  assert.equal(thing.parent, fp.left.slot);
  assert.throws(() => fp.pose('fly'), /unbekannt/);
});

test('Builder: story/pointe_id nur mit story; Ursache setup_for und Akt-Felder werden durchgereicht', () => {
  const beat = (id, extra = {}, ev = {}) => ({ id, dur: 4, place: id, mood: 'neutral', camera: { preset: id === 'a' ? 'push' : 'low', target: [0, 1, 0] }, events: [{ id: `e_${id}`, at: 1, ...ev }], ...(id === 'a' ? { hud: { label: 'm', to: 1 } } : {}), ...extra });
  const base = { recipe: 'B1', fps: 30, pointe: 'e_b', beats: [beat('a', { act: 1, fact: { text: 'x', source: 'y' }, showpiece: 'mass' }, { setup_for: 'e_b', premise: 'visible' }), beat('b', { act: 2 })] };
  const old = buildTimeline(base);
  assert.equal(old.pointe_id, undefined, 'ohne story keine neue Top-Level-Angabe (alte timeline.json bleiben identisch)');
  const tl = buildTimeline({ ...base, story: { stake: 's', measure: 'm', question: 'q', turn: 'e_a' } });
  assert.equal(tl.pointe_id, 'e_b');
  assert.equal(tl.events[0].setup_for, 'e_b');
  assert.equal(tl.beats[0].act, 1);
  assert.equal(tl.beats[0].showpiece, 'mass');
  assert.deepEqual(tl.beats[0].fact, { text: 'x', source: 'y' });
});

test('bestehende Produktionen: timeline.json aus beats.json unverändert', () => {
  for (const d of fs.readdirSync('productions')) {
    const f = `productions/${d}/beats.json`;
    if (d.startsWith('_') || !fs.existsSync(f)) continue;
    const tl = JSON.stringify(buildTimeline(JSON.parse(fs.readFileSync(f, 'utf8'))), null, 1) + '\n';
    assert.equal(tl, fs.readFileSync(`productions/${d}/timeline.json`, 'utf8'), d);
  }
});

test('Story-Prüfung 18.13: fehlende Ursache, Akte, Fakten, Schauwert, Ruhe vor Pointe, Titellänge → Warnungen', () => {
  const w = [];
  const W = (r, m) => w.push(`[${r}] ${m}`);
  const tl = {
    hook: { type: 'proof' }, story: { stake: 's', measure: 'm', question: 'q', turn: 'e1' }, pointe: 50, pointe_id: 'p',
    events: [{ id: 'e1', t: 30 }, { id: 'p', t: 50 }],
    beats: [{ id: 'a', act: 1, fact: { text: 'x' } }, { id: 'b', act: 2, showpiece: 'glow' }],
    audio: { music: { main: { sections: [{ from: 0, to: 60, style: 'drive' }] } } },
  };
  checkStory(tl, { title: { text: 'What if everything you said became real for 5 seconds?' } }, W);
  const has = (re) => assert.ok(w.some((x) => re.test(x)), `erwartet: ${re} in ${w.join(' | ')}`);
  has(/keine Ursache für die Pointe/);
  has(/ohne Quelle/);
  has(/Akt 1: kein Schauwert/);
  has(/Akt 2: kein Wissensanker/);
  has(/keine Ruhe/);
  has(/Titel hat 10 Wörter/);
  const ok = [];
  checkStory({ ...tl, events: [{ id: 'e1', t: 30, setup_for: 'p', premise: 'visible' }, { id: 'p', t: 50 }], beats: [{ id: 'a', act: 1, fact: { text: 'x', source: 'y' }, showpiece: 'mass' }, { id: 'b', act: 2, fact: { text: 'x', source: 'y' }, showpiece: 'glow' }], audio: { music: { main: { sections: [{ from: 0, to: 48, style: 'drive' }, { from: 48, to: 49, style: 'silence' }] } } } }, { title: { text: 'What if you fell into a coma?' } }, (r, m) => ok.push(m));
  assert.deepEqual(ok, []);
  const none = [];
  checkStory({ beats: [] }, {}, (r, m) => none.push(m));
  assert.deepEqual(none, [], 'Produktionen vor 2.2 (ohne hook/story) werden nicht nachträglich bewertet');
});

test('18.13 S5 / 18.14: Titelformel „Was wäre, wenn“ zählt wie „What if“ (+1 Wort nur für Deutsch)', () => {
  const msgs = (title, lang) => {
    const out = [];
    checkStory({ hook: { type: 'proof' }, beats: [] }, { lang, title: { text: title } }, (r, m) => out.push(m), lang);
    return out.filter((m) => /Titel hat/.test(m));
  };
  assert.deepEqual(msgs('Was wäre, wenn dein Akku dein Leben wäre?', 'de'), []); // 8 Wörter, Grenze 8
  assert.match(msgs('Was wäre, wenn dein Handyakku plötzlich dein Leben wäre?', 'de')[0], /9 Wörter \(empfohlen ≤ 8 inkl\. „Was wäre, wenn“\)/);
  assert.match(msgs('What if your phone battery was your life?', 'en')[0], /8 Wörter \(empfohlen ≤ 7\)/);
  assert.deepEqual(msgs('What if your battery was your life?', 'en'), []);
});
