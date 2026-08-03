import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadFigmaTokens } from "./figma-tokens.mjs";

const registryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uiDirectory = path.join(registryRoot, "registry", "radix-nova", "ui");
const themeCssPath = path.join(
	registryRoot,
	"registry",
	"radix-nova",
	"theme",
	"snapp-theme.css",
);

const packageName = (specifier) => {
	if (specifier.startsWith("@")) {
		return specifier.split("/").slice(0, 2).join("/");
	}
	return specifier.split("/")[0];
};

const externalDependencies = (content) => {
	const dependencies = new Set();
	for (const match of content.matchAll(/from\s+["']([^"']+)["']/g)) {
		const specifier = match[1];
		if (
			!specifier.startsWith(".") &&
			!specifier.startsWith("@/") &&
			!specifier.startsWith("react")
		) {
			dependencies.add(packageName(specifier));
		}
	}
	return [...dependencies].sort();
};

const registryDependencies = (content, ownName) => {
	const dependencies = new Set();
	if (content.includes("@/lib/utils")) {
		dependencies.add("@snapp/snapp-utils");
	}
	if (content.includes("@/runtime/PortalContainer")) {
		dependencies.add("@snapp/snapp-portal-container");
	}
	for (const match of content.matchAll(/@\/components\/ui\/([a-z0-9.-]+)/g)) {
		const dependencyName = match[1].split(".")[0];
		if (dependencyName !== ownName) {
			dependencies.add(`@snapp/snapp-${dependencyName}`);
		}
	}
	return [...dependencies].sort();
};

await mkdir(uiDirectory, { recursive: true });
const sourceFiles = (await readdir(uiDirectory))
	.filter((fileName) => /\.(ts|tsx)$/.test(fileName))
	.sort();

const groups = new Map();
for (const fileName of sourceFiles) {
	const itemName = fileName.split(".")[0];
	const files = groups.get(itemName) ?? [];
	files.push(fileName);
	groups.set(itemName, files);
}

const componentDescriptions = {
	combobox:
		"The standard searchable Snapp option picker for single-select and autocomplete controls.",
	select:
		"The non-searchable Snapp option picker for exceptional fixed-choice controls where search is intentionally not required.",
};

const componentItems = [];
for (const [itemName, files] of [...groups.entries()].sort(([left], [right]) =>
	left.localeCompare(right),
)) {
	const contents = await Promise.all(
		files.map((fileName) =>
			readFile(path.join(uiDirectory, fileName), "utf8"),
		),
	);
	const combinedContent = contents.join("\n");
	const dependencies = externalDependencies(combinedContent);
	const registryDeps = registryDependencies(combinedContent, itemName);
	componentItems.push({
		name: `snapp-${itemName}`,
		type: "registry:ui",
		title: `Snapp ${itemName
			.split("-")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" ")}`,
		description:
			componentDescriptions[itemName] ??
			`The shared Snapp ${itemName} UI primitive.`,
		...(dependencies.length > 0 ? { dependencies } : {}),
		...(registryDeps.length > 0
			? { registryDependencies: registryDeps }
			: {}),
		files: files.map((fileName) => ({
			path: `registry/radix-nova/ui/${fileName}`,
			type: "registry:ui",
			target: `@ui/${fileName}`,
		})),
	});
}

