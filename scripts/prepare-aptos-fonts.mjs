import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

// The source vectors establish this precision for the designer's static Aptos
// 1.09 faces. This is deliberately not a general-purpose font converter.
export const APTOS_PREPARATION_PROFILE = Object.freeze({
	version: 1,
	figmaPrecision: 1024,
	unitsPerEm: 2048,
	rounding: "half-toward-positive-infinity",
});

const fontDirectory = "registry/radix-nova/fonts/aptos";
const faces = [
	[300, "Aptos-Light.ttf", "e38fc1bef9b7e971bfdfdba4897abe72ef9bd72182b8ad9d463e11307a802b54"],
	[400, "Aptos.ttf", "b46c7865bdecc68d7d82075a2d1e93e31cb73146eae6740bc7c090c8d0b2842a"],
	[600, "Aptos-SemiBold.ttf", "b69e74cd43331c68cc8a4e82acc70dc5fe183524fe6e28d0da5e209b0ccd9f3d"],
	[700, "Aptos-Bold.ttf", "e59d983f8752146b8d02df5cad8f545ce677ef71dbe113afa3b395a9088c7f53"],
];

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const requireSupported = (condition, message) => {
	if (!condition) throw new Error(`Unsupported Aptos preparation input: ${message}`);
};

export function quantizeFontUnits(value) {
	if (!Number.isSafeInteger(value)) throw new TypeError("Font units must be a safe integer.");
	return 2 * Math.floor(value / 2 + 0.5);
}

function sum32(bytes) {
	let total = 0;
	for (let offset = 0; offset < bytes.length; offset += 4) {
		let value = 0;
		for (let index = 0; index < 4; index++) value = value * 256 + (bytes[offset + index] ?? 0);
		total = (total + value) >>> 0;
	}
	return total;
}

function readTables(bytes) {
	requireSupported(bytes.readUInt32BE(0) === 0x00010000, "expected a static TrueType SFNT");
	const tables = new Map();
	for (let index = 0; index < bytes.readUInt16BE(4); index++) {
		const directoryOffset = 12 + index * 16;
		const tag = bytes.toString("ascii", directoryOffset, directoryOffset + 4);
		const offset = bytes.readUInt32BE(directoryOffset + 8);
		const length = bytes.readUInt32BE(directoryOffset + 12);
		requireSupported(!tables.has(tag) && offset % 4 === 0 && offset + length <= bytes.length, `invalid ${tag} table`);
		tables.set(tag, { directoryOffset, offset, length });
	}
	for (const tag of ["DSIG", "fvar", "HVAR", "VVAR", "MVAR", "vhea", "vmtx", "MATH", "JSTF"]) {
		requireSupported(!tables.has(tag), `${tag} requires a separately validated profile`);
	}
	return tables;
}

function checksumProof(bytes, tables) {
	const checks = [...tables].map(([tag, entry]) => {
		const table = Buffer.from(bytes.subarray(entry.offset, entry.offset + entry.length));
		if (tag === "head") table.writeUInt32BE(0, 8);
		return { tag, valid: sum32(table) === bytes.readUInt32BE(entry.directoryOffset + 4) };
	});
	return {
		wholeFont: `0x${sum32(bytes).toString(16).padStart(8, "0")}`,
		allTablesValid: checks.every((check) => check.valid),
		tables: checks,
	};
}

