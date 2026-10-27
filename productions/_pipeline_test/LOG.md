# Produktionsprotokoll – Pipeline-Testproduktion `_pipeline_test`

| Feld | Wert |
|---|---|
| Slug | `_pipeline_test` |
| Art | **abstrakte technische Testproduktion, kein Inhaltsvideo** |
| Sprache | en |
| Status | **TECHNISCH GEPRÜFT – Hörprüfung durch einen Menschen ausstehend** |
| Style-Guide-Version | 1.1 |
| Git-Commit des Renders | `854618a` (Arbeitsstand sauber, laut `render/run_log.json`) |
| Länge | 62,000 s, 1860 Frames |
| Datei | `render/final.mp4` (nicht versioniert), 16,95 MB, SHA-256 `d9df41d972ae24a5…` |

## 1. Entscheidungen

- Zweck: alle Pipeline-Funktionen in einem regelkonformen 62-s-Video zusammen prüfen – Titel ab Frame 0, HUD mit 4 Label-Wechseln und Endtext „ALL“, 16 Untertitel, alle Übergangsarten (2× Whip, 3× Dip, 2× Weißblende, 2× harter Schnitt), Kamerawackeln, geseedete Trümmer (260 Instanzen), weicher Himmels-/Lichtverlauf, 4 Synchron-Marker (Bild + 3-kHz-Ton).
- Kamera: absichtlich gemischte Paradigmen (Testzweck, **Abweichung von Guide 5.1**, nur für diese Testproduktion zulässig).
- Signalfarbe: Platzhalter `#38E1C6` aus `pipeline/runtime/brand.json`.
- Ton: ausschließlich selbst erzeugte Klänge (`tools/sfx_synth.py`); keine Musik.

## 2. Fakten und Quellen

Keine – abstrakte Testinhalte ohne Faktenbehauptungen.

## 3. Assets und Lizenzen

| Asset | Herkunft | Lizenz |
|---|---|---|
| Three.js 0.186.1 | npm `three` | MIT |
| Fraunces, JetBrains Mono | npm `@fontsource/*` 5.3.0 | SIL Open Font License 1.1 |
| Klänge (drone, whoosh, boom, hit, riser, tick) | mit FFmpeg-Generatoren erzeugt, feste Seeds | eigenes Material |
| 3D-Geometrie | prozedural in `scene.js` | eigenes Material |

## 4. Render

```bash
node pipeline/run.mjs --production productions/_pipeline_test
```

| Schritt | Dauer |
|---|---|
| Validierung | < 0,1 min (0 Fehler, 0 Warnungen) |
| Frames rendern | 15,5 min (≈ 0,5 s/Frame, 7 FFV1-Teilstücke) |
| Ton mischen | 0,2 min (2 Iterationen: −14,5 → −14,1 LUFS, TP −1,5 dBTP) |
| Kodieren | 1,1 min |
| QA + Bildstreifen | 0,9 min |

## 5. QA-Durchläufe

### Durchlauf 1 – 2026-10-27, Commit `8e8f62e`

- `video_qa.py`: **REVIEW**. `av_sync.py`: **FEHLER** (6 Marker statt 4).
- Kontaktbögen sheet_01–sheet_03 vollständig angesehen; Streifen: 13 (automatische Kandidaten).

| Zeitpunkt | Befund | Ursache | Korrektur |
|---|---|---|---|
| 18,867 s (Frame 566) | **Echter Bildfehler:** ein einzelnes Frame mit großflächig falschem Schatten auf dem Boden (Helligkeit 152 → 140 → 152) | Bodenfläche aus 2 riesigen Dreiecken (800 × 800 m) – der Software-Renderer berechnet den Schatten bei dieser Kamerapose falsch. Isoliert durch Varianten: ohne Blockschatten bzw. ohne Bodenschatten verschwindet er; Schattenverfahren/Bias ändern nichts; unterteilter Boden behebt ihn | Boden in 10-m-Felder unterteilt; die Bühne lehnt Schattenempfänger mit Dreieckskanten > 25 m jetzt beim Aufbau ab (+ Test) |
| 0,0–1,4 s, 7,0–7,8 s, 14,6–15,1 s, 18,9–19,5 s | Standbild-Phasen | Kamera-Interpolation „inOut“ bremst an Einstellungsanfang/-ende bis zum Stillstand – Frame 0 wirkte unbewegt (Verstoß gegen Guide 2) | Standard-Interpolation linear |
| 25,97 s, 49,97 s | `av_sync.py` zählt Weißblenden als Synchron-Marker | Marker-Erkennung nur über absolute Helligkeit | Marker muss sich ≥ 50 Helligkeitsstufen von der Umgebung abheben |
| alle geplanten Übergänge | 13 Sprung- und 13 Flacker-Kandidaten, alle an geplanten Übergängen bzw. dem Fehler-Frame | Detektor kennt den Zeitplan nicht | `video_qa.py --plan` trennt Kandidaten an geplanten Übergängen/Ton-Ereignissen ab und prüft, ob jeder geplante Übergang sichtbar ist |
| gesamt | LRA 5,5 LU (Guide 9.4 verlangt 6–16) | zu gleichförmige Lautstärkeautomation | Automation mit Absenkungen und Steigerung zum Höhepunkt; `video_qa.py` meldet LRA außerhalb 6–16 LU jetzt als REVIEW |
| — | Wiederaufnahme hätte nach Szenenänderung alte Teilstücke weiterverwendet (vor dem 2. Lauf erkannt) | keine Prüfung, ob Eingaben sich geändert haben | Fingerabdruck aller Eingaben; bei Abweichung werden Teilstücke verworfen (+ Test; im 2. Lauf ausgelöst: 7 Teilstücke verworfen) |

