# Produktionsprotokoll – What if every man had the same girlfriend?

| Feld | Wert |
|---|---|
| Slug | `what-if-same-girlfriend` |
| Sprache | en |
| Status | **TECHNISCH GEPRÜFT – Hörprüfung durch einen Menschen ausstehend** (nicht FREIGEGEBEN) |
| Style-Guide-Version | 1.1 |
| Git-Commit des Renders | `46ea75c` (Quelldateien sauber; `run_log.json` meldet „dirty“ nur, weil der alte Ordner `qa/` von Durchlauf 1 während des Starts verschoben war) |
| Länge | 61,000 s, 1830 Frames |
| Datei | `productions/what-if-same-girlfriend/render/final.mp4` (nicht versioniert), 32,6 MB, SHA-256 `33b625f17b9d3bd1…` |

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

| Schritt (Durchlauf 2) | Dauer |
|---|---|
| Validierung | < 0,1 min (0 Fehler, 0 Warnungen) |
| Frames rendern | 51 min (≈ 1,35 s/Frame, 7 FFV1-Teilstücke; Fingerabdruck geändert → alle Teilstücke aus Durchlauf 1 verworfen) |
| Ton mischen | 0,3 min (−14,1 LUFS, TP −1,5 dBTP) |
| Kodieren | 2,3 min |
| QA + Bildstreifen | 1,2 min |

### Pipeline-Änderung (nötig)

- **Problem:** Erster Renderversuch brach ab: `page.screenshot: Timeout 30000ms exceeded` beim ersten Frame.
- **Ursache:** WebGL arbeitet asynchron. Shader-Kompilierung und die Aufwärm-Frames der Bühne (ein Frame pro Einstellung, 14 Stück) standen nach „ready“ noch in der GPU-Warteschlange (SwiftShader, ≈ 35 s bei dieser Szene) und wurden dem ersten Screenshot angelastet. Gemessen: Folge-Frames 1–5 s.
- **Korrektur:** `pipeline/browser.mjs` liest nach dem Aufbau einen Pixel (`readPixels`), was die Warteschlange ohne Zeitlimit abarbeitet. Keine Wirkung auf die Bilder. `npm test`: 21/21 Node-Tests + 3 Python-Tests bestanden.
- In der Produktion nicht lösbar (die Aufwärmphase liegt in der Bühne, nicht in `scene.js`). Grenzwerte unverändert.

## 5. QA-Durchläufe

### Durchlauf 1 – 2026-10-28, Commit `3589b31`

- `video_qa.py --mode render --plan`: **FAIL**
  - ❌ Einstellung < 4 Frames bei 27,5 s
  - ⚠️ Klick-Kandidaten 5,85 · 9,4 · 12,9 · 33,41 · 48,97 · 53,4 s
- Kontaktbögen sheet_01–03 und 14 Streifen angesehen.

| Zeitpunkt | Fehler | Ursache | Korrektur |
|---|---|---|---|
| 27,33–27,57 s | Whip aus der Aufsicht schwenkt in den dunklen Himmel: fast dunkles Bild, dann harter Sprung ins Fenster (2-Frame-„Einstellung“) | Gierschwenk einer steil nach unten blickenden Kamera trifft nur Nachthimmel; Bewegungsrichtung passt nicht zum Ziel | Übergang s06 → s07 als harter Schnitt (Aufsicht → Innenraum ist ein klarer Ortswechsel) |
| alle Whips | Klick-Kandidaten im Anstieg des Luftzugs | Rosa Rauschen bis 3,8 kHz hatte Anteile > 5 kHz | Luftzug zweifach bei 2,2 kHz tiefpassgefiltert (`sound.py`) |

### Durchlauf 2 – 2026-10-28, Commit `46ea75c` (komplett neu gerendert)

