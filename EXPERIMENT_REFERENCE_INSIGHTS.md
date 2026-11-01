# Experiment: Erkenntnisse aus 4 Referenzvideos (Branch `experiment/reference-insights-2026-11`)

Stand: 2026-11-01 · Basis: `origin/main` @ `aad9f02` · **Nicht für `main` bestimmt.** Eine Übernahme entscheidet der Auftraggeber.

Kennzeichnung: **[B]** Beobachtung (gesehen/gemessen) · **[I]** Interpretation · **[H]** Hypothese (ohne Veröffentlichungsdaten nicht belegbar).
Angabe des Auftraggebers: zusammen > 600.000 Aufrufe und > 10.000 Follower in 24 h. Das ist ein Hinweis auf Performance, **kein Beleg für eine Ursache**.

## 0. Methode und Grenzen

- Je Video: `ffprobe`, Kontaktbögen mit 2 Bildern/s über die ganze Länge (alle Bögen angesehen), Einstieg 0–3 s mit 4 Bildern/s,
  Schnitterkennung (`select=gt(scene,0.25)`), Ton: EBU-R128-Lautheit + Momentan-Spitzen, Wellenform + Spektrogramm (als Bild angesehen).
- **Nicht möglich:** Anhören (Musikstil/Klangfarbe nur aus Wellenform/Spektrum erschlossen), Sichtung jedes Einzelbilds, Spracherkennung
  (`faster-whisper` nicht installiert; Untertitel als Text im Bild gelesen – keiner der vier hat erkennbar Sprecher-Rhythmus in der Wellenform).
- Die Videos liegen nur lokal (Upload), wurden nicht ins Repository kopiert (Guide: Referenzvideos nie committen).

| ID | Datei (TikTok-ID) | Titel im Bild | Länge | Auflösung | harte Schnitte (Score > 0,25) | Lautheit |
|---|---|---|---|---|---|---|
| V1 | 7703197065077132575 | What if every person on Earth jumped at once? | 61,0 s | 1080×1920 | 5 (8,2 · 24,0 · 37,0 · 48,0 · 54,9 s) | −19,4 LUFS, LRA 5,9 |
| V2 | 7703004611669675295 | What if you trick-or-treated at every house on Earth? | 61,0 s | 1080×1920 | 1 (9,7 s) | −24,7 LUFS, LRA 4,3 |
| V3 | 7702903840730877215 | What if all the oceans drained? | 61,0 s | 1080×1920 | 8 | −24,1 LUFS, LRA 1,8 |
| V4 | 7694046833424764174 | What if lightning hit you? | 65,0 s | 720×1280 | 16 | −15,6 LUFS, LRA 1,5 |

**[B]** Alle vier nutzen die Gestaltung, die unser Stil B bereits hat: Würfel-/Low-Poly-Figuren, Titelfrage mit **einem farbigen Schlüsselwort**,
HUD links (Label in Versalien, große Serifenzahl, Unterzeile, Pill-Badge), eine kursive Untertitelzeile im unteren Drittel, kein Sprecher.
V1–V3 haben dieselbe Hauptfigur (roter Pullover) und enden mit „Part 2?“ auf schwarzem bzw. abgedunkeltem Bild.

## 1. Einzelanalysen

### V1 – „Everyone jumps at once“ (61 s)

- **Hook [B]:** Frame 0 bis ≈ 8 s: Straße, Hauptfigur (rot) mit Nachbarn, Titel, HUD „PEOPLE JUMPING 38“. Zeile „Everyone on Earth agrees to jump at
  exactly noon.“ (≈ 3,5 s), Countdown „3… 2… 1…“ (≈ 6–8 s), Sprung der Straße bei ≈ 8 s, „One street jumps. Nothing happens.“
- **Story/Spannung [B]:** Zähler 38 → 8,000,000,000 **exponentiell** (39, 49, 76, 145, 335, 887, 2.678, 8.393 …), während die Kamera ohne
  Schnitt aus Luftbild-Höhe auf ein Flickenteppich-Land zoomt, ein Quadrat „55 km wide“ erscheint und sich mit Menschen füllt
  („About the size of Rhode Island“), dann **Abstieg** in die Menge (≈ 24–29 s) bis Augenhöhe. Sprung aller (≈ 29,5 s), Erdkugel mit
  Ringen „And the Earth? It moves less than the width of an atom. The planet barely notices.“ (37–48 s).