const figmaTokens = await loadFigmaTokens(registryRoot);
const existingThemeVariables = {
	"breakpoint-snapp-phone": "26.25rem",
	"breakpoint-snapp-narrow": "30rem",
	"breakpoint-snapp-compact": "35rem",
	"breakpoint-snapp-mobile": "47.5rem",
	"breakpoint-snapp-desktop": "53.75rem",
	"breakpoint-snapp-tablet": "56.25rem",
	"breakpoint-snapp-layout": "62.5rem",
	"breakpoint-snapp-wide": "68.75rem",
	"spacing-snapp-card": "7.5625rem",
	"spacing-snapp-card-width": "15.9375rem",
	"spacing-snapp-content": "68.25rem",
	"spacing-snapp-article": "53.75rem",
	"spacing-snapp-page": "min(68.25rem, calc(100% - 4rem))",
	"spacing-snapp-page-mobile": "calc(100% - 2rem)",
	"spacing-snapp-search": "min(41.75rem, calc(100% - 2rem))",
	"spacing-snapp-hero-title": "min(37.125rem, 100%)",
	"spacing-snapp-hero-copy": "min(48.375rem, 90%)",
	"spacing-snapp-card-half": "calc((100% - 1.5rem) / 2)",
	"spacing-snapp-hero-x": "6.3125rem",
	"spacing-snapp-overlay-max": "80vh",
	"spacing-snapp-dialog-max": "calc(100% - 2rem)",
	"spacing-snapp-form": "min(32.5rem, 100%)",
	"spacing-snapp-search-results": "calc(100% - 3.25rem)",
	"spacing-snapp-skeleton-72": "72%",
	"spacing-snapp-skeleton-68": "68%",
	"spacing-snapp-skeleton-54": "54%",
	"spacing-snapp-viewport-min": "20rem",
	"spacing-snapp-sidebar": "16rem",
	"text-snapp-tiny": "0.625rem",
	"text-snapp-micro": "0.6875rem",
	"text-snapp-caption": "0.8125rem",
	"text-snapp-body-sm": "0.9375rem",
	"text-snapp-display-sm": "2.375rem",
	"text-snapp-display": "2.5rem",
	"leading-snapp-display-sm": "2.5rem",
	"leading-snapp-display": "2.75rem",
	"radius-snapp-control": "0.625rem",
	"radius-snapp-mark": "0.125rem 0.4375rem 0.125rem 0.4375rem",
};
const existingInlineThemeVariables = {
	"color-snapp-border-card": "var(--snapp-border-card)",
	"color-snapp-card-border": "var(--snapp-border-card)",
	"color-snapp-skeleton-icon": "var(--snapp-skeleton-icon)",
	"color-snapp-skeleton-line": "var(--snapp-skeleton-line)",
	"color-snapp-skeleton-soft": "var(--snapp-skeleton-soft)",
	"color-snapp-brand": "var(--snapp-brand)",
	"color-snapp-accent": "var(--snapp-accent)",
	"color-snapp-ink": "var(--snapp-ink)",
	"color-snapp-canvas": "var(--snapp-canvas)",
	"color-snapp-surface": "var(--snapp-surface)",
	"color-snapp-danger": "var(--snapp-danger)",
	"shadow-snapp-card-hover": "var(--snapp-shadow-card-hover)",
	"shadow-snapp-drag-preview": "var(--snapp-shadow-drag-preview)",
};
const shadcnCompatibilityVariables = {
	radius: "var(--snapp-radius-m)",
	background: "var(--snapp-surface)",
	foreground: "var(--snapp-ink)",
	card: "var(--snapp-surface)",
	"card-foreground": "var(--snapp-ink)",
	popover: "var(--snapp-surface)",
	"popover-foreground": "var(--snapp-ink)",
	primary: "var(--snapp-brand)",
	"primary-foreground": "var(--snapp-text-invert)",
	secondary: "var(--snapp-surface-secondary)",
	"secondary-foreground": "var(--snapp-text-primary)",
	muted: "var(--snapp-surface-secondary)",
	"muted-foreground": "var(--snapp-text-secondary)",
	accent: "var(--snapp-surface-secondary)",
	"accent-foreground": "var(--snapp-text-primary)",
	destructive: "var(--snapp-danger)",
	border: "var(--snapp-border-primary)",
	input: "var(--snapp-border-card)",
	ring: "var(--snapp-border-brand)",
	sidebar: "var(--snapp-surface-secondary)",
	"sidebar-foreground": "var(--snapp-text-primary)",
	"sidebar-primary": "var(--snapp-brand)",
	"sidebar-primary-foreground": "var(--snapp-text-invert)",
	"sidebar-accent": "var(--snapp-surface-primary)",
	"sidebar-accent-foreground": "var(--snapp-text-primary)",
	"sidebar-border": "var(--snapp-border-primary)",
	"sidebar-ring": "var(--snapp-border-brand)",
};
const lightVariables = {
	...figmaTokens.light,
	"snapp-border-card": "rgb(42 44 46 / 15%)",
	"snapp-skeleton-icon": "rgb(64 191 172 / 20%)",
	"snapp-skeleton-line": "rgb(42 44 46 / 10%)",
	"snapp-skeleton-soft": "rgb(42 44 46 / 5%)",
	"snapp-shadow-card-hover": "0 0.25rem 0.46875rem rgb(0 0 0 / 10%)",
	"snapp-shadow-drag-preview": "0 0.25rem 0.375rem rgb(0 0 0 / 25%)",
	"snapp-brand": "var(--snapp-colour-brand-primary)",
	"snapp-accent": "var(--snapp-colour-brand-accent)",
	"snapp-ink": "var(--snapp-text-primary)",
	"snapp-canvas": "#eef1f4",
	"snapp-surface": "var(--snapp-surface-primary)",
	"snapp-danger": "var(--snapp-colour-secondary-red)",
	"snapp-indicator-border": "1.5px",
	"snapp-hairline": "1px",
	"snapp-control-inset": "2px",
	"snapp-tooltip-arrow-offset": "2px",
	...shadcnCompatibilityVariables,
};
const darkVariables = {
	"snapp-brand": "#d8e3ec",
	"snapp-accent": "#5fd4c2",
	"snapp-ink": "#f5f7f9",
	"snapp-canvas": "#18222c",
	"snapp-surface": "#202d39",
	"snapp-danger": "#fda29b",
	"snapp-shadow-drag-preview": "0 0.25rem 0.375rem rgb(0 0 0 / 45%)",
	"snapp-indicator-border": "1.5px",
	"snapp-hairline": "1px",
	"snapp-control-inset": "2px",
	"snapp-tooltip-arrow-offset": "2px",
	...shadcnCompatibilityVariables,
};
const inlineThemeVariables = {
	...figmaTokens.theme,
	...existingInlineThemeVariables,
};
const formatCssVariables = (variables) =>
	Object.entries(variables)
		.map(([name, value]) => `\t--${name}: ${value};`)
		.join("\n");

