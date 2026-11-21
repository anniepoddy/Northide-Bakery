// Pierogi box fronts, in the style of Polish folk art:
// Bolesławiec pottery (cobalt on cream, peacock-eye dots, scalloped rims)
// and Wycinanki paper cuts (layered, mirrored flowers and birds).
//
// Run from the project folder:  node tools/packaging.mjs
// Writes one SVG per flavor to packaging/ and the preview page packaging/index.html.
// Change a flavor's words or accent color in FLAVORS below and run it again.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const W = 600, H = 1000;

const C = {
  cobalt: '#27306E',   // Bolesławiec blue, from the Canva draft
  cobaltDeep: '#1C2456',
  cream: '#F3E6CF',
  paper: '#FBF6EC',
  red: '#9A1B1F',      // Northside red
};

export const FLAVORS = [
  { slug: 'blueberry', name: 'Blueberry', polish: 'Pierogi z jagodami',
    text: ['Soft, pillowy dough folded by', 'hand around sweet blueberries.'],
    accent: '#6E5BB8', light: '#C9BEF0' },
  { slug: 'potato-cheese', name: 'Potato & Cheese', polish: 'Pierogi ruskie',
    text: ['The classic: potato and farmer’s', 'cheese, folded by hand.'],
    accent: '#D29A26', light: '#F2D080' },
  { slug: 'sauerkraut-mushroom', name: 'Sauerkraut & Mushroom', polish: 'Pierogi z kapustą i grzybami',
    text: ['Tangy sauerkraut and forest', 'mushrooms, folded by hand.'],
    accent: '#6C8A3A', light: '#C3D693' },
  { slug: 'meat', name: 'Meat', polish: 'Pierogi z mięsem',
    text: ['Seasoned meat in tender dough,', 'folded by hand.'],
    accent: '#C0392B', light: '#F3B1A6' },
];

const logo = readFileSync(new URL('../images/logo/logo-red.png', import.meta.url)).toString('base64');

const f = n => +n.toFixed(2);

// ---------- motifs (each drawn around its own origin) ----------

// Wycinanki crown tulip, pointing up from (0,0), about 56 tall. Three paper layers.
const tulip = (base, mid, top) => `
  <path d="M0 0C-26 0-32-30-26-52L-13-37 0-56 13-37 26-52C32-30 26 0 0 0Z" fill="${base}"/>
  <path d="M0-6C-16-6-20-26-16-40L-8-30 0-42 8-30 16-40C20-26 16-6 0-6Z" fill="${mid}"/>
  <path d="M0-12C-8-12-10-24-7-32L0-26 7-32C10-24 8-12 0-12Z" fill="${top}"/>`;

// Almond leaf from (0,0) pointing up, length L.
const leaf = (L, fill, vein) => `
  <path d="M0 0C${f(L * .3)} ${f(-L * .25)} ${f(L * .3)} ${f(-L * .75)} 0 ${-L}C${f(-L * .3)} ${f(-L * .75)} ${f(-L * .3)} ${f(-L * .25)} 0 0Z" fill="${fill}"/>
  ${vein ? `<path d="M0 -4V${f(-L * .8)}" stroke="${vein}" stroke-width="1.6" stroke-linecap="round"/>` : ''}`;

// Round rozeta: petals around a center, layered rings.
function rozeta(r, petal, ring, center, dot) {
  const n = 10; let s = '';
  for (let i = 0; i < n; i++) {
    const a = (360 / n) * i;
    s += `<ellipse cx="0" cy="${f(-r * .62)}" rx="${f(r * .26)}" ry="${f(r * .42)}" fill="${petal}" transform="rotate(${a})"/>`;
  }
  s += `<circle r="${f(r * .5)}" fill="${ring}"/><circle r="${f(r * .32)}" fill="${center}"/>`;
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 / 6) * i;
    s += `<circle cx="${f(Math.cos(a) * r * .41)}" cy="${f(Math.sin(a) * r * .41)}" r="${f(r * .045)}" fill="${dot}"/>`;
  }
  return s + `<circle r="${f(r * .09)}" fill="${dot}"/>`;
}

