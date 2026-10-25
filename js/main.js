// Northside Bakery, Brooklyn
// 1. Header and mobile navigation  2. Today's hours  3. Hero slideshow
// 4. Scroll reveals and parallax  5. Menu (read from data/menu.json)  6. Holiday countdown

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Header and mobile navigation ---------- */
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  let navOpen = false;

  if (toggle && nav) {
    const setOpen = (open) => {
      navOpen = open;
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      header.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => setOpen(!navOpen));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && navOpen) { setOpen(false); toggle.focus(); } });
  }

  // No header bar over the hero photos; the mint bar comes in once the hero has scrolled past
  const hero = document.querySelector('.hero');
  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    header.classList.toggle('is-past', !hero || window.scrollY > hero.offsetHeight - header.offsetHeight);
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- 2. Today's hours (always New York time) ---------- */
  function nowInBrooklyn() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
  }
  const toMinutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  function formatTime(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${h < 12 ? 'am' : 'pm'}`;
  }

  const rows = Array.from(document.querySelectorAll('[data-hours] tr[data-days]'));
  const todayEl = document.querySelector('[data-today]');
  // Shows today's hours and whether we're open right now; runs again every minute so it changes live
  function updateToday() {
    const { day, minutes } = nowInBrooklyn();
    const row = rows.find((r) => r.dataset.days.split(',').map(Number).includes(day));
    rows.forEach((r) => r.classList.toggle('is-today', r === row));
    if (!row) return;
    const open = toMinutes(row.dataset.open);
    const close = toMinutes(row.dataset.close);
    let status, closed = false;
    if (minutes < open) { status = `Opens at ${formatTime(row.dataset.open)}`; closed = true; }
    else if (minutes < close) status = `Open now until ${formatTime(row.dataset.close)}`;
    else { status = 'Closed for today'; closed = true; }
    if (todayEl) {
      todayEl.textContent = `Today: ${formatTime(row.dataset.open)} to ${formatTime(row.dataset.close)}`;
      const badge = document.createElement('span');
      badge.className = 'status' + (closed ? ' is-closed' : '');
      badge.textContent = status;
      todayEl.append(badge);
    }
  }
  if (rows.length) {
    updateToday();
    setInterval(updateToday, 60 * 1000);
  }

  /* ---------- 3. Hero slideshow: food photos crossfade every few seconds ---------- */
  const show = document.querySelector('[data-show]');
  if (show) {
    const slides = Array.from(show.querySelectorAll('.slide'));
    const dots = Array.from(show.querySelectorAll('.hero__bars button'));
    let index = 0, timer = null;
    const go = (next) => {
      slides[index].classList.remove('is-active');
      slides[index].setAttribute('aria-hidden', 'true');
      dots[index].removeAttribute('aria-current');
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('is-active');
      slides[index].removeAttribute('aria-hidden');
      dots[index].setAttribute('aria-current', 'true');
    };
    // Plays on its own unless the visitor asked for reduced motion; pauses while hovered or focused
    const play = () => { if (!reduceMotion && !timer) timer = setInterval(() => go(index + 1), 5000); };
    const pause = () => { clearInterval(timer); timer = null; };
    dots.forEach((dot, i) => dot.addEventListener('click', () => { go(i); pause(); play(); }));
    show.addEventListener('pointerenter', pause);
    show.addEventListener('pointerleave', play);
    show.addEventListener('focusin', pause);
    show.addEventListener('focusout', play);
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
    play();
  }

  /* ---------- 4. Scroll reveals and parallax ---------- */
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      // Things that appear together come in one after another
      entries.filter((e) => e.isIntersecting).forEach((entry, i) => {
        entry.target.style.setProperty('--d', `${Math.min(i, 6) * 0.09}s`);
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  const parallaxEls = reduceMotion ? [] : Array.from(document.querySelectorAll('[data-parallax]'));
  function updateParallax() {
    const vh = window.innerHeight;
    parallaxEls.forEach((el) => {
      const frame = el.parentElement.getBoundingClientRect();
      if (frame.bottom < -200 || frame.top > vh + 200) return;
      const fromCenter = frame.top + frame.height / 2 - vh / 2;
      const limit = frame.height * 0.07;
      const y = Math.max(-limit, Math.min(limit, -fromCenter * Number(el.dataset.parallax || 0.08)));
      el.style.translate = `0 ${y.toFixed(1)}px`;
    });
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateHeader(); updateParallax(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- 6. Holiday countdown ----------
     Counts down to the next preorder deadline (or the holiday itself), New York time.
     Edit the list below to change deadlines: deadlineDays = how many days before the holiday orders close. */
  const countdown = document.querySelector('[data-countdown]');
  if (countdown) {
    // A moment in New York time (handles daylight saving)
    const nyTime = (y, m, d, h) => {
      const guess = Date.UTC(y, m - 1, d, h + 5);
      const zone = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'short' })
        .formatToParts(new Date(guess)).find((p) => p.type === 'timeZoneName').value;
      return new Date(Date.UTC(y, m - 1, d, h + (zone === 'EDT' ? 4 : 5)));
    };
    const nthWeekday = (y, m, weekday, n) => { const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7; };
    const easter = (y) => { // Anonymous Gregorian algorithm
      const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
      const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
      return new Date(Date.UTC(y, month - 1, day));
    };
    const shift = (date, days) => new Date(date.getTime() + days * 864e5);
    const ymd = (date) => [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()];

    const HOLIDAYS = [
      { name: 'Thanksgiving', date: (y) => new Date(Date.UTC(y, 10, nthWeekday(y, 11, 4, 4))), deadlineDays: 7,
        line: 'Whole turkeys, pies, pierogi and sides. Orders close a week before Thanksgiving.' },
      { name: 'Christmas Eve', polish: 'Wigilia', date: (y) => new Date(Date.UTC(y, 11, 24)),
        line: 'Pierogi by the tray and holiday cakes. Call ahead to preorder.' },
      { name: 'Fat Thursday', polish: 'Tłusty Czwartek', date: (y) => shift(easter(y), -52),
        line: 'Pączki by the dozen. Preorder and skip the line.' },
      { name: 'Easter', polish: 'Wielkanoc', date: (y) => easter(y),
        line: 'Babka, sernik and bread for the Easter table. Call ahead to preorder.' }
    ];

    const $ = (sel) => countdown.querySelector(sel);
    const fmtDay = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
    function nextEvent(now) {
      const events = [];
      [now.getFullYear(), now.getFullYear() + 1].forEach((y) => HOLIDAYS.forEach((hol) => {
        const day = hol.date(y);
        // Orders close at closing time (8 pm) on the deadline day; otherwise count down to opening on the holiday
        const target = hol.deadlineDays ? nyTime(...ymd(shift(day, -hol.deadlineDays)), 20) : nyTime(...ymd(day), 7);
        if (target > now) events.push({ hol, day, target, deadlineDay: hol.deadlineDays ? shift(day, -hol.deadlineDays) : null });
      }));
      return events.sort((a, b) => a.target - b.target)[0];
    }
    function tick() {
      const now = new Date();
      const ev = nextEvent(now);
      if (!ev) return;
      const title = ev.hol.polish ? `${ev.hol.name} (${ev.hol.polish})` : ev.hol.name;
      $('[data-cd-title]').textContent = ev.deadlineDay ? `Now taking ${ev.hol.name} orders` : `Next up: ${title}`;
      $('[data-cd-line]').textContent = ev.deadlineDay
        ? `${ev.hol.line} Last day to order: ${fmtDay.format(ev.deadlineDay)}.`
        : `${ev.hol.line} ${fmtDay.format(ev.day)}.`;
      $('[data-cd-label]').textContent = ev.deadlineDay ? 'Preorder deadline in' : `${ev.hol.name} in`;
      const mins = Math.max(0, Math.floor((ev.target - now) / 6e4));
      $('[data-cd-days]').textContent = Math.floor(mins / 1440);
      $('[data-cd-hours]').textContent = Math.floor((mins % 1440) / 60);
      $('[data-cd-mins]').textContent = mins % 60;
    }
    // Each holiday card shows its next date (and Thanksgiving its last order day)
    const fmtFull = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    function fillDates() {
      const now = new Date();
      HOLIDAYS.forEach((hol) => {
        const y = now.getFullYear();
        let day = hol.date(y);
        if (nyTime(...ymd(day), 23) < now) day = hol.date(y + 1);
        document.querySelectorAll(`[data-holiday-date="${hol.name}"]`).forEach((el) => { el.textContent = fmtFull.format(day); });
        if (hol.deadlineDays) {
          document.querySelectorAll(`[data-holiday-deadline="${hol.name}"]`).forEach((el) => { el.textContent = `Order by ${fmtDay.format(shift(day, -hol.deadlineDays))}`; });
        }
      });
    }
    fillDates();

    // Thanksgiving order section: real dates, the Square link once it's added, hidden once Thanksgiving has passed
    const tg = document.querySelector('#thanksgiving-order');
    const cdButton = countdown.querySelector('[data-cd-button]');
    if (tg) {
      const now = new Date();
      const hol = HOLIDAYS.find((x) => x.name === 'Thanksgiving');
      let day = hol.date(now.getFullYear());
      if (nyTime(...ymd(day), 23) < now) day = hol.date(now.getFullYear() + 1);
      const deadline = shift(day, -hol.deadlineDays);
      const ordersOpen = nyTime(...ymd(deadline), 20) > now;
      tg.querySelector('[data-tg-deadline]').textContent = fmtDay.format(deadline);
      tg.querySelector('[data-tg-pies]').textContent = fmtDay.format(shift(day, -10)); // pies from the Monday 10 days before
      tg.querySelector('[data-tg-day]').textContent = fmtDay.format(day);
      const url = (tg.dataset.squareUrl || '').trim();
      const btn = tg.querySelector('[data-square-button]');
      const note = tg.querySelector('[data-square-note]');
      if (!ordersOpen) {
        // Orders have closed: keep it simple until next year
        btn.textContent = 'Call the bakery';
        note.textContent = 'Thanksgiving orders are closed for this year. Call us and we\'ll see what we can do.';
      } else if (url) {
        btn.href = url;
        btn.target = '_blank';
        btn.rel = 'noopener';
        btn.textContent = 'Order on Square';
        note.textContent = 'Secure checkout through Square. Questions? Call (718) 782-5551.';
      }
      // Show the section from October until Thanksgiving
      const oct1 = new Date(Date.UTC(day.getUTCFullYear(), 9, 1));
      tg.hidden = now < oct1;
    }
    // The countdown button goes to the Thanksgiving order section while Thanksgiving is next; otherwise it calls
    const cdSync = () => {
      const showingTg = /Thanksgiving/.test(countdown.querySelector('[data-cd-title]').textContent) && tg && !tg.hidden;
      cdButton.href = showingTg ? '#thanksgiving-order' : 'tel:+17187825551';
      cdButton.textContent = showingTg ? 'Order Thanksgiving' : 'Call to preorder';
    };
    tick();
    cdSync();
    setInterval(() => { tick(); cdSync(); }, 30 * 1000);
  }

  /* ---------- 7. Inquiry form ----------
     No server needed: sending opens the visitor's email app with the note filled in. */
  // What can be preordered for each holiday. Edit names, notes and the deadline line here.
  const PREORDER = {
    'Thanksgiving': { note: 'Orders close a week before Thanksgiving.', items: [['Whole turkey', 'tell us the size in your note'], ['Pumpkin pie'], ['Apple pie'], ['Pierogi tray'], ['Sides tray']] },
    'Christmas Eve': { note: 'Call ahead or send this a few weeks before.', items: [['Pierogi tray', 'any mix of fillings'], ['Holiday cake'], ['Angel wings (chruściki)', 'by the pound'], ['Poppy seed roll (makowiec)']] },
    'Fat Thursday': { note: 'Order ahead and skip the line.', items: [['Pączki', 'by the dozen'], ['Angel wings (chruściki)', 'by the pound']] },
    'Easter': { note: 'Call ahead or send this a few weeks before.', items: [['Babka'], ['Cheesecake (sernik)'], ['Rye bread'], ['Easter cake']] }
  };
  const form = document.querySelector('[data-inquiry]');
  if (form) {
    const eventFields = form.querySelector('[data-event-fields]');
    const holidayFields = form.querySelector('[data-holiday-fields]');
    const holidaySelect = form.querySelector('[data-holiday-select]');
    const itemsEl = form.querySelector('[data-holiday-items]');
    const peopleField = form.querySelector('[data-people-field]');
    const dateLabel = form.querySelector('[data-date-label]');
    const message = form.querySelector('[data-message]');

    // The item list (with a quantity box for each) changes with the holiday picked
    const buildItems = () => {
      const h = PREORDER[holidaySelect.value];
      form.querySelector('[data-holiday-note]').textContent = h.note;
      itemsEl.replaceChildren(...h.items.map(([name, hint], i) => {
        const label = document.createElement('label');
        label.className = 'qty';
        const text = document.createElement('span');
        text.textContent = name;
        if (hint) { const s = document.createElement('small'); s.textContent = hint; text.append(s); }
        const input = document.createElement('input');
        input.type = 'number'; input.min = '0'; input.inputMode = 'numeric'; input.placeholder = '0';
        input.dataset.item = name; input.id = `qty-${i}`;
        label.append(text, input);
        return label;
      }));
    };
    // Show only the fields that fit what the note is about
    const syncKind = () => {
      const kind = form.elements.kind.value;
      const holiday = kind === 'Holiday preorder';
      eventFields.hidden = kind === 'General question';
      holidayFields.hidden = !holiday;
      peopleField.hidden = holiday;
      dateLabel.textContent = holiday ? 'Pickup date' : 'Date you need it';
      message.required = !holiday; // a preorder can be just the items
      if (holiday && !itemsEl.children.length) buildItems();
    };
    form.addEventListener('change', (e) => { if (e.target === holidaySelect) buildItems(); syncKind(); });
    syncKind();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = form.elements;
      const kind = f.kind.value;
      const lines = [`Name: ${f.name.value}`];
      if (f.phone.value) lines.push(`Phone: ${f.phone.value}`);
      lines.push(`Email: ${f.email.value}`);
      if (kind === 'Holiday preorder') {
        const picked = Array.from(itemsEl.querySelectorAll('input')).filter((i) => Number(i.value) > 0);
        if (!picked.length) {
          form.querySelector('[data-inquiry-note]').textContent = 'Add how many of at least one item.';
          itemsEl.querySelector('input').focus();
          return;
        }
        lines.push('', `Holiday: ${holidaySelect.value}`, 'Preorder:');
        picked.forEach((i) => lines.push(`  ${i.value} x ${i.dataset.item}`));
        if (f.date.value) lines.push(`Pickup date: ${f.date.value}`);
      } else {
        if (!eventFields.hidden && f.date.value) lines.push(`Date needed: ${f.date.value}`);
        if (!eventFields.hidden && f.people.value) lines.push(`Number of people: ${f.people.value}`);
      }
      if (f.message.value) lines.push('', f.message.value);
      const subject = kind === 'Holiday preorder' ? `${holidaySelect.value} preorder from ${f.name.value}` : `${kind} inquiry from ${f.name.value}`;
      window.location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      form.querySelector('[data-inquiry-note]').textContent = 'Your email app should open now. If it doesn\'t, call us at (718) 782-5551.';
    });
  }

  /* ---------- 5. Menu ---------- */
  const tabsEl = document.querySelector('[data-menu-tabs]');
  const gridEl = document.querySelector('[data-menu-grid]');
  const introEl = document.querySelector('[data-menu-intro]');
  const panelEl = document.querySelector('[data-menu-panel]');
  if (!tabsEl || !gridEl) return;

  // Drawing shown when an item has no photo yet
  const PLACEHOLDER = { bread: 'boule', sweets: 'paczek', pierogi: 'pierogi', hot: 'golabek', market: 'wheat', holiday: 'babka' };
  let menu = null;
  let current = null;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  function showPrice(item) {
    const s = menu.settings || {};
    if (s.showPrices === false || !item.price) return false;
    if (item.priceConfirmed === false && s.showUnconfirmedPrices === false) return false;
    return true;
  }

  function renderItem(item, i) {
    const li = el('li', 'item');
    li.style.setProperty('--i', Math.min(i, 12));
    const media = el('div', 'item__media');
    if (item.photo) {
      const img = el('img');
      img.src = item.photo;
      img.alt = item.name;
      img.loading = 'lazy';
      img.width = 800;
      img.height = 800;
      media.append(img);
    } else {
      const ph = el('div', 'item__placeholder');
      ph.append(el('span', `doodle doodle--${PLACEHOLDER[item.category] || 'wheat'}`));
      ph.setAttribute('aria-hidden', 'true');
      media.append(ph);
    }
    const body = el('div', 'item__body');
    body.append(el('h3', 'item__name', item.name));
    if (item.description) body.append(el('p', 'item__desc', item.description));
    const meta = el('div', 'item__meta');
    if (showPrice(item)) meta.append(el('span', 'item__price', item.price));
    const daily = item.availability === 'Every day';
    const preorder = /^preorder/i.test(item.availability || '');
    meta.append(el('span', `tag ${preorder ? 'tag--preorder' : daily ? 'tag--daily' : 'tag--rotating'}`, item.availability || 'Rotating – ask in store'));
    body.append(meta);
    li.append(media, body);
    return li;
  }

  function select(id, focusTab) {
    const category = menu.categories.find((c) => c.id === id) || menu.categories[0];
    current = category.id;
    tabsEl.querySelectorAll('[role="tab"]').forEach((tab) => {
      const on = tab.dataset.id === current;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focusTab) tab.focus();
      if (on) panelEl.setAttribute('aria-labelledby', tab.id);
    });
    introEl.textContent = category.intro || '';
    // Holiday items are preorder only, so their intro gets a stand-out note style
    introEl.classList.toggle('menu__intro--preorder', category.id === 'holiday');
    const items = menu.items.filter((i) => i.category === current);
    if (!category.groups) {
      gridEl.replaceChildren(...items.map(renderItem));
      return;
    }
    // Categories with groups (the hot food bar) get a small heading before each group
    const nodes = [];
    let n = 0;
    category.groups.forEach((g) => {
      const inGroup = items.filter((i) => i.group === g.id);
      if (!inGroup.length) return;
      // A group with one item becomes a half-width block: heading, note, then a wide card
      if (inGroup.length === 1) {
        const box = el('li', 'menu__solo');
        box.append(el('h3', 'menu__group-name', g.name));
        if (g.note) box.append(el('p', 'menu__group-note', g.note));
        const list = el('ul', 'menu__solo-list');
        list.append(renderItem(inGroup[0], n++));
        box.append(list);
        nodes.push(box);
        return;
      }
      const head = el('li', 'menu__group');
      head.append(el('h3', 'menu__group-name', g.name));
      if (g.note) head.append(el('p', 'menu__group-note', g.note));
      nodes.push(head, ...inGroup.map((item) => renderItem(item, n++)));
    });
    gridEl.replaceChildren(...nodes);
  }

  function buildTabs() {
    menu.categories.forEach((c) => {
      const tab = el('button', 'menu__tab', c.name);
      tab.type = 'button';
      tab.id = `tab-${c.id}`;
      tab.dataset.id = c.id;
      tab.setAttribute('role', 'tab');
      tab.addEventListener('click', () => select(c.id));
      tabsEl.append(tab);
    });
    tabsEl.addEventListener('keydown', (e) => {
      const ids = menu.categories.map((c) => c.id);
      const i = ids.indexOf(current);
      if (e.key === 'ArrowRight') select(ids[(i + 1) % ids.length], true);
      else if (e.key === 'ArrowLeft') select(ids[(i - 1 + ids.length) % ids.length], true);
      else if (e.key === 'Home') select(ids[0], true);
      else if (e.key === 'End') select(ids[ids.length - 1], true);
      else return;
      e.preventDefault();
    });
  }

  // Links like "See the hot food menu" open a specific tab
  document.querySelectorAll('[data-show-category]').forEach((link) => {
    link.addEventListener('click', () => { if (menu) select(link.dataset.showCategory); });
  });

  fetch('data/menu.json', { cache: 'no-cache' })
    .then((res) => { if (!res.ok) throw new Error(res.status); return res.json(); })
    .then((data) => {
      menu = data;
      buildTabs();
      select(menu.categories[0].id);
    })
    .catch(() => {
      introEl.className = 'menu__status';
      introEl.textContent = location.protocol === 'file:'
        ? 'The menu loads when the site runs on a web server. To preview it on your computer, see "Preview the site" in README.md.'
        : 'The menu could not load right now. Call us at (718) 782-5551 and we will tell you what is fresh today.';
    });
})();
