# Produktionsprotokoll – What If Every Lie Cost You One Minute of Your Life?

| Feld | Wert |
|---|---|
| Slug | `every-lie-costs-a-minute` |
| Sprache | en |
| Status | **TECHNISCH GEPRÜFT – Hörprüfung durch einen Menschen ausstehend** (nicht `FREIGEGEBEN`, nicht zur Veröffentlichung freigegeben) |
| Style-Guide-Version | 1.1 |
| Git-Commit des Renders | `060b093` (Arbeitsstand sauber laut `render/run_log.json`) |
| Länge | 55,000 s, 1650 Frames |
| Datei | `productions/every-lie-costs-a-minute/render/final.mp4` (nicht versioniert), 23,7 MB, SHA-256 `ede105f997aab5bf…` |

## 1. Entscheidungen

- **Auftrag** (2026-10-28): englisches What-if-Video, 45–55 s, Szenenfolge Hook → Montage → Panik → persönlicher Konflikt → Wendung → Kommentarfrage, Verwendung der bestehenden Pipeline.
- **Frage im Bild:** „What if every lie cost one minute of your life?“ – Schlüsselwort „lie“ in Signalfarbe.
- **HUD:** verbleibende Lebenszeit der Figur im Fokus in Minuten („HIS/HER LIFE LEFT · MINUTES“). Jede bewusste Lüge = Sprung um genau −1 auf demselben Frame wie der Ton-Impuls; Wahrheit = kein Sprung, nur ein Warn-Puls beim Zögern. Zwischenakt global: „MINUTES LOST TODAY · ON THIS STREET / IN THIS CITY“. Schlussbild: „YOUR LIFE LEFT ??,???,???“ – der Countdown gehört jetzt dem Zuschauer. Die 3D-Countdowns über den Köpfen lesen dieselben Keyframes wie der HUD (`scene.js` → `timeline.json`), können also nicht auseinanderlaufen.
- **Kamera-Paradigma P2 (Wandernder Zeuge):** gesellschaftliches Szenario, gleitende Kamera auf Augenhöhe, Push-ins bei Verlusten, Tracking-Fahrt durch die Menge, Whip nur zwischen zwei Montage-Einstellungen (9,2 s). Kamerapositionen werden in `make_timeline.py` aus Bildaufteilungs-Vorgaben berechnet (Kopf bei x ≈ 0,66, y ≈ 0,52 → Countdown unter dem Titel, Gesicht rechts vom HUD, Untertitel unter dem Gesicht).
- **Licht/Farbe:** eine Nachtpalette (Navy/Natrium-Orange, Countdowns in Signalfarbe, Verlust in Rot); Innenräume warm (Wohnung) bzw. kalt (Krankenhaus); vor der Schlussfrage dimmt der Flur, das Schlussbild ist die dunkle, neblige Straße.
- **Signalfarbe festgelegt:** `#38E1C6` (bisher Platzhalter, Guide 6.4 verlangt Festlegung beim ersten Video) – `pipeline/runtime/brand.json`, `signal_is_placeholder: false`. Neue Markenfarbe für Verluste: `alarm #FF4545`.
- **Ton:** ausschließlich selbst erzeugt (FFmpeg-Generatoren, feste Seeds): `lie_hit` (digitaler Doppelton + Sub-Stoß, Einsatz ohne Vorlauf), `appear` (tiefer Ton beim Erscheinen des Countdowns), `pulse` (gedämpfter Herzschlag beim Zögern), `city` (Stadtatmo), `tension` (Spannungsfläche im Konflikt), `hum` (Neonbrummen), dazu `drone` und `whoosh` aus dem Bestand. Keine Musik fremder Herkunft.

### Abweichungen vom Style-Guide (Regel · Abweichung · Begründung)

