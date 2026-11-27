import { mkdir, copyFile, rm, readFile } from 'node:fs/promises';
import vm from 'node:vm';
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
const context = { window: {} };
vm.runInNewContext(await readFile(new URL('config.js', root), 'utf8'), context);
for (const key of ['videoUrl', 'videoPreviewUrl', 'videoPosterUrl']) {
  const path = context.window.DOCE_NO_LUCRO_CONFIG?.[key];
  if (typeof path === 'string' && /^assets\/[A-Za-z0-9_./-]+$/.test(path)) assets.add(path);
}
for (const path of assets) {
  if (path.split('/').includes('..')) throw Error('Caminho inválido de asset');
  await mkdir(new URL('./', new URL(path, dist)), { recursive: true });
  await copyFile(new URL(path, root), new URL(path, dist));
}
console.log('Build estático pronto em dist/, com ' + assets.size + ' assets desta oferta.');
