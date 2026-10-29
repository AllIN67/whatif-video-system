# Stil A – „Earth“ (Sprecher-Erklärvideo)

**Gilt nur bei `PRODUKTIONSSTIL: A (Earth)`.** Stil B (B1/B2) steht in `WHATIF_STYLE_GUIDE.md` Abschnitt 16.
Gemeinsam für beide Stile gelten aus dem Style-Guide: Themenwahl und Fakten (1.4, 3.2 Quellenpflicht), Hook-Grundsatz
„Frame 0 zeigt sofort Szene + Text“ (2), stilisierte 3D-Welt mit dem Baukasten (6.1, 16.3), Blitzregel (6.2),
Kontinuität (6.5), Zustandsänderung spätestens alle 6 s (7.1), Effekte mit Erzählfunktion (8), Mischung −14 LUFS /
True Peak ≤ −1 dBTP (9.4), technische Ausgabe und deterministisches Rendern (10), Qualitätsprüfung und Freigabestufen (11).

**Referenzproduktion:** `productions/earth-stops-1-second/` („What if the Earth stopped spinning for 1 second?“).
Die Referenz ist der **Quellcode** dieser Produktion; das Video ist daraus bit-genau neu renderbar. Die Datei
`final.mp4` ist nicht versioniert (`.gitignore`). Alle Merkmale unten stammen aus dieser Umsetzung
(`scene_plan.md`, `timeline.json`, `voiceover.json`, `LOG.md`), nicht aus fremden Referenzen.

> **Hinweis Länge:** Die Referenzproduktion ist 41 s lang und erfüllt die Mindestlänge von 60 s **nicht**. Sie dient
> als Stilreferenz, nicht als veröffentlichungsfähige Vorlage für die Länge. Siehe Abschnitt 6.

## 1. Kennzeichen

| Baustein | Vorgabe (aus der Referenz) |
|---|---|
| Profil | `timeline.json`: `"profile": "voiceover"` |
| Sprecher | ja – Kokoro-TTS offline (`tools/tts_kokoro.py`), Text in `voiceover.json`, Zahlen ausgeschrieben, Markup `{gesprochen\|ANZEIGE}`, `*Schlüsselwort*` |
| Untertitel | Wort für Wort synchron zur Stimme, max. 3 Wörter, oberes Drittel (Mitte ≈ 25 % Bildhöhe), Breite ≤ 70 %, aktives Wort gelb, Schlüsselwörter größer mit Pop (`pipeline/runtime/captions.js`) |
| Zahlen | große mittige Zähler-Einblendungen („callouts“) pro Szene statt HUD links; Texte in `text.en.json → callouts` |
| Schrift | Montserrat 800/900, weiß mit schwarzer Kontur, Hervorhebung `#FFE135` |
| Hook | Bildschirmtext ab Frame 0, kurzer Satz („The Earth stops. For 1 second.“), keine Titelfrage nötig |
| Kamera | von der Szene geführt (Verfolgungsfahrten, Bahnen um die Erde, Wechsel Weltraum ↔ Boden) |
| Schnitt | harte Schnitte, Einstellungen ≈ 1,5–5 s (Referenz: Median 2,7 s) |
| Effekte | Bewegungsunschärfe aus Teilbildern (`timeline.motion_blur`), Vignette, Filmkorn beim Endencode, Blitz/Aberration/Shake nur am Schlüsselereignis |
| Ton | Stimme vorn, Musik per Code (`tools/music_synth.py`) unter der Stimme geduckt, SFX auf Schnitten und Ereignissen, bewusste Stille vor dem Ereignis |
| Ende | Pointe/Wendung, dann **Loop**: letzte Einstellung endet im Zustand von Frame 0, letzter Satz läuft in den Hook |
| Bildrate | 60 fps in der Referenz (auf Auftrag); 30 fps erlaubt – Wirkung von 60 fps ist nicht belegt [H] |

## 2. Dramaturgie (für ≥ 60 s)

| Akt | Anteil | Inhalt |
|---|---|---|
| Hook | 0–1,5 s | starkes Bild + Bildschirmtext ab Frame 0 |
| Spannung | bis ≈ 8–10 s | Ausgangslage mit Zahl („790 mph – and you don't even feel it“) |
| Moment | spätestens 10 s | das Ereignis selbst, mit Ton-Akzent oder Stille davor |
| Eskalation | bis ≈ 80 % | **mindestens 5 Folgen**, jede eine neue Konsequenz (Mensch → Straße → Stadt → Planet …), Wechsel global ↔ persönlich |
| Wendung | ≈ 80–92 % | „But there's one place …“ – Gegenpol/Auflösung |
| Loop | letzte 2–5 s | Rückführung ins erste Bild |

## 3. Länge [V]

- **Mindestens 60 s, Standard 61–80 s** (wie alle Stile; `tools/validate_production.mjs` und `tools/video_qa.py` lehnen kürzere Videos ab, `timeline.qa` kann die Grenze nicht senken).
- Verlängert wird durch **zusätzliche Konsequenzen und visuelle Entwicklungen**, nie durch Leerlauf: keine gestreckten Einstellungen, keine längeren Pausen in der Stimme, kein stehendes Bild. Spätestens alle 6 s eine sichtbare Zustandsänderung (Validator-Regel 7.1).
- Sprechtempo und Satzlänge bleiben wie in der Referenz; mehr Länge = mehr Inhalt.

## 4. Was Stil A nicht übernimmt (Abgrenzung zu Stil B)

Keine Titelfrage oben in Serifenschrift, kein HUD links mit Fortschrittsbalken, keine kursiven Zeilen-Untertitel,
keine Signalfarbe des Kanals – das sind Merkmale von Stil B. Stil A und Stil B werden nicht gemischt.

## 5. Technik

Pipeline wie Stil B (`node pipeline/run.mjs --production productions/<slug>`); `run.mjs` erzeugt die Stimme automatisch,
wenn `voiceover.json` existiert. Zusätzliche Voraussetzung: `pip install kokoro-onnx onnx`, `npm install` (Montserrat).
Renderzeit der Referenz: ≈ 1,0–1,9 s pro Frame bei 60 fps und Bewegungsunschärfe, ≈ 75 min für 41 s (gemessen, LOG).

## 6. Folgen der Mindestlänge für die Referenzproduktion

- Die Earth-Produktion (41 s) wird vom Validator jetzt abgelehnt (`Länge 41 s unter der Mindestlänge 60 s`). Sie bleibt
  als Stilreferenz unverändert im Repository.
- Eine veröffentlichungsfähige Fassung bräuchte ≈ 20 s zusätzliche Dramaturgie: zusätzliche Folgen (mit Quellen),
  einen weiteren Wechsel global ↔ persönlich, eine längere Auflösung am Nordpol; dazu neue Sprechersegmente,
  Einstellungen, Einblendungen und Musikplan, danach ein kompletter Neu-Render und vollständige QA.
- Die Struktur des ursprünglichen Auftrags („3 Folgen à ≤ 4 s“) wird für Stil A zu „mindestens 5 Folgen“ (Abschnitt 2).
