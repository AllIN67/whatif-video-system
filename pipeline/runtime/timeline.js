// Globale Zeitachse – reine Funktionen ohne DOM, ohne Uhr. Läuft im Browser und in Node (Tests).
// Alles, was ein Bild bestimmt, wird hier aus dem Frame-Index abgeleitet.
//
// Zeiten stehen in timeline.json in Sekunden; intern wird mit ganzen Frames gerechnet.
// Einstellungsgrenzen müssen exakt auf Frame-Grenzen liegen, sonst bricht prepare() ab.

export const EASE = {
  linear: (x) => x,
  in: (x) => x * x * x,
  out: (x) => 1 - Math.pow(1 - x, 3),
  inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  inOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  hold: () => 0,
};

// Übergänge laut Style-Guide 7.2. Grenzwerte: [min, max] Frames gesamt.
export const TRANSITIONS = {
  cut: [0, 0],
  whip: [6, 12],
  dip: [4, 6], // 2–3 Frames ab- und 2–3 Frames aufblenden
  flash: [2, 10],
};

const clamp01 = (x) => Math.min(1, Math.max(0, x));

export function toFrame(seconds, fps, what) {
  const f = seconds * fps;
  const r = Math.round(f);
  // Toleranz 0,001 Frame (33 µs), damit gerundete Sekundenwerte wie 3.333333 gültig sind
  if (Math.abs(f - r) > 1e-3) throw new Error(`${what}: ${seconds} s liegt nicht auf einer Frame-Grenze (fps ${fps})`);
  return r;
}

const lerp = (a, b, x) => a + (b - a) * x;
const lerpV = (a, b, x) => (Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], x)) : lerp(a, b, x));

// Catmull-Rom (zentripetal genügt hier nicht; uniform reicht für weiche Kamerafahrten durch Keyframes)
function catmull(p0, p1, p2, p3, x) {
  const x2 = x * x;
  const x3 = x2 * x;
  const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * x + (2 * a - 5 * b + 4 * c - d) * x2 + (-a + 3 * b - 3 * c + d) * x3);
  return Array.isArray(p1) ? p1.map((_, i) => f(p0[i], p1[i], p2[i], p3[i])) : f(p0, p1, p2, p3);
}

// keys: [{t, v}] (t in Sekunden, aufsteigend). mode: Name aus EASE oder 'catmull'.
export function interpolate(keys, t, mode = 'inOut') {
  if (!keys || keys.length === 0) throw new Error('interpolate: keine Keyframes');
  if (t <= keys[0].t) return keys[0].v;
  const last = keys[keys.length - 1];
  if (t >= last.t) return last.v;
  let i = 0;
  while (i < keys.length - 2 && t >= keys[i + 1].t) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const x = clamp01((t - a.t) / (b.t - a.t));
  if (mode === 'catmull') {
    const p0 = keys[Math.max(0, i - 1)].v;
    const p3 = keys[Math.min(keys.length - 1, i + 2)].v;
    return catmull(p0, a.v, b.v, p3, x);
  }
  const ease = EASE[b.ease || mode];
  if (!ease) throw new Error(`Unbekannte Ease-Kurve "${b.ease || mode}"`);
  return lerpV(a.v, b.v, ease(x));
}

