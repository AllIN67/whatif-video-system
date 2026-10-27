"""Stufe 6: Audio – Länge, Lautheit, True Peak, Ende, Knackser-Kandidaten, sample-genaue Platzierung."""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import audio_mix  # noqa: E402
import video_qa  # noqa: E402


def write_prod(d, audio, duration=12.0):
    with open(os.path.join(d, "timeline.json"), "w") as fh:
        json.dump({"fps": 30, "duration": duration, "seed": 1, "shots": [], "audio": audio}, fh)


def rms_db(path, ss, t):
    err = subprocess.run(["ffmpeg", "-nostats", "-ss", str(ss), "-t", str(t), "-i", path, "-af", "astats=measure_perchannel=none",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"RMS level dB:\s*(-?[\d.]+)", err)[-1])


def first_rise_ms(path, frames, thresh=0.02):
    """Pro Soll-Frame: erster Zeitpunkt (ms relativ zum Soll-Sample), an dem das hochpassgefilterte
    Signal 2 % seines lokalen Maximums überschreitet."""
    import array
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-af", "pan=mono|c0=c0,highpass=f=2000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    a = array.array("f")
    a.frombytes(raw)
    out = []
    for f in frames:
        s = f * 1600
        seg = [abs(x) for x in a[s - 480:s + 960]]
        m = max(seg)
        out.append(next((i - 480) / 48.0 for i, v in enumerate(seg) if v > thresh * m))
    return out


class AudioMixTest(unittest.TestCase):
    def setUp(self):
        self.d = tempfile.mkdtemp(prefix="wif-audio-")

    def tearDown(self):
        shutil.rmtree(self.d, ignore_errors=True)

    def test_mix_regeln(self):
        sfx = [{"src": "gen:whoosh", "t": round(f / 30, 6), "gain_db": -2} for f in (30, 95, 160, 241)]
        sfx += [{"src": "gen:boom", "t": 4.0, "gain_db": 0}, {"src": "gen:hit", "t": 4.0, "gain_db": -4},
                {"src": "gen:riser", "t": 6.0, "gain_db": -6}, {"src": "gen:hit", "t": 10.0, "gain_db": -3}]
        write_prod(self.d, {"fade_out": 1.0, "beds": [{"src": "gen:drone", "start": 0, "end": 12, "gain_db": -4,
                    "automation": [[0, 0], [2, 0], [2.3, -20], [3.0, -20], [3.3, 0]]}], "sfx": sfx})
        r = audio_mix.mix(self.d)
        self.assertEqual(r["samples"], 12 * 48000)
        self.assertGreaterEqual(r["integrated_lufs"], -15.0)
        self.assertLessEqual(r["integrated_lufs"], -13.0)
        self.assertLessEqual(r["true_peak_dbtp"], -1.0)
        a = video_qa.audio_pass(r["file"], self.d, 12.0)
        self.assertLess(a["last_50ms_rms_db"], -40, "Ende nicht ausgeblendet")
        self.assertLess(a["first_50ms_rms_db"], -35, "Anfang setzt abrupt ein")
        # Klick-Kandidaten nur an absichtlichen Treffer-Einsätzen (hit/boom), nirgends sonst
        hits = [c["t"] for c in sfx if c["src"] in ("gen:hit", "gen:boom")]
        stray = [c for c in a["click_candidates"] if not any(abs(c["t"] - h) <= 0.05 for h in hits)]
        self.assertEqual(stray, [], f"Knackser-Kandidaten außerhalb von Treffern: {stray}")
        self.assertEqual(a.get("flat_factor", 0), 0)
        # bewusste Absenkung (2,3–3,0 s, dort spielt kein Effekt) ist ≥ 15 dB leiser als vorher
        self.assertLess(rms_db(r["file"], 2.4, 0.5), rms_db(r["file"], 1.75, 0.2) - 15)

    def test_sample_genaue_platzierung(self):
        frames = [45, 100, 181, 250]
        write_prod(self.d, {"fade_out": 0.6, "beds": [{"src": "gen:drone", "start": 0, "end": 10, "gain_db": -30}],
                            "sfx": [{"src": "gen:tick", "t": round(f / 30, 6), "gain_db": 0} for f in frames]}, duration=10.0)
        r = audio_mix.mix(self.d)
        # Referenz: derselbe Tick einzeln auf Frame 30 → Anstiegszeit der Klangform selbst
        ref = tempfile.mkdtemp(prefix="wif-ref-")
        try:
            write_prod(ref, {"fade_out": 0.6, "sfx": [{"src": "gen:tick", "t": 1.0}]}, duration=3.0)
            base = first_rise_ms(audio_mix.mix(ref)["file"], [30])[0]
        finally:
            shutil.rmtree(ref, ignore_errors=True)
        got = first_rise_ms(r["file"], frames)
        pre = first_rise_ms(os.path.join(self.d, "render", "audio", "premix.wav"), frames)
        for f, g, p in zip(frames, got, pre):
            self.assertLess(abs(g - base), 0.1, f"Tick Frame {f}: Einsatz {g:.3f} ms, Referenz {base:.3f} ms")
            self.assertLess(abs(g - p), 0.03, f"Tick Frame {f}: Normierung/Limiter verschieben um {g - p:.3f} ms")

    def test_fehler(self):
        write_prod(self.d, {"beds": [], "sfx": [{"src": "gen:hit", "t": 1.01}]})
        with self.assertRaisesRegex(ValueError, "Frame-Grenze"):
            audio_mix.mix(self.d)
        write_prod(self.d, {"fade_out": 0.2, "sfx": [{"src": "gen:hit", "t": 1.0}]})
        with self.assertRaisesRegex(ValueError, "fade_out"):
            audio_mix.mix(self.d)
        write_prod(self.d, {"sfx": [{"src": "fremd.wav", "t": 1.0}]})
        with self.assertRaises(FileNotFoundError):
            audio_mix.mix(self.d)


if __name__ == "__main__":
    unittest.main()
