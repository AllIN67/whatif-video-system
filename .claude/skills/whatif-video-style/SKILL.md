---
name: whatif-video-style
description: Arbeitsablauf für What-if-Kurzvideos im Repository whatif-video-system (Stil B, stumm) – vom Thema über Story, Beat-Sheet (beats.json), Baukasten-Szene, Sound-Ereignisse, Vorschau, Render und dreistufige QA (technisch, visuell, dramaturgisch) bis zur Auslieferung der MP4 als Anhang. Verwenden bei jeder Planung, Produktion, Überarbeitung oder Prüfung eines Videos dieses Projekts sowie bei Fragen zu seinem Stil. Inhaltliche Quelle der Wahrheit ist WHATIF_STYLE_GUIDE.md, Abschnitt 18.
---

# What-if-Video – Arbeitsablauf (Stil B, eingefroren)

Dieser Skill beschreibt **wie** gearbeitet wird. **Was** gilt, steht in `WHATIF_STYLE_GUIDE.md` – **Abschnitt 18 hat Vorrang**.
Regeln nicht aus dem Gedächtnis anwenden, sondern nachlesen. Die Architektur ist eingefroren (Guide 18.10): kein Umbau, keine
erneute Repository-Analyse pro Video. Neue Kit-Teile sind erlaubt, wenn ein Thema sie braucht.

## Wann verwenden

- „Mach ein Video über …“, „What if …“, ein bloßes Thema → komplette Produktion (Stil B, Rezept B1).
- Überarbeitung/Neu-Render/Prüfung eines vorhandenen Videos; Fragen zu Format und Stil.
- Nicht für andere Projekte; der globale Skill `whatif-3d-style` gilt hier nicht.
- Stil A (Sprecher) nur bei wörtlichem `PRODUKTIONSSTIL: A (Earth)` → dann `STYLE_A_EARTH.md`; sonst nie.

## Schritt 0 – Laden (kurz)

1. Guide Abschnitt 18 lesen (dazu bei Bedarf 16.1/16.2 Rezept, 2 Hook, 4 Text, 9 Ton).
2. `VIDEO_PRODUCTION_CHECKLIST.md` öffnen. Vorlagen: `templates/beats.json`, `templates/production_log.md`, `templates/quality_review.md`.
3. Beispielproduktion zum Nachschlagen: `productions/what-if-phone-battery-life/` (beats.json + scene.js).
4. Werkzeuge: `node --version`, `ffmpeg -version`, `ls node_modules/three` (sonst `npm install`).

## Schritt 1 – Thema → Story

- Frage ≤ 10 Wörter, zweite Person. HUD-Messgröße mit Start/Ende, die sich in **jedem** Beat ändern kann.
- Pointe zuerst festlegen und **früh vorbereiten** (Aufbau → Auszahlung). Wechsel aus Hoffnung und Rückschlag planen.
- 15–18 Beats à 2–4,5 s, ≥ 5 Orte, ≥ 4 Gefühle der Hauptfigur mit Entwicklung. Zahlen mit Quelle im LOG.
- `productions/<slug>/` anlegen, `templates/production_log.md` → `LOG.md`.

## Schritt 2 – Beat-Sheet

- `templates/beats.json` → `productions/<slug>/beats.json`. Pro Beat: `place`, `mood`, `camera` (Vorlage aus `kit/camera.js`),
  `events` (jedes mit `what`, Schlüsselereignisse mit `sfx`, HUD-Sprung `hud_to`/Akzent `flash`), `hud`, `line`, `ambience`, `data` (Positionen).
- Texte nur in `text.en.json` (Titel, HUD-Labels, Zeilen, Endkarte).
- `node tools/build_timeline.mjs productions/<slug>` → `node tools/validate_production.mjs productions/<slug>` muss **OK** melden
  (Standard-B-Regeln: Kamera-Abwechslung, Ereignis pro Beat, HUD-Dynamik, Gefühle, Orte, Ton-Synchronität).

## Schritt 3 – Szene

- `scene.js` nur mit dem Kit: `kit.human().act(spur, t)`, `kit.beatClock(timeline)` für alle Zeiten, `beats[].data` für Positionen,
  `kit.applyLook()` je Beat, `kit.fx`, `props`, `places`. Keine Zeitkonstanten, keine harten Posenwechsel.
- Fehlende Teile im Kit ergänzen (Schnittstellen nicht ändern) und im LOG nennen.

## Schritt 4 – Vorschau (Pflicht vor dem Rendern)

- `node tools/still.mjs --production productions/<slug> --at <Mitte jedes Beats + Ereigniszeiten>` und `stills/contact.jpg` ansehen.
- Prüfen: Figur im Bild (9:16 = schmaler Bildwinkel), Gesicht lesbar, Kamera nicht in Wänden/Figuren, Licht je Ort, HUD/Texte frei.
- Korrigieren in `beats.json` (Kamera/Positionen) bzw. `scene.js`, neu bauen, erneut Vorschau – bis alle Beats stimmen.

## Schritt 5 – Rendern

- Vor dem Rendern committen (sonst meldet `run_log.json` „dirty“). Dann `node pipeline/run.mjs --production productions/<slug>`
  (Hintergrund; ≈ 0,5–1,2 s pro Frame). Während des Renderns keine Dateien unter `pipeline/` oder der Produktion ändern
  (Fingerabdruck → Teilstücke werden verworfen).

## Schritt 6 – Qualitätskontrolle (drei Stufen, vollständig)

1. **Technisch:** `qa/report.md` lesen (Status, Synchronität der Ereignis-Klänge, Monotonie-Kandidaten, alle Meldungen).
2. **Visuell:** **jeden** `qa/sheet_*.jpg` (inkl. Ende), `qa/shots.jpg`, **jeden** Streifen in `qa/strips/` ansehen; jede REVIEW-Meldung
   als „beabsichtigt“ (Grund) oder „Fehler“ einstufen.
3. **Dramaturgisch:** Ablauf gegen Beat-Sheet prüfen (Einstieg, Entwicklung, Eskalation, Pointe, Ende).
- `templates/quality_review.md` → `productions/<slug>/quality_review.md` ausfüllen; nur Gesehenes als OK eintragen.
- Hörprüfung kann Claude nicht leisten → ausdrücklich beim Nutzer anfragen.

## Schritt 7 – Fehler beheben

- Ursache beheben (Beat-Sheet, Szene, Kit), neu bauen, neu rendern, Schritt 6 komplett wiederholen.

## Schritt 8 – Auslieferung und Abschluss

1. Tatsächliche Datei ermitteln (`ls -la productions/<slug>/render/final.mp4`, `ffprobe`).
2. Sende-Werkzeug prüfen (z. B. `SendUserFile`) und die MP4 **als Anhang** übergeben; Ergebnis der Übergabe prüfen und melden.
   Ein Pfad allein ist keine Auslieferung; bei Fehlschlag Fehler dokumentieren.
3. LOG + quality_review vervollständigen; Status nach Guide 18.8. Commit nur Projektdateien (MP4/JPG/PNG sind ausgeschlossen).
4. Abschlussbericht: Datei, Status, was geprüft wurde und was nicht, offene Punkte, Bitte um Hörprüfung.
