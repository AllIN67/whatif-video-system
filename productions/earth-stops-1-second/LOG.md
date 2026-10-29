# Produktionsprotokoll – What if the Earth stopped spinning for 1 second?

| Feld | Wert |
|---|---|
| Slug | `earth-stops-1-second` |
| Sprache | en (Sprecher, Untertitel, Einblendungen, Caption) |
| Status | siehe Abschnitt 5 (höchstens TECHNISCH GEPRÜFT – Hörprüfung durch einen Menschen steht aus) |
| Style-Guide-Version | 1.2 |
| Git-Commit des Renders | siehe `render/run_log.json` (`git_commit`) |
| Länge | 41,0 s · 1080×1920 · **60 fps** |
| Rezept | **B** („X für kurze Zeit weg“: Erddrehung stoppt 1 s), stark abgewandelt nach Auftrag (siehe Abweichungen) |

## 1. Entscheidungen

- **Auftrag (Nutzer, 2026-10-29):** TikTok-Video, komplett Englisch, mit Sprecher, Wort-für-Wort-Untertiteln, 60 fps,
  35–45 s, Hook 0–1,5 s, Spannung bis 8 s, Moment 8–20 s, drei Folgen à ≤ 4 s, Wendung + Schleife; Safe-Zones TikTok
  (unten 20 %, rechts 15 %); Musik + SFX; −14 LUFS; nur Code-generiertes Material, keine Bezahl-Dienste.
- **Frage/Hook:** „The Earth stops. For 1 second.“ (Bildschirm ab Frame 0) – der Auftrag gibt den Text vor.
- **Messgröße:** Geschwindigkeit in mph als große Zähler-Einblendungen (statt HUD links): NY 790, Relativ zum Boden 790,
  Strecke 1,155 ft, Ozean ≤ 1,040, Wind 790, Nordpol 0.
- **Pointe:** Nordpol (35,7 s) – dort ist die Drehgeschwindigkeit ≈ 0. **Kreisschluss:** Die letzte Einstellung
  endet mit Kamera und Erddrehung exakt im Zustand von Frame 0 (gleiche Funktion `hookCam(τ)`, stetig in τ = 0;
  Drehwinkel `W·(t − T)`), der letzte Satz „So when the Earth stops…“ läuft in den Hook „The Earth stops.“.
- **Kamera:** von der Szene geführt (Verfolgungsfahrten, Bahnen um die Erde); Wechsel Weltraum ↔ Boden = Stationsreise
  (am ehesten P4). Mehrere Paradigmen-Elemente (P4 + Verfolgung), weil der Auftrag alle 2–3 s eine Bildänderung und
  sehr unterschiedliche Folgen (Mensch, Ozean, Wind, Atmosphäre) verlangt.
- **Ost = Bildschirm rechts** in allen Bodenszenen, damit „alles fliegt nach Osten“ durchgehend lesbar ist.
- **Darstellung bewusst stilisiert:** Erddrehung sichtbar schnell (0,5 rad/s), Flug-/Wellengeschwindigkeiten im Bild
  verlangsamt (Lesbarkeit); die Zahlen in Text/Ton sind die echten Werte. Das Luftbild der Flugstrecke (352 m) ist maßstäblich.
- **Physik-Formulierung:** Der Text behauptet nur, was in der einen Sekunde passiert (alles Unverankerte bewegt sich
  mit 790 mph relativ zum Boden weiter; Luft und Wasser ebenso). Keine Aussage über g-Kräfte oder Langzeitfolgen.

### Abweichungen vom Style-Guide (Regel · Abweichung · Begründung)

| Regel | Abweichung | Begründung |
|---|---|---|
| 9.1 Kein Sprecher [V] | Sprecher (Kokoro TTS, Stimme `am_michael`, Tempo 1,26) | ausdrücklicher Auftrag |
| 10.1 30 fps [V] | 60 fps CFR | ausdrücklicher Auftrag; Pipeline unterstützt jetzt 30/60 |
| 10.1 Länge 61–80 s [V] | 41,0 s | Auftrag 35–45 s |
| 2/6.3 Titel oben mit Serifenschrift, HUD links | Hook-Titel + Zähler mittig, Montserrat ExtraBold/Black, weiß mit schwarzer Kontur, gelbe Hervorhebung | Auftrag (Schrift/Farben/Position) |
| 4 Untertitelzeilen 3–10 Wörter, kursiv bei 64–70 % | Wort-für-Wort, ≤ 3 Wörter, oberes Drittel (Mitte 25,5 %) | Auftrag |
| 6.3 Sicherheitszone x ≤ 82 % | Untertitelbreite 70 % mittig → rechter Rand bei 85 % | Auftrag nennt rechts 15 %; Einblendungen auf 72 % Breite eingepasst |
| 7.4 Ende ≤ 5 s nach Pointe [V] | 5,3 s | Kreisschluss-Fahrt (39,1–41,0 s) gehört zur Schleife, die der Auftrag verlangt |
| 5.2 Augenhöhe/Orientierungs-Totale ≤ 3 s | Weltraum-Einstellungen bis 5 s (Atmosphäre) | Thema ist planetar; Bodenszenen in Augenhöhe |
| 6.4 Erkennungsmerkmale (Fortschrittsskala, Signalfarbe) | nicht umgesetzt; Hervorhebung Gelb #FFE135 | Auftrag gibt Gelb vor; Signalfarbe des Kanals bleibt offen |
| 9.4 LRA 6–16 LU | gemessen siehe QA | Sprecher dominiert, Musik geduckt → geringe LRA erwartet |

