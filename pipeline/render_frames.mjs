#!/usr/bin/env node
// Rendert alle Frames einer Produktion deterministisch (Frame n ↔ t = n/30) in verlustfreie Teilstücke.
//
//   node pipeline/render_frames.mjs --production productions/<slug> [--lang en] [--chunk 300]
//                                   [--from F --to F] [--force] [--hashes]
//
// Ausgabe: <production>/render/chunks/cNNNN.mkv (FFV1, RGB, verlustfrei) + render/frames.tsv (Frame, SHA-256 des PNG).
// Fertige Teilstücke werden übersprungen (Wiederaufnahme), sofern ihre Frame-Zahl stimmt.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { startServer, ROOT } from './server.mjs';
import { launchStage } from './browser.mjs';

export function parseArgs(argv) {
  const a = { lang: 'en', chunk: 300, force: false, hashes: true };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const v = () => argv[++i];
    if (k === '--production') a.production = v();
    else if (k === '--lang') a.lang = v();
    else if (k === '--chunk') a.chunk = Number(v());
    else if (k === '--from') a.from = Number(v());
    else if (k === '--to') a.to = Number(v());
    else if (k === '--out') a.out = v();
    else if (k === '--force') a.force = true;
    else throw new Error(`Unbekannte Option ${k}`);
  }
  if (!a.production) throw new Error('--production fehlt');
  return a;
}

export function countFrames(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', file]).toString().trim();
  return Number(out);
}

