import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const registryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(registryRoot, "..");
const checkOnly = process.argv.includes("--check");
const themeSource = path.join(
	registryRoot,
	"registry",
	"radix-nova",
	"theme",
	"snapp-theme.css",
);
const themeContent = await readFile(themeSource, "utf8");
const projectNames = [
	"blobstoragemanagersnapp",
	"cabinettool",
	"conversationsnapp",
	"formloadersnapp",
	"itemformloadersnapp",
	"knowledgebasesnapp",
	"loginsnapp",
	"logrequestsnapp",
	"managerequestssnapp",
	"myitemmanagersnapp",
	"pcfshellsnapp",
	"searchsnapp",
	"servicerequestsnapp",
	"sidenavbarsnapp",
	"snappcabinet",
	"snappcabinetAnon",
	"webresourceshellsnapp",
];

const exactReplacements = new Map([
	["max-[420px]", "max-snapp-phone"],
	["min-[480px]", "min-snapp-narrow"],
	["max-[560px]", "max-snapp-compact"],
	["max-[760px]", "max-snapp-mobile"],
	["max-[860px]", "max-snapp-desktop"],
	["max-[900px]", "max-snapp-tablet"],
	["max-[1000px]", "max-snapp-layout"],
	["max-[1100px]", "max-snapp-wide"],
	["rounded-[2px]", "rounded-xs"],
	["rounded-[4px]", "rounded-sm"],
	["rounded-[10px]", "rounded-snapp-control"],
	["rounded-[20px]", "rounded-full"],
	["rounded-[48px]", "rounded-full"],
	["rounded-[120px]", "rounded-full"],
	["rounded-[min(var(--radius-md),10px)]", "rounded-md"],
	["rounded-[min(var(--radius-md),12px)]", "rounded-md"],
	["rounded-[calc(var(--radius)-3px)]", "rounded-md"],
	["rounded-[calc(var(--radius)-5px)]", "rounded-sm"],
	["rounded-[2px_7px_2px_7px]", "rounded-snapp-mark"],
	["ring-0.75", "ring-3"],
	["border-0.375", "border-1.5"],
	["border-1.5", "border-(length:--snapp-indicator-border)"],
	["text-[0.8rem]", "text-snapp-caption"],
	["text-[10px]", "text-snapp-tiny"],
	["text-[11px]", "text-snapp-micro"],
	["text-[13px]", "text-snapp-caption"],
	["text-[15px]", "text-snapp-body-sm"],
	["text-[18px]", "text-lg"],
	["text-[38px]", "text-snapp-display-sm"],
	["text-[40px]", "text-snapp-display"],
	["leading-[40px]", "leading-snapp-display-sm"],
	["leading-[44px]", "leading-snapp-display"],
	["leading-[normal]", "leading-normal"],
	["w-[min(1092px,calc(100%-64px))]", "w-snapp-page"],
	["w-[calc(100%-32px)]", "w-snapp-page-mobile"],
	["w-[min(668px,calc(100%-32px))]", "w-snapp-search"],
	["w-[min(594px,100%)]", "w-snapp-hero-title"],
	["w-[min(774px,90%)]", "w-snapp-hero-copy"],
	["w-[calc((100%-24px)/2)]", "w-snapp-card-half"],
	["w-[255px]", "w-snapp-card-width"],
	["max-w-[1092px]", "max-w-snapp-content"],
	["max-w-[860px]", "max-w-snapp-article"],
	["px-[101px]", "px-snapp-hero-x"],
	["h-[121px]", "h-snapp-card"],
	["min-h-[121px]", "min-h-snapp-card"],
	["max-h-[80vh]", "max-h-snapp-overlay"],
	["max-w-[calc(100%-2rem)]", "max-w-snapp-dialog"],
	["max-w-[80%]", "max-w-4/5"],
	["top-[60%]", "top-3/5"],
	["bottom-[-5px]", "-bottom-1.25"],
	["ml-[-0.3rem]", "-ml-1.25"],
	["mr-[-0.3rem]", "-mr-1.25"],
	["ml-[-0.15rem]", "-ml-0.5"],
	["mr-[-0.15rem]", "-mr-0.5"],
	["translate-y-[-1px]", "-translate-y-px"],
	["w-[min(520px,100%)]", "w-snapp-form"],
	["w-[calc(100%-52px)]", "w-snapp-search-results"],
	["w-[72%]", "w-snapp-skeleton-72"],
	["w-[68%]", "w-snapp-skeleton-68"],
	["w-[54%]", "w-snapp-skeleton-54"],
	[
		"translate-x-[calc(100%-2px)]",
		"translate-x-[calc(100%-var(--snapp-control-inset))]",
	],
	[
		"translate-y-[calc(-50%_-_2px)]",
		"translate-y-[calc(-50%_-_var(--snapp-tooltip-arrow-offset))]",
	],
	["h-[calc(100%-1px)]", "h-[calc(100%-var(--snapp-hairline))]"],
	[
		"w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]",
		"w-[calc(var(--sidebar-width-icon)+(--spacing(4))+var(--snapp-control-inset))]",
	],
	["min-width: 320px;", "min-width: var(--spacing-snapp-viewport-min);"],
	["width: 256px;", "width: var(--spacing-snapp-sidebar);"],
]);