| Regel | Abweichung | Begründung |
|---|---|---|
| 10.1 Länge 61–80 s [V] | 55,0 s | Ausdrückliche Vorgabe des Auftraggebers (Ziel 45–55 s). In `timeline.json` als `length_deviation` mit Begründung hinterlegt; der Validator meldet sie als Warnung. `video_qa.py` lief deshalb mit `--ignore-length`; Länge separat per ffprobe geprüft (55,000 s). |
| 2 Titel ≤ 10 Wörter [V] | Auftragstext („…cost **you** one minute…“, 11 Wörter) im Bild um „you“ gekürzt | Regel eingehalten statt gebrochen; Aussage unverändert. Der Veröffentlichungstitel kann die volle Fassung tragen. |
| 6.3/Endkarte Mitte ≈ 40–50 % | Endkarte bei 30 % Bildhöhe | Der HUD-Countdown (47–57 %) soll laut Auftrag sichtbar bleiben; die Frage steht deshalb darüber, an der Position der Titelfrage (Kreisschluss). |
| 2 erste Untertitelzeile 3,5–5,0 s [S] | 0,3 s | Die Lüge im Hook muss ohne Ton verständlich sein und vor dem Sprung bei 1,8 s lesbar sein. |
| 6.1 stilisierte Welt [V] vs. Auftrag „realistische 3D-Umgebungen“ | stilisiert (weiche Low-Poly-Figuren), aber mit Schatten, Nebel, Tiefenstaffelung und filmischer Lichtführung | Der Guide schreibt Stilisierung vor; zudem sind fotorealistische Menschen mit der Pipeline (prozedurale Three.js-Geometrie, Software-WebGL) nicht machbar. Siehe Einschränkungen. |
| Bildschirmtext in Großbuchstaben (Auftrag) | Satzschreibung | Typografie nach Guide 6.3 (Serifen, kursiv), wie im Auftrag verlangt („Typografie und Layout-Regeln des Style-Guides“). Wortlaut unverändert. |
| 1.3 keine Texte in 3D-Texturen | Ziffern in den 3D-Countdowns (Canvas-Textur) | Nur Ziffern und „−1:00“, sprachneutral; die lokalisierbare Fassung steht im HUD. |

### Pipeline-Erweiterungen (nur, wo eine Szene sie brauchte)

- `pipeline/runtime/overlay.js`: HUD-Akzente `flashes` (`loss`: Wert und Skala rot + kurzer Größenimpuls; `warn`: Puls ohne Wertänderung); Endkarte (`timeline.endcard` + `text.endcard`: Frage + kleinere Unterzeile) inkl. Sicherheitszonen-Rechteck.
- `pipeline/runtime/timeline.js`: optionale feste Skala `hud[].bar` (Fortschrittsbalken bezogen auf 80 Jahre statt auf die Keyframes).
- `tools/validate_production.mjs`: `length_deviation` (nur mit Begründung, nur innerhalb des genannten Rahmens → Warnung statt Fehler), Prüfung von Endkarte und Akzenten.
- `tools/sfx_synth.py`: sechs neue Klänge (siehe oben).
- Tests: `test_overlay.mjs` (Akzente, Endkarte), `test_validate_production.mjs` (Längenabweichung, Endkarte, Akzente), `test_timeline.mjs` (Sprung genau am Keyframe, feste Skala).

## 2. Fakten und Quellen

| Aussage/Zahl | Quelle |
|---|---|
| Alle Countdown-Werte, „Minutes lost today“ | **fiktiv** (Szenario; der Countdown ist eine erzählerische Darstellung, keine wissenschaftliche Behauptung) |
| Skala 42 048 000 min = 80 Jahre | Rechnung 80 × 365 × 24 × 60 |

Das Video enthält keine Tatsachenbehauptungen über die reale Welt.

## 3. Assets und Lizenzen