function encodeChunk(file) {
  // PNG-Bilder über eine Pipe → FFV1 (verlustfrei, RGB). Kein verlustbehafteter Schritt vor dem Endencode.
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-',
    '-c:v', 'ffv1', '-level', '3', '-g', '1', '-slicecrc', '1', '-pix_fmt', 'bgr0', '-r', '30', file], { stdio: ['pipe', 'inherit', 'pipe'] });
  let err = '';
  ff.stderr.on('data', (d) => (err += d));
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg (Teilstück): ${err}`)))));
  return {
    write: (buf) => (ff.stdin.write(buf) ? Promise.resolve() : new Promise((r) => ff.stdin.once('drain', r))),
    end: async () => {
      ff.stdin.end();
      await done;
    },
  };
}

// Fingerabdruck aller Eingaben, die ein Bild beeinflussen. Ändert sich einer davon, sind fertige
// Teilstücke veraltet und werden verworfen (sonst enthielte das Video alte Frames).
export function inputFingerprint(prodDir, lang) {
  const h = createHash('sha256');
  const add = (file) => {
    h.update(path.relative(ROOT, file));
    h.update(fs.readFileSync(file));
  };
  const walk = (dir, skip) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(dir, e.name);
      if (skip.includes(e.name)) continue;
      if (e.isDirectory()) walk(p, skip);
      else if (!/\.md$/.test(e.name) && !(/^text\./.test(e.name) && e.name !== `text.${lang}.json`)) add(p);
    }
  };
  walk(prodDir, ['render', 'qa', 'LOG.md']);
  walk(path.join(ROOT, 'pipeline', 'runtime'), []);
  for (const pkg of ['three', '@fontsource/fraunces', '@fontsource/jetbrains-mono']) {
    h.update(pkg + JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules', pkg, 'package.json'), 'utf8')).version);
  }
  return h.digest('hex').slice(0, 24);
}

export async function renderFrames(opts) {
  const prodDir = path.resolve(ROOT, opts.production);
  const rel = path.relative(ROOT, prodDir);
  const tl = JSON.parse(fs.readFileSync(path.join(prodDir, 'timeline.json'), 'utf8'));
  const outDir = path.resolve(opts.out || path.join(prodDir, 'render'));
  const chunkDir = path.join(outDir, 'chunks');
  fs.mkdirSync(chunkDir, { recursive: true });
  const fpFile = path.join(outDir, 'fingerprint.json');
  const fp = inputFingerprint(prodDir, opts.lang);
  const oldFp = fs.existsSync(fpFile) ? JSON.parse(fs.readFileSync(fpFile, 'utf8')).hash : null;
  if (oldFp !== fp) {
    const stale = fs.readdirSync(chunkDir).filter((f) => f.endsWith('.mkv'));
    if (stale.length) console.log(`Eingaben geändert (Fingerabdruck ${oldFp} → ${fp}): ${stale.length} Teilstücke verworfen`);
    for (const f of stale) fs.rmSync(path.join(chunkDir, f));
    fs.rmSync(path.join(outDir, 'frames.tsv'), { force: true });
  }
  fs.writeFileSync(fpFile, JSON.stringify({ hash: fp, lang: opts.lang }, null, 1));

  const srv = await startServer();
  const { browser, page, errors } = await launchStage(srv.url, { production: rel, lang: opts.lang, seed: String(tl.seed ?? 1) });
  const total = await page.evaluate(() => window.__stage.total);
  const from = opts.from ?? 0;
  const to = Math.min(opts.to ?? total, total);
  const hashFile = path.join(outDir, 'frames.tsv');
  const hashes = new Map();
  if (fs.existsSync(hashFile)) {
    for (const line of fs.readFileSync(hashFile, 'utf8').trim().split('\n').slice(1)) {
      const [f, h] = line.split('\t');
      if (f) hashes.set(Number(f), h);
    }
  }
  const t0 = process.hrtime.bigint();
  let rendered = 0;
  try {
    for (let c0 = Math.floor(from / opts.chunk) * opts.chunk; c0 < to; c0 += opts.chunk) {
      const c1 = Math.min(c0 + opts.chunk, total);
      const file = path.join(chunkDir, `c${String(c0 / opts.chunk).padStart(4, '0')}.mkv`);
      if (!opts.force && fs.existsSync(file) && countFrames(file) === c1 - c0) {
        console.log(`Teilstück ${path.basename(file)} vorhanden (${c1 - c0} Frames) – übersprungen`);
        continue;
      }
      const tmp = file + '.partial.mkv';
      const enc = encodeChunk(tmp);
      for (let n = c0; n < c1; n++) {
        const r = await page.evaluate((k) => window.__stage.setFrame(k), n);
        if (r.n !== n) throw new Error(`Bühne meldet Frame ${r.n} statt ${n}`);
        if (errors.length) throw new Error(`Fehler in der Bühne bei Frame ${n}: ${errors.join(' | ')}`);
        const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 } });
        hashes.set(n, createHash('sha256').update(png).digest('hex').slice(0, 16));
        await enc.write(png);
        rendered++;
        if (rendered % 100 === 0) {
          const s = Number(process.hrtime.bigint() - t0) / 1e9;
          console.log(`  Frame ${n + 1}/${total} · ${(s / rendered).toFixed(2)} s/Frame · Rest ≈ ${(((to - n - 1) * s) / rendered / 60).toFixed(1)} min`);
        }
      }
      await enc.end();
      const got = countFrames(tmp);
      if (got !== c1 - c0) throw new Error(`${path.basename(file)}: ${got} Frames statt ${c1 - c0}`);
      fs.renameSync(tmp, file);
      console.log(`Teilstück ${path.basename(file)}: Frames ${c0}–${c1 - 1} ✓`);
    }
  } finally {
    const lines = ['frame\tpng_sha256_16', ...[...hashes.entries()].sort((a, b) => a[0] - b[0]).map(([f, h]) => `${f}\t${h}`)];
    fs.writeFileSync(hashFile, lines.join('\n') + '\n');
    await browser.close();
    await srv.close();
  }
  const secs = Number(process.hrtime.bigint() - t0) / 1e9;
  return { total, rendered, seconds: secs, chunkDir, hashFile };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const opts = parseArgs(process.argv.slice(2));
  renderFrames(opts)
    .then((r) => console.log(`Fertig: ${r.rendered} Frames neu gerendert (gesamt ${r.total}) in ${(r.seconds / 60).toFixed(1)} min`))
    .catch((e) => {
      console.error(String(e.stack || e));
      process.exit(1);
    });
}
