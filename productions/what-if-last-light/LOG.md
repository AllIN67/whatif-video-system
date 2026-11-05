# Produktionsprotokoll – What if yours was the last light?

| Feld | Wert |
|---|---|
| Slug | `what-if-last-light` |
| Produktionsstil | B – Rezept B1 (Prüfregeln); Erzählform **B6 Ausbreitung + Wende** (Guide 18.13 F) |
| Sprache | en |
| Status | ENTWURF |
| Style-Guide-Version | 3.0 (Abschnitt 18 inkl. 18.12, 18.13) |
| Beat-Sheet / Freigabebogen | `beats.json` / `quality_review.md` |
| Git-Commit des Renders | (wird nach dem Rendern eingetragen) |
| Länge | 61,0 s |

Auftrag (2026-11-05): kompakte, vollständige **Testproduktion von System V3**; Prüfung nur gegen die eigenen V3-Anforderungen
(keine externen Referenzvergleiche); **keine Klangänderungen** (nur vorhandene Musikstile und Klänge).

## 1. Entscheidungen

### Hook-Entwurf (Guide 18.12 H10 – vor dem Beat-Sheet)

| # | Hook-Typ | Frame 0 (was sieht man ohne Text?) | Beweis-Ereignis (≤ 2 s / Geheimnis ab 0) | Frage bei 3 s | zurückgehalten | H1–H9 erfüllt? |
|---|---|---|---|---|---|---|
| 1 | process (Ich-Variante) | Ich-Perspektive auf dem Dach: eigene Hand mit leuchtendem Handy, Skyline erlischt bereits als Welle von hinten nach vorn | 1,2 s: Handy des Nachbarn neben dir wird schwarz, deins leuchtet weiter (nur deins bleibt an) | Warum bin ich das einzige Licht – und was passiert jetzt? | Akku, Sterne als Pointe | ja: Frame 0 nicht normal (Welle läuft), Beweis ≤ 2 s im Bild, Einsatz (dein Licht) sichtbar |
| 2 | countdown | Außenansicht Stadt bei Nacht, HUD „LIGHTS ON EARTH 4,000,000,000“ zählt herunter | Countdown bis zum Blackout bei ≈ 6 s | Wann gehen die Lichter aus? | was danach mit dir passiert | teilweise: Beweis erst bei 6 s, Figur fehlt in Frame 0, Messgröße wäre nicht der spätere Einsatz (Drift, 18.13 S1) |
| 3 | proof | Straße, Figur mit Lampe, Menge steht schon um sie | Menge kniet vor dem Licht (0,8 s) | Warum folgen die alle ihr? | Ursache (Blackout) | nein: zeigt das Ziel (Menge) vorweg (H8), Ursache unklar (18.13 S3) |

- Gewählt: # 1 – Die Ich-Perspektive macht „yours“ aus dem Titel wörtlich: das Licht ist in **deiner** Hand (V3 18.13 B). Der Prozess läuft
  ab Frame 0 (Welle), der Beweis ist der selektive Ausfall direkt neben dir. Einsatz und Messgröße (wer folgt deinem Licht) bleiben
  bis zum Ende dieselben.
- Hook-Typ / Eröffnungsbild der letzten 3 Produktionen: fold-paper `flashforward` (Papierturm im All), no-sleep `proof` (Schlafzimmer),
  last-goodbye ohne Hook-Block (Alltag). → `process` + Ich-Perspektive ist neu.
- Prämissen-Ereignisse 0–15 s: 0,15 Welle (visible) · 1,2 Handy des Nachbarn erlischt (visible, Beweis) · 1,7 Nachbar dreht sich zu dir
  (visible, HUD 1) · 3,0 Stadt dunkel, nur dein Kegel (visible) · 5,0 Nachbar tritt ins Licht · 6,4 Lichtkegel über dem Dach · 8,4 Türen
  · 9,6 Nachbarn gehen auf dich zu · 10,8 sie folgen · 12,6 ganze Straße · 14,2 Kegel zeigt den Weg – jedes größer/näher als das vorige.

### Story-Kern (Guide 18.13 A)

