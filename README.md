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

## Selection controls

Use `@snapp/snapp-combobox` as the standard option picker for new and updated
Snapp interfaces. This applies even to short lists: consistent search,
keyboard navigation, popup positioning, and visual treatment are more useful
than switching control types based on option count.

Configure `itemToStringLabel`, `itemToStringValue`, `isItemEqualToValue`, and a
case-insensitive `filter` for the option type. Render options through
`ComboboxCollection` (or a render-function child of `ComboboxList`) so Base UI
can supply the filtered collection; directly mapping the original `items`
array bypasses search filtering. The canonical Combobox opens below and aligns
to the start of its trigger, matches the trigger width, and uses the standard
neutral selected/hover treatment.

Keep `@snapp/snapp-select` only for an explicitly non-searchable fixed-choice
interaction. Do not use native `select` elements or app-specific dropdown
implementations when the registry Combobox meets the requirement.

## Form controls and action menus

Use the shared form variants instead of repeating modal-specific class strings:

```tsx
<DialogContent size="form" overlayClassName="bg-black/50">
  <Input variant="form" />
  <Textarea variant="form" />
  <Button variant="form-secondary" size="form">Cancel</Button>
  <Button variant="form-primary" size="form">Save</Button>
</DialogContent>
```

Overflow menus use a horizontal Lucide `EllipsisIcon` inside the registry
button's `overflow` size. The size applies the canonical 22px by 20px geometry,
3px horizontal padding, 2px vertical padding, and `icon/icon-primary` colour:

```tsx
<Button variant="ghost" size="overflow" aria-label="Open actions">
  <EllipsisIcon />
</Button>
```

Use `size="quick-actions"` on both menu content and menu items when implementing
compact overflow actions. If the same actions apply to the whole component,
expose them through the registry `ContextMenu` as well as the visible
`DropdownMenu`. The variant owns the standard 136px width, 8px surface inset,
4px row gap, 28px minimum row height, and 8px horizontal/6px vertical item
padding. Do not reproduce those classes in consumer components.

## Native drag and drop

Keep application-owned drag payloads and tree mutations outside the registry.
Native drag sources should use a stable `draggable` element, while drop targets
must remain mounted for the complete drag lifecycle. Show drop indicators by
toggling classes or data attributes; do not replace the element beneath the
pointer during `dragover`, because the browser can lose the active drop target.

The Work OS components can be installed independently or as a complete card:

```powershell
npx shadcn@latest add @snapp/snapp-work-item-card
```

The card pulls in its theme, SNAPP-aware class utility, exact vector icons,
duration badge, progress meter, and card primitive automatically.

Feature Snapps can install the shared host-safe layout and parameter parser:

```powershell
npx shadcn@latest add @snapp/snapp-feature-layout @snapp/snapp-feature-parameters
```

`resolveShowNavBar()` implements the common `snapp_parameters` contract:
`showNavBar=false` hides navigation, `showNavBar=true` shows it, and a missing
or invalid value defaults to showing it. `FeatureShell`, `PageBody`, and
`SurfaceCard` provide the shared full-height layout, content sizing, border,
radius, and padding behavior without coupling a Snapp to a specific host.

Catalogue and knowledge-base Snapps can install the complete shared pattern:

```powershell
npx shadcn@latest add @snapp/snapp-catalogue-core
```

The bundle includes the landing hero and cards, loading skeleton, feature
layout, pill breadcrumb, search result card, collapsed-by-default help-article
accordion, feature-parameter parser, and search matching utilities. Feature
code remains responsible for constructing breadcrumb paths and selecting the
Dataverse fields and record types that are searchable or visible.

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
- The generated theme maps shadcn's standard semantic variables (including
  `--radius`, `--background`, and `--border`) to SNAPP tokens. Its `.ec-app`
  scoped base layer also normalizes border-box sizing and form typography
  without leaking a global reset into Dynamics, PCF, Power Pages, or shells.
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

The SNAPP theme installs IBM Plex Sans (200/300/400/700) and Judson (400/700)
automatically. Each face tries the SNAPP Front Door asset first, the matching
Google Fonts WOFF2 asset second, and a bundled `@fontsource` WOFF2 file last.
The bundled fallback keeps Dynamics, PCF, Power Pages, offline, and CSP-limited
consumers reliable while avoiding duplicate legacy WOFF output. Shared
primitives depend on `snapp-utils`, ensuring typography classes such as
`text-snapp-xs` remain intact when combined with SNAPP text color classes.
