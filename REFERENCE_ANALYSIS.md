# Referenzanalyse – What-if-Kurzvideos

Stand: 2026-10-27 · Analysiert von Claude Code im Repository `AllIN67/whatif-video-system`.

Dieses Dokument hält fest, **was tatsächlich untersucht wurde**, was dabei beobachtet wurde und wo die Grenzen der Analyse liegen. Es ist die Belegbasis für `WHATIF_STYLE_GUIDE.md`.

Kennzeichnung in diesem Dokument:

- **[B] Beobachtung** – direkt in Messwerten oder Einzelbildern sichtbar.
- **[I] Interpretation** – plausible Deutung einer Beobachtung.
- **[H] Hypothese** – Vermutung über Wirkung/Erfolg; ohne Analytics-Daten **nicht** belegbar.

---

## 1. Bestand und Zugriffsstatus

Bereitgestellt: **15 Videodateien** in drei Nachrichten (5 + 5 + 5), am 2026-10-27, als lokale MP4-Dateien (Dateinamen `snaptik_<TikTok-ID>_v3.mp4`, also über den Download-Dienst „snaptik“ von TikTok bezogen). Keine URLs, keine Aufrufzahlen, keine Analytics.

Die Originale liegen unverändert unter `references/videos/` (SHA-256 vor/nach dem Kopieren identisch; Ordner ist per `.gitignore` von Git ausgenommen – siehe Abschnitt 7).

| ID | TikTok-ID | Dauer | Datei-Auflösung | fps | Bild | Ton | vollständig decodierbar | Analyse |
|---|---|---|---|---|---|---|---|---|
| R01 | 7699403259378715936 | 75,0 s | 576×1024 | 30 | ✅ | ✅ AAC 44,1 kHz Stereo | ✅ 0 Fehler | vollständig* |
| R02 | 7695475355297058081 | 77,0 s | 576×1024 | 30 | ✅ | ✅ | ✅ | vollständig* |
| R03 | 7698695375753858337 | 81,0 s | 576×1024 | 30 | ✅ | ✅ | ✅ | vollständig* |
| R04 | 7699939316566363422 | 61,0 s | 1080×1920 | 30 | ✅ | ✅ | ✅ | vollständig* |
| R05 | 7682415825780772103 | 78,1 s | 1080×1920 (Letterbox 1080×688) | 24 | ✅ | ✅ | ✅ | vollständig* |
| R06 | 7695148481966640398 | 61,8 s | 720×1280 | 30 | ✅ | ✅ | ✅ | vollständig* |
| R07 | 7700624061914828062 | 61,0 s | 1080×1920 | 30 | ✅ | ✅ | ✅ | vollständig* |
| R08 | 7699812603970817311 | 61,0 s | 1080×1920 | 30 | ✅ | ✅ | ✅ | vollständig* |
| R09 | 7695797198570704159 | 66,0 s | 720×1280 | 30 | ✅ | ✅ | ✅ | vollständig* |
| R10 | 7695367034321833248 | 77,5 s | 576×1024 | 30 | ✅ | ✅ | ✅ | vollständig* |
| R11 | 7694025665993100576 | 80,0 s | 1080×1920 | 30 | ✅ | ✅ | ✅ | vollständig* |
| R12 | 7691443911914540318 | 80,0 s | 720×1280 | 30 | ✅ | ✅ | ✅ | vollständig* |
| R13 | 7692429617784802590 | 80,0 s | 720×1280 | 30 | ✅ | ✅ | ✅ | vollständig* |
| R14 | 7691569649279929631 | 80,0 s | 1080×1920 | 30 | ✅ | ✅ | ✅ | vollständig* |
| R15 | 7694061135577746701 | 77,5 s | 720×1280 | 30 | ✅ | ✅ | ✅ | vollständig* |

\* **„Vollständig“ bedeutet hier genau:** (1) jede Datei komplett decodiert, (2) jedes Einzelbild technisch vermessen (Helligkeit, Bilddifferenz, Schnitt-Score, Schwarz-/Standbilder), (3) gesamte Tonspur vermessen (Lautheit, Spitzen, Stille, Transienten, Lautheitsverlauf), (4) **visuelle Sichtung aller Videos über Kontaktbögen mit 1 Bild pro Sekunde über die gesamte Laufzeit** (Anfang, Mitte, Ende), ergänzt um Bildfolgen mit voller Bildrate an auffälligen Stellen, (5) automatische Spracherkennung der Tonspur.

**Was ausdrücklich NICHT möglich war:**

- **Kein Anhören.** Claude kann Audio nicht hören. Musikstil, Klangfarbe, Sounddesign-Ereignisse und Mischqualität sind nur indirekt über Messwerte (Lautheitsverlauf, Stille, Transienten) und Spracherkennung erschlossen. Aussagen wie „Bass-Hit beim Einschlag“ werden deshalb **nicht** getroffen.
- **Keine Sichtung mit voller Bildrate über die ganze Länge.** Zwischen zwei Kontaktbogen-Bildern (1 s) liegen 29 Frames; diese sind nur technisch vermessen, nicht angesehen. Feine Animationsdetails, Mikro-Ruckler und kurze Effekte können visuell übersehen sein.
- **Keine Erfolgsdaten.** Aufrufe, Wiedergabedauer, Shares, Kommentare und Veröffentlichungsdatum liegen nicht vor. Die Annahme „erfolgreich“ stammt vom Auftraggeber. Kein Merkmal kann deshalb als Erfolgsursache belegt werden.
- **Keine Originalqualität.** Die Dateien sind Re-Encodes eines Download-Dienstes (576×1024 bis 1080×1920, H.264/HEVC, AAC 44,1 kHz). Auflösung, Bitrate und Kompressionsartefakte sagen nichts Sicheres über die Originaluploads aus.
- **Ersteller unbekannt.** Gruppierungen nach „Handschrift“ (Abschnitt 3) sind Interpretationen aus übereinstimmenden Gestaltungsmerkmalen, keine bestätigten Identitäten.

Alle Referenzen waren zugänglich. Keine Referenz ist eingeschränkt im Sinne von „nicht abspielbar“.

## 2. Methode und Werkzeuge

| Schritt | Werkzeug | Ergebnis (pro Referenz unter `references/analysis/Rxx/`) |
|---|---|---|
| Metadaten | `ffprobe` | `report.json` → `probe` |
| Bildanalyse pro Frame | `ffmpeg` (`scdet`, `signalstats`, `blackdetect`, `freezedetect`, `cropdetect`) via `tools/video_qa.py` | `frames.tsv`, Schnitte, Bewegungsübergänge, Einstellungen, Doppelbilder, Sprung-/Flacker-Kandidaten |
| Tonanalyse | `ffmpeg` (`ebur128`, `astats`, `silencedetect`, Hochpass-Transientenanalyse) | Lautheit, LRA, True Peak, Stille, Klick-Kandidaten, Lautheitsverlauf |
| Sichtprüfung | Kontaktbögen `sheet_XX.jpg` (1 Bild/s mit Zeitstempel), `hook.jpg` (erste 3 s, 5 Bilder/s), `shots.jpg` (1 Bild pro erkanntem Segment) | in diesem Dokument beschrieben |
| Sprache | `faster-whisper` (Modell Whisper small, int8, lokal) via `tools/transcribe.py` | `references/analysis/_transcripts/` |
| Übersicht | `tools/summarize_references.py` | `references/analysis/MEASUREMENTS.md` |

