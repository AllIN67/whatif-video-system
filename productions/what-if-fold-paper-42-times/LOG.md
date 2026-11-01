# Produktionsprotokoll – What if you folded paper 42 times?

| Feld | Wert |
|---|---|
| Slug | `what-if-fold-paper-42-times` |
| Produktionsstil | B – Rezept B1 (mit Experiment-Bausteinen „Maßstabsreise“, Branch `experiment/reference-insights-2026-11`) |
| Sprache | en |
| Status | ENTWURF |
| Style-Guide-Version | 2.2 (unverändert) + Experiment-Bausteine laut `EXPERIMENT_REFERENCE_INSIGHTS.md` |
| Beat-Sheet / Freigabebogen | `beats.json` / `quality_review.md` |
| Git-Commit des Renders | (siehe Abschnitt 4) |
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
- Dauer, Auffälligkeiten: (nach dem Rendern)

## 5. QA-Durchläufe

(nach dem Rendern)

## 6. Hörprüfung (Mensch)

- Offen – Claude kann Ton nicht hören. Bitte Hörprüfung durch den Auftraggeber.

## 7. Bekannte Einschränkungen

(nach dem Rendern)
