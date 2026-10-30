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
- **Beats:** 17 (2,2–4,4 s, Median 4,0 s), 8 Orte (Schlafzimmer, Küche, Straße, Café, Büro, Park, Stadt-Totale, Gewitterstraße),
  9 Gefühle (tired, worried, panic, happy, angry, sad, shock, relief …), Kamera-Vorlagen orbit, push, track, close, pov, low, high –
  6 Bildgrößen, keine Wiederholung hintereinander (Validator).
- **Licht:** je Ort eigene Stimmung (interior, day, sunset im Café, storm, dusk → blackout als Ereignis, nightRoom → blackout als Pointe).
- **Ton:** Musik `music_synth.py` (pulse → drive → calm im Energiesparmodus → drive (Powerbank) → pulse (leer) → drive_hi (Gewitter,
  Stromausfall) → calm (Einstecken) → **Stille 57,8–59,0 s (Pointe)** → pulse). Atmosphären room/city/rain. 25 Ereignisse, davon
  21 mit Klang (buzz, pop, loss, thud, heartbeat, ding, charge, shimmer, power_down, zap+boom, rumble); HUD-Stufen mit leisem pop;
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

(wird nach dem Render ergänzt)
