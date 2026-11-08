// Renders the pierogi bag to print PDFs and preview PNGs.
// Run from the repo root:  node packaging/pierogi-bag/render.mjs [flavor] [layout]
// e.g. node packaging/pierogi-bag/render.mjs kapusta hero   (the big-drawing front)
// Needs Playwright (cd tools && npm install playwright, then npx playwright install chromium).
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const flavor = process.argv[2] || 'ruskie';
const layout = process.argv[3] || '';
const tag = layout ? `${flavor}-${layout}` : flavor;
const out = join(here, 'out');
mkdirSync(out, { recursive: true });
// Serve the repo over http: the recolored drawings use CSS masks, which don't load from file://
const repo = join(here, '..', '..');
const TYPES = { '.html': 'text/html', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.css': 'text/css', '.js': 'text/javascript' };
const server = createServer((req, res) => {
  const file = join(repo, normalize(decodeURIComponent(req.url.split('?')[0])));
  if (!file.startsWith(repo) || !existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(0);
await new Promise(r => server.once('listening', r));
const url = (q) => `http://localhost:${server.address().port}/packaging/pierogi-bag/bag.html?flavor=${flavor}${layout ? `&layout=${layout}` : ''}${q}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 1000 }, deviceScaleFactor: 2 });

async function load(q) {
  await page.goto(url(q), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
}

// Print file: clear window left empty, no guides
await load('&print=1');
await page.pdf({ path: join(out, `pierogi-${tag}-print.pdf`), width: '8.25in', height: '10.25in', printBackground: true, preferCSSPageSize: true });

// Proof with guides
await load('&print=1&guides=1');
await page.pdf({ path: join(out, `pierogi-${tag}-proof-guides.pdf`), width: '8.25in', height: '10.25in', printBackground: true, preferCSSPageSize: true });
const proof = await page.$$('.sheet');
await proof[0].screenshot({ path: join(out, `pierogi-${tag}-front-guides.png`) });
await proof[1].screenshot({ path: join(out, `pierogi-${tag}-back-guides.png`) });

// Mockup previews with the pierogi showing through the window
await load('');
const sheets = await page.$$('.sheet');
await sheets[0].screenshot({ path: join(out, `pierogi-${tag}-front.png`) });
await sheets[1].screenshot({ path: join(out, `pierogi-${tag}-back.png`) });

await browser.close();
server.close();
console.log('Wrote', out);