function prepareFace(source, weight, filename, expectedHash) {
	requireSupported(sha256(source) === expectedHash, `${filename} is not the approved designer 1.09 source; review the precision profile before changing it`);
	const bytes = Buffer.from(source);
	const tables = readTables(bytes);
	const table = (tag) => {
		const entry = tables.get(tag);
		requireSupported(Boolean(entry), `missing ${tag} table`);
		return bytes.subarray(entry.offset, entry.offset + entry.length);
	};
	const sourceChecksum = checksumProof(source, tables);
	requireSupported(sourceChecksum.allTablesValid && sourceChecksum.wholeFont === "0xb1b0afba", "source SFNT checksums are invalid");
	requireSupported(table("head").readUInt16BE(18) === 2048, "expected 2048 units per em");
	const counts = { hmtxAdvances: 0, gposValues: 0, anchorX: 0, anchorY: 0, legacyKern: 0 };
	const seenFields = new Set();
	const quantize = (tag, offset, category, signed = true) => {
		const key = `${tag}:${offset}`;
		if (seenFields.has(key)) return;
		seenFields.add(key);
		const data = table(tag);
		const before = signed ? data.readInt16BE(offset) : data.readUInt16BE(offset);
		const after = quantizeFontUnits(before);
		requireSupported(after >= (signed ? -32768 : 0) && after <= (signed ? 32767 : 65535), `${tag} metric overflows its stored field`);
		if (before !== after) {
			if (signed) data.writeInt16BE(after, offset);
			else data.writeUInt16BE(after, offset);
			counts[category]++;
		}
	};

	const hhea = table("hhea");
	const numberOfHMetrics = hhea.readUInt16BE(34);
	const glyphCount = table("maxp").readUInt16BE(4);
	const hmtx = table("hmtx");
	requireSupported(hmtx.length === numberOfHMetrics * 4 + (glyphCount - numberOfHMetrics) * 2, "unexpected hmtx length");
	for (let index = 0; index < numberOfHMetrics; index++) quantize("hmtx", index * 4, "hmtxAdvances", false);

	const gpos = table("GPOS");
	requireSupported(gpos.readUInt32BE(0) === 0x00010000, "GPOS variations/version");
	const coverage = { lookupTypes: [], pairFormats: [], valueFormats: [], anchorFormats: [], anchors: 0, anchorKinds: {}, deviceReferences: 0, cursiveLookups: 0, verticalMetricsPresent: false };
	const anchors = new Set();
	const anchor = (offset, kind) => {
		if (anchors.has(offset)) return;
		anchors.add(offset);
		const format = gpos.readUInt16BE(offset);
		requireSupported(format === 1, `GPOS anchor format ${format}; point/device/variation anchors need a new profile`);
		coverage.anchorFormats.push(format);
		coverage.anchors++;
		coverage.anchorKinds[kind] = (coverage.anchorKinds[kind] ?? 0) + 1;
		quantize("GPOS", offset + 2, "anchorX");
		quantize("GPOS", offset + 4, "anchorY");
	};
	const markArray = (offset) => {
		for (let index = 0; index < gpos.readUInt16BE(offset); index++) {
			const relative = gpos.readUInt16BE(offset + 4 + index * 4);
			if (relative) anchor(offset + relative, "mark");
		}
	};
	const baseArray = (offset, classes, kind) => {
		const count = gpos.readUInt16BE(offset) * classes;
		for (let index = 0; index < count; index++) {
			const relative = gpos.readUInt16BE(offset + 2 + index * 2);
			if (relative) anchor(offset + relative, kind);
		}
	};
	const valueRecord = (offset, format) => {
		// These exact four faces use xAdvance only. Fail rather than treating a
		// Device offset, placement or variation index as a signed font-unit value.
		requireSupported(format === 0 || format === 4, `GPOS ValueRecord format ${format}`);
		if (format === 4) quantize("GPOS", offset, "gposValues");
		return offset + (format === 4 ? 2 : 0);
	};
	const lookupList = gpos.readUInt16BE(8);
	for (let index = 0; index < gpos.readUInt16BE(lookupList); index++) {
		const lookup = lookupList + gpos.readUInt16BE(lookupList + 2 + index * 2);
		const type = gpos.readUInt16BE(lookup);
		coverage.lookupTypes.push(type);
		requireSupported([2, 4, 5, 6].includes(type), `GPOS lookup type ${type}`);
		for (let subIndex = 0; subIndex < gpos.readUInt16BE(lookup + 4); subIndex++) {
			const sub = lookup + gpos.readUInt16BE(lookup + 6 + subIndex * 2);
			const format = gpos.readUInt16BE(sub);
			if (type === 2) {
				const first = gpos.readUInt16BE(sub + 4);
				const second = gpos.readUInt16BE(sub + 6);
				coverage.pairFormats.push(format);
				coverage.valueFormats.push(first, second);
				if (format === 1) {
					for (let pairIndex = 0; pairIndex < gpos.readUInt16BE(sub + 8); pairIndex++) {
						const set = sub + gpos.readUInt16BE(sub + 10 + pairIndex * 2);
						let cursor = set + 2;
						for (let pair = 0; pair < gpos.readUInt16BE(set); pair++) {
							cursor = valueRecord(cursor + 2, first);
							cursor = valueRecord(cursor, second);
						}
					}
				} else if (format === 2) {
					let cursor = sub + 16;
					const classes = gpos.readUInt16BE(sub + 12) * gpos.readUInt16BE(sub + 14);
					for (let pair = 0; pair < classes; pair++) {
						cursor = valueRecord(cursor, first);
						cursor = valueRecord(cursor, second);
					}
				} else requireSupported(false, `PairPos format ${format}`);
			} else {
				requireSupported(format === 1, `mark attachment format ${format}`);
				const classes = gpos.readUInt16BE(sub + 6);
				markArray(sub + gpos.readUInt16BE(sub + 8));
				const target = sub + gpos.readUInt16BE(sub + 10);
				if (type === 5) {
					for (let ligature = 0; ligature < gpos.readUInt16BE(target); ligature++) {
						baseArray(target + gpos.readUInt16BE(target + 2 + ligature * 2), classes, "ligatureComponent");
					}
				} else baseArray(target, classes, type === 4 ? "base" : "mark2");
			}
		}
	}
	for (const key of ["lookupTypes", "pairFormats", "valueFormats", "anchorFormats"]) coverage[key] = [...new Set(coverage[key])].sort((a, b) => a - b);
	const gdef = table("GDEF");
	requireSupported(gdef.readUInt32BE(0) === 0x00010002 && gdef.readUInt16BE(8) === 0, "GDEF version/ligature caret coordinates need a new profile");

	const kern = table("kern");
	requireSupported(kern.readUInt16BE(0) === 0 && kern.readUInt16BE(2) === 1 && kern.readUInt16BE(4) === 0 && kern.readUInt16BE(8) === 1, "legacy kern version/subtables/coverage");
	const kernPairs = kern.readUInt16BE(10);
	const actualSubtableLength = 14 + 6 * kernPairs;
	// The approved Regular/SemiBold/Bold originals have a >64KiB format0
	// subtable whose uint16 length wraps. Preserve that existing structure;
	// inspect all pairs using the validated SFNT table length and pair count.
	requireSupported(kern.length === actualSubtableLength + 4 && kern.readUInt16BE(6) === (actualSubtableLength & 0xffff), "legacy kern length/pair count");
	coverage.legacyKernPairs = kernPairs;
	coverage.legacyKernLengthWrapRetained = actualSubtableLength > 0xffff;
	for (let index = 0; index < kernPairs; index++) quantize("kern", 22 + index * 6, "legacyKern");

	let maximumAdvance = 0;
	for (let index = 0; index < numberOfHMetrics; index++) maximumAdvance = Math.max(maximumAdvance, hmtx.readUInt16BE(index * 4));
	hhea.writeUInt16BE(maximumAdvance, 10);
	const loca = table("loca");
	const glyf = table("glyf");
	const longOffsets = table("head").readInt16BE(50) === 1;
	const glyphOffset = (index) => longOffsets ? loca.readUInt32BE(index * 4) : loca.readUInt16BE(index * 2) * 2;
	let minimumRightBearing = 32767;
	for (let glyph = 0; glyph < glyphCount; glyph++) {
		const start = glyphOffset(glyph);
		if (start === glyphOffset(glyph + 1)) continue;
		const advance = hmtx.readUInt16BE(Math.min(glyph, numberOfHMetrics - 1) * 4);
		const leftBearing = hmtx.readInt16BE(glyph < numberOfHMetrics ? glyph * 4 + 2 : numberOfHMetrics * 4 + (glyph - numberOfHMetrics) * 2);
		minimumRightBearing = Math.min(minimumRightBearing, advance - leftBearing - (glyf.readInt16BE(start + 6) - glyf.readInt16BE(start + 2)));
	}
	hhea.writeInt16BE(minimumRightBearing, 14);
	const head = table("head");
	head.writeUInt32BE(0, 8);
	for (const [tag, entry] of tables) bytes.writeUInt32BE(sum32(table(tag)), entry.directoryOffset + 4);
	head.writeUInt32BE((0xb1b0afba - sum32(bytes)) >>> 0, 8);
	const checksum = checksumProof(bytes, tables);
	requireSupported(checksum.allTablesValid && checksum.wholeFont === "0xb1b0afba", "prepared SFNT checksum verification failed");
	const preservedTables = [...tables].flatMap(([tag, entry]) => {
		const before = source.subarray(entry.offset, entry.offset + entry.length);
		return before.equals(table(tag)) ? [{ tag, sha256: sha256(before) }] : [];
	});
	const preserved = new Set(preservedTables.map((entry) => entry.tag));
	for (const tag of ["glyf", "loca", "GSUB", "cmap", "name", "GDEF"]) requireSupported(preserved.has(tag), `${tag} must remain byte-identical`);
	return {
		bytes,
		metadata: {
			family: "Aptos", weight, style: "normal",
			original: { path: `${fontDirectory}/${filename}`, sha256: expectedHash, bytes: source.length },
			delivery: { path: `${fontDirectory}/prepared/${filename}`, sha256: sha256(bytes), bytes: bytes.length },
			quantizedFields: counts,
			preservedTables,
			outlineProof: { glyfUnchanged: true, locaUnchanged: true, gsubUnchanged: true, cmapUnchanged: true, nameUnchanged: true },
			formatCoverage: coverage,
			checksum,
		},
	};
}

export async function prepareAptosFonts(root) {
	if (!path.isAbsolute(root)) throw new TypeError("prepareAptosFonts requires the absolute registry root.");
	// Validate every input before creating delivery files. Originals are never
	// opened for writing, and generated metadata contains no workstation paths.
	const prepared = await Promise.all(faces.map(async ([weight, filename, expectedHash]) => {
		const source = await fs.readFile(path.join(root, fontDirectory, filename));
		return prepareFace(source, weight, filename, expectedHash);
	}));
	const result = { profile: APTOS_PREPARATION_PROFILE, faces: prepared.map((face) => face.metadata) };
	await fs.mkdir(path.join(root, fontDirectory, "prepared"), { recursive: true });
	for (const face of prepared) await fs.writeFile(path.join(root, face.metadata.delivery.path), face.bytes);
	await fs.writeFile(path.join(root, fontDirectory, "prepared/preparation.json"), `${JSON.stringify(result, null, 2)}\n`);
	return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
	const result = await prepareAptosFonts(root);
	console.log(`Prepared ${result.faces.length} Aptos faces with profile ${result.profile.version}; original files retained unchanged.`);
}