### Durchlauf 2 – 2026-10-27, Commit `854618a`

- `video_qa.py --mode render --plan`: **PASS** (0 FAIL, 0 REVIEW).
  - 1080×1920, H.264 High, yuv420p, BT.709, 30/1 CFR, 1860 Frames, 0 unregelmäßige Zeitstempel
  - keine Schwarzbilder, keine Standbild-Phasen, 0 isolierte Doppelbilder, Doppelbild-Anteil 0,0 %, keine Einstellung < 4 Frames
  - Sprung-/Flacker-Kandidaten außerhalb geplanter Übergänge: keine; 9 von 9 geplanten Übergängen im Bild erkennbar
  - −14,1 LUFS, LRA 13,0 LU, True Peak −1,2 dBTP (nach AAC), Flat factor 0, keine Stille, keine Lautheitssprünge oder Transienten außerhalb geplanter Ereignisse
  - Anfang −53,9 dB RMS (erste 50 ms), Ende −53,3 dB RMS (letzte 50 ms) – weich ein- und ausgeblendet
- `av_sync.py`: **OK** – 4 Marker, 4 Ticks, Versatz jeweils +4,0 ms (Toleranz ±33,3 ms). Die 4 ms entsprechen der Anstiegszeit des Tick-Klangs (5-ms-Einblendung), nicht einem Versatz der Spuren.
- Kontaktbögen **sheet_01, sheet_02, sheet_03 vollständig angesehen** (0–61 s, jede Sekunde, inkl. Ende).
- Bildstreifen mit voller Bildrate **alle 9 angesehen** (7,93 · 13,90 · 20,00 · 25,90 · 32,00 · 37,93 · 44,00 · 49,90 · 55,90 s).

| Zeitpunkt | Meldung/Beobachtung | Einstufung | Begründung |
|---|---|---|---|
| 7,93 s, 31,93 s | Whip: Bewegungsunschärfe 10 Frames | beabsichtigt | keine dunklen Bildränder, Text scharf |
| 13,90 s, 37,93 s, 55,90 s | Dip: Abdunkeln über 2–3 Frames | beabsichtigt | Minimum ≈ 40 % Helligkeit, nie Schwarz |
| 25,90 s, 49,90 s | Weißblende | beabsichtigt | Spitze 85 % Weiß; Abstand 24 s (Regel ≥ 5 s) |
| 20,00 s, 44,00 s | harte Schnitte | beabsichtigt | — |
| 2/20/42/58 s | weißes Quadrat unten rechts | beabsichtigt | Synchron-Marker, nur in Testproduktionen |
| 8,1 s, 20,1 s | Lautheitssprung an Einschlag bzw. Schnitt | beabsichtigt | geplante Ton-Ereignisse; **beim Anhören bestätigen** |
| 25,97–26,07 s, 49,93–50,07 s | HUD/Untertitel während der Weißblende kontrastarm | **offen (gering)** | 3–4 Frames; Text liegt über der Blende, verliert aber Kontrast auf Weiß. Mögliche Verbesserung: Scrim während Blenden verstärken |

Texte: Rechtschreibung geprüft, auf den 240-px-Kontaktbögen lesbar, Sicherheitszone im Test automatisch geprüft.

## 6. Hörprüfung (Mensch)

- **Ausstehend.** Claude kann den Ton nicht hören. Bitte `render/final.mp4` einmal mit Kopfhörern und einmal über einen Handylautsprecher komplett anhören und bestätigen: keine Knackser/Rauschen/Verzerrung, Einschlag bei 8 s und Ticks bei 2/20/42/58 s synchron zum Bild, sauberes Ende.

## 7. Bekannte Einschränkungen

- Renderzeit ≈ 0,5 s pro Frame (Software-WebGL ohne GPU).
- Kontaktbögen zeigen 1 Bild/s; zwischen den Übergängen wurden nicht alle 29 Zwischenbilder angesehen – sie sind nur technisch vermessen.
- Geringer Kontrast von Text während Weißblenden (siehe oben).

## 8. Nach Veröffentlichung

Nicht zur Veröffentlichung bestimmt.

## 9. Erkenntnisse für den Style-Guide (Vorschläge)

- Guide 12 ergänzen: „Schattenempfänger fein unterteilen“ als Gegenmaßnahme für einzelne fehlerhafte Schatten-Frames (jetzt technisch erzwungen).
- Guide 5.2 präzisieren: Kamerafahrten standardmäßig gleichmäßig (linear); Abbremsen nur innerhalb einer Einstellung, nicht bis zum Stillstand an Frame 0.
