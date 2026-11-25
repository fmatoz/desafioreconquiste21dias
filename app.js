(() => {
  "use strict";
  const config = window.RECONQUISTE_CONFIG || {};
  const $ = (selector) => document.querySelector(selector);
  const safeHttps = (value) => {
    try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url : null; }
    catch { return null; }
  };
  const emit = (name, detail = {}) => {
    // O módulo de tracking cuida do consentimento e do envio externo.
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
    if (window.RECONQUISTE_TRACKING) window.RECONQUISTE_TRACKING.decorate(checkout);
    const incoming = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"].forEach((key) => {
      const value = incoming.get(key);
      if (value && !checkout.searchParams.has(key)) checkout.searchParams.set(key, value);
    });
    document.querySelectorAll('[data-track="hero_cta"], [data-track="benefits_cta"], [data-track="checkout_cta"]').forEach((button) => {
      button.href = checkout.href;
      button.rel = "nofollow";
    });
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
  // Prévia silenciosa; a apresentação com áudio começa somente por ação da visitante.
  const mediaUrl = (value) => {
    if (typeof value !== "string" || !value) return null;
    if (/^\/?assets\/[\w/-]+\.(mp4|webm|webp)$/i.test(value) && !value.split("/").includes("..")) {
      return new URL(value, document.baseURI);
    }
    return safeHttps(value);
  };
  const video = $("#vsl-video");
  const videoButton = $("#video-play");
  const videoShell = $("#video-container");
  const videoMessage = $("#vsl-message");
  const videoEnd = $("#vsl-end");
  const videoReplay = $("#vsl-replay");
  const fullVideo = mediaUrl(config.videoUrl);
  const previewVideo = mediaUrl(config.videoPreviewUrl);
  const videoPoster = mediaUrl(config.videoPosterUrl);
  if (video && videoButton && fullVideo && /\.(mp4|webm)$/i.test(fullVideo.pathname)) {
    let started = false;
    let starting = false;
    let tracked = false;
    const milestones = new Set();
    let inView = true;
    const reducedVideoMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (videoPoster) video.poster = videoPoster.href;
    video.controls = false;
    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;

    const updateVideoButton = () => {
      const ended = started && video.ended;
      const playing = started && !video.paused && !video.ended;
      videoButton.hidden = ended;
      videoEnd.hidden = !ended;
      videoShell.dataset.state = starting ? "loading" : !started ? "preview" : video.ended ? "ended" : playing ? "playing" : "paused";
      videoButton.disabled = starting;
      videoButton.querySelector(".vsl-label").textContent = starting ? "Carregando…" : "Assista esse Vídeo";
      videoButton.setAttribute("aria-label", starting ? "Carregando vídeo" : !started ? "Assista esse Vídeo com som" : playing ? "Pausar vídeo" : video.ended ? "Assista esse Vídeo novamente" : "Assista esse Vídeo: continuar");
      videoShell.setAttribute("aria-busy", String(starting));
    };
    const showVideoError = () => {
      if (!started) return; // Se a prévia falhar, o pôster e o play permanecem disponíveis.
      starting = false;
      videoMessage.textContent = "Não foi possível carregar o vídeo. Toque em play para tentar novamente.";
      videoMessage.hidden = false;
      updateVideoButton();
    };
    const updatePreview = () => {
      if (started || !previewVideo) return;
      if (document.hidden || !inView || reducedVideoMotion.matches) {
        video.pause();
        return;
      }
      video.muted = true;
      video.loop = true;
      video.play().catch(() => { /* Economia de energia pode bloquear autoplay; o play continua disponível. */ });
    };
    const toggleVideo = () => {
      if (starting) return;
      if (started && !video.paused && !video.ended) {
        video.pause();
        return;
      }
      videoMessage.hidden = true;
      const mustLoad = !started || video.error;
      started = true;
      if (mustLoad) {
        video.pause();
        video.loop = false;
        video.autoplay = false;
        video.muted = false;
        video.preload = "auto";
        video.src = fullVideo.href;
        video.load();
      }
      if (video.ended) video.currentTime = 0;
      video.muted = false;
      starting = true;
      updateVideoButton();
      // Chamado diretamente no gesto de play, inclusive no Safari/iOS.
      video.play().then(() => {
        starting = false;
        updateVideoButton();
      }).catch(() => {
        starting = false;
        updateVideoButton();
        if (video.error) showVideoError();
      });
    };
    videoButton.addEventListener("click", toggleVideo);
    videoReplay.addEventListener("click", toggleVideo);
    video.addEventListener("click", toggleVideo);
    video.addEventListener("playing", () => {
      if (!started) return;
      starting = false;
      if (!tracked) {
        tracked = true;
        emit("vsl_play");
      }
      updateVideoButton();
    });
    video.addEventListener("pause", updateVideoButton);
    video.addEventListener("timeupdate", () => {
      if (!started || video.muted || !tracked || !Number.isFinite(video.duration) || !video.duration) return;
      [25, 50, 75].forEach((percent) => {
        if (video.currentTime / video.duration * 100 >= percent && !milestones.has(percent)) {
          milestones.add(percent);
          emit("vsl_" + percent);
        }
      });
    });
    video.addEventListener("ended", () => {
      updateVideoButton();
      if (started) emit("vsl_complete");
    });
    video.addEventListener("error", showVideoError);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) video.pause();
      else updatePreview();
    });
    reducedVideoMotion.addEventListener("change", updatePreview);
    if (previewVideo) {
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.preload = "none";
      video.src = previewVideo.href;
      const observer = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        updatePreview();
      }, { rootMargin: "80px" });
      observer.observe(videoShell);
    }
    updateVideoButton();
  }


  const quoteCarousel = $("#relatos-carousel");
  if (quoteCarousel) {
    const cards = [...quoteCarousel.querySelectorAll("figure")];
    const track = document.createElement("div");
    track.className = "quote-track";
    track.append(...cards);
    // A segunda sequência permite que a primeira reapareça na mesma posição visual.
    const copies = cards.map((card) => {
      const copy = card.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.inert = true;
      copy.querySelectorAll("img").forEach((image) => {
        image.alt = "";
        image.classList.add("is-loaded");
        image.addEventListener("error", () => { image.hidden = true; }, { once: true });
      });
      return copy;
    });
    track.append(...copies);
    quoteCarousel.append(track);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const measure = () => {
      if (reducedMotion.matches) return;
      const distance = copies[0].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
      track.style.setProperty("--quote-distance", distance + "px");
      track.style.setProperty("--quote-duration", distance / 24 + "s");
    };
    quoteCarousel.classList.add("has-loop");
    measure();
    new ResizeObserver(measure).observe(quoteCarousel);
    quoteCarousel.addEventListener("pointerdown", () => quoteCarousel.classList.add("is-interacting"));
    const release = () => quoteCarousel.classList.remove("is-interacting");
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    document.addEventListener("visibilitychange", () => {
      quoteCarousel.classList.toggle("is-inactive", document.hidden);
    });
    quoteCarousel.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const step = cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
      const animation = track.getAnimations()[0];
      if (animation) {
        const duration = Number(animation.effect.getTiming().duration);
        const distance = copies[0].offsetLeft - cards[0].offsetLeft;
        animation.currentTime = (Number(animation.currentTime) + direction * step / distance * duration + duration) % duration;
      } else {
        quoteCarousel.scrollBy({ left: direction * step, behavior: "instant" });
      }
    });
    reducedMotion.addEventListener("change", () => {
      quoteCarousel.scrollLeft = 0;
      measure();
    });
  }

})();
