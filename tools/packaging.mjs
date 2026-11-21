// Pierogi box fronts, made like collectible art prints: every filling gets its own
// painted Polish folk scene in an arched window, a plate of pierogi in front,
// and a bold box color. Folk sources: Łowicz striped skirts and flower wreaths,
// Zalipie painted cottages, Wycinanki roosters, Bolesławiec pottery.
//
// Run from the project folder:  node tools/packaging.mjs
// Writes one SVG per flavor to packaging/ and the preview page packaging/index.html.
// Change a flavor's words or colors in FLAVORS below and run it again.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const W = 600, H = 1000;
const FRAME = '#F6E9D0';          // cream of the frame and type
const COBALT = '#26307A';
const DOUGH = '#F0D59A', DOUGH_SH = '#D3A660', DOUGH_DK = '#A87A3C';
const SKIN = '#F3D2B8', BLUSH = '#EE8C86', HAIR = '#4A2A1C';
const RED = '#D8342C', YEL = '#F3BE3F', GRN = '#2F7A47', BLU = '#3E5FC8', ORG = '#EE7D2B', PUR = '#6A3F9A', INK = '#1E1B2E', WHITE = '#FBF7EE';

export const FLAVORS = [
  { slug: 'blueberry', name: 'Blueberry', polish: 'Pierogi z jagodami', scene: 'Picking blueberries at dusk',
    text: ['Soft, pillowy dough folded by hand', 'around sweet wild blueberries.'],
    ground: '#A9476A', deep: '#7E2E4D', light: '#FFE1AE' },
  { slug: 'potato-cheese', name: 'Potato & Cheese', polish: 'Pierogi ruskie', scene: 'Potato field at sunrise',
    text: ['The classic: potato and farmer’s cheese,', 'with golden onions on top.'],
    ground: '#1E5866', deep: '#123E49', light: '#F6C453' },
  { slug: 'sauerkraut-mushroom', name: 'Sauerkraut & Mushroom', polish: 'Pierogi z kapustą i grzybami', scene: 'Mushroom forest in autumn',
    text: ['Tangy sauerkraut and forest mushrooms,', 'the Christmas Eve favorite.'],
    ground: '#6A2238', deep: '#4A1325', light: '#F2B98A' },
  { slug: 'meat', name: 'Meat', polish: 'Pierogi z mięsem', scene: 'Rooster on the fence at sunset',
    text: ['Seasoned meat in tender dough,', 'finished with crisp skwarki.'],
    ground: COBALT, deep: '#19205A', light: '#F7A98A' },
];

const logo = readFileSync(new URL('../images/logo/logo-red.png', import.meta.url)).toString('base64');
const f = n => +(+n).toFixed(2);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const g = (t, inner, extra = '') => `<g transform="${t}" ${extra}>${inner}</g>`;

// ---------- small painted pieces ----------

const star4 = (s, fill, o = 1) => `<path d="M0 ${-s}L${f(s * .22)} ${f(-s * .22)} ${s} 0 ${f(s * .22)} ${f(s * .22)} 0 ${s} ${f(-s * .22)} ${f(s * .22)} ${-s} 0 ${f(-s * .22)} ${f(-s * .22)}Z" fill="${fill}" opacity="${o}"/>`;

