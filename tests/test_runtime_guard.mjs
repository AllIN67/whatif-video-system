// Stufe 1: Echtzeit-Sperre und geseedeter Zufall.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../pipeline/server.mjs';
import { withStage } from '../pipeline/browser.mjs';

test('Echtzeit-APIs werfen nach lock(), Frames rendern', { timeout: 180000 }, async () => {
  await withStage({ selftest: '1', seed: '7' }, async (page) => {
    const r = await page.evaluate(() => window.__stage.setFrame(10));
    assert.deepEqual(r, { n: 10, t: 10 / 30 });
    for (const expr of ['Date.now()', 'performance.now()', 'requestAnimationFrame(()=>{})', 'new Date()']) {
      const msg = await page.evaluate((e) => {
        try { (0, eval)(e); return 'kein Fehler'; } catch (err) { return err.message; }
      }, expr);
      assert.match(msg, /verboten/, `${expr} müsste werfen, ergab: ${msg}`);
    }
    // Datum mit festem Argument bleibt erlaubt
    assert.equal(await page.evaluate(() => new Date(0).toISOString()), '1970-01-01T00:00:00.000Z');
    await assert.rejects(page.evaluate(() => window.__stage.setFrame(-1)), /Ungültiger Frame-Index/);
  });
});

test('Szene, die im Frame die Uhr liest, bricht ab', { timeout: 180000 }, async () => {
  await withStage({ selftest: 'cheat', seed: '7' }, async (page) => {
    await assert.rejects(page.evaluate(() => window.__stage.setFrame(0)), /Date\.now.*verboten/);
  });
});

test('Math.random ist geseedet und reproduzierbar', { timeout: 180000 }, async () => {
  const seq = [];
  for (let i = 0; i < 2; i++) {
    seq.push(await withStage({ selftest: '1', seed: '42' }, (page) => page.evaluate(() => [Math.random(), Math.random(), Math.random()])));
  }
  assert.deepEqual(seq[0], seq[1]);
});

test('Kein Echtzeit-Zugriff im Laufzeit- und Szenen-Code (statische Prüfung)', () => {
  const files = [];
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) walk(p);
      else if (/\.(m?js)$/.test(f.name)) files.push(p);
    }
  };
  walk(path.join(ROOT, 'pipeline/runtime'));
  walk(path.join(ROOT, 'productions'));
  const bad = /\b(requestAnimationFrame|setAnimationLoop|performance\.now|Date\.now|setTimeout|setInterval|THREE\.Clock|new\s+Clock)\b/;
  const offenders = [];
  for (const f of files) {
    if (f.endsWith(path.join('runtime', 'guard.js'))) continue;
    fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      if (bad.test(line) && !line.includes('muss im Render-Modus werfen')) offenders.push(`${path.relative(ROOT, f)}:${i + 1}: ${line.trim()}`);
    });
  }
  assert.deepEqual(offenders, []);
});

test('Schattenempfänger mit riesigen Dreiecken werden beim Aufbau abgelehnt', { timeout: 120000 }, async () => {
  const dir = path.join(ROOT, 'tests/fixtures/_bigground');
  fs.mkdirSync(dir, { recursive: true });
  try {
    fs.copyFileSync(path.join(ROOT, 'tests/fixtures/mini/timeline.json'), path.join(dir, 'timeline.json'));
    const scene = fs.readFileSync(path.join(ROOT, 'tests/fixtures/mini/scene.js'), 'utf8').replace('new THREE.PlaneGeometry(80, 80, 8, 8)', 'new THREE.PlaneGeometry(80, 80)');
    fs.writeFileSync(path.join(dir, 'scene.js'), scene);
    await assert.rejects(withStage({ production: 'tests/fixtures/_bigground', seed: '11' }, async () => {}), /Kantenlänge/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
