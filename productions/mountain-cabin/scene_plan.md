# Szenenplan – What if you lived alone in the mountains?

- Slug: `mountain-cabin`
- Frage: „What if you lived alone in the mountains?“ (8 Wörter, Schlüsselwort „alone“ in Signalfarbe)
- HUD-Messgröße: wechselt pro Akt – NEAREST NEIGHBOR 0→42 km · FOLLOWING TRACKS 0→1.2 km · WIND SPEED 10→85 km/h · INSIDE TEMPERATURE 9→21 °C · ALTITUDE 1,840→2,130 m · STRESS LEVEL 12 %→„ZERO“ (5 Label-Wechsel)
- Kamera-Paradigma: P3 Ego-Perspektive als Grundform (Tür, Frühstück, Spuren, Pfad, Holz, Lampe, Feuer) mit eingeschobenen Totalen/Third-Person-Einstellungen (Auftrag des Nutzers; Abweichung von Guide 5.1, siehe LOG)
- Pointe/Wendung: nach Sturm und Gipfel das ruhige Abendbild – „No boss. No traffic. No stress.“ → „Could you live like this?“ (offene Frage → Kommentare)
- Länge: 63,0 s (Auftrag 55–65 s ∩ Guide 61–80 s)

Alle Zeiten, Kameras und Tonereignisse werden von `make_timeline.mjs` in `timeline.json` geschrieben; Texte in `text.en.json`.