function flower(r, petal, center, n = 6) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<ellipse cy="${f(-r * .55)}" rx="${f(r * .36)}" ry="${f(r * .55)}" fill="${petal}" transform="rotate(${f(i * 360 / n)})"/>`;
  return s + `<circle r="${f(r * .32)}" fill="${center}"/>`;
}

const spruce = (h, w, fill) => `<path d="M0 ${-h}L${f(w * .32)} ${f(-h * .62)}H${f(w * .17)}L${f(w * .42)} ${f(-h * .3)}H${f(w * .24)}L${f(w * .5)} 0H${f(-w * .5)}L${f(-w * .24)} ${f(-h * .3)}H${f(-w * .42)}L${f(-w * .17)} ${f(-h * .62)}H${f(-w * .32)}Z" fill="${fill}"/>`;

function spruceRow(seed, y, n, hMin, hMax, fill, x0 = -20, x1 = 480) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * (i + r() * .6) / n, h = hMin + r() * (hMax - hMin);
    s += g(`translate(${f(x)} ${f(y + r() * 8)})`, spruce(h, h * .55, fill));
  }
  return s;
}

function berry(r, c = '#3B3E92') {
  return `<circle r="${r}" fill="${c}"/><circle cx="${f(-r * .35)}" cy="${f(-r * .35)}" r="${f(r * .32)}" fill="#8E92E0" opacity=".7"/><path d="M${f(-r * .3)} ${f(r * .1)}l${f(r * .3)} ${f(-r * .25)} ${f(r * .3)} ${f(r * .25)}" stroke="#1C1E55" stroke-width="${f(r * .18)}" fill="none" transform="translate(${f(r * .25)} ${f(r * .45)}) scale(.6)"/>`;
}

function leafy(seed, x, y, n, spread, colors, rx = 9, ry = 18) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const a = -80 + r() * 160;
    s += `<ellipse cx="${f(x + (r() - .5) * spread)}" cy="${f(y - r() * spread * .45)}" rx="${rx}" ry="${ry}" fill="${colors[i % colors.length]}" transform="rotate(${f(a)} ${f(x + (r() - .5) * spread)} ${f(y - r() * spread * .45)})"/>`;
  }
  return s;
}

// ---------- the four scenes, drawn in a 460 × 510 window ----------

function girl() {
  const ribbons = [RED, GRN, BLU, '#E77FA0'].map((c, i) =>
    `<path d="M${-10 + i * 2} -112C${-34 - i * 5} -84 ${-14 - i * 12} -46 ${-40 - i * 13} ${-14 + i * 10}" stroke="${c}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`).join('');
  let braid = '';
  for (let i = 0; i < 7; i++) braid += `<ellipse cx="${f(-16 - i * 1.5)}" cy="${-96 + i * 10}" rx="5.5" ry="7" fill="${HAIR}" stroke="#2E1A12" stroke-width=".8"/>`;
  const skirt = 'M-34 0C-50 30-72 80-82 112C-30 124 30 124 82 112C72 80 50 30 34 0Z';
  let hem = '';
  for (let i = 0; i < 9; i++) hem += g(`translate(${-64 + i * 16} ${113 + Math.sin(i / 8 * Math.PI) * 6})`, flower(4.5, [RED, YEL, BLU][i % 3], WHITE, 5));
  let beads = '';
  for (let row = 0; row < 3; row++) for (let i = 0; i < 7; i++) { const a = Math.PI * (.15 + .7 * i / 6); beads += `<circle cx="${f(Math.cos(a) * (10 + row * 2.6))}" cy="${f(-74 + Math.sin(a) * (4 + row * 3))}" r="2.1" fill="${RED}"/>`; }
  let wreath = '';
  [[-18, -110, 7, RED], [-9, -121, 8, YEL], [3, -125, 8.5, BLU], [15, -120, 7.5, '#E77FA0'], [23, -110, 6, RED], [-4, -116, 5, WHITE]].forEach(([x, y, r, c]) => { wreath += g(`translate(${x} ${y})`, flower(r, c, c === YEL ? RED : YEL)); });
  wreath = leafy(4, 2, -112, 6, 40, ['#3E8A4F', '#5DA45E'], 3, 7) + wreath;
  let embroidery = '';
  [[-14, -48, RED], [14, -48, RED], [0, -30, YEL], [-18, -18, BLU], [18, -18, BLU]].forEach(([x, y, c]) => { embroidery += g(`translate(${x} ${y})`, flower(5, c, YEL, 5)); });
  let heap = '';
  const r = rng(9);
  for (let i = 0; i < 14; i++) heap += g(`translate(${f(32 + r() * 36)} ${f(-14 + r() * 8 - (i > 9 ? 6 : 0))})`, berry(4.2 + r()));
  return `
    ${ribbons}${braid}
    <path d="${skirt}" fill="url(#lowicz-blueberry)"/>
    <path d="M-30 6C-40 40-52 80-60 114M-12 6C-16 50-20 90-22 118M12 6C16 50 20 90 22 118M30 6C40 40 52 80 60 114" stroke="${INK}" stroke-width="2" opacity=".18" fill="none"/>
    <path d="M-82 112C-30 124 30 124 82 112" stroke="${INK}" stroke-width="13" fill="none"/>
    ${hem}
    <ellipse cx="-28" cy="-56" rx="16" ry="20" fill="${WHITE}"/><ellipse cx="-24" cy="-50" rx="10" ry="14" fill="#E4DCCB" opacity=".6"/>
    <path d="M-24 -66C-26 -40-30 -14-34 0H34C30 -14 26 -40 24 -66C10 -60-10 -60-24 -66Z" fill="${INK}"/>
    <path d="M-24 -66C-26 -40-30 -14-34 0H34C30 -14 26 -40 24 -66" stroke="${YEL}" stroke-width="1.6" stroke-dasharray="1 4" stroke-linecap="round" fill="none"/>
    ${embroidery}
    <path d="M-15 -66Q0 -56 15 -66L11 -76H-11Z" fill="${WHITE}"/>
    <rect x="-6" y="-86" width="12" height="14" fill="${SKIN}"/>
    ${beads}
    <circle cx="-17" cy="-104" r="8.5" fill="${HAIR}"/>
    <ellipse cx="2" cy="-100" rx="17" ry="20" fill="${SKIN}"/>
    <path d="M-17 -96C-19 -122 2 -128 18 -112C8 -114 0 -110-3 -103C-7 -99-11 -96-17 -90Z" fill="${HAIR}"/>
    <circle cx="10" cy="-91" r="4.6" fill="${BLUSH}" opacity=".75"/>
    <path d="M4 -100Q8.5 -96.5 13 -100" stroke="#3A2A22" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M5 -106Q9 -108 13 -106" stroke="${HAIR}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path d="M17 -96L19.5 -92 16.5 -91.5" stroke="#C9967A" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="13" cy="-86" rx="2.4" ry="1.3" fill="#C9463D"/>
    ${wreath}
    <ellipse cx="28" cy="-56" rx="15" ry="19" fill="${WHITE}"/>
    <path d="M30 -46C38 -36 42 -24 44 -12" stroke="${WHITE}" stroke-width="11" stroke-linecap="round" fill="none"/>
    <path d="M38 -20l12 2" stroke="#E4DCCB" stroke-width="3" stroke-linecap="round"/>
    <path d="M32 -10Q50 -46 70 -10" stroke="#8A5A2B" stroke-width="3.5" fill="none"/>
    <path d="M26 -10H76L69 22H33Z" fill="#B07A3F"/>
    <path d="M28 -2H74M30 6H72M31 14H71" stroke="#8A5A2B" stroke-width="1.4"/>
    <path d="M38 -10L36 22M48 -10V22M58 -10V22M68 -10L66 22" stroke="#8A5A2B" stroke-width="1" opacity=".6"/>
    ${heap}
    <circle cx="44" cy="-10" r="5.2" fill="${SKIN}"/>`;
}

