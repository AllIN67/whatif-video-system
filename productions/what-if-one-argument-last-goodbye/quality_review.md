# Qualitätsfreigabe – what-if-one-argument-last-goodbye (Render 2, Commit 78cca8f)

Geprüft von Claude Code am 2026-11-01.

Grundlage der Prüfung:
- `qa/report.md`
- `qa/sheet_01–03.jpg`
- `qa/shots.jpg`
- **alle 56 Bildstreifen** in `qa/strips/`, gesichtet in 6 Sammelbildern
- `render/run_log.json`
- ffprobe der Datei

Nicht geprüft wurden:
- das Abspielen in Echtzeit
- das Anhören (Teil D).

## A. Technisch

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Rendering vollständig | OK | `run_log.json`: 2130/2130 Frames, Commit 78cca8f, `git_dirty: false` |
| 1080×1920, 30 fps CFR, H.264/AAC, MP4 abspielbar | OK | ffprobe: h264 1080×1920, 30/1, 2130 Frames; aac 48 kHz; 71,000 s; 39,7 MB |
| Länge ≥ 60 s, A/V gleich | OK | Bild und Ton je 71,000 s |
| Keine Schwarz-/Blitzbilder, keine Doppelbilder | OK – alle Meldungen beabsichtigt | 0 Doppelbilder. Die FAIL-Meldungen sind im Auftrag verlangte Schwarzbilder bzw. ein Aufprall-Blitz (Tabelle unten). |
| −14 LUFS ± 1, True Peak ≤ −1 dBTP, Fade-out | OK mit 1 Abweichung | −14,2 LUFS; TP −1,2 dBTP; letzte 50 ms −73 dB. **LRA 20,2 LU über 16 LU:** Das Drama braucht leise Trauer-Musik (≈ −30 LUFS kurzzeitig), laute Fahrt (≈ −8) und Stille. Die Abweichung ist beabsichtigt; der Höreindruck ist **offen**. |
| Ereignis-Klänge synchron | OK (gemessen) | 42/50 erkannt, Versatz −15 … +30 ms. Zwei Grenzfälle: `screech` 36,3 s (+50 ms, zweiter Reifen-Klang unter Regen und Musik) und `warmth` 59,2 s (+40 ms, weicher Einsatz). 8 Klänge sind verdeckt → Hörprüfung. |
| Status `video_qa.py` | **FAIL (automatisch)**, alle Meldungen eingestuft | Siehe Tabelle. Kein Eintrag ist ein Bildfehler. |

| Meldung | Einstufung |
|---|---|
| ❌ Schwarzbild 62,4–62,8 s | beabsichtigt. Harter Schnitt vom Grab auf Schwarz, kurze Pause, dann blendet die erste Botschaft ein (Streifen 62,300). Der Auftrag verlangt „Schwarzbild mit Text“. |
| ❌ Schwarzbild 65,97–66,27 s | beabsichtigt. Die erste Botschaft blendet aus, danach folgt die zweite. Synchron dazu ist der Ton still (65,75–66,2 s), Streifen 66,000. |
| ❌ Einstellung < 4 Frames 38,6 s | beabsichtigt. Weißer Aufprall-Blitz (3 Frames) beim Schlag gegen die Leitplanke. Darin steht der HUD-Wert „0 MPH“ in Rot; er bleibt lesbar (Streifen 38,600). |
| ❌ Einstellung < 4 Frames 62,333 s | Messartefakt. Der Schnitt auf Schwarz fällt auf eine Halbbild-Grenze; im Bild gibt es keinen Zwischenframe (Streifen 62,300). |
| Sprung 23,8 s | beabsichtigt: Die Haustür fällt zu (`slam`). |
| Sprung 24,5 s und Flackern 24,5 s | beabsichtigt: Der Flur wird kurz vor dem Whip abgedunkelt (Streifen 24,280). |
| Sprung 32,0 s | beabsichtigt: Das Licht einer vorbeiziehenden Straßenlaterne fällt auf den Fahrer. |
| Sprung 33,2 s | beabsichtigt: Das Handy leuchtet auf (Anruf der Mutter). |
| Sprung 48,1 s und 48,3 s | beabsichtigt: Abblende vom Unfall zum Grab. |
| Sprung 52,1 s | **Schwäche.** Die Zeichnung erscheint 3 Frames nach dem Schnitt ohne sichtbare Hand im Bild (Streifen 52,000). Lesbar als „wird hingelegt“, aber nicht gezeigt. |
| Übergang 66,0 s nicht erkennbar | beabsichtigt: Schwarz → Schwarz. |
| Standbild 66,53–70,97 s und Monotonie 62,5–70,5 s | beabsichtigt: Botschaften auf Schwarz, wie im Auftrag vorgegeben. |
| Klick-Kandidaten 7,9–24,3 s im 0,36-s-Raster | vermutlich Anschläge des Musikstils `pulse`/`warm` (Raster = Tempo) → **Hörprüfung**. |