| Asset | Herkunft | Lizenz | Nachweis |
|---|---|---|---|
| 3D-Geometrie, Figuren, Bild der Künstlerin, Schaufenster-Texturen | prozedural in `scene.js`, geseedet | eigenes Material | Quellcode |
| Three.js 0.186.1 | npm `three` | MIT | `package.json` |
| Fraunces, JetBrains Mono | npm `@fontsource/*` 5.3.0 | SIL OFL 1.1 | `package.json` |
| Alle Klänge | `tools/sfx_synth.py` (FFmpeg-Generatoren, feste Seeds) | eigenes Material | Quellcode |
| Musik | keine | – | – |

## 4. Render

```bash
python3 productions/every-lie-costs-a-minute/make_timeline.py      # erzeugt timeline.json
node tools/validate_production.mjs productions/every-lie-costs-a-minute
node pipeline/run.mjs --production productions/every-lie-costs-a-minute --qa-ignore-length
python3 productions/every-lie-costs-a-minute/qa/av_check_countdown.py \
  productions/every-lie-costs-a-minute/render/final.mp4 productions/every-lie-costs-a-minute/timeline.json
```

| Schritt (Durchlauf 2) | Dauer |
|---|---|
| Validierung | < 0,1 min (0 Fehler, 2 begründete Warnungen: Länge, erste Zeile) |
| Frames rendern | 23,1 min (≈ 0,85–1,0 s/Frame, 6 FFV1-Teilstücke; die 6 Teilstücke aus Durchlauf 1 wurden über den geänderten Fingerabdruck automatisch verworfen) |
| Ton mischen | 0,2 min (−14,3 LUFS, TP −1,5 dBTP vor AAC) |
| Kodieren | 1,3 min |
| QA + Bildstreifen | 0,7 min |

## 5. QA-Durchläufe

### Durchlauf 1 – 2026-10-28, Commit `4fbe067`

- `video_qa.py`: **FAIL** · Kontaktbögen sheet_01–03 vollständig angesehen · Bildstreifen: angesehen bei 3,87 s, 8,2 s, 38,9 s und 43,3 s (die übrigen nicht, da ohnehin neu gerendert wurde).

| Zeitpunkt | Fehler | Ursache | Korrektur |
|---|---|---|---|
| 3,967–4,0 s | Schwarzbild | Whip zur Montage schwenkte in eine unbeleuchtete Fassade (+ Unschärfe) | harter Schnitt bei 4,0 s, Whoosh entfernt |
| 39,0–39,1 s + Standbild 39,1–39,63 s | Schwarz-/Leerbild, Standbild | Kamera der Krankenhaus-Einstellung stand anfangs **hinter der Flurwand** (Abstand zu groß) | Kameraabstände in s12/s14 verkürzt (bleiben im Flur); Abblende durch Schnitt ersetzt |
| ganzes Video | „traurige“ Brauen wirkten verärgert | Vorzeichen der Brauendrehung vertauscht | Vorzeichen korrigiert (betrifft alle Figuren) |
| 7–9 s, 18–21 s | Hand am Telefon wirkte wie hinter dem Kopf | Ellbogen-Richtung (IK-Pol) auf Schulterhöhe | Pol unter und vor der Schulter |
| 50,0 s | HUD sprang vom Vater (19 730 661) auf einen **höheren** Wert der Schlussfigur – wirkte wie zurückgewonnene Zeit | Erzählfehler im HUD | Schluss-HUD „YOUR LIFE LEFT ??,???,???“ (Zuschauer), Schlussfigur trägt eigenen Wert |

### Durchlauf 2 – 2026-10-28, Commit `060b093` (finale Datei)

**Automatische Prüfungen (Messung, keine Sichtprüfung):**

