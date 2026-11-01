# Produktionsprotokoll – What if you couldn't sleep for 30 days?

| Feld | Wert |
|---|---|
| Slug | `what-if-no-sleep-30-days` |
| Produktionsstil | B – Rezept B1 (Eskalations-Zähler); Testvideo für den Hook-Standard 18.12 (Auftrag 2026-10-31) |
| Sprache | en |
| Status | siehe Abschnitt 5 und `quality_review.md` |
| Style-Guide-Version | 2.2 |
| Beat-Sheet / Freigabebogen | `beats.json` / `quality_review.md` |
| Git-Commit des Renders | siehe `render/run_log.json` |
| Länge | 61,4 s · 1080×1920 · 30 fps |

## 0. Themenprüfung

Thema ist mit dem Baukasten umsetzbar: alle Orte vorhanden (Schlafzimmer, Büro, Klassenzimmer, Küche, Straße, Park), Gedankenblase mit
„Z“-Piktogramm vorhanden. Fehlend und ergänzt (Abschnitt 4): Schaf, Augenringe, Klänge „bleat“/„alarm“. Kein Grund für ein Ersatzthema.
Inhaltliche Grenze: 30 Tage ohne Schlaf sind real nicht überlebbar bzw. nicht dokumentiert → als Szenario erzählt („What if“), reale
Zahlen nur als Anker (Abschnitt 2), keine medizinischen Behauptungen.

## 1. Entscheidungen

### Hook-Entwurf (Guide 18.12 H10 – vor dem Beat-Sheet)

| # | Hook-Typ | Frame 0 (was sieht man ohne Text?) | Beweis-Ereignis (≤ 2 s / Geheimnis ab 0) | Frage bei 3 s | zurückgehalten | H1–H9 erfüllt? |
|---|---|---|---|---|---|---|
| 1 | process | Nacht, Figur im Bett, über ihr eine „Z“-Blase, ein Schaf **mitten im Sprung über das Bett**; HUD „SHEEP COUNTED“ zählt ab Frame 0 | 0,5 s: Z-Blase platzt, Augen springen auf; 1,4 s: zwei Schafe zugleich | „Wie lange hält ein Körper ohne Schlaf durch – und was geht zuerst kaputt?“ | Rekord, Halluzinationen, Tag 30, Wecker-Pointe | ja: Bild ohne Prämisse unmöglich (Schafe im Zimmer, platzende Schlafblase); Einsatz über Zähler + Augen; Schäfchenzählen ist weltweit lesbar |
| 2 | process (Zeitraffer) | Figur sitzt reglos im Bett, hinter ihr rasen Tag und Nacht durchs Fenster, Wecker-Ziffern drehen | 0,3 s: erster Sonnenaufgang, Figur hat sich nicht bewegt | „Schläft er nie wieder?“ | wie 1 | teilweise: Zeitraffer ist ein Filmmittel, kein Prämissen-Bild (ohne Prämisse sähe ein Zeitraffer einer wachen Person ähnlich aus); Fenster im 9:16-Bild klein; schneller Hell-Dunkel-Wechsel verletzt die Blitzregel (6.2/7.2) |
| 3 | proof | Großraumbüro: alle Kollegen kippen gleichzeitig schlafend auf die Tische, Z-Blasen über allen – nur die Figur sitzt hellwach | 1,0 s: alle Blasen erscheinen, ihre platzt | „Warum kann nur ich nicht schlafen?“ | wie 1 | teilweise: ohne Titel liest es sich eher als „alle anderen wurden betäubt“ (Prämisse betrifft andere); Einstieg = Ort Büro/Alltag |

- **Gewählt: # 1** – das einzige Bild, das ohne Text eindeutig „kann nicht schlafen“ sagt (Schäfchenzählen ist ein weltweit bekanntes
  Einschlaf-Motiv) und zugleich unmöglich ist (Schafe springen wirklich durchs Zimmer). Die platzende Z-Blase wird zum wiederkehrenden
  Zeichen „Schlaf ist blockiert“ (Büro, Park) und darf am Ende endlich stehen bleiben – Aufbau für die Pointe. Ansatz 3 wird nicht
  verworfen, sondern als Eskalation genutzt (Klassenzimmer, Tag 4: alle schlafen, sogar die Lehrerin).
