# Prüfung Hook-System (Branch `claude/hook-retention-standard`) – 2026-10-31

Kennzeichnung: **[B]** geprüft/gemessen · **[I]** Bewertung.

## 1. Vollständigkeit und Widerspruchsfreiheit

| Befund | Art | Maßnahme |
|---|---|---|
| 18.12 ist in Guide (2, 3.1, 16.1, 18.7, 18.10, 18.11), CLAUDE.md, Skill, Checkliste, Vorlagen und Validator verankert [B] | – | – |
| Abschnitt 18.1–18.11 unverändert erhalten; Standard-B- und Referenzniveau-Prüfungen (`checkStandardB`, `[18.11]`) laufen weiter vor `checkHook` [B] | – | – |
| **Widerspruch:** 18.12 H9 erlaubte die erste Zeile ab ≈ 2,5 s; Abschnitt 2 und Validator verlangen 3,5–5,0 s (Titel steht bis ≈ 3,4 s) [B] | Fehler | H9 auf 3,5–5,0 s korrigiert |
| 18.8 (Freigabestufen) nannte die Hook-Prüfung H nicht; `quality_review.md` verlangte sie [B] | Lücke | 18.8 ergänzt |
| CLAUDE.md „Fester Ablauf“ enthielt keinen Hook-Entwurf [B] | Lücke | Ablauf ergänzt |
| Hook-Entwurf (3 Ansätze) war nur Dokumentationspflicht, nirgends geprüft [B] | Lücke | Validator-CLI warnt, wenn LOG.md keine 3 ausgefüllten Ansätze + Wahl enthält (`checkHookDraft`) |
| Spannung (kein Widerspruch): 18.11 belohnt ≥ 1,5 Ereignisse/Beat, 18.12 H7 bremst Füllstoff im Hook-Fenster [I] | akzeptiert | Füllstoff zählt weiter zur Dichte, wird bis 15 s aber gewarnt |

## 2. Was der Hook-Validator kann – und was nicht

| Automatisch erkennbar (aus `beats.json`) | Nur durch Sichtprüfung (QA H) |
|---|---|
| `hook`-Block fehlt/unvollständig, unbekannter Typ | ob Frame 0 ohne Titel ungewöhnlich wirkt |
| Beweis-Ereignis fehlt, zu spät (proof/process > 2 s, countdown/mystery > 10 s), nicht als `visible` markiert | ob ein `visible` markiertes Ereignis wirklich sichtbar, groß genug und unmöglich ohne Prämisse ist |
| < 3 Prämissen-Ereignisse / < 2 `visible` bis 15 s | ob die Eskalation größer/näher/persönlicher wird |
| > 1/3 **unmarkierte** Ereignisse bis 15 s, Beat ohne Prämissen-Ereignis, Lücke > 5 s | ob die Frage verständlich und offen bleibt |
| Pointe < 15 s, End-Label < 15 s, Hook-Entwurf im LOG fehlt | ob der Ton zur Szene passt |

- **[B] Selbstauskunft:** Der Validator wertet nur die Angabe `premise` aus. Ein schwacher Einstieg, dessen Ereignisse fälschlich als
  `visible` markiert sind, **besteht** (Test „falsche Selbstauskunft wird NICHT erkannt“). Füllstoff wird nur erkannt, wenn er
  unmarkiert bleibt. Der Validator beurteilt **keine Bilder**.
- **[I]** Eine automatische Bildprüfung (Bilddifferenz um das Ereignis) wurde verworfen: Jede Kamera-Vorlage bewegt sich, die
  Differenz ist immer hoch → keine belastbare Aussage. Daher bleibt QA H Pflicht; der Validator gibt den Vorschaubefehl dafür aus.
- **Tests [B]:** Positiv – vier Hook-Typen (Beweis/R19, Prozess/R07, Countdown/R06, Geheimnis/R20) ohne Hook-Fehler. Negativ –
  Alltagseinstieg, zu später Beweis, nur HUD-Abzüge, Füllstoff (Toast/Bus/Keuchen), Lücke > 5 s, Pointe im Hook-Fenster, Akku-Video.

## 3. Neuer Chat / neues Thema

| Regel | Gilt automatisch? |
|---|---|
| `CLAUDE.md` (inkl. Hook-Kurzregel, Ablauf) | ja – wird bei Sitzungsstart geladen (in dieser Sitzung belegt) |
| Skill `whatif-video-style` | wird automatisch **angeboten** (Projekt-Skill); geladen wird er, wenn das Modell ihn wählt oder `/whatif-video-style` eingegeben wird – nicht erzwungen |
| Guide 18 / 18.12 im Wortlaut | nur über Verweis aus CLAUDE.md/Skill – muss gelesen werden |
| Validator inkl. `[18.12]`-Fehler | **erzwungen**: `pipeline/run.mjs` bricht bei Fehlern ab (`--skip-validate` nur für technische Clips) |
| Hook-Entwurf im LOG | Warnung (nicht blockierend) |
| Sichtprüfung H, Hörprüfung | manuell; kein Werkzeug erzwingt sie |

Kein Hook in `.claude/settings.json` (es gibt keine). **[I]** Ein Thema genügt als Auftrag; Typwahl je Prämisse ist im Standard
vorgesehen (vier Typen, Tests oben). Praxisprobe: Produktion `productions/what-if-no-sleep-30-days/` (neues Thema, anderer Hook-Typ).

## 4. Stabilität

- `npm test`: 38 Node-Tests + 5 Python-Tests bestanden [B].
- Akku-Video: 2 Fehler `[18.12]` (beabsichtigt, dokumentiert) → `run.mjs` würde ein Neu-Rendern blockieren. Übrige Meldungen
  sind Warnungen. `_kit_demo` (technischer Clip, ohne Beat-Sheet) hat unverändert eigene Fehler; nicht Teil der Produktion.

## 5. Praxisprobe: `what-if-no-sleep-30-days` (2026-11-01)

- **Validator bestand jede Vorfassung** – auch die, in der die Schafe im Hook oben aus dem Bild liefen, in 1/2/3 s kein Schaf zu
  sehen war und die Figur in der Wecker-Szene fehlte. Alle diese Mängel fand erst die Sichtprüfung an Vorschaubildern bzw. Streifen.
  Das bestätigt Abschnitt 2: Der Validator prüft Struktur und Selbstauskunft, nicht das Bild.
- **Was die Sichtprüfung fand (Auswahl):** Objekte im 9:16-Bild nur ≈ 0,5 s sichtbar (schmaler Bildwinkel); Blase von hinten; Gesichter
  in Totalen/Profil zu klein; Figur dreht sich aus dem Bild.
- **Technische Erkenntnis (→ Guide 18.2):** Abblenden zwischen Szenen mit sehr unterschiedlicher Helligkeit erzeugen in `video_qa.py`
  „Einstellungen < 4 Frames“ (FAIL), obwohl das Bild sauber ist. Die Prüfregel wurde nicht entschärft (sie fand im Akku-Video echte
  Fehler); stattdessen Lichtstimmungen angeglichen.
- **Zuschauerbindung:** nicht messbar vor Veröffentlichung.
