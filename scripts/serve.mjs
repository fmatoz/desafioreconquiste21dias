import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const filename = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!filename.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if (!['.html', '.js', '.css', '.svg', '.webp'].includes(extname(filename))) { res.writeHead(404).end(); return; }
    const body = await readFile(filename);
    res.writeHead(200, { 'Content-Type': types[extname(filename)], 'Cache-Control': 'no-store' }); res.end(body);
  } catch { res.writeHead(404).end('Não encontrado'); }
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));
