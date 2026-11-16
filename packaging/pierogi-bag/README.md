# Pierogi bag

Resealable zipper pouch for packs of 8 pierogi. Four flavors: cheese and potato (`ruskie`), spinach and cheese (`szpinak`), sauerkraut and mushroom (`kapusta`) and blueberry (`jagody`). `out/pierogi-lineup.png` and `out/pierogi-lineup-back.png` show all four side by side.

- **Size:** 8 in wide x 10 in tall, flat zipper pouch, plus 0.125 in bleed. Zipper about 1.15 in down, tear notches at 0.75 in, 3/8 in side and bottom seals. Ask the printer for their dieline and line it up with `?guides=1`; adjust the sizes at the top of `bag.html` if theirs differ.
- **Clear window:** the arch on the front is unprinted film so the pierogi show through. Tell the printer: no ink and no white underlay inside the arch.
- **Brand:** cream bag with Fraunces and EB Garamond, the ink doodles, Pierożek and a "since 1992, born in Greenpoint" stamp (see `brand/brand.md`).
- **Flavor colors:** each flavor has its own color in place of the brand red, so they're easy to tell apart on the shelf: cheese and potato in Northside Red `#9A1B1F`, spinach and cheese in green `#2F5A3C`, sauerkraut and mushroom in brown `#6B4426`, blueberry in blue `#33407E`. This is a deliberate exception to the brand guide's red-and-cream rule, for pierogi packaging only.

## Two front designs

- **Window** (default): a clear arched window shows the real pierogi. The bottom third is a solid block of the flavor color with the flavor name and a big "Pierogi" in cream, so each flavor stands out on the shelf. A ribbon under the logo says "Polish bakery · Williamsburg, Brooklyn", the line above the flavor names the Podedworny family, and the address sits under the tagline at the bottom.
- **Hero drawing** (`?layout=hero`): a big ink drawing of two pierogi with sour cream and dill sits on a band of the flavor color, with no window, so the whole bag is printed. Files end in `-hero`, e.g. `out/pierogi-ruskie-hero-print.pdf`; `out/pierogi-lineup-hero.png` shows all three. The drawing on its own is `images/illustrations/pierogi-hero.svg`. The back is the same for both, with a line drawing of the storefront next to the family story (`images/illustrations/storefront-line.svg`).

## Files

| File | What it is |
| --- | --- |
| `bag.html` | The design (front and back). Text and color for each flavor are in `FLAVORS` at the bottom. To look at it in a browser, run `npx serve .` in the repo root and open `/packaging/pierogi-bag/bag.html?flavor=ruskie` (the recolored drawings don't load from a double-clicked file). |
| `render.mjs` | Makes everything in `out/`: `node packaging/pierogi-bag/render.mjs [flavor] [hero]` |
| `out/pierogi-<flavor>-print.pdf` | Two-page print file, window left empty. |
| `out/pierogi-<flavor>-proof-guides.pdf` | Same, with trim, seals, zipper and safe area drawn on. |
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

Copy the `ruskie` entry in `FLAVORS`, give it a new id (e.g. `mieso`), change the text and pick a color, then open `bag.html?flavor=mieso` or run `node packaging/pierogi-bag/render.mjs mieso`.
