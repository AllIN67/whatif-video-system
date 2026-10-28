# WHATIF STYLE GUIDE

**Maßgebliche kreative und technische Grundlage für alle Videos dieses Projekts.**
Version 1.1 · 2026-10-27 · Belegbasis: `REFERENCE_ANALYSIS.md` (15 Referenzen, R01–R15) und `references/analysis/MEASUREMENTS.md`.

Kennzeichnung der Regeln:

- **[V] verbindlich** – gilt für jedes Video; Abweichung nur mit schriftlicher Begründung im Produktionsprotokoll.
- **[S] situativ** – Standard, darf je nach Thema bewusst anders entschieden werden.
- **[H] Hypothese** – aus Referenzen abgeleitet, Wirkung **nicht** belegt; wird getestet.

Referenzbelege stehen in eckigen Klammern, z. B. *(R12, R14)*. Zahlen aus den Referenzen sind gemessen; alle anderen Zahlen sind **unsere Festlegungen**, nicht aus Erfolgsdaten abgeleitet.

---

## 1. Ziel und Identität des Formats

### 1.1 Was wir machen

Vertikale Kurzvideos (61–80 s), die eine einzige **„What if …?“-Frage** konsequent zu Ende denken: aus der Perspektive des Zuschauers, in einer stilisierten 3D-Welt, erzählt durch **kurze Texteinblendungen, einen Live-Messwert und Bild/Ton – ohne Sprecher**.

Das Format-Versprechen an den Zuschauer: *„In einer Minute erlebst du, was wirklich passieren würde – Schritt für Schritt, mit echten Zahlen, bis zur Pointe.“*

### 1.2 Format-Entscheidung: What-if statt Story

- 14 von 15 Referenzen sind What-if-Videos mit derselben Grundarchitektur (Titelfrage, Live-Messwert, Untertitel, Eskalation, Pointe). Nur R05 ist eine wortlose Story.
- **Entscheidung [V]:** Wir produzieren What-if-Videos. Das Story-Format (R05) ist mit einer einzigen Referenz nicht belegt und wird nicht Teil des Systems.

### 1.3 Sprachentscheidung: **Englisch zuerst, Deutsch als kontrollierter Test**

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

**Entscheidung [V für Phase 1]:** Wir starten **einsprachig auf Englisch**. Begründung: Die gesamte Belegbasis ist englisch; das Format funktioniert ohne Sprecher, also ist Englisch nicht teurer oder riskanter als Deutsch; die Reichweite ist größer. Das größte Gegenargument – starke Konkurrenz im englischen Markt – adressieren wir nicht durch Sprachwechsel, sondern durch **eigenständige Erkennungsmerkmale** (Abschnitt 6.4) und durch den geplanten Deutsch-Test.

**Sprachunabhängigkeit [V]:** Jeder Bildschirmtext liegt ausschließlich in einer Textdatei pro Sprache (`productions/<slug>/text.en.json`, später `text.de.json`), nie fest im Szenencode. Zahlen im HUD werden aus Werten + Einheit erzeugt, damit eine metrische Fassung (km, km/h, °C) ohne Szenenänderung entsteht. Keine Texte in 3D-Texturen einbacken (Ausnahme: Schilder, die bewusst unübersetzt bleiben dürfen – im Protokoll vermerken).

**Kontrollierter Sprachtest (später) [S]:**

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

