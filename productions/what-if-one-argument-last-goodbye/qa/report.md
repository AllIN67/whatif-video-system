# Technischer Bericht: `final.mp4`

Modus: **render** — Status: **FAIL**

## Container und Streams

- Dauer: 71.000 s, Größe 39.7 MB, 4469 kbit/s
- Video: h264 1080×1920 (yuv420p), r=30.000 fps, avg=30.000 fps, 2130 Frames
- Audio: aac 48000 Hz, 2 Kanäle, 71.000 s

## Bild

- Bildinhalt/Balken: vollflächig
- Harte Schnitte: 14 (≈ 1.97 pro 10 s), erster bei 4.4 s
- Bewegungsübergänge (Whip/Fast-Move): 4 [(24.6, 24.7), (28.067, 28.233), (34.467, 34.733), (62.3, 62.367)]
- Einstellungswechsel gesamt: 18 (≈ 2.54 pro 10 s), erster bei 4.4 s
- Einstellungslänge: Median 3.6 s, Mittel 3.74 s, min 0.07 s, max 8.6 s
- Unregelmäßige Zeitstempel: 0
- Schwarzbilder: [(62.4, 62.8), (65.9667, 66.2667)]
- Standbild-Phasen ≥ 0.5 s: [(66.53, 70.97)]
- Isolierte Doppelbilder in Bewegung: 0 []
- Doppelbild-Anteil in Bewegungsphasen: 0.2%
- Sehr kurze Einstellungen (< 4 Frames): [38.6, 62.333]
- Sprungkandidaten ohne Schnitt: [23.8, 24.5, 32.0, 33.2, 48.1, 48.3, 52.1]
- Flacker-Kandidaten: [24.5]
- Abgleich mit Zeitplan: 19 geplante Übergänge, davon im Bild erkennbar: 18; Kandidaten an geplanten Übergängen (erwartet): Sprung [48.133, 48.167, 48.2, 48.233, 48.267], Flackern [24.533, 24.567, 48.133, 48.167]
- Monotonie-Kandidaten (3 s mittlere Bilddifferenz < 0.5): [[62.5, 70.5]]
- Mittlere Helligkeit (Y 0–255): 78.6, mittlere Bilddifferenz: 2.86

## Ton

- Integrierte Lautheit: -14.2 LUFS, LRA 20.2 LU, True Peak -1.2 dBTP
- Sample-Peak -1.370329 dBFS, RMS -17.932285 dBFS, Flat factor 0.0
- Stille (< −45 dB, ≥ 0,4 s): [{'start': 65.76, 'end': 66.2}]
- Lautheitssprünge: keine
- Klick-Kandidaten (HF-Transienten, oft auch gewollte SFX): [7.86, 11.6, 12.5, 12.85, 13.57, 13.92, 14.28, 14.64, 15.0, 15.35, 15.71, 16.07, 16.42, 16.78, 17.14, 17.5, 17.85, 18.21, 18.57, 19.28, 19.64, 20.0, 20.35, 20.71, 21.07, 21.42, 23.21, 23.57, 23.88, 24.28]
- An geplanten Ton-Ereignissen (beim Anhören bestätigen): Transienten [9.5, 11.9, 13.21, 18.9, 21.8, 22.86, 27.15, 33.21, 49.94, 52.08, 53.92], Lautheitssprünge [9.8, 13.3, 19.0, 22.0, 23.9, 26.6, 35.3, 38.7, 44.3, 47.3, 56.1, 59.5, 63.0, 66.4]
- Synchronität Ereignis-Klänge (steilster Anstieg im Bereich −15…+60 ms): 42/50 erkannt (übrige verdeckt), Versatz (ms) [-5, 20, -10, 5, -15, 5, 0, 0, 5, 0, 0, -15, 0, 0, -15, 0, -15, 0, 0, 5, 10, 30, 30, -5, 5, -10, 50, 0, 0, None, -5, None, 0, None, 5, 5, 0, 0, -10, None, None, None, None, None, 5, 20, -15, 0, 40, -15]
- Erste 50 ms: -71.886838 dB RMS; letzte 50 ms: -73.417742 dB RMS; letzte Sekunde: -45.582756 dB RMS
- Lautheitsverlauf (Short-Term-LUFS, alle 2 s): 1s:– 3s:-27 5s:-30 7s:-28 9s:-31 11s:-27 13s:-28 15s:-23 17s:-25 19s:-22 21s:-19 23s:-24 25s:-18 27s:-22 29s:-11 31s:-8 33s:-9 35s:-14 37s:-14 39s:-14 41s:-16 43s:-24 45s:-22 47s:-22 49s:-17 51s:-18 53s:-30 55s:-31 57s:-26 59s:-26 61s:-24 63s:-26 65s:-28 67s:-22 69s:-21 71s:-32

