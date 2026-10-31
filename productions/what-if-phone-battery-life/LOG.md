# Produktionsprotokoll – What if your phone battery was your life?

| Feld | Wert |
|---|---|
| Slug | `what-if-phone-battery-life` |
| Produktionsstil | **B – Rezept B1** (Testvideo der finalen Systemüberarbeitung, Auftrag 2026-10-30: „repräsentatives Testvideo mit der tatsächlichen Pipeline“) |
| Sprache | en |
| Status | siehe Abschnitt 5 und `quality_review.md` |
| Style-Guide-Version | 2.0 (Abschnitt 18) |
| Beat-Sheet / Freigabebogen | `beats.json` / `quality_review.md` |
| Git-Commit des Renders | siehe `render/run_log.json` |
| Länge | 61,4 s · 1080×1920 · 30 fps · 1842 Frames |

## 1. Entscheidungen

- **Frage:** „What if your phone battery was your life?“ (8 Wörter, Hervorhebung *battery*). Alltag, zweite Person (Rezept B1).
- **HUD:** YOUR LIFE (= PHONE BATTERY) 100 % → LOW POWER MODE → CRITICAL → CHARGING → CRITICAL 4 %. Der Wert ändert sich in jedem
  Beat (Stufen mit Impuls oder stetig), das Handy-Display in der Szene zeigt denselben Wert (`hudAt`).
- **Bogen (Hoffnung/Rückschlag):** Aufwachen → jedes Wischen kostet Leben → Bus verpasst, Karte frisst Akku → Steckdose im Café
  weggeschnappt → Videoanruf des Chefs (großer Verlust) → Energiesparmodus im Park (Taube landet auf dem Kopf) → Fremde schenkt
  Powerbank (Gewinn) → Powerbank leer → Gewitter → **Stromausfall der Stadt** (Aufbau) → Ladesäule tot → Zuhause leuchtet noch →
  Einstecken (Erleichterung) → **Pointe: auch zu Hause fällt der Strom aus** (Auszahlung des Stromausfalls) → Endkarte
  „How long would you last? / Part 2?“.
- **Beats:** 17 (2,2–4,4 s, Median 4,0 s), 7 Orte laut Beat-Sheet (Schlafzimmer, Küche, Straße – auch als Gewitterstraße –, Café, Büro, Park, Stadt-Totale),
  8 Gefühle (tired, worried, panic, happy, angry, sad, shock, relief), Kamera-Vorlagen orbit, push, track, close, pov, low, high –
  6 Bildgrößen, keine Wiederholung hintereinander (Validator).
- **Licht:** je Ort eigene Stimmung (interior, day, sunset im Café, storm, dusk → blackout als Ereignis, nightRoom → blackout als Pointe).
- **Ton:** Musik `music_synth.py` (pulse → drive → calm im Energiesparmodus → drive (Powerbank) → pulse (leer) → drive_hi (Gewitter,
  Stromausfall) → calm (Einstecken) → **Stille 57,8–59,0 s (Pointe)** → pulse). Atmosphären room/city/rain. 26 Ereignisse,
  alle mit Klang (buzz, pop, loss, thud, heartbeat, ding, charge, shimmer, power_down, zap+boom, rumble); HUD-Stufen mit leisem pop;
  Whips mit Luftzug, Spitze auf dem Schnitt.
- **Erkenntnis beim Bauen (→ Guide 18.3):** Im Hochformat beträgt der horizontale Bildwinkel bei fov 48° nur ≈ 28°. Die erste
  Fassung der Bus-Szene ließ die Figur schneller laufen als die Begleitkamera – sie war nicht im Bild. Korrektur: gleichmäßige
  Bewegung wie die Kamera.

### Abweichungen vom Style-Guide

| Regel | Abweichung | Begründung |
|---|---|---|
| 1.3 keine Texte in 3D-Texturen | keine – Handy zeigt nur Symbole (Akku, Anrufer-Würfelkopf), Wecker Ziffern | – |
| 6.1 Vorder-/Mittel-/Hintergrund | Stadt-Totale ohne Vordergrund | Orientierungs-Totale von oben (Guide 5.2) |

## 2. Fakten und Quellen

Fiktives Szenario; keine Tatsachenbehauptungen mit Zahlen (alle Prozentwerte sind erzählte Akkustände).

## 3. Assets und Lizenzen

| Asset | Herkunft | Lizenz |
|---|---|---|
| Figuren, Orte, Requisiten | Baukasten `pipeline/runtime/kit/` (Code) | eigene Erzeugung |
| Schriften Fraunces, Montserrat, JetBrains Mono | @fontsource (npm) | SIL OFL 1.1 |
| Musik | `tools/music_synth.py` | eigene Erzeugung |
| Klänge | `tools/sfx_synth.py` | eigene Erzeugung |

## 4. Baukasten-Ergänzungen (für alle weiteren Videos)

