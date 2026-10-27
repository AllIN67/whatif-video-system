// Start von Headless Chromium mit Software-WebGL (SwiftShader) – in dieser Umgebung gibt es keine GPU.
// Playwright ist global vorinstalliert (/opt/node-tools) und wird absichtlich nicht als
// Projektabhängigkeit installiert: eine zweite Version fände den vorinstallierten Browser nicht.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './server.mjs';

const require = createRequire(import.meta.url);

export function loadPlaywright() {
  let pw;
  try {
    pw = require('playwright');
  } catch {
    throw new Error('Playwright nicht gefunden. Erwartet global vorinstalliert (z. B. /opt/node-tools/node_modules/playwright).');
  }
  const pkg = JSON.parse(fs.readFileSync(path.join(path.dirname(require.resolve('playwright')), 'package.json'), 'utf8'));
  const want = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).playwrightGlobal;
  if (!pkg.version.startsWith(want + '.')) {
    throw new Error(`Playwright ${pkg.version} gefunden, erwartet ${want}.x (siehe package.json "playwrightGlobal").`);
  }
  return { chromium: pw.chromium, version: pkg.version };
}

export const WIDTH = 1080;
export const HEIGHT = 1920;

export async function launchStage(serverUrl, query) {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-vsync', '--force-color-profile=srgb', '--font-render-hinting=none'],
  });
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto(`${serverUrl}/pipeline/runtime/stage.html?${new URLSearchParams(query)}`);
  try {
    await page.waitForFunction('window.__stage && (window.__stage.ready || window.__stage.error)', null, { timeout: 120000, polling: 100 });
  } catch (e) {
    await browser.close();
    throw new Error(`Bühne nicht bereit: ${errors.join(' | ') || e.message}`);
  }
  const err = await page.evaluate(() => window.__stage.error);
  if (err) {
    await browser.close();
    throw new Error(`Fehler beim Aufbau der Bühne: ${err}`);
  }
  return { browser, page, errors };
}

// Startet Server + Bühne, führt fn(page) aus und räumt in jedem Fall auf (auch bei Fehlern).
export async function withStage(query, fn) {
  const { startServer } = await import('./server.mjs');
  const srv = await startServer();
  try {
    const st = await launchStage(srv.url, query);
    try {
      return await fn(st.page, st);
    } finally {
      await st.browser.close();
    }
  } finally {
    await srv.close();
  }
}