Validierung der Werkzeuge an den Referenzen (wichtig für die spätere QA):

- **[B]** Harte Schnitte in Letterbox-Videos wurden zunächst nicht erkannt (R05: 1 statt ≈30 Segmente), weil schwarze Balken die Bilddifferenz verdünnen. → `cropdetect` vor der Analyse ergänzt; danach 22 harte Schnitte + 7 Übergänge.
- **[B]** Schnelle Kamerabewegungen mit Bewegungsunschärfe als Szenenwechsel (R01, R02, R10) erzeugen keinen Schnitt-Score, sondern 4–12 Frames hoher Bilddifferenz. → eigener Detektor „Bewegungsübergang“ ergänzt.
- **[B]** In R07 markierte das Skript „Sprünge“/„Flackern“ alle ≈2 s. Bildfolge mit voller Bildrate (R07 3,80–4,07 s und 31,87–32,13 s) zeigt: gewollte Abblend-Übergänge (2–3 Frames Abdunkeln/Aufhellen, dann Schnitt), synchron zum 2-s-Takt des Konzepts. → Diese Kandidaten sind Hinweise zur **Sichtprüfung**, keine automatischen Fehler.
- **[B]** R04: 47 automatisch erkannte Segmente, davon ein Großteil Tag/Nacht-Wechsel in einem Zeitraffer (shots.jpg, 22,8–29 s und 33–41 s). Visuell ≈15–18 echte Einstellungen.
- **[B]** Ein Fehler im eigenen Skript wurde gefunden und behoben: Der Lautheitsverlauf wurde anfangs nicht ausgewertet (`ebur128` schreibt ihn nur bei `-v verbose`).
- **[B]** Die Spracherkennung halluziniert auf reiner Musik (z. B. R03: chinesischer TV-Abspann-Text, R12: japanischer Zugname, R06: „Thank you for watching!“). Ergebnisse wurden deshalb gegen das Bild geprüft und nicht ungeprüft übernommen.

## 3. Einzelanalysen

Zeitangaben aus Kontaktbögen haben eine Genauigkeit von etwa ±0,5 s; Zeitangaben aus der Frame-Messung (Schnitte, Übergänge, Lautheit) sind framegenau bzw. auf 0,1 s genau.

Durchgängig gilt für **R01–R04 und R06–R15** (14 von 15) **[B]**: kein Sprecher, gesamte Erzählung über Bildschirmtext; englischer Text; der Titel als „What if …?“-Frage steht ab Frame 0 über einem bereits bewegten Bild; ein Messwert-Anzeiger („HUD“: kleines Label + große Zahl + Unterzeile) sitzt links etwa auf halber Bildhöhe und verändert sich über das ganze Video; Untertitel in kursiver Serifenschrift, eine Zeile mittig im unteren Drittel; Musik läuft durchgehend.

### R01 – „What if Islam was proven true?“ (75,0 s)

- **Hook [B]:** 0–≈3 s Titel oben mittig, Schlüsselwort „Islam“ goldfarben. Bild: Augenhöhe, Straßenschlucht im Morgengrauen, Menschenmenge von hinten. HUD „THE LAST DAY ??:??:??“ mit flackernden, nie vollständigen Ziffern („ONLY GOD KNOWS THE HOUR“). Ab ≈4 s erste Zeile: „6:12 am. Everyone is waiting for the sunrise.“
- **Dramaturgie [B]:** ≈10 s Bewegungsübergang → Moschee und Kirche nebeneinander, Sonne geht im Westen auf („But the sun rises in the west.“); HUD wechselt zu „REPENTANCE CLOSED SINCE SUNRISE“. Danach Zitat, Gebetsruf aus allen Handys (≈29–33 s), Reaktionen verschiedener Gruppen (≈35–57 s), POV-Handy 6:13 Uhr (≈58–64 s, „no one's repentance counts“), HUD „YOU ? STILL STANDING“ (≈65 s), „Too late to start believing.“
- **Kamera [B]:** fast durchgehend vorwärts gleitende Kamera auf Augenhöhe durch Menschenmengen; Szenenwechsel als schnelle Schwenks mit starker Bewegungsunschärfe (9 Bewegungsübergänge, z. B. 9,7–10,4 s, 22,2–22,6 s, 34,7–35,1 s); 1 harter Schnitt (71,0 s, Endkarte). Median-Segment 6,0 s.
- **Bild [B]:** Blockfiguren, warmes Gegenlicht, Dunst; Moschee/Kirche als Wiedererkennungs-Requisiten.
- **Ton [B]:** −13,8 LUFS, LRA 15,9 LU. Lautheit zwischen ≈15 und ≈27 s stark abgesenkt (−40 bis −58 LUFS Short-Term), danach Einsatz auf ≈−14 LUFS ab ≈29–31 s (Gebetsruf). **[I]** Bewusste Stille um den Sonnenaufgang im Westen, Spannungsaufbau vor dem „Einsatz“.
- **Ende [B]:** 71–75 s Endkarte fast schwarz: Titel + goldene Kursivfrage „Would you be ready?“.
- **Technik [B]:** keine Doppelbilder, keine Sprungkandidaten; Endkarte als Schwarz-/Standbild erkannt (beabsichtigt).

### R02 – „What if the Antichrist appeared?“ (77,0 s)

- **Hook [B]:** Titel 0–≈3 s, „Antichrist“ rot; Nacht, Neon, Fahnen, Menschenmenge; HUD „WITH HIS MARK 0 NOT YET“. Erster Wechsel bei 4,5 s (Whip in jubelnde Menge): „One man ends every war on Earth. In one night.“
- **Dramaturgie [B]:** Taktung nach biblischen Zeichen: Silhouette im Gegenlicht (≈7–10 s), Feuer vom Himmel mit Nachrichten-Bildschirmen (≈13–17 s), Attentat und Wiederaufstehen (≈18–23 s), Welt kniet „Except you.“ (24 s), Statue spricht (≈32–38 s). **Ab ≈39 s zählt der HUD-Zähler hoch** (319 Mio. → 881 Mio. → … → 7,9 Mrd. bei ≈66 s, Unterzeile „AND YOU?“). Konsequenzen werden alltäglich: geschlossene Kirchen, Kasse „DECLINED – NO MARK. NO PURCHASE.“ (≈59–60 s), „Your best friend already has it.“ (≈61–65 s).
- **Kamera [B]:** schnellster Schnittrhythmus der Gruppe: 36 Segmente, 4,55 Wechsel/10 s, Median 1,78 s; viele Whips, Nahaufnahmen von Gesichtern/Händen/Bildschirmen.
- **Ton [B]:** −14,2 LUFS, LRA 16,0 LU; lauteste Stellen ≈7–9 s und ≈37–39 s (≈−8/−9 LUFS), danach Absenkung.
- **Ende [B]:** ≈72,5–77 s Endkarte, „Would you recognize him?“.

### R03 – „What if Christianity was proven true?“ (81,0 s)

- **Hook [B]:** Titel 0–≈3 s, „Christianity“ gold; Park bei Sonnenuntergang, Hunde; HUD „CHRISTIANS 2,300,000,000 DAY 1“. 4 s: „A cross of light opens over the city.“
- **Dramaturgie [B]:** Reaktionskette vom Persönlichen zum Globalen und zurück: Park (≈8–10 s) → Nachrichten-Bauchbinde „SIGN SEEN OVER EVERY CITY“ (≈11–14 s) → Handy (≈15–17 s) → Freund (≈18–21 s) → Skeptiker „Some say it's drones/AI“ (≈22–24 s) → Drohne findet nichts (≈25–28 s) → „DAY 2“ (≈29 s) → Kirche, Kräne, gelöschte Handy-Ordner, Entschuldigungen, leere Clubs, ausverkaufte Bibeln (≈32–61 s) → „Day 40“ (≈65 s). Zähler steigt bis 6.100.000.000; bei ≈69–72 s **wird der HUD-Zähler groß in die Bildmitte gezogen** („8 billion people saw it. 2 billion still don't believe.“).
- **Kamera [B]:** 21 harte Schnitte, keine Whips; Median 3,5 s; Mischung aus Totalen der Stadt und nahen Alltagsdetails.
- **Ton [B]:** −14,5 LUFS, LRA 9,9 LU; Einbruch ≈19–21 s (−23/−26 LUFS) vor der Skeptiker-Passage.
- **Ende [B]:** ≈77–81 s Endkarte, „Would you still need a sign?“.

