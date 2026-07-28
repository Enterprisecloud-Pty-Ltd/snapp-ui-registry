import { readFile } from "node:fs/promises";
import path from "node:path";

const tokenFiles = {
	primitives: "primitives.tokens.json",
	semantic: "semantic.tokens.json",
	typography: "typography.tokens.json",
};

const normalizeName = (value) =>
	value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

const collectTokens = (value, parts = [], tokens = []) => {
	if (
		value &&
		typeof value === "object" &&
		!Array.isArray(value) &&
		"$value" in value
	) {
		tokens.push({ parts, token: value });
		return tokens;
	}

	if (value && typeof value === "object" && !Array.isArray(value)) {
		for (const [name, child] of Object.entries(value)) {
			collectTokens(child, [...parts, name], tokens);
		}
	}

	return tokens;
};

const normalizedParts = (parts) => parts.map(normalizeName);

const semanticParts = (parts) => {
	const normalized = normalizedParts(parts);
	const repeatedPrefix = `${normalized[0]}-`;
	if (normalized[1]?.startsWith(repeatedPrefix)) {
		normalized[1] = normalized[1].slice(repeatedPrefix.length);
	}
	return normalized;
};

const customPropertyName = (parts, semantic = false) =>
	`snapp-${(semantic ? semanticParts(parts) : normalizedParts(parts)).join("-")}`;

const primitiveAliasName = (token) => {
	const targetName =
		token.$extensions?.["com.figma.aliasData"]?.targetVariableName;
	if (typeof targetName !== "string" || !targetName.trim()) {
		return null;
	}

	return customPropertyName(targetName.split("/"));
};

const formatNumber = (value) => {
	if (value === 0) {
		return "0";
	}

	return `${Number((value / 16).toFixed(6))}rem`;
};

const formatColor = (value) => {
	const hex =
		typeof value?.hex === "string" ? value.hex.toLowerCase() : undefined;
	if (!hex) {
		throw new Error("Figma color token is missing its hex value.");
	}

	const alpha = typeof value.alpha === "number" ? value.alpha : 1;
	if (alpha >= 0.999) {
		return hex;
	}

	const alphaHex = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
		.toString(16)
		.padStart(2, "0");
	return `${hex}${alphaHex}`;
};

const formatString = (value, parts) => {
	const normalizedValue = String(value).trim();
	const finalPart = normalizeName(parts.at(-1) ?? "");

	if (parts.includes("weight")) {
		if (finalPart === "regular") return "400";
		if (finalPart === "bold") return "700";
	}

	if (parts.includes("family")) {
		const fallback = finalPart === "title" ? "serif" : "sans-serif";
		return `"${normalizedValue}", ${fallback}`;
	}

	return normalizedValue;
};

const formatTokenValue = ({ parts, token }) => {
	if (token.$type === "color") {
		return formatColor(token.$value);
	}
	if (token.$type === "number") {
		return formatNumber(token.$value);
	}
	if (token.$type === "string") {
		return formatString(token.$value, normalizedParts(parts));
	}

	throw new Error(
		`Unsupported Figma token type "${token.$type}" at ${parts.join("/")}.`,
	);
};

const addPrimitiveThemeAlias = (theme, parts, variableName) => {
	const normalized = normalizedParts(parts);
	if (normalized[0] === "colour") {
		theme[`color-snapp-${normalized.slice(1).join("-")}`] =
			`var(--${variableName})`;
		return;
	}
	if (normalized[0] === "spacing") {
		theme[`spacing-snapp-${normalized.slice(1).join("-")}`] =
			`var(--${variableName})`;
		return;
	}
	if (normalized[0] === "radius") {
		theme[`radius-snapp-${normalized.slice(1).join("-")}`] =
			`var(--${variableName})`;
	}
};

const addSemanticThemeAlias = (theme, parts, variableName) => {
	const normalized = semanticParts(parts);
	const group = normalized[0];
	const suffix = normalized.slice(1).join("-");

	if (["text", "surface", "border", "icon", "button"].includes(group)) {
		theme[`color-snapp-${group}-${suffix}`] = `var(--${variableName})`;
		return;
	}
	if (group === "spacing") {
		theme[`spacing-snapp-${suffix}`] = `var(--${variableName})`;
		return;
	}
	if (group === "radius") {
		theme[`radius-snapp-${suffix}`] = `var(--${variableName})`;
	}
};

const addTypographyThemeAlias = (theme, parts, variableName) => {
	const normalized = normalizedParts(parts);
	const group = normalized.slice(0, -1).join("-");
	const name = normalized.at(-1);

	if (group === "font-family") {
		theme[`font-snapp-${name}`] = `var(--${variableName})`;
		return;
	}
	if (group === "font-weight") {
		theme[`font-weight-snapp-${name}`] = `var(--${variableName})`;
		return;
	}
	if (group === "font-size") {
		theme[`text-snapp-${name}`] = `var(--${variableName})`;
		return;
	}
	if (group === "font-line-height") {
		theme[`leading-snapp-${name}`] = `var(--${variableName})`;
	}
};

export async function loadFigmaTokens(registryRoot) {
	const tokenDirectory = path.join(
		registryRoot,
		"registry",
		"radix-nova",
		"tokens",
	);
	const documents = Object.fromEntries(
		await Promise.all(
			Object.entries(tokenFiles).map(async ([name, fileName]) => [
				name,
				JSON.parse(await readFile(path.join(tokenDirectory, fileName), "utf8")),
			]),
		),
	);

	const theme = {};
	const light = {};

	for (const entry of collectTokens(documents.primitives)) {
		const variableName = customPropertyName(entry.parts);
		light[variableName] = formatTokenValue(entry);
		addPrimitiveThemeAlias(theme, entry.parts, variableName);
	}

	for (const entry of collectTokens(documents.semantic)) {
		const variableName = customPropertyName(entry.parts, true);
		const aliasName = primitiveAliasName(entry.token);
		light[variableName] = aliasName
			? `var(--${aliasName})`
			: formatTokenValue(entry);
		addSemanticThemeAlias(theme, entry.parts, variableName);
	}

	for (const entry of collectTokens(documents.typography)) {
		const variableName = customPropertyName(entry.parts);
		light[variableName] = formatTokenValue(entry);
		addTypographyThemeAlias(theme, entry.parts, variableName);
	}

	return {
		files: [
			{
				path: "registry/radix-nova/tokens/primitives.tokens.json",
				type: "registry:file",
				target: "src/styles/tokens/snapp-primitives.tokens.json",
			},
			{
				path: "registry/radix-nova/tokens/semantic.tokens.json",
				type: "registry:file",
				target: "src/styles/tokens/snapp-semantic.tokens.json",
			},
			{
				path: "registry/radix-nova/tokens/typography.tokens.json",
				type: "registry:file",
				target: "src/styles/tokens/snapp-typography.tokens.json",
			},
		],
		light,
		theme,
	};
}
