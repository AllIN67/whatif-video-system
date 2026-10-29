---
name: whatif-video-style
description: Arbeitsablauf für What-if-Kurzvideos im Repository whatif-video-system – von der What-if-Frage über Dramaturgie, Szenenplan, Kamera, Text-HUD und Sound bis zu Render, vollständiger QA (video_qa.py, Sichtprüfung, Hörprüfung) und Produktionsprotokoll. Verwenden bei jeder Planung, Produktion, Überarbeitung oder Prüfung eines Videos dieses Projekts sowie bei Fragen zu seinem Stil. Inhaltliche Quelle der Wahrheit ist WHATIF_STYLE_GUIDE.md.
---

# What-if-Video – Arbeitsablauf

Dieser Skill beschreibt **wie** gearbeitet wird. **Was** gilt (Regeln, Maße, Grenzwerte), steht ausschließlich in `WHATIF_STYLE_GUIDE.md` im Repository-Root. Regeln hier nicht duplizieren oder aus dem Gedächtnis anwenden – immer im Guide nachlesen.

## Wann verwenden

- Neues Video planen oder produzieren („mach ein Video über …“, „What if …“).
- Bestehendes Video überarbeiten, neu rendern oder prüfen.
- Fragen zu Format, Stil, Sprache, QA dieses Projekts.

Nicht verwenden für andere Projekte. Insbesondere gilt in diesem Repository **nicht** der ältere Skill `whatif-3d-style` (anderes Projekt, andere Regeln), falls er in der Umgebung sichtbar ist.

**Keine Videoproduktion ohne ausdrücklichen Auftrag des Nutzers.** Analyse- und Planungsfragen beantworten ist erlaubt; Rendern erst nach Auftrag.

## Schritt 0 – Laden

1. `WHATIF_STYLE_GUIDE.md` vollständig lesen, **zuerst Abschnitt 16 (Erfolgsrezepte)**. Jedes Video folgt Rezept A oder B; im LOG festhalten, welches.
2. `VIDEO_PRODUCTION_CHECKLIST.md` lesen – sie ist die Abhakliste für diesen Ablauf.
3. Bei Stil- oder Begründungsfragen: `REFERENCE_ANALYSIS.md` und `references/analysis/MEASUREMENTS.md`.
4. Bei Überarbeitung: vorhandenes `productions/<slug>/LOG.md` lesen.
5. Werkzeuge prüfen: `ffmpeg -version`, `python3 --version`, `node --version`; fehlende Werkzeuge melden statt still zu ersetzen.

## Schritt 1 – Szenario analysieren

- Frage nach Guide 1.4 und 2 formulieren (≤ 10 Wörter). Bei Themen außerhalb des Themenpools (Guide 1.4) beim Nutzer nachfragen.
- HUD-Messgröße mit Start- und Endzustand festlegen; prüfen, ob sie sich ab Sekunde 0 sichtbar verändert.
- 8–12 mögliche Konsequenzen sammeln, Fakten recherchieren, **jede Zahl mit Quelle** notieren. Unsichere Fakten als unsicher kennzeichnen, nicht erfinden.
- Pointe/Wendung zuerst festlegen, dann rückwärts eskalieren.
- Slug wählen, `productions/<slug>/` anlegen, `templates/production_log.md` → `LOG.md` kopieren.

## Schritt 2 – Dramaturgie und Szenenplan

- Akte A–E nach Guide 3.1 auf die Ziellänge verteilen.
- `templates/scene_plan.md` → `productions/<slug>/scene_plan.md` ausfüllen: jede Zeile mit Zeit, Bild, Kamera, HUD, Text-ID, Ton, Übergang, Effektfunktion.
- Alle Bildschirmtexte nur in `productions/<slug>/text.en.json` (Sprachunabhängigkeit, Guide 1.3).
- Prüfungen aus dem Szenenplan-Template abhaken (Ereignis ≤ 10 s, Zustandsänderung ≤ 6 s, Ende ≤ 5 s nach Pointe, Blitzregel).
- Szenenplan dem Nutzer kurz vorstellen, wenn der Auftrag nicht ausdrücklich „direkt durchproduzieren“ lautet.

## Schritt 3 – Kamera, Bild, Effekte, Sound planen

- Ein Kamera-Paradigma P1–P4 wählen (Guide 5.1) und im LOG begründen.
- Licht-/Farbverlauf als Dramaturgie festlegen (Guide 6.2); Erkennungsmerkmale (Guide 6.4) übernehmen.
- Pro Effekt die Erzählfunktion eintragen (Guide 8).
- Tonplan: Lautheitsverlauf, Akzente, bewusste Stille, Musikquelle **mit Lizenz** (Guide 9). Ohne lizenzierte Musik: nachfragen bzw. als Einschränkung dokumentieren, keine fremde Musik verwenden.

