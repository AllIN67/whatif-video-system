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
| Einstieg: Frame 0 zeigt Situation + Titel + laufenden HUD; ohne Text verständlich | | |
| Entwicklung nachvollziehbar ohne Sprecher (jede Szene: Ursache → Wirkung) | | |
| Ausreichende Abwechslung (Orte, Requisiten, Perspektiven) | | |
| Eskalation steigt (HUD-Verlauf + Gefühle + Maßstab) | | |
| Ende: Wendung/Pointe als eigenes Ereignis mit Ton, danach ≤ 5 s, Frage/Loop | | |
| Vergleich mit Referenzen (R07/R19/R20): Was ist gleichwertig, was schwächer? | | |

## D. Hörprüfung (nur durch einen Menschen)

- [ ] Kopfhörer, komplette Länge · [ ] Handylautsprecher · Name/Datum: ______
- Befund: Knackser / Verzerrung / Synchronität / Lautstärkeverhältnis Musik–Effekte / Ende

## Ergebnis

`ENTWURF` · `TECHNISCH GEPRÜFT` (A vollständig) · `QUALITÄT GEPRÜFT` (A + B + C) · `FREIGEGEBEN` (A + B + C + D)
