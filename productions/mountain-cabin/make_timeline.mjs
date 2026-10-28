#!/usr/bin/env node
// Erzeugt timeline.json dieser Produktion: Einstellungen + Kamerafahrten (aus derselben Höhenfunktion wie die Szene),
// HUD, Textzeiten, Ereignisse und Tonplan. Aufruf: node productions/mountain-cabin/make_timeline.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { createRng } from '../../pipeline/runtime/rng.js';
import { createTerrain } from './lib/terrain.js';
import { SEEDS, hikeAt } from './lib/story.js';
import { FLOOR, TABLE, POOL, CLIFF_DIR, SUMMIT, WOODPILE, COOP, HEARTH, CHAIR, TRAIL } from './lib/layout.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const terrain = createTerrain(THREE, createRng(SEEDS.terrain));
const H = (x, z) => terrain.height(x, z);
const r3 = (v) => v.map((x) => Math.round(x * 1000) / 1000);
const eye = (x, z, h = 1.68) => [x, H(x, z) + h, z];
const key = (t, pos, look, fov = 50, ease) => ({ t, pos: r3(pos), look: r3(look), fov, ...(ease ? { ease } : {}) });

// Ereignisse (eine Quelle für Bild und Ton)
const EV = {
  door_open: 0.0, pour_start: 7.25, pour_end: 8.35, cut1: 8.85, cut2: 9.2, cut3: 9.5, slice_fall: 9.6, window_open: 10.3,
  carrot_pull: 12.6, lid_open: 14.25, egg_take: 14.95, tracks_seen: 16.5, look_forest: 17.7, reveal: 23.0,
  storm_turn: 27.5, thunder1: 28.6, rain_start: 29.9, logs_grab: 31.1, lightning: 34.1, door_close: 36.0, door_slam: 36.3,
  match_strike: 37.0, lamp_lit: 37.55, fire_catch: 39.4, pot_on: 41.5, clear: 45.5, summit: 50.5, evening: 54.5,
};

const pool = [POOL.x, H(POOL.x, POOL.z) + 1, POOL.z];
const fallTop = [POOL.x + CLIFF_DIR[0] * 9.6, H(POOL.x + CLIFF_DIR[0] * 11.5, POOL.z + CLIFF_DIR[1] * 11.5), POOL.z + CLIFF_DIR[1] * 9.6];
const orbit = (a, r, h) => [POOL.x + Math.cos(a) * r, pool[1] + h, POOL.z + Math.sin(a) * r];
const hk = (s, h = 1.0, side = 0, back = 0) => {
  const p = hikeAt(s);
  const x = p.x + Math.cos(p.dir) * side - Math.sin(p.dir) * back;
  const z = p.z - Math.sin(p.dir) * side - Math.cos(p.dir) * back;
  return [x, H(x, z) + h, z];
};
const sumY = H(SUMMIT.x - 1.2, SUMMIT.z - 6.6);
const F = FLOOR;

