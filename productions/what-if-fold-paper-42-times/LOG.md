# Produktionsprotokoll – What if you folded paper 42 times?

| Feld | Wert |
|---|---|
| Slug | `what-if-fold-paper-42-times` |
| Produktionsstil | B – Rezept B1 (mit Experiment-Bausteinen „Maßstabsreise“, Branch `experiment/reference-insights-2026-11`) |
| Sprache | en |
| Status | QUALITÄT GEPRÜFT (Render 2) – nicht FREIGEGEBEN, Hörprüfung offen |
| Style-Guide-Version | 2.2 (unverändert) + Experiment-Bausteine laut `EXPERIMENT_REFERENCE_INSIGHTS.md` |
| Beat-Sheet / Freigabebogen | `beats.json` / `quality_review.md` |
| Git-Commit des Renders | Render 1: `4156d0f` · Render 2 (ausgeliefert): `f21bd07` |
| Länge | 62,4 s |

**Experiment-Kontext:** Diese Produktion testet Erkenntnisse aus vier Referenzvideos (Analyse: `EXPERIMENT_REFERENCE_INSIGHTS.md`
im Repository-Wurzelverzeichnis des Branches). Sie liegt ausschließlich auf dem Experiment-Branch; `main` bleibt unverändert.

## 1. Entscheidungen

### Hook-Entwurf (Guide 18.12 H10 – vor dem Beat-Sheet)

| # | Hook-Typ | Frame 0 (was sieht man ohne Text?) | Beweis-Ereignis | Frage bei 3 s | zurückgehalten | H1–H9 erfüllt? |
|---|---|---|---|---|---|---|
| 1 | `flashforward` (neu, Experiment; Vorbild Referenz V4 „lightning“) | Weltraum: leuchtende weiße Säule ragt aus der Erde bis zum Mond; HUD „PAPER THICKNESS 219,902.3 km · FOLD 42“ | 0,4 s: Säule schießt am Mond vorbei, Blitz, HUD springt auf 439,804.7 km | „Wie kommt ein Blatt Papier bis zum Mond?“ | wie es dorthin kommt (Tisch, Decke, Stadt, Himmel) und die Pointe (Hausaufgabe Papierflieger) | H1 ✅ (Bild unmöglich), H3 ✅ 0,4 s, H4 ✅ HUD + Bild, H5 ✅, H6 ✅ (Rücksprung + Faltungen + Faustschlag + Säule über Kopf bis 15 s), H8: zeigt den **Höhepunkt**, nicht die Pointe – bewusste Abweichung, siehe unten |
| 2 | `process` | Klassenzimmer, Blatt ist schon 8× gefaltet, Figur schlägt mit der Faust drauf, Block faltet sich trotzdem (1,2 s) | Faustschlag-Faltung | „Wie weit geht das?“ | Mond, Pointe | H1 ⚠️ – Unmöglichkeitstest schwach: ein Mensch, der auf einen Papierblock drückt, sieht auch ohne Prämisse so aus; dass Falte 8 unmöglich ist, weiß nicht jeder |
| 3 | `countdown` | Klassenzimmer, HUD „FOLDS TO THE MOON: 42“ ab Frame 0 | Falte 1 bei 1 s | „Schafft er 42?“ | alles Sichtbare | H1 nur über HUD; erstes **sichtbar unmögliches** Bild erst bei ≈ 11 s → H6 knapp |

- **Gewählt: #1 flashforward.** Begründung: Das Thema hat genau ein Bild, das den Unmöglichkeitstest sofort besteht (Papier am Mond).
  In der Referenz V4 trägt dieses Muster (Höhepunkt ab Frame 0, dann „vorher“) den Einstieg; #2/#3 zeigen bis ≈ 11 s nur Alltägliches.
  Der Rücksprung (HUD zählt geometrisch von 439,804.7 km auf 0,1 mm zurück) ist selbst ein Prämissen-Ereignis und verankert die Messgröße.
