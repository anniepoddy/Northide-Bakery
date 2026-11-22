// Renders the stand-up pouch mockup to out/pouch-mockup.png. Run from the repo root:
//   node packaging/pouch-mockup/render.mjs [freezer]
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1200 }, deviceScaleFactor: 2 });
const scene = process.argv[2] === 'freezer' ? 'freezer' : 'mockup';
await p.goto(pathToFileURL(join(here, scene + '.html')).href, { waitUntil: 'load' });
await p.waitForTimeout(300);
await p.screenshot({ path: join(here, scene === 'freezer' ? 'freezer-mockup.png' : 'pouch-mockup.png') });
await b.close();
console.log('ok');