const shots = [
  // A – die Tür öffnet sich ins Tal
  { id: 's01_door', from: 0, to: 4.5, camera: { mode: 'catmull', keys: [
    key(0, [-1.56, F + 1.64, -1.05], [-1.5, F + 1.45, -4.5], 62),
    key(1.4, [-1.56, F + 1.64, -1.9], [-1.6, F + 1.2, -12], 60),
    key(2.6, [-1.5, F + 1.62, -3.3], [-12, -25, -200], 56),
    key(4.5, [-1.2, F + 1.66, -5.05], [-40, -95, -600], 52),
  ] } },
  // B – Morgen
  { id: 's02_porch', from: 4.5, to: 7.0, camera: { keys: [
    key(4.5, [-7.2, 0.42, -13.6], [-0.9, 2.3, -4.2], 46),
    key(7.0, [-6.4, 0.55, -12.2], [-0.8, 2.25, -4.3], 46),
  ] } },
  { id: 's03_pour', from: 7.0, to: 8.6, camera: { keys: [
    key(7.0, [TABLE.x + 0.38, F + TABLE.top + 0.24, TABLE.z + 0.64], [TABLE.x + 0.17, F + TABLE.top + 0.11, TABLE.z - 0.07], 42),
    key(8.6, [TABLE.x + 0.34, F + TABLE.top + 0.22, TABLE.z + 0.56], [TABLE.x + 0.17, F + TABLE.top + 0.11, TABLE.z - 0.07], 42),
  ] } },
  { id: 's04_bread', from: 8.6, to: 10.0, camera: { keys: [
    key(8.6, [TABLE.x + 0.12, F + TABLE.top + 0.3, TABLE.z + 0.4], [TABLE.x - 0.25, F + TABLE.top + 0.07, TABLE.z + 0.0], 44),
    key(10.0, [TABLE.x + 0.08, F + TABLE.top + 0.28, TABLE.z + 0.36], [TABLE.x - 0.25, F + TABLE.top + 0.07, TABLE.z + 0.0], 44),
  ] } },
  { id: 's05_window', from: 10.0, to: 11.5, camera: { keys: [
    key(10.0, [1.3, F + 1.58, -1.75], [1.2, F + 1.2, -12], 52),
    key(11.5, [1.32, F + 1.6, -2.35], [-15, -40, -400], 50),
  ] } },
  // C – eigene kleine Welt
  { id: 's06_garden', from: 11.5, to: 14.0, camera: { keys: [
    key(11.5, [10.3, 0.72, 1.9], [8.25, 0.5, -0.95], 42),
    key(14.0, [10.0, 0.75, 2.15], [8.25, 0.5, -0.95], 42),
  ] } },
  { id: 's07_eggs', from: 14.0, to: 15.8, camera: { keys: [
    key(14.0, [7.6, 0.32, 2.85], [9.2, 0.45, 5.6], 50),
    key(15.8, [8.1, 0.34, 2.8], [9.2, 0.45, 5.6], 50),
  ] } },
  { id: 's08_tracks', from: 15.8, to: 19.0, camera: { mode: 'catmull', keys: [
    key(15.8, eye(-4.4, -1.6), [-5.2, 1.0, 4.5], 55),
    key(16.5, eye(-4.6, -0.4), [-5.3, 0.1, 3.0], 55),
    key(17.4, eye(-4.7, 0.3, 1.05), [-6.6, 0.0, 3.9], 52),
    key(18.2, eye(-4.8, 0.6, 1.2), [-14, 1.0, 10.5], 52),
    key(19.0, eye(-5.3, 1.3, 1.55), [-25, 2.5, 17.5], 54),
  ] } },
  // D – Entdeckung
  { id: 's09_trail', from: 19.0, to: 22.5, camera: { mode: 'catmull', keys: [
    key(19.0, eye(-35.5, 22.6), [-43, H(-43, 26.5) + 1.3, 26.5], 58),
    key(20.2, eye(-40.5, 25.3), [-49, H(-49, 28.5) + 1.3, 28.5], 58),
    key(21.4, eye(-45.5, 27.6), [-55, H(-55, 29) + 1.2, 29.0], 58),
    key(22.5, eye(-50.0, 28.7), [-58, H(-58, 30.5) + 1.2, 30.5], 58),
  ] } },
  { id: 's10_reveal', from: 22.5, to: 25.0, camera: { mode: 'catmull', keys: [
    key(22.5, eye(-53.0, 28.9), [-58.5, H(-58.5, 30.6) + 1.4, 30.6], 58),
    key(23.3, eye(-56.8, 29.7), [-63, H(-63, 35) + 2.5, 35.5], 56),
    key(24.2, eye(-59.6, 31.3), [fallTop[0], fallTop[1] - 6, fallTop[2]], 54),
    key(25.0, eye(-61.6, 33.5), [fallTop[0], fallTop[1] - 7, fallTop[2]], 52),
  ] } },
  { id: 's11_orbit', from: 25.0, to: 27.5, camera: { mode: 'catmull', keys: [
    key(25.0, orbit(-0.55, 19, 2.2), [POOL.x - 2, pool[1] + 6, POOL.z + 3], 48),
    key(26.25, orbit(-0.95, 18.5, 3.0), [POOL.x - 2, pool[1] + 6, POOL.z + 3], 48),
    key(27.5, orbit(-1.35, 18, 3.8), [POOL.x - 2, pool[1] + 6.5, POOL.z + 3], 48),
  ] } },
  // Sturm
  { id: 's12_storm', from: 27.5, to: 29.6, transition_in: { type: 'dip', frames: 6 }, camera: { keys: [
    key(27.5, [3.6, 1.25, -5.4], [-60, 110, -900], 52),
    key(29.6, [3.3, 1.3, -5.9], [-60, 100, -900], 52),
  ] } },
  { id: 's13_lookup', from: 29.6, to: 30.8, camera: { mode: 'catmull', keys: [
    key(29.6, eye(-3.4, -7.2), [-80, 160, -900], 56),
    key(30.1, eye(-3.6, -7.0), [-120, 60, -700], 56),
    key(30.8, eye(-4.0, -6.4), [WOODPILE.x + 0.3, 0.4, WOODPILE.z - 1.0], 56),
  ] }, shake: [{ t: 29.6, dur: 1.2, amp: 0.012, freq: 3 }] },
  { id: 's14_gather', from: 30.8, to: 32.2, camera: { keys: [
    key(30.8, [WOODPILE.x + 0.6, 1.55, WOODPILE.z - 2.35], [WOODPILE.x + 0.6, 0.1, WOODPILE.z - 1.1], 60),
    key(31.6, [WOODPILE.x + 0.6, 1.25, WOODPILE.z - 2.2], [WOODPILE.x + 0.6, 0.15, WOODPILE.z - 1.0], 60),
    key(32.2, [WOODPILE.x + 0.75, 1.62, WOODPILE.z - 2.45], [WOODPILE.x + 4, 1.0, WOODPILE.z - 4], 60),
  ] }, shake: [{ t: 31.1, dur: 1.0, amp: 0.02, freq: 5 }] },
  { id: 's15_carry', from: 32.2, to: 33.6, camera: { keys: [
    key(32.2, [-3.6, 0.95, -9.8], [-5.7, 1.2, -4.8], 50),
    key(33.6, [-1.6, 0.95, -10.3], [-2.0, 1.3, -6.0], 50),
  ] }, shake: [{ t: 32.2, dur: 1.4, amp: 0.025, freq: 4 }] },
  { id: 's16_branches', from: 33.6, to: 34.8, camera: { keys: [
    key(33.6, [-9.0, 1.2, 0.2], [-16, 5.5, -3.0], 55),
    key(34.8, [-9.4, 1.2, 0.0], [-16, 6.0, -3.0], 55),
  ] }, shake: [{ t: 34.1, dur: 0.7, amp: 0.03, freq: 7 }] },
  { id: 's17_doorway', from: 34.8, to: 36.5, camera: { mode: 'catmull', keys: [
    key(34.8, [-1.5, 1.7, -7.6], [-1.55, 1.9, -2.0], 58),
    key(35.35, [-1.55, F + 1.62, -4.4], [-1.5, F + 1.55, 0.5], 58),
    key(35.75, [-1.5, F + 1.62, -2.1], [0.5, F + 1.5, -1.0], 58),
    key(36.05, [-1.4, F + 1.6, -1.45], [-1.6, F + 1.35, -5.0], 58),
    key(36.5, [-1.38, F + 1.6, -1.35], [-1.6, F + 1.35, -5.0], 58),
  ] }, shake: [{ t: 34.8, dur: 1.0, amp: 0.02, freq: 3.5 }] },
  // Sicher drinnen
  { id: 's18_lamp', from: 36.5, to: 39.0, camera: { keys: [
    key(36.5, [TABLE.x - 0.85, F + TABLE.top + 0.32, TABLE.z + 0.5], [TABLE.x - 0.5, F + TABLE.top + 0.14, TABLE.z - 0.2], 40),
    key(39.0, [TABLE.x - 0.8, F + TABLE.top + 0.3, TABLE.z + 0.42], [TABLE.x - 0.5, F + TABLE.top + 0.14, TABLE.z - 0.2], 40),
  ] } },
  { id: 's19_fire', from: 39.0, to: 41.5, camera: { keys: [
    key(39.0, [HEARTH.x - 2.35, F + 0.85, HEARTH.z - 0.9], [HEARTH.x - 0.4, F + 0.45, HEARTH.z], 52),
    key(41.5, [HEARTH.x - 2.1, F + 0.8, HEARTH.z - 0.75], [HEARTH.x - 0.4, F + 0.45, HEARTH.z], 52),
  ] } },
  { id: 's20_window', from: 41.5, to: 43.5, camera: { keys: [
    key(41.5, [-2.55, F + 1.52, 0.55], [-3.6, F + 1.45, 0.05], 46),
    key(43.5, [-2.75, F + 1.5, 0.4], [-3.6, F + 1.45, 0.05], 46),
  ] } },
  { id: 's21_cook', from: 43.5, to: 45.5, camera: { keys: [
    key(43.5, [HEARTH.x - 1.15, F + 0.95, HEARTH.z - 0.4], [HEARTH.x - 0.48, F + 0.45, HEARTH.z], 40),
    key(45.5, [HEARTH.x - 1.05, F + 0.9, HEARTH.z - 0.35], [HEARTH.x - 0.48, F + 0.45, HEARTH.z], 40),
  ] } },
  // Warum du dieses Leben gewählt hast
  { id: 's22_hike', from: 45.5, to: 48.3, transition_in: { type: 'dip', frames: 6 }, camera: { keys: [
    key(45.5, hk(46.5, 2.2, 1.2), [...hk(37.5, 1.0).slice(0, 1), hk(37.5, 1.0)[1] - 1.0, hk(37.5).slice(2)[0]], 48),
    key(48.3, hk(45.0, 2.0, 1.5), [...hk(39.5, 1.0).slice(0, 1), hk(39.5, 1.0)[1] - 1.0, hk(39.5).slice(2)[0]], 48),
  ] } },
  { id: 's23_climb', from: 48.3, to: 50.5, camera: { keys: [
    key(48.3, hk(144.5, 0.6, 1.0), hk(137.5, 1.2), 50),
    key(50.5, hk(146.5, 0.7, 1.2), hk(141.5, 1.2), 50),
  ] } },
  { id: 's24_summit', from: 50.5, to: 54.5, camera: { mode: 'catmull', keys: [
    key(50.5, [SUMMIT.x - 0.6, sumY + 1.95, SUMMIT.z - 4.4], [SUMMIT.x - 30, sumY - 30, SUMMIT.z - 200], 50),
    key(52.0, [SUMMIT.x + 2.5, sumY + 3.2, SUMMIT.z - 5.5], [SUMMIT.x - 60, sumY - 60, SUMMIT.z - 500], 54),
    key(54.5, [SUMMIT.x + 7.5, sumY + 6.5, SUMMIT.z - 4.0], [SUMMIT.x - 160, sumY - 140, SUMMIT.z - 1200], 60),
  ] } },
  // E – letztes Bild
  { id: 's25_fireside', from: 54.5, to: 57.5, transition_in: { type: 'dip', frames: 6 }, camera: { keys: [
    key(54.5, [-0.1, F + 1.45, 2.45], [3.0, F + 0.7, 0.4], 52),
    key(57.5, [0.15, F + 1.4, 2.3], [3.0, F + 0.7, 0.4], 52),
  ] } },
  { id: 's26_final', from: 57.5, to: 63.0, camera: { keys: [
    key(57.5, [-7.0, 1.7, -15.0], [0, 2.4, 1.0], 50),
    key(63.0, [-26.0, 16.0, -62.0], [2, 6.0, 40.0], 52),
  ] } },
];

