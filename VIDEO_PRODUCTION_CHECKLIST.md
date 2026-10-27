# Video-Produktions-Checkliste

Für **jedes** Video abarbeiten. Regeln und Begründungen stehen in `WHATIF_STYLE_GUIDE.md` (Abschnittsnummern in Klammern). Ein Punkt gilt erst als erledigt, wenn er im Produktionsprotokoll (`productions/<slug>/LOG.md`, Vorlage `templates/production_log.md`) mit Ergebnis vermerkt ist.

Ablage pro Video: `productions/<slug>/` mit `LOG.md`, `scene_plan.md`, `text.en.json`, Quellcode/Assets, `render/` (nicht versioniert), `qa/`.

---

## 1. Thema und zentrale What-if-Frage

- [ ] Frage formuliert: „What if …?“, ≤ 10 Wörter, max. 2 Zeilen (2)
- [ ] Messgröße für den HUD festgelegt (Start → Endzustand, Einheit) (1.4)
- [ ] ≥ 5 eskalierende Konsequenzen gesammelt (1.4)
- [ ] Pointe/Wendung festgelegt (3.2)
- [ ] Fakten recherchiert, **jede Zahl mit Quelle** im Protokoll (3.2)
- [ ] Themen-Ausschlüsse geprüft: keine realen Personen, Logos, fremden Figuren; Themenpool beachtet (1.4)

## 2. Hook und Dramaturgie

- [ ] Frame 0: bewegte Szene + Titel + HUD (2)
- [ ] HUD-Wert ändert sich in den ersten 2 s (2)
- [ ] Auslösendes Ereignis spätestens bei 10 s (2)
- [ ] Akte A–E mit Zeiten geplant; Eskalation monoton; ≥ 2 HUD-Label-Wechsel geprüft (3)
- [ ] Global/persönlich-Wechsel geprüft (3.2)
- [ ] Geplante Länge 61–80 s (10.1)

## 3. Szenenplan

- [ ] `scene_plan.md` nach Vorlage vollständig (Zeit, Bild, Kamera, HUD, Text, Ton, Übergang) (4)
- [ ] Texte nur in `text.en.json`; 12–24 Zeilen; je 3–10 Wörter (4, 1.3)
- [ ] Anzeigedauer je Zeile = max(1,8 s; Wörter/3 + 0,6 s), ≤ 4,5 s (4)
- [ ] Bild-vor-Text-Prüfung: keine Zeile beschreibt nur Sichtbares (4)
- [ ] Spätestens alle 6 s eine sichtbare Zustandsänderung (7.1)

## 4. Visuelle Umsetzung, Kamera, Übergänge

- [ ] Ein Kamera-Paradigma P1–P4 gewählt und begründet (5.1)
- [ ] Augenhöhe als Standard; Orientierungs-Totale bei Maßstabswechsel (5.2)
- [ ] Nur echte 3D-Kamera, weiche Kurven, keine 2D-Zooms (5.2)
- [ ] Vorder-/Mittel-/Hintergrund in jeder Einstellung; Referenzobjekte für Maßstab (6.1)
- [ ] Lichtverlauf dramaturgisch; **Blitzregel** (≤ 3 großflächige Hell-Dunkel-Wechsel/s) (6.2)
- [ ] Typografie-Maße, Sicherheitszone, Scrim, Tabular-Ziffern (6.3)
- [ ] Erkennungsmerkmale 6.4 umgesetzt (Fortschrittsskala, Signalfarbe, Schriften)
- [ ] Übergänge nur aus Tabelle 7.2; Text blendet vor dem Schnitt aus (7.1)
- [ ] Jeder Effekt mit Erzählfunktion im Szenenplan; Effekt-Seeds fest (8)
- [ ] Assets/Schriften mit Lizenz im Protokoll (6.3)

## 5. Audio und Sounddesign

- [ ] Kein Sprecher (9.1)
- [ ] Musik mit dokumentierter Lizenz; instrumental bevorzugt (9.2)
- [ ] Lautheitsdramaturgie geplant: Aufbau, Rückgang vor Schlüsselmoment, Maximum am Höhepunkt (9.2)
- [ ] Jedes Schlüsselereignis: Ton-Akzent oder bewusste Stille, framegenau (9.3)
- [ ] 5–10 ms Fades auf jedem Clip (9.3)
- [ ] Mischung auf −14 LUFS ± 1, True Peak ≤ −1 dBTP; Fade-out ≥ 0,5 s (9.4, 7.4)

