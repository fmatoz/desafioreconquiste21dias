/* Configure o novo checkout e o pixel desta oferta antes de abrir as vendas. */
window.DOCE_NO_LUCRO_CONFIG = Object.freeze({
  checkoutUrl: "",
  price: 10,
  originalPrice: 97,
  supportEmail: "",
  // VSL horizontal: arquivo MP4/WebM local em assets/ ou URL HTTPS direta.
  videoUrl: "",
  videoPreviewUrl: "",
  videoPosterUrl: "assets/doce-planilha.svg",
  // Somente relatos reais, com autorização. Campos: name, text, photoUrl (opcional).
  testimonials: [],
  tracking: {
    enabled: false,
    metaPixelId: "",
    endpoint: "",
    offerName: "Doce no Lucro — Planilha de Precificação"
  }
});