- `video_qa.py --mode render --plan timeline.json --ignore-length`: **REVIEW**, 0 FAIL.
  - 1080×1920, H.264 High, yuv420p, BT.709, 30/1 CFR (r = avg), 1650 Frames, 0 unregelmäßige Zeitstempel; AAC-LC 48 kHz Stereo, 243 kbit/s; Audio = Video = 55,000 s
  - keine Schwarzbilder, keine Standbild-Phasen, 0 isolierte Doppelbilder, Doppelbild-Anteil 0,0 %, keine Einstellung < 4 Frames, keine Flacker-Kandidaten außerhalb geplanter Übergänge, vollflächig
  - 15 von 15 geplanten Übergängen im Bild erkennbar
  - Ton: **−14,3 LUFS**, **LRA 12,4 LU**, **True Peak −1,4 dBTP**, Sample-Peak −1,37 dBFS, Flat factor 0, keine Stille, keine Lautheitssprünge, **keine Klick-Kandidaten**; erste 50 ms −58,6 dB RMS, letzte 50 ms −64,1 dB RMS (weiche Ein-/Ausblendung)
  - einzige REVIEW-Meldung: Sprungkandidaten 8,2–8,27 s und 45,53–45,6 s (siehe unten)
- **Bild-Ton-Synchronität** (`qa/av_check_countdown.py`, Ergebnis `qa/av_check_countdown.txt`): alle 11 Countdown-Verluste (1,8 · 5,4 · 8,0 · 10,7 · 12,4 · 12,9 · 13,3 · 13,7 · 14,0 · 20,0 · 45,3 s) ändern die HUD-Ziffern **genau auf dem geplanten Frame**; der Ton-Impuls setzt 1–3 ms nach Frame-Beginn ein (10-ms-Clip-Einblendung) → Versatz innerhalb ±1 Frame, der Countdown springt nicht vor dem Ton. Die 5 leisen Verluste in der Menge bei 15,0–17,5 s liegen per Zeitplan auf denselben Frames wie ihre Klänge (Transienten dort von `video_qa.py` erkannt), wurden aber nicht einzeln im Bild vermessen.
- `npm test`: **24/24 Node-Tests + 3/3 Python-Tests bestanden** (inkl. End-to-End-Test der Pipeline).

**Tatsächlich durchgeführte Sichtprüfung (Claude, Bilder angesehen):**

- Kontaktbögen **sheet_01, sheet_02, sheet_03 vollständig** (0–54 s, jede Sekunde, inkl. Ende), `shots.jpg`.
- **Alle 19 Bildstreifen** in `qa/strips/` (4,0 · 6,6 · 8,2 · 9,1 · 11,8 · 14,4 · 18,0 · 21,4 · 24,2 · 26,7 · 29,8 · 35,5 · 39,0 · 42,8 · 43,3 · 44,0 · 45,53 · 46,8 · 49,93 s).
- Einzelbild 7,5 s aus der finalen Datei.

| Zeitpunkt | Meldung/Beobachtung | Einstufung | Begründung |
|---|---|---|---|
| 8,2–8,27 s | Sprungkandidat ohne Schnitt | beabsichtigt | schneller Push-in nach dem Verlust (8,0–8,45 s), im Streifen flüssig, keine Lücke |
| 45,53–45,6 s | Sprungkandidat ohne Schnitt | beabsichtigt | schneller Push-in nach der Lüge des Vaters (45,3–45,8 s), flüssig |
| 9,1–9,27 s | Whip mit Bewegungsunschärfe | beabsichtigt | keine dunklen Ränder, Text scharf |
| 43,3 / 44,0 s | als Bewegungsübergänge erkannt | beabsichtigt | Kamera-Schwenk hoch zum Countdown und zurück („kurzer Blick auf den Countdown“) |
| 26,7 s, 49,93–50,0 s | Abblenden | beabsichtigt | Minimum ≈ 40 % Helligkeit, kein Schwarzbild |
| 50,2 s | Lautheitssprung (an geplantem Ereignis) | beabsichtigt, **beim Anhören bestätigen** | Atmo der Schlussstraße setzt nach dem leisen Krankenhaus wieder ein |
| 43,8–44,0 s | 3D-Countdown wandert beim Zurückschwenken dicht rechts neben den HUD-Wert | gering, offen | ≈ 5 Frames, keine Überdeckung der Ziffern |

