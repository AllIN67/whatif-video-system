#!/usr/bin/env python3
"""Sprecherstimme + Wort-Zeitstempel aus productions/<slug>/voiceover.json (nur auf ausdrücklichen Auftrag –
Style-Guide 9.1 sieht standardmäßig keinen Sprecher vor).

Engine: Kokoro-82M (Apache-2.0) über kokoro-onnx, läuft offline auf der CPU. Die Modelldateien werden
beim ersten Aufruf von den GitHub-Releases von kokoro-onnx geladen (SHA-256 geprüft) und in eine Variante
umgebaut, die die vom Modell vorhergesagten Phonem-Dauern als zweiten Ausgang liefert. Daraus entstehen
**exakte** Wortzeiten (keine Schätzung, keine Spracherkennung) für die Wort-für-Wort-Untertitel.

voiceover.json:
  {"voice": "am_michael", "speed": 1.15, "lang": "en-us",
   "segments": [
     {"id": "s01", "at": 0.10, "captions": false, "text": "The Earth stops. For one second."},
     {"id": "s02", "at": 1.60, "text": "You're moving at {seven hundred ninety miles per hour|*790 MPH*}."}]}

Markup im Text:
  {gesprochen|ANZEIGE}  mehrere gesprochene Wörter erscheinen als eine Untertitel-Einheit „ANZEIGE“
  *wort* bzw. {…|*ANZEIGE*}  Schlüsselwort: größer + Pop-Animation im Untertitel
Zahlen immer ausschreiben (gesprochen), Ziffern nur in der Anzeige – sonst stimmt die Wortzuordnung nicht.
"at" = Startzeit des Abschnitts im Video (s); "auto" = direkt nach dem vorherigen + gap (Standard 0,15 s).

Ausgabe:
  productions/<slug>/voice/words.json   Wörter + Untertitel-Einheiten mit Zeiten (versioniert, klein)
  productions/<slug>/render/voice/voice.wav   48 kHz Stereo float (nicht versioniert)

  python3 tools/tts_kokoro.py productions/<slug> [--force]
"""

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.request

import numpy as np

MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
MODEL_FILES = {
    "kokoro-v1.0.onnx": "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5",
    "voices-v1.0.bin": "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d",
}
CACHE = os.environ.get("WHATIF_TTS_CACHE", os.path.expanduser("~/.cache/whatif-tts/kokoro"))
SR_OUT = 48000
PUNCT = set(".,!?;:…—-\"'()")


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for b in iter(lambda: fh.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def ensure_model():
    os.makedirs(CACHE, exist_ok=True)
    for name, want in MODEL_FILES.items():
        p = os.path.join(CACHE, name)
        if not os.path.exists(p):
            print(f"Lade {name} …", file=sys.stderr)
            urllib.request.urlretrieve(MODEL_URL + name, p + ".part")
            os.replace(p + ".part", p)
        got = sha256(p)
        if got != want:
            raise SystemExit(f"{name}: SHA-256 {got} ≠ erwartet {want}")
    timed = os.path.join(CACHE, "kokoro-v1.0-timed.onnx")
    if not os.path.exists(timed):
        # Phonem-Dauern (vom Modell vorhergesagt, gerundet, in Audio-Frames) als Ausgang "duration" freilegen.
        import onnx
        from onnx import TensorProto, helper
        m = onnx.load(os.path.join(CACHE, "kokoro-v1.0.onnx"))
        names = {o for n in m.graph.node for o in n.output}
        if "/encoder/Cast_output_0" not in names:
            raise SystemExit("Kokoro-Graph unerwartet: /encoder/Cast_output_0 fehlt")
        m.graph.node.append(helper.make_node("Identity", ["/encoder/Cast_output_0"], ["duration"], name="duration_out"))
        m.graph.output.append(helper.make_tensor_value_info("duration", TensorProto.INT64, None))
        onnx.save(m, timed + ".part")
        os.replace(timed + ".part", timed)
    return timed, os.path.join(CACHE, "voices-v1.0.bin")


TOKEN = re.compile(r"\{([^|}]+)\|([^}]+)\}|(\S+)")


def parse_segment(text):
    """→ (gesprochener Text, Einheiten [{spoken:[…], display, key, brk}])"""
    units, spoken_parts = [], []
    for m in TOKEN.finditer(text):
        if m.group(1) is not None:
            spoken, disp = m.group(1).strip(), m.group(2).strip()
            trail = ""
            # Satzzeichen direkt nach der Klammer gehören zur Einheit
            after = text[m.end():m.end() + 3]
            trail = re.match(r"[.,!?;:…]*", after).group(0)
        else:
            raw = m.group(3)
            if re.fullmatch(r"[.,!?;:…]+", raw):  # alleinstehendes Satzzeichen (z. B. nach {…})
                spoken_parts.append(raw)
                continue
            spoken, disp, trail = raw, raw, ""
        key = disp.startswith("*") and disp.rstrip(".,!?;:…").endswith("*")
        core = disp.strip("*") if key else disp
        words = spoken.split()
        last = (words[-1] if words else "").replace("*", "") + trail
        brk = "sentence" if re.search(r"[.!?…]$", last) else ("clause" if re.search(r"[,;:—]$", last) else None)
        units.append({"spoken": [w.strip("*") for w in words], "display": core.strip(), "key": key, "brk": brk})
        spoken_parts.append(spoken.replace("*", ""))
    say = " ".join(spoken_parts)
    say = re.sub(r"\s+([.,!?;:…])", r"\1", say)
    return say, units


def word_times(timings):
    """Phonem-Zeiten → Wortzeiten [(start, end)], Wortgrenze = Leerzeichen, Satzzeichen zählen nicht mit."""
    words, cur = [], None
    for tm in timings:
        ph = tm.phoneme
        if ph == " ":
            if cur:
                words.append(cur)
            cur = None
            continue
        if ph in PUNCT or not ph.strip():
            continue
        if cur is None:
            cur = [tm.start, tm.end]
        else:
            cur[1] = tm.end
    if cur:
        words.append(cur)
    return words


def synth(prod_dir, force=False):
    prod_dir = os.path.abspath(prod_dir)
    cfg_path = os.path.join(prod_dir, "voiceover.json")
    cfg = json.load(open(cfg_path))
    model, voices = ensure_model()
    out_json = os.path.join(prod_dir, "voice", "words.json")
    out_wav = os.path.join(prod_dir, "render", "voice", "voice.wav")
    key = hashlib.sha256(open(cfg_path, "rb").read() + MODEL_FILES["kokoro-v1.0.onnx"].encode()).hexdigest()[:24]
    if not force and os.path.exists(out_json) and os.path.exists(out_wav):
        if json.load(open(out_json)).get("input_hash") == key:
            print("Stimme aktuell – übersprungen")
            return json.load(open(out_json))

    from kokoro_onnx import Kokoro
    k = Kokoro(model, voices)
    if not k.has_timings:
        raise SystemExit("Kokoro-Modell liefert keine Dauern")
    voice, speed, lang = cfg.get("voice", "am_michael"), float(cfg.get("speed", 1.1)), cfg.get("lang", "en-us")
    sr = 24000
    placed, words, units = [], [], []
    prev_end = 0.0
    for seg in cfg["segments"]:
        say, segunits = parse_segment(seg["text"])
        spoken = [w for u in segunits for w in u["spoken"]]
        # espeak fasst manchmal Wörter zu einer Lautgruppe zusammen („that one“ → ðˈætwˌʌn). Dann Wort für Wort
        # phonemisieren, damit jede Lautgruppe genau einem Wort entspricht (Zuordnung exakt statt geraten).
        phon = k.tokenizer.phonemize(say, lang)
        if len(phon.split()) != len(spoken):
            parts = []
            for w in say.split():
                pw = k.tokenizer.phonemize(w, lang).strip()
                if len(pw.split()) != 1:
                    raise SystemExit(f"{seg['id']}: Wort „{w}“ ergibt mehrere Lautgruppen ({pw}) – umformulieren")
                parts.append(pw)
            phon = " ".join(parts)
        audio, sr, tim = k.create_timed(phon, voice=voice, speed=float(seg.get("speed", speed)), lang=lang, is_phonemes=True,
                                        sentence_pause=float(cfg.get("sentence_pause", 0.18)),
                                        clause_pause=float(cfg.get("clause_pause", 0.08)))
        wt = word_times(tim)
        if len(wt) != len(spoken):
            phon = "".join(t.phoneme for t in tim)
            raise SystemExit(f"{seg['id']}: {len(wt)} Wortgruppen in den Phonemen, aber {len(spoken)} Wörter im Text.\n"
                             f"  Text: {say}\n  Phoneme: {phon}\n  Zahlen ausschreiben, Bindestriche vermeiden.")
        # Führende Stille abschneiden, damit "at" der hörbare Einsatz ist
        lead = max(0.0, wt[0][0] - 0.03)
        a0 = int(lead * sr)
        audio = audio[a0:]
        wt = [(s - lead, e - lead) for s, e in wt]
        at = seg.get("at", "auto")
        start = prev_end + float(cfg.get("gap", 0.15)) if at == "auto" else float(at)
        if start < prev_end - 1e-6:
            raise SystemExit(f"{seg['id']}: beginnt bei {start:.2f} s, vorheriger Abschnitt endet erst bei {prev_end:.2f} s "
                             f"(überlappt um {prev_end - start:.2f} s) – Zeiten anpassen")
        speech_end = start + wt[-1][1]
        placed.append((start, audio))
        prev_end = speech_end
        i = 0
        for u in segunits:
            n = len(u["spoken"])
            s0, s1 = start + wt[i][0], start + wt[i + n - 1][1]
            for j, w in enumerate(u["spoken"]):
                words.append({"seg": seg["id"], "text": w, "start": round(start + wt[i + j][0], 3), "end": round(start + wt[i + j][1], 3)})
            units.append({"seg": seg["id"], "display": u["display"], "key": u["key"], "brk": u["brk"],
                          "captions": seg.get("captions", True), "start": round(s0, 3), "end": round(s1, 3)})
            i += n
        print(f"{seg['id']}: {start:6.2f}–{speech_end:6.2f} s  ({speech_end - start:.2f} s)  {say}")

    total = max(s + len(a) / sr for s, a in placed) + 0.5
    buf = np.zeros(int(total * sr), dtype=np.float32)
    for s, a in placed:
        i0 = int(round(s * sr))
        buf[i0:i0 + len(a)] += a
    os.makedirs(os.path.dirname(out_wav), exist_ok=True)
    os.makedirs(os.path.dirname(out_json), exist_ok=True)
    p = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-",
                        "-af", f"aresample={SR_OUT}:resampler=soxr,pan=stereo|c0=c0|c1=c0", "-c:a", "pcm_f32le", out_wav],
                       input=buf.tobytes(), capture_output=True)
    if p.returncode != 0:
        raise SystemExit(p.stderr.decode()[-800:])
    res = {"engine": "kokoro-onnx", "model": "Kokoro-82M v1.0 (Apache-2.0)", "voice": voice, "speed": speed,
           "input_hash": key, "speech_end": round(prev_end, 3), "words": words, "units": units}
    with open(out_json, "w") as fh:
        json.dump(res, fh, indent=1, ensure_ascii=False)
    print(f"→ {os.path.relpath(out_json)} ({len(words)} Wörter, {len(units)} Einheiten), {os.path.relpath(out_wav)}; Sprache endet bei {prev_end:.2f} s")
    return res


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("production")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    synth(a.production, a.force)


if __name__ == "__main__":
    main()
