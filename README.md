# whatif-video-system

Produktionssystem für eigenständige, technisch geprüfte **„What if …?“-Kurzvideos** (9:16, 61–80 s, Englisch, ohne Sprecher). Das Repository enthält die kreative und technische Regelbasis, die Belege aus 15 Referenzvideos, einen Claude-Code-Skill für den Arbeitsablauf und Werkzeuge für Analyse und Qualitätsabnahme.

Eigenständiges Projekt – unabhängig von `AllIN67/oxygen-video`; von dort wurden weder Dateien noch Regeln übernommen.

## Zentrale Dateien

| Datei | Zweck |
|---|---|
| `WHATIF_STYLE_GUIDE.md` | **Quelle der Wahrheit**: Format, Sprache, Hook, Dramaturgie, Kamera, Bild, Schnitt, Effekte, Ton, Technik, QA, Hypothesen |
| `VIDEO_PRODUCTION_CHECKLIST.md` | Abhakliste für jedes Video (Thema → Freigabe → Dokumentation) |
| `REFERENCE_ANALYSIS.md` | Belegbasis: Einzelanalyse R01–R15, Vergleich, Schwächen, Grenzen der Analyse |
| `references/analysis/MEASUREMENTS.md` | Messwert-Tabelle und Lautheitsverläufe aller Referenzen |
| `.claude/skills/whatif-video-style/SKILL.md` | Claude-Code-Skill: Arbeitsablauf, verweist auf den Style-Guide |
| `CLAUDE.md` | Kurzanweisung für Claude Code in diesem Repository |

## Struktur

```
.
├── WHATIF_STYLE_GUIDE.md
├── VIDEO_PRODUCTION_CHECKLIST.md
├── REFERENCE_ANALYSIS.md
├── CLAUDE.md
├── .claude/skills/whatif-video-style/SKILL.md
├── package.json               # three, Schriften (gepinnt); Playwright wird global erwartet
├── pipeline/                  # Render-Pipeline (siehe Abschnitt „Render-Pipeline“)
├── tests/                     # automatische Tests + Fixtures
├── templates/
│   ├── scene_plan.md          # Vorlage Szenenplan + text.en.json-Struktur
│   └── production_log.md      # Vorlage Produktionsprotokoll
├── tools/
│   ├── validate_production.mjs, audio_mix.py, sfx_synth.py, av_sync.py   # Render-Pipeline (siehe unten)
│   ├── video_qa.py            # Messung + Abnahme (Bild, Ton, Format) → report.md/json, Kontaktbögen
│   ├── inspect_frames.py      # Bildstreifen mit voller Bildrate an Schnitten/Auffälligkeiten
│   ├── transcribe.py          # optionale Spracherkennung (faster-whisper)
│   └── summarize_references.py
├── references/
│   ├── manifest.tsv           # Referenzliste mit TikTok-ID und SHA-256
│   ├── videos/                # Originale – NUR LOKAL, per .gitignore ausgeschlossen
│   └── analysis/
│       ├── MEASUREMENTS.md
│       ├── Rxx/               # report.md, report.json, frames.tsv (Kontaktbögen nur lokal)
│       └── _transcripts/      # Spracherkennung (überwiegend Halluzinationen auf Musik, siehe Analyse)
└── productions/               # ein Ordner pro Video; _pipeline_test = technische Testproduktion
```

## Render-Pipeline

Deterministisch: Jedes Bild ist eine reine Funktion seines Frame-Index (`t = n / 30`). Uhr, Animationsschleife und ungeseedeter Zufall sind in der Bühne technisch gesperrt (`pipeline/runtime/guard.js`).

```
timeline.json + text.en.json + scene.js
   │  node tools/validate_production.mjs productions/<slug>        Regeln des Style-Guides vor dem Rendern
   ▼
pipeline/render_frames.mjs   headless Chromium + Three.js (SwiftShader), 1 PNG-Screenshot pro Frame
   │                         → verlustfreie FFV1-Teilstücke à 300 Frames (wiederaufnehmbar), frames.tsv (Prüfsummen)
tools/audio_mix.py           lizenzfreie Klänge (tools/sfx_synth.py), frame-genaue Einsätze, Clip-Fades,
   │                         lineare Normierung −14 LUFS, True-Peak-Limiter −1,5 dBTP, exakte Länge
pipeline/encode.mjs          ein H.264-Encode (CRF 16, BT.709, 30 fps CFR) + AAC 48 kHz, Selbstkontrolle per ffprobe
   ▼
tools/video_qa.py --mode render --plan timeline.json  +  tools/inspect_frames.py --report …   (+ tools/av_sync.py bei Synchron-Markern)
```

