# Vendas Reconquiste — configuração e evidências

Atualizado em 25/11/2026 (America/Sao_Paulo).

## Configuração publicada

- Workflow n8n: Vendas, `R4D24UV7amcRlypu`.
- Versão publicada: `95f98f50-0b1e-4659-9e11-46ab63d2807d`.
- Produto principal na Wiapy: `6b065f34f3f790ea294e1363`, confirmado na captura fornecida pelo proprietário.
- A decisão usa o primeiro produto do payload. Produtos diferentes preservam a rota anterior, sem trocar o pixel dos demais.
- Pixel Reconquiste: `1795323998419205`.
- URL CAPI: `https://graph.facebook.com/v25.0/1795323998419205/events`.
- Credencial: Header Auth “Meta CAPI Reconquiste”, criada pelo proprietário e vinculada ao nó Purchase Meta Reconquiste. O segredo não é incluído neste repositório.
- Webhook já usado pelo proprietário: POST `https://projetopessoal-n8n.h574he.easypanel.host/webhook/545b369b-4a1e-42ba-a1b9-37c0e7bc12b7`.

## Fluxo e valores

Webhook Wiapy → Format Venda → É Reconquiste? → Validar Venda Reconquiste → Registrar Venda Reconquiste → Restaurar Venda Reconquiste → Reconquiste paga? → Hash Meta Reconquiste → Purchase Meta Reconquiste.

A gravação nova usa Google Sheets values.append com INSERT_ROWS e RAW em `vendas!A:AE`, preservando os 31 campos e as fórmulas AF:AK existentes. Os dados originais são restaurados após a resposta do append para que a CAPI receba valor, identificadores e contexto do pagamento, em vez da resposta do Sheets.

Purchase só segue quando `payment.status = paid` e o valor é válido e positivo. Pix pendente, cartão recusado, estorno e chargeback são registrados com seus estados e não viram Purchase. Os valores vêm do pagamento em centavos, convertidos para reais: o teste usou R$ 13,47 efetivamente pagos, em vez de forçar o preço-base de R$ 14,97. E-mail e telefone são normalizados e enviados à Meta com SHA-256; IP, agente e cookies só entram quando presentes. Nenhum dado de cliente ou segredo é publicado neste relatório.

## Deduplicação

- Event ID de compra: `purchase_PAYMENT_ID`, mantido em reenvios mesmo se o horário de atualização mudar.
- A coluna AI (unique_flag) deduplica por evento + pagamento. Reenvios ficam no histórico, mas têm flag zero e devem ser agregados respeitando essa coluna.
- A CAPI recebe o mesmo event_name Purchase e event_id estável nos reenvios.
- A LP não envia Purchase, evitando uma segunda fonte de compra no frontend. Se for ativado Purchase nativo no checkout Wiapy, é necessário comprovar que ele usa o mesmo event_id, ou escolher apenas uma fonte. Esta configuração nativa da Wiapy não foi inspecionada.
- A verificação visual da deduplicação no Gerenciador de Eventos não foi realizada.

Referência: [deduplicação na Meta](https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events) e [envio e retries na CAPI](https://developers.facebook.com/documentation/ads-commerce/conversions-api/using-the-api).

## Testes realizados

1. Execução 562843, com saídas HTTP fixadas: pagamento aprovado da Reconquiste segue para sua rota; valor real R$ 13,47, click_id extraído e hashes conferidos.
2. Execuções 562853–562858: pendência, estorno, chargeback e recusa não enviam Purchase; reenvio de pagamento mantém event_id; outro produto continua no pixel anterior. São simulações sem gravação de vendas ou envio de compras à Meta.
3. Execução 562936: a Meta aceitou 1 evento técnico ReconquisteIntegrationCheck, sem mensagens de erro. Esse diagnóstico não usa Purchase nem receita e comprova que a credencial autoriza o endpoint de envio. Uma consulta GET anterior retornou Missing Permission; a confirmação foi feita no endpoint CAPI.
4. Execuções HTTP 562946 e 562948 chamaram o webhook de produção, gerando as execuções 562947 e 562949. Resposta HTTP 200; diagnóstico gravado em `vendas!A191:AE192`.
5. As duas linhas têm o mesmo event_id diagnóstico e flags AI191 = 1 e AI192 = 0. O ramo de Purchase não foi executado.
6. Todos os nós temporários de teste foram removidos. O workflow está publicado e ativo com 13 nós.

Pagamentos cujo ID começa com `diag_reconquiste_` recebem prefixo diagnostico_ no evento e não são enviados como Purchase. Os registros de diagnóstico permanecem para auditoria, excluídos dos filtros exatos de compra.

## O que ainda não está comprovado

- A configuração salva/ativa e o teste de envio na conta Wiapy: o MCP disponível é do n8n; não foi feito controle do navegador.
- Uma notificação originada pela própria Wiapy. O teste HTTP comprova o receptor e o formato, sem fingir ser um pagamento legítimo.
- Uma compra real, entrega dos PDFs e conferência no Gerenciador de Eventos.
- Autenticação de origem do webhook: o endpoint compartilhado continua sem Header Auth, como na configuração anterior. O HTTP 200 não prova que o remetente é a Wiapy. Para autenticar a origem será necessário coordenar um token separado na Wiapy e no receptor, sem usar o token da Meta.

Na Wiapy, selecionar somente o produto Reconquiste e os eventos pagamento pendente, aprovado, estornado, chargeback e cartão recusado. Carrinho abandonado permanece sem processamento de compra.

Estrutura e estados foram conferidos na [documentação oficial de webhooks da Wiapy](https://help.wiapy.com/pt-br/article/webhook-jtggmu/), que também informa o cabeçalho Authorization para um eventual token de autenticação.
