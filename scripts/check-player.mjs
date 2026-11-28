import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../app.js', import.meta.url), 'utf8');
function page(videoUrl = '') {
  const nodes = new Map(), events = [];
  function node(selector) {
    if (nodes.has(selector)) return nodes.get(selector);
    const element = {
      hidden: selector === '#vsl-video' || selector === '#vsl-play' || selector === '#vsl-end' || selector === '#vsl-error',
      dataset: { state: 'pending' }, handlers: {}, attributes: {}, textContent: '',
      paused: true, ended: false, duration: 100, currentTime: 0, plays: 0, error: null,
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(name, handler) { this.handlers[name] = handler; },
      async play() { this.plays++; this.paused = false; this.ended = false; this.handlers.playing?.(); },
      pause() { this.paused = true; this.handlers.pause?.(); },
      load() { this.paused = true; this.ended = false; this.error = null; }
    };
    nodes.set(selector, element); return element;
  }
  const config = { price: 10, checkoutUrl: '', testimonials: [], videoUrl, videoPosterUrl: 'assets/doce-planilha.svg' };
  const document = { baseURI: 'https://lp.example/', querySelector: node, querySelectorAll: () => [], addEventListener() {} };
  const window = { DOCE_NO_LUCRO_CONFIG: config, setInterval() {}, matchMedia: () => ({ matches: false, addEventListener() {} }), dispatchEvent: event => events.push(event.detail.name) };
  vm.runInNewContext(source, { window, document, URL, URLSearchParams, Intl, Date, CustomEvent: class { constructor(type, options) { this.detail = options.detail; } } });
  return { node, events };
}
const pending = page();
assert.equal(pending.node('#vsl-play').hidden, true, 'Sem VSL não mostrar play falso');
assert.equal(pending.node('#vsl-video').plays, 0);
const insecure = page('http://media.example/video.mp4');
assert.equal(insecure.node('#vsl-play').hidden, true, 'Mídia HTTP não é carregada');
const active = page('https://media.example/video.mp4');
const video = active.node('#vsl-video'), button = active.node('#vsl-play'), frame = active.node('#vsl-container');
assert.equal(button.hidden, false);
assert.equal(video.plays, 0, 'Vídeo principal aguarda ação da pessoa');
await button.handlers.click();
assert.equal(video.src, 'https://media.example/video.mp4');
assert.equal(video.muted, false);
assert.equal(frame.dataset.state, 'playing');
assert.deepEqual(active.events, ['vsl_play']);
await button.handlers.click();
assert.equal(frame.dataset.state, 'paused', 'Toque na tela pausa');
await button.handlers.click();
assert.equal(frame.dataset.state, 'playing');
assert.deepEqual(active.events, ['vsl_play'], 'Retomar não duplica o início');
video.currentTime = 80;
video.handlers.timeupdate(); video.handlers.timeupdate();
assert.deepEqual(active.events, ['vsl_play', 'vsl_25', 'vsl_50', 'vsl_75']);
video.paused = true; video.ended = true; video.handlers.ended();
assert.equal(active.node('#vsl-end').hidden, false);
assert.equal(button.hidden, true);
assert.equal(active.events.at(-1), 'vsl_complete');
active.node('#vsl-replay').handlers.click();
assert.equal(video.currentTime, 0);
assert.equal(active.events.filter(name => name === 'vsl_play').length, 1);
video.paused = true; video.error = new Error('media');
video.handlers.error();
assert.equal(active.node('#vsl-error').hidden, false);
await active.node('#vsl-retry').handlers.click();
assert.equal(active.node('#vsl-error').hidden, true);
assert.equal(frame.dataset.state, 'playing');
const local = page('assets/vsl-doce.webm');
await local.node('#vsl-play').handlers.click();
assert.equal(local.node('#vsl-video').src, 'https://lp.example/assets/vsl-doce.webm');
console.log('Player: sem reprodução fictícia, início por clique, pausa, retomada, marcos, fim, replay, erro e URLs aprovados.');
