// Stufe 3: Bild-Render – Determinismus, Frame-Anzahl, Bildrate, Wiederaufnahme.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { renderFrames, countFrames } from '../pipeline/render_frames.mjs';
import { withStage } from '../pipeline/browser.mjs';

const FIX = 'tests/fixtures/mini';

test('Gleiche Frames in beliebiger Reihenfolge und neuer Browser-Instanz sind bit-identisch', { timeout: 300000 }, async () => {
  const order = [45, 3, 29, 30, 31, 61, 89, 3, 45];
  const runs = [];
  for (let r = 0; r < 2; r++) {
    const seq = r === 0 ? order : [...order].reverse();
    runs.push(
      await withStage({ production: FIX, seed: '11' }, async (page) => {
        const out = {};
        for (const n of seq) {
          await page.evaluate((k) => window.__stage.setFrame(k), n);
          const h = createHash('sha256').update(await page.screenshot({ type: 'png' })).digest('hex');
          out[n] = out[n] ? (assert.equal(out[n], h, `Frame ${n} innerhalb eines Laufs verschieden`), h) : h;
        }
        return out;
      }),
    );
  }
  assert.deepEqual(runs[0], runs[1]);
});

test('Render erzeugt exakt N Frames mit 30/1 CFR; Wiederaufnahme überspringt fertige Teilstücke', { timeout: 600000 }, async () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'wif-render-'));
  try {
    const r1 = await renderFrames({ production: FIX, lang: 'en', chunk: 40, out });
    assert.equal(r1.total, 90);
    assert.equal(r1.rendered, 90);
    const chunks = fs.readdirSync(path.join(out, 'chunks')).filter((f) => f.endsWith('.mkv') && !f.includes('partial')).sort();
    assert.deepEqual(chunks, ['c0000.mkv', 'c0001.mkv', 'c0002.mkv']);
    const counts = chunks.map((c) => countFrames(path.join(out, 'chunks', c)));
    assert.deepEqual(counts, [40, 40, 10]);
    const rate = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate,avg_frame_rate,width,height,codec_name', '-of', 'csv=p=0', path.join(out, 'chunks', 'c0000.mkv')]).toString().trim();
    assert.equal(rate, 'ffv1,1080,1920,30/1,30/1');
    const hashes1 = fs.readFileSync(path.join(out, 'frames.tsv'), 'utf8');
    assert.equal(hashes1.trim().split('\n').length, 91);
    // Ein Teilstück löschen → nur dieses wird neu gerendert, mit identischen Pixeln
    fs.rmSync(path.join(out, 'chunks', 'c0001.mkv'));
    const r2 = await renderFrames({ production: FIX, lang: 'en', chunk: 40, out });
    assert.equal(r2.rendered, 40);
    assert.equal(fs.readFileSync(path.join(out, 'frames.tsv'), 'utf8'), hashes1);
    // Geänderte Eingabe (Fingerabdruck) → alle Teilstücke werden neu gerendert, nicht wiederverwendet
    fs.writeFileSync(path.join(out, 'fingerprint.json'), JSON.stringify({ hash: 'veraltet', lang: 'en' }));
    const r3 = await renderFrames({ production: FIX, lang: 'en', chunk: 40, out });
    assert.equal(r3.rendered, 90);
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
});
