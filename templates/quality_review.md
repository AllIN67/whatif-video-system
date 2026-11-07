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
| **L1 Farbhierarchie (18.13 D):** je Akt eine dominante Lichtfarbe, gedämpfte Kulisse, **ein** Akzent; `qa/balance.json` (Akzentfläche, Sättigung) gesichtet | | |
| **L2 Motiviertes Licht:** Nacht-/Innenszenen mit sichtbaren Lichtquellen und Lichtabfall; Gesichter lesbar | | |
| **L3/L4 Tiefe & Oberflächen:** Dunst/Kulisse/Gegenlicht außen, strukturierte Böden an Schauplätzen, Glanz wo passend | | |
| **Schauwert je Akt** (Masse/Weite/Glanz) sichtbar und nicht nur Hintergrund | | |

## C. Dramaturgisch (Ansehen in Echtzeit, ohne Ton und mit Ton)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Einstieg: Frame 0 zeigt Situation + Titel + laufenden HUD; Hook nach Abschnitt H geprüft | | |
| Entwicklung nachvollziehbar ohne Sprecher (jede Szene: Ursache → Wirkung) | | |
| Ausreichende Abwechslung (Orte, Requisiten, Perspektiven) | | |
| Eskalation steigt (HUD-Verlauf + Gefühle + Maßstab) | | |
| Ende: Wendung/Pointe als eigenes Ereignis mit Ton, danach ≤ 5 s, Frage/Loop | | |
| Vergleich mit den kreativen Referenzen (Guide 18.11: C1 `Viral_referenz_1`, C2 `Viral_referenz_2`, B1 `Referenz__neuer_stil_1m_views`, B2 `Referenz_alter_stil`) – Hook, Ich-Perspektive, Einsatz/HUD, Schauwert, Licht, Ton: Was ist gleichwertig, was schwächer? (nicht das Akku-Testvideo) | | |
| **C9 Ein Einsatz (18.13 S1):** Prämisse und Messgröße bleiben bis zum Ende dieselben; jeder Beat trägt zur Titelfrage bei | | |
| **C10 Ursache ohne Text (18.13 S3):** Vorschaubild jedes `setup_for`-Ereignisses **ohne Untertitel**: Wer tut was, was ist die Gefahr? | | |
| **C11 Ich-Perspektive:** im Hook-Entwurf geprüft; wo eingesetzt, sind Hände/Gegenstand groß genug und das Gefühl über Bezugsfigur/Ton lesbar | | |
| **C12 Wissensanker:** je Akt eine geprüfte Zahl/Tatsache, Quelle im LOG | | |
| **C13 Sprache (18.14):** alle Bildschirmtexte (Titel „Was wäre, wenn …?“, HUD, Zeilen, Endkarte, Bildtexte im Szenencode) natürliches, modernes Deutsch in Du-Form – keine wörtliche Übersetzung; Rechtschreibung, „ “, Zahlen 1.000/3,5, SI-Einheiten, Versalien mit SS; keine Zeile über 2 Bildschirmzeilen | | |

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
- [ ] Sprachabnahme (18.14 D12): Texte vom Nutzer muttersprachlich gegengelesen · Befund: ______

## Ergebnis

`ENTWURF` · `TECHNISCH GEPRÜFT` (A vollständig) · `QUALITÄT GEPRÜFT` (A + B + C + H) · `FREIGEGEBEN` (A + B + C + H + D)
