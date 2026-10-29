# Technischer Bericht: `final.mp4`

Modus: **render** — Status: **FAIL**

## Container und Streams

- Dauer: 63.000 s, Größe 35.3 MB, 4486 kbit/s
- Video: h264 1080×1920 (yuv420p), r=30.000 fps, avg=30.000 fps, 1890 Frames
- Audio: aac 48000 Hz, 2 Kanäle, 63.000 s

## Bild

- Bildinhalt/Balken: vollflächig
- Harte Schnitte: 6 (≈ 0.95 pro 10 s), erster bei 13.933 s
- Bewegungsübergänge (Whip/Fast-Move): 15 [(3.533, 3.667), (7.133, 7.267), (10.5, 10.667), (13.967, 14.067), (17.7, 17.9), (21.133, 21.267), (24.5, 24.7), (28.333, 28.467), (31.667, 31.9), (38.9, 39.067), (42.767, 42.867), (46.1, 46.3), (52.6, 52.667), (55.533, 55.667), (59.933, 60.067)]
- Einstellungswechsel gesamt: 18 (≈ 2.86 pro 10 s), erster bei 3.6 s
- Einstellungslänge: Median 3.4 s, Mittel 3.32 s, min 0.07 s, max 6.43 s
- Unregelmäßige Zeitstempel: 0
- Schwarzbilder: keine
- Standbild-Phasen ≥ 0.5 s: keine
- Isolierte Doppelbilder in Bewegung: 0 []
- Doppelbild-Anteil in Bewegungsphasen: 0.0%
- Sehr kurze Einstellungen (< 4 Frames): [13.933, 42.733]
- Sprungkandidaten ohne Schnitt: [23.3, 27.3]
- Flacker-Kandidaten: keine
- Abgleich mit Zeitplan: 17 geplante Übergänge, davon im Bild erkennbar: 17; Kandidaten an geplanten Übergängen (erwartet): Sprung [35.533, 35.667, 49.733, 49.767, 49.8, 49.833, 49.867], Flackern [3.533, 3.567, 7.133, 7.167, 10.533, 10.6, 13.967, 14.0, 17.767, 21.133, 21.167, 28.333, 28.367, 35.533, 35.567, 38.9, 38.933, 38.967, 39.0, 42.767, 42.8, 46.167, 49.733, 49.767, 52.533, 52.567, 55.533, 55.567, 59.933, 59.967]
- Mittlere Helligkeit (Y 0–255): 130.4, mittlere Bilddifferenz: 2.35

## Ton

- Integrierte Lautheit: -14.0 LUFS, LRA 11.7 LU, True Peak -1.1 dBTP
- Sample-Peak -1.062047 dBFS, RMS -18.243934 dBFS, Flat factor 0.0
- Stille (< −45 dB, ≥ 0,4 s): [{'start': 56.08, 'end': 58.0}]
- Lautheitssprünge: keine
- Klick-Kandidaten (HF-Transienten, oft auch gewollte SFX): [0.26, 0.67, 1.33, 1.74, 2.12, 2.43, 2.81, 3.2, 3.61, 4.01, 4.42, 4.82, 5.22, 5.62, 6.02, 6.42, 6.83, 7.23, 7.77, 8.7, 9.09, 9.39, 9.77, 10.16, 11.92, 12.3, 12.61, 12.99, 13.39, 13.79]
- An geplanten Ton-Ereignissen (beim Anhören bestätigen): Transienten [1.0, 11.0, 11.5, 14.59, 15.6, 16.5, 18.4, 19.5, 22.21, 25.2, 25.5, 26.0, 29.0, 30.1, 32.54, 32.84, 33.15, 33.45, 33.76, 36.1, 36.41, 37.9, 39.6, 43.47, 43.98, 44.46, 46.6, 47.54, 47.84, 48.15, 56.0, 58.0, 61.0], Lautheitssprünge [1.1, 11.1, 12.3, 14.7, 18.5, 21.7, 25.3, 29.1, 30.2, 36.4, 56.1, 61.1]
- Erste 50 ms: -62.006542 dB RMS; letzte 50 ms: -70.580375 dB RMS; letzte Sekunde: -45.164649 dB RMS
- Lautheitsverlauf (Short-Term-LUFS, alle 2 s): 1s:– 3s:-17 5s:-28 7s:-28 9s:-24 11s:-24 13s:-13 15s:-14 17s:-16 19s:-16 21s:-16 23s:-13 25s:-16 27s:-15 29s:-23 31s:-14 33s:-13 35s:-13 37s:-12 39s:-13 41s:-15 43s:-18 45s:-13 47s:-14 49s:-13 51s:-14 53s:-22 55s:-36 57s:-22 59s:-19 61s:-22 63s:-19

## Bewertung

**Status: FAIL**

- ❌ Einstellungen < 4 Frames (Blitzbild/Sprung): [13.933, 42.733]
- ⚠️ Sprungkandidaten ohne Schnitt: [23.3, 27.3]
- ⚠️ Klick-Kandidaten (anhören!): [0.26, 0.67, 1.33, 1.74, 2.12, 2.43, 2.81, 3.2, 3.61, 4.01, 4.42, 4.82, 5.22, 5.62, 6.02, 6.42, 6.83, 7.23, 7.77, 8.7, 9.09, 9.39, 9.77, 10.16, 11.92, 12.3, 12.61, 12.99, 13.39, 13.79]
- ⚠️ Stille > 1,5 s (nur ok, wenn beabsichtigt): [{'start': 56.08, 'end': 58.0}]

Automatische Prüfung ersetzt nicht die Sichtprüfung (Kontaktbögen, shots.jpg) und das vollständige Anhören. Siehe VIDEO_PRODUCTION_CHECKLIST.md.

## Einstellungen

| # | Start (s) | Dauer (s) | Frames |
|---|---|---|---|
| 1 | 0.0 | 3.6 | 108 |
| 2 | 3.6 | 3.6 | 108 |
| 3 | 7.2 | 3.367 | 101 |
| 4 | 10.567 | 3.367 | 101 |
| 5 | 13.933 | 0.067 | 2 |
| 6 | 14.0 | 3.8 | 114 |
| 7 | 17.8 | 3.4 | 102 |
| 8 | 21.2 | 3.4 | 102 |
| 9 | 24.6 | 3.8 | 114 |
| 10 | 28.4 | 3.4 | 102 |
| 11 | 31.8 | 3.8 | 114 |
| 12 | 35.6 | 3.367 | 101 |
| 13 | 38.967 | 3.767 | 113 |
| 14 | 42.733 | 0.067 | 2 |
| 15 | 42.8 | 3.4 | 102 |
| 16 | 46.2 | 6.433 | 193 |
| 17 | 52.633 | 2.967 | 89 |
| 18 | 55.6 | 4.4 | 132 |
| 19 | 60.0 | 3.0 | 90 |
