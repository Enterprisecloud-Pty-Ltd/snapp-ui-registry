import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extendTailwindMerge } from "tailwind-merge";

const registryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(
	await readFile(path.join(registryRoot, "registry.json"), "utf8"),
);
const errors = [];
const itemsByName = new Map();
const localDependencyName = (dependency) =>
	dependency.startsWith("@snapp/") ? dependency.slice("@snapp/".length) : null;

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
	const arraySource = utilitySource.match(
		/const snappTextSizes = \[([\s\S]*?)\] as const/,
	)?.[1];
	const textSizes = Array.from(
		arraySource?.matchAll(/"([^"]+)"/g) ?? [],
		(match) => match[1],
	);
	const twMerge = extendTailwindMerge({
		extend: {
			classGroups: {
				"font-size": [{ text: textSizes }],
			},
		},
	});
	const merged = twMerge(
		"text-snapp-xs leading-snapp-xxs text-snapp-text-secondary",
	);
	if (
		merged !==
		"text-snapp-xs leading-snapp-xxs text-snapp-text-secondary"
	) {
		errors.push(`snapp-utils typography merge failed: ${merged}`);
	}
}

const themeItem = itemsByName.get("snapp-theme");
for (const fontPackage of [
	"@fontsource/ibm-plex-sans",
	"@fontsource/judson",
]) {
	if (!(themeItem?.dependencies ?? []).includes(fontPackage)) {
		errors.push(`snapp-theme does not install ${fontPackage}`);
	}
}
const fontImport = '@import "./styles/snapp-fonts.css"';
if (!themeItem?.css?.[fontImport]) {
	errors.push(`snapp-theme is missing ${fontImport}`);
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
	for (const requiredSource of [
		"https://experience.snappcabinets.com/snapp/assets/fonts/",
		"https://fonts.gstatic.com/",
		"../../node_modules/@fontsource/",
	]) {
		if (!fontSource.includes(requiredSource)) {
			errors.push(`snapp-fonts.css is missing ${requiredSource}`);
		}
	}
	if (fontSource.includes(".woff)") || fontSource.includes(".ttf")) {
		errors.push("snapp-fonts.css must only use WOFF2 font sources");
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
