import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(ids.length, new Set(ids).size, 'IDs duplicados no HTML');
for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(match[1]), `Âncora ausente: ${match[1]}`);
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (!match[1].startsWith('https://')) await access(new URL(match[1], root));
}
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'A página deve ter um título principal');
assert(html.includes('lang="pt-BR"') && html.includes('name="viewport"'), 'Idioma/viewport ausentes');
const context = { window: {} };
vm.runInNewContext(await readFile(new URL('config.js', root), 'utf8'), context);
const config = context.window.DOCE_NO_LUCRO_CONFIG;
assert(config && typeof config.checkoutUrl === 'string', 'Configuração inválida');
assert(config.price === null || typeof config.price === 'number' && config.price > 0, 'Preço inválido');
for (const field of ['videoUrl', 'videoPreviewUrl', 'videoPosterUrl']) {
  if (config[field]?.startsWith('assets/')) await access(new URL(config[field], root));
}
console.log(`Estrutura validada: ${ids.length} IDs únicos, âncoras e arquivos locais existentes.`);
console.log(`Checkout: ${config.checkoutUrl ? 'configurado' : 'pendente'} | VSL: ${config.videoUrl ? 'configurada' : 'pendente'} | Preço: ${config.price ?? 'pendente'}`);

assert(!/1795323998419205|pay\.wiapy\.com\/v9l2cgEla5fk|Gottman|Algoe|Aron|Fredrickson|reconquiste/i.test(html + JSON.stringify(config)), 'Conteúdo da oferta anterior na página nova');
assert(!ids.includes('referencias'), 'Seção dos pesquisadores deve ser removida');
const order = ['inicio', 'por-dentro', 'bonus', 'plano', 'garantia'].map(id => html.indexOf('id="' + id + '"'));
assert(order.every((value, index) => value >= 0 && (!index || value > order[index - 1])), 'Ordem das seções inválida');
if (!config.checkoutUrl) {
  assert.equal(config.tracking.enabled, false, 'Apresentação sem checkout não deve enviar tracking');
  assert.equal(config.tracking.metaPixelId, '', 'Pixel da nova oferta ainda não foi definido');
}
console.log('Oferta nova: seções na ordem, conteúdo antigo ausente e publicação de apresentação isolada.');
