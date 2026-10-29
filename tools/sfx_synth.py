#!/usr/bin/env python3
"""Erzeugt lizenzfreie Soundeffekte und Klangflächen ausschließlich mit FFmpeg-Generatoren.

Kein fremdes Audiomaterial, keine Lizenzfrage: Alle Klänge entstehen aus Sinus-/Rauschgeneratoren
mit festen Seeds und sind daher bei jedem Aufruf bit-identisch (deterministisch).

  python3 tools/sfx_synth.py --out <verzeichnis> [--only boom,whoosh] [--drone-seconds 80]

Erzeugt 48-kHz-Stereo-WAV (32-bit float). Die Mischung (tools/audio_mix.py) referenziert sie als "gen:<name>".
"""

import argparse
import os
import subprocess
import sys

SR = 48000


def _env(expr):
    """volume-Filter mit zeitabhängiger Hüllkurve (eval=frame, deterministisch)."""
    return f"volume='{expr}':eval=frame"


# name -> (Dauer s, filter_complex mit Ausgang [out])
SOUNDS = {
    # kurzer Luftzug für Whip-Übergänge
    "whoosh": (0.7, (
        f"anoisesrc=d=0.7:c=pink:r={SR}:a=0.9:s=11,lowpass=f=2600,highpass=f=180,"
        f"{_env('pow(sin(PI*t/0.7),2)')},"
        "pan=stereo|c0=c0|c1=c0,"
        f"{_env('1')}[out]")),
    # tiefer Einschlag mit abfallender Tonhöhe
    "boom": (2.6, (
        f"aevalsrc='0.85*sin(2*PI*(42*t+4*(1-exp(-6*t))))*exp(-2.0*t)':d=2.6:s={SR}[a];"
        f"anoisesrc=d=2.6:c=brown:r={SR}:a=0.6:s=21,lowpass=f=320,{_env('exp(-3.2*t)')}[b];"
        "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # heller Aufprall/Treffer
    "hit": (0.6, (
        f"anoisesrc=d=0.6:c=white:r={SR}:a=0.7:s=31,bandpass=f=1400:width_type=o:w=1.5,{_env('exp(-9*t)')}[a];"
        f"aevalsrc='0.5*sin(2*PI*110*t)*exp(-7*t)':d=0.6:s={SR}[b];"
        "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # ansteigende Spannung (4 s), endet ohne Abriss
    "riser": (4.0, (
        f"aevalsrc='0.35*sin(2*PI*(180*t+60*t*t))*pow(t/4,2)':d=4:s={SR}[a];"
        f"anoisesrc=d=4:c=pink:r={SR}:a=0.5:s=41,highpass=f=800,{_env('pow(t/4,3)')}[b];"
        "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # kurzer, schneller Luftzug für harte Schnitte (Tonhöhe steigt, 0,45 s)
    "swoosh": (0.45, (
        f"anoisesrc=d=0.45:c=pink:r={SR}:a=0.9:s=13,highpass=f=300,lowpass=f=5200,"
        f"{_env('pow(sin(PI*pow(t/0.45,0.7)),3)')},"
        "pan=stereo|c0=0.9*c0|c1=0.6*c0[out]")),
    # tiefer Bass-Schlag: Sub-Drop 70→28 Hz + Rauschknall, lange Ausklingzeit (Schlüsselereignis)
    "impact": (3.2, (
        f"aevalsrc='0.95*sin(2*PI*(28*t+42*0.08*(1-exp(-t/0.08))))*exp(-1.1*t)*min(1,t/0.004)':d=3.2:s={SR}[a];"
        f"anoisesrc=d=3.2:c=brown:r={SR}:a=0.8:s=23,lowpass=f=220,{_env('exp(-2.4*t)*min(1,t/0.003)')}[b];"
        f"anoisesrc=d=3.2:c=white:r={SR}:a=0.5:s=29,bandpass=f=2200:width_type=o:w=2,{_env('exp(-18*t)')}[c];"
        "[a][b][c]amix=inputs=3:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # Grollen unter den Folgen (5 s, schwankend, weich ein- und ausgeblendet)
    "rumble": (5.0, (
        f"anoisesrc=d=5:c=brown:r={SR}:a=0.9:s=37,lowpass=f=140,"
        f"{_env('min(1,t/0.4)*min(1,(5-t)/0.8)*(0.75+0.25*sin(2*PI*1.7*t)*sin(2*PI*0.6*t))')}[a];"
        f"aevalsrc='0.35*sin(2*PI*33*t)*min(1,t/0.4)*min(1,(5-t)/0.8)':d=5:s={SR}[b];"
        "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # Synchron-Marker: 3-kHz-Ton, 80 ms, weiche Flanken (5 ms)
    "tick": (0.08, (
        f"aevalsrc='0.6*sin(2*PI*3000*t)*min(1,min(t/0.005,(0.08-t)/0.005))':d=0.08:s={SR},"
        "pan=stereo|c0=c0|c1=c0[out]")),
}


def drone_graph(seconds):
    """Klangfläche: tiefer Akkord (A-Moll) mit langsamer Schwebung, leichtes Rauschen als Luft."""
    d = seconds
    tones = " + ".join(
        f"{a}*sin(2*PI*{f}*t+{p})*(0.8+0.2*sin(2*PI*{lfo}*t))"
        for a, f, p, lfo in [(0.22, 55, 0.0, 0.07), (0.18, 110, 1.3, 0.05), (0.12, 164.81, 2.1, 0.09),
                             (0.09, 220, 0.7, 0.04), (0.05, 261.63, 2.9, 0.11)]
    )
    return (f"aevalsrc='{tones}':d={d}:s={SR}[a];"
            f"anoisesrc=d={d}:c=pink:r={SR}:a=0.05:s=51,lowpass=f=1200[b];"
            "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")


def render(name, graph, path):
    cmd = ["ffmpeg", "-v", "error", "-y", "-filter_complex", graph, "-map", "[out]",
           "-ar", str(SR), "-ac", "2", "-c:a", "pcm_f32le", "-fflags", "+bitexact", "-flags:a", "+bitexact", path]
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit(f"{name}: ffmpeg-Fehler: {p.stderr[-800:]}")


def synth(out, only=None, drone_seconds=80.0):
    os.makedirs(out, exist_ok=True)
    made = {}
    items = dict(SOUNDS)
    for name, (dur, graph) in items.items():
        if only and name not in only:
            continue
        path = os.path.join(out, f"{name}.wav")
        render(name, graph, path)
        made[name] = path
    if not only or "drone" in only:
        path = os.path.join(out, "drone.wav")
        render("drone", drone_graph(drone_seconds), path)
        made["drone"] = path
    return made


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", required=True)
    ap.add_argument("--only", help="Komma-getrennte Namen")
    ap.add_argument("--drone-seconds", type=float, default=80.0)
    a = ap.parse_args()
    made = synth(a.out, set(a.only.split(",")) if a.only else None, a.drone_seconds)
    for k, v in made.items():
        print(f"{k}: {v}")


if __name__ == "__main__":
    sys.exit(main())
