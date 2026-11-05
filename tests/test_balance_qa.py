"""tools/balance_qa.py (Version 3.0, informativ): Bandanteile und Farbhierarchie an synthetischen Clips."""
import os
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "tools"))
import balance_qa  # noqa: E402


def clip(path, audio, video="color=c=0x3a7ad9:s=108x192:r=5"):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", video, "-f", "lavfi", "-i", audio, "-t", "3",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", path], check=True)


class BalanceQA(unittest.TestCase):
    def test_bass_tone_lands_in_sub_band(self):
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, "bass.mp4")
            clip(p, "sine=f=55:r=48000")
            b = balance_qa.band_shares(p)
            self.assertGreater(b["sub_lt100_pct"], 80)
            self.assertLess(b["presence_2k_8k_pct"], 2)

    def test_presence_tone_lands_in_presence_band(self):
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, "hi.mp4")
            clip(p, "sine=f=4000:r=48000")
            self.assertGreater(balance_qa.band_shares(p)["presence_2k_8k_pct"], 80)

    def test_single_colour_is_fully_dominant(self):
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, "blue.mp4")
            clip(p, "sine=f=440:r=48000")
            c = balance_qa.color_stats(p)
            self.assertGreater(c["dominant_hue_pct"], 95)
            self.assertLess(c["accent_area_pct"], 1)


if __name__ == "__main__":
    unittest.main()
