// Metingen voor Google Analytics, via de Google-tag in de kop van elke pagina.
// Elke actie hieronder wordt als gebeurtenis naar Analytics gestuurd.
//
//   generate_lead   tafelaanvraag verstuurd (de belangrijkste conversie)
//   form_start      iemand begint het reservatieformulier in te vullen
//   form_error      verzenden van het formulier mislukt
//   route_click     klik op Route (Google Maps)
//   email_click     klik op het mailadres
//   social_click    klik op Instagram of Facebook
//   sponsor_click   klik op het logo van een sponsor
//   cta_click       klik op een knop naar de DJ line-up of naar het reserveren
window.dataLayer = window.dataLayer || [];
window.ICEBAR_METEN = function (event, params) {
  if (typeof window.gtag === "function") window.gtag("event", event, params || {});
};

document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest("a[href]");
  if (!a) return;
  var href = a.getAttribute("href");
  var text = (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 80);
  var meten = window.ICEBAR_METEN;
  if (href.indexOf("mailto:") === 0) return meten("email_click", { link_text: text });
  if (href.indexOf("google.com/maps") > -1) return meten("route_click", { link_text: text });
  if (a.closest(".socials")) return meten("social_click", { platform: href.indexOf("instagram") > -1 ? "instagram" : "facebook" });
  if (a.closest(".logo-grid")) return meten("sponsor_click", { sponsor: text, link_url: href });
  if (a.classList.contains("btn")) return meten("cta_click", { link_text: text, link_url: href });
});
