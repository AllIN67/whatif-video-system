# Produktionsprotokoll – What if everyone could read your mind for 10 seconds?

| Feld | Wert |
|---|---|
| Slug | `what-if-mind-reading-10s` |
| Produktionsstil | **B (TikTok-Referenz) – Rezept B1 „Eskalations-Zähler“** (Auftrag des Nutzers 2026-10-29: „Select Style B1 … record that choice“). Referenzen B1: R04, R07, R17, R18 |
| Sprache | en (Titel, HUD, Textzeilen, Caption) |
| Status | siehe Abschnitt 5 |
| Style-Guide-Version | 1.3 (1.3.1 = nur Baukasten-Bestandsliste ergänzt) |
| Git-Commit des Renders | siehe `render/run_log.json` (`git_commit`) |
| Länge | 63,0 s · 1080×1920 · 30 fps |

## 1. Entscheidungen

- **Auftrag (Nutzer, 2026-10-29):** TikTok-Video „What If Everyone Could Read Your Mind for 10 Seconds?“, lustig, alltagsnah,
  eskalierend bis weltweit; Stil B1; 60–70 s, nie unter 60 s; Hook, Schule, soziale Katastrophe, weltweite Eskalation,
  Twist („Wait… did you all hear what I was thinking about you?“), Schleife + Kommentarfrage; nur vorhandene Pipeline und
  lokale/kostenlose Mittel. Plan zweimal vorgelegt; erste Fassung enthielt fälschlich Sprecher/Wort-Untertitel – vom Nutzer
  korrigiert: **Stil B = kein Sprecher, keine Sprecher-Untertitel** (Guide 9.1, 17). Zweite Fassung freigegeben.
- **Frage/Titel:** „What if everyone could read your mind for 10 seconds?“ (10 Wörter, Hervorhebung *mind*), ab Frame 0, 0–3,5 s.
  Die vom Auftrag gewünschte Hook-Zeile „Everyone can hear your thoughts.“ ist die erste Textzeile (3,7 s, Guide 2: 3,5–5,0 s).
- **HUD:** SECRETS EXPOSED 0 → 10 (Schule/Alltag) → PEOPLE EXPOSED 10 → 8,000,000,000 (Welt) → MIND READING / OFF.
  Unterzeile TIME LEFT 0:10 → 0:00 zählt die zehn Story-Sekunden (eine je Station; die 10 s sind über das Video gedehnt).
  Segmente einer Phase teilen dieselben Werte-Keys, damit der Fortschrittsbalken innerhalb der Phase stetig ist; er beginnt
  mit jedem Label-Wechsel neu (Verhalten von `overlay.js`, wie in `templates/timeline.json`).
- **Pointe:** 58,0 s – die Klasse dreht sich zu dir (der Schwarm hat etwas über dich gedacht). **Ende:** Schleife – über dir
  bläht sich eine neue, leere Blase auf (wie die erste Blase über der Lehrerin), letzte Zeile „What would they hear from you?“
  (Kommentarfrage). Der Kreisschluss ist inhaltlich (Blase → Blase), nicht kameragenau.
- **Twist-Zeile gekürzt:** Wortlaut des Auftrags hat 11 Wörter, Guide 4 erlaubt 10 → „Wait… did you all hear what I thought about you?“
  (mit dem Nutzer im Plan abgestimmt).
- **Gedankenblasen** zeigen nur Piktogramme (??? · Pizza · Herz · durchgestrichene Krawatte · Umschlag · Tür · Sterne · Torte · Zzz · Ohr ·
  leer), weil Guide 1.3 Text in 3D-Texturen ausschließt; den Wortlaut tragen die Textzeilen. „?“ und „Z“ sind als Symbole gezeichnet.
- **Kamera-Paradigma P4 (Stationsreise):** B1 verlangt ein neues Ereignis alle 3–4 s an einem eigenen Ort. 18 Einstellungen,
  2,8–4,4 s lang; Übergänge Abblende (4 Frames) und Whip (8–9 Frames); eine Orientierungs-Totale von oben (46,2–≈ 48 s).
