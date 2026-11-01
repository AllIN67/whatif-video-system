# Technischer Bericht: `final.mp4`

Modus: **render** — Status: **REVIEW**

## Container und Streams

- Dauer: 62.400 s, Größe 29.7 MB, 3811 kbit/s
- Video: h264 1080×1920 (yuv420p), r=30.000 fps, avg=30.000 fps, 1872 Frames
- Audio: aac 48000 Hz, 2 Kanäle, 62.400 s

## Bild

- Bildinhalt/Balken: vollflächig
- Harte Schnitte: 16 (≈ 2.56 pro 10 s), erster bei 0.4 s
- Bewegungsübergänge (Whip/Fast-Move): 6 [(4.033, 4.1), (11.5, 11.567), (20.5, 20.667), (27.033, 27.2), (31.3, 31.467), (52.8, 52.9)]
- Einstellungswechsel gesamt: 22 (≈ 3.53 pro 10 s), erster bei 0.4 s
- Einstellungslänge: Median 3.0 s, Mittel 2.71 s, min 0.4 s, max 7.23 s
- Unregelmäßige Zeitstempel: 0
- Schwarzbilder: keine
- Standbild-Phasen ≥ 0.5 s: [(47.6, 48.1)]
- Isolierte Doppelbilder in Bewegung: 0 []
- Doppelbild-Anteil in Bewegungsphasen: 0.1%
- Sehr kurze Einstellungen (< 4 Frames): keine
- Sprungkandidaten ohne Schnitt: [0.633, 0.667, 0.7, 0.733, 11.2, 11.233, 24.767, 24.8, 30.2, 33.0, 35.3, 44.9, 44.933, 44.967, 45.0, 45.033, 45.067, 45.1, 49.633, 49.667, 49.7, 49.733, 49.767, 49.8, 49.833, 49.867, 49.9, 57.4, 57.433]
- Flacker-Kandidaten: keine
- Abgleich mit Zeitplan: 18 geplante Übergänge, davon im Bild erkennbar: 18; Kandidaten an geplanten Übergängen (erwartet): Sprung [35.0, 52.7], Flackern [3.933, 3.967, 20.5, 20.533, 20.567, 31.333, 31.367, 31.4, 52.7, 52.733, 52.767]
- Monotonie-Kandidaten (3 s mittlere Bilddifferenz < 0.5): keine
- Mittlere Helligkeit (Y 0–255): 102.7, mittlere Bilddifferenz: 2.93

## Ton

- Integrierte Lautheit: -14.1 LUFS, LRA 8.2 LU, True Peak -1.0 dBTP
- Sample-Peak -1.141516 dBFS, RMS -14.321527 dBFS, Flat factor 0.0
- Stille (< −45 dB, ≥ 0,4 s): keine
- Lautheitssprünge: keine
- Klick-Kandidaten (HF-Transienten, oft auch gewollte SFX): [0.25, 0.76, 4.58, 10.42, 10.8, 11.44, 13.98, 17.03, 17.42, 24.15, 25.17, 25.68, 26.19, 26.7, 34.32, 35.08, 38.9, 40.17, 46.02, 46.33, 52.37, 52.76]
- An geplanten Ton-Ereignissen (beim Anhören bestätigen): Transienten [20.91, 24.66, 49.5, 50.34, 57.4], Lautheitssprünge [0.7, 10.2, 11.4, 48.9, 57.5]
- Synchronität Ereignis-Klänge (steilster Anstieg im Bereich −15…+60 ms): 51/72 erkannt (übrige verdeckt), Versatz (ms) [0, -5, None, 5, None, None, -5, None, None, None, 0, None, None, 5, None, 10, 5, 40, None, 10, 45, None, 0, 0, 20, None, 0, None, 30, 0, 0, 30, 0, 0, 5, 5, None, 60, None, 0, 5, None, 10, None, -5, None, 20, 50, 50, 50, 55, 0, 0, 50, None, None, 55, -5, 15, -10, 10, 10, 15, None, 20, 0, 0, 0, 55, 0, 0, 0]
- Erste 50 ms: -56.990969 dB RMS; letzte 50 ms: -61.513074 dB RMS; letzte Sekunde: -34.583419 dB RMS
- Lautheitsverlauf (Short-Term-LUFS, alle 2 s): 1s:– 3s:-10 5s:-10 7s:-22 9s:-21 11s:-16 13s:-15 15s:-19 17s:-17 19s:-14 21s:-14 23s:-16 25s:-17 27s:-14 29s:-17 31s:-16 33s:-16 35s:-17 37s:-14 39s:-12 41s:-17 43s:-14 45s:-13 47s:-14 49s:-18 51s:-13 53s:-12 55s:-15 57s:-20 59s:-13 61s:-23

