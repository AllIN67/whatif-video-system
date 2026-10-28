#!/usr/bin/env python3
# Aufruf: python3 qa/av_check_countdown.py render/final.mp4 timeline.json > qa/av_check_countdown.txt
"""Bild-Ton-Synchronprüfung für die Countdown-Verluste dieser Produktion.
Bild: erster Frame, in dem der HUD-Wert rot wird (Verlust-Akzent), aus dem fertigen MP4.
Ton:  Einsätze des Verlust-Impulses (Bandpass 1,1–1,4 kHz, 1-ms-Hüllkurve) aus dem fertigen MP4.
"""
import array, json, subprocess, sys
mp4, plan = sys.argv[1], sys.argv[2]
tl = json.load(open(plan))
W, H = 140, 20  # Ausschnitt HUD-Wert 560x80 ab (64,880), auf 1/4 verkleinert
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-an", "-vf", "crop=560:80:64:880,scale=140:20", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
n = len(raw) // (W * H * 3)
red = []
for f in range(n):
    b = raw[f * W * H * 3:(f + 1) * W * H * 3]
    cnt = 0
    for i in range(0, len(b), 3):
        r, g, bl = b[i], b[i + 1], b[i + 2]
        if r > 180 and g < 120 and bl < 120:
            cnt += 1
    red.append(cnt)
vis = [f for f in range(1, n) if red[f] > 15 and red[f - 1] <= 15]
# Änderung der Ziffern: größte Bilddifferenz im HUD-Ausschnitt (±6 Frames um den geplanten Zeitpunkt)
def fdiff(f):
    a = raw[(f - 1) * W * H * 3:f * W * H * 3]; b = raw[f * W * H * 3:(f + 1) * W * H * 3]
    return sum(abs(x - y) for x, y in zip(a, b))
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-vn", "-af", "pan=mono|c0=c0,highpass=f=1100,lowpass=f=1500,highpass=f=1100,lowpass=f=1500", "-ar", "48000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
a = array.array("f"); a.frombytes(pcm)
win = 48
env = [max(abs(x) for x in a[i:i + win]) for i in range(0, len(a) - win, win)]
loss_hud = [fl["t"] for s in tl["hud"] for fl in s.get("flashes", []) if fl["kind"] == "loss"]
res = []
for t in loss_hud:
    p0 = round(t * 30)
    fv = max(range(p0 - 6, p0 + 7), key=fdiff)
    i0 = int((t - 0.1) * 1000); i1 = int((t + 0.2) * 1000)
    seg = env[i0:i1]
    peak = max(seg)
    on = next(i for i, v in enumerate(seg) if v > 0.3 * peak) + i0
    res.append({"planned_s": t, "video_change_frame": fv, "video_s": round(fv / 30, 3) if fv is not None else None,
                "audio_onset_s": round(on / 1000, 3), "offset_ms": round((on / 1000 - fv / 30) * 1000, 1) if fv is not None else None})
print(json.dumps({"frames": n, "red_onsets": vis, "loss_events": res}, indent=1))
bad = [r for r in res if r["offset_ms"] is None or abs(r["offset_ms"]) > 33.4 or r["video_change_frame"] != round(r["planned_s"] * 30)]
print("OK" if not bad else f"ABWEICHUNG: {bad}")
