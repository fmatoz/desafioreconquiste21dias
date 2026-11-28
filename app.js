(() => {
  "use strict";
  const config = window.DOCE_NO_LUCRO_CONFIG || {};
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const $ = (selector) => document.querySelector(selector);
  $("#year").textContent = new Date().getFullYear();
  const countdown = $("#offer-countdown");
  if (countdown) {
    const brasiliaClock = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    });
    const updateCountdown = () => {
      const parts = Object.fromEntries(brasiliaClock.formatToParts(new Date()).map(part => [part.type, part.value]));
      const remaining = 86399 - (Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second));
      countdown.textContent = [Math.floor(remaining / 3600), Math.floor(remaining % 3600 / 60), remaining % 60]
        .map(value => String(value).padStart(2, "0")).join(":");
    };
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
    document.addEventListener("visibilitychange", updateCountdown);
  }
  if (Number.isFinite(config.price) && config.price > 0) {
    document.querySelectorAll("#price-label, [data-price]").forEach((element) => { element.textContent = money.format(config.price); });
  }

  const reference = $("#original-price");
  if (reference && Number.isFinite(config.originalPrice) && config.originalPrice > config.price) {
    $("#original-price-label").textContent = money.format(config.originalPrice);
    reference.hidden = false;
  }

  const testimonials = Array.isArray(config.testimonials) ? config.testimonials : [];
  const verified = testimonials.filter(item => item && typeof item.name === "string" && item.name.trim() && typeof item.text === "string" && item.text.trim());
  if (verified.length) {
    const list = $("#testimonial-list");
    verified.forEach(item => {
      const card = document.createElement("figure");
      card.className = "testimonial-card";
      const quote = document.createElement("blockquote");
      quote.textContent = item.text;
      const caption = document.createElement("figcaption");
      const name = document.createElement("strong");
      name.textContent = item.name;
      const avatar = document.createElement("span");
      avatar.className = "testimonial-avatar";
      avatar.textContent = item.name.trim().slice(0, 1).toUpperCase();
      try {
        const url = new URL(item.photoUrl);
        if (url.protocol === "https:" && !url.username && !url.password) {
          const image = document.createElement("img");
          image.src = url.href;
          image.alt = "";
          image.width = 44;
          image.height = 44;
          image.loading = "lazy";
          image.addEventListener("error", () => image.remove(), { once: true });
          avatar.append(image);
        }
      } catch { /* Sem retrato fornecido, mostra apenas a inicial real. */ }
      caption.append(avatar, name);
      card.append(quote, caption);
      list.append(card);
    });
    $("#depoimentos").hidden = false;
  }

  let checkout;
  try {
    const url = new URL(config.checkoutUrl);
    if (url.protocol === "https:" && !url.username && !url.password) checkout = url;
  } catch { /* A página pode ser revisada antes da abertura das vendas. */ }
  const purchase = $("#purchase-button");
  if (checkout) {
    window.DOCE_NO_LUCRO_TRACKING?.decorate(checkout);
    const incoming = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "fbclid", "gclid"].forEach((key) => {
      const value = incoming.get(key);
      if (value && !checkout.searchParams.has(key)) checkout.searchParams.set(key, value);
    });
    purchase.href = checkout.href;
    purchase.rel = "nofollow";
  }
  let dialogTrigger;
  const openDialog = (id, trigger) => {
    dialogTrigger = trigger;
    document.getElementById(id).showModal();
  };
  if (!checkout) purchase.addEventListener("click", (event) => {
    event.preventDefault();
    openDialog("availability-dialog", purchase);
  });
  document.querySelectorAll("[data-track]").forEach((element) => {
    element.addEventListener("click", () => window.dispatchEvent(new CustomEvent("docenolucro:event", {
      detail: { name: element.dataset.track, checkoutConfigured: Boolean(checkout) }
    })));
  });
  document.querySelectorAll("[data-open-dialog]").forEach((button) => button.addEventListener("click", () => openDialog(button.dataset.openDialog, button)));
  document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      const r = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
    });
    dialog.addEventListener("close", () => { dialogTrigger?.focus(); dialogTrigger = null; });
  });
  if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(config.supportEmail || "")) {
    $("#privacy-contact").hidden = false;
    $("#privacy-contact").textContent = "Contato: " + config.supportEmail;
  }

  // A capa funciona sozinha enquanto a VSL da nova oferta está em produção.
  const mediaUrl = (value, extensions) => {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      let url;
      if (/^assets\/[A-Za-z0-9_./-]+$/.test(value) && !value.split("/").includes("..")) {
        url = new URL(value, document.baseURI);
      } else {
        url = new URL(value);
        if (url.protocol !== "https:" || url.username || url.password) return null;
      }
      return extensions.some(extension => url.pathname.toLowerCase().endsWith("." + extension)) ? url : null;
    } catch { return null; }
  };
  const fullVideo = mediaUrl(config.videoUrl, ["mp4", "webm"]);
  const previewVideo = mediaUrl(config.videoPreviewUrl, ["mp4", "webm"]);
  const poster = mediaUrl(config.videoPosterUrl, ["svg", "webp", "png", "jpg", "jpeg"]);
  if (poster) $("#vsl-poster").src = poster.href;
  if (fullVideo) {
    const frame = $("#vsl-container");
    const video = $("#vsl-video");
    const cover = $("#vsl-cover");
    const play = $("#vsl-play");
    const label = $("#vsl-play-label");
    const end = $("#vsl-end");
    const error = $("#vsl-error");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const milestones = new Set();
    let started = false, loading = false, tracked = false, inView = true;
    const emitVideo = name => window.dispatchEvent(new CustomEvent("docenolucro:event", { detail: { name } }));
    $("#vsl-pending").hidden = true;
    play.hidden = false;
    video.controls = false;
    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;
    const update = () => {
      const ended = started && video.ended;
      const playing = started && !video.paused && !video.ended;
      frame.dataset.state = loading ? "loading" : !started ? "preview" : ended ? "ended" : playing ? "playing" : "paused";
      play.hidden = ended;
      end.hidden = !ended;
      play.disabled = loading;
      label.textContent = loading ? "Carregando…" : "Assista esse Vídeo e Veja como Funciona!";
      play.setAttribute("aria-label", loading ? "Carregando vídeo" : !started ? "Assistir ao vídeo com som" : playing ? "Pausar vídeo" : "Continuar vídeo");
    };
    const showError = () => {
      loading = false;
      video.hidden = true;
      cover.hidden = false;
      error.hidden = false;
      update();
    };
    const toggle = async () => {
      if (loading) return;
      if (started && !video.paused && !video.ended) { video.pause(); return; }
      error.hidden = true;
      const mustLoad = !started || video.error;
      started = true;
      loading = true;
      video.muted = false;
      video.defaultMuted = false;
      video.loop = false;
      video.hidden = false;
      if (mustLoad) { video.src = fullVideo.href; video.load(); }
      if (video.ended) video.currentTime = 0;
      update();
      try {
        await video.play();
        loading = false;
        cover.hidden = true;
        update();
      } catch { showError(); }
    };
    play.addEventListener("click", toggle);
    $("#vsl-retry").addEventListener("click", toggle);
    $("#vsl-replay").addEventListener("click", () => {
      video.currentTime = 0;
      toggle();
    });
    video.addEventListener("playing", () => {
      if (!started) return;
      loading = false;
      cover.hidden = true;
      if (!tracked) { tracked = true; emitVideo("vsl_play"); }
      update();
    });
    video.addEventListener("pause", update);
    video.addEventListener("ended", () => { emitVideo("vsl_complete"); update(); });
    video.addEventListener("timeupdate", () => {
      if (!started || video.muted || !Number.isFinite(video.duration) || video.duration <= 0) return;
      [25, 50, 75].forEach(percent => {
        if (video.currentTime / video.duration * 100 >= percent && !milestones.has(percent)) {
          milestones.add(percent); emitVideo("vsl_" + percent);
        }
      });
    });
    video.addEventListener("error", () => { if (started) showError(); });
    const updatePreview = () => {
      if (started || !previewVideo) return;
      if (document.hidden || !inView || motion.matches) { video.pause(); return; }
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.hidden = false;
      video.play().then(() => { cover.hidden = true; }).catch(() => { cover.hidden = false; });
    };
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) video.pause(); else updatePreview();
    });
    motion.addEventListener("change", updatePreview);
    if (previewVideo) {
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.src = previewVideo.href;
      const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updatePreview(); }, { rootMargin: "60px" });
      observer.observe(frame);
    }
    update();
  }

  // Exemplos de custeio da planilha, sem prometer resultado para uma receita real.
  const examples = {
    brigadeiro: { name: "Brigadeiro tradicional", quantity: 100, total: 107.326, unit: 1.5 },
    brownie: { name: "Brownie de chocolate", quantity: 24, total: 66.4557833, unit: 3.7 },
    pote: { name: "Bolo no pote", quantity: 12, total: 105.477, unit: 11.8 }
  };
  const renderExample = (key) => {
    const item = examples[key];
    const total = item.total;
    const revenue = item.quantity * item.unit;
    $("#demo-name").textContent = item.name;
    $("#demo-quantity").textContent = item.quantity + " unidades";
    $("#demo-cost").textContent = money.format(total);
    $("#demo-unit").textContent = money.format(item.unit);
    $("#demo-revenue").textContent = money.format(revenue);
    $("#demo-profit").textContent = money.format(revenue - total);
    $("#demo-cost-unit").textContent = money.format(total / item.quantity);
    $("#demo-margin").textContent = ((revenue - total) / revenue * 100).toFixed(1).replace(".", ",") + "%";
    document.querySelectorAll("[data-example]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.example === key)));
  };
  document.querySelectorAll("[data-example]").forEach((button) => button.addEventListener("click", () => renderExample(button.dataset.example)));
  renderExample("brigadeiro");
})();