## B. Visuell

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Keine monotonen Phasen | OK | Einziger Monotonie-Kandidat ist der beabsichtigte Schwarzbild-Schluss. Jeder Beat hat eine Aktion (sheet_01–03). |
| Figuren konsistent | OK | Alle vier Figuren tragen in jeder Szene dieselbe Kleidung und Frisur: Vater blau mit Bart, Mutter pink mit langen Haaren, Junge (5) orange, Bruder (3) grün und blond. Die Kinder haben altersgerechte Proportionen (kleiner, großer Kopf). |
| Gefühle lesbar, Entwicklung | OK mit Einschränkung | Junge: traurig → glücklich → besorgt/weinend → begreifend → weinend (Tränen). Mutter: weinend → glücklich → wütend → weinend. Vater: glücklich → wütend → Panik → bewusstlos. **Einschränkung:** Das Gesicht des Vaters im Innenraum (44–48 s) ist geneigt und dunkel; die geschlossenen Augen sind nur bei voller Größe sicher erkennbar. |
| Keine fehlerhaften Animationen | OK mit Einschränkung | Weiche Übergänge, keine Durchdringung gefunden. **33,57–33,70 s:** Der Kopf des Vaters dreht sich schnell vom Handy zurück und verlässt kurz den Ausschnitt. **52,1 s:** Die Zeichnung erscheint (siehe oben). |
| Kamera wechselt, Bewegung weich | OK | 9 Vorlagen, 6 Bildgrößen, nie zweimal dieselbe hintereinander. Die Streifen zeigen stetige Bewegung. Der 911 wird zuerst in Dreiviertel-Ansicht gezeigt (25 s), dann folgt die Kamera von hinten beim Beschleunigen (28–31 s), wie verlangt. |
| Übergänge sinnvoll | OK | Harter Schnitt Grab → Rückblende (7,8 s, wie verlangt). Whip in die Fahrt bzw. das Schleudern. Abblenden zum Grab. Zeilen blenden vor dem Schnitt aus. |
| HUD und Texte lesbar, in der Sicherheitszone, HUD reagiert | OK | Bei Ereignissen erscheinen Akzente in Rot und Gold (7 MIN, 101 MPH, 0 MPH, 0 BPM, FOREVER). Beide Botschaften stehen groß, zentriert und gut lesbar auf Schwarz (63–66 s und 66,2–71 s). Der HUD-Endtext „FOREVER“ bleibt auf dem Schwarzbild, als Antwort auf die Frage aus dem Hook. |
| Licht, Schatten, Farben; keine Renderfehler | OK mit Einschränkung | Je Ort eine eigene Lichtstimmung: Friedhof grau-hell, Wohnzimmer warm, Einfahrt in der Dämmerung, Straße nachts, Unfallstelle im Regen. Nachtszenen sind lesbar (aufgehellt gegenüber der Schwäche der Referenz). **Einschränkung:** In der Fahrer-Nahaufnahme (31,6–34,5 s) ist der untere Bildteil durch das Armaturen-/Haubenlicht überstrahlt (heller Fleck). |
| Stilspezifikation Guide 18 | OK | Würfelfiguren mit Gesicht, Requisiten (Zeichnung, Blumen, Grabstein mit Inschrift, Autoschlüssel, Handy mit Anruf, Leitplanke, Warnblinker, Rauch) und Tiefe. Der 911 ist an seiner Silhouette erkennbar (Fließheck, runde Scheinwerfer, Rücklichtband) und trägt kein Logo. |

## C. Dramaturgisch

Geprüft wurde Frame für Frame über Kontaktbögen und Streifen, **nicht in Echtzeit**.

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Einstieg | OK | Frame 0: Junge am Grab mit der Zeichnung, Titelfrage, HUD läuft. Die Frage „Mommy… when will Daddy wake up?“ steht ab 0,6 s (Auftrag: innerhalb von 3 s). Die Mutter reagiert weinend, ohne Antwort (4,4–7,8 s). |
| Entwicklung ohne Sprecher verständlich | OK | Familienabend → Streit, Kinder sehen zu → Vater nimmt die Schlüssel und geht an der Zeichnung vorbei → Fahrt, Anruf weggedrückt → Schleudern → Aufprall → Herzschlag 0 → Grab → Zeichnung → Begreifen → Umarmung. |
| Abwechslung | OK | 7 Orte, 9 Kamera-Vorlagen, 5 HUD-Segmente mit 4 Labels. |
| Eskalation | OK | Minuten zählen herunter (15 → 5 MIN), dann MPH (0 → 104), dann BPM (136 → 0), dann Tage (→ FOREVER). Die Musik geht von warm über Puls und Fahrt bis zur Stille. |
| Ende | OK | Pointe: Die Endbotschaft (66,2 s) ist ein eigenes Ereignis mit Klang, vorbereitet durch „FOREVER“ und die Umarmung. Danach bleiben 4,8 s. Kein „Part 2?“ (unangemessen, Auftrag). |
| Vergleich mit der Referenz (18.11) | siehe LOG Abschnitt 6 | — |

## D. Hörprüfung

- [ ] **Ausstehend – bitte durch den Nutzer** (Kopfhörer und Handylautsprecher):
  - Klick-Kandidaten 7,9–24,3 s
  - Synchronität (Bremsen 36,3 s, verdeckte Klänge 39–50 s)
  - Verhältnis Musik zu Effekten
  - Wirkung der Stille beim Aufprall und beim Herzstillstand
  - Lautheitsumfang (LRA 20 LU)
  - Ende

## Ergebnis

**QUALITÄT GEPRÜFT (mit dokumentierten Einschränkungen) – nicht FREIGEGEBEN.**
- Die Hörprüfung fehlt.
- Die dramaturgische Prüfung erfolgte nicht in Echtzeit.
- Der automatische Status lautet FAIL; alle FAIL-Meldungen sind als beabsichtigt bzw. als Messartefakt eingestuft.
