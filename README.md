# Snapp UI Registry

Shared shadcn/ui registry source for Snapp applications. The registry contains
the Snapp theme and the canonical Radix Nova UI primitives used across the
workspace. The complete Figma component library, exact assets and fonts are
mapped in [the library audit](docs/figma-library/README.md).

## Local workflow

```powershell
npm install
npm run normalize
npm run registry:verify
npm run registry:serve
```

The verification command includes canonical-source ESLint and Biome gates,
formatter ownership tests, and strict design-system lint against the installed
complete library. See [shared-source quality](docs/shared-source-quality.md).

All included Snapp `components.json` files register the local namespace:

```powershell
npx shadcn@4.12.0 add @snapp/snapp-theme @snapp/snapp-button
```

For a new project or a substantial registry refresh, install the complete
component library, including every canonical Shadcn primitive, reusable Figma
family, exact asset and the theme:

```powershell
npx shadcn@4.12.0 add @snapp/snapp-component-library --overwrite
node scripts/snapp-registry-delivery.mjs --write
node scripts/snapp-registry-delivery.mjs --check
```

Configure the consumer's Biome formatter before running the delivery script.
It assigns only the manifest's exact generated files to registry formatting;
application formatting and lint remain enabled. Rerun the script after an
intentional complete-library refresh. Other formatter configurations require
an explicit equivalent ownership rule rather than a guessed rewrite.

Run the shared webresource converter again after this overwrite when the
consumer is hosted by Dynamics or compiled by a sibling PCF. The converter
restores host/runtime adaptations that generated registry files must not own.
Use the Engineering Hub's `runbooks/ui-registry-rollout.md` for the complete
new/existing Snapp procedure. A local candidate must pass verification before
publication; serving it locally does not update the published namespace.

## Authoring shared components

Keep utility strings in literal `className`/`classNames` expressions or `cva`
definitions. The tested shadcn installer does not prefix standalone class maps,
ordinary `cn()` constants or custom class props. For a reusable recipe or a
custom prop, use `cva("literal utilities")()`; verify the installed output with
the registry smoke gate. A correct unprefixed source preview is insufficient.

Check Figma inside strokes against actual text/child coordinates. A CSS border
consumes layout space; use an inset ring or explicitly compensate its inset
where needed. Preserve intentional consuming borders and measure each case.
Validate computed styles and interactions, including open popups, rather than
only checking class names. Keep sample records and specimen layout overrides
in `docs/figma-library/*-preview.tsx`, outside distributed product components.

## Runtime ownership boundary

Registry components are host-agnostic. They may consume values supplied through
props or shared React providers such as `PortalContainerContext`, but they must
not read Dynamics/PCF entity or record context from `sessionStorage`,
`snapp.host.*`, or document-wide `[data-snapp-host-context]` queries.

The shared webresource converter owns host-root registration, entity/record
context, API-mode selection, and legacy storage fallbacks. Keeping this boundary
prevents one inline PCF control from leaking its table or record into another.

`runtime/PortalContainer.ts` owns the generic portal context within each Snapp.
Its Shell provider supplies the default container; `DialogContent` supplies the
nearest nested container for its descendants. Popup components keep their
registry imports and consume that nearest provider. Converter 0.1.51 retains
`EcPortalContainerContext` and `useEcPortalContainer` as aliases of this same
context and hook; it must not create another context or rename registry hooks.
Separately mounted Snapps each own their providers and portal placement.
Dialog content composes its internal container ref with a supplied object or
callback ref, including React ref cleanup, so forwarding a ref cannot disable
the nested portal provider.
When a Base UI Combobox is open inside a Radix dialog, the first Escape dismisses
that popup; the dialog's capture-phase handler leaves dismissal to the popup.
The following Escape may dismiss the dialog and restore its trigger focus.

After an intentional registry overwrite, run the verified runtime converter,
then rebuild the consumer. Existing converted projects can adopt just the
portal migration with `--portals-only`; this does not install a newer dialog or
refresh the rest of the runtime. Follow the Hub's
`runbooks/ui-registry-rollout.md` for source selection, migration and host checks.

The clean-consumer smoke gate tests dialog popups without runtime conversion.
For an already converted consumer, additionally run:

