import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { configureRegistryFormatting } from "../registry/radix-nova/tooling/snapp-registry-delivery.mjs";

function fixture(
	t,
	files = [
		"src/components/ui/button.tsx",
		"scripts/snapp-registry-delivery.mjs",
	]
) {
	const root = fs.mkdtempSync(
		path.join(os.tmpdir(), "snapp-registry-delivery-")
	);
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	for (const file of files) {
		fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
		fs.writeFileSync(path.join(root, file), "");
	}
	fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
	fs.writeFileSync(
		path.join(root, "scripts/snapp-registry-files.json"),
		JSON.stringify({ schemaVersion: 1, files })
	);
	fs.writeFileSync(
		path.join(root, "biome.json"),
		JSON.stringify({
			formatter: { indentStyle: "space" },
			overrides: [
				{
					includes: ["src/features/**"],
					formatter: { lineWidth: 100 },
				},
			],
		})
	);
	return root;
}

test("registry ownership is exact, idempotent and preserves application rules", (t) => {
	const root = fixture(t);
	assert.throws(
		() => configureRegistryFormatting(root, { check: true }),
		/stale/
	);
	assert.equal(configureRegistryFormatting(root), true);
	const config = JSON.parse(
		fs.readFileSync(path.join(root, "biome.json"), "utf8")
	);
	assert.equal(config.formatter.indentStyle, "space");
	assert.equal(config.overrides[0].formatter.lineWidth, 100);
	assert.equal(config.overrides[1].formatter.enabled, false);
	assert.equal(config.overrides[1].linter, undefined);
	assert.ok(!config.overrides[1].includes.some((file) => file.includes("*")));
	assert.equal(configureRegistryFormatting(root, { check: true }), false);
	assert.equal(configureRegistryFormatting(root), false);
});

test("missing and escaping registry file manifests fail before writes", (t) => {
	const root = fixture(t);
	const config = fs.readFileSync(path.join(root, "biome.json"), "utf8");
	for (const files of [
		["../escape.ts"],
		["src/components/ui/**"],
		["src/components/ui/missing.tsx"],
	]) {
		fs.writeFileSync(
			path.join(root, "scripts/snapp-registry-files.json"),
			JSON.stringify({ schemaVersion: 1, files })
		);
		assert.throws(() => configureRegistryFormatting(root));
		assert.equal(
			fs.readFileSync(path.join(root, "biome.json"), "utf8"),
			config
		);
	}
});

test("project formatting still fixes authored source and preserves installed registry bytes", (t) => {
	const root = fixture(t);
	const managed = path.join(root, "src/components/ui/button.tsx");
	const source = "export const recipe={ value:1 }\n";
	fs.writeFileSync(managed, source);
	fs.mkdirSync(path.join(root, "src/features"), { recursive: true });
	const authored = path.join(root, "src/features/example.ts");
	fs.writeFileSync(authored, source);
	configureRegistryFormatting(root);
	const result = spawnSync(
		process.execPath,
		[
			fileURLToPath(
				new URL(
					"../node_modules/@biomejs/biome/bin/biome",
					import.meta.url
				)
			),
			"format",
			"--write",
			"src",
		],
		{ cwd: root, encoding: "utf8" }
	);
	assert.equal(result.status, 0, result.stdout + result.stderr);
	assert.equal(fs.readFileSync(managed, "utf8"), source);
	assert.notEqual(fs.readFileSync(authored, "utf8"), source);
});