### R04 – „What if you couldn't feel tired?“ (61,0 s)

- **Hook [B]:** Titel 0–≈2 s, „feel tired“ gold; Schlafzimmer bei Nacht, Paar im Bett; HUD „ENERGY 100% HOURS AWAKE: 72“. ≈3 s „Meet Sam. It's 3 AM.“ – benannte Hauptfigur.
- **Dramaturgie [B]:** Eskalation der Fähigkeiten (Rasenmähen um 4 Uhr, Marathon „…and runs it again. Backwards.“, Büro mit Tag/Nacht-Zeitraffer, 6 Beförderungen in 6 Tagen, CEO, Hausbau im Zeitraffer, „4 years later“, alle Bücher, 9 Sprachen). **Wendung bei ≈51 s:** „But at 3 AM, everyone he loves is asleep.“ – Einsamkeit. ≈53–57 s „Then, one night… he yawned.“ HUD fällt 100 % → 64 % → 4 % → 0 % (≈55–58 s). „4 years of tired. All at once.“
- **Kamera/Schnitt [B]:** viele kurze Einstellungen; Zeitraffer mit Lichtwechsel etwa alle 0,25 s (automatische Zählung 47 Segmente, visuell ≈15–18 Einstellungen).
- **Ton [B]:** −15,3 LUFS; **True Peak +2,7 dBTP** (Übersteuerungsrisiko); lauteste Phase ≈15–21 s (Marathon).
- **Ende [B]:** letzte Untertitelzeile „Part 2?“ (≈60 s), keine Endkarte; Fade aus/in Schwarz in den ersten/letzten ≈0,1 s.
- **[I]** Der Tag/Nacht-Zeitraffer erzeugt Helligkeitswechsel von mehreren Hz – siehe Risiken (Abschnitt 5.3).

### R05 – Wortlose Animationsgeschichte „Straßenrivalität“ (78,1 s) – **Ausreißer**

- **[B]** Kein „What if“, kein Text, kein HUD. 2D-ähnlicher Cel-Shading-Look, Nacht-Autobahn, Fahrer mit Rundgesicht, rotes Sportauto als Gegenspieler; Eskalation über Mimik, Pedale, Drehzahlmesser, Ausweichmanöver bis zum Überschlag des Gegners (≈72–75 s).
- **[B]** **16:9-Bild als Letterbox** in 9:16 (Inhalt 1080×688, nur 35,8 % der Fläche genutzt); 24 fps; 22 harte Schnitte + 7 Übergänge, Median-Segment 2,73 s; erster Schnitt 3,75 s.
- **[B]** −15,0 LUFS; True Peak +0,3 dBTP.
- **[I]** Erzählt eine Geschichte rein visuell (Schuss-Gegenschuss, Detail-Inserts). Formal und inhaltlich nicht Teil des What-if-Formats; als Beleg für „Story“-Format nur eine einzige Referenz.

### R06 – „What if water disappeared for 5 seconds?“ (61,8 s)

- **Hook [B]:** Ego-Perspektive, eigene Hände streicheln eine Katze im Park; Titel ab ≈1 s mit Wassertropfen-Symbol, „water“ blau. **HUD ab Frame 0 als Countdown mit Millisekunden: „WATER DISAPPEARS IN 0:08.533“**, läuft in Echtzeit ab.
- **Dramaturgie [B]:** Ereignis bei ≈8,5 s. Danach „WATER RETURNS IN 0:04.978 – TIME SLOWED DOWN 10×“: 5 Sekunden Ereigniszeit gedehnt auf ≈45 s Video. Stationen: Glas leer, Seen/Flüsse weg (≈16–19 s), Ozeane weg (≈25–31 s), menschlicher Körper (≈34–41 s), „Only the water inside living things remains.“, „But in five seconds… it all comes back.“ (≈46–50 s). Bei 0:00.053 → „WATER RESTORED“ (≈55 s): Wasserwand schlägt über das Geländer (≈56–60 s), Schnitt auf Schwarz bei ≈61,2 s.
- **Kamera [B]:** Ego-Perspektive mit Kopfbewegung; 12 Segmente, Median 4,5 s.
- **Ton [B]:** −14,6 LUFS; Pegel sinkt während der „wasserlosen“ Phase (≈−20 bis −25 LUFS bei 39–47 s) und steigt zur Rückkehr (−10/−11 LUFS ab 57 s). **[I]** Ton folgt der Dramaturgie.
- **Ende [B]:** Cliffhanger-Schnitt in Schwarz während des Höhepunkts, keine Endkarte.

### R07 – „What if you got 2× smaller every 2 seconds?“ (61,0 s)

- **Hook [B]:** Titel 0–≈2 s, „2× smaller“ gold; Figur im Zimmer; HUD „HEIGHT 1.49 m“ zählt **ab Frame 0 kontinuierlich herunter**.
- **Dramaturgie [B]:** Maßstabsreise im 2-s-Takt: Bett als Berg, Hund, Münze als Wand, Ameise, Teppich als Dschungel, Hausstaubmilben, Haar als Baumstamm, Wassertropfen, Bakterien, Zelle als Planet, Viren, Moleküle, DNA, Atome (1,4 nm bei ≈60 s), dann „Part 2?“.
- **Schnitt [B]:** Abblend-Übergänge alle ≈2 s (verifiziert an 3,93–4,00 s und 31,93–32,03 s), Untertitel blenden vor dem Wechsel aus.
- **Ton [B]:** **−25,2 LUFS** (sehr leise), LRA 2,2 LU (kaum Dynamik). Spracherkennung: durchgehend ein **Song mit Gesang** („You can run from your demons …“) – derselbe Song wie in R08.
- **Schwächen [B]:** heller Untertiteltext auf hellem Teppich-/Sandhintergrund (≈20–31 s) schwer lesbar.