```powershell
node scripts/verify-dialog-popups-browser.mjs <consumer-root> --converted
```

This checks the installed registry UI with that consumer's real Ec aliases and
modal adapter in light DOM, a hosted ShadowRoot and nested Cabinet roots. It
does not certify a deployed Dynamics control or live authorization.

Dataverse entity-set/logical-name resolution and its environment-scoped memory
cache also belong to the converter-owned runtime. Registry components may
receive resolved records or loading/error state through props and providers,
but must not query `EntityDefinitions`, infer table plurals, or maintain entity
metadata caches.

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
implementations when the registry Combobox meets the requirement. A form-field
Select pairs `SelectTrigger variant="form"` with `SelectContent variant="form"`,
which renders the library dropdown panel (Figma `127:1943`: 8px inset and gap,
28px rows, `snapp-border-primary`, selected `snapp-surface-secondary`) instead
of the Inter select panel.

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

Use the exact installed Figma glyph when one is supplied. Preserve its SVG
bytes, viewBox and natural dimensions. The shared runtime owns SVG URL support
in generated PCF builds; do not redraw a glyph or add a feature-owned loader.
Use Lucide for controls without an explicit design asset.

## Filter controls and nested overlays

Install the shared filter surface and active-token primitives instead of
repeating flyout and pill class bundles:

```powershell
npx shadcn@4.12.0 add @snapp/snapp-filter-controls @snapp/snapp-combobox
```

`FilterMenuSurface`, `FilterTokenList`, and `FilterChip` own the Figma-aligned
364px surface, flyout shadow, 8px layout rhythm, 36px pill geometry, neutral
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
`button`, use vertical dots, apply a feature colour,
or copy the geometry/hover utilities into a consumer. Give each trigger a
contextual accessible name.

Use `size="quick-actions"` on menu content, main menu items, and submenu
triggers when implementing compact overflow actions. The main surface owns the
standard 208px width, 8px inset, 8px section gap, 4px row gap, 28px rows,
shared border, radius, and flyout shadow. For compact nested choice rows, use
`size="quick-actions-compact"` on both `DropdownMenuSubContent` and its items;
that variant owns the 208px surface, 8px inset, 4px gap and 24px rows. The same
sizes are available on the matching `ContextMenu` primitives. Do not reproduce
those class bundles in consumer components.

For an action that opens a modal, keep the controlled `Dialog` outside the
transient menu content and open it from `DropdownMenuItem.onSelect` (or the
matching `ContextMenuItem.onSelect`):

```tsx
const [editOpen, setEditOpen] = React.useState(false)

<>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>{actionButton}</DropdownMenuTrigger>
    <DropdownMenuContent size="quick-actions">
      <DropdownMenuSub>
        <DropdownMenuSubTrigger size="quick-actions">
          Add time
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent size="quick-actions-compact">
          <DropdownMenuItem size="quick-actions-compact">
            30 mins
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
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
npx shadcn@4.12.0 add @snapp/snapp-drag-feedback
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
npx shadcn@4.12.0 add @snapp/snapp-work-item-card
```

The card pulls in its theme, SNAPP-aware class utility, exact vector icons,
duration badge, progress meter, and card primitive automatically.

Feature Snapps can install the shared host-safe layout and parameter parser:

```powershell
npx shadcn@4.12.0 add @snapp/snapp-feature-layout @snapp/snapp-feature-parameters
```

`resolveShowNavBar()` implements the common `snapp_parameters` contract:
`showNavBar=false` hides navigation, `showNavBar=true` shows it, and a missing
or invalid value defaults to showing it. `FeatureShell`, `PageBody`, and
`SurfaceCard` provide the shared full-height layout, content sizing, border,
radius, and padding behavior without coupling a Snapp to a specific host.

Catalogue and knowledge-base Snapps can install the complete shared pattern:

