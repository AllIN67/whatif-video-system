# Produktionsprotokoll – Was wäre, wenn du ins Koma fällst?

| Feld | Wert |
|---|---|
| Slug | `what-if-koma` |
| Produktionsstil | B – Rezept B1 (Prüfregeln), Erzählform **B4 Überlebensbogen mit Zeitsprüngen** (Guide 18.13 F) |
| Sprache | de (Guide 18.14) |
| Status | QUALITÄT GEPRÜFT (mit offenen Schwächen) – nicht freigegeben: Hörprüfung + Sprachabnahme offen |
| Style-Guide-Version | 3.2 |
| Beat-Sheet / Freigabebogen | `beats.json` / `quality_review.md` |
| Git-Commit des Renders | keiner – Auftrag: keine Commits ohne Freigabe; Render auf ungesichertem Arbeitsstand (`run_log.json` meldet „dirty“) |
| Länge | 61,2 s (16 Beats) |

## 0. Referenzanalyse (Upload `snaptik_7705438530490600735_v3.mp4`, 61,0 s, 1080×1920, 30 fps)

Englisches Video „What if you fell into a coma?“ desselben Formats (Würfel-/Low-Poly-3D, HUD „TIME IN A COMA“, Kursiv-Untertitel).
Gesichtet: Kontaktbögen 1 fps über die ganze Länge, 6 fps für 0–4 s, Lautheitsverlauf.

