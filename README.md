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

For a new project or a substantial registry refresh, install the complete
canonical Shadcn primitive set instead of refreshing only the components the
current screen happens to import:

```powershell
npx shadcn@latest add @snapp/snapp-ui-foundation --overwrite
```

Run the shared webresource converter again after this overwrite when the
consumer is hosted by Dynamics or compiled by a sibling PCF. The converter
restores host/runtime adaptations that generated registry files must not own.

## Loading states

Use `@snapp/snapp-skeleton` for every component or screen loading state. Build
the skeleton from the same layout regions and approximate geometry as the
loaded result so content does not jump when data arrives. Wrap each loading
surface in `SkeletonGroup` with a useful `aria-label`; the wrapper supplies the
shared busy/status semantics.

```tsx
<SkeletonGroup aria-label="Loading service catalogue items">
  <div className="space-y-2">
    <Skeleton className="h-9 w-full" />
    <Skeleton className="h-9 w-full" />
  </div>
</SkeletonGroup>
```

Do not replace a component or page loading state with a centered spinner. Keep
`Spinner` for compact indeterminate actions such as an in-progress button or
upload where there is no meaningful destination layout to represent.

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

`ComboboxInput` accepts a `trailingIcon` for Figma variants that use a passive
search or lookup affordance instead of the default chevron. The icon slot keeps
the shared 41px-high, 8px-radius input geometry, centres passive icons at 18px,
and disables pointer events so the input retains the interaction. Compose
multi-value access/lookup features from the existing Combobox plus Badge or
ComboboxChip; keep entity-specific selection and mutation logic in the feature
instead of adding a domain-specific registry selector.

Compose a labelled multi-value picker from `Field`, `FieldLabel`, `Combobox`,
`Badge` or `ComboboxChip`, and a layout-shaped `SkeletonGroup`. Do not add a
domain-specific access-selector component while these primitives cover the
contract. Do not introduce a Card or other surface unless the exact Figma node
being implemented contains that surface; parent and adjacent frames provide
context, not implicit component ownership.

Prefer Lucide icons when they match the design. If the exact Figma glyph is
material and no shared icon matches, pass a small inline SVG through the
primitive's icon slot instead of requiring an app-specific registry component
or an SVG-loader dependency that a sibling PCF may not provide.

## Filter controls and nested overlays

Install the shared filter surface and active-token primitives instead of
repeating flyout and pill class bundles:

```powershell
npx shadcn@latest add @snapp/snapp-filter-controls @snapp/snapp-combobox
```

`FilterMenuSurface`, `FilterTokenList`, and `FilterChip` own the Figma-aligned
260px surface, flyout shadow, 8px layout rhythm, 36px pill geometry, neutral
tokens, dismiss affordance, focus state, and pointer cursor. Applications own
the available filters, selected values, query behavior, labels, separators,
and whether selection closes the menu.

For a filter surface containing portalled combobox or popup content, apply
`data-snapp-filter-interaction` to each nested overlay and use
`isFilterInteraction(event)` in any application-owned outside-pointer handler.
It checks `event.composedPath()` so Dynamics, PCF, shadow-root, and reparented
portal content are not mistaken for outside clicks. Do not use only
`event.target.closest(...)` for a composite overlay boundary.

## Search scope

Use `filterSearchCollection()` from `@snapp/snapp-search-utils` to filter the
exact result collection owned by a search field. Pass only the fields that are
searchable for that resource type:

```ts
const visibleArticles = filterSearchCollection(articles, query, (article) => [
  article.title,
  article.content,
  article.publicNumber,
])
```

Search must not filter a shared catalogue model, navigation tree, categories,
or sibling panel merely because those surfaces derive from the same data
object. Apply the query at the nearest collection boundary. Keep separate
queries separate when a screen contains different resource types.

Registry search helpers own normalization and matching only. Feature code owns
the searched collection, searchable fields, query state, and empty-result
behavior.

## Form controls and action menus

Use the shared form variants instead of repeating modal-specific class strings:

```tsx
<DialogContent size="form" overlayClassName="bg-black/50">
  <DialogHeader size="form">
    <DialogTitle size="form">Edit item</DialogTitle>
  </DialogHeader>
  <DialogBody size="form">
    <Input variant="form" />
    <Textarea variant="form" />
  </DialogBody>
  <DialogFooter size="form">
    <Button variant="form-secondary" size="form">Cancel</Button>
    <Button variant="form-primary" size="form">Save</Button>
  </DialogFooter>
</DialogContent>
```

The form dialog sections own the shared header geometry, scroll-safe body,
horizontal-overflow prevention, footer reset, action spacing, and close-button
placement. Keep only Figma-specific width, height, overlay opacity, and field
layout overrides in the consuming application.

Modal actions use exactly three shared button variants: `form-secondary` for
cancel/back, `form-primary` for create/save, and `form-destructive` for a final
destructive confirmation. Pair each with `size="form"`; do not repeat modal
button colours, borders, typography, disabled opacity, or hover rules in a
consumer.

Overflow menus use a horizontal Lucide `EllipsisIcon` inside the registry
button's `overflow` variant and size. The pair applies the canonical 22px by
20px geometry, 3px horizontal padding, 2px vertical padding,
`icon/icon-primary` (`#7f8082`) colour, pointer cursor, and matching hover/open
background:

```tsx
<Button variant="overflow" size="overflow" aria-label="Open actions for Item name">
  <EllipsisIcon />
</Button>
```

Always use the variant and size together. Do not render the icon in a raw
`button`, use vertical dots, reuse a Figma `more.svg`, apply a feature colour,
or copy the geometry/hover utilities into a consumer. Give each trigger a
contextual accessible name.

Use `size="quick-actions"` on both menu content and menu items when implementing
compact overflow actions. If the same actions apply to the whole component,
expose them through the registry `ContextMenu` as well as the visible
`DropdownMenu`. The variant owns the standard 136px width, 8px surface inset,
4px row gap, 28px minimum row height, and 8px horizontal/6px vertical item
padding. Do not reproduce those classes in consumer components.

For an action that opens a modal, keep the controlled `Dialog` outside the
transient menu content and open it from `DropdownMenuItem.onSelect` (or the
matching `ContextMenuItem.onSelect`):

```tsx
const [editOpen, setEditOpen] = React.useState(false)

<>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>{actionButton}</DropdownMenuTrigger>
    <DropdownMenuContent size="quick-actions">
      <DropdownMenuItem
        size="quick-actions"
        onSelect={() => setEditOpen(true)}
      >
        Edit
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  <Dialog open={editOpen} onOpenChange={setEditOpen}>
    <DialogContent size="form">...</DialogContent>
  </Dialog>
</>
```

Do not replace the registry menu with a document-level outside-click listener.
If a feature-owned composite interaction still requires one, determine inside
versus outside from `event.composedPath()` so Dynamics, PCF, shadow-root, and
portalled events cannot close the menu before its action is dispatched.

## Native drag and drop

Install the shared Figma-aligned drag feedback where a Snapp supports native
dragging:

```powershell
npx shadcn@latest add @snapp/snapp-drag-feedback
```

`DragPreview` owns the compact white drag surface, exact order handle, item
icon slot, typography, border, radius, and shadow. `DropIndicator` owns the
blue two-pixel line and fixed-size triangle for before/after insertion states.
Applications still own drag payloads, allowed targets, nesting rules, and data
mutations.

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
