# Qualitätsfreigabe – what-if-koma

Render 3 (2026-11-08), `render/final.mp4`, 61,2 s. Grundlage: `qa/report.md`, `qa/sheet_01–03.jpg`, `qa/shots.jpg`, Bildstreifen
in `qa/strips/` (Übergänge und Kandidaten), `qa/balance.json`, Vorschaubilder vor dem Rendern. `OK` / `FEHLER` / `NICHT GEPRÜFT`.
Render 1 und 2 sind verworfen (Fehlerliste unten).

## A. Technisch (`video_qa.py --mode render --plan timeline.json`)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Rendering vollständig | OK | `run_log.json`: 1836/1836 Frames; `git_dirty: true` (Auftrag: keine Commits ohne Freigabe) |
| 1080×1920, 30 fps CFR, H.264/AAC, MP4 abspielbar | OK | ffprobe: h264 1080×1920 30/1, aac 48 kHz, 61,200 s, 40,9 MB |
| Länge ≥ 60 s, A/V-Länge gleich | OK | 61,200 s / 61,200 s |
| Keine Schwarz-/Blitzbilder, keine Doppelbilder | OK mit Einstufung | keine Schwarzbilder; 0 isolierte Doppelbilder; Weißblitz 1,2 s = Aufprall (beabsichtigt) |
| −14 LUFS ± 1, True Peak ≤ −1 dBTP, Fade-out | OK | −14,2 LUFS, TP −1,0 dBTP; letzte Sekunde −22,6 dB |
| Ereignis-Klänge synchron | OK mit Hinweis | 36/36 erkannt; 5 Klänge 35–60 ms (Herzschlag ×3, pop, warmth – weicher Anstieg der Klänge); Hörprüfung nötig |
| Status `video_qa.py` | **FAIL (technisch), eingestuft** | siehe REVIEW-Tabelle |

| Zeitpunkt | Meldung | Einstufung | Begründung |
|---|---|---|---|
| 5,0 s | Einstellung < 4 Frames | beabsichtigt (Messartefakt) | Strip `strip_0004.933`: sauberer Schnitt dunkle Straße → Intensivzimmer, das mit abgesenkter Belichtung einblendet; kein Blitzbild. Bekannter Fall Guide 18.2 (Abblende hell/dunkel) |
| 28,133 s | Einstellung < 4 Frames | beabsichtigt (Messartefakt) | Strip `strip_0028.167`: Haar-Aufsicht blendet über 6 Frames ab, Schnitt auf Hochzeit; Bild sauber |
| 46,6–46,73 s | Sprungkandidat | beabsichtigt | Arm sackt weg (`e_weak`, schnelle Überblendung 0,18 s) |
| 48,5 s | Sprungkandidat | beabsichtigt | Handy wechselt vom Sperrbildschirm zum Chat |
| 41,93 s | Flacker-Kandidat | beabsichtigt | Blinzeln der Lider beim Aufwachen |
| 24,5–27,5 s | Monotonie-Kandidat | beabsichtigt, aber Schwäche | Aufsicht auf das Gesicht, Haare/Bart wachsen langsam, Kamera dreht 40°; wenig Bildänderung |
| — | LRA 3,4 LU (< 6) | Schwäche | wie bei früheren Produktionen; Musikstile unverändert bis Hörprüfung (Guide 18.13 E) |
| Klick-Kandidaten | 30 Stellen | anhören | regelmäßiges Raster 0,36 s in Monitor-Beats = Monitor-Piep der Atmosphäre `monitor` (beabsichtigt) |

