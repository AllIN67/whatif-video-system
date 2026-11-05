# Videoanalyse – 6 Videos (Einzelanalyse)

Stand: 2026-11-04 · Analyse ohne Änderung am Produktionscode · Videos nur lokal (Upload), nicht im Repository.

**Kennzeichnung:** **[M]** Messwert (Werkzeug) · **[B]** Beobachtung an Frames · **[E]** qualitative Einschätzung · **[H]** Hypothese (ohne Abrufdaten nicht belegbar).

## 0. Material, Methode, Grenzen

| ID | Gruppe | Datei | Titel im Bild | Länge | Format |
|---|---|---|---|---|---|
| A1 | eigen | `Eigenes_best_performer_2.0.mp4` | What if everything you said became real for 5 seconds? | 64,0 s | 1080×1920, h264, 30 fps, AAC 48 kHz |
| A2 | eigen | `Eigenes_videos_2.0.MP4` | What if you could read everyone's mind? | 61,4 s | 1080×1920, h264, 30 fps |
| B1 | 80k-Kanal | `Referenz__neuer_stil_1m_views.MP4` | What if it rained forever? | 61,0 s | 1080×1920, hevc, 30 fps |
| B2 | 80k-Kanal | `Referenz_alter_stil.MP4` | What if you got 2× smaller every 2 seconds? | 61,0 s | 1080×1920, hevc |
| C1 | Millionen-Kanal | `Viral_referenz_1.mp4.MP4` | What if you had to spend $1 trillion? | 70,0 s | 1080×1920, hevc |
| C2 | Millionen-Kanal | `Viral_referenz_2.mp4.MP4` | What if you fell into a coma? | 75,2 s | 1080×1920, hevc |

- **[M]** B2 ist bit-identisch mit der bereits analysierten Referenz **R07** (SHA-256 `28ff8796…` = `references/manifest.tsv`). B1/B2 tragen dieselbe Handschrift wie die Gruppe „77k-Kanal“ (Guide 16.1).
- **Werkzeuge:** `tools/video_qa.py --mode reference` (Schnitte, Bewegungsübergänge, Lautheit EBU R128, Stille, Monotonie, Kontaktbögen 1 Bild/s, Einstieg 0–3 s mit 5 Bildern/s, ein Bild je Einstellung); eigene Skripte im Scratchpad: Onset-Erkennung (Spectral Flux, 20 ms), Spektralanteile je Frequenzband, Dynamik (p95–p5 der Kurzzeitenergie), Spektrogramme (als Bild gesichtet), `signalstats` (Sättigung, Kontrast, Helligkeit, 2 Bilder/s), `siti` (Detail). Zusätzliche dichte Abtastung (2,4 Bilder/s) an unklaren Stellen (A2 3,8–8,8 s).
- **Abtastung:** Kontaktbögen 1 Bild/s über die ganze Länge (alle 19 Bögen angesehen), Einstieg 0–3 s mit 5 Bildern/s (alle 6), Ereignisstellen dichter. Keine 30-fps-Vollextraktion.
- **Nicht möglich:** Anhören (Klangeindruck nur aus Spektrum/Hüllkurve erschlossen). **Spracherkennung:** `faster-whisper` ließ sich in dieser Umgebung nicht installieren (Paketdownload hing). Befund aus Spektrum und Bild: **kein Video hat einen Sprecher**; alle Sprache ist Bildschirmtext. Das „Transkript“ unten ist daher der aus den Frames gelesene Bildschirmtext mit Zeitstempel (±0,5 s).
- **Keine Zuschauerdaten:** Aufruf-/Followerzahlen sind Angaben des Auftraggebers (Dateinamen). Es liegen keine Abbruchkurven vor.

## 1. Messwerte im Überblick [M]

