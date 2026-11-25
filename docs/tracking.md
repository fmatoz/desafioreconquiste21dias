# Tracking Reconquiste

## Destinos existentes

- Planilha: **Trackeamento Meta Ads**. Abas `tracking`, `vendas`, `ads_meta`, `dashboard`, `funil`, `horarios` e `status`.
- Coleta da LP: fluxo **Tracking** no n8n, endpoint público de entrada definido em `config.js`. Esse endereço não concede acesso à leitura da planilha.
- Pagamentos: fluxo **Vendas**, com normalizador Wiapy. A ligação desse webhook à oferta Reconquiste deve ser conferida na conta da Wiapy.
- O fluxo de vendas existente envia `Purchase` para um pixel antigo. Antes de conectar esta oferta, configurar o pixel correto e conferir a deduplicação. Tokens da Meta ficam no servidor, nunca em arquivos públicos.

## Eventos da LP

| Evento | Momento | Limite por carregamento |
| --- | --- | --- |
| `page_view` | Medição permitida pela visitante | 1 |
| `vsl_play` | Vídeo completo realmente começa com áudio | 1 |
| `vsl_25`, `vsl_50`, `vsl_75` | Progresso do vídeo completo | 1 de cada |
| `vsl_complete` | Vídeo completo termina | 1 |
| `initiate_checkout` | Clique em um dos três CTAs com checkout válido | 1, somando os três CTAs |

`initiate_checkout` significa **clique para ir ao checkout**; não comprova que a página de pagamento carregou. Não representa Pix gerado nem compra. Repetições de um mesmo evento usam o mesmo `event_id`; a coluna `unique_flag` da planilha deduplica por evento + ID.

## Atribuição

Após permissão, um `click_id` aleatório é guardado em `sessionStorage`. Visitas diretas na mesma sessão preservam a campanha; novos parâmetros de campanha ou expiração após 30 minutos sem nova visita iniciam outra atribuição. O ID e os eventos enviados antes da revogação continuam sendo registros históricos.

Os três links recebem os parâmetros conhecidos da campanha e `utm_content=CONTEUDO_ORIGINAL||cid:CLICK_ID`. O `Format Venda` existente separa o marcador e grava `click_id` e `utm_content_original`. O conteúdo original do anúncio é preservado. Parâmetros do checkout já configurados têm prioridade. `utm_id`, `fbclid` e `gclid` também são encaminhados; a estrutura atual da aba tracking armazena `fbclid`, mas não possui colunas próprias para `utm_id` e `gclid`.

A LP envia apenas origem + rota em `page_url`, sem parâmetros livres. Não pede nome, telefone, documento ou dados de pagamento. Nesta etapa não instala pixel nem cria cookies de publicidade. A escolha de medição dura até 180 dias em `localStorage` e pode ser alterada em **Privacidade**. Sem permissão, o site e a compra continuam funcionando; a LP não envia eventos nem adiciona o identificador interno aos links.

## Confirmação da Wiapy

O normalizador atual usa `payment.status = paid` para `purchase`, e só trata Pix como `pix_gerado` quando o método é Pix e o estado é pendente. Outros estados ficam como `payment_STATUS`. O `event_id` de uma compra é `purchase_PAYMENT_ID`, para deduplicação.

Uma compra não deve ser criada no navegador nem simulada enviando um pagamento aprovado ao fluxo de produção: esse fluxo também possui envio de conversões à Meta. A confirmação de uma venda real, seus valores, eventuais bônus de pedido e reembolso depende do evento recebido da plataforma. Receita líquida usa valor menos taxa; não inclui estornos em eventos separados automaticamente.

## Diagnóstico

Para testar a LP sem somar visitas/cliques ao funil real, adicionar `tracking_test=1`. Os eventos passam a começar com `diagnostico_`. Os filtros de produção devem usar os nomes exatos dos eventos, e não apenas procurar substrings.

`npm run check` confere estrutura e os comportamentos de consentimento, revogação, atribuição, UTMs, deduplicação e armazenamento bloqueado. Uma resposta HTTP 200 do webhook indica início do fluxo; a prova de gravação é a linha na planilha. Conferir todos os eventos e repetir um teste simultâneo, pois o nó Google Sheets antigo pode sobrescrever linhas em execuções concorrentes.

Em 25/11/2026, o fluxo Tracking foi corrigido para Google Sheets `values.append`, com `insertDataOption=INSERT_ROWS`, `valueInputOption=RAW` e destino `tracking!A:P`. Um teste com três envios simultâneos registrou os três IDs nas linhas 1624–1626; datas e deduplicação em Q:T continuaram calculadas. Os registros começam com `diagnostico_` e não contam no funil de produção. Backup do fluxo anterior preservado localmente; nenhuma linha histórica foi apagada.

## Base do futuro painel

- Filtrar este produto pelo `offer_name` em tracking e pelo produto/checkout em vendas; preservar dados de outros produtos.
- Funil: visitas medidas → VSL iniciada → 25/50/75/fim → clique no checkout → Pix gerado → pagamento aprovado.
- Atribuição de vendas pelo `click_id`; vendas sem correspondência ficam identificadas como sem atribuição.
- Somar compras únicas por `payment_id`/`event_id`. Nenhum clique vira receita.
- A aba `ads_meta` atual tem gasto por dia, sem campanha/anúncio. Para ROAS/CPA deste produto, coletar gastos das campanhas corretas; não misturar o histórico de outras ofertas.
- Painel web deverá exigir autenticação e retornar somente agregados necessários. Não publicar a planilha ou dados pessoais de compradores para alimentar o frontend.

Referência da gravação pela API: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append
