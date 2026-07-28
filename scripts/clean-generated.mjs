import { readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const registryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.resolve(registryRoot, "public", "r");
const expectedOutputDirectory = path.join(registryRoot, "public", "r");

if (outputDirectory !== expectedOutputDirectory) {
	throw new Error(`Refusing to clean unexpected directory: ${outputDirectory}`);
}

for (const fileName of await readdir(outputDirectory)) {
	if (fileName.endsWith(".json")) {
		await rm(path.join(outputDirectory, fileName));
	}
}

console.log("Removed previous generated registry JSON files.");