- Hook-Typ / Eröffnungsbild der letzten 3 Produktionen: Akku-Video – Alltag/Aufwachen (Gegenbeispiel, kein 18.12-Typ) · no-sleep-30-days –
  `process` (Z-Blase platzt) · one-argument-last-goodbye – kein hook-Block (vor 18.12). → `flashforward` ist neu, keine Wiederholung.
- Prämissen-Ereignisse 0–15 s: 0,4 ff_touch (visible) · 1,3 ff_moon_glint (visible) · 2,3 rw_start (visible, Säule schrumpft) · 3,75 rw_land (hud) ·
  5,8 teacher_draws (hud, Kulisse mit Pointe-Vorbereitung) · 7,6–9,3 Falten 5–7 (HUD-Stufen) · 10,1 stuck (hud) · 11,25 slam_fold (visible, Falte 8
  per Faustschlag – größer als die Handfaltungen) · 12,5 class_turns (visible) · 14,1 stack_jump (visible). Jede Stufe größer/näher: Mond → Tisch →
  unmögliche Falte → Säule über dem Kopf.

- **Thema, Frage, HUD-Größe, Pointe:** „What if you folded paper 42 times?“ (7 Wörter). HUD = Papierdicke in mm → m → km (Wert intern in mm,
  Einheit je Label über `scale`), jede Faltung = HUD-Stufe mit Papierklang (`tick: paper`, Modus `geo` = genau Verdopplung). Pointe: Die Lehrerin
  fragt nach dem Papierflieger (an der Tafel ab 5,8 s vorbereitet) – „It’s on the Moon.“
- **Beats:** 19 Beats (Guide: 15–18 – Abweichung, s. u.), 6 Orte (Weltraum, Klassenzimmer, Schulhof, Stadt, Himmel, Straße), Gefühle
  smug → neutral → angry → shock → happy → shock → laugh → worried → smug; Kamera-Vorlagen still, crane (neu), push, close, low, orbit, pov, pull, high.
- **Struktur aus der Referenzanalyse (Hypothesen H-A…H-D, siehe EXPERIMENT_REFERENCE_INSIGHTS.md):**
  H-A Maßstabsreise mit einer Messgröße über 13 Größenordnungen (0,1 mm → 439.805 km) · H-B Kranfahrten statt Schnitt zwischen den Stufen (Schulhof,
  Stadt, Weltraumrand) · H-C Rückkehr in den Ausgangsort für die Pointe (Ringstruktur) · H-D Höhepunkt ab Frame 0 (flashforward).
- **Neue Kit-Teile:** `kit/props_scale.js` (paperStack, paperSheet, cloud, airliner, moon), Kamera-Vorlage `crane` (camera.js), HUD-Modus `geo` und
  `hud.decimals` je Label (build_timeline.mjs), Hook-Typ `flashforward` (validate_production.mjs). Alle additiv, bestehende Schnittstellen unverändert.
- **Abweichungen vom Style-Guide** (Regel · Abweichung · Begründung):
  - 18.12 H8 „Endzustand nicht vor 15 s“ · Frame 0 zeigt den Höhepunkt (Säule am Mond) · Kern des getesteten Hook-Typs `flashforward`; die **Pointe**
    (Hausaufgabe) und das letzte HUD-Label bleiben zurückgehalten. Vom Validator nicht beanstandet (prüft Pointe + End-Label).
  - 18.2 15–18 Beats · 19 Beats · die Maßstabsreise braucht je Größenordnung eine Stufe; Beatlängen bleiben 1,8–4,6 s.
  - Maßstab: Breite der Säule ist je Ort zur Lesbarkeit übertrieben (Tisch 5 cm, Schulhof 1 m, Stadt 12 m, Himmel 30 m, Weltraum ≈ 0,8 Einheiten);
    Erde–Mond-Abstand im Weltraum-Set verkürzt dargestellt (Mond bei 150 statt 603 Erdradien/10). Die HUD-Zahlen sind exakt (0,1 mm · 2ⁿ).
  - Die reale Grundfläche eines 42-mal gefalteten Blatts wäre mikroskopisch; die Säule behält ab Falte 5 die Grundfläche 52 × 37 mm (Prämisse:
    „du kannst falten“). Gedankenexperiment, keine Behauptung über reales Papier.

