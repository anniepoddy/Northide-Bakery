// Renders the pierogi bag to print PDFs and preview PNGs.
// Run from the repo root:  node packaging/pierogi-bag/render.mjs [flavor]
// Needs Playwright (cd tools && npm install playwright, then npx playwright install chromium).
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const flavor = process.argv[2] || 'ruskie';
const out = join(here, 'out');
mkdirSync(out, { recursive: true });
const url = (q) => pathToFileURL(join(here, 'bag.html')).href + `?flavor=${flavor}${q}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 1000 }, deviceScaleFactor: 2 });

async function load(q) {
  await page.goto(url(q), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
}

// Print file: clear window left empty, no guides
await load('&print=1');
await page.pdf({ path: join(out, `pierogi-${flavor}-print.pdf`), width: '8.25in', height: '10.25in', printBackground: true, preferCSSPageSize: true });

// Proof with guides
await load('&print=1&guides=1');
await page.pdf({ path: join(out, `pierogi-${flavor}-proof-guides.pdf`), width: '8.25in', height: '10.25in', printBackground: true, preferCSSPageSize: true });
const proof = await page.$$('.sheet');
await proof[0].screenshot({ path: join(out, `pierogi-${flavor}-front-guides.png`) });
await proof[1].screenshot({ path: join(out, `pierogi-${flavor}-back-guides.png`) });

// Mockup previews with the pierogi showing through the window
await load('');
const sheets = await page.$$('.sheet');
await sheets[0].screenshot({ path: join(out, `pierogi-${flavor}-front.png`) });
await sheets[1].screenshot({ path: join(out, `pierogi-${flavor}-back.png`) });

await browser.close();
console.log('Wrote', out);
