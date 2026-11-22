# Reconquiste — Plano de 21 Dias

Landing page responsiva do guia **Reconquiste seu Marido — Plano de 21 Dias de Atitudes que Aproximam**. HTML, CSS e JavaScript, sem dependências de produção, sem serviços externos necessários à renderização e sem coleta de dados nesta versão.

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

`.openai/hosting.json` mantém a identidade da prévia reservada no Sites. A primeira tentativa de sincronizar sua origem falhou por indisponibilidade de rede do terminal; não representa uma publicação concluída.

## Conteúdo e decisões

- Hero direta, CTA que leva à oferta, espaço de VSL e amostra prática do material.
- Conteúdo comercial limitado ao guia real: 50 páginas, 21 desafios, exemplos, adaptações e acompanhamento.
- Não há desconto fictício, contador, escassez, avaliações inventadas, estatísticas de clientes ou garantia de reconquista.
- Os relatos externos identificam a prática e o material utilizados em cada experiência. Não são avaliações do nosso produto.
- Vinho `#542c41`, rosa suave `#f9edf1`, CTA `#a13258` e branco. Paleta escolhida por contexto editorial e contraste; não é apresentada como cor comprovadamente superior para mulheres.
- Tipografia nativa, imagem WebP local, zero bibliotecas, fontes ou rastreadores externos na carga inicial.
- Botão fixo no celular aparece após a Hero e desaparece quando a oferta entra na tela. FAQ nativa, diálogos acessíveis, foco de teclado e respeito à preferência de movimento reduzido.

Veja a documentação de pesquisa em `docs/fontes.md`.