## 2. Fakten und Quellen

| Aussage/Zahl | Quelle |
|---|---|
| Papier 0,1 mm dick; Dicke nach n Faltungen = 0,1 mm · 2ⁿ (Falte 42 = 439.804,65 km) | Rechnung; 80-g/m²-Kopierpapier ≈ 0,1 mm (Herstellerangaben, Größenordnung) |
| Falte 7 von Hand praktisch nicht mehr möglich („paper refuses“) | verbreitete Faustregel „7 Faltungen“; Rekord (Britney Gallivan 2002) 12 Faltungen mit 1,2 km langem Spezialpapier – das Video sagt nur „Paper refuses“ |
| Höchstes Gebäude 828 m (Burj Khalifa), Falte 23 = 838,9 m | Burj Khalifa, offizielle Höhe 828 m |
| Reiseflughöhe von Verkehrsflugzeugen ≈ 10–12 km, Falte 27 = 13,4 km | allgemein bekannt (Luftfahrt) |
| Grenze zum Weltraum 100 km (Kármán-Linie), Falte 30 = 107,4 km | FAI-Definition |
| Erddurchmesser 12.742 km, Falte 37 = 13.743,9 km | mittlerer Erddurchmesser |
| Mittlere Entfernung Erde–Mond 384.400 km, Falte 42 = 439.804,7 km | NASA Moon Fact Sheet |

## 3. Assets und Lizenzen

| Asset | Herkunft | Lizenz | Nachweis |
|---|---|---|---|
| Figuren, Requisiten, Orte | Baukasten `pipeline/runtime/kit/` (eigener Code) | eigen | – |
| Erdkugel-Land | `kit/assets/land_50m.json` (Natural Earth) | gemeinfrei | wie bisher |
| Musik, Klänge | `tools/music_synth.py`, `tools/sfx_synth.py` (synthetisch) | eigen | – |
| Schriften | Fraunces, Montserrat (@fontsource) | OFL | wie bisher |

## 4. Render

- Befehl(e): `node pipeline/run.mjs --production productions/what-if-fold-paper-42-times`
- Render 1: ≈ 32 min (1872 Frames), QA FAIL.
- Render 2: 1952 s Frames (≈ 1,04 s/Frame), Mix −14,1 LUFS / TP −1,2 dBTP, QA REVIEW. Ausgeliefert per SendUserFile (Bestätigung erhalten).
- Abweichung 18.11 (Warnung HUD-Änderung 0,95): Endbild-Beat `end` hält den Wert bewusst (Endkarte); alle anderen 18 Beats ändern den HUD.

## 5. QA-Durchläufe

### Durchlauf 1 – 2026-11-01 (Render 1, `4156d0f`)

- `video_qa.py`: **FAIL** – Schwarzbilder (37,67–38,6), (46,4–48,1); Einstellung < 4 Frames 41,733.
- Kontaktbögen sheet_01–03 ✅, Strip 12,933 ✅ (übrige Strips wegen Neu-Render erst in Durchlauf 2 vollständig).

