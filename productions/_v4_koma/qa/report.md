# Technischer Bericht: `final.mp4`

Modus: **render** — Status: **FAIL**

## Container und Streams

- Dauer: 61.200 s, Größe 47.4 MB, 6197 kbit/s
- Video: h264 1080×1920 (yuv420p), r=30.000 fps, avg=30.000 fps, 1836 Frames
- Audio: aac 48000 Hz, 2 Kanäle, 61.200 s

## Bild

- Bildinhalt/Balken: vollflächig
- Harte Schnitte: 12 (≈ 1.96 pro 10 s), erster bei 0.933 s
- Bewegungsübergänge (Whip/Fast-Move): 13 [(1.633, 1.7), (5.033, 5.1), (12.3, 12.5), (15.9, 16.1), (20.5, 20.7), (24.233, 24.3), (28.1, 28.167), (32.5, 32.7), (41.233, 41.3), (42.067, 42.233), (52.5, 52.6), (55.2, 55.4), (56.1, 56.3)]
- Einstellungswechsel gesamt: 24 (≈ 3.92 pro 10 s), erster bei 0.933 s
- Einstellungslänge: Median 3.0 s, Mittel 2.45 s, min 0.07 s, max 5.0 s
- Unregelmäßige Zeitstempel: 0
- Schwarzbilder: keine
- Standbild-Phasen ≥ 0.5 s: keine
- Isolierte Doppelbilder in Bewegung: 0 []
- Doppelbild-Anteil in Bewegungsphasen: 0.1%
- Sehr kurze Einstellungen (< 4 Frames): [5.0, 24.2, 28.133]
- Sprungkandidaten ohne Schnitt: [41.867, 41.9, 46.6, 46.633, 46.667, 46.7, 46.733, 48.5, 50.833, 50.867]
- Flacker-Kandidaten: [41.933]
- Abgleich mit Zeitplan: 15 geplante Übergänge, davon im Bild erkennbar: 15; Kandidaten an geplanten Übergängen (erwartet): Sprung [], Flackern [4.933, 4.967, 12.333, 12.367, 12.4, 15.933, 15.967, 20.433, 20.533, 20.567, 20.6, 24.133, 24.167, 28.133, 28.167, 32.5, 32.533, 32.567, 52.533, 52.567, 52.6, 56.1, 56.133, 56.167]
- Monotonie-Kandidaten (3 s mittlere Bilddifferenz < 0.5): keine
- Mittlere Helligkeit (Y 0–255): 145.6, mittlere Bilddifferenz: 4.02

## Ton

- Integrierte Lautheit: -14.2 LUFS, LRA 3.4 LU, True Peak -1.0 dBTP
- Sample-Peak -1.297991 dBFS, RMS -15.143987 dBFS, Flat factor 0.0
- Stille (< −45 dB, ≥ 0,4 s): keine
- Lautheitssprünge: keine
- Klick-Kandidaten (HF-Transienten, oft auch gewollte SFX): [5.92, 6.75, 8.42, 11.75, 16.07, 16.42, 16.78, 17.14, 17.5, 20.35, 20.71, 21.07, 21.42, 21.78, 22.5, 22.85, 23.57, 23.92, 24.28, 26.43, 26.78, 27.14, 27.5, 27.85, 33.52, 40.71, 41.07, 41.42, 41.78, 45.35]
- An geplanten Ton-Ereignissen (beim Anhören bestätigen): Transienten [5.3, 6.44, 7.7, 9.1, 10.92, 12.9, 22.14, 23.2, 24.64, 26.07, 33.2, 34.44, 49.95, 53.6], Lautheitssprünge []
- Synchronität Ereignis-Klänge (steilster Anstieg im Bereich −15…+60 ms): 36/36 erkannt (übrige verdeckt), Versatz (ms) [10, 30, -15, 60, -5, -5, -10, 5, 0, 5, -10, 5, -10, 25, 35, 45, 15, 5, 15, 5, -15, 5, 0, 50, 5, 60, 0, 30, -15, -15, 0, 5, 0, -15, -15, 20]
- Erste 50 ms: -55.024668 dB RMS; letzte 50 ms: -47.391767 dB RMS; letzte Sekunde: -22.635175 dB RMS
- Lautheitsverlauf (Short-Term-LUFS, alle 2 s): 1s:– 3s:-12 5s:-15 7s:-16 9s:-15 11s:-16 13s:-17 15s:-16 17s:-16 19s:-14 21s:-13 23s:-14 25s:-14 27s:-14 29s:-14 31s:-15 33s:-16 35s:-14 37s:-15 39s:-16 41s:-15 43s:-16 45s:-13 47s:-14 49s:-14 51s:-14 53s:-14 55s:-12 57s:-14 59s:-12 61s:-16

