# Video-Produktions-Checkliste (Stil B, Guide 18)

Für **jedes** Video abarbeiten. Regeln stehen in `WHATIF_STYLE_GUIDE.md` (Abschnittsnummern in Klammern; **18 hat Vorrang**).
Ein Punkt gilt erst als erledigt, wenn er im Produktionsprotokoll (`productions/<slug>/LOG.md`) bzw. in
`productions/<slug>/quality_review.md` mit Ergebnis vermerkt ist. Stil A (archiviert) nur bei ausdrücklichem Auftrag → `STYLE_A_EARTH.md`.

Ablage pro Video: `productions/<slug>/` mit `LOG.md`, `beats.json`, `timeline.json` (erzeugt), `text.en.json`, `scene.js`,
`quality_review.md`, `qa/`, `render/` (nicht versioniert).

## 1. Thema und Story

- [ ] Rezept B1 (Standard) bzw. B2 im LOG (17, 16)
- [ ] Frage „What if …?“, ≤ 10 Wörter (2)
- [ ] HUD-Messgröße mit Start → Ende, ändert sich in ≥ 70 % der Beats (18.5)
- [ ] Pointe festgelegt und früh vorbereitet (Aufbau → Auszahlung) (18.7)
- [ ] Hoffnung/Rückschlag-Wechsel geplant; Fakten mit Quelle im LOG (3.2)
- [ ] Themen-Ausschlüsse geprüft (keine realen Personen, Logos, Religion/Politik) (1.4)

## 2. Beat-Sheet (`beats.json`)

- [ ] 15–18 Beats, Länge ≥ 60 s (B1: 61–64 s); Beatlänge 1,8–6 s (18.2)
- [ ] Jeder Beat: Ort, Gefühl, Kamera-Vorlage, ≥ 1 Ereignis mit `what` (18.2–18.4)
- [ ] ≥ 5 Orte (B1), ≥ 4 Gefühle mit Entwicklung (18.4)
- [ ] Kamera: nie zweimal gleich hintereinander, ≥ 4 Bildgrößen, ≥ 1 Reaktions-Nahaufnahme, ≥ 1 Totale/Aufsicht (18.3)
- [ ] Klang auf jedem Schlüsselereignis (Auslöser, Akzente, Pointe), sonst sparsam; Musikplan mit Ruhe vor der Pointe (18.6)
- [ ] Texte nur in `text.en.json`: Titel, HUD-Labels, 12–24 Zeilen à 3–10 Wörter, Endkarte (4)
- [ ] `node tools/build_timeline.mjs productions/<slug>` + `node tools/validate_production.mjs productions/<slug>` → **OK**

## 3. Szene und Vorschau

- [ ] `scene.js` nur mit Kit; Zeiten nur über `kit.beatClock`, Positionen aus `beats[].data`, Bewegung über `act()` (18.1, 18.4)
- [ ] Lichtstimmung je Ort (`applyLook`) (18.4)
- [ ] Neue Teile im Kit ergänzt und im LOG genannt
- [ ] `tools/still.mjs` für jeden Beat angesehen: Figur im Bild, Gesicht lesbar, Kamera frei, Texte frei (18.3)

## 4. Rendern

- [ ] Vor dem Rendern committet; `node pipeline/run.mjs --production productions/<slug>`; Befehl + Commit im LOG
- [ ] Während des Renderns keine Dateien unter `pipeline/` oder der Produktion geändert

## 5. Qualitätskontrolle (`templates/quality_review.md`)

- [ ] **A technisch:** `qa/report.md`: Status, Format, Frames, Lautheit, **Synchronität der Ereignis-Klänge**, Monotonie-Kandidaten, jede REVIEW-Meldung eingestuft (11.1, 18.8)
- [ ] **B visuell:** **alle** `qa/sheet_*.jpg` inkl. Ende, `qa/shots.jpg`, **alle** `qa/strips/*` angesehen (11.2)
- [ ] **C dramaturgisch:** Einstieg, Entwicklung, Abwechslung, Eskalation, Pointe/Ende; Vergleich mit R07/R19/R20 (18.7)
- [ ] **D Hörprüfung** beim Nutzer angefragt (11.3)

## 6. Fehler beheben, erneut rendern

- [ ] Je Fehler: Zeitpunkt, Ursache, Korrektur an der Ursache (Beat-Sheet/Szene/Kit) (12)
- [ ] Neu gerendert, Abschnitt 5 vollständig wiederholt

## 7. Auslieferung und Abschluss

- [ ] Tatsächliche MP4 ermittelt (`ls -la`, `ffprobe`)
- [ ] Mit dem Sende-Werkzeug als Anhang übergeben, Erfolg geprüft (Pfad allein reicht nicht)
- [ ] Status: `TECHNISCH GEPRÜFT` / `QUALITÄT GEPRÜFT` / `FREIGEGEBEN` (nur mit bestätigter Hörprüfung) (18.8)
- [ ] LOG vollständig (Entscheidungen, Abweichungen, Quellen, Lizenzen, QA-Durchläufe, Einschränkungen); Commit ohne Render-Ausgaben