- **Wendung [B]:** 48–54 s Rückkehr zur Hauptfigur in der Menge: „Everyone jumped… except him.“ – HUD springt auf **7,999,999,999**.
  Danach Zoom-out über die Menge, „Part 2?“.
- **Ton [B]:** gleichmäßiges leises Bett, **zwei** deutliche Lautheitsspitzen (Momentan −11,8 LUFS bei 29,5 s = Massensprung; −13,2 bei
  50,1 s = Wendung), sonst ≈ 8 dB leiser.
- **[I]** Der Zähler ist das Rückgrat: jede Kameraposition ist eine neue Größenordnung derselben Zahl. Die Pointe ist **eine einzige Ziffer**
  (…999) und wurde durch die rote Figur seit Frame 0 vorbereitet.

### V2 – „Trick-or-treat every house on Earth“ (61 s)

- **Hook [B]:** Frame 0: Haustür bei Nacht, Figur mit Eimer, Kürbisse, Titel, HUD „HOUSES VISITED 0“; „House number one.“ (≈ 3,5 s).
- **Story [B]:** Lichtspur der Figur verbindet Häuser: Straße („A whole street in ten seconds.“) → Viertel → Stadt („…then the next town,
  and the next.“) → **Nachterde mit leuchtender Spur um alle Kontinente** (≈ 25–35 s), Zähler exponentiell bis 2,3 Mrd. („At one door a second,
  that's 73 years nonstop.“). Konsequenz: Süßigkeitenberg („About 115,000 tonnes. A pile taller than a 12-storey building.“).
- **Wendung [B]:** „The very last house on Earth…“ – Rückkehr an eine Haustür, Zähler auf 2,300,000,000, „…belongs to a dentist.“ → „Trick.“ → „Part 2?“.
- **Schnitte [B]:** nur **ein** harter Schnitt in 61 s; alles andere sind Kamerafahrten (Ebene für Ebene höher). Ton sehr gleichmäßig (LRA 4,3).
- **[I]** Ringstruktur: Haustür → Erde → Haustür. Die Pointe ist ein Witz an der Ausgangsszene, nicht eine weitere Steigerung.

### V3 – „All oceans drained“ (61 s)

- **Hook [B]:** Frame 0: Figur steht hüfttief im Meer, Titel, HUD „SEA LEVEL 0 m · DAY 1“; ab ≈ 3,5 s „Day 1. The tide goes out…“, das Wasser
  sinkt sichtbar, Figur läuft los.
- **Story [B]:** Wanderung über den freigelegten Meeresboden mit fallendem HUD (−14 m Strand → −60 m Korallenriff → −250 m Schiffswracks →
  −729 m Kontinentalrand „Day 5“ → −4.000 m Erdkugel, „From space, the blue is disappearing.“ → −10.935 m „Day 30. The Mariana Trench.“).
- **Wendung [B]:** „…is all going down one hole.“ – Abfluss im Boden, dann ein **riesiger roter Stöpsel an einer Kette** („Someone pulled the plug.“),
  Figur steckt ihn zurück / Wasser kommt („Uh oh.“, Wolkenwand), „Part 2?“. Einzige große Lautheitsspitze am Ende (Wellenform).
- **[I]** Absurde, wörtliche Auflösung (Badewannen-Logik) als Lacher; vorbereitet durch die Frage „wohin fließt es?“.

### V4 – „Lightning hit you“ (65 s)

- **Hook [B]:** **Frame 0 zeigt den Einschlag** (Blitz trifft den Kopf, Lichtball), Unterzeile „0.003 seconds before…“; nach ≈ 2,5 s
  Glitch-Übergang zurück zu „vorher“: Fußballplatz im Regen, HUD „STORM DISTANCE 6.0 mi“, zählt herunter.
- **Story [B]:** Gewitter nähert sich (6,0 → 0,4 mi, „If you can hear thunder, you're close enough to be struck.“), Haare stellen sich auf
  (Nahaufnahme von hinten). Dann **HUD wechselt auf „TIME 0.0008 s“** und das Video läuft in extremer Zeitlupe: Leitblitz stufenweise,
  Gegenentladung aus dem Körper, Einschlag (≈ 0,031 s), „About 30,000 amps…“, Strom über die Haut, Donner, Nachschläge. „Everything you just
  watched took 0.2 seconds.“ → Figur liegt, „About 9 out of 10 … survive“, Lichtenberg-Figur auf der Haut, Erde „45 times every second“,
  Endkarte „When thunder roars, go indoors.“
- **Ton [B]:** lauter (−15,6 LUFS) und **rhythmisch** (Wellenform in ≈ 2-s-Blöcken), Spitzen alle ≈ 4–5 s.
- **[I]** Höhepunkt zuerst, dann „wie kam es dazu?“ – die Frage trägt das ganze Video. Zeitdehnung (0,2 s → 40 s) als Eskalation.

## 2. Vergleich

| Merkmal | V1 | V2 | V3 | V4 |
|---|---|---|---|---|
| Frame 0 | Alltag + Titel + HUD | Alltag + Titel + HUD | Prämissen-Schauplatz (im Meer) | **Höhepunkt** (Einschlag) |
| Erstes sichtbares Prämissen-Ereignis | ≈ 8 s (Sprung) | ≈ 3 s (Haus 1) | ≈ 3,5 s (Wasser sinkt) | 0 s |
| HUD-Größe / Spannweite | Personen 38 → 8·10⁹ | Häuser 0 → 2,3·10⁹ | Meeresspiegel 0 → −10.935 m | Entfernung 6 → 0,4 mi, dann Zeit 0,0008 → 0,2 s |
| Verlauf | exponentiell | exponentiell | fallend, tageweise | fallend, dann Zeitlupe |
| Maßstabsreise Person → Erde | ja, zurück zur Person | ja, zurück zur Person | ja (Erde bei ≈ 40 s), zurück zur Figur | ja (Erde am Ende) |
| Harte Schnitte | 5 | 1 | 8 | 16 |
| Pointe | „…except him“ (HUD −1) | „belongs to a dentist. Trick.“ | Stöpsel „Uh oh.“ | Faktenzeile + Sicherheitsregel |
| Ende | „Part 2?“ | „Part 2?“ | „Part 2?“ | Endkarte mit Faktzeile |
| Ton | leises Bett, 2 Spitzen | gleichmäßig | gleichmäßig, Spitze am Ende | rhythmisch, laut |

**Gemeinsamkeiten [B]:** (1) Eine Messgröße, die über **viele Größenordnungen** läuft; (2) die Kamera wandert **kontinuierlich** von der Person über
Straße/Stadt bis zur **Erdkugel** und zurück; (3) ein Hauptdarsteller in Signalfarbe, in jeder Größenordnung auffindbar; (4) kurze, zahlengetragene
Zeilen (≈ 10–12 pro Video, je 4–6 s sichtbar); (5) Pointe zurück im **Maßstab der Person**, als Witz/Umdeutung, ≈ 50–58 s; (6) „Part 2?“.
**Unterschiede:** Einstieg (V1–V3 klassisch mit Aufbau, V4 Höhepunkt zuerst), Schnittzahl (1–16), Tonmischung (sehr leise bis laut).

## 3. Abgleich mit unserem System

| Thema | Unser Stand (main) | Referenzen | Bewertung |
|---|---|---|---|
| HUD-/Titel-/Zeilengestaltung | identisches Formatvokabular (18.5) | gleich | **keine Änderung nötig** |
| Hook | 18.12: Beweis ≤ 2 s, Unmöglichkeitstest | V1–V3 bestehen den Test in 0–2 s **nicht**, V4 schon (Höhepunkt zuerst) | Hook-Typ „Höhepunkt zuerst“ fehlt in 18.12 |
| Messgröße | klein, linear/stufig (Akku 100 → 0 %, Tage 1 → 30) | Größenordnungen, exponentiell | **Builder kann keine Verdopplungsstufen** (Stufen nur linear) |
| Bildaufbau | 15–18 Beats an 5–7 **getrennten kleinen Orten**, Kamera-Vorlage je Beat | eine durchgehende Welt, Kranfahrt über Größenordnungen | **keine Kamera-Vorlage für Maßstabsfahrten** |
| Schnitte (gemessen) | Akku 9 harte / 13 Wechsel, no-sleep 5 / 10, last-goodbye 14 / 18 | 1–16 | kein grundsätzlicher Unterschied → Schnittregeln **nicht** ändern |
| Pointe/Ende | 18.7: vorbereitete Pointe, Endkarte, „Part 2?“ | gleich, aber Ringstruktur | durch Story umsetzbar, keine Regeländerung |
| Ton | −14 LUFS, Musikbett + Ereignisklänge | leise Betten, wenige große Spitzen (V1) | Regel 18.6 deckt das ab („Ruhe vor der Pointe“); Umsetzung, keine Regeländerung |

## 4. Entscheidung: welche Verbesserungen (und welche nicht)

**Umgesetzt (alle additiv, Architektur-Freeze 18.10 eingehalten – keine bestehende Schnittstelle geändert):**

| # | Änderung | Datei | Begründung |
|---|---|---|---|
| S1 | Kamera-Vorlage `crane`: Kranfahrt von (Ziel, Abstand, Höhe) zu (Ziel₂, Abstand₂, Höhe₂), log-gleichmäßig; `ratio` lässt den Blickpunkt exponentiell wandern | `pipeline/runtime/kit/camera.js` | Maßstabsreise ohne Schnitt (V1–V3) war mit den Vorlagen nicht baubar |
| S2 | HUD-Modus `geo` (Stufen mit gleichem Faktor) + `hud.decimals` je Label | `tools/build_timeline.mjs` | Exponentielle Zähler (V1/V2) – vorher nur gleich große Stufen |
| S3 | Hook-Typ `flashforward` (Beweis ≤ 2 s wie `proof`) | `tools/validate_production.mjs` | V4-Muster „Höhepunkt zuerst“; H8 bleibt für die **Pointe** und das End-Label in Kraft |
| S4 | Kit-Teile `paperStack`, `paperSheet`, `cloud`, `airliner`, `moon`; Pose `pointUp` | `kit/props_scale.js`, `kit/props.js` (Einbindung), `kit/human.js` | vom Thema benötigt (zulässig nach 18.10 c) |
| T | Tests für S1–S3 | `tests/test_experiment_scale.mjs` | |

**Bewusst verworfen:**

- Schnittzahl senken / Beat-Regeln lockern: unsere gemessenen Schnittzahlen liegen im Bereich der Referenzen (siehe 3). Kein Beleg für Nutzen.
- Leisere Mischung wie V2/V3 (−24 LUFS): Plattformen normalisieren; Guide 10 (−14 LUFS) bleibt. Übernommen wird nur die **Dynamik**
  (Stille vor dem Höhepunkt) – das erlaubt 18.6 bereits.
- Gleiche Hauptfigur/roter Pullover als Kanal-Markenzeichen: fremdes Erkennungsmerkmal; wir nutzen nur das Prinzip „Hauptfigur in kräftiger Farbe“.
- Themen der Referenzen (Massensprung, Halloween, Ozeane, Blitz) – nicht übernommen.
- Neue Pflichtregeln im Guide: **keine** – Ergebnisse erst nach Veröffentlichungsdaten (siehe 6).

## 5. Hypothesen, die die Produktion `productions/what-if-fold-paper-42-times/` testet

- **H-A** Eine Messgröße über viele Größenordnungen (0,1 mm → 439.805 km) erzeugt Eskalation ohne zusätzliche Handlungsstränge.
- **H-B** Kranfahrten zwischen den Stufen (Schulhof, Stadt, Weltraumrand) lesen sich als „weiter nach oben“ statt als neuer Ort.
- **H-C** Rückkehr an den Ausgangsort (Klassenzimmer) für die Pointe ist verständlicher als eine weitere Steigerung.
- **H-D** `flashforward`: Höhepunkt ab Frame 0 + Rücksprung hält den Einstieg besser als ein Aufbau-Einstieg.

Prüfbar **ohne** Veröffentlichung: nur Machbarkeit, Lesbarkeit und Regelkonformität (Abschnitt 6). Wirkung auf Zuschauerbindung: **nicht prüfbar**.

## 6. Ergebnis

Siehe `productions/what-if-fold-paper-42-times/LOG.md` (QA-Durchläufe) und `quality_review.md`; Zusammenfassung wird nach dem Rendern ergänzt.
