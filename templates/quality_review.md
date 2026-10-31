# Qualitätsfreigabe – <slug>

Kopieren nach `productions/<slug>/quality_review.md`. **Drei getrennte Prüfungen** (Style-Guide 11, 18.8). Ein bestandener
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

Vorschau: `node tools/still.mjs --production productions/<slug> --at 0,0.5,1,2,3,5,8,12,15` → `stills/contact.jpg`.
Jede Frage mit Ja/Nein **und** Beleg (Bild/Zeit). Ein Nein bei H1–H3 ist ein Fehler, der vor dem Rendern behoben wird.

| Punkt | Ergebnis | Beleg |
|---|---|---|
| H1 Frame 0 ohne Titel betrachtet: Ist schon etwas Ungewöhnliches zu sehen (Bild oder HUD)? Oder nur „Person im Alltag“? | | |
| H2 Stummschalt-Test: Lässt sich aus den Bildern 0–3 s **ohne Text** erraten, worum es geht und was auf dem Spiel steht? | | |
| H3 Unmöglichkeitstest je `premise: "visible"`-Ereignis bis 15 s: Bild zur Ereigniszeit – sähe es ohne Prämisse anders aus? Ist die Konsequenz groß genug im Bild (9:16!)? Reagiert die Figur körperlich? | | |
| H4 Frage (`hook.question`) bei 3 s offen, bei 15 s noch offen und größer geworden? Erste Zeile verschärft statt erklärt? | | |
| H5 Eskalation 3–15 s: Ereignisse in Reihenfolge auflisten – jedes größer, näher oder persönlicher als das vorige? | | |
| H6 Füllstoff / Vorwegnahme: Ereignis ohne Prämissenbezug im Bild? Zeigt der Einstieg Pointe oder Endzustand? | | |
| H7 Eigenständigkeit: Hook-Typ und Eröffnungsbild der letzten 3 Produktionen genannt; nicht dieselbe Schablone (oder begründet) | | |
| Validator `[18.12]`: keine Fehler; jede Warnung behoben oder begründet | | |

## D. Hörprüfung (nur durch einen Menschen)

- [ ] Kopfhörer, komplette Länge · [ ] Handylautsprecher · Name/Datum: ______
- Befund: Knackser / Verzerrung / Synchronität / Lautstärkeverhältnis Musik–Effekte / Ende

## Ergebnis

`ENTWURF` · `TECHNISCH GEPRÜFT` (A vollständig) · `QUALITÄT GEPRÜFT` (A + B + C + H) · `FREIGEGEBEN` (A + B + C + H + D)
