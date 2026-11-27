/* Configure o novo checkout e o pixel desta oferta antes de abrir as vendas. */
window.DOCE_NO_LUCRO_CONFIG = Object.freeze({
  checkoutUrl: "",
  price: 10,
  originalPrice: 97,
  supportEmail: "",
  // Somente relatos reais, com autorização. Campos: name, text, photoUrl (opcional).
  testimonials: [],
  tracking: {
    enabled: false,
    metaPixelId: "",
    endpoint: "",
    offerName: "Doce no Lucro — Planilha de Precificação"
  }
});
