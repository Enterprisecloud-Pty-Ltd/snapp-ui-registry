# Figma Aptos text width: exact quantization evidence

Read-only investigation, 2026-10-19. No repository, source-font, style, install or Figma edits were made. The integration owner supplied fresh exact text properties, ink bounds and outlined SVG exports from the source file. The approved designer Aptos Regular 1.09 bytes remain unchanged (SHA-256 `b46c7865bdecc68d7d82075a2d1e93e31cb73146eae6740bc7c090c8d0b2842a`, 2048 units per em).

The remaining Pagination discrepancy has a concrete explanation: the source rounds each glyph advance and each GPOS pair adjustment to a two-font-unit grid before summing the text advance. Normal Chromium Canvas retains the intervening font-unit precision. Both still use kerning.

The observed source rule is `q(u) = 2 * floor(u / 2 + 0.5)`, applied independently to hmtx advances and GPOS xAdvance values. At 14px, Week becomes 62.001953125px before its HUG frame rounds to 63px. The browser's 61.9609375px rounds to 62px. It is therefore insufficient to explain this difference only as whole-label pixel ceiling.

| Source text | Browser advance | Source-model advance | Source HUG |
|---|---:|---:|---:|
| Week 1 - 3 | 61.9609375 | 62.001953125 | 63 |
| Week 4 - 6 | 61.9609375 | 62.001953125 | 63 |
| Week 7 - 8 | 61.9609375 | 62.001953125 | 63 |
| Next | 27.8017578125 | 27.822265625 | 28 |
| Item | 27.4189453125 | 27.439453125 | 28 |

Source nodes are [Pagination Week 1 - 3](https://www.figma.com/design/YUYB5jtCxUwT8OefeLP9f7?node-id=1-2662), 1:2665, 1:2668, Next 1:2673 and Item 300:2757. The source rule matches all five exact ink rectangles and HUG widths. For the three supplied SVGs it predicts all 15 visible glyph origins and all 21 contour starts (42 coordinates) within the SVG serializer's precision; the largest coordinate difference is 0.000046875px. This is vector-position evidence, independent of raster antialiasing.

Examples of source quantization are e advance 1079 to 1080, I 533 to 534, and We kerning -51 to -50. Even-valued N 1446, t 662 and digit 1094 advances remain unchanged. Week accumulates six font units from five odd glyph advances and its odd We adjustment. Actual source glyph geometry agrees with the approved font; the delta accumulates in glyph positions.

The exact implementation inside Figma is not exposed by the queried API. HarfBuzz shaping at scale 1024 for this 2048-UPM face implements the observed rule: its integer scaling operation adds a half unit before a shift. Its public API explicitly lets the client choose the scale and fractional precision. Thus scale 1024 is a supported mathematical mechanism and a strong inference, not an independently observed internal Figma setting. [HarfBuzz source](https://raw.githubusercontent.com/harfbuzz/harfbuzz/main/src/hb-font.hh), [HarfBuzz scale contract](https://harfbuzz.github.io/harfbuzz-hb-font.html#hb-font-set-scale).

Figma's textAutoResize API documents fitting the frame to text, but does not specify this shaper scale or a universal pixel-ceiling contract. The sampled source proves the behavior here. [Figma textAutoResize](https://developers.figma.com/docs/plugins/api/properties/TextNode-textautoresize/).

Kerning:none is ruled out. It produces materially wider vector ink and a 39px Alegra HUG width where fresh source frames are 38px. Both Aptos 1.09 and earlier 2.01 legacy kern tables contain We -51, te -10 and ex -31, not the proposed alternate -45/-8/-23. Neither switching font versions nor selecting legacy kern explains the source. CSS font-kerning controls kerning use, not the precision at which a shaping client computes positions. [CSS Fonts kerning](https://www.w3.org/TR/css-fonts-3/#font-kerning-prop).

A private Canvas prototype dynamically reproduces the observed source HUG sizes without storing label widths: at 1024px measure each single-character advance, derive each pair delta from pair width minus the two singles, round each separately, sum, scale by actualFontSize/1024, then ceil the text slot. All eight tested strings have unquantized pair sums equal to their whole-string Canvas widths. The model predicts Week 63, Next 28, Item 28, Alegra 38 and Button Text 68. It can preserve normal browser text painting while correcting the layout slot. Merely measuring the whole string at 1024px does not apply the needed independent rounding.

This pair method is a scoped proof for these plain ASCII sequences, not a universal shaping algorithm. Production use must handle actual font readiness, face, weight, features and fallback, and must reject or fall back for sequences whose pair decomposition differs from full shaping. Ligatures, joining, bidi and complex scripts need full shaping. Slot correction alone also does not reproduce the tiny vector-position deltas in normal browser paint. Exact paint would require matching the quantized glyph positioning, beyond a CSS kerning switch.

Machine-readable evidence: `figma-shaper-quantization.json`, `canvas-pair-quantization.json`, `legacy-kern-comparison.json`. Source evidence: `snapp-text-width-glyph-exports.json` supplied read-only by the integration owner. Reproducible probes: `compare-figma-quantization.py` and `canvas-pair-quantization.mjs`. All are external temporary artifacts.
