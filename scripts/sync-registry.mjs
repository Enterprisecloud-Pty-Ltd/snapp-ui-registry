import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadFigmaTokens } from "./figma-tokens.mjs";

const registryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(registryRoot, "..");
const sourceDirectory = path.join(
	workspaceRoot,
	"blobstoragemanagersnapp",
	"src",
	"components",
	"ui",
);
const targetDirectory = path.join(registryRoot, "registry", "radix-nova", "ui");
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
		dependencies.add("utils");
	}
	for (const match of content.matchAll(/@\/components\/ui\/([a-z0-9.-]+)/g)) {
		const dependencyName = match[1].split(".")[0];
		if (dependencyName !== ownName) {
			dependencies.add(`snapp-${dependencyName}`);
		}
	}
	return [...dependencies].sort();
};

await mkdir(targetDirectory, { recursive: true });
const sourceFiles = (await readdir(sourceDirectory))
	.filter((fileName) => /\.(ts|tsx)$/.test(fileName))
	.sort();

for (const fileName of sourceFiles) {
	await copyFile(
		path.join(sourceDirectory, fileName),
		path.join(targetDirectory, fileName),
	);
}

const groups = new Map();
for (const fileName of sourceFiles) {
	const itemName = fileName.split(".")[0];
	const files = groups.get(itemName) ?? [];
	files.push(fileName);
	groups.set(itemName, files);
}

const componentItems = [];
for (const [itemName, files] of [...groups.entries()].sort(([left], [right]) =>
	left.localeCompare(right),
)) {
	const contents = await Promise.all(
		files.map((fileName) =>
			readFile(path.join(targetDirectory, fileName), "utf8"),
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
		description: `The shared Snapp ${itemName} UI primitive.`,
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
	"color-snapp-brand": "var(--snapp-brand)",
	"color-snapp-accent": "var(--snapp-accent)",
	"color-snapp-ink": "var(--snapp-ink)",
	"color-snapp-canvas": "var(--snapp-canvas)",
	"color-snapp-surface": "var(--snapp-surface)",
	"color-snapp-danger": "var(--snapp-danger)",
};
const lightVariables = {
	...figmaTokens.light,
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
};
const darkVariables = {
	"snapp-brand": "#d8e3ec",
	"snapp-accent": "#5fd4c2",
	"snapp-ink": "#f5f7f9",
	"snapp-canvas": "#18222c",
	"snapp-surface": "#202d39",
	"snapp-danger": "#fda29b",
	"snapp-indicator-border": "1.5px",
	"snapp-hairline": "1px",
	"snapp-control-inset": "2px",
	"snapp-tooltip-arrow-offset": "2px",
};
const inlineThemeVariables = {
	...figmaTokens.theme,
	...existingInlineThemeVariables,
};
const formatCssVariables = (variables) =>
	Object.entries(variables)
		.map(([name, value]) => `\t--${name}: ${value};`)
		.join("\n");

await writeFile(
	themeCssPath,
	`@theme {\n${formatCssVariables(existingThemeVariables)}\n}\n\n@theme inline {\n${formatCssVariables(inlineThemeVariables)}\n}\n\n:root,\n.ec-app {\n${formatCssVariables(lightVariables)}\n}\n\n.dark,\n.ec-app.dark,\n.ec-app .dark {\n${formatCssVariables(darkVariables)}\n}\n`,
);

const themeItem = {
	name: "snapp-theme",
	type: "registry:theme",
	title: "Snapp Theme",
	description:
		"Shared Snapp brand colors, typography, responsive breakpoints, and layout sizing tokens.",
	files: [
		{
			path: "registry/radix-nova/theme/snapp-theme.css",
			type: "registry:file",
			target: "src/styles/snapp-theme.css",
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

const registry = {
	$schema: "https://ui.shadcn.com/schema/registry.json",
	name: "snapp",
	homepage:
		"https://github.com/Enterprisecloud-Pty-Ltd/snapp-ui-registry",
	items: [themeItem, ...componentItems],
};

await writeFile(
	path.join(registryRoot, "registry.json"),
	`${JSON.stringify(registry, null, 2)}\n`,
);

console.log(
	`Synced ${sourceFiles.length} files into ${componentItems.length} component items.`,
);
