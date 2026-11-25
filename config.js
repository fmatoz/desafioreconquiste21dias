// Configure o checkout e a VSL sem alterar o layout. Nenhum segredo deve entrar neste arquivo público.
window.RECONQUISTE_CONFIG = Object.freeze({
  checkoutUrl: "",
  // Valores em reais. Null oculta o preço; originalPrice só aparece quando maior que price.
  price: 14.97,
  originalPrice: 47,
  // Arquivos locais ou HTTPS. A versão completa só é carregada após o play.
  videoUrl: "assets/vsl-reconquiste.mp4",
  videoPreviewUrl: "assets/vsl-previa.mp4",
  videoPosterUrl: "assets/vsl-poster.webp",
  supportEmail: "",
  // Só ativar com uma condição que expire de fato na plataforma de pagamento.
  // expiresAt é o prazo absoluto fornecido pelo checkout/backend, inclusive por sessão.
  offerCountdown: { enabled: false, expiresAt: "", checkoutEnforcesDeadline: false }
});
