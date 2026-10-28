# Szenenplan – What If Every Lie Cost You One Minute of Your Life?

- Slug: `every-lie-costs-a-minute`
- Frage (Bildschirm): „What if every lie cost one minute of your life?“ (10 Wörter; Guide 2 erlaubt max. 10 – der Auftragstitel hat 11, „you“ entfällt nur im Bild)
- HUD-Messgröße: verbleibende Lebenszeit der Figur im Fokus in Minuten („HIS/HER LIFE LEFT · MINUTES“), springt bei jeder Lüge um genau −1; Zwischenakt global „MINUTES LOST TODAY · ON THIS STREET / IN THIS CITY“. Fortschrittsskala = Anteil an 80 Jahren (42 048 000 min).
- Kamera-Paradigma: **P2 Wandernder Zeuge** – gesellschaftliche Folgen, gleitende Kamera auf Augenhöhe, Whips nur in der Montage.
- Pointe/Wendung: Der Vater lügt seine Tochter an, um ihr Hoffnung zu lassen, und zahlt bewusst eine Minute. Danach offene Frage an den Zuschauer, unbeantwortet.
- Geplante Länge: **55,0 s** (Auftragsvorgabe 45–55 s; Abweichung von Guide 10.1, siehe LOG)
- Quelle der Zahlen/Zeiten: `make_timeline.py` → `timeline.json`. Alle Texte: `text.en.json`.

