#!/usr/bin/env python3
"""Ton dieser Produktion: Musik, Ambience und Einzelklänge – vollständig synthetisch (numpy), geseedet, lizenzfrei.

Schreibt nach productions/mountain-cabin/audio/ (WAV wird nicht versioniert):
  bed_music.wav      Filmmusik (Klavier, Flächen, Streicher-Tremolo, Pauken) entlang der Dramaturgie
  bed_ambience.wav   Wind, Vögel, Wald, Wasserfall, Sturm, Regen außen/Dach innen, Kaminfeuer, Abendwind
  <name>.wav         Einzelklänge (Tür, Schritte, Eingießen, Brot, Donner, Holz, Streichholz …),
                     zeitlich platziert über timeline.json → audio.sfx (tools/audio_mix.py)

Zeiten der Ambience/Musik kommen aus timeline.json (Einstellungen, Ereignisse) – eine Quelle für Bild und Ton.
Aufruf: python3 productions/mountain-cabin/sound_design.py
"""
import json
import os
import struct

import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "audio")
TL = json.load(open(os.path.join(HERE, "timeline.json")))
DUR = TL["duration"]
N = int(round(DUR * SR))
EV = {e["id"]: e["t"] for e in TL["events"]}
SHOT = {s["id"]: (s["from"], s["to"]) for s in TL["shots"]}
RNG = np.random.default_rng(20261028)


# ---------------------------------------------------------------- Werkzeuge
def write(name, x):
    x = np.asarray(x, dtype=np.float32)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    os.makedirs(OUT, exist_ok=True)
    data = x.astype("<f4").tobytes()
    with open(os.path.join(OUT, name + ".wav"), "wb") as f:
        f.write(b"RIFF" + struct.pack("<I", 36 + len(data)) + b"WAVE")
        f.write(b"fmt " + struct.pack("<IHHIIHH", 16, 3, 2, SR, SR * 8, 8, 32))
        f.write(b"data" + struct.pack("<I", len(data)) + data)


def tvec(n):
    return np.arange(n) / SR


def shape(x, gain_fn):
    """Frequenzgang per FFT (zeitinvariant)."""
    n = len(x)
    X = np.fft.rfft(x, n)
    f = np.fft.rfftfreq(n, 1 / SR)
    return np.fft.irfft(X * gain_fn(np.maximum(f, 1e-3)), n)


def noise(n, slope=0.0, rng=RNG):
    """Rauschen mit Spektralneigung: 0 weiß, 1 rosa, 2 braun."""
    return norm(shape(rng.standard_normal(n), lambda f: f ** (-slope / 2)))


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-12)


def lp(fc, order=2):
    return lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * order))


def hp(fc, order=2):
    return lambda f: 1 / np.sqrt(1 + (fc / f) ** (2 * order))


def bp(fc, q):
    return lambda f: 1 / np.sqrt(1 + (q * (f / fc - fc / f)) ** 2)


def mul(*fs):
    return lambda f: np.prod([g(f) for g in fs], axis=0)


def curve(points, n=N):
    """Stückweise linear (Sekunde, Wert) → Abtastwerte."""
    pts = sorted(points)
    return np.interp(tvec(n), [p[0] for p in pts], [p[1] for p in pts])


def smooth_lfo(n, rate, rng=RNG):
    """langsame Zufallsmodulation 0..1 (Böen)."""
    k = max(4, int(n / SR * rate) + 4)
    pts = rng.random(k)
    x = np.interp(np.linspace(0, k - 3, n), np.arange(k), pts)
    return shape(x - x.mean(), lp(rate * 1.5, 1)) + x.mean()


def fade(x, a=0.005, b=0.01):
    n = len(x)
    e = np.ones(n)
    na, nb = int(a * SR), int(b * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nb:
        e[-nb:] = np.minimum(e[-nb:], np.linspace(1, 0, nb))
    return x * (e[:, None] if x.ndim == 2 else e)


def stereo(l, r=None, width=0.0, rng=RNG):
    if r is None:
        d = int(0.011 * SR)
        r = np.concatenate([np.zeros(d), l[:-d]]) if width else l
        r = l * (1 - width) + r * width
    return np.stack([l, r], 1)


def pan(x, p):
    p = np.clip(p, -1, 1)
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)


def reverb(x, t60=2.2, mix=0.3, pre=0.012, rng=None):
    rng = rng or np.random.default_rng(7)
    n_ir = int(t60 * SR)
    t = tvec(n_ir)
    out = np.zeros_like(x)
    for ch in range(2):
        ir = rng.standard_normal(n_ir) * np.exp(-6.9 * t / t60)
        ir = shape(ir, lp(5000, 1))
        ir = np.concatenate([np.zeros(int(pre * SR)), ir])
        ir /= np.sqrt(np.sum(ir ** 2))
        n = len(x) + len(ir)
        L = 1 << (n - 1).bit_length()
        y = np.fft.irfft(np.fft.rfft(x[:, ch], L) * np.fft.rfft(ir, L), L)[: len(x)]
        out[:, ch] = y
    return x * (1 - mix) + out * mix


