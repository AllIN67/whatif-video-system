#!/usr/bin/env python3
"""Mischt die Tonspur einer Produktion aus timeline.json → audio/mix.wav (48 kHz, Stereo, float).

Regeln (Style-Guide 9.3/9.4, 10.1/10.2):
- Effekte starten sample-genau auf dem Frame:  start_sample = frame * 1600  (48000 / 30)
- jeder Clip bekommt 10 ms Ein-/Ausblendung (gegen Knackser an Schnittkanten)
- Mischen in Float ohne automatische Normalisierung; 0,3 s Einblendung (quadratisch) am Anfang und
  ≥ 0,5 s Ausblendung am Ende (kein abrupter Abriss) noch VOR der Lautheitsmessung
- danach lineare Verstärkung auf −14 LUFS (gemessen, bis zu 3 Iterationen) und True-Peak-Limiter mit
  4× Überabtastung bei −1,5 dBTP (Reserve, damit nach AAC ≤ −1 dBTP) – kein dynamischer Ausgleich
- Länge exakt Frames/30 s

timeline.json, Abschnitt "audio":
  "audio": {
    "fade_out": 1.2,
    "beds": [{"src": "gen:drone", "start": 0, "end": 62, "gain_db": -6,
              "automation": [[0, 0], [24, 0], [26, -18], [30, -18], [31, 0]]}],
    "sfx":  [{"src": "gen:boom", "t": 8.0, "gain_db": -3}]
  }
"gen:<name>" verweist auf einen mit tools/sfx_synth.py erzeugten Klang, sonst Pfad relativ zur Produktion.
Zeiten (start, t) müssen auf Frame-Grenzen liegen. automation: [Sekunde relativ zum Videostart, dB].

  python3 tools/audio_mix.py productions/<slug> [--out productions/<slug>/render/audio]
"""

import argparse
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sfx_synth  # noqa: E402

SR = 48000
FPS = 30
SPF = SR // FPS  # 1600 Samples pro Frame
TARGET_I = -14.0
TARGET_TP = -1.5
CLIP_FADE = 0.010


def frame_of(seconds, what):
    f = seconds * FPS
    r = round(f)
    if abs(f - r) > 1e-3:  # 0,001 Frame = 33 µs Toleranz für gerundete Sekundenwerte
        raise ValueError(f"{what}: {seconds} s liegt nicht auf einer Frame-Grenze")
    return r


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError(f"ffmpeg fehlgeschlagen: {' '.join(cmd[:8])} …\n{p.stderr[-1500:]}")
    return p.stderr


def duration_of(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True, check=True).stdout.strip()
    return float(out)


def db_curve_expr(points, offset):
    """Stückweise lineare dB-Kurve als ffmpeg-Ausdruck; t ist die Clip-Zeit, offset = Clipstart (s)."""
    if not points:
        return "1"
    pts = sorted(points)
    T = f"(t+{offset})"
    expr = f"{pts[-1][1]}"
    for (t0, d0), (t1, d1) in reversed(list(zip(pts, pts[1:]))):
        seg = f"({d0}+({d1}-({d0}))*({T}-{t0})/({t1}-{t0}))" if t1 > t0 else f"{d1}"
        expr = f"if(lt({T},{t1}),{seg},{expr})"
    expr = f"if(lt({T},{pts[0][0]}),{pts[0][1]},{expr})"
    return f"pow(10,({expr})/20)"


def resolve(src, prod_dir, gen_dir, need_drone_s):
    if src.startswith("gen:"):
        name = src[4:]
        path = os.path.join(gen_dir, f"{name}.wav")
        if name == "drone":
            if not os.path.exists(path) or duration_of(path) < need_drone_s - 1e-3:
                sfx_synth.synth(gen_dir, {"drone"}, need_drone_s)
        elif not os.path.exists(path):
            sfx_synth.synth(gen_dir, {name})
        return path
    path = os.path.join(prod_dir, src)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Audioquelle fehlt: {path}")
    return path


