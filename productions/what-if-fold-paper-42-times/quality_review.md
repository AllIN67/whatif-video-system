# Qualitätsfreigabe – what-if-fold-paper-42-times

Kopieren nach `productions/what-if-fold-paper-42-times/quality_review.md`. **Drei getrennte Prüfungen** (Style-Guide 11, 18.8). Ein bestandener
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

Vorschau: `node tools/still.mjs --production productions/what-if-fold-paper-42-times --at 0,0.5,1,2,3,5,8,12,15` → `stills/contact.jpg`.
Jede Frage mit Ja/Nein **und** Beleg (Bild/Zeit). Ein Nein bei H1–H3 ist ein Fehler, der vor dem Rendern behoben wird.

| Punkt | Ergebnis | Beleg |
|---|---|---|
| H1 Frame 0 ohne Titel betrachtet: Ist schon etwas Ungewöhnliches zu sehen (Bild oder HUD)? Oder nur „Person im Alltag“? | OK (Vorschau) | t=0: weiße Säule ragt aus der Erde bis neben den Mond, HUD 219,902.3 km – unmögliches Bild ab Frame 0 (stills, 2. Vorschaurunde) |
| H2 Stummschalt-Test: Lässt sich aus den Bildern 0–3 s **ohne Text** erraten, worum es geht und was auf dem Spiel steht? | TEILWEISE (Vorschau) | Ohne Text: „etwas Weißes reicht von der Erde zum Mond, Zahl in km“. Dass es **Papier** ist, sagt erst der Titel bzw. ab 4 s das Blatt auf dem Tisch. Einsatz (Verdopplung) erst ab der HUD-Unterzeile „EVERY FOLD = 2×“ (4 s). |
| H3 Unmöglichkeitstest je `premise: "visible"`-Ereignis bis 15 s: Bild zur Ereigniszeit – sähe es ohne Prämisse anders aus? Ist die Konsequenz groß genug im Bild (9:16!)? Reagiert die Figur körperlich? | OK mit Einschränkung (Vorschau) | 0,4 s Säule am Mond: ja, groß genug (Säule über die ganze Bildhöhe, Mond ≈ 13 % Breite). 2,3 s Rücksprung: Säule schrumpft sichtbar. 11,25 s Faustschlag-Falte: Figur reagiert (reach → recoil, Faust gehoben, Vorschau 12,3 s); Block 2,6 cm – klein, aber im Low-Angle lesbar. 14,1 s Säule auf dem Tisch: in der Totalen noch dünn (Vorschau 15,6 s). |
| H4 Frage (`hook.question`) bei 3 s offen, bei 15 s noch offen und größer geworden? Erste Zeile verschärft statt erklärt? | OK (Plan + Vorschau) | Frage „How can one sheet of paper reach the Moon?“ bei 3 s offen (Rücksprung); bei 15 s steht die Säule erst über dem Kopf – Weg zum Mond noch offen. Erste Zeile „42 folds earlier: one sheet.“ verankert den Rücksprung (verortend, Bild zeigte vorher die Anomalie, H9). |
| H5 Eskalation 3–15 s: Ereignisse in Reihenfolge auflisten – jedes größer, näher oder persönlicher als das vorige? | OK (Plan) | Mond (Flashforward) → Rücksprung zur Erde → Blatt auf dem Tisch (persönlicher) → Falten 1–7 (HUD) → Falte 7 verweigert (Rückschlag) → Faustschlag-Falte 8 (erste unmögliche Falte, größer) → Klasse dreht sich um → Säule springt auf Handbreite. Hinweis: 4–10 s sind HUD-Stufen am Tisch – visuell ruhiger als die Referenz V4. |
| H6 Füllstoff / Vorwegnahme: Ereignis ohne Prämissenbezug im Bild? Zeigt der Einstieg Pointe oder Endzustand? | Abweichung bewusst | Einziges Kulissen-Ereignis: teacher_draws (bereitet Pointe vor). Der Einstieg zeigt den **Höhepunkt** (Mond) – gewollter Kern des getesteten Hook-Typs `flashforward`; Pointe (Hausaufgabe) und End-Label bleiben zurückgehalten. |
| H7 Eigenständigkeit: Hook-Typ und Eröffnungsbild der letzten 3 Produktionen genannt; nicht dieselbe Schablone (oder begründet) | OK | LOG 1: Akku (Alltag), no-sleep (process, Z-Blase), last-goodbye (kein Block) → flashforward/Weltraum neu |
| Validator `[18.12]`: keine Fehler; jede Warnung behoben oder begründet | OK | keine [18.12]-Meldung; einzige Warnung [18.11] HUD-Änderung 0,95 (Endbild hält den Wert, LOG) |

## D. Hörprüfung (nur durch einen Menschen)

- [ ] Kopfhörer, komplette Länge · [ ] Handylautsprecher · Name/Datum: ______
- Befund: Knackser / Verzerrung / Synchronität / Lautstärkeverhältnis Musik–Effekte / Ende

## Ergebnis

`ENTWURF` · `TECHNISCH GEPRÜFT` (A vollständig) · `QUALITÄT GEPRÜFT` (A + B + C + H) · `FREIGEGEBEN` (A + B + C + H + D)
