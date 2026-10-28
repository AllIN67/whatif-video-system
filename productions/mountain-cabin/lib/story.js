// Handlung: Einstellungs-Eigenschaften, Licht-/Wetterverlauf und Position/Haltung der Figur – alles als Funktion von t.
import { FLOOR, HIKE, SUMMIT, CHAIR, POOL, CLIFF_DIR, WOODPILE } from './layout.js';
import { smooth, clamp01, lerp } from './noise.js';

export const SEEDS = { tex: 11, terrain: 4242, cabin: 7, nature: 99, clouds: 5, rain: 13, snow: 17, fall: 19, foam: 23, fire: 29, embers: 31, steam1: 37, steam2: 41, smoke: 43 };

// interior: Innenraum (Umgebungslicht gedämpft) · pov: Ego-Perspektive (Figur verborgen)
// focus/extent: Bereich der Sonnenschatten · exposure: Belichtungsfaktor
const CAB = [0, 0.5, -1.5];
export const SHOTS = {
  s01_door: { interior: true, insideUntil: [1.8, 3.4], pov: true, focus: [-1, 0.5, -4], extent: 14 },
  s02_porch: { focus: CAB, extent: 13 },
  s03_pour: { interior: true, pov: true, focus: CAB, extent: 6, exposure: 1.45, beam: 1 },
  s04_bread: { interior: true, pov: true, focus: CAB, extent: 6, exposure: 1.45, beam: 1 },
  s05_window: { interior: true, pov: true, focus: [1, 0.5, -4], extent: 10, exposure: 1.2, beam: 1 },
  s06_garden: { focus: [8.5, 0, 0.5], extent: 9 },
  s07_eggs: { pov: true, noArms: true, focus: [9, 0, 5.5], extent: 7 },
  s08_tracks: { pov: true, focus: [-6, 0, 3], extent: 10, hideFall: true },
  s09_trail: { pov: true, extent: 16, hideFall: true },
  s10_reveal: { pov: true, focus: [-63, 8, 40], extent: 20 },
  s11_orbit: { focus: [POOL.x, 8, POOL.z], extent: 24, beam: 0 },
  s12_storm: { focus: [0, 0, -7], extent: 14 },
  s13_lookup: { pov: true, focus: [-4, 0, -4], extent: 12 },
  s14_gather: { pov: true, focus: [WOODPILE.x, 0, WOODPILE.z], extent: 7 },
  s15_carry: { focus: [-4, 0, -5], extent: 10 },
  s16_branches: { pov: true, focus: [-12, 0, -8], extent: 12 },
  s17_doorway: { pov: true, focus: [-1.5, 0.5, -4], extent: 10 },
  s18_lamp: { interior: true, pov: true, focus: CAB, extent: 6, noRain: true, exposure: 0.62 },
  s19_fire: { interior: true, pov: true, focus: CAB, extent: 6, noRain: true, exposure: 0.62 },
  s20_window: { interior: true, pov: true, focus: CAB, extent: 8, exposure: 0.8 },
  s21_cook: { interior: true, pov: true, focus: CAB, extent: 6, noRain: true, exposure: 0.62 },
  s22_hike: { extent: 16 },
  s23_climb: { extent: 16 },
  s24_summit: { focus: [SUMMIT.x - 4, 90, SUMMIT.z - 10], extent: 26 },
  s25_fireside: { interior: true, focus: CAB, extent: 6, noRain: true, exposure: 1.0 },
  s26_final: { focus: CAB, extent: 14 },
};

