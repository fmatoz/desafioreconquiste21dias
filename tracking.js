(() => {
  "use strict";
  const config = window.RECONQUISTE_CONFIG || {};
  const settings = config.tracking;
  if (!settings?.enabled) return;
  let endpoint;
  try { endpoint = new URL(settings.endpoint); } catch { return; }
  if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password) return;

  const params = new URLSearchParams(location.search);
  const test = params.get("tracking_test") === "1";
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "fbclid", "gclid"];
  const consentKey = "reconquiste:measurement:v2";
  const sessionKey = "reconquiste:attribution:v1";
  const visitorKey = test ? "reconquiste:visitor:test:v1" : "reconquiste:visitor:v1";
  const ttl = 30 * 60 * 1000;
  const id = () => crypto.randomUUID?.() || Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
  const pageId = id();
  const read = (storage, key) => { try { return JSON.parse(storage.getItem(key)); } catch { return null; } };
  const write = (storage, key, value) => { try { storage.setItem(key, JSON.stringify(value)); } catch { /* Funciona também sem armazenamento. */ } };
  const storage = (name) => { try { return window[name]; } catch { return { getItem: () => null, setItem: () => {}, removeItem: () => {} }; } };
  const local = storage("localStorage");
  const sessionStorageSafe = storage("sessionStorage");
  const savedConsent = read(local, consentKey);
  let consent = savedConsent && Date.now() - savedConsent.at < 180 * 86400000 ? savedConsent.allowed === true : true;
  let session;
  let visitor;
  // Identifica o navegador, sem fingerprinting. Só marca como identificável se persistir.
  const visitorId = () => {
    if (visitor !== undefined) return visitor;
    const saved = read(local, visitorKey);
    const valid = typeof saved?.id === "string" && /^[A-Za-z0-9_-]{8,100}$/.test(saved.id)
      && Number.isFinite(saved.at) && Date.now() - saved.at >= 0 && Date.now() - saved.at < 180 * 86400000;
    const candidate = valid ? saved : { id: id(), at: Date.now() };
    write(local, visitorKey, candidate);
    visitor = read(local, visitorKey)?.id === candidate.id ? candidate.id : null;
    return visitor;
  };
  const eventId = (event) => {
    const browser = visitorId();
    return event + "_" + pageId + (browser ? "__vid_" + browser : "");
  };
  const sent = new Set();
  const buffered = new Set();
  const readMetaCookie = (name) => {
    try { return (document.cookie || "").split(";").map(v => v.trim()).find(v => v.startsWith(name + "="))?.slice(name.length + 1) || ""; }
    catch { return ""; }
  };
  const stripClickId = (value) => String(value || "").replace(/(?:^|\|\|)cid:[A-Za-z0-9_-]+/g, "").replace(/\|\|$/, "");

  const ensureSession = () => {
    if (session) return session;
    const saved = read(sessionStorageSafe, sessionKey);
    const incoming = Object.fromEntries(keys.map(key => [key, (params.get(key) || "").slice(0, 500)]));
    incoming.utm_content = stripClickId(incoming.utm_content);
    const newCampaign = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"]
      .some(key => incoming[key] && incoming[key] !== saved?.attribution?.[key]);
    session = saved && typeof saved.click_id === "string" && /^[A-Za-z0-9_-]{8,100}$/.test(saved.click_id)
      && Date.now() - saved.at < ttl && !newCampaign ? saved : { click_id: id(), attribution: incoming };
    session.at = Date.now();
    write(sessionStorageSafe, sessionKey, session);
    return session;
  };

  const decorate = (url) => {
    const attribution = consent === true ? ensureSession().attribution : Object.fromEntries(keys.map(key => [key, params.get(key) || ""]));
    keys.forEach(key => { if (attribution[key] && !url.searchParams.has(key)) url.searchParams.set(key, attribution[key]); });
    if (consent === true) {
      const original = stripClickId(url.searchParams.get("utm_content"));
      url.searchParams.set("utm_content", (original ? original + "||" : "") + "cid:" + ensureSession().click_id);
    }
    return url;
  };
  const updateLinks = () => {
    let checkout;
    try { checkout = new URL(config.checkoutUrl); } catch { return; }
    if (checkout.protocol !== "https:") return;
    decorate(checkout);
    document.querySelectorAll('[data-track="checkout_cta"]')
      .forEach(link => { link.href = checkout.href; });
  };
  window.RECONQUISTE_TRACKING = Object.freeze({ decorate });


  // O token CAPI pertence ao servidor. Aqui entra apenas o ID público do pixel.
  const pixelId = String(settings.metaPixelId || "");
  let pixelReady = false;
  const startPixel = () => {
    if (test || consent !== true || !/^\d{10,20}$/.test(pixelId)) return false;
    if (!pixelReady) {
      if (!window.fbq) {
        const fbq = function () {
          if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
          else fbq.queue.push(arguments);
        };
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = "2.0";
        fbq.queue = [];
        window.fbq = window._fbq = fbq;
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.append(script);
      }
      window.fbq("consent", "grant");
      window.fbq("set", "autoConfig", false, pixelId);
      window.fbq("init", pixelId);
      pixelReady = true;
    } else window.fbq("consent", "grant");
    return true;
  };
  const pixelEvent = (event, eventId) => {
    try {
      if (!startPixel()) return;
      const properties = { content_ids: ["reconquiste-21-dias"], content_type: "product" };
      const options = { eventID: eventId };
      if (event === "page_view") {
        window.fbq("trackSingle", pixelId, "PageView", {}, options);
        window.fbq("trackSingle", pixelId, "ViewContent", properties, { eventID: "view_" + pageId });
      } else if (event === "initiate_checkout") {
        window.fbq("trackSingle", pixelId, "InitiateCheckout", {
          ...properties, value: Number(config.price) || 0, currency: "BRL", num_items: 1
        }, options);
      } else if (/^vsl_(play|25|50|75|complete)$/.test(event)) {
        window.fbq("trackSingleCustom", pixelId, event, {}, options);
      }
    } catch { /* Falha ou bloqueio da Meta não interrompe o site nem o Sheets. */ }
  };

  const send = (event) => {
    if (consent !== true || sent.has(event)) return;
    sent.add(event);
    const data = ensureSession();
    const currentEventId = eventId(event);
    pixelEvent(event, currentEventId);
    // Envia apenas a rota; parâmetros livres podem conter informações pessoais.
    const payload = {
      event: (test ? "diagnostico_" : "") + event,
      event_id: currentEventId,
      click_id: data.click_id,
      ...Object.fromEntries(keys.slice(0, 5).map(key => [key, data.attribution[key] || ""])),
      fbclid: data.attribution.fbclid || "",
      fbp: consent === true ? readMetaCookie("_fbp") : "",
      fbc: consent === true ? readMetaCookie("_fbc") : "",
      offer_name: settings.offerName,
      offer_value: Number(config.price) || 0,
      page_url: location.origin + location.pathname,
      user_agent: navigator.userAgent.slice(0, 500)
    };
    // Formato simples evita preflight no clique de saída. Não bloqueia a compra.
    const body = new URLSearchParams(Object.entries(payload).map(([key, value]) => [key, String(value)]));
    if (navigator.sendBeacon?.(endpoint.href, body)) return;
    fetch(endpoint.href, { method: "POST", body, credentials: "omit", keepalive: true }).catch(() => {});
  };
  window.addEventListener("reconquiste:event", ({ detail }) => {
    const name = detail?.name;
    const event = name === "checkout_cta"
      ? detail.checkoutConfigured ? "initiate_checkout" : null
      : ["vsl_play", "vsl_25", "vsl_50", "vsl_75", "vsl_complete"].includes(name) ? name : null;
    if (!event) return;
    if (consent === null) buffered.add(event);
    else send(event);
  });

  const panel = document.createElement("section");
  panel.className = "measurement-choice";
  panel.setAttribute("aria-label", "Preferências de medição");
  panel.innerHTML = '<p>Você permite cookies e medição de visitas e vídeo para analisar esta página e nossos anúncios na Meta?</p><div><button type="button" data-measure="no">Agora não</button><button type="button" data-measure="yes">Permitir</button></div>';
  panel.hidden = true;
  const setConsent = (allowed) => {
    consent = allowed;
    write(local, consentKey, { allowed, at: Date.now() });
    panel.hidden = true;
    if (!allowed) {
      if (pixelReady) window.fbq("consent", "revoke");
      session = null;
      visitor = undefined;
      try { local.removeItem(visitorKey); } catch { /* Sem armazenamento. */ }
      buffered.clear();
      try { sessionStorageSafe.removeItem(sessionKey); } catch { /* Sem armazenamento. */ }
    } else {
      send("page_view");
      buffered.forEach(send);
      buffered.clear();
    }
    updateLinks();
  };
  panel.querySelector('[data-measure="no"]').addEventListener("click", () => setConsent(false));
  panel.querySelector('[data-measure="yes"]').addEventListener("click", () => setConsent(true));
  document.body.append(panel);
  document.querySelector("#measurement-settings")?.addEventListener("click", () => {
    panel.hidden = false;
    const dialog = document.querySelector("#privacy-dialog");
    if (dialog?.open) {
      dialog.addEventListener("close", () => panel.querySelector('[data-measure="no"]').focus(), { once: true });
      dialog.close();
    }
  });
  if (consent === true) send("page_view");
})();
