# Registry font sources

The component-library design uses Aptos as its title and body family, with
specific Inter and IBM Plex Sans exceptions. Arial is used for one help glyph.

Aptos Light (300), Regular (400), SemiBold (600) and Bold (700) are original
TrueType files from the designer-confirmed `aptos-font` package, version
`1.09;O365`. On 2026-10-19 these replaced the initially supplied 2.01 files.
The designer package's other weights, italics, duplicate ExtraBold Italic and
macOS resource sidecars are not used by the component library.

On 2026-10-19 the owner confirmed a
separate redistribution/webfont license covering the registry and Snapps.
Retain the commercial license evidence with the owner. The accompanying EULA
from the earlier download is preserved as historical provenance; it alone does
not grant distribution.

The original Aptos source files remain unchanged. `scripts/prepare-aptos-fonts.mjs`
creates delivery copies under `aptos/prepared/`, rounding advance and positioning
metrics to the observed Figma precision (1024 units for the 2048-unit source
fonts). Glyph outlines, character mapping, substitutions and naming tables stay
byte-for-byte unchanged. This is metric preparation, with no subsetting or font
substitution.

`scripts/build-fonts.mjs` embeds those delivery copies into generated font-face
CSS so installation, PCF and standalone artifacts do not depend on a network
font service or a font installed on the user's computer. The generated manifest
distinguishes original and delivery hashes and records table preservation and
checksum proofs.

Inter, IBM Plex Sans and compatibility Judson sources come from the locked
Fontsource packages. The source license files are copied alongside the CSS
when building the registry. Judson remains available for existing consumers;
it is no longer the default title font in this Figma library.
