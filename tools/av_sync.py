#!/usr/bin/env python3
"""Misst den Bild-Ton-Versatz einer fertigen MP4 anhand von Synchron-Markern.

Voraussetzung (nur in Testproduktionen): timeline.json enthält "sync_markers" (Frames) – die Bühne zeigt
dort ein weißes 64×64-Quadrat bei x = 90 %, y = 90 % – und auf denselben Frames liegt der Klang "gen:tick"
(3 kHz). Gemessen wird:
  - Bild: Frames, in denen das Marker-Quadrat weiß ist (signalstats auf dem Ausschnitt)
  - Ton:  Einsätze des 3-kHz-Ticks (Bandpass, 1-ms-Hüllkurve)
Toleranz laut Style-Guide 9.3: ±1 Frame (±33 ms).

  python3 tools/av_sync.py final.mp4 [--json]
"""

import argparse
import array
import json
import re
import subprocess
import sys

W, H = 1080, 1920
MX, MY, MS = int(0.9 * W), int(0.9 * H), 64
FPS = 30


def _yavg_series(path, w, h, x, y):
    vf = f"crop={w}:{h}:{x}:{y},signalstats,metadata=print:file=-"
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-an", "-vf", vf, "-f", "null", "-"],
                         capture_output=True, text=True, check=True).stdout
    vals, n = {}, -1
    for line in out.splitlines():
        if line.startswith("frame:"):
            n = int(re.search(r"frame:(\d+)", line).group(1))
        elif "lavfi.signalstats.YAVG=" in line:
            vals[n] = float(line.split("=")[1])
    return vals


def marker_frames(path):
    """Frames, in denen das Marker-Quadrat weiß ist UND sich deutlich von der Umgebung abhebt.
    Ohne den Umgebungsvergleich würden Weißblenden (ganzes Bild hell) als Marker gezählt."""
    inner = _yavg_series(path, MS - 16, MS - 16, MX + 8, MY + 8)
    ref = _yavg_series(path, MS - 16, MS - 16, MX - MS - 8, MY + 8)  # gleich großes Feld links daneben
    frames = sorted(n for n, v in inner.items() if v > 200 and v - ref.get(n, 255) > 50)
    return [f for i, f in enumerate(frames) if i == 0 or frames[i - 1] != f - 1]


def tick_onsets(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vn", "-af", "pan=mono|c0=c0,bandpass=f=3000:width_type=q:w=8",
                          "-ar", "48000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    a = array.array("f")
    a.frombytes(raw)
    win = 48
    env = [max(abs(x) for x in a[i:i + win]) for i in range(0, len(a) - win, win)]
    if not env:
        return []
    thr = max(env) * 0.25
    out, last = [], -1e9
    for i, v in enumerate(env):
        t = i * win / 48000
        if v > thr and t - last > 0.2:
            out.append(t)
            last = t
    return out


def measure(path):
    marks = [f / FPS for f in marker_frames(path)]
    ticks = tick_onsets(path)
    pairs = []
    for m in marks:
        near = min(ticks, key=lambda t: abs(t - m)) if ticks else None
        pairs.append({"marker_s": round(m, 4), "tick_s": None if near is None else round(near, 4),
                      "offset_ms": None if near is None else round((near - m) * 1000, 2)})
    ok = bool(pairs) and len(ticks) == len(marks) and all(p["offset_ms"] is not None and abs(p["offset_ms"]) <= 1000 / FPS for p in pairs)
    return {"markers": len(marks), "ticks": len(ticks), "pairs": pairs, "ok": ok}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    r = measure(a.video)
    if a.json:
        print(json.dumps(r, indent=1))
    else:
        for p in r["pairs"]:
            print(f"Marker {p['marker_s']:.3f} s ↔ Tick {p['tick_s']} s → Versatz {p['offset_ms']} ms")
        print(f"{'OK' if r['ok'] else 'FEHLER'}: {r['markers']} Marker, {r['ticks']} Ticks, Toleranz ±{1000 / FPS:.1f} ms")
    return 0 if r["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