const hud = [
  { id: 'neighbor', from: 0, value: { keys: [[0, 0], [4.5, 42]], ease: 'out' }, decimals: 0 },
  { id: 'trail', from: 19.0, value: { keys: [[19.0, 0], [25.0, 1.2]], ease: 'linear' }, decimals: 1 },
  { id: 'wind', from: 27.5, value: { keys: [[27.5, 10], [35.5, 85]], ease: 'inOut' }, decimals: 0 },
  { id: 'temp', from: 36.5, value: { keys: [[36.5, 9], [45.0, 21]], ease: 'out' }, decimals: 0 },
  { id: 'alt', from: 45.5, value: { keys: [[45.5, 1840], [54.0, 2130]], ease: 'linear' }, decimals: 0 },
  { id: 'stress', from: 54.5, value: { keys: [[54.5, 12], [58.0, 0]], ease: 'out' }, decimals: 0, final: { at: 58.0 } },
];

const lines = [
  ['l01', 4.55, 6.85], ['l02', 7.05, 10.0], ['l03', 11.55, 14.5], ['l04', 16.3, 18.9], ['l05', 23.4, 26.0], ['l06', 27.7, 30.0],
  ['l07', 30.3, 32.6], ['l08', 36.8, 39.4], ['l09', 41.6, 44.55], ['l10', 46.0, 48.6], ['l11', 51.3, 53.8], ['l12', 57.8, 60.4], ['l13', 60.6, 62.9],
].map(([id, a, b]) => ({ id, in: a, out: b }));