| | A1 | A2 | B1 | B2 | C1 | C2 |
|---|---|---|---|---|---|---|
| Harte Schnitte | 11 | 13 | 4 | 1 | 5 | 12 |
| Bewegungsübergänge (Whip/Abblende) | 9 | 4 | 4 | 12 | 12 | 12 |
| Einstellungswechsel / 10 s | 2,97 | 2,77 | 1,31 | 2,13 | 2,43 | 2,93 |
| Median-Einstellung | 3,63 s | 3,60 s | 6,40 s | 3,97 s | 4,20 s | 2,03 s |
| Erster Bildwechsel | 4,0 s | 4,0 s | 0,13 s (Einblendung) | 0,17 s (Einblendung) | 4,03 s | 9,0 s |
| Bewegung (mittl. YDIF) 0–1 s | 0,80 | **0,48** | 4,84* | 6,12* | 1,07 | 4,62 |
| Bewegung 1–3 s | 2,02 | **0,58** | 0,99 | 2,51 | 1,50 | **12,55** |
| Bewegung 3–15 s | 2,48 | 3,14 | 4,35 | 4,09 | 7,26 | 7,97 |
| Bewegung 15 s–Ende | 4,40 | 4,09 | 4,67 | 5,48 | 5,50 | 4,66 |
| Monotonie-Kandidaten (3 s < 0,5) | – | 52–55,5 s | 56–60 s | – | 52–56, 57–60, 66,5–69,5 s | 15–18,5 s |
| Mittlere Helligkeit Y | 114 | 98 | 117 | 156 | 114 | 96 (min 18) |
| Sättigung (Mittel) | 18 | 14 | 16 | 30 | 12 | 12 |
| Lautheit integriert | −14,2 LUFS | −14,1 | −26,9 | −25,2 | −14,1 | −14,1 |
| LRA | 8,1 LU | 9,7 | 1,9 | 2,2 | 11,7 | 11,7 |
| Dynamik p95–p5 (0,13-s-Energie) | 22,7 dB | 20,7 | 7,3 | 7,0 | 30,2 | **48,3** |
| Anteil Bilder < −50 dB (Stille) | 0 % | 0 % | 0 % | 0 % | 0,9 % | **6,0 %** |
| Energie < 100 Hz | **71 %** | **64 %** | 32 % | 31 % | 24 % | 11 % |
| Energie 2–8 kHz | **0,9 %** | 7,2 % | 4,0 % | 2,3 % | **16,5 %** | 5,2 % |

\* B1/B2: hoher Wert 0–1 s stammt von der Einblendung aus Schwarz (2–3 Frames), nicht von Handlung.
**[M]** Der Detailwert `siti` (SI: A1 80, A2 97, B1 75, B2 73, C1 101, C2 69) trennt die Gruppen **nicht** – SI misst Kantenschärfe, nicht Bildreichtum. Aussagen zur Detaildichte unten sind daher Sichtbefunde [B], keine Messwerte.

---

## 2. A1 – „What if everything you said became real for 5 seconds?“ (64,0 s, eigen)

### Hook (0–3 s)
- **Frame 0 [B]:** Schlafzimmer, Würfel-Mann sitzt auf dem Bett, halbtotal, Augenhöhe. Titel 3 Zeilen (8 Wörter, „real“ gold). HUD „CAME TRUE 0 / FOR 5 SECONDS“. Graue, leere Wand, ein Regal, Fenster mit Stadtsilhouette.
- **0–1 s [B]:** Kopfdrehung, ab 0,6 s Zitatzeile „Ugh… I could eat a horse.“ Bewegung 0,80 [M] – fast statisch.
- **1,8 s [B]:** Pferd erscheint mit Staubwolke links, Figur reißt die Arme hoch, HUD springt auf 1 (Akzent rot). **Unmöglichkeitstest bestanden** (Beweis-Ereignis ≤ 2 s).
- **Frage bei 3 s [E]:** „Was sagt er als Nächstes?“ – Neugier auf den nächsten Gag, kein persönlicher Einsatz (keine Gefahr, kein Ziel).
- **[E]** Das Prinzip ist bis 2 s verständlich (Zitat + Pferd). Schwach: Frame 0–1,7 s ist ein Normalbild (Mann sitzt), der Titel ist lang (3 Zeilen), Pferd steht zur Hälfte hinter dem Titel/HUD-Bereich.

### Zeitachse [B]
| Zeit | Ereignis / Bildschirmtext | Ort / Kamera |
|---|---|---|
| 0,0 | Titel, HUD CAME TRUE 0; „Ugh… I could eat a horse.“ | Schlafzimmer, halbtotal |
| 1,8 | Pferd erscheint (Staub), HUD 1 | |
| 4,0 | Schnitt: „Wait… HOLY COW!“, Kuh erscheint (5–6 s), HUD 2 | Nahaufnahme |
| 7–9 | „Phew. Okay… piece of cake.“, Aufsicht aufs Bett, Kuh + Torte | Aufsicht |
| 10–12 | Torte in den Händen, Gesicht in der Torte | Küche (grün) |
| 13–15 | „No, no… RATS!“ Ratten, Sprung auf Stuhl, Staub | Küche |
| 16–19 | „I wish I was back in bed.“ – liegt im Bett (Torte/Ratten weg) | Aufsicht |
| 20–21 | „Ow… seeing stars.“ Sterne um den Kopf, HUD 6 | Bett |
| 22–25 | **HUD-Label wechselt: OUT OF CONTROL / WATCH YOUR WORDS**, Zähler 6 → 28 in 3 s; „Great. It's raining cats and dogs.“ | Straße, Begleitfahrt |
| 26–27 | Katze auf der Schulter, „Five seconds, then gone.“ (erklärende Regelzeile bei 26 s) | Nahaufnahme |
| 28–34 | Büro: „I'm on fire today!“ – Flammen, „Chill out! CHILL OUT!“ – Eis/Staub | Büro |
| 35–42 | **Label SILENCE MODE / LIPS SEALED**; Restaurant rot, „New rule: my lips are sealed.“, Date: „Butterflies… in my stomach…“ Schmetterlinge | Restaurant |
| 43–46 | „I'm walking on air!“ schwebt | Platz |
| 47–48 | „Sorry, I'm all ears!“ Riesenohren | |
| 49–52 | **Label WORST DAY EVER / DON'T SAY IT**; kniet: „I wish I could just disappear.“ – verschwindet | Platz |
| 53–56 | „What's next? A meteor?“ Meteor über Stadt | Stadt, Aufsicht |
| 57–59 | „I wish today never happened!“ roter Himmel, Untersicht | Straße, Untersicht |
| 60–62 | **DAY RESTARTED 0 / THIS ONE STAYED** – wieder im Bett: „I could eat a—“ | Schlafzimmer, nah |
| 63 | Endkarte „What would you say first? Part 2?“ | |

