# Szenenplan – <Titel>

- Slug: `<slug>`
- Produktionsstil: B – Rezept B1 / B2 (Stil A: Vorlage aus `productions/earth-stops-1-second/scene_plan.md`)
- Frage: „Was wäre, wenn …?“ (Guide 18.14)
- HUD-Messgröße: <Label> · Start <Wert> → Ende <Wert/„HERE“/„0 %“> · Einheit (SI) <…>
- Kamera-Paradigma: P1 / P2 / P3 / P4 – Begründung: <…>
- Pointe/Wendung: <…>
- Geplante Länge: <≥ 60, Standard 61–80> s

| Zeit (s) | Akt | Bild – was sieht man? | Kamera | HUD-Label / Wert | Text-ID (text.de.json) | Ton (Musik/SFX/Stille, Ziel-LUFS) | Übergang | Erzählfunktion von Effekten |
|---|---|---|---|---|---|---|---|---|
| 0,0–3,5 | A | | | | title | | – | |
| 3,5–… | B | | | | l01 | | | |
| … | C | | | | | | | |
| … | D | | | | | | | |
| … | E | | | | | | | |

## Prüfung vor dem Bau

- [ ] Ereignis spätestens bei 10 s
- [ ] Alle ≤ 6 s eine sichtbare Zustandsänderung
- [ ] Monotone Eskalation; jede Zeile bringt Neues
- [ ] Ende ≤ 5 s nach der Pointe
- [ ] Blitzregel eingehalten

## Dateien der Produktion

- `timeline.json` – Zeiten, Einstellungen, Kamera, HUD-Werte, Ereignisse, Ton (Vorlage: `templates/timeline.json`)
- `text.de.json` – alle Bildschirmtexte (Struktur unten, Vorlage `templates/text.de.json`), keine Texte im Szenencode
- `scene.js` – 3D-Szene, Zustand nur aus `t` (Vorlage: `templates/scene.js`)

## text.de.json (Struktur)

```json
{
  "lang": "de",
  "number_locale": "de-DE",
  "title": { "text": "Was wäre, wenn …?", "highlight": "Schlüsselwort" },
  "hud": { "h1": { "label": "LABEL", "sub": "UNTERZEILE", "unit": " m", "scale": 1, "final": "HIER" } },
  "lines": { "l01": "Eine Zeile, drei bis zehn Wörter." }
}
```

Englische Fassung (nur auf Auftrag, `--lang en`): `text.en.json` mit `"lang": "en"`, `"number_locale": "en-US"`, Titel „What if …?“; `"unit"` und `"scale"` (Umrechnungsfaktor) für andere Einheiten – Zeiten und Szene bleiben unverändert.