## 6. Rendern

- [ ] Deterministisch: Frame n wird für t = n/30 berechnet, keine Echtzeit-Aufnahme (10.2)
- [ ] Alle Assets vor Frame 0 geladen; globale Zeitachse (10.2, 12)
- [ ] Encode: 1080×1920, 30 fps CFR, H.264 High, yuv420p, BT.709, CRF ≤ 18, AAC 48 kHz ≥ 192 kbit/s, `+faststart` (10.1)
- [ ] Render-Befehl und Versionsstand (Git-Commit) im Protokoll

## 7. Technische Eigenschaften prüfen

```bash
python3 tools/video_qa.py productions/<slug>/render/final.mp4 --out productions/<slug>/qa --mode render
```

- [ ] Status im Protokoll eingetragen (PASS / REVIEW / FAIL) mit allen Meldungen
- [ ] Format, Bildrate, Länge, A/V-Länge, Startzeiten korrekt (11.1)

## 8. Komplette MP4 untersuchen

```bash
python3 tools/inspect_frames.py productions/<slug>/render/final.mp4 --report productions/<slug>/qa/report.json --out productions/<slug>/qa/strips
```

- [ ] **Alle** Kontaktbögen `qa/sheet_*.jpg` angesehen – Anfang, Mitte **und Ende** (11.2)
- [ ] `qa/shots.jpg` angesehen: Einstellungsfolge wie geplant
- [ ] **Jeder** Bildstreifen in `qa/strips/` angesehen (jeder Schnitt, Übergang, REVIEW-Kandidat)
- [ ] Jeder REVIEW-Punkt einzeln als „beabsichtigt“ (mit Grund) oder „Fehler“ eingestuft
- [ ] Alle Texte: Rechtschreibung, Lesbarkeit auf 240-px-Kontaktbogen, Sicherheitszone, Dauer
- [ ] Kontinuität und HUD-Stetigkeit geprüft
- [ ] **Hörprüfung durch einen Menschen**: Kopfhörer + Handylautsprecher, komplette Länge; keine Knackser/Rauschen/Verzerrung, synchron, sauberes Ende (11.3)

## 9. Fehler beheben

Für jeden Fehler im Protokoll: Zeitpunkt · Beschreibung · wahrscheinlichste Ursache · Korrektur an der **Produktionslogik bzw. Szene** (nicht nur Symptom überdecken) (12).

- [ ] Alle FAIL-Punkte behoben
- [ ] Alle als Fehler eingestuften REVIEW-Punkte behoben

## 10. Erneut rendern und erneut prüfen

- [ ] Neu gerendert (komplett, nicht nur Teilstücke einfügen)
- [ ] Schritte 7 und 8 **vollständig** wiederholt, neuer QA-Bericht im Protokoll
- [ ] Schleife 9–10 wiederholen, bis keine Fehler mehr offen sind

## 11. Freigabe

- [ ] `TECHNISCH GEPRÜFT`: 11.1 PASS (oder REVIEW mit allen Punkten begründet) + Sichtprüfung vollständig
- [ ] `FREIGEGEBEN`: zusätzlich Hörprüfung durch einen Menschen bestätigt (Name/Datum)
- [ ] Erst danach Datei als final kennzeichnen (`render/final_APPROVED.mp4`)

## 12. Ergebnis dokumentieren

- [ ] Protokoll vollständig: Thema, Entscheidungen, Abweichungen vom Style-Guide mit Begründung, Quellen, Lizenzen, QA-Ergebnisse aller Durchläufe, bekannte Einschränkungen
- [ ] Erkenntnisse für den Style-Guide notiert (nur Vorschläge; Änderung des Guides erst mit Belegen)
- [ ] Nach Veröffentlichung: Analytics nach 7 Tagen eintragen (Wiedergabequote, Abschlussrate, 3-s-Rate, Shares/Kommentare/Follower pro 1.000)
