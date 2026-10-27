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
├── templates/
│   ├── scene_plan.md          # Vorlage Szenenplan + text.en.json-Struktur
│   └── production_log.md      # Vorlage Produktionsprotokoll
├── tools/
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
└── productions/               # ein Ordner pro Video (noch leer)
```

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
| Node.js 22 | vorhanden | künftige Render-Pipeline |
| Chromium + Playwright | vorhanden | künftiges deterministisches Rendern (Empfehlung im Guide 10.3) |
| DejaVu-Schriften | vorhanden | Zeitstempel in Kontaktbögen |
| faster-whisper | **nicht** installiert | optional, in eigener venv: `python3 -m venv .venv-asr && .venv-asr/bin/pip install faster-whisper` |

Hinweis Spracherkennung: Der Modell-Download von Hugging Face war in der Analyse-Umgebung durch die Netzwerkrichtlinie gesperrt. Verwendet wurde eine über npm verteilte CTranslate2-Fassung von Whisper small (Prüfsumme gegen die mitgelieferte SHA-256 verifiziert); `--model` akzeptiert einen lokalen Modellpfad.

## Validierung der QA-Werkzeuge

Am 2026-10-27 mit zwei synthetischen Testvideos geprüft (nicht versioniert):

- sauberes Video (1080×1920, 30 fps CFR, −14 LUFS, Fade-out) → `PASS`, Exit-Code 0;
- absichtlich fehlerhaftes Video (24→30-fps-Konvertierung, 2-Frame-Schwarzbild, übersteuertes Audio 44,1 kHz ohne Fades) → `FAIL`, Exit-Code 1; erkannt wurden Schwarzbild, Pulldown-Ruckeln (20 % Doppelbilder), Blitzbild, Lautheit, True Peak, abruptes Ende/Einsetzen und Abtastrate.

Zusätzlich an den Referenzen kalibriert (Letterbox-Zuschnitt, Bewegungsübergänge, bekannte Fehlalarme) – siehe `REFERENCE_ANALYSIS.md`, Abschnitt 2.

## Bekannte Einschränkungen

- **Noch keine Render-Pipeline** im Repository; Empfehlung und Anforderungen stehen im Style-Guide (10.2, 10.3).
- **Claude kann Audio nicht hören.** Ton wird gemessen; die Hörprüfung vor der Freigabe muss ein Mensch durchführen.
- Automatische Bildprüfung findet Kandidaten, keine Gewissheit: Abblend-Übergänge, Zeitraffer und Partikel erzeugen Fehlalarme; sehr kurze Fehler zwischen den 1-s-Kontaktbögen findet nur die Frame-Messung bzw. die Bildstreifen.
- Referenzvideos und Kontaktbögen sind nicht versioniert (Urheberrecht). In einer neuen Umgebung müssen sie erneut bereitgestellt werden.
- Keine Erfolgsdaten der Referenzen; alle Wirkungsaussagen sind Hypothesen.