// Licht/Wetter-Schlüsselwerte. Sprünge nur an Einstellungsgrenzen mit Zeitsprung (45,5 s, 54,5 s).
const MORNING = {
  sunDir: [-0.85, 0.33, 0.25], sunCol: [1.0, 0.84, 0.66], sunI: 3.1, sunGlow: 1.0, sunDisc: 1,
  hemiSky: [0.62, 0.72, 0.88], hemiI: 0.85, envI: 0.75, fillI: 1.2,
  skyTop: [0.16, 0.33, 0.66], skyHor: [0.66, 0.74, 0.82], fog: 0.00018, exposure: 0.95,
  fair: 1, storm: 0, clearing: 0, stormCol: [0.32, 0.34, 0.38], cloudCol: [1, 0.97, 0.93], mist: 0.55, mistTop: -212, mistCol: [0.9, 0.92, 0.95],
  wind: 0.12, rain: 0, snow: 0, wet: 0.15,
};
const LATE_MORNING = { ...MORNING, sunDir: [-0.75, 0.5, 0.2], sunCol: [1.0, 0.93, 0.84], sunI: 3.3, mist: 0.35, mistTop: -222, skyHor: [0.66, 0.75, 0.85], wet: 0 };
const STORM = {
  ...LATE_MORNING, sunCol: [0.75, 0.8, 0.9], sunI: 0.12, sunGlow: 0.05, sunDisc: 0, hemiSky: [0.5, 0.56, 0.64], hemiI: 0.7, envI: 0.35, fillI: 0.4,
  skyTop: [0.11, 0.12, 0.14], skyHor: [0.3, 0.33, 0.36], fog: 0.0011, exposure: 1.25, fair: 0, storm: 1, mist: 0.2, mistCol: [0.5, 0.53, 0.56],
  cloudCol: [0.4, 0.42, 0.45], wind: 1.0, rain: 1, wet: 1,
};
const GOLDEN = {
  sunDir: [0.86, 0.16, 0.12], sunCol: [1.0, 0.68, 0.4], sunI: 3.4, sunGlow: 1.3, sunDisc: 1,
  hemiSky: [0.6, 0.66, 0.8], hemiI: 0.7, envI: 0.7, fillI: 0.8,
  skyTop: [0.18, 0.32, 0.6], skyHor: [0.9, 0.74, 0.58], fog: 0.00026, exposure: 0.95,
  fair: 0.7, storm: 1, clearing: 1, stormCol: [0.5, 0.45, 0.45], cloudCol: [1.0, 0.82, 0.66], mist: 0.9, mistTop: -175, mistCol: [1.0, 0.9, 0.8],
  wind: 0.18, rain: 0, snow: 0, wet: 1,
};
const EVENING = {
  sunDir: [0.35, 0.55, -0.5], sunCol: [0.42, 0.52, 0.85], sunI: 0.35, sunGlow: 0, sunDisc: 0,
  hemiSky: [0.32, 0.4, 0.62], hemiI: 0.45, envI: 0.25, fillI: 0,
  skyTop: [0.025, 0.045, 0.12], skyHor: [0.16, 0.21, 0.34], fog: 0.00035, exposure: 1.35,
  fair: 0, storm: 1, clearing: 1, stormCol: [0.3, 0.33, 0.42], cloudCol: [0.4, 0.45, 0.6], mist: 0.45, mistCol: [0.3, 0.36, 0.5],
  wind: 0.08, rain: 0, snow: 1, wet: 0.4,
};
export const ENV_KEYS = [
  { t: 0, ...MORNING },
  { t: 21, ...LATE_MORNING },
  { t: 27.5, ...LATE_MORNING },
  { t: 30.5, ...STORM, rain: 0.15, wind: 0.75 },
  { t: 34.4, ...STORM },
  { t: 45.466, ...STORM },
  { t: 45.5, ...GOLDEN },
  { t: 54.466, ...GOLDEN, sunDir: [0.88, 0.1, 0.1], sunCol: [1.0, 0.6, 0.34] },
  { t: 54.5, ...EVENING, snow: 0.7 },
  { t: 63, ...EVENING },
];

// Bogenlänge auf Polylinie
function along(pts, s) {
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1];
    const [bx, bz] = pts[i];
    const L = Math.hypot(bx - ax, bz - az);
    if (s <= acc + L || i === pts.length - 1) {
      const u = clamp01((s - acc) / L);
      return { x: ax + (bx - ax) * u, z: az + (bz - az) * u, dir: Math.atan2(bx - ax, bz - az) };
    }
    acc += L;
  }
  return null;
}
export function hikeAt(s) {
  return along(HIKE, s);
}

