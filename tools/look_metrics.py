#!/usr/bin/env python3
"""Bildsprache messen (Qualitäts-Upgrade V4) – eigene Bilder gegen Referenzbilder, mit denselben Zahlen.

Grundsatz aus der Analyse (Mr omi): „Don't ask what it looks like – measure it.“ Der Abstand zwischen zwei Bildsätzen
ist die Arbeitsliste. Informativ, kein PASS/FAIL. Text/HUD liegen mit im Bild (Werte daher als Vergleich lesen).

Kennzahlen je Bild (Mittel/Median je Satz):
  black_pct     Anteil fast schwarzer Pixel (Luma < 0,04) ohne Linien  Referenz: kaum reines Schwarz, „lifted blacks“
  p5            5-%-Quantil der Luma ohne Linien (Schwarzwert)
  chroma_p50    Median der Buntheit (max−min RGB)                    Sättigung NICHT erhöhen (CLAUDE.md) – nur beobachten
  shadow_cool   mittleres (B−R) der Schattenpixel (Luma 0,08–0,3)    > 0 = kühle/violette Schatten, < 0 = braune
  ink_pct       Anteil Kantenpixel, die auf dunklen dünnen Linien liegen (Umriss-Linien)
  depth_ratio   Schärfe Mitte / Schärfe Rand (Laplace-Varianz)       > 1 = Hintergrund/Rand unschärfer (Tiefe)
  sky_grad      Luma oberes Bildband / Band darunter                  ≠ 1 = Himmelsverlauf (nur Außenbilder sinnvoll)
  mobile_ink    ink_pct nach Verkleinerung auf Handy-Größe (540 px Breite) – bleiben die Linien sichtbar?

  python3 tools/look_metrics.py --ours 'dir/*.png' [--ref 'refdir/*.jpg'] [--out bericht.json]
"""

import argparse
import glob
import json
import sys

import numpy as np
from PIL import Image


def luma(a):
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


def box(a, r):
    """Mittelwertfilter (2r+1)² über Integralbild."""
    p = np.pad(a, r + 1, mode="edge")
    c = p.cumsum(0).cumsum(1)
    k = 2 * r + 1
    s = c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]
    return s[: a.shape[0], : a.shape[1]] / (k * k)


def maxf(a, r):
    out = a.copy()
    for dy in range(-r, r + 1):
        out = np.maximum(out, np.roll(a, dy, 0))
    tmp = out.copy()
    for dx in range(-r, r + 1):
        out = np.maximum(out, np.roll(tmp, dx, 1))
    return out


def lap_var(y):
    l = -4 * y + np.roll(y, 1, 0) + np.roll(y, -1, 0) + np.roll(y, 1, 1) + np.roll(y, -1, 1)
    return float(l[2:-2, 2:-2].var())


def line_mask(y):
    r = max(2, round(y.shape[1] / 360))
    return (y < 0.22) & ((maxf(y, r) - y) > 0.18) & ((box(y, r) - y) > 0.06), r


def ink_pct(y):
    gx = np.abs(np.roll(y, -1, 1) - np.roll(y, 1, 1))
    gy = np.abs(np.roll(y, -1, 0) - np.roll(y, 1, 0))
    edge = (gx + gy) > 0.12
    line, r = line_mask(y)
    near_line = maxf(line.astype(np.float32), r) > 0
    n = edge.sum()
    return float((edge & near_line).sum() / n * 100) if n else 0.0


def metrics(path):
    im = Image.open(path).convert("RGB")
    if im.width > 1080:
        im = im.resize((1080, round(im.height * 1080 / im.width)), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float32) / 255.0
    y = luma(a)
    h, w = y.shape
    chroma = a.max(-1) - a.min(-1)
    sh = (y > 0.08) & (y < 0.3)
    lines = maxf(line_mask(y)[0].astype(np.float32), 1) > 0  # Linien zählen nicht als Schwarzfläche (Referenz: „non-ink p5“)
    cy0, cy1, cx0, cx1 = int(h * 0.3), int(h * 0.7), int(w * 0.3), int(w * 0.7)
    center = lap_var(y[cy0:cy1, cx0:cx1])
    rim = np.concatenate([y[: int(h * 0.2)].ravel(), y[int(h * 0.8):].ravel()])
    rim_img = np.concatenate([y[: int(h * 0.2)], y[int(h * 0.8):]], 0)
    small = np.asarray(im.resize((540, round(im.height * 540 / im.width)), Image.LANCZOS), dtype=np.float32) / 255.0
    return {
        "file": path,
        "black_pct": float((y[~lines] < 0.04).mean() * 100),
        "p5": float(np.quantile(y[~lines], 0.05)),
        "chroma_p50": float(np.median(chroma)),
        "shadow_cool": float((a[..., 2][sh] - a[..., 0][sh]).mean()) if sh.any() else 0.0,
        "ink_pct": ink_pct(y),
        "depth_ratio": float(center / max(lap_var(rim_img), 1e-6)),
        "sky_grad": float(y[: int(h * 0.08)].mean() / max(y[int(h * 0.08): int(h * 0.2)].mean(), 1e-6)),
        "mobile_ink": ink_pct(luma(small)),
    }


KEYS = ["black_pct", "p5", "chroma_p50", "shadow_cool", "ink_pct", "depth_ratio", "sky_grad", "mobile_ink"]


def summary(rows):
    return {k: float(np.median([r[k] for r in rows])) for k in KEYS} if rows else {}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ours", required=True, nargs="+", help="Glob(s) eigener Bilder")
    ap.add_argument("--ref", nargs="*", default=[], help="Glob(s) Referenzbilder")
    ap.add_argument("--base", nargs="*", default=[], help="Glob(s) Vorher-Bilder (z. B. alte Version)")
    ap.add_argument("--out")
    o = ap.parse_args()
    sets = {}
    for name, globs in (("base", o.base), ("ours", o.ours), ("ref", o.ref)):
        files = sorted(f for g in globs for f in glob.glob(g))
        if globs and not files:
            sys.exit(f"keine Dateien für --{name}: {globs}")
        if files:
            sets[name] = [metrics(f) for f in files]
    res = {k: {"n": len(v), "median": summary(v), "images": v} for k, v in sets.items()}
    cols = list(res)
    print("Kennzahl".ljust(13) + "".join(f"{c} (n={res[c]['n']})".rjust(16) for c in cols))
    for k in KEYS:
        print(k.ljust(13) + "".join(f"{res[c]['median'][k]:16.3f}" for c in cols))
    if o.out:
        with open(o.out, "w") as f:
            json.dump(res, f, indent=1)


if __name__ == "__main__":
    main()
