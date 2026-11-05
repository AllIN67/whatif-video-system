#!/usr/bin/env node
// Vorschaubilder einzelner Zeitpunkte einer Produktion – ohne das ganze Video zu rendern.
// Gedacht für schnelle Sichtprüfung beim Bauen von Szenen (Sekunden statt 15 Minuten).
//
//   node tools/still.mjs --production productions/<slug> --at 1,5.5,9 [--out productions/<slug>/stills] [--lang en]
//
// Ausgabe: PNG je Zeitpunkt (1080×1920) + contact.jpg (alle nebeneinander, verkleinert).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { withStage } from '../pipeline/browser.mjs';
import { ROOT } from '../pipeline/server.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const production = opt('--production');
if (!production) {
  console.error('--production fehlt');
  process.exit(1);
}
const prodDir = path.resolve(ROOT, production);
const tl = JSON.parse(fs.readFileSync(path.join(prodDir, 'timeline.json'), 'utf8'));
const times = (opt('--at') || '0').split(',').map(Number);
const out = path.resolve(opt('--out', path.join(prodDir, 'stills')));
fs.mkdirSync(out, { recursive: true });

const files = await withStage({ production: path.relative(ROOT, prodDir), lang: opt('--lang', 'en'), seed: String(tl.seed ?? 1) }, async (page, st) => {
  const done = [];
  for (const s of times) {
    const n = Math.round(s * (tl.fps || 30));
    await page.evaluate((k) => window.__stage.setFrame(k), n);
    if (st.errors.length) throw new Error(`Fehler bei ${s} s: ${st.errors.join(' | ')}`);
    const f = path.join(out, `t${s.toFixed(2).padStart(6, '0')}.png`);
    fs.writeFileSync(f, await page.screenshot({ type: 'png', timeout: 600000, clip: { x: 0, y: 0, width: 1080, height: 1920 } }));
    done.push(f);
    console.log(`${s} s → ${path.relative(ROOT, f)}`);
  }
  return done;
});

// Kontaktbogen: Bilder auf 360 px Breite, nebeneinander (max. 6 pro Zeile)
const cols = Math.min(6, files.length);
const rows = Math.ceil(files.length / cols);
const inputs = files.flatMap((f) => ['-i', f]);
const filter = files.map((_, i) => `[${i}:v]scale=360:640[v${i}]`).join(';') + ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${files.length}:layout=` +
  files.map((_, i) => `${(i % cols) * 360}_${Math.floor(i / cols) * 640}`).join('|') + `:fill=black[o]`;
if (files.length === 1) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', files[0], '-vf', 'scale=360:640', path.join(out, 'contact.jpg')]);
else execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', filter, '-map', '[o]', path.join(out, 'contact.jpg')]);
console.log(`Kontaktbogen (${cols}×${rows}) → ${path.relative(ROOT, path.join(out, 'contact.jpg'))}`);
