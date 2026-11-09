// Programma Ice Bar Knokke, seizoen 2026-2027.
// Eén bron voor de homepagina (eerstvolgende avonden) en de kalender.
// Datum als JJJJ-MM-DD, acts in volgorde van de avond.
window.ICEBAR = (function () {
  const EVENTS = [
    { d: "2026-11-27", acts: ["Opening", "DJ Steve DK"] },
    { d: "2026-11-28", acts: ["DJ Arno"] },
    { d: "2026-11-29", acts: ["DJ Nicolas"] },
    { d: "2026-12-04", acts: ["DJ Steve DK"] },
    { d: "2026-12-05", acts: ["DCK"] },
    { d: "2026-12-06", acts: ["DJ Bart"] },
    { d: "2026-12-11", acts: ["DJ Pipo"] },
    { d: "2026-12-12", acts: ["DJ Arno"] },
    { d: "2026-12-13", acts: ["DJ Nicolas"] },
    { d: "2026-12-18", acts: ["DJ Kees"] },
    { d: "2026-12-19", acts: ["DJ Pipo"] },
    { d: "2026-12-20", acts: ["DJ Steve DK"] },
    { d: "2026-12-21", acts: ["DJ Pipo"] },
    { d: "2026-12-22", acts: ["DJ Bart"] },
    { d: "2026-12-23", acts: ["DJ Nicolas"] },
    { d: "2026-12-24", acts: ["DCK"] },
    { d: "2026-12-25", acts: ["DJ Kees"] },
    { d: "2026-12-26", acts: ["DJ Steve DK"] },
    { d: "2026-12-27", acts: ["DJ Arno"] },
    { d: "2026-12-28", acts: ["DCK"] },
    { d: "2026-12-29", acts: ["DJ Steve DK"] },
    { d: "2026-12-30", acts: ["DJ Bart"] },
    { d: "2027-01-02", acts: ["DJ Pipo"] },
    { d: "2027-01-03", acts: ["DJ Steve DK"] },
    { d: "2027-01-08", acts: ["DJ Nicolas"] },
    { d: "2027-01-09", acts: ["DJ Steve DK"] },
    { d: "2027-01-10", acts: ["DJ Pipo"] },
    { d: "2027-01-15", acts: ["DJ Bart"] },
    { d: "2027-01-16", acts: ["DJ Steve DK"] },
    { d: "2027-01-17", acts: ["DJ Pipo"] },
    { d: "2027-01-22", acts: ["DJ Nicolas"] },
    { d: "2027-01-23", acts: ["DJ Steve DK"] },
    { d: "2027-01-24", acts: ["DJ Arno"] },
    { d: "2027-01-29", acts: ["DJ Steve DK"] },
    { d: "2027-01-30", acts: ["DJ Pipo"] },
    { d: "2027-01-31", acts: ["DJ Bart", "DJ Nicolas"] }
  ];

  const OPENING = new Date("2026-11-27T12:00:00+01:00");
  const DAYS = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
  const DAYS_SHORT = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  const MONTHS = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

  const parse = s => new Date(s + "T12:00:00");
  const todayKey = () => {
    const n = new Date();
    return n.getFullYear() + "-" + String(n.getMonth() + 1).padStart(2, "0") + "-" + String(n.getDate()).padStart(2, "0");
  };

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  // Homepagina: de eerstvolgende avonden (vanaf vandaag), standaard drie.
  function renderUpcoming(container, count) {
    const today = todayKey();
    let list = EVENTS.filter(e => e.d >= today).slice(0, count || 3);
    if (!list.length) list = EVENTS.slice(-(count || 3));
    container.textContent = "";
    list.forEach(e => {
      const dt = parse(e.d);
      const li = el("li");
      if (e.d === today) li.classList.add("is-today");
      const day = DAYS[dt.getDay()];
      const time = el("time", "when", day[0].toUpperCase() + day.slice(1) + " " + dt.getDate() + " " + MONTHS[dt.getMonth()]);
      time.dateTime = e.d;
      li.appendChild(time);
      li.appendChild(el("span", "who", e.acts.join(" en ")));
      container.appendChild(li);
    });
  }

  // Kalender: één kolom per maand.
  function renderCalendar(container) {
    const today = todayKey();
    const groups = new Map();
    EVENTS.forEach(e => {
      const k = e.d.slice(0, 7);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(e);
    });
    container.textContent = "";
    groups.forEach((list, k) => {
      const first = parse(list[0].d);
      const sec = el("section", "month");
      const h = el("h2", null, MONTHS[first.getMonth()][0].toUpperCase() + MONTHS[first.getMonth()].slice(1) + " " + first.getFullYear());
      h.id = "m-" + k;
      sec.appendChild(h);
      const ol = el("ol");
      list.forEach(e => {
        const dt = parse(e.d);
        const li = el("li");
        if (e.d < today) li.classList.add("is-past");
        if (e.d === today) li.classList.add("is-today");
        const time = el("time", "day");
        time.dateTime = e.d;
        time.appendChild(el("b", null, String(dt.getDate()).padStart(2, "0")));
        time.appendChild(el("small", null, DAYS_SHORT[dt.getDay()]));
        li.appendChild(time);
        li.appendChild(el("span", "who", e.acts.join(" en ")));
        ol.appendChild(li);
      });
      sec.appendChild(ol);
      container.appendChild(sec);
    });
  }

  // Band op de homepagina: aftellen tot de opening, daarna "we zijn open".
  function renderStatus(container) {
    const diff = OPENING - Date.now();
    const days = Math.ceil(diff / 86400000);
    const big = container.querySelector("[data-big]");
    const small = container.querySelector("[data-small]");
    if (diff <= 0) {
      big.textContent = "We zijn open";
      small.textContent = "Elke vrijdag, zaterdag en zondag vanaf 12u, op het Van Bunnenplein.";
    } else if (days === 1) {
      big.textContent = "Morgen gaan we open";
      small.textContent = "Vrijdag 27 november vanaf 12u, op het Van Bunnenplein.";
    } else {
      big.textContent = "Nog " + days + " nachtjes slapen";
      small.textContent = "We openen op vrijdag 27 november vanaf 12u. Zelfde plek, nieuw seizoen.";
    }
  }

  return { EVENTS, OPENING, renderUpcoming, renderCalendar, renderStatus };
})();