// Folk bird facing right, body roughly 0..70 wide, sitting on y=0.
const bird = (body, wing, eye, tail) => `
  <path d="M6 -4C-8-6-22-20-26-34C-14-28-8-26 0-20C-6-30-6-40-2-48C4-38 8-28 12-18Z" fill="${tail}"/>
  <path d="M0 0C6-20 30-30 52-22C56-30 62-34 68-32L76-28 68-24C68-6 50 10 26 10C12 10 2 6 0 0Z" fill="${body}"/>
  <path d="M14-4C22-18 38-20 48-10C38-2 26 0 14-4Z" fill="${wing}"/>
  <path d="M20-6C26-12 34-13 40-9" fill="none" stroke="${eye}" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="63" cy="-26" r="2.4" fill="${eye}"/>`;

// Bolesławiec peacock eye: blue disc, cream ring, accent heart.
const peacock = (r, blue, ring, heart) =>
  `<circle r="${r}" fill="${blue}"/><circle r="${f(r * .62)}" fill="${ring}"/><circle r="${f(r * .36)}" fill="${heart}"/><circle r="${f(r * .12)}" fill="${blue}"/>`;

// Tree of life for the side margins, drawn from its base (0,0) upward, about 330 tall.
function treeOfLife(fl, id) {
  const stem = `<path d="M0 0C-6-80 8-160 0-250" fill="none" stroke="${C.cobalt}" stroke-width="5" stroke-linecap="round"/>`;
  let s = stem;
  const pairs = [[-30, 40], [-90, 34], [-150, 30], [-205, 26]];
  pairs.forEach(([y, L], i) => {
    const x = i % 2 ? 2 : -2;
    s += `<g transform="translate(${x} ${y}) rotate(-52)">${leaf(L, C.cobalt, C.cream)}</g>`;
    s += `<g transform="translate(${x} ${y}) rotate(52)">${leaf(L, C.cobalt, C.cream)}</g>`;
  });
  // berries on short stalks
  [[-60, -1], [-120, 1], [-180, -1]].forEach(([y, side]) => {
    const x = side * 30;
    s += `<path d="M0 ${y}Q${x * .6} ${y - 4} ${x} ${y - 10}" fill="none" stroke="${C.cobalt}" stroke-width="2.4" stroke-linecap="round"/>`;
    s += `<g transform="translate(${x} ${y - 14})">${peacock(8, C.cobalt, C.paper, fl.accent)}</g>`;
  });
  s += `<g transform="translate(0 -250)">${tulip(C.cobalt, fl.accent, C.red)}</g>`;
  s += `<g transform="translate(0 -318)">${rozeta(17, C.cobalt, C.red, fl.accent, C.paper)}</g>`;
  // ground: three small mounds like a paper-cut pot
  s += `<path d="M-26 6H26L20 24H-20Z" fill="${C.cobalt}"/><path d="M-14 12H14" stroke="${C.cream}" stroke-width="2" stroke-dasharray="2 4" stroke-linecap="round"/>`;
  return s;
}

// Corner spray for the blue band: rozeta with leaves and a tulip, in cream layers.
function spray(fl) {
  let s = '';
  s += `<path d="M0 0C10-30 30-50 58-60" fill="none" stroke="${C.cream}" stroke-width="3.2" stroke-linecap="round"/>`;
  s += `<path d="M0 0C-4-34 2-64 -6-94" fill="none" stroke="${C.cream}" stroke-width="3.2" stroke-linecap="round"/>`;
  s += `<g transform="translate(14 -30) rotate(70)">${leaf(30, C.cream, C.cobalt)}</g>`;
  s += `<g transform="translate(-2 -50) rotate(-60)">${leaf(30, C.cream, C.cobalt)}</g>`;
  s += `<g transform="translate(30 -46) rotate(-20)">${leaf(24, C.cream, C.cobalt)}</g>`;
  s += `<g transform="translate(66 -64)">${rozeta(24, C.cream, fl.accent, C.red, C.cream)}</g>`;
  s += `<g transform="translate(-6 -92) scale(.85)">${tulip(C.cream, C.red, fl.accent)}</g>`;
  return s;
}

