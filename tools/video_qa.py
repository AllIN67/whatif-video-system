#!/usr/bin/env python3
"""Technische Video-Analyse und QA-Abnahme.

Benötigt nur Python 3 (Standardbibliothek) und ffmpeg/ffprobe.

Zwei Modi:
  reference  – misst und dokumentiert (keine Abnahme, keine PASS/FAIL-Wertung)
  render     – misst und bewertet gegen die Produktionsstandards aus
               WHATIF_STYLE_GUIDE.md (Abschnitt 10/11) → PASS / REVIEW / FAIL

Beispiele:
  python3 tools/video_qa.py references/videos/R01_*.mp4 --out references/analysis/R01 --mode reference
  python3 tools/video_qa.py productions/<slug>/render/final.mp4 --out productions/<slug>/qa --mode render

Ausgabe im --out-Verzeichnis:
  report.json / report.md      Messwerte, Auffälligkeiten, Bewertung
  frames.tsv                   pro Frame: Zeit, Helligkeit (YAVG), Bilddifferenz (YDIF), Schnitt-Score
  sheet_XX.jpg                 Kontaktbögen (1 Bild/s mit Zeitstempel)
  hook.jpg                     erste 3 s mit 5 Bildern/s
  shots.jpg                    ein Bild pro erkannter Einstellung (Mitte der Einstellung)

Wichtig: Die automatischen Prüfungen finden Kandidaten. Sie ersetzen nicht die
Sichtprüfung der Kontaktbögen und das Anhören der Tonspur. Jede Auffälligkeit
mit Zeitstempel muss manuell bestätigt oder verworfen werden.
"""

import argparse
import json
import math
import os
import re
import statistics
import subprocess
import sys

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Schwellenwerte. Bewusst konservativ: lieber ein Kandidat zu viel zur Sichtprüfung.
CUT_SCORE = 10.0          # scdet-Score (0–100), ab dem ein Frame als Schnitt gilt
DUP_YDIF = 0.02           # YDIF darunter = Frame praktisch identisch mit Vorgänger
MOTION_YDIF = 1.0         # YDIF darüber = Bewegung im Bild
FLASH_SHOT_FRAMES = 4     # Einstellungen kürzer als das = Blitzbild/Sprungverdacht
JUMP_FACTOR = 6.0         # YDIF-Spitze > Faktor × lokaler Median (ohne Schnitt) = Sprungverdacht
JUMP_MIN_YDIF = 6.0
FLICKER_DELTA = 6.0       # |ΔYAVG| zwischen Frames, Vorzeichenwechsel innerhalb 3 Frames
FREEZE_MIN_S = 0.5        # Standbild-Phasen ab dieser Länge werden gemeldet
WHIP_YDIF = 14.0          # Bewegungsübergang (Whip/Fast-Move): ≥3 Frames über diesem YDIF …
WHIP_FACTOR = 3.0         # … und über Faktor × lokalem Grundniveau (Median ±2 s)
WHIP_MIN_FRAMES = 3

# Render-Standards (siehe WHATIF_STYLE_GUIDE.md, Abschnitt 10)
RENDER_SPEC = {
    "width": 1080,
    "height": 1920,
    "fps": 30.0,
    "vcodec": "h264",
    "pix_fmt": "yuv420p",
    "acodec": "aac",
    "sample_rate": 48000,
    "lufs_min": -15.0,
    "lufs_max": -13.0,
    "true_peak_max": -1.0,
    "av_duration_diff_max": 0.10,
}


def run(cmd, capture="stderr"):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                       errors="replace")
    if p.returncode != 0:
        sys.stderr.write(p.stderr[-2000:])
        raise SystemExit(f"Befehl fehlgeschlagen: {' '.join(cmd[:6])} …")
    return p.stdout if capture == "stdout" else p.stderr


