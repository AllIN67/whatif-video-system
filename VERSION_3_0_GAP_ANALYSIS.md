# Version 3.0 – Lückenanalyse gegen die 6 Videos

Grundlage: `VIDEO_ANALYSIS_6_VIDEOS.md`, `VIDEO_COMPARISON_6_VIDEOS.md`. Kennzeichnung: **[M]** Messung · **[B]** Beobachtung · **[E]** Einschätzung · **[H]** Hypothese.

## 0. Was hier „Version 3.0“ ist

- **Annahme:** Version 3.0 = aktueller Stand von `main` @ `36a5b69` = Guide Version 2.2 (Abschnitt 18 inkl. Hook-Standard 18.12) **plus** die gemergten Experiment-Teile S1–S4 (`crane`, HUD-Modus `geo`, Hook-Typ `flashforward`, Maßstabs-Requisiten; `EXPERIMENT_REFERENCE_INSIGHTS.md` 4). Eine Datei oder ein Tag „3.0“ existiert im Repository nicht. Bitte bestätigen oder korrigieren.
- A1/A2 tragen im Dateinamen „2.0“ und liegen **nicht** in `productions/` → ihre `beats.json`/LOG sind nicht einsehbar. Verglichen wird daher (a) das sichtbare Ergebnis von A1/A2 und (b) was das System heute kann und vorschreibt.
- Geprüfte Teile: `WHATIF_STYLE_GUIDE.md` 16–18, `pipeline/runtime/kit/` (camera, core, index, human), `pipeline/runtime/stage.js`, `tools/music_synth.py`, `tools/sfx_synth.py`, `tools/build_timeline.mjs`, `tools/validate_production.mjs`, `templates/quality_review.md`, `EXPERIMENT_REFERENCE_INSIGHTS.md`.

## 1. Abgleich Bereich für Bereich

