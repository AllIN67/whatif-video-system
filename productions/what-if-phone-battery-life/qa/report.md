# Technischer Bericht: `final.mp4`

Modus: **render** — Status: **REVIEW**

## Container und Streams

- Dauer: 61.400 s, Größe 34.5 MB, 4501 kbit/s
- Video: h264 1080×1920 (yuv420p), r=30.000 fps, avg=30.000 fps, 1842 Frames
- Audio: aac 48000 Hz, 2 Kanäle, 61.400 s

## Bild

- Bildinhalt/Balken: vollflächig
- Harte Schnitte: 9 (≈ 1.47 pro 10 s), erster bei 12.2 s
- Bewegungsübergänge (Whip/Fast-Move): 5 [(4.1, 4.3), (20.6, 20.7), (27.1, 27.3), (38.067, 38.333), (39.2, 39.3)]
- Einstellungswechsel gesamt: 13 (≈ 2.12 pro 10 s), erster bei 4.2 s
- Einstellungslänge: Median 3.78 s, Mittel 4.39 s, min 0.23 s, max 17.77 s
- Unregelmäßige Zeitstempel: 0
- Schwarzbilder: keine
- Standbild-Phasen ≥ 0.5 s: keine
- Isolierte Doppelbilder in Bewegung: 0 []
- Doppelbild-Anteil in Bewegungsphasen: 0.0%
- Sehr kurze Einstellungen (< 4 Frames): keine
- Sprungkandidaten ohne Schnitt: [14.3, 14.5, 20.5, 46.567, 53.1, 57.867, 57.9, 57.933, 57.967]
- Flacker-Kandidaten: [20.5]
- Abgleich mit Zeitplan: 16 geplante Übergänge, davon im Bild erkennbar: 16; Kandidaten an geplanten Übergängen (erwartet): Sprung [8.2, 14.367, 14.4, 14.433, 14.467, 42.2, 46.2, 49.8, 53.0, 53.033, 53.067], Flackern [4.133, 4.167, 4.2, 8.133, 8.167, 8.2, 14.333, 14.367, 20.533, 20.567, 27.133, 27.167, 27.2]
- Monotonie-Kandidaten (3 s mittlere Bilddifferenz < 0.5): keine
- Mittlere Helligkeit (Y 0–255): 95.0, mittlere Bilddifferenz: 2.42

## Ton

- Integrierte Lautheit: -14.2 LUFS, LRA 10.9 LU, True Peak -1.1 dBTP
- Sample-Peak -1.114757 dBFS, RMS -15.165854 dBFS, Flat factor 0.0
- Stille (< −45 dB, ≥ 0,4 s): keine
- Lautheitssprünge: keine
- Klick-Kandidaten (HF-Transienten, oft auch gewollte SFX): [0.67, 1.07, 1.87, 2.27, 2.67, 2.97, 3.34, 3.75, 4.15, 4.55, 5.35, 5.75, 6.16, 6.56, 6.95, 7.36, 8.3, 8.84, 9.37, 10.98, 11.51, 12.05, 12.59, 13.12, 13.66, 14.2, 16.34, 16.74, 17.14, 17.54]
- An geplanten Ton-Ereignissen (beim Anhören bestätigen): Transienten [0.26, 1.47, 4.95, 7.76, 10.0, 21.6, 25.44, 26.78], Lautheitssprünge [36.5, 54.6, 57.9]
- Synchronität Ereignis-Klänge (steilster Anstieg im Bereich −15…+60 ms): 35/38 erkannt (übrige verdeckt), Versatz (ms) [10, 0, 60, 0, 5, 0, 5, 5, -10, -5, -5, -5, 5, 0, 0, 5, 0, 5, None, 5, -15, 0, -15, 5, 0, 0, 0, None, -10, 5, 5, 0, 5, 0, None, 0, 0, 0]
- Erste 50 ms: -61.190534 dB RMS; letzte 50 ms: -50.623509 dB RMS; letzte Sekunde: -29.203169 dB RMS
- Lautheitsverlauf (Short-Term-LUFS, alle 2 s): 1s:– 3s:-16 5s:-23 7s:-21 9s:-20 11s:-14 13s:-13 15s:-14 17s:-14 19s:-16 21s:-17 23s:-12 25s:-18 27s:-14 29s:-22 31s:-24 33s:-15 35s:-14 37s:-13 39s:-12 41s:-14 43s:-18 45s:-10 47s:-15 49s:-15 51s:-16 53s:-16 55s:-14 57s:-15 59s:-10 61s:-11

## Bewertung

**Status: REVIEW**

- ⚠️ Sprungkandidaten ohne Schnitt: [14.3, 14.5, 20.5, 46.567, 53.1, 57.867, 57.9, 57.933, 57.967]
- ⚠️ Flacker-Kandidaten: [20.5]
- ⚠️ Klick-Kandidaten (anhören!): [0.67, 1.07, 1.87, 2.27, 2.67, 2.97, 3.34, 3.75, 4.15, 4.55, 5.35, 5.75, 6.16, 6.56, 6.95, 7.36, 8.3, 8.84, 9.37, 10.98, 11.51, 12.05, 12.59, 13.12, 13.66, 14.2, 16.34, 16.74, 17.14, 17.54]
- ⚠️ Ereignis-Klänge > ±34 ms versetzt (anhören!): [(2.4, 'pop', 60)]
- ⚠️ Ereignis-Klänge verdeckt – Anstieg < 3 dB, nur per Hörprüfung beurteilbar: [(25.5, 'pop'), (43.2, 'pop'), (55, 'pop')]

Automatische Prüfung ersetzt nicht die Sichtprüfung (Kontaktbögen, shots.jpg) und das vollständige Anhören. Siehe VIDEO_PRODUCTION_CHECKLIST.md.

**Status bezieht sich nur auf die technische Prüfung.** Visuelle und dramaturgische Freigabe: `templates/quality_review.md` ausfüllen (Monotonie, Figuren, Kamera, HUD, Einstieg, Eskalation, Ende).

## Einstellungen

| # | Start (s) | Dauer (s) | Frames |
|---|---|---|---|
| 1 | 0.0 | 4.2 | 126 |
| 2 | 4.2 | 8.0 | 240 |
| 3 | 12.2 | 6.2 | 186 |
| 4 | 18.4 | 2.233 | 67 |
| 5 | 20.633 | 3.967 | 119 |
| 6 | 24.6 | 2.6 | 78 |
| 7 | 27.2 | 4.2 | 126 |
| 8 | 31.4 | 4.0 | 120 |
| 9 | 35.4 | 2.8 | 84 |
| 10 | 38.2 | 0.8 | 24 |
| 11 | 39.0 | 0.233 | 7 |
| 12 | 39.233 | 17.767 | 533 |
| 13 | 57.0 | 0.8 | 24 |
| 14 | 57.8 | 3.6 | 108 |
