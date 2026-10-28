# Produktionsprotokoll – What if every man had the same girlfriend?

| Feld | Wert |
|---|---|
| Slug | `what-if-same-girlfriend` |
| Sprache | en |
| Status | (wird nach QA gesetzt) |
| Style-Guide-Version | 1.1 |
| Git-Commit des Renders | (siehe Abschnitt 4) |
| Länge | 61,000 s, 1830 Frames |

## 1. Entscheidungen

- **Thema/Frage:** „What if every man had the same girlfriend?“ – Gedankenexperiment, keine Wahrheitsbehauptung. Jeder erwachsene Mann ist mit derselben erwachsenen, fiktiven Frau („Nora“) zusammen.
- **Figur:** Nora ist eine eigenständige Person, kein Preis: sie wird nie gefragt („She never said yes to any of them.“), sie entscheidet am Ende selbst. Keine sexualisierte Darstellung (Jacke, Hose, Alltagskleidung), Männer ohne abwertende Klischees; Komik entsteht aus Maßstab und Logistik (Reservierungen, Nachrichten, Gute-Nacht-Rechnung).
- **HUD:** 5 Segmente (4 Label-Wechsel), jede Zahl aus einer Rechnung (Abschnitt 2).
- **Pointe/Wendung:** Sie schaltet das Handy aus → „HER BOYFRIENDS“ fällt auf 0 → die Handys der Welt erlöschen in einer Welle → „If nobody chose it, is it still love?“ → sie geht an der Schlange vorbei in den Morgen („She chooses herself.“). Schluss als offene Frage ohne Musterantwort: „WOULD YOU ACCEPT THIS WORLD — OR WALK AWAY?“.
- **Kamera-Paradigma P2 (Wandernder Zeuge):** gesellschaftliche Folgen an vielen Orten; Augenhöhe, Whips zwischen Schauplätzen, eine Orientierungs-Totale (Aufsicht 24,5–27,5 s, 3 s).
- **Signalfarbe:** Koralle `#FF5A72` – Noras Jacke, ihre Nachrichten, leuchtende Handys, Schlüsselwort „same“, HUD-Balken. In `pipeline/runtime/brand.json` festgelegt (Guide 6.4: Festlegung beim ersten echten Video); Platzhalter-Kennzeichen entfernt. Austauschbar an genau dieser einen Stelle (plus Konstante `CORAL` in `scene.js`).
- **Ton:** keine Musik fremder Herkunft. Selbst erzeugte Klangflächen (Spannung A-Moll → bewusste Stille → Auflösung A-Dur) und Effekte aus `sound.py` (FFmpeg-Generatoren, feste Seeds). Mischung, Normierung und Endkodierung über die Pipeline (`audio_mix.py`, `encode.mjs`).

### Abweichungen vom Auftrag bzw. Style-Guide (mit Begründung)

| Regel / Vorgabe | Abweichung | Begründung |
|---|---|---|
| Auftrag: ≈ 45–55 s | **61,0 s** | Style-Guide 10.1 [V] verlangt 61–80 s; `validate_production.mjs` und `video_qa.py` prüfen das als Fehler. Grenzwerte werden laut Auftrag nicht verändert; der Auftrag erlaubt, die Länge an die Erzählung anzupassen. 61 s ist die kürzeste regelkonforme Länge. |
| Auftrag: Titel „WHAT IF EVERY MAN HAD THE SAME GIRLFRIEND?“ in Versalien | Titel in Satzschreibung, identischer Wortlaut | Validator verlangt Beginn mit „What if“ (Guide 2); Typografie des Hauses (Serifen-Display). Schlussfrage steht wie vorgegeben in Versalien. |
| Auftrag: „realistische Materialien“ | stilisierte 3D-Welt mit PBR-Materialien (Rauheit/Metall), Nebel, Gegenlicht, farbigem Lichtverlauf | Guide 6.1 [V]: stilisierte 3D-Welt, keine Fotorealistik. |
| Guide 1.4 Themenpool | Gesellschafts-/Beziehungsthema außerhalb des Start-Pools | ausdrücklicher Auftrag des Auftraggebers (Guide 1.4: Abgrenzung ist dessen Entscheidung). |
| Guide 5.2 Augenhöhe | Aufsicht 24,5–27,5 s | Orientierungs-Totale bei Maßstabswechsel (Guide 5.2 erlaubt ≤ 3 s). |

## 2. Fakten und Quellen

| Aussage/Zahl | Quelle / Rechnung |
|---|---|
| ≈ 2,9 Mrd. erwachsene Männer | **gerundete Schätzung**: Weltbevölkerung 2024 ≈ 8,16 Mrd. (UN World Population Prospects 2024), davon ≈ 2,4 Mrd. unter 18 (UNICEF-Größenordnung), Männeranteil der Erwachsenen ≈ 49,5 % → ≈ 2,85 Mrd., gerundet 2,9 Mrd. Eine exakte UN-Zahl für Männer ≥ 18 wurde in dieser Sitzung **nicht** abgerufen (Suchergebnis ohne Zahl). Im Video als Gedankenexperiment-Zahl verwendet. |
| 7.939.767 Jahre bis zur nächsten freien Nacht | 2,9 × 10⁹ Dates, eines pro Nacht: 2,9 × 10⁹ / 365,25 |
| 33.565 Nachrichten pro Sekunde | 2,9 × 10⁹ Nachrichten pro Tag / 86.400 s |
| 92 Jahre „Gute Nacht“ | 2,9 × 10⁹ s (1 s pro Mann) / 31.557.600 s pro Jahr = 91,9 |

## 3. Assets und Lizenzen

| Asset | Herkunft | Lizenz |
|---|---|---|
| Three.js 0.186.1 | npm `three` | MIT |
| Fraunces, JetBrains Mono | npm `@fontsource/*` 5.3.0 | SIL Open Font License 1.1 |
| 3D-Geometrie (Figuren, Straße, Hütte, Steg, Restaurant, Wohnung) | prozedural in `scene.js` | eigenes Material |
| Klänge und Klangflächen (23 Dateien) | `sound.py`, FFmpeg-Generatoren mit festen Seeds | eigenes Material |
| Musik | keine fremde Musik | – |

## 4. Render

```bash
python3 productions/what-if-same-girlfriend/sound.py
node tools/validate_production.mjs productions/what-if-same-girlfriend
node pipeline/run.mjs --production productions/what-if-same-girlfriend
```
