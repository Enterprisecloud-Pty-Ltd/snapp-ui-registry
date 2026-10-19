import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { createServer } from "vite";
import { chromium } from "playwright";
import { Scanner } from "@tailwindcss/oxide";

const root = fileURLToPath(new URL("..", import.meta.url));
const consumer = path.resolve(
	process.argv[2] ||
		process.env.SNAPP_CONSUMER_ROOT ||
		path.join(root, "../snappcomponents"),
);
const require = createRequire(path.join(consumer, "package.json"));
const baselineFile =
	process.env.SNAPP_TABS_BASELINE ||
	path.join(consumer, "src/components/ui/tabs.tsx");
const { compile } = await import(
	pathToFileURL(require.resolve("@tailwindcss/node"))
);
const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "snapp-hug-text-"));
const output = path.join(root, "artifacts/figma-qa/hug-text");
await fs.mkdir(output, { recursive: true });
const sources = [
	"registry/radix-nova/ui/hug-text.tsx",
	"registry/radix-nova/ui/tabs.tsx",
	"registry/radix-nova/components/navigation/navigation-header.tsx",
	"registry/radix-nova/ui/tabs.keyboard.ts",
];
const report = {
	capturedAt: new Date().toISOString(),
	fixture,
	sourceSha256: Object.fromEntries(
		await Promise.all(
			sources.map(async (file) => [
				file,
				createHash("sha256")
					.update(await fs.readFile(path.join(root, file)))
					.digest("hex"),
			]),
		),
	),
	checks: [],
	errors: [],
	knownIssues: [],
	baseline: {
		file: baselineFile,
		sha256: createHash("sha256")
			.update(await fs.readFile(baselineFile))
			.digest("hex"),
	},
	limits: [
		"Focused canonical-source React fixture, not the generated registry or production consumer.",
		"Unsupported intrinsic CSS is feature-disabled in Chromium; this is not a Firefox/Safari certification.",
		"Pagination is outside this correction.",
	],
};
const check = (name, passed, details = {}) =>
	report.checks.push({ name, passed: Boolean(passed), ...details });