- **Einsatz:** Dein Handylicht ist das letzte Licht der Erde – alle hängen daran, und der Akku läuft ab.
- **Messgröße (HUD):** Menschen, die deinem Licht folgen (0 → 1 → 14 → 120 → 3.400 → … → 200 Mio. → 0 → 8,1 Mrd. „FOLLOWING THE STARS“).
  Label-Wechsel nur als Phasen derselben Größe (Unterzeile: ONLY LIGHT / WHOLE CITY / BATTERY LOW / LIGHTS 0 / OLDEST LIGHT).
- **Wende:** `e_battery` (40,? s → Akku 9 %, rot). **Pointe:** `e_lookup` – im Dunkeln schauen alle nach oben; die Milchstraße ist das
  Licht, dem jetzt alle folgen. **Ursachen** (`setup_for`): `e_stars` (Milchstraße schon im Park sichtbar, „nobody looks“), `e_battery`, `e_out`.
- **Bogen:** Aufbau (Akt 1: Blackout, Nachbarn, Straße, Stadt) → Hoffnung/Höhepunkt (Akt 2: Platz, „everyone needs you“, Erde aus dem All)
  → Rückschlag (Akku) → Panik → Licht aus → Auflösung (Sterne).
- **Wissensanker:** Akt 1 Weltbevölkerung, Akt 2 Sterne am dunklen Himmel, Akt 3 Milchstraße/Lichtverschmutzung (Quellen Abschnitt 2).
- **Schauwert je Akt:** Akt 1 Autofeld mit Menschenstrom (`mass`), Akt 2 Platz mit ≈ 1.500 Menschen (`mass`), Park unter der Milchstraße (`glow`),
  dunkle Erde mit einem Punkt (`vista`); Akt 3 Milchstraße über der Menge (`glow`).
- **Licht/Farbe (18.13 D):** Grundstimmung kühles Mondblau (gedämpfte Nachtpalette), **ein Akzent: dein warmes Licht** (Lampe, Kegel,
  Lichtinsel); Hauptfigur dunkel gekleidet, damit der Akzent die Lampe bleibt. Bloom auf Lampe/Sternen, Grading kühl, Sättigung 0,9.

- Beats: 15 (3,2–5,2 s), Orte: rooftop, street, avenue, plaza, park, space (6). Gefühle: neutral → shock → worried → happy → smug → panic → relief (7).
  Kamera-Vorlagen: pov, close, push, high, low, pull, orbit (7), Bildgrößen: pov, close, medium, high, low, wide.
- Neue Kit-Teile: `kit.atmo.milkyWay()` (Sternenband + Leuchtwolken, eigener Seed) – sonst nur V3-Kit.
- **Abweichungen vom Style-Guide:** keine.

## 2. Fakten und Quellen

| Aussage/Zahl | Quelle |
|---|---|
| More than 8 billion people live on Earth. | UN DESA, World Population Prospects 2022 – Weltbevölkerung erreichte 8 Mrd. am 15.11.2022 |
| Under a truly dark sky you can see about 2,500 stars at once. | Sky & Telescope, „How Many Stars Can You See?“ – ≈ 2.500 gleichzeitig sichtbar von einem dunklen Standort (Größenordnung; häufig zitierter Richtwert) |
| More than a third of humanity can no longer see the Milky Way from home. | Falchi et al. (2016), Science Advances 2(6): e1600377, „The new world atlas of artificial night sky brightness“ |
| 8,1 Mrd. (HUD am Ende) | gerundete Weltbevölkerung 2024/25 (UN-Schätzung), dramaturgisch: alle Menschen |

## 3. Assets und Lizenzen

| Asset | Herkunft | Lizenz | Nachweis |
|---|---|---|---|
| Geometrie, Figuren, Texturen | Baukasten `pipeline/runtime/kit/` (Code) | eigen | Repository |
| Erdkugel-Küsten | `kit/assets/land_50m.json` (Natural Earth) | gemeinfrei | README |
| Musik, Klänge | `tools/music_synth.py`, `tools/sfx_synth.py` (vorhandene Stile/Klänge, unverändert) | eigen | Repository |
| Schriften | @fontsource Fraunces/Montserrat | OFL | package.json |

## 4. QA-Durchläufe

(folgt)
