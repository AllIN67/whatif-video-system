# Qualitätsfreigabe – what-if-last-light

Kopieren nach `productions/what-if-last-light/quality_review.md`. **Drei getrennte Prüfungen** (Style-Guide 11, 18.8). Ein bestandener
technischer Test ist **keine** Freigabe. Jeder Punkt: `OK` / `FEHLER` / `NICHT GEPRÜFT` + Beleg (Datei, Zeitpunkt).
Nichts als geprüft eintragen, was nicht angesehen wurde.

## A. Technisch (automatisch, `video_qa.py --mode render --plan timeline.json`)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Rendering vollständig (`render/run_log.json`, alle Frames) | OK | 1830/1830 Frames, 67 min (2,2 s/Frame, SwiftShader). `git_dirty: true` nur wegen unversionierter QA-Dateien aus Render 1 (`qa/`, `quality_review.md`); Szene/Beat-Sheet = Commit 9034ff7 |
| 1080×1920, 30 fps CFR, H.264/AAC, MP4 abspielbar (ffprobe) | OK | ffprobe: h264 1080×1920 30/1, aac 48 kHz |
| Länge ≥ 60 s, A/V-Länge gleich | OK | 61,000 s / 61,000 s |
| Keine Schwarz-/Blitzbilder, keine Doppelbilder/fehlenden Frames | OK (nach Korrektur) | Render 1: Schwarzbild 15,37 s (Whip aus dunkler Hochaufnahme) → Whip entfernt, harter Schnitt. Render 2: keine Schwarzbilder, Doppelbild-Anteil 0,4 % |
| −14 LUFS ± 1, True Peak ≤ −1 dBTP, Fade-out | OK | −14,1 LUFS, TP −1,3 dBTP (Render 1: −0,9 nach AAC, FAIL), LRA 7,2 LU, letzte Sekunde −29 dB |
| Ereignis-Klänge synchron (Bericht „Synchronität“, ±1 Frame) | OK mit Hörvorbehalt | 19/22 erkannt; 1 × 35 ms (13,6 s pop, knapp über 1 Frame); 3 verdeckt (wind 3 s, ding 25 s, warmth 29,8 s) → Hörprüfung |
| Status `video_qa.py` + jede REVIEW-Meldung eingestuft | REVIEW, eingestuft | Sprünge 7,7/27,3 s = geplante Schnitte; 52,1–53,1 s Sprünge/Flackern = beabsichtigtes Lampen-Flackern vor `e_out`; 45–47 s Flackern = blinkende Akku-Anzeige (beabsichtigt); Standbild 33,1–34,2 s und Monotonie 32–40 s = Weltraum-Totale (Schwäche, s. B); Klick-Kandidaten 0–14 s = Puls-Musik-Transienten im 0,31-s-Raster → Hörprüfung |