function sceneBlueberry(id) {
  const r = rng(11);
  let stars = '';
  for (let i = 0; i < 46; i++) { const x = r() * 460, y = r() * 300; stars += g(`translate(${f(x)} ${f(y)})`, star4(1.4 + r() * 3.4, '#FCEBC0', .5 + r() * .5)); }
  let flies = '';
  for (let i = 0; i < 16; i++) flies += `<circle cx="${f(r() * 460)}" cy="${f(320 + r() * 130)}" r="5" fill="#F7D774" opacity=".18"/><circle cx="${f(r() * 460)}" cy="${f(320 + r() * 130)}" r="1.7" fill="#FBE59A"/>`;
  const bush = (x, y, seed) => {
    let s = leafy(seed, x, y, 26, 110, ['#2F6B4E', '#3E8560', '#24573F', '#4E9A6C'], 10, 20);
    const q = rng(seed + 1);
    for (let i = 0; i < 16; i++) s += g(`translate(${f(x + (q() - .5) * 100)} ${f(y - q() * 46)})`, berry(4.5 + q() * 2));
    return s;
  };
  return `
    <defs>
      <linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15184A"/><stop offset=".55" stop-color="#2E2F7A"/><stop offset="1" stop-color="#6E5296"/></linearGradient>
      <mask id="moon-${id}"><rect width="460" height="510" fill="#fff"/><circle cx="352" cy="104" r="30" fill="#000"/></mask>
      <pattern id="lowicz-${id}" width="30" height="10" patternUnits="userSpaceOnUse">
        <rect width="30" height="10" fill="${ORG}"/><rect x="9" width="3" height="10" fill="${GRN}"/><rect x="12" width="5" height="10" fill="${RED}"/>
        <rect x="17" width="3" height="10" fill="${PUR}"/><rect x="20" width="3" height="10" fill="${YEL}"/><rect x="23" width="4" height="10" fill="${INK}"/>
      </pattern>
    </defs>
    <rect width="460" height="510" fill="url(#sky-${id})"/>
    ${stars}
    <circle cx="340" cy="112" r="62" fill="#FBE7B5" opacity=".07"/>
    <circle cx="340" cy="112" r="32" fill="#FBE7B5" mask="url(#moon-${id})"/>
    <path d="M0 320C80 290 150 312 232 292S380 280 460 300V510H0Z" fill="#3A3584"/>
    ${spruceRow(21, 352, 13, 60, 110, '#232C66')}
    ${spruceRow(22, 392, 10, 50, 86, '#1C3A4E')}
    <path d="M0 392C120 372 300 384 460 370V510H0Z" fill="#22433F"/>
    ${flies}
    ${bush(40, 470, 31)}
    ${g('translate(196 338)', girl())}
    ${bush(410, 462, 41)}`;
}

