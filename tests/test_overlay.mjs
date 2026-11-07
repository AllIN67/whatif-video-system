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
  await withStage({ production: FIX, lang: 'en', seed: '11' }, async (page) => {
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
    await assert.rejects(withStage({ production: 'tests/fixtures/text_broken', lang: 'en', seed: '11' }, async () => {}), /Text-ID "l02" fehlt/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// Guide 18.14: Deutsch ist Standardsprache. Ohne lang-Parameter lädt die Bühne text.de.json; Umlaute, ß und „ “
// kommen aus den Hausschriften (kein stiller Rückfall auf eine Systemschrift), Zahlen im deutschen Format.
test('Deutsch als Standard: Texte, Zahlenformat, Schriftzeichen, Sicherheitszone', { timeout: 300000 }, async () => {
  const outDir = process.env.WIF_SHOT_DIR;
  await withStage({ production: FIX, seed: '11' }, async (page) => {
    // Glyphen-Herkunft: Zeichen steht in der Hausschrift ⇔ gleiche Breite mit zwei verschiedenen Rückfallschriften UND
    // andere Breite als jede Rückfallschrift allein (sonst liefert eine Systemschrift das Zeichen)
    const own = await page.evaluate(() => {
      const c = document.createElement('canvas').getContext('2d');
      const w = (font, ch) => { c.font = font; return c.measureText(ch.repeat(8)).width; };
      const fonts = ['600 78px "Fraunces"', 'italic 400 54px "Fraunces"', '400 46px "Fraunces"', '700 30px "Montserrat"'];
      const res = {};
      for (const f of fonts) for (const ch of ['Ä', 'Ö', 'Ü', 'ä', 'ö', 'ü', 'ß', '„', '“', '–', 'ẞ']) {
        const size = f.replace(/"[^"]+"/, '');
        const a = w(`${f}, monospace`, ch);
        const b = w(`${f}, cursive`, ch);
        res[`${f} ${ch}`] = Math.abs(a - b) < 0.01 && Math.abs(a - w(`${size} monospace`, ch)) > 0.01 && Math.abs(b - w(`${size} cursive`, ch)) > 0.01;
      }
      return res;
    });
    for (const [k, ok] of Object.entries(own)) {
      if (k.endsWith('ẞ')) assert.equal(ok, false, `Kontrolle: ẞ sollte NICHT in der Schrift sein (${k}) – sonst ist die Messung wirkungslos`);
      else assert.equal(ok, true, `Zeichen nicht in der Hausschrift: ${k}`);
    }
    const S = brand.layout.safe;
    const states = {};
    for (const n of [0, 15, 61, 75, 89]) {
      await page.evaluate((k) => window.__stage.setFrame(k), n);
      states[n] = await page.evaluate(() => ({
        rects: window.__stage.layoutRects(),
        title: document.querySelector('#wif-title').textContent,
        value: document.querySelector('#wif-hud-value').textContent,
        label: document.querySelector('#wif-hud-label').textContent,
        sub: document.querySelector('#wif-hud-sub').textContent,
        line: document.querySelector('#wif-line').textContent,
      }));
      for (const r of states[n].rects) {
        assert.ok(r.x0 >= S.x0 - 1e-3 && r.x1 <= S.x1 + 1e-3 && r.y0 >= S.y0 - 1e-3 && r.y1 <= S.y1 + 1e-3, `Frame ${n}: ${r.name} außerhalb der Sicherheitszone ${JSON.stringify(r)}`);
      }
      if (outDir) await page.screenshot({ path: path.join(outDir, `overlay_de_${String(n).padStart(3, '0')}.png`) });
    }
    assert.equal(states[0].title, 'Was wäre, wenn ein Stern auf deine Stadt fällt?');
    assert.equal(states[0].value, '21.575 km'); // de-DE: Punkt als Tausendertrenner
    assert.equal(states[0].label, 'HÖHE');
    assert.equal(states[0].sub, '53.000 KM/H');
    assert.equal(states[15].line, 'Im Radio heißt es nur: „Bleibt drinnen.“');
    assert.equal(states[61].label, 'DRUCKWELLE');
    assert.equal(states[75].line, 'Jedes Fenster in der Straße zittert. Keiner weiß, warum.');
    assert.equal(states[89].value, 'HIER');
  });
});
