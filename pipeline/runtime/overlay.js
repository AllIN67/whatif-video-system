// Text-Ebene (HTML/CSS über dem WebGL-Canvas): Titelfrage, HUD mit Fortschrittsskala, Untertitel.
// Inhalte kommen ausschließlich aus text.<lang>.json (Sprachunabhängigkeit, Style-Guide 1.3),
// Zeiten aus timeline.json, Maße/Farben aus brand.json (Style-Guide 6.3/6.4).
import { fadeOpacity, hudAt } from './timeline.js';

const FONT_FILES = [
  ['Fraunces', 400, 'normal', 'fraunces/files/fraunces-latin-400-normal.woff2'],
  ['Fraunces', 600, 'normal', 'fraunces/files/fraunces-latin-600-normal.woff2'],
  ['Fraunces', 400, 'italic', 'fraunces/files/fraunces-latin-400-italic.woff2'],
  ['Fraunces', 600, 'italic', 'fraunces/files/fraunces-latin-600-italic.woff2'],
  ['JetBrains Mono', 400, 'normal', 'jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2'],
  ['JetBrains Mono', 700, 'normal', 'jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2'],
];

async function loadFonts() {
  for (const [family, weight, style, file] of FONT_FILES) {
    const face = new FontFace(family, `url(/node_modules/@fontsource/${file})`, { weight: String(weight), style });
    await face.load();
    document.fonts.add(face);
  }
  await document.fonts.ready;
  for (const [family, weight, style] of FONT_FILES) {
    if (!document.fonts.check(`${style} ${weight} 40px "${family}"`)) throw new Error(`Schrift ${family} ${weight} ${style} nicht geladen`);
  }
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function highlight(text, word, color) {
  const safe = esc(text);
  if (!word) return safe;
  const i = text.indexOf(word);
  if (i < 0) throw new Error(`Hervorhebung "${word}" kommt im Titel nicht vor`);
  return `${esc(text.slice(0, i))}<span style="color:${color}">${esc(word)}</span>${esc(text.slice(i + word.length))}`;
}

export async function createOverlay({ root, brand, text, timeline }) {
  await loadFonts();
  const L = brand.layout;
  const W = L.width;
  const H = L.height;
  const shadow = '0 2px 6px rgba(0,0,0,0.85), 0 0 22px rgba(0,0,0,0.65)';
  const fmtCache = new Map();
  const fmt = (v, d) => {
    const key = `${text.number_locale || 'en-US'}|${d}`;
    if (!fmtCache.has(key)) fmtCache.set(key, new Intl.NumberFormat(text.number_locale || 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));
    return fmtCache.get(key).format(v);
  };

  root.innerHTML = `
  <style>
    .wif { position:absolute; color:${brand.text}; text-shadow:${shadow}; }
    #wif-title { left:${L.safe.x0 * W}px; width:${(L.safe.x1 - L.safe.x0) * W}px; top:${L.title_top * H}px;
      font: 600 ${L.title_size}px/1.12 "${brand.fonts.serif}", serif; text-align:center; letter-spacing:-0.01em; }
    #wif-title::before { content:""; position:absolute; left:-30px; right:-30px; top:-60px; bottom:-60px;
      background: radial-gradient(ellipse at 50% 50%, ${brand.title_scrim || brand.scrim} 0%, rgba(0,0,0,0) 72%); z-index:-1; }
    #wif-hud { left:${L.hud_left}px; top:${L.hud_value_baseline * H - L.hud_value_size - L.hud_label_size - 14}px; }
    #wif-hud::before { content:""; position:absolute; left:-60px; top:-50px; width:560px; height:300px;
      background: radial-gradient(ellipse at 30% 50%, ${brand.scrim} 0%, rgba(0,0,0,0) 70%); z-index:-1; }
    #wif-hud-label { font: 700 ${L.hud_label_size}px/1 "${brand.fonts.mono}", monospace; letter-spacing:0.14em; opacity:0.75; }
    #wif-hud-value { font: 700 ${L.hud_value_size}px/1.05 "${brand.fonts.mono}", monospace; font-variant-numeric: tabular-nums; margin-top:12px; white-space:nowrap; }
    #wif-hud-bar { margin-top:14px; width:${L.hud_bar_width}px; height:${L.hud_bar_height}px; background:rgba(255,255,255,0.28); border-radius:3px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.5); }
    #wif-hud-fill { height:100%; width:0; background:${brand.signal}; }
    #wif-hud-sub { margin-top:12px; font: 400 ${L.hud_sub_size}px/1.2 "${brand.fonts.mono}", monospace; letter-spacing:0.08em; opacity:0.75; }
    #wif-line-wrap { left:${L.safe.x0 * W}px; width:${(L.safe.x1 - L.safe.x0) * W}px; top:${L.line_center * H}px; transform:translateY(-50%); text-align:center; }
    #wif-line-wrap::before { content:""; position:absolute; left:-40px; right:-40px; top:-40px; bottom:-40px;
      background: radial-gradient(ellipse at 50% 50%, ${brand.scrim} 0%, rgba(0,0,0,0) 72%); z-index:-1; }
    #wif-line { font: italic 400 ${L.line_size}px/1.22 "${brand.fonts.serif}", serif; }
    #wif-sync { position:absolute; left:${0.9 * W}px; top:${0.9 * H}px; width:64px; height:64px; background:#fff; opacity:0; }
  </style>
  <div id="wif-title" class="wif"></div>
  <div id="wif-hud" class="wif"><div id="wif-hud-label"></div><div id="wif-hud-value"></div><div id="wif-hud-bar"><div id="wif-hud-fill"></div></div><div id="wif-hud-sub"></div></div>
  <div id="wif-line-wrap" class="wif"><div id="wif-line"></div></div>
  <div id="wif-sync"></div>`;

  const $ = (id) => root.querySelector('#' + id);
  const el = { title: $('wif-title'), hud: $('wif-hud'), label: $('wif-hud-label'), value: $('wif-hud-value'), fill: $('wif-hud-fill'), sub: $('wif-hud-sub'), lineWrap: $('wif-line-wrap'), line: $('wif-line'), sync: $('wif-sync') };

  // Inhalte prüfen: jede referenzierte ID muss in der Textdatei existieren
  const lines = timeline.lines || [];
  for (const l of lines) if (!(l.id in (text.lines || {}))) throw new Error(`Text-ID "${l.id}" fehlt in text.${text.lang}.json`);
  for (const s of timeline.hud || []) if (!(s.id in (text.hud || {}))) throw new Error(`HUD-ID "${s.id}" fehlt in text.${text.lang}.json`);
  if (timeline.title && !text.title) throw new Error('Titel fehlt in der Textdatei');
  if (text.title) el.title.innerHTML = highlight(text.title.text, text.title.highlight, brand.signal);
  const syncFrames = new Set(timeline.sync_markers || []);

  let lastLineId = null;
  let lastHudId = null;
  return {
    update({ t, frame }) {
      // Titel
      const tt = timeline.title;
      el.title.style.opacity = tt ? String(fadeOpacity(t, tt.in, tt.out, 0, brand.fades.title_out)) : '0';
      // HUD
      const h = hudAt(timeline, t);
      if (!h) {
        el.hud.style.opacity = '0';
      } else {
        const def = text.hud[h.id];
        if (h.id !== lastHudId) {
          el.label.textContent = def.label;
          el.sub.textContent = def.sub || '';
          lastHudId = h.id;
        }
        const finalText = h.final && t >= h.final.at ? def.final : null;
        const shown = finalText ?? `${fmt(h.value * (def.scale ?? 1), h.decimals)}${def.unit || ''}`;
        if (el.value.textContent !== shown) el.value.textContent = shown;
        el.fill.style.width = `${(finalText ? 1 : h.progress) * 100}%`;
        // Label-Wechsel weich einblenden – aber nicht beim ersten Segment (Frame 0 zeigt den HUD sofort voll)
        const first = h.segFrom <= (timeline.hud[0]?.from ?? 0);
        const since = t - h.segFrom;
        el.label.style.opacity = String(first ? 0.75 : 0.75 * Math.min(1, 0.25 + since / brand.fades.hud_label_cross));
        el.hud.style.opacity = '1';
      }
      // Untertitel
      let op = 0;
      let cur = null;
      for (const l of lines) {
        const o = fadeOpacity(t, l.in, l.out, brand.fades.line_in, brand.fades.line_out);
        if (o > 0) {
          op = o;
          cur = l;
        }
      }
      if (cur && cur.id !== lastLineId) {
        el.line.textContent = text.lines[cur.id];
        lastLineId = cur.id;
      }
      el.lineWrap.style.opacity = String(op);
      // Synchron-Marker (nur Testproduktionen)
      el.sync.style.opacity = syncFrames.has(frame) ? '1' : '0';
    },
    // Für die Layout-Prüfung: Rechtecke aller sichtbaren Textelemente
    rects() {
      const out = [];
      for (const [name, node] of [['title', el.title], ['hud', el.hud], ['line', el.lineWrap]]) {
        if (Number(getComputedStyle(node).opacity) <= 0) continue;
        // tatsächliche Ausdehnung der Glyphen, nicht der Block-Box
        const range = document.createRange();
        range.selectNodeContents(name === 'line' ? el.line : node);
        const r = range.getBoundingClientRect();
        out.push({ name, x0: r.left / W, x1: r.right / W, y0: r.top / H, y1: r.bottom / H });
      }
      return out;
    },
  };
}
