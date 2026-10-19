# SNAPP component library alignment

Source: [SNAPP Component Library](https://www.figma.com/design/YUYB5jtCxUwT8OefeLP9f7/SNAPP-Component-Library?m=dev), page `0:1`.

Review captured 2026-10-19. This is a local candidate; publication and live
deployment certification are separate actions.

Acceptance requires inspection of every component family and its variants,
classification of its purpose, exact typography and geometry, production
implementation, generated registry integrity, installation checks and visual
evidence. A passing build alone is not design fidelity evidence.

This directory records the node inventory, measurements, implementation mapping
and verification results. Incomplete or blocked items remain explicit.

Final integration includes the Engineering Hub procedures for installing and
verifying the registry and runtime in both existing and new Snapps. Cover the
registry-first/converter-after order, complete foundation/theme installation,
runtime contract/capabilities, native isolated hosts and visual verification.

The complete install is `@snapp/snapp-component-library`. It contains all 61
canonical UI items (62 source files), reusable components, theme, 303 unchanged Figma SVGs
and 12 self-contained font faces. `snapp-ui-foundation` alone installs the
primitives and is insufficient for complete library adoption.

| Evidence | Scope |
| --- | --- |
| [Final local verification](verification.json) | Candidate fingerprint, clean consumer install/build, browser gates, runtime/Hub checks and release limits. |
| [Inventory](inventory.json), [coverage](coverage.json) | 55 definitions/groups and two duplicate instances; every definition has one audit owner. |
| [Forms audit](forms-audit.json) | 14 families, 89 named variant examples, purpose/API/geometry mapping. |
| [Navigation audit](navigation-audit.json) | 21 families, 51 named examples, hierarchy, headers, menus and editor controls. |
| [Work audit](work-audit.json) | 16 work/data/card families plus four brand definitions and their property examples. |
| [Original form geometry](forms-geometry-source.json), [modal composition](modal-geometry-source.json) | Read-only source measurements, including nominal boxes and overflowing children. |
| [Font manifest](font-manifest.json) | Original and prepared delivery hashes, weights, table-preservation proof and provenance. Aptos redistribution/webfont rights were separately confirmed by the owner. |
| [Designer font adoption](designer-font-adoption.json) | Historical unprepared Aptos 1.09 adoption. Earlier second-pass reports retain their historical 2.01 measurements. |
| [Text-width correction](text-width/README.md) | Verified metric preparation and intrinsic text slots; source widths 413/60/132/524. |
| [ShadowRoot Tabs keyboard correction](tabs-keyboard-audit.json) | Root-local focus, orientation forwarding, canonical and clean-install keyboard regressions, and real production native-mount checks. |
| [Runtime host probe](runtime-host-probe.json) | All 12 faces registered, 89 examples mounted natively and standalone, no document stylesheet leaks, cleanup and host sentinel checks. This integration probe predates final visual-only corrections. |

The three `*-source.json` variable snapshots contain all 154 live variables.
`scripts/import-figma-library-tokens.mjs` normalizes them into canonical token
files; `npm run sync` produces the theme/catalog/font CSS. Source variable
aliases and explicit component exceptions take precedence over invented values.

To reproduce browser checks after a clean install:

```powershell
$env:SNAPP_KEEP_REGISTRY_FIXTURE = '1'
npm run registry:verify
# Use the SNAPP_REGISTRY_FIXTURE path printed by the successful command:
node scripts/figma-preview.mjs <retained-fixture-root>
# In another terminal, while the preview runs on loopback:
npm run registry:figma:forms
npm run registry:figma:form-geometry
npm run registry:figma:navigation
npm run registry:figma:work
```

Install the Playwright Chromium version declared by this checkout before browser
checks (`npx playwright install chromium`). Set `SNAPP_FIGMA_PREVIEW_URL` for a
different preview address. Screenshots and detailed computed-style/interaction
reports are written under ignored `artifacts/figma-qa/`. Source screenshots are
comparison evidence only and are never application assets. Open popup states
must be activated individually; simultaneous default-open stories can dismiss
one another through their normal focus behavior.

These are measured browser comparisons, not a guarantee of identical raster
pixels across operating systems. The registry retains the designer-confirmed
Aptos 1.09 sources and prepares delivery metrics to reproduce observed source
glyph positions. Shared intrinsic text slots resolve the four remaining HUG
widths. See the text-width audit for vector evidence and rasterization limits.
The standard Fields
source box is 65px while its 20px label, 8px gap and 41px input visibly reach
69px. The modal specimen preserves its original 65px instance slots in the
preview; generic fields remain content-driven. Calendar demo-date errors are
not reproduced in a functional calendar. Generic table widths, sample record
content, filter option counts and business progress remain caller-owned;
explicit specimen overrides are documented in the audits.

The mounting Shell/Cabinet and child Snapp both require the current host loader.
Use runtime 0.1.50 / contract 34 with complete-read and font-registration
capabilities, and follow the Engineering Hub's `runbooks/ui-registry-rollout.md`.
The hub bundles the installable skills, adoption audit, overlay gate and
new/existing project procedures. A passing local native/webpack probe does not
certify deployed Shells, direct PCF solutions, CORS, CSP or live Dataverse
permissions; complete the host matrix during release. Rebuilt product Snapps
have no iframe fallback.