### R08 – „What if you dug 2× faster every 2 seconds?“ (61,0 s)

- **Hook [B]:** Titel 0–≈2 s, „2× faster“ gold; Garten, Mann mit Schaufel, Hund; HUD „DISTANCE DUG 5 cm“, ab Frame 0 steigend.
- **Dramaturgie [B]:** Exponentielle Eskalation mit Querschnitt-Ansicht (Wasserrohr, U-Bahn „Mind the gap.“, Höhle, Öl, Mine 4 km, Kruste, Mantel 1.000 °C, Diamanten, flüssiges Eisen, Erdmittelpunkt). **Orientierungs-Totalen**: Erdquerschnitt mit leuchtendem Punkt (≈30–33 s, 40–42 s, 50 s). Ankunft „12,742 km later…“ mitten im Indischen Ozean (≈52–57 s), Twist: Ozean läuft in das Loch ab (≈58–60 s), „Part 2?“.
- **Ton [B]:** −21,6 LUFS, LRA 5,6 LU; derselbe Gesangs-Song wie R07.
- **[I]** Querschnitt + Zoom-out-Totale lösen das Problem „wie zeige ich Tiefe/Maßstab“.

### R09 – „What if you stood on every planet for 5 seconds?“ (66,0 s)

- **Hook [B]:** Wiese, Bäume; Titel 0–≈3 s, „planet for 5 seconds?“ in Gold **auf hellem Himmel – geringer Kontrast**; HUD „TELEPORTING IN 0:05.03“.
- **Dramaturgie [B]:** Modularer Aufbau: pro Planet ein Segment von ≈7 s inklusive Übergang; HUD „TIME ON MERCURY 0:04.83“ usw., je zwei Fakten als Untertitel. Reihenfolge Merkur → Venus → Mars → Jupiter → Saturn → Uranus → Neptun → „BONUS: PLUTO“ („Still not a planet. Sorry.“) → „BACK ON EARTH Home“ (≈59 s): „Out of every world… this is the only one you'd survive.“
- **Übergänge [B]:** Weißblende mit Vignette („Teleport“) bei ≈5, 12, 19, 26, 33, 40, 47, 54, 58 s.
- **Ende [B]:** Rückkehr zum Ausgangsbild (Wiese) – **[I]** Kreisschluss, der eine Wiederholung begünstigen kann **[H]**.
- **Ton [B]:** −17,0 LUFS, LRA 4,0 LU.

### R10 – „What if Jesus came back?“ (77,5 s)

- **Hook [B]:** Titel 0–≈3 s, „Jesus“ gold; Ego-Perspektive am Restauranttisch auf einer Dachterrasse, Gegenüber sitzt eine Frau; HUD „HE RETURNS IN ??:??:??“ (verrauschte Ziffern wie R01). Gemalte Papier-/Leinwandtextur über dem ganzen Bild.
- **Dramaturgie [B]:** „Jesus said it would happen like this:“ → „while people are eating and drinking.“ → Blitz, Himmel leuchtet (≈12–16 s), Lichtgestalt (≈17–23 s), „A trumpet. Every person on Earth hears it.“ (HUD „RIGHT NOW 8.3 billion“), Gegenüber verschwunden („AT YOUR TABLE 1 of 2“, ≈31–36 s; Handy „Mom: Are you seeing this??“), Menschen steigen auf („RISING 0 m … 16 m“), Erdbeben (HUD-Magnitude 6.3 → 9.6), Sonne verdunkelt (95 % → 0 %), Tote steigen auf, Fluchtversuche, „Nobody knew the day or the hour.“
- **Kamera [B]:** 39 Segmente, 4,9 Wechsel/10 s (schnellster gemessener Takt der Sammlung), viele Whips; Aufsicht-Totalen der Stadt.
- **Ton [B]:** LRA **19,3 LU** (größte Dynamik); erste ≈10 s sehr leise (−32 bis −35 LUFS); Spracherkennung liefert Fragmente wie Gelächter/Gespräch – **[I]** möglicherweise Restaurant-Atmo, **nicht verifiziert**. True Peak +0,5 dBTP.
- **Ende [B]:** ≈74–77,5 s Endkarte „Are you ready?“.

### R11 – „What if a pop star was 100 times taller?“ (80,0 s)

- **Hook [B]:** Titel 0–≈4 s ohne Farbhervorhebung; Blick von einem Hochhausdach auf eine riesige tanzende Sängerin zwischen Hochhäusern; HUD „THE STAR 2,020 ft“, sinkt kontinuierlich (sie kommt näher).
- **Dramaturgie [B]:** Pseudo-wissenschaftliche Begründung („Her Hippo pathway never told her to stop.“, „Twenty extra cell divisions did this.“), Gewicht, Hüftbreite, Geschwindigkeit, Lärm. HUD wechselt zu „HER HIPS 1,241 ft … LEVEL WITH FLOOR 23“ und zählt die **Entfernung zur eigenen Position** herunter. Büro im 23. Stock: „Someone still has a deadline.“ → Hüfte zerstört Hochhaus (≈54–57 s) → „Floor 23 is right at hip height.“ → HUD „HERE“ (≈62 s), Kamera kippt, Decke bricht (≈62–72 s).
- **Kamera [B]:** 10 Segmente, Median ≈8 s; überwiegend ruhige Beobachterpositionen.
- **Ende [B]:** ≈73–80 s Endkarte mit Titel, kleiner Faktenzeile („THE HIPPO PATHWAY IS REAL …“) und **Kommentaraufruf „What WTF idea should we try next? TELL US IN THE COMMENTS ↓“**.
- **Inhalt [I]:** Reale, erkennbare Person als Vorlage nicht eindeutig; generische „Popstar“-Figur. Für uns: keine realen Personen nachbilden.

### R12 – „What if an asteroid exploded over your town?“ (80,0 s)

