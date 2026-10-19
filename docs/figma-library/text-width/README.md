# Verified text-width correction

This record describes the earlier text-width candidate. The subsequent
[Tabs keyboard correction](../tabs-keyboard-audit.json) resolves the ShadowRoot
keyboard finding recorded below; the original candidate measurements remain
historical evidence.

The registry now matches the four remaining Figma control widths:

| Component | Previous browser width | Figma and current browser width |
| --- | ---: | ---: |
| Pagination | 409.71875px | 413px |
| Tab Item | 59.421875px | 60px |
| Expanded Tab | 130.84375px | 132px |
| Tabbed Menu | 519.375px | 524px |

Two causes combined: the source positions glyphs using coarser advance and
positioning precision, then gives each intrinsic label a whole-pixel layout
slot. For a Week label, the prepared advance is 62.001953125px, crossing the
boundary that produces the source's 63px slot. Rounding the unprepared
61.9609375px advance only produces 62px.

The font build retains the designer's four original Aptos 1.09 files and
prepares delivery copies reproducibly. Glyph outlines, substitutions, character
maps and names remain byte-identical. Browser-native shaping and kerning remain
active. Shared `HugText` rounds individual label slots in Pagination, Tabs and
ExpandedTab, preserving their text origins. Labels remain dynamic.

The [current audit](../text-width-alignment.json) records source vectors,
original/delivery hashes, exact control measurements and production identities.
The [source investigation](figma-text-width-research.md) distinguishes the
observed quantization from the inferred internal shaping scale. The
[independent font verification](prepared-font-independent-verification.json)
reconstructed all four delivery binaries byte-for-byte.

Validation passed: four font tests, 60 focused text-slot checks, the complete
registry install/type/build checks, all 55 showcase families and 190 specimens,
298 navigation assertions, and 45 native lifecycle/header assertions. All 12
compiled font faces match the manifest. The registry consumer has 423 matching
source files.

Existing Snapps receive these changes by refreshing the complete registry graph
and font theme, then applying the runtime converter and rebuilding. Refresh
parent Shell/Cabinet hosts and child Snapps together. This candidate is local
and unpublished; deployed host/browser certification remains separate.

At this candidate stage, the Radix Tabs ArrowRight defect inside ShadowRoot
hosts remained open. The historical generic repository audit also flags an existing tracked
`token.json` filename; its contents were not read or used. These are recorded
separately from the passing text-width and artifact checks. Exact text metrics
do not imply identical platform antialiasing.
