# Version 3.0 – Verbesserungsplan (zur Freigabe)

Grundlage: `VIDEO_ANALYSIS_6_VIDEOS.md`, `VIDEO_COMPARISON_6_VIDEOS.md`, `VERSION_3_0_GAP_ANALYSIS.md`.
**Status: Vorschlag. Nichts davon ist umgesetzt.** Umsetzung erst nach Freigabe, einzeln, innerhalb des Architektur-Freeze 18.10 (neue Kit-Teile ohne Schnittstellenänderung) oder mit ausdrücklicher Ausnahme.

Kennzeichnung der Umsetzungsart: **[P]** Prompt-/Produktionsentscheidung (kein Code) · **[G]** Guide/QA-Vorlage (Text) · **[K]** Code: neues Kit-Teil/Werkzeug (Freeze-konform) · **[A]** Code mit Architektur-Berührung (Freeze-Ausnahme nötig).
Erwartete Wirkungen auf Zuschauerbindung sind **[H] Hypothesen** – ohne Abbruchkurven nicht belegbar.

---

## Priorität 1 – wesentliche Schwächen

### P1.1 Ein Einsatz, eine Linie
1. **Problem:** Unsere Videos haben keinen durchgehenden, steigenden Einsatz. A1 zählt Gags (HUD „CAME TRUE“), die Folgen verschwinden nach 5 s; A2 wechselt bei 7,5 s von „Gedanken lesen“ zu „alle denken an dich“.
2. **Beleg:** C1 Geld + Zeit fallen gleichzeitig (24:00:00 → 00:00:00, $1T → $634M); C2 Leben/Zustand DAY 1 → WEEK 6; B1 ein Wasserstand cm → 8.848 m; B2 eine Körpergröße. Alle vier halten **eine** Messgröße und **eine** Prämisse bis zum Ende.
3. **Änderung:** Vor dem Beat-Sheet einen Satz festlegen: „Der Einsatz ist ___; das HUD misst ___; jeder Beat verändert genau diesen Wert.“ Label-Wechsel nur, wenn die Messgröße dieselbe bleibt (z. B. Phase). Ereigniszähler („wie oft passiert X“) nur, wenn jede Zählung den Einsatz erhöht.
4. **Wirkung [H]:** Zuschauer kann jederzeit sagen, „wie schlimm es gerade steht“ → Grund weiterzuschauen.
5. **Bereich:** Story, Hook.
6. **Systemänderung:** **[P]** reicht. Optional **[G]** Zeile in `templates/quality_review.md` C („Einsatz bleibt gleich und steigt“) und ein additives Beat-Sheet-Feld `story.stake` (nur Text, Validator unverändert).

### P1.2 Ursache der Pointe muss ohne Text lesbar sein
1. **Problem:** Das Schlüsselereignis, auf dem Wende und Endfrage aufbauen, ist nicht verständlich.
2. **Beleg:** A2 4–7 s (2,4 Bilder/s gesichtet): „!“-Blase über der Hauptfigur statt über dem Fahrer, Gefahr unsichtbar, Bus hält einfach; bei 47 s „The driver you saved this morning“. C2 zeigt jede Ursache im Bild (Geländer, Sturz, Kopf an Kante).
3. **Änderung:** Für jedes Ereignis, auf das sich die Pointe bezieht (`setup` der Pointe), Vorschaubild ohne Untertitel prüfen: „Was ist passiert und wer hat es verursacht?“ Muss eindeutig sein; sonst Nahaufnahme/Reaktion ergänzen.
4. **Wirkung [H]:** Pointe zahlt sich aus statt zu verwirren; weniger Abbruch in der zweiten Hälfte.
5. **Bereich:** Story, Szenen, QA.
6. **Systemänderung:** **[G]** ein Prüfpunkt in `quality_review.md` C/H. Kein Code.

