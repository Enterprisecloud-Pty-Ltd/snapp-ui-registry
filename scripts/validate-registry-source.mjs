import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const registryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(
	await readFile(path.join(registryRoot, "registry.json"), "utf8"),
);
const errors = [];
const itemsByName = new Map();
const localDependencyName = (dependency) =>
	dependency.startsWith("@snapp/") ? dependency.slice("@snapp/".length) : null;
const forbiddenHostRuntimeMarkers = [
	"data-snapp-host-context",
	"getSnappHostContext",
	"installSnappHostContextBridge",
	"snapp.host.",
	"sessionStorage",
];

for (const item of registry.items) {
	if (itemsByName.has(item.name)) {
		errors.push(`Duplicate registry item: ${item.name}`);
	}
	itemsByName.set(item.name, item);
}

for (const item of registry.items) {
	for (const dependency of item.registryDependencies ?? []) {
		const localName = localDependencyName(dependency);
		if (!localName) {
			errors.push(
				`${item.name} has unqualified registry dependency ${dependency}`,
			);
			continue;
		}
		if (!itemsByName.has(localName)) {
			errors.push(`${item.name} references missing registry item ${dependency}`);
		}
		if (localName === "utils") {
			errors.push(`${item.name} still references the default utils item`);
		}
	}

	for (const file of item.files ?? []) {
		const sourcePath = path.join(registryRoot, file.path);
		let content;
		try {
			content = await readFile(sourcePath, "utf8");
		} catch {
			errors.push(`${item.name} references missing file ${file.path}`);
			continue;
		}

		if (
			content.includes("@/lib/utils") &&
			!(item.registryDependencies ?? []).includes("@snapp/snapp-utils")
		) {
			errors.push(`${item.name} imports @/lib/utils without snapp-utils`);
		}

		for (const marker of forbiddenHostRuntimeMarkers) {
			if (content.includes(marker)) {
				errors.push(
					`${item.name} owns host runtime marker ${marker}; inject host state from the consuming app instead`,
				);
			}
		}
	}
}