// The pierogi, in the bakery's engraved style, recolored cobalt and filled with paper.
function pierogi(id) {
  const stroke = C.cobalt;
  return `
  <defs>
    <filter id="hand-${id}"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter>
    <pattern id="st-${id}" width="4.5" height="4.5" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r=".95" fill="${stroke}"/><circle cx="3.4" cy="3.4" r=".7" fill="${stroke}"/></pattern>
    <pattern id="st2-${id}" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".85" fill="${stroke}"/><circle cx="6" cy="5.5" r=".6" fill="${stroke}"/></pattern>
    <clipPath id="pc-${id}"><path d="M28 138A72 72 0 0 1 172 138c-36 10-108 10-144 0Z"/></clipPath>
  </defs>
  <g filter="url(#hand-${id})" transform="rotate(-12 100 110)">
    <path d="M20 140A9 9 0 0 1 21.8 123.4A9 9 0 0 1 26.9 107.5A9 9 0 0 1 35.3 93A9 9 0 0 1 46.5 80.6A9 9 0 0 1 60 70.7A9 9 0 0 1 75.3 63.9A9 9 0 0 1 91.6 60.4A9 9 0 0 1 108.4 60.4A9 9 0 0 1 124.7 63.9A9 9 0 0 1 140 70.7A9 9 0 0 1 153.5 80.6A9 9 0 0 1 164.7 93A9 9 0 0 1 173.1 107.5A9 9 0 0 1 178.2 123.4A9 9 0 0 1 180 140c-40 14-120 14-160 0Z" fill="${C.paper}"/>
    <g clip-path="url(#pc-${id})">
      <ellipse cx="100" cy="146" rx="80" ry="22" fill="url(#st-${id})"/>
      <ellipse cx="150" cy="110" rx="30" ry="40" fill="url(#st2-${id})"/>
      <path d="M62 128c8-22 20-36 36-46l4 4c-14 10-26 24-32 44Z" fill="url(#st-${id})"/>
      <path d="M92 132c8-22 18-34 32-42l4 4c-12 8-22 20-28 40Z" fill="url(#st-${id})"/>
    </g>
    <g fill="none" stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 140A9 9 0 0 1 21.8 123.4A9 9 0 0 1 26.9 107.5A9 9 0 0 1 35.3 93A9 9 0 0 1 46.5 80.6A9 9 0 0 1 60 70.7A9 9 0 0 1 75.3 63.9A9 9 0 0 1 91.6 60.4A9 9 0 0 1 108.4 60.4A9 9 0 0 1 124.7 63.9A9 9 0 0 1 140 70.7A9 9 0 0 1 153.5 80.6A9 9 0 0 1 164.7 93A9 9 0 0 1 173.1 107.5A9 9 0 0 1 178.2 123.4A9 9 0 0 1 180 140" stroke-width="3.2"/>
      <path d="M28 138A72 72 0 0 1 172 138" stroke-width="2.2"/>
      <path d="M20 140c40 14 120 14 160 0" stroke-width="3.4"/>
      <path d="M62 128c8-22 20-36 36-46M92 132c8-22 18-34 32-42M122 134c6-16 14-26 26-32" stroke-width="2.4"/>
    </g>
  </g>`;
}