### Dramaturgie [E]
- Form: **Reihung von Redewendungs-Gags** (≈ 14 Wörtlich-Nehmungen). Jeder Gag ist für sich lesbar; es gibt keinen akkumulierenden Einsatz – die Folgen eines Gags verschwinden nach 5 s (Regel des Konzepts), dadurch baut sich nichts auf.
- Steigerung: Zähler und Größe der Folgen (Pferd → Feuer → Meteor) steigen; der HUD-Zähler zählt aber nur „wie oft“ – nicht „was steht auf dem Spiel“. 4 Label-Wechsel (CAME TRUE → OUT OF CONTROL → SILENCE MODE → WORST DAY EVER → DAY RESTARTED) markieren Akte, die Akte haben aber keinen Ursache-Wirkung-Bezug zueinander.
- **Stark:** Ringschluss am Ende (Tag startet neu, „I could eat a—“) ist ein echter Payoff mit Rückbezug auf Frame 0; Endfrage lädt zu Kommentaren ein.
- **Schwach:** Kein Ziel der Figur außer „Schaden vermeiden“; Regel „5 Sekunden, dann weg“ wird erst bei 26 s erklärt; Sprechblasen-Zitate erfordern Lesen jedes Satzes, um den Gag zu verstehen (Wortwitz ist sprachgebunden).

### Visuell [B]
- Würfel-Figuren mit Gesicht, deutliche Mimik (Schreck, Freude). 9 Orte, jeder mit eigener Lichtstimmung.
- Sets sind **spärlich**: einfarbige Wände, wenige Requisiten, meist 1–2 Figuren, Hintergründe leer (Straße 22 s, Platz 43 s: grauer Plattenbau + Grünfläche). Keine Menschenmengen, keine Tiefenstaffelung über 2–3 Ebenen hinaus.
- Effekte (Staub-Poof, Flammen, Sterne) sind Low-Poly-Partikel, lesbar.
- Kamera wechselt Größen (nah, halbtotal, Aufsicht, Untersicht) – regelkonform, aber durchweg Beobachter-Perspektive (3. Person).

### Ton [M/B]
- −14,2 LUFS, LRA 8,1. Spektrum: durchgehendes schmales Synth-Band um 0,8–1,5 kHz + Sub-Bass; **71 % der Energie unter 100 Hz, 0,9 % bei 2–8 kHz**. Kein Bereich echter Stille.
- Dichte regelmäßige Onsets (≈ 37/10 s, Grundpuls ≈ 115 BPM). Hörbare Effekt-Signaturen (Sweeps) bei ≈ 7, 23, 39–41, 60 s; Lautheitsabsenkung 35–40 s (SILENCE MODE = gewollte Ruhe, passt zur Story).
- **[H]** Auf Handylautsprechern (Wiedergabe meist erst ab ≈ 150–300 Hz) fällt der Großteil der Energie weg; die Musik dürfte dünn klingen. Hörprüfung durch den Nutzer nötig.

---

## 3. A2 – „What if you could read everyone's mind?“ (61,4 s, eigen)