## B. Visuell (Sichtprüfung: alle `qa/sheet_*.jpg`, `qa/shots.jpg`, alle `qa/strips/*`)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Keine monotonen Phasen (Monotonie-Kandidaten gesichtet; jeder Beat hat eine sichtbare Aktion) | SCHWÄCHE | 32–36 s Weltraum: nur der Lichtpunkt und HUD bewegen sich; 36–40 s Akku-POV ruhig. Aktion vorhanden, aber Bild wenig bewegt |
| Figuren konsistent (Hauptfigur überall gleich: Kleidung, Haare, Größe) | OK | sheet_01–03: graues Shirt, braune Haare überall gleich |
| Gefühle lesbar (Gesicht auf dem 240-px-Kontaktbogen erkennbar), Entwicklung sichtbar | OK | Schock 4–7 s, Stolz/Lächeln 24–26 s, Sorge 40–43 s, Angst 52 s, Leere 53–55 s (nach Korrektur der Nahaufnahmen) |
| Keine fehlerhaften Animationen (Durchdringungen, Posen-Sprünge, schwebende Figuren) | OK mit Einschränkung | keine Sprünge gesehen; Massen-Figuren (Instanzen) können Köpfe nicht neigen – „alle schauen hoch“ (56–60 s) nur über Kamera/Gesichter erzählt |
| Kamera: Bildgrößen wechseln, keine zwei gleichen Einstellungen hintereinander, Bewegung weich | OK | POV → Nah → Halbtotale → Aufsicht → Untersicht → Nah → Totale → Weltraum → POV …; Render 1 Nahaufnahmen zu eng (Gesicht angeschnitten) → Abstand 2,2–2,4 m |
| Übergänge sinnvoll (Text blendet vor dem Schnitt aus, Whip/Dip nur an Ortswechseln) | OK | Zeilen blenden vor Schnitten aus (z. B. 11, 19, 27, 59 s) |
| HUD + Texte lesbar, in der Sicherheitszone, HUD reagiert sichtbar auf Ereignisse | OK mit Schwäche | HUD ändert sich in jedem Beat; in Nahaufnahmen (4–7, 24–26, 52 s) liegt das HUD auf Kinn/Hals der Figur – lesbar, aber überdeckt |
| Licht, Schatten, Farben stimmig; keine Renderfehler (Flackern, Schattenakne, Z-Fighting) | OK mit Schwäche | keine Renderfehler gesehen; Avenue 15–19 s und Park 27–31 s sehr dunkel (Figuren nur Silhouetten) |
| Stilspezifikation Guide 18 eingehalten (Würfel-Figuren mit Gesicht, Requisiten, Tiefe) | OK | |
| **L1 Farbhierarchie (18.13 D):** je Akt eine dominante Lichtfarbe, gedämpfte Kulisse, **ein** Akzent; `qa/balance.json` (Akzentfläche, Sättigung) gesichtet | OK mit Hinweis | Nachtblau + warmes Lampenlicht als einziger Akzent (Akzentfläche 2,6 %). `sat_strong` 56 % entsteht aus dem tiefblauen Nachtgrund (dominante Farbe 81 %), nicht aus erhöhter Sättigung (grade 0,9) – informativ |
| **L2 Motiviertes Licht:** Nacht-/Innenszenen mit sichtbaren Lichtquellen und Lichtabfall; Gesichter lesbar | OK mit Schwäche | Lampe, Lichtkegel, Lichtfleck überall sichtbar; Avenue/Park: Gesichter nicht lesbar |
| **L3/L4 Tiefe & Oberflächen:** Dunst/Kulisse/Gegenlicht außen, strukturierte Böden an Schauplätzen, Glanz wo passend | OK | Pflaster im Lichtfleck (8–11, 36–47 s), Skyline, Milchstraße (27–31, 56–60 s) |
| **Schauwert je Akt** (Masse/Weite/Glanz) sichtbar und nicht nur Hintergrund | OK | Akt 1 Menge auf der Straße (12–15 s), Akt 2 Platz mit 1.600 Menschen (20–23 s), Akt 3 Gedränge in Aufsicht (48–51 s) + Sternenhimmel |

## C. Dramaturgisch (Ansehen in Echtzeit, ohne Ton und mit Ton)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Einstieg: Frame 0 zeigt Situation + Titel + laufenden HUD; Hook nach Abschnitt H geprüft | OK | Frame 0: POV mit Handy-Licht, beleuchtete Skyline, Titel, HUD 0 |
| Entwicklung nachvollziehbar ohne Sprecher (jede Szene: Ursache → Wirkung) | OK mit Schwäche | Licht → Menschen kommen → Masse → Akku leer → aus → Sterne. Avenue (15–19 s) ohne Text schwer lesbar |
| Ausreichende Abwechslung (Orte, Requisiten, Perspektiven) | OK | 6 Orte, POV + 3. Person, Weltraum |
| Eskalation steigt (HUD-Verlauf + Gefühle + Maßstab) | OK | HUD 0 → 200.000.000 → 0 → 8.100.000.000; Maßstab Nachbar → Straße → Stadt → Erde |
| Ende: Wendung/Pointe als eigenes Ereignis mit Ton, danach ≤ 5 s, Frage/Loop | OK | `e_out` 53,2 s, Pointe `e_lookup` 56,3 s, Ende 61 s, Endkarte „Would you share the last light?“ |
| Vergleich mit Referenzen (R07/R19/R20): Was ist gleichwertig, was schwächer? | NICHT GEPRÜFT | auf Auftrag des Nutzers ausgelassen (nur eigene V3-Anforderungen) |
| **C9 Ein Einsatz (18.13 S1):** Prämisse und Messgröße bleiben bis zum Ende dieselben; jeder Beat trägt zur Titelfrage bei | OK | Messgröße „Following your light“ durchgehend; am Ende bewusst zu „Following the stars“ gedreht |
| **C10 Ursache ohne Text (18.13 S3):** Vorschaubild jedes `setup_for`-Ereignisses **ohne Untertitel**: Wer tut was, was ist die Gefahr? | OK | Akku-Anzeige rot/blinkend (36–47 s) groß im POV; Milchstraße bereits 27–31 s sichtbar |
| **C11 Ich-Perspektive:** im Hook-Entwurf geprüft; wo eingesetzt, sind Hände/Gegenstand groß genug und das Gefühl über Bezugsfigur/Ton lesbar | OK | 0–4 s und 36–47 s: Hand + Handy groß; Bezugsfigur Nachbar 0–3 s |
| **C12 Wissensanker:** je Akt eine geprüfte Zahl/Tatsache, Quelle im LOG | OK | 8 Mrd. (UN WPP 2022), 2.500 Sterne (Sky & Telescope), ⅓ ohne Milchstraße (Falchi et al. 2016) |

