# Qualitätsfreigabe – what-if-phone-battery-life (Render 2, Commit dfaa333)

Geprüft von Claude Code am 2026-10-30. Grundlage: `qa/report.md`, `qa/sheet_01–03.jpg`, `qa/shots.jpg`, **alle 71 Bildstreifen**
in `qa/strips/` (nach Korrektur von `inspect_frames.py`, das alte Streifen nicht entfernt hatte – siehe LOG), `render/run_log.json`.

## A. Technisch

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Rendering vollständig | OK | `run_log.json`: alle Schritte, 1842/1842 Frames, Commit dfaa333, nicht „dirty“ |
| 1080×1920, 30 fps CFR, H.264/AAC 48 kHz, MP4 abspielbar | OK | ffprobe: h264 1080×1920 30/1, aac 48000, 61,400 s, 34,5 MB |
| Länge ≥ 60 s, A/V gleich | OK | 61,400 s Bild und Ton |
| Keine Schwarz-/Blitzbilder, keine Doppelbilder | OK | report.md: keine Schwarzbilder, keine Einstellung < 4 Frames, 0 Doppelbilder |
| −14 LUFS ± 1, True Peak ≤ −1 dBTP, Fade-out | OK | −14,2 LUFS, TP −1,1 dBTP, LRA 10,9 LU, letzte 50 ms −50,6 dB |
| Ereignis-Klänge synchron | OK (gemessen) | 35/38 erkannt, Versatz −15 … +10 ms; Grenzfall 2,4 s (+60 ms, leiser HUD-pop unter Musik); 3 verdeckt (25,5 / 43,2 / 55,0 s – HUD-pops unter lauteren Klängen) → Hörprüfung |
| Status `video_qa.py` | REVIEW (kein FAIL) | Meldungen unten eingestuft |

| REVIEW-Meldung | Einstufung |
|---|---|
| Sprung 14,3 / 14,5 s | beabsichtigt – Abblende ins Café + Aufhellen (Streifen 14,200/14,500) |
| Sprung 20,5 s, Flackern 20,5 s | beabsichtigt – Abblende Café → Büro (Streifen 20,350) |
| Sprung 46,567 s | beabsichtigt – Figur läuft nah an der Kamera ins Bild (Streifen 46,567) |
| Sprung 53,1 s | beabsichtigt – Abblende in das Schlafzimmer (Streifen 53,000) |
| Sprung 57,867–57,967 s | beabsichtigt – Pointe: Licht geht aus (Streifen 57,800) |
| Klick-Kandidaten 0,67–17,5 s im 0,4-s-Raster | vermutlich Hi-Hat der Musik (gleiches Muster wie in what-if-mind-reading-10s) – **Hörprüfung** |
| Klang 2,4 s +60 ms, 3 verdeckte Klänge | Messgrenze, Einsatz ist im Mix sample-genau gesetzt – **Hörprüfung** |

## B. Visuell

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Keine monotonen Phasen | OK | keine Monotonie-Kandidaten (Durchlauf 1: 3); jeder Beat hat eine Aktion |
| Figuren konsistent | OK mit 1 Einschränkung | Hauptfigur überall gleich; **Kontinuitätsfehler 35,4 s**: Schnitt von „steht jubelnd“ zu „sitzt mit Powerbank“ |
| Gefühle lesbar, Entwicklung | OK | müde → besorgt → Panik → wütend → müde → glücklich/Lachen → traurig → Schock → erleichtert → Schock (sheet_01–03) |
| Keine fehlerhaften Animationen | OK mit Einschränkung | weiche Übergänge; Knien an der Ladesäule (47,3 s) im Dunkeln kaum als Knien erkennbar |
| Kamera wechselt, Bewegung weich | OK | 7 Vorlagen, 6 Bildgrößen, nie zweimal gleich hintereinander; Streifen zeigen stetige Bewegung |
| Übergänge sinnvoll, Text vor dem Schnitt aus | OK | alle Abblenden/Whip in den Streifen; Zeilen blenden vor dem Schnitt aus |
| HUD + Texte lesbar, Sicherheitszone, HUD reagiert | OK mit Einschränkung | Stufen-Impulse und Akzente sichtbar (z. B. 10,0 / 25,0 / 36,3 s rot); **Zeile 39,0–39,3 s während des Blitzes kontrastarm** |
| Licht, Schatten, Farben; keine Renderfehler | OK mit Einschränkung | Lichtstimmung je Ort; kein Flackern; **Ladesäulen- und Pointe-Szene sehr dunkel** (Gesicht der Hauptfigur 47–50 s schwer lesbar) |
| Stilspezifikation Guide 18 | OK | Würfel-Figuren mit Gesicht, Requisiten (Handy-Akkuanzeige, Powerbank, Steckdosenleiste, Ladesäule, Taube), Tiefe |

## C. Dramaturgisch

| Punkt | Ergebnis | Beleg |
|---|---|---|
| Einstieg | OK | Frame 0: Figur im Bett, Titel, HUD 100 %; erster Verlust bei 1,5 s, Wecker vibriert bei 0,3 s |
| Entwicklung ohne Sprecher verständlich | weitgehend OK | Ursache → Wirkung je Beat; schwächste Stellen: Café-Ich-Perspektive (Steckdose klein im Bild), Ladesäule im Dunkeln |
| Abwechslung | OK | 7 Orte, 6 Bildgrößen, 4 HUD-Labels |
| Eskalation | OK | 100 % → 4 %, Hoffnung/Rückschlag (Powerbank, Zuhause), Licht kippt von Tag zu Gewitter zu Stromausfall |
| Ende | OK | Pointe 57,8 s als eigenes Ereignis (Licht aus + Klang + HUD rot), vorbereitet durch den Stromausfall 43 s; Endkarte „How long would you last? / Part 2?“, 3,6 s bis Ende |
| Vergleich mit R07/R19/R20 | siehe Abschlussbericht im LOG | Takt und Ereignisdichte wie R07/R19; Bildqualität (Licht, Materialien, Detaildichte der Orte) unter R07/R20 |

## D. Hörprüfung

- [ ] **Ausstehend – bitte durch den Nutzer** (Kopfhörer + Handylautsprecher): Hi-Hat-Klicks 0–18 s, Synchronität der Ereignis-Klänge,
  Lautstärke Musik vs. Effekte, Stille vor der Pointe (57,8 s), Ende.

## Ergebnis

**QUALITÄT GEPRÜFT (mit dokumentierten Einschränkungen) – nicht FREIGEGEBEN** (Hörprüfung fehlt).
