#!/usr/bin/env node
/**
 * server.mjs — minimaler Static-Server ohne Abhängigkeiten.
 * Start:  node server.mjs          (Port 4173)
 *         PORT=8080 node server.mjs
 */
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

/** Verhindert Ausbrüche aus dem Projektordner. */
function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const rel = decoded === '/' ? '/index.html' : decoded;
  const abs = path.join(ROOT, path.normalize(rel));
  if (!abs.startsWith(ROOT)) return null;
  return abs;
}

const server = http.createServer(async (req, res) => {
  // Bewusst offen: die Vorschau läuft in einem Iframe auf fremdem Host.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'powerpack', ts: new Date().toISOString() }));
    return;
  }

  const file = safePath(req.url || '/');
  if (!file) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Ungültiger Pfad');
    return;
  }

  try {
    const stat = await fsp.stat(file);
    if (stat.isDirectory()) {
      const index = path.join(file, 'index.html');
      const html = await fsp.readFile(index);
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      res.end(html);
      return;
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': stat.size,
    });
    fs.createReadStream(file).pipe(res);
  } catch {
    const notFound = path.join(ROOT, '404.html');
    const body = fs.existsSync(notFound) ? await fsp.readFile(notFound) : 'Nicht gefunden';
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(body);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Powerpack-Konfigurator läuft auf http://${HOST}:${PORT}`);
  console.log(`Projektordner: ${ROOT}`);
});
