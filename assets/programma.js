// Programma Ice Bar Knokke, seizoen 2026-2027.
// Eén bron voor de homepagina (eerstvolgende avonden) en de kalender.
// Datum als JJJJ-MM-DD, acts in volgorde van de avond, label voor feestdagen.
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
    { d: "2026-12-24", label: "Kerstavond", acts: ["DCK"] },
    { d: "2026-12-25", label: "Kerstdag", acts: ["DJ Kees"] },
    { d: "2026-12-26", acts: ["DJ Steve DK"] },
    { d: "2026-12-27", acts: ["DJ Arno"] },
    { d: "2026-12-28", acts: ["DCK"] },
    { d: "2026-12-29", acts: ["DJ Steve DK"] },
    { d: "2026-12-30", acts: ["DJ Bart"] },
    { d: "2026-12-31", acts: ["Oudejaarsavond-apero"] },
    { d: "2027-01-01", acts: ["Nieuwjaarsapero"] },
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
    { d: "2027-01-31", label: "Closing party", acts: ["DJ Bart", "DJ Nicolas"] }
  ];

  const OPENING = new Date("2026-11-27T17:00:00+01:00");
  const DAYS = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
  const DAYS_SHORT = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  const MONTHS = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

  const parse = s => new Date(s + "T12:00:00");
  // Vrijdag gaan de deuren open om 17u, alle andere dagen om 12u.
  const openingHour = dt => dt.getDay() === 5 ? "17u" : "12u";
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

  function who(e) {
    const span = el("span", "who");
    if (e.label) span.appendChild(el("small", "tag", e.label));
    span.appendChild(document.createTextNode(e.acts.join(" en ")));
    return span;
  }

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
      li.appendChild(who(e));
      container.appendChild(li);
    });
  }

  // Homepagina: dezelfde avonden als tegels, met de datum zo groot als een prijskaartje.
  function renderNights(container, count) {
    const today = todayKey();
    let list = EVENTS.filter(e => e.d >= today).slice(0, count || 3);
    if (!list.length) list = EVENTS.slice(-(count || 3));
    container.querySelectorAll(".night").forEach(n => n.remove());
    list.forEach(e => {
      const dt = parse(e.d);
      const art = el("article", "tile night one");
      if (e.d === today) art.classList.add("is-today");
      const corner = el("div", "corner");
      corner.appendChild(el("span", null, DAYS[dt.getDay()]));
      if (e.label) corner.appendChild(el("span", "tag", e.label));
      art.appendChild(corner);
      const time = el("time", "date");
      time.dateTime = e.d;
      time.appendChild(el("b", null, String(dt.getDate())));
      time.appendChild(el("small", null, MONTHS[dt.getMonth()]));
      art.appendChild(time);
      const who = el("div", "who");
      who.appendChild(el("b", null, e.acts.join(" en ")));
      who.appendChild(el("span", null, "Deuren open om " + openingHour(dt)));
      art.appendChild(who);
      container.appendChild(art);
    });
  }

  // Kalender. Twee weergaven uit dezelfde data: een lijst per maand (kleine
  // schermen) en een maandraster met de open dagen ingekleurd (grote schermen).
  function groupByMonth() {
    const groups = new Map();
    EVENTS.forEach(e => {
      const k = e.d.slice(0, 7);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(e);
    });
    return groups;
  }

  const monthTitle = dt => MONTHS[dt.getMonth()][0].toUpperCase() + MONTHS[dt.getMonth()].slice(1) + " " + dt.getFullYear();

  function renderCalendarList(container) {
    const today = todayKey();
    container.textContent = "";
    groupByMonth().forEach(list => {
      const sec = el("section", "month");
      sec.appendChild(el("h2", null, monthTitle(parse(list[0].d))));
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
        li.appendChild(who(e));
        ol.appendChild(li);
      });
      sec.appendChild(ol);
      container.appendChild(sec);
    });
  }

  function renderCalendarGrid(container) {
    const today = todayKey();
    const byDate = new Map(EVENTS.map(e => [e.d, e]));
    container.textContent = "";
    groupByMonth().forEach((list, k) => {
      const first = parse(list[0].d);
      const y = first.getFullYear(), m = first.getMonth();
      const sec = el("section", "month-grid");
      sec.appendChild(el("h2", null, monthTitle(first)));
      const grid = el("ol");
      ["ma", "di", "wo", "do", "vr", "za", "zo"].forEach(d => grid.appendChild(el("li", "wd", d)));
      // In de eerste maand beginnen we bij de week van de opening, niet bij dag 1.
      let start = 1;
      if (k === EVENTS[0].d.slice(0, 7)) {
        const firstOpen = parse(EVENTS[0].d);
        start = firstOpen.getDate() - ((firstOpen.getDay() + 6) % 7);
      }
      const offset = (new Date(y, m, start).getDay() + 6) % 7;
      for (let i = 0; i < offset; i++) grid.appendChild(el("li", "blank"));
      const days = new Date(y, m + 1, 0).getDate();
      for (let d = start; d <= days; d++) {
        const key = y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
        const e = byDate.get(key);
        const li = el("li", e ? "open" : "closed");
        if (key < today) li.classList.add("is-past");
        if (key === today) li.classList.add("is-today");
        const time = el("time", "num", String(d));
        time.dateTime = key;
        li.appendChild(time);
        if (e) {
          if (e.label) li.appendChild(el("span", "tag", e.label));
          li.appendChild(el("span", "act", e.acts.join(" en ")));
        }
        grid.appendChild(li);
      }
      sec.appendChild(grid);
      container.appendChild(sec);
    });
  }

  function renderCalendar(container) {
    const list = el("div", "calendar");
    const grid = el("div", "calendar-grid");
    renderCalendarList(list);
    renderCalendarGrid(grid);
    container.textContent = "";
    container.appendChild(grid);
    container.appendChild(list);
  }

  // Band op de homepagina: aftellen tot de opening, daarna "we zijn open".
  function renderStatus(container) {
    const diff = OPENING - Date.now();
    const days = Math.ceil(diff / 86400000);
    const big = container.querySelector("[data-big]");
    const small = container.querySelector("[data-small]");
    if (diff <= 0) {
      big.textContent = "We zijn open";
      small.textContent = "Vrijdag vanaf 17u, zaterdag en zondag vanaf 12u, op het Van Bunnenplein.";
    } else if (days === 1) {
      big.textContent = "Morgen gaan we open";
      small.textContent = "Vrijdag 27 november om 17u, op het Van Bunnenplein.";
    } else {
      big.textContent = "Nog " + days + " nachtjes slapen";
      small.textContent = "We openen op vrijdag 27 november om 17u. Zelfde plek, nieuw seizoen.";
    }
  }

  return { EVENTS, OPENING, renderUpcoming, renderNights, renderCalendar, renderStatus };
})();