- **Hook-Typ / Eröffnungsbild der letzten Produktionen:** Akku-Video (2026-10-30) – Typ „process“ dem Etikett nach, tatsächlich
  Alltagseinstieg (Figur wacht auf, HUD −1 %). Hier: ebenfalls Schlafzimmer + Bett, aber mit Anomalie ab Frame 0. **Wiederholung des
  Ortes begründet:** Das Bett ist für dieses Thema der Ort der Prämisse selbst, nicht Kulisse; Kamera und Ereignis unterscheiden sich.
- **Prämissen-Ereignisse 0–15 s** (Zeit · Ereignis · Art · Steigerung):
  0,5 Z-Blase platzt (visible) · 1,4 zwei Schafe (visible, mehr) · 4,6 Schafherde (visible, Raum füllt sich) · 6,6 Morgendämmerung –
  ganze Nacht wach (visible, Zeit) · 8,1 Augenringe erscheinen (visible, Körper) · 8,0 Tageszähler (hud) · 12,6 / 14,2 Kopf sackt im
  Büro weg, Blase platzt (visible, Öffentlichkeit, persönlich). Kulisse ohne Prämissenbezug: Aufsetzen, Wecker, Schlag auf den Wecker
  (Wecker = Aufbau der Pointe).

### Story

- **Frage:** „What if you couldn't sleep for 30 days?“ (8 Wörter, Hervorhebung *sleep*).
- **HUD (5 Labels):** SHEEP COUNTED 0 → 1.000 (Nacht 1) → DAYS WITHOUT SLEEP 1 → 7 → (Rekord-Label) 19 → 25/28 → SLEEP RETURNS IN
  24 → 0 h → TIME ASLEEP 0 → 60 s. Wert ändert sich in jedem Beat.
- **Bogen (Hoffnung/Rückschlag):** Schafe/Nacht 1 → Wecker Tag 1 → Büro: Einnicken scheitert → Klasse schläft, du nicht → Hoffnung:
  Zeit für alles (Tag 7) → Rekord (Tag 19) → Halluzination: Menge wird zu Schafen → Verwirrung (Handy im Toaster) → Einsamkeit (Stadt
  schläft) → Körper bettelt (Park) → Countdown: Schlaf kehrt zurück → einschlafen → **Pointe: 60 s später klingelt der Wecker**
  (Aufbau: Wecker an Tag 1) → Endkarte „Would you hit snooze? / Part 2?“.
- **Beats:** 15 (2,2–5,4 s), 6 Orte, Gefühle shock, tired, angry, worried, happy, laugh, panic, sad, relief.
- **Abweichungen vom Style-Guide:** keine bekannt (Validator-Ergebnis Abschnitt 5).

## 2. Fakten und Quellen

| Aussage/Zahl | Quelle | Prüfstatus |
|---|---|---|
| Längste dokumentierte Wachphase ≈ 18,9 Tage (453 h 40 min, 1986); HUD „RECORD: 18.9 DAYS (1986)“, Zeile „Day 19. Longer than anyone on record.“ | Wikipedia „Randy Gardner (record holder)“ (nennt den Rekord von 1986); Guinness zertifiziert solche Versuche nicht mehr | Websuche 2026-10-31; Primärquelle (Guinness) nicht eingesehen |
| Bekanntester Fall: 264,4 h (≈ 11 Tage), 1963/64 – bewusst **nicht** als „Weltrekord“ verwendet | NPR 2024-01-28 „Lessons from sleeplessness…“; Gulevich et al., Arch Gen Psychiatry 1966 | Websuche; Artikel nicht im Volltext gelesen |
| Halluzinationen bei langem Schlafentzug („Then your brain starts seeing things.“) | Waters et al. 2018, Front. Psychiatry 9:303 (Review: Wahrnehmungsstörungen ab 24–48 h, komplexe Halluzinationen nach 48–90 h) | Abstract per Websuche |
| 30 Tage ohne Schlaf, Wecker nach 60 s Schlaf | Fiktion (Szenario) | – |

## 3. Assets und Lizenzen

| Asset | Herkunft | Lizenz |
|---|---|---|
| Figuren, Orte, Requisiten (inkl. neuem Schaf) | Baukasten `pipeline/runtime/kit/` (Code) | eigene Erzeugung |
| Schriften Fraunces, Montserrat | @fontsource (npm) | SIL OFL 1.1 |
| Musik | `tools/music_synth.py` | eigene Erzeugung |
| Klänge (inkl. neu „bleat“, „alarm“) | `tools/sfx_synth.py` | eigene Erzeugung |