Alles in einem Befehl (bricht beim ersten Fehler ab, schreibt `render/run_log.json`):

```bash
npm install                                   # einmalig: three, Schriften (Fraunces, JetBrains Mono)
node pipeline/run.mjs --production productions/<slug>
```

| Datei | Aufgabe |
|---|---|
| `pipeline/server.mjs` | lokaler HTTP-Server (nur 127.0.0.1); ES-Module laden nicht über `file://` |
| `pipeline/browser.mjs` | Chromium-Start (SwiftShader), Versionsprüfung des global installierten Playwright |
| `pipeline/runtime/stage.html/.js/.css` | Bühne: Szene, Kamera, Übergänge (Whip-Unschärfe als WebGL-Pass, Dip/Flash-Overlay) |
| `pipeline/runtime/timeline.js` | Zeitachse: Interpolation, Einstellungsgrenzen, Übergänge, Kamera, Wackeln, HUD – reine Funktionen |
| `pipeline/runtime/overlay.js` + `brand.json` | Titel, HUD mit Fortschrittsskala, Untertitel, Scrims, Sicherheitszone, Synchron-Marker |
| `pipeline/runtime/guard.js`, `rng.js` | Echtzeit-Sperre, geseedeter Zufall |
| `pipeline/render_frames.mjs`, `encode.mjs`, `run.mjs` | Frames, Endkodierung, Gesamtablauf |
| `tools/validate_production.mjs` | Regelprüfung vor dem Rendern |
| `tools/sfx_synth.py`, `tools/audio_mix.py` | Klänge erzeugen, Ton mischen |
| `tools/av_sync.py` | Bild-Ton-Versatz über Synchron-Marker messen |
| `templates/timeline.json`, `templates/scene.js` | Vorlagen für neue Produktionen |
| `productions/_pipeline_test/` | abstrakte technische Testproduktion (kein Inhaltsvideo) |

**Ergebnis des End-to-End-Tests** (`productions/_pipeline_test/LOG.md`): 62-s-Testvideo, `video_qa.py` PASS, A/V-Versatz +4 ms, alle Kontaktbögen und 9 Übergangs-Streifen gesichtet; Hörprüfung durch einen Menschen steht aus.

**Signalfarbe:** `pipeline/runtime/brand.json` enthält einen **Platzhalter** (`signal_is_placeholder: true`); die endgültige Farbe wird beim ersten echten Video festgelegt.

**Renderzeit** (Cloud-Container, 4 Kerne, keine GPU): ≈ 0,4 s pro Frame → ≈ 13–17 min für 61–80 s. Parallele Browser bringen hier keinen Gewinn (gemessen).

### Videos mit Sprecher (Profil `voiceover`, nur auf ausdrücklichen Auftrag)

Der Style-Guide sieht standardmäßig keinen Sprecher, 30 fps und 61–80 s vor. Für Aufträge, die davon abweichen
(z. B. TikTok-Erklärvideo mit Stimme, 60 fps, 35–45 s), gibt es ein eigenes Profil – Abweichungen im LOG begründen.
Beispiel: `productions/earth-stops-1-second/`.

| Baustein | Datei | Zweck |
|---|---|---|
| Sprecher | `tools/tts_kokoro.py` + `voiceover.json` | Kokoro-82M (Apache-2.0) offline auf der CPU; Modell wird beim ersten Lauf von GitHub geladen (SHA-256 geprüft). Exakte Wortzeiten aus den vom Modell vorhergesagten Phonem-Dauern → `voice/words.json`. Markup: `{gesprochen\|ANZEIGE}`, `*Schlüsselwort*`; Zahlen ausschreiben |
| Untertitel + Einblendungen | `pipeline/runtime/captions.js` | Wort-für-Wort-Untertitel (max. 3 Wörter, aktives Wort gelb, Schlüsselwörter groß mit Pop), Zähler/Titel/Textkarten; `timeline.captions`, `timeline.callouts`, Texte in `text.<lang>.json → callouts` |
| Bildrate | `timeline.fps` | 30 (Standard) oder 60; Übergangsgrenzen gelten in Sekunden |
| Nachbearbeitung | `stage.js` | `timeline.post` (Vignette, Filmkorn), `timeline.motion_blur` (echte Bewegungsunschärfe durch Teilbilder); Szene kann pro Frame `{ camera, fx: { flash, chroma, radial, blurX } }` liefern |
| Musik | `tools/music_synth.py` | per Code nach Ablaufplan (`audio.music`, Stile pulse/drive/drive_hi/calm/silence); im Mix als `music:<name>` |
| Ton | `tools/audio_mix.py`, `tools/sfx_synth.py` | `audio.voice` + `duck_db` auf Beds (automatische Absenkung unter der Stimme); neue Klänge `impact`, `rumble`, `swoosh` |
| Prüfung | `validate_production.mjs` | `"profile": "voiceover"`, Längenbereich aus `timeline.qa` (gilt auch für `video_qa.py --plan`) |
| Baukasten | `kit/space.js`, `props.tower` | Erdkugel (Natural-Earth-Küsten, gemeinfrei), Atmosphäre, Wolken, Sterne mit Parallaxe, Markierungen; Gebäude als eine Masche für große Städte |