function sceneRuskie(id) {
  let rays = '';
  for (let i = 0; i < 20; i++) rays += `<path d="M-7 -48L0 ${i % 2 ? -66 : -82}L7 -48Z" fill="${i % 2 ? '#F2A33A' : '#E9852C'}" transform="rotate(${i * 18})"/>`;
  const cloud = (x, y, s) => g(`translate(${x} ${y}) scale(${s})`, `<path d="M-50 0C-56 -14-40 -24-28 -16C-26 -34 0 -38 6 -20C14 -32 36 -28 34 -12C48 -14 56 0 46 6H-44C-54 6-56 2-50 0Z" fill="#FFF5DE"/>`);
  let furrows = '';
  for (let i = 0; i < 7; i++) furrows += `<path d="M-20 ${336 + i * 9}C120 ${310 + i * 9} 300 ${330 + i * 9} 480 ${306 + i * 9}" stroke="#D49C34" stroke-width="2" fill="none" opacity=".7"/>`;
  let wallFlowers = '';
  [[-30, -32, RED], [0, -40, YEL], [30, -32, BLU], [-8, -20, '#E77FA0'], [14, -20, RED]].forEach(([x, y, c]) => { wallFlowers += g(`translate(${x} ${y})`, flower(5, c, YEL, 5)); });
  wallFlowers += `<path d="M-30 -26Q-20 -14-8 -16M30 -26Q20 -14 14 -16M0 -34V-14" stroke="#4C8A4A" stroke-width="1.6" fill="none"/>`;
  const stork = `<ellipse cx="0" cy="0" rx="13" ry="7" fill="${WHITE}"/><path d="M-4 -2C2 -6 12 -4 14 2L-2 4Z" fill="${INK}"/><path d="M-10 -2C-14 -12-12 -20-10 -26" stroke="${WHITE}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="-10" cy="-27" r="3.6" fill="${WHITE}"/><path d="M-13 -27L-26 -24" stroke="${RED}" stroke-width="2.2" stroke-linecap="round"/><path d="M0 6V18M4 6V18" stroke="${RED}" stroke-width="1.6"/>`;
  const cottage = `
    <rect x="-62" y="-62" width="124" height="62" fill="#F6EFDD"/>
    <rect x="-62" y="-8" width="124" height="8" fill="#5B7FC6"/>
    <rect x="-52" y="-48" width="22" height="24" fill="#3E64B5"/><rect x="-49" y="-45" width="16" height="18" fill="#FCE9B8"/><path d="M-41 -45V-27M-49 -36H-33" stroke="#3E64B5" stroke-width="2"/>
    <path d="M38 -8V-40A10 10 0 0 1 58 -40V-8Z" fill="#3E64B5"/><circle cx="53" cy="-24" r="1.6" fill="${YEL}"/>
    ${wallFlowers}
    <rect x="22" y="-124" width="13" height="26" fill="#E9DFC9"/>
    <path d="M-74 -60L-30 -114H30L74 -60Z" fill="#C08A3E"/>
    ${Array.from({ length: 13 }, (_, i) => `<path d="M${-66 + i * 11} -64L${-28 + i * 4.7} -110" stroke="#9A6A2C" stroke-width="1.4"/>`).join('')}
    <path d="M-74 -60H74" stroke="#9A6A2C" stroke-width="3"/>
    <ellipse cx="28" cy="-125" rx="18" ry="5" fill="#7A5530"/>
    ${g('translate(30 -137)', stork)}`;
  let plants = '';
  const r = rng(5);
  for (let i = 0; i < 9; i++) {
    const x = 10 + i * 55 + r() * 10, y = 440 + (i % 2) * 22;
    plants += leafy(50 + i, x, y, 9, 44, ['#3E7A3A', '#5C9A48', '#2F6531'], 7, 14);
    for (let k = 0; k < 3; k++) plants += g(`translate(${f(x + (r() - .5) * 34)} ${f(y - 22 - r() * 16)})`, flower(5.5, k === 1 ? '#C8B2E6' : WHITE, YEL, 5));
  }
  return `
    <defs><linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2A64E"/><stop offset=".45" stop-color="#F8D08A"/><stop offset="1" stop-color="#FCEFCB"/></linearGradient></defs>
    <rect width="460" height="510" fill="url(#sky-${id})"/>
    ${g('translate(150 186)', `${rays}<circle r="46" fill="#F06B2B"/><circle r="36" fill="#F59A35"/><path d="M-16 -4Q-11 1-6 -4M6 -4Q11 1 16 -4" stroke="#B4441E" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="-18" cy="8" r="5" fill="#F06B2B" opacity=".7"/><circle cx="18" cy="8" r="5" fill="#F06B2B" opacity=".7"/><path d="M-8 12Q0 19 8 12" stroke="#B4441E" stroke-width="2.2" fill="none" stroke-linecap="round"/>`)}
    ${cloud(340, 110, 1)}${cloud(70, 86, .7)}${cloud(400, 210, .6)}
    <path d="M-10 300C60 280 130 290 200 284S360 266 470 290V510H-10Z" fill="#9DB25A"/>
    <path d="M-20 340C120 312 300 334 480 310V510H-20Z" fill="#E7B547"/>
    ${furrows}
    ${g('translate(86 336)', `<rect x="-4" y="-40" width="8" height="40" fill="#6B4425"/><circle cy="-58" r="30" fill="#4F7E3B"/><circle cx="-14" cy="-50" r="18" fill="#5E8F46"/>${[[-12, -64], [10, -52], [-2, -44], [14, -70], [-20, -48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="${RED}"/>`).join('')}`)}
    ${g('translate(310 364)', cottage)}
    <path d="M-20 400C120 380 300 396 480 380V510H-20Z" fill="#6E9A45"/>
    <path d="M-20 446C140 426 300 446 480 430V510H-20Z" fill="#7A4E2C"/>
    ${[[60, 470], [180, 480], [300, 468], [400, 482]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="8" fill="#C9965A"/><circle cx="${x - 3}" cy="${y - 2}" r="1.2" fill="#8A5E30"/>`).join('')}
    ${plants}`;
}

function sceneKapusta(id) {
  const birch = (x, w, seed) => {
    const r = rng(seed); let marks = '';
    for (let i = 0; i < 14; i++) marks += `<path d="M${f(x - w / 2 + r() * w * .4)} ${f(i * 34 + r() * 20)}h${f(w * (.3 + r() * .4))}" stroke="${INK}" stroke-width="${f(2 + r() * 2.5)}" stroke-linecap="round"/>`;
    return `<rect x="${x - w / 2}" y="-10" width="${w}" height="460" fill="#F4EFE2"/><rect x="${x + w * .15}" y="-10" width="${f(w * .35)}" height="460" fill="#D9D2C2"/>${marks}`;
  };
  const r = rng(77); let fall = '';
  for (let i = 0; i < 46; i++) fall += `<ellipse cx="${f(r() * 460)}" cy="${f(r() * 330)}" rx="3.6" ry="2" fill="${['#E9B23E', '#E07A2E', '#C8452C', '#F2D06A'][i % 4]}" transform="rotate(${f(r() * 180)} ${f(r() * 460)} ${f(r() * 330)})"/>`;
  let litter = '';
  for (let i = 0; i < 40; i++) litter += `<ellipse cx="${f(r() * 460)}" cy="${f(410 + r() * 90)}" rx="5" ry="2.6" fill="${['#E9B23E', '#E07A2E', '#C8452C'][i % 3]}" transform="rotate(${f(r() * 180)} 230 450)"/>`;
  const cabbage = (s) => {
    let leaves = '';
    const cols = ['#5E8F46', '#7FAE5A', '#93BE6A', '#A8C97A', '#BFD99A'];
    cols.forEach((c, i) => { const k = 1 - i * .17; leaves += `<path d="M${f(-46 * k)} 0C${f(-50 * k)} ${f(-50 * k)} ${f(50 * k)} ${f(-50 * k)} ${f(46 * k)} 0C${f(30 * k)} ${f(10 * k)} ${f(-30 * k)} ${f(10 * k)} ${f(-46 * k)} 0Z" fill="${c}" transform="translate(0 ${f(-i * 5)})"/>`; });
    leaves += `<path d="M0 -6C-6 -20-18 -30-30 -32M0 -6C6 -20 18 -30 30 -32M0 -6V-34" stroke="#E2EDC4" stroke-width="1.6" fill="none" opacity=".8"/>`;
    return g(`scale(${s})`, `<path d="M-60 2C-70 -20-56 -40-36 -36C-58 -10-50 0-40 4Z" fill="#4E7E3A"/><path d="M60 2C70 -20 56 -40 36 -36C58 -10 50 0 40 4Z" fill="#4E7E3A"/>${leaves}`);
  };
  const porcini = (s) => g(`scale(${s})`, `<path d="M-16 0C-22 -20-18 -40-12 -48H12C18 -40 22 -20 16 0Z" fill="#EFE2C4"/><path d="M6 -46C12 -30 14 -14 12 0H16C22 -20 18 -40 12 -48Z" fill="#D8C7A0"/><path d="M-42 -44C-40 -78 40 -78 42 -44C20 -36-20 -36-42 -44Z" fill="#8B4A27"/><path d="M-30 -58C-20 -70 0 -72 10 -68" stroke="#B26E44" stroke-width="5" stroke-linecap="round" fill="none"/>`);
  const chanterelle = `<path d="M-3 0C-4 -8-10 -14-14 -18C-6 -22 6 -22 14 -18C10 -14 4 -8 3 0Z" fill="#EE9A2B"/><path d="M-14 -18C-6 -15 6 -15 14 -18" stroke="#C77418" stroke-width="1.2" fill="none"/>`;
  let spikes = '';
  for (let i = 0; i < 15; i++) { const a = Math.PI * (1.02 + .9 * i / 14); spikes += `<path d="M${f(Math.cos(a) * 20)} ${f(Math.sin(a) * 16)}L${f(Math.cos(a) * 36)} ${f(Math.sin(a) * 30)}" stroke="#4A3224" stroke-width="3" stroke-linecap="round"/>`; }
  const hedgehog = `${spikes}<path d="M-34 0C-34 -36 26 -36 30 -4Z" fill="#6B4A33"/><path d="M22 -10C30 -12 40 -6 44 0H20Z" fill="#D9B48A"/><circle cx="44" cy="-1" r="2.6" fill="${INK}"/><circle cx="30" cy="-8" r="1.8" fill="${INK}"/><path d="M-20 0v4M10 0v4" stroke="#4A3224" stroke-width="3" stroke-linecap="round"/>${g('translate(-6 -30) scale(.9)', chanterelle)}`;
  return `
    <defs><linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0E0B0"/><stop offset=".5" stop-color="#C9C78E"/><stop offset="1" stop-color="#5E7A48"/></linearGradient></defs>
    <rect width="460" height="510" fill="url(#sky-${id})"/>
    <path d="M150 0L260 0 330 420 190 420Z" fill="#FFF6D8" opacity=".14"/>
    ${spruceRow(61, 280, 12, 90, 150, '#6F8A58')}
    ${birch(400, 18, 3)}
    ${spruceRow(62, 340, 10, 110, 170, '#46663F')}
    ${birch(70, 24, 4)}${birch(430, 14, 5)}
    ${spruceRow(63, 412, 8, 120, 190, '#2C4630', -10, 470)}
    ${fall}
    <path d="M-10 400C120 380 300 396 470 384V510H-10Z" fill="#6B7E3A"/>
    ${litter}
    ${g('translate(118 432)', cabbage(.7))}
    ${g('translate(50 458)', cabbage(1.1))}
    ${g('translate(318 426)', `${g('translate(-12 0)', chanterelle)}${g('translate(6 4) scale(1.2)', chanterelle)}${g('translate(20 -2) scale(.8)', chanterelle)}`)}
    ${g('translate(396 446)', porcini(1.25))}
    ${g('translate(444 458)', porcini(.7))}
    ${g('translate(230 418) scale(-.9 .9)', hedgehog)}`;
}

function sceneMeat(id) {
  const tailCols = ['#1F3C8A', '#2E8A57', YEL, '#1F3C8A', RED, '#2E8A57', PUR];
  const feathers = tailCols.map((c, i) => {
    const k = 1 - Math.abs(i - 3) * .07, rot = -34 + i * 11;
    return g(`rotate(${rot})`, `<path d="M0 0C-8 ${f(-60 * k)} ${f(-60 * k)} ${f(-120 * k)} ${f(-112 * k)} ${f(-112 * k)}C${f(-122 * k)} ${f(-110 * k)} ${f(-126 * k)} ${f(-96 * k)} ${f(-116 * k)} ${f(-92 * k)}C${f(-70 * k)} ${f(-96 * k)} ${f(-26 * k)} ${f(-50 * k)} 10 4Z" fill="${c}"/>
      <path d="M2 -6C-6 ${f(-56 * k)} ${f(-50 * k)} ${f(-104 * k)} ${f(-104 * k)} ${f(-104 * k)}" stroke="${c === YEL ? RED : WHITE}" stroke-width="1.4" fill="none" opacity=".75"/>
      <circle cx="${f(-108 * k)}" cy="${f(-104 * k)}" r="4" fill="${c === YEL ? RED : YEL}"/>`);
  }).join('');
  let dots = '';
  for (let i = 0; i < 7; i++) dots += `<circle cx="${f(-2 + i * 6)}" cy="${f(-4 + Math.sin(i) * 3)}" r="2" fill="${YEL}"/>`;
  const rooster = `
    ${g('translate(-24 -36)', feathers)}
    <path d="M-36 -40C-40 -10-10 10 24 4C46 0 52 -24 44 -50C36 -66 28 -80 30 -96L10 -96C6 -76 10 -64 6 -56C-6 -56-24 -54-36 -40Z" fill="${RED}"/>
    <path d="M44 -50C52 -24 46 0 24 4C30 -12 32 -32 30 -48Z" fill="${YEL}"/>
    <path d="M-14 -38C0 -50 24 -46 28 -26C18 -14-4 -14-14 -38Z" fill="#1F3C8A"/><path d="M-6 -34C4 -40 16 -38 20 -28C12 -22 0 -22-6 -34Z" fill="${YEL}"/>${g('translate(-4 -26)', dots)}
    <path d="M10 -96C8 -112 18 -118 22 -110C24 -120 34 -120 34 -110C40 -116 46 -110 40 -100Z" fill="#C8241F"/>
    <path d="M36 -88L50 -84 36 -80Z" fill="${YEL}"/>
    <path d="M32 -80C36 -70 30 -66 26 -72Z" fill="#C8241F"/>
    <circle cx="28" cy="-90" r="3.4" fill="${WHITE}"/><circle cx="29" cy="-90" r="1.7" fill="${INK}"/>
    <path d="M0 2V24M14 2V24M-6 24H8M8 24H22" stroke="${YEL}" stroke-width="3.2" stroke-linecap="round"/>`;
  const r = rng(13); let meadow = '';
  for (let i = 0; i < 30; i++) meadow += `<path d="M${f(r() * 470)} 510q${f((r() - .5) * 20)} -40 ${f((r() - .5) * 10)} ${f(-50 - r() * 40)}" stroke="${i % 3 ? '#4E7A3A' : '#E9B44A'}" stroke-width="2.4" fill="none"/>`;
  for (let i = 0; i < 9; i++) meadow += g(`translate(${f(20 + r() * 420)} ${f(420 + r() * 60)})`, `${flower(10, '#E23A2A', '#E23A2A', 4)}<circle r="3.6" fill="${INK}"/>`);
  for (let i = 0; i < 8; i++) meadow += g(`translate(${f(20 + r() * 420)} ${f(424 + r() * 56)})`, flower(7, '#3C64D8', '#2A3E9A', 8));
  const church = `<path d="M-30 0V-36H30V0Z" fill="#7E2B2E"/><path d="M-36 -34L0 -62 36 -34Z" fill="#6A2226"/><rect x="-12" y="-90" width="24" height="40" fill="#7E2B2E"/><path d="M-16 -88L0 -128 16 -88Z" fill="#6A2226"/><path d="M0 -128V-142M-5 -136H5" stroke="#6A2226" stroke-width="2"/>`;
  return `
    <defs><linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9473A"/><stop offset=".5" stop-color="#F39255"/><stop offset="1" stop-color="#FBD38A"/></linearGradient></defs>
    <rect width="460" height="510" fill="url(#sky-${id})"/>
    <circle cx="330" cy="318" r="74" fill="#FCE3A6" opacity=".9"/>
    <path d="M30 90h60M50 102h40M330 70h70M350 82h40" stroke="#FCE3A6" stroke-width="4" stroke-linecap="round" opacity=".55"/>
    <path d="M-10 320C80 296 200 306 300 300S420 296 470 306V510H-10Z" fill="#B9443A"/>
    ${g('translate(370 306)', church)}
    ${[[250, 312], [290, 306], [430, 304]].map(([x, y]) => g(`translate(${x} ${y})`, `<rect x="-10" y="-14" width="20" height="14" fill="#8E3330"/><path d="M-13 -13L0 -24 13 -13Z" fill="#6A2226"/>`)).join('')}
    <path d="M-10 350C120 330 300 346 470 334V510H-10Z" fill="#D9733F"/>
    <path d="M-10 392C120 376 300 390 470 378V510H-10Z" fill="#9C3B2F"/>
    <path d="M-10 368H470M-10 396H470" stroke="#6B3A24" stroke-width="7"/>
    ${[30, 110, 270, 350, 430].map(x => `<rect x="${x - 5}" y="350" width="10" height="70" fill="#6B3A24"/>`).join('')}
    <rect x="178" y="330" width="16" height="90" fill="#6B3A24"/><rect x="172" y="324" width="28" height="8" fill="#55301E"/>
    ${g('translate(180 300) scale(1.25)', rooster)}
    ${meadow}`;
}

const SCENES = { blueberry: sceneBlueberry, 'potato-cheese': sceneRuskie, 'sauerkraut-mushroom': sceneKapusta, meat: sceneMeat };

// ---------- the plate of pierogi in front of the window ----------

function pierog(seed) {
  let crimp = '', pleats = '';
  for (let i = 0; i <= 13; i++) {
    const a = Math.PI * (1.01 + .98 * i / 13);
    const x = Math.cos(a) * 60, y = 9 + Math.sin(a) * 53;
    const deg = f(a * 180 / Math.PI + 90);
    crimp += `<g transform="translate(${f(x)} ${f(y)}) rotate(${deg})"><path d="M-7.5 2A7.5 7.5 0 0 1 7.5 2Z" fill="${DOUGH}" stroke="${DOUGH_DK}" stroke-width="1.3"/></g>`;
    pleats += `<g transform="translate(${f(x)} ${f(y)}) rotate(${deg})"><path d="M-6 1L-2 9" stroke="${DOUGH_SH}" stroke-width="1.6" stroke-linecap="round"/></g>`;
  }
  const r = rng(seed); let toast = '';
  for (let i = 0; i < 6; i++) toast += `<ellipse cx="${f((r() - .5) * 70)}" cy="${f(-16 + r() * 22)}" rx="${f(4 + r() * 6)}" ry="${f(2 + r() * 3)}" fill="#C98A3E" opacity=".45"/>`;
  return `${crimp}
    <path d="M-60 10C-58 -30-30 -48 0 -48C30 -48 58 -30 60 10C30 22-30 22-60 10Z" fill="${DOUGH}"/>
    ${pleats}
    <path d="M-60 10C-30 22 30 22 60 10C58 -2 54 -10 50 -14C30 2-30 4-58 -4Z" fill="${DOUGH_SH}" opacity=".6"/>
    ${toast}
    <path d="M-34 -30C-20 -40 4 -42 18 -38" stroke="#FFF6DE" stroke-width="6" stroke-linecap="round" fill="none" opacity=".75"/>
    <path d="M-62 10C-30 24 30 24 62 10" stroke="${DOUGH_DK}" stroke-width="2" fill="none"/>
    <path d="M-50 -6C-40 -26-20 -36 0 -37" stroke="${DOUGH_DK}" stroke-width="1" fill="none" opacity=".5"/>`;
}

function garnish(slug) {
  const r = rng(slug.length * 7); let s = '';
  const dill = (x, y, rot) => g(`translate(${x} ${y}) rotate(${rot})`, `<path d="M0 0V-18M0 -6l-6 -6M0 -6l6 -6M0 -12l-5 -5M0 -12l5 -5M0 -18l-3 -4M0 -18l3 -4" stroke="#4F8A3A" stroke-width="1.4" stroke-linecap="round" fill="none"/>`);
  const cream = (x, y) => g(`translate(${x} ${y})`, `<path d="M-14 4C-18 -6-6 -10 0 -16C4 -10 18 -8 14 4C8 8-8 8-14 4Z" fill="${WHITE}"/><path d="M-6 -4C-2 -8 4 -8 6 -4" stroke="#E6DCC6" stroke-width="2" fill="none"/>`);
  if (slug === 'blueberry') {
    for (let i = 0; i < 16; i++) s += g(`translate(${f(-120 + r() * 240)} ${f(-6 + r() * 26)})`, berry(5 + r() * 1.5));
    for (let i = 0; i < 40; i++) s += `<circle cx="${f(-110 + r() * 220)}" cy="${f(-60 + r() * 60)}" r=".9" fill="#FFFFFF" opacity=".9"/>`;
    s += cream(80, -2);
  } else {
    const bits = slug === 'meat' ? ['#8A4A22', '#A65E2C', '#C98A3E'] : ['#C77A23', '#E0A040', '#B8661A'];
    for (let i = 0; i < 26; i++) s += `<path d="M${f(-110 + r() * 220)} ${f(-50 + r() * 64)}q4 -4 8 0" stroke="${bits[i % 3]}" stroke-width="${slug === 'meat' && i % 2 ? 5 : 2.6}" stroke-linecap="round" fill="none"/>`;
    for (let i = 0; i < 6; i++) s += dill(f(-100 + r() * 200), f(-10 + r() * 22), f(-40 + r() * 80));
    if (slug === 'sauerkraut-mushroom') for (let i = 0; i < 5; i++) s += g(`translate(${f(-90 + r() * 180)} ${f(-30 + r() * 30)}) scale(.5)`, `<path d="M-16 0C-14 -20 14 -20 16 0Z" fill="#9A5A32"/><rect x="-5" y="-2" width="10" height="12" fill="#EFE2C4"/>`);
    s += cream(84, 0);
  }
  return s;
}

function plate(fl) {
  let rim = '';
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 2 * i / n, x = Math.cos(a) * 156, y = Math.sin(a) * 50;
    rim += `<g transform="translate(${f(x)} ${f(y)}) scale(1 .6)"><circle r="7.5" fill="${COBALT}"/><circle r="4.4" fill="${WHITE}"/><circle r="2.4" fill="${fl.ground}"/></g>`;
  }
  return `
    <ellipse cx="0" cy="14" rx="176" ry="58" fill="#000" opacity=".28"/>
    <ellipse rx="172" ry="58" fill="${WHITE}"/>
    <ellipse rx="172" ry="58" fill="none" stroke="${COBALT}" stroke-width="3"/>
    ${rim}
    <ellipse rx="134" ry="40" fill="#F1EADB"/>
    <ellipse rx="134" ry="40" fill="none" stroke="${COBALT}" stroke-width="1.6" stroke-dasharray="2 5" stroke-linecap="round"/>
    ${g('translate(-66 -4) rotate(-6)', pierog(1))}
    ${g('translate(62 -2) rotate(7) scale(-1 1)', pierog(2))}
    ${g('translate(0 -36) rotate(2) scale(.96)', pierog(3))}
    ${g('translate(0 -10)', garnish(fl.slug))}`;
}

// ---------- the box ----------

const SERIF = `font-family="'EB Garamond', Georgia, serif"`;
const DISPLAY = `font-family="Fraunces, Georgia, serif"`;

export function boxFront(fl) {
  const id = fl.slug;
  const AX = 70, AY = 154, AW = 460, AH = 510, R = 230, CY = AY + R;  // arch window
  const archD = `M${AX} ${AY + AH}V${CY}A${R} ${R} 0 0 1 ${AX + AW} ${CY}V${AY + AH}Z`;
  const arc = (r, a0, a1) => { const p = a => [f(300 + Math.cos(a * Math.PI / 180) * r), f(CY + Math.sin(a * Math.PI / 180) * r)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}`; };

  // beads around the arch
  let beads = '';
  for (let i = 0; i <= 36; i++) { const a = Math.PI * (1 + i / 36); beads += `<circle cx="${f(300 + Math.cos(a) * 247)}" cy="${f(CY + Math.sin(a) * 247)}" r="${i % 2 ? 1.6 : 2.6}" fill="${FRAME}"/>`; }
  for (let y = CY + 14; y < AY + AH - 4; y += 14) beads += `<circle cx="${AX - 17}" cy="${y}" r="${(y / 14) % 2 < 1 ? 1.6 : 2.6}" fill="${FRAME}"/><circle cx="${AX + AW + 17}" cy="${y}" r="${(y / 14) % 2 < 1 ? 1.6 : 2.6}" fill="${FRAME}"/>`;

  const corner = `<path d="M0 0h18v18" fill="none" stroke="${FRAME}" stroke-width="1.2"/>${g('translate(18 18)', flower(7, FRAME, fl.ground, 8))}`;
  const nameSize = fl.name.length > 16 ? 30 : 38;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t-${id}">
  <title id="t-${id}">Northside Bakery ${fl.name.replace('&', '&amp;')} pierogi box, front: ${fl.scene.toLowerCase()}</title>
  <defs>
    <clipPath id="arch-${id}"><path d="${archD}"/></clipPath>
    <filter id="gouache-${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="3.2"/></filter>
    <filter id="grain-${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" seed="2"/><feColorMatrix values="0 0 0 0 0.12  0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0.55 -0.12"/></filter>
    <path id="arcL-${id}" d="${arc(258, 196, 254)}"/>
    <path id="arcR-${id}" d="${arc(258, 286, 344)}"/>
  </defs>

  <rect width="${W}" height="${H}" fill="${fl.ground}"/>
  <rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" stroke="${FRAME}" stroke-width="1.6"/>
  <rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="none" stroke="${FRAME}" stroke-width=".7"/>
  ${g('translate(20 20)', corner)}${g(`translate(${W - 20} 20) scale(-1 1)`, corner)}
  ${g(`translate(20 ${H - 20}) scale(1 -1)`, corner)}${g(`translate(${W - 20} ${H - 20}) scale(-1 -1)`, corner)}

  <text ${SERIF} font-weight="600" font-size="10.5" letter-spacing="2.6" fill="${FRAME}"><textPath href="#arcL-${id}" startOffset="50%" text-anchor="middle">RĘCZNIE ROBIONE · HANDMADE</textPath></text>
  <text ${SERIF} font-weight="600" font-size="10.5" letter-spacing="2.6" fill="${FRAME}"><textPath href="#arcR-${id}" startOffset="50%" text-anchor="middle">BROOKLYN · SINCE 1992</textPath></text>
  ${beads}

  <!-- the painting -->
  <path d="${archD}" fill="${FRAME}" stroke="${FRAME}" stroke-width="22" stroke-linejoin="round"/>
  <path d="${archD}" fill="none" stroke="${fl.deep}" stroke-width="1.4" transform="translate(0 0)"/>
  <g clip-path="url(#arch-${id})"><g filter="url(#gouache-${id})" transform="translate(${AX} ${AY})">${SCENES[id](id)}</g></g>
  <path d="${archD}" fill="none" stroke="${fl.deep}" stroke-width="2"/>

  <!-- logo medallion breaking the top of the arch -->
  <circle cx="300" cy="${AY + 6}" r="70" fill="${fl.ground}"/>
  <circle cx="300" cy="${AY + 6}" r="64" fill="${FRAME}"/>
  <circle cx="300" cy="${AY + 6}" r="58" fill="none" stroke="${fl.ground}" stroke-width="1.2" stroke-dasharray="1 4.2" stroke-linecap="round"/>
  <image href="data:image/png;base64,${logo}" x="242" y="${AY - 34}" width="116" height="80.4"/>

  <!-- plate breaking the bottom of the arch -->
  <g transform="translate(300 ${AY + AH + 22})">${plate(fl)}</g>

  <!-- the words -->
  <text x="300" y="790" text-anchor="middle" fill="${fl.light}" ${DISPLAY} font-style="italic" font-weight="500" font-size="${nameSize}" style="font-variation-settings:'opsz' 144,'SOFT' 100,'WONK' 1">${fl.name.replace('&', '&amp;')}</text>
  <text x="300" y="872" text-anchor="middle" fill="${FRAME}" ${DISPLAY} font-weight="640" font-size="96" letter-spacing="-2" style="font-variation-settings:'opsz' 144,'SOFT' 100,'WONK' 1">Pierogi</text>
  <g transform="translate(300 894)"><path d="M-130 0H-16M16 0H130" stroke="${fl.light}" stroke-width="1"/>${g('', flower(6, fl.light, fl.ground, 6))}</g>
  <text x="300" y="922" text-anchor="middle" fill="${fl.light}" ${SERIF} font-style="italic" font-size="21">${fl.polish}</text>
  <text text-anchor="middle" fill="${FRAME}" ${SERIF} font-size="15"><tspan x="300" y="945">${fl.text[0]}</tspan><tspan x="300" y="963">${fl.text[1]}</tspan></text>
  <text x="52" y="968" fill="${FRAME}" ${SERIF} font-weight="600" font-size="9" letter-spacing="1.6">12 PIEROGI</text>
  <text x="52" y="954" fill="${FRAME}" ${SERIF} font-weight="600" font-size="9" letter-spacing="1.6">NET WT 00 OZ (000 G)</text>
  <text x="548" y="954" text-anchor="end" fill="${FRAME}" ${SERIF} font-weight="600" font-size="9" letter-spacing="1.6">KEEP FROZEN</text>
  <text x="548" y="968" text-anchor="end" fill="${FRAME}" ${SERIF} font-weight="600" font-size="9" letter-spacing="1.6">149 N 8TH ST</text>

  <rect width="${W}" height="${H}" filter="url(#grain-${id})" style="mix-blend-mode:multiply" opacity=".55"/>
</svg>`;
}

// ---------- preview page ----------

const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,9..144,100..900,0..100,0..1&family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap';
export { FONTS };

function previewPage() {
  const cards = FLAVORS.map(fl => `
      <figure class="box">
        <div class="art">${boxFront(fl).replace(/ width="600" height="1000"/, '')}</div>
        <figcaption><span class="chip" style="background:${fl.ground}"></span><span><strong>${fl.name}</strong><em>${fl.scene}</em></span></figcaption>
      </figure>`).join('');
  return `<title>Northside Pierogi Boxes</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet">
<style>
  /* One look on purpose: art-print boxes laid out on warm linen. */
  :root {
    --linen: #EFE4D0; --linen-2: #E6D8BF; --ink: #2B1D1E; --muted: #6B5A4E; --rule: #CDBB9C; --accent: #9A1B1F;
    --display: Fraunces, Georgia, serif; --body: "EB Garamond", Georgia, serif;
    color-scheme: light;
  }
  * { box-sizing: border-box; }
  body { background: var(--linen); color: var(--ink); font: 400 19px/1.55 var(--body); margin: 0; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 1240px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  header { padding-block: clamp(36px, 6vw, 72px) clamp(24px, 4vw, 44px); display: grid; gap: 14px; }
  .eyebrow { font-weight: 600; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin: 0; }
  h1 { font-family: var(--display); font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1; font-weight: 600; font-size: clamp(42px, 7vw, 84px); line-height: .95; letter-spacing: -.025em; margin: 0; text-wrap: balance; }
  h1 em { font-weight: 400; color: var(--accent); }
  .lede { max-width: 60ch; margin: 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: clamp(20px, 3vw, 36px); padding-block: 8px 56px; }
  .box { margin: 0; display: grid; gap: 14px; align-content: start; }
  .art { border-radius: 3px; overflow: hidden; box-shadow: 0 1px 2px rgba(43,29,30,.2), 0 24px 40px -20px rgba(43,29,30,.55); transition: transform .4s cubic-bezier(.2,.7,.2,1); }
  .box:hover .art { transform: translateY(-6px) rotate(-.6deg); }
  @media (prefers-reduced-motion: reduce) { .art { transition: none; } .box:hover .art { transform: none; } }
  .art svg { display: block; width: 100%; height: auto; }
  figcaption { display: flex; gap: 10px; align-items: flex-start; font-size: 17px; line-height: 1.3; }
  figcaption strong { display: block; font-family: var(--display); font-weight: 600; }
  figcaption em { color: var(--muted); }
  .chip { flex: none; width: 14px; height: 14px; border-radius: 50%; margin-top: 4px; }
  section.notes { border-top: 1px solid var(--rule); padding-block: 40px 64px; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 36px; }
  h2 { font-family: var(--display); font-weight: 600; font-size: 26px; margin: 0 0 10px; letter-spacing: -.01em; }
  ul { margin: 0; padding-left: 1.1em; display: grid; gap: 8px; }
  li { min-width: 0; }
  li b { font-weight: 600; }
</style>

<header class="wrap">
  <p class="eyebrow">Northside Bakery · frozen pierogi · box fronts, 6 × 10 in</p>
  <h1>Four boxes, <em>four paintings</em></h1>
  <p class="lede">Each filling has its own painted Polish folk scene in an arched window, with a plate of pierogi on Bolesławiec stoneware in front. They're made like art prints you'd want to keep, and each box has its own bold color so the four look good together on a shelf or in a freezer door.</p>
</header>

<main class="wrap">
  <div class="grid">${cards}
  </div>

  <section class="notes">
    <div>
      <h2>Folk details in the paintings</h2>
      <ul>
        <li><b>Blueberry:</b> a girl in a Łowicz striped skirt, coral beads (<i>korale</i>) and a flower wreath with ribbons, picking <i>jagody</i> under a crescent moon.</li>
        <li><b>Potato &amp; Cheese:</b> a Zalipie cottage painted with flowers, a stork nesting on the chimney, a smiling folk sun over flowering potato rows.</li>
        <li><b>Sauerkraut &amp; Mushroom:</b> birch and spruce forest in autumn, cabbages, porcini and chanterelles, and a hedgehog carrying a mushroom.</li>
        <li><b>Meat:</b> a Wycinanki-style rooster on a fence at sunset, a wooden village church, poppies, cornflowers and rye.</li>
      </ul>
    </div>
    <div>
      <h2>Before it goes to print</h2>
      <ul>
        <li><b>Net weight</b> reads "00 oz (000 g)". Put in the real weight. US labels need it on the front.</li>
        <li><b>Logo</b> is the small screen PNG. Swap in the vector original for print.</li>
        <li><b>Box colors</b> (rose, teal, burgundy, cobalt) go beyond the red-and-cream brand guide. Add them to the guide as a packaging palette if you keep them.</li>
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
  for (const fl of FLAVORS) writeFileSync(new URL(`pierogi-${fl.slug}.svg`, out), boxFront(fl));
  writeFileSync(new URL('index.html', out), previewPage());
  console.log(`Wrote ${FLAVORS.length} box fronts to packaging/`);
}
