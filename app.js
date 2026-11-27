(() => {
  "use strict";
  const config = window.DOCE_NO_LUCRO_CONFIG || {};
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const $ = (selector) => document.querySelector(selector);
  $("#year").textContent = new Date().getFullYear();
  if (Number.isFinite(config.price) && config.price > 0) {
    document.querySelectorAll("#price-label, [data-price]").forEach((element) => { element.textContent = money.format(config.price); });
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
