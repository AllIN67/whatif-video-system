// Sprache der Bildschirmtexte (Style-Guide 1.3, 18.14). Eine Stelle für den Standard – Browser (stage.js) und
// Node-Werkzeuge (run, render_frames, still, validate_production) lesen ihn von hier.
// Deutsch ist seit 2026-11-07 Standard für neue Produktionen; Englisch bleibt über --lang en vollständig nutzbar
// (alle Produktionen vor der Umstellung haben nur text.en.json).
export const DEFAULT_LANG = 'de';

// Sprachspezifische Prüfregeln (tools/validate_production.mjs). Unbekannte Sprachen: keine Titelformel-Prüfung.
//   titlePrefix   – feste Titelformel (Guide 2 / 18.14)
//   prefixWords   – Wortzahl der Formel; Mehrwörter gegenüber „What if“ (2) zählen bei der Kurz-Empfehlung 18.13 S5 nicht mit
//   numberLocale  – erwartetes Präfix von text.number_locale (Zahlenformat im HUD)
export const LANG_RULES = {
  en: { titlePrefix: /^What if\b/, titleFormula: 'What if', prefixWords: 2, numberLocale: 'en' },
  de: { titlePrefix: /^Was wäre, wenn\b/, titleFormula: 'Was wäre, wenn', prefixWords: 3, numberLocale: 'de' },
};
