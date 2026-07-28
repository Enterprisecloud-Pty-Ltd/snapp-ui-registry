# Snapp UI Registry

Shared shadcn/ui registry source for Snapp applications. The registry contains
the Snapp theme and the canonical Radix Nova UI primitives used across the
workspace.

## Local workflow

```powershell
npm install
npm run normalize
npm run registry:verify
npm run registry:serve
```

All included Snapp `components.json` files register the local namespace:

```powershell
npx shadcn@latest add @snapp/snapp-theme @snapp/snapp-button
```

The Work OS components can be installed independently or as a complete card:

```powershell
npx shadcn@latest add @snapp/snapp-work-item-card
```

The card pulls in its theme, SNAPP-aware class utility, exact vector icons,
duration badge, progress meter, and card primitive automatically.

The local endpoint is `http://127.0.0.1:4173/r/{name}.json`. Replace it with the
published registry URL in each `components.json` when the registry is hosted.

## Published registry

`create-ec-app` can install this registry from the built files committed under
`public/r`. Select **Shadcn/UI from custom registry** and enter:

```text
https://raw.githubusercontent.com/Enterprisecloud-Pty-Ltd/snapp-ui-registry/refs/heads/main/public/r/registry.json
```

The catalog and every generated item JSON file must be committed together.
Before publishing changes, run:

```powershell
npm run registry:verify
```

## Source of truth

- `registry/radix-nova/ui` is the canonical source for shared UI primitives.
- `registry/radix-nova/components` contains reusable SNAPP product components.
- `registry/radix-nova/lib/utils.ts` is the canonical `cn()` implementation. It
  extends `tailwind-merge` so SNAPP text sizes are not mistaken for text colors.
- `registry/radix-nova/tokens/*.tokens.json` contains the canonical Figma
  primitive, semantic, and typography exports.
- `npm run sync` converts those exports into shadcn `cssVars` and regenerates
  `registry/radix-nova/theme/snapp-theme.css`.
- The sync script retains Snapp-specific responsive breakpoints and layout
  sizing alongside the Figma variables.
- `scripts/normalize-tailwind-sizes.mjs` applies the shared tokens and Tailwind
  scale utilities to every owned Snapp while excluding `Depricated` and
  `not my snapps`.

Run `npm run normalize:check` in CI to prevent new simple pixel/rem arbitrary
size utilities from being introduced. Run `npm run registry:verify` to validate
the schema, dependency graph, font provisioning, SNAPP class merging,
canonical Tailwind syntax, and the complete generated artifact set. It then
installs the Work OS card into a temporary clean Vite app, type-checks it, and
runs a production build.

## Rollout safety

Registry source is never copied from an individual consuming application.
`npm run registry:build` removes only previously generated JSON under
`public/r`, then rebuilds the complete catalog so removed items cannot remain as
stale public endpoints.

The SNAPP theme installs IBM Plex Sans (400/700) and Judson (400/700)
automatically. Each face tries the SNAPP Front Door asset first, the matching
Google Fonts WOFF2 asset second, and a bundled `@fontsource` WOFF2 file last.
The bundled fallback keeps Dynamics, PCF, Power Pages, offline, and CSP-limited
consumers reliable while avoiding duplicate legacy WOFF output. Shared
primitives depend on `snapp-utils`, ensuring typography classes such as
`text-snapp-xs` remain intact when combined with SNAPP text color classes.
