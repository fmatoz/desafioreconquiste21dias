# Reconquiste — Plano de 21 Dias

Landing page responsiva do guia **Reconquiste seu Marido — Plano de 21 Dias de Atitudes que Aproximam**. HTML, CSS e JavaScript, sem dependências de produção, sem coleta de dados nesta versão. Os dois retratos reais nos relatos carregam de fontes externas oficiais, com identificação por iniciais como alternativa se indisponíveis.

![Prévia da Hero](docs/preview-desktop.webp)

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

O checkout configurado recebe os parâmetros `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid` e `gclid` da visita, preservando valores já definidos no destino. Não há envio de eventos à Meta nem a n8n nesta versão. Para integrar o tracking, utilize os eventos locais `reconquiste:event` (`hero_cta`, `checkout_cta`, `mobile_cta`, `vsl_play`) e revise privacidade/consentimento antes de instalar ferramentas externas. Nenhum evento `purchase` é disparado por um clique.

O PDF completo **não está no repositório público**. A imagem `assets/capa.webp` reproduz a capa real; a entrega do material fica na plataforma de venda.

## Publicar

- **Vercel:** importar este repositório; `vercel.json` já define build e saída `dist`.
- **Netlify:** importar este repositório; configuração em `netlify.toml`.
- **Hospedagem estática:** subir o conteúdo de `dist/`.

Produção informada pelo proprietário: https://desafioreconquiste21dias.vercel.app/. A publicação é gerenciada por ele na Vercel, usando este repositório. `.openai/hosting.json` mantém apenas a identidade da prévia inicialmente reservada.

## Conteúdo e decisões

- VSL vertical em 9:16, no pôster e nos players MP4/WebM e iframe. Hero centralizada, com vídeo vertical abaixo da chamada e altura limitada à tela.
- Sequência de venda: Hero, autoridades de pesquisa, relatos com retratos e fonte, identificação com a rotina, benefícios do plano, amostra concreta, três etapas, oferta com lista completa e fechamento.
- CTAs distribuídos ao longo da página para a mesma oferta; checkout centralizado em `config.js`.
- Conteúdo comercial limitado ao guia real: 50 páginas, 21 desafios, exemplos, adaptações e acompanhamento.
- Não há desconto fictício, escassez, avaliações inventadas, estatísticas de clientes ou garantia de reconquista. O componente de contagem está desativado até existir uma condição real com prazo no checkout.
- Os relatos externos identificam a prática e o material utilizados em cada experiência. Não são avaliações do nosso produto.
- Vinho escuro `#280f20`, rosa `#ffbed5`, fundos claros e CTAs em verde `#49dd91`, com texto escuro. Contraste e hierarquia orientam a escolha; não há alegação de cor comprovadamente superior para mulheres.
- Tipografia nativa, capa e retrato ilustrativo em WebP local, sem bibliotecas, fontes ou rastreadores externos. Dois retratos oficiais são carregados de seus CDNs, sob demanda, sem enviar a URL da LP como referenciador.
- Botão fixo no celular aparece após o texto inicial da Hero e desaparece quando a oferta entra na tela. FAQ nativa, diálogos acessíveis, foco de teclado e respeito à preferência de movimento reduzido.

Veja a documentação de pesquisa em `docs/fontes.md`.

## Verificação realizada

- Build e conferência de arquivos/âncoras aprovados; saída completa de aproximadamente 65 KB.
- Navegador Edge sem interface: capturas e conferência visual em desktop e celular.
- Sem rolagem horizontal em 320, 375, 390, 768, 1024 e 1440 px.
- FAQ, diálogos, fechamento por Escape, retorno de foco e CTA móvel contextual conferidos.
- Configuração simulada: preço, passagem de UTMs sem sobrescrever valores do checkout e carregamento da VSL somente após clique.
- Estados sem preço, VSL e checkout conferidos; nenhum erro JavaScript observado.

A Vercel foi publicada pelo proprietário. Preço, checkout e VSL continuam pendentes em `config.js`; as simulações de configuração não são compras reais. Não há resultado de conversão medido nesta etapa.

## Prazo de oferta e contagem

O componente do topo fica pronto em `offerCountdown`, mas está desativado. O preço e a condição que termina ainda não foram definidos.

Para ativar: fornecer `expiresAt` como data ISO absoluta e ativar `checkoutEnforcesDeadline` somente quando a plataforma realmente encerrar a condição nesse prazo. Para dez minutos individuais por visitante, o backend deve criar e manter esse prazo por sessão; o navegador não inicia nem reinicia uma oferta fictícia ao entrar ou recarregar.

Ao terminar uma condição real, o contador desaparece, o preço promocional é ocultado e o CTA passa a consultar a condição atual no checkout. O código não cria aumento de preço nem bloqueia uma venda por conta própria. A promoção precisa ser aplicada e validada pela plataforma de pagamento.

## VSL vertical

O player mantém 9:16 antes e depois de reproduzir, sem cortar o vídeo. Em todos os tamanhos, fica centralizado abaixo da promessa, com o CTA logo depois. A altura se adapta à tela. A VSL ainda precisa ser fornecida.

Os créditos dos retratos de Logan Ury e Kristen Meinzer estão reunidos no diálogo “Créditos de imagens”, acessível pelo rodapé. A identificação “Imagem ilustrativa” permanece junto ao retrato gerado do cartão de Yainak.
