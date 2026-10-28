#!/usr/bin/env python3
"""Erzeugt timeline.json dieser Produktion (Zeiten, Einstellungen, Kamera, HUD, Ton, Figuren-Positionen).

Die Kamera wird nicht frei per Hand gesetzt, sondern aus Bildgestaltungs-Vorgaben berechnet:
frame(Kopfmitte, Richtung, Abstand, Kamerahöhe, Bildposition x/y des Kopfes, Bildwinkel) → pos/look.
So bleibt die Bildaufteilung (Countdown unter dem Titel, Gesicht rechts vom HUD, Untertitel unter dem
Gesicht) über alle Einstellungen gleich.

  python3 productions/every-lie-costs-a-minute/make_timeline.py
"""
import json
import math
import os

FPS = 30
ASPECT = 1080 / 1920
SW = 0.15  # Höhe des Gehwegs


def r3(v):
    return [round(x, 3) for x in v]


def frame(head, phi, dist, cam_y, sx=0.66, sy=0.52, fov=42):
    """Kamera im Abstand dist vom Kopf in Richtung phi (0 = +z, π/2 = +x), Höhe cam_y.
    Der Kopf erscheint bei Bildposition (sx, sy) (0..1, oben links = 0,0)."""
    hx, hy, hz = head
    cx = hx + dist * math.sin(phi)
    cz = hz + dist * math.cos(phi)
    c = (cx, cam_y, cz)
    dx, dy, dz = hx - cx, hy - cam_y, hz - cz
    yaw = math.atan2(dx, dz)
    el = math.atan2(dy, math.hypot(dx, dz))
    vt = math.tan(math.radians(fov) / 2)
    ht = vt * ASPECT
    yaw += math.atan((sx - 0.5) * 2 * ht)  # Kopf rechts der Mitte → Blick nach links drehen
    el += math.atan((sy - 0.5) * 2 * vt)   # Kopf unterhalb der Mitte → Blick anheben
    L = 6.0
    look = (cx + L * math.cos(el) * math.sin(yaw), cam_y + L * math.sin(el), cz + L * math.cos(el) * math.cos(yaw))
    return r3(c), r3(look)


def key(t, head, phi, dist, cam_y, sx=0.64, sy=0.52, fov=42, ease=None):
    pos, look = frame(head, phi, dist, cam_y, sx, sy, fov)
    k = {"t": t, "pos": pos, "look": look, "fov": fov}
    if ease:
        k["ease"] = ease
    return k


AX, HX = 200.0, -200.0
PI = math.pi
# Figuren: Position (x, Boden-y, z), Blickrichtung rotY, Sitzhöhe (Hüfte über Boden) oder None
STAGE = {
    "hero": [6.8, SW, 0.0, -0.3, None],
    "sad": [8.45, SW, -30.25, -PI / 2, 0.5],
    "late": [7.95, SW, -59.6, -0.93, 0.48],
    "cand": [-14.55, 0.0, -90.0, -PI / 2, 0.48],
    "boss": [-16.45, 0.0, -90.0, PI / 2, 0.48],
    "biz": [7.35, SW, -150.1, -1.15, None],
    "artist": [-7.6, SW, -171.0, 0.55, None],
    "friend": [-7.25, SW, -169.45, 2.64, None],
    "him": [AX, 0.0, 0.92, PI, 0.48],
    "her": [AX, 0.0, -0.92, 0.0, 0.48],
    "father": [HX - 1.15, 0.0, 0.38, PI / 2, 0.49],
    "girl": [HX - 1.15, 0.0, -0.12, PI / 2, 0.49],
}


def head(name, lean=0.0):
    x, y, z, rot, seat = STAGE[name]
    if name == "girl":
        h = y + seat + 0.49
    else:
        h = y + (seat if seat is not None else 0.93) + 0.78
    # Vorbeugen verschiebt den Kopf nach vorn/unten
    return (x + 0.6 * lean * math.sin(rot), h - 0.15 * lean, z + 0.6 * lean * math.cos(rot))


