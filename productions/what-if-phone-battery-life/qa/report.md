# Technischer Bericht: `final.mp4`

Modus: **render** — Status: **FAIL**

## Container und Streams

- Dauer: 61.400 s, Größe 31.0 MB, 4040 kbit/s
- Video: h264 1080×1920 (yuv420p), r=30.000 fps, avg=30.000 fps, 1842 Frames
- Audio: aac 48000 Hz, 2 Kanäle, 61.400 s

## Bild

- Bildinhalt/Balken: vollflächig
- Harte Schnitte: 12 (≈ 1.95 pro 10 s), erster bei 8.2 s
- Bewegungsübergänge (Whip/Fast-Move): 6 [(4.1, 4.3), (8.067, 8.167), (20.467, 20.567), (27.1, 27.3), (38.067, 38.333), (39.2, 39.3)]
- Einstellungswechsel gesamt: 17 (≈ 2.77 pro 10 s), erster bei 4.2 s
- Einstellungslänge: Median 3.2 s, Mittel 3.41 s, min 0.03 s, max 17.77 s
- Unregelmäßige Zeitstempel: 0
- Schwarzbilder: [(44.9, 46.2)]
- Standbild-Phasen ≥ 0.5 s: keine
- Isolierte Doppelbilder in Bewegung: 0 []
- Doppelbild-Anteil in Bewegungsphasen: 0.0%
- Sehr kurze Einstellungen (< 4 Frames): [8.1, 20.5, 20.6]
- Sprungkandidaten ohne Schnitt: [14.3, 14.5, 20.7, 20.733, 33.4, 53.1, 57.867, 57.9, 57.933, 57.967]
- Flacker-Kandidaten: keine
- Abgleich mit Zeitplan: 16 geplante Übergänge, davon im Bild erkennbar: 16; Kandidaten an geplanten Übergängen (erwartet): Sprung [14.367, 14.4, 14.433, 14.467, 42.2, 46.2, 49.8, 53.0, 53.067], Flackern [4.133, 4.167, 4.2, 14.333, 14.367, 27.133, 27.167, 27.2]
- Monotonie-Kandidaten (3 s mittlere Bilddifferenz < 0.5): [[0.0, 4.0], [46.5, 49.5], [58.0, 61.0]]
- Mittlere Helligkeit (Y 0–255): 91.5, mittlere Bilddifferenz: 2.4

## Ton

- Integrierte Lautheit: -14.2 LUFS, LRA 10.9 LU, True Peak -1.1 dBTP
- Sample-Peak -1.121959 dBFS, RMS -15.206573 dBFS, Flat factor 0.0
- Stille (< −45 dB, ≥ 0,4 s): keine
- Lautheitssprünge: keine
- Klick-Kandidaten (HF-Transienten, oft auch gewollte SFX): [0.67, 1.07, 1.87, 2.27, 2.67, 2.97, 3.34, 3.75, 4.15, 4.55, 5.35, 5.75, 6.16, 6.56, 6.95, 7.36, 8.84, 9.37, 9.92, 10.98, 11.51, 12.59, 13.12, 13.66, 14.2, 16.33, 16.74, 17.14, 17.54, 17.94]
- An geplanten Ton-Ereignissen (beim Anhören bestätigen): Transienten [0.26, 1.47, 4.95, 7.76, 21.6, 25.44, 26.78], Lautheitssprünge [36.5, 54.6, 57.9]
- Synchronität Ereignis-Klänge (Anstieg im Bereich −50…+80 ms): 36/37 erkannt, Versatz (ms) [10, -30, -45, -25, 5, 0, -50, 5, -45, -30, -20, -5, -25, 0, 0, 5, 0, -40, -20, -40, -15, 0, -40, 5, 0, 0, 0, 60, -10, 5, -35, 5, 0, None, 0, 0, 0]
- Erste 50 ms: -61.190534 dB RMS; letzte 50 ms: -50.626097 dB RMS; letzte Sekunde: -29.20303 dB RMS
- Lautheitsverlauf (Short-Term-LUFS, alle 2 s): 1s:– 3s:-16 5s:-23 7s:-21 9s:-19 11s:-14 13s:-13 15s:-14 17s:-14 19s:-16 21s:-16 23s:-12 25s:-18 27s:-14 29s:-22 31s:-24 33s:-15 35s:-14 37s:-13 39s:-12 41s:-14 43s:-18 45s:-10 47s:-17 49s:-15 51s:-16 53s:-16 55s:-15 57s:-15 59s:-10 61s:-11

## Bewertung

**Status: FAIL**

- ❌ Schwarzbilder: [(44.9, 46.2)]
- ❌ Einstellungen < 4 Frames (Blitzbild/Sprung): [8.1, 20.5, 20.6]
- ⚠️ Sprungkandidaten ohne Schnitt: [14.3, 14.5, 20.7, 20.733, 33.4, 53.1, 57.867, 57.9, 57.933, 57.967]
- ⚠️ Klick-Kandidaten (anhören!): [0.67, 1.07, 1.87, 2.27, 2.67, 2.97, 3.34, 3.75, 4.15, 4.55, 5.35, 5.75, 6.16, 6.56, 6.95, 7.36, 8.84, 9.37, 9.92, 10.98, 11.51, 12.59, 13.12, 13.66, 14.2, 16.33, 16.74, 17.14, 17.54, 17.94]
- ⚠️ Ereignis-Klänge nicht erkennbar oder > ±34 ms versetzt (anhören!): [(2.4, 'pop', -45), (6.1, 'thud', -50), (7.1, 'pop', -45), (24.9, 'buzz', -40), (26.166667, 'pop', -40), (32.3, 'charge', -40), (43.2, 'pop', 60), (47.3, 'thud', -35), (55, 'pop', None)]
- ⚠️ Monotonie-Kandidaten (3 s kaum Bewegung, Sichtprüfung): [[0.0, 4.0], [46.5, 49.5], [58.0, 61.0]]

Automatische Prüfung ersetzt nicht die Sichtprüfung (Kontaktbögen, shots.jpg) und das vollständige Anhören. Siehe VIDEO_PRODUCTION_CHECKLIST.md.

**Status bezieht sich nur auf die technische Prüfung.** Visuelle und dramaturgische Freigabe: `templates/quality_review.md` ausfüllen (Monotonie, Figuren, Kamera, HUD, Einstieg, Eskalation, Ende).

## Einstellungen

| # | Start (s) | Dauer (s) | Frames |
|---|---|---|---|
| 1 | 0.0 | 4.2 | 126 |
| 2 | 4.2 | 3.9 | 117 |
| 3 | 8.1 | 0.1 | 3 |
| 4 | 8.2 | 4.0 | 120 |
| 5 | 12.2 | 6.2 | 186 |
| 6 | 18.4 | 2.1 | 63 |
| 7 | 20.5 | 0.1 | 3 |
| 8 | 20.6 | 0.033 | 1 |
| 9 | 20.633 | 3.967 | 119 |
| 10 | 24.6 | 2.6 | 78 |
| 11 | 27.2 | 4.2 | 126 |
| 12 | 31.4 | 4.0 | 120 |
| 13 | 35.4 | 2.8 | 84 |
| 14 | 38.2 | 0.8 | 24 |
| 15 | 39.0 | 0.233 | 7 |
| 16 | 39.233 | 17.767 | 533 |
| 17 | 57.0 | 0.8 | 24 |
| 18 | 57.8 | 3.6 | 108 |
