#!/usr/bin/env python3
"""Bildfolgen mit voller Bildrate für die Sichtprüfung erzeugen.

Erzeugt pro Zeitpunkt einen Streifen aus 11 aufeinanderfolgenden Frames (±5 Frames)
mit Zeitstempel. Ergänzt die 1-Bild-pro-Sekunde-Kontaktbögen aus video_qa.py, zwischen
denen 29 von 30 Frames nicht angesehen werden.

Beispiele:
  # alle Schnitte, Übergänge und REVIEW-Kandidaten aus einem QA-Bericht
  python3 tools/inspect_frames.py final.mp4 --report qa/report.json --out qa/strips
  # bestimmte Zeitpunkte
  python3 tools/inspect_frames.py final.mp4 --at 3.9,31.95 --out qa/strips
"""

import argparse
import json
import os
import subprocess

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def times_from_report(path):
    r = json.load(open(path))
    v, a = r["video"], r.get("audio", {})
    ts = set(v.get("cuts", []))
    ts.update(w["start"] for w in v.get("motion_transitions", []))
    ts.update(j["t"] for j in v.get("jump_candidates", []))
    ts.update(v.get("flicker_candidates", []))
    ts.update(v.get("isolated_duplicate_frames", []))
    # mit --plan gemessen: auch alle geplanten Übergänge und die dort erwarteten Kandidaten zeigen
    ts.update(w["t"] for w in v.get("planned_transitions", []))
    ts.update(j["t"] for j in v.get("planned_jump_candidates", []))
    ts.update(v.get("planned_flicker_candidates", []))
    ts.update(s["start"] for s in v.get("flash_shots", []))
    ts.update(c["t"] for c in a.get("click_candidates", []))
    ts.update(j["t"] for j in a.get("loudness_jumps", []))
    # benachbarte Zeitpunkte (< 0,3 s) zusammenfassen
    merged = []
    for t in sorted(ts):
        if not merged or t - merged[-1] > 0.3:
            merged.append(t)
    return merged


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--out", required=True)
    ap.add_argument("--at", help="Komma-getrennte Zeitpunkte in Sekunden")
    ap.add_argument("--report", help="report.json aus video_qa.py")
    ap.add_argument("--fps", type=float, default=30.0)
    args = ap.parse_args()
    ts = []
    if args.at:
        ts += [float(x) for x in args.at.split(",") if x.strip()]
    if args.report:
        ts += times_from_report(args.report)
    if not ts:
        raise SystemExit("Keine Zeitpunkte (--at oder --report angeben).")
    os.makedirs(args.out, exist_ok=True)
    # Streifen eines früheren Renders entfernen – sonst werden alte Bilder als aktueller Befund gesichtet
    for f in os.listdir(args.out):
        if f.startswith("strip_") and f.endswith(".jpg"):
            os.remove(os.path.join(args.out, f))
    for t in sorted(set(ts)):
        start = max(0.0, t - 5 / args.fps)
        out = os.path.join(args.out, f"strip_{t:08.3f}.jpg")
        vf = (f"scale=180:-2,drawtext=fontfile={FONT}:text='%{{pts\\:hms\\:{start:.3f}}}':"
              f"x=3:y=3:fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=11x1:padding=2")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{start:.3f}", "-i", args.video,
                        "-vf", vf, "-frames:v", "1", "-q:v", "4", out], check=True)
    print(f"{len(set(ts))} Bildstreifen → {args.out}")


if __name__ == "__main__":
    main()
