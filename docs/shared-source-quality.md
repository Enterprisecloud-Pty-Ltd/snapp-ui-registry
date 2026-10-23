# Shared source quality

The registry owns reusable source and its distribution. Consumers retain strict
application lint; they adopt corrections through the complete library instead
of repairing generated files locally.

The local 2026-10-19 candidate moves existing composition recipes into typed
primitive `appearance` props. It retains their exact colours, dimensions,
shadows, transitions, SVG bytes and fonts. Theme generation records equal named
tokens; nearest palette colours or spacing values are not substitutes.

Mixed component/helper exports are separated behind public `.ts` barrels. The
same-stem `.tsx` files contain component-only compatibility exports so overwrite
installation also fixes older consumers without deleting files. Existing module
paths, component names, helper names and type imports remain available.

## Verification

`npm run lint` checks distributed source with ESLint and Biome. React's
recommended Biome domain is explicit at the owner, whose package manifest does
not otherwise activate it. ESLint's documented primitive library exceptions stay
under `registry/radix-nova/ui`; Biome's necessary pattern exceptions are attached
to the exact expression/attribute with their reason. `format:check` checks the
canonical distributed graph and changed delivery/generation scripts. Font CSS
is generated from exact binary faces and checked by manifest identity instead
of a generic formatter. `sync` applies the same formatter after generation.

`registry:smoke` installs the entire graph in a fresh consumer, checks prefixed
classes, applies the shell's strict Oxlint/design-system rules, adopts/checks
formatting ownership, typechecks and builds, then tests Tabs keyboard behavior.
The Figma browser suites independently check existing computed geometry, fonts
and interactions. Public JSON integrity still requires each embedded source to
equal its canonical owner and rejects stale or missing graph entries.

The clean install uses minimal canonical theme/font imports before linting and
building. Installer-added inline variables must not mask an undeclared colour
alias; the status drop target uses the declared `text-snapp-brand-primary` token.

Real shared lint findings are corrected: drag handles expose a button, search
labels explicitly reference their inputs, read-state dots expose image semantics,
OTP separators are decorative, current breadcrumb text has no interactive link
role, and actual data identities or React child mapping replace incidental keys.
Chart CSS is rendered as style text rather than injected HTML.

Chart stroke selectors live in the shared `snapp-chart-strokes` CSS utility.
The installer's class transformation strips quotes around hex attribute values
in arbitrary variants, making their generated CSS invalid. The named utility
preserves quoted selectors, border/50 mixing and transparent strokes through
prefixed installation. The clean production build rejects that parser warning.

Keep valid ARIA composition where a native replacement changes its meaning.
The [W3C carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)
uses group semantics for slides; the
[W3C treeview example](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/examples/treeview-1b/)
uses a `ul` tree and nested groups. Local directives explain these patterns,
submitting search forms, custom checkbox glyphs, pointer focus delegation and
stable slider/chart/text slots. No application rule or whole linter is disabled.

Sidebar state and shortcuts belong to each provider. The primitive no longer
writes the unscoped `sidebar_state` cookie or listens for a document-wide
shortcut. Its host can persist an explicitly scoped preference through the
existing `onOpenChange` callback; an existing legacy cookie is left untouched.
An installed browser test verifies two providers, controlled callbacks,
shortcut cancellation and unchanged cookies. Registry source validation rejects
browser-storage access, which belongs to its host/runtime owners.

Popups opened inside a dialog (comboboxes, selects, menus, nested modals)
portal into the dialog content. Outside it they inherit the modal's
`pointer-events: none` and its focus trap pulls focus back out of them.
`DialogContent` is centred with margins, not a translate, so it is not the
containing block of those fixed popups: its scrolling does not clip them and a
nested modal still covers the viewport. An installed browser test opens
30-option popups from small, tall and form dialogs and checks that every option
can be clicked, the popup search keeps focus, nothing is clipped and a nested
alert dialog covers the viewport.

## Consumer formatting

The full bundle installs `scripts/snapp-registry-files.json` and
`scripts/snapp-registry-delivery.mjs`. With a configured Biome formatter, run:

```powershell
node scripts/snapp-registry-delivery.mjs --write
node scripts/snapp-registry-delivery.mjs --check
```

The generated manifest follows the complete library's dependency closure. Its
exact file list covers installed registry code, theme, tokens and metadata;
it has no application globs. The script prevents the consumer's formatter and
automatic assist from changing those generated bytes. It does not disable lint.
Authored application files remain governed by the consumer's formatter.
Tests prove exact scoping, idempotence, missing/escaping-file rejection, actual
preservation of installed bytes and continued formatting of application source.

After the registry refresh, rerun the runtime converter and the consumer's
canonical, lint, format, type, test and production artifact gates. The runtime
package separately owns its generated formatter rule and verifies its source.

This is a local candidate. A passing local graph and consumer installation do
not publish it or update a deployed site. Restore the canonical published
namespace in production configuration and record the tested local provenance.