## Bewertung

**Status: FAIL**

- ❌ Schwarzbilder: [(62.4, 62.8), (65.9667, 66.2667)]
- ❌ Einstellungen < 4 Frames (Blitzbild/Sprung): [38.6, 62.333]
- ⚠️ Sprungkandidaten ohne Schnitt: [23.8, 24.5, 32.0, 33.2, 48.1, 48.3, 52.1]
- ⚠️ Flacker-Kandidaten: [24.5]
- ⚠️ Geplante Übergänge im Bild nicht erkennbar (prüfen): [66.0]
- ⚠️ Standbild-Phasen ≥ 0.5 s (nur ok, wenn beabsichtigt): [(66.53, 70.97)]
- ⚠️ Lautheitsumfang (LRA) 20.2 LU außerhalb 6–16 LU (Style-Guide 9.4)
- ⚠️ Klick-Kandidaten (anhören!): [7.86, 11.6, 12.5, 12.85, 13.57, 13.92, 14.28, 14.64, 15.0, 15.35, 15.71, 16.07, 16.42, 16.78, 17.14, 17.5, 17.85, 18.21, 18.57, 19.28, 19.64, 20.0, 20.35, 20.71, 21.07, 21.42, 23.21, 23.57, 23.88, 24.28]
- ⚠️ Ereignis-Klänge > ±34 ms versetzt (anhören!): [(36.3, 'screech', 50), (59.2, 'warmth', 40)]
- ⚠️ Ereignis-Klänge verdeckt – Anstieg < 3 dB, nur per Hörprüfung beurteilbar: [(39.1, 'thud'), (41.1, 'blinker'), (44.4, 'heartbeat'), (48.4, 'pop'), (48.8, 'pop'), (49.2, 'pop'), (49.6, 'pop'), (49.9, 'paper')]
- ⚠️ Monotonie-Kandidaten (3 s kaum Bewegung, Sichtprüfung): [[62.5, 70.5]]

Automatische Prüfung ersetzt nicht die Sichtprüfung (Kontaktbögen, shots.jpg) und das vollständige Anhören. Siehe VIDEO_PRODUCTION_CHECKLIST.md.

**Status bezieht sich nur auf die technische Prüfung.** Visuelle und dramaturgische Freigabe: `templates/quality_review.md` ausfüllen (Monotonie, Figuren, Kamera, HUD, Einstieg, Eskalation, Ende).

## Einstellungen

| # | Start (s) | Dauer (s) | Frames |
|---|---|---|---|
| 1 | 0.0 | 4.4 | 132 |
| 2 | 4.4 | 3.4 | 102 |
| 3 | 7.8 | 3.8 | 114 |
| 4 | 11.6 | 3.6 | 108 |
| 5 | 15.2 | 2.6 | 78 |
| 6 | 17.8 | 3.0 | 90 |
| 7 | 20.8 | 3.833 | 115 |
| 8 | 24.633 | 3.5 | 105 |
| 9 | 28.133 | 3.467 | 104 |
| 10 | 31.6 | 3.0 | 90 |
| 11 | 34.6 | 4.0 | 120 |
| 12 | 38.6 | 0.1 | 3 |
| 13 | 38.7 | 5.1 | 153 |
| 14 | 43.8 | 8.2 | 246 |
| 15 | 52.0 | 3.0 | 90 |
| 16 | 55.0 | 3.6 | 108 |
| 17 | 58.6 | 3.733 | 112 |
| 18 | 62.333 | 0.067 | 2 |
| 19 | 62.4 | 8.6 | 258 |