await fs.copyFile(
	path.join(root, "docs/figma-library/hug-text-preview.tsx"),
	path.join(fixture, "preview.tsx"),
);
await fs.copyFile(
	path.join(root, "registry/radix-nova/fonts/aptos/Aptos.ttf"),
	path.join(fixture, "late-font.ttf"),
);
await fs.writeFile(
	path.join(fixture, "index.html"),
	'<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="/compiled.css"></head><body><p id="host-sentinel" style="font:27px Georgia;color:rgb(150,20,90)">Host sentinel</p><section id="standalone"></section><section id="first-shadow"></section><section id="second-shadow"></section><script type="module" src="/preview.tsx"></script></body></html>',
);
await fs.writeFile(
	path.join(fixture, "tsconfig.json"),
	JSON.stringify({ compilerOptions: { jsx: "react-jsx" } }),
);
const compiler = await compile(
	await fs.readFile(path.join(consumer, "src/index.css"), "utf8"),
	{
		base: path.join(consumer, "src"),
		onDependency() {},
	},
);
const scanner = new Scanner({
	sources: [
		{
			base: path.join(root, "registry/radix-nova"),
			pattern: "**/*.tsx",
			negated: false,
		},
		{ base: fixture, pattern: "*.tsx", negated: false },
	],
});
await fs.writeFile(
	path.join(fixture, "compiled.css"),
	compiler.build(scanner.scan()),
);
const server = await createServer({
	configFile: false,
	root: fixture,
	cacheDir: path.join(fixture, ".vite"),
	server: {
		host: "127.0.0.1",
		port: 0,
		fs: { allow: [fixture, consumer, root] },
	},
	resolve: {
		alias: [
			{ find: "@baseline-tabs", replacement: baselineFile },
			{
				find: "@/components/ui/tabs.keyboard",
				replacement: path.join(root, sources[3]),
			},
			{
				find: "@/components/ui/hug-text",
				replacement: path.join(root, sources[0]),
			},
			{
				find: "@/components/ui/tabs",
				replacement: path.join(root, sources[1]),
			},
			{
				find: "@/components/snapp/navigation/navigation-header",
				replacement: path.join(root, sources[2]),
			},
			{ find: "@", replacement: path.join(consumer, "src") },
			...["react", "react-dom", "radix-ui", "class-variance-authority"].map(
				(name) => ({
					find: name,
					replacement: path.join(consumer, "node_modules", name),
				}),
			),
		],
	},
	optimizeDeps: {
		include: [
			"react",
			"react-dom/client",
			"radix-ui",
			"class-variance-authority",
		],
	},
});
await server.listen();
server.middlewares.use((request, response, next) => {
	if (request.url === "/favicon.ico") {
		response.statusCode = 204;
		response.end();
	} else next();
});
const address = server.httpServer.address();
const url = `http://127.0.0.1:${address.port}/`;
const browser = await chromium.launch({ headless: true });
report.browser = browser.version();
try {
	for (const mode of ["native-css", "resize-observer", "legacy-observer"]) {
		const page = await browser.newPage({
			viewport: { width: 1400, height: 2200 },
		});
		page.on("pageerror", (error) =>
			report.errors.push({ mode, error: error.message }),
		);
		page.on("console", (message) => {
			if (message.type() === "error")
				report.errors.push({ mode, error: message.text() });
		});
		await page.addInitScript((mode) => {
			if (mode !== "native-css") {
				const supports = CSS.supports.bind(CSS);
				CSS.supports = (...args) =>
					args.join(":").includes("calc-size") ? false : supports(...args);
			}
			const audit = { created: 0, active: 0, naturalTargets: 0, callbacks: 0 };
			window.__HUG_OBSERVER_AUDIT__ = audit;
			const Base = ResizeObserver;
			window.ResizeObserver = class extends Base {
				constructor(callback) {
					super((entries, observer) => {
						audit.callbacks++;
						callback(
							mode === "legacy-observer"
								? entries.map((entry) => ({
										target: entry.target,
										contentRect: entry.contentRect,
									}))
								: entries,
							observer,
						);
					});
					audit.created++;
					this.counted = false;
				}
				observe(target, options) {
					if (!this.counted) {
						audit.active++;
						this.counted = true;
					}
					if (target.dataset.slot === "hug-text-content")
						audit.naturalTargets++;
					super.observe(target, options);
				}
				disconnect() {
					if (this.counted) {
						audit.active--;
						this.counted = false;
					}
					super.disconnect();
				}
			};
		}, mode);
		await page.goto(url);
		await page.waitForFunction(
			() =>
				window.__HUG_TEXT_PREVIEW__?.length === 3 &&
				document
					.querySelector("#second-shadow")
					.shadowRoot.querySelector('[data-probe="dynamic"]'),
		);
		await page.evaluate(() => document.fonts.ready);
		await page.waitForFunction(() =>
			[...document.querySelectorAll("#standalone [data-slot=hug-text]")].every(
				(slot) =>
					parseFloat(getComputedStyle(slot).inlineSize) ===
					Math.ceil(
						parseFloat(getComputedStyle(slot.firstElementChild).inlineSize),
					),
			),
		);
		const snapshot = async (id) =>
			page.locator(`#${id}`).evaluate((host) => {
				const scope = host.shadowRoot ?? host;
				const single = scope.querySelector(
					'[data-probe="single"] [role="tab"]',
				);
				const label = single.querySelector('[data-slot="hug-text-content"]');
				const text = document.createRange();
				text.selectNodeContents(label);
				const referenceText = document.createRange();
				const referenceTab = scope.querySelector(
					'[aria-label="Baseline keyboard tabs"] [role="tab"]',
				);
				referenceText.selectNodeContents(
					referenceTab.querySelector('[data-slot="hug-text-content"]') ??
						referenceTab,
				);
				const dynamic = scope.querySelector('[data-probe="dynamic"]');
				const dynamicSlot = dynamic.querySelector('[data-slot="hug-text"]');
				const transformed = scope.querySelector('[data-probe="transformed"]');
				const icon = scope.querySelector('[data-probe="icon"]');
				const iconLabel = icon.querySelector('[data-slot="hug-text"]');
				return {
					single: single.getBoundingClientRect().width,
					textX:
						text.getBoundingClientRect().x - single.getBoundingClientRect().x,
					textWidth: text.getBoundingClientRect().width,
					referenceTextWidth: referenceText.getBoundingClientRect().width,
					expandedLabels: [
						...scope.querySelectorAll('[data-probe="expanded"] > button'),
					].map((button) => {
						const content = button.querySelector(
							'[data-slot="hug-text-content"]',
						);
						const range = document.createRange();
						range.selectNodeContents(content);
						return {
							x:
								range.getBoundingClientRect().x -
								button.getBoundingClientRect().x,
							y:
								content.getBoundingClientRect().y -
								button.getBoundingClientRect().y,
						};
					}),
					textSlot: parseFloat(
						getComputedStyle(label.parentElement).inlineSize,
					),
					textSlotInlineStyle: label.parentElement.style.inlineSize,
					expanded: scope
						.querySelector('[data-probe="expanded"]')
						.getBoundingClientRect().width,
					menu: scope
						.querySelector('[data-probe="menu"]')
						.getBoundingClientRect().width,
					singleCopy:
						label.textContent === "Item" &&
						single.textContent === "Item" &&
						!single.querySelector('[aria-hidden="true"]'),
					dynamic: {
						text: dynamic.textContent,
						natural: parseFloat(
							getComputedStyle(dynamicSlot.firstElementChild).inlineSize,
						),
						slot: parseFloat(getComputedStyle(dynamicSlot).inlineSize),
						width: dynamic.getBoundingClientRect().width,
						family: getComputedStyle(dynamic).fontFamily,
						weight: getComputedStyle(dynamic).fontWeight,
					},
					chunks: {
						text: scope.querySelector('[data-probe="chunks"]').textContent,
						slots: scope
							.querySelector('[data-probe="chunks"]')
							.querySelectorAll('[data-slot="hug-text"]').length,
					},
					iconGap:
						iconLabel.getBoundingClientRect().x -
						icon.querySelector("svg").getBoundingClientRect().right,
					complex: scope.querySelector(
						'[data-probe="complex"] [data-custom-label]',
					)?.textContent,
					asChild: scope.querySelector('[data-probe="as-child"]')?.tagName,
					transformed: {
						slot: parseFloat(getComputedStyle(transformed).inlineSize),
						natural: parseFloat(
							getComputedStyle(transformed.firstElementChild).inlineSize,
						),
						visual: transformed.getBoundingClientRect().width,
					},
					observer: { ...window.__HUG_OBSERVER_AUDIT__ },
				};
			});
		for (const id of ["standalone", "first-shadow", "second-shadow"]) {
			const state = await snapshot(id);
			check(
				`${mode}/${id}: source geometry and unchanged paint`,
				state.single === 60 &&
					state.expanded === 132 &&
					state.menu === 524 &&
					state.textSlot === 28 &&
					state.textX === 16 &&
					(mode === "native-css"
						? state.textSlotInlineStyle === ""
						: state.textSlotInlineStyle === "28px") &&
					state.textWidth === state.referenceTextWidth &&
					state.expandedLabels.every(
						(label, index) =>
							label.x === (index === 0 ? 16 : 28) && label.y === 8,
					),
				state,
			);
			check(
				`${mode}/${id}: single text, fragments, icons, custom and asChild`,
				state.singleCopy &&
					state.chunks.text === "Item2" &&
					state.chunks.slots === 1 &&
					state.iconGap === 8 &&
					state.complex === "Rich label" &&
					state.asChild === "A",
				state,
			);
			check(
				`${mode}/${id}: transforms do not inflate CSS measure`,
				state.transformed.slot === 28 &&
					state.transformed.visual === 42 &&
					state.transformed.slot === Math.ceil(state.transformed.natural),
				state.transformed,
			);
		}
		const audit = (await snapshot("standalone")).observer;
		check(
			`${mode}: feature detection owns only natural text observers`,
			mode === "native-css"
				? audit.created === 0
				: audit.created > 0 && audit.created === audit.naturalTargets,
			audit,
		);
		await page.locator('#first-shadow [data-probe="dynamic"]').focus();
		await page.keyboard.press("ArrowRight");
		await page.evaluate(
			() =>
				new Promise((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(resolve)),
				),
		);
		const keyboardState = await page
			.locator("#first-shadow")
			.evaluate((host) => ({
				focus: host.shadowRoot.activeElement?.outerHTML.slice(0, 200),
				tabs: [
					...host.shadowRoot.querySelectorAll(
						'[aria-label="Dynamic tabs"] [role="tab"]',
					),
				].map((tab) => ({
					probe: tab.dataset.probe,
					active: tab.dataset.state,
				})),
			}));
		await page
			.locator(
				'#first-shadow [aria-label="Baseline keyboard tabs"] [role="tab"]',
			)
			.first()
			.focus();
		await page.keyboard.press("ArrowRight");
		await page.evaluate(
			() =>
				new Promise((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(resolve)),
				),
		);
		const baselineKeyboard = await page
			.locator("#first-shadow")
			.evaluate((host) =>
				[
					...host.shadowRoot.querySelectorAll(
						'[aria-label="Baseline keyboard tabs"] [role="tab"]',
					),
				].map((tab) => ({
					text: tab.textContent,
					active: tab.dataset.state,
					focused: host.shadowRoot.activeElement === tab,
				})),
			);
		const selectedIndex = keyboardState.tabs.findIndex(
			(tab) => tab.active === "active",
		);
		const baselineSelectedIndex = baselineKeyboard.findIndex(
			(tab) => tab.active === "active",
		);
		if (selectedIndex !== 1)
			report.knownIssues.push({
				name: `${mode}: pre-existing Radix ShadowRoot ArrowRight`,
				expectedSelectedIndex: 1,
				actualSelectedIndex: selectedIndex,
				baselineSelectedIndex,
				current: keyboardState,
				baseline: baselineKeyboard,
				cause:
					"Radix focusFirst compares document.activeElement, which remains the ShadowRoot host.",
			});
		check(
			`${mode}: ShadowRoot keyboard selects the immediate next tab and preserves its sibling`,
			selectedIndex === 1 &&
				(await page
					.locator('#second-shadow [data-probe="dynamic"]')
					.getAttribute("data-state")) === "active",
			{ selectedIndex, baselineSelectedIndex },
		);
		await page.locator('#standalone [data-probe="dynamic"]').focus();
		await page.keyboard.press("ArrowRight");
		await page.waitForFunction(
			() =>
				document
					.querySelector('#standalone [data-probe="chunks"]')
					.getAttribute("data-state") === "active",
		);
		check(
			`${mode}: standalone ArrowRight selects immediate next tab`,
			(await page
				.locator('#standalone [data-probe="chunks"]')
				.getAttribute("data-state")) === "active",
		);
		for (const change of [
			{ label: "Translated project label 42" },
			{ weight: 700 },
			{ family: "monospace" },
			{ label: "" },
		]) {
			await page.evaluate(
				(change) => window.__HUG_TEXT_PREVIEW__[1].update(change),
				change,
			);
			await page.waitForFunction((change) => {
				const tab = document
					.querySelector("#first-shadow")
					.shadowRoot.querySelector('[data-probe="dynamic"]');
				if (change.label !== undefined && tab.textContent !== change.label)
					return false;
				if (
					change.weight !== undefined &&
					getComputedStyle(tab).fontWeight !== String(change.weight)
				)
					return false;
				if (
					change.family !== undefined &&
					getComputedStyle(tab).fontFamily !== change.family
				)
					return false;
				const slot = tab.querySelector('[data-slot="hug-text"]');
				return slot
					? parseFloat(getComputedStyle(slot).inlineSize) ===
							Math.ceil(
								parseFloat(getComputedStyle(slot.firstElementChild).inlineSize),
							)
					: tab.textContent === "";
			}, change);
			const state = await snapshot("first-shadow").catch(() => null);
			if (change.label === "") {
				check(
					`${mode}: empty dynamic label remains usable`,
					await page
						.locator('#first-shadow [data-probe="dynamic"]')
						.evaluate(
							(tab) =>
								tab.textContent === "" &&
								tab.getBoundingClientRect().width === 32,
						),
				);
			} else {
				check(
					`${mode}: dynamic ${Object.keys(change)[0]} remeasures`,
					state &&
						state.dynamic.slot === Math.ceil(state.dynamic.natural) &&
						state.dynamic.width === state.dynamic.slot + 32 &&
						(await snapshot("second-shadow")).dynamic.text === "Item",
					state?.dynamic,
				);
			}
		}
		await page.evaluate(() =>
			window.__HUG_TEXT_PREVIEW__[1].update({
				label: "Delayed font metrics",
				weight: 400,
				family: "HugDelayed, monospace",
			}),
		);
		await page.waitForFunction(
			() =>
				document
					.querySelector("#first-shadow")
					.shadowRoot.querySelector('[data-probe="dynamic"]').textContent ===
				"Delayed font metrics",
		);
		const beforeFont = (await snapshot("first-shadow")).dynamic.natural;
		await page.evaluate(async () => {
			const font = new FontFace("HugDelayed", 'url("/late-font.ttf")');
			await font.load();
			document.fonts.add(font);
		});
		await page.waitForFunction((before) => {
			const slot = document
				.querySelector("#first-shadow")
				.shadowRoot.querySelector(
					'[data-probe="dynamic"] [data-slot="hug-text"]',
				);
			const natural = parseFloat(
				getComputedStyle(slot.firstElementChild).inlineSize,
			);
			return (
				Math.abs(natural - before) > 1 &&
				parseFloat(getComputedStyle(slot).inlineSize) === Math.ceil(natural)
			);
		}, beforeFont);
		const afterFont = (await snapshot("first-shadow")).dynamic;
		check(
			`${mode}: late font loading remeasures without duplicate text`,
			afterFont.slot === Math.ceil(afterFont.natural) &&
				afterFont.width === afterFont.slot + 32,
			{ beforeFont, ...afterFont },
		);
		await page.screenshot({
			path: path.join(output, `${mode}.png`),
			fullPage: true,
		});
		const activeBefore = (await snapshot("standalone")).observer.active;
		await page.evaluate(() => window.__HUG_TEXT_PREVIEW__[1].unmount());
		const activeAfter = (await snapshot("standalone")).observer.active;
		await page.evaluate(() =>
			window.__HUG_TEXT_PREVIEW__[2].update({ label: "Sibling still updates" }),
		);
		await page.waitForFunction(
			() =>
				document
					.querySelector("#second-shadow")
					.shadowRoot.querySelector('[data-probe="dynamic"]').textContent ===
				"Sibling still updates",
		);
		check(
			`${mode}: unmount cleans only owned observers`,
			mode === "native-css"
				? activeAfter === 0
				: activeAfter > 0 && activeAfter < activeBefore,
			{ activeBefore, activeAfter },
		);
		check(
			`${mode}: host sentinel and sibling mount survive`,
			(await page
				.locator("#host-sentinel")
				.evaluate(
					(node) =>
						getComputedStyle(node).fontSize === "27px" &&
						getComputedStyle(node).color === "rgb(150, 20, 90)",
				)) &&
				(await snapshot("second-shadow")).dynamic.text ===
					"Sibling still updates",
		);
		await page.evaluate(() => {
			window.__HUG_TEXT_PREVIEW__[0].unmount();
			window.__HUG_TEXT_PREVIEW__[2].unmount();
		});
		check(
			`${mode}: final unmount disconnects every observer`,
			await page.evaluate(() => window.__HUG_OBSERVER_AUDIT__.active === 0),
		);
		await page.close();
	}
} catch (error) {
	report.errors.push({ error: error.stack });
} finally {
	await browser.close();
	await server.close();
}
report.failures = report.checks.filter((entry) => !entry.passed);
await fs.writeFile(
	path.join(output, "hug-text-qa.json"),
	JSON.stringify(report, null, 2),
);
console.log(
	JSON.stringify(
		{
			checks: report.checks.length,
			knownIssues: report.knownIssues,
			failures: report.failures,
			errors: report.errors,
			output,
		},
		null,
		2,
	),
);
if (report.failures.length || report.errors.length) process.exitCode = 1;
