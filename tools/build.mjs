// Werkt alles bij wat van het programma afhangt. Draai dit na elke wijziging
// in assets/programma.js:
//
//   node tools/build.mjs
//
// Het script schrijft:
//   kalender.html  het programma als gewone tekst (voor zoekmachines en wie geen
//                  JavaScript heeft) en als gestructureerde data per avond
//   llms.txt       samenvatting van de site voor AI-assistenten
//   sitemap.xml    lijst van pagina's voor Google
import fs from "node:fs";
import vm from "node:vm";

const BASE = "https://icebarknokke.be";
const root = new URL("../", import.meta.url);
const read = f => fs.readFileSync(new URL(f, root), "utf8");
const write = (f, s) => fs.writeFileSync(new URL(f, root), s);

const sandbox = { window: {} };
vm.runInNewContext(read("assets/programma.js"), sandbox);
const { EVENTS, OPENING } = sandbox.window.ICEBAR;

const DAYS = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const DAYS_SHORT = ["zo", "ma", "di", "wo", "do", "vr", "za"];
const MONTHS = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const parse = d => { const [y, m, dd] = d.split("-").map(Number); return { y, m, d: dd, wd: new Date(Date.UTC(y, m - 1, dd)).getUTCDay() }; };
const esc = t => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const cap = t => t[0].toUpperCase() + t.slice(1);
const acts = e => e.acts.join(" en ");
const openingDate = EVENTS[0].d;

function between(text, name, content) {
  const start = "<!-- " + name + ":start -->", end = "<!-- " + name + ":end -->";
  const a = text.indexOf(start), b = text.indexOf(end);
  if (a < 0 || b < 0) throw new Error("Markering " + name + " niet gevonden");
  const indent = text.slice(text.lastIndexOf("\n", a) + 1, a);
  return text.slice(0, a + start.length) + "\n" + content + "\n" + indent + text.slice(b);
}

// 1. Kalender als tekst, zelfde opbouw als de lijst die programma.js tekent.
const months = new Map();
EVENTS.forEach(e => { const k = e.d.slice(0, 7); if (!months.has(k)) months.set(k, []); months.get(k).push(e); });
let html = '          <div class="calendar">\n';
for (const list of months.values()) {
  const first = parse(list[0].d);
  html += '            <section class="month">\n              <h2>' + cap(MONTHS[first.m - 1]) + " " + first.y + "</h2>\n              <ol>\n";
  for (const e of list) {
    const p = parse(e.d);
    html += '                <li><time class="day" datetime="' + e.d + '"><b>' + String(p.d).padStart(2, "0") + "</b><small>" + DAYS_SHORT[p.wd] + '</small></time><span class="who">' +
      (e.label ? '<small class="tag">' + esc(e.label) + "</small>" : "") + esc(acts(e)) + "</span></li>\n";
  }
  html += "              </ol>\n            </section>\n";
}
html += "          </div>";

// 2. Elke avond als Event voor Google.
const place = {
  "@type": "BarOrPub", "@id": BASE + "/#icebar", name: "Ice Bar Knokke",
  address: { "@type": "PostalAddress", streetAddress: "Van Bunnenplein", postalCode: "8300", addressLocality: "Knokke-Heist", addressCountry: "BE" }
};
const events = EVENTS.map(e => {
  const p = parse(e.d);
  const title = (e.label ? e.label + " met " : "") + acts(e);
  return {
    "@type": "Event",
    name: title + " in de Ice Bar Knokke",
    description: cap(DAYS[p.wd]) + " " + p.d + " " + MONTHS[p.m - 1] + " " + p.y + ": " + title + " in de Ice Bar op het Van Bunnenplein in Knokke-Heist.",
    startDate: e.d === openingDate ? e.d + "T18:00:00+01:00" : e.d,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: place,
    organizer: { "@id": BASE + "/#icebar" },
    image: BASE + "/assets/og-image.jpg",
    url: BASE + "/kalender"
  };
});
const jsonld = '  <script type="application/ld+json">\n' + JSON.stringify({ "@context": "https://schema.org", "@graph": events }) + "\n  </script>";

let page = read("kalender.html");
page = between(page, "programma", html);
page = between(page, "programma-jsonld", jsonld);
write("kalender.html", page);

// 3. llms.txt
const last = parse(EVENTS[EVENTS.length - 1].d);
const firstP = parse(openingDate);
const line = e => { const p = parse(e.d); return "- " + cap(DAYS[p.wd]) + " " + p.d + " " + MONTHS[p.m - 1] + " " + p.y + ": " + (e.label ? e.label + ", " : "") + acts(e); };
write("llms.txt", `# Ice Bar Knokke

> De Ice Bar Knokke is een winterbar in chaletstijl op het Van Bunnenplein in Knokke-Heist (België), met elke avond een dj. Het seizoen 2026-2027 loopt van ${DAYS[firstP.wd]} ${firstP.d} ${MONTHS[firstP.m - 1]} ${firstP.y} tot en met ${DAYS[last.wd]} ${last.d} ${MONTHS[last.m - 1]} ${last.y}.

## Praktisch

- Adres: Van Bunnenplein, 8300 Knokke-Heist, België
- Opening: ${DAYS[firstP.wd]} ${firstP.d} ${MONTHS[firstP.m - 1]} ${firstP.y} om ${OPENING.getUTCHours() + 1}u
- Openingsuren: elke vrijdag, zaterdag en zondag vanaf 12u. In de kerstvakantie ook op weekdagen, zie het programma hieronder. Op feestdagen kunnen de uren afwijken.
- Reserveren: niet nodig, iedereen is welkom. Groepen vragen best vooraf een tafel aan via ${BASE}/afterwork. Een aanvraag is pas definitief na bevestiging door het team.
- Afterwork en bedrijfsdrinks: mogelijk voor teams en bedrijven, aanvragen via ${BASE}/afterwork
- Parkeren: Lippenslaan, Van Bunnenlaan en Zeedijk
- E-mail: icebarknokkexl@gmail.com
- Instagram: https://www.instagram.com/icebarknokke/
- Facebook: https://www.facebook.com/IcebarKnokkeXL

## Pagina's

- [Home](${BASE}/): overzicht en eerstvolgende avonden
- [DJ line-up en kalender](${BASE}/kalender): wie draait wanneer
- [Afterwork en business](${BASE}/afterwork): tafel aanvragen voor een groep
- [Info en veelgestelde vragen](${BASE}/info): openingsuren, adres, parkeren
- [Sponsors](${BASE}/sponsors): de bedrijven die de Ice Bar steunen

## Programma ${firstP.y}-${last.y}

Het programma kan nog veranderen.

${EVENTS.map(line).join("\n")}
`);

// 4. sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const urls = [["/", "1.0"], ["/kalender", "0.9"], ["/afterwork", "0.8"], ["/info", "0.7"], ["/sponsors", "0.4"]];
write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(([u, pr]) => "  <url><loc>" + BASE + u + "</loc><lastmod>" + today + "</lastmod><priority>" + pr + "</priority></url>").join("\n") + "\n</urlset>\n");

console.log("Bijgewerkt: kalender.html, llms.txt, sitemap.xml (" + EVENTS.length + " avonden)");
