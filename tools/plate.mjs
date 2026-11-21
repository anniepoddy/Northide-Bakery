// A Bolesławiec stoneware plate seen from above, for putting pierogi on.
// Cobalt "sponge-stamped" decoration on cream glaze: a blue edge, a ring of
// peacock eyes (pawie oczko) with green hearts, little daisies, a lace border,
// and an open glazed well in the middle for the food.
//
// Run from the project folder:  node tools/plate.mjs
// Writes packaging/plate/boleslawiec-plate.svg (empty plate)
// and packaging/plate/boleslawiec-plate-pierogi.svg (with three pierogi).

import { writeFileSync, mkdirSync } from 'node:fs';
import { pierog, garnish } from './packaging.mjs';

const S = 1000, CX = 500, CY = 500;
const COBALT = '#1B2F86', COBALT_LT = '#4F6FC4', GREEN = '#6E9A34', GLAZE = '#F8F4EA', GLAZE_SH = '#E6DFCF';
const f = n => +(+n).toFixed(2);
const at = (r, a) => [f(CX + Math.cos(a) * r), f(CY + Math.sin(a) * r)];
const TAU = Math.PI * 2;

// Peacock eye: fringe of stamped ticks, cobalt disk, white ring, green heart, blue pupil.
function peacockEye(x, y, rot) {
  let s = '';
  for (let i = 0; i < 30; i++) {
    const a = TAU * i / 30;
    s += `<path d="M${f(Math.cos(a) * 30)} ${f(Math.sin(a) * 30)}L${f(Math.cos(a) * 42)} ${f(Math.sin(a) * 42)}" stroke="${COBALT}" stroke-width="3.4" stroke-linecap="round"/>`;
  }
  s += `<circle r="29" fill="${COBALT}"/><circle r="19" fill="${GLAZE}"/><circle r="13.5" fill="${GREEN}"/><circle r="6.5" fill="${COBALT}"/><circle cx="-2" cy="-2" r="2" fill="${COBALT_LT}"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot})">${s}</g>`;
}

// Five-petal stamped daisy.
function daisy(x, y, r, rot = 0) {
  let s = '';
  for (let i = 0; i < 5; i++) s += `<ellipse cy="${f(-r * .58)}" rx="${f(r * .32)}" ry="${f(r * .5)}" fill="${COBALT}" transform="rotate(${i * 72})"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot})">${s}<circle r="${f(r * .22)}" fill="${GLAZE}"/><circle r="${f(r * .1)}" fill="${COBALT}"/></g>`;
}

// Little sprig: a curved stem with teardrop leaves, pointing toward the center.
function sprig(x, y, deg) {
  const leaf = (lx, ly, a, c) => `<path d="M0 0C5 -6 5 -16 0 -22C-5 -16-5 -6 0 0Z" fill="${c}" transform="translate(${lx} ${ly}) rotate(${a})"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${deg})">
    <path d="M0 0C4 -14 2 -28-4 -40" stroke="${COBALT}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    ${leaf(0, -10, -55, GREEN)}${leaf(2, -18, 50, GREEN)}${leaf(-2, -28, -45, COBALT)}${leaf(-4, -40, 10, COBALT)}
  </g>`;
}

