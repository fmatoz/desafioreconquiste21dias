# Doce no Lucro

**Saiba quanto cobrar e quanto sobra em cada receita!**

Planilha de precificação para quem vende doces, bolos e encomendas. O repositório `fmatoz/docenolucro` reaproveita a estrutura da antiga LP da Reconquiste.

## Nova oferta em preparação

- Produto principal: planilha de precificação Doce no Lucro.
- Bônus 1: vídeo ensinando a usar a planilha, do cadastro ao primeiro preço.
- Bônus 2: mensagens e modelos de orçamento para WhatsApp.
- Bônus 3: checklist da encomenda perfeita.

A página publicada ainda contém a oferta anterior. A adaptação da LP, o checkout da nova oferta e a identificação no rastreamento devem ser concluídos antes de receber tráfego para Doce no Lucro. O endereço da hospedagem é configurado separadamente do nome deste repositório.

## Documentação da base anterior: Reconquiste

Landing page responsiva do guia **Reconquiste seu Marido — Plano de 21 Dias de Atitudes que Aproximam**. HTML, CSS e JavaScript, sem dependências de produção, com medição opcional de visitas, VSL e cliques integrada ao n8n e Google Sheets. As fotografias dos relatos são arquivos locais em WebP e PNG. Os retratos das autoridades carregam de fontes externas oficiais, com identificação por iniciais como alternativa se indisponíveis.

