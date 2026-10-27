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

## text.en.json (Struktur)

```json
{
  "title": {"text": "What if …?", "highlight": "…"},
  "hud": [{"from": 0.0, "label": "…", "unit": "…", "sub": "…"}],
  "lines": [{"id": "l01", "in": 3.8, "out": 6.6, "text": "…"}],
  "end": {"text": "…"}
}
```
