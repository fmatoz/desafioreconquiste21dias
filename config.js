/* Configure o novo checkout e o pixel desta oferta antes de abrir as vendas. */
window.DOCE_NO_LUCRO_CONFIG = Object.freeze({
  checkoutUrl: "https://pay.wiapy.com/ShAhZYwpBE84",
  price: 10,
  originalPrice: 97,
  supportEmail: "",
  // VSL horizontal: arquivo MP4/WebM local em assets/ ou URL HTTPS direta.
  videoUrl: "assets/doce-no-lucro-vsl-d3f09b240505.mp4",
  videoPreviewUrl: "",
  videoPosterUrl: "assets/doce-no-lucro-vsl-poster-38a2ee64580b.webp",
  // Somente relatos reais, com autorização. Campos: name, text, photoUrl (opcional).
  testimonials: [],
  tracking: {
    enabled: true,
    metaPixelId: "",
    endpoint: "https://projetopessoal-n8n.h574he.easypanel.host/webhook/track",
    offerName: "Doce no Lucro — Planilha de Precificação"
  }
});

