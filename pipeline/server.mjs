// Statischer HTTP-Server nur für localhost. Nötig, weil Chromium ES-Module über file://
// ohne Sonderflags nicht lädt (die Seite bleibt dann still hängen).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Nur diese Verzeichnisse werden ausgeliefert.
const ALLOWED = ['pipeline/runtime', 'productions', 'tests/fixtures', 'node_modules/three', 'node_modules/@fontsource'];

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.glb': 'model/gltf-binary',
};

export function startServer() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
    const abs = path.resolve(ROOT, rel);
    const ok = ALLOWED.some((a) => abs === path.join(ROOT, a) || abs.startsWith(path.join(ROOT, a) + path.sep));
    if (!ok || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(abs)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(abs).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ url: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) });
    });
  });
}