Voraussetzung zusätzlich: `pip install kokoro-onnx onnx` (Python), `@fontsource/montserrat` (per `npm install`).
`run.mjs` führt den Sprecher-Schritt automatisch aus, wenn `voiceover.json` existiert. Hinweis: edge-tts ist in der
Cloud-Umgebung durch die Netzwerkrichtlinie gesperrt; Kokoro läuft vollständig lokal.

### Tests

```bash
npm test     # node --test tests/*.mjs  +  python3 -m unittest (tests/test_*.py)
```

| Test | prüft |
|---|---|
| `test_runtime_guard.mjs` | Echtzeit-APIs werfen, Szene mit Uhrzugriff bricht ab, Zufall reproduzierbar, statische Code-Prüfung, Schattenempfänger mit Riesendreiecken abgelehnt |
| `test_timeline.mjs` | Interpolation, Frame-Grenzen, Fehlerfälle, Übergänge ohne Schwarz-/Weißbild, Kamera ohne Sprünge |
| `test_render_frames.mjs` | bit-identische Frames (Reihenfolge, neue Browser-Instanz), exakte Frame-Zahl, 30/1, Wiederaufnahme, Verwerfen veralteter Teilstücke (Fingerabdruck) |
| `test_overlay.mjs` | Schriften geladen, Inhalte/Zeiten, Sicherheitszone, HUD ab Frame 0, fehlende Text-ID bricht ab |
| `test_validate_production.mjs` | gültige Produktion + 18 gezielte Regelverstöße |
| `test_audio_mix.py` | Länge, −14 ± 1 LUFS, True Peak ≤ −1, Ein-/Ausblendung, keine Knackser, sample-genaue Platzierung |
| `test_pipeline_run.mjs` | Gesamtablauf auf 3-s-Fixture: Spezifikation, QA ohne FAIL, A/V-Versatz ≤ 1 Frame |
| `test_captions.mjs` | Untertitel-Seiten (max. Wörter, keine Ein-Wort-Blitzseiten), Profil voiceover: gültig + Regelverstöße |

## Skill verwenden

Voraussetzung: Claude Code arbeitet in diesem Repository (als Arbeitsverzeichnis gestartet oder der Sitzung hinzugefügt). Projekt-Skills unter `.claude/skills/` werden dann erkannt; in anderen Projekten oder Chats ist der Skill nicht verfügbar.

- Explizit: `/whatif-video-style` – z. B. `/whatif-video-style Plane ein Video: What if the Moon disappeared?`
- Implizit: Aufgaben wie „Produziere ein What-if-Video über …“ passen zur Skill-Beschreibung.
- In manchen Umgebungen ist zusätzlich ein älterer, globaler Skill `whatif-3d-style` sichtbar. Er gehört zu einem anderen Projekt und gilt hier **nicht**; im Zweifel `/whatif-video-style` explizit aufrufen.

## Ablauf der Referenzanalyse

1. Videos unverändert nach `references/videos/Rxx_<id>.mp4` kopieren, `references/manifest.tsv` ergänzen.
2. Messen + Kontaktbögen: `python3 tools/video_qa.py references/videos/Rxx_*.mp4 --out references/analysis/Rxx --mode reference`
3. Übersicht: `python3 tools/summarize_references.py`
4. Optional Sprache: `transcribe.py` (siehe Voraussetzungen).
5. Kontaktbögen, `hook.jpg`, `shots.jpg` sichten; bei Auffälligkeiten `inspect_frames.py --at …`.
6. Ergebnisse in `REFERENCE_ANALYSIS.md` eintragen; Style-Guide nur mit Begründung im Änderungsprotokoll anpassen.

