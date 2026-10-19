import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { after, test } from "node:test";
import { chromium } from "playwright";
import { prepareAptosFonts, quantizeFontUnits } from "./prepare-aptos-fonts.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const directory = "registry/radix-nova/fonts/aptos";
const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "snapp-aptos-preparation-test-"));
const names = ["Aptos-Light.ttf", "Aptos.ttf", "Aptos-SemiBold.ttf", "Aptos-Bold.ttf"];
const sourceBytes = new Map(await Promise.all(names.map(async (name) => [name, await fs.readFile(path.join(root, directory, name))])));
await fs.mkdir(path.join(fixture, directory), { recursive: true });
for (const [name, bytes] of sourceBytes) await fs.writeFile(path.join(fixture, directory, name), bytes);
let prepared;
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

after(async () => {
	const resolved = path.resolve(fixture);
	assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
	assert.ok(path.basename(resolved).startsWith("snapp-aptos-preparation-test-"));
	await fs.rm(resolved, { recursive: true, force: true });
});

test("font-unit ties follow the source vector rule, including negative kerning", () => {
	assert.deepEqual([1827, 1079, 533, -51, -31, 5, -10, 1446, 0].map(quantizeFontUnits), [1828, 1080, 534, -50, -30, 6, -10, 1446, 0]);
	for (let value = -32768; value <= 32766; value++) {
		const result = quantizeFontUnits(value);
		assert.equal(Math.abs(result % 2), 0);
		assert.ok(result === value || result === value + 1);
		assert.equal(quantizeFontUnits(result), result);
	}
	assert.throws(() => quantizeFontUnits(0.5), /safe integer/);
});

test("four prepared faces preserve originals, outlines, substitutions and valid SFNT checksums", async () => {
	prepared = await prepareAptosFonts(fixture);
	assert.deepEqual(prepared.profile, { version: 1, figmaPrecision: 1024, unitsPerEm: 2048, rounding: "half-toward-positive-infinity" });
	assert.equal(prepared.faces.length, 4);
	const expected = {
		300: { hmtxAdvances: 572, gposValues: 960, anchorX: 225, anchorY: 171 },
		400: { hmtxAdvances: 524, gposValues: 1192, anchorX: 235, anchorY: 151 },
		600: { hmtxAdvances: 574, gposValues: 1113, anchorX: 212, anchorY: 237 },
		700: { hmtxAdvances: 520, gposValues: 1214, anchorX: 249, anchorY: 147 },
	};
	for (const face of prepared.faces) {
		const before = sourceBytes.get(path.basename(face.original.path));
		const afterBytes = await fs.readFile(path.join(fixture, face.delivery.path));
		assert.equal(hash(before), face.original.sha256);
		assert.deepEqual(await fs.readFile(path.join(fixture, face.original.path)), before);
		assert.deepEqual(await fs.readFile(path.join(root, face.original.path)), before);
		assert.equal(hash(afterBytes), face.delivery.sha256);
		assert.equal(afterBytes.length, before.length);
		for (const [field, count] of Object.entries(expected[face.weight])) assert.equal(face.quantizedFields[field], count, `${face.weight} ${field}`);
		assert.ok(face.quantizedFields.legacyKern > 0);
		assert.equal(face.checksum.wholeFont, "0xb1b0afba");
		assert.equal(face.checksum.allTablesValid, true);
		assert.equal(face.checksum.tables.length, 20);
		assert.deepEqual(face.formatCoverage.lookupTypes, [2, 4, 5, 6]);
		assert.deepEqual(face.formatCoverage.pairFormats, [1, 2]);
		assert.deepEqual(face.formatCoverage.valueFormats, [0, 4]);
		assert.deepEqual(face.formatCoverage.anchorFormats, [1]);
		assert.equal(face.formatCoverage.deviceReferences, 0);
		assert.equal(face.formatCoverage.cursiveLookups, 0);
		assert.equal(face.formatCoverage.verticalMetricsPresent, false);
		assert.deepEqual(Object.values(face.outlineProof), [true, true, true, true, true]);
		for (const tag of ["glyf", "loca", "GSUB", "cmap", "name", "GDEF"]) assert.ok(face.preservedTables.some((entry) => entry.tag === tag));
		// Independently inspect the directory and sum the complete font words.
		let total = 0;
		for (let offset = 0; offset < afterBytes.length; offset += 4) total = (total + afterBytes.readUInt32BE(offset)) >>> 0;
		assert.equal(total, 0xb1b0afba);
		const tables = new Map();
		for (let index = 0; index < afterBytes.readUInt16BE(4); index++) {
			const offset = 12 + index * 16;
			tables.set(afterBytes.toString("ascii", offset, offset + 4), { offset: afterBytes.readUInt32BE(offset + 8), length: afterBytes.readUInt32BE(offset + 12) });
		}
		for (const tag of ["glyf", "loca", "GSUB", "cmap", "name", "GDEF"]) {
			const entry = tables.get(tag);
			assert.deepEqual(afterBytes.subarray(entry.offset, entry.offset + entry.length), before.subarray(entry.offset, entry.offset + entry.length));
		}
		const hh = tables.get("hhea").offset;
		const hm = tables.get("hmtx").offset;
		const advances = Array.from({ length: afterBytes.readUInt16BE(hh + 34) }, (_, index) => afterBytes.readUInt16BE(hm + index * 4));
		assert.ok(advances.every((advance) => advance % 2 === 0));
		assert.equal(afterBytes.readUInt16BE(hh + 10), Math.max(...advances));
	}
});

