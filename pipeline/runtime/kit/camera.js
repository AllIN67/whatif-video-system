// Kamera-Vorlagen: erzeugen Kamera-Keyframes ({ t, pos, look, fov }) für eine Einstellung.
// Reine Mathematik ohne THREE – läuft im Browser (scene.js) und in Node (tools/build_timeline.mjs).
//
// Referenzbefund (R07, R19, R20 – Abschnitt 18 des Style-Guides): Die Kamera steht nie still, wechselt aber
// pro Einstellung die Bildgröße und den Winkel (Nah → Totale → Untersicht → Aufsicht → Ich-Perspektive).
// Jede Vorlage hat deshalb eine Bildgrößen-Klasse (framing), die der Validator auf Abwechslung prüft.
//
//   shotKeys({ preset: 'push', target: [0, 1.5, 0], yaw: 0, from: 10, to: 14 })
//
// Gemeinsame Parameter:
//   target  Blickpunkt (Weltkoordinaten), meist Kopf/Brust der Hauptfigur
//   yaw     Richtung, aus der die Kamera schaut, in Grad um die Hochachse (0 = von +z auf das Ziel, 90 = von +x)
//   from/to Zeiten der Einstellung (s); die Keys liegen genau auf from und to (+ Zwischenkeys)
//   dist    Abstand (m) – Vorlagen haben passende Standardwerte
//   height  Kamerahöhe relativ zum Ziel (m)
//   fov     Bildwinkel (Grad, vertikal)
//   drift   seitliche Bewegung über die Einstellung (m), damit nie ein Standbild entsteht
//   scale   Faktor für alle Abstände (Maßstabs-Szenen, z. B. winzige Figur)

const DEG = Math.PI / 180;
const add = (a, b) => a.map((v, i) => v + b[i]);
const lerp = (a, b, k) => a + (b - a) * k;
const lerpV = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const r3 = (v) => v.map((x) => Math.round(x * 1000) / 1000);

// Richtungsvektor (horizontal) aus yaw in Grad: 0 → +z
const dir = (yawDeg) => [Math.sin(yawDeg * DEG), 0, Math.cos(yawDeg * DEG)];
const side = (yawDeg) => [Math.cos(yawDeg * DEG), 0, -Math.sin(yawDeg * DEG)];

// Bildgrößen-Klassen (für die Abwechslungsprüfung): close · medium · wide · low · high · pov
export const FRAMING = { close: 'close', medium: 'medium', wide: 'wide', low: 'low', high: 'high', pov: 'pov' };

function orbitPoint(target, yaw, dist, height) {
  const d = dir(yaw);
  return [target[0] + d[0] * dist, target[1] + height, target[2] + d[2] * dist];
}