## 4. Baukasten-Ergänzungen (ohne Schnittstellenänderung)

- `props.sheep()` – Würfel-Schaf mit `userData.gallop(p)` / `userData.tuck(k)`.
- `human().fatigue(k)` – Augenringe 0…1 (Übermüdung am Körper sichtbar; Lehre aus dem Akku-Video: „Leben“ war nur eine Zahl).
- `sfx_synth.py`: `bleat` (Schaf), `alarm` (Wecker-Piepen).

## 5. Render und QA

Vorschau vor dem Rendern (11 Runden `tools/still.mjs`, `stills/`) – gefundene und behobene Fehler: Schafe oben aus dem Bild bzw.
hinter dem Titel; Schaf-Modell (Beine vom Körper getrennt, Fell überstrahlt); in 1/2/3 s kein Schaf im 9:16-Bild (Strom verdichtet,
alle 0,42 s); Blase im Büro von hinten (zur Kamera gedreht); Figur in der Wecker-Szene nicht im Bild; Mitschüler verdeckt POV; Kopf in
Nahaufnahme angeschnitten; Kopf im Park außerhalb des Bildes; Taube am falschen Körperende.

| Durchlauf | Commit | `video_qa.py` | Befund | Ursache | Korrektur |
|---|---|---|---|---|---|
| 1 | 178a5ab | **FAIL** | Einstellungen < 4 Frames bei 19,73 / 42,6 / 46,93 s (Streifen: saubere Abblenden, kein Blitzbild) | Abblende dunkelt nur bis 60 %; Folgeszene viel dunkler/heller → Detektor erkennt Abblende-Beginn (3 Frames YDIF > 14) und Schnitt getrennt | Küche Tag 7 hell (interior); Außen→Außen als Whip; Nacht-Totale mit Gang (Monotonie 38,5–42,5 s); Drehung langsamer |
| 2 | 6e52346 | **FAIL** | 42,53 / 42,6 / 46,93 s (Whips: sauber, aber Ankunft in dunkler Szene ohne Unschärfe-Folge) | asymmetrische Differenzfolge am Whip | Abendpark (dusk, Belichtung 0,88), Nahaufnahme von oben, 6-Frame-Abblenden; **vorab an Einzelframes gemessen**: alle Abblende-Schritte ≤ 9,6 (< 14) |
| 3 | 186af2d | REVIEW | Sichtprüfung: Figur dreht sich bei 9,7–10,5 s aus dem Bild (Wecker), Küche 34–38 s halb angeschnitten | 9:16-Bildwinkel; Pose „reach“ kippt nach vorn | Arm-Ausholen ohne Vorbeugen; Kameraziel verschoben |
| 4 | 4975ef7 | REVIEW | keine Fehler; REVIEW-Meldungen eingestuft (quality_review A) | – | – |

- Gesichtet in Durchlauf 4: `sheet_01–03`, `hook.jpg`, Streifen der geänderten Bereiche (8–11,7 s, 33,5–38,3 s); in Durchlauf 3: `shots.jpg`
  und **alle 94 Streifen** (unveränderte Bereiche identischer Code).
- Bekannte Restschwächen: Gesicht im Hook und in der Pointe klein; Wecker-Szene im Profil; „Fenster erlöschen“ (38–42 s) subtil;
  bei 54 s ist das Erinnerungs-Schaf oben angeschnitten; Raum ohne Decke (dunkler Streifen oben im Hook).
- Auslieferung: `render/final.mp4` (37,0 MB, 61,4 s) am 2026-11-01 per `SendUserFile` übergeben, Übergabe bestätigt.

## 6. Hörprüfung (Mensch)

- ausstehend (beim Nutzer angefragt). Zu prüfen: Blöken/Wecker-Klänge (neu), „pop“ bei 11,8 / 16,1 / 34,3 / 57,2 s (gemessen +45…+55 ms),
  verdeckte Klänge 12,2 / 22,4 s, Stille vor der Pointe 56,2–57,0 s.

## 7. Nach Veröffentlichung (7 Tage)

| Plattform | Aufrufe | Länge | Ø Wiedergabe s | Abschlussrate | nach 2 s % | nach 5 s % | 50 %-Punkt (s) | Likes-Spitze (s) | Shares/1k | Kommentare/1k |
|---|---|---|---|---|---|---|---|---|---|---|

- Hook-Auswertung gegen das Akku-Video (≈ 75 % nach 2 s, 50 %-Punkt ≈ 14 s): offen.
