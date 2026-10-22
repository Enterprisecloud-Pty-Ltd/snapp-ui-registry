# Square header action width — 2026-10-22

The native Core Cabinet renders a top navbar and one content Snapp. With two page buttons at a 390px viewport, screenshot review found the square header's action buttons overlapping page labels: its `min-w-0 flex-1` action group could shrink below its non-shrinking children. Document scroll-width checks alone missed the overlap.

The canonical `registry/radix-nova/components/navigation/navigation-header.tsx` square action group now uses `min-w-max flex-1`, preserving the intrinsic action width so an explicitly wrapping host can move the group to another row. The updated desktop variant is unchanged. No tokens, icons, fixed desktop dimensions or callback behavior changed.

The Cabinet owner's production native-chain test now checks pairwise navigation-button intersections at 1440px and 390px as well as remaining-content geometry. The new assertion failed against the earlier artifact (`navigation controls must not overlap`); the refreshed artifacts must pass before acceptance. Navbar's two-shadow-root production harness also checks intersections at 375px, desktop dimensions, loaded Aptos and popup containment. Keep raw failed and successful checks in the stage-3 workpack evidence.

Run the complete `npm run registry:verify`, regenerate all public/r items and deliberately overwrite-install the full library into affected consumers, followed by formatter ownership and the runtime converter. Retain application-owned CSS only; no generated component forks. This is an unpublished local candidate, not proof of production registry rollout or live host compatibility.