### P1.3 Ich-Perspektive mit Körper („du“)
1. **Problem:** Unsere Titel sagen „What if **you** …“, das Bild zeigt aber immer eine fremde Figur von außen.
2. **Beleg:** C1 Frame 0: eigene Hände, Karte wird zugeschoben; C2 Frame 0–3: Geländer, Kippen über die Kante (Bewegung 12,55 [M]), später Liegen, MRT, Tennis in POV. A1/A2/B1/B2 durchgehend 3. Person.
3. **Änderung:** Neues Kit-Teil `kit.firstPerson()` – Arme/Hände (Würfel-Stil, Hautton/Ärmel wählbar) relativ zur Kamera, mit Gesten über `act()`-ähnliche Spur (hold, reach, push, grip, show, lie, fall), passend zur vorhandenen Vorlage `pov`. Einsatz: **Hook und 2–4 Schlüsselmomente**, nicht das ganze Video (Gefühl der Hauptfigur bleibt über Spiegel/Reaktionen anderer lesbar). Hook-Entwurf 18.12 H10 um die Frage ergänzen: „Wäre der Einstieg aus Ich-Sicht stärker?“
4. **Wirkung [H]:** stärkere Identifikation in 0–3 s; Hook über Einsatz statt über Lautstärke/Schnitte.
5. **Bereich:** Kamera, Hook, Animation.
6. **Systemänderung:** **[K]** neues Kit-Teil (Freeze 18.10 c); keine Schnittstellenänderung. Vorher eine Vorschau-Probe (`tools/still.mjs`).

### P1.4 Schauwert und Weltdichte
1. **Problem:** Unsere Orte sind klein, leer, gleichmäßig beleuchtet.
2. **Beleg:** A1 einfarbige Wände, leere Plätze (22, 43 s); A2 Mengen mit ≈ 10–20 Figuren. C1 Feld mit Hunderten Ferraris, Stadion mit Tausenden Zuschauern, Luftbild vieler Stadien; C2 Party mit Hunderten Figuren, Laser, Skyline; B1 Dunst/Regen/Wasser. Messbar: Bildveränderung 3–15 s A 2,5–3,1 vs. C 7,3–8,0 [M]. (Detailmaß SI trennt nicht – Befund ist Sichtbefund.)
3. **Änderung:**
   - **[K]** `kit.crowdInstanced(n, area, opts)` – Hunderte bis Tausende vereinfachte Figuren per `InstancedMesh` (leichte Animation: Wippen, Jubeln), zusätzlich zur bestehenden `crowd()`.
   - **[K]** Massen-/Kulissen-Teile: Tribüne, Autofeld (instanziert), Skyline-Kulisse, Lichterketten, Neon-/Laser-Streifen, Wasserfläche mit Glanz.
   - **[K]** zusätzliche `applyLook`-Stimmungen mit Atmosphäre: `haze` (Tiefendunst), `backlight` (Gegenlicht/Sonnenglanz), `neonNight`, `rainy`.
   - **[P]** Regel für die Produktion: **je Akt mindestens ein Schauwert-Bild** (Masse, Weite oder Glanz), möglichst als Höhepunkt des Akts.
4. **Wirkung [H]:** mehr „Wow“-Bilder, die ohne Text funktionieren; höherer wahrgenommener Produktionswert.
5. **Bereich:** Szenen, Visuals.
6. **Systemänderung:** **[K]** additive Kit-Teile + Looks; Renderzeit vorher messen (Instancing ist günstig, Licht/Schatten von Tausenden Objekten nicht).

### P1.5 Musik-Klangfarbe prüfen und verbessern
1. **Problem:** Unsere Musik ist laut Spektrum extrem bassschwer und fast ohne Präsenzbereich.
2. **Beleg [M]:** Energie < 100 Hz A1 71 %, A2 64 % (B 31–32 %, C 11–24 %); 2–8 kHz A1 0,9 % (C1 16,5 %). Spektrogramm: schmales Band 0,8–1,5 kHz + Sub-Bass (Ursache: `music_synth.py` – Sägezahn mit 8 Obertönen, Sinus-Bass).
3. **Änderung:** Zuerst **Hörprüfung durch dich auf einem Handylautsprecher** (A1 vs. C1 direkt nacheinander). Bestätigt sie den Befund: (a) **[K]** `music_synth.py` um hellere Klangquellen erweitern (Obertöne, Hi-Hats/Shaker, Plucks), Sub-Bass absenken, Bass mit Obertönen (hörbar auf Handys), oder (b) **[P]** lizenzfreie Produktionsmusik aus einer kostenlosen Bibliothek verwenden (Lizenz je Titel im LOG) – Entscheidung beim Auftraggeber. Zusätzlich **[K]** `video_qa.py` misst Bandanteile und warnt bei > 50 % < 100 Hz bzw. < 3 % 2–8 kHz (neue Messung, keine Regeländerung bestehender Prüfungen).
4. **Wirkung [H]:** Ton klingt auf Handys voller und „professioneller“.
5. **Bereich:** Sound.
6. **Systemänderung:** abhängig von der Hörprüfung; (a) **[K]** oder (b) **[P]**.

