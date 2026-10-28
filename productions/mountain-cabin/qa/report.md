# Technischer Bericht: `final.mp4`

Modus: **render** — Status: **FAIL**

## Container und Streams

- Dauer: 63.000 s, Größe 67.0 MB, 8513 kbit/s
- Video: h264 1080×1920 (yuv420p), r=30.000 fps, avg=30.000 fps, 1890 Frames
- Audio: aac 48000 Hz, 2 Kanäle, 63.000 s

## Bild

- Bildinhalt/Balken: vollflächig
- Harte Schnitte: 11 (≈ 1.75 pro 10 s), erster bei 4.5 s
- Bewegungsübergänge (Whip/Fast-Move): 4 [(10.667, 10.833), (27.5, 27.6), (30.4, 30.467), (54.4, 54.467)]
- Einstellungswechsel gesamt: 15 (≈ 2.38 pro 10 s), erster bei 4.5 s
- Einstellungslänge: Median 2.7 s, Mittel 3.94 s, min 0.07 s, max 13.53 s
- Unregelmäßige Zeitstempel: 0
- Schwarzbilder: [(39.0, 39.7667)]
- Standbild-Phasen ≥ 0.5 s: keine
- Isolierte Doppelbilder in Bewegung: 0 []
- Doppelbild-Anteil in Bewegungsphasen: 0.0%
- Sehr kurze Einstellungen (< 4 Frames): [54.433]
- Sprungkandidaten ohne Schnitt: [27.067, 34.067, 34.167, 34.267, 34.333]
- Flacker-Kandidaten: [34.033, 34.067, 34.1, 34.133, 34.167, 34.2, 34.233, 34.267]
- Abgleich mit Zeitplan: 25 geplante Übergänge, davon im Bild erkennbar: 23; Kandidaten an geplanten Übergängen (erwartet): Sprung [19.0, 25.0, 36.5, 41.5, 43.5, 45.5, 45.567, 45.6, 48.3, 57.5], Flackern [27.4, 27.433, 27.467]
- Mittlere Helligkeit (Y 0–255): 73.1, mittlere Bilddifferenz: 3.88

## Ton

- Integrierte Lautheit: -14.1 LUFS, LRA 5.9 LU, True Peak -1.1 dBTP
- Sample-Peak -1.201611 dBFS, RMS -15.257192 dBFS, Flat factor 0.0
- Stille (< −45 dB, ≥ 0,4 s): keine
- Lautheitssprünge: keine
- Klick-Kandidaten (HF-Transienten, oft auch gewollte SFX): [1.07, 1.7, 46.86, 47.46, 48.06, 48.46, 57.78, 58.11, 58.94, 60.08, 60.43, 60.76]
- An geplanten Ton-Ereignissen (beim Anhören bestätigen): Transienten [10.2, 36.99, 45.66, 46.26, 48.94, 49.5, 50.09], Lautheitssprünge []
- Erste 50 ms: -74.910153 dB RMS; letzte 50 ms: -55.838931 dB RMS; letzte Sekunde: -29.600586 dB RMS
- Lautheitsverlauf (Short-Term-LUFS, alle 2 s): 1s:– 3s:-19 5s:-16 7s:-17 9s:-13 11s:-14 13s:-16 15s:-15 17s:-14 19s:-17 21s:-17 23s:-16 25s:-14 27s:-14 29s:-14 31s:-12 33s:-12 35s:-10 37s:-10 39s:-15 41s:-15 43s:-16 45s:-15 47s:-16 49s:-15 51s:-13 53s:-12 55s:-13 57s:-14 59s:-16 61s:-16 63s:-19

## Bewertung

**Status: FAIL**

- ❌ Schwarzbilder: [(39.0, 39.7667)]
- ❌ Einstellungen < 4 Frames (Blitzbild/Sprung): [54.433]
- ⚠️ Sprungkandidaten ohne Schnitt: [27.067, 34.067, 34.167, 34.267, 34.333]
- ⚠️ Flacker-Kandidaten: [34.033, 34.067, 34.1, 34.133, 34.167, 34.2, 34.233, 34.267]
- ⚠️ Geplante Übergänge im Bild nicht erkennbar (prüfen): [19.0, 29.6]
- ⚠️ Lautheitsumfang (LRA) 5.9 LU außerhalb 6–16 LU (Style-Guide 9.4)
- ⚠️ Klick-Kandidaten (anhören!): [1.07, 1.7, 46.86, 47.46, 48.06, 48.46, 57.78, 58.11, 58.94, 60.08, 60.43, 60.76]

Automatische Prüfung ersetzt nicht die Sichtprüfung (Kontaktbögen, shots.jpg) und das vollständige Anhören. Siehe VIDEO_PRODUCTION_CHECKLIST.md.

## Einstellungen

| # | Start (s) | Dauer (s) | Frames |
|---|---|---|---|
| 1 | 0.0 | 4.5 | 135 |
| 2 | 4.5 | 2.5 | 75 |
| 3 | 7.0 | 1.6 | 48 |
| 4 | 8.6 | 1.4 | 42 |
| 5 | 10.0 | 0.733 | 22 |
| 6 | 10.733 | 0.767 | 23 |
| 7 | 11.5 | 2.5 | 75 |
| 8 | 14.0 | 13.533 | 406 |
| 9 | 27.533 | 2.9 | 87 |
| 10 | 30.433 | 3.167 | 95 |
| 11 | 33.6 | 1.2 | 36 |
| 12 | 34.8 | 4.2 | 126 |
| 13 | 39.0 | 11.5 | 345 |
| 14 | 50.5 | 3.933 | 118 |
| 15 | 54.433 | 0.067 | 2 |
| 16 | 54.5 | 8.5 | 255 |
