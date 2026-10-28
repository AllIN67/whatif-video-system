#!/usr/bin/env python3
"""Erzeugt productions/what-if-same-girlfriend/timeline.json (Aufruf: python3 make_timeline.py timeline.json)."""
import json, sys

OUT = sys.argv[1]
FPS = 30
S, C, P, R, A = 0, 400, 800, 1200, 1600


def f(t):
    return round(round(t * FPS) / FPS, 6)


def key(t, pos, look, fov, sx=0):
    return {"t": t, "pos": [round(pos[0] + sx, 3), pos[1], pos[2]], "look": [round(look[0] + sx, 3), look[1], look[2]], "fov": fov}


shots = [
    ("s01_queue", 0.0, 3.8, None, S, [(0.0, (-4.25, 1.65, 2.2), (-6.1, 1.25, 22), 48), (3.8, (-4.1, 1.65, 6.6), (-6.0, 1.3, 27), 48)]),
    ("s01b_door", 3.8, 6.0, {"type": "cut"}, S, [(3.8, (-1.9, 1.6, 1.5), (-8.7, 1.5, 0.1), 40), (6.0, (-2.6, 1.6, 1.1), (-8.7, 1.6, 0.0), 40)]),
    ("s02_cabin", 6.0, 9.5, {"type": "whip", "frames": 10, "direction": "right"}, C, [(6.0, (2.3, 1.3, 2.8), (0.35, 0.98, -0.55), 42), (9.5, (1.5, 1.22, 1.75), (0.45, 1.08, -0.6), 42)]),
    ("s03_pier", 9.5, 13.0, {"type": "whip", "frames": 10, "direction": "left"}, P, [(9.5, (2.0, 2.35, 4.0), (0.0, 1.35, -1.6), 42), (13.0, (1.1, 2.15, 1.4), (-0.05, 1.25, -1.8), 42)]),
    ("s04_restaurant", 13.0, 18.5, {"type": "whip", "frames": 10, "direction": "right"}, R, [(13.0, (0.35, 1.8, 1.2), (0.0, 0.6, -14), 58), (18.5, (0.0, 1.75, -6.2), (0.1, 0.7, -21), 58)]),
    ("s05_flood", 18.5, 24.5, {"type": "whip", "frames": 10, "direction": "left"}, A, [(18.5, (0.9, 1.45, 2.3), (-0.6, 1.15, -0.5), 44), (24.5, (0.5, 1.55, 1.5), (-0.6, 1.65, -0.6), 44)]),
    ("s06_crowd", 24.5, 27.5, {"type": "cut"}, S, [(24.5, (8.0, 34.0, 58.0), (-4.0, 0.0, 14.0), 50), (27.5, (6.0, 32.0, 50.0), (-4.0, 0.0, 10.0), 50)]),
    ("s07_window", 27.5, 33.5, {"type": "cut"}, A, [(27.5, (0.85, 1.7, 0.5), (-0.45, 0.3, -6.0), 50), (33.5, (0.65, 1.68, -0.2), (-0.4, 0.1, -6.5), 50)]),
    ("s08_friends", 33.5, 39.0, {"type": "whip", "frames": 10, "direction": "left"}, R, [(33.5, (-0.45, 1.6, -23.35), (0.3, 1.5, -19.0), 70), (39.0, (-0.6, 1.58, -23.1), (0.3, 1.5, -18.5), 70)]),
    ("s09_alone", 39.0, 44.5, {"type": "dip", "frames": 6}, A, [(39.0, (-0.4, 0.72, 1.3), (2.3, 1.05, 0.15), 48), (44.5, (0.05, 0.72, 0.95), (2.3, 1.05, 0.15), 48)]),
    ("s10_off", 44.5, 49.0, {"type": "cut"}, A, [(44.5, (0.8, 0.7, 0.5), (2.3, 1.05, 0.12), 42), (49.0, (0.35, 0.78, 0.8), (2.3, 1.12, 0.12), 42)]),
    ("s11_lightsout", 49.0, 53.5, {"type": "whip", "frames": 10, "direction": "right"}, S, [(49.0, (1.2, 1.85, 32.0), (-6.5, 2.6, 0.0), 46), (53.5, (0.9, 1.85, 29.6), (-6.6, 2.2, 0.0), 46)]),
    ("s12_walk", 53.5, 56.2, {"type": "whip", "frames": 10, "direction": "left"}, S, [(53.5, (-4.2, 1.6, 4.2), (-5.3, 1.35, 1.0), 42), (56.2, (-4.2, 1.6, 7.7), (-5.3, 1.35, 4.5), 42)]),
    ("s13_away", 56.2, 61.0, {"type": "cut"}, S, [(56.2, (-4.3, 1.65, 1.6), (-5.0, 1.45, 18.0), 46), (61.0, (-4.3, 1.65, 6.2), (-5.0, 1.5, 24.0), 46)]),
]

