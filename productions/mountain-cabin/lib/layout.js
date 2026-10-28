// Feste Orte der Welt (Meter). Einmal festgelegt, damit Hütte, Wege und Landschaft in allen Einstellungen identisch bleiben.
export const FLOOR = 0.5; // Fußboden der Hütte / Veranda über Gelände
export const CABIN = { x0: -3.5, x1: 3.5, z0: -3, z1: 3, wallH: 2.7, ridge: 2.1 };
export const PORCH = { z0: -5.6, x0: -4.6, x1: 4.6 };
export const DOOR = { x0: -2.1, x1: -1.05, h: 2.05 }; // Tür in der Vorderwand (z = −3), Scharnier bei x0
export const FRONT_WIN = { x0: 0.5, x1: 2.1, y0: 0.95, y1: 2.05 }; // über Fußboden
export const SIDE_WIN = { z0: -0.6, z1: 0.9, y0: 0.95, y1: 2.0 }; // linke Wand x = −3.5
export const HEARTH = { x: 3.5, z: 0.6 }; // Kamin an der rechten Wand
export const TABLE = { x: 1.3, z: -2.05, top: 0.76 };
export const CHAIR = { x: 1.55, z: 0.9 };
export const WOODPILE = { x: -7.2, z: -2.2 };
export const GARDEN = { x: 8.5, z: 0.5 };
export const COOP = { x: 9.5, z: 7.5 };
export const POOL = { x: -70, z: 48, r: 7.5 };
export const CLIFF_DIR = [-0.76, 0.65]; // von Becken zur Felswand
export const SUMMIT = { x: 95, z: 150 };
export const LAKE = { x: -140, z: -1180, rx: 430, rz: 250 };
// Spuren und Pfad: Hütte → Waldrand → Wasserfall
export const TRAIL = [
  [-4.2, 2.0], [-7.5, 4.5], [-11, 7.5], [-15, 10.5], [-19.5, 13.5], [-25, 17], [-31, 20.5], [-37, 23.5],
  [-43, 26.5], [-49, 28.5], [-55, 29.0], [-60, 31.5], [-63.5, 36], [-65.5, 40.8],
];
export const BIG_ROCK = { x: -54.5, z: 34.5, s: 3.4 };
// Wanderweg zum Aussichtspunkt
export const HIKE = [[12, 18], [24, 34], [38, 52], [52, 72], [64, 92], [76, 112], [86, 130], [92, 142], [95, 148]];
