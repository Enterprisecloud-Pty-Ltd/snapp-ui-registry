import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function configureRegistryFormatting(
	projectRoot,
	{ check = false } = {}
) {
	const configPath = path.join(projectRoot, "biome.json");
	if (!fs.existsSync(configPath)) {
		throw new Error(
			"Configure this project's Biome formatter before adopting registry formatting ownership."
		);
	}
	const manifest = JSON.parse(
		fs.readFileSync(
			path.join(projectRoot, "scripts/snapp-registry-files.json"),
			"utf8"
		)
	);
	const includes = manifest.files;
	if (
		manifest.schemaVersion !== 1 ||
		!Array.isArray(includes) ||
		includes.length === 0 ||
		includes.some(
			(file) =>
				typeof file !== "string" ||
				path.isAbsolute(file) ||
				file.includes("..") ||
				/[*?]/.test(file)
		)
	) {
		throw new Error("Invalid exact-file registry ownership manifest.");
	}
	for (const file of includes) {
		if (!fs.existsSync(path.join(projectRoot, file)))
			throw new Error(`Incomplete registry installation: ${file}`);
	}
	const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
	const override = {
		includes,
		formatter: { enabled: false },
		assist: { enabled: false },
	};
	const oldPatterns = [
		"src/components/ui/**",
		"src/components/snapp/**",
		"src/hooks/use-mobile.ts",
		"src/lib/utils.ts",
		"src/runtime/PortalContainer.ts",
	];
	const overrides = config.overrides ?? [];
	const index = overrides.findIndex(
		(item) =>
			item.includes?.includes("scripts/snapp-registry-delivery.mjs") ||
			(item.includes?.length === oldPatterns.length &&
				oldPatterns.every((pattern) => item.includes.includes(pattern)))
	);
	const previous = index >= 0 ? overrides[index] : undefined;
	if (JSON.stringify(previous) === JSON.stringify(override)) return false;
	if (check)
		throw new Error(
			"Registry formatter ownership is stale; run node scripts/snapp-registry-delivery.mjs --write after the full registry install."
		);
	if (index >= 0) overrides[index] = override;
	else overrides.push(override);
	config.overrides = overrides;
	fs.writeFileSync(configPath, `${JSON.stringify(config, null, "\t")}\n`);
	return true;
}

if (
	process.argv[1] &&
	path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
	const check = process.argv.includes("--check");
	if (!check && !process.argv.includes("--write"))
		throw new Error(
			"Use --write to adopt or --check to verify registry formatter ownership."
		);
	const changed = configureRegistryFormatting(process.cwd(), { check });
	console.log(
		changed
			? "Adopted registry formatter ownership; application lint and formatting remain enabled."
			: "Registry formatter ownership is current."
	);
}
