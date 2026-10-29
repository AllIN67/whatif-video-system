#!/usr/bin/env python3
"""Erzeugt Hintergrundmusik ausschließlich per Code (numpy) – keine fremden Samples, keine Lizenzfrage.

Die Musik folgt einem Ablaufplan (Abschnitte mit Stil), damit die Lautheitsdramaturgie zum Bild passt
(Style-Guide 9.2: Aufbau, Rückgang vor dem Schlüsselmoment, Maximum am Höhepunkt). Deterministisch:
gleicher Plan → bit-identische Datei (fester Seed für Rauschen).

Plan (timeline.json → audio.music.<name>):
  {"bpm": 100, "root": "D", "duration": 42.0, "seed": 3,
   "sections": [{"from": 0, "to": 7.6, "style": "pulse"},
                {"from": 7.6, "to": 8.4, "style": "silence"},
                {"from": 8.4, "to": 20, "style": "drive"},
                {"from": 20, "to": 34, "style": "drive_hi"},
                {"from": 34, "to": 42, "style": "calm"}]}

Stile: silence · pulse (Bass-Achtel + Ticken + Fläche, gespannt) · drive (+ Kick, pumpender Bass)
       · drive_hi (+ Snare, Toms, höhere Fläche) · calm (nur Fläche + leise Glocken-Arpeggios)
Übergänge zwischen Abschnitten werden über 40 ms überblendet (keine Knackser).

  python3 tools/music_synth.py --plan plan.json --out music.wav
"""

import argparse
import json
import os
import subprocess
import sys

import numpy as np

NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def hz(semitones_from_a4):
    return 440.0 * 2 ** (semitones_from_a4 / 12)


def root_hz(root, octave):
    # MIDI: A4 = 69; Note n in Oktave o → 12*(o+1)+n
    return hz(12 * (octave + 1) + NOTE[root] - 69)


def saw(f, t, harmonics=8, phase=0.0):
    """Bandbegrenzter Sägezahn (additiv) – klingt wie ein leicht gefilterter Synth."""
    out = np.zeros_like(t)
    for n in range(1, harmonics + 1):
        out += np.sin(2 * np.pi * f * n * t + phase * n) / n
    return out * (2 / np.pi)


def env_ad(n, sr, attack, decay):
    i = np.arange(n) / sr
    a = np.clip(i / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(i - attack, 0) / max(decay, 1e-4))


def place(buf, sig, start):
    s = int(start)
    if s >= len(buf):
        return
    e = min(len(buf), s + len(sig))
    buf[s:e] += sig[: e - s]