test("preparation is deterministic and rejects a changed source before writing a partial graph", async () => {
	const originalProof = await fs.readFile(path.join(fixture, directory, "prepared/preparation.json"));
	assert.deepEqual(await prepareAptosFonts(fixture), prepared);
	assert.deepEqual(await fs.readFile(path.join(fixture, directory, "prepared/preparation.json")), originalProof);
	const invalidRoot = path.join(fixture, "invalid");
	await fs.mkdir(path.join(invalidRoot, directory), { recursive: true });
	for (const [name, bytes] of sourceBytes) await fs.writeFile(path.join(invalidRoot, directory, name), bytes);
	const changed = Buffer.from(sourceBytes.get("Aptos-Bold.ttf"));
	changed[changed.length - 1] ^= 1;
	await fs.writeFile(path.join(invalidRoot, directory, "Aptos-Bold.ttf"), changed);
	await assert.rejects(prepareAptosFonts(invalidRoot), /not the approved designer 1\.09 source/);
	await assert.rejects(fs.stat(path.join(invalidRoot, directory, "prepared")), { code: "ENOENT" });
	await assert.rejects(prepareAptosFonts("relative-root"), /absolute registry root/);
});

test("browser full shaping matches source advances and preserves custom fonts for ligatures, marks and two ShadowRoots", async () => {
	const browser = await chromium.launch({ headless: true });
	try {
		const page = await browser.newPage();
		const errors = [];
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
		const payload = await Promise.all(prepared.faces.map(async (face) => ({ weight: face.weight, original: [...sourceBytes.get(path.basename(face.original.path))], prepared: [...await fs.readFile(path.join(fixture, face.delivery.path))] })));
		const result = await page.evaluate(async (payload) => {
			const loaded = [];
			for (const row of payload) for (const key of ["original", "prepared"]) {
				const font = new FontFace(`AptosTest_${key}_${row.weight}`, new Uint8Array(row[key]).buffer, { weight: String(row.weight), style: "normal" });
				await font.load(); document.fonts.add(font); loaded.push(font.status);
			}
			await document.fonts.ready;
			const context = document.createElement("canvas").getContext("2d");
			context.fontKerning = "normal";
			context.font = "400 14px AptosTest_prepared_400";
			const expected = [["Week 1 - 3", 62.001953125, 63], ["Week 4 - 6", 62.001953125, 63], ["Week 7 - 8", 62.001953125, 63], ["Next", 27.822265625, 28], ["Item", 27.439453125, 28]];
			const sourceChecks = expected.map(([text, advance, frame]) => ({ text, expectedAdvance: advance, actualAdvance: context.measureText(text).width, expectedFrame: frame, actualFrame: Math.ceil(context.measureText(text).width) }));
			const dimensions = [];
			for (let index = 0; index < 2; index++) {
				const host = document.createElement("section"); document.body.append(host); const shadow = host.attachShadow({ mode: "open" });
				for (const row of payload) for (const key of ["original", "prepared"]) for (const [kind, text] of [["ligature", "office ffi"], ["marks", "a\u0323\u0301"], ["greek", "Ελληνικά"], ["cyrillic", "Кириллица"]]) {
					const span = document.createElement("span"); span.id = `font-${index}-${row.weight}-${key}-${kind}`; span.textContent = text;
					Object.assign(span.style, { fontFamily: `AptosTest_${key}_${row.weight}`, fontWeight: String(row.weight), fontSize: "14px", lineHeight: "20px", fontKerning: "normal", display: "inline-block" });
					shadow.append(span); dimensions.push({ root: index, weight: row.weight, key, kind, width: span.getBoundingClientRect().width });
				}
			}
			return { loaded, sourceChecks, dimensions };
		}, payload);
		assert.ok(result.loaded.every((status) => status === "loaded"));
		for (const row of result.sourceChecks) {
			assert.equal(row.actualAdvance, row.expectedAdvance, row.text);
			assert.equal(row.actualFrame, row.expectedFrame, row.text);
		}
		for (const row of result.dimensions.filter((row) => row.root === 0)) {
			const other = result.dimensions.find((candidate) => candidate.root === 1 && candidate.weight === row.weight && candidate.key === row.key && candidate.kind === row.kind);
			assert.equal(other.width, row.width);
			assert.ok(Number.isFinite(row.width) && row.width > 0);
		}
		const session = await page.context().newCDPSession(page);
		await session.send("DOM.enable"); await session.send("CSS.enable");
		const { root: document } = await session.send("DOM.getDocument", { depth: -1, pierce: true });
		const specimens = [];
		function visit(node) {
			const attributes = node.attributes ?? [];
			const idIndex = attributes.indexOf("id");
			if (idIndex >= 0 && attributes[idIndex + 1].startsWith("font-")) specimens.push(node);
			for (const child of [...(node.children ?? []), ...(node.shadowRoots ?? [])]) visit(child);
		}
		visit(document);
		assert.equal(specimens.length, 64);
		const usedFonts = [];
		for (const node of specimens) {
			const { fonts } = await session.send("CSS.getPlatformFontsForNode", { nodeId: node.nodeId });
			assert.equal(fonts.length, 1);
			assert.equal(fonts[0].isCustomFont, true);
			assert.ok(fonts[0].glyphCount > 0);
			usedFonts.push(fonts[0]);
		}
		assert.deepEqual(errors, []);
		console.log(JSON.stringify({ sourceAdvanceChecks: result.sourceChecks.length, loadedFaces: result.loaded.length, shadowRoots: 2, fullShapingCustomFontSpecimens: usedFonts.length, browserErrors: errors.length }));
	} finally {
		await browser.close();
	}
});
