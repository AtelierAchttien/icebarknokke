// Cloudflare Worker voor icebarknokke.be.
// De site zelf bestaat uit statische bestanden. Deze Worker vangt enkel
// /api/reservatie op en stuurt de aanvraag via Mailgun door als mail.
//
// Instellingen:
//   MAIL_TO, MAIL_FROM, MAILGUN_DOMAIN, SITE_URL  staan in wrangler.jsonc
//   MAILGUN_API_KEY                      is een secret in het Cloudflare-dashboard

import { mailSubject, mailText, mailHtml } from "./mail.js";

const FIELDS = {
  naam: { label: "Naam", required: true, max: 120 },
  bedrijf: { label: "Bedrijf", max: 120 },
  email: { label: "E-mail", required: true, max: 200 },
  telefoon: { label: "Telefoon", required: true, max: 40 },
  datum: { label: "Datum", required: true, max: 10 },
  uur: { label: "Uur", required: true, max: 5 },
  personen: { label: "Aantal personen", required: true, max: 4 },
  opmerkingen: { label: "Opmerkingen", max: 2000 }
};

const json = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

// Regeleinden uit korte velden halen, zodat niemand extra mailheaders kan binnensmokkelen.
const clean = (value, multiline) => {
  const text = String(value == null ? "" : value).trim();
  return multiline ? text.replace(/\r\n?/g, "\n") : text.replace(/[\r\n]+/g, " ");
};

function readForm(input) {
  const data = {};
  for (const [key, rule] of Object.entries(FIELDS)) {
    const value = clean(input[key], key === "opmerkingen");
    if (rule.required && !value) return { error: "Niet alle verplichte velden zijn ingevuld." };
    if (value.length > rule.max) return { error: "Een van de velden is te lang." };
    data[key] = value;
  }
  if (!/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(data.email)) return { error: "Het e-mailadres klopt niet." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.datum)) return { error: "De datum klopt niet." };
  if (!/^\d{2}:\d{2}$/.test(data.uur)) return { error: "Het uur klopt niet." };
  if (!/^\d+$/.test(data.personen) || Number(data.personen) < 1) return { error: "Het aantal personen klopt niet." };
  return { data };
}

async function handleReservation(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "Alleen POST." }, 405);

  // Enkel aanvragen vanaf de site zelf.
  const origin = request.headers.get("Origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ ok: false, error: "Niet toegelaten." }, 403);

  let input;
  try {
    const raw = await request.text();
    if (raw.length > 10000) return json({ ok: false, error: "Aanvraag is te groot." }, 413);
    input = JSON.parse(raw);
  } catch (e) {
    return json({ ok: false, error: "Ongeldige aanvraag." }, 400);
  }
  if (!input || typeof input !== "object") return json({ ok: false, error: "Ongeldige aanvraag." }, 400);
  if (input.website) return json({ ok: true }, 200); // ingevuld spamveld: doen alsof het gelukt is

  const { data, error } = readForm(input);
  if (error) return json({ ok: false, error }, 400);

  if (!env.MAILGUN_API_KEY) return json({ ok: false, error: "Mail is nog niet ingesteld." }, 503);

  const mail = new URLSearchParams({
    from: env.MAIL_FROM,
    to: env.MAIL_TO,
    subject: mailSubject(data),
    text: mailText(data),
    html: mailHtml(data, env.SITE_URL)
  });
  mail.set("h:Reply-To", data.email);

  const res = await fetch("https://api.eu.mailgun.net/v3/" + env.MAILGUN_DOMAIN + "/messages", {
    method: "POST",
    headers: { Authorization: "Basic " + btoa("api:" + env.MAILGUN_API_KEY) },
    body: mail
  });
  if (!res.ok) {
    console.error("Mailgun weigerde de mail", res.status, await res.text());
    return json({ ok: false, error: "Verzenden is niet gelukt." }, 502);
  }
  return json({ ok: true }, 200);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/reservatie") return handleReservation(request, env);
    return env.ASSETS.fetch(request);
  }
};
