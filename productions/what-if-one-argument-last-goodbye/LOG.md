# Produktionsprotokoll – What if one argument was your last goodbye?

| Feld | Wert |
|---|---|
| Slug | `what-if-one-argument-last-goodbye` |
| Produktionsstil | B – Rezept B1 (Drama-Variante, Begründung unten) |
| Sprache | en |
| Status | siehe `quality_review.md` (Guide 18.8) |
| Style-Guide-Version | 2.1 |
| Beat-Sheet / Freigabebogen | `beats.json` / `quality_review.md` |
| Git-Commit des Renders | 78cca8f (Render 2, ausgeliefert) |
| Länge | 71,0 s (≥ 60 s) |

## 1. Entscheidungen

- **Auftrag** (Nutzer, 2026-11-01): sechs Szenen fest vorgegeben (Grab-Hook mit der Frage „Mommy… when will Daddy wake up?“,
  Rückblende Streit, Fahrt im Porsche 911, Unfall an der Leitplanke, Rückkehr zum Grab, zwei Botschaften auf Schwarz). Ohne
  Sprecher/TTS, ohne Zwischenfreigaben.
- **Frage:** „What if one argument was your last goodbye?“ (8 Wörter). Der Auftrag schreibt „What If“; der Validator verlangt
  „What if“ (Guide 2) → Kleinschreibung „if“, sonst wörtlich.
- **HUD (5 Segmente, 4 Labels):** `DAYS WITHOUT DADDY` 0 → 41 (Hook) · `TIME LEFT TOGETHER` 15 → 5 MIN (Streit) ·
  `SPEED` 0 → 104 → 0 MPH (Fahrt, Aufprall) · `HEART RATE` 136 → 0 BPM (nach dem Unfall – macht den Tod ohne Bilder von
  Verletzungen eindeutig) · `DAYS WITHOUT DADDY` 0 → 41 → 9.999 → Endtext `FOREVER` (beantwortet die Hook-Frage).
- **Aufbau → Auszahlung:** Die Zeichnung (Familie aus vier Figuren an den Händen, Kleidungsfarben = Farben der Figuren)
  wird im Hook gehalten, im Streit an die Brust gedrückt, der Vater geht ohne Blick daran vorbei (Ich-Perspektive des Jungen),
  am Grab wird sie gezeigt: „The drawing he never saw.“ Zweiter Bogen: Mutter ruft an, er drückt weg → nach dem Unfall
  leuchtet ihr Anruf unbeantwortet.
- **Pointe** (Validator: Ereignis ≤ 5 s vor Ende): letzte Botschaft `last_message` (66,2 s, Klang `warmth`), 4,8 s vor Ende.
  Emotionale Wendung davor: `realize` (56,0 s) + HUD `FOREVER` (58,6 s).
- **Beats:** 20 (Checkliste 15–18) – die sechs vorgegebenen Szenen brauchen je 2–4 Einstellungen; keine Füllbeats.
  Länge 71 s statt B1-Standard 61–64 s, aus demselben Grund (Validator-Grenze 80 s eingehalten).
- **Orte (7):** cemetery, livingroom, driveway, road, car, crash_site, black. **Gefühle (8):** sad, cry, happy, angry,
  worried, panic, shock, unconscious. **Kamera:** 9 Vorlagen, 6 Bildgrößen, keine Wiederholung hintereinander.
- **Musik:** sad (Hook) → warm (Familienabend, neuer Stil) → pulse (Streit) → drive → drive_hi (Fahrt) → Stille vor/bei dem
  Aufprall → sad → Stille beim Herzstillstand → sad → calm (Botschaften), kurze Stille direkt vor der letzten Botschaft.