const events = Object.entries(EV).map(([id, t]) => ({ t, id, ...(id === 'door_open' ? { trigger: true } : {}) }));
events.push({ t: 58.0, id: 'pointe' });
events.sort((a, b) => a.t - b.t);

// Ton: Betten (vorgemischte Ambience-/Musik-Stems aus sound_design.py, volle Länge) + Einzelklänge framegenau
const fr = (t) => Math.round(t * 30) / 30;
const sfx = [];
const S = (src, t, gain_db = 0) => sfx.push({ src: `audio/${src}.wav`, t: Math.round(fr(t) * 1e6) / 1e6, gain_db });
S('door_creak', 0.0, -2);
for (const t of [1.75, 2.35, 2.95, 3.6]) S('step_wood', t, -9);
for (const t of [4.75, 5.2, 5.65]) S('step_wood', t, -13);
S('pour', EV.pour_start, -4);
S('mug_set', 7.0, -16);
for (const t of [EV.cut1, EV.cut2, EV.cut3]) S('bread_cut', t - 0.1, -6);
S('slice_fall', EV.slice_fall + 0.3, -10);
S('window_latch', EV.window_open - 0.1, -6);
S('soil_pull', EV.carrot_pull, -8);
S('cluck', 11.9, -20);
S('cluck', 14.2, -12);
S('cluck', 15.3, -16);
S('cluck', 15.0, -15);
for (const t of [15.9, 16.4]) S('step_soil', t, -9);
for (let t = 18.2; t < 22.5; t += 0.52) S('step_soil', t, -10);
for (let t = 22.6; t < 25.0; t += 0.55) S('step_rock', t, -12);
S('reveal_swell', EV.reveal - 0.3, -6);
S('thunder_far', EV.thunder1, -2);
for (const t of [29.75, 30.15, 30.5]) S('step_soil', t, -9);
S('log_clunk', EV.logs_grab + 0.2, -6);
S('log_clunk', EV.logs_grab + 0.42, -8);
S('log_clunk', EV.logs_grab + 0.62, -7);
for (let t = 32.3; t < 33.6; t += 0.33) S('step_wet', t, -8);
S('thunder_near', EV.lightning + 0.1, 0);
for (const t of [35.0, 35.3, 35.6]) S('step_wood', t, -7);
S('door_creak_short', EV.door_close, -6);
S('door_slam', EV.door_slam, -1);
S('match', EV.match_strike - 0.05, -6);
S('lamp_on', EV.lamp_lit, -10);
S('fire_ignite', EV.fire_catch - 0.15, -6);
S('pot_set', EV.pot_on + 0.05, -14);
for (let t = 45.6; t < 48.3; t += 0.6) S('step_rock', t, -14);
for (let t = 48.4; t < 50.5; t += 0.55) S('step_rock', t, -13);
S('summit_swell', EV.summit - 0.4, -8);

