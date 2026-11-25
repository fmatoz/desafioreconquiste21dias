import { mkdir, cp, copyFile, rm } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const file of ['index.html', 'styles.css', 'config.js', 'tracking.js', 'app.js']) await copyFile(new URL(file, root), new URL(file, dist));
await cp(new URL('assets/', root), new URL('assets/', dist), { recursive: true });
console.log('Build estático pronto em dist/.');
