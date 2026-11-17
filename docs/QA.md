# Verification record / V2

Verified in the connected browser on 17 November 2026.

## Automated checks

- Six cart/validation domain tests passed.
- All six authored JavaScript modules passed syntax checks.
- All six pages passed primary-heading and unique-ID checks.
- 133 local asset/link references resolved successfully.

## Browser verification

- All six page routes opened through navigation; real paths and selected-page indicators worked.
- Homepage football, orbital rings and particles rendered. Stadium day and structure buttons changed selected state and the 3D view.
- Match search and away filter reduced the fixture list to the matching Raja demo fixture.
- Tactical board switched to 3–5–2; entering a custom goalkeeper name updated the board.
- Heritage timeline switched to the sourced 2011 chapter; gold trophy rendered and accepted keyboard rotation.
- Collection rendered both home and away 3D kits; its away link opened the studio with the away design selected. FAQ expanded.
- Studio accepted a Latin name/number, changed lighting, enabled auto-rotation, and added the correct personalized away configuration to the shared cart.
- Demo checkout reached its success screen and emptied the demo cart. No real order was sent.
- Arabic jersey name rendered; Arabic-Indic ٧ normalized to 7. Front/back controls worked.
- Flags rendered and accepted the higher-wind selection.
- Supporter wall saved a test message across reload, displayed markup literally as text, and removed the test entry using its delete control.
- Poster switched to black and downloaded a PNG successfully. Editorial story dialog opened and closed.
- Mobile layouts checked at 390 × 844 in French and Arabic. Header menu, RTL alignment and main actions worked.
- Global animation control and system reduced-motion code paths are shared across pages and 3D renderers.
- No application errors or warnings were observed in the inspected browser flows.

## Corrections during verification

- Replaced curved football seam interpolation with straight panel edges.
- Kept authored demo kickoff times consistent between promotional panels and fixture cards.
- Corrected the away product name in the cart.
- Added a primary heading to the dedicated studio page and translated page titles.
- Contained the rotating decorative star to prevent horizontal overflow on narrow page headers.

## Limits

Mobile checks use viewport emulation, not physical devices. No WebGL-disabled device or operating-system motion setting was used; fallbacks and media-query handling are implemented. Scene appearance and performance may vary by GPU. The project has no live fixtures, official store, server-backed supporter wall, payments or Shopify connection. Existing V1 cart tests remain in place; its PNG jersey export was previously verified at 1600 × 1200.