def place(buf, x, t0, gain=1.0):
    i = int(round(t0 * SR))
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    buf[i: i + len(x)] += gain * x


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def nm(s):
    """'D4' → MIDI"""
    name, octv = s[:-1], int(s[-1])
    return NOTE[name] + 12 * (octv + 1)


# ---------------------------------------------------------------- Instrumente
def piano(f, dur=3.5, vel=0.6, rng=RNG):
    n = int(dur * SR)
    t = tvec(n)
    y = np.zeros(n)
    B = 0.0004
    for k in range(1, 11):
        fk = f * k * np.sqrt(1 + B * k * k)
        if fk > 16000:
            break
        dec = (2.8 + 0.6 * (f < 200)) / (1 + 0.45 * (k - 1)) * (220 / max(f, 110)) ** 0.35
        a = (1 / k ** 1.1) * (0.6 + 0.4 * vel) ** (k * 0.25)
        y += a * np.sin(2 * np.pi * fk * t + rng.random() * 6.28) * np.exp(-t / dec)
    y *= 1 - np.exp(-t / 0.003)
    ham = shape(rng.standard_normal(int(0.02 * SR)), bp(f * 3, 0.7)) * np.exp(-tvec(int(0.02 * SR)) / 0.004) * 0.15
    y[: len(ham)] += ham
    y = fade(y, 0.001, 0.25)
    return y * vel


def pad(freqs, dur, attack=1.5, release=1.5, bright=0.5, vib=0.15, rng=RNG):
    n = int(dur * SR)
    t = tvec(n)
    y = np.zeros(n)
    for f in freqs:
        for det in (-0.07, 0.0, 0.06):
            ff = f * 2 ** (det / 12)
            ph = rng.random() * 6.28
            fm = 1 + 0.002 * np.sin(2 * np.pi * (4.8 + rng.random()) * t + ph) * vib
            phase = 2 * np.pi * np.cumsum(ff * fm) / SR
            for k in range(1, 9):
                if ff * k > 9000:
                    break
                y += (1 / k) * np.exp(-k * (1 - bright) * 0.45) * np.sin(k * phase + ph * k)
    env = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / release)
    env = np.clip(env, 0, 1) ** 1.6
    return y * env / (len(freqs) * 3)


def tremolo_strings(freqs, dur, rate=7.5, attack=0.6, rng=RNG):
    y = pad(freqs, dur, attack=attack, release=0.4, bright=0.75, vib=0.5, rng=rng)
    t = tvec(len(y))
    return y * (0.65 + 0.35 * np.sin(2 * np.pi * rate * t) ** 2)


def drum_hit(dur=2.2, f0=58, rng=RNG):
    n = int(dur * SR)
    t = tvec(n)
    body = np.sin(2 * np.pi * (f0 * t + 12 * (1 - np.exp(-t * 18)) / 18)) * np.exp(-t / 0.55)
    skin = shape(rng.standard_normal(n), lp(900, 2)) * np.exp(-t / 0.08) * 0.4
    return fade(body + skin, 0.001, 0.2)


def chord_notes(names):
    return [midi(nm(n)) for n in names]