def measure(path):
    """Integrierte Lautheit (LUFS) und True Peak (dBTP) nach EBU R128."""
    err = run(["ffmpeg", "-v", "verbose", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"])
    I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", err)[-1])
    tp = re.findall(r"Peak:\s+(-?[\d.]+|-inf) dBFS", err)[-1]
    return I, (-120.0 if "inf" in tp else float(tp))


def build_graph(audio, total_frames, prod_dir, gen_dir):
    inputs, chains, labels = [], [], []
    total_s = total_frames / FPS
    beds = audio.get("beds", [])
    need_drone = max([b["end"] - b["start"] for b in beds if b["src"] == "gen:drone"] + [1.0])
    clips = [("bed", b) for b in beds] + [("sfx", s) for s in audio.get("sfx", [])]
    if not clips:
        raise ValueError("audio: keine Clips (beds/sfx)")
    for i, (kind, c) in enumerate(clips):
        path = resolve(c["src"], prod_dir, gen_dir, need_drone)
        inputs += ["-i", path]
        start = c["start"] if kind == "bed" else c["t"]
        f0 = frame_of(start, f"{kind} {c['src']} start")
        if f0 >= total_frames:
            raise ValueError(f"{kind} {c['src']} beginnt nach Videoende")
        src_len = duration_of(path)
        if kind == "bed":
            length = frame_of(c["end"], f"bed {c['src']} end") / FPS - start
            if length > src_len + 1e-3:
                raise ValueError(f"bed {c['src']}: Quelle {src_len:.2f} s kürzer als benötigt {length:.2f} s")
        else:
            length = min(src_len, total_s - start)
        length = round(length * SR) / SR
        f = [f"[{i}:a]aresample={SR}:resampler=soxr", "aformat=sample_fmts=fltp:channel_layouts=stereo",
             f"atrim=end_sample={int(round(length * SR))}", "asetpts=PTS-STARTPTS",
             f"afade=t=in:d={CLIP_FADE}", f"afade=t=out:st={max(0.0, length - CLIP_FADE):.6f}:d={CLIP_FADE}",
             f"volume={c.get('gain_db', 0)}dB"]
        if kind == "bed" and c.get("automation"):
            # Lautstärkeverlauf wird pro Audioblock angewendet: Blöcke auf 48 Samples (1 ms) verkleinern,
            # sonst entstehen hörbare Stufen („Zipper-Noise“) bei schnellen Absenkungen.
            f.append("asetnsamples=n=48:p=0")
            f.append(f"volume='{db_curve_expr(c['automation'], start)}':eval=frame")
        f.append(f"adelay=delays={f0 * SPF}S:all=1")
        lab = f"c{i}"
        chains.append(",".join(f) + f"[{lab}]")
        labels.append(f"[{lab}]")
    n = len(labels)
    total_samples = total_frames * SPF
    mix = f"{''.join(labels)}amix=inputs={n}:normalize=0:duration=longest,apad=whole_len={total_samples},atrim=end_sample={total_samples}[mix]"
    return inputs, ";".join(chains + [mix])


def mix(prod_dir, out_dir=None):
    prod_dir = os.path.abspath(prod_dir)
    tl = json.load(open(os.path.join(prod_dir, "timeline.json")))
    audio = tl.get("audio")
    if not audio:
        raise ValueError("timeline.json enthält keinen Abschnitt 'audio'")
    total_frames = frame_of(tl["duration"], "duration")
    total_samples = total_frames * SPF
    out_dir = os.path.abspath(out_dir or os.path.join(prod_dir, "render", "audio"))
    gen_dir = os.path.join(out_dir, "gen")
    os.makedirs(gen_dir, exist_ok=True)
    pre = os.path.join(out_dir, "premix.wav")
    final = os.path.join(out_dir, "mix.wav")

    fade_out = float(audio.get("fade_out", 1.0))
    if fade_out < 0.5:
        raise ValueError("audio.fade_out muss ≥ 0,5 s sein (Style-Guide 7.4)")
    dur = total_frames / FPS

    # 1) Vormischung inkl. Ein-/Ausblendung und exakter Länge – Blenden VOR der Lautheitsmessung,
    #    sonst senken sie die Gesamtlautheit nach der Normierung wieder ab.
    inputs, graph = build_graph(audio, total_frames, prod_dir, gen_dir)
    graph += (f";[mix]afade=t=in:d=0.3:curve=qua,afade=t=out:st={dur - fade_out:.6f}:d={fade_out},"
              f"apad=whole_len={total_samples},atrim=end_sample={total_samples}[pre]")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", graph, "-map", "[pre]",
         "-ar", str(SR), "-c:a", "pcm_f32le", pre])

    # 2) Lineare Verstärkung auf −14 LUFS + True-Peak-Limiter (4× Überabtastung), höchstens 3 Iterationen.
    #    Kein dynamischer Lautheitsausgleich: Lautstärkeverläufe und bewusste Stille bleiben unverändert.
    limit = 10 ** (TARGET_TP / 20)
    gain = TARGET_I - measure(pre)[0]
    history = []
    for _ in range(3):
        af = (f"volume={gain:.4f}dB,aresample={SR * 4}:resampler=soxr,"
              f"alimiter=limit={limit:.5f}:level=0:latency=1:attack=2:release=60:asc=1,"
              f"aresample={SR}:resampler=soxr,apad=whole_len={total_samples},atrim=end_sample={total_samples}")
        run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", af, "-ar", str(SR), "-c:a", "pcm_f32le", final])
        I, TP = measure(final)
        history.append({"gain_db": round(gain, 3), "lufs": I, "true_peak": TP})
        if abs(I - TARGET_I) <= 0.3 and TP <= -1.0:
            break
        gain += TARGET_I - I

    # Kontrolle
    n = int(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-count_packets", "-show_entries",
                            "stream=duration_ts", "-of", "csv=p=0", final], capture_output=True, text=True).stdout.strip() or 0)
    report = {"file": final, "samples": n, "expected_samples": total_samples, "seconds": n / SR,
              "integrated_lufs": I, "true_peak_dbtp": TP, "iterations": history}
    with open(os.path.join(out_dir, "mix_report.json"), "w") as fh:
        json.dump(report, fh, indent=1)
    if n != total_samples:
        raise RuntimeError(f"Mix hat {n} Samples, erwartet {total_samples}")
    return report


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("production")
    ap.add_argument("--out")
    a = ap.parse_args()
    r = mix(a.production, a.out)
    print(f"Mix: {r['file']} · {r['seconds']:.3f} s · {r['integrated_lufs']} LUFS · TP {r['true_peak_dbtp']} dBTP")


if __name__ == "__main__":
    main()
