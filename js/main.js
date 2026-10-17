// Northside Bakery, Brooklyn
// 1. Header and mobile navigation  2. Today's hours  3. Hero slideshow
// 4. Scroll reveals and parallax  5. Menu (read from data/menu.json)

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
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => setOpen(!navOpen));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && navOpen) { setOpen(false); toggle.focus(); } });
  }

  // Header stays put; it just gains a fine line once the page scrolls
  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
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

  /* ---------- 5. Menu ---------- */
  const tabsEl = document.querySelector('[data-menu-tabs]');
  const gridEl = document.querySelector('[data-menu-grid]');
  const introEl = document.querySelector('[data-menu-intro]');
  const panelEl = document.querySelector('[data-menu-panel]');
  if (!tabsEl || !gridEl) return;

  // Drawing shown when an item has no photo yet
  const PLACEHOLDER = { bread: 'boule', sweets: 'paczek', pierogi: 'pierogi', hot: 'golabek', market: 'wheat' };
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
    meta.append(el('span', `tag ${daily ? 'tag--daily' : 'tag--rotating'}`, item.availability || 'Rotating – ask in store'));
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
    gridEl.replaceChildren(...menu.items.filter((i) => i.category === current).map(renderItem));
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