Powerbank (LED-Stand), Steckdose, Ladekabel, Ladesäule (Bildschirm an/aus), Taube (Flügelschlag), Blitz, Handy-Modi `battery`/`call`,
Gebäude mit schaltbarem Fensterlicht (`userData.setLit`), `street().buildings`, Lichtstimmungen dusk/storm/blackout/nightRoom,
`fx.rain`, `fx.burst`; Posen/Gefühle siehe Guide 16.3.

## 5. Render und QA

### Durchlauf 1 – 2026-10-30 (Commit eeaeab1, Doku-Commits danach ohne Einfluss auf das Bild)

- Befehl: `node pipeline/run.mjs --production productions/what-if-phone-battery-life` · 1842 Frames · ≈ 1,3–1,6 s/Frame · ≈ 46 min
- Mix: 61,400 s · −14,2 LUFS · TP −1,5 dBTP (Datei −1,1 dBTP) · LRA 10,9 LU
- `video_qa.py`: **FAIL**
- Angesehen: sheet_01–03 (alle, inkl. Ende), Bildstreifen 8,067 / 20,467 / 33,400 / 46,200 / 57,800.

| Zeitpunkt | Befund | Einstufung | Ursache | Korrektur |
|---|---|---|---|---|
| 8,1 / 20,5–20,6 s | „Einstellung < 4 Frames“ (FAIL) | Fehler | Whip dreht die Kamera aus dem Innenraum in eine Wand (graue/rote Flächen) | Abblende statt Whip; Regel im Guide 18.3 |
| 44,9–46,2 s | Schwarzbilder (FAIL) | Fehler | Stadt nach dem Stromausfall fast schwarz | hellere Nachtstimmung (Mondlicht) |
| 33,4 s | Sprung | Fehler | Figur springt beim Aufstehen 0,45 m nach vorn | Verschiebung überblendet |
| 32–34 s | Geschichte unklar | Fehler (Sicht) | Fremde mit Powerbank außerhalb des Bildes (9:16-Bildwinkel) | Stellung + Kamera senkrecht zur Verbindungslinie |
| 46,5–49,5 s | Monotonie-Kandidat | Fehler (Sicht) | Figur steht nur vor der Säule | Ankunft im Laufen, Schlag auf die Säule, Knien |
| 50–53 s | „home still has light“ ohne Bild | Fehler (Sicht) | Fenster außerhalb des Bildes | Begleitkamera von hinten auf das Fenster |
| 53–57 s | Einstecken nicht erkennbar, dunkel | Fehler (Sicht) | Steckdose hinter dem Bett, schwaches Licht | Steckdosenleiste im Bild, Funken, Lampe vor der Figur |
| 0–4 s | Monotonie-Kandidat | Verbesserung | liegende Figur, kleiner Schwenk | Wackeln beim Wecker, Schwenk 30° |
| 58–61 s | Monotonie-Kandidat | beabsichtigt (Endkarte), verbessert | Großaufnahme im Dunkeln | Heranfahrt statt fester Nahaufnahme |
| Klick-Kandidaten 0,7–18 s im 0,4-s-Raster | Transienten | beabsichtigt (vorläufig) | Hi-Hat des Musikstils „pulse/drive“ (wie in what-if-mind-reading-10s) | Hörprüfung |
| Synchronität | 1. Messung zeigte −30…−50 ms | Messfehler | Suchfenster ab −50 ms erfasste Musik-Anschläge vor dem Klang | Fenster −15…+60 ms; Nachmessung: 34/37 erkannt, Versatz −15…+10 ms (1 Frame = 33 ms), 3 verdeckt, 1 Grenzfall (+60 ms, leiser HUD-pop) |

### Durchlauf 2 – 2026-10-30 (Commit dfaa333, nicht „dirty“)

- Befehl wie Durchlauf 1 · ≈ 1,3 s/Frame · ≈ 45 min
- Datei `render/final.mp4`: 61,400 s · 1080×1920 · 30 fps CFR (1842 Frames) · H.264 + AAC 48 kHz · 34,5 MB
- Ton: −14,2 LUFS, TP −1,1 dBTP, LRA 10,9 LU; Ereignis-Klänge 35/38 erkannt, Versatz −15 … +10 ms
- `video_qa.py`: **REVIEW, kein FAIL** (keine Schwarzbilder, keine Kurz-Einstellungen, keine Monotonie-Kandidaten)
- **Werkzeugfehler gefunden:** `inspect_frames.py` ließ Streifen früherer Renders im Ordner liegen (81 statt 71 Dateien, darunter der
  alte Whip bei 8,067 s). Korrigiert (alte `strip_*.jpg` werden vor dem Schreiben gelöscht), Streifen neu erzeugt.
- Angesehen: sheet_01–03 (inkl. Ende), shots.jpg, **alle 71 Bildstreifen** (12 Sammelbilder à 6). Einstufung aller Meldungen und
  Sichtbefunde: `quality_review.md`.