const utilityItem = itemsByName.get("snapp-utils");
if (!utilityItem) {
	errors.push("Missing snapp-utils registry item");
} else {
	const utilitySource = await readFile(
		path.join(registryRoot, utilityItem.files[0].path),
		"utf8",
	);
	let executable = ts.transpileModule(utilitySource, {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
	for (const dependency of ['clsx','tailwind-merge']) executable = executable.replaceAll(`from "${dependency}"`, `from ${JSON.stringify(import.meta.resolve(dependency))}`);
	const {cn} = await import('data:text/javascript;base64,' + Buffer.from(executable).toString('base64'));
	const merged = cn(
		"text-snapp-xs leading-snapp-xxs text-snapp-text-secondary",
	);
	if (
		merged !==
		"text-snapp-xs leading-snapp-xxs text-snapp-text-secondary"
	) {
		errors.push(`snapp-utils typography merge failed: ${merged}`);
	}
	for (const prefix of ['', 'ec:']) {
		if (cn(prefix+'leading-snapp-xxs', prefix+'leading-[normal]') !== prefix+'leading-[normal]') errors.push('SNAPP line-height must yield to a later explicit normal line-height');
		if (cn(prefix+'leading-5', prefix+'leading-snapp-xs') !== prefix+'leading-snapp-xs') errors.push('SNAPP line-height must replace an earlier scale line-height');
	}
}

const skeletonItem = itemsByName.get("snapp-skeleton");
if (!skeletonItem) {
	errors.push("Missing snapp-skeleton registry item");
} else {
	if (
		!(skeletonItem.registryDependencies ?? []).includes(
			"@snapp/snapp-theme",
		)
	) {
		errors.push("snapp-skeleton must install the SNAPP theme");
	}
	const skeletonSource = await readFile(
		path.join(registryRoot, skeletonItem.files[0].path),
		"utf8",
	);
	for (const contract of [
		"SkeletonGroup",
		'aria-busy="true"',
		'role="status"',
		"bg-snapp-skeleton-soft",
		"motion-reduce:animate-none",
	]) {
		if (!skeletonSource.includes(contract)) {
			errors.push(`snapp-skeleton is missing ${contract}`);
		}
	}
}

const uiFoundationItem = itemsByName.get("snapp-ui-foundation");
if (!uiFoundationItem) {
	errors.push("Missing snapp-ui-foundation registry item");
} else {
	const foundationDependencies = new Set(
		uiFoundationItem.registryDependencies ?? [],
	);
	for (const item of registry.items.filter(
		(candidate) => candidate.type === "registry:ui",
	)) {
		const dependency = `@snapp/${item.name}`;
		if (!foundationDependencies.has(dependency)) {
			errors.push(`snapp-ui-foundation is missing ${dependency}`);
		}
	}
	if (!foundationDependencies.has("@snapp/snapp-theme")) {
		errors.push("snapp-ui-foundation must install the SNAPP theme");
	}
}

const themeItem = itemsByName.get("snapp-theme");
if (!themeItem) {
	errors.push("Missing snapp-theme registry item");
}
for (const fontPackage of [
	"@fontsource/ibm-plex-sans",
	"@fontsource/judson",
]) {
	if (!(themeItem?.dependencies ?? []).includes(fontPackage)) {
		errors.push(`snapp-theme does not install ${fontPackage}`);
	}
}
const themeImport = '@import "./styles/snapp-theme.css"';
if (!themeItem?.css?.[themeImport]) {
	errors.push(`snapp-theme is missing ${themeImport}`);
}
const fontImport = '@import "./styles/snapp-fonts.css"';
if (!themeItem?.css?.[fontImport]) {
	errors.push(`snapp-theme is missing ${fontImport}`);
}

const themeFile = themeItem?.files?.find(
	(file) => file.target === "src/styles/snapp-theme.css",
);
if (!themeFile) {
	errors.push("snapp-theme is missing the generated theme source file");
} else {
	const themeSource = await readFile(
		path.join(registryRoot, themeFile.path),
		"utf8",
	);
	for (const contract of [
		'@custom-variant data-horizontal (&[data-orientation="horizontal"]);',
		'@custom-variant data-vertical (&[data-orientation="vertical"]);',
		"--radius-snapp-action-menu: 0.375rem;",
		"--radius: var(--snapp-radius-standard);",
		"--background: var(--snapp-surface);",
		"--border: var(--snapp-border-primary);",
		"box-sizing: border-box;",
		"font: inherit;",
	]) {
		if (!themeSource.includes(contract)) {
			errors.push(`snapp-theme.css is missing ${contract}`);
		}
	}
}

const fontFile = themeItem?.files?.find(
	(file) => file.target === "src/styles/snapp-fonts.css",
);
if (!fontFile) {
	errors.push("snapp-theme is missing the ordered font source file");
} else {
	const fontSource = await readFile(
		path.join(registryRoot, fontFile.path),
		"utf8",
	);
	const manifest = JSON.parse(await readFile(path.join(registryRoot, "docs/figma-library/font-manifest.json"), "utf8"));
	const embeddedFaces = new Map();
	for (const match of fontSource.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)) {
		const body = match[1];
		const family = body.match(/font-family:\s*["']([^"']+)["']/)?.[1];
		const weight = Number(body.match(/font-weight:\s*(\d+)/)?.[1]);
		const style = body.match(/font-style:\s*([^;\s]+)/)?.[1];
		const source = body.match(/data:font\/(ttf|woff2);base64,([A-Za-z0-9+/=]+)/);
		if (!family || !weight || style !== "normal" || !source) {
			errors.push("snapp-fonts.css contains an incomplete or non-self-contained font face");
			continue;
		}
		const key = `${family}/${weight}/${style}`;
		if (embeddedFaces.has(key)) errors.push(`snapp-fonts.css contains duplicate face ${key}`);
		const bytes = Buffer.from(source[2], "base64");
		embeddedFaces.set(key, { bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
	}
	if (embeddedFaces.size !== manifest.faces.length) errors.push("snapp-fonts.css face count differs from the source font manifest");
	for (const face of manifest.faces) {
		const key = `${face.family}/${face.weight}/${face.style}`;
		const embedded = embeddedFaces.get(key);
		if (!embedded || embedded.bytes !== face.bytes || embedded.sha256 !== face.sha256) errors.push(`snapp-fonts.css does not preserve the exact font bytes for ${key}`);
		const sourcePath = path.resolve(registryRoot, face.source);
		if (!sourcePath.startsWith(`${registryRoot}${path.sep}`)) {
			errors.push(`Font manifest source escapes the registry: ${face.source}`);
			continue;
		}
		const bytes = await readFile(sourcePath);
		if (bytes.length !== face.bytes || createHash("sha256").update(bytes).digest("hex") !== face.sha256) errors.push(`Font manifest source hash mismatch: ${face.source}`);
	}
	for (const required of ["Aptos/300/normal", "Aptos/400/normal", "Aptos/600/normal", "Aptos/700/normal", "Inter/400/normal", "Inter/500/normal", "IBM Plex Sans/400/normal", "IBM Plex Sans/700/normal"]) {
		if (!embeddedFaces.has(required)) errors.push(`snapp-fonts.css is missing required face ${required}`);
	}
	if (/url\(\s*["']?(?:https?:|\.\.|\/)/i.test(fontSource)) errors.push("snapp-fonts.css must not depend on remote or filesystem font URLs");
	for (const target of ["src/styles/licenses/inter-LICENSE.txt", "src/styles/licenses/ibm-plex-sans-LICENSE.txt", "src/styles/licenses/judson-LICENSE.txt", "src/styles/licenses/Microsoft Aptos Fonts EULA.rtf", "src/styles/licenses/README.md"]) {
		const license = themeItem.files.find(file => file.target === target);
		if (!license || !(await readFile(path.join(registryRoot, license.path))).length) errors.push(`snapp-theme must retain the nonempty font license ${target}`);
	}
}

for (const requiredItem of [
	"snapp-catalogue-core",
	"snapp-catalogue-hero",
	"snapp-catalogue-result-card",
	"snapp-feature-breadcrumb",
	"snapp-feature-parameters",
	"snapp-feature-layout",
	"snapp-system-status-screen",
	"snapp-filter-controls",
	"snapp-help-article-accordion",
	"snapp-search-utils",
]) {
	if (!itemsByName.has(requiredItem)) {
		errors.push(`Missing ${requiredItem} registry item`);
	}
}

const filterControlsItem = itemsByName.get("snapp-filter-controls");
if (filterControlsItem) {
	const filterControlsSource = await readFile(
		path.join(registryRoot, filterControlsItem.files[0].path),
		"utf8",
	);
	for (const contract of [
		"data-snapp-filter-interaction",
		"event.composedPath()",
		"shadow-snapp-flyout",
		"bg-snapp-surface-secondary",
		"w-91",
		"h-7",
		// The 1px native stroke participates in Figma's 12px/8px outer insets.
		"px-2.75 py-1.75",
		"font-sans text-sm leading-5 font-normal",
		"h-9",
	]) {
		if (!filterControlsSource.includes(contract)) {
			errors.push(`snapp-filter-controls is missing ${contract}`);
		}
	}
}

const searchUtilitiesItem = itemsByName.get("snapp-search-utils");
if (searchUtilitiesItem) {
	const searchUtilitiesSource = await readFile(
		path.join(registryRoot, searchUtilitiesItem.files[0].path),
		"utf8",
	);
	for (const contract of [
		"function filterSearchCollection",
		"readonly SearchValue[]",
		"items.filter",
	]) {
		if (!searchUtilitiesSource.includes(contract)) {
			errors.push(`snapp-search-utils is missing ${contract}`);
		}
	}
}

const comboboxItem = itemsByName.get("snapp-combobox");
if (comboboxItem) {
	const comboboxSource = await readFile(
		path.join(registryRoot, comboboxItem.files[0].path),
		"utf8",
	);
	for (const contract of [
		"trailingIcon?: React.ReactNode",
		"combobox-trailing-icon",
		'positionMethod={positionMethod ?? "fixed"}',
		"border-snapp-border-primary!",
		"bg-popover!",
		"text-popover-foreground!",
		"shadow-snapp-flyout!",
		"p-2!",
		"min-h-7!",
		"py-1!",
		"pl-2!",
		"pr-8!",
	]) {
		if (!comboboxSource.includes(contract)) {
			errors.push(`snapp-combobox is missing ${contract}`);
		}
	}
}

for (const portalItemName of [
	"snapp-alert-dialog",
	"snapp-combobox",
	"snapp-context-menu",
	"snapp-dialog",
	"snapp-drawer",
	"snapp-dropdown-menu",
	"snapp-hover-card",
	"snapp-menubar",
	"snapp-popover",
	"snapp-select",
	"snapp-sheet",
	"snapp-tooltip",
]) {
	const portalItem = itemsByName.get(portalItemName);
	if (!portalItem) {
		errors.push(`Missing ${portalItemName} registry item`);
		continue;
	}

	const portalSource = await readFile(
		path.join(registryRoot, portalItem.files[0].path),
		"utf8",
	);
	for (const contract of [
		'from "@/runtime/PortalContainer"',
		"usePortalContainer()",
		"container={portalContainer ?? undefined}",
	]) {
		if (!portalSource.includes(contract)) {
			errors.push(`${portalItemName} is missing portal contract ${contract}`);
		}
	}
}

const buttonItem = itemsByName.get("snapp-button");
if (buttonItem) {
	const buttonSource = await readFile(
		path.join(registryRoot, buttonItem.files[0].path),
		"utf8",
	);
	for (const contract of [
		'"form-primary"',
		'"form-secondary"',
		'"form-destructive"',
		"bg-snapp-surface-brand",
		"bg-snapp-surface-red",
		"hover:bg-[#43576c]",
		"hover:bg-[#971b13]",
		"active:bg-[#7a150f]",
		"h-11 gap-2.5 px-6 py-3",
		"text-sm leading-5 font-normal",
	]) {
		if (!buttonSource.includes(contract)) {
			errors.push(`snapp-button modal actions are missing ${contract}`);
		}
	}
	for (const contract of [
		"overflow:",
		"border-0 bg-transparent",
		"text-snapp-icon-primary",
		"hover:bg-snapp-surface-secondary",
		"focus-visible:ring-snapp-border-highlight",
		"h-5 w-5.5 rounded-sm p-0",
		"[&_svg:not([class*='size-'])]:size-4",
	]) {
		if (!buttonSource.includes(contract)) {
			errors.push(`snapp-button overflow actions are missing ${contract}`);
		}
	}
}

const helpArticleAccordionItem = itemsByName.get(
	"snapp-help-article-accordion",
);
if (helpArticleAccordionItem) {
	const helpArticleAccordionSource = await readFile(
		path.join(registryRoot, helpArticleAccordionItem.files[0].path),
		"utf8",
	);
	if (helpArticleAccordionSource.includes("articles[0]")) {
		errors.push(
			"snapp-help-article-accordion must not expand the first article by default",
		);
	}
	for (const className of ["bg-transparent", "hover:bg-transparent"]) {
		if (!helpArticleAccordionSource.includes(className)) {
			errors.push(
				`snapp-help-article-accordion is missing ${className}`,
			);
		}
	}
}

const featureBreadcrumbItem = itemsByName.get("snapp-feature-breadcrumb");
if (featureBreadcrumbItem) {
	const featureBreadcrumbSource = await readFile(
		path.join(registryRoot, featureBreadcrumbItem.files[0].path),
		"utf8",
	);
	for (const className of [
		"m-0",
		"rounded-full bg-snapp-surface-secondary px-4 py-2",
		"font-sans text-sm leading-5 font-normal",
		"font-bold text-snapp-text-brand",
	]) {
		if (!featureBreadcrumbSource.includes(className)) {
			errors.push(`snapp-feature-breadcrumb is missing ${className}`);
		}
	}
	if (featureBreadcrumbSource.includes("bg-snapp-surface-transparent")) {
		errors.push(
			"snapp-feature-breadcrumb still uses the 30% transparent surface token",
		);
	}
}

const landingCardItem = itemsByName.get("snapp-landing-card");
if (!landingCardItem) {
	errors.push("Missing snapp-landing-card registry item");
} else {
	const landingCardSource = await readFile(
		path.join(registryRoot, landingCardItem.files[0].path),
		"utf8",
	);
	for (const className of [
		"box-border",
		"rounded-snapp-m",
		"border-snapp-card-border",
	]) {
		if (!landingCardSource.includes(className)) {
			errors.push(`snapp-landing-card is missing ${className}`);
		}
	}
	for (const legacyClassName of ["rounded-lg", "border-[#2a2c2e26]"]) {
		if (landingCardSource.includes(legacyClassName)) {
			errors.push(`snapp-landing-card still uses ${legacyClassName}`);
		}
	}
}

for (const menuItemName of [
	"snapp-context-menu",
	"snapp-dropdown-menu",
]) {
	const menuItem = itemsByName.get(menuItemName);
	if (!menuItem) {
		errors.push(`Missing ${menuItemName} registry item`);
		continue;
	}
	const menuSource = await readFile(
		path.join(registryRoot, menuItem.files[0].path),
		"utf8",
	);
	for (const className of [
		"w-52 min-w-52",
		"gap-2",
		"gap-1",
		"p-2",
		"h-7",
		"h-6",
		"px-2 py-1",
		"px-1 py-0.5",
		'"quick-actions-compact"',
		"shadow-snapp-flyout",
		"rounded-lg",
		"border-snapp-border-primary",
		"font-sans text-sm leading-5 font-normal",
		"cursor-pointer",
		"usePortalContainer",
	]) {
		if (!menuSource.includes(className)) {
			errors.push(`${menuItemName} quick-actions is missing ${className}`);
		}
	}
	for (const legacyClassName of ["rounded-none p-0"]) {
		if (menuSource.includes(legacyClassName)) {
			errors.push(
				`${menuItemName} quick-actions still uses ${legacyClassName}`,
			);
		}
	}
}

if (errors.length > 0) {
	console.error("Registry source validation failed:");
	for (const error of errors) {
		console.error(`  - ${error}`);
	}
	process.exitCode = 1;
} else {
	console.log(`Registry source checks passed for ${registry.items.length} items.`);
}