# ---------------------------------------------------------------- Musik
def music():
    L = np.zeros((N, 2))

    def add(x, t0, g=1.0, p=0.0):
        place(L, pan(x, p) if x.ndim == 1 else x, t0, g)

    # A – Enthüllung: Fläche Dadd9 schwillt mit der Tür an, Glanzton, erste Klaviertöne
    add(pad(chord_notes(["D3", "A3", "E4", "F#4"]), 5.2, attack=2.4, release=1.4, bright=0.35), 0.0, 0.55)
    sh = np.sin(2 * np.pi * midi(nm("A5")) * tvec(int(3 * SR))) * np.minimum(1, tvec(int(3 * SR)) / 1.2) * np.exp(-tvec(int(3 * SR)) / 2.2)
    add(sh * (0.6 + 0.4 * np.sin(2 * np.pi * 5 * tvec(len(sh)))), 2.3, 0.05, 0.3)
    for t0, n_, v in [(2.6, "D5", 0.5), (3.35, "A5", 0.35), (3.9, "F#5", 0.3)]:
        add(piano(midi(nm(n_)), 4, v), t0, 0.5, 0.15)

    # B/C – Morgen: Klavier-Arpeggien (80 bpm, Achtel 0,375 s) über weicher Fläche
    prog = [(4.5, ["D3", "A3", "D4", "F#4", "A4", "D5"]), (7.5, ["C#3", "A3", "C#4", "E4", "A4", "E5"]),
            (10.5, ["B2", "F#3", "B3", "D4", "F#4", "B4"]), (12.0, ["G2", "D3", "G3", "B3", "D4", "G4"]),
            (14.5, ["F#2", "D3", "F#3", "A3", "D4", "A4"])]
    order = [0, 2, 3, 4, 5, 4, 3, 2]
    for i, (t0, notes) in enumerate(prog):
        t1 = prog[i + 1][0] if i + 1 < len(prog) else 16.5
        add(pad(chord_notes(notes[:3]), t1 - t0 + 1.2, attack=0.8, release=1.2, bright=0.3), t0, 0.32)
        add(piano(midi(nm(notes[0])), 4, 0.45), t0, 0.5, -0.2)
        k = 0
        tt = t0
        while tt < t1 - 0.05:
            add(piano(midi(nm(notes[order[k % 8]])), 2.5, 0.28 + 0.06 * (k % 4 == 0)), tt, 0.3, 0.2 * np.sin(k))
            tt += 0.375
            k += 1
    # Spuren: Musik dünnt aus, gehaltener Vorhalt, tiefer Celloton
    add(pad(chord_notes(["E3", "A3", "D4"]), 3.0, attack=0.4, release=1.0, bright=0.4), 16.5, 0.4)
    add(pad(chord_notes(["A2"]), 2.8, attack=0.5, release=0.8, bright=0.55, vib=0.6), 17.7, 0.55)
    add(piano(midi(nm("E5")), 3, 0.35), 16.55, 0.4, 0.3)

    # D – Entdeckung: Ostinato (Achtel 0,3 s) mit wachsenden Streichern, Auflösung beim Wasserfall
    seq = [(19.0, ["B2", "F#3", "B3", "D4"]), (20.2, ["G2", "D3", "G3", "B3"]), (21.4, ["D3", "A3", "D4", "F#4"]),
           (22.3, ["A2", "E3", "A3", "C#4"])]
    for i, (t0, notes) in enumerate(seq):
        t1 = seq[i + 1][0] if i + 1 < len(seq) else 23.0
        tt = t0
        k = 0
        while tt < t1 - 0.02:
            add(piano(midi(nm(notes[(k % 3) + 1])) * 2, 1.6, 0.25 + 0.1 * (tt - 19) / 4), tt, 0.4, 0.25)
            tt += 0.3
            k += 1
        add(pad(chord_notes(notes), t1 - t0 + 0.6, attack=0.5, release=0.6, bright=0.5 + 0.1 * i), t0, 0.25 + 0.08 * i)
    add(pad(chord_notes(["D2", "A2", "D3", "F#3", "A3", "D4", "F#4", "A4"]), 3.2, attack=0.15, release=1.6, bright=0.65), 23.0, 0.85)
    add(pad(chord_notes(["D5", "F#5", "A5"]), 3.0, attack=0.35, release=1.6, bright=0.8, vib=0.8), 23.0, 0.25, 0.2)
    for t0, n_ in [(23.0, "D4"), (23.0, "A4"), (23.0, "F#5"), (24.5, "E5"), (25.1, "D5"), (25.9, "C#5"), (26.6, "A4")]:
        add(piano(midi(nm(n_)), 3.5, 0.5), t0, 0.45, 0.1)
    add(pad(chord_notes(["A2", "C#3", "E3", "A3"]), 2.2, attack=0.6, release=1.0, bright=0.45), 25.6, 0.4)

    # E – Sturm: h-Moll-Orgelpunkt, Streichertremolo mit Crescendo, Paukenschläge, Abriss bei der Tür
    storm_end = EV["door_slam"]
    drone = pad(chord_notes(["B1", "F#2"]), storm_end - 27.5 + 0.05, attack=1.2, release=0.05, bright=0.4)
    cres = curve([(0, 0.35), (storm_end - 27.5 - 0.6, 1.0), (storm_end - 27.5, 1.0)], len(drone))
    add(drone * cres, 27.5, 0.75)
    trem = [(27.5, ["B3", "D4", "F#4"]), (29.6, ["G3", "B3", "D4"]), (31.6, ["E3", "G3", "B3", "E4"]), (33.6, ["F#3", "A#3", "C#4", "F#4"])]
    for i, (t0, notes) in enumerate(trem):
        t1 = trem[i + 1][0] if i + 1 < len(trem) else storm_end
        x = tremolo_strings(chord_notes(notes), t1 - t0 + (0.3 if i < 3 else 0.02), rate=6 + i)
        add(x * (0.35 + 0.2 * i), t0, 0.7, -0.1 + 0.2 * i)
    for t0, g in [(EV["thunder1"], 0.6), (EV["logs_grab"], 0.5), (32.6, 0.55), (EV["lightning"] + 0.1, 0.9), (35.4, 0.7)]:
        add(drum_hit(), t0, g)
    # harter Abriss genau beim Türknall (wenige ms Ausblendung gegen Knackser)
    i = int(storm_end * SR)
    L[i: i + int(0.008 * SR)] *= np.linspace(1, 0, int(0.008 * SR))[:, None]
    L[i + int(0.008 * SR): int(EV["match_strike"] * SR)] = 0

    # F – drinnen: sparsames Klavier, warm
    inner = [(EV["lamp_lit"], ["G2", "D3", "B3", "F#4"], ["B4", "A4"]), (EV["fire_catch"], ["F#2", "D3", "A3", "D4"], ["F#4", "E4"]),
             (41.5, ["E2", "B2", "G3", "D4"], ["G4", "F#4", "E4"]), (43.5, ["A2", "E3", "A3", "D4"], ["E4", "C#4"])]
    for i, (t0, chord, mel) in enumerate(inner):
        for j, n_ in enumerate(chord):
            add(piano(midi(nm(n_)), 4, 0.32), t0 + j * 0.09, 0.45, -0.3 + 0.2 * j)
        for j, n_ in enumerate(mel):
            add(piano(midi(nm(n_)), 3, 0.3), t0 + 0.9 + j * 0.6, 0.42, 0.25)
        add(pad(chord_notes(chord[1:3]), 2.4, attack=0.9, release=1.0, bright=0.25), t0, 0.18)

    # G – Aufstieg und Gipfel: Steigerung bis zum Höhepunkt
    rise = [(45.5, ["G2", "D3", "G3", "B3", "D4"]), (47.0, ["F#2", "D3", "F#3", "A3", "D4"]), (48.3, ["E2", "B2", "E3", "G3", "B3"]),
            (49.4, ["D2", "A2", "D3", "F#3", "A3"]), (50.5, ["G2", "D3", "G3", "B3", "D4", "G4", "B4"]),
            (52.0, ["A2", "E3", "A3", "C#4", "E4", "A4", "C#5"]), (53.2, ["D2", "A2", "D3", "F#3", "A3", "D4", "F#4", "A4"])]
    for i, (t0, notes) in enumerate(rise):
        t1 = rise[i + 1][0] if i + 1 < len(rise) else 55.2
        g = 0.3 + 0.1 * i
        add(pad(chord_notes(notes), t1 - t0 + 0.8, attack=0.35 if i else 0.9, release=0.8, bright=0.45 + 0.05 * i, vib=0.6), t0, g)
        add(piano(midi(nm(notes[0])), 4, 0.5), t0, 0.5, -0.2)
        tt = t0
        k = 0
        while tt < t1 - 0.05:
            add(piano(midi(nm(notes[1 + (k % (len(notes) - 1))])) * 2, 2.0, 0.25 + 0.03 * i), tt, 0.34, 0.3 * np.sin(k * 1.3))
            tt += 0.25
            k += 1
    for t0, n_ in [(50.5, "D6"), (50.5, "B5"), (52.0, "C#6"), (53.2, "D6"), (53.2, "A5")]:
        add(pad(chord_notes([n_[:-1] + str(int(n_[-1]) - 1)]), 1.8, attack=0.25, release=1.0, bright=0.85, vib=0.9), t0, 0.22, 0.25)
    add(drum_hit(3.0, 49), 50.5, 0.55)

    # H – Abend: ruhige Auflösung
    calm = [(54.5, ["D3", "A3", "D4", "F#4"], ["A4", "F#4"]), (56.3, ["G2", "D3", "B3", "D4"], ["B4", "A4"]),
            (58.0, ["D3", "A3", "D4", "F#4"], ["F#4", "E4", "D4"]), (60.6, ["D2", "A2", "D3", "F#3", "A3", "D4"], ["A4"])]
    for i, (t0, chord, mel) in enumerate(calm):
        t1 = calm[i + 1][0] if i + 1 < len(calm) else DUR
        for j, n_ in enumerate(chord):
            add(piano(midi(nm(n_)), 4.5, 0.3), t0 + j * 0.07, 0.42)
        for j, n_ in enumerate(mel):
            add(piano(midi(nm(n_)), 3.5, 0.28), t0 + 0.8 + j * 0.55, 0.4, 0.2)
        add(pad(chord_notes(chord[:3]), t1 - t0 + 0.6, attack=1.0, release=1.2 if i < 3 else 2.2, bright=0.3), t0, 0.3)

    L = reverb(L, 2.6, 0.32)
    return L


