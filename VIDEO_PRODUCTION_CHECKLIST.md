# Video-Produktions-Checkliste (Stil B, Guide 18)

Für **jedes** Video abarbeiten. Regeln stehen in `WHATIF_STYLE_GUIDE.md` (Abschnittsnummern in Klammern; **18 hat Vorrang**).
Ein Punkt gilt erst als erledigt, wenn er im Produktionsprotokoll (`productions/<slug>/LOG.md`) bzw. in
`productions/<slug>/quality_review.md` mit Ergebnis vermerkt ist. Stil A (archiviert) nur bei ausdrücklichem Auftrag → `STYLE_A_EARTH.md`.

Ablage pro Video: `productions/<slug>/` mit `LOG.md`, `beats.json`, `timeline.json` (erzeugt), `text.de.json` (Sprache Deutsch, Guide 18.14), `scene.js`,
`quality_review.md`, `qa/`, `render/` (nicht versioniert).

## 1. Thema und Story

- [ ] Rezept B1 (Standard) bzw. B2 im LOG (17, 16)
- [ ] Frage „Was wäre, wenn …?“, ≤ 10 Wörter, empfohlen ≤ 8; Du-Form, natürliches Deutsch, nicht übersetzt (2, 18.14 D1–D3)
- [ ] HUD-Messgröße mit Start → Ende, ändert sich in ≥ 70 % der Beats (18.5)
- [ ] Pointe festgelegt und früh vorbereitet (Aufbau → Auszahlung) (18.7)
- [ ] **Hook-Entwurf (auf Deutsch):** 3 Einstiege verschiedener Typen/Bildideen skizziert, gegen 18.12 bewertet, Wahl begründet; Hook-Typ der letzten 3 Produktionen verglichen (18.12 H10)
- [ ] **Unmöglichkeitstest:** Beweis-Ereignis zeigt die Prämisse im Bild (≤ 2 s bzw. Geheimnis/Countdown ab Frame 0); kein Aufwach-/Alltagseinstieg (18.12 H1–H3)
- [ ] Hoffnung/Rückschlag-Wechsel geplant; Fakten mit Quelle im LOG (3.2)
- [ ] **Story-Kern:** `story.stake`, `story.measure`, `story.question`, `story.turn`; Prämisse bleibt bis zum Ende; Erzählform (B1–B6) im LOG (18.13 A/F)
- [ ] **Ursachen:** jedes Ereignis, auf das sich Wende/Pointe beziehen, mit `setup_for` + `premise: "visible"`, ≥ 3 s vor der Pointe (18.13 S3)
- [ ] **Akte:** `beats[].act`; je Akt `fact { text, source }` und ein `showpiece` (mass | vista | glow) (18.13 S4, C)
- [ ] Hook-Entwurf enthält eine **Ich-Variante** (`kit.firstPerson`) (18.13 B)
- [ ] Themen-Ausschlüsse geprüft (keine realen Personen, Logos, Religion/Politik) (1.4)

## 2. Beat-Sheet (`beats.json`)

- [ ] 15–18 Beats, Länge ≥ 60 s (B1: 61–64 s); Beatlänge 1,8–6 s (18.2)
- [ ] Jeder Beat: Ort, Gefühl, Kamera-Vorlage, ≥ 1 Ereignis mit `what` (18.2–18.4)
- [ ] ≥ 5 Orte (B1), ≥ 4 Gefühle mit Entwicklung (18.4)
- [ ] Kamera: nie zweimal gleich hintereinander, ≥ 4 Bildgrößen, ≥ 1 Reaktions-Nahaufnahme, ≥ 1 Totale/Aufsicht (18.3)
- [ ] Klang auf jedem Schlüsselereignis (Auslöser, Akzente, Pointe), sonst sparsam; Musikplan mit Ruhe vor der Pointe (18.6)
- [ ] Texte nur in `text.de.json` (Vorlage `templates/text.de.json`): Titel, HUD-Labels, 12–24 Zeilen à 3–10 Wörter, Endkarte (4)
- [ ] Deutsch nach 18.14: `number_locale: "de-DE"`, SI-Einheiten, „ “ und –, HUD-Versalien mit SS statt ß, keine wörtliche Übersetzung; keine Fehler/Warnungen `[18.14]`
- [ ] `node tools/build_timeline.mjs productions/<slug>` + `node tools/validate_production.mjs productions/<slug>` → **OK**
- [ ] `hook`-Block vollständig; Prämissen-Ereignisse mit `premise` markiert (bis 15 s ≥ 3, ≥ 2 `visible`); keine Fehler `[18.12]`, Warnungen behoben oder begründet (18.12)
- [ ] Keine Warnung `[18.11]` (technische Mindestwerte, kein Qualitätsziel) – oder Begründung im LOG (18.11)
- [ ] Keine Warnung `[18.13]` – oder Begründung im LOG (18.13)

