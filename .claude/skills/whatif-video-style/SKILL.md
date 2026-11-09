---
name: whatif-video-style
description: Arbeitsablauf für What-if-Kurzvideos im Repository whatif-video-system (Stil B, stumm) – vom Thema über Story, Beat-Sheet (beats.json), Baukasten-Szene, Sound-Ereignisse, Vorschau, Render und dreistufige QA (technisch, visuell, dramaturgisch) bis zur Auslieferung der MP4 als Anhang. Verwenden bei jeder Planung, Produktion, Überarbeitung oder Prüfung eines Videos dieses Projekts sowie bei Fragen zu seinem Stil. Inhaltliche Quelle der Wahrheit ist WHATIF_STYLE_GUIDE.md, Abschnitt 18.
---

# What-if-Video – Arbeitsablauf (Stil B, eingefroren)

Dieser Skill beschreibt **wie** gearbeitet wird. **Was** gilt, steht in `WHATIF_STYLE_GUIDE.md` – **Abschnitt 18 hat Vorrang**.
Regeln nicht aus dem Gedächtnis anwenden, sondern nachlesen. Die Architektur ist eingefroren (Guide 18.10): kein Umbau, keine
erneute Repository-Analyse pro Video. Neue Kit-Teile sind erlaubt, wenn ein Thema sie braucht.

## Wann verwenden

- „Mach ein Video über …“, „Was wäre, wenn …“ / „What if …“, ein bloßes Thema → komplette Produktion (Stil B, Rezept B1, **Deutsch**).
- Überarbeitung/Neu-Render/Prüfung eines vorhandenen Videos; Fragen zu Format und Stil.
- Nicht für andere Projekte; der globale Skill `whatif-3d-style` gilt hier nicht.
- Stil A (Sprecher) nur bei wörtlichem `PRODUKTIONSSTIL: A (Earth)` → dann `STYLE_A_EARTH.md`; sonst nie.

## Schritt 0 – Laden (kurz)

1. Guide Abschnitt 18 lesen, **18.14 Sprache Deutsch** inklusive (dazu bei Bedarf 16.1/16.2 Rezept, 2 Hook, 4 Text, 9 Ton).
   Videosprache ist **Deutsch** (Standard); Englisch nur auf ausdrücklichen Auftrag – dann `text.en.json` und überall `--lang en`.
2. `VIDEO_PRODUCTION_CHECKLIST.md` öffnen. Vorlagen: `templates/beats.json`, `templates/text.de.json`, `templates/production_log.md`, `templates/quality_review.md`.
3. **Kreative Referenzen** (Guide 18.11): vorrangig C1 `Viral_referenz_1.mp4.MP4`, C2 `Viral_referenz_2.mp4.MP4` (viral) und
   B1 `Referenz__neuer_stil_1m_views.MP4` (neuer Stil), ergänzend B2 `Referenz_alter_stil.MP4` (= R07). Die Videos liegen nicht im
   Repository – Maßstab über `VIDEO_ANALYSIS_6_VIDEOS.md` (Abschnitt 4–7) und `VIDEO_COMPARISON_6_VIDEOS.md`. Format-Vorlagen:
   `templates/`, `productions/_kit_demo_v3/`. **`productions/what-if-phone-battery-life/` ist veraltet** – nur technischer
   Regressionstest, nicht als Muster für Beat-Sheet, Szene, Einstieg oder Erzählung nachschlagen.
4. Werkzeuge: `node --version`, `ffmpeg -version`, `ls node_modules/three` (sonst `npm install`).

## Schritt 1 – Thema → Story

- Frage „Was wäre, wenn …?“, ≤ 10 Wörter (empfohlen ≤ 8), Du-Form, natürliches modernes Deutsch – nie wörtlich aus dem Englischen übersetzen (Guide 18.14). HUD-Messgröße mit Start/Ende, die sich in **jedem** Beat ändern kann.
- Pointe zuerst festlegen und **früh vorbereiten** (Aufbau → Auszahlung). Wechsel aus Hoffnung und Rückschlag planen.
- **Hook entwickeln (Guide 18.12, Pflicht):** drei Einstiege verschiedener Typen (`proof`, `process`, `countdown`, `mystery`) oder
  Bildideen skizzieren – je Frame 0, Beweis-Ereignis, Frage bei 3 s, was zurückgehalten wird – und mit dem **Unmöglichkeitstest**
  bewerten („Sähe dieses Bild ohne die Prämisse genauso aus?“). Den Typ wählen, der zum Thema passt, nicht den vom letzten Video.
  Kein Aufwachen/Ankommen/Alltag als Einstieg; Alltag ist Schauplatz, nicht Ereignis. Bis 15 s nur Prämissen-Konsequenzen,
  jede größer/näher/persönlicher. Entwurf + Wahl ins LOG – alle drei Ansätze auf Deutsch formuliert.
