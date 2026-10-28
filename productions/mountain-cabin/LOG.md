# Produktionsprotokoll – What if you lived alone in the mountains?

| Feld | Wert |
|---|---|
| Slug | `mountain-cabin` |
| Sprache | en |
| Status | wird nach QA gesetzt |
| Style-Guide-Version | 1.1 |
| Git-Commit des Renders | siehe Abschnitt 4 |
| Länge | 63,000 s, 1890 Frames |

## 1. Entscheidungen

- **Auftrag** (Nutzer, 2026-10-28): fotorealistisches, filmisches 9:16-Video, 55–65 s, durchgehende Geschichte in 8 Szenen (Tür → Morgen → Garten/Spuren → Wasserfall → Sturm → drinnen → Gipfel → Abend), Ego-Perspektive gemischt mit Totalen, Sounddesign + Musik, wenige kurze Texte.
- Frage: „What if you lived alone in the mountains?“ (8 Wörter), Schlüsselwort „alone“.
- HUD: wechselnde Messgröße pro Akt (Nachbar-Entfernung, Spurlänge, Windgeschwindigkeit, Innentemperatur, Höhe, Stresslevel → „ZERO“) – 5 Label-Wechsel.
- Pointe: „No boss. No traffic. No stress.“ (58,0 s), Schlussfrage „Could you live like this?“.
- Kamera: P3 (Ego) als Grundform, mit Totalen/Third-Person-Einstellungen nach Auftrag.
- Signalfarbe: Platzhalter aus `pipeline/runtime/brand.json` unverändert gelassen (Festlegung bleibt beim Auftraggeber).

### Abweichungen vom Style-Guide (Regel · Abweichung · Begründung)

| Regel | Abweichung | Begründung |
|---|---|---|
| 6.1 stilisierte 3D-Welt, keine Fotorealistik | Ziel „möglichst realistisch“: PBR-Material, ACES-Tonemapping, Höhennebel/Dunst, Umgebungslicht aus dem Himmel, Schatten, Partikel. Ergebnis bleibt stilisiertes 3D | Auftrag verlangt Fotorealismus. Die Pipeline (Three.js, Software-WebGL) kann **keinen** Fotorealismus und hat keine KI-Bild-/Videogenerierung; der Auftrag untersagt einen Pipeline-Neubau. Siehe Abschnitt 7. |
| 5.1 genau ein Kamera-Paradigma | P3 mit eingeschobenen Totalen, Orbit und Third-Person-Einstellungen | ausdrücklicher Auftrag (Ego wo immersiv, Totalen für starke Bildmomente) |
| 1.2 What-if statt Story | What-if-Rahmen (Titel, HUD, Pointe) mit durchgehender Handlung | Auftrag verlangt durchgehende Geschichte; das What-if-Gerüst bleibt erhalten |
| 2 Titel „oben, Serifen“ / Auftrag „Versalien“ | Titel in Satzschreibung (Fraunces), nicht in Versalien | Validator verlangt „What if …“; einheitliche Kanal-Typografie (6.4) |
| 4 Textmenge 12–24 Zeilen / Auftrag „nur wenige Phrasen“ | 13 kurze Zeilen (3–7 Wörter) | Kompromiss: Mindestmaß des Guides, so knapp wie möglich |
| 9.1 kein Sprecher | eingehalten (kein Sprecher) | Auftrag erlaubt Sprecher optional; keine TTS in der Pipeline |
| 3.2 jede Zahl mit Quelle | HUD-Werte sind erkennbare **Szenariowerte** (siehe Abschnitt 2) | fiktive Hütte; keine Tatsachenbehauptung |

## 2. Fakten und Quellen

Keine Tatsachenbehauptungen. Alle HUD-Werte sind Werte **dieses Szenarios** (fiktiver Ort), keine recherchierten Fakten:

| Wert | Art |
|---|---|
| Nächster Nachbar 42 km | Szenario |
| Spur 1,2 km | Szenario |
| Wind 85 km/h | Szenario (Sturmböe, plausible Größenordnung) |
| Innentemperatur 9 → 21 °C | Szenario |
| Höhe 1.840 → 2.130 m | Szenario |
| Stress 12 % → „ZERO“ | erzählerische Pointe, keine Messung |

## 3. Assets und Lizenzen

| Asset | Herkunft | Lizenz |
|---|---|---|
| Three.js 0.186.1 (inkl. `BufferGeometryUtils`) | npm `three` | MIT |
| Fraunces, JetBrains Mono | npm `@fontsource/*` 5.3.0 | SIL OFL 1.1 |
| Gelände, Hütte, Figur, Bäume, Tiere, Texturen | prozedural in `lib/*.js` (Canvas, geseedet) | eigenes Material |
| Musik (Klavier, Flächen, Streicher, Pauken) | synthetisch in `sound_design.py` (numpy) | eigenes Material |
| Ambience + 23 Einzelklänge | synthetisch in `sound_design.py` | eigenes Material |

Neue Abhängigkeit: **numpy** (nur für `sound_design.py`, lokal vorhanden 2.5.3) – nötig für additive Klangsynthese und FFT-Faltung (Hall); die vorhandenen FFmpeg-Generatoren (`tools/sfx_synth.py`) liefern nur Testklänge (Drone, Whoosh, Boom).

## 4. Render

```bash
node productions/mountain-cabin/make_timeline.mjs    # timeline.json aus Höhenfunktion + Ereignissen
python3 productions/mountain-cabin/sound_design.py    # audio/*.wav (Musik, Ambience, Einzelklänge)
node pipeline/run.mjs --production productions/mountain-cabin
```

## 5. QA-Durchläufe

(wird ergänzt)

## 6. Hörprüfung (Mensch)

- **Ausstehend.** Claude kann nicht hören.

## 7. Bekannte Einschränkungen

- **Kein Fotorealismus.** Die vorhandene Pipeline rendert prozedurale 3D-Szenen per Software-WebGL; Hände, Figur, Wasser, Feuer und Felsen sind deutlich computergrafisch. Für echten Fotorealismus wäre ein anderes Werkzeug (z. B. KI-Videogenerierung oder ein Offline-Pathtracer mit gescannten Assets) nötig – das wäre ein Pipeline-Umbau und war ausdrücklich ausgeschlossen.
