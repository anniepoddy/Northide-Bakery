# Northside Bakery, Brooklyn website

Plain HTML, CSS and JavaScript. No framework, no build step.

## Folders

| Path | What it is |
| --- | --- |
| `index.html` | The page. Hours are in the "Visit us" table. |
| `css/styles.css` | All styling. Colors and fonts are at the top. |
| `js/main.js` | Mobile menu, today's hours, and the menu builder. |
| `data/menu.json` | **The menu.** Edit items, prices and photos here. |
| `images/photos/` | Web-ready photos (`name.jpg` large, `name-sm.jpg` small). |
| `images/doodles/` | The ink drawings and characters, one SVG each (`cream/` has cream versions for red backgrounds). |
| `images/cutouts/` | Whole foods cut out of their photos, used in the hero. |
| `tools/cutout.mjs` | Makes a new cutout: `node tools/cutout.mjs <photo-name>`. Check the result; pale or busy photos don't cut cleanly. |
| `images/logo/` | Logo in red, cream and dark ink, with a transparent background. |
| `tools/prepare-photos.mjs` | Turns original photos into web photos. |
| `Northside bakery photos/` | Your originals. Not uploaded to the site. |

## Preview the site

The menu is loaded from `menu.json`, which browsers only allow from a web server, not by double-clicking the file. In VS Code, open a terminal in this folder and run:

```
npx serve .
```

Then open the address it prints (usually http://localhost:3000). Press Ctrl+C to stop.

## Edit the menu

Open `data/menu.json`. Each item looks like this:

```json
{ "name": "Challah", "polish": "Chałka", "category": "bread", "description": "Braided egg bread.", "photo": "images/photos/challah-sm.jpg", "price": "$6.00", "availability": "Every day" },
```

- `category` is one of: `bread`, `sweets`, `pierogi`, `hot`, `market`.
- `photo`: use `""` for no photo; a drawing is shown instead.
- `price`: use `""` for no price.
- `availability`: exactly `"Every day"` or `"Rotating – ask in store"`.
- Placeholder prices have `"priceConfirmed": false`. Before launch, either fix them or set `"showUnconfirmedPrices": false` at the top to hide them all.
- Every item ends with a comma except the last one in the list. A missing or extra comma stops the whole menu from loading.

## Add a photo

1. Put the original in `Northside bakery photos/`.
2. Add a line to `PHOTOS` in `tools/prepare-photos.mjs`, e.g. `'makowiec': 'IMG_1234.HEIC',`
3. Run `node tools/prepare-photos.mjs` (first time only: `cd tools`, `npm install`, `cd ..`).
4. Use `images/photos/makowiec-sm.jpg` in `menu.json`.

## Deploy to Vercel

```
npx vercel        (preview link)
npx vercel --prod (live site)
```

`.vercelignore` keeps your originals, references and tools out of the upload.