- **Neue Kit-Teile (Guide 18.10 c, keine Schnittstellenänderung):**
  - `human.js`: Optionen `headScale` (kindliche Proportionen), `beard`; Gefühle `cry` (Tränen), `unconscious` (Augen zu);
    Posen `hug, kneelHug, holdHand, reachUp, yell, drive, unconscious, handMouth, coverEars, showUp, placeLow`.
  - `props_family.js` (in `props` eingehängt): `sportsCar` (911-Silhouette: Fließheck, runde aufrechte Scheinwerfer,
    breite Hinterkotflügel, Rücklichtband, Bürzel; Räder, Lenkung, Licht, Warnblinker, Unfall-Verformung, Splitterscheibe,
    Innenraum), `gravestone` (Inschrift aus Textdatei), `gravePlot`, `flowers`, `drawing`, `guardrail` (einbeulbar),
    `curveSign`, `smoke`, `leaves`, `sofa`, `coffeeTable`, `tv`, `floorLamp`, `familyPhoto`, `door`, `keys`, `sideboard`,
    `toyBlocks`, `house`; `phone` Anrufmodus mit `caller`-Farben.
  - `places_family.js` (in `places` eingehängt): `cemetery`, `livingRoom`, `houseFront`, `nightRoad`.
  - `sfx_synth.py`: `engine_start, rev, screech, flatline, paper, keys, slam, blinker, warmth`, Betten `wind`, `road`.
  - `music_synth.py`: Stile `warm`, `sad`.
  - `props_family.js`: `textCard` (Botschaft als große Textkarte auf Schwarz; Sprite ohne Licht/Nebel, Text aus `text.<lang>.json → scene`) – nach Render 1 ergänzt.
- **Abweichungen vom Style-Guide** (Regel · Abweichung · Begründung):
  - Guide 2 / Validator-Warnung „erste Zeile bei 0,6 s (Empfehlung 3,5–5,0 s)“ · Frage des Jungen ab 0,6 s · Auftrag:
    Hook-Frage innerhalb der ersten drei Sekunden.
  - 18.2 Ortswechsel per Dip/Whip · Grab → Rückblende harter Schnitt (+ `swoosh`) · Auftrag „Harter Schnitt in die Vergangenheit“.
  - 18.7 Endkarte mit Frage/„Part 2?“ · Endkarte = vorgegebene Botschaft · Auftrag; „Part 2?“ wäre bei diesem Thema unangemessen.
  - [18.11] HUD-Änderung in 80 % statt 100 % der Beats · keine Wertänderung in `mom_react`, `drawing_down`, `msg1`, `msg2` ·
    stille Reaktions-/Erinnerungsmomente und Schwarzbild mit Endtext `FOREVER`; ein künstlicher Zählerschritt würde die
    Trauer-Momente stören. Regel ≥ 70 % erfüllt.
  - 1.4 Ausschlüsse (Marken) · Porsche 911 vom Auftrag verlangt · nur die Silhouette, kein Logo, kein Schriftzug; im Text
    wird die Marke nicht genannt. Friedhof ohne religiöse Symbole. Unfall ohne Blut/Verletzungen.
  - 15–18 Beats / 61–64 s · 20 Beats / 71 s · s. o.

## 2. Fakten und Quellen

| Aussage/Zahl | Quelle |
|---|---|
| Keine Faktenbehauptungen; alle Zahlen (41 Tage, Minuten, MPH, BPM) sind erzählerisch | – |

## 3. Assets und Lizenzen

| Asset | Herkunft | Lizenz | Nachweis |
|---|---|---|---|
| Figuren, Auto, Orte, Requisiten | Code im Kit (Three.js-Geometrie) | eigen | `pipeline/runtime/kit/` |
| Musik | `tools/music_synth.py` (numpy) | eigen | Plan in `timeline.json` |
| Soundeffekte/Betten | `tools/sfx_synth.py` (FFmpeg-Generatoren) | eigen | – |
| Schriften | Fraunces, Montserrat (@fontsource) | OFL | `node_modules/@fontsource` |

## 4. Render

- Vorschau-Runden (`tools/still.mjs`): 5 Runden, Korrekturen siehe 5.0.
- Befehl: `node pipeline/run.mjs --production productions/what-if-one-argument-last-goodbye`
- Render 1: Commit 4285f2d · Render 2 (ausgeliefert): Commit 78cca8f, nicht „dirty“ · ≈ 1,9 s/Frame · ≈ 68 min je Render.

## 5. QA-Durchläufe

### 5.0 Vorschau-Korrekturen vor dem Render

