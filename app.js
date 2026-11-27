(() => {
  "use strict";
  const config = window.DOCE_NO_LUCRO_CONFIG || {};
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const $ = (selector) => document.querySelector(selector);
  $("#year").textContent = new Date().getFullYear();
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