| Zeitpunkt | Fehler | Ursache | Korrektur |
|---|---|---|---|
| 37,7–38,6 | Bild schwarz, Säule verschwindet | Kranfahrt 3,5 → 97,5 km in 3,6 s: Bewegungsunschärfe + Schwenk verwischen die Säule; Himmel auf Schwarz geblendet | Kran nur bis 18 km, linear; Randhimmel Nachtblau `0x0d1a3c`; Säule leuchtet beim Verdunkeln |
| 46,4–48,1 | fast schwarzes Bild | Kamera zu nah: Mond über, Säulenspitze unter dem Bildausschnitt | Abstand 170, Ziel y 90 → Mond oben, Spitze wächst von unten ins Bild |
| 41,73 | 2-Frame-Einstellung | Abblende helle Straße → schwarzes All (Guide 18.2) | harter Schnitt |
| 21–23 | Kinder nicht im Bild, kids_point unsichtbar | Kranstart zu nah (5 m) | Start 12 m Abstand |
| 31–32,6 | Himmel ohne Flugzeug | Flugbahn begann außerhalb des Bildes | Start x 120, 60 m/s |
| 12,8–13,1 | Arm durchdringt Papierblock | Posenübergang recoil → sit führt den Arm über den Tisch | Pose recoil bleibt, nur Gefühl wechselt |

### Durchlauf 2 – 2026-11-01 (Render 2, `f21bd07`, ausgeliefert)

- `video_qa.py`: **REVIEW**, keine FAIL-Meldung (Bericht `qa/report.md`). Schwarzbilder: keine. Kurz-Einstellungen: keine. Monotonie-Kandidaten: keine.
- Kontaktbögen sheet_01–03 ✅ · shots.jpg ✅ · Bildstreifen: alle 43 ✅ (als 4 Montagen gesichtet).
- REVIEW-Bewertung: siehe `quality_review.md` A (alle beabsichtigt bzw. nur hörbar prüfbar).
- Verbleibende Schwächen (nicht behoben, bewusst kein drittes Rendern): 46,4–48,6 s bildlich karg; Lehrerin 53–56 s oben angeschnitten,
  Gesicht kaum sichtbar; Kinder im Schulhof (21 s) klein; HUD liegt in Nahaufnahmen über der Brust der Figur; Weltraum-/Himmel-Beats ohne Figur.

### Vergleich mit den bisherigen Produktionen (gemessen bzw. gesehen, keine Wirkungsaussage)

| Merkmal | Akku (Referenz 18.11) | no-sleep | fold-paper (neu) |
|---|---|---|---|
| Frame 0 | Aufwachen (Gegenbeispiel 18.12) | Z-Blase (process) | Papier am Mond (flashforward) |
| Erstes sichtbar unmögliches Bild | bis 14 s keines (nur HUD-Abzüge, Analyse 18.12) | ≈ 1 s (Beweis-Ereignis laut Beat-Sheet) | 0 s |
| HUD-Spannweite | 100 → 0 % | 1 → 30 Tage | 0,1 mm → 439.805 km (13 Größenordnungen) |
| Orte / Maßstabsstufen | 7 / 1 | 6 / 1 | 6 / 6 (Tisch, Raum, Gebäude, Stadt, Himmel, Erde–Mond) |
| Harte Schnitte / Einstellungswechsel | 9 / 13 | 5 / 10 | 16 / 22 |
| Median Einstellungslänge | 3,78 s | 4,0 s | 3,0 s |
| Lautheit / LRA | −14,2 / 10,9 | −14,1 / 6,4 | −14,1 / 8,2 |
| Ereignisse/Beat · Klang-Anteil | 1,5 · ≥ 0,9 | – | 1,9 · 1,0 (Plan) |
| Figuren im Bild | in allen Beats | in allen Beats | in 10 von 19 Beats |
| QA-Durchläufe bis REVIEW | 2 | 4 | 2 |


## 6. Hörprüfung (Mensch)

- Offen – Claude kann Ton nicht hören. Bitte Hörprüfung durch den Auftraggeber.

## 7. Bekannte Einschränkungen

- Wirkung von H-A…H-D auf Zuschauerbindung ohne Veröffentlichungsdaten **nicht** belegbar.
- Ton nicht gehört (Klangfarbe, Mischung, Paper-Ticks, Stille vor Falte 42).
- Maßstab schematisch (Säulenbreite, Erde–Mond-Abstand), HUD-Werte exakt.
- Ohne Titel ist in 0–3 s nicht erkennbar, dass die Säule Papier ist (H2 teilweise).