def render(plan, sr=48000):
    bpm = float(plan.get("bpm", 100))
    dur = float(plan["duration"])
    n = int(round(dur * sr))
    rng = np.random.default_rng(int(plan.get("seed", 1)))
    beat = 60.0 / bpm
    root = plan.get("root", "D")
    f_bass = root_hz(root, 1)  # z. B. D1 ≈ 36,7 Hz → Grundton + Obertöne hörbar auf dem Handy über 2./3. Harmonische
    t = np.arange(n) / sr
    L = np.zeros(n)
    R = np.zeros(n)
    sections = plan["sections"]

    def style_at(x):
        for s in sections:
            if s["from"] <= x < s["to"]:
                return s["style"]
        return "silence"

    # Masken je Stil (mit 40-ms-Überblendung), damit jede Stimme nur in passenden Abschnitten klingt
    def mask(styles):
        m = np.zeros(n)
        for s in sections:
            if s["style"] in styles:
                a, b = int(s["from"] * sr), int(s["to"] * sr)
                m[a:b] = 1.0
        k = int(0.04 * sr)
        ker = np.ones(k) / k
        return np.convolve(m, ker, mode="same")

    # Akkordfolge (natürlich Moll): i – VI – III – VII, je 2 Takte
    prog = [0, -4, 3, -2]
    bar = 4 * beat

    def chord_root(x):
        return prog[int(x // (2 * bar)) % len(prog)]

    # 1) Fläche (Pad): Moll-Dreiklang, verstimmte Sägezähne, langsam schwebend
    pad = np.zeros(n)
    pad_hi = np.zeros(n)
    seg = int(2 * bar * sr)
    for i0 in range(0, n, seg):
        i1 = min(n, i0 + seg)
        tt = t[i0:i1]
        cr = chord_root(i0 / sr)
        base = root_hz(root, 3) * 2 ** (cr / 12)
        x = np.zeros(i1 - i0)
        xh = np.zeros(i1 - i0)
        for iv, amp in [(0, 0.5), (3, 0.38), (7, 0.34), (12, 0.18)]:
            f = base * 2 ** (iv / 12)
            x += amp * (saw(f * 1.003, tt, 5) + saw(f * 0.997, tt, 5, 1.1))
            xh += amp * np.sin(2 * np.pi * 2 * f * tt + iv)
        fade = np.minimum(1, np.minimum(np.arange(i1 - i0), np.arange(i1 - i0)[::-1]) / (0.08 * sr))
        pad[i0:i1] += x * fade
        pad_hi[i0:i1] += xh * fade
    pad *= 0.10 * (0.85 + 0.15 * np.sin(2 * np.pi * 0.11 * t))
    pad_hi *= 0.05
    m_pad = mask({"pulse", "drive", "drive_hi", "calm"})
    m_padhi = mask({"drive_hi", "calm"})
    L += pad * m_pad + pad_hi * m_padhi
    R += np.roll(pad, int(0.012 * sr)) * m_pad + np.roll(pad_hi, int(0.017 * sr)) * m_padhi

    # 2) Bass-Achtel (pulse/drive): Grundton des Akkords, kurze Hüllkurve, Pumpen auf jedem Beat
    bass = np.zeros(n)
    eighth = beat / 2
    k = 0
    while k * eighth < dur:
        x0 = k * eighth
        st = style_at(x0)
        if st in ("pulse", "drive", "drive_hi"):
            f = f_bass * 2 ** (chord_root(x0) / 12) * (2 if k % 2 else 1)
            ln = int(eighth * 0.95 * sr)
            tt = np.arange(ln) / sr
            note = saw(f, tt, 10) * env_ad(ln, sr, 0.004, 0.16 if st == "pulse" else 0.12)
            place(bass, note * (0.55 if st == "pulse" else 0.75), x0 * sr)
        k += 1
    pump = 1 - 0.55 * np.exp(-((t % beat) / 0.09))
    m_drive = mask({"drive", "drive_hi"})
    bass *= np.where(m_drive > 0.5, pump, 1.0)
    L += bass
    R += bass

    # 3) Ticken (Uhr-Hi-Hat, Sechzehntel) – Spannung
    hat = np.zeros(n)
    sixteenth = beat / 4
    noise = rng.standard_normal(int(0.05 * sr))
    hp = np.diff(noise, prepend=0)  # einfacher Hochpass
    k = 0
    while k * sixteenth < dur:
        x0 = k * sixteenth
        st = style_at(x0)
        if st in ("pulse", "drive", "drive_hi"):
            accent = 1.0 if k % 4 == 2 else 0.45
            ln = len(hp)
            place(hat, hp * env_ad(ln, sr, 0.0005, 0.012) * 0.10 * accent, x0 * sr)
        k += 1
    L += hat * 0.9
    R += np.roll(hat, int(0.004 * sr))

    # 4) Kick (drive/drive_hi) auf jeder Zählzeit
    kick_len = int(0.45 * sr)
    tt = np.arange(kick_len) / sr
    fk = 45 + 75 * np.exp(-tt / 0.03)
    kick = np.sin(2 * np.pi * np.cumsum(fk) / sr) * env_ad(kick_len, sr, 0.001, 0.18)
    k = 0
    while k * beat < dur:
        x0 = k * beat
        if style_at(x0) in ("drive", "drive_hi"):
            place(L, kick * 0.8, x0 * sr)
            place(R, kick * 0.8, x0 * sr)
        k += 1

    # 5) Snare + Toms (drive_hi): Snare auf 2 und 4, Tom-Wirbel am Taktende
    sn_len = int(0.25 * sr)
    sn_noise = rng.standard_normal(sn_len)
    snare = (np.diff(sn_noise, prepend=0) * 0.5 + np.sin(2 * np.pi * 190 * np.arange(sn_len) / sr)) * env_ad(sn_len, sr, 0.001, 0.07)
    tom_len = int(0.3 * sr)
    k = 0
    while k * beat < dur:
        x0 = k * beat
        if style_at(x0) == "drive_hi":
            if k % 2 == 1:
                place(L, snare * 0.32, x0 * sr)
                place(R, snare * 0.32, x0 * sr)
            if k % 4 == 3:
                for j, ft in enumerate([140, 115, 95]):
                    tt2 = np.arange(tom_len) / sr
                    tom = np.sin(2 * np.pi * np.cumsum(ft * (1 + 0.5 * np.exp(-tt2 / 0.02))) / sr) * env_ad(tom_len, sr, 0.001, 0.12)
                    place(L if j % 2 else R, tom * 0.35, (x0 + j * beat / 4) * sr)
        k += 1

    # 6) Glocken-Arpeggio (calm): leise, viel Raum
    bell = np.zeros(n)
    arp = [0, 7, 12, 15, 12, 7]
    k = 0
    while k * eighth < dur:
        x0 = k * eighth
        if style_at(x0) == "calm":
            f = root_hz(root, 5) * 2 ** ((chord_root(x0) + arp[k % len(arp)]) / 12)
            ln = int(1.2 * sr)
            tt = np.arange(ln) / sr
            note = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.76 * f * tt)) * env_ad(ln, sr, 0.002, 0.45)
            place(bell, note * 0.06, x0 * sr)
        k += 1
    # einfacher Hall: zwei Verzögerungen
    for d, g in [(0.11, 0.35), (0.23, 0.22)]:
        bell[int(d * sr):] += bell[: n - int(d * sr)] * g
    L += bell
    R += np.roll(bell, int(0.02 * sr))

    # Stille-Abschnitte hart (mit Überblendung) stummschalten
    m_on = 1 - mask({"silence"})
    L *= m_on
    R *= m_on
    out = np.stack([L, R], axis=1)
    peak = np.max(np.abs(out)) or 1.0
    return (out / peak * 0.7).astype(np.float32)


def write_wav(path, data, sr):
    """32-bit-float-WAV über ffmpeg schreiben (bitexakt, gleiche Form wie sfx_synth)."""
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    p = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", "2", "-i", "-",
                        "-c:a", "pcm_f32le", "-fflags", "+bitexact", "-flags:a", "+bitexact", path],
                       input=data.tobytes(), capture_output=True)
    if p.returncode != 0:
        raise SystemExit(f"ffmpeg: {p.stderr.decode()[-800:]}")


def render_to(plan, path, sr=48000):
    write_wav(path, render(plan, sr), sr)
    return path


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--plan", required=True, help="JSON-Datei mit dem Musik-Plan")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    render_to(json.load(open(a.plan)), a.out)
    print(a.out)


if __name__ == "__main__":
    sys.exit(main())