S = STAGE
shots = []


def shot(id_, a, b, keys, tr=None, mode=None):
    s = {"id": id_, "from": a, "to": b, "camera": {"keys": keys}}
    if mode:
        s["camera"]["mode"] = mode
    if tr:
        s["transition_in"] = tr
    shots.append(s)


# Szene 1 – Hook: Held, Lüge bei 1,8 s, schneller Push-in
H = head("hero")
f1 = S["hero"][3] + 0.12
shot("s01", 0.0, 4.0, [
    key(0.0, H, f1, 3.45, 1.66, 0.67, 0.53, 42),
    key(1.8, H, f1 - 0.03, 3.15, 1.66, 0.67, 0.53, 42),
    key(2.3, H, f1 - 0.06, 2.45, 1.7, 0.67, 0.55, 40, "inOut"),
    key(4.0, H, f1 - 0.08, 2.3, 1.71, 0.67, 0.54, 40),
])
# Szene 2 – Montage
H = head("sad", 0.2)
f = S["sad"][3]
shot("s02", 4.0, 6.6, [
    key(4.0, H, f + 0.62, 2.7, 1.32, 0.67, 0.5, 42),
    key(5.4, H, f + 0.48, 2.6, 1.32, 0.67, 0.5, 42),
    key(5.85, H, f + 0.42, 2.0, 1.34, 0.67, 0.52, 40, "inOut"),
    key(6.6, H, f + 0.38, 1.95, 1.34, 0.67, 0.52, 40),
], tr={"type": "whip", "frames": 8, "direction": "right"})
H = head("late", -0.1)
f = S["late"][3]
shot("s03", 6.6, 9.2, [
    key(6.6, H, f - 0.2, 2.7, 1.38, 0.67, 0.5, 42),
    key(8.0, H, f - 0.08, 2.55, 1.38, 0.67, 0.5, 42),
    key(8.45, H, f - 0.04, 1.95, 1.4, 0.67, 0.52, 40, "inOut"),
    key(9.2, H, f - 0.02, 1.9, 1.4, 0.67, 0.52, 40),
])
H = head("cand", 0.08)
f = S["cand"][3]
shot("s04", 9.2, 11.8, [
    key(9.2, H, f + 0.62, 2.75, 1.36, 0.67, 0.5, 42),
    key(10.7, H, f + 0.55, 2.55, 1.36, 0.67, 0.5, 42),
    key(11.15, H, f + 0.5, 1.95, 1.36, 0.67, 0.52, 40, "inOut"),
    key(11.8, H, f + 0.48, 1.9, 1.36, 0.67, 0.52, 40),
], tr={"type": "whip", "frames": 8, "direction": "left"})
# Orientierungs-Totale über der Straße (≤ 3 s)
shot("s05", 11.8, 14.4, [
    {"t": 11.8, "pos": [-2.0, 4.4, -100.5], "look": [-3.6, 1.3, -126.0], "fov": 50},
    {"t": 14.4, "pos": [-1.7, 4.8, -104.0], "look": [-3.8, 1.3, -130.0], "fov": 50},
])
# Szene 3 – Panik: Fahrt mit der Menge
shot("s06", 14.4, 18.0, [
    {"t": 14.4, "pos": [-7.15, 1.82, -110.5], "look": [-6.5, 1.8, -135.0], "fov": 46},
    {"t": 18.0, "pos": [-7.15, 1.82, -116.0], "look": [-6.2, 1.8, -140.0], "fov": 46},
])
H = head("biz")
f = S["biz"][3] + 0.2
shot("s07", 18.0, 21.4, [
    key(18.0, H, f + 0.18, 3.0, 1.68, 0.67, 0.53, 42),
    key(20.0, H, f + 0.06, 2.8, 1.68, 0.67, 0.53, 42),
    key(20.5, H, f + 0.02, 2.15, 1.7, 0.67, 0.55, 40, "inOut"),
    key(21.4, H, f, 2.05, 1.7, 0.67, 0.55, 40),
])
# Gemälde: zwei Einstellungen über die Schulter, Kamera bleibt auf der Straßenseite (180°-Regel)
H = head("artist")
shot("s08", 21.4, 24.2, [
    key(21.4, H, S["artist"][3] + 0.38, 2.6, 1.66, 0.67, 0.52, 42),
    key(24.2, H, S["artist"][3] + 0.3, 2.35, 1.66, 0.67, 0.52, 42),
])
H = head("friend")
shot("s08b", 24.2, 26.7, [
    key(24.2, H, S["friend"][3] - 0.36, 2.45, 1.66, 0.67, 0.52, 42),
    key(24.4, H, S["friend"][3] - 0.35, 2.4, 1.66, 0.67, 0.52, 42),
    key(26.7, H, S["friend"][3] - 0.3, 2.1, 1.66, 0.67, 0.52, 40),
])
# Szene 4 – Wohnung: über die Schulter, langsames Heranfahren
H = head("her", 0.16)
shot("s09", 26.7, 29.8, [
    key(26.7, H, 0.32, 2.35, 1.34, 0.67, 0.5, 40),
    key(29.8, H, 0.3, 2.15, 1.33, 0.67, 0.5, 40),
], tr={"type": "dip", "frames": 6})
H = head("him", 0.22)
shot("s10", 29.8, 35.5, [
    key(29.8, H, PI - 0.3, 2.35, 1.34, 0.67, 0.5, 40),
    key(35.5, H, PI - 0.27, 1.7, 1.32, 0.67, 0.52, 36),
])
H = head("her", 0.16)
shot("s11", 35.5, 39.0, [
    key(35.5, H, 0.36, 2.25, 1.38, 0.67, 0.44, 42),
    key(39.0, H, 0.32, 2.05, 1.36, 0.67, 0.45, 40),
])
# Szene 5 – Krankenhaus
H = head("father", 0.28)
shot("s12", 39.0, 42.8, [
    key(39.0, H, PI / 2 - 0.62, 3.6, 1.8, 0.57, 0.37, 44),
    key(42.8, H, PI / 2 - 0.55, 3.2, 1.75, 0.57, 0.37, 44),
], tr={"type": "dip", "frames": 6})
H = head("father", 0.28)
Hc = (H[0], H[1] + 0.45, H[2])  # Blick auf den Countdown über dem Kopf
fp = PI / 2 - 0.42
shot("s13", 42.8, 46.8, [
    key(42.8, H, fp, 2.2, 1.36, 0.67, 0.52, 40),
    key(43.15, H, fp + 0.01, 2.15, 1.36, 0.67, 0.52, 40),
    key(43.5, Hc, fp + 0.02, 2.05, 1.4, 0.68, 0.5, 40, "inOut"),
    key(43.85, Hc, fp + 0.03, 2.0, 1.4, 0.68, 0.5, 40),
    key(44.2, H, fp + 0.04, 1.95, 1.37, 0.67, 0.52, 40, "inOut"),
    key(45.3, H, fp + 0.06, 1.85, 1.37, 0.67, 0.52, 40),
    key(45.8, H, fp + 0.08, 1.45, 1.36, 0.67, 0.55, 38, "inOut"),
    key(46.8, H, fp + 0.09, 1.4, 1.36, 0.67, 0.55, 38),
])
Hm = head("father", 0.3)
shot("s14", 46.8, 50.0, [
    key(46.8, Hm, PI / 2 - 0.55, 2.8, 1.7, 0.57, 0.38, 44),
    key(50.0, Hm, PI / 2 - 0.7, 3.6, 2.4, 0.57, 0.42, 46),
])
# Szene 6 – Schlussfrage in der dunklen Straße
shot("s15", 50.0, 55.0, [
    {"t": 50.0, "pos": [0.0, 1.62, -211.0], "look": [0.9, 3.6, -260.0], "fov": 48},
    {"t": 55.0, "pos": [0.0, 1.64, -216.3], "look": [0.9, 3.65, -260.0], "fov": 48},
], tr={"type": "dip", "frames": 6})

