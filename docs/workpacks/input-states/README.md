# Input and action states

Verification snapshot, 2026-10-27, branch `Petrus-input-states`, base remote-main `0c58baab00be73e4358dbac4d93882dacfd43e23`.

Page Designer's catalogue identity inputs exposed the missing read-only appearance in the canonical Input. Native read-only text remains selectable/focusable and uses a muted existing control surface, legible primary text, default cursor and transparent insertion caret. Editable inputs explicitly use text; disabled styling/cursor remains authoritative. File chooser buttons retain pointer.

Native disabled Button now retains hit-testing so its not-allowed cursor can appear. The browser's native disabled activation behavior remains intact; slotted Button pointer-event policy is preserved. InputGroup and its addon provide a not-allowed cursor over disabled areas, including a non-hit-testable disabled lookup arrow. Existing geometry, SVG assets, typography and token values are retained. No consumer appearance override or global pointer shim.

Verified through the complete registry fresh-install/prefix/lint/build suite and Page Designer's real production-bundle state probe and shell fixtures. Evidence and exact hashes live in the owning consumer's `docs/workpacks/page-designer/control-states/`; raw owner logs are retained locally. All six source/artifact hashes still matched this snapshot immediately before publication, and `npm run registry:integrity` passed for all 118 generated JSON files.

Publication is authorized separately from consumer deployment. The change follows the registry PR route into `dev`; the public namespace serves `main`. Publication requires promotion to `main` and verification that the three public item URLs contain the committed bytes. GitHub PR records retain the publication outcome; this document records the verification state before that operation. Other consumers require intentional item adoption/rebuild. Live Dynamics/PCF rollout remains unverified.