### Hook (0–3 s)
- **Frame 0 [B]:** Straße, Rückenansicht der Hauptfigur (rot) von schräg hinten, zwei Passanten, Bus fern. HUD „MINDS YOU CAN READ 0 / ONLY YOU CAN SEE THEM“. Titel 3 Zeilen („mind“ gold).
- **0,6 s [B]:** Gedankenblasen poppen über den Passanten (zzz, Brief, ?), HUD 0 → 2 → 3. Prämisse damit formal sichtbar.
- **[M]** Bewegung 0–1 s 0,48, 1–3 s 0,58 – **die ruhigsten Einstiege aller sechs Videos**. Die Blasen sind klein (≈ 3 % der Bildhöhe) und liegen im Bereich von Titel/HUD.
- **Frage bei 3 s [E]:** unklar – „Was denken die Leute?“ Die Blasen sind Symbole ohne Inhalt; es entsteht keine Spannung.

### Zeitachse [B]
| Zeit | Ereignis / Text | Ort / Kamera |
|---|---|---|
| 0–3 | Gedankenblasen, Bus nähert sich | Straße, Rückenansicht |
| 4,0–7,0 | Schnitt; „Nobody else can see it.“; rote „!“-Blase über der Hauptfigur, Bus füllt das Bild, Figur hebt den Arm | Straße, Rücken / Untersicht |
| 7,5–10 | **HUD-Label: MINDS THINKING ABOUT YOU / YOU HEAR EVERY ONE**, 3 → 14; Figur jubelt vor dem stehenden Bus, Passanten mit Kamera-/Herz-Blasen; „Now they're all thinking about you.“ | |
| 11–14 | Park, Menge: „By lunch, the video is everywhere.“ 110 → 2.400 | Park |
| 15–18 | Gehen auf der Straße, 8.697 → 60.000, „And you hear every single thought.“, sorgenvolles Gesicht | Begleitfahrt / nah |
| 19–22 | Menge mit Blasen von oben: „You can't turn it off.“ 103k → 900k | Aufsicht |
| 23–26 | Kranfahrt über die Stadt, Blasenmeer: „The whole city. All about you.“ → 40 Mio. | Stadt, hoch |
| 27–30 | Erdkugel mit Lichtpunkten: „Then the whole planet.“ → 5,4 Mrd. | All |
| 31–34 | Bett, Blasen im Zimmer: „Not even at home.“ 8,2 Mrd. | Schlafzimmer |
| 35–38 | **Wende:** Nachtseite der Erde, **Label MINDS STILL THINKING OF YOU / THE WORLD IS ASLEEP**, Zähler fällt 931 Mio. → 2.000; „Late at night, the world falls asleep.“ | All |
| 39–42 | Nachtstraße, Gehen: „One by one, they go quiet.“ 394 → 3 | Nacht |
| 43–51 | Busdepot, Fahrer mit Herz-Blase: „Only one mind is still awake.“ / „The driver you saved this morning.“ 1 | Nacht |
| 52–57 | im Bus, goldener Morgen: „Finally, you can rest.“ → zzz, Zähler 0 (52–55,5 s Monotonie [M]) | Businnen |
| 58–61 | Aufsicht Bus, Endkarte „Would you save him twice? Part 2?“ | hoch |

### Dramaturgie [E]
- **Stark:** klarer Bogen mit Wende (Zähler steigt bis 8,2 Mrd., dann fällt er auf 1 → 0); emotionaler Schluss (der Gerettete denkt an dich); Maßstabsreise Person → Stadt → Planet → zurück zur Person (vgl. Experiment-Befund H-A/H-C).
- **Schwach 1 – Auslöser unlesbar:** Die Rettung des Busfahrers (4–7 s), auf der Wende und Endfrage aufbauen, ist im Bild nicht verständlich: die „!“-Blase sitzt über der Hauptfigur statt über dem Fahrer, die Gefahr (was droht?) ist nicht zu sehen, der Bus hält einfach. Bei 47 s („The driver you saved this morning“) muss der Zuschauer die Ursache nachträglich rekonstruieren.
- **Schwach 2 – Prämissen-Drift:** Die Prämisse „Gedanken lesen“ wird ab 7,5 s zu „alle denken an dich“ (Ruhm). Das HUD-Label wechselt genau dort; die Frage des Titels wird nicht weiter beantwortet.
- **Schwach 3 – Endfrage** „Would you save him twice?“ ist ohne verstandene Rettung schwer einzuordnen.

### Visuell [B]
- Gleicher Baukasten-Look wie A1. Erste Hälfte hell (Tag), zweite Hälfte Nacht (Helligkeit min 44 [M]) – Gesichter in der Nacht lesbar, aber flach.
- Mengen (Park, Straße) mit ≈ 10–20 Figuren; Stadtaufsicht mit Blasenmeer ist das dichteste Bild beider eigenen Videos.
- Erdkugel als eigener Stil-Bruch (glatte Kugel, Lichtpunkte) – funktioniert als Maßstabssprung.