| # | Punkt | Befund Referenz | Konsequenz für uns |
|---|---|---|---|
| 1 | erste Sekunden | Ich-Sicht Fahrrad (rote Ärmel, Lenker), Abendstraße, Titel 0–3 s; Auto erscheint erst bei ≈ 3,5 s, Aufprall ≈ 4,5 s | Bedrohung ab Frame 0 im Bild (Scheinwerfer rasen zu), Aufprall bei 1,2 s |
| 2 | visuelle Hook | Ich-Perspektive + Gefahr; stark, aber spät (Prämisse erst ab 4–5 s) | Beweis-Ereignis ≤ 2 s (18.12 H3) |
| 3 | Kamera | Ich-Sicht (Rad, Trage im Flur, Aufwachen, Handy), sonst fast nur halbnahe Standbilder mit leichter Drift; ein Außen-Zeitraffer | 5 Bildgrößen + Aufsicht/Ich-Sicht/Nah im Wechsel |
| 4 | Krankenhaus | helles, flach beleuchtetes Zimmer; Monitor, Karten an der Wand, Teddy, Infusion; leerer Flur | Kit-Zimmer mit Lichtfeldern, Monitor-Leuchten, Fenster mit Tages-/Jahreszeitlicht, Nachtlicht |
| 5 | Patient | meist von der Seite/unter Decke, Haare/Bart wachsen im Schnitt (Jahr 5) | Haare/Bart wachsen **sichtbar in der Einstellung** (Aufsicht) |
| 6 | Zeitsprünge | HUD 0 DAYS → 1 DAY → 169/182 DAYS → 2 → 5 → 10 → 20 YEARS; Sprünge v. a. über Untertitel | ein Zähler in Tagen (1 → 3.653), läuft sichtbar (linear) im Zeitraffer |
| 7 | Lebensphasen | Mutter am Bett, Karten, Jahreszeiten draußen, Hund wird alt, Eltern grau | Lea/Mutter altern sichtbar (Haarfarbe), eigene Stationen: Wohnung, Esstisch, Hochzeit mit leerem Stuhl, Abschalt-Gespräch |
| 8 | Charakteranimation | steif, Figuren stehen meist; Mutter mit Ziehbewegung | `act()`-Spuren mit Reaktionen (Hand vor Mund, Aufschrecken, Jubel, Umarmung) |
| 9 | Übergänge | harte Schnitte, Schwarz nach Aufprall | Weißblitz beim Aufprall, Abblenden an Ortswechseln, Lider als Übergang ins Wachsein |
| 10 | Licht | gleichmäßig hell, kaum Lichtquellen außer Abendstraße | motiviertes Licht je Ort (Laternen/Scheinwerfer im Regen, Leselampe nachts, Fensterlicht, goldene Stunde) |
| 11 | Sound | gemessen: −19,4 LUFS, LRA 1,8 LU, Pegel 0–60 s konstant −20…−22 dB (durchgehende Musik ohne Dynamik) | Stille nach dem Aufprall, Herzschlag, Monitor-Atmo, Musikabschnitte an Story-Beats, Ruhe vor der Pointe |
| 12 | Text/HUD | Kursiv-Zeilen unten-mittig, HUD links oben mit Label/Unterzeile | unser eingefrorenes HUD (18.5); Zeilen ≤ 2 Bildschirmzeilen |
| 13 | Gesamtqualität | sauber, aber leer und statisch; Pointe (Handy: 4.812 Nachrichten, „You're fired.“) als Gag | emotionale, früh vorbereitete Pointe statt Gag |

Besonders gut: Ich-Sicht-Einstieg, wachsende Haare als Zeitbeweis, Requisiten-Kontinuität (Karten, Teddy), Handy am Ende als
Zeitkapsel. Verbesserungspotenzial: später Hook, leere Szenen, kaum Bewegung in der Einstellung, flacher Ton, Pointe ohne Aufbau.
**Nicht übernommen:** Fahrrad, Hund, Eltern-Szene, Zukunftsstadt, Chef-Gag, 20-Jahre-Sprung.

## 1. Entscheidungen

### Hook-Entwurf (Guide 18.12 H10 – vor dem Beat-Sheet)

| # | Hook-Typ | Frame 0 (was sieht man ohne Text?) | Beweis-Ereignis | Frage bei 3 s | zurückgehalten | H1–H9 erfüllt? |
|---|---|---|---|---|---|---|
| 1 | proof (**Ich-Variante**) | Ich-Sicht: deine Hände tippen „Bin gleich da!“ an Lea, du stehst auf dem Zebrastreifen im Regen – Scheinwerfer rasen schon auf dich zu | 1,2 s Aufprall, Weißblitz, Handy fliegt; 2 s du liegst reglos, Handy „Nicht zugestellt“ | „Wachst du je wieder auf – und wer wartet dann noch?“ | Aufwachen nach 10 Jahren, Nachricht kommt an | ja |
| 2 | process | Aufsicht auf dich im Intensivbett, Zeitraffer läuft ab Frame 0: Besucher flackern, HUD rast | 0,5 s Haare wachsen sichtbar | „Wie lange dauert das noch?“ | Aufwachen | H4 schwach (kein Einsatz ohne Lea), H8 verrät Zeitverlauf |
| 3 | mystery | Leas Sperrbildschirm 2036: „Schatz: Bin gleich da!“, HUD „TAGE: ???“ | Countdown/Geheimnis | „Warum zehn Jahre später?“ | – | verletzt H8 (Pointe vorweg) |

- Gewählt: #1 – Das Thema verlangt einen Moment, in dem das Leben schlagartig stehen bleibt; die Ich-Sicht macht es zu *deinem*
  Unfall (C1/C2-Prinzip). Das unzugestellte „Bin gleich da!“ ist gleichzeitig Einsatz und Ursache der Pointe.
- Letzte 3 Produktionen: last-light `process` (Dach, Ich-Sicht Skyline), fold-paper `flashforward` (Weltraum), one-argument (ohne Hook-Feld, Friedhof).
  Ich-Sicht wie last-light, aber anderer Typ (`proof`) und anderes Ereignis (Aufprall statt Lichterwelle) – begründet durch C2.
- Prämissen-Ereignisse 0–15 s: 0,0 Scheinwerfer rasen zu (visible) · 0,7 Bremsen, Hände zucken (visible) · 1,2 Aufprall (visible) ·
  2,3 du liegst reglos (visible, näher) · 3,3 Handy „Nicht zugestellt“ (visible, persönlicher) · 5,3 Ärzte am Bett · 6,4 Lichttest ohne
  Reaktion (visible) · 7,7 Tag 2 (hud) · 9,1 Lea kommt · 9,7 Lea bricht zusammen (persönlicher) · 10,9 sie hält dein Handy · 12,9 sie
  schreibt dir · 14,3 gesendet, keine Antwort. Abstände ≤ 2,4 s.

### Story-Kern (Guide 18.13 A)

- Einsatz: dein Leben mit Lea und Familie, das ohne dich weiterläuft. Messgröße: **Tage im Koma** (Labels als Phasen: Unfall → Leben geht weiter → fast zehn Jahre → wach/verpasst).
- Wende (`story.turn`): `e_twitch` (Jahr 10, Lider zucken, Monitor schlägt aus). Hoffnung/Rückschlag: Lea schreibt (Hoffnung) → Mama nimmt den Teller weg → Hochzeit ohne dich → Ärzte raten zum Abschalten (Tiefpunkt) → Lea sagt Nein → Zucken → Aufwachen → Muskeln weg → Nachricht kommt an.
- Pointe `e_arrive` (56,8 s): Lea ist da. Ursachen (`setup_for`): `e_unsent` (3,3 s, Handy „Nicht zugestellt“), `e_lea_phone` (10,9 s), `e_send` (14,3 s). Auflösung über `e_resend` (51,0 s) und `e_buzz` (53,4 s).
- Erzählform B4 statt B1-Eskalationszähler: Das Thema ist eine persönliche Überlebensgeschichte mit Zeitsprüngen (Vorbild C2). Länge 61,2 s (B4 empfiehlt 65–75 s; Pointe-Regel ≤ 5 s nach der Pointe und 16 Beats begrenzen – bewusst kompakt).

### Beats, Orte, Kamera

16 Beats, 6 Orte (Straße, Intensivzimmer, Leas Wohnung, Elternhaus, Hochzeitsgarten, Klinikflur), Gefühle: happy → unconscious → cry → sad → neutral → angry → relief → shock → worried → relief.
Kamera: pov, high, orbit, close, push, still, pull (6 Bildgrößen). Ich-Sicht in 3 Schlüsselmomenten (Aufprall, Aufwachen, Handy).

### Neue Kit-Teile (additiv, Guide 18.10 c)

- `pipeline/runtime/kit/hospital.js` (über `kit.hospital`): `bed`, `monitor` (EKG aus t, deterministisch), `ivStand`, `clock`, `cardWall`, `room` (Intensivzimmer mit Fenster-/Deckenlicht-Steuerung), `corridor`, `chatPhone` (Chat/Sperrbildschirm mit Status „Nicht zugestellt“, Banner, Sprung im Glas). Keine Zufallszahlen aus `rng` → bestehende Szenen unverändert.
- `tools/sfx_synth.py`: Klänge `beep`, `monitor` (Atmosphäre Intensivstation), `vibrate`.
- `kit/index.js`: eine Import-Zeile + `hospital` im Rückgabeobjekt (keine bestehende Schnittstelle geändert).

### Abweichungen vom Style-Guide

| Regel | Abweichung | Begründung |
|---|---|---|
| Auftrag nennt `what-if-phone-battery-life` als B1-Mindeststandard | nicht als Muster verwendet | Guide 18.11 (2026-11-07): Akku-Video ist nur technischer Regressionstest; Mindestwerte prüft der Validator weiter |
| [2] erste Zeile 3,5–5,0 s | erste Zeile bei 5,4 s | 0–5 s tragen Bild + Stille nach dem Aufprall (C2-Prinzip „echte Stille“); eine Zeile über dem liegenden Körper würde den Hook erklären (H9) |
| Commit vor dem Rendern (Skill Schritt 5) | kein Commit | Auftrag: keine Commits/Pushes ohne ausdrückliche Freigabe |

## 2. Fakten und Quellen

| Aussage/Zahl | Quelle |
|---|---|
| Glasgow-Koma-Skala 3–15, 3 = niedrigster Wert, ≤ 8 = Koma | Teasdale G, Jennett B: Assessment of coma and impaired consciousness. Lancet 1974; 304(7872):81–84 |
| Kopfhaar wächst ≈ 15 cm/Jahr | American Academy of Dermatology, „Hair loss: Who gets and causes“ (≈ 6 Inch pro Jahr) |
| Erwachen nach 19 Jahren (Jan Grzebski, Polen, 2007) | BBC News, 2. Juni 2007, „Pole wakes from 19-year coma“ |
| 10 Jahre = 3.652/3.653 Tage (inkl. 2–3 Schalttage) | Rechnung |
| Muskelschwund bei langer Bettlägerigkeit („Muskeln weg“) | Puthucheary ZA et al.: Acute skeletal muscle wasting in critical illness. JAMA 2013; 310(15):1591–1600 |

Hinweis: Ein zehnjähriges Koma mit Erwachen ist medizinisch ein seltener Ausnahmefall (meist Übergang in Wachkoma/minimalen Bewusstseinszustand); das Video ist ein Gedankenexperiment.

## 3. Assets und Lizenzen

| Asset | Herkunft | Lizenz | Nachweis |
|---|---|---|---|
| 3D-Modelle | Code (Kit) | eigen | `pipeline/runtime/kit/` |
| Schriften | Hausschriften Fraunces/Montserrat | OFL | `pipeline/runtime/` |
| Musik | `tools/music_synth.py` | eigen | beats.json audio.music |
| SFX | `tools/sfx_synth.py` (FFmpeg-Generatoren) | eigen | inkl. neu: beep, monitor, vibrate |

## 4. Render

- Befehl: `node pipeline/run.mjs --production productions/what-if-koma`
- 3 Renders à ≈ 41 min (1,2–1,3 s/Frame); Render 1 und 2 verworfen (Fehlerliste in `quality_review.md`). Render 3 ausgeliefert (SendUserFile, 2026-11-08).

## 5. QA-Durchläufe

(siehe `quality_review.md`)

## 6. Hörprüfung (Mensch)

- offen – vom Nutzer erbeten

## 7. Bekannte Einschränkungen

siehe `quality_review.md` → Ergebnis / offene Punkte
