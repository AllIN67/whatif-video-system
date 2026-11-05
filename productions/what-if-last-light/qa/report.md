# Technischer Bericht: `final.mp4`

Modus: **render** — Status: **REVIEW**

## Container und Streams

- Dauer: 61.000 s, Größe 31.4 MB, 4118 kbit/s
- Video: h264 1080×1920 (yuv420p), r=30.000 fps, avg=30.000 fps, 1830 Frames
- Audio: aac 48000 Hz, 2 Kanäle, 61.000 s

## Bild

- Bildinhalt/Balken: vollflächig
- Harte Schnitte: 9 (≈ 1.48 pro 10 s), erster bei 4.0 s
- Bewegungsübergänge (Whip/Fast-Move): 0 []
- Einstellungswechsel gesamt: 9 (≈ 1.48 pro 10 s), erster bei 4.0 s
- Einstellungslänge: Median 4.3 s, Mittel 6.1 s, min 1.2 s, max 16.0 s
- Unregelmäßige Zeitstempel: 0
- Schwarzbilder: keine
- Standbild-Phasen ≥ 0.5 s: [(33.13, 34.2)]
- Isolierte Doppelbilder in Bewegung: 0 []
- Doppelbild-Anteil in Bewegungsphasen: 0.2%
- Sehr kurze Einstellungen (< 4 Frames): keine
- Sprungkandidaten ohne Schnitt: [7.7, 27.3, 52.667, 52.733, 52.833, 52.933, 53.1]
- Flacker-Kandidaten: [45.0, 46.033, 47.067, 52.133, 52.233, 52.3, 52.4, 52.5, 52.567, 52.667, 52.733, 52.833, 52.933, 53.0, 53.1]
- Abgleich mit Zeitplan: 14 geplante Übergänge, davon im Bild erkennbar: 14; Kandidaten an geplanten Übergängen (erwartet): Sprung [7.733, 7.767, 7.8, 15.4, 27.4, 32.0, 36.2, 55.8], Flackern []
- Monotonie-Kandidaten (3 s mittlere Bilddifferenz < 0.5): [[32.0, 40.0]]
- Mittlere Helligkeit (Y 0–255): 42.9, mittlere Bilddifferenz: 1.56

## Ton

- Integrierte Lautheit: -14.1 LUFS, LRA 7.2 LU, True Peak -1.3 dBTP
- Sample-Peak -1.344266 dBFS, RMS -13.621555 dBFS, Flat factor 0.0
- Stille (< −45 dB, ≥ 0,4 s): keine
- Lautheitssprünge: keine
- Klick-Kandidaten (HF-Transienten, oft auch gewollte SFX): [0.31, 0.62, 0.93, 2.03, 2.34, 2.65, 3.28, 3.75, 4.06, 4.68, 5.31, 5.62, 5.93, 6.52, 7.17, 7.5, 7.81, 8.12, 8.75, 9.06, 10.31, 10.93, 11.25, 11.56, 11.87, 12.18, 12.5, 12.81, 13.28, 14.06]
- An geplanten Ton-Ereignissen (beim Anhören bestätigen): Transienten [1.24, 2.97, 8.43, 9.6, 13.59, 15.94, 17.18, 32.81, 34.4, 38.6, 42.65, 46.44, 48.75], Lautheitssprünge [8.6, 9.9, 56.6]
- Synchronität Ereignis-Klänge (steilster Anstieg im Bereich −15…+60 ms): 19/22 erkannt (übrige verdeckt), Versatz (ms) [5, 0, -5, None, 0, 5, 0, 0, 35, -15, 5, 5, None, None, -5, 5, 0, 0, 0, 5, 25, 30]
- Erste 50 ms: -60.980543 dB RMS; letzte 50 ms: -55.859083 dB RMS; letzte Sekunde: -29.244747 dB RMS
- Lautheitsverlauf (Short-Term-LUFS, alle 2 s): 1s:– 3s:-11 5s:-21 7s:-17 9s:-18 11s:-15 13s:-20 15s:-16 17s:-12 19s:-13 21s:-18 23s:-16 25s:-13 27s:-13 29s:-17 31s:-16 33s:-16 35s:-15 37s:-16 39s:-11 41s:-14 43s:-17 45s:-15 47s:-13 49s:-16 51s:-14 53s:-13 55s:-10 57s:-16 59s:-16 61s:-18

## Bewertung

**Status: REVIEW**

- ⚠️ Sprungkandidaten ohne Schnitt: [7.7, 27.3, 52.667, 52.733, 52.833, 52.933, 53.1]
- ⚠️ Flacker-Kandidaten: [45.0, 46.033, 47.067, 52.133, 52.233, 52.3, 52.4, 52.5, 52.567, 52.667, 52.733, 52.833, 52.933, 53.0, 53.1]
- ⚠️ Standbild-Phasen ≥ 0.5 s (nur ok, wenn beabsichtigt): [(33.13, 34.2)]
- ⚠️ Klick-Kandidaten (anhören!): [0.31, 0.62, 0.93, 2.03, 2.34, 2.65, 3.28, 3.75, 4.06, 4.68, 5.31, 5.62, 5.93, 6.52, 7.17, 7.5, 7.81, 8.12, 8.75, 9.06, 10.31, 10.93, 11.25, 11.56, 11.87, 12.18, 12.5, 12.81, 13.28, 14.06]
- ⚠️ Ereignis-Klänge > ±34 ms versetzt (anhören!): [(13.6, 'pop', 35)]
- ⚠️ Ereignis-Klänge verdeckt – Anstieg < 3 dB, nur per Hörprüfung beurteilbar: [(3, 'wind'), (25, 'ding'), (29.8, 'warmth')]
- ⚠️ Monotonie-Kandidaten (3 s kaum Bewegung, Sichtprüfung): [[32.0, 40.0]]

Automatische Prüfung ersetzt nicht die Sichtprüfung (Kontaktbögen, shots.jpg) und das vollständige Anhören. Siehe VIDEO_PRODUCTION_CHECKLIST.md.

**Status bezieht sich nur auf die technische Prüfung.** Visuelle und dramaturgische Freigabe: `templates/quality_review.md` ausfüllen (Monotonie, Figuren, Kamera, HUD, Einstieg, Eskalation, Ende).

## Einstellungen

| # | Start (s) | Dauer (s) | Frames |
|---|---|---|---|
| 1 | 0.0 | 4.0 | 120 |
| 2 | 4.0 | 7.8 | 234 |
| 3 | 11.8 | 8.0 | 240 |
| 4 | 19.8 | 4.4 | 132 |
| 5 | 24.2 | 16.0 | 480 |
| 6 | 40.2 | 4.0 | 120 |
| 7 | 44.2 | 3.6 | 108 |
| 8 | 47.8 | 4.2 | 126 |
| 9 | 52.0 | 1.2 | 36 |
| 10 | 53.2 | 7.8 | 234 |