## B. Visuell

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Keine monotonen Phasen | OK mit Einschränkung | jeder Beat hat ein Ereignis; 24,5–27,5 s ruhig (s. o.) |
| Figuren konsistent | OK | Hauptfigur ein Objekt: Jacke navy auf der Straße, Kittel im Krankenhaus, Haare/Bart wachsen stetig (0 → Jahr 10); Lea durchgehend rostroter Mantel, Haare werden grau; Mama gleiches Modell, ergraut |
| Gefühle lesbar | OK | Lea weint (9–11 s), Mama traurig (21–23 s), Mama wütend (35 s), Schock beim Aufwachen (43 s), Weinen/Lachen am Ende (57–60 s) |
| Keine fehlerhaften Animationen | OK mit Einschränkung | Render 3 ohne Durchdringungen gefunden; Lea rennt bei 55 s rechts aus dem Bild – Beine groß im Vordergrund (Ausgang, wirkt hektisch) |
| Kamera | OK | pov, low, high, orbit, close, push, still, pull; 6 Bildgrößen, keine Wiederholung hintereinander (Validator) |
| Übergänge | OK | Abblenden an Ortswechseln, harte Schnitte im selben Raum; Texte enden vor dem Schnitt |
| HUD + Texte lesbar | OK | alle Zeilen ≤ 2 Bildschirmzeilen; HUD ändert sich in 12/16 Beats; Handy-Texte lesbar (3,3 s, 49–52 s, 53,4 s) |
| Licht, Schatten, Farben | OK mit Einschränkung | motivierte Lichtquellen je Ort; Ende (56–61 s) etwas milchig durch warmes Fensterlicht + Bloom |
| Stil Guide 18 | OK | Würfelfiguren mit Gesicht, erzählende Requisiten (Handy, Teller, Foto auf Stuhl, Karten, Teddy, Monitor) |
| L1 Farbhierarchie | OK | `balance.json`: stark gesättigte Pixel 4,8 % (Referenz C 12–14 %), Akzent = Leas Mantel |
| L2 Motiviertes Licht | OK | Laternen/Scheinwerfer im Regen, Blaulicht, Leselampe nachts, Fenster-/Deckenlicht, Lichterketten |
| L3/L4 Tiefe & Oberflächen | OK mit Einschränkung | nasse Straße mit Glanz, Fliesen, Rasen, Skyline; Innenräume eher glatt |
| Schauwert je Akt | OK | Akt 1 Scheinwerfer im Regen (0–1,2 s), Akt 2 Zeitraffer-Zimmer (16–20 s) + Hochzeit mit ~170 Gästen (28–32 s), Akt 3 grelles Aufwachen (40–44 s) |

## C. Dramaturgisch

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Einstieg | OK | Frame 0: Scheinwerfer rasen zu, Hände tippen, Titel + HUD „TAGE IM KOMA 0“ |
| Entwicklung ohne Sprecher | OK | Unfall → Intensiv → Lea → Zeitraffer → Familie/Freunde → Abschalten → Zucken → Aufwachen → Handy → Flur → Wiedersehen |
| Abwechslung | OK | 6 Orte, Tag/Nacht, Ich-Sicht in 3 Momenten |
| Eskalation | OK | HUD 1 → 3.640 Tage; Rückschläge (Teller, leerer Stuhl, Abschalten) vor der Wende |
| Ende | OK | Pointe `e_arrive` 56,8 s (Umarmung, Klang), danach 4,4 s, Endkarte „Würde jemand zehn Jahre auf dich warten?“ + „Teil 2?“ |
| Vergleich mit Referenzen | siehe unten | |
| C9 Ein Einsatz | OK | ein Zähler (Tage), eine Beziehung (Lea) bis zum Schluss |
| C10 Ursache ohne Text | OK | 3,3 s Handy „Nicht zugestellt“ im Bild (lesbar in voller Auflösung, im 240-px-Bogen nur als Handy erkennbar); 10,9 s Lea mit Handy; 14,3 s Lea tippt |
| C11 Ich-Perspektive | OK | Aufprall, Aufwachen (Lider, Hände), Handy; Gefühl über Lea/Pflegerin |
| C12 Wissensanker | OK mit Einschränkung | Akt 1 GCS 3/15 (Zeile), Akt 2 Haare 15 cm/Jahr (Zeile), Akt 3 Jan Grzebski nur im Beat-Sheet/LOG, nicht im Bild |
| C13 Sprache | OK (Claude) – Abnahme offen | Du-Form, „ “, de-DE-Zahlen, HUD in Versalien ohne ß; Bildtexte deutsch (Chat, Sperrbildschirm „Dienstag, 14. Oktober 2036“, „INTENSIVSTATION“) |

**Vergleich mit der Upload-Referenz und C1/C2/B1:**
- Besser als die Upload-Referenz: Hook (Aufprall 1,2 s statt ≈ 4,5 s), Licht (Lichtquellen statt flacher Ausleuchtung), Zeit sichtbar
  in der Einstellung (Haarwuchs, Zeitraffer, Altern), Ton-Dramaturgie (Stille nach Aufprall und vor der Pointe statt konstanter Musik,
  Referenz LRA 1,8 vs. 3,4 LU), aufgebaute Pointe statt Gag, mehr Orte/Figuren.