- **Story-Kern (Guide 18.13 A, Pflicht nach dem Hook-Entwurf):** ein Einsatz (`story.stake`), eine Messgröße (`story.measure`),
  Wende (`story.turn`); jeder Beat verändert den Einsatz und trägt zur Titelfrage bei. Ursachen der Pointe sichtbar
  (`events[].setup_for`, ohne Text lesbar). Je Akt ein geprüfter Wissensanker (`beats[].fact`) und ein Schauwert-Bild
  (`beats[].showpiece`). Erzählform wählen (B1/B2 oder B3–B6, Guide 18.13 F) und im LOG begründen. Hook-Entwurf prüft immer
  auch eine **Ich-Variante** (`kit.firstPerson`).
- 15–18 Beats à 2–4,5 s, ≥ 5 Orte, ≥ 4 Gefühle der Hauptfigur mit Entwicklung. Zahlen mit Quelle im LOG.
- `productions/<slug>/` anlegen, `templates/production_log.md` → `LOG.md`.

## Schritt 2 – Beat-Sheet

- `templates/beats.json` → `productions/<slug>/beats.json`. Pro Beat: `place`, `mood`, `camera` (Vorlage aus `kit/camera.js`),
  `events` (jedes mit `what`, Schlüsselereignisse mit `sfx`, HUD-Sprung `hud_to`/Akzent `flash`), `hud`, `line`, `ambience`, `data` (Positionen).
- Texte nur in `text.de.json` (Vorlage `templates/text.de.json`: Titel, HUD-Labels, Zeilen, Endkarte „Teil 2?“; `number_locale: "de-DE"`,
  HUD-Versalien mit SS statt ß, „ “, SI-Einheiten – Guide 18.14 D1–D11).
- `node tools/build_timeline.mjs productions/<slug>` → `node tools/validate_production.mjs productions/<slug>` muss **OK** melden
  (Standard-B-Regeln: Kamera-Abwechslung, Ereignis pro Beat, HUD-Dynamik, Gefühle, Orte, Ton-Synchronität; Hook `[18.12]`:
  `hook`-Block, Ereignisse mit `premise: "visible"|"hud"` markieren).
- Warnungen `[18.11]` (unter technischem Mindestwert – kein Qualitätsziel) beheben – Beat-Sheet anreichern – oder im LOG begründen. Ohne `beats.json` lehnt
  der Validator eine Stil-B-Produktion ab.

## Schritt 3 – Szene

- `scene.js` nur mit dem Kit: `kit.human().act(spur, t)`, `kit.beatClock(timeline)` für alle Zeiten, `beats[].data` für Positionen,
  `kit.applyLook()` je Beat, `kit.fx`, `props`, `places`. Keine Zeitkonstanten, keine harten Posenwechsel.
- **Licht & Atmosphäre (18.13 D):** je Akt eine Grundstimmung + ein Akzent (`kit.atmo.palette`), sichtbare Lichtquellen
  (`atmo.lampPool/stringLights/neonStrip/spotCone/glowSign`), Dunst/Kulisse (`haze`, `goldenHour`, `backlight`, `masses.skyline`),
  Struktur-Böden (`atmo.ground`), `bloom`/`grade` über `fx`. **Sättigung nicht erhöhen.** Massen über `kit.masses`,
  Ich-Perspektive über `kit.firstPerson({ camera, scene })`. Vorlage: `productions/_kit_demo_v3/scene.js`.
- **Bildtexte im Szenencode auf Deutsch** setzen (Handy `time/date/name/messages/notify`, Chat, `atmo.glowSign({ text })`, Zettel) –
  die Kit-Vorgaben sind englisch (`'Monday'`, `'OPEN'`) und bleiben wegen alter Szenen so (Guide 18.14 D11).
- Fehlende Teile im Kit ergänzen (Schnittstellen nicht ändern) und im LOG nennen.
- **Bildsprache V4 (Guide 18.15, Erprobung):** `"post": { "v4": true }` in `beats.json` schaltet Umriss-Linien, kühle Schatten,
  Himmelsverlauf, Grade, Hintergrund-Unschärfe, Texturen und Figuren-Timing ein – ohne Szenenänderung. Je Beat über `fx`
  nachsteuern (`fx.dof = kit.look4.focus([x,y,z])`, `fx.dof = false` bei Info im Hintergrund). Fertige Modelle nur über
  `kit.models` mit Lizenz. Bis zur Abnahme durch den Nutzer nur auf Auftrag einschalten.