const interactiveCursorCss = `\t.ec-app :where(
\t\ta[href],
\t\tbutton:not(:disabled),
\t\tinput:is([type="checkbox"], [type="radio"], [type="range"], [type="color"], [type="file"]):not(:disabled),
\t\tlabel[for],
\t\tselect:not(:disabled),
\t\tsummary,
\t\t[role="button"]:not([aria-disabled="true"]):not([data-disabled]),
\t\t[role="checkbox"]:not([aria-disabled="true"]):not([data-disabled]),
\t\t[role="link"]:not([aria-disabled="true"]):not([data-disabled]),
\t\t[role="menuitem"]:not([aria-disabled="true"]):not([data-disabled]),
\t\t[role="menuitemcheckbox"]:not([aria-disabled="true"]):not([data-disabled]),
\t\t[role="menuitemradio"]:not([aria-disabled="true"]):not([data-disabled]),
\t\t[role="option"]:not([aria-disabled="true"]):not([data-disabled]),
\t\t[role="radio"]:not([aria-disabled="true"]):not([data-disabled]),
\t\t[role="slider"]:not([aria-disabled="true"]):not([data-disabled]),
\t\t[role="switch"]:not([aria-disabled="true"]):not([data-disabled]),
\t\t[role="tab"]:not([aria-disabled="true"]):not([data-disabled]),
\t\t[role="treeitem"]:not([aria-disabled="true"]):not([data-disabled])
\t) {
\t\tcursor: pointer !important;
\t}

\t.ec-app :where(
\t\tbutton:disabled,
\t\tinput:disabled,
\t\tselect:disabled,
\t\t[aria-disabled="true"],
\t\t[data-disabled]
\t) {
\t\tcursor: not-allowed !important;
\t}`;