- `video_qa.py --mode render --plan`: **REVIEW** (0 FAIL)
  - 1080×1920, H.264 High, yuv420p, BT.709, 30/1 CFR, 1830 Frames, 61,000 s, AAC-LC 48 kHz Stereo 238 kbit/s, 32,6 MB
  - 0 unregelmäßige Zeitstempel, keine Schwarzbilder, keine Standbild-Phasen, 0 isolierte Doppelbilder, Doppelbild-Anteil 0,0 %, keine Einstellung < 4 Frames, keine Sprung-/Flacker-Kandidaten außerhalb geplanter Übergänge; 13/13 geplante Übergänge im Bild erkennbar
  - −14,1 LUFS, LRA 7,2 LU, True Peak −1,3 dBTP (nach AAC), Flat factor 0, keine Stille ≥ 0,4 s < −45 dB, keine Lautheitssprünge außerhalb geplanter Ereignisse
  - Anfang −58,1 dB RMS (erste 50 ms), Ende −50,0 dB RMS (letzte 50 ms) – weich ein- und ausgeblendet
  - ⚠️ Klick-Kandidaten 5,93 s und 53,43 s
- **Angesehen:** `sheet_01`, `sheet_02`, `sheet_03` vollständig (0–60 s, inkl. Ende), `hook.jpg`, `shots.jpg` (11 Einstellungen wie geplant; die Detektion fasst Whip-Paare teils zusammen), **alle 14 Bildstreifen** (3,80 · 5,87 · 9,40 · 12,90 · 18,47 · 22,67 · 24,50 · 27,50 · 33,43 · 39,00 · 44,50 · 48,90 · 53,43 · 56,20 s).
- Hinweis zur Methode: Die Zeitstempel der 1-Bild/s-Kontaktbögen liegen ≈ 0,4–0,5 s vor dem tatsächlich gezeigten Bild (Filter `fps=1` in `video_qa.py`); durch Extraktion exakter Frames (n = 270, 540, 810, 1590) geprüft. Als separate Aufgabe vorgeschlagen.

| Zeitpunkt | Meldung | Einstufung | Begründung |
|---|---|---|---|
| 5,93 s, 53,43 s | Klick-Kandidat | beabsichtigt (vorbehaltlich Anhören) | Maximum des Whip-Luftzugs (Start 10 Frames vor der Grenze, Maximum an der Grenze 6,0/53,5 s); kein Clipschnitt an dieser Stelle |
| 3,98 · 24,52 · 45,01 s | Transienten an geplanten Ereignissen | beabsichtigt | Tür, Menge-Schwall, Ausschalt-Ton – framegenau auf dem Bildereignis |
| 54,32 … 60,18 s | Transienten | beabsichtigt | Noras Schritte, berechnet aus dem Gehzyklus (Fersenaufsatz alle 16 Frames) |
| 39,9 · 41,5 · 42,9 · 44,0 s | Lautheitssprünge | beabsichtigt | Vibrationsalarm in der Ruhephase |
| Whips (6,0 · 9,5 · 13,0 · 18,5 · 33,5 · 49,0 · 53,5 s) | Sprung-/Flackerkandidaten | beabsichtigt | Bewegungsunschärfe, keine dunklen Ränder, kein Schwarzbild (dunkelster Frame 53,5 s: Nachtstraße unscharf, nicht schwarz) |
| 39,0 s | Abblende | beabsichtigt | Minimum ≈ 40 % Helligkeit, nie schwarz |
| 3,8 · 24,5 · 27,5 · 44,5 · 56,2 s | harte Schnitte | beabsichtigt | Untertitel jeweils vorher ausgeblendet |

