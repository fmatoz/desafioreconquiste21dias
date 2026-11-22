# Reconquiste — Plano de 21 Dias

Landing page responsiva do guia **Reconquiste seu Marido — Plano de 21 Dias de Atitudes que Aproximam**. HTML, CSS e JavaScript, sem dependências de produção, sem coleta de dados nesta versão. Os retratos reais carregam de fontes externas oficiais, com identificação por iniciais como alternativa se indisponíveis.

[Ver a LP publicada](https://desafioreconquiste21dias.vercel.app/)

## Executar

Requer Node.js 20.11 ou superior.

```sh
npm run dev
npm run check
npm run build
```

Servidor local: `http://127.0.0.1:4173`. O build gera `dist/`.

## Antes de receber tráfego pago

Edite `config.js`:

| Campo | Configuração |
| --- | --- |
| `checkoutUrl` | URL HTTPS real do checkout. Sem esse valor, o CTA abre um aviso de disponibilidade futura e não processa uma compra. |
| `price` | Preço real, em reais. `null` oculta a área do preço; nenhum valor foi inventado. |
| `videoUrl` | URL pública HTTPS do MP4/WebM ou URL de embed do YouTube/Vimeo. O vídeo só carrega após clique. |
| `videoType` | `video` para arquivo; `embed` para YouTube/Vimeo. |
| `supportEmail` | Contato real para atendimento e privacidade. |

URL de embed: `https://www.youtube-nocookie.com/embed/ID_DO_VIDEO` ou `https://player.vimeo.com/video/ID_DO_VIDEO`. Sem VSL, o espaço apresenta uma capa editorial e a indicação “Em breve”, sem botão de reprodução falso.

O checkout configurado recebe os parâmetros `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid` e `gclid` da visita, preservando valores já definidos no destino. Não há envio de eventos à Meta nem a n8n nesta versão. Para integrar o tracking, utilize os eventos locais `reconquiste:event` (`hero_cta`, `checkout_cta`, `vsl_play`) e revise privacidade/consentimento antes de instalar ferramentas externas. Nenhum evento `purchase` é disparado por um clique.

O PDF completo **não está no repositório público**. A imagem `assets/capa.webp` reproduz a capa real; a entrega do material fica na plataforma de venda.

## Publicar

- **Vercel:** importar este repositório; `vercel.json` já define build e saída `dist`.
- **Netlify:** importar este repositório; configuração em `netlify.toml`.
- **Hospedagem estática:** subir o conteúdo de `dist/`.

Produção informada pelo proprietário: https://desafioreconquiste21dias.vercel.app/. A publicação é gerenciada por ele na Vercel, usando este repositório. `.openai/hosting.json` mantém apenas a identidade da prévia inicialmente reservada.

## Conteúdo e decisões

- VSL vertical em 9:16, no pôster e nos players MP4/WebM e iframe. Hero centralizada, com vídeo vertical abaixo da chamada e altura limitada à tela.
- Seis blocos de venda: Hero/VSL, autoridades compactas, relatos, material por dentro com amostra expansível, oferta e FAQ.
- CTAs distribuídos ao longo da página para a mesma oferta; checkout centralizado em `config.js`.
- Conteúdo comercial limitado ao guia real: 50 páginas, 21 desafios, exemplos, adaptações e acompanhamento.
- Não há desconto fictício, escassez, avaliações inventadas, estatísticas de clientes ou garantia de reconquista. O componente de contagem está desativado até existir uma condição real com prazo no checkout.
- Os relatos externos identificam a publicação de origem; a prática e o material de cada experiência estão documentados em `docs/fontes.md`. Não são avaliações do nosso produto.
- Vinho escuro `#280f20`, rosa `#ffbed5`, fundos claros e CTAs em verde `#49dd91`, com texto escuro. Contraste e hierarquia orientam a escolha; não há alegação de cor comprovadamente superior para mulheres.
- Tipografia nativa, capa em WebP local, sem bibliotecas, fontes ou rastreadores externos. Retratos oficiais são carregados de suas fontes, sob demanda, sem enviar a URL da LP como referenciador.
- FAQ nativa, diálogos acessíveis, foco de teclado e respeito à preferência de movimento reduzido.

Veja a documentação de pesquisa em `docs/fontes.md`.

## Verificação realizada

- Build e conferência de arquivos/âncoras aprovados; saída completa de aproximadamente 65 KB.
- Navegador Edge sem interface: capturas e conferência visual em desktop e celular.
- Sem rolagem horizontal em 320, 375, 390, 768, 1024 e 1440 px.
- FAQ, diálogos, fechamento por Escape, retorno de foco conferidos. Relatos empilhados no celular.
- Configuração simulada: preço, passagem de UTMs sem sobrescrever valores do checkout e carregamento da VSL somente após clique.
- Estados sem preço, VSL e checkout conferidos; nenhum erro JavaScript observado.

A Vercel foi publicada pelo proprietário. Preço, checkout e VSL continuam pendentes em `config.js`; as simulações de configuração não são compras reais. Não há resultado de conversão medido nesta etapa.

## Prazo de oferta e contagem

O contador aparece na seção da oferta quando há checkout HTTPS e um prazo válido configurado em `offerCountdown`. O preço e a condição que termina ainda não foram definidos.

Para ativar: fornecer `expiresAt` como data ISO absoluta e ativar `checkoutEnforcesDeadline` somente quando a plataforma realmente encerrar a condição nesse prazo. Para dez minutos individuais por visitante, o backend deve criar e manter esse prazo por sessão; o navegador não inicia nem reinicia uma oferta fictícia ao entrar ou recarregar.

Ao terminar uma condição real, o contador desaparece, o preço promocional é ocultado e o CTA passa a consultar a condição atual no checkout. O código não cria aumento de preço nem bloqueia uma venda por conta própria. A promoção precisa ser aplicada e validada pela plataforma de pagamento.

## VSL vertical

O player mantém 9:16 antes e depois de reproduzir, sem cortar o vídeo. Em todos os tamanhos, fica centralizado abaixo da promessa, com o CTA logo depois. A altura se adapta à tela. A VSL ainda precisa ser fornecida.

Os créditos dos retratos de Logan Ury e Kristen Meinzer estão reunidos no diálogo “Créditos de imagens”, acessível pelo rodapé. O cartão do relato de Yainak exibe seu nome e usa a inicial Y no avatar; o retrato gerado não é utilizado.

As referências aparecem como identificação em texto nos cartões. Não há links externos de fontes na LP; as URLs e os contextos verificáveis permanecem em `docs/fontes.md`. Os créditos de imagens continuam disponíveis pelo diálogo do rodapé, sem navegação para fora da página.

## Versão compacta

Removidos os blocos sobre o problema da rotina, as três etapas em seção própria e a chamada final repetida. As etapas ficam resumidas na apresentação do produto.

No celular, as autoridades ficam em três cartões lado a lado; os três relatos ficam empilhados, com altura ajustada ao conteúdo. Os três relatos foram preservados. As legendas abaixo dos comentários foram removidas, e o contexto completo permanece em `docs/fontes.md`. A amostra fica dentro de “material por dentro”, aberta por escolha da visitante. A oferta não repete o mockup da capa e a FAQ tem três perguntas. O espaçamento vertical foi reduzido.

Verificação desta redução em viewport de 390 × 844 px: altura inicial de 11.395 px e altura compacta de aproximadamente 4.847 px, cerca de 57% menor. Na versão anterior, carrossel (anterior/próximo), expansão da amostra, CTA e ausência de rolagem horizontal conferidos em seis larguras. As fotografias externas usam identificação por iniciais se indisponíveis no ambiente de teste.

O cabeçalho de marca e informações acima da Hero foi removido. A logo completa foi preservada no rodapé. O botão fixo do celular, sua lógica e o espaço reservado a ele foram removidos; os CTAs das seções continuam disponíveis.