| Bereich | Version 3.0 (Regel / Fähigkeit) | Befund aus den 6 Videos | Bewertung |
|---|---|---|---|
| **Hook-System** | 18.12: Unmöglichkeitstest, Beweis ≤ 2 s, Hook-Typen `proof/process/countdown/mystery/flashforward`, 3 Entwürfe, Prüfung H | B2 (process, 0,2 s), A1 (proof, 1,8 s) bestehen. C1/C2 erfüllen den Test über **persönlichen Einsatz aus Ich-Sicht** (Karte wird dir zugeschoben; du stehst am Abgrund) – dieser Hebel ist in 18.12 nicht beschrieben. A2 besteht formal (Blasen 0,6 s), wirkt aber nicht (Blasen klein, keine Frage, Bewegung 0,48/0,58 [M]). | **gut im Prinzip**, Lücke: H4 „Einsatz“ wird nur als Text-Feld geprüft; **Perspektive/„du“** fehlt als Hook-Hebel |
| **Story-Architektur** | 16.1 B1 „Eskalations-Zähler“, 16.2 B2; 18.7 Hoffnung/Rückschlag, vorbereitete Pointe | Referenzen zeigen **fünf** Formen (Comparison 5). C1 (Ritual + doppelte Uhr) und C2 (Überlebensgeschichte mit Zeitsprung) passen nicht in B1/B2. A1 (Gag-Reihung) erfüllt B1 formal, hat aber keinen akkumulierenden Einsatz. A2 driftet von der Prämisse weg (Gedankenlesen → Ruhm). | **Lücke:** Regeln prüfen Ereignisdichte, nicht **Einsatz-Kontinuität** („jeder Beat beantwortet die Titelfrage, HUD misst den Einsatz“); nur 2 Rezepte |
| **HUD** | 18.5 eingefroren: Gestaltung, Signalfarbe, ≥ 70 % Wertänderung, Akzente | B/C nutzen dasselbe Vokabular – **gut**. C1 weicht ab (Geldzahl groß/grün/Kontur, Stempel PURCHASED), C2 nutzt Ort/Uhrzeit, dann DAY/WEEK. A1-HUD zählt Gags (Ereigniszähler statt Einsatz). | **gut**; Lücke nur inhaltlich (Was misst das HUD?) |
| **Kamera-System** | `push, pull, close, orbit, low, high, pov, track, crane, still`; nie gleiche Vorlage hintereinander; ≥ 4 Bildgrößen | Vorlagen-Vielfalt in A gut (viele Bildgrößen). **Ich-Perspektive mit eigenem Körper** (C1/C2 Kern-Mittel) ist nicht baubar: `pov` ist nur eine Augenposition mit Wackeln, es gibt **kein Hände-/Arme-Rig** an der Kamera (einziges POV-Teil: großes Handy in `props.js`). Whips der Referenzen haben Bewegungsunschärfe; unsere Pipeline rendert ohne Unschärfe. | **Lücke:** POV-Körper fehlt; keine Bewegungs-/Tiefenunschärfe |
| **Animationsmöglichkeiten** | `act()` mit 25+ Posen, 11 Gefühle, Überblendungen | Mimik/Posen in A gut lesbar ([B] A1 Schreck, Jubel; A2 Sorge). C2 braucht Ganzkörper-Ereignisse aus Ich-Sicht (fallen, unter Wasser, liegen) – als Kamera-Choreografie, nicht als Figur. | **gut**; Lücke liegt bei Kamera/POV, nicht bei der Figur |
| **Szenenaufbau / Orte** | 7+ Orte (`places.*`), `crowd(n)`, ≥ 5 Orte, Vorder-/Mittel-/Hintergrund | A-Orte sind **leer und klein** (einfarbige Wände, 1–5 Figuren). C zeigt Masse/Weite/Glanz in fast jedem Beat (Stadion mit Tausenden, Hunderte Ferraris). `crowd(n)` erzeugt **vollständige Einzelfiguren** (kein Instancing) → große Mengen praktisch nicht machbar. Keine Massen-Requisiten (Autofeld, Tribüne, Skyline-Kulisse). | **wesentliche Lücke:** Weltdichte / Schauwert |
| **Licht / Look** | `applyLook` 9 Stimmungen, ACES-Tonemapping, PCF-Schatten, Nebel, Hemisphärenlicht | A: weich und gleichmäßig, kaum Glanz, keine Atmosphäre. B1/C: Dunst, Gegenlicht, Glanz auf Wasser, Neon. Kein Post-Processing (Bloom, Tiefenschärfe, Bewegungsunschärfe) im Renderer. | **Lücke:** Atmosphäre/Glanz; Post-Processing würde die eingefrorene Pipeline berühren |
| **Sounddesign** | 18.6: Musikbett (pulse/drive/drive_hi/calm/warm/sad/silence), Ereignisklänge (38 Klänge, alle synthetisch), Ruhe vor der Pointe, −14 LUFS | Technik (Synchronität, Lautheit) solide. Aber [M]: A-Musik 64–71 % Energie < 100 Hz, 0,9–7,2 % bei 2–8 kHz, **keine Stille** (0 %), Dynamik 21–23 dB. C: breitbandig, Stille 0,9–6 %, Dynamik 30–48 dB, Musikwechsel exakt auf Story-Beats. | **Lücke:** Klangqualität der Musik (Code-Synthese) [H, Hörprüfung nötig]; echte Stille wird nicht genutzt |
| **Tempo / Takt** | Beat 1,8–6 s, Median 2,5–4,6 s, ≥ 1,5 Ereignisse/Beat | Schnittfrequenz A = C [M] → **kein Rückstand**. Aber Bewegung 3–15 s: A 2,5–3,1 vs. C 7,3–8,0 [M]. | **gut** beim Takt; Lücke bei Bildveränderung innerhalb der Einstellung |
| **Länge** | B1 61–64 s, B2 75–80 s, min. 60 s | C 70–75 s mit dichter Geschichte. | Regel eng für Geschichten-Formen |
| **Text** | Titel + kursive Zeile, kein Sprecher | C: Erzählerstimme in 2. Person, Präsens, kurz („You jump. Not far enough.“), oft mit Zahl/Fakt. A1: Figurenzitate (Wortspiele, sprachgebunden), Titel 8 Wörter/3 Zeilen. | **gut** im Format; Lücke: keine Regel zu Titellänge und Faktenanker |
| **Qualitätskontrolle** | 3 Stufen, Validator `[18.11]/[18.12]`, Prüfung H, Hörprüfung durch Menschen | Fängt Technik und Struktur. **Nicht** gefangen: A2-Auslöser unlesbar (Ursache der Pointe), Prämissen-Drift, leere Welten, schmaler Klang. Schwarzbilder gelten pauschal als Fehler – C2 nutzt sie als Erzählmittel. | **Lücke:** keine Prüfung „Ursache der Pointe ohne Text lesbar“, „Einsatz bleibt gleich“, „Schauwert je Akt“, Spektralbalance |
| **Architektur** | Beat-Sheet → Builder → Szene → Render; Freeze 18.10 | Determinismus, Synchronität, Wiederholbarkeit – **Stärke**. Freeze erlaubt neue Kit-Teile ohne Schnittstellenänderung → POV-Rig, Massen, Atmosphäre-Looks sind **ohne** Architekturänderung möglich. Post-Processing nicht. | **gut** |

