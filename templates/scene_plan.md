# Szenenplan – <Titel>

- Slug: `<slug>`
- Frage: „What if …?“
- HUD-Messgröße: <Label> · Start <Wert> → Ende <Wert/„HERE“/„0 %“> · Einheit (EN) <…> / (DE) <…>
- Kamera-Paradigma: P1 / P2 / P3 / P4 – Begründung: <…>
- Pointe/Wendung: <…>
- Geplante Länge: <61–80> s

| Zeit (s) | Akt | Bild – was sieht man? | Kamera | HUD-Label / Wert | Text-ID (text.en.json) | Ton (Musik/SFX/Stille, Ziel-LUFS) | Übergang | Erzählfunktion von Effekten |
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
- `text.en.json` – alle Bildschirmtexte (Struktur unten), keine Texte im Szenencode
- `scene.js` – 3D-Szene, Zustand nur aus `t` (Vorlage: `templates/scene.js`)

## text.en.json (Struktur)

```json
{
  "lang": "en",
  "number_locale": "en-US",
  "title": { "text": "What if …?", "highlight": "Schlüsselwort" },
  "hud": { "h1": { "label": "LABEL", "sub": "UNTERZEILE", "unit": " m", "scale": 1, "final": "HERE" } },
  "lines": { "l01": "Eine Zeile, drei bis zehn Wörter." }
}
```

Für eine metrische/deutsche Fassung `text.de.json` mit `"number_locale": "de-DE"`, `"unit"` und `"scale"` (Umrechnungsfaktor) anlegen – Zeiten und Szene bleiben unverändert.