# ---------------------------------------------------------------- Ambience
def ambience():
    A = np.zeros((N, 2))
    sh = SHOT

    # 1) Bergwind tagsüber (weich, böig). Innen gedämpft.
    w = shape(noise(N, 1.6), mul(lp(700, 2), hp(60, 1)))
    w2 = shape(noise(N, 1.6, np.random.default_rng(3)), mul(lp(700, 2), hp(60, 1)))
    gust = 0.55 + 0.45 * smooth_lfo(N, 0.35)
    lvl = curve([(0, 0.25), (1.8, 0.3), (3.0, 1.0), (7.0, 1.0), (7.0, 0.22), (10.2, 0.22), (10.8, 0.85), (11.5, 0.9),
                 (19.0, 0.9), (19.0, 0.55), (27.5, 0.6), (27.6, 0.0), (45.5, 0.0), (45.5, 0.9), (54.5, 1.0), (54.5, 0.0), (63, 0.0)])
    A += np.stack([w, w2], 1) * (gust * lvl * 0.22)[:, None]

    # 2) Vögel (nur vor dem Sturm und am Gipfel), zufällige Rufe
    rng = np.random.default_rng(11)
    birds = np.zeros((N, 2))
    t = 0.2
    while t < 27.0:
        kind = rng.integers(0, 3)
        n = int(rng.uniform(0.08, 0.35) * SR)
        tt = tvec(n)
        f0 = rng.uniform(2600, 5200)
        if kind == 0:
            f = f0 * (1 + 0.25 * np.sin(2 * np.pi * rng.uniform(18, 30) * tt))
        elif kind == 1:
            f = f0 * np.linspace(1.15, 0.8, n)
        else:
            f = f0 * (1 + 0.4 * tt / tt[-1])
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / tt[-1]) ** 2
        reps = rng.integers(1, 4)
        for r in range(reps):
            place(birds, pan(x * rng.uniform(0.3, 1.0), rng.uniform(-0.9, 0.9)), t + r * (len(x) / SR + 0.07))
        t += rng.uniform(0.35, 1.4)
    for t in np.arange(45.8, 54.3, 0.9):
        n = int(0.25 * SR)
        tt = tvec(n)
        x = np.sin(2 * np.pi * np.cumsum(3200 * (1 + 0.2 * np.sin(2 * np.pi * 22 * tt))) / SR) * np.sin(np.pi * tt / tt[-1]) ** 2
        place(birds, pan(x * 0.35, rng.uniform(-0.8, 0.8)), t + rng.uniform(0, 0.5))
    blvl = curve([(0, 0.25), (2.5, 1.0), (7.0, 1.0), (7.0, 0.2), (10.4, 0.2), (10.8, 0.8), (11.5, 0.9), (19, 0.8), (22.5, 0.4),
                  (27.0, 0.2), (27.5, 0.0), (45.5, 0.0), (45.5, 0.5), (54.5, 0.5), (54.5, 0.0), (63, 0.0)])
    A += reverb(birds, 1.4, 0.35) * (blvl * 0.12)[:, None]

    # 3) Wald: Blätter-/Nadelrauschen auf dem Pfad
    lv = shape(noise(N, 0.6, np.random.default_rng(5)), mul(hp(1500, 2), lp(7000, 1)))
    lv *= 0.5 + 0.5 * smooth_lfo(N, 0.8, np.random.default_rng(6))
    flvl = curve([(0, 0), (15.8, 0), (16.5, 0.4), (19.0, 0.8), (25.0, 0.6), (27.5, 0.3), (27.6, 0), (63, 0)])
    A += stereo(lv, width=0.8) * (flvl * 0.06)[:, None]

    # 4) Wasserfall: breitbandiges Rauschen + Grollen; leise hinter dem Fels, dann voll
    wf = shape(noise(N, 0.9, np.random.default_rng(8)), mul(lp(5500, 1), hp(120, 1)))
    wf2 = shape(noise(N, 0.9, np.random.default_rng(9)), mul(lp(5500, 1), hp(120, 1)))
    rum = shape(noise(N, 2, np.random.default_rng(10)), lp(160, 2))
    wlvl = curve([(0, 0), (sh["s09_trail"][0], 0.0), (21.0, 0.08), (22.5, 0.2), (EV["reveal"], 0.55), (24.0, 0.85), (25.0, 1.0),
                  (27.4, 1.0), (27.5, 0.0), (63, 0)])
    A += (np.stack([wf, wf2], 1) * 0.9 + rum[:, None] * 0.6) * (wlvl * 0.2)[:, None]

    # 5) Sturmwind: steigt, pfeift; nach dem Türknall gedämpft durch die Wände
    sw = shape(noise(N, 1.2, np.random.default_rng(12)), mul(lp(2400, 2), hp(70, 1)))
    sw2 = shape(noise(N, 1.2, np.random.default_rng(13)), mul(lp(2400, 2), hp(70, 1)))
    whistle = shape(noise(N, 0, np.random.default_rng(14)), bp(780, 9)) * 0.6
    sgust = 0.45 + 0.55 * smooth_lfo(N, 0.9, np.random.default_rng(15))
    slam = EV["door_slam"]
    slvl = curve([(0, 0), (27.4, 0), (27.5, 0.15), (30.0, 0.5), (33.0, 0.85), (slam - 0.01, 1.0), (slam, 0.0), (63, 0)])
    A += (np.stack([sw, sw2], 1) + whistle[:, None]) * (sgust * slvl * 0.5)[:, None]
    muff = shape(noise(N, 1.8, np.random.default_rng(16)), lp(350, 2))
    mlvl = curve([(0, 0), (slam, 0), (slam + 0.01, 0.7), (EV["clear"] - 0.01, 0.6), (EV["clear"], 0), (63, 0)])
    A += stereo(muff, width=0.5) * (sgust * mlvl * 0.3)[:, None]

    # 6) Regen außen (dicht, hell) und auf dem Dach innen (dumpf + Prasseln)
    rn = shape(noise(N, 0.3, np.random.default_rng(17)), mul(hp(900, 1), lp(9000, 1)))
    rn2 = shape(noise(N, 0.3, np.random.default_rng(18)), mul(hp(900, 1), lp(9000, 1)))
    rlvl = curve([(0, 0), (EV["rain_start"], 0), (31.0, 0.45), (34.5, 1.0), (slam - 0.01, 1.0), (slam, 0), (63, 0)])
    A += np.stack([rn, rn2], 1) * (rlvl * 0.3)[:, None]
    # Tropfenprasseln (Impulse), für Dach gefiltert
    drops = np.zeros(N)
    rr = np.random.default_rng(19)
    idx = rr.integers(int(29.9 * SR), int(EV["clear"] * SR), 14000)
    drops[idx] = rr.uniform(-1, 1, len(idx))
    roof = shape(drops, mul(bp(1200, 0.8), lp(2500, 2)))
    roof = norm(roof)
    roofb = shape(noise(N, 1.4, np.random.default_rng(20)), lp(900, 2))
    ilvl = curve([(0, 0), (slam, 0), (slam + 0.01, 1.0), (EV["clear"] - 0.01, 1.0), (EV["clear"], 0), (63, 0)])
    elvl = curve([(0, 0), (29.9, 0), (34.5, 1.0), (slam - 0.01, 1.0), (slam, 0), (63, 0)])
    A += stereo(roof * 0.6 + roofb * 0.7, width=0.7) * (ilvl * 0.09)[:, None]
    A += stereo(norm(shape(drops, hp(2500, 1))), width=0.9) * (elvl * 0.07)[:, None]

    # 7) Kaminfeuer: Grundrauschen + Knistern
    fr = shape(noise(N, 1.5, np.random.default_rng(21)), mul(lp(500, 2), hp(40, 1)))
    cr = np.zeros(N)
    rr = np.random.default_rng(22)
    for t0 in rr.uniform(EV["fire_catch"], DUR, 900):
        n = int(rr.uniform(0.002, 0.012) * SR)
        cr[int(t0 * SR): int(t0 * SR) + n] += rr.standard_normal(n)[: max(0, N - int(t0 * SR))] * np.exp(-tvec(n)[: max(0, N - int(t0 * SR))] / 0.003) * rr.uniform(0.2, 1)
    cr = shape(cr, mul(hp(800, 1), lp(7000, 1)))
    cr = norm(cr)
    clvl = curve([(0, 0), (EV["fire_catch"] - 0.1, 0), (EV["fire_catch"] + 1.5, 1.0), (EV["clear"] - 0.01, 1.0), (EV["clear"], 0),
                  (EV["evening"], 0), (EV["evening"] + 0.01, 0.9), (57.5, 0.9), (57.5, 0.0), (63, 0)])
    A += stereo(fr * 0.5 + cr * 0.6, width=0.4) * (clvl * 0.17)[:, None]

    # 8) Abend außen: leiser, hohler Wind
    ew = shape(noise(N, 1.8, np.random.default_rng(23)), mul(bp(420, 1.2), lp(1200, 2)))
    ew2 = shape(noise(N, 1.8, np.random.default_rng(24)), mul(bp(420, 1.2), lp(1200, 2)))
    evl = curve([(0, 0), (54.5, 0), (54.5, 0.25), (57.5, 0.25), (57.5, 0.9), (63, 1.0)])
    A += np.stack([ew, ew2], 1) * (evl * 0.12 * (0.7 + 0.3 * smooth_lfo(N, 0.3, np.random.default_rng(25))))[:, None]

    # 9) Raumton innen (sehr leise), damit Innenräume nicht tot klingen
    rt = shape(noise(N, 1.0, np.random.default_rng(26)), mul(lp(300, 2), hp(50, 1)))
    inside = np.zeros(N)
    for sid in ["s03_pour", "s04_bread", "s05_window", "s18_lamp", "s19_fire", "s20_window", "s21_cook", "s25_fireside"]:
        a, b = sh[sid]
        inside[int(a * SR): int(b * SR)] = 1
    A += stereo(rt, width=0.5) * (inside * 0.03)[:, None]

    return A