const STRIDE = 1.45;
// Position (Füße), Blickrichtung (yaw) und Haltung der Figur in Einstellung `shot` zur Zeit t; null = nicht im Bild
export function personAt(t, shot, H, E) {
  const walkTo = (a, b, t0, t1, speedAmp = 1) => {
    const k = smooth((t - t0) / (t1 - t0));
    const x = lerp(a[0], b[0], k);
    const z = lerp(a[1], b[1], k);
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]) * k;
    const moving = t > t0 && t < t1;
    return { x, z, yaw: Math.atan2(b[0] - a[0], b[1] - a[1]), walk: (d / STRIDE) * Math.PI * 2, amp: moving ? speedAmp * Math.min(1, 4 * Math.sin(Math.PI * clamp01((t - t0) / (t1 - t0)))) : 0 };
  };
  switch (shot) {
    case 's02_porch': {
      const w = walkTo([-1.6, -3.4], [-0.35, -4.95], 4.5, 5.9);
      const settle = smooth((t - 5.8) / 0.6);
      return { pos: [w.x, FLOOR, w.z], yaw: lerp(w.yaw, Math.PI, settle), pose: { walk: w.walk, amp: w.amp, reach: 0.35 * settle, look: [0.12 * settle, -0.15 * settle], lean: 0.08 * settle } };
    }
    case 's06_garden': {
      const pull = smooth((t - E.carrot_pull + 0.4) / 0.4) * (1 - smooth((t - E.carrot_pull - 0.9) / 0.5));
      return { pos: [8.3, 0.02, -1.2], yaw: 0.05, pose: { crouch: 1, reach: 0.65 + 0.25 * pull, lean: 0.2 + 0.15 * pull, look: [-0.25, 0.1 * Math.sin(t)] } };
    }
    case 's11_orbit': {
      const x = POOL.x + 5.4;
      const z = POOL.z - 7.0;
      return { pos: [x, H(x, z), z], yaw: Math.atan2(CLIFF_DIR[0], CLIFF_DIR[1]), pose: { look: [0.35 + 0.05 * Math.sin(t * 0.8), 0], reach: 0 } };
    }
    case 's12_storm': {
      const turn = smooth((t - 28.9) / 0.5);
      return { pos: [1.55, H(1.55, -9.5), -9.5], yaw: lerp(Math.PI - 0.1, -Math.PI / 2 - 0.4, turn), pose: { look: [0.3 * (1 - turn), 0.4 * turn] } };
    }
    case 's15_carry': {
      const w = walkTo([-6.2, -4.4], [-1.65, -6.3], 32.1, 33.75, 1.25);
      return { pos: [w.x, H(w.x, w.z), w.z], yaw: w.yaw, pose: { walk: w.walk * 1.15, amp: 0.75, carry: 1, lean: 0.15 } };
    }
    case 's22_hike':
    case 's23_climb': {
      const [s0, s1, t0, t1] = shot === 's22_hike' ? [35.5, 40.0, 45.5, 48.3] : [137.5, 141.5, 48.3, 50.5];
      const s = lerp(s0, s1, (t - t0) / (t1 - t0));
      const p = hikeAt(s);
      return { pos: [p.x, H(p.x, p.z), p.z], yaw: p.dir, pose: { walk: (s / STRIDE) * Math.PI * 2, amp: 0.85, lean: 0.22, look: [-0.1, 0] } };
    }
    case 's24_summit': {
      const x = SUMMIT.x - 1.2;
      const z = SUMMIT.z - 6.6;
      return { pos: [x, H(x, z), z], yaw: Math.PI - 0.25, pose: { look: [0.05, 0.08 * Math.sin(t * 0.5)], reach: 0 } };
    }
    case 's25_fireside':
      return { pos: [CHAIR.x + 0.06, FLOOR + 0.0, CHAIR.z - 0.02], yaw: Math.PI / 2 + 0.35, pose: { sit: 1, mug: 1, look: [-0.05 + 0.04 * Math.sin(t * 0.6), 0.1] } };
    default:
      return null;
  }
}
