import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const registryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(registryRoot, "public", "r");
const sourceRegistry = JSON.parse(
	await readFile(path.join(registryRoot, "registry.json"), "utf8"),
);
const generatedRegistry = JSON.parse(
	await readFile(path.join(outputDirectory, "registry.json"), "utf8"),
);
const errors = [];

if (JSON.stringify(sourceRegistry) !== JSON.stringify(generatedRegistry)) {
	errors.push("public/r/registry.json does not match registry.json");
}

const expectedFiles = new Set([
	"registry.json",
	...sourceRegistry.items.map((item) => `${item.name}.json`),
]);
const actualFiles = new Set(
	(await readdir(outputDirectory)).filter((fileName) =>
		fileName.endsWith(".json"),
	),
);

for (const fileName of expectedFiles) {
	if (!actualFiles.has(fileName)) {
		errors.push(`Missing generated artifact ${fileName}`);
	}
}
for (const fileName of actualFiles) {
	if (!expectedFiles.has(fileName)) {
		errors.push(`Unexpected stale generated artifact ${fileName}`);
	}
}

for (const item of sourceRegistry.items) {
	const generated = JSON.parse(
		await readFile(path.join(outputDirectory, `${item.name}.json`), "utf8"),
	);
	if (generated.name !== item.name) {
		errors.push(`${item.name}.json contains item ${generated.name}`);
	}
	for (const file of generated.files ?? []) {
		if (typeof file.content !== "string" || file.content.length === 0) {
			errors.push(`${item.name}.json has an empty generated file ${file.path}`);
		}
	}
}

if (errors.length > 0) {
	console.error("Generated registry validation failed:");
	for (const error of errors) {
		console.error(`  - ${error}`);
	}
	process.exitCode = 1;
} else {
	console.log(`Verified ${expectedFiles.size} generated registry JSON files.`);
}