## H. Hook (0–15 s, Guide 18.12) – vor dem Rendern an Vorschaubildern, nach dem Rendern am Video

Vorschau: `node tools/still.mjs --production productions/what-if-last-light --at 0,0.5,1,2,3,5,8,12,15` → `stills/contact.jpg`.
Jede Frage mit Ja/Nein **und** Beleg (Bild/Zeit). Ein Nein bei H1–H3 ist ein Fehler, der vor dem Rendern behoben wird.

| Punkt | Ergebnis | Beleg |
|---|---|---|
| H1 Frame 0 ohne Titel betrachtet: Ist schon etwas Ungewöhnliches zu sehen (Bild oder HUD)? Oder nur „Person im Alltag“? | Ja (knapp) | 0 s: Skyline noch hell, HUD „The only light on Earth“; die Welle des Erlöschens beginnt sofort |
| H2 Stummschalt-Test: Lässt sich aus den Bildern 0–3 s **ohne Text** erraten, worum es geht und was auf dem Spiel steht? | Teilweise | Skyline geht aus, Nachbar starrt auf dein Licht; dass sein eigenes Handy ausgeht, ist im 9:16-Bild nicht erkennbar (nur Gesicht/Reaktion) |
| H3 Unmöglichkeitstest je `premise: "visible"`-Ereignis bis 15 s: Bild zur Ereigniszeit – sähe es ohne Prämisse anders aus? Ist die Konsequenz groß genug im Bild (9:16!)? Reagiert die Figur körperlich? | Ja | dunkle Stadt + einziger Lichtkegel (8–11 s), Menge strömt zum Licht (12–15 s); Figur reagiert (Schock 4–7 s) |
| H4 Frage (`hook.question`) bei 3 s offen, bei 15 s noch offen und größer geworden? Erste Zeile verschärft statt erklärt? | Ja | 3 s: 1 Mensch, 15 s: 120 Menschen |
| H5 Eskalation 3–15 s: Ereignisse in Reihenfolge auflisten – jedes größer, näher oder persönlicher als das vorige? | Ja | Nachbar → Nachbarn → ganze Straße |
| H6 Füllstoff / Vorwegnahme: Ereignis ohne Prämissenbezug im Bild? Zeigt der Einstieg Pointe oder Endzustand? | Nein / Nein | |
| H7 Eigenständigkeit: Hook-Typ und Eröffnungsbild der letzten 3 Produktionen genannt; nicht dieselbe Schablone (oder begründet) | Ja | erster POV-Einstieg (Ich-Perspektive) des Kanals; Typ `process` |
| Validator `[18.12]`: keine Fehler; jede Warnung behoben oder begründet | OK | `OK (0 Warnungen)` |

## D. Hörprüfung (nur durch einen Menschen)

- [ ] Kopfhörer, komplette Länge · [ ] Handylautsprecher · Name/Datum: ______ — **offen, beim Nutzer angefragt.** Hinweise aus `balance_qa`: 79 % Energie < 100 Hz, 1,7 % bei 2–8 kHz (Handylautsprecher!). Musik/Klänge unverändert aus dem Bestand (Klangänderungsstopp).
- Befund: Knackser / Verzerrung / Synchronität / Lautstärkeverhältnis Musik–Effekte / Ende

## Ergebnis

`ENTWURF` · `TECHNISCH GEPRÜFT` (A vollständig) · `QUALITÄT GEPRÜFT` (A + B + C + H) · `FREIGEGEBEN` (A + B + C + H + D)

**Status: QUALITÄT GEPRÜFT (A + B + C + H, mit dokumentierten Schwächen) – nicht FREIGEGEBEN (D offen).**

Offene Schwächen (nicht behoben, Testproduktion): Avenue/Park zu dunkel; Weltraum 32–36 s wenig Bewegung; Beweis-Ereignis 0–3 s nur über Reaktion lesbar; HUD überdeckt in Nahaufnahmen das Kinn; Massen-Köpfe nicht neigbar.
