// Draws the engraved-style ink drawings used around the hero, in the style of the white paper bag:
// fine outlines, hatched and cross-hatched shading, stippled flour and crumb.
//
//   node tools/engrave.mjs
//
// Writes images/engravings/<name>.svg. The site colors them with CSS (they are used as masks),
// so the black here never shows. Change a drawing below and run the script again.

import fs from 'node:fs';
import path from 'node:path';

const OUT = 'images/engravings';
const f = (n) => +n.toFixed(1);

// ---------- Helpers ----------
let defs = [];
let uid = 0;
// Each drawing also sets `fill`: its solid silhouette, written to <name>-fill.svg.
// The site paints the silhouette in paper color under the drawing, so overlapping drawings hide each other like on the bag.
let fill = '';
let rand = () => 0;

function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const boxes = new Map();
const E = (cx, cy, rx, ry) => {
  const d = `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;
  boxes.set(d, [cx - rx, cy - ry, cx + rx, cy + ry]);
  return d;
};

function clip(d) {
  const id = `c${++uid}`;
  defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
  return id;
}

// Hides everything under shapes already drawn in front (masks can't paint white, so we cut instead)
function behind(frontMarkup) {
  const id = `m${++uid}`;
  defs.push(`<mask id="${id}" maskUnits="userSpaceOnUse" x="-60" y="-60" width="320" height="320"><rect x="-60" y="-60" width="320" height="320" fill="#fff"/><g fill="#000" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${frontMarkup}</g></mask>`);
  return id;
}

function hatch(angle, spacing, sw, wobble = 0, box = [-40, -40, 240, 240]) {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad), dy = Math.sin(rad), nx = -dy, ny = dx;
  const mx = (box[0] + box[2]) / 2, my = (box[1] + box[3]) / 2, half = Math.hypot(box[2] - box[0], box[3] - box[1]) / 2 + 2;
  let d = '';
  for (let o = -half; o <= half; o += spacing) {
    const cx = mx + nx * o, cy = my + ny * o;
    const w = wobble ? (rand() - 0.5) * wobble : 0;
    d += `M${f(cx - dx * half)} ${f(cy - dy * half)}Q${f(cx + nx * w)} ${f(cy + ny * w)} ${f(cx + dx * half)} ${f(cy + dy * half)}`;
  }
  return `<path d="${d}" stroke-width="${sw}"/>`;
}

// Shading: hatch lines inside the shape, only where the shadow region is
function shade(shapeD, regionD, { angle = 35, spacing = 3.2, sw = 0.8, cross, crossRegion, wobble = 3 } = {}) {
  const a = clip(shapeD), b = clip(regionD);
  const box = boxes.get(regionD) || boxes.get(shapeD);
  let out = `<g clip-path="url(#${a})"><g clip-path="url(#${b})">${hatch(angle, spacing, sw, wobble, box)}</g>`;
  if (cross) {
    const c = clip(crossRegion || regionD);
    out += `<g clip-path="url(#${c})">${hatch(cross, spacing * 1.1, sw * 0.9, wobble, boxes.get(crossRegion || regionD) || box)}</g>`;
  }
  return out + '</g>';
}

// Stipple dots inside shape ∩ region; box = [x0, y0, x1, y1] to scatter in
function dots(shapeD, regionD, n, box, r0 = 0.45, r1 = 0.95) {
  const a = clip(shapeD), b = clip(regionD);
  let c = '';
  for (let i = 0; i < n; i++) {
    const x = box[0] + rand() * (box[2] - box[0]), y = box[1] + rand() * (box[3] - box[1]);
    c += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r0 + rand() * (r1 - r0))}"/>`;
  }
  return `<g clip-path="url(#${a})"><g clip-path="url(#${b})"><g fill="#000" stroke="none">${c}</g></g></g>`;
}

const line = (d, sw = 1.3) => `<path d="${d}" stroke-width="${sw}"/>`;
const outline = (d, sw = 2.1) => line(d, sw);

