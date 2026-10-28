// Geseedetes 2D-Gradientenrauschen (Perlin) + fBm/Ridged – rein funktional, keine Zeitabhängigkeit.
export function createNoise(rng) {
  const p = new Uint8Array(512);
  const perm = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const grad = (h, x, y) => {
    const g = h & 7;
    const u = g < 4 ? x : y;
    const v = g < 4 ? y : x;
    return ((g & 1) ? -u : u) + ((g & 2) ? -2 * v : 2 * v);
  };
  function n2(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const a = p[X] + Y;
    const b = p[X + 1] + Y;
    const l1 = grad(p[a], x, y) + u * (grad(p[b], x - 1, y) - grad(p[a], x, y));
    const l2 = grad(p[a + 1], x, y - 1) + u * (grad(p[b + 1], x - 1, y - 1) - grad(p[a + 1], x, y - 1));
    return 0.36 * (l1 + v * (l2 - l1)); // ≈ −1..1
  }
  function fbm(x, y, oct = 5, lac = 2.03, gain = 0.5) {
    let s = 0;
    let a = 1;
    let n = 0;
    for (let i = 0; i < oct; i++) {
      s += a * n2(x, y);
      n += a;
      a *= gain;
      x *= lac;
      y *= lac;
    }
    return s / n;
  }
  function ridged(x, y, oct = 5) {
    let s = 0;
    let a = 0.5;
    let w = 1;
    for (let i = 0; i < oct; i++) {
      let r = 1 - Math.abs(n2(x, y));
      r *= r;
      r *= w;
      w = Math.min(1, Math.max(0, r * 2));
      s += r * a;
      a *= 0.5;
      x *= 2.05;
      y *= 2.05;
    }
    return s; // ≈ 0..1
  }
  return { n2, fbm, ridged };
}

export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const smooth = (x) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
export const lerp = (a, b, x) => a + (b - a) * x;
// weicher Übergang von 0 auf 1 zwischen a und b
export const ramp = (t, a, b) => smooth((t - a) / (b - a));
