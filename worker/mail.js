// Opmaak van de mail met een tafelaanvraag, in de stijl van de site:
// zwarte banden, crèmekleurig papier, smalle vette titels.
// Mailprogramma's kennen weinig CSS, vandaar tabellen en stijlen per element.

const DAYS = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const MONTHS = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

const TITLE = "'Bebas Neue', Oswald, 'Arial Narrow', Impact, Arial, sans-serif";
const SANS = "Belleza, 'Gill Sans', 'Trebuchet MS', Arial, sans-serif";
const BLACK = "#121212";
const CREAM = "#f3efec";
const SOFT = "#5c5c5c";
const RULE = "#d9d3ce";

const esc = text => String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// "2026-12-05" + "18:30" wordt "zaterdag 5 december om 18u30".
export function formatWhen(datum, uur) {
  const [y, m, d] = datum.split("-").map(Number);
  const day = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const [hh, mm] = uur.split(":");
  return day + " " + d + " " + MONTHS[m - 1] + " om " + Number(hh) + "u" + (mm === "00" ? "" : mm);
}

function rows(data) {
  const persons = data.personen + (Number(data.personen) === 1 ? " persoon" : " personen");
  const list = [
    ["Naam", esc(data.naam)],
    data.bedrijf && ["Bedrijf", esc(data.bedrijf)],
    data.btw && ["Btw-nummer", esc(data.btw)],
    ["E-mail", '<a href="mailto:' + esc(data.email) + '" style="color:' + BLACK + ';">' + esc(data.email) + "</a>"],
    ["Telefoon", '<a href="tel:' + esc(data.telefoon.replace(/[^\d+]/g, "")) + '" style="color:' + BLACK + ';">' + esc(data.telefoon) + "</a>"],
    ["Wanneer", esc(formatWhen(data.datum, data.uur))],
    ["Aantal", esc(persons)],
    data.opmerkingen && ["Opmerkingen", esc(data.opmerkingen).replace(/\n/g, "<br>")]
  ].filter(Boolean);
  return list;
}

export function mailSubject(data) {
  return "Tafelaanvraag: " + data.naam + ", " + data.personen + " pers. op " + formatWhen(data.datum, data.uur);
}

export function mailText(data) {
  const strip = html => html.replace(/<br>/g, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return "Nieuwe tafelaanvraag via icebarknokke.be\n\n" +
    rows(data).map(([label, value]) => label + ": " + strip(value)).join("\n") +
    "\n\nAntwoord op deze mail om rechtstreeks naar " + data.naam + " te schrijven.";
}

export function mailHtml(data, siteUrl) {
  const firstName = data.naam.split(" ")[0];
  const persons = data.personen + (Number(data.personen) === 1 ? " persoon" : " personen");
  const reply = "mailto:" + encodeURIComponent(data.email) + "?subject=" + encodeURIComponent("Je tafelaanvraag bij Ice Bar Knokke");
  const label = "padding:14px 16px 14px 0;border-bottom:1px solid " + RULE + ";font-family:" + SANS + ";font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:" + SOFT + ";vertical-align:top;white-space:nowrap;";
  const value = "padding:14px 0;border-bottom:1px solid " + RULE + ";font-family:" + SANS + ";font-size:16px;line-height:1.5;color:" + BLACK + ";vertical-align:top;";

  return `<!doctype html>
<html lang="nl-BE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>Tafelaanvraag</title>
<style>@import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Belleza&display=swap");</style>
</head>
<body style="margin:0;padding:0;background:#e9e3de;">
<div style="display:none;max-height:0;overflow:hidden;">${esc(data.naam)}, ${esc(persons)}, ${esc(formatWhen(data.datum, data.uur))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e9e3de;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${CREAM};">

<tr><td align="center" bgcolor="${BLACK}" style="background:${BLACK};padding:36px 24px 30px;">
<img src="${siteUrl}/assets/logo-icebar-wit.png" width="84" height="114" alt="Ice Bar Knokke" style="display:block;border:0;width:84px;height:auto;font-family:${TITLE};font-size:22px;color:#ffffff;">
<p style="margin:22px 0 0;font-family:${SANS};font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#c9c9c9;">Afterwork &amp; business</p>
</td></tr>

<tr><td style="padding:40px 36px 8px;">
<h1 style="margin:0;font-family:${TITLE};font-weight:400;font-size:38px;line-height:1;letter-spacing:1px;text-transform:uppercase;color:${BLACK};">Nieuwe tafelaanvraag</h1>
<p style="margin:14px 0 0;font-family:${SANS};font-size:18px;line-height:1.5;color:${BLACK};">${esc(data.naam)} vraagt een tafel voor ${esc(persons)} op ${esc(formatWhen(data.datum, data.uur))}.</p>
</td></tr>

<tr><td style="padding:20px 36px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${RULE};">
${rows(data).map(([l, v]) => `<tr><td style="${label}">${l}</td><td style="${value}">${v}</td></tr>`).join("\n")}
</table>
</td></tr>

<tr><td style="padding:32px 36px 44px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td bgcolor="${BLACK}" style="background:${BLACK};">
<a href="${reply}" style="display:inline-block;padding:15px 28px;font-family:${SANS};font-size:14px;letter-spacing:2px;text-transform:uppercase;color:${CREAM};text-decoration:none;">Antwoord aan ${esc(firstName)}</a>
</td></tr></table>
<p style="margin:18px 0 0;font-family:${SANS};font-size:14px;line-height:1.6;color:${SOFT};">Of beantwoord gewoon deze mail, dan komt je antwoord rechtstreeks bij ${esc(firstName)} terecht. De aanvraag is pas definitief na jullie bevestiging.</p>
</td></tr>

<tr><td align="center" bgcolor="${BLACK}" style="background:${BLACK};padding:26px 24px;">
<p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.7;color:#c9c9c9;">Verstuurd via het formulier op <a href="${siteUrl}" style="color:#ffffff;">icebarknokke.be</a><br>Van Bunnenplein, 8300 Knokke-Heist</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