// A lens (slash or score) between two points, bulging by h
function lens(x1, y1, x2, y2, h) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
  const nx = -dy / L, ny = dx / L;
  return `M${f(x1)} ${f(y1)}Q${f(mx + nx * h)} ${f(my + ny * h)} ${f(x2)} ${f(y2)}Q${f(mx + nx * h * 0.25)} ${f(my + ny * h * 0.25)} ${f(x1)} ${f(y1)}Z`;
}

function crumbs(n, box, r0 = 0.8, r1 = 2.2) {
  let c = '';
  for (let i = 0; i < n; i++) {
    const x = box[0] + rand() * (box[2] - box[0]), y = box[1] + rand() * (box[3] - box[1]);
    c += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r0 + rand() * (r1 - r0))}" ry="${f(r0 * 0.7 + rand() * (r1 - r0) * 0.6)}" transform="rotate(${f(rand() * 180)} ${f(x)} ${f(y)})"/>`;
  }
  return `<g fill="#000" stroke="none">${c}</g>`;
}

// ---------- Drawings ----------
const drawings = {
  boule: ['Round loaf', 3, () => {
    const s = 'M22 114C22 72 58 46 100 46S178 72 178 114C178 148 144 168 100 168S22 148 22 114Z';
    const scores = [lens(46, 104, 150, 70, -16), lens(42, 128, 160, 96, -16), lens(56, 150, 162, 122, -14)];
    let o = shade(s, E(136, 160, 96, 54), { angle: 28, spacing: 3, cross: -40, crossRegion: E(146, 176, 80, 36) });
    o += dots(s, E(84, 74, 70, 34), 90, [22, 40, 160, 120], 0.4, 0.85);
    for (const sc of scores) o += shade(sc, sc, { angle: -60, spacing: 2.2, sw: 0.75 }) + outline(sc, 1.5);
    o += outline(s) + line('M36 152C70 174 130 176 166 152', 1.1);
    fill = `<path d="${s}"/>`;
    return o;
  }],

  batard: ['Oval loaf', 7, () => {
    const s = 'M12 100C12 70 56 58 100 58S188 70 188 100 146 142 100 142 12 130 12 100Z';
    let o = shade(s, E(110, 140, 110, 34), { angle: 20, spacing: 3, cross: -45, crossRegion: E(110, 150, 96, 20) });
    o += dots(s, E(90, 74, 90, 22), 70, [12, 56, 188, 100]);
    for (let i = 0; i < 4; i++) {
      const x = 44 + i * 34;
      const sc = lens(x - 14, 116, x + 20, 76, 10);
      o += shade(sc, sc, { angle: 70, spacing: 2.2, sw: 0.75 }) + outline(sc, 1.4);
    }
    fill = `<path d="${s}" transform="rotate(-16 100 100)"/>`;
    return `<g transform="rotate(-16 100 100)">${o}${outline(s)}</g>`;
  }],

  baguette: ['Baguette', 11, () => {
    const s = 'M6 100C6 86 34 82 100 82S194 86 194 100 168 118 100 118 6 114 6 100Z';
    let o = shade(s, E(100, 120, 104, 16), { angle: 15, spacing: 2.8, cross: -50, crossRegion: E(100, 124, 96, 9) });
    o += dots(s, E(100, 88, 96, 8), 50, [6, 80, 194, 100], 0.35, 0.7);
    for (let i = 0; i < 5; i++) {
      const x = 34 + i * 31;
      const sc = lens(x - 14, 108, x + 18, 90, 6);
      o += shade(sc, sc, { angle: 75, spacing: 2, sw: 0.7 }) + outline(sc, 1.3);
    }
    fill = `<path d="${s}" transform="rotate(-24 100 100)"/>`;
    return `<g transform="rotate(-24 100 100)">${o}${outline(s, 2)}</g>`;
  }],

  croissant: ['Croissant', 5, () => {
    // Segments front (middle) to back (tips)
    const segs = [[100, 98, 23, 37, 0], [77, 101, 21, 33, -12], [123, 101, 21, 33, 12], [56, 109, 17, 26, -28], [144, 109, 17, 26, 28], [39, 122, 12, 17, -48], [161, 122, 12, 17, 48]];
    let front = '', o = '';
    for (const [cx, cy, rx, ry, r] of segs) {
      const t = `rotate(${r} ${cx} ${cy})`;
      const d = E(cx, cy, rx, ry);
      let g = shade(d, E(cx + rx * 0.5, cy + ry * 0.6, rx * 1.1, ry * 0.8), { angle: 20, spacing: 2.8, cross: -50, crossRegion: E(cx + rx * 0.6, cy + ry * 0.9, rx, ry * 0.45) });
      const c = clip(d);
      let ridges = '';
      for (const k of [-0.55, -0.2, 0.2, 0.55]) ridges += `M${f(cx + rx * k)} ${f(cy - ry)}Q${f(cx + rx * k * 1.5)} ${cy} ${f(cx + rx * k)} ${f(cy + ry)}`;
      g += `<g clip-path="url(#${c})">${line(ridges, 1)}</g>` + outline(d, 1.9);
      o += front ? `<g mask="url(#${behind(front)})"><g transform="${t}">${g}</g></g>` : `<g transform="${t}">${g}</g>`;
      front += `<path d="${d}" transform="${t}"/>`;
    }
    fill = `<g transform="rotate(-14 100 110) translate(100 105) scale(1.18) translate(-100 -105)">${front}</g>`;
    return `<g transform="rotate(-14 100 110) translate(100 105) scale(1.18) translate(-100 -105)">${o}</g>`;
  }],

  pretzel: ['Pretzel', 13, () => {
    const P = 'M100 162C30 162 12 104 32 72C54 38 104 44 100 98M100 162C170 162 188 104 168 72C146 38 96 44 100 98M100 98C96 124 70 144 52 164M100 98C104 124 130 144 148 164';
    const core = behind(`<path d="${P}" fill="none" stroke-width="17"/>`);
    const inside = `p${++uid}`;
    defs.push(`<mask id="${inside}" maskUnits="userSpaceOnUse" x="-60" y="-60" width="320" height="320"><path d="${P}" fill="none" stroke="#fff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/></mask>`);
    const lower = clip(E(110, 150, 110, 60));
    let o = `<g mask="url(#${core})"><path d="${P}" stroke-width="22"/></g>`;
    o += `<g mask="url(#${inside})"><g clip-path="url(#${lower})">${hatch(30, 2.8, 0.8, 3)}</g>${hatch(-45, 6, 0.6, 2)}</g>`;
    let salt = '';
    for (let i = 0; i < 26; i++) {
      const t = rand();
      const x = 40 + rand() * 120, y = 50 + rand() * 105;
      salt += `<rect x="${f(x)}" y="${f(y)}" width="2.4" height="1.8" transform="rotate(${f(t * 90)} ${f(x)} ${f(y)})"/>`;
    }
    o += `<g mask="url(#${inside})"><g fill="#000" stroke="none">${salt}</g></g>`;
    fill = `<path d="${P}" fill="none" stroke="#000" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>`;
    return o;
  }],

  whisk: ['Whisk', 17, () => {
    let o = '';
    for (const w of [8, 20, 32, 44]) o += line(`M96 122C${100 - w} 92 ${100 - w} 34 100 22C${100 + w} 34 ${100 + w} 92 104 122`, 1.4);
    o += line('M100 22L100 122', 1.2);
    const h = 'M92 124L108 124L106 192Q100 198 94 192Z';
    o += shade(h, 'M100 120H120V200H100Z', { angle: 80, spacing: 2.2, sw: 0.7 }) + outline(h, 1.8);
    o += line('M90 124H110', 2.4) + line('M95 180H105M95 186H105', 0.8);
    fill = `<g transform="rotate(-28 100 110)"><path d="M95 123C54 92 54 34 100 21C146 34 146 92 105 123Z"/><path d="${h}"/></g>`;
    return `<g transform="rotate(-28 100 110)">${o}</g>`;
  }],

  wheat: ['Wheat', 19, () => {
    let front = '', o = '';
    const grains = [];
    for (let i = 0; i < 7; i++) {
      const y = 50 + i * 15;
      grains.push([86, y, -1], [114, y + 7, 1]);
    }
    grains.push([100, 40, 0]);
    for (const [x, y, side] of grains) {
      const r = side * 32;
      const d = E(x, y, 7.5, 12);
      const t = `rotate(${r} ${x} ${y})`;
      let g = shade(d, E(x + 4, y + 4, 6, 10), { angle: 30, spacing: 1.8, sw: 0.6, wobble: 0 }) + outline(d, 1.3) + line(`M${x} ${y - 9}Q${x + 2} ${y} ${x} ${y + 9}`, 0.7);
      g += line(`M${x} ${y - 12}L${x} ${y - 46}`, 0.7);
      o += front ? `<g mask="url(#${behind(front)})"><g transform="${t}">${g}</g></g>` : `<g transform="${t}">${g}</g>`;
      front += `<path d="${d}" transform="${t}"/>`;
    }
    o += `<g mask="url(#${behind(front)})">${line('M100 52Q98 130 104 196', 1.5)}</g>`;
    fill = `<g transform="rotate(24 100 110)">${front}<path d="M100 52Q98 130 104 196" fill="none" stroke="#000" stroke-width="4"/></g>`;
    return `<g transform="rotate(24 100 110)">${o}</g>`;
  }],

  'rolling-pin': ['Rolling pin', 23, () => {
    const body = 'M44 82H156Q162 100 156 118H44Q38 100 44 82Z';
    let o = shade(body, 'M30 104H170V130H30Z', { angle: 8, spacing: 2.4, cross: -60, crossRegion: 'M30 112H170V130H30Z' });
    o += line('M50 90Q100 88 150 91M54 96Q110 95 148 97', 0.6) + outline(body, 1.9);
    for (const [x1, x2] of [[10, 40], [160, 190]]) {
      const hd = `M${x1} 94Q${x1 - 4} 100 ${x1} 106H${x2}V94Z`;
      o += shade(hd, `M${x1 - 6} 101H${x2 + 6}V110H${x1 - 6}Z`, { angle: 10, spacing: 1.8, sw: 0.6, wobble: 0 }) + outline(hd, 1.6);
    }
    fill = `<g transform="rotate(-32 100 100)"><path d="${body}"/><path d="M8 93H192V107H8Z"/></g>`;
    return `<g transform="rotate(-32 100 100)">${o}</g>`;
  }],

  egg: ['Egg', 29, () => {
    const s = 'M100 38C138 38 158 92 158 122C158 154 132 172 100 172C68 172 42 154 42 122C42 92 62 38 100 38Z';
    let o = dots(s, E(132, 140, 70, 60), 520, [42, 38, 158, 172], 0.4, 0.9);
    o += shade(s, E(144, 156, 50, 40), { angle: 40, spacing: 2.8, sw: 0.6 });
    fill = `<path d="${s}"/>`;
    return o + outline(s, 1.9);
  }],

  toast: ['Slice of bread', 31, () => {
    const s = 'M42 178L42 94C20 90 18 52 48 40C70 30 88 44 100 44C112 44 130 30 152 40C182 52 180 90 158 94L158 178Z';
    const inner = 'M52 170L52 88C34 84 32 58 54 50C72 42 88 54 100 54C112 54 128 42 146 50C168 58 166 84 148 88L148 170Z';
    let o = shade(s, 'M150 30H200V200H150ZM30 165H200V200H30Z', { angle: 60, spacing: 2.4 });
    const ci = clip(inner);
    o += `<g clip-path="url(#${ci})">${crumbs(70, [52, 50, 148, 170])}</g>`;
    o += dots(inner, E(140, 150, 60, 60), 160, [52, 50, 148, 170], 0.35, 0.75);
    fill = `<path d="${s}"/>`;
    return o + outline(s, 2) + outline(inner, 1.2);
  }],

  rosemary: ['Rosemary', 37, () => {
    let o = line('M40 178Q90 110 160 26', 1.5);
    for (let i = 0; i < 16; i++) {
      const t = i / 16;
      const x = 40 + t * 120 - Math.sin(t * 3) * 6, y = 178 - t * 152;
      const side = i % 2 ? 1 : -1;
      const ang = -50 + side * 55;
      const len = 26 - t * 10;
      const ex = x + Math.cos((ang * Math.PI) / 180) * len, ey = y + Math.sin((ang * Math.PI) / 180) * len;
      const leaf = lens(x, y, ex, ey, side * 5);
      o += outline(leaf, 1.1) + line(`M${f(x)} ${f(y)}L${f(ex)} ${f(ey)}`, 0.5);
    }
    return o;
  }],

  seeds: ['Seeds', 41, () => {
    let o = '';
    for (let i = 0; i < 16; i++) {
      const x = 20 + rand() * 160, y = 20 + rand() * 160, r = rand() * 180;
      o += rand() > 0.4
        ? `<g transform="rotate(${f(r)} ${f(x)} ${f(y)})">${outline(E(x, y, 3.2, 6), 1)}${line(`M${f(x)} ${f(y - 4)}L${f(x)} ${f(y + 4)}`, 0.5)}</g>`
        : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.8 + rand() * 1.4)}" fill="#000" stroke="none"/>`;
    }
    return o;
  }],

  'hand-pie': ['Hand pie', 43, () => {
    const s = 'M18 136C18 74 58 44 100 44S182 74 182 136Z';
    let o = shade(s, E(130, 150, 100, 50), { angle: 25, spacing: 2.8, cross: -40, crossRegion: E(140, 150, 70, 24) });
    o += dots(s, E(80, 70, 70, 30), 60, [18, 44, 182, 136]);
    // Crimped edge along the curve
    const pt = (a, k) => [100 + Math.cos(a) * 82 * k, 136 + Math.sin(a) * 92 * k];
    let crimp = '', N = 16;
    for (let i = 0; i < N; i++) {
      const a0 = Math.PI + (i / N) * Math.PI, a1 = Math.PI + ((i + 1) / N) * Math.PI, am = (a0 + a1) / 2;
      const [x0, y0] = pt(a0, 0.86), [x1, y1] = pt(a1, 0.86), [cx, cy] = pt(am, 1.02);
      crimp += `M${f(x0)} ${f(y0)}Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)}`;
      const [tx, ty] = pt(am, 0.95), [ux, uy] = pt(am, 0.88);
      crimp += `M${f(tx)} ${f(ty)}L${f(ux)} ${f(uy)}`;
    }
    o += line(crimp, 1.2);
    o += line('M76 96Q86 90 92 98M100 86Q110 80 116 88M118 108Q128 102 134 110', 1.3);
    fill = `<path d="${s}" stroke="#000" stroke-width="8" stroke-linejoin="round"/>`;
    return o + outline(s, 2) + line('M22 142C70 150 130 150 178 142', 1);
  }],
};

fs.mkdirSync(OUT, { recursive: true });
for (const [name, [title, seed, draw]] of Object.entries(drawings)) {
  defs = [];
  fill = '';
  rand = seeded(seed * 9973);
  const body = draw();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<title>${title}</title>
<defs><filter id="hand"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="1.2"/></filter>${defs.join('')}</defs>
<g filter="url(#hand)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">${body}</g>
</svg>
`;
  fs.writeFileSync(path.join(OUT, `${name}.svg`), svg);
  if (fill) fs.writeFileSync(path.join(OUT, `${name}-fill.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g fill="#000" stroke="#000" stroke-width="3" stroke-linejoin="round">${fill}</g></svg>
`);
  console.log('ok', name, (svg.length / 1024).toFixed(1) + ' KB', fill ? '+ fill' : '');
}