---

## Priorität 2 – sinnvolle Verbesserungen

### P2.1 Ton erzählt mit: Abschnittswechsel auf Story-Beats, echte Stille
- **Problem/Beleg:** C1 Musik setzt beim ersten Kauf ein (9,5 s), bricht bei „Time's up“ (52,3 s); C2 Abbruch beim Koma (15,3 s), Aussetzer im MRT, **2,2 s Stille** vor der letzten Zeile; Stille-Anteil C2 6 %, A 0 % [M]. A2 hat Ansätze (Wende 30 s).
- **Änderung:** **[P]** Musikabschnitte im Beat-Sheet an Wende, Höhepunkt und Pointe binden; vor der Pointe 0,5–2 s `silence` (Stil existiert bereits). Ein leiser Einstieg ist erlaubt (C1 0–10 s leise). Optional **[G]** Prüfpunkt „mindestens eine bewusste Ruhe ≥ 0,4 s“.
- **Wirkung [H]:** Pointe/Wende werden spürbar. **Bereich:** Sound. **Code:** nein.

### P2.2 Wissensanker in jedem Akt
- **Problem/Beleg:** B1 („20 cm a day“, „8,848 m“), B2 (Milbe, Virus, DNA), C1 (reale Preise/Werte), C2 (GCS 3/15, „4 in 10“, „1 in 4“) liefern Fakten; A1 nur Wortspiele, A2 fiktive Zahlen.
- **Änderung:** **[P]** je Akt mindestens eine reale, geprüfte Zahl/Tatsache in der Zeile oder im HUD; Quelle im LOG.
- **Wirkung [H]:** „Ich habe etwas gelernt“ → Teilen/Kommentieren. **Bereich:** Story. **Code:** nein.

### P2.3 Zwei zusätzliche Story-Formen (Rezepte)
- **Problem/Beleg:** Nur B1/B2 erlaubt; C1 und C2 passen in keines.
- **Änderung:** **[G]** Guide 16 um zwei Rezepte ergänzen (nach Freigabe): **B3 „Ritual + doppelte Uhr“** (gleiche Handlung je Beat, steigende Größenordnung, Budget- und Zeitzähler, Umdeutung am Ende – C1) und **B4 „Überlebensbogen“** (eine Person, Zeitsprung-HUD DAY/WEEK, Hoffnung/Rückschlag, Fakten, emotionale Auflösung – C2). Alle bestehenden Prüfregeln gelten weiter; HUD-Modi `steps/linear/geo` reichen.
- **Wirkung [H]:** passendere Form je Thema statt Gag-Reihung. **Bereich:** Story, Architektur (nur Dokument). **Code:** nein (Validator kennt Rezepte nur indirekt; prüfen, ob „≥ 5 Orte“ für B4 passt).

### P2.4 Länge an die Geschichte koppeln
- **Problem/Beleg:** B1-Norm 61–64 s; C1 70 s, C2 75 s mit dichter Handlung.
- **Änderung:** **[G]** für B3/B4 65–75 s zulassen, Bedingung: kein Monotonie-Kandidat, jedes Beat-Ereignis bleibt Pflicht.
- **Wirkung [H]:** mehr Raum für Wende und Auflösung. **Code:** nein – der Validator erlaubt bereits bis 80 s (`MAX_SECONDS_DEFAULT = 80`); nur der Guide-Text 16.1/18.2 nennt 61–64 s.

### P2.5 Mehr Bildveränderung innerhalb der Einstellung (3–15 s)
- **Problem/Beleg:** Bewegung 3–15 s A 2,5–3,1 vs. C 7,3–8,0 [M], bei gleicher Schnittzahl.
- **Änderung:** **[P]** im Hook-Fenster Kamerafahrten mit Vordergrund-Parallaxe, Figuren/Objekte, die durchs Bild ziehen, Massen in Bewegung (P1.4) – **keine** zusätzlichen Schnitte (18.12 bleibt: Hektik ohne Prämissenbezug ist Füllstoff).
- **Wirkung [H]:** lebendigeres Bild ohne Schnitthektik. **Code:** nein.

