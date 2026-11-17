# Assets and references

## Original generated image

- Method: built-in `image_gen` tool.
- Final project path: `dist/assets/stadium.jpg`.
- Original generated PNG preserved in the image tool's output directory; the project asset was encoded as JPEG for delivery.
- Purpose: illustrative stadium atmosphere, not documentary photography or a real-match claim.

### Exact generation prompt

> Use case: photorealistic-natural. Asset type: cinematic wide hero background for DIMA MAS, an unofficial Moroccan football fan website inspired by Fes. Create a wide 16:9 editorial sports photograph of a North African football stadium at night seen from the pitch, low wide camera. Dense supporters in distant terraces, black and golden-yellow flags, golden atmospheric smoke rising across the right half, brilliant floodlights beaming through haze from upper right and upper left. Dark almost black night sky occupying upper third, subtle grass at bottom. Premium gritty film-grain sports campaign photography, high contrast chiaroscuro, yellow and black palette, intense collective atmosphere, believable natural light. Composition: visually rich crowd on right and center; left half very dark with generous negative space for large white typography to be added in HTML. No visible individual face closeup, no players on foreground, no legible text, no lettering, no logos, no watermarks. This is an illustrative generic stadium, not a claim to depict an actual match. Landscape 16:9.

## Code-native artwork

The shield-style MAS concept mark, the jersey shapes, patterns, and print layouts are original demonstration artwork authored in CSS and JavaScript. They are not reproductions of an official badge, official jersey, or current commercial product. The site consistently identifies itself as an unofficial portfolio concept.

## Historical references

- MAS founded in 1946: [CAF, Fès city guide](https://www.cafonline.com/media/05ebfeih/ultimate-media-guide-afcon25.pdf).
- MAS won the 2011 CAF Confederation Cup: [French Football Federation competition honours](https://www.fff.fr/621-palmares-coupe-de-la-confederation-de-la-caf.html), corroborated by [CAF's finals history](https://www.cafonline.com/fr/coupe-de-la-confederation/news/tout-ce-qu-il-faut-savoir-sur-la-finale-de-la-totalenergies-caf-coupe-de-la-confederation-2026/).

No current league table, current squad, real fixture date, official product price, or ticket availability is asserted.

## Dependency

Three.js 0.170.0 is pinned in `package.json` and `package-lock.json`. Its MIT license is retained alongside the vendored runtime module.

## V2 generated Fès image

- Method: built-in `image_gen` tool.
- Final asset: `dist/assets/fes.jpg` (JPEG encoded from the original, which remains preserved).
- Used in the city story, heritage page and editorial. It is illustrative AI artwork, not documentary evidence of an actual scene.

### Exact generation prompt

> Use case: photorealistic-natural. Asset type: wide editorial banner for an independent football fan portfolio concept inspired by Fes, Morocco. Create a cinematic photograph-like view over warm ochre medina rooftops at golden hour, historic North African urban architecture receding into haze, one tall slender square minaret in middle distance, a low terrace parapet in foreground with a single black-and-golden-yellow football scarf draped naturally on it, no writing or logo on scarf, a few yellow fabric ribbons gently in breeze. Shot on 35mm film, tactile aged stone, rich golden sunlight, subtle grain, dark olive shadows. Wide landscape 16:9 composition with rooftops in lower two thirds and warm atmospheric sky above. Understated documentary editorial feeling, believable details, premium football heritage campaign. No people closeups, no text, no lettering, no watermark, no CGI looking surfaces. This is illustrative AI-generated atmosphere, not documentation of a real scene.

## V2 procedural artwork

`experience.js` builds the football, stadium, trophy and flags directly from geometry. Stadium seating uses instancing. Flag movement deforms a subdivided plane. The football is a truncated icosahedron with 12 pentagons and 20 hexagons. The stadium is an imaginary concept, not an architectural reconstruction of a real venue. The trophy is an original sculpture, not a replica of the CAF trophy. Posters are original canvas artwork created locally by `universe.js`.
