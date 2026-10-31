# Technischer Bericht: `final.mp4`

Modus: **render** — Status: **FAIL**

## Container und Streams

- Dauer: 61.400 s, Größe 36.8 MB, 4798 kbit/s
- Video: h264 1080×1920 (yuv420p), r=30.000 fps, avg=30.000 fps, 1842 Frames
- Audio: aac 48000 Hz, 2 Kanäle, 61.400 s

## Bild

- Bildinhalt/Balken: vollflächig
- Harte Schnitte: 8 (≈ 1.3 pro 10 s), erster bei 4.0 s
- Bewegungsübergänge (Whip/Fast-Move): 9 [(7.9, 8.1), (11.5, 11.7), (15.7, 15.9), (19.7, 19.8), (23.7, 23.8), (34.0, 34.1), (37.9, 38.0), (42.5, 42.567), (46.9, 46.967)]
- Einstellungswechsel gesamt: 17 (≈ 2.77 pro 10 s), erster bei 4.0 s
- Einstellungslänge: Median 4.0 s, Mittel 3.41 s, min 0.03 s, max 5.4 s
- Unregelmäßige Zeitstempel: 0
- Schwarzbilder: keine
- Standbild-Phasen ≥ 0.5 s: keine
- Isolierte Doppelbilder in Bewegung: 0 []
- Doppelbild-Anteil in Bewegungsphasen: 0.0%
- Sehr kurze Einstellungen (< 4 Frames): [42.533, 42.6, 46.933]
- Sprungkandidaten ohne Schnitt: [9.7, 32.667, 32.7, 32.733, 32.767, 32.8, 33.9, 34.567, 35.433, 35.467, 36.567, 42.7, 42.733, 51.733, 51.767, 51.8, 51.833, 51.867, 57.067, 57.1, 57.133]
- Flacker-Kandidaten: [11.5, 15.7, 33.9]
- Abgleich mit Zeitplan: 14 geplante Übergänge, davon im Bild erkennbar: 14; Kandidaten an geplanten Übergängen (erwartet): Sprung [], Flackern [7.933, 7.967, 8.0, 11.533, 11.567, 15.733, 15.767, 19.733, 19.767, 19.8, 23.733, 23.767, 23.8, 33.933, 33.967, 37.933, 37.967, 38.0, 42.567]
- Monotonie-Kandidaten (3 s mittlere Bilddifferenz < 0.5): [[58.0, 61.0]]
- Mittlere Helligkeit (Y 0–255): 105.2, mittlere Bilddifferenz: 2.82

## Ton

- Integrierte Lautheit: -14.1 LUFS, LRA 6.4 LU, True Peak -1.3 dBTP
- Sample-Peak -1.252641 dBFS, RMS -15.219231 dBFS, Flat factor 0.0
- Stille (< −45 dB, ≥ 0,4 s): keine
- Lautheitssprünge: keine
- Klick-Kandidaten (HF-Transienten, oft auch gewollte SFX): [0.28, 0.59, 0.89, 2.02, 2.45, 2.88, 3.18, 3.6, 4.03, 4.34, 4.9, 5.48, 5.91, 6.34, 8.37, 8.8, 9.27, 9.57, 10.24, 10.67, 10.97, 11.39, 12.26, 12.69, 12.99, 13.41, 13.71, 15.0, 15.3, 15.72]
- An geplanten Ton-Ereignissen (beim Anhören bestätigen): Transienten [1.44, 9.9, 11.82, 14.24, 16.15, 18.18, 21.21, 23.94, 24.37, 24.74, 25.07, 25.44, 32.02, 34.92, 39.52, 41.0, 43.55, 57.0], Lautheitssprünge [9.1, 51.9, 57.1]
- Synchronität Ereignis-Klänge (steilster Anstieg im Bereich −15…+60 ms): 49/51 erkannt (übrige verdeckt), Versatz (ms) [0, 10, 5, 10, 0, 5, 5, 0, 55, None, 0, 0, 55, 0, 0, -5, 0, 5, 5, None, -15, -5, 0, 5, 5, 5, 0, 5, 5, 0, 5, 0, 0, 50, 0, 0, -5, 5, -15, 10, 5, 0, 0, 0, 0, -15, 5, 0, 0, 0, 45]
- Erste 50 ms: -55.72671 dB RMS; letzte 50 ms: -57.650604 dB RMS; letzte Sekunde: -28.23346 dB RMS
- Lautheitsverlauf (Short-Term-LUFS, alle 2 s): 1s:– 3s:-15 5s:-15 7s:-16 9s:-14 11s:-11 13s:-17 15s:-16 17s:-17 19s:-15 21s:-15 23s:-14 25s:-12 27s:-10 29s:-12 31s:-14 33s:-15 35s:-16 37s:-15 39s:-15 41s:-14 43s:-15 45s:-15 47s:-16 49s:-13 51s:-15 53s:-17 55s:-18 57s:-25 59s:-11 61s:-16

