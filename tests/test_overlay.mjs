// Stufe 4: Text-Ebene – Schriften geladen, Inhalte/Zeiten korrekt, Sicherheitszone eingehalten.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { withStage } from '../pipeline/browser.mjs';
import { ROOT } from '../pipeline/server.mjs';

const FIX = 'tests/fixtures/text';
const brand = JSON.parse(fs.readFileSync(path.join(ROOT, 'pipeline/runtime/brand.json'), 'utf8'));

test('Titel, HUD, Untertitel: Inhalte, Zeiten, Sicherheitszone, Schriften', { timeout: 300000 }, async () => {
  const outDir = process.env.WIF_SHOT_DIR; // optional: Screenshots für die Sichtprüfung
  await withStage({ production: FIX, seed: '11' }, async (page) => {
    const fonts = await page.evaluate(() => ['600 78px "Fraunces"', 'italic 400 54px "Fraunces"', '700 80px "JetBrains Mono"'].map((f) => document.fonts.check(f)));
    assert.deepEqual(fonts, [true, true, true]);
    const S = brand.layout.safe;
    const states = {};
    for (const n of [0, 15, 45, 59, 61, 75, 86, 89]) {
      await page.evaluate((k) => window.__stage.setFrame(k), n);
      const st = await page.evaluate(() => ({
        rects: window.__stage.layoutRects(),
        title: document.querySelector('#wif-title').textContent,
        titleOp: Number(document.querySelector('#wif-title').style.opacity),
        value: document.querySelector('#wif-hud-value').textContent,
        label: document.querySelector('#wif-hud-label').textContent,
        labelOp: Number(document.querySelector('#wif-hud-label').style.opacity),
        line: document.querySelector('#wif-line').textContent,
        lineOp: Number(document.querySelector('#wif-line-wrap').style.opacity),
        sync: document.querySelector('#wif-sync').style.opacity,
        fill: document.querySelector('#wif-hud-fill').style.width,
      }));
      states[n] = st;
      for (const r of st.rects) {
        assert.ok(r.x0 >= S.x0 - 1e-3 && r.x1 <= S.x1 + 1e-3 && r.y0 >= S.y0 - 1e-3 && r.y1 <= S.y1 + 1e-3, `Frame ${n}: ${r.name} außerhalb der Sicherheitszone ${JSON.stringify(r)}`);
      }
      if (outDir) await page.screenshot({ path: path.join(outDir, `overlay_${String(n).padStart(3, '0')}.png`) });
    }
    // Frame 0: Titel + HUD sofort sichtbar (Style-Guide 2)
    assert.equal(states[0].titleOp, 1);
    assert.equal(states[0].title, 'What if a star fell on your town tonight?');
    assert.equal(states[0].value, '21,575 mi');
    assert.equal(states[0].label, 'ALTITUDE');
    assert.equal(states[0].labelOp, 0.75); // kein Einblenden am Videoanfang
    // HUD ändert sich, Label wechselt bei 2 s, Endtext „HERE“ ab 2,9 s
    assert.notEqual(states[15].value, states[0].value);
    assert.equal(states[61].label, 'SHOCKWAVE');
    assert.equal(states[89].value, 'HERE');
    assert.equal(states[89].fill, '100%');
    // Untertitel wechselt, Titel ist nach 2 s ausgeblendet
    assert.equal(states[15].line, 'A new light appears in the morning sky.');
    assert.equal(states[75].line, 'Every window in town is shaking now, and nobody knows why.');
    assert.equal(states[61].titleOp, 0);
    assert.equal(states[45].lineOp, 0); // Pause zwischen den Zeilen
    // Synchron-Marker genau auf Frame 15 und 75
    assert.equal(states[15].sync, '1');
    assert.equal(states[45].sync, '0');
    assert.equal(states[75].sync, '1');
  });
});

test('Fehlende Text-ID bricht den Aufbau ab', { timeout: 120000 }, async () => {
  const dir = path.join(ROOT, 'tests/fixtures/text_broken');
  fs.mkdirSync(dir, { recursive: true });
  try {
    fs.copyFileSync(path.join(ROOT, FIX, 'scene.js'), path.join(dir, 'scene.js'));
    fs.copyFileSync(path.join(ROOT, FIX, 'timeline.json'), path.join(dir, 'timeline.json'));
    const text = JSON.parse(fs.readFileSync(path.join(ROOT, FIX, 'text.en.json'), 'utf8'));
    delete text.lines.l02;
    fs.writeFileSync(path.join(dir, 'text.en.json'), JSON.stringify(text));
    await assert.rejects(withStage({ production: 'tests/fixtures/text_broken', seed: '11' }, async () => {}), /Text-ID "l02" fehlt/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('HUD-Akzente (Verlust/Warnung) und Endkarte', { timeout: 300000 }, async () => {
  const dir = path.join(ROOT, 'tests/fixtures/text_endcard');
  fs.mkdirSync(dir, { recursive: true });
  try {
    fs.copyFileSync(path.join(ROOT, FIX, 'scene.js'), path.join(dir, 'scene.js'));
    const tl = JSON.parse(fs.readFileSync(path.join(ROOT, FIX, 'timeline.json'), 'utf8'));
    tl.hud[0].flashes = [{ t: 0.5, kind: 'loss' }, { t: 1.2, kind: 'warn' }];
    tl.lines = tl.lines.filter((l) => l.out <= 2.0);
    tl.endcard = { in: 2.0, center: 0.3 };
    fs.writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify(tl));
    const text = JSON.parse(fs.readFileSync(path.join(ROOT, FIX, 'text.en.json'), 'utf8'));
    text.endcard = { title: 'Would you always tell the truth?', sub: 'Even if it hurt someone you love?' };
    fs.writeFileSync(path.join(dir, 'text.en.json'), JSON.stringify(text));
    const S = brand.layout.safe;
    await withStage({ production: 'tests/fixtures/text_endcard', seed: '11' }, async (page) => {
      const at = async (n) => {
        await page.evaluate((k) => window.__stage.setFrame(k), n);
        return page.evaluate(() => ({
          color: document.querySelector('#wif-hud-value').style.color,
          end: Number(document.querySelector('#wif-end').style.opacity),
          endText: document.querySelector('#wif-end-title').textContent,
          rects: window.__stage.layoutRects(),
        }));
      };
      const before = await at(14);
      const loss = await at(15); // Akzent beginnt genau auf dem Frame (0,5 s)
      const warn = await at(46); // Mitte des Warnpulses
      const after = await at(59); // nach Ende des Warnpulses (1,2 s + 0,7 s)
      const end = await at(89);
      assert.equal(before.color, 'rgb(255, 255, 255)');
      assert.equal(loss.color, 'rgb(255, 69, 69)');
      assert.notEqual(warn.color, 'rgb(255, 255, 255)');
      assert.notEqual(warn.color, 'rgb(255, 69, 69)');
      assert.equal(after.color, 'rgb(255, 255, 255)');
      assert.equal(before.end, 0);
      assert.equal(end.end, 1);
      assert.equal(end.endText, 'Would you always tell the truth?');
      const r = end.rects.find((x) => x.name === 'endcard');
      assert.ok(r, 'Endkarte fehlt in layoutRects');
      assert.ok(r.x0 >= S.x0 - 1e-3 && r.x1 <= S.x1 + 1e-3 && r.y0 >= S.y0 - 1e-3 && r.y1 <= S.y1 + 1e-3, `Endkarte außerhalb der Sicherheitszone ${JSON.stringify(r)}`);
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