const PRESETS = {
  // langsames Heranfahren (Standard für Ereignisse an der Figur)
  push(o) {
    const s = o.scale ?? 1;
    const d0 = (o.dist ?? 3.4) * s;
    const d1 = (o.distTo ?? d0 * 0.72 / s) * s;
    const h = (o.height ?? 0.15) * s;
    const dr = (o.drift ?? 0.25) * s;
    const sd = side(o.yaw ?? 0);
    const p0 = add(orbitPoint(o.target, o.yaw ?? 0, d0, h), sd.map((v) => -v * dr / 2));
    const p1 = add(orbitPoint(o.target, o.yaw ?? 0, d1, h), sd.map((v) => v * dr / 2));
    return { framing: d1 < 1.8 * s ? 'close' : d1 < 5 * s ? 'medium' : 'wide', keys: [[0, p0, o.fov ?? 45], [1, p1, o.fov ?? 45]] };
  },
  // Wegfahren: zeigt die Umgebung/Folgen (Orientierung)
  pull(o) {
    const s = o.scale ?? 1;
    const r = PRESETS.push({ ...o, dist: o.dist ?? 2.2, distTo: o.distTo ?? (o.dist ?? 2.2) * 1.8 / s });
    const d1 = (o.distTo ?? (o.dist ?? 2.2) * 1.8 / s) * s;
    return { framing: d1 < 5 * s ? 'medium' : 'wide', keys: r.keys };
  },
  // Großaufnahme Gesicht: Gefühl lesbar (R20: Reaktions-Nahaufnahmen)
  close(o) {
    const s = o.scale ?? 1;
    const d = (o.dist ?? 1.0) * s;
    const yaw = o.yaw ?? 0;
    const sw = o.swing ?? 8;
    return {
      framing: 'close',
      keys: [
        [0, orbitPoint(o.target, yaw - sw / 2, d * 1.08, (o.height ?? 0.02) * s), o.fov ?? 38],
        [1, orbitPoint(o.target, yaw + sw / 2, d * 0.95, (o.height ?? 0.02) * s), o.fov ?? 38],
      ],
    };
  },
  // Kreisfahrt um das Ziel (Raum zeigen, Dynamik)
  orbit(o) {
    const s = o.scale ?? 1;
    const d = (o.dist ?? 3.2) * s;
    const yaw = o.yaw ?? 0;
    const sw = o.swing ?? 40;
    const h = (o.height ?? 0.3) * s;
    const n = 4;
    const keys = [];
    for (let i = 0; i <= n; i++) keys.push([i / n, orbitPoint(o.target, yaw - sw / 2 + (sw * i) / n, d, h), o.fov ?? 45]);
    return { framing: d < 1.8 * s ? 'close' : d < 5 * s ? 'medium' : 'wide', keys };
  },
  // Untersicht: Kamera knapp über dem Boden, Objekte wirken riesig/bedrohlich (R07)
  low(o) {
    const s = o.scale ?? 1;
    const d0 = (o.dist ?? 3.0) * s;
    const groundY = o.ground ?? 0;
    const camY = groundY + (o.camHeight ?? 0.35) * s;
    const yaw = o.yaw ?? 0;
    const p0 = orbitPoint(o.target, yaw - 6, d0, 0);
    const p1 = orbitPoint(o.target, yaw + 6, d0 * 0.8, 0);
    p0[1] = camY;
    p1[1] = camY;
    return { framing: 'low', keys: [[0, p0, o.fov ?? 50], [1, p1, o.fov ?? 50]] };
  },
  // Aufsicht/Totale von oben: Orientierung, Maßstab, viele Menschen (R20 Stadt/Friedhof)
  high(o) {
    const s = o.scale ?? 1;
    const d = (o.dist ?? 9) * s;
    const h = (o.height ?? 9) * s;
    const yaw = o.yaw ?? 0;
    const sw = o.swing ?? 14;
    return {
      framing: 'high',
      keys: [
        [0, orbitPoint(o.target, yaw - sw / 2, d, h * 1.05), o.fov ?? 45],
        [1, orbitPoint(o.target, yaw + sw / 2, d * 0.9, h * 0.95), o.fov ?? 45],
      ],
    };
  },
  // Ich-Perspektive: Augenhöhe am Standort `eye`, Blick auf target, leichtes Atmen/Schwanken (R20)
  pov(o) {
    if (!o.eye) throw new Error('pov: eye (Augenposition) fehlt');
    const sway = (o.sway ?? 0.03) * (o.scale ?? 1);
    const n = 4;
    const keys = [];
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      const off = [sway * Math.sin(k * Math.PI * 2.3), sway * 0.6 * Math.sin(k * Math.PI * 3.1 + 1), 0];
      keys.push([k, add(lerpV(o.eye, o.eyeTo ?? o.eye, k), off), o.fov ?? 55, add(o.target, off.map((v) => v * 0.3))]);
    }
    return { framing: 'pov', keys };
  },
  // Seitliche Begleitfahrt: Kamera fährt parallel zur Figur von a nach b (Gehen/Rennen)
  track(o) {
    if (!o.a || !o.b) throw new Error('track: a und b (Start-/Endpunkt des Ziels) fehlen');
    const s = o.scale ?? 1;
    const d = (o.dist ?? 4) * s;
    const h = (o.height ?? 0.2) * s;
    const yaw = o.yaw ?? 90;
    const k0 = orbitPoint(o.a, yaw, d, h);
    const k1 = orbitPoint(o.b, yaw, d, h);
    return {
      framing: d < 1.8 * s ? 'close' : d < 5 * s ? 'medium' : 'wide',
      keys: [[0, k0, o.fov ?? 45, o.a], [1, k1, o.fov ?? 45, o.b]],
    };
  },
  // Kranfahrt über Maßstäbe (EXPERIMENT 2026-11-01, Referenzen V1–V3: durchgehende Fahrt Person → Straße → Stadt → Erde):
  // Kamera und Blickpunkt wandern von (target, dist, height) nach (targetTo, distTo, heightTo). Zwischenkeys liegen
  // geometrisch (log-gleichmäßig), damit eine Fahrt über mehrere Größenordnungen gleichmäßig schnell wirkt.
  // Zwei aufeinanderfolgende crane-Beats mit passendem Ende/Anfang ergeben eine Fahrt ohne sichtbaren Schnitt.
  crane(o) {
    const s = o.scale ?? 1;
    const yaw0 = o.yaw ?? 0;
    const yaw1 = o.yawTo ?? yaw0;
    const t0 = o.target;
    const t1 = o.targetTo ?? o.target;
    const d0 = (o.dist ?? 3) * s;
    const d1 = (o.distTo ?? o.dist ?? 3) * s;
    const h0 = (o.height ?? 0.5) * s;
    const h1 = (o.heightTo ?? o.height ?? 0.5) * s;
    const n = o.keys ?? 8;
    const geo = (a, b, k) => (a > 0 && b > 0 ? a * Math.pow(b / a, k) : lerp(a, b, k));
    const keys = [];
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      // ratio R ≠ 1: Blickpunkt wandert exponentiell (R > 1 langsam → schnell, R < 1 schnell → langsam), passend zu
      // Werten, die sich je Stufe um denselben Faktor ändern (HUD-Modus geo). R = 1: gleichmäßig.
      const R = o.ratio ?? 1;
      const kt = Math.abs(R - 1) < 1e-9 ? k : (Math.pow(R, k) - 1) / (R - 1);
      const tk = lerpV(t0, t1, kt);
      keys.push([k, orbitPoint(tk, lerp(yaw0, yaw1, k), geo(d0, d1, k), geo(h0, h1, k)), lerp(o.fov ?? 45, o.fovTo ?? o.fov ?? 45, k), tk]);
    }
    const dEnd = Math.hypot(d1, h1);
    return { framing: h1 > d1 * 0.8 ? 'high' : dEnd < 1.8 * s ? 'close' : dEnd < 5 * s ? 'medium' : 'wide', keys };
  },
  // Fester Beobachter mit minimaler Drift (nur, wenn im Bild selbst viel passiert)
  still(o) {
    const s = o.scale ?? 1;
    const d = (o.dist ?? 5) * s;
    const h = (o.height ?? 0.4) * s;
    const yaw = o.yaw ?? 0;
    return {
      framing: d < 1.8 * s ? 'close' : d < 5 * s ? 'medium' : 'wide',
      keys: [[0, orbitPoint(o.target, yaw - 1.5, d, h), o.fov ?? 45], [1, orbitPoint(o.target, yaw + 1.5, d * 0.97, h), o.fov ?? 45]],
    };
  },
};

export const PRESET_NAMES = Object.keys(PRESETS);

// Keyframes einer Einstellung. Rückgabe { framing, keys: [{ t, pos, look, fov }] }.
export function shotKeys(o) {
  const f = PRESETS[o.preset];
  if (!f) throw new Error(`Kamera-Vorlage "${o.preset}" unbekannt (erlaubt: ${PRESET_NAMES.join(', ')})`);
  if (!o.target && !(o.preset === 'track' && o.a)) throw new Error(`Kamera-Vorlage "${o.preset}": target fehlt`);
  if (o.from == null || o.to == null || o.to <= o.from) throw new Error(`Kamera-Vorlage "${o.preset}": from/to ungültig`);
  const r = f(o);
  const keys = r.keys.map(([k, pos, fov, look]) => ({ t: Math.round((o.from + (o.to - o.from) * k) * 1e6) / 1e6, pos: r3(pos), look: r3(look ?? o.target), fov }));
  return { framing: o.framing ?? r.framing, keys };
}