- Gleichwertig: Würfel-Stil, HUD-Zeitsprünge, Ich-Sicht-Dosierung.
- Schwächer: Kamerafahrten wirken teils eng/ruckelig in 9:16 (Nachtszene 36–40 s zeigt viel Bettkante/Wand, Arzt-Szene zeigt die
  Ärztin von hinten); Modelldetail der Figuren niedriger als die Referenz (Referenz hat abgerundete Low-Poly-Formen, Stoffdecke,
  Bäume); Innenräume glatter; Ton bassig (61 % < 100 Hz, Präsenz 1 %) wie bei früheren Produktionen.

## H. Hook (0–15 s)

| Punkt | Ergebnis | Beleg |
|---|---|---|
| H1 Frame 0 ungewöhnlich? | Ja | Scheinwerfer im Regen direkt vor dir, Hände am Handy (sheet_01 0,0 s) |
| H2 Stummschalt-Test 0–3 s | Ja | Auto rast zu → Weißblitz → du liegst reglos auf dem Zebrastreifen, Handy daneben |
| H3 Unmöglichkeitstest | Ja (mit Einschränkung) | Prämisse „du fällst ins Koma“: Aufprall + Reglosigkeit + Lichttest ohne Reaktion (6,4 s) zeigen den Beginn des Komas; Unfall an sich wäre auch ohne Koma möglich – das Koma wird durch Reglosigkeit/Monitor belegt |
| H4 Frage offen | Ja | „Wachst du auf, wer wartet?“ – bis 15 s größer (Lea, ihre Nachrichten), nicht beantwortet; erste Zeile (5,4 s) verschärft (3 von 15) |
| H5 Eskalation | Ja | Scheinwerfer → Aufprall → reglos → Nachricht nicht zugestellt → keine Pupillenreaktion → Lea bricht zusammen → sie schreibt ins Leere |
| H6 Füllstoff/Vorwegnahme | Nein/Nein | kein Kulissenereignis; Aufwachen/Pointe erst ab 40 s |
| H7 Eigenständigkeit | Ja | letzte: process/flashforward/ohne; hier proof (LOG) |
| Validator [18.12] | OK | keine Fehler; Warnung [2] erste Zeile 5,4 s begründet im LOG |

## D. Hörprüfung (nur durch einen Menschen)

- [ ] Kopfhörer, komplette Länge · [ ] Handylautsprecher · Name/Datum: ______ – **offen, beim Nutzer angefragt**
- Besonders prüfen: Herzschlag-Synchronität (2,3 / 35,4 / 38,8 s), Monitor-Piep in der Atmosphäre, Stille 1,2–5 s und 52,2–56,9 s, Bassanteil am Handy
- [ ] Sprachabnahme (18.14 D12) – **offen, beim Nutzer angefragt**

## Verworfene Renders

| Render | Fehler | Ursache | Korrektur |
|---|---|---|---|
| 1 | graues Standbild 35,07–36,1 s | Orbit-Kamera fuhr durch die rechte Zimmerwand | dist 4,3 → 3,6, yaw 24 |
| 1 | Handy-POV verdeckt HUD und Text (48–52 s) | zu groß/zu hoch | Größe 0,45, Position, Belichtung |
| 1 | Lea läuft durch die Kamera (55,1 s, < 4 Frames) | Laufweg Richtung Kamera | Laufweg nach rechts |
| 1 | Hell/Dunkel-Sprünge an Abblenden (5,0 / 28,1 / 52,5 s) | dunkle Straße ↔ helle Klinik | Belichtung am Beat-Rand absenken |
| 2 | Mama hält in der Arzt-Szene den Teller aus der Küche (33–35 s) | Sichtbarkeit nur im Küchen-Beat gesetzt | Teller außerhalb ausgeblendet |
| 2 | grüner Monitorschein im Gesicht am Ende | Monitor-Leuchte | Leuchte in Sitz-Beats gedimmt |
| 2 | Lea beim Aufstehen kopflos im Bild (55 s) | Nahaufnahme zu eng | halbnahe Einstellung |

## Ergebnis

**QUALITÄT GEPRÜFT (mit offenen Schwächen)** – A vollständig eingestuft (technischer FAIL = 2 Messartefakte an Abblenden, Strips
gesichtet), B + C + H geprüft. **Nicht FREIGEGEBEN:** Hörprüfung und Sprachabnahme durch den Nutzer fehlen.