### P2.6 Kürzere Titel, Zeilen in 2. Person
- **Problem/Beleg:** A1-Titel 8 Wörter/3 Zeilen, Gags nur über Zitatzeilen verständlich; C-Titel 6–7 Wörter/2 Zeilen, Erzählzeilen „You jump. Not far enough.“
- **Änderung:** **[P]** Titel ≤ 7 Wörter / 2 Zeilen; Zeilen bevorzugt in 2. Person Präsens; Gags so bauen, dass das Bild den Witz trägt.
- **Code:** nein.

---

## Priorität 3 – optionale Experimente

| # | Experiment | Beleg | Art | Hinweis |
|---|---|---|---|---|
| P3.1 | Schwarzbild/Lidschlag als **deklariertes** Erzählmittel (Beat-Feld `intentionalBlack`, QA ignoriert dort Schwarzbilder) | C2 15–18 s, 21–24 s | **[K]** additiv in Validator/QA | nur für Themen mit Bewusstlosigkeit/Blackout |
| P3.2 | Post-Processing: leichter Bloom, Tiefenschärfe, Bewegungsunschärfe bei Whips | C-Whips, C2 Lidspalt, Glanz | **[A]** berührt Renderer/Determinismus → Freeze-Ausnahme | erst auf Experiment-Branch, Render-Zeit + Bit-Gleichheit messen |
| P3.3 | Signal-Akzentfarbe der Hauptfigur in sonst gedämpfter Welt | B1 rotes Outfit, C2 Neon | **[P]** | nicht das rote Pullover-Markenzeichen von B kopieren |
| P3.4 | Themenspezifische HUD-Variante (z. B. Geldbetrag groß) | C1 | **[A]** HUD eingefroren (18.5) | nur als A/B-Test |
| P3.5 | Hook-Typ „Ursache in Echtzeit aus Ich-Sicht“ (`flashforward` ist Höhepunkt zuerst; C2 zeigt den Moment *vor* der Katastrophe) | C2 0–3 s | **[G]** additiver Hook-Typ | nach P1.3 |

---

## Abschluss: Was konkret zu verbessern ist

Die Antwort auf „Was müssen wir verbessern, um näher an die erfolgreichen Referenzen zu kommen?“ – nach Belegstärke geordnet:

1. **Einen einzigen, steigenden Einsatz erzählen** (P1.1) und **jede Ursache sichtbar machen** (P1.2). Das ist der größte inhaltliche Unterschied: B und C halten eine Prämisse und eine Messgröße bis zum Schluss; A1 reiht Gags ohne Folgen, A2 verliert seine Prämisse und versteckt den Auslöser. Kostet keinen Code.
2. **Den Zuschauer zum „du“ machen** (P1.3): Ich-Perspektive mit eigenen Händen in Hook und Schlüsselmomenten. Das ist das auffälligste Mittel beider Millionen-Videos; dafür fehlt ein Kit-Teil.
3. **Schauwert pro Akt** (P1.4): Massen, Weite, Atmosphäre. C nutzt dieselben Würfel-Figuren wie wir – der Abstand liegt in Welt und Licht, nicht im Figurenstil. Neue Kit-Teile, Freeze-konform.
4. **Ton: Klangfarbe prüfen, Stille und Brüche einsetzen** (P1.5, P2.1). Messbar größter technischer Unterschied; Wirkung erst nach deiner Hörprüfung bestätigen.
5. **Faktenanker und passende Story-Form** (P2.2, P2.3): reale Zahlen und zwei zusätzliche Rezepte (Ritual + Uhr, Überlebensbogen).

**Nicht** verbessern müssen wir laut Daten: Schnittfrequenz, Lautheit, Farbsättigung, Figurenstil, HUD-Grundgestaltung, technische Sauberkeit.

**Grenze dieser Aussage:** Ohne Abbruchkurven und bei sehr unterschiedlicher Kanalgröße ist keiner dieser Punkte als Ursache für Reichweite bewiesen. Die Prioritäten beruhen auf wiederkehrenden Unterschieden zwischen A und C in Bild, Ton und Struktur. Messbar machen lässt sich die Wirkung nur, indem wir je Video **eine** Änderung testen und die Abbruchkurve (0–3 s, 0–15 s, Durchsicht) mit A1/A2 vergleichen.

**Vorgeschlagene Reihenfolge nach Freigabe:** (1) P1.1 + P1.2 + P2.2 sofort in der nächsten Produktion (kein Code) · (2) Hörprüfung → Entscheidung P1.5 · (3) P1.3 POV-Rig als Vorschau-Probe · (4) P1.4 Massen/Looks · (5) Guide-Ergänzungen P2.3/P2.4 nach den ersten Ergebnissen.
