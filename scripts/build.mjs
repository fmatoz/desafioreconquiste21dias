import { mkdir, copyFile, rm, readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
await rm(dist, { recursive: true, force: true });
await mkdir(new URL('assets/', dist), { recursive: true });
for (const file of ['index.html', 'styles.css', 'config.js', 'tracking.js', 'app.js']) {
  await copyFile(new URL(file, root), new URL(file, dist));
}
// Só publica os materiais usados nesta oferta; mídias da oferta antiga ficam no histórico.
const html = await readFile(new URL('index.html', root), 'utf8');
const assets = new Set([...html.matchAll(/(?:src|href)="(assets\/[A-Za-z0-9_./-]+)"/g)].map(match => match[1]));
for (const path of assets) {
  if (path.split('/').includes('..')) throw Error('Caminho inválido de asset');
  await copyFile(new URL(path, root), new URL(path, dist));
}
console.log('Build estático pronto em dist/, com ' + assets.size + ' assets desta oferta.');