- **Hook [B]:** Titel 0–≈4 s; **eine einzige feste Kameraposition** (Veranda mit Geländer, Blick über See und Wald) bis ≈60 s; HUD „ALTITUDE 21,575 mi“ fällt ab Frame 0 rasant.
- **Dramaturgie [B]:** „A new star in the morning sky.“ → „It is getting brighter.“ → „It hits the atmosphere.“ → Explosion: „There is no sound.“ (≈25–30 s) → HUD wechselt zu „SHOCKWAVE 3:03 … 25 MILES AWAY“ (Countdown bis zur Druckwelle) → „The sky splits in two.“ → „Then you feel the heat.“ → „The ground arrives next.“ → „Then the air.“ → „Every tree falls the same way.“ → „Cover your ears.“ → „0:00 HERE“ (≈60 s), Staub, umgestürzte Bäume → **„This really happened.“** (≈64–69 s).
- **Ton [B]:** Bei „There is no sound.“ fällt der Pegel auf −31/−39 LUFS (≈33–35 s), beim Eintreffen der Druckwelle Maximum −9 LUFS (≈63–65 s). **[I]** Stille als bewusstes Gestaltungsmittel, synchron zum Text.
- **Ende [B]:** ≈72–80 s Endkarte mit Faktenzeile „TUNGUSKA, 1908 · 80 MILLION TREES FLATTENED“.
- **Technik [B]:** 1 isoliertes Doppelbild, Doppelbild-Anteil 0,9 % (höchster Wert der Sammlung, aber gering).
- **Detail [B]** (Bildfolge 59,83–60,17 s): Ankunft der Druckwelle als harter Schnitt auf ein fast einfarbiges helles Bild, danach Trümmer; hinter dem HUD liegt ein weicher dunkler Fleck als Lesbarkeits-Scrim (auch R14 „HERE“).

### R13 – „What if the Earth stopped spinning?“ (80,0 s)

- **Hook [B]:** Titel 0–≈4 s; erhöhte Beobachterposition über einer Straßenkreuzung; HUD „EARTH'S SPIN 1,037 mph AT THE EQUATOR“. „You are standing on the equator.“ (≈5–7 s).
- **Dramaturgie [B]:** „Now it starts to slow down.“ (≈13 s) → Menschen werden umgeworfen („You do not. Nothing does.“) → Wind (Unterzeile „WIND x MPH“), Trümmer, „stronger than any hurricane“, Gebäude stürzen (≈35–47 s), „faster than sound“, HUD 0 mph (≈54 s) → **Twist** „The planet stops. The oceans do not.“ → Flutwelle, Unterwasser-Bild mit gesprungenem Glas, HUD „THE OCEAN HERE“ (≈62–70 s).
- **Kamera [B]:** 4 Segmente; Kamera bleibt weitgehend am Ort, leicht driftend.
- **Ton [B]:** stetiger Anstieg von ≈−22 LUFS (Ruhe) auf ≈−11/−12 LUFS (≈53–65 s), danach Ausklingen (−31 LUFS).
- **Ende [B]:** ≈72–80 s Endkarte mit Erklärzeile („AT THE EQUATOR THE GROUND MOVES EAST AT 1,037 MPH …“).

### R14 – „What if the sun exploded?“ (80,0 s)

- **Hook [B]:** Titel 0–≈4 s; **feste Kamera** auf einen belebten Strand mit Riesenrad bis ≈62 s; HUD „ITS LIGHT ARRIVES IN 7:59 – 93 MILLION MILES AWAY“ zählt **beschleunigt** herunter (≈8 min in ≈23 s).
- **Dramaturgie [B]:** „The sun has just exploded.“ → „You won't know for eight minutes.“ → „Its light is still on the way.“ → HUD-Wechsel „SUNLIGHT 1× … 622×“ (≈24–33 s, „And brighter.“) → „GROUND TEMPERATURE 489 °F … 2,737 °F“ (≈34–44 s, Feuer, „The ocean is boiling away.“) → „BLAST WAVE 75,879,645 mi“ (≈45–61 s, „It fills half the sky.“, „There is nowhere on Earth to hide.“) → „HERE“ (≈62 s), Sandsturm.
- **Ton [B]:** True Peak **+2,1 dBTP**; Maximum ≈−11 LUFS bei ≈33–35 s und ≈61–65 s.
- **Schwächen [B]:** ≈35–60 s stark überstrahlt; HUD und Untertitel auf fast weißem Hintergrund schlecht lesbar.
- **Ende [B]:** ≈72–80 s Endkarte mit Faktenzeile („THE SUN IS TOO SMALL TO EVER EXPLODE · ITS LIGHT IS 8 MINUTES 20 SECONDS OLD“).

### R15 – „What if protons disappeared for 5 seconds?“ (77,5 s)

- **Hook [B]:** Park (Central Park), Tauben; Titel ab ≈1 s mit Atom-Symbol, „protons“ rot; HUD-Countdown „PROTONS DISAPPEAR IN 06.533“ ab Frame 0. Gleicher Aufbau wie R06 (Ego-Perspektive, eigene Hände, „TIME SLOWED DOWN 12×“).
- **Dramaturgie [B]:** Bei ≈7 s kippt die ganze Welt in einen rot-weißen Röntgen-/Negativ-Look. Erklärung über **Zoom in** bis auf Atomkern-Ebene (≈23–29 s, „no element“), **Zoom out** über Stadt, Kontinent bis Erde (≈40–56 s, „Every ordinary atom on Earth is affected.“), zurück in den Park, Countdown auf 00.000, normale Farben, HUD „PROTONS BACK – CENTRAL PARK · 5 SECONDS LATER“ (≈70 s).
- **Ton [B]:** **−23,4 LUFS** (leise), LRA 7,8 LU.
- **Ende [B]:** ≈74–77,5 s Endkarte mit Titel und zweizeiliger Faktenzeile.

## 4. Gruppen gleicher Handschrift [I]

| Gruppe | Referenzen | gemeinsame Merkmale [B] |
|---|---|---|
| A „Glaube/Endzeit“ | R01, R02, R03, R10 | religiöse Szenarien; Blockfiguren; Augenhöhe in Menschenmengen; Whip-Übergänge (außer R03); verrauschte oder hochzählende HUD-Werte; schwarze Endkarte mit Titel + goldener „Would you …?“-Frage; 75–81 s |
| B „Persönliche Eskalation“ | R04, R07, R08, R09 | „What if you …?“; helle Pastell-Low-Poly-Welt; Eskalation im festen Takt („every 2 seconds“) oder modular; „Part 2?“ als Abschluss (R04, R07, R08); exakt 61 s (R09: 66 s); leise Mischung |
| C „5 Sekunden“ | R06, R15 | „What if X disappeared for 5 seconds?“; Ego-Perspektive mit Händen; Millisekunden-Countdown; „TIME SLOWED DOWN 10×/12×“; Weltzustand kippt sichtbar |
| D „Katastrophe vor Ort“ | R11, R12, R13, R14 | feste oder fast feste Beobachterposition; HUD wechselt sein Label pro Akt und endet bei „HERE“; reale Bezugszahlen; Endkarte mit Faktenzeile; exakt 80 s |
| – | R05 | wortlose Story, Letterbox, 24 fps |

**[I]** Die Sammlung besteht also nicht aus 15 unabhängigen Erfolgen, sondern aus etwa vier Handschriften. Muster, die nur innerhalb einer Gruppe vorkommen, sind schwächer belegt als Muster, die gruppenübergreifend auftreten.

## 5. Vergleichende Auswertung

Bewertung: Häufigkeit (n von 15) · Nutzen für Zuschauerbindung **[H]** · Übertragbarkeit · Umsetzbarkeit · Aufwand/Fehleranfälligkeit · Risiko „austauschbar/überladen“.

### 5.1 Kategorie 1 – Wiederkehrende Muster (gruppenübergreifend)

