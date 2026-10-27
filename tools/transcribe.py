#!/usr/bin/env python3
"""Sprechertext mit Zeitstempeln transkribieren (optional, für Referenz- und Render-QA).

Benötigt faster-whisper (nicht Teil der Grundausstattung). Empfohlen in einer
separaten virtuellen Umgebung, damit das System unverändert bleibt:

  python3 -m venv .venv-asr && .venv-asr/bin/pip install faster-whisper
  .venv-asr/bin/python tools/transcribe.py video.mp4 --out transcript.json [--model small]

Ausgabe: JSON mit erkannter Sprache, Wahrscheinlichkeit und Segmenten (start, end, text)
plus eine gleichnamige .txt-Datei. Die Erkennung kann sich irren (Eigennamen,
Musik unter Sprache) – Transkripte sind Arbeitshilfe, keine Wahrheit.
"""

import argparse
import json
import os
import subprocess

import numpy as np
from faster_whisper import WhisperModel


def load_audio(path):
    """Audio per ffmpeg als 16 kHz Mono-Float decodieren (unabhängig von PyAV-Versionen)."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-map", "0:a:0", "-ac", "1",
                          "-ar", "16000", "-f", "f32le", "-"], stdout=subprocess.PIPE,
                         check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("videos", nargs="+")
    ap.add_argument("--out", help="Zieldatei (nur bei einem Video) oder Verzeichnis")
    ap.add_argument("--model", default="small",
                    help="Modellname (Download von Hugging Face) oder lokaler Pfad zu einem CTranslate2-Modell")
    ap.add_argument("--language", default=None, help="z. B. en oder de; leer = automatisch")
    args = ap.parse_args()
    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    for path in args.videos:
        segs, info = model.transcribe(load_audio(path), language=args.language, vad_filter=False,
                                      beam_size=5, condition_on_previous_text=False)
        segs = [{"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
                 "no_speech_prob": round(s.no_speech_prob, 2)} for s in segs]
        res = {"file": os.path.basename(path), "language": info.language,
               "language_probability": round(info.language_probability, 3),
               "model": args.model, "segments": segs}
        if args.out and len(args.videos) == 1 and args.out.endswith(".json"):
            out = args.out
        else:
            d = args.out or "."
            os.makedirs(d, exist_ok=True)
            out = os.path.join(d, os.path.splitext(os.path.basename(path))[0] + ".transcript.json")
        with open(out, "w") as fh:
            json.dump(res, fh, indent=1, ensure_ascii=False)
        with open(out[:-5] + ".txt", "w") as fh:
            fh.write(f"# {res['file']} – Sprache {res['language']} ({res['language_probability']})\n")
            for s in segs:
                fh.write(f"[{s['start']:6.2f}–{s['end']:6.2f}] {s['text']}\n")
        print(f"{res['file']}: {res['language']} ({res['language_probability']}), {len(segs)} Segmente → {out}")


if __name__ == "__main__":
    main()
