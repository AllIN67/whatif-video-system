# Qualitätsfreigabe – what-if-no-sleep-30-days

Kopieren nach `productions/what-if-no-sleep-30-days/quality_review.md`. **Drei getrennte Prüfungen** (Style-Guide 11, 18.8). Ein bestandener
technischer Test ist **keine** Freigabe. Jeder Punkt: `OK` / `FEHLER` / `NICHT GEPRÜFT` + Beleg (Datei, Zeitpunkt).
Nichts als geprüft eintragen, was nicht angesehen wurde.

## A. Technisch (automatisch, `video_qa.py --mode render --plan timeline.json`)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Rendering vollständig (`render/run_log.json`, alle Frames) | | |
| 1080×1920, 30 fps CFR, H.264/AAC, MP4 abspielbar (ffprobe) | | |
| Länge ≥ 60 s, A/V-Länge gleich | | |
| Keine Schwarz-/Blitzbilder, keine Doppelbilder/fehlenden Frames | | |
| −14 LUFS ± 1, True Peak ≤ −1 dBTP, Fade-out | | |
| Ereignis-Klänge synchron (Bericht „Synchronität“, ±1 Frame) | | |
| Status `video_qa.py` + jede REVIEW-Meldung eingestuft | | |

## B. Visuell (Sichtprüfung: alle `qa/sheet_*.jpg`, `qa/shots.jpg`, alle `qa/strips/*`)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Keine monotonen Phasen (Monotonie-Kandidaten gesichtet; jeder Beat hat eine sichtbare Aktion) | | |
| Figuren konsistent (Hauptfigur überall gleich: Kleidung, Haare, Größe) | | |
| Gefühle lesbar (Gesicht auf dem 240-px-Kontaktbogen erkennbar), Entwicklung sichtbar | | |
| Keine fehlerhaften Animationen (Durchdringungen, Posen-Sprünge, schwebende Figuren) | | |
| Kamera: Bildgrößen wechseln, keine zwei gleichen Einstellungen hintereinander, Bewegung weich | | |
| Übergänge sinnvoll (Text blendet vor dem Schnitt aus, Whip/Dip nur an Ortswechseln) | | |
| HUD + Texte lesbar, in der Sicherheitszone, HUD reagiert sichtbar auf Ereignisse | | |
| Licht, Schatten, Farben stimmig; keine Renderfehler (Flackern, Schattenakne, Z-Fighting) | | |
| Stilspezifikation Guide 18 eingehalten (Würfel-Figuren mit Gesicht, Requisiten, Tiefe) | | |

## C. Dramaturgisch (Ansehen in Echtzeit, ohne Ton und mit Ton)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Einstieg: Frame 0 zeigt Situation + Titel + laufenden HUD; Hook nach Abschnitt H geprüft | | |
| Entwicklung nachvollziehbar ohne Sprecher (jede Szene: Ursache → Wirkung) | | |
| Ausreichende Abwechslung (Orte, Requisiten, Perspektiven) | | |
| Eskalation steigt (HUD-Verlauf + Gefühle + Maßstab) | | |
| Ende: Wendung/Pointe als eigenes Ereignis mit Ton, danach ≤ 5 s, Frage/Loop | | |
| Vergleich mit Referenzen (R07/R19/R20): Was ist gleichwertig, was schwächer? | | |

## H. Hook (0–15 s, Guide 18.12) – vor dem Rendern an Vorschaubildern, nach dem Rendern am Video

Vorschau: `node tools/still.mjs --production productions/what-if-no-sleep-30-days --at 0,0.5,1,2,3,5,8,12,15` → `stills/contact.jpg`.
Jede Frage mit Ja/Nein **und** Beleg (Bild/Zeit). Ein Nein bei H1–H3 ist ein Fehler, der vor dem Rendern behoben wird.