```powershell
npx shadcn@4.12.0 add @snapp/snapp-catalogue-core
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

Lint consumers with the versions the clean-install smoke test verifies:
`@shadcn/lint` 0.2.3, `cn` 0.4.0 and `oxlint` 1.88.0 (see
`scripts/smoke-install.mjs`). Older `@shadcn/lint` releases classify the
theme's `text-snapp-*` and `shadow-snapp-*` utilities as undeclared colours.

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
  primitive, semantic, and typography sources, normalized from captured live
  variables with compatibility-only values retained.
- `npm run sync` converts those sources into shadcn `cssVars` and regenerates
  `registry/radix-nova/theme/snapp-theme.css`.
- The generated theme maps shadcn's standard semantic variables (including
  `--radius`, `--background`, and `--border`) to SNAPP tokens. Its `.ec-app`
  scoped base layer also normalizes border-box sizing and form typography
  without leaking a global reset into Dynamics, PCF, Power Pages, or shells.
- The sync script retains Snapp-specific responsive breakpoints and layout
  sizing alongside the Figma variables.
- `npm run normalize` applies canonical Tailwind suggestions only inside this
  registry. Consumer adoption is an explicit per-project workflow; registry
  maintenance must not overwrite sibling projects or their registry URLs.

Run `npm run normalize:check` in CI to prevent new simple pixel/rem arbitrary
size utilities from being introduced. Run `npm run registry:verify` to validate
the schema, dependency graph, font provisioning, SNAPP class merging,
canonical Tailwind syntax, and the complete generated artifact set. It then
installs the complete library into a temporary clean Vite app with the `ec`
Tailwind prefix, type-checks every installed source, verifies font byte hashes,
and runs a production build. `node scripts/check-figma-coverage.mjs` verifies
that all 55 top-level Figma definitions have an audit owner. For browser QA,
retain a fixture with `SNAPP_KEEP_REGISTRY_FIXTURE=1`, then run
`node scripts/figma-preview.mjs <fixture-root>` and inspect its three groups.

## Rollout safety

Theme sizes are px, not rem: Figma spacing, radius, font-size and line-height
tokens, the hand-authored theme sizes and Tailwind's spacing, text and
container scales. Dynamics pages set a 14px root font size, so rem would render
a Snapp at 87.5% of the design. Breakpoints stay in rem because media queries
resolve against the initial font size, not the root.

Registry source is never copied from an individual consuming application.
`npm run registry:build` removes only previously generated JSON under
`public/r`, then rebuilds the complete catalog so removed items cannot remain as
stale public endpoints.

The SNAPP theme installs Aptos (300/400/600/700), Inter (400/500), IBM Plex Sans
(200/300/400/700) and Judson (400/700) automatically as self-contained data
URLs. Aptos is the current default; preserve explicit component exceptions.
The original designer Aptos 1.09 files are retained under the separate
redistribution/webfont license confirmed by the owner. Delivery copies prepare
advance and positioning metrics to match the precision observed in Figma while
preserving glyph outlines and substitutions. See
`registry/radix-nova/fonts/README.md` and
`docs/figma-library/font-manifest.json` for original/delivery hashes and proofs.
`HugText` rounds intrinsic label slots in Tabs, ExpandedTab and Pagination;
consumers must install the shared primitive and theme rather than substitute
local fonts, disable kerning or add label-specific widths. Font preparation
tests run in `registry:verify`; `registry:text:test` checks layout and fallback
behavior in standalone and two ShadowRoots.

Tabs install `tabs.keyboard.ts` as part of `snapp-tabs`; keep it with the
component during consumer refreshes. Arrow navigation and keyboard entry use
the owning root's actual focus, with a cancellable timer per tab list and
independent nested lists. Radix still owns selection, automatic/manual
activation and roving tab stops. Cancel navigation through a trigger's
`onKeyDown` or a list's `onKeyDownCapture`; a bubbling list handler runs after
Radix's trigger handling. `registry:verify` runs the keyboard matrix against
the freshly installed, prefixed consumer as part of its clean-install gate.
Use `registry:keyboard:test` for the canonical-source fixture. See
[keyboard evidence](docs/figma-library/tabs-keyboard-audit.json).
Native shadow hosts register font faces through the shared runtime while
keeping ordinary styles scoped. Hosted deployment must permit these font
sources in its CSP. Shared
primitives depend on `snapp-utils`, ensuring typography classes such as
`text-snapp-xs` remain intact when combined with SNAPP text color classes.