## Bewertung

**Status: REVIEW**

- ⚠️ Sprungkandidaten ohne Schnitt: [0.633, 0.667, 0.7, 0.733, 11.2, 11.233, 24.767, 24.8, 30.2, 33.0, 35.3, 44.9, 44.933, 44.967, 45.0, 45.033, 45.067, 45.1, 49.633, 49.667, 49.7, 49.733, 49.767, 49.8, 49.833, 49.867, 49.9, 57.4, 57.433]
- ⚠️ Standbild-Phasen ≥ 0.5 s (nur ok, wenn beabsichtigt): [(47.6, 48.1)]
- ⚠️ Klick-Kandidaten (anhören!): [0.25, 0.76, 4.58, 10.42, 10.8, 11.44, 13.98, 17.03, 17.42, 24.15, 25.17, 25.68, 26.19, 26.7, 34.32, 35.08, 38.9, 40.17, 46.02, 46.33, 52.37, 52.76]
- ⚠️ Ereignis-Klänge > ±34 ms versetzt (anhören!): [(6.466667, 'paper', 40), (8.6, 'paper', 45), (22.1, 'pop', 60), (32.566667, 'paper', 50), (33, 'paper', 50), (35.3, 'paper', 50), (36.333333, 'paper', 55), (39.1, 'pop', 50), (42.1, 'paper', 55), (53.4, 'pop', 55)]
- ⚠️ Ereignis-Klänge verdeckt – Anstieg < 3 dB, nur per Hörprüfung beurteilbar: [(2.466667, 'tick'), (2.7, 'tick'), (2.8, 'tick'), (3.033333, 'tick'), (3.133333, 'tick'), (3.233333, 'tick'), (3.466667, 'tick'), (3.566667, 'tick'), (3.8, 'tick'), (7.2, 'paper'), (9.3, 'paper'), (13.1, 'paper'), (14.4, 'paper'), (22.033333, 'paper'), (23.2, 'paper'), (27.6, 'paper'), (29.333333, 'paper'), (31.7, 'paper'), (39.2, 'paper'), (41, 'paper'), (47.433333, 'paper')]

Automatische Prüfung ersetzt nicht die Sichtprüfung (Kontaktbögen, shots.jpg) und das vollständige Anhören. Siehe VIDEO_PRODUCTION_CHECKLIST.md.

**Status bezieht sich nur auf die technische Prüfung.** Visuelle und dramaturgische Freigabe: `templates/quality_review.md` ausfüllen (Monotonie, Figuren, Kamera, HUD, Einstieg, Eskalation, Ende).

## Einstellungen

| # | Start (s) | Dauer (s) | Frames |
|---|---|---|---|
| 1 | 0.0 | 0.4 | 12 |
| 2 | 0.4 | 3.267 | 98 |
| 3 | 3.667 | 0.4 | 12 |
| 4 | 4.067 | 3.533 | 106 |
| 5 | 7.6 | 3.2 | 96 |
| 6 | 10.8 | 0.733 | 22 |
| 7 | 11.533 | 2.267 | 68 |
| 8 | 13.8 | 3.6 | 108 |
| 9 | 17.4 | 1.0 | 30 |
| 10 | 18.4 | 2.167 | 65 |
| 11 | 20.567 | 3.633 | 109 |
| 12 | 24.2 | 2.9 | 87 |
| 13 | 27.1 | 4.267 | 128 |
| 14 | 31.367 | 7.233 | 217 |
| 15 | 38.6 | 3.2 | 96 |
| 16 | 41.8 | 3.0 | 90 |
| 17 | 44.8 | 1.6 | 48 |
| 18 | 46.4 | 2.6 | 78 |
| 19 | 49.0 | 0.5 | 15 |
| 20 | 49.5 | 3.333 | 100 |
| 21 | 52.833 | 4.167 | 125 |
| 22 | 57.0 | 3.0 | 90 |
| 23 | 60.0 | 2.4 | 72 |