// The plate: a Bolesławiec rim around the pierogi.
function plate(fl, id, cx, cy, R) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${C.paper}" stroke="${C.cobalt}" stroke-width="4"/>`;
  // outer band of peacock eyes
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 / n) * i - Math.PI / 2;
    const x = cx + Math.cos(a) * (R - 19), y = cy + Math.sin(a) * (R - 19);
    s += `<g transform="translate(${f(x)} ${f(y)})">${peacock(12, C.cobalt, C.paper, fl.accent)}</g>`;
    const a2 = a + Math.PI / n;
    s += `<circle cx="${f(cx + Math.cos(a2) * (R - 19))}" cy="${f(cy + Math.sin(a2) * (R - 19))}" r="3" fill="${C.cobalt}"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${R - 38}" fill="none" stroke="${C.cobalt}" stroke-width="2"/>`;
  // lace ring: little blue scallops with a dot each
  const m = 30, rr = R - 38;
  for (let i = 0; i < m; i++) {
    const a = (Math.PI * 2 / m) * i;
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    const deg = a * 180 / Math.PI + 90;
    s += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(deg)})"><path d="M-7 0A7 7 0 0 0 7 0Z" fill="${C.cobalt}"/><circle cy="13" r="1.8" fill="${C.cobalt}"/></g>`;
  }
  // pierogi in the middle
  const sc = 1.27;
  s += `<g transform="translate(${f(cx - 100 * sc)} ${f(cy - 106 * sc)}) scale(${sc})">${pierogi(id)}</g>`;
  return s;
}

// Scalloped edge across the width. dir=1 hangs down from y, dir=-1 rises up from y.
function scallops(y, dir, r = 20) {
  let s = '';
  for (let x = r; x < W + r; x += r * 2) {
    s += `<path d="M${x - r} ${y}A${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${x + r} ${y}Z" fill="${C.cobalt}"/>`;
    s += `<circle cx="${x}" cy="${y + dir * r * .45}" r="3.6" fill="${C.cream}"/>`;
  }
  return s;
}
function dotRow(y, step = 20, r = 2.6) {
  let s = '';
  for (let x = step / 2; x < W; x += step) s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.cobalt}"/>`;
  return s;
}

// Round red "handmade" stamp.
function stamp(fl) {
  let ticks = '';
  for (let i = 0; i < 28; i++) ticks += `<circle cx="0" cy="-41" r="1.5" fill="${C.cream}" transform="rotate(${f(i * 360 / 28)})"/>`;
  return `<circle r="46" fill="${C.red}"/>${ticks}
    <text y="-9" text-anchor="middle" fill="${C.cream}" font-family="'EB Garamond', Georgia, serif" font-weight="600" font-size="6.8" letter-spacing=".9">RĘCZNIE ROBIONE</text>
    <text y="9" text-anchor="middle" fill="${C.cream}" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="500" font-size="17">Handmade</text>
    <text y="24" text-anchor="middle" fill="${C.cream}" font-family="'EB Garamond', Georgia, serif" font-weight="600" font-size="7.6" letter-spacing="1.2">SINCE 1992</text>`;
}