## 2. Fakten und Quellen

| Aussage/Zahl | Herleitung/Quelle |
|---|---|
| Äquator ≈ 1,040 mph | Erdumfang 24,901 mi (40,075 km, WGS-84) ÷ siderischer Tag 23,934 h = 1,040 mph (1,674 km/h) |
| New York ≈ 790 mph | 1,040 mph × cos(40,71° N) = 788 mph ≈ 790 |
| „over a thousand feet“ / 1,155 ft in 1 s | 790 mph = 353 m/s → 352–353 m ≈ 1,155 ft |
| Winde schneller als Schall | Schallgeschwindigkeit Meereshöhe, 15 °C (ISA): 340,3 m/s = 761 mph < 790 mph |
| „three times any hurricane on record“ | stärkste gemessene Böe eines tropischen Wirbelsturms: 408 km/h = 253 mph, Zyklon Olivia, Barrow Island (Australien), 10.04.1996 (WMO-Rekord); 790/253 = 3,1; auch gegenüber dem höchsten Dauerwind (Hurrikan Patricia 2015, ≈ 215 mph) > 3× |
| Ozeane „up to 1,040 mph“ | Wasser behält die Bahngeschwindigkeit seiner Breite, maximal am Äquator |
| Nordpol ≈ 0 mph | Bahngeschwindigkeit ∝ cos(Breite) → 0 am Pol |
| Wasser trifft westliche Küsten | Wasser bewegt sich relativ zum Land nach Osten → Küsten mit Meer im Westen (Bild: Ozean links) |

Nicht behauptet (bewusst weggelassen): Opferzahlen, g-Kräfte, Zustand nach Wiederanlauf der Drehung.

## 3. Assets und Lizenzen

| Asset | Herkunft | Lizenz | Nachweis |
|---|---|---|---|
| Sprecherstimme | Kokoro-82M v1.0 via kokoro-onnx 0.6.1, Stimme `am_michael`, lokal erzeugt | Apache-2.0 (Modell), MIT (kokoro-onnx) | Modell-SHA-256 in `tools/tts_kokoro.py` |
| Küstenlinien | Natural Earth 1:50m land (`pipeline/runtime/kit/assets/land_50m.json`) | gemeinfrei | naturalearthdata.com |
| Schriften | Montserrat 800/900 (@fontsource/montserrat 5.2.8) | SIL OFL 1.1 | package.json |
| Musik | per Code erzeugt (`tools/music_synth.py`, Plan in `timeline.json → audio.music.main`) | eigene Erzeugung, keine fremden Samples | deterministisch |
| SFX | `tools/sfx_synth.py` (whoosh, swoosh, riser, impact, boom, hit, rumble) | eigene Erzeugung | deterministisch |
| 3D-Modelle | Baukasten `pipeline/runtime/kit/` (Würfel-Figuren, Gebäude, Erdkugel) | eigener Code | – |

Hinweis: edge-tts (Auftrag nannte es als Option) ist in dieser Umgebung durch die Netzwerkrichtlinie gesperrt
(`speech.platform.bing.com` → 403); daher Kokoro, vollständig offline.

## 4. Render

- Befehl: `node pipeline/run.mjs --production productions/earth-stops-1-second`
- Ablauf: Sprecher (übersprungen, aktuell) → Validierung OK (0 Warnungen) → Frames → Ton → Encode → QA → Bildstreifen
- Dauer, Auffälligkeiten: siehe Abschnitt 5

## 5. QA-Durchläufe

(wird nach dem Render ergänzt)

## 6. Hörprüfung (Mensch)

- Geprüft von / am: **ausstehend**
- Kopfhörer: – · Handylautsprecher: –
- Bitte besonders prüfen: Verständlichkeit der TTS-Stimme bei Tempo 1,26; Musik unter der Stimme (Absenkung −9 dB);
  Impact bei 8,25 s; Rumble 9,6/20,1/28,6 s; Schleifenübergang Ende → Anfang.

## 7. Bekannte Einschränkungen

- TTS ist eine synthetische Stimme; Betonung einzelner Wörter („stops“, „survive“) nicht steuerbar.
- Musik ist einfach synthetisiert (keine produzierte Library-Musik).
- Stilisierte Geschwindigkeiten im Bild (siehe Entscheidungen).

## 8. Nach Veröffentlichung (7 Tage)

| Plattform | Aufrufe | Ø Wiedergabe % | Abschlussrate | nach 3 s % | Shares/1k | Kommentare/1k | Follower/1k |
|---|---|---|---|---|---|---|---|

## 9. Erkenntnisse für den Style-Guide (Vorschläge)

- Profil „voiceover“ als zweites Format testen (Sprecher + Wort-Untertitel, 35–45 s) – Ergebnis gegen stumme Videos vergleichen (H-neu).
- 60 fps nur, wenn Plattform-Analyse einen Vorteil zeigt; Renderzeit ≈ doppelt.