await writeFile(
	themeCssPath,
	`@theme {\n${formatCssVariables(existingThemeVariables)}\n}\n\n@theme inline {\n${formatCssVariables(inlineThemeVariables)}\n}\n\n:root,\n.ec-app {\n${formatCssVariables(lightVariables)}\n}\n\n.dark,\n.ec-app.dark,\n.ec-app .dark {\n${formatCssVariables(darkVariables)}\n}\n\n@layer base {\n\t.ec-app,\n\t.ec-app *,\n\t.ec-app *::before,\n\t.ec-app *::after {\n\t\tbox-sizing: border-box;\n\t}\n\n\t.ec-app button,\n\t.ec-app input,\n\t.ec-app select,\n\t.ec-app textarea {\n\t\tfont: inherit;\n\t}\n\n\t.ec-app button {\n\t\tappearance: none;\n\t}\n\n${interactiveCursorCss}\n}\n`,
);

const themeItem = {
	name: "snapp-theme",
	type: "registry:theme",
	title: "Snapp Theme",
	description:
		"Shared Snapp brand colors, typography, responsive breakpoints, and layout sizing tokens.",
	dependencies: [
		"@fontsource/ibm-plex-sans",
		"@fontsource/judson",
	],
	css: {
		'@import "./styles/snapp-theme.css"': {},
		'@import "./styles/snapp-fonts.css"': {},
	},
	files: [
		{
			path: "registry/radix-nova/theme/snapp-theme.css",
			type: "registry:file",
			target: "src/styles/snapp-theme.css",
		},
		{
			path: "registry/radix-nova/theme/snapp-fonts.css",
			type: "registry:file",
			target: "src/styles/snapp-fonts.css",
		},
		...figmaTokens.files,
	],
	cssVars: {
		theme: {
			...existingThemeVariables,
			...inlineThemeVariables,
		},
		light: lightVariables,
		dark: darkVariables,
	},
};

const utilityItem = {
	name: "snapp-utils",
	type: "registry:lib",
	title: "Snapp Utilities",
	description:
		"Shared class-name utility with Tailwind merge support for Snapp typography tokens.",
	dependencies: ["clsx", "tailwind-merge"],
	files: [
		{
			path: "registry/radix-nova/lib/utils.ts",
			type: "registry:lib",
			target: "@lib/utils.ts",
		},
	],
};

const featureParametersItem = {
	name: "snapp-feature-parameters",
	type: "registry:lib",
	title: "Snapp Feature Parameters",
	description:
		"Shared, typed parsing for boolean feature parameters such as showNavBar.",
	dependencies: ["zod"],
	files: [
		{
			path: "registry/radix-nova/lib/feature-parameters.ts",
			type: "registry:lib",
			target: "@lib/snapp-feature-parameters.ts",
		},
	],
};

const searchUtilitiesItem = {
	name: "snapp-search-utils",
	type: "registry:lib",
	title: "Snapp Search Utilities",
	description:
		"Shared normalization and multi-word matching helpers for feature-owned search fields.",
	files: [
		{
			path: "registry/radix-nova/lib/search.ts",
			type: "registry:lib",
			target: "@lib/search.ts",
		},
	],
};

const portalContainerItem = {
	name: "snapp-portal-container",
	type: "registry:lib",
	title: "Snapp Portal Container",
	description:
		"Shared portal-container context for cabinet-safe dialogs, menus, popovers, tooltips, and searchable comboboxes.",
	files: [
		{
			path: "registry/radix-nova/runtime/PortalContainer.ts",
			type: "registry:lib",
			target: "src/runtime/PortalContainer.ts",
		},
	],
};

const featureLayoutItem = {
	name: "snapp-feature-layout",
	type: "registry:component",
	title: "Snapp Feature Layout",
	description:
		"Shared feature shell, page body, and bordered surface primitives for embedded Snapps.",
	registryDependencies: [
		"@snapp/snapp-theme",
		"@snapp/snapp-utils",
	],
	files: [
		{
			path: "registry/radix-nova/components/layout/feature-layout.tsx",
			type: "registry:component",
			target: "@components/snapp/layout/feature-layout.tsx",
		},
	],
};

const landingCardItem = {
	name: "snapp-landing-card",
	type: "registry:component",
	title: "Snapp Landing Card",
	description:
		"Figma-aligned landing card for catalogue and knowledge-base entry points.",
	registryDependencies: [
		"@snapp/snapp-theme",
		"@snapp/snapp-utils",
	],
	files: [
		{
			path: "registry/radix-nova/components/catalogue/landing-card.tsx",
			type: "registry:component",
			target: "@components/snapp/catalogue/landing-card.tsx",
		},
	],
};