## 3. Szene und Vorschau

- [ ] `scene.js` nur mit Kit; Zeiten nur über `kit.beatClock`, Positionen aus `beats[].data`, Bewegung über `act()` (18.1, 18.4)
- [ ] Lichtstimmung je Ort (`applyLook`) (18.4)
- [ ] **Licht & Farbe:** je Akt eine Grundstimmung + ein Akzent; sichtbare Lichtquellen in Nacht/Innen; Dunst/Kulisse außen; Struktur-Böden; `bloom`/`grade` bewusst gesetzt; Sättigung nicht erhöht (18.13 D)
- [ ] Musik: Ruhe (`silence`/`calm`) 3 s vor bis 0,5 s nach der Pointe; Abschnitte an Wende/Höhepunkt (18.13 E)
- [ ] Bildtexte im Szenencode (Handy, Chat, Schilder, `glowSign`) ausdrücklich auf Deutsch; bewusst englische Schilder im LOG (18.14 D11)
- [ ] Neue Teile im Kit ergänzt und im LOG genannt
- [ ] `tools/still.mjs` für jeden Beat angesehen: Figur im Bild, Gesicht lesbar, Kamera frei, Texte frei; deutsche Zeilen ≤ 2 Bildschirmzeilen (18.3, 18.14 D4)
- [ ] **Hook-Vorschau** 0 / 0,5 / 1 / 2 / 3 / 5 / 8 / 12 / 15 s: `quality_review.md` Abschnitt H (H1–H6) **vor dem Rendern** ausgefüllt; jede `visible`-Konsequenz ist im 9:16-Bild groß genug zu sehen (18.12)

## 4. Rendern

- [ ] Vor dem Rendern committet; `node pipeline/run.mjs --production productions/<slug>`; Befehl + Commit im LOG
- [ ] Während des Renderns keine Dateien unter `pipeline/` oder der Produktion geändert

## 5. Qualitätskontrolle (`templates/quality_review.md`)

- [ ] **A technisch:** `qa/report.md`: Status, Format, Frames, Lautheit, **Synchronität der Ereignis-Klänge**, Monotonie-Kandidaten, jede REVIEW-Meldung eingestuft (11.1, 18.8)
- [ ] **B visuell:** **alle** `qa/sheet_*.jpg` inkl. Ende, `qa/shots.jpg`, **alle** `qa/strips/*` angesehen (11.2)
- [ ] `tools/balance_qa.py` → `qa/balance.json` gesichtet (Farbhierarchie, Bandanteile, Stille) und in die Hörprüfung mitgegeben (18.13 L8)
- [ ] **H Hook:** Abschnitt H am fertigen Video wiederholt (18.12)
- [ ] **C dramaturgisch:** Einstieg, Entwicklung, Abwechslung, Eskalation, Pointe/Ende; Vergleich mit den kreativen Referenzen C1/C2/B1/B2 (18.11)
- [ ] **C13 Sprache** geprüft; **Sprachabnahme** (muttersprachliches Gegenlesen) beim Nutzer angefragt (18.14 D12)
- [ ] **D Hörprüfung** beim Nutzer angefragt (11.3)

## 6. Fehler beheben, erneut rendern

- [ ] Je Fehler: Zeitpunkt, Ursache, Korrektur an der Ursache (Beat-Sheet/Szene/Kit) (12)
- [ ] Neu gerendert, Abschnitt 5 vollständig wiederholt

## 7. Auslieferung und Abschluss

- [ ] Tatsächliche MP4 ermittelt (`ls -la`, `ffprobe`)
- [ ] Mit dem Sende-Werkzeug als Anhang übergeben, Erfolg geprüft (Pfad allein reicht nicht)
- [ ] Status: `TECHNISCH GEPRÜFT` / `QUALITÄT GEPRÜFT` / `FREIGEGEBEN` (nur mit bestätigter Hörprüfung) (18.8)
- [ ] LOG vollständig (Entscheidungen, Abweichungen, Quellen, Lizenzen, QA-Durchläufe, Einschränkungen); Commit ohne Render-Ausgaben
