#!/usr/bin/env python3
"""Klang- und Farbbalance messen (Version 3.0, informativ – keine PASS/FAIL-Wertung).

Hintergrund: Analyse von 6 Videos (VERSION_3_0_CONSOLIDATED_REVIEW.md). Gemessen [M]:
  - Ton: unsere Musik hatte 64–71 % der Energie unter 100 Hz und 0,9–7,2 % bei 2–8 kHz (Referenzen C: 11–24 % / 5–17 %),
    keine Stille (C2: 6 %), Dynamik 21–23 dB (C: 30–48 dB).
  - Bild: unsere Bilder waren GESÄTTIGTER als die Referenzen (34–38 % stark gesättigte Pixel vs. 12–14 %), mit großer
    bunter Akzentfläche (7–10 % vs. 0,5–1,4 %) und schwacher Farbhierarchie (dominanter Farbton 54–67 % vs. 66–92 %).
Diese Kennzahlen sind Orientierung für die Sicht- und Hörprüfung, keine Qualitätsurteile und keine Reichweiten-Ursachen.

Benötigt nur Python 3 (Standardbibliothek) und ffmpeg.

  python3 tools/balance_qa.py productions/<slug>/render/final.mp4 [--out productions/<slug>/qa/balance.json]
"""

import argparse
import colorsys
import json
import math
import re
import subprocess
import sys

# Orientierungswerte aus der Analyse (Median der Referenzgruppe C), nur zur Einordnung im Bericht
REF_C = {"sub_lt100_pct": (11, 24), "presence_2k_8k_pct": (5, 17), "silence_pct": (0.9, 6.0),
         "sat_strong_pct": (12, 14), "accent_area_pct": (0.6, 1.4), "dominant_hue_pct": (66, 74)}
BANDS = [("sub_lt100", None, 100), ("low_100_300", 100, 300), ("mid_300_2k", 300, 2000),
         ("presence_2k_8k", 2000, 8000), ("air_gt8k", 8000, None)]


def band_shares(path):
    """Energieanteile je Band (Butterworth-Filter 4. Ordnung, daher Näherung) über astats-RMS, ein ffmpeg-Lauf je Band."""
    p = []
    for name, lo, hi in BANDS:
        f = ["aformat=channel_layouts=mono"]
        if lo:
            f += [f"highpass=f={lo}:poles=2"] * 2
        if hi:
            f += [f"lowpass=f={hi}:poles=2"] * 2
        f.append("astats=metadata=0")
        err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-vn", "-af", ",".join(f), "-f", "null", "-"],
                             capture_output=True, text=True).stderr
        m = re.findall(r"RMS level dB:\s*(-?[\d.]+|-inf)", err)
        if not m:
            return None
        v = -200.0 if m[-1] == "-inf" else float(m[-1])
        p.append(10 ** (v / 10))
    tot = sum(p) or 1
    return {f"{n}_pct": round(100 * x / tot, 1) for (n, _, _), x in zip(BANDS, p)}


def dynamics(path):
    """Anteil stiller Abschnitte (< −50 dBFS, 0,1-s-Fenster) und Dynamik p95−p5."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "8000", "-f", "s16le", "-"],
                         capture_output=True).stdout
    n = len(raw) // 2
    win = 800
    levels = []
    import array
    a = array.array("h")
    a.frombytes(raw[: n * 2])
    for i in range(0, n - win, win):
        s = 0
        for x in a[i:i + win:4]:
            s += x * x
        rms = math.sqrt(s / (win / 4)) / 32768
        levels.append(20 * math.log10(rms + 1e-9))
    if not levels:
        return {}
    srt = sorted(levels)
    pct = lambda q: srt[min(len(srt) - 1, int(q * len(srt)))]
    return {"silence_pct": round(100 * sum(l < -50 for l in levels) / len(levels), 1),
            "dynamics_p95_p5_db": round(pct(0.95) - pct(0.05), 1)}


def color_stats(path, fps=1.0):
    """Farbhierarchie je Bild (1 Bild/s, 54×96), Median über das Video."""
    W, H = 54, 96
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={fps},scale={W}:{H}", "-f", "rawvideo",
                          "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    fsz = W * H * 3
    rows = []
    for k in range(1, len(raw) // fsz):  # erstes Bild (Einblendung) auslassen
        fr = raw[k * fsz:(k + 1) * fsz]
        hs, strong, n = [], 0, W * H
        sats = []
        for i in range(0, fsz, 3):
            h, s, v = colorsys.rgb_to_hsv(fr[i] / 255, fr[i + 1] / 255, fr[i + 2] / 255)
            sats.append((h, s))
            if s > 0.5:
                strong += 1
        col = [h for h, s in sats if s > 0.25]
        if len(col) > 50:
            hist = [0] * 36
            for h in col:
                hist[min(35, int(h * 36))] += 1
            c = (hist.index(max(hist)) + 0.5) / 36
            d = lambda h: abs(((h - c) + 0.5) % 1 - 0.5)
            dom = 100 * sum(d(h) < 1 / 12 for h in col) / len(col)
            acc = 100 * sum(1 for h, s in sats if s > 0.6 and d(h) >= 1 / 12) / n
        else:
            dom, acc = 100.0, 0.0
        rows.append((100 * strong / n, acc, dom))
    if not rows:
        return {}
    med = lambda i: round(sorted(r[i] for r in rows)[len(rows) // 2], 1)
    return {"sat_strong_pct": med(0), "accent_area_pct": med(1), "dominant_hue_pct": med(2)}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--out")
    args = ap.parse_args()
    res = {"file": args.video, "audio_bands": band_shares(args.video), "audio_dynamics": dynamics(args.video),
           "color": color_stats(args.video), "reference_C_range": REF_C,
           "note": "informativ – Orientierung für Sicht- und Hörprüfung, keine Bewertung"}
    print(json.dumps(res, indent=1, ensure_ascii=False))
    hints = []
    b = res["audio_bands"] or {}
    if b.get("sub_lt100_pct", 0) > 50:
        hints.append(f"Ton: {b['sub_lt100_pct']} % der Energie unter 100 Hz – auf Handylautsprechern kaum hörbar; Hörprüfung am Handy")
    if b and b.get("presence_2k_8k_pct", 100) < 3:
        hints.append(f"Ton: nur {b['presence_2k_8k_pct']} % bei 2–8 kHz – wenig Präsenz/Klangdetail")
    if res["audio_dynamics"].get("silence_pct", 1) == 0:
        hints.append("Ton: keine stille Stelle – Ruhe vor der Pointe prüfen (Guide 18.6/18.13)")
    c = res["color"]
    if c.get("accent_area_pct", 0) > 4:
        hints.append(f"Bild: {c['accent_area_pct']} % bunte Akzentfläche – Farbhierarchie (eine Grundstimmung + ein Akzent) prüfen")
    if c.get("sat_strong_pct", 0) > 30:
        hints.append(f"Bild: {c['sat_strong_pct']} % stark gesättigte Pixel – eher dämpfen als steigern (Analyse: Referenzen 12–14 %)")
    for h in hints:
        print("Hinweis:", h, file=sys.stderr)
    res["hints"] = hints
    if args.out:
        with open(args.out, "w") as fh:
            json.dump(res, fh, indent=1, ensure_ascii=False)


if __name__ == "__main__":
    main()