const landingSkeletonItem = {
	name: "snapp-landing-skeleton",
	type: "registry:component",
	title: "Snapp Landing Skeleton",
	description:
		"Accessible loading skeleton for the shared Snapp hero, search, and catalogue-card layout.",
	registryDependencies: [
		"@snapp/snapp-skeleton",
		"@snapp/snapp-theme",
		"@snapp/snapp-utils",
	],
	files: [
		{
			path: "registry/radix-nova/components/catalogue/landing-skeleton.tsx",
			type: "registry:component",
			target: "@components/snapp/catalogue/landing-skeleton.tsx",
		},
	],
};

const featureBreadcrumbItem = {
	name: "snapp-feature-breadcrumb",
	type: "registry:component",
	title: "Snapp Feature Breadcrumb",
	description:
		"Figma-aligned pill breadcrumb with clickable ancestors and an accessible current-page state.",
	dependencies: ["lucide-react"],
	registryDependencies: [
		"@snapp/snapp-breadcrumb",
		"@snapp/snapp-theme",
		"@snapp/snapp-utils",
	],
	files: [
		{
			path: "registry/radix-nova/components/navigation/feature-breadcrumb.tsx",
			type: "registry:component",
			target: "@components/snapp/navigation/feature-breadcrumb.tsx",
		},
	],
};

const catalogueHeroItem = {
	name: "snapp-catalogue-hero",
	type: "registry:component",
	title: "Snapp Catalogue Hero",
	description:
		"Shared responsive catalogue hero with title, supporting copy, search form, and entry-card region.",
	dependencies: ["lucide-react"],
	registryDependencies: [
		"@snapp/snapp-theme",
		"@snapp/snapp-utils",
	],
	files: [
		{
			path: "registry/radix-nova/components/catalogue/catalogue-hero.tsx",
			type: "registry:component",
			target: "@components/snapp/catalogue/catalogue-hero.tsx",
		},
	],
};

const catalogueResultCardItem = {
	name: "snapp-catalogue-result-card",
	type: "registry:component",
	title: "Snapp Catalogue Result Card",
	description:
		"Shared bordered result card for knowledge articles and Service Catalogue Items.",
	dependencies: ["lucide-react"],
	registryDependencies: [
		"@snapp/snapp-theme",
		"@snapp/snapp-utils",
	],
	files: [
		{
			path: "registry/radix-nova/components/catalogue/catalogue-result-card.tsx",
			type: "registry:component",
			target: "@components/snapp/catalogue/catalogue-result-card.tsx",
		},
	],
};

const helpArticleAccordionItem = {
	name: "snapp-help-article-accordion",
	type: "registry:component",
	title: "Snapp Help Article Accordion",
	description:
		"Single-expand help-article accordion that loads fully collapsed unless a default article is explicitly provided.",
	registryDependencies: [
		"@snapp/snapp-accordion",
		"@snapp/snapp-theme",
		"@snapp/snapp-utils",
	],
	files: [
		{
			path:
				"registry/radix-nova/components/catalogue/help-article-accordion.tsx",
			type: "registry:component",
			target: "@components/snapp/catalogue/help-article-accordion.tsx",
		},
	],
};

const catalogueCoreItem = {
	name: "snapp-catalogue-core",
	type: "registry:component",
	title: "Snapp Catalogue Core",
	description:
		"Complete shared UI foundation for catalogue and knowledge-base Snapps.",
	registryDependencies: [
		"@snapp/snapp-catalogue-hero",
		"@snapp/snapp-catalogue-result-card",
		"@snapp/snapp-feature-breadcrumb",
		"@snapp/snapp-feature-layout",
		"@snapp/snapp-feature-parameters",
		"@snapp/snapp-help-article-accordion",
		"@snapp/snapp-landing-card",
		"@snapp/snapp-landing-skeleton",
		"@snapp/snapp-search-utils",
	],
	files: [
		{
			path: "registry/radix-nova/components/catalogue/catalogue-core.ts",
			type: "registry:component",
			target: "@components/snapp/catalogue/catalogue-core.ts",
		},
	],
};