| Beat | Befund (Vorschau) | Korrektur |
|---|---|---|
| hook | Kamera zu nah, Kinderkopf füllt das Bild, Zeichnung nicht sichtbar | Abstand 1,75 → 2,6 m, Ziel tiefer |
| mom_react | Kamera steckte im Körper der Mutter | Mutter/Bruder 0,25 m weiter weg (gleich in allen Grab-Beats), Kamera über die Schulter des Jungen |
| kids_watch | Kinder verfehlt | Kamera höher/weiter, kleiner Bruder näher am Tisch |
| dad_slam, keys_pov | Mutter verdeckte die Kamera | Mutter an die Fensterseite, Kamera von −x |
| keys_pov | Kamera im Arm des Jungen | Junge unsichtbar, Zeichnung als Vordergrund-Objekt, Bild aufrecht |
| driveway | Auto frontal und bildfüllend | Dreiviertel-Ansicht, 8,2 m |
| accelerate | Rücklichtband in der Karosserie versteckt | Rücklicht/Warnblinker nach außen versetzt (Kit) |
| driver_close | A-Säule quer durchs Bild | Kamera gerade durch die Frontscheibe |
| impact | Laternenmast vor der Kamera, Auto bildfüllend | 11 m Abstand, anderer Winkel |
| approach/interior | Glas unsichtbar (Dach schwebte), Gesicht des Fahrers nicht sichtbar | Glas heller, B-Säule + Fensterlinie (Kit); Kopf zum Fenster, Fülllicht von außen, Kamera an der Fahrertür |
| drawing_down | Zeichnung klein/kopfüber | Kamera direkt darüber, Ausrichtung korrigiert |
| hug, grave_flowers | Grabstein verdeckte die untere Bildhälfte | Kamera höher |
| hug/msg | HUD zeigte 9.999 statt FOREVER | `final` im Beat-Sheet gesetzt |

### 5.1 Durchlauf 1 – 2026-11-01 (Commit 4285f2d)

- `video_qa.py`: FAIL. Angesehen: sheet_01–03, shots.jpg, alle 57 Streifen.

| Zeitpunkt | Befund | Einstufung | Korrektur |
|---|---|---|---|
| 62,4–66,3 s | erste Botschaft nur als kleine Zeile (Untertitel-Größe), 0,6 s spät; Schwarzbild-Meldung über 3,9 s | Fehler (Sicht) – Kernbotschaft zu schwach | Botschaft als große Textkarte im Bild (`textCard`, gleiche Schrift wie die Endkarte, „goodbye“ in Signalfarbe); Zeile entfernt, Text nach `text.en.json → scene.msg1` |
| 52,0–52,9 s | nur Erde im Bild, Zeichnung erscheint erst nach 0,8 s | Fehler (Sicht) | Ereignis `drawing_placed` auf 0,05 s |
| 36,5–37,6 s | Auto verlässt beim Schleudern das Bild (37 s leere Straße) | Fehler (Sicht) | Kamera weiter/höher (dist 19, height 16, Ziel z 118,5); Vorschau 34,8–37,5 s geprüft |
| 34,6 s | Einstellung < 4 Frames | beabsichtigt (Whip) – in Render 2 nicht mehr gemeldet | – |
| 38,6 / 62,333 s | Einstellung < 4 Frames | beabsichtigt (Aufprall-Blitz / Schnitt auf Schwarz) | – |

### 5.2 Durchlauf 2 – 2026-11-01 (Commit 78cca8f, nicht „dirty“)

- Datei `render/final.mp4`: 71,000 s · 1080×1920 · 30 fps CFR (2130 Frames) · H.264 + AAC 48 kHz · 39,7 MB
- Ton: −14,2 LUFS, TP −1,2 dBTP, LRA 20,2 LU; Ereignis-Klänge 42/50 erkannt, Versatz −15 … +50 ms
- `video_qa.py`: **FAIL** (Schwarzbild 62,4–62,8 / 65,97–66,27 s, Kurz-Einstellungen 38,6 / 62,333 s) – alle beabsichtigt bzw.
  Messartefakt, Einstufung in `quality_review.md`.
- Angesehen: sheet_01–03 (inkl. Ende), shots.jpg, **alle 56 Bildstreifen**.
- Bekannte Einschränkungen (nicht in einem dritten Render behoben): Zeichnung erscheint bei 52,1 s ohne sichtbare Hand; Kopfdrehung
  des Fahrers 33,6 s schnell; überstrahlter Fleck unten in der Fahrer-Nahaufnahme; Gesicht des bewusstlosen Vaters klein/dunkel;
  im Hook ragt der Arm der Mutter oben rechts ins Bild; Bruder in `kids_watch` am Bildrand; in `approach` ist der Fahrer nur als
  dunkle Silhouette zu sehen.
