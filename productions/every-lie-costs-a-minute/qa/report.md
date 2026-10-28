# Technischer Bericht: `final.mp4`

Modus: **render** — Status: **FAIL**

## Container und Streams

- Dauer: 55.000 s, Größe 23.5 MB, 3418 kbit/s
- Video: h264 1080×1920 (yuv420p), r=30.000 fps, avg=30.000 fps, 1650 Frames
- Audio: aac 48000 Hz, 2 Kanäle, 55.000 s

## Bild

- Bildinhalt/Balken: vollflächig
- Harte Schnitte: 8 (≈ 1.45 pro 10 s), erster bei 6.6 s
- Bewegungsübergänge (Whip/Fast-Move): 4 [(4.0, 4.067), (9.1, 9.267), (43.3, 43.367), (44.0, 44.1)]
- Einstellungswechsel gesamt: 12 (≈ 2.18 pro 10 s), erster bei 4.033 s
- Einstellungslänge: Median 2.8 s, Mittel 4.23 s, min 0.53 s, max 9.6 s
- Unregelmäßige Zeitstempel: 0
- Schwarzbilder: [(3.96667, 4.0), (39.0, 39.1)]
- Standbild-Phasen ≥ 0.5 s: [(39.1, 39.63)]
- Isolierte Doppelbilder in Bewegung: 0 []
- Doppelbild-Anteil in Bewegungsphasen: 0.6%
- Sehr kurze Einstellungen (< 4 Frames): keine
- Sprungkandidaten ohne Schnitt: [8.2, 8.233, 8.267, 8.3, 45.533, 45.567, 45.6]
- Flacker-Kandidaten: keine
- Abgleich mit Zeitplan: 15 geplante Übergänge, davon im Bild erkennbar: 15; Kandidaten an geplanten Übergängen (erwartet): Sprung [3.867, 3.9, 14.4, 18.0, 26.7, 26.733, 26.767, 26.8, 38.9, 38.933, 38.967, 39.0, 50.0], Flackern [9.133, 9.167]
- Mittlere Helligkeit (Y 0–255): 57.2, mittlere Bilddifferenz: 1.54

## Ton

- Integrierte Lautheit: -14.3 LUFS, LRA 12.4 LU, True Peak -1.3 dBTP
- Sample-Peak -1.322666 dBFS, RMS -14.513893 dBFS, Flat factor 0.0
- Stille (< −45 dB, ≥ 0,4 s): keine
- Lautheitssprünge: keine
- Klick-Kandidaten (HF-Transienten, oft auch gewollte SFX): keine
- An geplanten Ton-Ereignissen (beim Anhören bestätigen): Transienten [1.8, 5.4, 8.0, 10.7, 15.0, 15.6, 16.3, 17.0, 17.5, 20.0, 45.3], Lautheitssprünge [50.2]
- Erste 50 ms: -58.630432 dB RMS; letzte 50 ms: -64.082293 dB RMS; letzte Sekunde: -38.921766 dB RMS
- Lautheitsverlauf (Short-Term-LUFS, alle 2 s): 1s:– 3s:-11 5s:-16 7s:-14 9s:-14 11s:-12 13s:-13 15s:-12 17s:-12 19s:-12 21s:-12 23s:-14 25s:-16 27s:-16 29s:-18 31s:-15 33s:-16 35s:-24 37s:-22 39s:-24 41s:-25 43s:-24 45s:-19 47s:-14 49s:-20 51s:-15 53s:-14 55s:-30

## Bewertung

**Status: FAIL**

- ❌ Schwarzbilder: [(3.96667, 4.0), (39.0, 39.1)]
- ⚠️ Sprungkandidaten ohne Schnitt: [8.2, 8.233, 8.267, 8.3, 45.533, 45.567, 45.6]
- ⚠️ Standbild-Phasen ≥ 0.5 s (nur ok, wenn beabsichtigt): [(39.1, 39.63)]

Automatische Prüfung ersetzt nicht die Sichtprüfung (Kontaktbögen, shots.jpg) und das vollständige Anhören. Siehe VIDEO_PRODUCTION_CHECKLIST.md.

## Einstellungen

| # | Start (s) | Dauer (s) | Frames |
|---|---|---|---|
| 1 | 0.0 | 4.033 | 121 |
| 2 | 4.033 | 2.567 | 77 |
| 3 | 6.6 | 2.567 | 77 |
| 4 | 9.167 | 2.633 | 79 |
| 5 | 11.8 | 9.6 | 288 |
| 6 | 21.4 | 2.8 | 84 |
| 7 | 24.2 | 5.6 | 168 |
| 8 | 29.8 | 5.7 | 171 |
| 9 | 35.5 | 7.3 | 219 |
| 10 | 42.8 | 0.533 | 16 |
| 11 | 43.333 | 0.7 | 21 |
| 12 | 44.033 | 2.767 | 83 |
| 13 | 46.8 | 8.2 | 246 |