Texte: Rechtschreibung aller 15 Zeilen, Titel und Endkarte geprüft; auf den 240-px-Kontaktbögen lesbar; Sicherheitszone im Test automatisch geprüft; Anzeigedauern vom Validator geprüft. Kontinuität: HUD-Werte stetig innerhalb jeder Figur; Wechsel nur mit Label-/Figurenwechsel; jede Figur behält Modell und Farben.

## 6. Hörprüfung (Mensch)

- **Ausstehend.** Claude kann den Ton nicht hören; alle Tonaussagen oben sind Messwerte.
- Bitte `render/final.mp4` einmal mit Kopfhörern und einmal über einen Handylautsprecher komplett anhören und bestätigen: keine Knackser/Rauschen/Verzerrung; Verlust-Impulse synchron zum roten Sprung (1,8 · 5,4 · 8,0 · 10,7 · 20,0 · 45,3 s, leiser bei 12,4–17,5 s); Herzschlag-Pulse bei 24,4 · 29,9 · 30,8 · 43,3 s; Wiedereinsatz der Atmo bei 50,2 s nicht zu abrupt; sauberer Ausklang am Ende.
- Hinweis zur Mischung: 35–43 s ist bewusst leise (−22 … −25 LUFS kurzzeitig) – bitte prüfen, ob das auf dem Handy noch trägt.

## 7. Bekannte Einschränkungen

- **Bildstil:** stilisierte Figuren (Kapsel-Gliedmaßen, einfache Gesichter mit Augen/Brauen/Mund, Mund öffnet als roter Block). Keine fotorealistischen Menschen – der Auftrag nannte „realistische 3D-Umgebungen“; erreicht ist eine stimmige, filmisch beleuchtete Stilwelt, nicht Realismus.
- Telefon-Haltung und Umarmung sind per IK gelöst und wirken steif; Hände haben keine Finger.
- Schlussbild sehr dunkel; die 3D-Countdowns der Figuren dort sind klein, der HUD trägt die Aussage.
- Die automatische Shot-Erkennung zählt Push-ins/Schwenks teilweise als Übergänge; die Bewertung oben beruht auf den Bildstreifen.
- Zwischen den Bildstreifen wurden nicht alle Einzelbilder angesehen (1 Bild/s auf den Kontaktbögen); dazwischen gilt nur die automatische Messung.
- Länge 55 s liegt unter der Guide-Länge 61–80 s (Auftragsvorgabe, siehe Abweichungen); mögliche Folgen für Monetarisierungsregeln der Plattformen (Guide H6) nicht geprüft.

## 8. Nach Veröffentlichung (7 Tage)

Noch nicht veröffentlicht (Status nicht `FREIGEGEBEN`).

| Plattform | Aufrufe | Ø Wiedergabe % | Abschlussrate | nach 3 s % | Shares/1k | Kommentare/1k | Follower/1k |
|---|---|---|---|---|---|---|---|

## 9. Erkenntnisse für den Style-Guide (Vorschläge)

- Kamera aus Bildaufteilung berechnen (`frame()` in `make_timeline.py`) hat Überdeckungen Countdown/Titel/HUD/Gesicht zuverlässig verhindert – Kandidat für eine Vorlage.
- Im 9:16-Format sind Zweier-Einstellungen nebeneinander kaum möglich; Über-die-Schulter-Einstellungen und Tiefenstaffelung funktionieren.
- Whip-Übergänge können bei Nachtszenen in Schwarz enden – vor dem Render die Schwenkrichtung gegen die Helligkeit prüfen.
- Kameras in Innenräumen gegen Wände prüfen (Fehler aus Durchlauf 1); eine automatische Prüfung „Kamera innerhalb des Raums“ wäre sinnvoll.
- Länge: Ein Auftrag mit 45–55 s widerspricht Guide 10.1; der Guide sollte klären, ob kürzere Formate künftig zulässig sind (bisher nur als dokumentierte Abweichung).
