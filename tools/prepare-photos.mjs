// Turns the original photos into web-ready JPEGs with clean names.
//
//   node tools/prepare-photos.mjs
//
// Reads from "Northside bakery photos/", writes to images/photos/:
//   <name>.jpg     up to 1600px wide, for large spots
//   <name>-sm.jpg  up to 800px wide, for menu cards and thumbnails
// Location (GPS) and camera data are removed. To add a photo, add a line to PHOTOS and run again.
// Needs: npm install sharp heic-convert   (run once in this folder)

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import convert from 'heic-convert';

const SRC = 'Northside bakery photos';
const OUT = 'images/photos';

// clean name  <-  original file
const PHOTOS = {
  'storefront-evening': 'Facetune_14-10-2025-20-10-24.JPEG',
  'storefront-day': 'IMG_4478.HEIC',
  'storefront-entrance': 'IMG_5186.HEIC',
  'interior-counter': 'IMG_9211.HEIC',
  'menu-boards': 'IMG_9604.HEIC',
  'bag-and-bread': 'current bag.heic',
  'old-poster': 'IMG_5994.JPG',

  'bread-rack-loaves': 'IMG_3771.JPEG',
  'bread-rack-pullman': 'IMG_3772.JPEG',
  'bread-sunflower-rye': 'IMG_3783.JPEG',
  'bread-seeded-loaves': 'IMG_8841.HEIC',
  'bread-sourdough-boules': 'IMG_6757.HEIC',
  'bread-rye-boule': 'IMG_8715.HEIC',
  'challah': 'IMG_7529.HEIC',
  'challah-2': 'IMG_7530.HEIC',
  'pastry-poppy-sticks': 'IMG_9195.HEIC',
  'pastry-sausage-roll': 'IMG_9181.HEIC',

  'paczki-powdered': 'FullSizeRender 2.HEIC',
  'paczki-glazed': 'FullSizeRender 3.HEIC',
  'paczki-glazed-nuts': 'FullSizeRender.HEIC',
  'paczki-chocolate': 'IMG_6941.JPG',
  'paczki-rose-glaze': 'IMG_6944.JPG',
  'paczki-chocolate-orange': 'IMG_7027.HEIC',
  'paczki-orange-peel': 'IMG_9381.HEIC',
  'babka-chocolate': 'IMG_1847.HEIC',
  'cake-trays': 'IMG_3004.HEIC',
  'jam-cookies': 'IMG_4658.HEIC',
  'raspberry-tart': 'IMG_4774.HEIC',
  'cheesecake-strawberry': 'IMG_5222.HEIC',
  'cheesecake-oreo': 'IMG_5224.HEIC',
  'pumpkin-pie': 'IMG_6770.HEIC',
  'apple-pie': 'IMG_6774.HEIC',
  'dough-twists': 'IMG_6810.HEIC',
  'cookies-oatmeal': 'IMG_6921.HEIC',
  'chrusciki': 'IMG_7020.HEIC',
  'chrusciki-2': 'IMG_7021.HEIC',
  'macaroons': 'IMG_7036.HEIC',
  'macaroons-trays': 'IMG_7039.HEIC',
  'crumb-cake': 'IMG_7387.HEIC',
  'berry-layer-cake': 'IMG_7393.HEIC',
  'cream-horns': 'IMG_8873.HEIC',
  'cream-puffs': 'att.3qBJNS3i3EoPInD6doZ4OweMdlRc1pEx-0bjmDHDURU.JPEG',
  'cheese-blueberry-bun': 'IMG_9918.HEIC',

  'pierogi-handmade': 'IMG_7001.HEIC',
  'pierogi-kielbasa-plate': 'IMG_7414.HEIC',
  'golabki': 'IMG_1689.JPEG',
  'kielbasa-onions': '15A785B4-5CCD-4642-A70E-AFD8752713ED-3797-0000018123E138F2.JPG',
  'kielbasa-plate': 'copy_D198D138-9A92-4A30-8783-7AE4608082F3.JPEG',
  'kielbasa-tray': 'IMG_5217.JPG',
  'cutlet-plate': 'IMG_7274.HEIC',
  'soup': 'IMG_8346.HEIC',
  'chicken-broccoli': 'IMG_8705.HEIC',
  'chicken-broccoli-2': 'IMG_8711.HEIC',
  'smoked-meats': 'IMG_8876.HEIC',
};

await fs.mkdir(OUT, { recursive: true });
for (const [name, file] of Object.entries(PHOTOS)) {
  let input = await fs.readFile(path.join(SRC, file));
  if (/\.heic$/i.test(file)) input = await convert({ buffer: input, format: 'JPEG', quality: 0.95 });
  const base = sharp(input).rotate(); // apply phone orientation, then metadata is dropped
  await base.clone().resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, `${name}.jpg`));
  await base.clone().resize({ width: 800, withoutEnlargement: true }).jpeg({ quality: 76, mozjpeg: true }).toFile(path.join(OUT, `${name}-sm.jpg`));
  console.log('ok', name);
}