FULL = 42048000  # 80 Jahre in Minuten: Bezug der Fortschrittsskala


def life(id_, base, drop=None, warns=(), from_=0.0):
    keys = [[from_, base]] + ([[drop, base - 1]] if drop is not None else [])
    seg = {"id": id_, "from": from_, "value": {"keys": keys, "ease": "hold"}, "decimals": 0, "bar": [0, FULL]}
    fl = ([{"t": drop, "kind": "loss"}] if drop is not None else []) + [{"t": w, "kind": "warn"} for w in warns]
    if fl:
        seg["flashes"] = sorted(fl, key=lambda x: x["t"])
    return seg


street_drops = [12.4, 12.9, 13.3, 13.7, 14.0]
hud = [
    life("h_hero", 24198417, 1.8, from_=0.0),
    life("h_fine", 31540206, 5.4, from_=4.0),
    life("h_late", 18077930, 8.0, from_=6.6),
    life("h_job", 27664512, 10.7, from_=9.2),
    {"id": "h_street", "from": 11.8, "value": {"keys": [[11.8, 3412]] + [[d, 3413 + i] for i, d in enumerate(street_drops)], "ease": "hold"},
     "decimals": 0, "bar": [0, 5000], "flashes": [{"t": d, "kind": "loss"} for d in street_drops]},
    {"id": "h_city", "from": 14.4, "value": {"keys": [[14.4, 1206400], [18.0, 1214950]], "ease": "linear"}, "decimals": 0, "bar": [0, 2000000]},
    life("h_deal", 22915064, 20.0, from_=18.0),
    life("h_artist", 26930118, None, from_=21.4),
    life("h_paint", 29301778, None, warns=[24.4], from_=24.2),
    life("h_honest", 20488351, None, warns=[29.9, 30.8], from_=26.7),
    life("h_father", 19730662, 45.3, warns=[43.3], from_=39.0),
    # Schlussbild: der Mann aus Szene 1 (Kreisschluss) – sein Countdown bleibt stehen
    life("h_end", 24198416, None, from_=50.0),
]
lines = [("l01", 0.3, 4.0), ("l02", 4.2, 6.6), ("l03", 6.8, 9.2), ("l04", 9.4, 11.8), ("l05", 12.0, 14.4), ("l06", 14.6, 18.0),
         ("l07", 18.2, 21.4), ("l08", 21.6, 24.2), ("l09", 24.4, 26.7), ("l10", 27.0, 29.8), ("l11", 31.9, 35.5), ("l12", 35.7, 39.0),
         ("l13", 39.4, 42.8), ("l14", 44.2, 46.8), ("l15", 47.0, 50.0)]