- Bekannte Einschränkungen (bewusst nicht in einem dritten Render behoben, um den Auftrag abzuschließen – Korrektur jeweils in der
  Szene möglich): Kontinuitätsbruch 35,4 s (stehend → sitzend), Ladesäulen-Szene 46–50 s zu dunkel (Knien kaum lesbar), Zeile
  während des Blitzes 39,0–39,3 s kontrastarm, Café-Ich-Perspektive zeigt die Steckdose klein.
- Auslieferung: `render/final.mp4` per `SendUserFile` als Anhang übergeben (Rückmeldung des Werkzeugs: „1 file delivered“, file_uuid
  9c9c5751-a17e-43f7-95ef-a0e49ef1647a).

## 6. Vergleich mit den Referenzen (R07, R19, R20)

| Merkmal | Referenzen | Testvideo | Bewertung |
|---|---|---|---|
| Takt | 4,0 s (R07/R19), Median 1,5 s (R20) | 17 Beats, 2,2–4,4 s, Median 4,0 s | gleichwertig zu R07/R19 |
| Ereignis pro Szene | ja | ja (26 Ereignisse) | gleichwertig |
| Figurenreaktion | Gesten, Gesicht | 11 Gefühle, Reaktionsposen, Blinzeln, Schweiß/Wangen | gleichwertig bis besser lesbar als R07/R19 (größere Mimik) |
| Kamera-Abwechslung | Untersicht, Nah, Aufsicht, Ich-Perspektive | 7 Vorlagen, 6 Bildgrößen | gleichwertig |
| HUD | Wert in jeder Szene, Labelwechsel | Wert in jedem Beat, 4 Labels, Akzente rot/gold | gleichwertig, zusätzlich Akzente |
| Ton | Musikbett + wenige Akzente | Musikbett + Atmo, alle 26 Ereignisse mit Klang (27 Klänge) + HUD-pops + 1 Luftzug, synchron gemessen | stärker akzentuiert; **Klangqualität ungehört** |
| Licht/Materialien | weiche Ausleuchtung, AO-artige Schatten, Detailreichtum (R07), Malstil + Tiefenunschärfe (R20) | flache Schattierung, Nacht-/Gewitterszenen teils sehr dunkel | **schwächer als R07/R20** |
| Detaildichte der Orte | viele Kleinteile je Szene | Kit-Orte mit wenigen Requisiten | **schwächer** |
| Ende | offene Frage / Part 2 | Pointe + Frage + Part 2 | gleichwertig |

**Ergebnis:** Dramaturgie, Takt, Figurenreaktionen, HUD und Synchronität entsprechen dem Referenzniveau von R07/R19. Die
**Bildqualität (Licht, Materialien, Detaildichte) erreicht die Referenzen noch nicht** – das ist die wichtigste offene Baustelle
für künftige Kit-Ergänzungen (Guide 18.10 erlaubt neue Kit-Teile).

## 7. Status

**Vom Auftraggeber am 2026-10-30 vollständig abgenommen** („gefällt mir vollständig“) und zum verbindlichen Produktionsstandard erklärt (Guide 18.11).
Eine ausdrückliche Bestätigung der Hörprüfung (Kopfhörer + Handylautsprecher) liegt nicht gesondert vor.

## 8. Nach Veröffentlichung – Analytics und Hook-Befund (2026-10-31)

| Plattform | Aufrufe | Länge | Ø Wiedergabe s | Abschlussrate | nach 2 s % | 50 %-Punkt (s) | Likes-Spitze (s) |
|---|---|---|---|---|---|---|---|
| (Angabe Auftraggeber) | ≈ 3.100 | 64 s | 27,4 | 19 % | ≈ 75 | ≈ 14 | 1 |

- **Befund (gesichtet an 12 Vorschaubildern 0–17 s, `REFERENCE_ANALYSIS.md` 10.3):** Frame 0–3 s zeigt eine schlafende Figur, das
  Handy ist hinter dem Titel nicht erkennbar; der Auslöser ist ein HUD-Abzug von 1 %. Bis 14 s: 4 Prämissen-Ereignisse, alle nur
  als Zahl (−1/−2/−2/−6), dazu 5 Alltagsereignisse ohne Prämissenbezug (Wecker, Toast, Bus, Keuchen, Steckdose gesehen); Toast und
  Bus sind in den Vorschaubildern nicht einmal im Bild. Der erste große Verlust (77 → 32 %) kommt bei 21,6 s.
- **Einordnung:** plausible Ursache des Abgangs bis 14 s, nicht bewiesen (eine Messreihe, kein Vergleich).
- **Folge:** Guide 18.12 (Hook-Standard). `beats.json` dokumentiert den tatsächlichen Einstieg (`hook`, `premise`); der Validator
  meldet dafür 2 Fehler `[18.12]` – **beabsichtigt**. Das Video ist für Bild, Kamera, HUD und Ton weiterhin Maßstab (18.11), für den
  Einstieg Gegenbeispiel. Ein Neu-Render ist erst mit neuem Einstieg zulässig (Beispiel in Guide 18.12). Bild und Ton des
  ausgelieferten Videos sind unverändert (nur additive Felder in `beats.json`/`timeline.json`).