| # | Muster | n | Gruppen | Nutzen [H] | Übertragbar | Umsetzbar | Aufwand/Risiko |
|---|---|---|---|---|---|---|---|
| M1 | Titel als „What if …?“-Frage ab Frame 0 über bereits bewegtem Bild, ≈2–4 s sichtbar | 14 | A B C D | hoch: Prämisse in < 1 s klar | sehr hoch | einfach | gering |
| M2 | Schlüsselwort im Titel farbig hervorgehoben | 10 | A B C | mittel | hoch | einfach | gering |
| M3 | **Live-Messwert (HUD)** links auf halber Höhe, ab Frame 0 sichtbar, ändert sich über das ganze Video | 14 | A B C D | hoch: macht Fortschritt sichtbar, erzeugt „bis wohin geht das?“ | sehr hoch | mittel (Animation + Typografie) | gering; austauschbar, wenn nur kopiert |
| M4 | HUD-Label wechselt zwischen Akten (neue Messgröße = neue Phase) | 9 (R01, R06, R09, R10, R11, R12, R13, R14, R15) | A B C D | hoch: markiert Eskalationsstufen | hoch | mittel | gering |
| M5 | Kein Sprecher; Erzählung in kurzen Untertitelzeilen (1 Satz, ≈3–9 Wörter, ≈2–4 s sichtbar) | 14 | alle What-if | hoch für Stummschaltung/International **[H]** | sehr hoch | einfach | gering; Text muss lesbar sein |
| M6 | Zweite Person: Zuschauer wird hineinversetzt („you/your“, Ego-Perspektive) | ≥ 11 | A B C D | hoch **[H]** | hoch | einfach | gering |
| M7 | Eskalationsleiter: alle ≈3–6 s eine neue, größere Konsequenz | 14 | alle | hoch | sehr hoch | einfach (Skript) | gering |
| M8 | Reale Zahlen/Fakten als Anker (1,037 mph; 8 min Lichtlaufzeit; Tunguska 1908; Planetenwerte) | ≥ 10 | B C D (A: religiöse Zitate) | mittel–hoch: Glaubwürdigkeit, Lerneffekt **[H]** | hoch | Recherche nötig | Faktenfehler-Risiko → Faktencheck |
| M9 | Wendung/Pointe in den letzten ≈10–15 s (Gähnen, Ozean läuft ab, „This really happened“, „The oceans do not“, Freund hat das Mal) | ≥ 10 | A B C D | hoch für Ende/Kommentare **[H]** | hoch | Skriptarbeit | gering |
| M10 | Abschluss mit Kommentar-/Fortsetzungs-Anlass (Frage-Endkarte, „Part 2?“, CTA, Faktenzeile) | 13 | A B C D | mittel–hoch **[H]** | hoch | einfach | Endkarte zu lang = Abbruchrisiko **[H]** |
| M11 | Laufzeit knapp über 60 s (61–81 s; keine Referenz < 61 s) | 15 | alle | **[H]** möglicherweise Plattformregeln (z. B. Monetarisierung für Videos > 1 min) | – | – | Regel aktuell prüfen |
| M12 | Ton folgt der Dramaturgie: Absenkung/Stille vor oder bei Schlüsselmoment, Maximum am Höhepunkt (R01, R03, R06, R12, R13, R14) | ≥ 6 | A C D | hoch **[H]** | hoch | Mischung nötig | gering |
| M13 | Stilisierte, vereinfachte 3D-Welt (Low-Poly/Blockfiguren), keine Fotorealistik | 14 | alle What-if | mittel; senkt Produktionsaufwand, toleriert Vereinfachung | sehr hoch | gut mit Echtzeit-3D | gering |
| M14 | Konstante Bildrate 30 fps, keine Ruckler: isolierte Doppelbilder 0 in 14 von 15, Doppelbild-Anteil ≤ 0,9 % | 15 | alle | Qualitätsbasis | – | Render-Pipeline | – |

### 5.2 Kategorie 2 – Erfolgreiche Einzelentscheidungen (themenabhängig)

| Entscheidung | Referenz | geeignet für |
|---|---|---|
| Echtzeit-Countdown mit Millisekunden + „TIME SLOWED DOWN 10×“ – kurze Ereigniszeit wird zu langer Videozeit | R06, R15 | „für X Sekunden“-Szenarien |
| Feste Kamera, die Welt verändert sich – Spannung allein über HUD und Ereignis | R12, R14 (R13, R11 teilweise) | Naturereignisse, Annäherung von etwas Großem |
| HUD zählt Entfernung bis „HERE“ (Bedrohung erreicht den Zuschauer) | R11, R12, R13, R14 | Bedrohung von außen |
| Exponentielle Regel „2× every 2 seconds“ mit festem Schnitt-Takt | R07, R08 | Maßstabs- und Eskalationsreisen |
| Querschnitt + Zoom-out-Totale zur Orientierung | R08, R15 | Tiefe, Maßstab, globale Auswirkung |
| Modulare Kapitel mit gleicher Länge (je Planet ≈7 s) + Rückkehr zum Anfangsbild | R09 | Listen-Themen („every …“) |
| Persönliche Wendung nach Erfolgsmontage (Einsamkeit, Gähnen) | R04 | Fähigkeiten-/Superkraft-Themen |
| Schauplatz kippt komplett in einen anderen Look (Röntgen-Rot) | R15 | unsichtbare/physikalische Phänomene |
| Nachrichten-Bauchbinde, Handy-Benachrichtigung als Weltreaktion | R03, R01, R10, R02 | gesellschaftliche Auswirkungen |
| Großziehen des HUD-Werts in die Bildmitte am Höhepunkt | R03 | Zahl als Pointe |
| „This really happened.“ – Fiktion wird zur Tatsache | R12 | reale historische Ereignisse |
| Kommentar-CTA „What … idea should we try next?“ | R11 | Themenfindung durch Community |

### 5.3 Kategorie 3 – Schwächen und Risiken

