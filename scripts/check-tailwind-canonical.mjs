import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Scanner } from "@tailwindcss/oxide";
import { __unstable__loadDesignSystem } from "tailwindcss";

const registryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(registryRoot, "registry", "radix-nova");
const defaultTheme = await readFile(
	path.join(registryRoot, "node_modules", "tailwindcss", "theme.css"),
	"utf8",
);
const snappTheme = await readFile(
	path.join(sourceRoot, "theme", "snapp-theme.css"),
	"utf8",
);

const designSystem = await __unstable__loadDesignSystem(
	`${defaultTheme}\n${snappTheme}`,
);
const scanner = new Scanner({
	sources: [
		{
			base: sourceRoot,
			pattern: "**/*.{ts,tsx}",
			negated: false,
		},
	],
});

const suggestions = [];
for (const candidate of scanner.scan()) {
	const [canonical] = designSystem.canonicalizeCandidates([candidate], {
		rem: 16,
	});
	if (canonical && canonical !== candidate) {
		suggestions.push({ candidate, canonical });
	}
}

if (suggestions.length > 0 && process.argv.includes('--fix')) {
	async function fix(directory) {
		for (const entry of await readdir(directory, {withFileTypes:true})) {
			const file = path.join(directory, entry.name);
			if (entry.isDirectory()) { await fix(file); continue; }
			if (!/\.tsx?$/.test(entry.name)) continue;
			const original = await readFile(file, 'utf8');
			let updated = original;
			for (const {candidate, canonical} of suggestions) {
				const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				updated = updated.replace(new RegExp(`(?<=[\\s\"'\x60])${escaped}(?=[\\s\"'\x60])`, 'g'), canonical);
			}
			if (updated !== original) await writeFile(file, updated);
		}
	}
	await fix(sourceRoot);
	console.log('Applied registry-only canonical Tailwind replacements. Rerun the check.');
} else if (suggestions.length > 0) {
	console.error("Non-canonical Tailwind classes found:");
	for (const { candidate, canonical } of suggestions) {
		console.error(`  ${candidate} -> ${canonical}`);
	}
	process.exitCode = 1;
} else {
	console.log("All registry Tailwind classes are canonical.");
}