## Bewertung

**Status: FAIL**

- ❌ Einstellungen < 4 Frames (Blitzbild/Sprung): [5.0, 24.2, 28.133]
- ⚠️ Sprungkandidaten ohne Schnitt: [41.867, 41.9, 46.6, 46.633, 46.667, 46.7, 46.733, 48.5, 50.833, 50.867]
- ⚠️ Flacker-Kandidaten: [41.933]
- ⚠️ Lautheitsumfang (LRA) 3.4 LU außerhalb 6–16 LU (Style-Guide 9.4)
- ⚠️ Klick-Kandidaten (anhören!): [5.92, 6.75, 8.42, 11.75, 16.07, 16.42, 16.78, 17.14, 17.5, 20.35, 20.71, 21.07, 21.42, 21.78, 22.5, 22.85, 23.57, 23.92, 24.28, 26.43, 26.78, 27.14, 27.5, 27.85, 33.52, 40.71, 41.07, 41.42, 41.78, 45.35]
- ⚠️ Ereignis-Klänge > ±34 ms versetzt (anhören!): [(2.3, 'heartbeat', 60), (14.3, 'pop', 35), (15.3, 'warmth', 45), (35.4, 'heartbeat', 50), (38.8, 'heartbeat', 60)]

Automatische Prüfung ersetzt nicht die Sichtprüfung (Kontaktbögen, shots.jpg) und das vollständige Anhören. Siehe VIDEO_PRODUCTION_CHECKLIST.md.

**Status bezieht sich nur auf die technische Prüfung.** Visuelle und dramaturgische Freigabe: `templates/quality_review.md` ausfüllen (Monotonie, Figuren, Kamera, HUD, Einstieg, Eskalation, Ende).

## Einstellungen

| # | Start (s) | Dauer (s) | Frames |
|---|---|---|---|
| 1 | 0.0 | 0.933 | 28 |
| 2 | 0.933 | 0.267 | 8 |
| 3 | 1.2 | 0.467 | 14 |
| 4 | 1.667 | 0.333 | 10 |
| 5 | 2.0 | 3.0 | 90 |
| 6 | 5.0 | 0.067 | 2 |
| 7 | 5.067 | 3.733 | 112 |
| 8 | 8.8 | 3.6 | 108 |
| 9 | 12.4 | 3.6 | 108 |
| 10 | 16.0 | 4.6 | 138 |
| 11 | 20.6 | 3.6 | 108 |
| 12 | 24.2 | 0.067 | 2 |
| 13 | 24.267 | 3.867 | 116 |
| 14 | 28.133 | 0.067 | 2 |
| 15 | 28.2 | 4.4 | 132 |
| 16 | 32.6 | 3.8 | 114 |
| 17 | 36.4 | 4.2 | 126 |
| 18 | 40.6 | 0.667 | 20 |
| 19 | 41.267 | 0.867 | 26 |
| 20 | 42.133 | 2.467 | 74 |
| 21 | 44.6 | 3.4 | 102 |
| 22 | 48.0 | 4.533 | 136 |
| 23 | 52.533 | 2.767 | 83 |
| 24 | 55.3 | 0.9 | 27 |
| 25 | 56.2 | 5.0 | 150 |