[Ver a LP publicada](https://desafioreconquiste21dias.vercel.app/)

### Executar

Requer Node.js 20.11 ou superior.

```sh
npm run dev
npm run check
npm run build
```

Servidor local: `http://127.0.0.1:4173`. O build gera `dist/`.

### Antes de receber tráfego pago

Edite `config.js`:

| Campo | Configuração |
| --- | --- |
| `checkoutUrl` | Oferta Principal da Wiapy: `https://pay.wiapy.com/v9l2cgEla5fk`. Somente o botão da oferta abre esse endereço; os demais CTAs levam à seção `#plano`. |
| `price` | Preço atual em reais, definido pelo proprietário como R$ 14,97. `null` oculta a área do preço. |
| `originalPrice` | Preço anterior, definido pelo proprietário como R$ 47,00. Aparece riscado quando maior que `price`. |
| `videoUrl` | MP4/WebM local em `assets/` ou HTTPS. A versão completa só carrega após play. |
| `videoPreviewUrl` | Prévia curta sem áudio, em loop antes do play. |
| `videoPosterUrl` | Pôster mostrado antes da prévia ou quando autoplay estiver bloqueado. |
| `supportEmail` | Contato real para atendimento e privacidade. |

O player nativo mostra o botão “Assista esse Vídeo” na prévia e quando pausado. Durante a reprodução, o vídeo fica sem botões visíveis; tocar na tela pausa, e o play reaparece para continuar. O mesmo controle funciona por teclado com Enter ou espaço. Ao terminar, o play central dá lugar à mensagem “Seu próximo passo começa aqui”, que orienta a visitante a tocar no botão verde abaixo para receber o plano e os três bônus. “Assistir novamente” reinicia a VSL; o fim não dispara compra nem navegação automática. Não há barra de progresso, volume, velocidade, fullscreen ou Picture-in-Picture. A primeira ação de play troca a prévia pelo vídeo completo, do início e com áudio; pause e continuar preservam o ponto. A prévia é interrompida fora da tela, em aba oculta ou com preferência por movimento reduzido. Bloqueios de autoplay preservam o pôster e o play.

O checkout recebe UTMs e identificadores de clique. Com a medição ativa, `tracking.js` registra `page_view`, início/progresso/fim da VSL e `initiate_checkout` na planilha existente por meio do n8n. Um `click_id` no `utm_content` permite associar a venda recebida da Wiapy à visita. `initiate_checkout` significa clique de saída, e não checkout carregado ou compra. O navegador nunca dispara `purchase`. O pixel público `1795323998419205` carrega automaticamente, salvo recusa registrada, com PageView, ViewContent, InitiateCheckout no clique de saída da oferta e eventos personalizados da VSL. O modo `tracking_test=1` não carrega a Meta. O aviso automático foi removido; a preferência pode ser alterada em Privacidade. Nenhum token entra no frontend. O fluxo Vendas está publicado com rota exclusiva da Reconquiste, credencial CAPI e event_id estável. O receptor do webhook e a deduplicação foram testados; um envio originado pela própria Wiapy e uma compra real ainda precisam de confirmação. Veja também `docs/vendas-reconquiste.md`. Veja `docs/tracking.md`.

O PDF completo **não está no repositório público**. A imagem `assets/capa.webp` reproduz a capa real; a entrega do material fica na plataforma de venda.

### Publicar

- **Vercel:** importar este repositório; `vercel.json` já define build e saída `dist`.
- **Netlify:** importar este repositório; configuração em `netlify.toml`.
- **Hospedagem estática:** subir o conteúdo de `dist/`.

Produção informada pelo proprietário: https://desafioreconquiste21dias.vercel.app/. A publicação é gerenciada por ele na Vercel, usando este repositório. `.openai/hosting.json` mantém apenas a identidade da prévia inicialmente reservada.

### Conteúdo e decisões

- VSL vertical em 9:16, com prévia muda e player nativo MP4/WebM. Hero centralizada, com vídeo vertical abaixo da chamada e altura limitada à tela.
- Ordem da página: hero com VSL, material com amostra, bônus exclusivos, relatos “O que elas viveram”, oferta, pesquisas sobre conexão, garantia, dúvidas frequentes e rodapé.
- A seção `#bonus`, logo após o material, apresenta três extras incluídos no plano: 12 mensagens para WhatsApp, 7 encontros de 15 minutos em casa e um calendário para depois dos 21 dias. Imagens locais em WebP. Os PDFs são entregues pela plataforma de venda.
- Os CTAs da hero e do material rolam até a oferta (`#plano`). Somente o CTA da oferta abre a Wiapy, preservando UTMs e identificadores de clique.
- Conteúdo comercial limitado ao guia real: 50 páginas, 21 desafios, exemplos, adaptações e acompanhamento.
- Não há desconto fictício, escassez, avaliações inventadas, estatísticas de clientes ou garantia de reconquista. O componente de contagem está desativado até existir uma condição real com prazo no checkout.
- Os relatos externos têm traduções adaptadas ao português brasileiro. A publicação de origem, a prática e o material de cada experiência estão documentados em `docs/fontes.md`. Não são avaliações do nosso produto.
- Vinho escuro `#280f20`, rosa `#ffbed5`, fundos claros e CTAs em verde `#49dd91`, com texto escuro. Contraste e hierarquia orientam a escolha; não há alegação de cor comprovadamente superior para mulheres.
- Tipografia nativa, capa em WebP local, sem bibliotecas ou fontes adicionais; a medição opcional usa um módulo local e o webhook n8n. Retratos oficiais são carregados de suas fontes, sob demanda, sem enviar a URL da LP como referenciador.
- FAQ nativa, diálogos acessíveis, foco de teclado e respeito à preferência de movimento reduzido.

Veja a documentação de pesquisa em `docs/fontes.md`.

### Verificação realizada

- Build e conferência de arquivos/âncoras aprovados; arquivos estáticos e mídias locais incluídos na saída.
- Navegador Edge sem interface: capturas e conferência visual em desktop e celular.
- Sem rolagem horizontal em 320, 375, 390, 768, 1024 e 1440 px.
- FAQ, diálogos, fechamento por Escape, retorno de foco conferidos. Carrossel de relatos no celular.
- Configuração simulada: preço, passagem de UTMs sem sobrescrever valores do checkout e carregamento da VSL somente após clique.
- Estados sem preço, VSL e checkout conferidos; nenhum erro JavaScript observado.

A Vercel foi publicada pelo proprietário. O preço foi definido em `config.js`, de R$ 47,00 por R$ 14,97. A VSL final e o checkout da Wiapy foram integrados. A navegação até o produto e o preço-base de R$ 14,97 foram conferidos; não foi efetuada compra de teste. Não há resultado de conversão medido nesta etapa.

### Checkout Wiapy

Em 25/11/2026, a Oferta Principal foi conferida em `https://pay.wiapy.com/v9l2cgEla5fk`, com o nome correto do produto e preço-base de R$ 14,97. Descontos adicionais por forma de pagamento são definidos na Wiapy e podem alterar o total mostrado no checkout. O valor da LP permanece no preço-base informado pelo proprietário. A página intermediária de vendas da Wiapy não é usada. Pagamento, entrega, reembolso e rastreamento da plataforma precisam de validação própria; abrir o checkout não é uma compra concluída.

### Prazo de oferta e contagem

O contador aparece na seção da oferta quando há checkout HTTPS e um prazo válido configurado em `offerCountdown`. O preço e a condição que termina ainda não foram definidos.

Para ativar: fornecer `expiresAt` como data ISO absoluta e ativar `checkoutEnforcesDeadline` somente quando a plataforma realmente encerrar a condição nesse prazo. Para dez minutos individuais por visitante, o backend deve criar e manter esse prazo por sessão; o navegador não inicia nem reinicia uma oferta fictícia ao entrar ou recarregar.

Ao terminar uma condição real, o contador desaparece, o preço promocional é ocultado e o CTA passa a consultar a condição atual no checkout. O código não cria aumento de preço nem bloqueia uma venda por conta própria. A promoção precisa ser aplicada e validada pela plataforma de pagamento.

### VSL vertical

O player mantém 9:16 antes e depois de reproduzir, sem cortar o vídeo. Em todos os tamanhos, fica centralizado abaixo da promessa, com o CTA logo depois. A altura se adapta à tela. A VSL final é `assets/vsl-reconquiste.mp4` (720 × 1280, aproximadamente 1min59), com legendas já presentes na imagem. A prévia de seis segundos, sem faixa de áudio, fica em `assets/vsl-previa.mp4`. O master em 1080 × 1920 é mantido fora do repositório. O evento `vsl_play` só é emitido quando a apresentação com áudio começa, uma vez por carregamento, e `vsl_complete` sinaliza o fim.

Os quatro cartões dos relatos mostram apenas os primeiros nomes: Logan, Laura, Barbara e Franciele. A identificação completa é preservada em `docs/fontes.md` e nos créditos de imagens do rodapé. Yainak foi retirada por não ter foto identificada. Kristen Meinzer foi retirada após a busca por um retrato mais espontâneo.

Os cartões dos relatos exibem nome, avatar, comentário, coração e ícone de comentários fixos. Esses detalhes são decorativos, sem interação ou contagem de engajamento. Não há links externos de fontes na LP; as URLs e os contextos verificáveis permanecem em `docs/fontes.md`. Os créditos de imagens continuam disponíveis pelo diálogo do rodapé, sem navegação para fora da página.

### Versão compacta

Removidos os blocos sobre o problema da rotina, as três etapas em seção própria e a chamada final repetida. As etapas ficam resumidas na apresentação do produto.

No celular, as autoridades ficam em três cartões lado a lado; os quatro relatos ficam num carrossel horizontal, com um cartão inteiro visível por vez. No desktop, são três cartões lado a lado. O movimento é contínuo para a esquerda, a 24 pixels por segundo, repetindo os quatro relatos sem retorno visível. Uma cópia decorativa da sequência, ignorada por leitores de tela, permite a continuidade. O movimento pausa com foco de teclado, toque e aba oculta. A preferência por movimento reduzido oferece leitura estática com rolagem horizontal. As legendas abaixo dos comentários foram removidas, e o contexto completo permanece em `docs/fontes.md`. A amostra fica dentro de “material por dentro”, aberta por escolha da visitante. A oferta não repete o mockup da capa e a FAQ tem três perguntas. O espaçamento vertical foi reduzido.

Verificação desta redução em viewport de 390 × 844 px: altura inicial de 11.395 px e altura compacta de aproximadamente 4.847 px, cerca de 57% menor. Na versão anterior, carrossel (anterior/próximo), expansão da amostra, CTA e ausência de rolagem horizontal conferidos em seis larguras. As fotografias externas usam identificação por iniciais se indisponíveis no ambiente de teste.

O cabeçalho de marca e informações acima da Hero foi removido. A logo completa foi preservada no rodapé. O botão fixo do celular, sua lógica e o espaço reservado a ele foram removidos; os CTAs das seções continuam disponíveis.


### Visitantes únicos

A aba `funil!A22:D29` separa visualizações totais, visitantes únicos diários e IC únicos diários da oferta Reconquiste. O navegador mantém um ID aleatório por até 180 dias, independente do `click_id` de atribuição. Recarregar a LP preserva o visitante, mas continua gerando PageView. Sem armazenamento persistente, o acesso fica fora da contagem de únicos identificáveis. Os únicos começam nesta versão e respeitam o período ativo no Sheets; em vários dias, somam os únicos de cada dia. Veja `docs/tracking.md`.