- **Licht:** eine Stimmung („day“) für alle Orte; Dramaturgie über Musik/Stille statt Lichtwechsel; keine Weißblende (Blitzregel).
- **Figuren:** Hauptfigur „you“ (orange Shirt, kurze dunkle Haare) in Klassenzimmer, Café und Bushaltestelle identisch; Chef in Büro
  und Besprechung identisch (magenta Krawatte = Krawatte im Piktogramm). Keine realen Personen, keine Marken.
- **Ton:** Musik `music_synth.py` (pulse → drive → drive_hi → Stille → calm → Stille → calm), SFX `sfx_synth.py`
  (tick = Blase ploppt, hit = Pointe/Reaktion, whoosh = Whip, swoosh, riser, rumble, impact am Höhepunkt). Es gibt kein Lachen
  oder Stimmengewirr im Repository → Reaktionen nur im Bild. Bewusste Stille 49,8–50,8 s (Effekt endet) und Musikpause
  55,6–58,0 s vor der Pointe.

### Abweichungen vom Style-Guide (Regel · Abweichung · Begründung)

| Regel | Abweichung | Begründung |
|---|---|---|
| 1.3 Keine Texte in 3D-Texturen | Wecker im Schlafzimmer zeigt „9:47“ (Kit-Standard, Ziffern) | sprachneutrale Ziffern, wie im Baukasten-Beispiel; keine Wörter |
| 6.1 Vorder-/Mittel-/Hintergrund | einzelne Einstellungen (Büro-Totale, Straße) mit wenig Vordergrund | Lesbarkeit der Blasen im Hochformat hatte Vorrang |

## 2. Fakten und Quellen

| Aussage/Zahl | Quelle |
|---|---|
| ≈ 8 Milliarden Menschen (HUD-Endwert 8,000,000,000; Zeile „Eight billion minds“) | Vereinte Nationen, „World population to reach 8 billion on 15 November 2022“, UN DESA (Pressemitteilung, Juli 2022) |
| Zwischenwerte 2,400,000 · 90,000,000 · 600,000,000 · 3,100,000,000 | erzählerische Ausbreitungsstufen (Szenario), keine Tatsachenbehauptung |
| Alle übrigen Inhalte | fiktives Szenario |

## 3. Assets und Lizenzen

| Asset | Herkunft | Lizenz | Nachweis |
|---|---|---|---|
| 3D-Figuren, Orte, Requisiten, Gedankenblasen | eigener Baukasten `pipeline/runtime/kit/` (Code) | eigene Erzeugung | Git |
| Schriften Fraunces, JetBrains Mono | @fontsource (npm) | SIL OFL 1.1 | `package.json` |
| Musik | `tools/music_synth.py`, Plan `timeline.json → audio.music.main` | eigene Erzeugung, keine Samples | deterministisch |
| SFX | `tools/sfx_synth.py` (tick, hit, whoosh, swoosh, riser, rumble, impact) | eigene Erzeugung | deterministisch |

## 4. Baukasten-Ergänzungen (für alle weiteren Videos)

- `props.thoughtBubble({ icon, tail, size })` – Wolke + Pünktchenspur, Piktogramme ohne Schrift, `userData.pop(seit, seitZu)` mit Überschwingen.
- `places.classroom` (Tafel ohne Schrift, Pult, Schülertische, `spots.seats[r][c]`), `places.cafe` (Zweiertisch, Theke, Lampen).
- `places.office` mit `cols`/`rows` und `spots.desks` (Standard 3 × 2 unverändert).
- `human`: Gefühl `laugh`, Pose `liePhone`, beliebige Oberkörper-Pose sitzend (`pose(name, p, { seated: true })`).
- Kamera-Positionen wurden mit Vorschaubildern (`tools/still.mjs`) Einstellung für Einstellung festgelegt (≈ 10 Vorschau-Durchläufe).

## 5. Render und QA

(wird nach dem Render ergänzt)