## Bewertung

**Status: FAIL**

- ❌ Einstellungen < 4 Frames (Blitzbild/Sprung): [42.533, 42.6, 46.933]
- ⚠️ Sprungkandidaten ohne Schnitt: [9.7, 32.667, 32.7, 32.733, 32.767, 32.8, 33.9, 34.567, 35.433, 35.467, 36.567, 42.7, 42.733, 51.733, 51.767, 51.8, 51.833, 51.867, 57.067, 57.1, 57.133]
- ⚠️ Flacker-Kandidaten: [11.5, 15.7, 33.9]
- ⚠️ Klick-Kandidaten (anhören!): [0.28, 0.59, 0.89, 2.02, 2.45, 2.88, 3.18, 3.6, 4.03, 4.34, 4.9, 5.48, 5.91, 6.34, 8.37, 8.8, 9.27, 9.57, 10.24, 10.67, 10.97, 11.39, 12.26, 12.69, 12.99, 13.41, 13.71, 15.0, 15.3, 15.72]
- ⚠️ Ereignis-Klänge > ±34 ms versetzt (anhören!): [(11.8, 'pop', 55), (16.1, 'pop', 55), (34.3, 'pop', 50), (57.2, 'pop', 45)]
- ⚠️ Ereignis-Klänge verdeckt – Anstieg < 3 dB, nur per Hörprüfung beurteilbar: [(12.2, 'pop'), (22.4, 'pop')]
- ⚠️ Monotonie-Kandidaten (3 s kaum Bewegung, Sichtprüfung): [[58.0, 61.0]]

Automatische Prüfung ersetzt nicht die Sichtprüfung (Kontaktbögen, shots.jpg) und das vollständige Anhören. Siehe VIDEO_PRODUCTION_CHECKLIST.md.

**Status bezieht sich nur auf die technische Prüfung.** Visuelle und dramaturgische Freigabe: `templates/quality_review.md` ausfüllen (Monotonie, Figuren, Kamera, HUD, Einstieg, Eskalation, Ende).

## Einstellungen

| # | Start (s) | Dauer (s) | Frames |
|---|---|---|---|
| 1 | 0.0 | 4.0 | 120 |
| 2 | 4.0 | 4.0 | 120 |
| 3 | 8.0 | 3.6 | 108 |
| 4 | 11.6 | 4.2 | 126 |
| 5 | 15.8 | 3.933 | 118 |
| 6 | 19.733 | 4.0 | 120 |
| 7 | 23.733 | 4.267 | 128 |
| 8 | 28.0 | 3.8 | 114 |
| 9 | 31.8 | 2.233 | 67 |
| 10 | 34.033 | 3.9 | 117 |
| 11 | 37.933 | 4.6 | 138 |
| 12 | 42.533 | 0.067 | 2 |
| 13 | 42.6 | 0.033 | 1 |
| 14 | 42.633 | 4.3 | 129 |
| 15 | 46.933 | 0.067 | 2 |
| 16 | 47.0 | 4.2 | 126 |
| 17 | 51.2 | 4.8 | 144 |
| 18 | 56.0 | 5.4 | 162 |