### Ton [M/B]
- −14,1 LUFS, LRA 9,7; 64 % Energie < 100 Hz. Deutliche Abschnittswechsel: Bass-Blöcke 5–7 s (Rettung), 48–50 s, 55–57 s, 59–61 s; ab ≈ 30 s dünneres Bett (Nacht), Onsets 30–55 s nahezu 0 (ruhige Fläche) – **Lautheitsdramaturgie vorhanden**, passt zur Wende.
- Wiederkehrende hohe Ticks (Spektrum 2,6 kHz, ≈ alle 0,5 s, 10–40 s) = HUD-Zähltakt.

---

## 4. B1 – „What if it rained forever?“ (61,0 s, 80k-Kanal, „neuer Stil“)

### Hook (0–3 s)
- **Frame 0 [B]:** 2 Frames Schwarz, dann Einblendung: Hauptfigur (roter Pullover, glatter Low-Poly-Mensch, **kein** Würfel-Kopf) frontal mittig vor zwei Häusern, Regenstreifen. Titel 2 Zeilen, „rained“ hellblau. HUD „WATER LEVEL 0 cm“ + Pille „IT NEVER STOPS RAINING“ (ab ≈ 1,4 s).
- **[B]** Regen läuft ab Frame 0, Zähler steht bis 2,8 s auf 0 cm, Wasser am Boden sichtbar erst ab ≈ 3 s.
- **[E]** Prämisse ist durch Titel + Regen + Wasserstand-HUD in < 2 s verständlich, aber das Bild selbst ist bis 3 s ein normaler Regentag (besteht den Unmöglichkeitstest erst über HUD/Titel). Frage: „Wie hoch wird es steigen?“ – sofort klar und einfach.

### Zeitachse [B]
| Zeit | Text | Bild / HUD |
|---|---|---|
| 3–5 | „Day 1. It starts raining…“ | Wasser 2–6 cm |
| 6–7 | „…and it never stops.“ | roter Schirm öffnet sich |
| 8–11 | „20 cm a day. Every day.“ | Umkreisung, 12–19 cm |
| 12–15 | „The streets become rivers.“ | Ruderboot in der Straße, Abendlicht, 27 cm → 1,3 m |
| 16–19 | „Cars, bins, rubber ducks. Everything floats away.“ | Gummiente, 1,8–3,3 m |
| 20–23 | „Soon only the roofs are dry.“ | Totale über Dächer, 3,8–5,6 m |
| 24–26 | „Cities turn into islands.“ | Hochhäuser, 6,3–11 m |
| 27–31 | „You can row between skyscrapers.“ | Boot winzig zwischen Türmen, 15–37 m |
| 32–35 | „The first 20 floors are underwater.“ | 44–68 m |
| 36–39 | „The coastlines vanish.“ | Erdkugel, 81–231 m, YEAR-Zähler |
| 40–43 | „Then the lowlands, then whole continents.“ | 336 m → 1.093 m |
| 44–47 | „A water planet.“ | 1.638 → 5.670 m |
| 48–51 | „Year 121. One rock is left on Earth.“ | Boot an Felsen, 8.848 m |
| 52–53 | „The top of Everest.“ | Figur auf dem Gipfel |
| 54–57 | „Then the rain stopped.“ | Regenbogen |
| 58–59 | „…and it started snowing.“ | Schneeflocken |
| 60 | „Part 2?“ | (56–60 s Monotonie [M]) |

### Dramaturgie [E]
- **Eine** Figur, **eine** Messgröße, **eine** Richtung (steigt monoton über 5 Größenordnungen: cm → km), ein Ort-Faden (seine Straße → Stadt → Planet → Everest). Jede Zeile ist eine neue Konsequenz, kein Nebenstrang.
- Information in Zahlen mit realem Anker („20 cm a day“, „8,848 m“, „Year 121“).
- Payoff: Ruhe (Regenbogen) → Gegenwendung (Schnee) → „Part 2?“ – Mini-Twist mit Humor in 6 s.

### Visuell [B]
- Glatterer Figurenstil, atmosphärisch: Nebel/Tiefendunst, Regenpartikel, Wasseroberfläche mit Reflexion/Wellen, leuchtende Fenster, entsättigte kühle Palette, **rote Figur als einziger Farbakzent** – in jeder Stufe sofort auffindbar.
- Wenige lange Einstellungen (Median 6,4 s [M]), Übergänge per weicher Fahrt.

### Ton [M]
- −26,9 LUFS, LRA 1,9, Dynamik 7,3 dB, keine Stille: ein durchgehender Song (breitbandig, gleichmäßig), keine erkennbaren Ereignisklänge. Sound trägt hier keine Dramaturgie.

---

## 5. B2 – „What if you got 2× smaller every 2 seconds?“ (61,0 s, 80k-Kanal, „alter Stil“, = R07)