| Punkt | Ergebnis | Beleg |
|---|---|---|
| H1 Frame 0 ohne Titel betrachtet: Ist schon etwas Ungewöhnliches zu sehen (Bild oder HUD)? Oder nur „Person im Alltag“? | OK (vor Render) | `stills/t000.00.png`: Schaf mitten im Sprung über das Bett, Z-Blase über der liegenden Figur, HUD „SHEEP COUNTED 0“ – ohne Prämisse unmöglich. Vorfassungen (sleep1–3) waren FEHLER: Schaf oben angeschnitten bzw. hinter Titel → korrigiert |
| H2 Stummschalt-Test: Lässt sich aus den Bildern 0–3 s **ohne Text** erraten, worum es geht und was auf dem Spiel steht? | OK mit Einschränkung | 0/0,5/1/1,5/2/3 s: in jedem Bild ein springendes Schaf + Bett + Nacht → „kann nicht einschlafen“ ist lesbar. Der **Einsatz** (30 Tage) ist ohne Titel nicht erkennbar; Gesicht der liegenden Figur ist klein (Augen auf dem Kontaktbogen kaum lesbar) |
| H3 Unmöglichkeitstest je `premise: "visible"`-Ereignis bis 15 s: Bild zur Ereigniszeit – sähe es ohne Prämisse anders aus? Ist die Konsequenz groß genug im Bild (9:16!)? Reagiert die Figur körperlich? | OK / 1 Einschränkung | bubble_pop 0,5 s (Blase platzt, groß im Bild) ✓ · sheep_more 1,4 s ✓ · sheep_wave 4,6 s (Aufsicht, Zimmer voller Schafe) ✓ · dawn 6,6 s (Fenster hell, Licht kippt) ✓ · bags 8,1 s: Augenringe **nur im Profil, klein** – schwach · nod1/nod2 12,6/14,2 s (Blase mit Z über dem Kopf, Schockgesicht, Schweiß) ✓. Körperreaktion: im Hook nur Blick/Gesicht (klein), deutlich ab 12 s |
| H4 Frage (`hook.question`) bei 3 s offen, bei 15 s noch offen und größer geworden? Erste Zeile verschärft statt erklärt? | OK | 3 s: „Wie lange hält er durch?“; 15 s: Tag 3, Körper versagt öffentlich (Büro) – Frage gewachsen, unbeantwortet. Erste Zeile (4,3 s) „Your body is exhausted. Your brain isn't.“ erklärt den Mechanismus, wiederholt nicht das Bild |
| H5 Eskalation 3–15 s: Ereignisse in Reihenfolge auflisten – jedes größer, näher oder persönlicher als das vorige? | OK | einzelne Schafe → Zimmer voller Schafe → ganze Nacht vorbei → Körper zeigt Spuren (Tag 1) → Schlafversuch scheitert am Arbeitsplatz vor Kollegen (Tag 3): Maßstab, Zeit, Körper, Öffentlichkeit |
| H6 Füllstoff / Vorwegnahme: Ereignis ohne Prämissenbezug im Bild? Zeigt der Einstieg Pointe oder Endzustand? | OK | Wecker (8,9/9,9 s) ohne Prämissenbezug, aber **Aufbau der Pointe** (bewusst). Kein Hinweis auf Tag 30, Rekord oder Wecker-Pointe vor 15 s |
| H7 Eigenständigkeit: Hook-Typ und Eröffnungsbild der letzten 3 Produktionen genannt; nicht dieselbe Schablone (oder begründet) | OK, begründet | LOG 1: Akku-Video begann ebenfalls im Bett (Alltag); hier ist das Bett der Ort der Prämisse und Frame 0 enthält die Anomalie |
| Validator `[18.12]`: keine Fehler; jede Warnung behoben oder begründet | OK | `validate_production.mjs`: OK, 0 Warnungen (nach Behebung „medium 7/15“) |

## D. Hörprüfung (nur durch einen Menschen)

- [ ] Kopfhörer, komplette Länge · [ ] Handylautsprecher · Name/Datum: ______
- Befund: Knackser / Verzerrung / Synchronität / Lautstärkeverhältnis Musik–Effekte / Ende

## Ergebnis

`ENTWURF` · `TECHNISCH GEPRÜFT` (A vollständig) · `QUALITÄT GEPRÜFT` (A + B + C + H) · `FREIGEGEBEN` (A + B + C + H + D)
