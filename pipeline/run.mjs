#!/usr/bin/env node
// Gesamtablauf einer Produktion:
//   validieren → Frames rendern → Ton mischen → kodieren → video_qa.py → inspect_frames.py
//
//   node pipeline/run.mjs --production productions/<slug> [--lang en] [--skip-validate] [--qa-ignore-length]
//
// Bricht beim ersten Fehler ab. Schreibt render/run_log.json (Befehle, Git-Stand, Zeiten, Ergebnisse).
// Bereits fertige Frame-Teilstücke werden wiederverwendet (Wiederaufnahme nach Abbruch).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { ROOT } from './server.mjs';
import { renderFrames } from './render_frames.mjs';
import { encode } from './encode.mjs';
import { validate, loadWords } from '../tools/validate_production.mjs';

function git(args) {
  try {
    return execFileSync('git', args, { cwd: ROOT }).toString().trim();
  } catch {
    return null;
  }
}

function step(log, name, fn) {
  const t0 = process.hrtime.bigint();
  console.log(`\n=== ${name} ===`);
  const res = fn();
  const finish = (r) => {
    log.steps.push({ name, seconds: Number(process.hrtime.bigint() - t0) / 1e9, result: r });
    return r;
  };
  return res instanceof Promise ? res.then(finish) : finish(res);
}

function py(args) {
  const p = spawnSync('python3', args, { cwd: ROOT, stdio: 'inherit' });
  return p.status;
}

export async function run({ production, lang = 'en', skipValidate = false, qaIgnoreLength = false }) {
  const prodDir = path.resolve(ROOT, production);
  const rel = path.relative(ROOT, prodDir);
  const renderDir = path.join(prodDir, 'render');
  const qaDir = path.join(prodDir, 'qa');
  fs.mkdirSync(renderDir, { recursive: true });
  const log = {
    production: rel,
    lang,
    git_commit: git(['rev-parse', 'HEAD']),
    git_dirty: (git(['status', '--porcelain']) || '').length > 0,
    started: new Date().toISOString(),
    steps: [],
  };
  const save = () => fs.writeFileSync(path.join(renderDir, 'run_log.json'), JSON.stringify(log, null, 1));
  try {
    // Sprecher (nur wenn die Produktion voiceover.json hat): Stimme + Wortzeiten vor allem anderen,
    // weil Untertitel (Bild) und Mischung (Ton) davon abhängen. Unveränderte Eingaben werden übersprungen.
    if (fs.existsSync(path.join(prodDir, 'voiceover.json'))) {
      await step(log, 'Sprecher (tts_kokoro.py)', () => {
        if (py(['tools/tts_kokoro.py', rel]) !== 0) throw new Error('tts_kokoro.py fehlgeschlagen');
        return { words: path.relative(ROOT, path.join(prodDir, 'voice', 'words.json')) };
      });
    }
    if (!skipValidate) {
      await step(log, 'Validierung', () => {
        const tl = JSON.parse(fs.readFileSync(path.join(prodDir, 'timeline.json'), 'utf8'));
        const tx = JSON.parse(fs.readFileSync(path.join(prodDir, `text.${lang}.json`), 'utf8'));
        const r = validate(tl, tx, { lang, wordTimes: loadWords(prodDir, tl) });
        for (const w of r.warnings) console.log(`⚠️  ${w}`);
        if (r.errors.length) {
          for (const e of r.errors) console.log(`❌ ${e}`);
          throw new Error(`Validierung: ${r.errors.length} Fehler`);
        }
        return r;
      });
    }
    await step(log, 'Frames rendern', () => renderFrames({ production: rel, lang, chunk: 300 }));
    await step(log, 'Ton mischen', () => {
      if (py(['tools/audio_mix.py', rel]) !== 0) throw new Error('audio_mix.py fehlgeschlagen');
      return JSON.parse(fs.readFileSync(path.join(renderDir, 'audio', 'mix_report.json'), 'utf8'));
    });
    const enc = await step(log, 'Kodieren', () => encode({ production: rel }));
    const qa = await step(log, 'QA (video_qa.py --mode render)', () => {
      const args = ['tools/video_qa.py', path.relative(ROOT, enc.final), '--out', path.relative(ROOT, qaDir), '--mode', 'render'];
      args.push('--plan', path.relative(ROOT, path.join(prodDir, 'timeline.json')));
      if (qaIgnoreLength) args.push('--ignore-length');
      const code = py(args);
      const status = { 0: 'PASS', 2: 'REVIEW', 1: 'FAIL' }[code] || `Fehler (Exit ${code})`;
      return { exit: code, status };
    });
    await step(log, 'Bildstreifen (inspect_frames.py)', () => {
      const fps = JSON.parse(fs.readFileSync(path.join(prodDir, 'timeline.json'), 'utf8')).fps || 30;
      const code = py(['tools/inspect_frames.py', path.relative(ROOT, enc.final), '--fps', String(fps), '--report', path.relative(ROOT, path.join(qaDir, 'report.json')), '--out', path.relative(ROOT, path.join(qaDir, 'strips'))]);
      if (code !== 0) throw new Error('inspect_frames.py fehlgeschlagen');
      return { strips: fs.readdirSync(path.join(qaDir, 'strips')).length };
    });
    log.final = enc.final;
    log.qa_status = qa.status;
    log.finished = new Date().toISOString();
    save();
    console.log(`\nFertig: ${path.relative(ROOT, enc.final)} · QA ${qa.status} · Bericht ${path.relative(ROOT, path.join(qaDir, 'report.md'))}`);
    console.log('Hinweis: Status ist höchstens „technisch geprüft“ nach vollständiger Sichtprüfung; die Hörprüfung durch einen Menschen steht aus.');
    return log;
  } catch (e) {
    log.error = String(e.message || e);
    save();
    throw e;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = process.argv.slice(2);
  const get = (k) => (a.includes(k) ? a[a.indexOf(k) + 1] : undefined);
  run({ production: get('--production'), lang: get('--lang') || 'en', skipValidate: a.includes('--skip-validate'), qaIgnoreLength: a.includes('--qa-ignore-length') })
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(`\nABBRUCH: ${e.message || e}`);
      process.exit(1);
    });
}