// Bereitet timeline.json vor: Frames berechnen, Lücken/Überlappungen/Grenzwerte prüfen.
export function prepare(tl) {
  const fps = tl.fps || 30;
  if (fps !== 30) throw new Error('Nur 30 fps erlaubt (Style-Guide 10.1)');
  const total = toFrame(tl.duration, fps, 'duration');
  if (!Array.isArray(tl.shots) || tl.shots.length === 0) throw new Error('timeline.shots fehlt');
  const shots = tl.shots.map((s, i) => {
    const from = toFrame(s.from, fps, `shot ${s.id}.from`);
    const to = toFrame(s.to, fps, `shot ${s.id}.to`);
    if (to <= from) throw new Error(`shot ${s.id}: to ≤ from`);
    const tr = s.transition_in || { type: 'cut' };
    if (i === 0 && tr.type !== 'cut') throw new Error('Erste Einstellung muss hart beginnen (Frame 0 zeigt sofort die Szene)');
    const lim = TRANSITIONS[tr.type];
    if (!lim) throw new Error(`shot ${s.id}: unbekannter Übergang "${tr.type}" (erlaubt: ${Object.keys(TRANSITIONS).join(', ')})`);
    const frames = tr.type === 'cut' ? 0 : tr.frames ?? lim[1];
    if (frames < lim[0] || frames > lim[1]) throw new Error(`shot ${s.id}: ${tr.type} mit ${frames} Frames außerhalb ${lim[0]}–${lim[1]}`);
    const keys = (s.camera?.keys || []).map((k) => ({ ...k, t: k.t }));
    if (keys.length === 0) throw new Error(`shot ${s.id}: camera.keys fehlt`);
    // Standard linear: Bewegung läuft über die ganze Einstellung, ohne Abbremsen bis zum Stillstand an Anfang/Ende
    // (inOut ließ Frame 0 praktisch unbewegt wirken – Style-Guide 2 verlangt Bewegung ab Frame 0).
    return { ...s, index: i, from, to, transition: { ...tr, frames }, camKeys: keys, camMode: s.camera.mode || 'linear' };
  });
  if (shots[0].from !== 0) throw new Error('Erste Einstellung muss bei 0 beginnen');
  for (let i = 1; i < shots.length; i++) {
    if (shots[i].from !== shots[i - 1].to) throw new Error(`Lücke/Überlappung zwischen ${shots[i - 1].id} und ${shots[i].id}`);
    const half = Math.ceil(shots[i].transition.frames / 2);
    if (shots[i - 1].to - shots[i - 1].from < half + 4 || shots[i].to - shots[i].from < half + 4) {
      throw new Error(`Übergang zu ${shots[i].id} ist länger als eine der Einstellungen erlaubt`);
    }
  }
  if (shots[shots.length - 1].to !== total) throw new Error(`Letzte Einstellung endet bei Frame ${shots[shots.length - 1].to}, Video hat ${total}`);
  for (const s of shots) if (s.to - s.from < 4) throw new Error(`shot ${s.id}: kürzer als 4 Frames (Blitzbild)`);
  return { ...tl, fps, total, shots };
}

export function shotIndexAt(ptl, frame) {
  for (let i = ptl.shots.length - 1; i >= 0; i--) if (frame >= ptl.shots[i].from) return i;
  return 0;
}

// Zustand des Übergangs am Frame: Overlay (dip/flash), Kamera-Gierwinkel und Unschärfe (whip).
export function transitionAt(ptl, frame) {
  const out = { overlay: 0, overlayColor: null, yaw: 0, blur: 0 };
  for (let i = 1; i < ptl.shots.length; i++) {
    const s = ptl.shots[i];
    const tr = s.transition;
    if (tr.type === 'cut' || tr.frames === 0) continue;
    const b = s.from; // erster Frame der neuen Einstellung
    const k = tr.frames;
    const before = Math.ceil(k / 2);
    const after = k - before;
    if (frame < b - before || frame >= b + after) continue;
    if (tr.type === 'dip') {
      // Abdunkeln bis max. 0.6 (kein Schwarzbild), danach wieder aufhellen
      const p = frame < b ? (frame - (b - before) + 1) / (before + 1) : 1 - (frame - b + 1) / (after + 1);
      out.overlay = 0.6 * clamp01(p);
      out.overlayColor = tr.color || '#000000';
    } else if (tr.type === 'flash') {
      // Weißblende, Spitze am Grenzframe, max. 0.85 (kein reines Weißbild)
      const p = frame < b ? (frame - (b - before) + 1) / (before + 1) : 1 - (frame - b) / (after + 1);
      out.overlay = 0.85 * EASE.inOutSine(clamp01(p));
      out.overlayColor = tr.color || '#ffffff';
    } else if (tr.type === 'whip') {
      const dir = tr.direction === 'left' ? 1 : -1;
      const angle = (tr.angle ?? 35) * (Math.PI / 180);
      if (frame < b) {
        const p = (frame - (b - before) + 1) / before; // 0..1 → beschleunigt aus Einstellung A heraus
        out.yaw = dir * angle * EASE.in(p);
      } else {
        const p = (frame - b + 1) / (after + 1); // kommt in Einstellung B an und bremst ab
        out.yaw = -dir * angle * (1 - EASE.out(p));
      }
      const g = (frame - (b - before) + 0.5) / k;
      out.blur = (tr.blur ?? 28) * Math.sin(Math.PI * clamp01(g));
    }
  }
  return out;
}