// Spline-Fahrten: Blickziele auf gleichen Abstand normieren, sonst schießt Catmull-Rom zwischen nahen und
// fernen Zielen über (Kamera dreht sich kurz rückwärts – im ersten Testbild der Türöffnung gefunden).
for (const s of shots) {
  if (s.camera.mode !== 'catmull') continue;
  for (const k of s.camera.keys) {
    const d = k.look.map((v, i) => v - k.pos[i]);
    const n = Math.hypot(...d);
    k.look = r3(k.pos.map((v, i) => v + (d[i] / n) * 40));
  }
}

const timeline = {
  _comment: 'Erzeugt von make_timeline.mjs – nicht von Hand bearbeiten. Zeiten in Sekunden auf Frame-Grenzen (n/30).',
  fps: 30,
  duration: 63,
  seed: 20261028,
  pointe: 58.0,
  title: { in: 0, out: 3.5 },
  shots: shots.map((s) => ({ ...s, transition_in: s.transition_in || { type: 'cut' } })),
  hud,
  lines,
  events,
  audio: {
    fade_out: 1.6,
    beds: [
      { src: 'audio/bed_music.wav', start: 0, end: 63, gain_db: -5 },
      { src: 'audio/bed_ambience.wav', start: 0, end: 63, gain_db: 7 },
    ],
    sfx,
  },
};
timeline.shots[0].transition_in = undefined;
delete timeline.shots[0].transition_in;
fs.writeFileSync(path.join(here, 'timeline.json'), JSON.stringify(timeline, null, 1) + '\n');
console.log(`timeline.json: ${shots.length} Einstellungen, ${sfx.length} Einzelklänge · Becken ${pool.map((v) => v.toFixed(1))} · Gipfel ${sumY.toFixed(1)} · Pfadende ${TRAIL.at(-1)}`);
void FLOOR;
