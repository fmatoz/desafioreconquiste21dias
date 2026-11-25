# Tracking Reconquiste

## Destinos existentes

- Planilha: **Trackeamento Meta Ads**. Abas `tracking`, `vendas`, `ads_meta`, `dashboard`, `funil`, `horarios` e `status`.
- Coleta da LP: fluxo **Tracking** no n8n, endpoint público de entrada definido em `config.js`. Esse endereço não concede acesso à leitura da planilha.
- Pagamentos: fluxo **Vendas**, com normalizador Wiapy. A ligação desse webhook à oferta Reconquiste deve ser conferida na conta da Wiapy.
- O pixel da LP é `1795323998419205`. O fluxo de vendas existente ainda envia `Purchase` para um pixel antigo. Antes de conectar esta oferta, configurar o pixel correto e conferir a deduplicação. Tokens da Meta ficam no servidor, nunca em arquivos públicos.

## Eventos da LP

| Evento | Momento | Limite por carregamento |
| --- | --- | --- |
| `page_view` | Carregamento da página, salvo recusa registrada | 1 |
| `vsl_play` | Vídeo completo realmente começa com áudio | 1 |
| `vsl_25`, `vsl_50`, `vsl_75` | Progresso do vídeo completo | 1 de cada |
| `vsl_complete` | Vídeo completo termina | 1 |
| `initiate_checkout` | Clique no CTA da oferta com checkout válido | 1 |

`initiate_checkout` significa **clique para ir ao checkout**; não comprova que a página de pagamento carregou. Não representa Pix gerado nem compra. Repetições de um mesmo evento usam o mesmo `event_id`; a coluna `unique_flag` da planilha deduplica por evento + ID.

## Atribuição

Com a medição ativa, um `click_id` aleatório é guardado em `sessionStorage`. Visitas diretas na mesma sessão preservam a campanha; novos parâmetros de campanha ou expiração após 30 minutos sem nova visita iniciam outra atribuição. O ID e os eventos enviados antes da revogação continuam sendo registros históricos.

Somente o link de checkout na oferta recebe os parâmetros conhecidos da campanha e `utm_content=CONTEUDO_ORIGINAL||cid:CLICK_ID`. O `Format Venda` existente separa o marcador e grava `click_id` e `utm_content_original`. O conteúdo original do anúncio é preservado. Parâmetros do checkout já configurados têm prioridade. `utm_id`, `fbclid` e `gclid` também são encaminhados; a estrutura atual da aba tracking armazena `fbclid`, mas não possui colunas próprias para `utm_id` e `gclid`.

A LP envia apenas origem + rota em `page_url`, sem parâmetros livres. Não pede nome, telefone, documento ou dados de pagamento. Após consentimento v2, carrega o pixel da Meta e permite cookies de medição de anúncios. O consentimento v1 não autoriza essa nova finalidade. A escolha de medição dura até 180 dias em `localStorage` e pode ser alterada em **Privacidade**. Sem permissão, o site e a compra continuam funcionando; a LP não envia eventos nem adiciona o identificador interno aos links.

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

## Meta Pixel — 25/11/2026

O ID público `1795323998419205` está centralizado em `config.js`. O script oficial da Meta carrega após permissão. PageView e ViewContent sinalizam a visita; InitiateCheckout sinaliza o clique de saída para o checkout, conforme o exemplo da referência oficial da Meta. O clique continua sem comprovar carregamento do checkout nem compra. Eventos da VSL são personalizados. Todos usam IDs de eventos estáveis por carregamento e são enviados apenas ao pixel configurado (trackSingle / trackSingleCustom).

O modo de diagnóstico não carrega a Meta. A recusa e a revogação interrompem novos eventos; preferências antigas exigem nova escolha. O código da LP não envia campos de correspondência avançada nem dispara Purchase. O token da Conversions API nunca deve ser gravado em config.js, HTML, JavaScript, documentação ou histórico público.

O envio de compras pela CAPI depende de atualização segura no n8n, com filtro pelo produto Reconquiste, confirmação de pagamento aprovado e tratamento de estornos. Não reutilizar o pixel novo indiscriminadamente para produtos antigos. Não ativar duas fontes de Purchase sem validar event_name + event_id para deduplicação. Webhook e CAPI são integrações diferentes; o token Meta não autentica chamadas Wiapy → n8n.

Referências: https://developers.facebook.com/documentation/meta-pixel/reference e https://docs.n8n.io/connect/n8n-api/authentication.md


## Atualização de 25/11/2026

A pedido do proprietário, o aviso automático foi removido. A medição inicia no carregamento, salvo preferência de recusa salva. A opção em Privacidade permite desativar ou reativar a medição. Essa decisão substitui as descrições anteriores de autorização prévia.

## Visitantes e IC únicos por dia

O navegador salva um ID aleatório em `reconquiste:visitor:v1` por 180 dias. O `event_id` preserva sua parte única por carregamento e acrescenta `__vid_ID`. O `click_id` continua sendo o identificador de atribuição por sessão/campanha, separado do visitante. Não usa IP, fingerprint ou dados pessoais para unir navegadores.

PageViews e IC brutos continuam registrados normalmente, com os mesmos IDs enviados à Meta. A aba `funil!A22:D29` mostra visualizações totais, visitantes únicos diários e IC únicos diários da oferta Reconquiste, respeitando as datas B4:B5. Para os únicos, agrupa pelo sufixo do navegador e pela data R da linha, calculada pelo servidor em America/Sao_Paulo. Repetições, inclusive em abas simultâneas, não aumentam os únicos. Em períodos com vários dias, o resultado é a soma dos únicos de cada dia.

Esses indicadores começam com a implantação desta versão; linhas antigas sem sufixo não entram no total de únicos. Se o navegador bloquear o armazenamento, a linha fica sem sufixo e não é apresentada como um visitante identificado. Limpar dados, usar outro navegador, mudar de domínio/origem ou expirar o ID pode gerar uma nova identificação. Diagnósticos ficam excluídos e usam chave de armazenamento própria. Recusar medição apaga o ID salvo.

O fluxo Tracking já preserva event_id e não precisa ser alterado. A contagem utiliza ROWS(UNIQUE(FILTER(...))) com filtro exato por evento e oferta, sem depender de uma operação de consulta/gravação sujeita a corridas.

Validação: quatro execuções diagnósticas no fluxo Tracking (IDs 560924–560927), incluindo um event_id repetido e dois navegadores, resultaram em 2 únicos numa fórmula nativa de teste. O caso sem resultados foi validado com retorno zero. A fórmula temporária foi removida. Os eventos `diagnostico_daily_qa` permanecem como registros de auditoria e não entram nos indicadores reais.