| Befund [B] | Referenzen | Konsequenz für uns |
|---|---|---|
| Heller Text auf hellem Hintergrund schlecht lesbar (Titel-Gold auf hellem Himmel; Untertitel auf Sand/Teppich; Überstrahlung) | R09 (0–3 s), R07 (≈20–31 s), R14 (≈35–60 s), R12 (≈30–33 s) | Pflicht: Lesbarkeits-Scrim/Schatten, Kontrastprüfung |
| HUD-Unterzeilen und Endkarten-Faktenzeilen in sehr kleiner Schrift (auf dem Kontaktbogen unlesbar, auf dem Handy grenzwertig) | fast alle | Mindest-Schriftgröße |
| Sehr leise Mischung | R07 −25,2, R15 −23,4, R08 −21,6 LUFS | Lautheitsnormierung Pflicht |
| True Peak über 0 dBTP (Übersteuerungs-/Verzerrungsrisiko nach Plattform-Transcoding) | R04 +2,7, R14 +2,1, R10 +0,5, R05 +0,3 | True-Peak-Limiter |
| Schnelle großflächige Hell-Dunkel-Wechsel (Tag/Nacht-Zeitraffer ≈4 Wechsel/s; Weißblitze) | R04, R09, R14 | Fotosensitivitäts-Risiko → Blitzregel |
| Letterbox 16:9 in 9:16, 64 % der Fläche schwarz | R05 | ausgeschlossen |
| Endkarte 7–8 s Standbild | R11–R14 | **[H]** mögliches Abbruchrisiko; Länge testen |
| Fremde Musik mit Gesang (vermutlich lizenziertes Stück, in zwei Videos identisch) | R07, R08 | nur lizenzierte/eigene Musik |
| Religiöse Wahrheitsbehauptungen über reale Glaubensgemeinschaften | R01, R02, R03, R10 | hohes Konflikt-, Richtlinien- und Markenrisiko (Abschnitt Themen im Style-Guide) |
| Halbwahre Wissenschaftsbegründung („Hippo pathway“) | R11 | Fakten- vs. Fiktionsgrenze klar kennzeichnen |
| Sehr gleichförmige Formatsprache zwischen den Handschriften (Serifenschrift, HUD links, „What if“) | A–D | Austauschbarkeit → eigene Erkennungsmerkmale nötig |

## 6. Sprache – Befund

- **[B]** Alle 14 Referenzen mit Text verwenden **ausschließlich Englisch** (Titel, Untertitel, HUD, Endkarten). R05 ist textlos.
- **[B]** Einheiten sind US-amerikanisch (mph, mi, ft, °F) – **[I]** Zielmarkt vermutlich USA/international englischsprachig.
- **[B]** **Kein Sprecher in irgendeiner Referenz.** Die Spracherkennung lieferte für R01–R06 und R09–R15 nur Halluzinationen oder Leerstellen (Beispiele: R02 „AHHHHHH!!!“, R03 chinesischer Fernseh-Abspann, R12 japanischer Zugname, R14 Sonderzeichen, R15 koreanische Silbenfolge) (niedrige Spracherkennungs-Wahrscheinlichkeit, Inhalte ohne Bezug zum Bild); für R07/R08 einen gesungenen Liedtext. **[I]** Sprache existiert in diesem Format nur als Textebene → Lokalisierung bedeutet Textaustausch, keine neue Sprachaufnahme.
- **[B]** Keine deutschsprachige Referenz → Für den deutschen Markt gibt es in dieser Sammlung **keinen Beleg**, weder für noch gegen.

Entscheidung und Testplan: siehe `WHATIF_STYLE_GUIDE.md`, Abschnitt 1.3.

## 7. Ablage und Urheberrecht

- Die Referenzvideos sind fremdes, urheberrechtlich geschütztes Material. Sie liegen nur lokal unter `references/videos/` und sind per `.gitignore` von Git ausgenommen, damit sie nicht in ein (ggf. öffentliches) Repository gelangen. Zur Wiederherstellung dient die Tabelle in Abschnitt 1 (TikTok-IDs) sowie die Prüfsummen in `references/manifest.tsv`.
- Ebenfalls nicht versioniert: Kontaktbögen und Einzelbilder (enthalten fremdes Bildmaterial). Versioniert werden nur eigene Messdaten und Texte (`report.json`, `report.md`, `frames.tsv`, Transkripte, `MEASUREMENTS.md`).
- **Hinweis:** In einer neuen Cloud-Sitzung sind die Videos nicht vorhanden und müssen erneut bereitgestellt werden, wenn die Bildanalyse wiederholt werden soll.

## 8. Offene Fragen

1. Wie erfolgreich war jede Referenz tatsächlich (Aufrufe, durchschnittliche Wiedergabedauer, Abschlussrate, Shares, Kommentare)? Ohne diese Daten bleibt jede Erfolgszuschreibung Hypothese.
2. Welche Musik/Sounds wurden verwendet und wie wurden sie lizenziert? (Nicht hörbar für Claude.)
3. Wie wirken die 7–8 s langen Endkarten auf Abbruch und Wiederholung?
4. Gibt es deutschsprachige What-if-Kanäle in vergleichbarer Qualität? (Nicht Teil der Sammlung; Marktrecherche offen.)
5. Werden die Plattformregeln zur Mindestlänge (Monetarisierung > 60 s) aktuell so angewendet?
6. Originalauflösung der Uploads (Downloads sind teils nur 576×1024).

## 9. Nachtrag 2026-10-30: Kernreferenzen für Stil B (R07, R19, R20) – Grundlage für Guide 18

Vom Auftraggeber am 2026-10-30 als **verbindliche visuelle Referenzen** bereitgestellt (drei MP4-Dateien, lokal unter
`references/videos/`, Prüfsummen in `references/manifest.tsv`):

| ID | Datei/TikTok-ID | Inhalt | Kanal |
|---|---|---|---|
| R07 | 7700624061914828062 (bitidentisch mit dem bereits vorhandenen R07) | „What if you got 2× smaller every 2 seconds?“ | Simulationskanal |
| R19 | 7702164942513868063 (neu, 1080×1920 HEVC, 61,0 s) | „What if you were immortal?“ | Simulationskanal |
| R20 | 7695367034321833248 (dasselbe TikTok wie R10, aber 1080×1920 statt 576×1024) | „What if Jesus came back?“ – nur Hook/Dramaturgie/Spannung, Thema bleibt ausgeschlossen (Guide 1.4) | zweiter Kanal |

**Was tatsächlich untersucht wurde:** alle drei Videos vollständig decodiert; **Kontaktbögen mit 2 Bildern/s über die gesamte
Laufzeit** (R07 122, R19 122, R20 155 Bilder) mit dem Read-Werkzeug angesehen; Einzelbilder in voller Auflösung (R07 bei 1,0 /
17,5 / 45,5 s); Bild-Messung (`video_qa.py --mode reference`: Schnitte, Bewegung, Helligkeit; R19 und R20 neu gemessen, R07 aus
der früheren Messung); Ton-Einsätze (Energie-Anstiege in 10-ms-Fenstern) für alle drei. **Nicht möglich:** Ton anhören
(Musik/Effekte nur gemessen), Bildfolgen mit voller Bildrate an jeder Stelle (nur an Messkandidaten).

### 9.1 Beobachtungen je Video [B]

**R07 (Schrumpfen):** 15 Szenen à **genau 4,0 s** (Raum → Bett → Hund → Münze → Ameise → Teppich-Dschungel → Hausstaubmilbe →
Haar → Wassertropfen → Bakterien → Zelle → Virus → Moleküle → DNA → Atome), Übergang jeweils kurze Abblende. In **jeder** Szene
ein neues Riesen-Objekt neben der Figur **und** eine Handlung der Figur (geht, zeigt, weicht zurück, schwimmt, hält die Hände
schützend hoch). Kamera bewegt sich in jeder Szene (Heranfahren, Begleiten, Untersicht – die Untersicht macht Objekte riesig).
Jede Szene hat eine **eigene Farbwelt** (Holz-Beige, Sand, Türkis, Grün, Nachtblau, Ocker, Violett). HUD „HEIGHT“ zählt **jeden
Frame** (1,49 m → 1,3 nm), Label klein in Versalien, Wert als **Serifenziffern**, Unterzeile winzig. Eine Textzeile pro Szene.
Weiches Licht, weiche Schatten, leichte Tiefenunschärfe bei Partikeln. Ton: Song mit Gesang, Einsätze alle ≈ 0,41 s = Takt der
Musik, keine erkennbaren Einzel-Effekte.

