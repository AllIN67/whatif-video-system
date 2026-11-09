# WHATIF STYLE GUIDE

**Maßgebliche kreative und technische Grundlage für alle Videos dieses Projekts.**
Version 2.1 · 2026-10-30 · Belegbasis: `REFERENCE_ANALYSIS.md` (R01–R15, Abschnitt 9: R07/R19/R20), Abschnitt 16 (R16–R18) und `references/analysis/MEASUREMENTS.md`.

**Aktives Produktionsziel ist ausschließlich Stil B** – stummes What-if-Video, Rezept **B1** (Standard) oder **B2**.
**Abschnitt 18 ist der verbindliche, eingefrorene Produktionsstandard** und hat bei Widersprüchen Vorrang vor den Abschnitten 1–17.
Stil A (`STYLE_A_EARTH.md`, Sprecher) ist archiviert und wird nur auf ausdrücklichen Auftrag verwendet; er beeinflusst die
aktive Produktion nicht (Abschnitt 17).

**Mindestlänge für jedes Video: 60 s** (alle Stile, Abschnitt 10.1).

**Videosprache: Deutsch** (seit 2026-11-07, Abschnitt 18.14). Englisch bleibt über `--lang en` vollständig unterstützt (alle Produktionen vor der Umstellung).

**Kreativer Maßstab: die vier analysierten Referenzvideos C1, C2, B1, B2** (Abschnitt 18.11, seit 2026-11-07). Das Akku-Testvideo `productions/what-if-phone-battery-life/` ist nur noch technischer Regressionstest.

Kennzeichnung der Regeln:

- **[V] verbindlich** – gilt für jedes Video; Abweichung nur mit schriftlicher Begründung im Produktionsprotokoll.
- **[S] situativ** – Standard, darf je nach Thema bewusst anders entschieden werden.
- **[H] Hypothese** – aus Referenzen abgeleitet, Wirkung **nicht** belegt; wird getestet.

Referenzbelege stehen in eckigen Klammern, z. B. *(R12, R14)*. Zahlen aus den Referenzen sind gemessen; alle anderen Zahlen sind **unsere Festlegungen**, nicht aus Erfolgsdaten abgeleitet.

---

## 1. Ziel und Identität des Formats

### 1.1 Was wir machen

Vertikale Kurzvideos (mindestens 60 s, Standard 61–80 s), die eine einzige **„Was wäre, wenn …?“-Frage** (Englisch: „What if …?“) konsequent zu Ende denken: aus der Perspektive des Zuschauers, in einer stilisierten 3D-Welt, erzählt durch **kurze Texteinblendungen, einen Live-Messwert und Bild/Ton – ohne Sprecher**.

Das Format-Versprechen an den Zuschauer: *„In einer Minute erlebst du, was wirklich passieren würde – Schritt für Schritt, mit echten Zahlen, bis zur Pointe.“*

### 1.2 Format-Entscheidung: What-if statt Story

- 14 von 15 Referenzen sind What-if-Videos mit derselben Grundarchitektur (Titelfrage, Live-Messwert, Untertitel, Eskalation, Pointe). Nur R05 ist eine wortlose Story.
- **Entscheidung [V]:** Wir produzieren What-if-Videos. Das Story-Format (R05) ist mit einer einzigen Referenz nicht belegt und wird nicht Teil des Systems.

### 1.3 Sprachentscheidung: ~~Englisch zuerst, Deutsch als kontrollierter Test~~ → **Deutsch (seit 2026-11-07)**

> **Abgelöst durch Auftrag des Nutzers vom 2026-11-07:** Der Kanal wird auf Deutsch umgestellt; alle neuen Videos werden vollständig auf Deutsch produziert (Regeln: **18.14**). Tabelle, Phase-1-Entscheidung und Sprachtest unten bleiben als Entscheidungshistorie stehen. Englisch bleibt technisch vollständig nutzbar (`--lang en`).

| Kriterium | Englisch | Deutsch | Beleg/Annahme |
|---|---|---|---|
| Sprache der Referenzen | 14/14 Videos mit Text | 0/14 | **belegt** |
| Rolle der Sprache im Format | nur Textebene, kein Sprecher (0/15 Referenzen mit Erzähler) | gleich | **belegt** → Lokalisierung = Textaustausch |
| Potenzielles Publikum | sehr groß, international, auch Nicht-Muttersprachler lesen einfache englische Sätze | deutschsprachiger Raum (DACH), deutlich kleiner | **Annahme** (allgemeines Wissen, keine Plattformdaten) |
| Konkurrenz | hoch: allein in dieser Sammlung ≈4 Handschriften mit fast gleicher Formatsprache | vermutlich geringer; in der Sammlung kein deutscher Wettbewerber | **Hypothese**, keine Marktdaten |
| Produktionszuverlässigkeit mit KI | Text in kurzen Sätzen: in beiden Sprachen zuverlässig; kein TTS nötig | gleich; Auftraggeber kann deutsche Texte selbst muttersprachlich prüfen | **Einschätzung** |
| Kultureller Kontext | Referenzen nutzen US-Einheiten (mph, mi, ft, °F) | metrische Einheiten nötig | **belegt** (Einheiten) |
| Plattformen (TikTok, Shorts, Reels, Snapchat, Facebook) | englische Texte werden ohne Anpassung überall verstanden | auf DACH beschränkt | **Annahme** |
| Treue Zuschauerschaft | schwerer, weil austauschbar | eventuell leichter durch Nische | **Hypothese** |

**Entscheidung [V für Phase 1, abgelöst 2026-11-07]:** Wir starten **einsprachig auf Englisch**. Begründung: Die gesamte Belegbasis ist englisch; das Format funktioniert ohne Sprecher, also ist Englisch nicht teurer oder riskanter als Deutsch; die Reichweite ist größer. Das größte Gegenargument – starke Konkurrenz im englischen Markt – adressieren wir nicht durch Sprachwechsel, sondern durch **eigenständige Erkennungsmerkmale** (Abschnitt 6.4) und durch den geplanten Deutsch-Test.

**Sprachunabhängigkeit [V]:** Jeder Bildschirmtext liegt ausschließlich in einer Textdatei pro Sprache (`productions/<slug>/text.de.json` für neue Produktionen; ältere Produktionen `text.en.json`), nie fest im Szenencode. Zahlen im HUD werden aus Werten + Einheit erzeugt, damit eine metrische Fassung (km, km/h, °C) ohne Szenenänderung entsteht. Keine Texte in 3D-Texturen einbacken (Ausnahme: Schilder, die bewusst unübersetzt bleiben dürfen – im Protokoll vermerken).

**Kontrollierter Sprachtest (später) [S] – entfällt mit der Umstellung 2026-11-07, Historie:**

1. Voraussetzung: ≥ 10 veröffentlichte englische Videos mit Analytics.
2. Die 3 Videos mit der höchsten durchschnittlichen Wiedergabequote + 3 Videos aus dem Mittelfeld werden auf Deutsch lokalisiert (gleicher Schnitt, Text getauscht, metrische Einheiten).
3. Veröffentlichung auf einem separaten deutschsprachigen Konto (Zielgruppen nicht vermischen), gleiche Wochentage/Uhrzeiten lokal.
4. Vergleich nach 7 Tagen je Video: durchschnittliche Wiedergabequote (%), Anteil komplett gesehen, Zuschauer nach 3 s (%), Shares/1.000 Aufrufe, Kommentare/1.000, neue Follower/1.000. Rohaufrufe allein sind kein Kriterium.
5. Grundsatzänderung der Sprachstrategie nur, wenn Deutsch bei ≥ 4 von 6 Paaren in mindestens drei der Bindungskennzahlen besser abschneidet. Ergebnis im Änderungsprotokoll am Ende dieses Dokuments festhalten.

### 1.4 Themenwahl

- **[V]** Ein Thema braucht: (a) eine Frage, die in ≤ 10 Wörtern verständlich ist, (b) eine **messbare Größe**, die sich über das Video verändert (Zeit bis …, Entfernung, Größe, Temperatur, Anzahl Menschen, Prozent), (c) mindestens 5 eskalierende Konsequenzen, (d) eine Pointe/Wendung, (e) reale Fakten als Anker, die recherchierbar sind.
- **[V]** Keine realen, identifizierbaren Personen (auch nicht „angelehnt“), keine Markenlogos, keine Nachbildung fremder Figuren.
- **[S] Start-Themenpool:** Physik/Natur/Weltraum/Körper/„du mit einer Superkraft“ (entspricht R04, R06–R09, R11–R15).
- **[S] Vorerst ausgeschlossen:** Wahrheitsbehauptungen über reale Religionen (R01, R02, R03, R10), Politik, reale Katastrophen mit Todesopfern als Spektakel. Grund: hohes Konflikt- und Richtlinienrisiko, schwer kontrollierbare Kommentarspalten. **Diese Abgrenzung ist eine Entscheidung des Auftraggebers** und kann von ihm geändert werden.

---

## 2. Hook und Einstieg (0–5 s)

Belege: Titel ab Frame 0 über bewegtem Bild in 14/14 What-if-Referenzen; HUD ab Frame 0 in 14/14; erste Untertitelzeile bei ≈3–5 s.

> **Ab Version 2.2 gilt für 0–15 s zusätzlich und vorrangig der Hook-Standard 18.12** (Prämisse vorführen, Unmöglichkeitstest, Beweis-Ereignis ≤ 2 s bzw. Geheimnis ab Frame 0). Wo diese Tabelle weniger verlangt (z. B. „Auslöser spätestens bei 10 s“), gilt 18.12.