def probe(path):
    out = run(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", path],
              capture="stdout")
    data = json.loads(out)
    v = next((s for s in data["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in data["streams"] if s["codec_type"] == "audio"), None)

    def rate(r):
        n, d = r.split("/")
        return float(n) / float(d) if float(d) else 0.0

    info = {"duration": float(data["format"]["duration"]),
            "size_bytes": int(data["format"]["size"]),
            "bitrate_kbps": round(int(data["format"].get("bit_rate", 0)) / 1000)}
    if v:
        info["video"] = {
            "codec": v["codec_name"], "width": v["width"], "height": v["height"],
            "pix_fmt": v.get("pix_fmt"),
            "r_frame_rate": rate(v["r_frame_rate"]), "avg_frame_rate": rate(v["avg_frame_rate"]),
            "nb_frames": int(v["nb_frames"]) if v.get("nb_frames") else None,
            "duration": float(v.get("duration", 0) or 0),
            "start_time": float(v.get("start_time", 0) or 0),
            "aspect": round(v["width"] / v["height"], 4),
        }
    if a:
        info["audio"] = {
            "codec": a["codec_name"], "sample_rate": int(a["sample_rate"]),
            "channels": a["channels"], "duration": float(a.get("duration", 0) or 0),
            "start_time": float(a.get("start_time", 0) or 0),
        }
    return info


def detect_crop(path, width, height):
    """Erkennt Letterbox-/Pillarbox-Balken. Ohne Zuschnitt verdünnen schwarze Balken
    die Bilddifferenz so stark, dass harte Schnitte nicht erkannt werden."""
    err = run(["ffmpeg", "-nostats", "-i", path, "-map", "0:v:0", "-vf",
               "fps=2,cropdetect=limit=24:round=2:reset=0", "-f", "null", "-"])
    crops = re.findall(r"crop=(\d+):(\d+):(\d+):(\d+)", err)
    if not crops:
        return None
    w, h, x, y = (int(v) for v in crops[-1])
    if w * h < 0.9 * width * height and w > 0 and h > 0:
        return {"w": w, "h": h, "x": x, "y": y,
                "content_ratio": round(w * h / (width * height), 3)}
    return None


def video_pass(path, outdir, crop=None):
    meta = os.path.join(outdir, "_meta.txt")
    pre = f"crop={crop['w']}:{crop['h']}:{crop['x']}:{crop['y']}," if crop else ""
    vf = (f"{pre}scdet=threshold={CUT_SCORE},signalstats,"
          f"blackdetect=d=0.03:pix_th=0.10,"
          f"freezedetect=n=0.002:d={FREEZE_MIN_S},"
          f"metadata=print:file={meta}")
    err = run(["ffmpeg", "-v", "info", "-nostats", "-i", path, "-map", "0:v:0", "-vf", vf,
               "-f", "null", "-"])
    frames = []
    cur = None
    with open(meta) as fh:
        for line in fh:
            if line.startswith("frame:"):
                m = re.search(r"pts_time:([\d.]+)", line)
                cur = {"t": float(m.group(1)), "yavg": None, "ydif": None, "scd": 0.0}
                frames.append(cur)
            elif cur is not None:
                k, _, val = line.strip().partition("=")
                if k == "lavfi.signalstats.YAVG":
                    cur["yavg"] = float(val)
                elif k == "lavfi.signalstats.YDIF":
                    cur["ydif"] = float(val)
                elif k == "lavfi.scd.score":
                    cur["scd"] = float(val)
    os.remove(meta)
    black = [(float(s), float(e)) for s, e in
             re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", err)]
    fs = [float(x) for x in re.findall(r"freeze_start: ([\d.]+)", err)]
    fe = [float(x) for x in re.findall(r"freeze_end: ([\d.]+)", err)]
    freezes = list(zip(fs, fe + [frames[-1]["t"]] * (len(fs) - len(fe))))
    with open(os.path.join(outdir, "frames.tsv"), "w") as fh:
        fh.write("n\tt\tyavg\tydif\tscd\n")
        for i, f in enumerate(frames):
            fh.write(f"{i}\t{f['t']:.3f}\t{f['yavg']:.2f}\t{f['ydif']:.2f}\t{f['scd']:.2f}\n")
    return frames, black, freezes


def analyse_frames(frames, fps):
    n = len(frames)
    ydif = [f["ydif"] or 0.0 for f in frames]
    yavg = [f["yavg"] or 0.0 for f in frames]

    # Zeitstempel-Regelmäßigkeit (VFR, fehlende/doppelte Zeitstempel)
    deltas = [frames[i]["t"] - frames[i - 1]["t"] for i in range(1, n)]
    nominal = 1.0 / fps if fps else statistics.median(deltas)
    irregular = [round(frames[i]["t"], 3) for i in range(1, n)
                 if abs(deltas[i - 1] - nominal) > nominal * 0.5]

    # Harte Schnitte
    cut_idx = [i for i in range(1, n) if frames[i]["scd"] >= CUT_SCORE]
    cut_set = set(cut_idx)

    # Bewegungsübergänge: mehrere Frames hoher Bilddifferenz ohne harten Schnitt
    # (schnelle Kamerafahrt/Whip mit Bewegungsunschärfe als Szenenwechsel)
    whips = []
    i = 1
    while i < n:
        if ydif[i] > WHIP_YDIF and i not in cut_set:
            j = i
            while j + 1 < n and ydif[j + 1] > WHIP_YDIF and j + 1 not in cut_set:
                j += 1
            if j - i + 1 >= WHIP_MIN_FRAMES:
                ctx = ydif[max(1, i - 60):i] + ydif[j + 1:j + 61]
                base = statistics.median(ctx) if ctx else 0.0
                peak = max(ydif[i:j + 1])
                if peak > WHIP_FACTOR * max(base, 1.0):
                    whips.append({"start": round(frames[i]["t"], 3), "end": round(frames[j]["t"], 3),
                                  "frames": j - i + 1, "peak_ydif": round(peak, 1),
                                  "baseline_ydif": round(base, 1), "mid_n": (i + j) // 2})
            i = j + 1
        else:
            i += 1

    # Teile eines Übergangs, die durch kurze ruhigere Frames getrennt sind, zusammenfassen
    merged = []
    for w in whips:
        if merged and w["start"] - merged[-1]["end"] < 0.4:
            m = merged[-1]
            m["frames"] = int(round((w["end"] - m["start"]) * fps)) + 1
            m["end"] = w["end"]
            m["peak_ydif"] = max(m["peak_ydif"], w["peak_ydif"])
            m["mid_n"] = int(round((m["start"] + m["end"]) / 2 * fps))
        else:
            merged.append(dict(w))
    whips = merged

    # Einstellungen: getrennt an harten Schnitten und an der Mitte von Bewegungsübergängen
    bounds = sorted(set([0] + cut_idx + [w["mid_n"] for w in whips] + [n]))
    shots = []
    for a, b in zip(bounds, bounds[1:]):
        if b > a:
            shots.append({"start": round(frames[a]["t"], 3), "frames": b - a,
                          "dur": round((b - a) / fps, 3), "mid_n": (a + b - 1) // 2})
    flash = [s for s in shots if s["frames"] < FLASH_SHOT_FRAMES and s is not shots[-1]]

    # Isolierte Doppelbilder mitten in Bewegung (typisches Ruckeln)
    dups = []
    for i in range(2, n - 2):
        if ydif[i] < DUP_YDIF and min(ydif[i - 1], ydif[i + 1]) > MOTION_YDIF:
            dups.append(round(frames[i]["t"], 3))
    # Rhythmische Doppelbilder (z. B. 24→30 fps Pulldown) – Anteil im Bewegungsbereich
    moving = [i for i in range(1, n) if max(ydif[max(1, i - 3):i + 4]) > MOTION_YDIF]
    dup_in_motion = sum(1 for i in moving if ydif[i] < DUP_YDIF)
    dup_ratio = dup_in_motion / len(moving) if moving else 0.0

    # Sprungverdacht: einzelne YDIF-Spitze ohne Schnitt-Score und außerhalb von Übergängen
    jumps = []
    in_whip = set()
    for w in whips:
        a_ = int(round(w["start"] * fps)) - 2
        in_whip.update(range(a_, a_ + w["frames"] + 5))
    for i in range(1, n):
        if i in cut_set or i - 1 in cut_set or i + 1 in cut_set or i in in_whip:
            continue
        win = ydif[max(1, i - 15):i] + ydif[i + 1:i + 16]
        med = statistics.median(win) if win else 0.0
        if ydif[i] > JUMP_MIN_YDIF and ydif[i] > JUMP_FACTOR * max(med, 0.5):
            jumps.append({"t": round(frames[i]["t"], 3), "ydif": round(ydif[i], 2),
                          "local_median": round(med, 2)})

    # Flackern: Helligkeit springt hin und zurück
    flicker = []
    for i in range(1, n - 3):
        d1 = yavg[i] - yavg[i - 1]
        if abs(d1) < FLICKER_DELTA or i in cut_set:
            continue
        for j in range(i + 1, min(i + 4, n)):
            d2 = yavg[j] - yavg[j - 1]
            if abs(d2) >= FLICKER_DELTA and (d1 > 0) != (d2 > 0) and j not in cut_set:
                flicker.append(round(frames[i]["t"], 3))
                break

    durs = [s["dur"] for s in shots]
    return {
        "frame_count": n,
        "timestamp_irregularities": irregular[:50],
        "timestamp_irregularity_count": len(irregular),
        "cuts": [round(frames[i]["t"], 3) for i in cut_idx],
        "cut_count": len(cut_idx),
        "motion_transitions": whips,
        "motion_transition_count": len(whips),
        "shots": shots,
        "shot_stats": {
            "count": len(shots),
            "median_s": round(statistics.median(durs), 2) if durs else None,
            "mean_s": round(statistics.mean(durs), 2) if durs else None,
            "min_s": round(min(durs), 2) if durs else None,
            "max_s": round(max(durs), 2) if durs else None,
            "cuts_per_10s": round(len(cut_idx) / (n / fps) * 10, 2) if n else None,
            "shot_changes_per_10s": round((len(shots) - 1) / (n / fps) * 10, 2) if n else None,
        },
        "flash_shots": flash,
        "isolated_duplicate_frames": dups,
        "duplicate_ratio_in_motion": round(dup_ratio, 3),
        "jump_candidates": jumps,
        "flicker_candidates": flicker,
        "first_cut_s": round(frames[cut_idx[0]]["t"], 3) if cut_idx else None,
        "first_shot_change_s": shots[1]["start"] if len(shots) > 1 else None,
        "mean_luma": round(statistics.mean(yavg), 1),
        "mean_motion_ydif": round(statistics.mean(ydif), 2),
    }


def audio_pass(path, outdir, duration):
    res = {}
    err = run(["ffmpeg", "-v", "verbose", "-nostats", "-i", path, "-map", "0:a:0", "-af",
               "ebur128=peak=true:framelog=verbose", "-f", "null", "-"])
    m = re.search(r"Integrated loudness:\s+I:\s+(-?[\d.]+|-inf) LUFS.*?LRA:\s+(-?[\d.]+) LU"
                  r".*?True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS", err, re.S)
    if m:
        res["integrated_lufs"] = float(m.group(1))
        res["lra_lu"] = float(m.group(2))
        res["true_peak_dbtp"] = float(m.group(3))
    mom = [(float(t), float(mm)) for t, mm in
           re.findall(r"t:\s*([\d.]+)\s+TARGET.*?M:\s*(-?[\d.]+)", err)]
    st = [(float(t), float(x)) for t, x in
          re.findall(r"t:\s*([\d.]+)\s+TARGET.*?S:\s*(-?[\d.]+)", err)]
    # Lautheitsverlauf (Short-Term, 3-s-Fenster) im 1-s-Raster – für die Audio-Dramaturgie
    prof, last = [], -1
    for t, x in st:
        if int(t) != last and t >= 1.0:
            last = int(t)
            prof.append([last, None if x < -70 else round(x, 1)])
    res["short_term_lufs_per_s"] = prof
    # Lautheitssprünge: Momentary-Lautheit steigt in ≤0,3 s um >12 LU (nach Stille ausgenommen)
    jumps = []
    for i in range(3, len(mom)):
        prev = mom[i - 3][1]
        if prev > -45 and mom[i][1] - prev > 12:
            if not jumps or mom[i][0] - jumps[-1]["t"] > 1.0:
                jumps.append({"t": round(mom[i][0], 2), "from_lufs": prev, "to_lufs": mom[i][1]})
    res["loudness_jumps"] = jumps

    err = run(["ffmpeg", "-nostats", "-i", path, "-map", "0:a:0", "-af",
               "silencedetect=n=-45dB:d=0.4", "-f", "null", "-"])
    ss = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", err)]
    se = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    res["silences"] = [{"start": round(max(s, 0), 2), "end": round(e, 2)}
                       for s, e in zip(ss, se + [duration] * (len(ss) - len(se)))]

    err = run(["ffmpeg", "-nostats", "-i", path, "-map", "0:a:0", "-af", "astats=measure_perchannel=none",
               "-f", "null", "-"])
    for key, name in [("Peak level dB", "peak_dbfs"), ("RMS level dB", "rms_dbfs"),
                      ("Flat factor", "flat_factor"), ("Peak count", "peak_count"),
                      ("DC offset", "dc_offset"), ("Number of NaNs", "nans")]:
        mm = re.search(rf"{key}:\s*(-?[\d.e+-]+|-?inf)", err)
        if mm:
            res[name] = float(mm.group(1))

    # Klick-/Knackser-Kandidaten: Hochpass-Energie in 10-ms-Fenstern, Spitze weit über Umgebung
    meta = os.path.join(outdir, "_ameta.txt")
    run(["ffmpeg", "-nostats", "-i", path, "-map", "0:a:0", "-af",
         f"aformat=channel_layouts=mono,highpass=f=5000,asetnsamples=n=480:p=0,"
         f"astats=metadata=1:reset=1:measure_overall=Peak_level+RMS_level:measure_perchannel=none,"
         f"ametadata=print:file={meta}", "-f", "null", "-"])
    win = []
    cur_t = None
    with open(meta) as fh:
        for line in fh:
            if line.startswith("frame:"):
                cur_t = float(re.search(r"pts_time:([\d.]+)", line).group(1))
            elif "Overall.Peak_level=" in line:
                v = line.split("=")[1]
                win.append((cur_t, -120.0 if "inf" in v else float(v)))
    os.remove(meta)
    clicks = []
    vals = [v for _, v in win]
    for i in range(len(win)):
        ctx = vals[max(0, i - 50):i - 2] + vals[i + 3:i + 50]
        if len(ctx) < 20:
            continue
        med = statistics.median(ctx)
        if vals[i] > -40 and vals[i] - med > 20:
            if not clicks or win[i][0] - clicks[-1]["t"] > 0.3:
                clicks.append({"t": round(win[i][0], 2), "hf_peak_db": round(vals[i], 1),
                               "context_median_db": round(med, 1)})
    res["click_candidates"] = clicks

    # Anfang/Ende: abruptes Einsetzen oder Abschneiden
    def seg_rms(ss_, dur):
        e = run(["ffmpeg", "-nostats", "-ss", f"{ss_:.3f}", "-t", f"{dur:.3f}", "-i", path,
                 "-map", "0:a:0", "-af", "astats=measure_perchannel=none", "-f", "null", "-"])
        mm = re.search(r"RMS level dB:\s*(-?[\d.]+|-?inf)", e)
        return -120.0 if not mm or "inf" in mm.group(1) else float(mm.group(1))
    res["first_50ms_rms_db"] = seg_rms(0, 0.05)
    res["last_50ms_rms_db"] = seg_rms(max(0, duration - 0.06), 0.05)
    res["last_1s_rms_db"] = seg_rms(max(0, duration - 1.0), 0.95)
    return res


def contact_sheets(path, outdir, duration, shots, fps):
    def dt(offset):
        return (f"drawtext=fontfile={FONT}:text='%{{pts\\:hms\\:{offset}}}':x=6:y=6:fontsize=22:"
                f"fontcolor=yellow:box=1:boxcolor=black@0.6")
    per = 24
    nsheets = math.ceil(duration / per)
    for k in range(nsheets):
        run(["ffmpeg", "-y", "-v", "error", "-ss", str(k * per), "-t", str(per), "-i", path,
             "-vf", f"fps=1,scale=240:-2,{dt(k * per)},tile=8x3:padding=4:color=white",
             "-frames:v", "1", "-q:v", "4", os.path.join(outdir, f"sheet_{k + 1:02d}.jpg")])
    run(["ffmpeg", "-y", "-v", "error", "-t", "3", "-i", path,
         "-vf", f"fps=5,scale=240:-2,{dt(0)},tile=5x3:padding=4:color=white",
         "-frames:v", "1", "-q:v", "4", os.path.join(outdir, "hook.jpg")])
    # Ein Bild pro Einstellung (Mitte), mit Einstellungsnummer und Startzeit
    if shots:
        sel = "+".join(f"eq(n\\,{s['mid_n']})" for s in shots[:96])
        cols = 8
        rows = math.ceil(min(len(shots), 96) / cols)
        run(["ffmpeg", "-y", "-v", "error", "-i", path, "-vf",
             f"select='{sel}',scale=200:-2,"
             f"drawtext=fontfile={FONT}:text='#%{{eif\\:n+1\\:d}} %{{pts\\:hms}}':x=4:y=4:fontsize=18:"
             f"fontcolor=yellow:box=1:boxcolor=black@0.6,tile={cols}x{rows}:padding=4:color=white",
             "-vsync", "vfr", "-frames:v", "1", "-q:v", "4", os.path.join(outdir, "shots.jpg")])


def evaluate(info, v, a, black, freezes):
    """Nur im render-Modus: Bewertung gegen RENDER_SPEC. Liefert (status, findings)."""
    S = RENDER_SPEC
    fails, reviews = [], []
    vi, ai = info.get("video"), info.get("audio")
    if not vi:
        fails.append("Keine Videospur")
    else:
        if (vi["width"], vi["height"]) != (S["width"], S["height"]):
            fails.append(f"Auflösung {vi['width']}x{vi['height']} ≠ {S['width']}x{S['height']}")
        if abs(vi["r_frame_rate"] - S["fps"]) > 0.01 or abs(vi["avg_frame_rate"] - S["fps"]) > 0.05:
            fails.append(f"Bildrate r={vi['r_frame_rate']:.3f} avg={vi['avg_frame_rate']:.3f} ≠ {S['fps']}")
        if vi["codec"] != S["vcodec"]:
            fails.append(f"Videocodec {vi['codec']} ≠ {S['vcodec']}")
        if vi["pix_fmt"] != S["pix_fmt"]:
            fails.append(f"Pixelformat {vi['pix_fmt']} ≠ {S['pix_fmt']}")
    if not ai:
        fails.append("Keine Audiospur")
    else:
        if ai["codec"] != S["acodec"]:
            fails.append(f"Audiocodec {ai['codec']} ≠ {S['acodec']}")
        if ai["sample_rate"] != S["sample_rate"]:
            reviews.append(f"Abtastrate {ai['sample_rate']} ≠ {S['sample_rate']}")
        if vi and abs(ai["duration"] - vi["duration"]) > S["av_duration_diff_max"]:
            fails.append(f"Audio-/Videolänge weichen ab: {ai['duration']:.3f} s vs. {vi['duration']:.3f} s")
        if abs(ai["start_time"] - (vi or {}).get("start_time", 0)) > 0.02:
            fails.append(f"Start-Offset Audio/Video {ai['start_time']:.3f}/{vi['start_time']:.3f} s")
    if v.get("letterbox_crop"):
        fails.append(f"Letterbox-Balken erkannt ({v['letterbox_crop']}) – Bild muss 9:16 vollflächig sein")
    if v["timestamp_irregularity_count"]:
        fails.append(f"{v['timestamp_irregularity_count']} unregelmäßige Frame-Zeitstempel (VFR/Drops)")
    # Bewusste Schwarzblende ≤ 3 Frames ganz am Anfang/Ende ist erlaubt (Style-Guide 2), aber zu prüfen
    edge = 3.5 / S["fps"]
    dur = info["duration"]
    edge_black = [b for b in black if b[1] - b[0] <= edge and (b[0] <= 0.05 or b[1] >= dur - edge)]
    other_black = [b for b in black if b not in edge_black]
    if other_black:
        fails.append(f"Schwarzbilder: {other_black}")
    if edge_black:
        reviews.append(f"Kurze Schwarzblende am Anfang/Ende (nur ok, wenn beabsichtigt): {edge_black}")
    if v["isolated_duplicate_frames"]:
        fails.append(f"Isolierte Doppelbilder in Bewegung (Ruckeln): {v['isolated_duplicate_frames'][:20]}")
    if v["duplicate_ratio_in_motion"] > 0.02:
        fails.append(f"Doppelbild-Anteil in Bewegung {v['duplicate_ratio_in_motion']:.1%} (> 2 %)")
    if v["flash_shots"]:
        fails.append(f"Einstellungen < {FLASH_SHOT_FRAMES} Frames (Blitzbild/Sprung): "
                     f"{[s['start'] for s in v['flash_shots']]}")
    if v["jump_candidates"]:
        reviews.append(f"Sprungkandidaten ohne Schnitt: {[j['t'] for j in v['jump_candidates']]}")
    if v["flicker_candidates"]:
        reviews.append(f"Flacker-Kandidaten: {v['flicker_candidates'][:20]}")
    if freezes:
        reviews.append(f"Standbild-Phasen ≥ {FREEZE_MIN_S} s (nur ok, wenn beabsichtigt): "
                       f"{[(round(s, 2), round(e, 2)) for s, e in freezes]}")
    if a:
        if "integrated_lufs" in a and not (S["lufs_min"] <= a["integrated_lufs"] <= S["lufs_max"]):
            fails.append(f"Lautheit {a['integrated_lufs']} LUFS außerhalb {S['lufs_min']}…{S['lufs_max']}")
        if a.get("true_peak_dbtp", -99) > S["true_peak_max"]:
            fails.append(f"True Peak {a['true_peak_dbtp']} dBTP > {S['true_peak_max']}")
        if a.get("flat_factor", 0) > 0:
            fails.append(f"Clipping-Verdacht (Flat factor {a['flat_factor']})")
        if a.get("nans", 0) > 0:
            fails.append("NaN-Samples in Audio")
        if a["click_candidates"]:
            reviews.append(f"Klick-Kandidaten (anhören!): {[c['t'] for c in a['click_candidates']][:30]}")
        if a["loudness_jumps"]:
            reviews.append(f"Lautheitssprünge (anhören!): {[j['t'] for j in a['loudness_jumps']]}")
        if a["first_50ms_rms_db"] > -35:
            reviews.append(f"Audio setzt abrupt ein (erste 50 ms {a['first_50ms_rms_db']} dB RMS)")
        if a["last_50ms_rms_db"] > -40:
            fails.append(f"Audio endet abrupt (letzte 50 ms {a['last_50ms_rms_db']} dB RMS) – Fade-out fehlt")
        long_sil = [s for s in a["silences"] if s["end"] - s["start"] > 1.5]
        if long_sil:
            reviews.append(f"Stille > 1,5 s (nur ok, wenn beabsichtigt): {long_sil}")
    status = "FAIL" if fails else ("REVIEW" if reviews else "PASS")
    return status, fails, reviews


def write_md(path, out, rep):
    i, v, a = rep["probe"], rep["video"], rep["audio"]
    vi, ai = i.get("video", {}), i.get("audio", {})
    L = [f"# Technischer Bericht: `{os.path.basename(path)}`", "",
         f"Modus: **{rep['mode']}**" + (f" — Status: **{rep['status']}**" if rep["mode"] == "render" else ""), "",
         "## Container und Streams", "",
         f"- Dauer: {i['duration']:.3f} s, Größe {i['size_bytes'] / 1e6:.1f} MB, {i['bitrate_kbps']} kbit/s",
         f"- Video: {vi.get('codec')} {vi.get('width')}×{vi.get('height')} ({vi.get('pix_fmt')}), "
         f"r={vi.get('r_frame_rate'):.3f} fps, avg={vi.get('avg_frame_rate'):.3f} fps, {v['frame_count']} Frames",
         f"- Audio: {ai.get('codec')} {ai.get('sample_rate')} Hz, {ai.get('channels')} Kanäle, "
         f"{ai.get('duration', 0):.3f} s", "",
         "## Bild", "",
         f"- Bildinhalt/Balken: {'Letterbox erkannt, analysiert wurde ' + str(v['letterbox_crop']) if v.get('letterbox_crop') else 'vollflächig'}",
         f"- Harte Schnitte: {v['cut_count']} (≈ {v['shot_stats']['cuts_per_10s']} pro 10 s), erster bei "
         f"{v['first_cut_s']} s",
         f"- Bewegungsübergänge (Whip/Fast-Move): {v['motion_transition_count']} "
         f"{[(w['start'], w['end']) for w in v['motion_transitions']]}",
         f"- Einstellungswechsel gesamt: {v['shot_stats']['count'] - 1} (≈ {v['shot_stats']['shot_changes_per_10s']} "
         f"pro 10 s), erster bei {v['first_shot_change_s']} s",
         f"- Einstellungslänge: Median {v['shot_stats']['median_s']} s, Mittel {v['shot_stats']['mean_s']} s, "
         f"min {v['shot_stats']['min_s']} s, max {v['shot_stats']['max_s']} s",
         f"- Unregelmäßige Zeitstempel: {v['timestamp_irregularity_count']}",
         f"- Schwarzbilder: {rep['black'] or 'keine'}",
         f"- Standbild-Phasen ≥ {FREEZE_MIN_S} s: {[(round(s, 2), round(e, 2)) for s, e in rep['freezes']] or 'keine'}",
         f"- Isolierte Doppelbilder in Bewegung: {len(v['isolated_duplicate_frames'])} "
         f"{v['isolated_duplicate_frames'][:15]}",
         f"- Doppelbild-Anteil in Bewegungsphasen: {v['duplicate_ratio_in_motion']:.1%}",
         f"- Sehr kurze Einstellungen (< {FLASH_SHOT_FRAMES} Frames): {[s['start'] for s in v['flash_shots']] or 'keine'}",
         f"- Sprungkandidaten ohne Schnitt: {[j['t'] for j in v['jump_candidates']] or 'keine'}",
         f"- Flacker-Kandidaten: {v['flicker_candidates'][:20] or 'keine'}",
         f"- Mittlere Helligkeit (Y 0–255): {v['mean_luma']}, mittlere Bilddifferenz: {v['mean_motion_ydif']}", "",
         "## Ton", "",
         f"- Integrierte Lautheit: {a.get('integrated_lufs')} LUFS, LRA {a.get('lra_lu')} LU, "
         f"True Peak {a.get('true_peak_dbtp')} dBTP",
         f"- Sample-Peak {a.get('peak_dbfs')} dBFS, RMS {a.get('rms_dbfs')} dBFS, Flat factor {a.get('flat_factor')}",
         f"- Stille (< −45 dB, ≥ 0,4 s): {a['silences'] or 'keine'}",
         f"- Lautheitssprünge: {[j['t'] for j in a['loudness_jumps']] or 'keine'}",
         f"- Klick-Kandidaten (HF-Transienten, oft auch gewollte SFX): {[c['t'] for c in a['click_candidates']][:30] or 'keine'}",
         f"- Erste 50 ms: {a['first_50ms_rms_db']} dB RMS; letzte 50 ms: {a['last_50ms_rms_db']} dB RMS; "
         f"letzte Sekunde: {a['last_1s_rms_db']} dB RMS",
         "- Lautheitsverlauf (Short-Term-LUFS, alle 2 s): " + " ".join(
             f"{t}s:{'–' if x is None else round(x)}" for t, x in a.get("short_term_lufs_per_s", [])[::2]),
         ""]
    if rep["mode"] == "render":
        L += ["## Bewertung", "", f"**Status: {rep['status']}**", ""]
        L += [f"- ❌ {x}" for x in rep["fails"]] + [f"- ⚠️ {x}" for x in rep["reviews"]]
        L += ["", "Automatische Prüfung ersetzt nicht die Sichtprüfung (Kontaktbögen, shots.jpg) und "
              "das vollständige Anhören. Siehe VIDEO_PRODUCTION_CHECKLIST.md.", ""]
    L += ["## Einstellungen", "", "| # | Start (s) | Dauer (s) | Frames |", "|---|---|---|---|"]
    L += [f"| {k + 1} | {s['start']} | {s['dur']} | {s['frames']} |" for k, s in enumerate(v["shots"])]
    with open(os.path.join(out, "report.md"), "w") as fh:
        fh.write("\n".join(L) + "\n")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--out", required=True)
    ap.add_argument("--mode", choices=["reference", "render"], default="render")
    ap.add_argument("--no-sheets", action="store_true", help="keine Kontaktbögen erzeugen")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    info = probe(args.video)
    fps = info["video"]["avg_frame_rate"] or info["video"]["r_frame_rate"]
    crop = detect_crop(args.video, info["video"]["width"], info["video"]["height"])
    frames, black, freezes = video_pass(args.video, args.out, crop)
    v = analyse_frames(frames, fps)
    a = audio_pass(args.video, args.out, info["duration"]) if "audio" in info else {}
    if not args.no_sheets:
        contact_sheets(args.video, args.out, info["duration"], v["shots"], fps)
    v["letterbox_crop"] = crop
    rep = {"file": os.path.basename(args.video), "mode": args.mode, "probe": info, "video": v,
           "audio": a, "black": black, "freezes": freezes}
    if args.mode == "render":
        rep["status"], rep["fails"], rep["reviews"] = evaluate(info, v, a, black, freezes)
    with open(os.path.join(args.out, "report.json"), "w") as fh:
        json.dump(rep, fh, indent=1, ensure_ascii=False)
    write_md(args.video, args.out, rep)
    print(f"{rep['file']}: {rep.get('status', 'gemessen')} → {args.out}/report.md")
    if args.mode == "render":
        sys.exit({"PASS": 0, "REVIEW": 2, "FAIL": 1}[rep["status"]])


if __name__ == "__main__":
    main()