**R19 (Unsterblich):** 14 Szenen à **4,0 s** (Auto prallt ab → Blitz → Friedhof 2100 → Zukunftsstadt 2300 → Haus mit Ranken
3000 → Eiszeit → fremde Tiere → Erde aus dem All → aufgeblähte Sonne → Roter Riese → Erde weg → letzte Sterne → Googol →
„Forever“), Übergänge als 5–6-Frame-Abblenden (Messkandidaten exakt bei 3,93–4,10 s, 7,93–8,10 s …). HUD „YEAR 2026“ →
„YEARS FROM NOW 1 MILLION … FOREVER … ???“, Unterzeile „STILL ALIVE“: der Wert **springt pro Szene** (Stufe), nicht stetig.
Die erste Hälfte hat starke physische Ereignisse (Autoaufprall mit Dampf, Blitz mit Funken, Regen); **die zweite Hälfte (≈ 36–56 s)
zeigt nur die Figur im Weltall – gemessene Bewegung 0,06–0,2 (fast Standbild)**. Ende: Lichtblitz → Schwarz → „What was it?
Part 2?“ (offene Frage). Ton: −18,3 LUFS, ruhiges Bett, Einsätze nur beim Autoaufprall (1,35 s) und bei 11,9 s; Absenkung
49–57 s (−24 … −28 LUFS) vor dem lauten Lichtblitz.

**R20 (zweiter Kanal):** Ich-Perspektive am Restauranttisch, Gegenüber mit großem, freundlichem Gesicht; HUD mit verrauschten
Ziffern „??:??:??“ (Geheimnis ab Frame 0). 0–12 s normale Welt mit Kleinstereignissen (Kellner läuft durchs Bild), **bei 12,3 s
der Schlag** (Blitz), danach **Reaktions-Nahaufnahme** (Gesicht wechselt von Lächeln zu Sorge), Whip, Enthüllung am Himmel.
Einstellungslänge **Median 1,53 s, 4,8 Wechsel/10 s, 23 Whips** – deutlich schneller als R07/R19. HUD-Label wechselt mit **jedem
Akt** (HE RETURNS IN → FRIDAY 7:41 PM → RIGHT NOW 8.3 billion → AT YOUR TABLE 1 of 2 → RISING 0–19 m → Magnitude 6.1–9.6 →
100–0 % → 4.3 billion). Requisiten erzählen (Handy mit Nachricht „Are you seeing this??“, leerer Stuhl). Totale von oben
(Friedhof, Straße), Kamerawackeln beim Erdbeben. Gemalte Papiertextur + Tiefenunschärfe über allem. Ton: −14,1 LUFS, **LRA 19,3 LU**
(größte Dynamik), erste ≈ 10 s sehr leise, Einsätze an jedem Schlüsselereignis (12,3 Blitz, 21,5 Posaune, 33,6 Handy, 51,7 Erdbeben,
53–57 fallende Sterne, 64 Autos). Ende: Rückkehr zum Lichtmotiv → dunkle Karte mit Titel + „Are you ready?“.

### 9.2 Gemeinsame Qualitätsmerkmale (gelten für unser System) [B → Guide 18]

1. **Jede Einstellung = ein sichtbares Ereignis** mit Ursache und Wirkung im Bild; nie nur Text auf ruhigem Bild.
2. **Feste, kurze Takte:** 4,0 s (R07, R19) bzw. 1,5–4 s mit Reaktions-Einschüben (R20). Keine Einstellung über 7 s.
3. **Die Figur reagiert sichtbar** (Gesicht + Körper) – das Gefühl ist auf dem Kontaktbogen lesbar.
4. **Kamera bewegt sich immer** und **wechselt die Bildgröße** von Szene zu Szene (Untersicht, Nah, Totale von oben, Ich-Perspektive).
5. **Jeder Ort hat eine eigene Licht-/Farbwelt**; Wechsel innerhalb einer Szene nur als Ereignis (Blitz, Stromausfall, Verdunkelung).
6. **HUD = Erzähler:** Label in kleinen Versalien, großer Serifen-Wert, kleine Unterzeile; der Wert ändert sich in jeder Szene
   (stetig oder in Stufen), das Label wechselt mit den Akten.
7. **Eine Textzeile pro Szene**, die Ursache/Bedeutung ergänzt.
8. **Ende mit offener Frage oder Rückkehr** („Part 2?“, „What was it?“, „Are you ready?“).
9. **Ton:** durchgehendes Musikbett mit Lautheitsdramaturgie; **Einzel-Effekte sparsam, nur auf Schlüsselereignissen** (R19: 2,
   R20: ≈ 10). Ruhe vor dem Höhepunkt (R19, R20).

### 9.3 Kanalspezifisch (nicht übernehmen bzw. nur als Variante) [I]

| Merkmal | Video | Entscheidung |
|---|---|---|
| Song mit Gesang, Effekte im Takt der Musik | R07 | nicht übernehmen (Lizenz, Lesbarkeit) |
| Maßstabsreise mit fester Verdopplung | R07 | eigenes Rezept wäre eine Kopie der Idee – nicht als Standard |
| Zeitsprünge über Milliarden Jahre, Weltall-Standbilder | R19 | Schwäche: Monotonie im zweiten Teil → Gegenbeispiel für die Monotonie-Prüfung |
| Gemalte Papiertextur, Tiefenunschärfe | R20 | Kanal-Handschrift; nicht übernehmen (Erkennbarkeit) |
| Ich-Perspektive als Grundhaltung, sehr schneller Schnitt (4,8/10 s) | R20 | als Variante erlaubt (Kamera-Vorlage `pov`), nicht als Standard |
| Verrauschte HUD-Ziffern „??:??“ | R20 | als Geheimnis-Mittel möglich; Thema Religion bleibt ausgeschlossen |

### 9.4 Abgleich mit den bisherigen Annahmen

- Die Analyse „invisible vs. Worst day ever“ aus dem Auftrag liegt **nicht** im Repository (weder Video noch Bericht); sie wurde
  als Ausgangsthese behandelt und durch R07/R19/R20 **bestätigt**: lange statische Szenen, wiederholte Perspektiven, seltene
  HUD-Änderungen und ungenaue Effekte sind genau die Punkte, in denen sich unsere Produktionen von den Referenzen unterscheiden.
- Nicht bestätigt: „SFX auf jedes Ereignis“. Die Referenzen setzen Einzel-Effekte sparsam; Pflicht ist der Klang auf
  **Schlüsselereignissen**, nicht auf jedem Schnitt.
- Guide 16.1 („alle 3–4 s ein Ereignis“) ist bestätigt und präzisiert: 4,0 s in R07/R19.
