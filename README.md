# Doce no Lucro

**Saiba quanto cobrar e quanto sobra em cada receita!**

Landing page de uma planilha de precificação para confeitaria. HTML, CSS e JavaScript sem dependências de produção. Repositório: `fmatoz/docenolucro`, renomeado da oferta Reconquiste.

## Estado da oferta — 27/11/2026

- Preço inicial escolhido: **R$ 10,00**, com valor regular de **R$ 97,00** informado pelo proprietário, configurados em `config.js`.
- Estrutura enxuta: hero com apresentação do produto, benefícios, três bônus com mockups, demonstração interativa, depoimentos (ocultos até receber relatos reais), oferta com quatro entregáveis separados, garantia, dúvidas e rodapé.
- A seção dos pesquisadores e todo o conteúdo de relacionamento foram retirados da página.
- A demonstração interativa fica abaixo dos bônus. O bloco de situações de uso foi removido. Depoimentos reais serão cadastrados em `testimonials` de `config.js`, nos campos `name`, `text` e `photoUrl` opcional. A seção só aparece quando há relatos preenchidos.
- Bônus apresentados: vídeo de uso, mensagens/orçamentos para WhatsApp e checklist de encomendas. A produção/entrega final desses materiais precisa estar concluída antes da abertura das vendas.
- **Checkout novo pendente.** Sem URL válida, o botão abre um aviso de vendas ainda não disponíveis.
- **Pixel e rastreamento desta oferta pendentes e desativados.** Nenhum pixel, checkout ou endpoint antigo está ativo nesta página.
- Order bumps são opcionais e separados da planilha + três bônus. O minicurso de tráfego pago é uma ideia futura de upsell, sem promessa de entrega nesta oferta.

## Executar e verificar

Node.js 20.11 ou superior:

```sh
npm run dev
npm run check
npm run build
```

Prévia em `http://127.0.0.1:4173`. Build em `dist/`. O build copia apenas os cinco assets referenciados no HTML; mídias antigas ainda no repositório não entram na publicação.

## Abrir as vendas

1. Concluir e conferir a entrega da planilha e dos três bônus.
2. Criar o checkout próprio da oferta e colocar sua URL HTTPS em `checkoutUrl`.
3. Confirmar o preço e as formas de pagamento no checkout. O preço em `config.js` atualiza o valor da oferta e a chamada da hero; ele **não altera o preço cobrado na plataforma**.
4. Configurar o pixel e endpoint próprios da oferta antes de ativar `tracking.enabled`. O backend precisa reconhecer esta oferta e validar os eventos. Atualizar o texto de privacidade conforme a medição efetivamente adotada.
5. Validar PageView e InitiateCheckout com o pixel correto, a atribuição até o checkout e os webhooks de pagamentos. A LP nunca emite Purchase: compras aprovadas devem vir da plataforma, com deduplicação por transação.
6. Cadastrar o novo produto no painel UTM7 separadamente da oferta anterior e conferir pagamentos, reembolsos e eventuais bumps/upsell.

UTMs e identificadores de clique recebidos na URL são preservados na navegação para um checkout configurado. Com a medição ativa, o módulo mantém o comportamento de atribuição e deduplicação da base anterior, com namespace próprio `docenolucro`. IC é emitido somente pelo botão que abre um checkout configurado; os CTAs de navegação interna não iniciam compra.

Nenhum link privado da planilha paga ou arquivo do produto está publicado no código da LP.

## Teste de preço planejado

Começar por R$ 10 e depois avaliar R$ 27, conforme orientação do proprietário. Não há divisão automática de tráfego ou checkout de R$ 27 implementado. Sincronizar preço da página e da plataforma a cada teste. Comparar lucro líquido por pedido, custo por compra, conversão, reembolsos e participação de bumps/upsell; manter os resultados de cada preço identificáveis.

## Publicação e validação

Publicação pela integração Git da Vercel, branch `main`, saída `dist`. O endereço da hospedagem continua sendo configurado separadamente do nome do repositório. Endereço existente: https://desafioreconquiste21dias.vercel.app/.

Mockups novos gerados por imagegen e otimizados para WebP (720 × 720), um para cada bônus. São imagens ilustrativas de materiais digitais.

Conferidos localmente: estrutura, referências de arquivos, âncoras, ausência do conteúdo antigo, testes do tracking e build. QA visual e funcional em navegador isolado nos tamanhos 320, 390, 768 e 1440 px: exemplos interativos, amostra, CTAs, aviso sem checkout, FAQ e privacidade. Não foi realizada compra de teste porque o checkout ainda não existe.

A documentação antiga em `docs/` e os commits anteriores registram a oferta Reconquiste e não descrevem a configuração atual desta oferta.
