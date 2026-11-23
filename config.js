// Configure o checkout e a VSL sem alterar o layout. Nenhum segredo deve entrar neste arquivo público.
window.RECONQUISTE_CONFIG = Object.freeze({
  checkoutUrl: "",
  // Valores em reais. Null oculta o preço; originalPrice só aparece quando maior que price.
  price: 14.97,
  originalPrice: 47,
  // MP4/WebM público, ou embed HTTPS de YouTube/Vimeo. Deixe vazio até a VSL estar pronta.
  videoUrl: "",
  // "video" para MP4/WebM; "embed" para YouTube/Vimeo (somente URL de incorporação).
  videoType: "video",
  supportEmail: "",
  // Só ativar com uma condição que expire de fato na plataforma de pagamento.
  // expiresAt é o prazo absoluto fornecido pelo checkout/backend, inclusive por sessão.
  offerCountdown: { enabled: false, expiresAt: "", checkoutEnforcesDeadline: false }
});