- Auslieferung: `render/final.mp4` und `quality_review.md` per `SendUserFile` als Anhang übergeben (Rückmeldung: „2 files delivered“,
  file_uuid 9a485655-6dea-48fb-afd6-fea77c82f15b / 68f057ac-5411-44c8-9f9f-f638f75c49cb).

## 6. Vergleich mit der Referenz (what-if-phone-battery-life, Guide 18.11)

| Merkmal | Referenz | Dieses Video | Bewertung |
|---|---|---|---|
| Takt | 17 Beats, Median 4,0 s | 20 Beats, Median 3,55 s | gleichwertig |
| Ereignis pro Beat | ja | ja (43 Ereignisse, 57 Klangeinsätze) | gleichwertig |
| Figurenreaktion | 11 Gefühle | 8 Gefühle + Tränen, Umarmungen, Kinderproportionen | gleichwertig |
| HUD-Dynamik | Änderung in 100 % der Beats | 80 % (stille Trauer-Beats ohne Zähler, begründet in 1.) | leicht darunter, begründet |
| Nachtszenen | zu dunkel (bekannte Schwäche) | Straße/Unfall lesbar | besser |
| Text im Blitz | Schwäche | HUD-Wert im Aufprall-Blitz, lesbar | gleichwertig |
| Lautheitsumfang | LRA 10,9 LU | LRA 20,2 LU (Drama: Stille/laute Fahrt) | Abweichung, Hörprüfung |
| Automatik-Status | REVIEW | FAIL (nur beabsichtigte Schwarzbilder/Blitz) | formal schwächer, inhaltlich vom Auftrag verlangt |

## 7. Status

**QUALITÄT GEPRÜFT (mit Einschränkungen) – nicht FREIGEGEBEN.** Hörprüfung durch den Nutzer ausstehend; dramaturgische Prüfung
ohne Echtzeit-Wiedergabe.

## 8. Einordnung zum Hook-Standard 18.12 (Nachtrag 2026-11-01, beim Zusammenführen mit dem Hook-Branch)

- **Produktionsstand:** Dieses Video wurde am 2026-11-01 vollständig nach dem damals gültigen Standard (Guide 18, ohne 18.12)
  produziert, gerendert, geprüft und ausgeliefert. Guide 18.12 entstand parallel im Branch `claude/hook-retention-standard` und
  lag bei Produktion und QA nicht vor.
- **Validator-Meldungen nach dem Zusammenführen – beabsichtigt, nicht behoben:**
  - Fehler `[18.12] hook fehlt in beats.json` – das Beat-Sheet hat keinen `hook`-Block und keine `premise`-Felder.
  - Warnung `[18.12]` zum fehlenden LOG-Abschnitt nach H10 – drei Einstiegs-Ansätze wurden nicht entworfen.
- **Begründung:** Der Einstieg (0–15 s: Grab, Zeichnung, Frage „Mommy… when will Daddy wake up?“, HUD `DAYS WITHOUT DADDY`,
  danach Rückblende Familienabend und Streit) war im Auftrag wörtlich vorgegeben (Abschnitt 1). Ein `hook`-Block im Nachhinein
  würde Prüfergebnisse vortäuschen, die nie erarbeitet wurden; ein neuer Einstieg verlangt ein neues Rendering und ist nicht
  beauftragt. Bild und Ton des ausgelieferten Videos bleiben unverändert.
- **Nicht geprüft:** Der Einstieg wurde **nicht** gegen 18.12 (Unmöglichkeitstest, sichtbare Prämissen-Konsequenzen bis 15 s,
  Füllstoff) bewertet. Ob er den Standard erfüllen würde, ist offen.
- **Folge:** Bei einer Überarbeitung oder einem Neu-Render zuerst den Einstieg nach 18.12 entwerfen (LOG-Abschnitt nach H10 mit
  drei Ansätzen, `hook`-Block, `premise` an den Ereignissen), dann neu rendern und QA inkl. Abschnitt H durchlaufen.
