// Renders the stand-up pouch mockup to out/pouch-mockup.png. Run from the repo root:
//   node packaging/pouch-mockup/render.mjs
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1200 }, deviceScaleFactor: 2 });
await p.goto(pathToFileURL(join(here, 'mockup.html')).href, { waitUntil: 'load' });
await p.waitForTimeout(300);
await p.screenshot({ path: join(here, 'pouch-mockup.png') });
await b.close();
console.log('ok');