tl_shots = []
for sid, a, b, tr, sx, keys in shots:
    s = {"id": sid, "from": a, "to": b, "camera": {"keys": [key(t, p, l, fv, sx) for t, p, l, fv in keys]}}
    if tr:
        s["transition_in"] = tr
    if sid == "s05_flood":
        s["shake"] = [{"t": 22.6, "dur": 0.8, "amp": 0.03, "freq": 7}]
    if sid == "s11_lightsout":
        s["shake"] = [{"t": 49.4, "dur": 1.0, "amp": 0.025, "freq": 5}]
    tl_shots.append(s)

lines = [
    ("l01", 4.0, 5.95), ("l02", 6.25, 9.2), ("l03", 9.8, 12.75), ("l04", 13.3, 15.9), ("l05", 16.1, 18.4),
    ("l06", 18.8, 21.1), ("l07", 21.35, 24.3), ("l08", 24.7, 27.3), ("l09", 27.8, 31.1), ("l10", 31.35, 33.3),
    ("l11", 33.8, 36.1), ("l12", 36.3, 38.9), ("l13", 39.3, 41.9), ("l14", 42.1, 44.4), ("l15", 45.6, 48.6),
    ("l16", 49.3, 52.6), ("l17", 53.8, 56.0), ("l18", 56.5, 60.8),
]

hud = [
    {"id": "boyfriends", "from": 0, "value": {"keys": [[0, 1], [9.5, 2900000000]], "ease": "in"}, "decimals": 0},
    {"id": "nextnight", "from": 13.0, "value": {"keys": [[13.0, 0], [17.6, 7939767]], "ease": "out"}, "decimals": 0},
    {"id": "messages", "from": 18.5, "value": {"keys": [[18.5, 0], [23.0, 33565]], "ease": "out"}, "decimals": 0},
    {"id": "goodnight", "from": 27.5, "value": {"keys": [[27.5, 0], [33.0, 92]], "ease": "linear"}, "decimals": 0},
    {"id": "boyfriends_end", "from": 45.0, "value": {"keys": [[45.6, 2900000000], [48.8, 0]], "ease": "inOut"}, "decimals": 0},
]

events = [
    {"t": 3.966667, "id": "door_opens"},
    {"t": 6.5, "id": "phones_light_up", "trigger": True},
    {"t": 10.0, "id": "pier_phone"},
    {"t": 18.8, "id": "notification_flood"},
    {"t": 22.6, "id": "tower_collapses"},
    {"t": 24.5, "id": "crowd_reveal"},
    {"t": 31.3, "id": "curtains_close"},
    {"t": 35.0, "id": "double_ping"},
    {"t": 45.0, "id": "phone_off"},
    {"t": 49.4, "id": "lights_out_wave"},
    {"t": 56.2, "id": "pointe"},
]