crowd_drops = [{"t": 12.4, "at": [-6.0, -116]}, {"t": 12.9, "at": [-8.3, -121]}, {"t": 13.3, "at": [-6.0, -124]},
               {"t": 13.7, "at": [-8.3, -114]}, {"t": 14.0, "at": [-6.0, -128]},
               {"t": 15.0, "at": [-6.0, -119]}, {"t": 15.6, "at": [-8.3, -122]}, {"t": 16.3, "at": [-6.0, -124]},
               {"t": 17.0, "at": [-8.3, -125]}, {"t": 17.5, "at": [-6.0, -127]}]
events = [{"t": 0.2, "id": "countdown_appears"}, {"t": 1.8, "id": "first_lie", "trigger": True}, {"t": 5.4, "id": "lie_fine"},
          {"t": 8.0, "id": "lie_late"}, {"t": 10.7, "id": "lie_interview"}, {"t": 12.4, "id": "street_losses"},
          {"t": 20.0, "id": "lie_deal"}, {"t": 24.4, "id": "almost_lie"}, {"t": 29.9, "id": "hesitation"},
          {"t": 31.9, "id": "truth"}, {"t": 36.0, "id": "hands"}, {"t": 43.3, "id": "glance_countdown"},
          {"t": 45.3, "id": "protective_lie"}, {"t": 46.85, "id": "hug"}, {"t": 50.0, "id": "question"}]


