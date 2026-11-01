# Qualitätsfreigabe – what-if-no-sleep-30-days

Kopieren nach `productions/what-if-no-sleep-30-days/quality_review.md`. **Drei getrennte Prüfungen** (Style-Guide 11, 18.8). Ein bestandener
technischer Test ist **keine** Freigabe. Jeder Punkt: `OK` / `FEHLER` / `NICHT GEPRÜFT` + Beleg (Datei, Zeitpunkt).
Nichts als geprüft eintragen, was nicht angesehen wurde.

## A. Technisch (automatisch, `video_qa.py --mode render --plan timeline.json`)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Rendering vollständig (`render/run_log.json`, alle Frames) | OK | Durchlauf 4, Commit 4975ef7, `git_dirty: false`, 1842/1842 Frames |
| 1080×1920, 30 fps CFR, H.264/AAC, MP4 abspielbar (ffprobe) | OK | ffprobe: h264 1080×1920 30/1, aac 48 kHz; 37,0 MB |
| Länge ≥ 60 s, A/V-Länge gleich | OK | 61,400 s Video und Audio |
| Keine Schwarz-/Blitzbilder, keine Doppelbilder/fehlenden Frames | OK | `qa/report.md`: Schwarzbilder keine, Doppelbilder 0, Einstellungen < 4 Frames keine (Durchlauf 1 + 2: FAIL an Abblenden/Whips mit extremem Helligkeitssprung → behoben, LOG 5) |
| −14 LUFS ± 1, True Peak ≤ −1 dBTP, Fade-out | OK | −14,1 LUFS, TP −1,3 dBTP, LRA 6,4 LU; letzte 50 ms −57,7 dB |
| Ereignis-Klänge synchron (Bericht „Synchronität“, ±1 Frame) | OK mit Hinweis | 49/51 erkannt, meist −15…+10 ms; 4× „pop“ mit +45…+55 ms gemessen (11,8 / 16,1 / 34,3 / 57,2 s – Klang ist ein Chirp, steilster Anstieg später als Einsatz; im Plan frame-genau, Validator OK); 2 verdeckt (12,2 / 22,4 s) → **Hörprüfung** |
| Status `video_qa.py` + jede REVIEW-Meldung eingestuft | OK | **REVIEW**. Sprung-Kandidaten 32,7 (Hand zum Gesicht), 33,9/34,1/37,9/38,1 (Abblenden), 34,5–34,6 und 36,5 (Drehung zum Toaster, Rückstoß), 44,5 (Blase platzt), 51,7–51,9 (Figur lässt sich ins Bett fallen), 57,1 (Wackeln beim Wecker) – alle an Streifen geprüft, **beabsichtigt**. Flacker 11,5/15,7/33,9 = Abblenden. Klick-Kandidaten 0,3–15,7 s im Takt der Musik (0,29/0,43 s) → Hörprüfung. Monotonie 58–61 s = Endkarte (beabsichtigt) |

## B. Visuell (Sichtprüfung: alle `qa/sheet_*.jpg`, `qa/shots.jpg`, alle `qa/strips/*`)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Keine monotonen Phasen (Monotonie-Kandidaten gesichtet; jeder Beat hat eine sichtbare Aktion) | OK | Nacht-Totale (38–42 s) war in Durchlauf 1 Monotonie-Kandidat → Gang + Kameraschwenk; jetzt nur noch Endkarte 58–61 s |
| Figuren konsistent (Hauptfigur überall gleich: Kleidung, Haare, Größe) | OK | sheet_01–03: blaues Hemd, dunkle Hose, kurze Haare in allen Beats; Augenringe nehmen zu (fatigue) |
| Gefühle lesbar (Gesicht auf dem 240-px-Kontaktbogen erkennbar), Entwicklung sichtbar | OK mit Einschränkung | gut lesbar: Büro (müde→Schock), Küche (Freude/Jubel), Rekord (Lachen), Schock-Nah, Park (Panik), Bett (Lächeln). **Schwach:** Hook (liegende Figur, Gesicht klein), Wecker-Szene (nur Profil), Pointe (Gesicht klein) |
| Keine fehlerhaften Animationen (Durchdringungen, Posen-Sprünge, schwebende Figuren) | OK | alle Streifen: Übergänge geblendet; Durchlauf 3 Fehler „Figur dreht sich aus dem Bild“ (Wecker 9,7–10,5 s, Küche 34–38 s) behoben und in Durchlauf 4 an Streifen bestätigt |
| Kamera: Bildgrößen wechseln, keine zwei gleichen Einstellungen hintereinander, Bewegung weich | OK | Validator: 6 Bildgrößen, 8 Vorlagen, keine Wiederholung; shots.jpg |
| Übergänge sinnvoll (Text blendet vor dem Schnitt aus, Whip/Dip nur an Ortswechseln) | OK | Abblenden an Ortswechseln, harte Schnitte am selben Ort (Rekord→Halluzination→Nah, Schlafzimmer) |
| HUD + Texte lesbar, in der Sicherheitszone, HUD reagiert sichtbar auf Ereignisse | OK mit Hinweis | HUD ändert sich in jedem Beat, Akzente (rot/gold) sichtbar; Untertitel lesbar. Hinweis: HUD-Unterzeilen klein (wie Referenz), Blase überlappt im Hook kurz den HUD-Bereich nicht mehr (korrigiert) |
| Licht, Schatten, Farben stimmig; keine Renderfehler (Flackern, Schattenakne, Z-Fighting) | OK mit Hinweis | eigene Stimmung je Ort (Nacht, Morgen, Büro, Klasse, Küche, Tag, Nacht, Abendpark, Regen). Hinweis: Raum ohne Decke → dunkler Streifen oben im Hook (wirkt als Decke) |
| Stilspezifikation Guide 18 eingehalten (Würfel-Figuren mit Gesicht, Requisiten, Tiefe) | OK | neue Kit-Teile Schaf, Augenringe; Requisiten mit Erzählfunktion (Wecker 6:59/7:00, Toaster, Handy, Taube, Z-Blase) |