### Hook (0–3 s)
- **Frame 0 [B]:** 3 Frames Schwarz, dann Schlafzimmer, Mann (gelbes Shirt) steht, Titel („2× smaller“ gold), HUD HEIGHT 1.60 m.
- **0,2–2,8 s [B]:** Figur **schrumpft sichtbar im Bild**, HUD läuft 1,49 m → 64,8 cm. Prozess ab Frame 0 → Unmöglichkeitstest in < 1 s bestanden (Hook-Typ `process`, Guide 18.12).
- Frage [E]: „Wie klein wird er – und was wird gefährlich?“

### Zeitachse [B] (fester 4-s-Takt, Übergang jeweils 2–3 Frames Abblende, [M] Bewegungsübergänge bei 4, 8, 12 … s)
| Zeit | Text | Welt / Höhe |
|---|---|---|
| 2,8 | „Then he shrinks again…“ | 64,8 cm |
| 4–7 | „His bed is a mountain now.“ | 37 → 13 cm |
| 8–11 | „The dog thinks he's a toy.“ | 9 → 3 cm |
| 12–15 | „A coin is a giant wall.“ | 2,3 cm → 8 mm |
| 16–19 | „An ant is now a monster.“ | 5,8 → 2,1 mm |
| 20–23 | „The carpet is a jungle.“ | 1,5 mm → 514 µm |
| 24–27 | „Dust mites. Everywhere.“ | |
| 28–31 | „A single hair is a giant log.“ | |
| 32–35 | „He falls into a drop of water…“ | |
| 36–39 | „…full of bacteria.“ | |
| 40–43 | „He lands on a cell like a tiny planet.“ | |
| 44–47 | „Viruses land like spaceships.“ | |
| 48–51 | „Inside… a world of molecules.“ | |
| 52–55 | „DNA. The code of life.“ | |
| 56–58 | „He's now only a few atoms tall.“ | 5,5 → 2,0 nm |
| 59–60 | „Part 2?“ | 1,4 nm |

### Dramaturgie [E]
- **14 Entdeckungen in 60 s**, strikt eine pro 4-s-Block. Kein Konflikt, kein Gefühlsbogen, kein Twist – die Zugkraft ist reine Neugier „Was kommt auf der nächsten Größenstufe?“ plus Wissensanker (Milbe, Bakterien, Virus, DNA).
- Ende ohne Payoff (endet bei Atomen + „Part 2?“). **[E]** Ein Video ohne Pointe kann also im Format funktionieren – der Sog entsteht aus der Erwartung der nächsten Stufe.

### Visuell [B]
- Pastell-Low-Poly, warmes Innen → Cyan (Wasser) → Grün (Zelle) → Violett (Moleküle): Farbwechsel markieren Fortschritt. Weiße kursive Zeilen auf hellem Grund schlecht lesbar (bekannt aus R07-Analyse).

### Ton [M]
- −25,2 LUFS, LRA 2,2, Dynamik 7 dB; lizenzierter Song mit Gesang (aus R07-Analyse), keine Ereignisklänge.

---

## 6. C1 – „What if you had to spend $1 trillion?“ (70,0 s, Millionen-Kanal)

### Hook (0–3 s)
- **Frame 0 [B]:** **Ich-Perspektive**: eigene Hände (blaue Ärmel) liegen auf einem Café-Tisch; gegenüber ein Banker im weißen Anzug; barocker Platz mit Palmen, Kuppelbau, Menschen im Hintergrund, Tiefenunschärfe. Titel 2 Zeilen, „$1 trillion“ grün.
- **0,2 s [B]:** HUD erscheint ohne Einblendung: „TIME LEFT 24:00:00“ + riesige grüne Zahl „$1,000,000,000,000“ mit schwarzer Kontur (fette Groteskschrift – der Geldbetrag *ist* das HUD).
- **0,4–2,0 s [B]:** Der Banker schiebt eine schwarze Karte über den Tisch **zu dir**.
- **[M]** Bewegung 0–1 s 1,07, 1–3 s 1,50 – ruhig. Ton 0–10 s leise (≈ −29 dB RMS gegenüber −12 bis −18 dB danach).
- **[E]** Kein Spektakel, aber sofortiger **persönlicher Einsatz**: Du bekommst eine Karte. Frage bei 3 s: „Was kaufe ich?“ – jeder Zuschauer beantwortet sie innerlich selbst. Ab 4,0 s zweite Ebene: „But you only have 24 hours.“ (Timer beginnt zu laufen → doppelte tickende Uhr).

