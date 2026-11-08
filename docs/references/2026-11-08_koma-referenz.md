# Referenz-Notiz: „What if you fell into a coma?“ (Upload 2026-11-08) → Produktion `what-if-koma`

Zusätzliche Wissenssammlung für künftige Videos. **Kein Regelwerk:** Diese Datei ändert weder den Style-Guide noch Prüfregeln
oder die Produktionsarchitektur. Verbindlich bleibt `WHATIF_STYLE_GUIDE.md` (Abschnitt 18). Übernahme einzelner Punkte in den
Guide nur nach ausdrücklicher Entscheidung und belegtem Ergebnis.

## 1. Referenzvideo – Befund

Datei (lokal beim Auftraggeber, nicht im Repository): `snaptik_7705438530490600735_v3.mp4`, 61,0 s, 1080×1920, 30 fps, englisch.
Gesichtet: Kontaktbögen 1 fps (ganze Länge), 6 fps (0–4 s), Pegelverlauf in 2-s-Fenstern.

| Bereich | Was die Referenz macht | Bewertung |
|---|---|---|
| Einstieg | Ich-Sicht vom Fahrrad (eigene Hände am Lenker), Abendstraße, Titel 0–3 s | stark: sofort „du“ |
| Hook-Timing | Auto erst ≈ 3,5 s im Bild, Aufprall ≈ 4,5 s | zu spät – 18.12 verlangt Beweis ≤ 2 s |
| Kamera | Ich-Sicht an 4 Schlüsselstellen (Rad, Trage, Aufwachen, Handy), sonst halbnahe, fast statische Einstellungen | Ich-Sicht gut dosiert; Rest zu statisch |
| Zeitsprünge | HUD „TIME IN A COMA“ 0 DAYS → 20 YEARS in Stufen, Untertitel „Year 2 …“ | klar, aber Sprünge meist nur im Text |
| Zeit sichtbar machen | Jahreszeiten-Zeitraffer am Baum vor der Klinik; Haare/Bart wachsen; Hund wird alt; Eltern grau | wirksam, weil ohne Text lesbar |
| Kontinuität | Teddy, Karten, Blumen bleiben am Bett und vermehren sich | gutes Mittel gegen „neue Szene = neue Welt“ |
| Licht | fast überall gleichmäßig hell, wenig Lichtquellen | flach (vgl. 18.13 D) |
| Ton | −19,4 LUFS, LRA 1,8 LU, Pegel 0–60 s konstant (−20…−22 dB) | keine Dramaturgie über Lautstärke/Stille |
| Pointe | altes Handy: 4.812 Nachrichten, letzte vom Chef „You're fired.“, „Part 2?“ | witzig, aber ohne Aufbau |

## 2. Was in `what-if-koma` funktioniert hat (Vorschau-/Render-Beleg in `productions/what-if-koma/quality_review.md`)

- **Bedrohung ab Frame 0 statt Alltag:** Scheinwerfer rasen im Regen auf die Ich-Kamera zu, während die Hände eine Nachricht
  tippen; Aufprall 1,2 s mit Weißblitz. Die Nachricht ist zugleich Einsatz und Ursache der Pointe.
- **Aufsicht auf den liegenden Körper** (Zebrastreifen, Handy daneben, Blaulicht) liest sich in 9:16 deutlich besser als eine
  Untersicht vom Boden (Körper wird zur dunklen Silhouette, Handy verdeckt den Kopf).
- **Zeitraffer im Zimmer statt draußen:** feste Totale, Tag/Nacht flackert über Fenster- und Deckenlicht, Uhr rast, Karten füllen
  die Wand, Besucher erscheinen/verschwinden – ein Bild, mehrere Zeitbeweise.
- **Haare/Bart wachsen in der Einstellung** (Aufsicht direkt über dem Gesicht, Kopf oben im Bild = Gesicht aufrecht).
- **Bezugsfiguren altern über Material-Farbe** (Haare von braun → grau), eine Figur über alle Zeitabschnitte.
- **Ein Zähler über Größenordnungen:** „TAGE IM KOMA“ 1 → 3.653 (de-DE-Tausenderpunkt), Label-Phasen statt Einheitenwechsel.
- **Leerer Stuhl mit Foto** auf einer Hochzeit als Massen-Schauwert mit emotionaler Lücke.
- **Lider als Übergang ins Wachsein:** zwei Verlaufsflächen vor der Ich-Kamera, öffnen/blinzeln, dazu radiale Unschärfe + Bloom,
  die über 2 s abklingen.
- **Pointe aus Requisiten-Kette:** Nachricht „Nicht zugestellt“ (3 s) → Lea hält dein Handy (11 s) → sie schreibt täglich (14 s)
  → 3.652 Nachrichten (49 s) → erneut senden → ihr Handy vibriert im Flur → sie ist da.

## 3. Stolpersteine (technisch, wiederverwendbar)

- Liegende Figur (`pose('lie')`): Körperdicke ≈ 0,3 m → Bettdecke ≥ 0,27 m und Figur ≈ 7 cm „in die Matratze“ setzen, sonst stehen
  Schuhe/Beine durch die Decke; Schuhe im Bett ausblenden. Von flachen Kamerawinkeln verdeckt der Deckenrand den Kopf.
- Kamera im Krankenzimmer nicht auf der Infusionsseite in Kopfhöhe – der Ständer steht sonst im Bild (Infusion im Kit nach links gesetzt).
- Haare seitlich am Kopf (lange Haare) verdecken bei Seitenansicht das Gesicht → seitliche Haarteile schmal und nach hinten setzen.
- Zustände, die sich über die Zeit ändern (Haarfarbe), **jeden Frame neu setzen**, sonst tragen Vorschaubilder/Teilstücke den
  Zustand eines anderen Zeitpunkts.
- Handy-Bildschirm lesbar machen: Banner-Schrift ≥ 50 px auf 400×800-Canvas, Telefon skaliert ≥ 2,3× bei halbnaher Einstellung;
  Bloom in Handy-Einstellungen senken (Bildschirm sonst überstrahlt).

## 4. Wiederverwendbare Ideen

- Kit `hospital` (Bett, EKG-Monitor, Infusion, Intensivzimmer mit Licht-/Fenstersteuerung, Flur, Chat-Handy) für weitere
  Krankenhaus-/Zeitsprung-Themen.
- Klänge `beep`, `monitor` (Atmosphäre), `vibrate`.
- Muster „Nachricht kommt Jahre später an“ als Auflösung für Zeitsprung-Geschichten.

## 5. Offen / nicht belegt

- Wirkung auf Abbruchkurve unbekannt (keine Analytics). Hörprüfung und Sprachabnahme durch den Auftraggeber stehen aus.
