# LOG – _v4_koma (Testvideo Bildsprache V4, Guide 18.15)

Zweck: A/B-Vergleich. Story, Szene, Text, Ton identisch mit `what-if-koma`; einziger Unterschied `beats.json` `"post": { "v4": true }`.
Kein neues Inhaltsvideo. Abnahme durch den Nutzer entscheidet, ob V4 Standard wird.

## Render
- Commit `073f110`; Render 1 (Commit `e0e8524`) verworfen: Handytext in der Ich-Perspektive (50,8 s) unscharf/flackernd
  (Handy knapp hinter dem Fokus) → Fix: scharfe Zone ±15 % um den Fokus, keine Auto-Unschärfe in POV-Beats.
- Render 2: Containerneustart bei Frame ≈ 500 → fortgesetzt (Teilstück 0–299 wiederverwendet), 40 min Restlaufzeit.
- Renderzeit V4 ≈ 1,4–1,7 s/Frame (alt ≈ 1,2–1,3 s/Frame) → ≈ 45–55 min statt ≈ 41 min für 61 s.

## Technische QA (video_qa.py)
- FAIL wie das ausgelieferte Original (5,0 s und 28,1 s, Abblende-Frames). Neu gemeldet: 24,2 s (gleiche Abblende-Art,
  Übergang laut Zeitplan) – kein Bildfehler.
- Sprungkandidaten 41,9 s (geplantes Lidschlag-Licht) und 50,8 s (Handbewegung; Handytext in allen Frames scharf, geprüft) –
  sichtgeprüft, kein Fehler. Ton unverändert (gleiche Warnungen wie Original). Hörprüfung beim Nutzer steht aus.

## Sichtprüfung
- `qa/shots.jpg` (25 Einstellungen): keine kaputten Bilder, Umriss-Linien durchgehend, Bildtexte lesbar.

## Messung (tools/look_metrics.py)
| Kennzahl | alt (6 Standbilder) | V4 (6 Standbilder) | V4 (Video, 31 Bilder alle 2 s) | Referenz Mr omi (38) |
|---|---|---|---|---|
| Schwarzanteil ohne Linien % | 0,44 | 0,16 | 1,28* | 0,008 |
| Schwarzwert p5 | 0,117 | 0,130 | 0,166 | 0,116 |
| Buntheit p50 (darf nicht steigen) | 0,071 | 0,071 | 0,071 | 0,233 |
| Schatten B−R (> 0 kühl) | −0,066 | −0,021 | −0,031 | −0,031 |
| Kanten mit Linie % | 41 | 52 | 50 | 60 |
| Kanten mit Linie % (Handy-Größe) | 44 | 55 | 53 | 60 |

\* Video-Stichprobe enthält die bewusst dunklen Koma-/Lidschlag-Bilder (40,6–42 s), die Standbild-Stichprobe nicht.
balance_qa (Video): stark gesättigte Pixel 4,8 → 5,0 %, Akzentfläche 0,1 → 0,2 %, dominanter Farbton 89 → 83 %.

## Bit-Identität
`what-if-koma` Frames 0–299 vor und nach allen V4-Änderungen (finaler Code `073f110`): bit-identisch.