# ---------------------------------------------------------------- Einzelklänge
def hits(modes, dur, rng=RNG):
    n = int(dur * SR)
    t = tvec(n)
    y = sum(a * np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t / d) for f, a, d in modes)
    return y


def sfx():
    S = {}
    r = np.random.default_rng(31)

    def creak(dur, f0, f1, seed):
        rr = np.random.default_rng(seed)
        n = int(dur * SR)
        t = tvec(n)
        rate = np.interp(t, [0, dur], [f0, f1]) * (1 + 0.25 * shape(rr.standard_normal(n), lp(6, 1)) * 8)
        ph = np.cumsum(np.maximum(rate, 5)) / SR
        pulses = (np.diff(np.floor(ph), prepend=0) > 0).astype(float) * rr.uniform(0.5, 1, n)
        y = shape(pulses, lambda f: bp(650, 4)(f) + 0.8 * bp(1250, 5)(f) + 0.5 * bp(2350, 6)(f))
        env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.6
        return norm(y * env)

    S["door_creak"] = stereo(creak(1.15, 22, 48, 1) * 0.8, width=0.2)
    S["door_creak_short"] = stereo(creak(0.32, 50, 30, 2) * 0.6, width=0.2)
    th = hits([(68, 1, 0.12), (140, 0.5, 0.08), (310, 0.35, 0.05)], 0.9)
    crack = shape(r.standard_normal(int(0.9 * SR)), lp(3000, 1)) * np.exp(-tvec(int(0.9 * SR)) / 0.02)
    rattle = shape(r.standard_normal(int(0.9 * SR)), bp(900, 2)) * np.exp(-tvec(int(0.9 * SR)) / 0.18) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 23 * tvec(int(0.9 * SR)))))
    S["door_slam"] = stereo(norm(th * 1.0 + crack * 0.6 + rattle * 0.2), width=0.3)

    def step(kind, seed):
        rr = np.random.default_rng(seed)
        n = int(0.32 * SR)
        t = tvec(n)
        if kind == "wood":
            y = hits([(115 * rr.uniform(0.9, 1.1), 1, 0.05), (260, 0.5, 0.03), (520, 0.3, 0.02)], 0.32, rr)
            y += shape(rr.standard_normal(n), bp(2500, 1)) * np.exp(-t / 0.006) * 0.4
        elif kind == "soil":
            y = hits([(80, 0.6, 0.04)], 0.32, rr) + shape(rr.standard_normal(n), mul(lp(1800, 2), hp(150, 1))) * np.exp(-t / 0.05) * 0.8
        elif kind == "rock":
            gran = (rr.random(n) < 0.004) * rr.standard_normal(n)
            y = shape(gran, mul(hp(1200, 1), lp(7000, 1))) * np.exp(-t / 0.08) * 3 + hits([(95, 0.4, 0.03)], 0.32, rr)
        else:  # wet
            y = hits([(85, 0.6, 0.04)], 0.32, rr) + shape(rr.standard_normal(n), mul(hp(1800, 1), lp(9000, 1))) * np.exp(-t / 0.07) * 0.7
        return stereo(norm(fade(y, 0.001, 0.05)), width=0.1)

    S["step_wood"] = step("wood", 41)
    S["step_soil"] = step("soil", 42)
    S["step_rock"] = step("rock", 43)
    S["step_wet"] = step("wet", 44)

    # Eingießen: gurgelndes Band, Resonanz steigt mit dem Füllstand
    d = EV["pour_end"] - EV["pour_start"] + 0.15
    n = int(d * SR)
    t = tvec(n)
    base = r.standard_normal(n)
    res = np.zeros(n)
    blk = 2400
    for i in range(0, n, blk):
        seg = base[i: i + blk]
        fc = 650 + 900 * (i / n)
        res[i: i + len(seg)] = shape(seg, bp(fc, 3))
    am = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * np.cumsum(28 + 10 * r.standard_normal(n) * 0.1) / SR))
    y = (res * am + 0.3 * shape(base, mul(hp(2000, 1), lp(6000, 1)))) * np.minimum(1, t / 0.06) * np.minimum(1, (d - t) / 0.12)
    S["pour"] = stereo(norm(y) * 0.8, width=0.2)
    S["mug_set"] = stereo(norm(hits([(2150, 0.5, 0.06), (3330, 0.35, 0.04), (5200, 0.2, 0.03), (180, 0.6, 0.02)], 0.4)), width=0.1)
    # Brot: krosses Sägen
    n = int(0.34 * SR)
    t = tvec(n)
    gran = (r.random(n) < 0.02) * r.standard_normal(n)
    y = shape(gran, mul(hp(1500, 1), lp(8000, 1))) * np.sin(np.pi * t / t[-1]) + shape(r.standard_normal(n), bp(800, 1)) * 0.15 * np.sin(np.pi * t / t[-1])
    S["bread_cut"] = stereo(norm(y), width=0.15)
    S["slice_fall"] = stereo(norm(hits([(150, 1, 0.03), (420, 0.4, 0.02)], 0.25)) * 0.6)
    lat = hits([(3100, 0.6, 0.01), (5400, 0.4, 0.008)], 0.6) + creak(0.6, 40, 60, 3) * 0.4
    S["window_latch"] = stereo(norm(lat), width=0.2)
    n = int(0.6 * SR)
    t = tvec(n)
    y = shape(r.standard_normal(n) * (r.random(n) < 0.05), mul(lp(2500, 2), hp(200, 1))) * np.sin(np.pi * t / t[-1]) ** 0.5
    S["soil_pull"] = stereo(norm(y))

    def cluck(seed):
        rr = np.random.default_rng(seed)
        out = np.zeros(int(0.9 * SR))
        tt = 0.0
        for k in range(rr.integers(2, 5)):
            n = int(rr.uniform(0.05, 0.11) * SR)
            t = tvec(n)
            f0 = rr.uniform(280, 420) * np.linspace(1.15, 0.85, n)
            ph = np.cumsum(f0) / SR
            pulse = (np.sin(2 * np.pi * ph) > 0.6).astype(float)
            y = shape(pulse, lambda f: bp(900, 2)(f) + 0.6 * bp(2300, 3)(f)) * np.sin(np.pi * t / t[-1])
            place(out, y, tt)
            tt += n / SR + rr.uniform(0.03, 0.09)
        return norm(out)

    S["cluck"] = stereo(cluck(51) * 0.7, width=0.3)
    # Klangschwelle vor dem Wasserfall (umgekehrte Becken-Fläche)
    n = int(1.4 * SR)
    t = tvec(n)
    y = shape(r.standard_normal(n), mul(hp(3000, 1), lp(12000, 1))) * (t / t[-1]) ** 3
    S["reveal_swell"] = stereo(norm(y) * 0.5, width=0.9)
    # Donner
    def thunder(dur, crack_amt, seed):
        rr = np.random.default_rng(seed)
        n = int(dur * SR)
        t = tvec(n)
        rum = shape(rr.standard_normal(n), mul(lp(140, 2), hp(25, 1)))
        env = np.minimum(1, t / 0.15) * np.exp(-t / (dur / 3.2)) * (0.6 + 0.4 * smooth_lfo(n, 4, rr))
        y = norm(rum) * env
        if crack_amt:
            cr = shape(rr.standard_normal(n), mul(hp(300, 1), lp(6000, 1))) * np.exp(-t / 0.09)
            y += norm(cr) * crack_amt * np.exp(-t / 0.4)
        return stereo(norm(y), width=0.7)

    S["thunder_far"] = thunder(4.5, 0, 61)
    S["thunder_near"] = thunder(5.5, 0.9, 62)
    S["log_clunk"] = stereo(norm(hits([(280, 1, 0.06), (690, 0.6, 0.04), (1310, 0.35, 0.03)], 0.4) + 0.2 * shape(r.standard_normal(int(0.4 * SR)), bp(2000, 1)) * np.exp(-tvec(int(0.4 * SR)) / 0.01)))
    # Streichholz: Reiben, Zünden, Zischen
    n = int(1.1 * SR)
    t = tvec(n)
    scr = shape(r.standard_normal(n), mul(hp(2500, 1), lp(9000, 1))) * np.exp(-((t - 0.08) / 0.05) ** 2)
    ign = shape(r.standard_normal(n), mul(bp(1200, 0.7))) * np.minimum(1, np.maximum(0, t - 0.12) / 0.05) * np.exp(-np.maximum(0, t - 0.12) / 0.35)
    S["match"] = stereo(norm(scr * 1.0 + ign * 0.6), width=0.1)
    n = int(0.7 * SR)
    t = tvec(n)
    S["lamp_on"] = stereo(norm(shape(r.standard_normal(n), lp(500, 2)) * np.sin(np.pi * t / t[-1]) ** 2) * 0.7)
    n = int(1.4 * SR)
    t = tvec(n)
    wh = shape(r.standard_normal(n), mul(lp(1400, 2), hp(80, 1))) * (np.minimum(1, t / 0.35) * np.exp(-np.maximum(0, t - 0.35) / 0.4))
    S["fire_ignite"] = stereo(norm(wh), width=0.4)
    S["pot_set"] = stereo(norm(hits([(820, 0.6, 0.15), (1960, 0.4, 0.1), (3100, 0.25, 0.07), (140, 0.6, 0.03)], 0.7)))
    n = int(2.4 * SR)
    t = tvec(n)
    S["summit_swell"] = stereo(norm(shape(r.standard_normal(n), mul(bp(600, 0.6), lp(3000, 1))) * np.sin(np.pi * t / t[-1]) ** 2) * 0.6, width=0.9)
    return S


def main():
    write("bed_music", music())
    write("bed_ambience", ambience())
    for k, v in sfx().items():
        write(k, fade(v, 0.004, 0.01))
    used = {os.path.basename(c["src"])[:-4] for c in TL["audio"]["sfx"]}
    have = set(os.path.splitext(f)[0] for f in os.listdir(OUT))
    missing = used - have
    if missing:
        raise SystemExit(f"fehlende Klänge: {sorted(missing)}")
    print(f"audio/: Musik, Ambience, {len(used)} verwendete Einzelklänge")


if __name__ == "__main__":
    main()