| Zeit (s) | Akt | Bild – was sieht man? | Kamera | HUD | Text-ID | Ton | Übergang | Effekt-Funktion |
|---|---|---|---|---|---|---|---|---|
| 0,0–4,5 | A | Tür öffnet sich aus dunklem Innenraum, Kamera geht hinaus auf die Veranda: Tal, Wald, Nebel, Gipfel | Ego, Catmull-Fahrt durch die Tür | NEAREST NEIGHBOR 0→42 km | title | Türknarren 0,0; Holzschritte; Fläche schwillt an, Klavier bei 2,6 | – | Tageslicht flutet den Raum = Befreiung |
| 4,5–7,0 | B | Untersicht: Hütte, Figur tritt an das Geländer | tiefe Totale, Push-in | – | l01 | Schritte Holz, Wind, Vögel, Klavier-Arpeggien | Schnitt | – |
| 7,0–8,6 | B | Kaffee wird eingegossen, Dampf im Gegenlicht | Nah, langsam | – | l02 | Eingießen (steigende Resonanz) | Schnitt | Dampf + Lichtstrahl = kalter Morgen, Wärme |
| 8,6–10,0 | B | Brot wird geschnitten, Scheibe fällt | Nah, Aufsicht schräg | – | l02 | 3× Brotsäge, Scheibe | Schnitt | – |
| 10,0–11,5 | B | Hand öffnet das Fenster zum Tal | Ego | – | – | Riegel/Knarren, Vögel lauter | Schnitt | – |
| 11,5–14,0 | C | Figur zieht Karotte aus dem Hochbeet, Tal im Hintergrund | niedrige Seitenfahrt | – | l03 | Erde, Huhn | Schnitt | Pflanzen im Wind |
| 14,0–15,8 | C | Hühner picken im Auslauf vor dem Stall | bodennah | – | l03 | Gackern | Schnitt | – |
| 15,8–19,0 | C | Ego: Blick senkt sich auf frische Hirschspuren im nassen Boden, hebt sich zum Waldrand | Ego, Neigung | – | l04 | Schritte, Musik dünnt aus, Celloton | Schnitt | Stimmungswechsel zu Neugier |
| 19,0–22,5 | D | Pfad durch den Wald, großer Fels verdeckt das Ziel | Ego, Gleitfahrt | FOLLOWING TRACKS 0→1.2 km | – | Schritte Erde, Ostinato, fernes Rauschen | Schnitt | – |
| 22,5–25,0 | D | Kamera umrundet den Fels: Wasserfall | Ego, Reveal | – | l05 | Schwelle, Wasserfall voll bei 23,0, Akkord | Schnitt | Gischt = Größe/Nähe |
| 25,0–27,5 | D | Figur klein am Becken, Wasserfall hoch | Orbit | – | l05 | Wasserfall | Schnitt | – |
| 27,5–29,6 | Sturm | Figur vor dem Tal, dunkle Front rollt über die Gipfel, Licht kühlt | Totale über die Schulter | WIND SPEED 10→85 | l06 | ferner Donner 28,6, Moll-Orgelpunkt | Abblende 6 Fr (Zeitsprung) | Sturmfront = Bedrohung |
| 29,6–30,8 | Sturm | Blick in den Himmel, Schwenk zum Holzstapel; erste Tropfen | Ego, Schwenk | – | l07 | Regen beginnt 29,9 | Schnitt | Regen = Dringlichkeit |
| 30,8–32,2 | Sturm | Hände greifen Scheite | Ego, Wackeln | – | l07 | Holz-Klopfen | Schnitt | – |
| 32,2–33,6 | Sturm | Figur rennt mit Holz zur Veranda | Seitenfahrt | – | – | nasse Schritte | Schnitt | – |
| 33,6–34,8 | Sturm | Kiefer peitscht im Wind, ein Blitz | Untersicht | – | – | naher Donner 34,2 | Schnitt | einzelner weicher Lichtstoß (Blitzregel) |
| 34,8–36,5 | Sturm | Ego: hinein, umdrehen, Tür knallt zu (36,3) | Ego | – | – | Schritte, Türknall, Musik bricht ab | Schnitt | Stille = Sicherheit |
| 36,5–39,0 | Drinnen | dunkler Raum, Streichholz, Öllampe | Nah | INSIDE TEMPERATURE 9→21 °C | l08 | Streichholz, Lampe, Dachregen | Schnitt | Licht kehrt zurück |
| 39,0–41,5 | Drinnen | Feuer fängt im Kamin | Halbnah | – | – | Zünden, Knistern | Schnitt | – |
| 41,5–43,5 | Drinnen | Regen läuft über die Scheibe, draußen Sturm | Nah | – | l09 | gedämpfter Sturm | Schnitt | Kontrast außen/innen |
| 43,5–45,5 | Drinnen | Eintopf über dem Feuer, Rühren, Dampf | Nah | – | l09 | Topf, Knistern | Schnitt | – |
| 45,5–48,3 | Warum | Sturm vorbei, Aufstieg, nasse Felsen, Nebel im Tal | Totale, Gegenrichtung | ALTITUDE 1,840→2,130 m | l10 | Wind, Vögel, steigende Musik | Abblende 6 Fr (Zeitsprung) | – |
| 48,3–50,5 | Warum | letzte Meter, Tal im goldenen Licht | bodennah | – | – | Felsschritte | Schnitt | – |
| 50,5–54,5 | Warum | Gipfel: von hinter der Figur zur weiten Panorama-Totale | Catmull-Fahrt | – | l11 | Höhepunkt der Musik, Windschwelle | Schnitt | – |
| 54,5–57,5 | E | Abend: Figur am Kamin mit Becher | Über-Schulter | STRESS LEVEL 12→0 % | – | Feuer, leiser Wind | Abblende 6 Fr | Schnee draußen |
| 57,5–63,0 | E | leuchtende Hütte im Schneefall, Kamera zieht sich zurück | Rückfahrt + Steigen | „ZERO“ ab 58,0 | l12, l13 | ruhige Auflösung, Fade-out 1,6 s | Schnitt | – |

## Prüfung vor dem Bau

- [x] Ereignis spätestens bei 10 s (Türöffnung ab Frame 0)
- [x] Alle ≤ 6 s eine sichtbare Zustandsänderung (26 Einstellungen; Validator OK)
- [x] Monotone Eskalation (Routine → Entdeckung → Sturm → Gipfel → Ruhe als Pointe)
- [x] Ende ≤ 5 s nach der Pointe (Pointe 58,0 s, Ende 63,0 s)
- [x] Blitzregel: ein einzelner Blitz (34,1 s), keine Weißblenden
