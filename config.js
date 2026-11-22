// Configure o checkout e a VSL sem alterar o layout. Nenhum segredo deve entrar neste arquivo público.
window.RECONQUISTE_CONFIG = Object.freeze({
  checkoutUrl: "",
  // Valor em reais, por exemplo 27. Null mantém o preço oculto até a definição comercial.
  price: null,
  // MP4/WebM público, ou embed HTTPS de YouTube/Vimeo. Deixe vazio até a VSL estar pronta.
  videoUrl: "",
  // "video" para MP4/WebM; "embed" para YouTube/Vimeo (somente URL de incorporação).
  videoType: "video",
  supportEmail: ""
});
