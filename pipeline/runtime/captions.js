// Text-Ebene für Videos mit Sprecher (HTML/CSS über dem WebGL-Canvas):
//  - Wort-für-Wort-Untertitel synchron zum Sprecher (Zeiten aus voice/words.json, erzeugt von tools/tts_kokoro.py)
//  - große animierte Einblendungen („callouts“): Zähler mit Einheit, Hook-Titel, Textkarten
// Alles ist eine reine Funktion von t (keine CSS-Animationen/Transitions – die liefen in Echtzeit).
//
// timeline.json:
//   "captions": { "words": "voice/words.json", "center_y": 0.25, "size": 92, "key_scale": 1.3, "max_words": 3,
//                 "highlight": "#FFE135", "max_width": 0.70 }
//   "callouts": [ { "id": "speed", "kind": "counter", "in": 3.6, "out": 7.6, "y": 0.58, "size": 200,
//                   "from": 0, "to": 790, "count": [3.7, 6.0], "ease": "out", "decimals": 0,
//                   "tint": [[0, "#ffffff"], [9.6, "#ff4b3e"]], "shake": [{ "t": 9.6, "dur": 1.2, "amp": 18 }] },
//                 { "id": "hook", "kind": "title", "in": 0, "out": 2.1, "y": 0.26, "size": 124, "line_at": [0, 1.1] },
//                 { "id": "note", "kind": "text", "in": 5, "out": 7, "y": 0.62, "size": 64 } ]
// text.<lang>.json: "callouts": { "<id>": { "label": "…", "unit": " MPH", "lines": ["…", "…"], "text": "…" } }
//   In Zeilen/Texten markiert *so* ein Wort in der Hervorhebungsfarbe.
import { EASE } from './timeline.js';

const FONTS = [
  ['Montserrat', 800, 'montserrat/files/montserrat-latin-800-normal.woff2'],
  ['Montserrat', 900, 'montserrat/files/montserrat-latin-900-normal.woff2'],
];
const W = 1080;
const H = 1920;

async function loadFonts() {
  for (const [family, weight, file] of FONTS) {
    const face = new FontFace(family, `url(/node_modules/@fontsource/${file})`, { weight: String(weight) });
    await face.load();
    document.fonts.add(face);
  }
  await document.fonts.ready;
  for (const [family, weight] of FONTS) if (!document.fonts.check(`${weight} 40px "${family}"`)) throw new Error(`Schrift ${family} ${weight} nicht geladen`);
}

