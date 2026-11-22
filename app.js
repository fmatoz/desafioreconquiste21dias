(() => {
  "use strict";
  const config = window.RECONQUISTE_CONFIG || {};
  const $ = (selector) => document.querySelector(selector);
  const safeHttps = (value) => {
    try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url : null; }
    catch { return null; }
  };
  const emit = (name, detail = {}) => {
    // Evento local: integrar o destino de tracking somente com consentimento e política atualizada.
    window.dispatchEvent(new CustomEvent("reconquiste:event", { detail: { name, ...detail } }));
  };
  $("#year").textContent = new Date().getFullYear();
  if (typeof config.price === "number" && Number.isFinite(config.price) && config.price > 0) {
    $("#price-label").textContent = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(config.price);
    $("#price-block").hidden = false;
  }
  const checkout = safeHttps(config.checkoutUrl);
  if (checkout) {
    const incoming = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"].forEach((key) => {
      const value = incoming.get(key);
      if (value && !checkout.searchParams.has(key)) checkout.searchParams.set(key, value);
    });
    $("#purchase-button").href = checkout.href;
    $("#purchase-button").rel = "nofollow";
  } else {
    $("#purchase-button").addEventListener("click", (event) => {
      event.preventDefault();
      $("#availability-dialog").showModal();
    });
  }
  document.querySelectorAll("[data-track]").forEach((element) => {
    element.addEventListener("click", () => emit(element.dataset.track, { checkoutConfigured: Boolean(checkout) }));
  });
  let dialogTrigger;
  document.querySelectorAll("[data-open-dialog]").forEach((element) => {
    element.addEventListener("click", () => { dialogTrigger = element; document.getElementById(element.dataset.openDialog).showModal(); });
  });
  document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    dialog.addEventListener("close", () => { dialogTrigger?.focus(); dialogTrigger = null; });
  });
  if (typeof config.supportEmail === "string" && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(config.supportEmail)) {
    $("#privacy-contact").hidden = false;
    $("#privacy-contact").textContent = "Contato: " + config.supportEmail;
  }
  const videoUrl = safeHttps(config.videoUrl);
  const embedHosts = ["www.youtube-nocookie.com", "www.youtube.com", "player.vimeo.com"];
  const validEmbed = videoUrl && embedHosts.includes(videoUrl.hostname) &&
    ((videoUrl.hostname === "player.vimeo.com" && /^\/video\/\d+/.test(videoUrl.pathname)) || /^\/embed\/[\w-]+/.test(videoUrl.pathname));
  const validVideo = videoUrl && /\.(mp4|webm)$/i.test(videoUrl.pathname);
  if ((config.videoType === "embed" && validEmbed) || (config.videoType === "video" && validVideo)) {
    $("#video-placeholder").hidden = true;
    $("#video-play").hidden = false;
    $("#video-play").addEventListener("click", () => {
      let player;
      if (config.videoType === "embed") {
        player = document.createElement("iframe");
        player.title = "Apresentação — Reconquiste seu Marido";
        player.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
        player.allowFullscreen = true;
        player.referrerPolicy = "strict-origin-when-cross-origin";
        videoUrl.searchParams.set("autoplay", "1");
        player.src = videoUrl.href;
      } else {
        player = document.createElement("video");
        player.controls = true; player.playsInline = true; player.preload = "metadata";
        player.setAttribute("aria-label", "Apresentação — Reconquiste seu Marido");
        player.src = videoUrl.href;
      }
      $("#video-container").replaceChildren(player);
      if (config.videoType === "video") player.play().catch(() => { /* Os controles continuam disponíveis. */ });
      emit("vsl_play");
    }, { once: true });
  }
  if ("IntersectionObserver" in window) {
    let heroVisible = true; let offerVisible = false;
    const updateSticky = () => { $("#mobile-cta").hidden = heroVisible || offerVisible; };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target.id === "inicio") heroVisible = entry.isIntersecting;
        if (entry.target.id === "plano") offerVisible = entry.isIntersecting;
      });
      updateSticky();
    }, { threshold: 0 });
    observer.observe($("#inicio")); observer.observe($("#plano"));
  }
})();
