# Version 3.0 – Konsolidierte Auswertung (zur gemeinsamen Prüfung)

Stand: 2026-11-04 · **Keine Implementierung.** Grundlage: die vier Analysedokumente (unverändert, siehe 0.3) plus eine Zusatzmessung zu Licht und Farbe (Abschnitt D).
Kennzeichnung: **[M]** Messwert · **[B]** Beobachtung an Frames · **[E]** Einschätzung · **[H]** Hypothese. Keine Aussage hier ist eine belegte Ursache für Reichweite.

---

## 0. Repository-Stand (geprüft 2026-11-04, nach `git fetch`)

### 0.1 Worauf Version 3.0 basiert
| Punkt | Befund [M] |
|---|---|
| Arbeitsstand dieser Sitzung | `HEAD` losgelöst auf **`36a5b6925e6303c0038ddaefc811f04040689904`** |
| `origin/main` | **derselbe Commit** `36a5b69` – „Merge pull request #7: Experiment Referenz-Erkenntnisse (Maßstabsreise) + what-if-fold-paper-42-times“, 2026-11-01 21:12 |
| Lokaler Zweig `main` | veraltet (`3c05398`, PR #4) – nur lokale Referenz, nicht maßgeblich |
| Versionsangabe im Guide | Änderungsprotokoll endet bei **2.2** (Hook-Standard 18.12). Danach kam per PR #7 das Experiment (S1 `crane`, S2 HUD `geo`/`decimals`, S3 Hook-Typ `flashforward`, S4 Maßstabs-Requisiten) – **ohne** neuen Guide-Versionseintrag. |
| „Version 3.0“ | existiert als Name **nirgends** im Repository (kein Tag, keine Datei, kein Commit-Text). **Arbeitsdefinition:** Version 3.0 = `origin/main` @ `36a5b69`. Bitte bestätigen. |
| Sicherung | `origin/backup/main-aad9f02-vor-experiment` = Stand vor dem Experiment |

### 0.2 Nicht gemergte Arbeit auf anderen Zweigen (relevant!)
| Zweig | Commits über `main` | Inhalt |
|---|---|---|
| `claude/whatif-gold-touch` | +3 (2026-11-01) | Produktion „everything turns to gold“, **neue Kit-Teile** (Gold, Van, Orte, Greifen, Posen) |
| `claude/whatif-earth-mass-exponential-6t7p91` | +4 (2026-11-01) | Produktion „earth 1 % heavier“, **neue Kit-Teile** (`props_gravity`, `heatShell`, **Arm-Gelenke**), Klänge bounce/creak/crack |
| `claude/mind-reading-10s` | +5 (2026-10-29, vor Standard 2.0) | ältere Produktion „mind-reading-10s“ |
| `claude/jolly-franklin-dsgjcc`, `claude/magical-brown-t07izd`, `claude/trusting-dijkstra-tfg8q2` | +3…+6 (Oktober) | alte Produktionen vor Standard 2.0 |

**[E] Risiko:** Genau dieses Muster (Kit-Verbesserungen auf nicht gemergten Zweigen) wurde in Guide 18.9 als Hauptgrund genannt, warum Verbesserungen „nicht sichtbar wirkten“. Vor jeder Kit-Erweiterung sollte entschieden werden, ob die Kit-Teile aus `gold-touch` und `earth-mass` übernommen werden – insbesondere die **Arm-Gelenke**, die für eine Ich-Perspektive mit Händen relevant sein können (nicht geprüft).

**A1/A2 im Repository:** Keine Produktion „everything you said became real“ oder „read everyone's mind“ (61 s) auf irgendeinem Zweig [M]. Ihre Beat-Sheets/LOGs sind nicht einsehbar; die Analyse stützt sich auf die Videodateien.

### 0.3 Die Analysedokumente (unverändert, nicht versioniert)
| Datei | SHA-256 (Anfang) |
|---|---|
| `/home/user/whatif-video-system/VIDEO_ANALYSIS_6_VIDEOS.md` | `283f7a3f972a70ae` |
| `/home/user/whatif-video-system/VIDEO_COMPARISON_6_VIDEOS.md` | `04c597ee538e8f25` |
| `/home/user/whatif-video-system/VERSION_3_0_GAP_ANALYSIS.md` | `5c583c4d4b310ae5` |
| `/home/user/whatif-video-system/VERSION_3_0_IMPROVEMENT_PLAN.md` | `135c53825e562229` |
| *neu:* `/home/user/whatif-video-system/VERSION_3_0_CONSOLIDATED_REVIEW.md` | dieses Dokument |

Alle fünf Dateien sind **untracked** (kein Commit, kein Push). Hinweis: Die Container-Umgebung ist flüchtig – ohne Commit gehen die Dateien beim Ende der Sitzung verloren. Sicherung nur auf deine Anweisung.

---

## 1. Was funktioniert bereits (beibehalten und schützen)

| Stärke | Beleg |
|---|---|
| Technische Sauberkeit | A1/A2: 0 Schwarzbilder, 0 Doppelbilder, 0 Standbild-Phasen; −14,1/−14,2 LUFS [M]. B hat Lautheits- und Lesbarkeitsmängel. |
| Schnittfrequenz/Takt | Wechsel/10 s A 2,77–2,97 vs. C 2,43–2,93; Median-Einstellung 3,6 s [M] |
| Frühes Beweis-Ereignis | A1 Pferd bei 1,8 s (Unmöglichkeitstest bestanden) [B] |
| Figurenmodell und Mimik | Gefühle lesbar (A1 Schreck/Jubel, A2 Sorge) [B]; C nutzt dieselbe Würfel-Figurensprache [B] |
| HUD-Grunddesign, Endkarte | gleiches Vokabular wie B, nah an C [B] |
| Kameraarchitektur | 10 Vorlagen inkl. `crane`, Bildgrößen-Regeln; A nutzt viele Bildgrößen [B] |
| Wende/Maßstabsreise | A2 Stadt → Erde → zurück, Zahl fällt nach der Wende [B] |
| Ringschluss | A1 „I could eat a—“ [B] |
| Determinismus, Beat-Sheet → Builder, dreistufige QA | Architektur (18.1, 18.8) |

---

## 2. Nachgewiesene Schwächen (konkret, mit Beleg)

| # | Schwäche | Beleg | Belegstärke |
|---|---|---|---|
| S1 | Kein durchgehender, steigender Einsatz | A1 HUD zählt Gags, Folgen verschwinden nach 5 s; A2 Prämisse wechselt bei 7,5 s (Label-Wechsel) [B] | stark (beide Videos) |
| S2 | Schlüssel-Ursache nicht lesbar | A2 4–7 s, 2,4 Bilder/s gesichtet: „!“-Blase über falscher Figur, Gefahr unsichtbar [B] | stark (A2) |
| S3 | Zuschauer nur Beobachter | A1/A2 0 % Ich-Perspektive; C1/C2 POV in Hook und Schlüsselmomenten [B] | stark |
| S4 | Kleine, leere Sets | A: einfarbige Flächen, 1–5 Figuren; C: Massen/Weite in fast jedem Beat [B]; Bewegung 3–15 s A 2,5–3,1 vs. C 7,3–8,0 [M] | stark |
| S5 | Licht ohne Quellen, ohne Atmosphäre, ohne Oberflächenstruktur | Abschnitt D [B/M] | mittel–stark |
| S6 | Musik extrem bassschwer, kaum Präsenz, keine Stille | < 100 Hz: 71/64 % vs. C 24/11 %; 2–8 kHz A1 0,9 % vs. C1 16,5 %; Stille 0 % vs. C2 6 % [M] | Messung stark, **Hörwirkung unbestätigt** |
| S7 | Kein Wissensanker | A1 Wortspiele, A2 fiktive Zahlen; B/C reale Zahlen in fast jedem Akt [B] | mittel |
| S8 | Titel lang / Gags textabhängig | A1 8 Wörter, 3 Zeilen; C 6–7 Wörter, 2 Zeilen [B] | schwach (1 Video) |

---

## D. Licht, Farben und Atmosphäre – vertiefte Auswertung

### D.1 Bereits untersucht

**Zusatzmessung [M]** (1 Bild/s, 270×480, erstes Bild ausgelassen, Median über alle Bilder):

| | A1 | A2 | B1 | B2 | C1 | C2 |
|---|---|---|---|---|---|---|
| Farbigkeit (Hasler-Süsstrunk) | **52** | **48** | 38 | 63 | 36 | 29 |
| Anteil stark gesättigter Pixel (S > 0,5) | **38 %** | **34 %** | 20 % | 27 % | 14 % | 12 % |
| Anteil dominanter Farbton (±30° um Häufigsten) | 67 % | **54 %** | 92 % | 87 % | 66 % | 74 % |
| Akzentfläche (S > 0,6, nicht dominanter Farbton) | **7,2 %** | **9,5 %** | 1,2 % | 0,5 % | 1,4 % | 0,6 % |
| Warm/Kalt-Verhältnis | 1,1 | 1,2 | 0,0 (kalt) | 8,8 (warm) | 0,4 (kalt) | 0,1 (kalt) |
| Globaler Kontrast (Std. Luma) | 51 | 61 | 54 | 41 | 45 | 39 |
| Lokaler Kontrast | 11,3 | 13,7 | 10,6 | 11,9 | 14,0 | 9,3 |
| Spitzlichter (Y > 235) | 0,1 % | 0,2 % | 0,7 % | 0,7 % | 0,2 % | 0,1 % |
| Schatten (Y < 25) | 6,6 % | 13,9 % | 1,2 % | 0,1 % | 1,7 % | 4,2 % |
| Farbtonwechsel zwischen 10-s-Blöcken | 96·102·141·16·9·154° | 35·103·38·100·102° | 8·3·2·6·4° | 1·1·128·33·137° | 10·71·29·76·33·36° | 112·33·68·8·44·83·108° |

**Gegenbefund [M]:** Unsere Videos sind **farbiger und gesättigter** als alle Referenzen außer B2 – nicht blasser. Der Eindruck „die Referenzen sind lebendiger“ entsteht also **nicht** durch mehr Sättigung. Mehr Sättigung wäre die falsche Richtung.

**Was die Messung stattdessen zeigt [M/E]:**
1. **Farbhierarchie:** Referenzen haben eine **dominante Farbtemperatur** (B1 kalt-grau, C1/C2 kalt) und **sehr kleine Akzente** (0,5–1,4 % der Fläche: rotes Outfit, grüne Zahl, Neon). Unsere Bilder verteilen viele gleich starke bunte Flächen (7–10 % Akzentfläche, Warm/Kalt ausgeglichen) → **[E]** „Spielzeug-Look“, das Auge hat keinen Ankerpunkt.
2. **Kontrast ist nicht der Unterschied:** globaler und lokaler Kontrast liegen bei A gleich hoch oder höher.
3. **Farbwechsel zwischen Akten:** gibt es bei uns (A1/A2 bis 154°) und bei B2/C (bis 137°). Kein Rückstand in der Menge – aber bei uns oft durch bunte Sets statt durch Lichtstimmung.

**Sichtvergleich passender Szenen [B]** (Bogen `pairs.jpg` im Scratchpad: A1 44 s ↔ C1 2 s Platz am Tag, A1 10 s ↔ C1 43 s Innenraum, A2 41 s ↔ C2 3 s Nacht, A2 24 s ↔ B1 28 s Stadt von oben):
- **Sichtbare Lichtquellen:** C zeigt Lampen, Lichterketten, Neon, Deckenspots, leuchtende Fenster mit Lichtabfall. A2-Nacht ist gleichmäßig blau abgedunkelt, ohne Lichtinseln.
- **Oberflächenstruktur:** C hat Kopfsteinpflaster, Holzmaserung, Fassadenornamente, Stoff; A hat einfarbige glatte Flächen (A1 44 s: halbe Bildfläche graue Wand).
- **Atmosphärische Tiefe:** C1/B1 werden zum Hintergrund heller/dunstiger, C1 mit Tiefenunschärfe; A ist bis zum Horizont gleich scharf und gleich hell.
- **Spiegelung/Glanz:** C2 Pool spiegelt Skyline, B1 Wasser spiegelt; bei A keine glänzenden Flächen.
- **Bildfüllung:** C füllt das Bild randvoll mit Detail; A hat große leere Flächen.

### D.2 Noch nicht ausreichend untersucht (vor Kit-Arbeit klären)
| Offener Punkt | Warum offen | Vorgeschlagene Methode |
|---|---|---|
| Systematischer Szenenpaar-Vergleich über **alle** Videos (nicht nur 4 Paare) | bisher Stichprobe | je Szenentyp (Innen Tag, Außen Tag, Nacht, Totale, Nahaufnahme) Paarbogen A ↔ B/C, Checkliste: Lichtquelle sichtbar? Lichtrichtung? Struktur? Dunst? Glanz? Akzentfarbe? |
| Lichtdramaturgie über die Zeit (wann ändert sich Licht und warum) | nur 10-s-Farbtonblöcke gemessen | Helligkeit/Farbton je Einstellung gegen Story-Beats legen |
| Spitzlichter/Glanz und Bloom | 270-px-Statistik zu grob | Ausschnitte in voller Auflösung, Spitzlicht-Masken |
| Tiefenunschärfe/Bewegungsunschärfe-Anteil | nicht gemessen | Schärfe-Gradient oben/unten, Whip-Frames in voller Bildrate |
| Was unser Renderer heute erreicht | **noch nicht getestet** | Vorschau (`tools/still.mjs`) einer Testszene mit vorhandenen Mitteln: Lichtquellen-Requisiten (`streetLamp`, `tableLamp`, beleuchtete `building`-Fenster), Nebel aus `applyLook`, gedämpfte Palette + ein Akzent → zeigt, wie viel ohne Code geht |
| Renderkosten von Lichtquellen, Instancing, Texturen | nicht gemessen | Render-Zeit je Testszene |
| B1 vs. B2 („neuer“ vs. „alter“ Stil desselben Kanals) | B1 atmosphärischer, gedämpfter, glattere Figuren [B] | **[H]** Hinweis, dass der Kanal selbst Richtung Atmosphäre gegangen ist; Ursache für Aufrufe unbelegt |

**„Dopamin“/Reizdichte:** Nicht gemessen und mit diesen Mitteln nicht messbar. Gemessen ist nur Bildveränderung (YDIF) und Farbstatistik. „Visuelle Reizdichte“ bleibt **[H]**.

---

## 3. Weitere noch nicht ausreichend untersuchte Punkte
1. **Hörwirkung** der Musik (A1 vs. C1 auf dem Handy) – nur du kannst das prüfen.
2. **Zuschauerdaten:** keine Abbruchkurven zu A1/A2; Reichweitenzahlen der Referenzen nur Angaben.
3. **A1/A2-Quellen:** Beat-Sheets/LOG fehlen im Repository → welche Regeln bei der Produktion galten, ist unbekannt.
4. **Ich-Perspektive im Kit:** ob die Arm-Gelenke vom Zweig `earth-mass` für ein Hände-Rig taugen – nicht geprüft.
5. **Faktenrichtigkeit** der Referenzen – nicht geprüft (für uns: eigene Fakten mit Quelle).
6. **Stichprobe:** 6 Videos, davon 2 je Gruppe; B2 = R07 (bekannt). Muster nur „wiederkehrend“, nicht statistisch.
7. **Text-Lesbarkeit** (Schriftgröße/Kontrast der Zeilen im Vergleich) – nicht gemessen.
8. **Veröffentlichungsdaten** des Experiment-Videos `what-if-fold-paper-42-times` (Hypothesen H-A bis H-D) – ausstehend.

---

## 4. Kit-Bestand (geprüft auf `36a5b69`)

| Bereich | vorhanden [M] | fehlt für die Erkenntnisse |
|---|---|---|
| Orte | bedroom, kitchen, street, park, office, classroom, cafe, cemetery, livingRoom, houseFront, nightRoad, room/windowPane; Weltraum: globe, stars, atmosphere | große Schauplätze (Platz mit Fassaden, Arena/Tribüne, Partyterrasse, Krankenhaus, Wasserfläche) |
| Requisiten | ≈ 60 (Bett … Schaf, Handy-Bildschirme, Bus, Auto, Sportwagen, Gebäude mit Fensterlicht, Laternen, Lampen, Gedankenblase, Wolke, Flugzeug, Mond, Papier …) | Massen-Requisiten (instanziert), Lichtquellen-Requisiten (Lichterkette, Neon, Spot, Laser), strukturierte Oberflächen |
| Menschenmenge | `crowd(n)` = n vollständige Einzelfiguren | instanzierte Menge (Hunderte–Tausende) |
| Figur | 39 Posen (u. a. reach, holdHand, showUp, placeLow, fall, unconscious), 13 Gefühle (inkl. cry, unconscious) | – (gut) |
| Ich-Perspektive | Kamera-Vorlage `pov` (Augenpunkt + Wackeln), großes Handy für POV | **Hände/Arme an der Kamera** mit Gesten |
| Kamera | push, pull, close, orbit, low, high, pov, track, crane, still | Bewegungsunschärfe (Renderer) |
| Licht/Look | 9 Stimmungen (day, overcast, sunset, night, interior, dusk, storm, blackout, nightRoom), ACES, weiche Schatten, Nebel, Überblendung zwischen Looks | Looks mit Dunst/Gegenlicht/Neon, spiegelnde Flächen, Bloom, Tiefenunschärfe |
| Effekte | `rain`, `burst` | Staub-/Lichtpartikel, Kaustik, Laser |
| HUD | Modi `steps`, `linear`, `geo`, Akzente loss/gain/warn | – (gut) |
| Hook-Typen | proof, process, countdown, mystery, flashforward | – |
| Musik | Code-Synthese, Stile pulse, drive, drive_hi, calm, warm, sad, silence | hellere/breitbandige Klangquellen |
| Klänge | 38 synthetische (whoosh … tick) | – (Umfang gut; Klangqualität ungehört) |

---

## 5. Relevante Ergebnisse des letzten Experiments (`EXPERIMENT_REFERENCE_INSIGHTS.md` 6)
- **Brauchbar übernommen:** `crane` (Maßstabsfahrt), HUD `geo` (exponentielle Stufen), Hook-Typ `flashforward`, Maßstabs-Requisiten.
- **Grenze belegt:** Kranfahrten über sehr große Distanz in kurzer Zeit erzeugen Unschärfe/Schwarzbild → Geschwindigkeit begrenzen (≈ ≤ 10 Bildhöhen/s, Empfehlung, nicht Regel).
- **Schwäche belegt:** Hauptfigur nur in 10 von 19 Beats sichtbar → Gefühlsebene schwächer. **Wichtig für die POV-Idee:** Ich-Perspektive verstärkt dieses Risiko; Gefühle müssen dann über andere Figuren, Hände und Ton getragen werden (C2 löst das mit der Mutter).
- **Offen:** Wirkung von `flashforward` und Maßstabsreise auf Bindung – Veröffentlichungsdaten fehlen.

---

## 6. Maßnahmen nach Umsetzungsart

### 6.1 Sofort umsetzbar – nur Produktionsregeln/Entscheidungen (kein Code, kein Freeze-Thema)
| # | Maßnahme | Schwäche |
|---|---|---|
| R1 | Vor dem Beat-Sheet festlegen: **ein Einsatz, eine Messgröße**, Prämisse bleibt bis zum Ende; jeder Beat verändert diesen Wert und beantwortet die Titelfrage | S1 |
| R2 | **Ursachen-Prüfung ohne Text** an Vorschaubildern für jedes Ereignis, auf das sich Wende/Pointe beziehen | S2 |
| R3 | Spannungsbogen ausdrücklich planen: Aufbau → Wende → Höhepunkt → Auflösung (Hoffnung/Rückschlag aus 18.7 konkret im Beat-Sheet) | S1 |
| R4 | **Geprüfter Wissensanker je Akt** (Zahl/Fakt mit Quelle im LOG) | S7 |
| R5 | **Farbhierarchie** je Akt: eine dominante Lichtstimmung, gedämpfte Kulisse, **ein** Akzent (Hauptfigur oder Schlüsselobjekt); keine zusätzlichen bunten Flächen | S5 (Messung D.1) |
| R6 | **Motiviertes Licht** mit vorhandenen Teilen: sichtbare Lampen/Laternen/Fensterlicht in jeder Nacht- und Innenszene, Nebel-Look für Tiefe | S5 |
| R7 | Musikabschnitte an Wende/Höhepunkt/Pointe binden; vor der Pointe bewusste Ruhe (`silence` existiert); leiser Einstieg erlaubt | S6 (Dramaturgie-Teil) |
| R8 | Titel ≤ 7 Wörter / 2 Zeilen; Zeilen in 2. Person Präsens; Gag muss im Bild lesbar sein | S8 |
| R9 | Mehr Bewegung innerhalb der Einstellung (Vordergrund-Parallaxe, Figuren/Objekte durchs Bild) – keine zusätzlichen Schnitte | S4 (teilweise) |

### 6.2 Notwendige Kit-Erweiterungen (additiv, Freeze 18.10 c – keine Schnittstellenänderung)
| # | Erweiterung | Schwäche | Vorbedingung |
|---|---|---|---|
| K0 | **Entscheidung über nicht gemergte Kit-Teile** (`gold-touch`, `earth-mass`) | – | vor allem anderen |
| K1 | Ich-Perspektive: Hände/Arme an der Kamera mit Gesten (hold, reach, push, show, grip, lie, fall) | S3 | K0 (Arm-Gelenke prüfen) |
| K2 | Instanzierte Menschenmenge + Massen-Requisiten (Tribüne, Autofeld, Skyline-Kulisse) | S4 | Renderzeit messen |
| K3 | Lichtquellen-Requisiten (Lichterkette, Neon-Streifen, Spot mit Lichtkegel, leuchtendes Schild) | S5 | Vorschau-Test D.2 |
| K4 | Zusätzliche Looks: `haze`, `backlight`, `neonNight`, `goldenHour` (über bestehendes `LOOKS`-Objekt) | S5 | – |
| K5 | Neue Orte mit **strukturierten Oberflächen** (Texturen über vorhandenes `canvasTex`) und spiegelnder Wasser-/Bodenfläche | S5 | Renderzeit |
| K6 | Partikel: Staub im Licht, Funken, Konfetti (zu `fx.rain/burst`) | S4/S5 | – |
| K7 | Musik: **neue zusätzliche** Stile mit Präsenz (Obertöne, Hi-Hat/Shaker, Plucks, Bass mit Obertönen) – bestehende Stile unverändert | S6 | **nach deiner Hörprüfung** |

### 6.3 Betrifft den Architektur-Freeze (nur mit ausdrücklicher Ausnahme)
| # | Änderung | Warum Freeze | Einordnung |
|---|---|---|---|
| F1 | Post-Processing: Bewegungsunschärfe bei Whips, Tiefenunschärfe, leichter Bloom | Renderer/Pipeline; Determinismus muss neu nachgewiesen werden | Experiment auf eigenem Zweig |
| F2 | Globale Material-/Licht-Änderung bestehender Kit-Teile (z. B. alle Flächen texturieren) | ändert den Look **aller** bestehenden Produktionen inkl. der abgenommenen Referenz 18.11 | nicht global – nur neue Teile (K5) |
| F3 | Änderung bestehender Musikstile | alte Produktionen klängen beim Neu-Rendern anders | stattdessen K7 |
| F4 | Neue/änderte Prüfregeln (Spektralbalance-Warnung, „Ruhe vorhanden“, Schwarzbild als deklariertes Erzählmittel) | „Prüfregeln“ sind eingefroren | wie 2.2: dokumentierte Ausnahme möglich |
| F5 | Neue Rezepte B3/B4, Längenspanne 65–75 s im Guide | Guide-Regeln; Validator erlaubt technisch schon bis 80 s | Dokumentänderung, Freigabe nötig |
| F6 | Themenspezifische HUD-Varianten | HUD eingefroren (18.5) | nur Experiment |

### 6.4 Optionale Experimente
- F1 Post-Processing · Schwarzbild/Lidschlag als Erzählmittel (C2) · Hook-Typ „Ursache in Echtzeit aus Ich-Sicht“ (C2) · Rezepte B3 „Ritual + doppelte Uhr“, B4 „Überlebensbogen mit Zeitsprüngen“, B5 „Maßstabs-Entdeckungsreise“ (B2, mit `crane`/`geo` bereits baubar), B6 „Ausbreitung + Wende“ (A2-Form, verbessert) · Länge 70–75 s für B3/B4.

---

## 7. Priorität (Vorschlag)

| Rang | Maßnahme | Begründung |
|---|---|---|
| 1 | **R1–R4** (Einsatz, Ursachen, Bogen, Fakten) | stärkste Belege, null Code, sofort in der nächsten Produktion |
| 2 | **Licht-Vorschau-Test (D.2)** + **R5/R6** (Farbhierarchie, motiviertes Licht mit vorhandenen Teilen) | dein Schwerpunkt; Messung zeigt: Weg ist *gedämpfter + gezielter*, nicht bunter; erst testen, was ohne Code geht |
| 3 | **K0** Entscheidung nicht gemergter Kit-Teile | verhindert Wiederholung von 18.9 |
| 4 | **K1** Ich-Perspektive, **K3/K4** Licht & Atmosphäre, **K2** Massen | größte sichtbare Lücken zu C; additiv |
| 5 | **Hörprüfung → K7** und **R7** | Messbefund klar, Wirkung erst nach deinem Hören |
| 6 | F5 Rezepte/Länge, F4 Prüfregeln | nach ersten Produktionen mit R1–R6 |
| 7 | F1 Post-Processing | höchstes Risiko (Determinismus), nur als Experiment |

---

## 8. Ausdrücklich **nicht** ändern
- **Sättigung/Farbigkeit erhöhen** – gemessen sind wir bereits farbiger als C (Gegenbefund D.1).
- Schnittfrequenz erhöhen – kein Rückstand [M].
- Lautheitsziel −14 LUFS senken (B ist leiser, kein Vorteil belegt).
- Figurenmodell, HUD-Grunddesign, Signalfarbe, Kameraarchitektur, Beat-Sheet-Format, Determinismus, bestehende QA-Stufen.
- Bestehende Kit-Teile, Looks oder Musikstile global umbauen (F2/F3).
- Themen, rote Pullover-Figur, grüne Geld-HUD oder Gesangs-Songs der Referenzen übernehmen.
- Ich-Perspektive für das ganze Video – nur Hook und Schlüsselmomente (Experiment-Befund: Gefühlsebene leidet, wenn die Figur fehlt).
- Hektik ohne Prämissenbezug (Guide 18.12 H7 bleibt).