const clamp01 = (x) => Math.min(1, Math.max(0, x));
// Überschwingende Pop-Kurve 0→1 (back-out)
const backOut = (x) => {
  const c = 1.9;
  const y = clamp01(x) - 1;
  return 1 + (c + 1) * y * y * y + c * y * y;
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// Kontur: Ring aus harten Schatten + weicher Schlagschatten (zuverlässiger als text-stroke)
const outline = (r, soft = 0.55) => {
  const parts = [];
  for (let a = 0; a < 360; a += 15) {
    const x = (r * Math.cos((a * Math.PI) / 180)).toFixed(1);
    const y = (r * Math.sin((a * Math.PI) / 180)).toFixed(1);
    parts.push(`${x}px ${y}px 0 #000`);
  }
  parts.push(`0 ${Math.round(r * 0.9)}px ${Math.round(r * 2.2)}px rgba(0,0,0,${soft})`);
  return parts.join(',');
};
const marked = (s, color) => esc(s).replace(/\*([^*]+)\*/g, `<span style="color:${color}">$1</span>`);
// Anzeige ohne Satzzeichen am Ende (Untertitel-Konvention), Fragezeichen/Ausrufezeichen bleiben
const clean = (s) => s.replace(/[.,;:…]+$/g, '').replace(/^["']|["']$/g, '');
const nWords = (s) => s.trim().split(/\s+/).length;

// Seiten bilden: höchstens max_words Wörter; Umbruch an Satzende, an Kommas (ab 2 Wörtern), an Pausen;
// Schlüsselbegriffe aus mehreren Wörtern stehen allein.
export function paginate(units, { maxWords = 3, gap = 0.6, tail = 0.35 } = {}) {
  const pages = [];
  let cur = [];
  const close = () => {
    if (cur.length) pages.push(cur);
    cur = [];
  };
  // Seite nicht mit einem Funktionswort beenden („SURGE OVER THE“): es wandert auf die nächste Seite
  const weak = /^(the|a|an|of|at|in|on|to|for|and|but|so|you're|you'd|than|that|any|over)$/i;
  units.forEach((u, i) => {
    const w = nWords(u.display);
    const words = cur.reduce((a, c) => a + nWords(c.display), 0);
    if (cur.length && (words + w > maxWords || (u.key && w > 1))) close();
    cur.push(u);
    const next = units[i + 1];
    const words2 = words + w;
    const hard = u.brk === 'sentence' || (u.brk === 'clause' && words2 >= 2) || (u.key && w > 1) || !next || next.start - u.end > gap;
    if (hard) close();
    else if (words2 >= maxWords) {
      if (cur.length > 1 && weak.test(clean(u.display))) {
        cur.pop();
        close();
        cur.push(u);
      } else close();
    }
  });
  close();
  // Ein-Wort-Seiten unter 0,35 s flackern nur: an die Nachbarseite hängen, wenn die Wortgrenze es erlaubt
  const count = (p) => p.reduce((a, c) => a + nWords(c.display), 0);
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    if (p.length !== 1 || p[0].end - p[0].start >= 0.35 || p[0].key) continue;
    if (pages[i + 1] && count(pages[i + 1]) + count(p) <= maxWords && pages[i + 1][0].start - p[0].end < gap) {
      pages[i + 1].unshift(p[0]);
      pages.splice(i--, 1);
    } else if (pages[i - 1] && count(pages[i - 1]) + count(p) <= maxWords && p[0].start - pages[i - 1].at(-1).end < gap) {
      pages[i - 1].push(p[0]);
      pages.splice(i--, 1);
    }
  }
  return pages.map((p, i) => {
    const next = pages[i + 1];
    const end = p[p.length - 1].end + tail;
    return { units: p, in: p[0].start - 0.04, out: next ? Math.min(end, next[0].start - 0.04) : end };
  });
}

export async function createCaptions({ root, text, timeline, words }) {
  await loadFonts();
  const cap = timeline.captions || null;
  const hl = cap?.highlight || '#FFE135';
  const callouts = timeline.callouts || [];
  const ctext = text.callouts || {};
  for (const c of callouts) if (!(c.id in ctext)) throw new Error(`Callout-ID "${c.id}" fehlt in text.${text.lang}.json`);

  const wrap = document.createElement('div');
  wrap.id = 'cap-root';
  wrap.innerHTML = `<style>
    #cap-root { position:absolute; inset:0; font-family:"Montserrat", sans-serif; color:#fff; }
    .cap-page { position:absolute; left:${W * 0.5}px; width:${(cap?.max_width ?? 0.7) * W}px; transform-origin:50% 50%;
      text-align:center; text-transform:uppercase; line-height:1.08; font-weight:800; }
    .cap-u { display:inline-block; margin:0 0.13em; transform-origin:50% 60%; text-shadow:${outline(7)}; }
    .co { position:absolute; left:${W * 0.5}px; text-align:center; transform-origin:50% 50%; white-space:nowrap; font-weight:900; }
    .co-label { font-weight:800; letter-spacing:0.06em; text-shadow:${outline(5)}; }
    .co-num { font-variant-numeric: tabular-nums; letter-spacing:-0.02em; line-height:1; }
    .co-unit { font-weight:900; }
  </style>`;
  root.appendChild(wrap);

  // Untertitel-Seiten vorbereiten
  let pages = [];
  const pageEls = [];
  if (cap) {
    if (!words?.units) throw new Error('captions.words: Datei ohne "units" (tools/tts_kokoro.py ausführen)');
    pages = paginate(words.units.filter((u) => u.captions !== false), { maxWords: cap.max_words ?? 3 });
    for (const p of pages) {
      const el = document.createElement('div');
      el.className = 'cap-page';
      el.style.fontSize = `${cap.size ?? 92}px`;
      const ks = cap.key_scale ?? 1.3;
      el.innerHTML = p.units.map((u) => `<span class="cap-u"${u.key ? ` style="font-size:${ks}em"` : ''}>${esc(clean(u.display))}</span>`).join(' ');
      el.style.opacity = '0';
      wrap.appendChild(el);
      pageEls.push({ el, spans: [...el.querySelectorAll('.cap-u')], page: p });
    }
  }

  // Einblendungen vorbereiten
  const fmtCache = new Map();
  const fmt = (v, d) => {
    if (!fmtCache.has(d)) fmtCache.set(d, new Intl.NumberFormat(text.number_locale || 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));
    return fmtCache.get(d).format(v);
  };
  const coEls = callouts.map((c) => {
    const def = ctext[c.id];
    const el = document.createElement('div');
    el.className = 'co';
    const size = c.size ?? 180;
    if (c.kind === 'counter') {
      el.innerHTML = `${def.label ? `<div class="co-label" style="font-size:${Math.round(size * 0.22)}px">${marked(def.label, hl)}</div>` : ''}
        <div style="text-shadow:${outline(Math.max(7, size * 0.05))}"><span class="co-num" style="font-size:${size}px"></span><span class="co-unit" style="font-size:${Math.round(size * 0.42)}px">${esc(def.unit || '')}</span></div>
        ${def.sub ? `<div class="co-label" style="font-size:${Math.round(size * 0.2)}px;opacity:0.92">${marked(def.sub, hl)}</div>` : ''}`;
    } else if (c.kind === 'title') {
      el.innerHTML = def.lines.map((l) => `<div class="co-line" style="font-size:${size}px;line-height:1.0;transform-origin:50% 0;text-shadow:${outline(Math.max(7, size * 0.06))}"><span>${marked(l, hl)}</span></div>`).join('');
      el.style.textTransform = 'uppercase';
    } else {
      el.innerHTML = `<div style="font-size:${size}px;line-height:1.1;text-shadow:${outline(Math.max(6, size * 0.07))}">${marked(def.text, hl)}</div>`;
    }
    el.style.opacity = '0';
    wrap.appendChild(el);
    return { c, el, num: el.querySelector('.co-num'), unit: el.querySelector('.co-unit'), lines: [...el.querySelectorAll('.co-line')], h: 0 };
  });

  const maxW = (timeline.callout_max_width ?? 0.72) * W;
  const place = (el, cy, scale, dx = 0, dy = 0, rot = 0) => {
    const h = el.offsetHeight;
    el.style.top = `${cy * H - h / 2}px`;
    el.style.transform = `translate(-50%, 0) translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${scale.toFixed(4)}) rotate(${rot.toFixed(3)}deg)`;
  };
  const tintAt = (tint, t, fallback) => {
    let col = fallback;
    for (const [tt, c] of tint || []) if (t >= tt) col = c;
    return col;
  };
  const shakeAt = (shakes, t) => {
    let x = 0;
    let y = 0;
    let r = 0;
    for (const s of shakes || []) {
      if (t < s.t || t > s.t + s.dur) continue;
      const k = 1 - (t - s.t) / s.dur;
      const a = s.amp * k * k;
      x += a * Math.sin(t * 71.3 + 1.7);
      y += a * 0.7 * Math.sin(t * 57.1 + 0.3);
      r += a * 0.08 * Math.sin(t * 43.7);
    }
    return [x, y, r];
  };

  return {
    update({ t }) {
      // Untertitel
      for (const { el, spans, page } of pageEls) {
        if (t < page.in || t >= page.out) {
          if (el.style.opacity !== '0') el.style.opacity = '0';
          continue;
        }
        const since = t - page.in;
        const until = page.out - t;
        el.style.opacity = String(Math.min(1, since / 0.06, until / 0.08));
        page.units.forEach((u, i) => {
          const sp = spans[i];
          const active = t >= u.start - 0.02 && (t < u.end + 0.02 || i === page.units.length - 1 || t < page.units[i + 1].start - 0.02);
          const spoken = t >= u.start - 0.02;
          // Pop beim Einsetzen des Worts (Schlüsselwörter deutlich stärker)
          const p = clamp01((t - (u.start - 0.02)) / (u.key ? 0.26 : 0.14));
          const pop = spoken ? (u.key ? 0.72 + 0.28 * backOut(p) : 0.9 + 0.1 * backOut(p)) : 1;
          sp.style.transform = `scale(${pop.toFixed(4)})`;
          sp.style.color = active || (u.key && spoken) ? hl : '#ffffff';
        });
        const enter = 0.86 + 0.14 * backOut(clamp01(since / 0.16));
        place(el, cap.center_y ?? 0.25, enter);
      }
      // Einblendungen
      for (const o of coEls) {
        const { c, el } = o;
        if (t < c.in || t >= c.out) {
          if (el.style.opacity !== '0') el.style.opacity = '0';
          continue;
        }
        const since = t - c.in;
        const until = c.out - t;
        // Einblendungen ab Videobeginn stehen in Frame 0 schon voll da (Hook)
        const op = Math.min(c.in === 0 ? 1 : since / 0.08, 1, until / 0.15);
        el.style.opacity = String(op);
        let scale = c.pop === false ? 1 : 0.55 + 0.45 * backOut(clamp01(since / 0.28));
        scale *= 1 - 0.06 * clamp01(1 - until / 0.15);
        const col = tintAt(c.tint, t, '#ffffff');
        if (c.kind === 'counter') {
          const [t0, t1] = c.count || [c.in, c.in];
          const x = t1 > t0 ? clamp01((t - t0) / (t1 - t0)) : 1;
          const v = c.from + (c.to - c.from) * (EASE[c.ease || 'out'] || EASE.out)(x);
          const s = fmt(v, c.decimals ?? 0);
          if (o.num.textContent !== s) o.num.textContent = s;
          o.num.style.color = col;
          o.unit.style.color = col;
          // kleiner Puls beim Erreichen des Zielwerts
          if (t1 > t0 && t >= t1) scale *= 1 + 0.12 * Math.max(0, 1 - (t - t1) / 0.25);
        } else if (c.kind === 'title') {
          o.lines.forEach((ln, i) => {
            const at = (c.line_at || [])[i] ?? c.in;
            // Zeilen ab Videobeginn stehen in Frame 0 bereits voll da (Hook: kein Einblenden)
            const first = at <= c.in && c.in === 0;
            const k = first ? 1 : clamp01((t - at) / 0.22);
            // jede Zeile einzeln auf die Breite einpassen (lange Zeilen kleiner, kurze groß)
            const fit = Math.min(1, maxW / Math.max(1, ln.firstElementChild.offsetWidth));
            ln.style.opacity = String(t >= at ? (first ? 1 : Math.min(1, (t - at) / 0.05)) : 0);
            ln.style.transform = `scale(${((t >= at ? 0.6 + 0.4 * backOut(k) : 0.6) * fit).toFixed(4)})`;
            ln.style.height = `${(ln.firstElementChild.offsetHeight * fit).toFixed(1)}px`;
          });
          el.style.color = col;
        } else {
          el.style.color = col;
        }
        const [dx, dy, r] = shakeAt(c.shake, t);
        // Einpassen in die Breite (Sicherheitszone): Titelzeilen passen sich selbst ein
        if (c.kind !== 'title') scale *= Math.min(1, maxW / Math.max(1, el.scrollWidth));
        place(el, c.y ?? 0.5, scale, dx, dy, r);
      }
    },
    pages: () => pages,
    // Für Layout-/Sicherheitszonen-Prüfung: sichtbare Textflächen (Anteile der Bildgröße)
    rects() {
      const out = [];
      for (const el of wrap.querySelectorAll('.cap-page, .co')) {
        if (Number(el.style.opacity) <= 0) continue;
        const r = el.getBoundingClientRect();
        out.push({ name: el.className, x0: r.left / W, x1: r.right / W, y0: r.top / H, y1: r.bottom / H });
      }
      return out;
    },
  };
}
