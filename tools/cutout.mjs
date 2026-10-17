// Cuts the food out of a photo's background, so it can sit on the brand colors.
//
//   node tools/cutout.mjs challah cheesecake-strawberry
//
// Reads images/photos/<name>.jpg, writes images/cutouts/<name>.webp (transparent, trimmed, up to 1000px).
// Check every result: busy or pale photos (e.g. food on a white tray) don't cut out cleanly.
// Runs entirely on this computer. Needs: cd tools && npm install @imgly/background-removal-node
//
// The background remover ships its own copy of the image library, which clashes with ours if both
// load in one process. So step 1 (cut out) and step 2 (trim and resize) run as separate processes.

import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const OUT = 'images/cutouts';
const RAW = path.join(OUT, '_raw');

if (process.argv[2] === '--trim') {
  // Step 2: trim transparent edges and resize
  const { default: sharp } = await import('sharp');
  for (const name of process.argv.slice(3)) {
    await sharp(path.join(RAW, `${name}.png`)).trim({ threshold: 1 })
      .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84, alphaQuality: 90 }).toFile(path.join(OUT, `${name}.webp`));
    console.log('ok', name);
  }
  await fs.rm(RAW, { recursive: true, force: true });
} else {
  // Step 1: remove the background
  const { removeBackground } = await import('@imgly/background-removal-node');
  const publicPath = new URL('./node_modules/@imgly/background-removal-node/dist/', import.meta.url).href;
  const names = process.argv.slice(2);
  await fs.mkdir(RAW, { recursive: true });
  for (const name of names) {
    const src = path.resolve('images/photos', `${name}.jpg`);
    const blob = await removeBackground(pathToFileURL(src).href, { publicPath, model: 'medium', output: { format: 'image/png' } });
    await fs.writeFile(path.join(RAW, `${name}.png`), Buffer.from(await blob.arrayBuffer()));
    console.log('cut', name);
  }
  execFileSync(process.execPath, [fileURLToPath(import.meta.url), '--trim', ...names], { stdio: 'inherit' });
}
