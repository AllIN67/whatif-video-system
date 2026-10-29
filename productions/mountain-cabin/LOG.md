# Produktionsprotokoll – What if you lived alone in the mountains?

| Feld | Wert |
|---|---|
| Slug | `mountain-cabin` |
| Sprache | en |
| Status | **TECHNISCH GEPRÜFT – Hörprüfung durch einen Menschen ausstehend** |
| Style-Guide-Version | 1.1 |
| Git-Commit des Renders | `be03fe3` (Frames 0–899, 1260–1889) + `10f125d` (Frames 900–1259) |
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

### Durchlauf 1 – 2026-10-28, Commit `305d1de`/`8025e97`

`video_qa.py`: **FAIL**. Alle 3 Kontaktbögen und die auffälligen Streifen angesehen.

| Zeitpunkt | Fehler | Ursache | Korrektur |
|---|---|---|---|
| 39,0–39,8 s | Schwarzbilder | Kamin vor dem Anzünden ohne Licht | Glut glimmt ab Lampe (`fireK` Mindestwert) |
| 54,43 s | Einstellung < 4 Frames | Abblende ins Abend-Interieur als eigene Einstellung erkannt | harter Schnitt |
| 34,03–34,27 s | Flackern, 2 Lichtspitzen in 0,2 s | Blitz mit zwei Pulsen (Blitzregel 6.2) | ein einzelner weicher Puls |
| 27,03 s | Kamera fährt in den Hang | Orbit ohne Geländeprüfung | Orbit ≥ 2 m über Gelände, kleinerer Bogen |
| 14–15,8 s | Zaunpfosten verdeckt Bildmitte | Kamera außerhalb des Auslaufs | Kamera in den Auslauf |
| 51–54 s | Figur fehlt im Gipfelbild | Kamera fährt zu schnell seitlich | Zwischenschlüssel näher an der Figur |
| gesamt | LRA 5,9 LU | Innenräume zu laut im Verhältnis zum Sturm | Innen-Musik/Dachregen/Feuer leiser |

### Durchlauf 2 – 2026-10-29, Commit `be03fe3`

`video_qa.py`: **FAIL** – Schwarzbilder 39,33–39,47 s (Kamin noch zu dunkel). Korrektur: Glut heller (0,35), Feuer zündet 0,3 s früher (Ereignis `fire_catch` 39,1 s, Ton folgt automatisch). Commit `10f125d`.

Renderhinweis: Der Container startete während Durchlauf 2 dreimal neu (~alle 25 min). Die Frames wurden deshalb abschnittsweise gerendert: Frames 0–899 in 300er-, 1200–1889 in 60er-Teilstücken (`render_frames.mjs --chunk 60`). Frames 900–1259 wurden nach der Korrektur neu gerendert (`--out render/patch`) und ersetzen die alten Teilstücke (`render/replaced/`). Die Änderung wirkt nur auf das Kaminlicht zwischen 37,55 und 41,1 s, beides liegt vollständig im neu gerenderten Bereich. Die Nahtstellen (Frame 900 und 1260) wurden Bild für Bild geprüft: kein Sprung, die HUD-Werte laufen stetig weiter. Danach Ton neu gemischt (`tools/audio_mix.py`) und neu kodiert (`pipeline/encode.mjs`).

### Durchlauf 3 – 2026-10-29 (finale Datei)

- `video_qa.py --mode render --plan`: **REVIEW** (0 FAIL)
  - 1080×1920, H.264 High, yuv420p, 30/1 CFR, 1890 Frames, 63,000 s, Audio AAC 48 kHz 63,000 s, 66,8 MB
  - keine Schwarzbilder, keine Standbilder, 0 Doppelbilder, keine Einstellung < 4 Frames
  - −14,1 LUFS, LRA 6,8 LU, True Peak −1,1 dBTP, Flat factor 0; Anfang −74,7 dB, Ende −55,6 dB RMS (Fade-out)
- Kontaktbögen **sheet_01, sheet_02, sheet_03 vollständig angesehen** (0–62 s).
- Bildstreifen angesehen: 34,03 s (Blitz) und die Nähte bei 29,9 s/41,9 s; aus Durchlauf 1/2: 27,07 s, 39,0 s.

| Zeitpunkt | Meldung | Einstufung | Begründung |
|---|---|---|---|
| 34,03–34,2 s | Sprung-/Flacker-Kandidaten | beabsichtigt | einzelner Blitz, ≈ 0,2 s weicher Lichtstoß (1 Hell-Dunkel-Wechsel) |
| 19,0 s, 29,6 s | geplanter Schnitt nicht erkennbar | beabsichtigt | Schnitte zwischen ähnlichen Bildern (Waldpfad → Waldpfad, grauer Himmel → Himmel) |
| 0,28; 1,7; 45–48,5; 57,7–60,5 s | Klick-Kandidaten | vermutlich beabsichtigt (Türknarren, Schritte, Felsschritte, Klavieranschläge) | **beim Anhören bestätigen** |

Nicht alle 37 Bildstreifen wurden einzeln angesehen; die übrigen liegen an geplanten Schnitten (in den Kontaktbögen geprüft).

## 6. Hörprüfung (Mensch)

- **Ausstehend.** Claude kann nicht hören.

## 7. Bekannte Einschränkungen

- Hände (Kaffee, Brot) und Figur sind deutlich computergrafisch; Wasserfall und Becken wirken flächig; Innenräume im Sturm sehr dunkel/rot.
- Der Wasserfall ist in den Einstellungen 08/09 ausgeblendet (sonst von der Hütte aus zu früh sichtbar) – Kontinuitätsvereinfachung.
- Eier-Moment entfällt (Einstellung 07 zeigt nur pickende Hühner): die Hand am Nestkasten wirkte unglaubwürdig.
- **Kein Fotorealismus.** Die vorhandene Pipeline rendert prozedurale 3D-Szenen per Software-WebGL; Hände, Figur, Wasser, Feuer und Felsen sind deutlich computergrafisch. Für echten Fotorealismus wäre ein anderes Werkzeug (z. B. KI-Videogenerierung oder ein Offline-Pathtracer mit gescannten Assets) nötig – das wäre ein Pipeline-Umbau und war ausdrücklich ausgeschlossen.