const convertSpacingUtility = (_match, variants, utility, value) => {
	if (utility === "ring") {
		return `${variants}${utility}-${value}`;
	}
	if (utility === "border" && Number(value) === 1.5) {
		return `${variants}border-(length:--snapp-indicator-border)`;
	}
	if (utility === "border") {
		return `${variants}${utility}-${value}`;
	}
	const scaleValue = Number(value) / 4;
	return `${variants}${utility}-${Number(scaleValue.toFixed(4))}`;
};

const normalizeClasses = (content) => {
	let result = content;
	for (const [from, to] of exactReplacements) {
		result = result.replaceAll(from, to);
	}
	result = result.replace(
		/((?:[a-z0-9-]+:)*)(size|w|min-w|max-w|h|min-h|max-h|p[trblxy]?|m[trblxy]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left|ring|border)-\[(\d+(?:\.\d+)?)px\]/g,
		convertSpacingUtility,
	);
	result = result.replace(
		/((?:[a-z0-9-]+:)*)flex-\[0_0_(\d+(?:\.\d+)?)px\]/g,
		(_match, variants, value) => {
			const scaleValue = Number(value) / 4;
			const normalized = Number(scaleValue.toFixed(4));
			return `${variants}shrink-0 ${variants}basis-${normalized}`;
		},
	);
	return result;
};

const prefixedVariantPattern = (prefix) =>
	new RegExp(
		`(?<![\\w-])((?:(?:[\\w-]+(?:\\/[\\w-]+)?|\\[[^\\]\\s]+\\]):)+)${prefix}:`,
		"g",
	);

const normalizePrefixedVariantOrder = (content, prefix) =>
	content.replace(
		prefixedVariantPattern(prefix),
		(_match, variants) => `${prefix}:${variants}`,
	);

const sourceFiles = async (directory) => {
	const files = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await sourceFiles(entryPath)));
		} else if (/\.(css|ts|tsx)$/.test(entry.name)) {
			files.push(entryPath);
		}
	}
	return files;
};

let changedFiles = 0;
for (const projectName of projectNames) {
	const projectRoot = path.join(workspaceRoot, projectName);
	const indexCssPath = path.join(projectRoot, "src", "index.css");
	const indexCss = await readFile(indexCssPath, "utf8");
	const scoped = indexCss.includes("prefix(ec)");
	const themeImport = '@import "./styles/snapp-theme.css";';
	let nextIndexCss = indexCss;
	if (!nextIndexCss.includes(themeImport)) {
		const importMatches = [...nextIndexCss.matchAll(/^@import .+;\r?$/gm)];
		const lastImport = importMatches.at(-1);
		if (!lastImport) {
			throw new Error(`No CSS import found in ${indexCssPath}`);
		}
		const insertionIndex = lastImport.index + lastImport[0].length;
		nextIndexCss = `${nextIndexCss.slice(0, insertionIndex)}\n${themeImport}${nextIndexCss.slice(insertionIndex)}`;
	}
	if (nextIndexCss !== indexCss) {
		changedFiles += 1;
		if (!checkOnly) {
			await writeFile(indexCssPath, nextIndexCss);
		}
	}

	const themeTargetDirectory = path.join(projectRoot, "src", "styles");
	const themeTarget = path.join(themeTargetDirectory, "snapp-theme.css");
	let currentTheme = "";
	try {
		currentTheme = await readFile(themeTarget, "utf8");
	} catch (error) {
		if (error.code !== "ENOENT") {
			throw error;
		}
	}
	if (currentTheme !== themeContent) {
		changedFiles += 1;
		if (!checkOnly) {
			await mkdir(themeTargetDirectory, { recursive: true });
			await copyFile(themeSource, themeTarget);
		}
	}

	const componentsPath = path.join(projectRoot, "components.json");
	const components = JSON.parse(await readFile(componentsPath, "utf8"));
	components.tailwind.prefix = scoped ? "ec" : "";
	components.registries = {
		...(components.registries ?? {}),
		"@snapp": "http://127.0.0.1:4173/r/{name}.json",
	};
	const nextComponents = `${JSON.stringify(components, null, "\t")}\n`;
	const currentComponents = await readFile(componentsPath, "utf8");
	if (nextComponents !== currentComponents) {
		changedFiles += 1;
		if (!checkOnly) {
			await writeFile(componentsPath, nextComponents);
		}
	}

	for (const filePath of await sourceFiles(path.join(projectRoot, "src"))) {
		const content = await readFile(filePath, "utf8");
		const sizeNormalized = normalizeClasses(content);
		const normalized = scoped
			? normalizePrefixedVariantOrder(sizeNormalized, "ec")
			: sizeNormalized;
		if (normalized !== content) {
			changedFiles += 1;
			if (!checkOnly) {
				await writeFile(filePath, normalized);
			}
		}
	}
}

if (checkOnly && changedFiles > 0) {
	console.error(
		`${changedFiles} files require Tailwind size or prefix-order normalization.`,
	);
	process.exitCode = 1;
} else {
	console.log(
		checkOnly
			? "All Snapp files use the shared Tailwind sizing and prefix-order conventions."
			: `${changedFiles} files updated.`,
	);
}
