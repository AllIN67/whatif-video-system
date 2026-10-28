// Prozedurale Texturen (Canvas, geseedet) – kein fremdes Bildmaterial, keine Lizenzfrage.
import { createNoise, clamp01 } from './noise.js';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function pixels(w, h, fn) {
  const c = canvas(w, h);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b, a = 255] = fn(x, y);
      const i = 4 * (y * w + x);
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
      d[i + 3] = a;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// periodisches Rauschen (kachelbar) über Summe von Sinuswellen mit festen Zufallsphasen
function periodic(rng, waves = 24, maxFreq = 6) {
  const W = [];
  for (let i = 0; i < waves; i++) {
    const fx = Math.round(rng.range(-maxFreq, maxFreq));
    const fy = Math.round(rng.range(-maxFreq, maxFreq));
    if (fx === 0 && fy === 0) continue;
    W.push({ fx, fy, ph: rng.range(0, Math.PI * 2), a: 1 / Math.hypot(fx, fy) });
  }
  const norm = W.reduce((s, w) => s + w.a, 0) * 0.55;
  return (u, v) => W.reduce((s, w) => s + w.a * Math.sin(2 * Math.PI * (w.fx * u + w.fy * v) + w.ph), 0) / norm;
}

export function createTextures(THREE, rng) {
  const N = createNoise(rng);
  const mk = (c, { repeat = [1, 1], srgb = true, wrap = true } = {}) => {
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    if (wrap) {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
    }
    t.repeat.set(repeat[0], repeat[1]);
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  };
  const tex = {};

  // Holzdielen (Boden, Veranda, Tisch)
  tex.planks = (base = [150, 104, 66], rows = 8) =>
    mk(pixels(512, 512, (x, y) => {
      const row = Math.floor((y / 512) * rows);
      const v = (y / 512) * rows - row;
      const off = (row * 0.37) % 1;
      const grain = N.fbm(x / 90 + row * 13, y / 6, 4) * 0.5 + N.n2(x / 9, y / 2.5 + row) * 0.12;
      const seam = v < 0.04 || v > 0.96 ? 0.45 : 1;
      const end = Math.abs(((x / 512 + off) % 0.5) - 0.0) < 0.006 ? 0.55 : 1;
      const tone = 0.82 + 0.25 * N.n2(row * 3.1, 0.5) + grain * 0.35;
      return base.map((c) => Math.min(255, c * tone * seam * end));
    }));

  // Blockhauswand: waagrechte Stämme mit Rundung, Fugen, Ästen
  tex.logs = () =>
    mk(pixels(512, 512, (x, y) => {
      const n = 6;
      const row = Math.floor((y / 512) * n);
      const v = (y / 512) * n - row;
      const round = Math.sin(Math.PI * v);
      const shade = 0.35 + 0.75 * Math.pow(round, 0.6);
      const grain = N.fbm(x / 120 + row * 7, y / 5, 4) * 0.25;
      const knot = Math.max(0, 1 - Math.hypot(((x + row * 97) % 170) - 85, (v - 0.5) * 60) / 9) * 0.5;
      const chink = v < 0.07 || v > 0.93 ? 0.55 : 1;
      const t = (0.9 + grain - knot) * shade * chink;
      return [128 * t + (chink < 1 ? 60 : 0), 88 * t + (chink < 1 ? 52 : 0), 54 * t + (chink < 1 ? 40 : 0)];
    }));

  // Naturstein (Kamin, Fundament)
  tex.stone = () => {
    const cells = [];
    for (let i = 0; i < 70; i++) cells.push([rng.range(0, 1), rng.range(0, 1), rng.range(0.75, 1.15), rng.range(-1, 1)]);
    return mk(pixels(512, 512, (x, y) => {
      const u = x / 512;
      const v = y / 512;
      let d1 = 9;
      let d2 = 9;
      let c = cells[0];
      for (const p of cells) {
        let dx = Math.abs(u - p[0]);
        let dy = Math.abs(v - p[1]) * 1.6;
        dx = Math.min(dx, 1 - dx);
        dy = Math.min(dy, 1.6 - dy);
        const d = Math.hypot(dx, dy);
        if (d < d1) {
          d2 = d1;
          d1 = d;
          c = p;
        } else if (d < d2) d2 = d;
      }
      const edge = clamp01((d2 - d1) * 40);
      const n = N.fbm(x / 40, y / 40, 4) * 0.25;
      const t = (0.35 + 0.65 * edge) * (c[2] + n);
      return [128 * t + c[3] * 8, 124 * t + c[3] * 4, 116 * t];
    }));
  };

  // Flanell kariert (Jacke) – rot/schwarz mit Faserrauschen
  tex.plaid = () =>
    mk(pixels(256, 256, (x, y) => {
      const bx = Math.floor(x / 32) % 2;
      const by = Math.floor(y / 32) % 2;
      const thinX = x % 32 < 3 ? 1 : 0;
      const thinY = y % 32 < 3 ? 1 : 0;
      const dark = bx + by;
      const fib = N.n2(x / 1.5, y / 1.5) * 18;
      const base = dark === 2 ? [36, 18, 18] : dark === 1 ? [112, 30, 28] : [158, 44, 36];
      const hi = thinX || thinY ? 1.25 : 1;
      return base.map((c) => Math.min(255, c * hi + fib));
    }), { repeat: [2, 2] });

  // Strick (Mütze)
  tex.knit = () =>
    mk(pixels(128, 128, (x, y) => {
      const rib = 0.75 + 0.25 * Math.sin((x / 128) * Math.PI * 2 * 14);
      const n = N.n2(x / 2, y / 2) * 10;
      return [70 * rib + n, 78 * rib + n, 66 * rib + n];
    }));

  // Rinde
  tex.bark = () =>
    mk(pixels(256, 256, (x, y) => {
      const s = N.fbm(x / 6, y / 60, 4);
      const t = 0.55 + s * 0.6;
      return [92 * t, 70 * t, 52 * t];
    }));

  // weiche Wolke (Alpha-Textur)
  tex.cloud = (seedShift = 0, dark = false) =>
    mk(pixels(256, 256, (x, y) => {
      const u = x / 256 - 0.5;
      const v = y / 256 - 0.5;
      const r = Math.hypot(u * 1.0, v * 1.9);
      const n = N.fbm(x / 60 + seedShift, y / 60 - seedShift, 5);
      const a = clamp01((0.5 - r) * 3.2 + n * 0.9 - 0.05) * clamp01((0.5 - r) * 6);
      const shade = dark ? 120 + 60 * clamp01(0.5 - v) : 220 + 35 * clamp01(0.4 - v);
      return [shade, shade, shade + 4, 255 * Math.pow(a, 1.3)];
    }), { wrap: false });

  // kachelbarer Nebelschleier
  tex.mist = () => {
    const P = periodic(rng, 40, 5);
    const Q = periodic(rng, 40, 11);
    return mk(pixels(256, 256, (x, y) => {
      const u = x / 256;
      const v = y / 256;
      const a = clamp01(0.45 + 0.55 * P(u, v) + 0.25 * Q(u, v));
      return [255, 255, 255, 255 * a * a];
    }), { srgb: true });
  };

  // runder weicher Punkt (Dampf, Rauch, Gischt, Schnee)
  tex.puff = () =>
    mk(pixels(128, 128, (x, y) => {
      const r = Math.hypot(x - 64, y - 64) / 64;
      const n = N.fbm(x / 18, y / 18, 3) * 0.35;
      const a = clamp01(1 - r) ** 2 * clamp01(0.8 + n);
      return [255, 255, 255, 255 * a];
    }), { wrap: false });

  // Flamme (additiv)
  tex.flame = () =>
    mk(pixels(128, 256, (x, y) => {
      const u = (x - 64) / 64;
      const v = y / 256; // 0 oben
      const width = 0.18 + 0.75 * Math.pow(v, 1.4) * (1 - v) * 2.2;
      const core = clamp01(1 - Math.abs(u) / Math.max(0.05, width));
      const a = core * clamp01((v - 0.04) * 4) * clamp01((1.02 - v) * 3);
      const hot = clamp01(core * 1.4 * v);
      return [255, 120 + 120 * hot, 30 + 150 * hot * hot, 255 * a];
    }), { wrap: false });

  // Wasserfall: senkrechte Schlieren, vertikal kachelbar
  tex.fall = () => {
    const P = periodic(rng, 60, 9);
    return mk(pixels(256, 512, (x, y) => {
      const u = x / 256;
      const v = y / 512;
      const streak = 0.5 + 0.5 * Math.sin(u * 2 * Math.PI * 23 + 3 * P(u * 0.3, v));
      const foam = clamp01(0.5 + 0.6 * P(u, v * 2));
      const t = clamp01(0.55 + 0.35 * streak * foam);
      const edge = clamp01(Math.min(u, 1 - u) * 9);
      return [205 + 50 * t, 222 + 33 * t, 235 + 20 * t, 255 * clamp01(0.45 + 0.55 * t) * edge];
    }));
  };

  // Regentropfen auf Glas (Alpha + Glanz)
  tex.drops = () => {
    const c = canvas(512, 512);
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);
    for (let i = 0; i < 260; i++) {
      const x = rng.range(0, 512);
      const y = rng.range(0, 512);
      const r = rng.range(1.5, 6);
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(0.5, 'rgba(200,215,230,0.35)');
      g.addColorStop(1, 'rgba(120,140,160,0.0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 1.15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Rinnsale
    for (let i = 0; i < 26; i++) {
      let x = rng.range(0, 512);
      ctx.strokeStyle = 'rgba(220,230,240,0.35)';
      ctx.lineWidth = rng.range(1.5, 3.5);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      for (let y = 0; y <= 512; y += 16) {
        x += rng.range(-3, 3);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    return mk(c);
  };

  // Brotkruste / Krume
  tex.crumb = () =>
    mk(pixels(128, 128, (x, y) => {
      const n = N.fbm(x / 5, y / 5, 3);
      const hole = clamp01(1 - (N.n2(x / 7, y / 7) + 0.6) * 1.4);
      const t = 0.9 + n * 0.3 - hole * 0.35;
      return [236 * t, 214 * t, 170 * t];
    }));

  // unregelmäßige Maske für nasse Erde (weiche, ausgefranste Ränder)
  tex.mudMask = () =>
    mk(pixels(128, 256, (x, y) => {
      const u = Math.abs(x / 128 - 0.5) * 2;
      const n = N.fbm(x / 14, y / 14, 4);
      const a = clamp01((0.75 - u + n * 0.55) * 3);
      return [255 * a, 255 * a, 255 * a];
    }), { srgb: false });

  return tex;
}