| Regel | Typ |
|---|---|
| **Frame 0 zeigt bereits: bewegte Szene + Titelfrage + HUD.** Kein Logo, kein Intro, keine Schwarzblende länger als 3 Frames. | [V] |
| Titel als Frage „What if …?“, **≤ 10 Wörter, max. 2 Zeilen**, oben mittig (Bildhöhe ≈ 22–32 %). | [V] |
| Genau **ein** Schlüsselwort in der Signalfarbe (Abschnitt 6.4). | [S] *(10/14 Referenzen)* |
| Titel steht 2,5–4,0 s, dann 0,3–0,5 s Ausblendung. | [V] |
| Der HUD-Wert **verändert sich in den ersten 2 s** sichtbar (Countdown läuft, Zähler steigt/fällt). | [V] *(R06, R07, R08, R11–R15)* |
| Erste Untertitelzeile zwischen 3,5 und 5,0 s; sie verortet den Zuschauer („You are …“, „It's 3 AM.“). | [S] |
| Das auslösende Ereignis (oder sein unmittelbares Bevorstehen per Countdown) ist **spätestens bei 10 s** sichtbar. | [V] *(R01 ≈10 s, R06 ≈8,5 s, R15 ≈7 s)* |
| Der Titel muss vor dem Ausblenden auf dem Kontaktbogen (240 px Breite) lesbar sein. | [V] |
| **Zurückgehalten** wird immer: wie schlimm es wird und wie es endet. Der HUD zeigt die Richtung, nicht das Ziel. | [V] |

**[H]** Der sofort laufende Messwert erzeugt in den ersten Sekunden eine konkrete Frage („Was passiert bei 0?“), die stärker bindet als eine reine Titelfrage.

---

## 3. Dramaturgie und Spannungsaufbau

### 3.1 Grundstruktur (für 61–80 s)

| Akt | Zeit | Inhalt | HUD |
|---|---|---|---|
| A Prämisse | 0–4 s | Titelfrage, normale Welt | Startwert läuft |
| B Auslösung | 4–12 s | Ereignis tritt ein / Countdown endet; Zuschauer verortet | ggf. 1. Label-Wechsel |
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
- **[V]** **Bild vor Text:** Der Text beschreibt nicht, was ohnehin zu sehen ist, sondern ergänzt Ursache, Maßstab oder Bedeutung („There is no sound.“ statt „The asteroid explodes.“).
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
- **[S]** Abschlussvarianten: (a) Pointe als letzter Untertitel auf bewegtem Endbild, (b) Frage an den Zuschauer, (c) „Part 2?“ bei Serienpotenzial, (d) Kreisschluss zum ersten Bild.
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

- **[V für Phase 1]** **Kein Sprecher.** Begründung: 0 von 15 Referenzen nutzen einen Erzähler; das Format funktioniert stumm; ohne Sprecher entfallen TTS-Qualitätsrisiken und die Lokalisierung bleibt billig. Ein Sprecher-Test ist möglich, aber erst nach dem Sprachtest (1.3) und nur als Einzelvariable.

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
| Bildrate | **30 fps konstant** (CFR); r_frame_rate = avg_frame_rate = 30/1 |
| Video | H.264 High, yuv420p, BT.709, CRF ≤ 18 oder ≥ 12 Mbit/s |
| Audio | AAC-LC, 48 kHz, Stereo, ≥ 192 kbit/s |
| Container | MP4, `+faststart` |
| Länge | **61–80 s** *(alle 15 Referenzen 61–81 s; [H] Plattformregeln zur Mindestlänge für Monetarisierung prüfen)* |
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

**Verbindlich [V]:** What-if-Format; Englisch in Phase 1 mit externen Textdateien; Frame 0 mit Szene + Titel + HUD; Titel ≤ 10 Wörter; HUD ändert sich in 2 s; Ereignis bis 10 s; monotone Eskalation mit festgelegter Pointe; Textregeln (Zeilenlänge, Anzeigedauer, Bild vor Text); ein Kamera-Paradigma pro Video; Augenhöhe; nur echte 3D-Kamera; stilisierte 3D-Welt vollflächig; Blitzregel; Typografie-Mindestgrößen, Sicherheitszone, Scrim; Erkennungsmerkmale 6.4; Kontinuität; Zustandsänderung spätestens alle 6 s; Text blendet vor Schnitt aus; Ende ≤ 5 s nach Pointe; kein Sprecher; lizenzierte Musik; Tonakzente framegenau; Clip-Fades; Mischwerte; technische Ausgabe 10.1; deterministisches Rendern; QA 11.1–11.4; keine realen Personen/Logos.

**Situativ [S]:** Schlüsselwort-Farbe, Formulierung der ersten Zeile, globale/persönliche Wechsel, Anzahl HUD-Label-Wechsel, „HERE“-Countdown, benannte Figur, Schnitttakt je Paradigma, Ruhephasen, Abschlussvariante, Kamera-Wackeln, Effektfunktionen, instrumentale Musik, Themenpool und Themenausschlüsse.

---

## 14. Hypothesen (zu testen)

| # | Hypothese | Test |
|---|---|---|
| H1 | Ein sofort laufender HUD-Wert erhöht den Anteil der Zuschauer nach 3 s. | A/B: gleiches Video mit HUD ab Frame 0 vs. ab 4 s |
| H2 | Pointe + kurzes Ende (≤ 5 s) erhöht die Abschlussrate gegenüber 7–8 s Endkarte. | zwei Varianten desselben Videos |
| H3 | Kreisschluss erhöht Wiederholungen. | Wiedergabezeit > 100 % vergleichen |
| H4 | Frage-Endkarte erhöht Kommentare/1.000 Aufrufe gegenüber „Part 2?“. | über mehrere Videos |
| H5 | Instrumentale Musik verbessert Textverständnis gegenüber Gesang. | Abschlussrate, Kommentare zu Verständnis |
| H6 | Länge knapp über 60 s ist wegen Plattformregeln vorteilhaft. | Plattformregeln aktuell prüfen; Längen 61 s vs. 75 s vergleichen |
| H7 | Eigenständige Erkennungsmerkmale (6.4) erhöhen Follower-Rate. | langfristig, Follower/1.000 Aufrufe |
| H8 | Englisch erreicht bessere Bindungskennzahlen als Deutsch. | Sprachtest 1.3 |

## 15. Noch nicht ausreichend belegt

- **Erfolg der Referenzen:** Es liegen keine Aufrufe oder Bindungsdaten vor. Kein Merkmal ist als Erfolgsursache belegt.
- **Ton:** Musikstil, Sounddesign-Details und Mischqualität der Referenzen sind nur gemessen, nicht gehört.
- **Optimale Schnittfrequenz:** Die Referenzen streuen von 0,12 bis 4,9 Wechseln/10 s; eine Optimalfrequenz lässt sich nicht ableiten.
- **Deutscher Markt:** Keine einzige deutschsprachige Referenz.
- **Optimale Länge der Endkarte, Wirkung von Farbhervorhebung, Wirkung von „Part 2?“.**
- **Originalqualität der Referenzen** (nur Re-Encodes analysiert).
- **Plattformspezifische Unterschiede** (TikTok vs. Shorts vs. Reels): Alle Referenzen stammen von TikTok.

Änderungen an diesem Style-Guide nur auf Basis dokumentierter Ergebnisse (Produktionsprotokolle, Analytics). Jede Änderung mit Datum und Begründung unten eintragen.

### Änderungsprotokoll

| Datum | Version | Änderung | Begründung |
|---|---|---|---|
| 2026-10-27 | 1.0 | Erstfassung | Analyse R01–R15 |
| 2026-10-27 | 1.1 | 10.3: Render-Pipeline entschieden und umgesetzt (Three.js + headless Chromium + FFmpeg, deterministisch) | Implementierungsplan freigegeben; Machbarkeit, Determinismus und Renderzeit gemessen; Tests in `tests/` |
| 2026-10-28 | 1.1 | Keine Regeländerung. 6.4: Signalfarbe mit Video 1 festgelegt (`#38E1C6`, `brand.json`). | Guide 6.4 verlangt die Festlegung beim ersten Video (`productions/every-lie-costs-a-minute/LOG.md`) |