export function boxFront(fl) {
  const id = fl.slug;
  const mirror = inner => `<g transform="translate(${W} 0) scale(-1 1)">${inner}</g>`;
  const birdL = `<g transform="translate(58 248) scale(1.05)">${bird(C.cream, fl.accent, C.red, C.cream)}</g>`;
  const sprayL = `<g transform="translate(36 200)">${spray(fl)}</g>`;
  const treeL = `<g transform="translate(64 722)">${treeOfLife(fl, id)}</g>`;
  const nameSize = fl.name.length > 16 ? 30 : 36;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t-${id}">
  <title id="t-${id}">Northside Bakery ${fl.name} pierogi box, front</title>
  <rect width="${W}" height="${H}" fill="${C.cream}"/>

  <!-- top band: logo between mirrored paper-cut sprays and birds -->
  <rect width="${W}" height="292" fill="${C.cobalt}"/>
  ${sprayL}${mirror(sprayL)}
  ${birdL}${mirror(birdL)}
  <g>
    ${Array.from({ length: 40 }, (_, i) => { const a = Math.PI * 2 * i / 40; return `<circle cx="${f(300 + Math.cos(a) * 116)}" cy="${f(142 + Math.sin(a) * 116)}" r="${i % 2 ? 2.2 : 3.6}" fill="${i % 2 ? fl.light : C.cream}"/>`; }).join('')}
    <circle cx="300" cy="142" r="104" fill="${C.cream}"/>
    <circle cx="300" cy="142" r="97" fill="none" stroke="${C.red}" stroke-width="1.4" stroke-dasharray="1 5" stroke-linecap="round"/>
    <image href="data:image/png;base64,${logo}" x="214" y="82" width="172" height="119"/>
  </g>
  ${scallops(292, 1)}
  ${dotRow(330)}

  <text x="300" y="364" text-anchor="middle" fill="${C.cobalt}" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="500" font-size="21">Baked on North 8th since 1992.</text>

  <!-- middle: trees of life around a pottery plate -->
  ${treeL}${mirror(treeL)}
  ${plate(fl, id, 300, 552, 158)}
  <g transform="translate(424 676) rotate(-10)">${stamp(fl)}</g>

  ${dotRow(732)}
  ${scallops(764, -1)}
  <rect y="764" width="${W}" height="${H - 764}" fill="${C.cobalt}"/>

  <!-- bottom band: the words -->
  <text x="300" y="812" text-anchor="middle" fill="${fl.light}" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="500" font-size="${nameSize}">${fl.name.replace('&', '&amp;')}</text>
  <text x="300" y="890" text-anchor="middle" fill="${C.cream}" font-family="Fraunces, Georgia, serif" font-weight="650" font-size="92" letter-spacing="-1.5">Pierogi</text>
  <g transform="translate(300 914)">
    <path d="M-150 0H-14M14 0H150" stroke="${fl.light}" stroke-width="1.2"/>
    <path d="M0-6L6 0 0 6-6 0Z" fill="${fl.light}"/>
  </g>
  <text x="300" y="944" text-anchor="middle" fill="${fl.light}" font-family="'EB Garamond', Georgia, serif" font-style="italic" font-size="22">${fl.polish}</text>
  <text text-anchor="middle" fill="${C.cream}" font-family="'EB Garamond', Georgia, serif" font-size="15.5">
    <tspan x="300" y="966">${fl.text[0]}</tspan><tspan x="300" y="984">${fl.text[1]}</tspan>
  </text>
  <text x="26" y="986" fill="${C.cream}" font-family="'EB Garamond', Georgia, serif" font-weight="600" font-size="9.5" letter-spacing="1.4">12 PIEROGI</text>
  <text x="26" y="972" fill="${C.cream}" font-family="'EB Garamond', Georgia, serif" font-weight="600" font-size="9.5" letter-spacing="1.4">NET WT 00 OZ (000 G)</text>
  <text x="574" y="986" text-anchor="end" fill="${C.cream}" font-family="'EB Garamond', Georgia, serif" font-weight="600" font-size="9.5" letter-spacing="1.4">KEEP FROZEN</text>
  <text x="574" y="972" text-anchor="end" fill="${C.cream}" font-family="'EB Garamond', Georgia, serif" font-weight="600" font-size="9.5" letter-spacing="1.4">149 N 8TH ST, BROOKLYN</text>
</svg>`;
}

function previewPage() {
  const cards = FLAVORS.map(fl => `
      <figure class="box">
        <div class="art">${boxFront(fl).replace(/ width="600" height="1000"/, '')}</div>
        <figcaption><span class="chip" style="background:${fl.accent}"></span><span><strong>${fl.name}</strong><em>${fl.polish}</em></span></figcaption>
      </figure>`).join('');
  return `<title>Northside Pierogi Boxes</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,400..700,50;1,9..144,400..700,50&family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet">
<style>
  /* One look on purpose: packaging proofs on a pottery-blue table, cream type. */
  :root {
    --table: #1C2456; --cobalt: #27306E; --cream: #F3E6CF; --paper: #FBF6EC; --red: #9A1B1F; --muted: #B9BEDF;
    --display: Fraunces, Georgia, serif; --body: "EB Garamond", Georgia, serif;
    color-scheme: dark;
  }
  * { box-sizing: border-box; }
  body { background: var(--table); color: var(--cream); font: 400 19px/1.55 var(--body); margin: 0; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 1180px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  header { padding-block: clamp(36px, 6vw, 72px) clamp(24px, 4vw, 40px); }
  .eyebrow { font-weight: 600; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin: 0 0 10px; }
  h1 { font-family: var(--display); font-weight: 600; font-size: clamp(38px, 6vw, 68px); line-height: 1; letter-spacing: -.02em; margin: 0 0 16px; text-wrap: balance; }
  h1 em { font-weight: 500; color: #C9BEF0; }
  .lede { max-width: 58ch; margin: 0; color: var(--cream); }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: clamp(18px, 3vw, 32px); padding-block: 8px 48px; }
  .box { margin: 0; display: grid; gap: 12px; }
  .art { background: var(--cream); box-shadow: 0 1px 0 rgba(255,255,255,.08), 0 22px 40px -18px rgba(0,0,0,.6); }
  .art svg { display: block; width: 100%; height: auto; }
  figcaption { display: flex; gap: 10px; align-items: flex-start; font-size: 17px; line-height: 1.3; }
  figcaption strong { display: block; font-family: var(--display); font-weight: 600; }
  figcaption em { color: var(--muted); }
  .chip { flex: none; width: 14px; height: 14px; border-radius: 50%; margin-top: 4px; box-shadow: 0 0 0 2px var(--cream); }
  section.notes { border-top: 1px solid rgba(243,230,207,.18); padding-block: 40px 64px; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 32px; }
  h2 { font-family: var(--display); font-weight: 600; font-size: 26px; margin: 0 0 10px; letter-spacing: -.01em; }
  ul { margin: 0; padding-left: 1.1em; display: grid; gap: 8px; }
  li { min-width: 0; }
  li b { font-weight: 600; }
</style>

<header class="wrap">
  <p class="eyebrow">Northside Bakery · frozen pierogi · box front, 6 × 10 in</p>
  <h1>Pierogi boxes, <em>z wzorem ludowym</em></h1>
  <p class="lede">Your navy-and-cream Canva layout, redrawn with Bolesławiec pottery and Wycinanki paper cuts. The pierogi sits on a stoneware plate, trees of life stand on either side, and two paper-cut birds face the logo. Each filling keeps the same box and changes one accent color.</p>
</header>

<main class="wrap">
  <div class="grid">${cards}
  </div>

  <section class="notes">
    <div>
      <h2>What comes from where</h2>
      <ul>
        <li><b>Bolesławiec pottery:</b> the cobalt-on-cream palette, the peacock-eye dots (<i>pawie oczko</i>) around the plate rim, and the dotted scallops at the band edges.</li>
        <li><b>Wycinanki paper cuts:</b> flowers built from stacked layers of color, mirrored left and right, plus the crowned tulips, rosettes and facing birds.</li>
        <li><b>Northside:</b> the red logo in a cream roundel, the ink-drawing pierogi from the website (redrawn in blue), Fraunces and EB Garamond, and the "since 1992" tagline.</li>
      </ul>
    </div>
    <div>
      <h2>Before it goes to print</h2>
      <ul>
        <li><b>Net weight</b> reads "00 oz (000 g)". Put in the real weight. US labels need it on the front.</li>
        <li><b>Logo</b> is the small screen PNG. Swap in the vector original for print.</li>
        <li><b>Flavor colors</b> (violet, mustard, green, tomato) are outside the red-and-cream brand guide. They appear only as small accents, as on painted pottery.</li>
        <li>The back panel needs ingredients, allergens, cooking steps and a barcode.</li>
      </ul>
    </div>
  </section>
</main>
`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = new URL('../packaging/', import.meta.url);
  mkdirSync(out, { recursive: true });
  for (const fl of FLAVORS) {
    writeFileSync(new URL(`pierogi-${fl.slug}.svg`, out), boxFront(fl));
  }
  writeFileSync(new URL('index.html', out), previewPage());
  console.log(`Wrote ${FLAVORS.length} box fronts to packaging/`);
}