const dragFeedbackItem = {
	name: "snapp-drag-feedback",
	type: "registry:component",
	title: "Snapp Drag Feedback",
	description:
		"Figma-aligned native drag preview and fixed-size drop indicator for draggable Snapp interfaces.",
	registryDependencies: [
		"@snapp/snapp-theme",
		"@snapp/snapp-utils",
	],
	files: [
		{
			path: "registry/radix-nova/components/drag/drag-feedback.tsx",
			type: "registry:component",
			target: "@components/snapp/drag/drag-feedback.tsx",
		},
		{
			path: "registry/radix-nova/components/drag/order.svg",
			type: "registry:file",
			target: "@components/snapp/drag/order.svg",
		},
	],
};

const workItemCore = {
	name: "snapp-work-item-core",
	type: "registry:component",
	title: "Snapp Work Item Core",
	description: "Shared Work OS work-item types and exact vector icons.",
	registryDependencies: ["@snapp/snapp-theme"],
	files: [
		{
			path: "registry/radix-nova/components/work-os/work-item.types.ts",
			type: "registry:component",
			target: "@components/snapp/work-os/work-item.types.ts",
		},
		{
			path: "registry/radix-nova/components/work-os/work-item-icons.tsx",
			type: "registry:component",
			target: "@components/snapp/work-os/work-item-icons.tsx",
		},
	],
};

const timeBadgeItem = {
	name: "snapp-time-badge",
	type: "registry:component",
	title: "Snapp Time Badge",
	description: "Figma-aligned Work OS duration badge with danger state.",
	registryDependencies: [
		"@snapp/snapp-theme",
		"@snapp/snapp-utils",
		"@snapp/snapp-work-item-core",
	],
	files: [
		{
			path: "registry/radix-nova/components/work-os/time-badge.tsx",
			type: "registry:component",
			target: "@components/snapp/work-os/time-badge.tsx",
		},
	],
};

const progressMeterItem = {
	name: "snapp-progress-meter",
	type: "registry:component",
	title: "Snapp Progress Meter",
	description: "Figma-aligned Work OS capacity progress meter.",
	registryDependencies: [
		"@snapp/snapp-theme",
		"@snapp/snapp-utils",
		"@snapp/snapp-work-item-core",
	],
	files: [
		{
			path: "registry/radix-nova/components/work-os/progress-meter.tsx",
			type: "registry:component",
			target: "@components/snapp/work-os/progress-meter.tsx",
		},
	],
};

const workItemCard = {
	name: "snapp-work-item-card",
	type: "registry:component",
	title: "Snapp Work Item Card",
	description:
		"Figma-aligned Work OS item card with fixed icon, duration, and capacity geometry.",
	registryDependencies: [
		"@snapp/snapp-card",
		"@snapp/snapp-progress-meter",
		"@snapp/snapp-theme",
		"@snapp/snapp-time-badge",
		"@snapp/snapp-utils",
		"@snapp/snapp-work-item-core",
	],
	files: [
		{
			path: "registry/radix-nova/components/work-os/work-item-card.tsx",
			type: "registry:component",
			target: "@components/snapp/work-os/work-item-card.tsx",
		},
	],
};

const registry = {
	$schema: "https://ui.shadcn.com/schema/registry.json",
	name: "snapp",
	homepage:
		"https://github.com/Enterprisecloud-Pty-Ltd/snapp-ui-registry",
	items: [
		themeItem,
		utilityItem,
		featureParametersItem,
		searchUtilitiesItem,
		portalContainerItem,
		...componentItems,
		featureLayoutItem,
		landingCardItem,
		landingSkeletonItem,
		featureBreadcrumbItem,
		catalogueHeroItem,
		catalogueResultCardItem,
		helpArticleAccordionItem,
		catalogueCoreItem,
		dragFeedbackItem,
		workItemCore,
		timeBadgeItem,
		progressMeterItem,
		workItemCard,
	],
};

await writeFile(
	path.join(registryRoot, "registry.json"),
	`${JSON.stringify(registry, null, 2)}\n`,
);

console.log(
	`Generated ${componentItems.length} UI items from ${sourceFiles.length} canonical registry files.`,
);