### Zeitachse [B]
| Zeit | Text | Bild / HUD |
|---|---|---|
| 3,8–5 | „But you only have 24 hours.“ | Whip nach oben zur Rathausuhr, Timer 23:30:43 |
| 6–8 | „Let's see if it's even possible.“ | Banker-Geste; POV-Hand hält Karte |
| 9–13 | „The most expensive car ever sold.“ / „Your money didn't even notice.“ | Showroom, Stempel **PURCHASED · 1955 MERCEDES 300 SLR**, rot −$150,800,000 |
| 14–18 | „Every Ferrari made last year.“ | Feld voller roter Ferraris bis zum Horizont, −$6,71 Mrd. |
| 19–22 | „The most valuable football club on Earth.“ | volles Stadion, PURCHASED REAL MADRID |
| 23–27 | „And the 29 next biggest clubs.“ | Luftbild vieler Stadien, −$77 Mrd. |
| 28–31 | „Every NFL team.“ | Spielfeld mit Spielern, −$305 Mrd. |
| 32–35 | „Every NBA team.“ | Halle, Videowürfel |
| 36–40 | „Every baseball and hockey team.“ | Eishalle |
| 41–45 | „Then you buy Netflix.“ / „$1.2 billion left.“ | Wohnzimmer, Wand aus Bildschirmen, −$258 Mrd. |
| 46–51 | „A $600 million superyacht.“ | Jacht; **Timer rot 00:00:29 → 00:00:01** |
| 52–55 | „Time's up.“ / „$634 million left.“ | Gegenlicht, Wasser; Musik bricht ab (52,3 s [M]) |
| 57–61 | „You could've just bought 5 companies.“ | Banker auf der Jacht |
| 62–65 | Liste Coca-Cola $399.3B, Netflix, Disney, McDonald's, Nike → **$1,088,360,000,000** | |
| 66–69 | Abblende, Titel erneut, „What would you buy first?“ | |

### Dramaturgie [E]
- **Ritual + Steigerung:** Jeder Kauf wiederholt dieselbe Handlung (POV-Hand zeigt Karte → Stempel PURCHASED → roter Abzug → Zähler rollt), aber in immer größerer Größenordnung (150 Mio. → 305 Mrd.). Wiedererkennung + Eskalation.
- **Zwei Uhren:** Geld fällt, Zeit fällt – Spannung, ob es reicht. Der Timer wird bei 46–51 s rot und tickt im Sekundentakt herunter: klarer Höhepunkt.
- **Payoff mit Umdeutung:** Die Rechnung „5 Firmen = mehr als 1 Billion“ entwertet rückwirkend alle Käufe → Aha-Moment + Diskussionsstoff („What would you buy first?“).
- Faktenanker in jedem Beat (realer Rekordpreis, reale Vereine/Ligen, reale Firmenwerte) [B]; Richtigkeit nicht geprüft.

### Visuell [B]
- Würfel-Figuren (wie unsere!), aber **dichte, realistisch beleuchtete Umgebungen**: Stadien mit Tausenden Zuschauern, Feld mit Hunderten Autos, Skyline, spiegelndes Wasser, Gegenlicht/Glare, Tiefendunst, Tiefenunschärfe, Bewegungsunschärfe bei Whips.
- 9 Orte, jeder ein „Schauwert“-Bild (Weite, Masse, Glanz).
- HUD-Gestaltung weicht vom Format ab: Geldzahl groß, grün, fett, mit Kontur; Stempel „PURCHASED“ als zusätzlicher Bildschirmtext oben.