# Ton -------------------------------------------------------------------------------------------
SFX = "render/sfx/"
beds = [
    {"src": SFX + "pad_tension.wav", "start": 0.0, "end": 45.0, "gain_db": -9,
     "automation": [[0, -4], [6, -3], [13, -1], [24.5, 1], [33.5, 2], [38.6, 2], [39.4, -7], [44.6, -5], [44.95, -5], [45.0, -40]]},
    {"src": SFX + "pad_high.wav", "start": 13.0, "end": 39.0, "gain_db": -16,
     "automation": [[13, -12], [18.5, -6], [24.5, 0], [33.5, 1], [38.4, 1], [39.0, -20]]},
    {"src": SFX + "pad_resolve.wav", "start": 45.8, "end": 61.0, "gain_db": -9,
     "automation": [[45.8, -14], [49.0, -6], [53.5, -3], [56.2, 1], [61, 0]]},
    {"src": SFX + "amb_street.wav", "start": 0.0, "end": 6.0, "gain_db": -12},
    {"src": SFX + "amb_cabin.wav", "start": 6.0, "end": 9.5, "gain_db": -13},
    {"src": SFX + "amb_pier.wav", "start": 9.5, "end": 13.0, "gain_db": -12},
    {"src": SFX + "amb_rest.wav", "start": 13.0, "end": 18.5, "gain_db": -12},
    {"src": SFX + "amb_room.wav", "start": 18.5, "end": 24.5, "gain_db": -15},
    {"src": SFX + "crowd_roar.wav", "start": 24.5, "end": 27.5, "gain_db": -9},
    {"src": SFX + "amb_room.wav", "start": 27.5, "end": 33.5, "gain_db": -13,
     "automation": [[27.5, 0], [31.3, 0], [32.4, -6], [33.5, -6]]},
    {"src": SFX + "amb_rest.wav", "start": 33.5, "end": 39.0, "gain_db": -13},
    {"src": SFX + "amb_quiet.wav", "start": 39.0, "end": 49.0, "gain_db": -20,
     "automation": [[39, 0], [44.9, 0], [45.0, -8], [49.0, -8]]},
    {"src": SFX + "crowd_street.wav", "start": 49.0, "end": 53.5, "gain_db": -11,
     "automation": [[49.0, 0], [49.4, 0], [51.8, -14], [53.5, -18]]},
    {"src": SFX + "amb_street.wav", "start": 53.5, "end": 61.0, "gain_db": -16},
]

sfx = []
for s in tl_shots:
    if s.get("transition_in", {}).get("type") == "whip":
        sfx.append({"src": SFX + "swish.wav", "t": f(s["from"] - 10 / FPS), "gain_db": -7})
sfx += [
    {"src": SFX + "door.wav", "t": 3.966667, "gain_db": -6},
    {"src": SFX + "ping.wav", "t": 6.5, "gain_db": -5},
    {"src": SFX + "ping.wav", "t": 10.0, "gain_db": -6},
    {"src": SFX + "flood.wav", "t": 18.8, "gain_db": -6},
    {"src": SFX + "clatter.wav", "t": 22.6, "gain_db": -7},
    {"src": SFX + "swell.wav", "t": 24.5, "gain_db": -8},
    {"src": SFX + "curtain.wav", "t": 31.3, "gain_db": -8},
    {"src": SFX + "ping.wav", "t": 35.0, "gain_db": -5},
    {"src": SFX + "buzz.wav", "t": 39.6, "gain_db": -9},
    {"src": SFX + "buzz.wav", "t": 41.2, "gain_db": -9},
    {"src": SFX + "buzz.wav", "t": 42.6, "gain_db": -8},
    {"src": SFX + "buzz.wav", "t": 43.7, "gain_db": -7},
    {"src": SFX + "buzz.wav", "t": 44.6, "gain_db": -6},
    {"src": SFX + "poweroff.wav", "t": 45.0, "gain_db": -6},
    {"src": SFX + "whomp.wav", "t": 49.4, "gain_db": -10},
    {"src": SFX + "bloom.wav", "t": 56.2, "gain_db": -6},
]
# Schritte von Nora (s12/s13): Fersenaufsatz bei Phase π/2 + kπ, Schrittdauer 16 Frames ab 53,5 s
k = 0
while True:
    fr = 1605 + 8 + 16 * k
    if fr >= 1830 - 3:
        break
    sfx.append({"src": SFX + "step.wav", "t": round(fr / FPS, 6), "gain_db": -12})
    k += 1

tl = {
    "_comment": "What if every man had the same girlfriend? – Zeitachse. Sets liegen im Raum bei x = 0 (Straße), 400 (Hütte), 800 (Steg), 1200 (Restaurant), 1600 (Wohnung). Ton: render/sfx/* aus sound.py.",
    "fps": 30,
    "duration": 61,
    "seed": 20261028,
    "pointe": 56.2,
    "title": {"in": 0, "out": 3.5},
    "shots": tl_shots,
    "hud": hud,
    "lines": [{"id": i, "in": a, "out": b} for i, a, b in lines],
    "events": events,
    "audio": {"fade_out": 1.5, "beds": beds, "sfx": sfx},
}
json.dump(tl, open(OUT, "w"), indent=1)
print("ok", len(sfx), "sfx")
