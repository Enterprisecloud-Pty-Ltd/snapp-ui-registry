# Snapp UI Registry

Shared shadcn/ui registry source for Snapp applications. The registry contains
the Snapp theme and the canonical Radix Nova UI primitives used across the
workspace.

## Local workflow

```powershell
npm install
npm run normalize
npm run sync
npm run registry:validate
npm run registry:build
npm run registry:serve
```

All included Snapp `components.json` files register the local namespace:

```powershell
npx shadcn@latest add @snapp/snapp-theme @snapp/snapp-button
```

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
npm run sync
npm run registry:validate
npm run registry:build
```

## Source of truth

- `registry/radix-nova/tokens/*.tokens.json` contains the canonical Figma
  primitive, semantic, and typography exports.
- `npm run sync` converts those exports into shadcn `cssVars` and regenerates
  `registry/radix-nova/theme/snapp-theme.css`.
- The sync script retains Snapp-specific responsive breakpoints and layout
  sizing alongside the Figma variables.
- `blobstoragemanagersnapp/src/components/ui` is the canonical component source
  used by `npm run sync`.
- `scripts/normalize-tailwind-sizes.mjs` applies the shared tokens and Tailwind
  scale utilities to every owned Snapp while excluding `Depricated` and
  `not my snapps`.

Run `npm run normalize:check` in CI to prevent new simple pixel/rem arbitrary
size utilities from being introduced.