## Schritt 4 – Vorschau (Pflicht vor dem Rendern)

- `node tools/still.mjs --production productions/<slug> --at <Mitte jedes Beats + Ereigniszeiten>` und `stills/contact.jpg` ansehen.
- Prüfen: Figur im Bild (9:16 = schmaler Bildwinkel), Gesicht lesbar, Kamera nicht in Wänden/Figuren, Licht je Ort, HUD/Texte frei;
  deutsche Zeilen höchstens 2 Bildschirmzeilen, Umlaute/„ “ in der Hausschrift (QA C13).
- **Ursachen-Vorschau ohne Text:** jedes `setup_for`-Ereignis einzeln ansehen (QA C10) – unverständlich → Nahaufnahme/Reaktion ergänzen.
- **Hook-Vorschau** `--at 0,0.5,1,2,3,5,8,12,15` und `quality_review.md` Abschnitt H vor dem Rendern ausfüllen; ein Nein bei H1–H3 → Einstieg neu.
- Korrigieren in `beats.json` (Kamera/Positionen) bzw. `scene.js`, neu bauen, erneut Vorschau – bis alle Beats stimmen.
- **V4:** `WARNUNG Verdeckung` aus `still.mjs` beheben (Kamera/Position oder `"occlusion": "hide"`); Bildsprache messen:
  `python3 tools/look_metrics.py --base 'alt/*.png' --ours '<slug>/stills/*.png'` (Buntheit darf nicht steigen).

## Schritt 5 – Rendern

- Vor dem Rendern committen (sonst meldet `run_log.json` „dirty“). Dann `node pipeline/run.mjs --production productions/<slug>`
  (Hintergrund; ≈ 0,5–1,2 s pro Frame). Während des Renderns keine Dateien unter `pipeline/` oder der Produktion ändern
  (Fingerabdruck → Teilstücke werden verworfen).

## Schritt 6 – Qualitätskontrolle (drei Stufen, vollständig)

1. **Technisch:** `qa/report.md` lesen (Status, Synchronität der Ereignis-Klänge, Monotonie-Kandidaten, alle Meldungen);
   zusätzlich `python3 tools/balance_qa.py productions/<slug>/render/final.mp4 --out productions/<slug>/qa/balance.json` (informativ, 18.13 L8).
2. **Visuell:** **jeden** `qa/sheet_*.jpg` (inkl. Ende), `qa/shots.jpg`, **jeden** Streifen in `qa/strips/` ansehen; jede REVIEW-Meldung
   als „beabsichtigt“ (Grund) oder „Fehler“ einstufen.
3. **Dramaturgisch:** Ablauf gegen Beat-Sheet prüfen (Einstieg, Entwicklung, Eskalation, Pointe, Ende); **Hook** nach Abschnitt H.
- `productions/<slug>/quality_review.md` (legt `run.mjs` aus der Vorlage an) ausfüllen; nur Gesehenes als OK eintragen.
- Vergleich mit den kreativen Referenzen C1/C2/B1/B2 (QA C): Was ist gleichwertig, was schwächer?
- Bekannte Schwächen der alten Akku-Produktion vermeiden (Guide 18.11 Stufe 4): zu dunkle Nachtszenen, Anschlussfehler über Schnitte, Text im Blitz, leere, flach beleuchtete Welten.
- Hörprüfung kann Claude nicht leisten → ausdrücklich beim Nutzer anfragen. Ebenso die **Sprachabnahme** (muttersprachliches Gegenlesen, Guide 18.14 D12).

## Schritt 7 – Fehler beheben

- Ursache beheben (Beat-Sheet, Szene, Kit), neu bauen, neu rendern, Schritt 6 komplett wiederholen.

## Schritt 8 – Auslieferung und Abschluss

1. Tatsächliche Datei ermitteln (`ls -la productions/<slug>/render/final.mp4`, `ffprobe`).
2. Sende-Werkzeug prüfen (z. B. `SendUserFile`) und die MP4 **als Anhang** übergeben; Ergebnis der Übergabe prüfen und melden.
   Ein Pfad allein ist keine Auslieferung; bei Fehlschlag Fehler dokumentieren.
3. LOG + quality_review vervollständigen; Status nach Guide 18.8. Commit nur Projektdateien (MP4/JPG/PNG sind ausgeschlossen).
4. Abschlussbericht: Datei, Status, was geprüft wurde und was nicht, offene Punkte, Bitte um Hörprüfung und Sprachabnahme.
