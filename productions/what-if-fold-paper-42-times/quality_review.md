# Qualitätsfreigabe – what-if-fold-paper-42-times

Kopieren nach `productions/what-if-fold-paper-42-times/quality_review.md`. **Drei getrennte Prüfungen** (Style-Guide 11, 18.8). Ein bestandener
technischer Test ist **keine** Freigabe. Jeder Punkt: `OK` / `FEHLER` / `NICHT GEPRÜFT` + Beleg (Datei, Zeitpunkt).
Nichts als geprüft eintragen, was nicht angesehen wurde.

## A. Technisch (automatisch, `video_qa.py --mode render --plan timeline.json`)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Rendering vollständig (`render/run_log.json`, alle Frames) | OK | run_log: 1872/1872 Frames, Commit f21bd07, git_dirty false |
| 1080×1920, 30 fps CFR, H.264/AAC, MP4 abspielbar (ffprobe) | OK | ffprobe: h264 1080×1920 30/1, aac, 29,7 MB |
| Länge ≥ 60 s, A/V-Länge gleich | OK | 62,400 s Video und Audio |
| Keine Schwarz-/Blitzbilder, keine Doppelbilder/fehlenden Frames | OK (Render 2) | Schwarzbilder: keine; Einstellungen < 4 Frames: keine; Doppelbilder 0. Render 1 hatte 3 Schwarzbild-Phasen + 1 Kurz-Einstellung → behoben (LOG 5) |
| −14 LUFS ± 1, True Peak ≤ −1 dBTP, Fade-out | OK | −14,1 LUFS, TP −1,0 dBTP, letzte 50 ms −61,5 dB |
| Ereignis-Klänge synchron (Bericht „Synchronität“, ±1 Frame) | TEILWEISE | 51/72 erkannt; 10 Klänge 40–60 ms nach dem Plan gemessen (paper/pop – weicher Anstieg der Hüllkurve, Messfenster misst „steilsten Anstieg“); 21 verdeckt. Planzeiten exakt auf Frames (Builder). Hörprüfung nötig |
| Status `video_qa.py` + jede REVIEW-Meldung eingestuft | REVIEW, eingestuft | Sprungkandidaten 0,63–0,73 (Blitz Säule/Mond), 11,2 (Faustschlag + Papierfunken), 24,8 (Jubelpose), 30,2 (Turm überholt, Blitz), 33,0/35,3 (HUD-Stufe + Säule schießt hoch), 44,9–45,1 (Blitz „longer than Earth“), 49,6–49,9 (Falte 42, Wackler + Blitz), 57,4 (Pointe) = **beabsichtigt** (Strips angesehen). Standbild 47,6–48,1 = beabsichtigt (Stille vor Falte 42), bildlich aber mager. Klick-Kandidaten = SFX-Einsätze, nur hörbar prüfbar |

