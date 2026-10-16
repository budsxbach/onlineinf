const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_DIR = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  // Erlaube Einbettung in Preview-Iframes und alle Hosts
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (urlPath === '/' || urlPath === '/index.html') {
    const file = path.join(__dirname, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(file).pipe(res);
    return;
  }

  if (urlPath === '/extension/content.js') {
    const file = path.join(BASE_DIR, 'extension', 'content.js');
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
    fs.createReadStream(file).pipe(res);
    return;
  }

  if (urlPath === '/download/chat-autotyper-extension.zip') {
    const file = path.join(BASE_DIR, 'downloads', 'chat-autotyper-extension.zip');
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="chat-autotyper-extension.zip"'
    });
    fs.createReadStream(file).pipe(res);
    return;
  }

  if (urlPath === '/download/chat-autotyper.user.js') {
    const file = path.join(BASE_DIR, 'userscript', 'chat-autotyper.user.js');
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Content-Disposition': 'inline; filename="chat-autotyper.user.js"'
    });
    fs.createReadStream(file).pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Nicht gefunden');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Chat AutoTyper AI Live-Demo läuft auf http://0.0.0.0:${PORT}`);
});
