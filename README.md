# whatif-video-system

Produktionssystem für eigenständige, geprüfte **„What if …?“-Kurzvideos** (9:16, mindestens 60 s, Englisch). **Aktives Produktionsziel: Stil B** (stumm, visuelles Storytelling, HUD, Sounddesign) nach dem verbindlichen **Produktionsstandard V3** (`WHATIF_STYLE_GUIDE.md` Abschnitt 18 inkl. 18.12 Hook und **18.13 Version 3.0**). Stil A („Earth“, Sprecher) ist archiviert. Das Repository enthält die kreative und technische Regelbasis, die Belege aus 15 Referenzvideos, einen Claude-Code-Skill für den Arbeitsablauf und Werkzeuge für Analyse und Qualitätsabnahme.

Eigenständiges Projekt – unabhängig von `AllIN67/oxygen-video`; von dort wurden weder Dateien noch Regeln übernommen.

## Zentrale Dateien

| Datei | Zweck |
|---|---|
| `WHATIF_STYLE_GUIDE.md` | **Quelle der Wahrheit**; **Abschnitt 18 = Produktionsstandard Stil B, Version 3.0 (Vorrang, Architektur-Freeze)** |
| `VERSION_3_0_*.md`, `VIDEO_*_6_VIDEOS.md` | Grundlage von V3: Analyse von 6 Videos, Vergleich, Lückenanalyse, Plan, konsolidierte Auswertung |
| `templates/beats.json`, `templates/quality_review.md` | Vorlage Beat-Sheet; dreistufige Freigabe (technisch, visuell, dramaturgisch) |
| `productions/what-if-phone-battery-life/` | Referenzproduktion des Standards (Testvideo der Systemüberarbeitung) |
| `STYLE_A_EARTH.md` | Regeln für Produktionsstil A (Earth, mit Sprecher); Stil B steht im Style-Guide |
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

**Stil B – Produktionsstandard (Guide 18):** `beats.json` ist die einzige Zeitquelle. Daraus erzeugt
`tools/build_timeline.mjs` die `timeline.json` (Einstellungen mit Kamera-Vorlagen, HUD-Stufen/Akzente, Textzeiten, Ereignisse,
Klangeinsätze auf den Ereignis-Frames, Whip-Luftzüge, Musik- und Atmosphären-Betten). `scene.js` liest Zeiten über
`kit.beatClock(timeline)` – Bild, HUD und Ton laufen dadurch nicht auseinander.

```
beats.json + text.en.json + scene.js
   │  node tools/build_timeline.mjs productions/<slug>          → timeline.json (nie von Hand ändern)
   │  node tools/validate_production.mjs productions/<slug>     → Regeln inkl. Standard B (Kamera-Abwechslung, Ereignisse, HUD, Ton)
   │  node tools/still.mjs --production productions/<slug> --at …   Vorschau je Beat
   ▼  node pipeline/run.mjs --production productions/<slug>     (prüft, dass timeline.json zur beats.json passt)
```

| Baustein | Datei | Zweck |
|---|---|---|
| Schauspiel | `kit/human.js` → `act(spur, t)` | Posen/Gefühle/Blick weich überblendet, Blinzeln, Wangen, Schweißtropfen, Tränen; 39 Posen, 13 Gefühle |
| Kamera-Vorlagen | `kit/camera.js` → `shotKeys()` | push, pull, close, orbit, low, high, pov, track, crane, still – mit Bildgrößen-Klasse für die Abwechslungsprüfung |
| Beats/Ereignisse | `kit/beats.js` → `beatClock()` | `B.ev('id')`, `B.beat('id')`, `B.active(t)` |
| Licht je Beat | `kit/core.js` → `applyLook()` | Stimmungen day … storm, blackout, nightRoom (+ V3: haze, backlight, goldenHour, neonNight, clinical, underwater); Überblendung als Ereignis |
| Licht & Atmosphäre (V3) | `kit/atmosphere.js` → `kit.atmo` | Lichtquellen (lampPool, stringLights, neonStrip, spotCone, glowSign), Gegenlicht, Struktur-Böden, Wasser mit Spiegelung, Staub/Konfetti, Paletten |
| Ich-Perspektive (V3) | `kit/pov.js` → `kit.firstPerson()` | Hände/Arme an der Kamera, Gesten mit `act()`, `hold()` |
| Massen (V3) | `kit/masses.js` → `kit.masses` | instanzierte Menschenmengen, Tribüne, Autofeld, Skyline |
| Post (V3) | `runtime/stage.js` | optional `bloom`, `grade`; vorhanden: Whip-Unschärfe, `motion_blur`, Vignette, Korn |
| Effekte | `kit/fx.js` | Regen, Funkenstoß (deterministisch) |
| HUD | `overlay.js` + `brand.json` | Gestaltung nach R07/R19/R20, Akzente loss/gain/warn, Stufen-Impuls, Endkarte |
| Klänge | `tools/sfx_synth.py` | 38 selbst erzeugte Klänge inkl. Atmosphären (room, city, rain) |
| QA | `tools/video_qa.py` | zusätzlich: Synchronität der Ereignis-Klänge (±1 Frame), Monotonie-Kandidaten |
| Balance (V3) | `tools/balance_qa.py` | informativ: Farbhierarchie, Sättigung, Bandanteile, Stille, Dynamik |

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