**Sichtprüfung im Einzelnen (was ich gesehen habe):**
- Geometrie: keine durchdringenden oder schwebenden Objekte gefunden; Figuren stehen/sitzen auf Boden bzw. Sitzflächen; Plättchen des eingestürzten Turms liegen auf Tisch und Boden und bleiben in s07/s09/s10 an derselben Stelle (Kontinuität).
- Schatten: keine Fehlschatten oder Schattenflackern in Bögen und Streifen; Boden-/Gehwegflächen sind fein unterteilt (Pipeline-Regel).
- Flackern: Kaminfeuer und Handy-Lichter ändern sich weich; einziges schnelles Ereignis ist das Erlöschen kleiner Lichtpunkte (nicht großflächig, Blitzregel eingehalten).
- Unbeabsichtigte Standbilder: keine (auch automatisch: 0).
- Texte: Rechtschreibung geprüft; alle Zeilen auf dem 240-px-Bogen lesbar; innerhalb der Sicherheitszone; Titel 0–3,5 s; HUD ab Frame 0 und in den ersten 2 s laufend (1 → 79 Mio. bei 2,8 s, `hook.jpg`).
- Bewegungen: Gehzyklus, Greifen (Hütte), Arme heben (Küche), Vorhang ziehen, Handy weglegen und Zurücklehnen sehen plausibel aus; HUD-Werte stetig, Rücksprung bei 45 s ist erzählerisch (Wechsel auf „HER OWN CHOICE“).
- Unpassende Effekte: keine gefunden.

**Nicht zuverlässig prüfbar / nicht geprüft:**
- Ton: **nicht gehört** (Claude kann nicht hören). Nur Messwerte.
- Zwischenbilder: Zwischen den Bögen und Streifen wurden nicht alle Frames angesehen; sie sind nur technisch vermessen.
- Feine Animationsfehler innerhalb langer Einstellungen (z. B. Fußgleiten beim Gehen, Hände knapp neben Gegenständen) sind auf 1-Bild/s-Bögen nur grob beurteilbar.
- `av_sync.py` nicht anwendbar (keine Synchron-Marker in Inhaltsvideos); Synchronität beruht auf framegenauen Einsatzzeiten in `timeline.json` (Pipeline-Test: Versatz +4 ms).

## 6. Hörprüfung (Mensch)

- **Ausstehend.** Bitte `render/final.mp4` einmal mit Kopfhörern und einmal über einen Handylautsprecher komplett anhören und bestätigen: keine Knackser/Rauschen/Verzerrung (besonders Whips bei 5,9 s und 53,4 s), Tür 3,97 s, Nachrichtentöne 6,5/10,0/35,0 s, Einsturz 22,6 s, Ausschalten 45,0 s mit kurzer Stille, tiefer Puls 49,4 s, Schritte ab 53,8 s und Akkord 56,2 s synchron zum Bild, sauberes Ende.

## 7. Bekannte Einschränkungen

- Länge 61 s statt 45–55 s (Guide-Pflicht, siehe Abschnitt 1).
- Stilisierte Figuren ohne Gesichtszüge (nur Nase als Blickrichtungshinweis) – bewusst, aber wenig Mimik; Emotion entsteht über Haltung, Licht und Text.
- Nachtszenen (Aufsicht, Lichter-Welle) sind dunkel; auf hellen Handydisplays gut, bei hoher Umgebungshelligkeit evtl. schwer lesbar.
- Der HUD überdeckt in s08 kurzzeitig den Hinterkopf eines der Freunde.
- Renderzeit ≈ 1,35 s/Frame (Software-WebGL), Aufwärmphase ≈ 35 s.
- Zahl „2,9 Mrd. erwachsene Männer“ ist eine gerundete Schätzung (Abschnitt 2).

## 8. Nach Veröffentlichung (7 Tage)

Noch nicht veröffentlicht (erst nach `FREIGEGEBEN`).

## 9. Erkenntnisse für den Style-Guide (Vorschläge)

- Guide 7.2 ergänzen: Whip nur zwischen Einstellungen mit ähnlicher Blickhöhe; aus einer steilen Aufsicht heraus dreht der Gierschwenk in den Himmel → harter Schnitt verwenden.
- Guide 9.3 ergänzen: Luftzug-/Whip-Klänge unter ≈ 2,5 kHz halten, sonst Klick-Kandidaten in `video_qa.py`.
- Guide 10.3: Aufwärmphase der Bühne kann bei großen Szenen > 30 s dauern (jetzt abgefangen).