## C. Dramaturgisch (Ansehen in Echtzeit, ohne Ton und mit Ton)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Einstieg: Frame 0 zeigt Situation + Titel + laufenden HUD; Hook nach Abschnitt H geprüft | OK | siehe H |
| Entwicklung nachvollziehbar ohne Sprecher (jede Szene: Ursache → Wirkung) | OK mit Einschränkung | Kontaktbögen 1 Bild/s und Streifen gesichtet, **nicht in Echtzeit abgespielt** (kein Player). Schwach lesbar: „Fenster erlöschen“ (38–42 s) nur subtil |
| Ausreichende Abwechslung (Orte, Requisiten, Perspektiven) | OK | 6 Orte, Ich-Perspektive, Aufsicht, Untersicht, Nah |
| Eskalation steigt (HUD-Verlauf + Gefühle + Maßstab) | OK | Schafe → Nacht vorbei → Körper → Arbeit → Hoffnung (Tag 7, Rekord) → Halluzination → Verwirrung → Einsamkeit → Körper bettelt → Countdown → Schlaf → Pointe |
| Ende: Wendung/Pointe als eigenes Ereignis mit Ton, danach ≤ 5 s, Frage/Loop | OK | 57,0 s Wecker springt 6:59→7:00, Blase platzt, HUD „TIME ASLEEP 60 s“; Stille 56,2–57,0 s davor; Endkarte „Would you hit snooze? / Part 2?“, Ende 4,4 s nach Pointe. Aufbau: Wecker an Tag 1 (8,9 s) |
| Vergleich mit Referenzen (R07/R19/R20): Was ist gleichwertig, was schwächer? | teilweise | gleichwertig: Anomalie ab Frame 0 (wie R07/R19), Ereignis in jeder Einstellung, HUD-Labelwechsel je Akt. Schwächer: Gesichter in Totalen klein; Referenzvideos in dieser Sitzung nicht verfügbar → Vergleich nur gegen dokumentierte Sichtung (REFERENCE_ANALYSIS 9/10) |

## H. Hook (0–15 s, Guide 18.12) – vor dem Rendern an Vorschaubildern, nach dem Rendern am Video

Vorschau: `node tools/still.mjs --production productions/what-if-no-sleep-30-days --at 0,0.5,1,2,3,5,8,12,15` → `stills/contact.jpg`.
Jede Frage mit Ja/Nein **und** Beleg (Bild/Zeit). Ein Nein bei H1–H3 ist ein Fehler, der vor dem Rendern behoben wird.

| Punkt | Ergebnis | Beleg |
|---|---|---|
| H1 Frame 0 ohne Titel betrachtet: Ist schon etwas Ungewöhnliches zu sehen (Bild oder HUD)? Oder nur „Person im Alltag“? | OK (vor Render + am Video: `qa/hook.jpg`, 15 Bilder 0–2,8 s) | `stills/t000.00.png`: Schaf mitten im Sprung über das Bett, Z-Blase über der liegenden Figur, HUD „SHEEP COUNTED 0“ – ohne Prämisse unmöglich. Vorfassungen (sleep1–3) waren FEHLER: Schaf oben angeschnitten bzw. hinter Titel → korrigiert |
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

## Hook am fertigen Video (Ergänzung zu H, Durchlauf 4)

| Fenster | Was ist zu sehen (`qa/hook.jpg`, `sheet_01.jpg`, Streifen) | Bewertung |
|---|---|---|
| 0–2 s | Schaf mitten im Sprung über das Bett ab Frame 0; Z-Blase platzt 0,5 s; in jedem Bild ein Schaf; Zähler 0 → 89 | Prämisse ohne Text verständlich (Schäfchenzählen scheitert); ungewöhnlich ✓ |
| 2–5 s | Strom reißt nicht ab; Aufsicht: Zimmer füllt sich mit Schafen; erste Zeile 4,3 s | Frage „wie lange hält er durch?“ offen ✓ |
| 5–15 s | Morgen bricht an, Augen offen; Tag 1 mit Augenringen + Wecker; Tag 3 Büro: Kopf sackt weg, Blase platzt zweimal, Schockgesicht | sichtbare Entwicklung, keine Alltagsfüller außer Wecker (Aufbau Pointe) ✓ |

**Bewertung des Hooks:** überzeugender als das Akku-Video (Anomalie und Prämisse ab Frame 0 statt Aufwachen + 1 %). **Schwächen:**
Gesicht der liegenden Figur 0–4 s klein (Reaktion „Augen springen auf“ kaum lesbar); Einsatz „30 Tage“ steht nur im Titel; Wecker-Szene
im Profil. Ob der Hook die Zuschauerbindung verbessert, zeigt **erst die Veröffentlichung** (LOG 8) – kein Test hier misst das.

## Ergebnis (2026-11-01)

**QUALITÄT GEPRÜFT** (A + B + C + H, mit den genannten Einschränkungen). **Nicht FREIGEGEBEN:** Hörprüfung (D) ausstehend.