## 2. Was Version 3.0 bereits gut umsetzt

1. **Technische Sauberkeit [M]:** A1/A2 ohne Schwarzbilder, Doppelbilder, Standbilder; Lautheit −14 LUFS; die Referenzen B haben Lesbarkeits- und Lautheitsmängel, die wir nicht haben.
2. **Beweis-Ereignis früh [B]:** A1 1,8 s – gleiche Liga wie B2/C2.
3. **Takt und Ereignisdichte [M]:** Schnittfrequenz und Median auf Referenzniveau.
4. **Figurenmimik [B]:** lesbarer als in B1/C (deren Gesichter sind einfacher).
5. **HUD-Vokabular und Endkarte:** identisch mit B, nah an C.
6. **Maßstabsreise/Wende [B]:** A2 Stadt → Erde → zurück – das System kann das seit `crane`/`geo`.
7. **Ringschluss [B]:** A1-Ende ist ein echter Payoff.

## 3. Wo Version 3.0 hinter den Referenzen zurückbleibt (konkrete Lücken)

| # | Lücke | Art | Beleg |
|---|---|---|---|
| L1 | Keine Regel/Prüfung für **durchgehenden Einsatz** (HUD misst Einsatz, Prämisse bleibt gleich, jeder Beat erhöht denselben Einsatz) | Regel/QA | A1 Gag-Zähler, A2 Drift; C1 Geld+Zeit, C2 Leben, B1 Wasserstand |
| L2 | Keine Prüfung, ob die **Ursache der Pointe ohne Text lesbar** ist | QA | A2 Rettung 4–7 s |
| L3 | **Ich-Perspektive mit Körper** nicht baubar | Kit (neues Teil) | C1/C2 Hook und Schlüsselmomente |
| L4 | **Massen/Weite** nicht baubar (kein Instancing, keine Massen-Requisiten) | Kit (neues Teil) | C1 Ferrari-Feld, Stadien; C2 Party |
| L5 | **Atmosphäre/Glanz** begrenzt (keine Looks mit Dunst/Gegenlicht/Neon, keine spiegelnden Flächen) | Kit (Looks/Materialien) | B1 Regen/Wasser, C2 Neon/Kaustik |
| L6 | **Musik-Klangfarbe** (Sub-Bass-lastig, kaum Präsenz) | Werkzeug `music_synth.py` oder Musikquelle | Band-Messung [M] |
| L7 | **Stille** wird nicht genutzt / nicht geprüft | Produktion + optional QA | C2 6 % Stille, A 0 % |
| L8 | Nur 2 Rezepte; Story-Formen „Ritual + Uhr“, „Überlebensbogen mit Zeitsprung“ fehlen | Guide | C1, C2 |
| L9 | Kein **Wissensanker** gefordert | Produktion/Prompt | B1, B2, C1, C2 vs. A1 |
| L10 | Länge B1 fest 61–64 s | Guide | C 70–75 s |
| L11 | Schwarzbild nur als Fehler, nicht als Erzählmittel | QA-Regel | C2 15–18 s |
| L12 | Keine Bewegungs-/Tiefenunschärfe | Renderer (Freeze!) | C-Whips, C2 Lidspalt |

## 4. Was bewusst **nicht** übernommen werden sollte

- Leise Fremdmusik mit Gesang (B): Lizenzrisiko, keine Dramaturgie.
- Schnittfrequenz erhöhen: kein Beleg (Comparison 2/7).
- Themen der Referenzen kopieren (Billion ausgeben, Koma): nur die Prinzipien (Einsatz, Ich-Sicht, Fakt, Ritual) übertragen.
- Figurenstil wechseln: C nutzt dieselben Würfel-Figuren – kein Grund.
- C1-HUD-Optik (grün, Kontur) übernehmen: verletzt den Freeze 18.5 und unser Erkennungsmerkmal; höchstens als Experiment.
