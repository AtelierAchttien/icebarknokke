// Cookietoestemming. Dit bestand staat bovenaan elke pagina, vóór de Google-tag.
// Zolang de bezoeker niet akkoord gaat, zet Google Analytics geen cookies en wordt
// Metricool niet geladen. De keuze wordt in de browser bewaard en is aan te passen
// via "Cookievoorkeuren" onderaan elke pagina.
(function () {
  var KEY = "icebar-cookies";
  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // Standaard niets toegelaten. Advertentiecookies gebruiken we niet.
  window.gtag("consent", "default", {
    analytics_storage: choice === "ja" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });

  var metricoolLoaded = false;
  function loadMetricool() {
    if (metricoolLoaded) return;
    metricoolLoaded = true;
    var s = document.createElement("script");
    s.src = "https://tracker.metricool.com/resources/be.js";
    s.onload = function () { window.beTracker && window.beTracker.t({ hash: "7c4d414ab870b065deb7eddda6b71273" }); };
    document.head.appendChild(s);
  }
  if (choice === "ja") loadMetricool();

  function save(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
    window.gtag("consent", "update", { analytics_storage: value === "ja" ? "granted" : "denied" });
    if (value === "ja") loadMetricool();
    var banner = document.getElementById("cookies");
    if (banner) banner.remove();
  }

  function show() {
    if (document.getElementById("cookies")) return;
    var banner = document.createElement("section");
    banner.id = "cookies";
    banner.className = "cookies";
    banner.setAttribute("aria-label", "Cookies");
    var text = document.createElement("p");
    text.textContent = "We gebruiken cookies van Google Analytics en Metricool om te tellen hoeveel bezoekers de site krijgt en welke pagina's ze bekijken. Dat doen we alleen als jij dat goed vindt.";
    var buttons = document.createElement("div");
    [["Weigeren", "nee"], ["Akkoord", "ja"]].forEach(function (b) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn light";
      btn.textContent = b[0];
      btn.addEventListener("click", function () { save(b[1]); });
      buttons.appendChild(btn);
    });
    banner.appendChild(text);
    banner.appendChild(buttons);
    document.body.appendChild(banner);
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!choice) show();
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("[data-cookies]")) { e.preventDefault(); show(); }
    });
  });
})();