## Schritt 4 – An die Pipeline anpassen

- **Szene immer mit dem Baukasten bauen** (`pipeline/runtime/kit/`, Beispiel `productions/_kit_demo/scene.js`): Würfel-Menschen mit Gesicht, Requisiten, Orte. Keine Fotorealistik, kein Realismus-3D, keine KI-Bild-/Videogenerierung (Guide 6.1, 16).
- Fehlende Teile im Kit ergänzen, nicht nur in der Produktion.
- Jede Einstellung zuerst mit `node tools/still.mjs --production productions/<slug> --at …` als Vorschaubild prüfen und dem Nutzer den Kontaktbogen zeigen, bevor das ganze Video gerendert wird.

- Zuerst prüfen, was im Repository existiert (`ls`, `README.md`, LOG früherer Produktionen). Vorhandene, funktionierende Pipeline-Komponenten wiederverwenden, nicht ohne Grund ersetzen.
- Gibt es noch keine Pipeline: Empfehlung aus Guide 10.3 umsetzen und die Entscheidung im Guide-Änderungsprotokoll + LOG festhalten. Neue Abhängigkeiten nur, wenn nötig, und im LOG begründen.
- Unverhandelbar unabhängig von der Technik: deterministisches Rendern pro Frame, globale Zeitachse, 30 fps CFR, Ausgabeformat nach Guide 10.1/10.2.

## Schritt 5 – Rendern

- Komplettes Video rendern; Befehl und Git-Commit im LOG.
- Audio separat mischen und normalisieren (Guide 9.4), dann muxen.

## Schritt 6 – Qualitätsprüfung (vollständig, nicht stichprobenartig)

```bash
python3 tools/video_qa.py productions/<slug>/render/final.mp4 --out productions/<slug>/qa --mode render
python3 tools/inspect_frames.py productions/<slug>/render/final.mp4 --report productions/<slug>/qa/report.json --out productions/<slug>/qa/strips
```

1. `qa/report.md` lesen; Status und **alle** Meldungen ins LOG.
2. **Jeden** Kontaktbogen `qa/sheet_*.jpg` mit dem Read-Werkzeug ansehen – inklusive des letzten (Ende).
3. `qa/shots.jpg` gegen den Szenenplan prüfen.
4. **Jeden** Streifen in `qa/strips/` ansehen und jede REVIEW-Meldung als „beabsichtigt“ (mit Grund) oder „Fehler“ einstufen.
5. Texte auf Rechtschreibung, Lesbarkeit (240-px-Kontaktbogen), Sicherheitszone, Dauer prüfen.
6. Hörprüfung: Claude kann nicht hören. Messwerte (Lautheit, Klick-Kandidaten, Lautheitsverlauf) auswerten und den Nutzer **ausdrücklich um die Hörprüfung bitten** (Guide 11.3).

Nie behaupten, etwas sei geprüft, das nicht geprüft wurde. Im LOG genau festhalten, welche Bögen/Streifen angesehen wurden.

## Schritt 7 – Fehler beheben

- Pro Fehler: Zeitpunkt, Ursache (Guide 12), Korrektur **an der Ursache** (Szene, Zeitachse, Asset, Mischung) – kein Kaschieren im Schnitt.
- Danach komplett neu rendern und Schritt 6 **vollständig** wiederholen. Schleife, bis keine Fehler offen sind.

## Schritt 8 – Freigabe und Dokumentation

- Status nach Guide 11.4 setzen. `FREIGEGEBEN` nur mit bestätigter menschlicher Hörprüfung.
- LOG vervollständigen: Entscheidungen, Abweichungen vom Guide mit Begründung, Quellen, Lizenzen, alle QA-Durchläufe, bekannte Einschränkungen, Vorschläge für den Guide.
- Abschlussbericht an den Nutzer: Datei, Status, was geprüft wurde (und was nicht), offene Punkte.
- Commit nur der Projektdateien (Render-Ausgaben und JPGs sind per `.gitignore` ausgeschlossen); kein Push ohne Auftrag.

## Voraussetzungen und Aufruf

- Der Skill liegt projektbezogen unter `.claude/skills/whatif-video-style/` und ist nur verfügbar, wenn Claude Code in diesem Repository arbeitet (Repository als Arbeitsverzeichnis bzw. der Sitzung hinzugefügt).
- Aufruf: `/whatif-video-style` oder durch eine Aufgabenbeschreibung, die zur Skill-Beschreibung passt. Er wird nicht automatisch in anderen Projekten oder Chats geladen.