// Kamera am Frame: Position, Blickziel, Brennweite (FOV) + Gierwinkel aus Übergang + Wackeln.
export function cameraAt(ptl, frame) {
  const t = frame / ptl.fps;
  const s = ptl.shots[shotIndexAt(ptl, frame)];
  const pos = interpolate(s.camKeys.map((k) => ({ t: k.t, v: k.pos, ease: k.ease })), t, s.camMode);
  const look = interpolate(s.camKeys.map((k) => ({ t: k.t, v: k.look, ease: k.ease })), t, s.camMode);
  const fov = interpolate(s.camKeys.map((k) => ({ t: k.t, v: k.fov ?? 50, ease: k.ease })), t, s.camMode);
  const shake = [0, 0, 0];
  for (const sh of s.shake || []) {
    if (t < sh.t || t > sh.t + sh.dur) continue;
    const x = (t - sh.t) / sh.dur;
    const amp = sh.amp * (1 - x) * (1 - x);
    const w = 2 * Math.PI * (sh.freq ?? 9);
    shake[0] += amp * Math.sin(w * t);
    shake[1] += amp * 0.7 * Math.sin(w * 1.37 * t + 1.1);
    shake[2] += amp * 0.4 * Math.sin(w * 0.73 * t + 2.3);
  }
  const tr = transitionAt(ptl, frame);
  return { t, shot: s.id, pos: pos.map((v, i) => v + shake[i]), look, fov, yaw: tr.yaw, blur: tr.blur, overlay: tr.overlay, overlayColor: tr.overlayColor };
}

// Deckkraft eines zeitlich begrenzten Elements mit weicher Ein-/Ausblendung (Sekunden).
export function fadeOpacity(t, tin, tout, fadeIn = 0.25, fadeOut = 0.25) {
  if (t < tin || t >= tout) return 0;
  const a = fadeIn > 0 ? clamp01((t - tin) / fadeIn) : 1;
  const b = fadeOut > 0 ? clamp01((tout - t) / fadeOut) : 1;
  return Math.min(a, b);
}

// HUD-Zustand: aktives Segment (Label-Wechsel) + Wert + Fortschritt 0..1
export function hudAt(ptl, t) {
  const segs = ptl.hud || [];
  let seg = null;
  for (const s of segs) if (t >= s.from) seg = s;
  if (!seg) return null;
  const keys = seg.value.keys.map(([kt, v]) => ({ t: kt, v }));
  const value = interpolate(keys, t, seg.value.ease || 'linear');
  // Fortschrittsskala: standardmäßig Weg vom ersten zum letzten Wert des Segments; mit seg.bar = [a, b]
  // fester Bezug (z. B. verbleibende Lebenszeit von 0 bis zur vollen Spanne), unabhängig von den Keyframes.
  const [v0, v1] = seg.bar || [keys[0].v, keys[keys.length - 1].v];
  const progress = v1 === v0 ? 1 : clamp01((value - v0) / (v1 - v0));
  return { id: seg.id, value, progress, decimals: seg.decimals ?? 0, final: seg.final || null, segFrom: seg.from };
}