**Signalfarbe:** `#F5C04A` (warmes Gold wie in R07/R19/R20), Alarm `#FF4D4D` – festgelegt und eingefroren am 2026-10-30 (`pipeline/runtime/brand.json`, Guide 18.5).

**Renderzeit** (Cloud-Container, 4 Kerne, keine GPU): ≈ 0,4 s pro Frame → ≈ 13–17 min für 61–80 s. Parallele Browser bringen hier keinen Gewinn (gemessen).

### Produktionsstile

| Auftrag | Regeln | Profil | Referenz |
|---|---|---|---|
| Standard (jedes Thema): **Stil B** | `WHATIF_STYLE_GUIDE.md` 18 (+16 Rezept B1/B2) | Standard + `beats.json` | `productions/what-if-phone-battery-life/`, R07, R19, R20 |
| nur bei wörtlich `PRODUKTIONSSTIL: A (Earth)` (archiviert) | `STYLE_A_EARTH.md` | `"profile": "voiceover"` | `productions/earth-stops-1-second/` |

**Mindestlänge 60 s für jedes Video.** `validate_production.mjs` und `video_qa.py` lehnen kürzere Videos ab; `timeline.qa` kann die Grenze nur anheben. `--skip-validate`/`--qa-ignore-length` (`run.mjs`) und `--ignore-length` (`video_qa.py`) sind nur für technische Test-Clips (`tests/…`, `productions/_…`) erlaubt.

### Stil A – Bausteine (Sprecher, Profil `voiceover`)

| Baustein | Datei | Zweck |
|---|---|---|
| Sprecher | `tools/tts_kokoro.py` + `voiceover.json` | Kokoro-82M (Apache-2.0) offline auf der CPU; Modell wird beim ersten Lauf von GitHub geladen (SHA-256 geprüft). Exakte Wortzeiten aus den vom Modell vorhergesagten Phonem-Dauern → `voice/words.json`. Markup: `{gesprochen\|ANZEIGE}`, `*Schlüsselwort*`; Zahlen ausschreiben |
| Untertitel + Einblendungen | `pipeline/runtime/captions.js` | Wort-für-Wort-Untertitel (max. 3 Wörter, aktives Wort gelb, Schlüsselwörter groß mit Pop), Zähler/Titel/Textkarten; `timeline.captions`, `timeline.callouts`, Texte in `text.<lang>.json → callouts` |
| Bildrate | `timeline.fps` | 30 (Standard) oder 60; Übergangsgrenzen gelten in Sekunden |
| Nachbearbeitung | `stage.js` | `timeline.post` (Vignette, Filmkorn), `timeline.motion_blur` (echte Bewegungsunschärfe durch Teilbilder); Szene kann pro Frame `{ camera, fx: { flash, chroma, radial, blurX } }` liefern |
| Musik | `tools/music_synth.py` | per Code nach Ablaufplan (`audio.music`, Stile pulse/drive/drive_hi/calm/silence); im Mix als `music:<name>` |
| Ton | `tools/audio_mix.py`, `tools/sfx_synth.py` | `audio.voice` + `duck_db` auf Beds (automatische Absenkung unter der Stimme); neue Klänge `impact`, `rumble`, `swoosh` |
| Prüfung | `validate_production.mjs` | `"profile": "voiceover"`, Längenbereich aus `timeline.qa` (≥ 60 s, gilt auch für `video_qa.py --plan`) |
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
| `test_build_timeline.mjs` | Kamera-Vorlagen; Ereignis/Klang/HUD-Akzent auf demselben Frame; Whip-Spitze auf dem Schnitt; HUD-Stufen; Standard-B-Regeln |

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

- Erstes Inhaltsvideo: `productions/earth-stops-1-second/` (Stil A, technisch geprüft, Hörprüfung ausstehend). Mit 41 s erfüllt es die Mindestlänge 60 s nicht mehr – Stilreferenz, nicht veröffentlichungsfähig (`STYLE_A_EARTH.md`, Abschnitt 6).
- Musik nur selbst erzeugt (`tools/music_synth.py`, keine lizenzierte Musik eingebunden).
- Referenzproduktion Stil B: `productions/what-if-phone-battery-life/` (Stand siehe dessen `LOG.md` und `quality_review.md`).
- **Claude kann Audio nicht hören.** Ton wird gemessen; die Hörprüfung vor der Freigabe muss ein Mensch durchführen.
- Automatische Bildprüfung findet Kandidaten, keine Gewissheit: Abblend-Übergänge, Zeitraffer und Partikel erzeugen Fehlalarme; sehr kurze Fehler zwischen den 1-s-Kontaktbögen findet nur die Frame-Messung bzw. die Bildstreifen.
- Referenzvideos und Kontaktbögen sind nicht versioniert (Urheberrecht). In einer neuen Umgebung müssen sie erneut bereitgestellt werden.
- Keine Erfolgsdaten der Referenzen; alle Wirkungsaussagen sind Hypothesen.
