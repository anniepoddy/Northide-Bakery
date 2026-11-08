# Pierogi bag

Resealable zipper pouch for packs of 8 pierogi. Cheese and potato (*pierogi ruskie*) is the first flavor.

- **Size:** 8 in wide x 10 in tall, flat zipper pouch, plus 0.125 in bleed. Zipper about 1.15 in down, tear notches at 0.75 in, 3/8 in side and bottom seals. Ask the printer for their dieline and line it up with `?guides=1`; adjust the sizes at the top of `bag.html` if theirs differ.
- **Clear window:** the arch on the front is unprinted film so the pierogi show through. Tell the printer: no ink and no white underlay inside the arch.
- **Brand:** red and cream only, Fraunces and EB Garamond, the ink doodles and Pierożek (see `brand/brand.md`).

## Files

| File | What it is |
| --- | --- |
| `bag.html` | The design (front and back). Text for each flavor is in `FLAVORS` at the bottom. |
| `render.mjs` | Makes everything in `out/`: `node packaging/pierogi-bag/render.mjs [flavor]` |
| `out/pierogi-ruskie-print.pdf` | Two-page print file, window left empty. |
| `out/pierogi-ruskie-proof-guides.pdf` | Same, with trim, seals, zipper and safe area drawn on. |
| `out/*-front.png`, `out/*-back.png` | Previews with the pierogi in the window. |

## Before it goes to print

Anything in [square brackets] is a placeholder:

- Net weight (8 pierogi, weighed).
- Storage line ("Keep frozen" is a guess).
- Cooking times: check with the kitchen.
- Ingredients and allergens ("Contains: ...").
- Nutrition Facts panel and UPC barcode (the dashed boxes on the back).
- The logo is a small PNG. Swap in the original vector logo for print (see brand guide, section 6).

## Add a flavor

Copy the `ruskie` entry in `FLAVORS`, give it a new id (e.g. `mieso`), change the text, then open `bag.html?flavor=mieso` or run `node packaging/pierogi-bag/render.mjs mieso`.