| Regel | Typ |
|---|---|
| **Frame 0 zeigt bereits: bewegte Szene + Titelfrage + HUD.** Kein Logo, kein Intro, keine Schwarzblende länger als 3 Frames. | [V] |
| Titel als Frage „Was wäre, wenn …?“ (Englisch: „What if …?“), **≤ 10 Wörter, max. 2 Zeilen**, oben mittig (Bildhöhe ≈ 22–32 %). | [V] |
| Genau **ein** Schlüsselwort in der Signalfarbe (Abschnitt 6.4). | [S] *(10/14 Referenzen)* |
| Titel steht 2,5–4,0 s, dann 0,3–0,5 s Ausblendung. | [V] |
| Der HUD-Wert **verändert sich in den ersten 2 s** sichtbar (Countdown läuft, Zähler steigt/fällt). | [V] *(R06, R07, R08, R11–R15)* |
| Erste Untertitelzeile zwischen 3,5 und 5,0 s; sie verschärft Frage oder Einsatz. Verortende Zeilen („It's 3 AM.“) nur, wenn das Bild bereits eine Anomalie zeigt (18.12 H9). | [S] |
| Das auslösende Ereignis (oder sein unmittelbares Bevorstehen per Countdown) ist **spätestens bei 10 s** sichtbar. | [V] *(R01 ≈10 s, R06 ≈8,5 s, R15 ≈7 s)* |
| Der Titel muss vor dem Ausblenden auf dem Kontaktbogen (240 px Breite) lesbar sein. | [V] |
| **Zurückgehalten** wird immer: wie schlimm es wird und wie es endet. Der HUD zeigt die Richtung, nicht das Ziel. | [V] |

**[H]** Der sofort laufende Messwert erzeugt in den ersten Sekunden eine konkrete Frage („Was passiert bei 0?“), die stärker bindet als eine reine Titelfrage.

---

## 3. Dramaturgie und Spannungsaufbau

### 3.1 Grundstruktur (für 60–80 s)

| Akt | Zeit | Inhalt | HUD |
|---|---|---|---|
| A Prämisse | 0–3 s | Titelfrage + **Prämisse wird vorgeführt** (Beweis-Ereignis ≤ 2 s bzw. Geheimnis/Countdown ab Frame 0, 18.12) – keine „normale Welt“ als Einstieg | Startwert läuft, reagiert auf den Beweis |
| B Auslösung | 3–15 s | ≥ 3 neue Prämissen-Konsequenzen, ≥ 2 im Bild; Frage wächst (18.12 H6) | ggf. 1. Label-Wechsel |
| C Eskalation | 12 s – ≈75 % der Laufzeit | 5–9 Stufen à 4–8 s, jede größer/näher/persönlicher | Wert eskaliert; Label-Wechsel pro Phase |
| D Höhepunkt + Wendung | ≈75–90 % | maximale Konsequenz, dann Twist oder persönlicher Moment | Endzustand („HERE“, „0 %“, „BACK“) |
| E Abschluss | letzte 2–5 s | Pointe/Frage/Fortsetzung | – |

### 3.2 Regeln

- **[V]** Jede Stufe ist eine **neue Konsequenz**, nicht eine Wiederholung derselben Idee in größer. Prüffrage pro Zeile: „Lernt der Zuschauer hier etwas Neues?“
- **[V]** Die Eskalation ist **monoton**: Risiko, Maßstab oder persönliche Nähe nehmen zu. Ruhige Momente sind erlaubt, wenn sie den nächsten Schlag vorbereiten (bewusste Stille, Abschnitt 9).
- **[V]** Die **Wendung/Pointe** wird vor dem Skript festgelegt (Endzustand zuerst planen, dann rückwärts eskalieren). *(Wendungen in ≥ 10 Referenzen: R04 Gähnen, R08 Ozean läuft ab, R12 „This really happened.“, R13 „The oceans do not.“)*
- **[S]** Wechsel zwischen global und persönlich: nach einer globalen Stufe („8 billion people see it“) folgt eine menschliche („Your best friend …“). *(R02, R03, R04)*
- **[S]** Mindestens **zwei HUD-Label-Wechsel** markieren die Akte. *(9/15 Referenzen)*
- **[S]** Wenn die Bedrohung von außen kommt: HUD zählt die Entfernung bis „HERE“. *(R11–R14)*
- **[V]** Fakten im Text sind wahr oder als Szenario erkennbar. Jede Zahl erhält im Produktionsprotokoll eine Quelle.
- **[H]** Ein Kreisschluss (Endbild = Anfangsbild, R09) oder eine offene Frage am Ende erhöht Wiederholungen bzw. Kommentare.

### 3.3 Mögliche Durchhänger und Gegenmittel

| Risiko | Gegenmittel |
|---|---|
| Mittelteil wirkt wie Liste | jede Stufe mit anderer Kameraposition oder neuem Maßstab; HUD-Label wechseln |
| Zahl wächst, Bild bleibt gleich | spätestens alle 4–6 s sichtbare Zustandsänderung (Abschnitt 7) |
| Ende verpufft | Pointe als eigenes Ereignis mit Ton-Akzent; danach max. 5 s bis Videoende |

---

## 4. Szenenplanung und Informationsverteilung

- **[V]** Szenenplan als Tabelle: `Zeit | Akt | Bild (Was sieht man?) | Kamera | HUD-Label/Wert | Text | Ton | Übergang`. Vorlage: `templates/scene_plan.md`.
- **[V]** **Eine Zeile = ein Gedanke**, 3–10 Wörter, Satzzeichen am Ende. Keine Zeile über 2 Bildschirmzeilen.
- **[V]** Anzeigedauer pro Zeile: `max(1,8 s; Wörter / 3 + 0,6 s)`, höchstens 4,5 s. *(Referenzen: Zeilen ≈2–4 s sichtbar.)*
- **[V]** Zwischen zwei Zeilen ≥ 0,2 s Pause (Ausblenden 0,2–0,3 s, Einblenden 0,2–0,3 s).
- **[V]** **Bild vor Text:** Der Text beschreibt nicht, was ohnehin zu sehen ist, sondern ergänzt Ursache, Maßstab oder Bedeutung („Es ist kein Ton zu hören.“ statt „Der Asteroid explodiert.“).
- **[V]** Zahlen gehören in den HUD; der Untertitel wiederholt eine HUD-Zahl nur am Höhepunkt.
- **[S]** Die zweite Person („you/your“) ist Standard. *(≥ 11 Referenzen)*
- **[S]** Benannte Figur nur bei Personen-Szenarien („Meet Sam.“, R04); dann **eine** Figur durchgehend.
- **[V]** Die gesamte Textmenge eines Videos: 12–24 Zeilen (Referenzen: ≈15–25). Mehr Text → kürzen, nicht schneller zeigen.

---

## 5. Kamerasprache und Perspektive

### 5.1 Vier erprobte Kamera-Paradigmen – pro Video genau eines wählen [V]

| Paradigma | Beschreibung | Belege | geeignet für |
|---|---|---|---|
| **P1 Fester Beobachter** | eine Position auf Augenhöhe, leichte Drift/Atmen erlaubt; die Welt verändert sich | R12 (1 Einstellung bis ≈60 s), R14 (bis ≈62 s), R13, R11 | Ereignisse, die auf den Ort zukommen |
| **P2 Wandernder Zeuge** | gleitende Kamera auf Augenhöhe durch Menschen/Orte, Wechsel per Whip | R01, R02, R10 | gesellschaftliche Folgen |
| **P3 Ego-Perspektive** | eigene Hände im Bild, Kopfbewegung, Zoom in/out für Maßstab | R06, R15 (R10) | „du erlebst es“-Szenarien, kurze Ereigniszeit |
| **P4 Maßstabs-/Stationsreise** | Schnittfolge durch Stationen, fester Takt | R04, R07, R08, R09 | Eskalation über Orte/Größen |

Die gemessene Schnittfrequenz der Referenzen reicht von 0,12 bis 4,9 Einstellungswechseln pro 10 s *(MEASUREMENTS.md)*. **Es gibt also keine allgemeingültige „richtige“ Schnittfrequenz**; sie folgt aus dem Paradigma.

### 5.2 Regeln

- **[V]** Standardhöhe: menschliche Augenhöhe (≈1,6 m) – der Zuschauer ist „dabei“. Ausnahmen (Aufsicht, Weltraum) sind **Orientierungs-Totalen** und dauern ≤ 3 s.
- **[V]** Wechselt der Maßstab (Tiefe, Größe, Entfernung), erscheint mindestens einmal eine Orientierungs-Totale (Querschnitt, Zoom-out, Karte). *(R08, R15)*
- **[V]** Nur echte 3D-Kamerabewegungen. **Keine** nachträglichen 2D-Zooms/Schwenks auf gerenderte Standbilder.
- **[V]** Kamerabewegung ist weich: Positions- und Rotationskurven mit Ease-in/Ease-out; keine Geschwindigkeitssprünge zwischen zwei Frames (Ausnahme: Whip-Übergang).
- **[V]** Räumliche Orientierung: bei P1/P2 bleibt die Blickachse innerhalb einer Szene auf einer Seite (180°-Regel); Horizont gerade, außer bei bewusstem Kippen als Ereignis (Einsturz, R11).
- **[S]** Kamera-Wackeln nur als Reaktion auf ein Ereignis (Einschlag, Druckwelle), max. 1,5 s, abklingend.

---

## 6. Visuelle Gestaltung und Kontinuität

### 6.1 Bildstil

- **[V]** Stilisierte 3D-Welt (Low-Poly, flache bis weiche Schattierung, vereinfachte Figuren). Keine Fotorealistik, kein Mix aus 2D-Collage und 3D. *(14/14 What-if-Referenzen stilisiert)*
- **[V]** Vollflächig 9:16, **keine Letterbox/Pillarbox** *(R05 nutzt nur 35,8 % der Fläche)*.
- **[V]** Ebenenaufbau in jeder Einstellung: Vordergrund (Geländer, Hände, Rahmen) – Mittelgrund (Handlung) – Hintergrund (Skyline/Himmel). *(R12 Geländer, R14 Promenade, R06/R15 Hände)*
- **[V]** Maßstab wird über bekannte Referenzobjekte gezeigt (Menschen, Autos, Türen, Bäume).

### 6.2 Licht und Farbe

- **[V]** Eine Grundpalette pro Video; Lichtstimmung ändert sich **nur dramaturgisch** (Normal → Bedrohung → Höhepunkt), z. B. warm → überstrahlt → orange *(R14)*, normal → Röntgen-Rot → normal *(R15)*.
- **[V]** **Blitzregel:** höchstens 3 großflächige Hell-Dunkel-Wechsel pro Sekunde; keine Tag/Nacht-Zeitraffer mit flackerndem Lichtwechsel *(R04 ≈4 Wechsel/s)*. Stattdessen weicher Lichtverlauf. (Schutz vor fotosensitiven Reaktionen und Abbruch.)
- **[V]** Überstrahlung (Explosion, Sonne) darf Text nicht unlesbar machen: Text-Scrim ist Pflicht (6.3).

### 6.3 Typografie und Bildschirmtext (Maße für 1080×1920)

| Element | Position | Größe | Stil |
|---|---|---|---|
| Titelfrage | oben mittig, Oberkante ≈ 22 % Höhe | 72–84 px | Serifen-Display, weiß, Schlüsselwort in Signalfarbe |
| HUD | links, Grundlinie Wert ≈ 47–52 % Höhe, linker Rand 64 px | Label ≥ 30 px Versalien gesperrt; Wert ≥ 72 px Ziffern mit fester Breite; Unterzeile ≥ 28 px | Label/Unterzeile 70 % Deckkraft |
| Untertitel | mittig, ≈ 64–70 % Höhe | ≥ 52 px, kursiv | weiß, max. 2 Zeilen, Zeilenbreite ≤ 80 % |
| Endkarte | mittig, ≈ 40–50 % Höhe | Titel ≥ 64 px, Frage/CTA ≥ 44 px, Faktenzeile ≥ 30 px | |

*(Positionen entsprechen den Referenzen: Titel ≈ 23–32 %, HUD ≈ 47–50 %, Untertitel ≈ 66–68 % Bildhöhe, aus Kontaktbögen geschätzt. Unsere Mindestgrößen liegen bewusst über den Referenzen, deren Unterzeilen und Faktenzeilen auf dem Kontaktbogen unlesbar waren.)*

- **[V] Sicherheitszone:** Kein Text außerhalb x = 6–82 %, y = 10–76 % (rechts Plattform-Buttons, unten Beschreibung, oben Reiter).
- **[V] Lesbarkeit:** Jeder Text hat einen weichen dunklen Schatten bzw. lokalen Verlauf (Scrim) mit ≥ 4,5 : 1 Kontrast zum Hintergrund. Prüfung: Text muss auf dem Kontaktbogen (Bild 240 px breit) lesbar sein.
- **[V]** Ziffern mit fester Breite (tabular figures), damit ein laufender Wert nicht zittert.
- **[V]** Nur lizenzfreie Schriften (z. B. SIL Open Font License) – im Protokoll mit Lizenz vermerken.

### 6.4 Eigenständige Erkennungsmerkmale (gegen Austauschbarkeit)

Die Referenz-Handschriften teilen fast identische Formatsprache (Serifenschrift, HUD links, schwarze Endkarte). Wir übernehmen die **funktionalen** Prinzipien, nicht das Aussehen. Festlegungen für unseren Kanal **[V, ab Video 1 konstant halten]**:

1. **Fortschrittsskala am HUD:** unter dem Wert ein dünner Balken, der den Weg vom Start- zum Endzustand zeigt (bei Countdowns ablaufend). In keiner Referenz vorhanden.
2. **Eine Signalfarbe** für Schlüsselwort, Balken und Endkarten-Akzent (Festlegung bei Video 1, danach unverändert; nicht das Gold der Gruppe A).
3. **Eigene Schriftkombination** (Serifen-Display für Titel/Untertitel + Monospace/Tabular für HUD), nicht EB Garamond.
4. **Endbild-Konvention:** Schlussbild mit Pointe statt langer schwarzer Endkarte (Abschnitt 7.4).

Diese Merkmale sind gestalterische Entscheidungen, keine belegten Erfolgsfaktoren **[H]**.

### 6.5 Kontinuität

- **[V]** Figuren, Requisiten und Orte bleiben über Schnitte identisch (gleiches Modell, gleiche Farbe, gleiche Position relativ zur Szene).
- **[V]** Uhrzeit/Licht/Wetter sind zwischen aufeinanderfolgenden Einstellungen konsistent, außer der Wechsel ist Teil der Handlung.
- **[V]** HUD-Werte sind zwischen Schnitten **stetig** (kein Rücksprung, außer erzählerisch begründet).

---

## 7. Schnitt, Timing und Übergänge

### 7.1 Taktung

- **[V]** Spätestens alle **6 s** eine sichtbare Zustandsänderung: Schnitt, neues Ereignis im Bild, HUD-Label-Wechsel oder deutlicher Licht-/Farbwechsel. *(Auch die Ein-Einstellungs-Videos R12/R14 verändern ihr Bild laufend.)*
- **[S]** Takt nach Paradigma: P1 0–1 Schnitte/10 s; P2 3–5; P3 1–3; P4 2–4 oder fester Regeltakt (z. B. alle 2 s, R07/R08).
- **[V]** Schnitte und Übergänge fallen auf Erzählgrenzen: Untertitelwechsel und Schnitt liegen ≤ 3 Frames auseinander; der Untertitel blendet **vor** dem Schnitt aus. *(R07, verifiziert)*

### 7.2 Erlaubte Übergänge

| Übergang | Dauer | Einsatz |
|---|---|---|
| harter Schnitt | 0 | Standard |
| Whip/Fast-Move mit Bewegungsunschärfe | 6–12 Frames | P2, Ortswechsel *(R01, R02, R10: 4–12 Frames gemessen)* |
| Abblende (Dip) | 2–3 Frames ab-, 2–3 Frames aufblenden | Regeltakt *(R07)* |
| Weißblende | ≤ 10 Frames, max. 1 pro 5 s | „Teleport“-Motiv *(R09)* |
| Match-Cut über Form/Maßstab | 0 | Zoom-Reisen |

- **[V]** Keine Standard-Übergänge aus Schnittprogrammen (Wischblenden, Würfel, Glitch).
- **[V]** Keine Zeitlupe/Zeitraffer durch Frame-Duplizieren oder -Auslassen; Geschwindigkeitsänderungen werden in der Animation gerendert.

### 7.3 Bewusste Ruhephasen

- **[S]** 1–2 Ruhephasen pro Video (0,8–3 s): Bewegung, Ton oder Text halten an, unmittelbar vor einem Schlüsselereignis. *(R01, R12)*

### 7.4 Ende

- **[V]** Nach der Pointe höchstens **5 s** bis zum Videoende *(Referenzen: Endkarten 3–8 s; 7–8 s sind ein mögliches Abbruchrisiko [H])*.
- **[S]** Abschlussvarianten: (a) Pointe als letzter Untertitel auf bewegtem Endbild, (b) Frage an den Zuschauer, (c) „Teil 2?“ (Englisch: „Part 2?“) bei Serienpotenzial, (d) Kreisschluss zum ersten Bild.
- **[V]** Bild und Ton enden gemeinsam; Ton-Fade-out ≥ 0,5 s; letztes Bild hält ≥ 0,5 s.

---

## 8. Effekte

- **[V]** Jeder Effekt hat eine Erzählfunktion, die im Szenenplan steht (z. B. „Staubwand zeigt Ankunft der Druckwelle“). Kein Effekt nur als Dekoration.
- **[V]** **Ein** Effektschwerpunkt pro Einstellung (z. B. Explosion *oder* Trümmerregen im Vordergrund, nicht beides gleichzeitig voll).
- **[V]** Partikel/Rauch/Staub sind deterministisch (fester Zufallsstartwert), damit ein Re-Render identisch ist.
- **[S]** Bewegungsunschärfe nur bei schnellen Bewegungen und Whips.
- **[S]** Bewährte Effektfunktionen aus den Referenzen: Überstrahlung = Nähe/Hitze (R12, R14), Staubwand = Ankunft (R12, R14), gesprungenes Glas = Ende/Aufprall (R11, R13), Weltzustand-Farbwechsel = unsichtbares Phänomen (R15), Bildschirme/Handys = gesellschaftliche Reaktion (R01, R03, R10).

---

## 9. Sprecher, Text und Sounddesign

### 9.1 Sprecher

- **[V für Stil B]** **Kein Sprecher.** (Stil A arbeitet mit Sprecher, siehe `STYLE_A_EARTH.md`.) Begründung: 0 von 15 Referenzen nutzen einen Erzähler; das Format funktioniert stumm; ohne Sprecher entfallen TTS-Qualitätsrisiken und die Lokalisierung bleibt billig. Ein Sprecher-Test ist möglich, aber erst nach dem Sprachtest (1.3) und nur als Einzelvariable.

### 9.2 Musik

- **[V]** Nur Musik mit nachweisbarer Lizenz für die Zielplattformen oder selbst erzeugte Musik mit dokumentierten Nutzungsrechten. Quelle + Lizenz im Produktionsprotokoll. *(R07/R08 nutzen vermutlich einen fremden Song mit Gesang.)*
- **[S]** Instrumental bevorzugt **[H]**: Gesang konkurriert mit dem Lesen.
- **[V]** Die Musik folgt der Dramaturgie: Lautheitsverlauf mit Aufbau, mindestens einem Rückgang vor einem Schlüsselmoment und Maximum am Höhepunkt. *(R01, R06, R12, R13, R14 – gemessen)* Kein gleichförmiges Musikbett über 60 s *(R07: LRA 2,2 LU)*.

### 9.3 Soundeffekte

- **[V]** Jedes Schlüsselereignis im Szenenplan hat einen Ton-Akzent oder eine bewusste Stille.
- **[V]** Ton-Akzente liegen framegenau auf dem Bildereignis (Toleranz ±1 Frame = ±33 ms).
- **[S]** Bewusste Stille als Erzählmittel, wenn der Text sie begründet („There is no sound.“, R12: −31 bis −39 LUFS).
- **[V]** Jeder Audioclip bekommt 5–10 ms Ein- und Ausblendung (verhindert Knackser an Schnittkanten).

### 9.4 Mischung (Zielwerte für die finale Datei)

| Wert | Ziel | Referenzbereich (gemessen) |
|---|---|---|
| Integrierte Lautheit | **−14 LUFS ± 1** | −13,8 … −15,5 (11 Referenzen); Ausreißer −17 … −25 |
| True Peak | **≤ −1,0 dBTP** | −13,4 … +2,7 (4 Referenzen > 0) |
| LRA | 6–16 LU | 2,2 … 19,3 |
| Stille im Video | nur geplant | |

---

## 10. Technische Produktionsstandards

### 10.1 Ausgabedatei [V]

| Eigenschaft | Wert |
|---|---|
| Auflösung | 1080 × 1920, quadratische Pixel, vollflächig |
| Bildrate | konstant (CFR): **Stil B 30 fps**, **Stil A 60 fps** (`STYLE_A_EARTH.md`); r_frame_rate = avg_frame_rate |
| Video | H.264 High, yuv420p, BT.709, CRF ≤ 18 oder ≥ 12 Mbit/s |
| Audio | AAC-LC, 48 kHz, Stereo, ≥ 192 kbit/s |
| Container | MP4, `+faststart` |
| Länge | **mindestens 60 s – gilt für jedes Video, alle Stile, nicht überschreibbar**; Standard 61–80 s *(alle 15 Referenzen 61–81 s; [H] „über 1 Minute“ für Monetarisierung, daher 61 s empfohlen)*. Verlängert wird durch Dramaturgie und visuelle Entwicklung, nie durch Leerlauf. Geprüft von `validate_production.mjs` und `video_qa.py`. |
| Audio-/Videolänge | Differenz ≤ 0,10 s; beide Streams starten bei 0 |

### 10.2 Rendering-Prinzipien (gegen Ruckler und Sprünge)

- **[V] Deterministisches Rendern:** Jedes Bild wird für die exakte Zeit `t = frame / 30` berechnet. **Niemals** Echtzeit-Bildschirmaufnahme oder Abhängigkeit von der Rechengeschwindigkeit. (Echtzeit-Aufnahmen erzeugen Doppel- und ausgelassene Frames – die typische Ursache von Rucklern.)
- **[V]** Eine globale Zeitachse für alle Szenen; Szenenwechsel übergeben exakte Zeiten, keine „Startet, wenn geladen“-Logik.
- **[V]** Bildsequenz verlustfrei/hochwertig zwischenspeichern, dann **ein** Encode-Schritt mit FFmpeg (`-r 30`, CFR).
- **[V]** Keine Bildratenkonvertierung (24→30 erzeugt Pulldown-Ruckeln).
- **[V]** Audio separat mischen (48 kHz) und erst beim finalen Muxen zusammenführen.

### 10.3 Pipeline-Stand

**Entschieden (2026-10-27) und umgesetzt [V]:** 3D-Szene mit Three.js (0.186.1) im headless Chromium (Playwright 1.63, SwiftShader-WebGL, keine GPU nötig), Text/HUD als HTML/CSS-Ebene darüber, ein PNG-Screenshot pro Frame, verlustfreie FFV1-Teilstücke, ein einziger H.264-Encode; Ton separat (FFmpeg-Generatoren, Mischung mit frame-genauen Einsätzen, lineare Normierung + True-Peak-Limiter). Bedienung, Dateien und Tests: `README.md`, Abschnitt „Render-Pipeline“; Einstieg `node pipeline/run.mjs --production productions/<slug>`. Gemessene Renderzeit in der Cloud-Umgebung (4 CPU-Kerne, keine GPU): ≈ 0,4 s pro Frame, also ≈ 13–17 min für 61–80 s Video; Parallelisierung bringt dort keinen Gewinn. Die Szene jeder Produktion (`scene.js`) darf Zustand nur aus `t` ableiten; Uhr, Animationsschleife und ungeseedeter Zufall sind technisch gesperrt.

---

## 11. Qualitätsprüfung

Ablauf im Detail: `VIDEO_PRODUCTION_CHECKLIST.md`. Werkzeug: `tools/video_qa.py --mode render`.

### 11.1 Automatisch (auf der kompletten finalen MP4)

| Prüfung | Kriterium | Status bei Verstoß |
|---|---|---|
| Format | Abschnitt 10.1 exakt | FAIL |
| Zeitstempel | 0 unregelmäßige Frame-Zeitstempel | FAIL |
| Schwarzbilder | keine (Toleranz: bewusste Abblende ≤ 3 Frames, dokumentiert) | FAIL |
| Ruckeln | 0 isolierte Doppelbilder in Bewegung; Doppelbild-Anteil ≤ 2 % | FAIL |
| Blitzbilder/Sprünge | keine Einstellung < 4 Frames | FAIL |
| Sprung-Kandidaten ohne Schnitt | jeder Treffer sichtgeprüft | REVIEW |
| Flacker-Kandidaten | jeder Treffer sichtgeprüft; Blitzregel 6.2 | REVIEW |
| Standbild-Phasen ≥ 0,5 s | nur beabsichtigt | REVIEW |
| Letterbox | keine | FAIL |
| Lautheit/True Peak | 9.4 | FAIL |
| Clipping/NaN | Flat factor 0, keine NaN | FAIL |
| Klick-Kandidaten, Lautheitssprünge | jeder Treffer angehört | REVIEW |
| Ende | letzte 50 ms < −40 dB RMS (Fade-out vorhanden) | FAIL |

### 11.2 Visuell (verpflichtend, zusätzlich)

- **[V]** Alle Kontaktbögen (1 Bild/s, gesamte Laufzeit inkl. Ende) ansehen.
- **[V]** An **jedem** Schnitt/Übergang und jedem REVIEW-Zeitpunkt: Bildfolge mit voller Bildrate (±5 Frames) prüfen.
- **[V]** Jeden Text auf Rechtschreibung, Lesbarkeit (240-px-Kontaktbogen), Sicherheitszone und Anzeigedauer prüfen.
- **[V]** Kontinuität (6.5) und HUD-Stetigkeit prüfen.

### 11.3 Akustisch (verpflichtend, **durch einen Menschen**)

Claude Code kann Audio messen, aber **nicht hören**. Deshalb gilt **[V]**: Vor der Freigabe hört ein Mensch das komplette Video einmal über Kopfhörer und einmal über einen Handylautsprecher und bestätigt: keine Knackser/Rauschen/Verzerrung, Ton synchron zu Ereignissen, sauberes Ende. Ohne diese Bestätigung ist ein Video höchstens „technisch geprüft, Hörprüfung ausstehend“.

### 11.4 Freigabestufen

`ENTWURF` → `TECHNISCH GEPRÜFT` (11.1 PASS + 11.2 erledigt, alle REVIEW-Punkte begründet) → `FREIGEGEBEN` (zusätzlich 11.3 bestätigt). Nur `FREIGEGEBEN` darf veröffentlicht werden.

---

## 12. Häufige Fehler und Gegenmaßnahmen

| Fehler | wahrscheinliche Ursache | Gegenmaßnahme |
|---|---|---|
| Ruckeln / Doppelbilder | Echtzeit-Aufnahme, Framerate-Drops, 24→30-Konvertierung | deterministisches Rendern (10.2), native 30 fps |
| Kurzer Bildsprung | Szenenwechsel mit falscher Startzeit, Kamera springt auf Startposition, Asset lädt verspätet | globale Zeitachse; Assets vor Frame 0 laden; Übergänge framegenau planen |
| Blitzbild (1–3 Frames fremdes Bild) | Überlappende Szenen, Cache-Frame | Szenenwechsel nur an Frame-Grenzen; QA-Regel „Einstellung < 4 Frames“ |
| Flackernde Beleuchtung | Schattenauflösung/Z-Fighting, zufällige Effekte ohne festen Seed | stabile Schatten, Seed fixieren, Flacker-Kandidaten prüfen |
| Inkonsistente Figuren | verschiedene Modelle pro Szene | ein Figuren-Asset pro Rolle, zentral definiert |
| Knackser | Audioclips ohne Fades, Schnitt nicht im Nulldurchgang | 5–10 ms Fades auf jedem Clip |
| Lautheitssprünge | ungemischte Einzelspuren | Bus-Kompression, Lautheitsnormierung zweistufig |
| Verzerrung nach Upload | True Peak > 0 dBTP | True-Peak-Limiter −1 dBTP |
| Abgeschnittenes Ende | Audio länger/kürzer als Video, kein Fade | Länge angleichen, Fade-out ≥ 0,5 s |
| Unlesbarer Text | heller Text auf hellem Grund, zu klein | Scrim, Mindestgrößen (6.3) |
| Text unter Plattform-Buttons | Sicherheitszone ignoriert | Zone 6.3 als Hilfsraster im Entwurf |
| Faktenfehler | ungeprüfte Zahl | Quellenspalte im Protokoll |

---

## 13. Verbindlich vs. situativ – Übersicht

**Verbindlich [V]** (für Stil B; Stil A weicht bei Sprecher, Textebene, Bildrate und Kamera ab – `STYLE_A_EARTH.md`; Mindestlänge 60 s gilt für beide): What-if-Format; Deutsch (18.14, seit 2026-11-07; Englisch über `--lang en`) mit externen Textdateien; Frame 0 mit Szene + Titel + HUD; Titel ≤ 10 Wörter; HUD ändert sich in 2 s; Ereignis bis 10 s; monotone Eskalation mit festgelegter Pointe; Textregeln (Zeilenlänge, Anzeigedauer, Bild vor Text); ein Kamera-Paradigma pro Video; Augenhöhe; nur echte 3D-Kamera; stilisierte 3D-Welt vollflächig; Blitzregel; Typografie-Mindestgrößen, Sicherheitszone, Scrim; Erkennungsmerkmale 6.4; Kontinuität; Zustandsänderung spätestens alle 6 s; Text blendet vor Schnitt aus; Ende ≤ 5 s nach Pointe; kein Sprecher; lizenzierte Musik; Tonakzente framegenau; Clip-Fades; Mischwerte; technische Ausgabe 10.1; deterministisches Rendern; QA 11.1–11.4; keine realen Personen/Logos.

**Situativ [S]:** Schlüsselwort-Farbe, Formulierung der ersten Zeile, globale/persönliche Wechsel, Anzahl HUD-Label-Wechsel, „HERE“-Countdown, benannte Figur, Schnitttakt je Paradigma, Ruhephasen, Abschlussvariante, Kamera-Wackeln, Effektfunktionen, instrumentale Musik, Themenpool und Themenausschlüsse.

---

## 14. Hypothesen (zu testen)

| # | Hypothese | Test |
|---|---|---|
| H1 | Ein sofort laufender HUD-Wert erhöht den Anteil der Zuschauer nach 3 s. | A/B: gleiches Video mit HUD ab Frame 0 vs. ab 4 s |
| H2 | Pointe + kurzes Ende (≤ 5 s) erhöht die Abschlussrate gegenüber 7–8 s Endkarte. | zwei Varianten desselben Videos |
| H3 | Kreisschluss erhöht Wiederholungen. | Wiedergabezeit > 100 % vergleichen |
| H4 | Frage-Endkarte erhöht Kommentare/1.000 Aufrufe gegenüber „Teil 2?“. | über mehrere Videos |
| H5 | Instrumentale Musik verbessert Textverständnis gegenüber Gesang. | Abschlussrate, Kommentare zu Verständnis |
| H6 | Länge knapp über 60 s ist wegen Plattformregeln vorteilhaft. | Plattformregeln aktuell prüfen; Längen 61 s vs. 75 s vergleichen |
| H7 | Eigenständige Erkennungsmerkmale (6.4) erhöhen Follower-Rate. | langfristig, Follower/1.000 Aufrufe |
| H8 | ~~Englisch erreicht bessere Bindungskennzahlen als Deutsch.~~ (entfällt: Umstellung auf Deutsch 2026-11-07) | – |

## 15. Noch nicht ausreichend belegt

- **Erfolg der Referenzen:** Es liegen keine Aufrufe oder Bindungsdaten vor. Kein Merkmal ist als Erfolgsursache belegt.
- **Ton:** Musikstil, Sounddesign-Details und Mischqualität der Referenzen sind nur gemessen, nicht gehört.
- **Optimale Schnittfrequenz:** Die Referenzen streuen von 0,12 bis 4,9 Wechseln/10 s; eine Optimalfrequenz lässt sich nicht ableiten.
- **Deutscher Markt:** Keine einzige deutschsprachige Referenz.
- **Optimale Länge der Endkarte, Wirkung von Farbhervorhebung, Wirkung von „Teil 2?“.**
- **Originalqualität der Referenzen** (nur Re-Encodes analysiert).
- **Plattformspezifische Unterschiede** (TikTok vs. Shorts vs. Reels): Alle Referenzen stammen von TikTok.

## 16. Erfolgsrezepte (Stand 2026-10-29) – **zuerst lesen**

Grundlage: R04, R07, R16–R18 (vom Auftraggeber als erfolgreich benannt: ein Kanal mit ≈ 77.000 Followern nach 2 Wochen bei 3 Videos/Tag – R04, R07, R17, R18 –, ein Kanal mit ≈ 275.000 Followern und zwei Videos > 15 Mio. Aufrufe – R16). Aufruf- und Followerzahlen sind Angaben des Auftraggebers, nicht geprüft **[H]**.

**[B] Alle diese Videos sind mit derselben Technik wie unsere Pipeline gebaut:** Würfel-Figuren, Würfel-Autos, Würfel-Städte, Low-Poly-Bäume, Echtzeit-3D (Kanten, Schatten-Look, Partikel). Keine KI-Bild-/Videogenerierung, keine Fotorealistik. Wir brauchen dafür **keine** zusätzlichen Dienste – nur den Baukasten (`pipeline/runtime/kit/`, Abschnitt 16.3).

Abschnitt 16 beschreibt **Stil B**. Jedes Stil-B-Video folgt **genau einem** der zwei Rezepte: **B1** ist der Standard (Vorbild: 77k-Kanal), **B2** die Alternative (Vorbild: 17-Mio.-Video R16). Themen außerhalb beider Rezepte nur nach Rücksprache. Stil A: `STYLE_A_EARTH.md`.

### 16.1 Rezept B1 – „Eskalations-Zähler“ (Standard; Vorbild 77k-Kanal: R17, R18, R04, R07)

| Baustein | Vorgabe |
|---|---|
| Frage | Alltag, zweite Person: „Was wäre, wenn du …?“ / „Was wäre, wenn alle … außer dir?“ – Alltag ist der **Schauplatz**, nicht der Einstieg: die ersten 15 s zeigen nur Prämissen-Konsequenzen (18.12) |
| HUD | Zähler, der Schritt für Schritt steigt/fällt („PECH HEUTE 1 → 15“, „MENSCHEN AUF DER ERDE 8.199.999.707 → 2“, „GRÖSSE 1,49 m …“; Referenzen englisch) |
| Takt | **Alle 3–4 s ein neues Ereignis**, jedes an einem eigenen kleinen Ort; Wechsel per kurzer Abblende (`dip`, 4 Frames) oder Whip |
| Figuren | Würfel-Menschen **mit Gesicht**; Gefühl ist in jeder Einstellung lesbar (Brauen, Mund); Hauptfigur sieht überall gleich aus |
| Bild | nah, Augenhöhe, langsame Kamerafahrt; viele Requisiten (Bett, Toaster, Bus, Handy-Chat, Schilder) |
| Bogen | Eskalation → Wendung (≈ 50–57 s) → Schlussbild |
| Ende | „Teil 2?“ **oder** direkte Frage an den Zuschauer („Wen würdest du wählen?“) → Kommentare |
| Länge | **61 s** (knapp über 1 Minute); andere Erzählformen siehe 18.13 F |

### 16.2 Rezept B2 – „X verschwindet für 5 Sekunden“ (Alternative; Vorbild 17-Mio.-Video R16, dazu R06, R15)

| Baustein | Vorgabe |
|---|---|
| Frage | „Was wäre, wenn [Grundbaustein der Welt] für 5 Sekunden verschwindet?“ (Sauerstoff, Elektronen, Wasser, Schwerkraft, Reibung, Licht …) |
| HUD | Countdown **mit Millisekunden** bis zum Ereignis, dann „[X] RETURNS IN 0:04.958“ + Unterzeile „TIME SLOWED DOWN 11×“ |
| Ort | **Ein** Ort (z. B. Park in einer Großstadt), Ich-Perspektive mit eigenen Händen |
| Eskalation | vom Kleinen zum Riesigen: Hände → Menschen → Stadt → Erde (Totale aus dem All) |
| Bild | wenige, lange Einstellungen (Median ≈ 12 s); der Look **kippt** beim Ereignis komplett (Drahtgitter, Leuchten, Negativ) |
| Ende | Rückkehr von X → letzte Konsequenz („they explode too“) → kurze dunkle Endkarte mit Titel + einer Faktenzeile |
| Länge | 75–80 s |

### 16.3 Baukasten und Vorschau

- `pipeline/runtime/kit/` – `createKit({ THREE, scene, renderer, rng })` liefert: `human()` mit **`act(spur, t)`** (weiche Übergänge; Posen: stand, walk, run, wave, sit, armsUp, facepalm, phone, phoneTalk, shrug, slump, lie, liePhone, point, carry, cheer, jump, recoil, lookUp, think, kneel, crouch, reach, pant, fall · Gefühle: neutral, happy, laugh, relief, sad, worried, panic, angry, shock, tired, smug – mit Wangen und Schweißtropfen), `props.*` (Bett, Wecker, Küche, Toaster, Handy mit Sperrbildschirm/Chat/Akku/Anruf, Schild, Auto, Bus, Gebäude mit schaltbarem Fensterlicht, Bank, Baum, Laterne, Regenschirm, Karton, Gedankenblase, Powerbank, Steckdose, Ladekabel, Ladesäule, Taube, Blitz …), `places.*` (bedroom, kitchen, street, park, office, cafe, classroom), `fx.*` (Regen, Funkenstoß), `applyLook()` (Lichtstimmung je Beat: day, overcast, sunset, night, interior, dusk, storm, blackout, nightRoom), `shotKeys()` (Kamera-Vorlagen), `beatClock()` (Beats/Ereignisse aus der Zeitachse), `crowd()`, `sunAt()`, `activeSet()`.
- Beispiel aller Teile: `productions/_kit_demo/scene.js`; Version-3.0-Teile (`kit.atmo`, `kit.firstPerson`, `kit.masses`, Bloom/Grading): `productions/_kit_demo_v3/` (Guide 18.13).
- **Vorschau statt Komplett-Render:** `node tools/still.mjs --production productions/<slug> --at 2,6,10` rendert einzelne Bilder in Sekunden. Jede Einstellung erst per Vorschau prüfen, dann das ganze Video rendern.
- Fehlt ein Teil, wird es **im Kit** ergänzt (nicht nur in einer Produktion), damit jedes weitere Video schneller geht.

## 17. Produktionsstile und Auswahl

| Auftrag | Stil | Regeln | Profil (`timeline.json`) | Referenz |
|---|---|---|---|---|
| `PRODUKTIONSSTIL: A (Earth)` – **archiviert**, nur auf ausdrücklichen Auftrag | A | `STYLE_A_EARTH.md` | `"profile": "voiceover"` | `productions/earth-stops-1-second/` (eigene Produktion) |
| `PRODUKTIONSSTIL: B (TikTok-Referenz)` | B, Rezept B1 oder B2 | dieser Guide, Abschnitt 16 | Standardprofil (ohne `profile`) | B1: R04, R07, R17, R18 · B2: R16 (Messberichte in `references/analysis/`) |

- **[V] (ab 2.0)** Jeder Auftrag ohne ausdrückliche Stil-A-Angabe ist **Stil B**, Rezept **B1**, sofern das Thema nicht klar in Rezept B2 fällt (dann B2 und im LOG begründen). Es wird nicht mehr nach dem Stil gefragt. Stil A nur, wenn der Auftrag wörtlich `PRODUKTIONSSTIL: A (Earth)` nennt.
- **[V]** Stile werden nicht gemischt: Stil A übernimmt keine Titelfrage/HUD/Zeilen-Untertitel, Stil B keinen Sprecher und keine Wort-für-Wort-Untertitel. Gemeinsam genutzt werden Pipeline, Baukasten, Ton- und QA-Werkzeuge.
- **[V]** Thema, Länge (≥ 60 s), Format, Sprache, QA und Ausgabe bleiben Teil jedes Auftrags.
- Stil, Rezept und Referenz stehen im Produktionsprotokoll.

## 18. Produktionsstandard Stil B – System V3 (verbindlich; Architektur eingefroren seit 2026-10-30, Version 3.0 seit 2026-11-05)

Grundlage: Sichtung und Messung von R07, R19, R20 (`REFERENCE_ANALYSIS.md`, Abschnitt 9) und die Fehleranalyse der bisherigen
Produktionen (unten 18.9). Alles, was hier steht, ist **[V]** und wird – soweit messbar – von `tools/validate_production.mjs`
(vor dem Rendern) und `tools/video_qa.py` (nach dem Rendern) geprüft.

### 18.1 Arbeitsablauf (fest)

THEMA → HOOK-ENTWURF (18.12) → **STORY-KERN** (18.13 A) → STORY → **BEAT-SHEET** (`beats.json`) → ASSETS (Baukasten) → ANIMATION (`scene.js` mit `act()`) → SOUND-DESIGN (Ereignisse
im Beat-Sheet) → VORSCHAU (`tools/still.mjs`) → RENDERING (`pipeline/run.mjs`) → QUALITÄTSKONTROLLE (technisch + visuell +
dramaturgisch, `templates/quality_review.md`) → MP4-AUSLIEFERUNG (Datei als Anhang senden).

- `productions/<slug>/beats.json` ist die **einzige Zeitquelle**. `node tools/build_timeline.mjs productions/<slug>` erzeugt daraus
  `timeline.json` (Einstellungen, Kamera, HUD, Textzeiten, Ereignisse, Klangeinsätze, Betten). `timeline.json` wird nie von Hand
  bearbeitet; `run.mjs` bricht ab, wenn sie nicht zur `beats.json` passt.
- `scene.js` liest Zeiten nur über `kit.beatClock(timeline)` (`B.ev('id')`, `B.beat('id')`) und Positionen über `beats[].data`.
  Keine Zeitkonstanten in der Szene → Bild, HUD und Ton können nicht auseinanderlaufen.

### 18.2 Takt und Ereignisse

| Regel | Wert | Beleg |
|---|---|---|
| Beat = eine Einstellung an einem Ort mit **mindestens einem sichtbaren Ereignis** | Fehler, wenn ein Beat kein Ereignis hat | R07/R19: jede 4-s-Szene hat eine Aktion |
| Beatlänge | 1,8–6,0 s (1,0–1,8 s nur als Reaktions-Einschub); Median 2,5–4,6 s | R07/R19 4,0 s, R20 Median 1,5 s |
| Länge | ≥ 60 s, B1 Standard 61–64 s, 15–18 Beats; Erzählformen B3/B4 (18.13 F) 61–75 s | 18.13 F |
| Übergänge | Ortswechsel: `dip` (4–6 Frames) oder `whip`; gleicher Ort: harter Schnitt | R19 Abblenden, R20 Whips |
| Helligkeit an Übergängen | Abblende/Whip zwischen sehr hellen und sehr dunklen Szenen (z. B. Tag ≈ 160 → Nacht ≈ 30 mittlere Helligkeit) vermeiden: `video_qa.py` meldet dann „Einstellung < 4 Frames“ (FAIL), obwohl das Bild sauber ist. Lichtstimmung angleichen oder 6-Frame-Abblende; vorab mit `tools/still.mjs` an den Übergangsframes prüfen | Produktion `what-if-no-sleep-30-days`, LOG 5 |
| Ereignis-Typen | Aufprall, Verwandlung, Ankunft/Gehen einer Figur, Gegenstand ändert Zustand, Licht kippt, Reaktion | |

### 18.3 Kamera

- Vorlagen aus `pipeline/runtime/kit/camera.js`: `push`, `pull`, `close`, `orbit`, `low`, `high`, `pov`, `track`, `still`. Jede liefert eine
  Bildgrößen-Klasse (close, medium, wide, low, high, pov).
- **Nie zweimal dieselbe Vorlage + Bildgröße hintereinander** (Fehler). Mindestens **4 Bildgrößen** pro Video (Fehler), keine über 45 % (Warnung).
- Die Kamera bewegt sich in jedem Beat (alle Vorlagen haben eingebaute Bewegung).
- **9:16 hat nur ≈ 28° horizontalen Bildwinkel** (bei fov 48°): Bei `track` muss sich die Figur gleichmäßig mit der Kamera bewegen,
  sonst verlässt sie das Bild (im Testvideo gefunden). Zwei Figuren gemeinsam im Bild: Kamera senkrecht zu ihrer Verbindungslinie, Abstand der Figuren ≤ 1 m. Innenräume: Kamera bleibt auf der offenen Seite (+z) bzw. innerhalb der Wände; **aus Innenräumen kein Whip** (der Schwenk dreht die Kamera in eine Wand → 2-Frame-Flächen, QA-FAIL), stattdessen `dip`.
- Reaktions-Nahaufnahme (`close`) nach jedem großen Ereignis an der Hauptfigur; mindestens eine Totale/Aufsicht (`high`) zur Orientierung.

### 18.4 Figuren und Orte

- Figuren nur aus `kit.human()`; Hauptfigur in allen Beats dasselbe Objekt (Kontinuität). Bewegung nur über `act()` – keine
  harten Posenwechsel. Jede Spur beginnt mit Pose + Gefühl; Reaktionen mit `blend` 0,08–0,15 s, ruhige Wechsel 0,3–0,6 s.
- **Gefühl im Beat-Sheet** (`mood`) für jeden Beat; mindestens **4 verschiedene Gefühle** mit erkennbarer Entwicklung (Fehler).
- Rezept B1: mindestens **5 Orte** (Fehler). Jeder Ort mit eigener Lichtstimmung (`applyLook`); Wechsel innerhalb eines Beats nur als Ereignis.
- Jede Einstellung hat Vorder-, Mittel- und Hintergrund und erzählende Requisiten (Handy-Bildschirm, Schild, leerer Stuhl …).
- Neue Teile werden **im Kit** ergänzt, nicht nur in der Produktion.

### 18.5 HUD (Gestaltung nach R07/R19/R20)

- Label: Montserrat 700, Versalien, gesperrt; Wert: Fraunces 600 mit festen Ziffernbreiten (Serifenziffern wie in den Referenzen);
  Unterzeile: Montserrat 700, Versalien; dünne Fortschrittsskala in der Signalfarbe (Erkennungsmerkmal 6.4). Signalfarbe `#F5C04A`
  (warmes Gold wie alle drei Referenzen), Alarmfarbe `#FF4D4D` (`pipeline/runtime/brand.json`). Diese Werte sind eingefroren.
- Der Wert ändert sich in **mindestens 70 % der Beats** (Fehler darunter): stetig (`mode: linear`) oder in Stufen (`mode: steps`, jeder Schritt
  mit kurzem Größenimpuls). Label wechselt mit jedem Akt (≥ 2 Wechsel).
- Ereignisse mit Bedeutung für den Wert bekommen einen **Akzent**: `loss` (Verlust, Alarmfarbe), `gain` (Gewinn, Signalfarbe), `warn`
  (Pulsieren). Akzent, Wertsprung und Klang liegen auf demselben Frame (Builder).
- Nur Messgrößen, die zum Thema passen; HUD-Zahl und Bildschirm-Anzeigen in der Szene stammen aus demselben Wert (`hudAt`).

### 18.6 Ton

- Musikbett (`audio.music`, Stile pulse/drive/drive_hi/calm/silence) mit Lautheitsdramaturgie: Aufbau, **Ruhe direkt vor der Pointe**, Höhepunkt.
- Atmosphäre je Ort (`ambience`: room, city, rain …), Überblendung 0,25 s.
- **Klang auf jedem Schlüsselereignis** (Auslöser, HUD-Akzent, Pointe) – Pflicht; sonst sparsam (Referenzen: 2–10 Einzel-Effekte).
  Whip bekommt automatisch einen Luftzug mit Spitze auf dem Schnitt; HUD-Stufen optional einen leisen `pop` (`tick`).
- Klänge beginnen auf dem Frame des Ereignisses (Builder) und werden im fertigen Ton nachgemessen (`video_qa.py`: „Synchronität“, ±1 Frame).
- Nicht viermal derselbe Ereignis-Klang hintereinander (Warnung). Bibliothek: `tools/sfx_synth.py` (alle Klänge selbst erzeugt, lizenzfrei).
- Kein Sprecher, keine TTS.

### 18.7 Dramaturgie

- Frame 0: Situation in Bewegung + Titel + laufender HUD; Einstieg nach dem Hook-Standard **18.12** (Beweis-Ereignis ≤ 2 s bzw. Geheimnis/Countdown ab Frame 0; bis 15 s ≥ 3 Prämissen-Konsequenzen, kein Füllstoff).
- Wechsel aus Hoffnung und Rückschlag (Gewinn → Verlust) treibt die Eskalation; HUD-Verlauf und Gefühle zeigen die Richtung.
- Pointe = eigenes Ereignis mit Klang, vorbereitet durch ein früheres Ereignis (Aufbau → Auszahlung); danach ≤ 5 s.
- Ende: Endkarte mit Frage an den Zuschauer und/oder „Teil 2?“ (`endcard`; Englisch „Part 2?“).

### 18.8 Qualitätskontrolle in drei Stufen

1. **Technisch:** `video_qa.py --mode render --plan timeline.json` (Format, Frames, Ton, Synchronität, Monotonie-Kandidaten).
2. **Visuell:** alle Kontaktbögen, `shots.jpg`, alle Bildstreifen; Checkliste B in `templates/quality_review.md`.
3. **Dramaturgisch:** Video in Echtzeit ansehen; Checkliste C.
Ein technisches PASS ist **keine** Freigabe. Status: `TECHNISCH GEPRÜFT` → `QUALITÄT GEPRÜFT` (inkl. Hook-Prüfung H, 18.12) → `FREIGEGEBEN` (mit menschlicher Hörprüfung).
Der Validator prüft beim Hook nur Struktur, Zeitpunkte und die **Selbstauskunft** des Beat-Sheets (`premise`); ob ein Einstieg
überzeugt, entscheidet allein die Sichtprüfung H an echten Bildern.

### 18.9 Warum frühere Überarbeitungen nicht sichtbar wirkten (Befund 2026-10-30)

| Art | Ursache | Behebung |
|---|---|---|
| technisch | Verbesserungen lagen auf **nicht zusammengeführten Zweigen** (Café, Gedankenblase, sitzende Posen, HUD-Akzente, Endkarte); jede Produktion begann wieder beim alten Kit; drei Zweige legten drei verschiedene Signalfarben fest | Teile ins Kit übernommen; Signalfarbe eingefroren; Architektur-Freeze |
| Animation | `pose()` schaltete in einem Frame um → Figuren wirkten steif, Reaktionen fehlten oder sprangen | `act()` mit Überblendungen, Reaktionsposen, Gefühlsübergängen, Blinzeln |
| Szenengenerierung | Kamera, HUD, Text und Klang wurden getrennt von Hand in `timeline.json` und `scene.js` gepflegt (Produktionen mit 1.100–1.300 Zeilen Szenencode) | Beat-Sheet + Builder + Kamera-Vorlagen |
| visuell | eine Lichtstimmung für alle Orte; Kamera-Wiederholungen | `applyLook` je Beat, Validator-Regeln 18.3 |
| HUD | Wert änderte sich nur pro Segment, keine Reaktion auf Ereignisse | Stufen, Akzente, Impulse; Regel ≥ 70 % der Beats |
| Sounddesign | Klangzeiten von Hand, unabhängig von der Szene; keine Kontrolle im fertigen Ton | Ereignis-gekoppelte Klänge, Synchronitätsmessung |
| Qualitätskontrolle | `video_qa.py` prüfte nur Technik; „technisch geprüft“ wurde als Qualität gelesen | dreistufige Freigabe, Monotonie-Kandidaten, Standard-B-Regeln vor dem Rendern |

### 18.11 Referenzhierarchie (neu gefasst 2026-11-07; vorher: Akku-Testvideo als Mindestniveau)

**Entscheidung des Auftraggebers 2026-11-07:** Das Testvideo `productions/what-if-phone-battery-life/` ist **veraltet**. Es ist
**kein** visueller oder erzählerischer Qualitätsmaßstab und **kein** Vorbild für neue Produktionen mehr. Kreativer Maßstab sind die
vier analysierten Referenzvideos unten. Alle künftigen Produktionen richten sich daran aus.

**Stufe 1 – Kreative Referenzen (Maßstab für Bild, Erzählung, Hook, Licht, Ton).** Analyse: `VIDEO_ANALYSIS_6_VIDEOS.md`
(Einzelanalysen Abschnitt 4–7), `VIDEO_COMPARISON_6_VIDEOS.md`, `VERSION_3_0_*.md`; daraus abgeleitet: 18.13.
Die Videos liegen nur lokal beim Auftraggeber (Upload), nicht im Repository; die Dateinamen sind die der Analyse. Sind sie
verfügbar, werden sie unverändert nach `references/videos/` gelegt (nicht versioniert, `.gitignore`).

| Rang | ID (Analyse) | Datei | Titel im Bild | Maßstab vor allem für |
|---|---|---|---|---|
| 1 | **C1** viral (Millionen-Kanal) | `Viral_referenz_1.mp4.MP4` | What if you had to spend $1 trillion? (70,0 s) | Ich-Perspektive mit eigenen Händen ab Frame 0; Einsatz als HUD (Budget + Zeit); Ritual mit steigender Größenordnung; Schauwerte (Masse, Weite, Glanz); gerichtetes Licht/Gegenlicht; Musikabschnitte auf Story-Beats, leiser Einstieg |
| 1 | **C2** viral (Millionen-Kanal) | `Viral_referenz_2.mp4.MP4` | What if you fell into a coma? (75,2 s) | Hook mit starker Bewegung und Ich-Perspektive (0–3 s); persönliche Überlebensgeschichte mit Zeitsprung-HUD; Hoffnung/Rückschlag; Wissensanker; echte Stille und Schwarzbild als Erzählmittel; hohe Dynamik |
| 1 | **B1** neuer Stil (80k-Kanal, ≈ 1 Mio. Aufrufe) | `Referenz__neuer_stil_1m_views.MP4` | What if it rained forever? (61,0 s) | eine Messgröße über Größenordnungen; Stimmung über Dunst/Regen/Wasser; Farbhierarchie (eine Akzentfarbe in grauer Welt); einfache, sofort klare Frage |
| 2 | **B2** alter Stil (80k-Kanal, = R07) | `Referenz_alter_stil.MP4` | What if you got 2× smaller every 2 seconds? (61,0 s) | Ergänzung: monotone Messgröße/Maßstabsreise, HUD-Gestaltung (18.5). **Kein** Vorbild für Licht und Ton |

Gewichtung: Wo die Referenzen verschiedene Wege gehen, haben **C1, C2 und B1** Vorrang vor B2. Ton: C1/C2 sind Vorbild, B1/B2 nicht
(flache Fremdsongs ohne Ereignisklänge, Vergleich Abschnitt 4). Story-Form je Thema wählen (18.13 F), nicht vereinheitlichen.
Die Referenzen sind englisch; Sprache nach 18.14. Gemessene Referenzwerte stehen in `VIDEO_COMPARISON_6_VIDEOS.md` Abschnitt 2.

**Stufe 2 – Messbare Regeln:** Abschnitt 18 (inkl. 18.12 Hook, 18.13 Version 3.0, 18.14 Sprache), Prüfung durch
`validate_production.mjs`, `video_qa.py`, `balance_qa.py` und `quality_review.md` (C: Vergleich mit C1/C2/B1/B2).

**Stufe 3 – Technische Mindestwerte `[18.11]`:** Die Zahlen unten wurden am Akku-Testvideo gemessen. Sie bleiben als **Untergrenze**
für Handwerk (Ereignisdichte, Kamera, Figuren, Orte, HUD, Ton) im Validator: eine Unterschreitung ist eine Warnung und wird im LOG
begründet. Sie sind **kein Ziel**: Erreicht ein Video sie, ist es damit nicht gut. Ob es gut ist, entscheidet der Vergleich mit Stufe 1.

| Merkmal | Mindestwert (gemessen am Akku-Testvideo 2026-10-30) | Prüfung |
|---|---|---|
| Ereignisdichte | 26 Ereignisse / 17 Beats = 1,5 pro Beat | Warnung < 1,5 |
| Kamerawechsel | 7 Vorlagen, 6 Bildgrößen, nie zweimal gleich hintereinander | Fehler bei Wiederholung / < 4 Bildgrößen; Warnung < 6 |
| Figurenreaktionen | 8 Gefühle mit Entwicklung, Reaktionsposen (recoil, jump, kneel, reach …), Blinzeln, Schweiß/Wangen | Fehler < 4, Warnung < 6 |
| Orte/Licht | 7 Orte, je eigene Lichtstimmung, Lichtwechsel als Ereignis | Fehler < 5 (B1), Warnung < 6 |
| HUD-Dynamik | Wert ändert sich in 100 % der Beats, 11 Akzente, 4 Labels | Fehler < 70 %, Warnungen < 100 % / < 0,5 Akzente pro Beat / < 4 Labels |
| Sound-Synchronisation | alle Ereignisse mit Klang; gemessen −15 … +10 ms | Fehler bei Versatz im Plan; Warnung < 90 % mit Klang; Messung in `video_qa.py` |
| Dramaturgie | Hoffnung/Rückschlag, früh vorbereitete Pointe, Endkarte mit Frage + „Teil 2?“, 3,6 s nach der Pointe | Pointe/Ende Fehler, Endkarte Warnung; Rest in `quality_review.md` C |
| Bildqualität | Würfel-Figuren mit Gesicht, Requisiten mit Erzählfunktion, keine Schwarzbilder/Kurz-Einstellungen, keine Monotonie-Kandidaten | `video_qa.py` + `quality_review.md` B |

**Stufe 4 – Akku-Produktion nur noch als technischer Regressionstest:** `productions/what-if-phone-battery-life/` bleibt unverändert
im Repository. Sie dient nur noch Tests (`tests/test_build_timeline.mjs`: Hook-Gegenbeispiel 18.12; Nachweis bit-identischer
Bilder nach Renderer-Änderungen; englische Pipeline über `--lang en`). Nicht als Muster für Beat-Sheet, Szene, Einstieg, Licht oder
Erzählung nachschlagen. Format-Vorlagen sind `templates/` und `productions/_kit_demo_v3/`. Ihre Schwächen sind Warnhinweise:
Einstieg ohne Prämisse (≈ 50 % Abgang bis 14 s, `REFERENCE_ANALYSIS.md` 10), zu dunkle Nachtszenen, Anschlussfehler über einen
Schnitt, Text während eines Blitzes, leere, flach beleuchtete Welten.

### 18.10 Architektur-Freeze

Ab 2026-10-30 werden Pipeline, Kit-Schnittstellen, Beat-Sheet-Format, HUD-Gestaltung, Signalfarbe und Prüfregeln **nicht mehr
umgebaut**. Zulässig sind nur: (a) Korrektur eines konkreten Fehlers, (b) Behebung eines nachgewiesenen Qualitätsproblems (mit
Beleg im LOG), (c) **neue Kit-Teile** (Orte, Requisiten, Posen, Klänge), die ein Thema braucht – ohne bestehende Schnittstellen zu
ändern. Jede solche Änderung kommt ins Änderungsprotokoll. Neue Videos analysieren nicht erneut das Repository.
Version 2.2 (Hook-Standard 18.12) ist eine solche belegte Qualitätsbehebung: additive Beat-Sheet-Felder (`hook`, `events[].premise`)
und neue Prüfregeln `[18.12]`; Pipeline, Renderer, Kit und bestehende Felder bleiben unverändert.

Änderungen an diesem Style-Guide nur auf Basis dokumentierter Ergebnisse (Produktionsprotokolle, Analytics). Jede Änderung mit Datum und Begründung unten eintragen.

### 18.12 Hook-Standard (0–15 s) – verbindlich ab 2.2

Grundlage: Analytics des Akku-Videos (≈ 50 % Abgang bis 14 s) und Hook-Analyse `REFERENCE_ANALYSIS.md` Abschnitt 10. Dieser
Abschnitt hat für die ersten 15 s **Vorrang vor 2, 3.1 und 16.1**. Er legt fest, *was* der Einstieg leisten muss, nicht *wie* er
aussieht – Bild, Ort und Ablauf entstehen aus dem Thema.

**Kernregel – Prämisse vorführen, nicht erklären.** Das erste Schlüsselereignis (`hook.proof`) besteht den
**Unmöglichkeitstest**: *Würde dieses Bild ohne die Prämisse genauso aussehen?* Wenn ja, ist es kein Hook. Ein HUD-Abzug, ein
Wecker oder ein Mensch, der aufs Handy schaut, bestehen ihn nicht; ein Auto, das von der Figur abprallt (R19), eine Figur, die
sichtbar schrumpft (R07), eine Uhr mit Fragezeichen (R20), bestehen ihn.

| # | Regel | Prüfung |
|---|---|---|
| H1 | **Frame 0 ist nicht normal:** Bild *oder* HUD zeigt bereits eine Anomalie (laufender Prozess, Bedrohung im Anflug, unmöglicher Messwert, Geheimnis). Kein Aufwachen, kein Ankommen, keine Vorstellung der Figur als Einstieg. | QA H1 |
| H2 | **Hook-Typ** wird je Thema gewählt und begründet (keine Schablone): `proof` – Regel am Extremfall vorgeführt (R19) · `process` – Verwandlung läuft ab Frame 0 sichtbar (R07) · `countdown` – Uhr läuft auf das Ereignis zu (R06, R15) · `mystery` – unbekannter Wert/angekündigtes Ereignis (R20). | Validator (Feld) + LOG |
| H3 | **Beweis-Ereignis** `hook.proof`: sichtbare Prämissen-Konsequenz (`premise: "visible"`) mit Klang; bei `proof`/`process` **≤ 2,0 s**, bei `countdown`/`mystery` ≤ 10 s (das Geheimnis/der Countdown steht dann ab Frame 0 im HUD). | Validator (Fehler) |
| H4 | **Einsatz** (`hook.stakes`) ist bis 3 s ohne Untertitel erkennbar: Was steht auf dem Spiel, wohin zeigt der HUD? Die Figur reagiert körperlich (Gesicht + Pose) auf das Beweis-Ereignis. | QA H2, H3 |
| H5 | **Offene Frage** (`hook.question`): die konkrete Frage, die sich der Zuschauer bei 3 s stellt („Was kann mich noch töten?“). Sie bleibt bis zur Pointe offen und wird bis 15 s größer, nicht beantwortet. | QA H4 |
| H6 | **Eskalation 3–15 s:** mindestens **3 Prämissen-Ereignisse** bis 15 s, davon **≥ 2 im Bild sichtbar** (`premise: "visible"`, nicht nur HUD); jedes größer, näher oder persönlicher als das vorige; Abstand zwischen zwei Prämissen-Ereignissen ≤ 5 s. | Validator (Fehler/Warnung) + QA H5 |
| H7 | **Kein Füllstoff:** Ereignisse ohne Prämissenbezug (Toast verbrennt, Bus fährt ab) sind bis 15 s höchstens Kulisse; ≤ 1/3 der Ereignisse im Hook-Fenster. Jeder Beat bis 15 s enthält ein Prämissen-Ereignis. | Validator (Warnung) |
| H8 | **Nichts vorwegnehmen** (`hook.withheld`): Pointe, Endzustand und letztes HUD-Label erscheinen nicht vor 15 s. Der Einstieg zeigt die Richtung, nicht das Ziel. | Validator (Pointe/Label) + QA H6 |
| H9 | **Text folgt dem Bild:** die erste Zeile erklärt nicht, was der Hook zeigt, sondern verschärft die Frage oder den Einsatz. Die Zeile kommt nach dem Titel (3,5–5,0 s, wie Abschnitt 2); „verortende“ Zeilen („It's 3 AM.“) nur, wenn das Bild bereits eine Anomalie zeigt. | QA H4 |
| H10 | **Hook-Entwurf vor dem Beat-Sheet:** drei Einstiege **verschiedener Hook-Typen oder Bildideen** skizzieren (je: Frame 0, Beweis-Ereignis, Frage, was zurückgehalten wird), gegen H1–H9 bewerten, besten wählen; Entwurf + Wahl im LOG. Hook-Typ und Eröffnungsbild der letzten drei Produktionen nennen; Wiederholung begründen. | LOG + QA H7 |

**Bewusst nicht geregelt:** Schnittfrequenz, Bewegungsmenge, Lautstärke des Einstiegs. R20 ist in 0–12 s so ruhig wie unser
Akku-Video (gemessen) und trägt den Einstieg trotzdem über ein Geheimnis; mehr Schnitte ersetzen keine Prämissen-Konsequenz.
Hektik ohne Prämissenbezug ist Füllstoff im Sinne von H7.

**Beat-Sheet (additiv, keine Formatänderung bestehender Felder):**

```json
"hook": {
  "type": "proof",
  "proof": "car_bounce",
  "question": "What could still kill you?",
  "stakes": "Nothing hurts you – so what is left to lose?",
  "withheld": "The ending: being the last living thing."
},
"events": [{ "id": "car_bounce", "at": 1.2, "what": "Auto prallt von der Figur ab", "premise": "visible", "sfx": "crash", "trigger": true }]
```

`premise`: `"visible"` = Konsequenz der Prämisse **im Bild** (Figur/Welt verändert sich so, wie es nur in dieser Welt möglich ist) ·
`"hud"` = Konsequenz nur als Messwert · ohne Feld = Alltags-/Kulissenereignis. Die Angabe ist eine Behauptung des Autors; QA H3
prüft jede `visible`-Angabe im Hook-Fenster am Vorschaubild.

**Beispiel (nicht umgesetzt, nur zur Veranschaulichung):** Akku-Video, Typ `proof`. Frame 0: Das kleine Geschwister schnappt sich
das Handy und startet ein Spiel; ab 0,4 s fällt der HUD rasant (100 → 86 %, Akzent `loss`), die Figur greift sich an die Brust und
sackt zusammen (`recoil` → `slump`, `panic`) – *jeder Fingertipp des Kindes kostet dich Leben*. Frage: „Will you survive the day?“
Eskalation bis 15 s: Helligkeit auf Maximum = Atemnot; ein Kollege „leiht“ sich das Ladekabel; der Chef ruft per Video an. Zurückgehalten:
Stromausfall der Stadt und der Pointe zu Hause. Toast und Bus entfallen.

### 18.13 Version 3.0 – Weiterentwicklung aus der Analyse von 6 Videos (verbindlich ab 3.0)

Grundlage: `VIDEO_ANALYSIS_6_VIDEOS.md`, `VIDEO_COMPARISON_6_VIDEOS.md`, `VERSION_3_0_GAP_ANALYSIS.md`,
`VERSION_3_0_IMPROVEMENT_PLAN.md`, `VERSION_3_0_CONSOLIDATED_REVIEW.md` (2 eigene Videos, 2 Videos des 80k-Kanals, 2 Videos eines
Millionen-Kanals). **Die Regeln sind Produktionsregeln aus wiederkehrenden Unterschieden [M]/[B] – keine belegten Ursachen für
Reichweite** (keine Abbruchkurven, sehr unterschiedliche Kanalgrößen). Wirkung je Video an der Abbruchkurve prüfen. 18.12 bleibt für
0–15 s in Kraft; 18.13 ergänzt, ersetzt nichts.

**A. Story-Kern (vor dem Beat-Sheet, nach dem Hook-Entwurf).** Beleg: B1/B2/C1/C2 halten **eine** Prämisse und **eine** Messgröße bis zum
Schluss; A1 reihte Gags ohne Folgen, A2 wechselte bei 7,5 s die Prämisse.
| # | Regel | Prüfung |
|---|---|---|
| S1 | **Ein Einsatz, eine Messgröße:** `story.stake` (was steht auf dem Spiel), `story.measure` (was das HUD misst). Jeder Beat verändert diesen Wert und trägt zur Titelfrage bei; Label-Wechsel nur als Phase derselben Größe. Ereigniszähler („wie oft passiert X“) nur, wenn jede Zählung den Einsatz erhöht. | Validator `[18.13]` (Feld) + QA C |
| S2 | **Spannungsbogen:** Aufbau → Wende (`story.turn`, Ereignis vor der Pointe) → Höhepunkt → Auflösung; Hoffnung/Rückschlag (18.7) konkret im Beat-Sheet. | Validator + QA C |
| S3 | **Ursachen sichtbar:** Jedes Ereignis, auf das sich Wende/Pointe beziehen, trägt `setup_for: "<Ereignis-ID>"` und `premise: "visible"`, liegt ≥ 3 s vor der Pointe und ist **ohne Untertitel** verständlich (wer tut was, was ist die Gefahr). | Validator (Struktur) + QA C10 (Vorschaubild ohne Text) |
| S4 | **Wissensanker je Akt:** Akte im Beat-Sheet markieren (`beats[].act`); je Akt mindestens eine reale, geprüfte Zahl/Tatsache (`beats[].fact { text, source }`), Quelle im LOG. | Validator |
| S5 | **Text:** Titel ≤ 7 Wörter / 2 Zeilen (Deutsch ≤ 8 inkl. „Was wäre, wenn“, 18.14); Zeilen bevorzugt 2. Person Präsens; Gags müssen im Bild lesbar sein, nicht nur in der Zeile. | Validator (Titel) + QA C |

**B. Perspektive.** Beleg: C1/C2 zeigen Hook und Schlüsselmomente aus Ich-Sicht mit eigenen Händen; A1/A2 nie.
- `kit.firstPerson({ camera, scene })` – Hände/Arme an der Kamera, Gesten `rest, hold, show, reach, push, grip, table, lie, flail, point`
  mit `act()` (weiche Übergänge), `hold(obj)`. Kamera-Vorlage `pov` dazu. Beat-Feld `pov: true` (Dokumentation).
- Einsatz: **Hook-Entwurf prüft immer eine Ich-Variante** (18.12 H10); im Video für Hook und 2–4 Schlüsselmomente, **nicht** durchgehend –
  Gefühle dann über Bezugsfiguren, Hände und Ton (Experiment fold-paper: Figur in 10/19 Beats → Gefühlsebene schwächer).

**C. Schauwert und Dichte.** Beleg: C zeigt in fast jedem Beat Masse/Weite/Glanz; Bildveränderung 3–15 s A 2,5–3,1 vs. C 7,3–8,0 [M].
- **Je Akt mindestens ein Schauwert-Bild** (`beats[].showpiece`: `mass` | `vista` | `glow`), möglichst als Höhepunkt des Akts. Validator `[18.13]`.
- Kit: `kit.masses.crowd({ count })` (Hunderte–Tausende Figuren, instanziert, `anim: idle|bob|cheer|wave`), `stands()` (Tribüne mit
  Publikum), `carField()`, `skyline()` (Kulisse, nachts leuchtende Fenster). Nah vor der Kamera weiterhin `kit.human()`.
- Bewegung **innerhalb** der Einstellung statt mehr Schnitte: Vordergrund-Parallaxe, Menge in Bewegung, Teilchen (`atmo.dust`, `atmo.confetti`).

**D. Licht, Farbe, Atmosphäre.** Beleg [M]: Unsere Bilder waren **gesättigter** als die Referenzen (stark gesättigte Pixel 34–38 % vs.
12–14 %), mit großer bunter Akzentfläche (7–10 % vs. 0,5–1,4 %) und schwacher Farbhierarchie; [B] den Referenzen fehlt nicht Farbe, sondern
uns fehlen Lichtquellen, Oberflächenstruktur, Dunst und Glanz. **Sättigung nicht erhöhen.**
| # | Regel |
|---|---|
| L1 | **Farbhierarchie je Akt:** eine dominante Lichtfarbe/-temperatur, gedämpfte Kulisse (`atmo.palette('coolCity' …)`), **ein** Akzent (Hauptfigur oder Schlüsselobjekt). Keine zusätzlichen bunten Flächen. |
| L2 | **Motiviertes Licht:** In jeder Nacht- und Innenszene sind Lichtquellen im Bild und werfen Licht (`atmo.lampPool`, `stringLights`, `neonStrip`, `spotCone`, `glowSign`, beleuchtete Fenster). Lichtstärken in Candela (20–100 für Lampen). |
| L3 | **Tiefe:** Außen mit Dunst (`haze`, `goldenHour`, `backlight`), Kulisse (`skyline`), Gegenlicht über `atmo.sunBehind()`; Innen mit Lichtabfall statt gleichmäßiger Helligkeit. |
| L4 | **Oberflächen:** Böden/Flächen in Schauplätzen mit Struktur (`atmo.ground('cobble' | 'brick' | 'planks' | 'tiles' | 'asphalt' | 'concrete' | 'grass')`), Wasser mit Glanz/Spiegelung (`atmo.water({ mirror: true })` nach `await kit.atmo.loadReflector()`; ≈ doppelte Renderzeit für diese Bilder). |
| L5 | **Grading/Leuchten je Akt** über `fx` der Szene oder `post` im Beat-Sheet: `bloom` (0,3–1,0, `bloomThreshold` 0,7–0,9) für Neon/Lampen/Spitzlichter, `grade { saturation 0,85–1,0, contrast 1,0–1,1, tint [r,g,b], lift }`. Farbwechsel zwischen Akten über Licht und Grading, nicht über bunte Requisiten. |
| L6 | Neue Stimmungen: `haze`, `backlight`, `goldenHour`, `neonNight`, `clinical`, `underwater` (bestehende unverändert). |
| L7 | **Bewegungsunschärfe existiert bereits:** Whips erhalten Richtungsunschärfe automatisch; für schnelle Bewegungen (Sturz, Fahrt, Kranfahrt) `motion_blur: [{ from, to, samples: 6–8, shutter: 0.5 }]` im Beat-Sheet (Renderzeit × samples in diesem Bereich). |
| L8 | Messung: `python3 tools/balance_qa.py render/final.mp4 --out qa/balance.json` (informativ: Sättigung, Akzentfläche, dominanter Farbton; Ton-Bänder, Stille, Dynamik). |

**E. Ton.** Beleg [M]: A 64–77 % der Energie < 100 Hz, 0,9–7 % bei 2–8 kHz, 0 % Stille, Dynamik 21–23 dB; C1/C2 11–27 % / 5–17 %, bis 6 %
Stille, 30–48 dB; C wechselt Musikabschnitte exakt auf Story-Beats. **Musikstile werden erst nach der Hörprüfung des Auftraggebers
(A1 vs. C1 am Handy) geändert.** Bis dahin:
- Musikabschnitte an Wende, Höhepunkt und Pointe binden; **Ruhe (`silence`/`calm`) im Bereich 3 s vor bis 0,5 s nach der Pointe** (Validator `[18.13]`).
- Leiser Einstieg ist erlaubt (C1 0–10 s leise) – der Hook trägt über Bild und Einsatz, nicht über Lautstärke.
- `balance_qa.py` zeigt Bassüberhang/fehlende Präsenz; Ergebnis in die Hörprüfung mitgeben.

**F. Erzählformen (zusätzlich zu B1/B2, Wahl im LOG begründen).** Messgröße, HUD-Modi und Prüfregeln bleiben gleich.
| Form | Vorbild | Motor | HUD | Länge |
|---|---|---|---|---|
| B3 Ritual + doppelte Uhr | C1 | dieselbe Handlung je Beat in steigender Größenordnung; Budget- und Zeitzähler; Umdeutung am Ende | `steps`/`geo` + Zeit-Label | 61–75 s |
| B4 Überlebensbogen mit Zeitsprüngen | C2 | eine Person, Zeitsprung-HUD (DAY → WEEK), Hoffnung/Rückschlag, Bezugsfigur, Fakten, emotionale Auflösung | `steps` | 65–75 s |
| B5 Maßstabs-Entdeckungsreise | B2, B1 | eine Größe über viele Größenordnungen, je Stufe eine neue Welt | `geo` + `crane` | 61–64 s |
| B6 Ausbreitung + Wende | A2 (verbessert) | Zahl steigt bis zum Planeten, dann kippt sie; Rückkehr zur Person | `geo` | 61–64 s |
Rezept-Feld `recipe` bleibt `B1`/`B2` für die Prüfregeln; die Form steht im LOG und in `story`.

**G. Bewusst nicht geändert:** Schnittfrequenz (A = C [M]), Lautheitsziel −14 LUFS, Figurenmodell, HUD-Gestaltung und Signalfarbe,
Kameraarchitektur, Beat-Sheet-Grundformat, Determinismus, bestehende Prüfregeln, bestehende Kit-Teile/Stimmungen/Musikstile
(alte Produktionen rendern bit-identisch – geprüft an 8 Standbildern von `what-if-phone-battery-life` und `what-if-fold-paper-42-times`).
Keine Themen, Figuren, HUD-Optik oder Gesangs-Songs der Referenzen übernehmen.

**Freeze-Vermerk (18.10):** Additiv sind neue Kit-Module (`atmosphere.js`, `pov.js`, `masses.js`), Beat-Sheet-Felder (`story`,
`beats[].act/fact/showpiece/pov`, `events[].setup_for`), Warnregeln `[18.13]` und `tools/balance_qa.py`. **Ausnahme mit Begründung:**
`pipeline/runtime/stage.js` erhielt zwei optionale Post-Effekte (`bloom`, `grade`), Standard = aus; nachgewiesen bit-identische Bilder
bestehender Produktionen. Begründung: Licht/Glanz ist der in der Analyse am deutlichsten sichtbare Abstand (Abschnitt D des Reviews).

### 18.14 Sprache Deutsch (verbindlich seit 2026-11-07)

Auftrag des Nutzers: Der Kanal wird von Englisch auf Deutsch umgestellt. **Nur die Sprache ändert sich** – Rezept B1/B2, Hook
(18.12), Story-Kern (18.13), Kamera, Licht, Ton, Musik, Render und die Referenzhierarchie (18.11) bleiben unverändert. Ein Video
darf durch den Sprachwechsel weder einfacher noch schlechter werden.

**Technik (keine Architekturänderung):** Standardsprache `de` zentral in `pipeline/runtime/lang.js` (`DEFAULT_LANG`); alle
Bildschirmtexte in `productions/<slug>/text.de.json` mit `"lang": "de"`, `"number_locale": "de-DE"` (Vorlage
`templates/text.de.json`). Ältere Produktionen haben nur `text.en.json` und werden mit `--lang en` geprüft/gerendert
(`run.mjs`, `render_frames.mjs`, `still.mjs`, `validate_production.mjs`); fehlt die Textdatei der gewählten Sprache, bricht das
Werkzeug mit Hinweis ab.

| # | Regel | Prüfung |
|---|---|---|
| D1 | **Titelformel „Was wäre, wenn …?“** (nicht „Was, wenn …?“, nicht „Stell dir vor …“); ≤ 10 Wörter, Empfehlung S5 ≤ 8 Wörter (die Formel hat ein Wort mehr als „What if“). | Validator `[2]`, `[18.13]` |
| D2 | **Natürliches, modernes Deutsch** – so, wie man es einem Freund erzählt. Nie wörtlich aus dem Englischen übersetzen; Satzbau, Redewendung und Pointe auf Deutsch neu denken („Someone was faster.“ → „Zu spät.“ / „Jemand war schneller.“ nach Klang, nicht nach Wörterbuch). | QA C13 + Sprachabnahme |
| D3 | **Du-Form**, klein geschrieben („du“, „dein“); zweite Person Präsens wie bisher (S5). Kein „Sie“, kein „man“-Stil. | QA C13 |
| D4 | **Kurze Hauptsätze**, ein Gedanke je Zeile (3–10 Wörter wie Abschnitt 4). Deutsche Wörter sind länger: Zeile höchstens 2 Bildschirmzeilen – bei langen Komposita kürzer formulieren oder umstellen („Energiesparmodus“ → „Sparmodus“), nie trennen. | Standbild (`tools/still.mjs`) + QA B |
| D5 | **Alltagswörter vor Fachwörtern**, etablierte Anglizismen nur, wenn sie im Deutschen üblich sind („Akku“, „Handy“, „WLAN“, „Powerbank“, „Videocall“ ja; „Battery“, „Outlet“ nein). | QA C13 |
| D6 | **Zahlen deutsch:** Tausenderpunkt, Dezimalkomma (1.000 · 3,5) – im HUD automatisch über `number_locale: "de-DE"`; in Texten von Hand. **SI-Einheiten** (km, km/h, m, °C, kg); Leerzeichen vor Einheit („42 km“, „37 %“). | Validator `[18.14]` (Zahlenformat) |
| D7 | **Typografie:** deutsche Anführungszeichen „ … “ und Gedankenstrich „–“. **HUD-Labels in Versalien mit „SS“ statt „ß“** („STRASSE“, „GRÖSSE“) – das versale ẞ fehlt in den Hausschriften und fiele auf eine Systemschrift zurück. Umlaute ä ö ü Ä Ö Ü und ß sind enthalten (Test `tests/test_overlay.mjs`). | Validator `[18.14]` (Schriftzeichen, Fehler) |
| D8 | **HUD-Labels** kurz und eindeutig (1–3 Wörter: „DEIN LEBEN“, „KRITISCH“, „LÄDT“); Unterzeile als Ergänzung („= HANDYAKKU“). Label-Wechsel bleiben Phasen derselben Messgröße (18.13 S2). | QA B/C |
| D9 | **Hook-Entwurf auf Deutsch** (18.12 H10): alle drei Ansätze werden auf Deutsch formuliert, einer davon als **Ich-Variante** („Ich …“ im Bild aus eigener Sicht, Text in Du- oder Ich-Form – im LOG begründen). | LOG + QA H |
| D10 | **Endkarte:** Frage an den Zuschauer auf Deutsch („Wie lange würdest du durchhalten?“) und/oder „Teil 2?“. | Validator (Wortzahl) + QA C |
| D11 | **Bildtexte im Szenencode** (Handy-Sperrbildschirm, Chat, Schilder, Leuchtschriften, Zettel – z. B. `kit.props` `time/date/name/messages`, `kit.atmo.glowSign({ text })`): in deutschen Produktionen immer **ausdrücklich auf Deutsch** setzen (Vorgaben des Kits sind englisch, z. B. `'Monday'`, `'OPEN'`, und bleiben wegen alter Szenen unverändert). Bewusst englisch gelassene Schilder im LOG vermerken. | QA B + Checkliste |
| D12 | **Sprachabnahme:** Claude prüft Natürlichkeit und Rechtschreibung (QA C13); der Nutzer liest die Texte vor dem Rendern muttersprachlich gegen – wie die Hörprüfung wird sie angefragt, nicht vorausgesetzt. | `quality_review.md` C13 + D |

**Referenzen (18.11):** Die kreativen Referenzen C1, C2, B1, B2 sind englisch. Sie sind Maßstab für Bild, Takt, Ton und
Dramaturgie; für die Sprache gilt 18.14. Bestehende englische Produktionen werden nicht übersetzt oder verändert.

**Freeze-Vermerk (18.10):** Additiv: `pipeline/runtime/lang.js`, sprachspezifische Prüfregeln `[18.14]` (nur für `de`), Titelformel
je Sprache, Standard-`--lang` = `de`. Pipeline, Renderer, Kit, Beat-Sheet-Format, HUD-Gestaltung und Signalfarbe unverändert;
englische Validierung aller Produktionen vor/nach der Änderung byte-identisch geprüft.

### 18.15 Bildsprache V4 – Qualitäts-Upgrade (Erprobung seit 2026-11-09, opt-in)

**Befund (Code geprüft):** Die Bildqualität begrenzte nicht Three.js, sondern unser Einsatz: Einheitsfarben mit `flatShading`,
kein Tiefenbild (deshalb weder Umriss-Linien noch echte Tiefenunschärfe), einfarbiger Himmel, graue/braune Schatten (Himmelslicht
weiß bzw. pfirsich), keine farbig angehobenen Schwarzwerte. Die Referenz (Mr omi, three.js, Code `mromidev/claude-animated-shorts`,
MIT) erreichte ihren Sprung mit Licht und Nachbearbeitung – nicht mit Blender oder KI-Video.

**Einschalten:** `beats.json` → `"post": { "v4": true }` (oder Optionen-Objekt). Szenen bleiben unverändert; ohne den Schalter
läuft der alte Weg bit-identisch (geprüft an `what-if-koma`, 300 Frames).

| # | Teil | Wirkung | Wo |
|---|---|---|---|
| V1 | Tiefenbild + **Umriss-Linien** (Laplace auf 1/z, vor jeder Unschärfe, ~2 px, fast schwarz, in der Ferne ausgeblendet) | gezeichnete Formen, Ebenen trennen sich | `stage.js` (fx.ink) |
| V2 | **Stimmungen umgerechnet**: Schattenseiten blau-violett, Himmelslicht −20 %, Sonne wärmer/+15 % | Licht/Schatten-Kontrast mit Farbtemperatur | `kit/look4.js` `upgradeLook` |
| V3 | **Himmelskuppel mit Verlauf**, Nebel in Horizontfarbe | Luftperspektive, Tiefe | `look4.skyDome` |
| V4 | **Grade**: Schattentönung, farbig angehobene Schwarzwerte (`liftRGB`), Kontrast 1,07, **ACES bleibt** | kein totes Schwarz; Sättigung gemessen unverändert | `stage.js` (grade.shadows/highlights/liftRGB) |
| V5 | **Tiefenunschärfe** automatisch auf das Kamera-Blickziel, nur Hintergrund, scharfe Zone ±15 % um den Fokus, in Ich-Perspektive (`pov`) aus (Vordergrund trägt Information: Handy, Zahl, Schild) | Blick geht zur Figur | `stage.js` (fx.dof) |
| V6 | **Texturen** mit dunklen Fugen, Maserung, Kantenschatten (512 px); „gemalte“ Farbwolken auf allen Einheitsflächen + Bodenschatten | keine Plastikflächen | `atmo.surfaceTexture`, `look4.prepareScene` |
| V7 | **Laufen/Blinzeln** nach Messwerten der Referenz (Wippen ≈ 4 % der Größe, Vorlehnen; Blinzeln alle 0,5–2,3 s in 4 Frames) | lebendigere Figuren | `kit/human.js` |
| V8 | **Verdeckungsprüfung** Kamera → Blickziel (Meldung in `tools/still.mjs`; `"occlusion": "hide"` blendet Verdecker aus) | keine Kamera in Wänden/Ketten vor Gesichtern | `stage.js` |
| V9 | **Fertige 3D-Modelle** (GLB) mit Lizenzpflicht im Lader | glaubwürdige Orte | `kit.models` |

**Optionen** (`post.v4`): `{ "ink": false | {strength, color, width, far}, "dof": false | {range, max, near}, "sky": false,
"occlusion": false | "hide" }`. Je Beat in `beats.json`: `"v4": { "ink": false, "dof": { "max": 9 } }` (an Produktion vorbei). Je Beat überschreibt die Szene über `fx` (z. B. `fx.dof = kit.look4.focus([x,y,z], { max: 9 })`,
`fx.dof = false`, eigene `grade`-Werte bleiben erhalten und werden um Schatten/Schwarz ergänzt). Eigene V4-Stimmungen:
`day4, golden4, dusk4, night4, storm4, interior4, clinical4, nightRoom4`.

**Messen statt meinen:** `python3 tools/look_metrics.py --base 'alt/*.png' --ours 'neu/*.png' --ref 'referenz/*.jpg'` –
Schwarzanteil (ohne Linien), Schwarzwert, Buntheit (darf nicht steigen), Schattenfarbe, Linienanteil, Tiefe, Himmelsverlauf und
Linien auf Handy-Größe. Messung Koma (6 Bilder, alt → V4, Referenz 38 Bilder): Schwarz 0,44 → 0,16 % (0,008), Schwarzwert 0,117 →
0,130 (0,116), Buntheit 0,071 → 0,071, Schatten B−R −0,066 → −0,021 (−0,031), Linien 41 → 52 % (60 %), Handy 44 → 55 %.

**Modelle:** Register `pipeline/runtime/kit/assets/models/registry.json`; nur mit geprüfter Lizenz (CC0 bevorzugt; Quelle + Lizenz beim Laden Pflicht, `M.credits()` für das LOG). Kenney-
Starter-Kits auf GitHub sind CC0 (README), aber Kachel-/Spielzeugmaßstab – für menschengroße Orte die großen Kenney-Pakete
(kenney.nl; in Cloud-Sitzungen gesperrt, Freigabe/Upload durch den Nutzer).

**Kosten:** Renderzeit je Frame steigt (Messung im Testvideo `productions/_v4_koma`, LOG). **Standard wird V4 erst nach Abnahme
des Testvideos durch den Nutzer** (dann `templates/beats.json` → `post.v4: true`).

**Freeze-Vermerk (18.10):** additiv und opt-in: `kit/look4.js`, `kit/models.js`, Kit-Erweiterungspunkt `core.hooks` (leer =
alt), neue `fx`-Schlüssel `ink`/`dof`/`grade.shadows|highlights|liftRGB`/`tone`, `tools/look_metrics.py`. Beat-Sheet-Format,
HUD, Ton, Render und Encode unverändert.

### Änderungsprotokoll

| Datum | Version | Änderung | Begründung |
|---|---|---|---|
| 2026-10-27 | 1.0 | Erstfassung | Analyse R01–R15 |
| 2026-10-27 | 1.1 | 10.3: Render-Pipeline entschieden und umgesetzt (Three.js + headless Chromium + FFmpeg, deterministisch) | Implementierungsplan freigegeben; Machbarkeit, Determinismus und Renderzeit gemessen; Tests in `tests/` |
| 2026-10-29 | 1.2 | Abschnitt 16: zwei Erfolgsrezepte (Eskalations-Zähler, X verschwindet 5 s), Baukasten `pipeline/runtime/kit/`, Vorschau `tools/still.mjs` | Analyse R16–R18 + R04/R07 (vom Auftraggeber benannte erfolgreiche Kanäle); erstes Testvideo wich vom Stil ab (Fotorealistik) |
| 2026-10-29 | 1.3 | Zwei Produktionsstile (A Earth, B mit Rezepten B1/B2, Abschnitt 17, `STYLE_A_EARTH.md`); Rezepte A/B → B1/B2 umbenannt; Mindestlänge 60 s für jedes Video, technisch erzwungen | Auftrag des Nutzers (Stilauswahl je Auftrag; jedes Video ≥ 60 s) |
| 2026-10-30 | 2.0 | Abschnitt 18 „Produktionsstandard Stil B“ (verbindlich, Vorrang), Architektur-Freeze 18.10; Stil B als einziges aktives Ziel, Stil A archiviert (17); HUD-Gestaltung und Signalfarbe nach R07/R19/R20 (18.5, ersetzt 6.3 HUD-Schrift „Monospace“ und 6.4 Punkt 2/3 „nicht Gold“); 16.3 Kit-Bestand | Auftrag des Nutzers (finale Systemüberarbeitung); Sichtung R07/R19/R20 (`REFERENCE_ANALYSIS.md` 9); Fehleranalyse 18.9; Testvideo `productions/what-if-phone-battery-life` |
| 2026-10-30 | 2.1 | 18.11: abgenommenes Testvideo als verbindliches Mindestniveau; Validator erzwingt `beats.json` für Stil B und warnt bei Unterschreitung; `run.mjs` legt `quality_review.md` an | Abnahme durch den Auftraggeber; Prüfung, ob der Standard im Ablauf greift |
| 2026-10-31 | 2.2 | 18.12 Hook-Standard (Unmöglichkeitstest, Hook-Typen, Beweis-Ereignis, Prämissen-Ereignisse, Füllstoff, Vorwegnahme, Hook-Entwurf); 2, 3.1, 16.1, 18.7, 18.11 angepasst; Beat-Sheet additiv `hook` + `events[].premise`; Validator-Regeln `[18.12]`; QA-Abschnitt H | Analytics Akku-Video (≈ 50 % Abgang bis 14 s), Hook-Analyse `REFERENCE_ANALYSIS.md` 10; Regeltext von 2/3.1/16.1 schrieb einen Alltagseinstieg vor (10.4). Auftrag des Nutzers 2026-10-31 |
| 2026-11-04 | 3.0 | 18.13: Story-Kern (Einsatz, Messgröße, Wende, sichtbare Ursachen, Wissensanker je Akt), Ich-Perspektive (`kit.firstPerson`), Schauwert/Massen (`kit.masses`), Licht & Atmosphäre (`kit.atmo`: Stimmungen, Lichtquellen, Oberflächen, Wasser, Teilchen, Paletten), optionale Post-Effekte `bloom`/`grade`, Erzählformen B3–B6, Warnregeln `[18.13]`, `tools/balance_qa.py`. Korrektur: Bewegungsunschärfe war bereits vorhanden (`motion_blur`, Whip-Unschärfe) | Analyse von 6 Videos (eigen / 80k / Millionen-Kanal), konsolidierte Auswertung; Auftrag des Nutzers 2026-11-04. Alte Produktionen bit-identisch geprüft |
| 2026-11-07 | 3.1 | 18.14 Sprache Deutsch: Standardsprache `de` (`pipeline/runtime/lang.js`), Titelformel „Was wäre, wenn …?“, Regeln D1–D12 (natürliches Deutsch, Du-Form, Zahlen/Einheiten, Typografie, HUD-Versalien mit SS); Validator: Titelformel je Sprache, `[18.14]` Zahlenformat/Schriftzeichen nur für `de`, S5 +1 Wort für die deutsche Formel; 1.3, 2, 4, 7.4, 13, 14, 16.1, 18.7, 18.13 angepasst; Vorlage `templates/text.de.json`; QA C13 Sprache, Sprachabnahme in D | Auftrag des Nutzers 2026-11-07 (Kanal auf Deutsch umgestellt). Englisch über `--lang en` unverändert; englische Validierung aller Produktionen byte-identisch |
| 2026-11-07 | 3.2 | 18.11 neu gefasst als Referenzhierarchie: kreative Referenzen C1 `Viral_referenz_1.mp4.MP4`, C2 `Viral_referenz_2.mp4.MP4`, B1 `Referenz__neuer_stil_1m_views.MP4` (Rang 1), B2 `Referenz_alter_stil.MP4` = R07 (Rang 2); Werte `[18.11]` nur noch technische Untergrenze; Akku-Produktion `what-if-phone-battery-life` nur noch technischer Regressionstest. CLAUDE.md, Skill, Checkliste, `quality_review.md`, README, Validator-Meldung angepasst | Auftrag des Nutzers 2026-11-07: Akku-Video veraltet, kein visueller/erzählerischer Maßstab mehr. Schwellen und Tests unverändert |
| 2026-11-09 | 3.3 | 18.15 Bildsprache V4 (opt-in `post.v4`): Umriss-Linien, Tiefenunschärfe, kühle Schatten, Himmelsverlauf, Grade mit farbigem Schwarz, Texturen mit Fugen, gemalte Flächen, Laufen/Blinzeln, Verdeckungsprüfung, `kit.models`, `tools/look_metrics.py` | Auftrag des Nutzers 2026-11-09 (Qualitäts-Upgrade); Analyse Mr omi + Code-Vergleich; alte Produktionen bit-identisch |