def lie(t, g):
    return {"src": "gen:lie_hit", "t": t, "gain_db": g}


sfx = [{"src": "gen:appear", "t": 0.2, "gain_db": -3}, lie(1.8, 0), {"src": "gen:whoosh", "t": 3.666667, "gain_db": -9},
       lie(5.4, -2), lie(8.0, -2), {"src": "gen:whoosh", "t": 8.866667, "gain_db": -9}, lie(10.7, -2)]
sfx += [lie(d, -12) for d in street_drops] + [lie(d["t"], -11) for d in crowd_drops[5:]]
sfx += [lie(20.0, -1), {"src": "gen:pulse", "t": 24.4, "gain_db": -10},
        {"src": "gen:pulse", "t": 29.9, "gain_db": -6}, {"src": "gen:pulse", "t": 30.8, "gain_db": -6},
        {"src": "gen:pulse", "t": 43.3, "gain_db": -7}, lie(45.3, 1), {"src": "gen:appear", "t": 50.0, "gain_db": -4}]
sfx.sort(key=lambda s: s["t"])
audio = {
    "fade_out": 1.6,
    "beds": [
        {"src": "gen:city", "start": 0, "end": 55, "gain_db": -4,
         "automation": [[0, -2], [11.8, -2], [12.0, 1], [18.0, 1], [20.0, 1], [20.3, -10], [21.3, -10], [21.4, -3], [26.4, -3],
                        [26.9, -20], [38.8, -20], [39.0, -26], [50.0, -26], [50.1, -12], [55, -14]]},
        {"src": "gen:drone", "start": 0, "end": 55, "gain_db": -12,
         "automation": [[0, -6], [4, -4], [11.8, -1], [14.4, 2], [18.0, 3], [20.0, 3], [20.3, -6], [21.4, -2], [26.4, 0], [26.9, -10],
                        [29.6, -16], [31.9, -20], [35.5, -10], [39.0, -12], [43.0, -10], [45.3, -2], [47.0, -4], [49.6, -14],
                        [50.0, -12], [55, -14]]},
        {"src": "gen:tension", "start": 26.7, "end": 39.0, "gain_db": -12,
         "automation": [[26.7, -12], [28, 0], [31.7, 2], [32.0, -6], [37.0, -6], [39.0, -20]]},
        {"src": "gen:hum", "start": 39.0, "end": 50.0, "gain_db": -14, "automation": [[39.0, 0], [47.5, 0], [50.0, -18]]},
    ],
    "sfx": sfx,
}
tl = {
    "_comment": "What If Every Lie Cost You One Minute of Your Life? – erzeugt von make_timeline.py (nicht von Hand ändern). "
                "HUD = Countdown der Figur im Fokus; die 3D-Anzeigen über den Köpfen lesen dieselben Werte.",
    "fps": FPS, "duration": 55, "seed": 20261028, "pointe": 50.0,
    "length_deviation": {"min": 45, "max": 55, "reason": "Ausdrückliche Längenvorgabe des Auftraggebers (45–55 s, Auftrag vom 2026-10-28); Begründung im LOG"},
    "title": {"in": 0, "out": 2.9},
    "shots": shots, "hud": hud,
    "lines": [{"id": i, "in": a, "out": b} for i, a, b in lines],
    "endcard": {"in": 50.4, "center": 0.3},
    "events": events, "crowd_drops": crowd_drops,
    "stage": {k: [round(v, 4) if isinstance(v, float) else v for v in val] for k, val in STAGE.items()},
    "audio": audio,
}
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "timeline.json")
with open(out, "w") as fh:
    json.dump(tl, fh, indent=1, ensure_ascii=False)
    fh.write("\n")
print(out)