### Ton [M/B]
- −14,1 LUFS, LRA 11,7, Dynamik 30 dB, Energie gleichmäßiger verteilt (16,5 % bei 2–8 kHz – höchster Wert).
- Spektrum: 0–9,5 s fast nur leise Fläche/Einzeltöne; **Musik setzt beim ersten Kauf (≈ 9,5 s) mit Bass ein**; Bass-Blöcke schalten im Takt der Käufe an/aus (≈ 15,5, 19, 29, 36 s); kurze Lücke ≈ 31,5 s; **Musikwechsel bei 52,3 s („Time's up“)** zu einem leiseren, perkussiven/arpeggierten Teil bis zum Ende.

---

## 7. C2 – „What if you fell into a coma?“ (75,2 s, Millionen-Kanal)

### Hook (0–3 s)
- **Frame 0 [B]:** Ich-Perspektive am Balkongeländer einer nächtlichen Poolparty (Miami), lachender Freund direkt vor der Kamera, Menge unten. HUD **„STAR ISLAND · MIAMI / 11:48 PM“** (Ort + Uhrzeit statt Zähler). Titel 2 Zeilen, „coma“ cyan.
- **1,8–3,0 s [B]:** Kamera kippt über das Geländer → Blick senkrecht hinunter auf Pool, Laser, Skyline, Schwimmringe, Hunderte Figuren. **[M] Bewegung 1–3 s = 12,55** (höchster Wert aller sechs).
- **[E]** Das erste Ereignis ist nicht die Prämisse (Koma), sondern die **Ursache in Echtzeit, aus deiner Sicht**: Du stehst gleich am Abgrund. Frage bei 3 s: „Springe ich? Was passiert mir?“ – maximaler persönlicher Einsatz, ohne Lesen verständlich.

### Zeitachse [B]
| Zeit | Text | Bild / HUD |
|---|---|---|
| 4–5 | „Your friends dare you to jump.“ | POV-Hand am Geländer |
| 6–8 | „You jump. Not far enough.“ | Aufsicht, Körper trifft Beckenrand |
| 9–11 | „Your head hits the edge.“ | unter Wasser, Freunde ziehen dich heraus |
| 12–14 | „You don't wake up.“ | POV liegend, Gesichter über dir, gekippt |
| 14,3–18,4 | **Schwarz**, HUD **IN A COMA / DAY 1**: „You're in a coma.“ | [M] Schwarzbild, Ton fällt ab |
| 19–20 | „Doctors rate you 3 out of 15. The lowest.“ | unscharfer Lidspalt, OP-Lampe |
| 21–23 | „Your mom is crying next to you.“ | Schwarz |
| 24–30 | DAY 2: „Many people in intensive care dream.“ / „Then the dream turns bad.“ | Krankenbett **im** Partypool (Traum-Mischung) |
| 31–35 | DAY 3: „Doctors talk about switching you off.“ / „Most deaths like this happen that way.“ | Bett versinkt, dunkel |
| 36–39 | WEEK 3: „Your eyes open. You can't respond.“ | Krankenzimmer, Mutter |
| 40–42 | WEEK 4: „Your phone keeps buzzing.“ | Handy 3:14 mit Nachrichten („bro wake up“, „GTA 6 came out“) – Humor-Einschub |
| 43–48 | WEEK 5: „The doctor says: no one is in there.“ / „But 4 in 10 times, they're wrong.“ | Arzt + weinende Mutter |
| 49–51 | WEEK 6: „A brain scan.“ | POV aus der MRT-Röhre; Ton-Aussetzer [M] |
| 52–54 | „A voice says: imagine playing tennis.“ | Kontrollraum, Mutter |
| 55–60 | „So you do. With everything you have.“ | POV Tennis vor vollem Stadion |
| 61–66 | „Your brain lights up.“ / „1 in 4 who can't respond can do this.“ | Kontrollraum, RESPONSE DETECTED |
| 65–67 | – | **[M] 2,2 s Stille** |
| 67–70 | „You still can't move. But now they know.“ | Mutter hält deine Hand, warmes Morgenlicht |
| 71–75 | Titel + „Would you want them to keep waiting?“ | |

### Dramaturgie [E]
- **Überlebensgeschichte einer Person** mit Zeitsprung-HUD (DAY 1 → WEEK 6) statt Zähler. Jede Zeile ist entweder Handlung oder ein **medizinischer Fakt** (Glasgow-Skala 3/15, Fehldiagnose 4 von 10, Tennis-Vorstellung im MRT, 1 von 4) – Richtigkeit nicht geprüft.
- Wechsel Hoffnung/Rückschlag (Augen offen → „no one is in there“ → „they're wrong“ → Scan) mit emotionaler Figur (Mutter) und einem Humor-Einschub (Handy).
- Payoff: kein Twist, sondern **emotionale Auflösung + Wissens-Aha**, Endfrage moralisch („keep waiting?“).

### Visuell [B]
- Würfel-Figuren, hochwertige Licht- und Materialwirkung: Neon, Laser, Lichterketten, Unterwasser-Kaustik, Gegenlicht, Unschärfe (Lidspalt), warmes Morgenlicht im Krankenzimmer.
- **Schwarzbilder als Erzählmittel** (du siehst nichts, weil du im Koma liegst) – 15,3–18,4 s und 20,8–23,7 s [M].
- Starke Kontraste der Welten: Party (Neon/Nacht) → Schwarz → Klinik (kühl-weiß) → Tennis (sattes Grün) → warmes Ende.

### Ton [M/B]
- −14,1 LUFS, LRA 11,7, **Dynamik 48 dB**, 6 % Stille-Anteil. Spektrum: Partymusik 0–15 s, Abbruch beim Koma (≈ 15,3 s), Musik setzt neu ein; harte Aussetzer 48,5 / 51 / 53 / 57–58 s (MRT/Tennis-Vorstellung), **komplette Stille 65–67 s vor der letzten Zeile**, Musik zurück ab 68 s.
- Ton erzählt mit: Ruhe = Bewusstlosigkeit, Lücken = Spannung.
