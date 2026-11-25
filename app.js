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

  // Se um retrato externo estiver indisponível, preserva a identificação por iniciais.
  document.querySelectorAll(".person-avatar img").forEach((image) => {
    const show = () => image.classList.add("is-loaded");
    const fallback = () => { image.hidden = true; };
    image.addEventListener("load", show, { once: true });
    image.addEventListener("error", fallback, { once: true });
    if (image.complete) image.naturalWidth > 0 ? show() : fallback();
  });
  $("#year").textContent = new Date().getFullYear();
  if (typeof config.price === "number" && Number.isFinite(config.price) && config.price > 0) {
    const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
    $("#price-label").textContent = currency.format(config.price);
    const originalPrice = $("#original-price");
    if (originalPrice && Number.isFinite(config.originalPrice) && config.originalPrice > config.price) {
      $("#original-price-label").textContent = currency.format(config.originalPrice);
      originalPrice.hidden = false;
    }
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
  // O prazo vem do checkout/backend; nunca é inventado ou reiniciado pelo navegador.
  const offer = config.offerCountdown;
  const offerDeadline = Date.parse(offer?.expiresAt || "");
  if (checkout && offer?.enabled === true && offer.checkoutEnforcesDeadline === true && Number.isFinite(offerDeadline)) {
    const banner = $("#offer-banner");
    const clock = $("#offer-countdown");
    const wrapper = $("#offer-countdown-wrap");
    let timer;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((offerDeadline - Date.now()) / 1000));
      const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
      const seconds = String(remaining % 60).padStart(2, "0");
      clock.textContent = minutes + ":" + seconds;
      wrapper.hidden = remaining === 0;
      $("#offer-banner-title").textContent = remaining ? "CONDIÇÃO ESPECIAL" : "ESTA CONDIÇÃO ENCERROU";
      $("#offer-banner-description").textContent = remaining ? "Encerra em" : "Consulte o valor atual no checkout.";
      if (!remaining) {
        clearInterval(timer);
        $("#price-block").hidden = true;
        $("#purchase-button").textContent = "Consultar condição atual";
      }
    };
    tick();
    banner.hidden = false;
    if (offerDeadline > Date.now()) timer = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
    window.addEventListener("pageshow", tick);
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

  const quoteCarousel = $("#relatos-carousel");
  if (quoteCarousel) {
    const cards = [...quoteCarousel.querySelectorAll("figure")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let hovering = false;
    let touching = false;
    let timer;
    const metrics = () => {
      const gap = parseFloat(getComputedStyle(quoteCarousel).gap) || 0;
      const step = cards[0].getBoundingClientRect().width + gap;
      const visible = Math.max(1, Math.round((quoteCarousel.clientWidth + gap) / step));
      const last = Math.max(0, cards.length - visible);
      const current = Math.min(last, Math.max(0, Math.round(quoteCarousel.scrollLeft / step)));
      return { step, visible, last, current };
    };
    const move = (direction) => {
      const { step, last, current } = metrics();
      const next = (current + direction + last + 1) % (last + 1);
      quoteCarousel.scrollTo({
        left: next * step,
        behavior: reducedMotion.matches ? "instant" : "smooth"
      });
    };
    const schedule = () => {
      clearTimeout(timer);
      if (!reducedMotion.matches && !hovering && !touching && !document.hidden &&
          !quoteCarousel.parentElement.contains(document.activeElement)) {
        timer = setTimeout(() => { move(1); schedule(); }, 5500);
      }
    };
    quoteCarousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        move(event.key === "ArrowRight" ? 1 : -1);
      }
    });
    quoteCarousel.parentElement.addEventListener("focusin", schedule);
    quoteCarousel.parentElement.addEventListener("focusout", () => setTimeout(schedule, 0));
    quoteCarousel.addEventListener("mouseenter", () => { hovering = true; schedule(); });
    quoteCarousel.addEventListener("mouseleave", () => { hovering = false; schedule(); });
    quoteCarousel.addEventListener("pointerdown", () => { touching = true; schedule(); });
    const release = () => { touching = false; schedule(); };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    quoteCarousel.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    reducedMotion.addEventListener("change", schedule);
    schedule();
  }

})();