| Zeit (s) | Akt | Bild – was sieht man? | Kamera | HUD | Text-ID | Ton | Übergang | Erzählfunktion von Effekten |
|---|---|---|---|---|---|---|---|---|
| 0,0–4,0 | A Hook | Junger Mann nachts auf dem Gehweg, Straße fluchtet hinter ihm; Countdown erscheint (0,2 s) über seinem Kopf; bei 1,8 s Lüge → Countdown −1, rot, „−1:00“; er blickt erschrocken nach oben | langsame Annäherung, bei 1,8–2,3 s schneller Push-in | HIS LIFE LEFT 24 198 417 → …416 (1,8 s, Verlust-Akzent) | title (0–2,9), l01 | Stadtatmo, tiefer „appear“-Ton 0,2 s, `lie_hit` 1,8 s | – | Rot + Größenimpuls = Minute verloren |
| 4,0–6,6 | B | Frau auf der Bank, telefoniert, offensichtlich traurig | seitliche Fahrt, Push-in nach der Lüge | HER LIFE LEFT, −1 bei 5,4 s | l02 | Whoosh, `lie_hit` 5,4 s | Whip rechts (8 Fr.) | – |
| 6,6–9,2 | B | Mann entspannt im Café mit Kaffee am Telefon („on my way“) | seitlich, Push-in | HIS LIFE LEFT, −1 bei 8,0 s | l03 | `lie_hit` 8,0 s | Schnitt | – |
| 9,2–11,8 | B | Vorstellungsgespräch im Büro, Bewerber lügt; Interviewerin blickt zu seinem Countdown hoch | über die Schulter, Push-in | HIS LIFE LEFT, −1 bei 10,7 s | l04 | Whoosh, `lie_hit` 10,7 s | Whip links (8 Fr.) | – |
| 11,8–14,4 | C | Orientierungs-Totale: volle Straße, über jedem Kopf ein Countdown; mehrere springen rot | erhöht (4,4–4,8 m), langsam vor | MINUTES LOST TODAY · ON THIS STREET 3 412 → 3 417 (je Verlust +1) | l05 | Atmo lauter, 5 leise `lie_hit` | Schnitt | Rote Sprünge in der Menge = Regel gilt für alle |
| 14,4–18,0 | C | Fahrt auf dem Gehweg durch die Menge, misstrauische Seitenblicke, weitere Verluste | Tracking-Fahrt auf Augenhöhe | IN THIS CITY 1 206 400 → 1 214 950 (laufend) | l06 | Atmo, 5 leise `lie_hit` | Schnitt | – |
| 18,0–21,4 | C | Geschäftsmann am Telefon lügt; Countdown −1; er stockt, senkt das Telefon, schaut nach oben, verstummt | leichte Bewegung, Push-in bei 20,0 s | HIS LIFE LEFT, −1 bei 20,0 s | l07 | `lie_hit` 20,0 s, danach Atmo/Drone abgesenkt (Stille-Effekt) | Schnitt | – |
| 21,4–24,2 | C | Künstlerin zeigt ihr Bild | über die Schulter | HER LIFE LEFT (Künstlerin) | l08 | Atmo | Schnitt | – |
| 24,2–26,7 | C | Freundin will höflich lügen („It's beauti—“), Countdown flackert, sie sagt die Wahrheit; die Künstlerin sinkt leicht zusammen | Gegenschuss, langsam näher | HER LIFE LEFT, Warn-Puls 24,4 s, **kein** Verlust | l09 | leiser Puls 24,4 s | Schnitt | Warn-Puls = beinahe gelogen |
| 26,7–29,8 | D | Wohnung, Paar am Tisch; sie fragt | über seine Schulter, langsames Heranfahren | HIS LIFE LEFT 20 488 351 | l10 | Spannungsfläche, Stadt gedämpft | Abblende (6 Fr., nie schwarz) | – |
| 29,8–35,5 | D | Er zögert (Blick nach unten, Hände verschränkt), Countdown pulsiert; dann Blick hoch, sagt die Wahrheit | langsamer Push-in auf ihn | Warn-Pulse 29,9/30,8 s, **kein** Verlust | (Ruhephase 29,8–31,9), l11 | Herzschlag-Pulse, Drone tritt zurück (bewusste Reduktion) | Schnitt | – |
| 35,5–39,0 | D | Ihre Reaktion: sie legt ihre Hand auf seine | über seine Schulter, langsam | HIS LIFE LEFT unverändert | l12 | Spannungsfläche klingt aus | Schnitt | – |
| 39,0–42,8 | D Wendung | Krankenhausflur, Vater und Tochter auf der Bank, Ärztin geht weg; Tochter fragt | erhöht, langsam vor | HIS LIFE LEFT 19 730 662 | l13 | Neonbrummen | Abblende | – |
| 42,8–46,8 | D | Vater blickt kurz zu seinem Countdown (Kamera folgt), wendet sich der Tochter zu, lügt sanft; −1 bei 45,3 s; Push-in | Schwenk hoch/zurück, Push-in | Warn 43,3 s, Verlust 45,3 s | l14 | Puls 43,3 s, kräftigster `lie_hit` 45,3 s, Drone-Höhepunkt | Schnitt | Höhepunkt: bewusst bezahlte Lüge |
| 46,8–50,0 | D | Er legt den Arm um sie; Kamera fährt zurück und hoch; Flur wird dunkler | Kranfahrt rückwärts | HIS LIFE LEFT …661 | l15 | Klangfläche wird zurückgenommen | Schnitt | Licht dimmt = Übergang zur Frage |
| 50,0–55,0 | E | Dunkle, neblige Straße; der Mann aus Szene 1 steht still, Countdowns weiterer Figuren glimmen im Nebel | langsamer Push-in | HIS LIFE LEFT 24 198 416 (Kreisschluss) | Endkarte | tiefer „appear“-Ton, reduzierte Atmo, Ausblendung 1,6 s | Abblende | – |

## Prüfung vor dem Bau

- [x] Ereignis spätestens bei 10 s (erste Lüge 1,8 s)
- [x] Alle ≤ 6 s eine sichtbare Zustandsänderung (Validator)
- [x] Monotone Eskalation: Einzelperson → Alltag → ganze Straße/Stadt → persönliche Beziehung → Lüge aus Liebe
- [x] Ende ≤ 5 s nach der Pointe (Pointe = Schlussfrage bei 50,0 s, Ende 55,0 s)
- [x] Blitzregel: keine Weißblenden, Abblenden nur bis 60 % Dunkel