export function plateSVG({ withPierogi = false } = {}) {
  let deco = '';
  // blue edge and a dotted rope just inside it
  deco += `<circle cx="${CX}" cy="${CY}" r="461" fill="none" stroke="${COBALT}" stroke-width="18"/>`;
  deco += `<circle cx="${CX}" cy="${CY}" r="450" fill="none" stroke="${COBALT_LT}" stroke-width="3"/>`;
  deco += `<circle cx="${CX}" cy="${CY}" r="360" fill="none" stroke="${COBALT}" stroke-width="4"/>`;
  for (let i = 0; i < 96; i++) { const [x, y] = at(437, TAU * i / 96); deco += `<circle cx="${x}" cy="${y}" r="${i % 2 ? 2.6 : 4.4}" fill="${COBALT}"/>`; }

  // ring of peacock eyes with daisies between them
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = TAU * i / N - Math.PI / 2;
    const [x, y] = at(392, a);
    deco += peacockEye(x, y, f(a * 180 / Math.PI));
    for (const d of [-0.11, 0.11]) { const [px, py] = at(352 + 8, a + d); deco += `<circle cx="${px}" cy="${py}" r="2.6" fill="${COBALT}"/>`; }
    const a2 = a + Math.PI / N;
    const [dx, dy] = at(398, a2);
    deco += daisy(dx, dy, 17, f(a2 * 180 / Math.PI));
    const [ex, ey] = at(420, a2), [fx, fy] = at(374, a2);
    deco += `<circle cx="${ex}" cy="${ey}" r="3.4" fill="${COBALT}"/><circle cx="${fx}" cy="${fy}" r="3.4" fill="${COBALT}"/>`;
  }

  // lace border pointing into the well: scallops, each with a dot under it
  const L = 56;
  for (let i = 0; i < L; i++) {
    const a = TAU * i / L, [x, y] = at(346, a);
    const deg = f(a * 180 / Math.PI + 90);
    deco += `<g transform="translate(${x} ${y}) rotate(${deg})"><path d="M-17 0A17 17 0 0 0 17 0Z" fill="${COBALT}"/><circle cy="7" r="2.6" fill="${GLAZE}"/><circle cy="27" r="3" fill="${COBALT}"/></g>`;
  }

  // sprigs and tiny dots around the well, where they peek out from under food
  for (let i = 0; i < 12; i++) {
    const a = TAU * (i + .5) / 12, [x, y] = at(296, a);
    deco += sprig(x, y, f(a * 180 / Math.PI - 90));
  }
  for (let i = 0; i < 72; i++) { const [x, y] = at(262, TAU * i / 72); deco += `<circle cx="${x}" cy="${y}" r="1.9" fill="${COBALT_LT}"/>`; }

  const food = withPierogi ? `
    <g transform="translate(${CX} ${CY + 18}) scale(2.35)">
      <ellipse cx="0" cy="22" rx="120" ry="26" fill="#3A2A14" opacity=".12" filter="url(#soft)"/>
      <g transform="translate(-46 4) rotate(-14)">${pierog(1)}</g>
      <g transform="translate(46 8) rotate(12) scale(-1 1)">${pierog(2)}</g>
      <g transform="translate(0 -38) rotate(3) scale(.98)">${pierog(3)}</g>
      <g transform="translate(0 -8) scale(.82)">${garnish('potato-cheese')}</g>
    </g>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <title>Bolesławiec plate${withPierogi ? ' with pierogi' : ''}</title>
  <defs>
    <radialGradient id="glaze" cx="44%" cy="40%" r="62%"><stop offset="0" stop-color="#FFFDF6"/><stop offset=".7" stop-color="${GLAZE}"/><stop offset="1" stop-color="${GLAZE_SH}"/></radialGradient>
    <radialGradient id="well" cx="46%" cy="42%" r="58%"><stop offset="0" stop-color="#FFFDF7"/><stop offset=".8" stop-color="${GLAZE}"/><stop offset="1" stop-color="#E9E2D2"/></radialGradient>
    <radialGradient id="gloss" cx="30%" cy="22%" r="40%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <!-- sponge stamp: speckles knocked out of the blue, slightly uneven edges -->
    <filter id="sponge" x="-2%" y="-2%" width="104%" height="104%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="8" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  6 0 0 0 -1.25" result="m"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="2" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="2.4" result="d"/>
      <feComposite in="d" in2="m" operator="in"/>
    </filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>

  <ellipse cx="${CX + 10}" cy="${CY + 22}" rx="478" ry="476" fill="#2B1D1E" opacity=".22" filter="url(#soft)"/>
  <circle cx="${CX}" cy="${CY}" r="470" fill="url(#glaze)"/>
  <circle cx="${CX}" cy="${CY}" r="358" fill="url(#well)"/>
  <circle cx="${CX}" cy="${CY}" r="358" fill="none" stroke="#D9D0BC" stroke-width="3" opacity=".7"/>
  <g filter="url(#sponge)">${deco}</g>
  <circle cx="${CX}" cy="${CY}" r="470" fill="url(#gloss)"/>
  <path d="M${at(448, Math.PI * 1.08).join(' ')}A448 448 0 0 1 ${at(448, Math.PI * 1.42).join(' ')}" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".45"/>
  ${food}
</svg>`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = new URL('../packaging/plate/', import.meta.url);
  mkdirSync(out, { recursive: true });
  writeFileSync(new URL('boleslawiec-plate.svg', out), plateSVG());
  writeFileSync(new URL('boleslawiec-plate-pierogi.svg', out), plateSVG({ withPierogi: true }));
  console.log('Wrote packaging/plate/');
}