## B. Visuell (Sichtprüfung: alle `qa/sheet_*.jpg`, `qa/shots.jpg`, alle `qa/strips/*`)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Keine monotonen Phasen (Monotonie-Kandidaten gesichtet; jeder Beat hat eine sichtbare Aktion) | OK mit Einschränkung | Monotonie-Kandidaten: keine. Schwach: 46,4–48,6 (fast schwarzes All, nur Säulenspitze unten + Mondrand), 17,0–18,4 (POV auf geschlossene Decke vor dem Durchstoß – beabsichtigter Aufbau) |
| Figuren konsistent (Hauptfigur überall gleich: Kleidung, Haare, Größe) | OK | rotes Shirt/Haare in allen Beats (sheet_01–03) |
| Gefühle lesbar (Gesicht auf dem 240-px-Kontaktbogen erkennbar), Entwicklung sichtbar | OK | neutral 4–6 s → happy 7 s → worried 9 s (Schweißtropfen) → angry 10–11 s → shock 12 s → laugh 25 s → worried 57 s → smug 58–59 s |
| Keine fehlerhaften Animationen (Durchdringungen, Posen-Sprünge, schwebende Figuren) | OK mit Einschränkung | Armdurchdringung 12,8–13,1 s aus Render 1 behoben (Strip 13,8 Render 2 ohne). Lehrerin 53–56 s: Kopf oben angeschnitten |
| Kamera: Bildgrößen wechseln, keine zwei gleichen Einstellungen hintereinander, Bewegung weich | OK | 9 Vorlagen, 6 Bildgrößen (Validator); Kranfahrten weich (Strips 20,5–24,2; 35,0–38,6) |
| Übergänge sinnvoll (Text blendet vor dem Schnitt aus, Whip/Dip nur an Ortswechseln) | OK | Weißblitz 3,7–4,1 (Rücksprung → Tisch), Dip 20,5, Whip 27,0, Dip 31,3, harter Schnitt 41,8 (Straße → All, statt Dip wegen Helligkeitssprung) |
| HUD + Texte lesbar, in der Sicherheitszone, HUD reagiert sichtbar auf Ereignisse | OK mit Einschränkung | HUD zählt jede Faltung (Stufenimpuls, Akzentfarben). In Nahaufnahmen liegt der HUD über Kinn/Brust (24–26 s, 57–59 s) – lesbar dank Scrim; Endkarte 60–62 s über Gesichtern, lesbar |
| Licht, Schatten, Farben stimmig; keine Renderfehler (Flackern, Schattenakne, Z-Fighting) | OK | Flacker-Kandidaten nur an geplanten Übergängen; keine Artefakte in den Strips gesehen |
| Stilspezifikation Guide 18 eingehalten (Würfel-Figuren mit Gesicht, Requisiten, Tiefe) | OK mit Einschränkung | Würfel-Figuren mit Gesicht; Weltraum/Himmel-Beats ohne Figur (Maßstabsreise) – weniger Requisiten als das Akku-Video |

## C. Dramaturgisch (Ansehen in Echtzeit, ohne Ton und mit Ton)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Einstieg: Frame 0 zeigt Situation + Titel + laufenden HUD; Hook nach Abschnitt H geprüft | OK | Frame 0: Säule Erde→Mond, Titel, HUD 219,902.3 km; H am Video wiederholt (unten) |
| Entwicklung nachvollziehbar ohne Sprecher (jede Szene: Ursache → Wirkung) | OK | Faltung → Dicke ×2 (HUD) → Säule durchstößt Decke → Dach → Stadt → Flugzeug → Weltraum → Erde → Mond → zurück in der Klasse |
| Ausreichende Abwechslung (Orte, Requisiten, Perspektiven) | OK | 6 Orte, Innen/Außen/Himmel/All, 9 Kamera-Vorlagen |
| Eskalation steigt (HUD-Verlauf + Gefühle + Maßstab) | OK | HUD 0,1 mm → 439.804,7 km in sichtbaren Verdopplungen; Maßstab Tisch → Mond |
| Ende: Wendung/Pointe als eigenes Ereignis mit Ton, danach ≤ 5 s, Frage/Loop | OK | Pointe 57,4 s (ding, Figur zeigt nach oben, HUD-Label „YOUR PAPER PLANE · ON THE MOON“), Ende 62,4 s = 5,0 s; Endkarte „Would you fold it a 43rd time? / Part 2?“ |
| Vergleich mit Referenzen (R07/R19/R20): Was ist gleichwertig, was schwächer? | siehe LOG 5 | gleichwertig: Zähler-Rückgrat, Maßstabsreise, Ringpointe (wie V1/V2); schwächer: Weltraum-Beats ohne Figur, kurze Strecke 46–48 s fast leer, Lehrerin angeschnitten |

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

**Status: QUALITÄT GEPRÜFT** (A + B + C + H, Render 2, Commit f21bd07). **Nicht FREIGEGEBEN** – Hörprüfung D steht aus.
H am fertigen Video wiederholt (sheet_01, hook.jpg, Strips 0,1–4,8): Ergebnisse wie oben vor dem Rendern; Einschränkung H2 bleibt (dass es Papier ist, erkennt man ohne Titel erst ab 4 s).

`ENTWURF` · `TECHNISCH GEPRÜFT` (A vollständig) · `QUALITÄT GEPRÜFT` (A + B + C + H) · `FREIGEGEBEN` (A + B + C + H + D)