## Ablauf einer Videoproduktion

Kurzform (Details: Checkliste und Skill):

1. Frage, HUD-Messgröße, Konsequenzen, Pointe, Fakten mit Quellen → `productions/<slug>/LOG.md`
2. Szenenplan + `text.en.json`
3. Kamera-Paradigma, Licht, Effekte, Ton (lizenzierte Musik)
4. Deterministisch rendern (30 fps CFR, 1080×1920)
5. `video_qa.py --mode render` + `inspect_frames.py --report …`
6. Alle Kontaktbögen und Streifen sichten, REVIEW-Punkte einstufen
7. Fehler an der Ursache beheben → neu rendern → komplett neu prüfen
8. Hörprüfung durch einen Menschen → `FREIGEGEBEN` → dokumentieren

`video_qa.py --mode render` endet mit Exit-Code 0 (PASS), 2 (REVIEW) oder 1 (FAIL).

## Voraussetzungen und verfügbare Werkzeuge

Geprüft in der Analyse-Umgebung (Cloud-Container, 2026-10-27):

| Werkzeug | Status | Verwendung |
|---|---|---|
| FFmpeg/ffprobe 6.1.1 | vorhanden | Analyse, Encode |
| Python 3.13 (nur Standardbibliothek) | vorhanden | alle Skripte außer `transcribe.py` |
| Node.js 22 | vorhanden | Render-Pipeline |
| Chromium + Playwright 1.63 (global, `/opt/node-tools`) | vorhanden | deterministisches Rendern; bewusst nicht als Projektabhängigkeit installiert |
| three 0.186.1, @fontsource/fraunces, @fontsource/jetbrains-mono | per `npm install` | 3D, Schriften (SIL OFL) |
| DejaVu-Schriften | vorhanden | Zeitstempel in Kontaktbögen |
| faster-whisper | **nicht** installiert | optional, in eigener venv: `python3 -m venv .venv-asr && .venv-asr/bin/pip install faster-whisper` |

Hinweis Spracherkennung: Der Modell-Download von Hugging Face war in der Analyse-Umgebung durch die Netzwerkrichtlinie gesperrt. Verwendet wurde eine über npm verteilte CTranslate2-Fassung von Whisper small (Prüfsumme gegen die mitgelieferte SHA-256 verifiziert); `--model` akzeptiert einen lokalen Modellpfad.

## Validierung der QA-Werkzeuge

Am 2026-10-27 mit zwei synthetischen Testvideos geprüft (nicht versioniert):

- sauberes Video (1080×1920, 30 fps CFR, −14 LUFS, Fade-out) → `PASS`, Exit-Code 0;
- absichtlich fehlerhaftes Video (24→30-fps-Konvertierung, 2-Frame-Schwarzbild, übersteuertes Audio 44,1 kHz ohne Fades) → `FAIL`, Exit-Code 1; erkannt wurden Schwarzbild, Pulldown-Ruckeln (20 % Doppelbilder), Blitzbild, Lautheit, True Peak, abruptes Ende/Einsetzen und Abtastrate.

Zusätzlich an den Referenzen kalibriert (Letterbox-Zuschnitt, Bewegungsübergänge, bekannte Fehlalarme) – siehe `REFERENCE_ANALYSIS.md`, Abschnitt 2.

## Bekannte Einschränkungen

- Render-Pipeline erzeugt bisher nur die abstrakte Testproduktion; ein echtes Inhaltsvideo wurde noch nicht produziert.
- Signalfarbe ist ein Platzhalter; Musik nur selbst erzeugt (keine lizenzierte Musik eingebunden).
- **Claude kann Audio nicht hören.** Ton wird gemessen; die Hörprüfung vor der Freigabe muss ein Mensch durchführen.
- Automatische Bildprüfung findet Kandidaten, keine Gewissheit: Abblend-Übergänge, Zeitraffer und Partikel erzeugen Fehlalarme; sehr kurze Fehler zwischen den 1-s-Kontaktbögen findet nur die Frame-Messung bzw. die Bildstreifen.
- Referenzvideos und Kontaktbögen sind nicht versioniert (Urheberrecht). In einer neuen Umgebung müssen sie erneut bereitgestellt werden.
- Keine Erfolgsdaten der Referenzen; alle Wirkungsaussagen sind Hypothesen.
