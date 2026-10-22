import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "artifacts/figma-qa/navigation");
const previewUrl =
	process.env.SNAPP_FIGMA_PREVIEW_URL ?? "http://127.0.0.1:4799/";
function familyUrl(family) {
	const url = new URL(previewUrl);
	url.searchParams.set("group", "navigation");
	url.searchParams.set("family", family);
	return url.href;
}
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({
	headless: true,
	...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
		? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
		: {}),
});
const page = await browser.newPage({
	viewport: { width: 2400, height: 3600 },
	deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
	if (message.type() === "error") errors.push(message.text());
});
const evidence = {
	renderedAt: new Date().toISOString(),
	renderer: {
		browser: browser.version(),
		platform: process.platform,
		viewport: { width: 2400, height: 3600 },
		deviceScaleFactor: 1,
	},
	families: [],
	assertions: [],
	failures: [],
	errors,
	screenshots: [],
};
const close = (value, expected, message) => {
	if (Math.abs(value - expected) > 0.15)
		evidence.failures.push(
			`${message}: expected ${expected}, got ${value}`
		);
	else evidence.assertions.push(message);
};
const check = (truth, message) => {
	if (!truth) evidence.failures.push(message);
	else evidence.assertions.push(message);
};
const families = [
	"1:2386",
	"1:2498",
	"1:2549",
	"1:2567",
	"1:2572",
	"1:2617",
	"1:2655",
	"1:2675",
	"1:2790",
	"1:3029",
	"1:3098",
	"13:934",
	"13:1199",
	"50:5887",
	"74:9562",
	"74:9647",
	"281:2267",
	"300:2763",
	"300:2784",
	"334:2201",
	"347:2904",
];
const popupStates = {
	"283:2327": {
		trigger: "Choose application",
		x: 1090,
		y: 64,
		width: 448,
		height: 241,
		padding: "8px",
	},
	"334:2535": {
		trigger: "Choose application",
		x: 1042,
		y: 60,
		width: 448,
		height: 241,
		padding: "8px",
	},
	"334:2623": {
		trigger: "Switch area",
		x: 1082,
		y: 60,
		width: 360,
		height: 96,
		padding: "8px",
	},
	"334:2718": {
		trigger: "User controls",
		x: 1406,
		y: 60,
		width: 132,
		height: 96,
		padding: "16px",
	},
	"334:2769": {
		trigger: "Service Management",
		x: 130,
		y: 60,
		height: 240,
		padding: "24px",
	},
	"342:2403": {
		trigger: "Open live support",
		x: 1024,
		y: 60,
		width: 370,
		height: 500,
		padding: "0px",
	},
};
evidence.popups = [];
async function captureState(state) {
	const fixture = page.locator(`[data-figma-node="${state.id}"]`);
	const expected = popupStates[state.id];
	if (expected) {
		const trigger = fixture.getByRole("button", {
			name: expected.trigger,
			exact: true,
		});
		if ((await trigger.getAttribute("data-state")) !== "open")
			await trigger.click();
		await fixture.locator('[data-slot="popover-content"]').waitFor();
		await page.waitForTimeout(150);
		const popup = await fixture.evaluate((root) => {
			const node = root.querySelector('[data-slot="popover-content"]'),
				r = node.getBoundingClientRect(),
				rr = root.getBoundingClientRect(),
				s = getComputedStyle(node);
			return {
				node: root.dataset.figmaNode,
				x: r.x - rr.x,
				y: r.y - rr.y,
				width: r.width,
				height: r.height,
				padding: s.padding,
				radius: s.borderRadius,
			};
		});
		evidence.popups.push(popup);
		for (const key of ["y", "width", "height"])
			if (expected[key] !== undefined)
				close(popup[key], expected[key], `${state.id} popup ${key}`);
		check(
			Math.abs(popup.x - expected.x) <= 1,
			`${state.id} popup horizontal anchor within1px`
		);
		check(
			popup.padding === expected.padding && popup.radius === "8px",
			`${state.id} popup padding/radius`
		);
		if (state.id === "334:2769") {
			const link = await fixture
				.getByRole("button", { name: "Applications", exact: true })
				.evaluate((node) => {
					const s = getComputedStyle(node);
					return {
						font: s.fontFamily,
						size: s.fontSize,
						line: s.lineHeight,
						weight: s.fontWeight,
					};
				});
			check(
				link.font.includes("Aptos") &&
					link.size === "16px" &&
					link.line === "20px" &&
					link.weight === "400",
				"Square feature links exact Aptos16/20 regular"
			);
			check(
				(await fixture
					.getByText("Employee Self-service", { exact: true })
					.count()) === 1,
				"Square feature group caption retained"
			);
		}
	}
	if (state.id === "334:2623") {
		const areas = await fixture
			.locator('[data-slot="snapp-app-grid"] button')
			.evaluateAll((buttons) =>
				buttons.map((button) => {
					const r = button.getBoundingClientRect();
					const icon = button
						.querySelector("img")
						.getBoundingClientRect();
					const text = button
						.querySelector(":scope > span:last-child")
						.getBoundingClientRect();
					return {
						label: button.textContent,
						icons: button.querySelectorAll("img").length,
						w: icon.width,
						h: icon.height,
						x: icon.x - r.x,
						y: icon.y - r.y,
						labelY: text.y - r.y,
					};
				})
			);
		check(
			areas.length === 4 &&
				areas.every(
					(area) => area.label === "Area Name" && area.icons === 1
				),
			"Area switcher uses only source puzzle icon and Area Name labels"
		);
		check(
			areas[0].w === 16 &&
				areas[0].h === 16 &&
				areas[0].x === 32 &&
				areas[0].y === 20 &&
				areas[0].labelY === 44,
			"First area exact16px puzzle slot32/20 and label44"
		);
		check(
			areas
				.slice(1)
				.every(
					(area) =>
						area.w === 20 &&
						area.h === 20 &&
						area.x === 30 &&
						area.y === 18 &&
						area.labelY === 46
				),
			"Remaining areas exact20px puzzle slot30/18 and label46"
		);
	}
	await page.mouse.move(0, 0);
	const screenshot = path.join(
		output,
		"state-" + state.id.replace(":", "-") + ".png"
	);
	await fixture.screenshot({ path: screenshot });
	evidence.screenshots.push(screenshot);
	if (expected) {
		if (state.id === "334:2535") {
			await fixture.getByPlaceholder("Find Apps").fill("More Apps");
			check(
				(await fixture
					.locator('[data-slot="snapp-app-grid"] button')
					.count()) === 1,
				"App launcher search filters results"
			);
		}
		if (state.id === "342:2403") {
			const before = await fixture.getByRole("log").textContent();
			const send = fixture.getByRole("button", {
				name: "Send message",
				exact: true,
			});
			check(
				await send.isEnabled(),
				"Support empty composer retains source enabled appearance"
			);
			check(
				(await send.evaluate(
					(node) => getComputedStyle(node).opacity
				)) === "1",
				"Support send button retains source full-opacity brand fill"
			);
			if (await send.isEnabled()) await send.click();
			check(
				(await fixture.getByRole("log").textContent()) === before,
				"Support empty submit does not dispatch a message"
			);
			await fixture
				.getByPlaceholder("Type your message...")
				.fill("Registry QA message");
			await fixture
				.getByRole("button", { name: "Send message", exact: true })
				.click();
			check(
				(await fixture.getByRole("log").textContent()).includes(
					"Registry QA message"
				),
				"Live support sends message through host callback"
			);
			const text = await fixture
				.getByRole("log")
				.locator('[data-slot="snapp-support-message"]')
				.first()
				.evaluate((n) => {
					const s = getComputedStyle(n);
					return {
						font: s.fontFamily,
						size: s.fontSize,
						line: s.lineHeight,
					};
				});
			check(
				text.font.includes("IBM Plex Sans") &&
					text.size === "16px" &&
					text.line === "20px",
				"Support message IBM Plex Sans16/20"
			);
		}
		await fixture.locator('[data-slot="popover-content"]').press("Escape");
		check(
			(await fixture.locator('[data-slot="popover-content"]').count()) ===
				0,
			`${state.id} popup Escape closes`
		);
		if (state.id === "283:2327" || state.id === "334:2535") {
			const trigger = fixture.getByRole("button", {
				name: "Choose application",
				exact: true,
			});
			await fixture
				.locator('[data-slot="popover-content"]')
				.waitFor({ state: "detached" });
			await page.waitForFunction(
				(node) => node === node.ownerDocument.activeElement,
				await trigger.elementHandle()
			);
			for (const key of ["Enter", "Space"]) {
				await trigger.focus();
				await trigger.press(key);
				const search = fixture.getByPlaceholder("Find Apps");
				await search.waitFor();
				await page.waitForFunction(
					() =>
						document.activeElement?.getAttribute("placeholder") ===
						"Find Apps"
				);
				check(
					await search.evaluate(
						(node) => node === node.ownerDocument.activeElement
					),
					`${state.id} keyboard ${key} opens and focuses search`
				);
				await search.press("Tab");
				check(
					await fixture
						.locator('[data-slot="snapp-app-grid"] button')
						.first()
						.evaluate(
							(node) => node === node.ownerDocument.activeElement
						),
					`${state.id} keyboard Tab reaches first application`
				);
				await page.keyboard.press("Escape");
				await fixture
					.locator('[data-slot="popover-content"]')
					.waitFor({ state: "detached" });
				await page.waitForFunction(
					(node) => node === node.ownerDocument.activeElement,
					await trigger.elementHandle()
				);
				check(
					await trigger.evaluate(
						(node) => node === node.ownerDocument.activeElement
					),
					`${state.id} Escape restores launcher trigger focus`
				);
			}
			await trigger.click();
			await fixture.getByPlaceholder("Find Apps").waitFor();
			check(
				await fixture
					.getByPlaceholder("Find Apps")
					.evaluate(
						(node) => node !== node.ownerDocument.activeElement
					),
				`${state.id} pointer opening leaves search in source resting state`
			);
			await page.keyboard.press("Escape");
		}
	}
}
try {
	for (const family of families) {
		await page.goto(familyUrl(family));
		await page.locator("[data-figma-family]").waitFor();
		await page.mouse.move(0, 0);
		await page.evaluate(async () => {
			await document.fonts.ready;
			await Promise.all(
				[...document.images].map((image) =>
					image.complete
						? Promise.resolve()
						: image.decode().catch(() => {})
				)
			);
		});
		const states = await page
			.locator("[data-figma-node]")
			.evaluateAll((elements) =>
				elements.map((element) => {
					const child = element.firstElementChild;
					const rect = child.getBoundingClientRect();
					return {
						id: element.getAttribute("data-figma-node"),
						variant: element.getAttribute("data-variant"),
						width: rect.width,
						height: rect.height,
					};
				})
			);
		for (const state of states) await captureState(state);
		const images = await page.locator("img").evaluateAll((elements) =>
			elements.map((image) => {
				const rect = image.getBoundingClientRect();
				return {
					src: image.currentSrc,
					width: rect.width,
					height: rect.height,
					naturalWidth: image.naturalWidth,
					naturalHeight: image.naturalHeight,
					complete: image.complete,
				};
			})
		);
		check(
			images.every(
				(image) =>
					image.complete &&
					image.naturalWidth > 0 &&
					image.naturalHeight > 0
			),
			family + " all rendered SVG/image assets load"
		);
		const metrics = await page
			.locator("[data-figma-node]")
			.evaluateAll((elements) =>
				elements.map((element) => {
					const target = element.firstElementChild,
						cs = getComputedStyle(target);
					const samples = [
						...target.querySelectorAll(
							'button,input,[data-slot="snapp-tree-badge"],a'
						),
					].map((node) => {
						const rect = node.getBoundingClientRect(),
							style = getComputedStyle(node);
						return {
							slot: node.getAttribute("data-slot"),
							text: node.textContent,
							label: node.getAttribute("aria-label"),
							width: rect.width,
							height: rect.height,
							font: style.fontFamily,
							fontSize: style.fontSize,
							fontWeight: style.fontWeight,
							lineHeight: style.lineHeight,
							letterSpacing: style.letterSpacing,
							padding: style.padding,
							radius: style.borderRadius,
							color: style.color,
							background: style.backgroundColor,
						};
					});
					return {
						variant: element.getAttribute("data-variant"),
						root: {
							font: cs.fontFamily,
							fontSize: cs.fontSize,
							lineHeight: cs.lineHeight,
							weight: cs.fontWeight,
							padding: cs.padding,
							gap: cs.gap,
							radius: cs.borderRadius,
						},
						samples,
					};
				})
			);
		evidence.families.push({
			id: family,
			states,
			renderedImages: images.length,
			metrics,
		});
		check(
			metrics.every((metric) => metric.root.font.includes("Aptos")),
			family + " root typography resolves to bundled Aptos"
		);
		const image = path.join(output, family.replace(":", "-") + ".png");
		await page.locator("[data-figma-family]").screenshot({ path: image });
		evidence.screenshots.push(image);
		if (family === "1:2386") {
			states.forEach((state) =>
				close(state.height, 48, state.id + " header height")
			);
			const selected = page
				.locator('[data-state="active"][data-slot="tabs-trigger"]')
				.first();
			const typography = await selected.evaluate((node) => ({
				font: getComputedStyle(node).fontFamily,
				size: getComputedStyle(node).fontSize,
				line: getComputedStyle(node).lineHeight,
				weight: getComputedStyle(node).fontWeight,
				underline: getComputedStyle(node, "::after").height,
				color: getComputedStyle(node, "::after").backgroundColor,
			}));
			check(
				typography.font.includes("Aptos") &&
					typography.size === "14px" &&
					typography.line === "20px" &&
					typography.weight === "700",
				"Line tab Aptos14/20 bold700"
			);
			check(
				typography.underline === "2px" &&
					typography.color === "rgb(0, 120, 212)",
				"Line tab active2px blue underline"
			);
			const next = page
				.locator('[data-figma-node="1:2387"]')
				.getByRole("tab", { name: "Completed", exact: true });
			await next.click();
			check(
				(await next.getAttribute("data-state")) === "active",
				"Line tabs change selection"
			);
		}
		if (family === "1:2498") {
			close(states[0].width, 300, "Tree menu width300");
			close(
				(
					await page
						.locator('[data-slot="snapp-tree-item"]')
						.first()
						.boundingBox()
				).height,
				28,
				"Tree menu leaf height28"
			);
		}
		if (family === "1:2549") {
			close(states[0].height, 28, "Structured row28high");
			close(
				(await page.getByRole("progressbar").boundingBox()).width,
				120,
				"Row progress width120"
			);
		}
		if (family === "1:2567") close(states[0].height, 32, "Row title32high");
		if (family === "1:2572" || family === "1:2617") {
			states.forEach((state) =>
				close(state.height, 32, state.id + " tree visual state32high")
			);
			const notification = page
				.locator(
					'[data-variant="notification"] [data-slot="' +
						(family === "1:2572"
							? "snapp-tree-item"
							: "snapp-tree-folder") +
						'"]'
				)
				.first();
			const badge = notification
				.locator("span")
				.filter({ hasText: /^1$/ })
				.last();
			const font = await badge.evaluate(
				(node) => getComputedStyle(node).fontFamily
			);
			check(
				font.includes("IBM Plex Sans"),
				family + " notification badge exactIBMfont"
			);
		}
		if (family === "1:2655") {
			close(states[0].height, 36, "Pagination36high");
			close(states[0].width, 413, "Pagination Figma width413");
			const labels = await page
				.locator('[data-slot="pagination-link"]')
				.evaluateAll((links) =>
					links.flatMap((link) => {
						const slot = link.querySelector(
							'[data-slot="hug-text"]'
						);
						const content = slot?.querySelector(
							'[data-slot="hug-text-content"]'
						);
						if (!slot || !content) return [];
						const pagination = link
							.closest('[data-slot="pagination"]')
							.getBoundingClientRect();
						const control = link.getBoundingClientRect();
						const text = document.createRange();
						text.selectNodeContents(content);
						const style = getComputedStyle(content);
						return [
							{
								text: content.textContent,
								slot: slot.getBoundingClientRect().width,
								x:
									text.getBoundingClientRect().x -
									pagination.x,
								y:
									content.getBoundingClientRect().y -
									pagination.y,
								controlX: control.x - pagination.x,
								controlWidth: control.width,
								fontFamily: style.fontFamily,
								fontSize: style.fontSize,
								lineHeight: style.lineHeight,
								weight: style.fontWeight,
								kerning: style.fontKerning,
							},
						];
					})
				);
			const expectedLabels = [
				{
					node: "1:2662",
					text: "Week 1 - 3",
					slot: 63,
					x: 56,
					controlX: 48,
					controlWidth: 79,
				},
				{
					node: "1:2665",
					text: "Week 4 - 6",
					slot: 63,
					x: 139,
					controlX: 131,
					controlWidth: 79,
				},
				{
					node: "1:2668",
					text: "Week 7 - 8",
					slot: 63,
					x: 222,
					controlX: 214,
					controlWidth: 79,
				},
				{
					node: "1:2673",
					text: "Next",
					slot: 28,
					x: 349,
					controlX: 337,
					controlWidth: 76,
				},
			];
			check(
				labels.length === 4,
				"Pagination has exactly four single-copy source labels"
			);
			expectedLabels.forEach((expected, index) => {
				const actual = labels[index] ?? {};
				close(
					actual.slot ?? 0,
					expected.slot,
					`${expected.node} Pagination HUG slot${expected.slot}`
				);
				close(
					actual.x ?? -1,
					expected.x,
					`${expected.node} Pagination source text origin`
				);
				close(
					actual.y ?? -1,
					8,
					`${expected.node} Pagination source text top8`
				);
			});
			check(
				labels.length === 4 &&
					labels.every(
						(label, index) =>
							label.text === expectedLabels[index].text &&
							label.controlX === expectedLabels[index].controlX &&
							label.controlWidth ===
								expectedLabels[index].controlWidth &&
							label.fontFamily.includes("Aptos") &&
							label.weight === "400" &&
							label.fontSize === "14px" &&
							label.lineHeight === "20px" &&
							label.kerning !== "none"
					),
				"Pagination preserves source control positions and normal Aptos paint"
			);
			evidence.intrinsicTextDifferences = {
				pagination: {
					figma: 413,
					chromium: states[0].width,
					correction:
						"Figma-aligned font metrics and registry-owned whole-pixel HUG text slots preserve normal kerning and source text origins without fixed label widths.",
					labels,
				},
			};
		}
		if (family === "1:2675") {
			const documents = page.getByRole("treeitem", {
				name: "5 Auto Provision System Access",
				exact: true,
			});
			const documentBranch = documents.first();
			check(
				(await documentBranch
					.locator(":scope > span")
					.evaluate((node) => getComputedStyle(node).color)) ===
					"rgb(42, 44, 46)",
				"Document branch retains source primary text colour"
			);
			const drop = page.locator(
				'[data-slot="snapp-tree-drop-indicator"]'
			);
			close(
				(await drop.locator("img").boundingBox()).width,
				268,
				"Tree drop arrow retains natural268px SVG width"
			);
			close(
				(
					await drop
						.locator('[data-slot="snapp-navigation-icon"]')
						.boundingBox()
				).width,
				24,
				"Tree drop arrow leading window24px"
			);
			const hierarchy = await page
				.locator('[data-figma-node="1:2675"]')
				.evaluate((root) => {
					const rr = root.getBoundingClientRect();
					const rows = [
						...root.querySelectorAll('[role="treeitem"]'),
					];
					return {
						documents: rows
							.filter(
								(row) =>
									row.textContent ===
									"5 Auto Provision System Access"
							)
							.map((row) => {
								const r = row
									.querySelector("img")
									.getBoundingClientRect();
								return { x: r.x - rr.x, y: r.y - rr.y };
							}),
						group: [...root.querySelectorAll('[role="group"]')]
							.map((node) => {
								const r = node.getBoundingClientRect();
								return {
									x: r.x - rr.x,
									y: r.y - rr.y,
									h: r.height,
								};
							})
							.find((r) => r.x === 88 && r.y === 352),
						lastFolderIcons: rows
							.find(
								(row) =>
									row.getBoundingClientRect().y - rr.y === 544
							)
							?.querySelectorAll("img").length,
					};
				});
			check(
				hierarchy.documents.length === 2 &&
					hierarchy.documents.every((r) => r.x === 104),
				"Both source nested documents have104px icon-slot indent"
			);
			check(
				hierarchy.documents[0].y === 358 &&
					hierarchy.documents[1].y === 390,
				"Nested document source rows352/384 keep centered20px icons"
			);
			check(
				hierarchy.group?.h === 96,
				"Nested guideline starts at352 and spans all three rows"
			);
			check(
				hierarchy.lastFolderIcons === 1,
				"Source folder at544 has no fabricated chevron"
			);
			const first = page.getByRole("treeitem").first();
			await first.focus();
			await first.press("ArrowRight");
			check(
				(await first.getAttribute("aria-expanded")) === "true",
				"Tree ArrowRight preserves expanded branch"
			);
			await first.press("ArrowDown");
			check(
				(await page.evaluate(() =>
					document.activeElement?.getAttribute("role")
				)) === "treeitem",
				"Tree ArrowDown focuses next item"
			);
			await page.keyboard.press("ArrowLeft");
			check(
				(await page.evaluate(() =>
					document.activeElement?.getAttribute("role")
				)) === "treeitem",
				"Tree ArrowLeft returns or collapses branch"
			);
			const empty = page
				.locator('[role="treeitem"][aria-expanded]')
				.filter({ hasNot: page.locator("[role=group]") })
				.last();
			await empty.focus();
			if ((await empty.getAttribute("aria-expanded")) === "false")
				await empty.press("ArrowRight");
			await empty.press("ArrowRight");
			check(
				await empty.evaluate((node) => node === document.activeElement),
				"Expanded empty folder ArrowRight keeps focus"
			);
		}
		if (family === "1:2790") {
			check(
				await page
					.getByText("Item Name 1", { exact: true })
					.evaluateAll((nodes) =>
						nodes.every(
							(node) =>
								getComputedStyle(node).whiteSpace === "nowrap"
						)
					),
				"TreeBuilder fixed-width card labels do not wrap"
			);
			close(
				states[0].height,
				780,
				"TreeBuilder faithful mixed composition780high"
			);
			const fixed = page
				.getByRole("treeitem")
				.filter({ hasText: "Request System Access" })
				.first();
			close(
				(await fixed.boundingBox()).width,
				268,
				"TreeBuilder fixed catalogue card268wide"
			);
			const compact = page
				.locator('[data-slot="snapp-tree-item"]')
				.filter({ hasText: /^Request System Access$/ })
				.last();
			close(
				(await compact.boundingBox()).height,
				28,
				"TreeBuilder editable row28high"
			);
			await page
				.getByRole("button", {
					name: "More options for service offering",
					exact: true,
				})
				.click();
			check(
				(await page
					.locator('[data-slot="snapp-tree-builder"]')
					.getAttribute("data-last-menu")) === "offering",
				"TreeBuilder independent menu callback"
			);
			const root = page.getByRole("treeitem").first();
			await root.click();
			check(
				(await page
					.getByText("SERVICE CATALOGUE ITEM", { exact: true })
					.count()) === 0,
				"TreeBuilder root collapses composed descendants"
			);
		}
		if (family === "1:3029") {
			close(states[0].height, 50, "Profile controls50high");
			close(states[0].width, 1920, "Profile controls1920wide");
		}
		if (family === "1:3098") {
			close(states[0].width, 268, "Branded sidebar268wide");
			close(states[0].height, 864, "Branded sidebar864high");
			const detail = await page
				.locator('[data-slot="snapp-branded-sidebar"]')
				.evaluate((root) => ({
					header: root.firstElementChild.getBoundingClientRect()
						.height,
					areas: root.lastElementChild.children[1].getBoundingClientRect()
						.height,
					gap: getComputedStyle(root.querySelector("nav ul")).gap,
					gaps: [...root.querySelectorAll("nav ul")].map(
						(node) => getComputedStyle(node).gap
					),
					groupY: [...root.querySelectorAll("nav section")].map(
						(node) =>
							node.getBoundingClientRect().y -
							root.getBoundingClientRect().y
					),
					app: root.firstElementChild
						.querySelector("button")
						.getBoundingClientRect().width,
				}));
			close(
				detail.header,
				116,
				"Branded sidebar inside divider keeps116px header"
			);
			close(
				detail.areas,
				96,
				"Branded sidebar inside divider keeps96px areas"
			);
			close(detail.app, 220, "Branded sidebar app selector220wide");
			check(detail.gap === "8px", "Branded sidebar row gap8");
			check(
				detail.gaps.join(",") === "8px,4px,4px",
				"Branded sidebar mixed source group gaps8/4/4"
			);
			detail.groupY.forEach((value, index) =>
				close(
					value,
					[140, 256, 400][index],
					"Branded sidebar group " + (index + 1) + " vertical anchor"
				)
			);
		}
		if (family === "13:934")
			states.forEach((state) =>
				close(state.height, 48, state.id + " feature header48high")
			);
		if (family === "13:1199") {
			const middleBar = await page
				.getByRole("button", {
					name: "Collapse navigation",
					exact: true,
				})
				.locator("span")
				.evaluate(
					(node) =>
						parseFloat(getComputedStyle(node).borderTopWidth) +
						parseFloat(getComputedStyle(node, "::before").top)
				);
			close(
				middleBar,
				4,
				"Dynamics hamburger middle bar exactY4 after border origin"
			);
			close(
				(
					await page
						.getByRole("button", {
							name: "Collapse navigation",
							exact: true,
						})
						.boundingBox()
				).height,
				9,
				"Dynamics hamburger three bars span9px"
			);
			close(states[0].width, 201, "Dynamics rail201wide");
			await page
				.getByRole("button", {
					name: "Collapse navigation",
					exact: true,
				})
				.locator("span")
				.screenshot({
					path: path.join(output, "hamburger-detail.png"),
				});
		}
		if (family === "50:5887") {
			const children = await page
				.locator('[data-slot="snapp-side-menu"]')
				.evaluate((root) =>
					[...root.children].map((n) => {
						const r = n.getBoundingClientRect();
						return { width: r.width, height: r.height };
					})
				);
			children.forEach((child) =>
				close(
					child.height,
					1280,
					"Composite side menu child height1280"
				)
			);
			close(children[1].width, 284, "Composite panel first width284");
			close(children[2].width, 284, "Composite panel second width284");
		}
		if (family === "74:9562") {
			const styles = await page
				.locator('[data-slot="toggle-group-item"]')
				.evaluateAll((nodes) =>
					nodes.map((n) => ({
						padding: getComputedStyle(n).padding,
						radius: getComputedStyle(n).borderRadius,
						weight: getComputedStyle(n).fontWeight,
					}))
				);
			check(
				styles.every((s) => s.padding === "11px" && s.weight === "400"),
				"Editor all buttons exact11px padding and400weight"
			);
			check(
				styles[0].radius === "4px 0px 0px 4px" &&
					styles[2].radius === "0px 4px 4px 0px",
				"Editor grouped outside corners4px"
			);
			close(states[0].height, 54, "Editor toolbar54high");
			close(states[0].width, 349, "Editor toolbar349wide");
			const bold = page.getByRole("button", {
				name: "Bold",
				exact: true,
			});
			await bold.click();
			check(
				(await bold.getAttribute("aria-pressed")) === "true",
				"Toolbar toggles Bold"
			);
			const right = page.getByRole("radio", {
				name: "Align right",
				exact: true,
			});
			if (await right.count()) {
				await right.click();
				check(
					(await right.getAttribute("aria-checked")) === "true",
					"Toolbar exclusive alignment"
				);
			} else {
				const alignment = page.getByRole("button", {
					name: "Align right",
					exact: true,
				});
				await alignment.click();
				check(
					(await alignment.getAttribute("aria-pressed")) === "true",
					"Toolbar exclusive alignment"
				);
			}
		}
		if (family === "74:9647") {
			close(states[0].width, 537, "Auxiliary sidebar537wide");
			const search = page.getByRole("searchbox");
			close(
				(await search.locator("..").boundingBox()).width,
				505,
				"Sidebar search505wide"
			);
			await page
				.getByRole("button", { name: "Expired", exact: true })
				.click();
			check(
				(await page
					.getByRole("button", { name: "Expired", exact: true })
					.count()) === 0,
				"Sidebar filter pills removable"
			);
		}
		if (family === "281:2267") {
			close(states[0].height, 56, "Updated header56high");
			close(states[1].height, 292, "Expanded updated header292high");
			await page
				.locator('[data-figma-node="281:2268"]')
				.getByRole("button", { name: "Feature Group", exact: true })
				.press("Escape");
			check(
				(await page
					.locator('[data-slot="snapp-header-feature-menu"]')
					.count()) === 0,
				"Updated feature menu Escape closes"
			);
		}
		if (family === "300:2763")
			states.forEach((state) =>
				close(state.height, 36, state.id + " tab item36high")
			);
		if (family === "300:2763") {
			const button = await page
				.locator('[data-slot="tabs-trigger"]')
				.first()
				.boundingBox();
			close(button.width, 60, "Tab Item Figma width60");
			close(states[2].width, 132, "Expanded Tab Figma width132");
			const labels = await page
				.locator(
					'[data-slot="tabs-trigger"], [data-slot="snapp-expanded-tab"] > button'
				)
				.evaluateAll((controls) =>
					controls.map((control) => {
						const slot = control.querySelector(
							'[data-slot="hug-text"]'
						);
						const content = slot?.querySelector(
							'[data-slot="hug-text-content"]'
						);
						if (!slot || !content) return { missing: true };
						const rect = control.getBoundingClientRect();
						const range = document.createRange();
						range.selectNodeContents(content);
						const style = getComputedStyle(content);
						return {
							width: rect.width,
							slot: slot.getBoundingClientRect().width,
							x: range.getBoundingClientRect().x - rect.x,
							y: content.getBoundingClientRect().y - rect.y,
							text: content.textContent,
							kerning: style.fontKerning,
							weight: style.fontWeight,
							fontSize: style.fontSize,
							lineHeight: style.lineHeight,
						};
					})
				);
			labels.forEach((label, index) => {
				close(
					label.slot ?? 0,
					28,
					`Tab label${index} Figma HUG slot28`
				);
				close(
					label.x ?? -1,
					index === 3 ? 28 : 16,
					`Tab label${index} unchanged Figma left origin`
				);
			});
			check(
				labels.length === 4 &&
					labels.every(
						(label, index) =>
							!label.missing &&
							label.width === (index === 3 ? 72 : 60) &&
							label.y === 8 &&
							label.text === "Item" &&
							label.kerning !== "none" &&
							label.weight === "400" &&
							label.fontSize === "14px" &&
							label.lineHeight === "20px"
					),
				"All four Tab source labels retain normal paint and exact geometry"
			);
			evidence.intrinsicTextDifferences.tabItem = {
				figma: 60,
				chromium: button.width,
				correction:
					"Registry-owned whole-pixel HUG text slot; normal glyph paint and text origin preserved.",
				labels,
			};
			evidence.intrinsicTextDifferences.expandedTab = {
				figma: 132,
				chromium: states[2].width,
			};
		}
		if (family === "300:2784") {
			const list = await page
				.locator('[data-slot="tabs-list"]')
				.boundingBox();
			close(list.width, 524, "Eight-tab menu Figma width524");
			const menuLabels = await page
				.locator('[data-slot="tabs-trigger"]')
				.evaluateAll((tabs) =>
					tabs.map((tab) => {
						const rect = tab.getBoundingClientRect();
						const list = tab.parentElement.getBoundingClientRect();
						const slot = tab.querySelector(
							'[data-slot="hug-text"]'
						);
						return {
							width: rect.width,
							x: rect.x - list.x,
							slot: slot?.getBoundingClientRect().width,
						};
					})
				);
			check(
				menuLabels.length === 8 &&
					menuLabels.every(
						(label, index) =>
							label.width === 60 &&
							label.x === 8 + index * 64 &&
							label.slot === 28
					),
				"All eight Tabbed Menu source slots retain60px controls,4px gaps and28px labels"
			);
			evidence.intrinsicTextDifferences.tabbedMenu = {
				figma: 524,
				chromium: list.width,
				textRuns: 8,
				labels: menuLabels,
			};
			close(states[0].height, 52, "Pill tabs52high");
			const tab = page.getByRole("tab").first();
			const font = await tab.evaluate((node) => ({
				family: getComputedStyle(node).fontFamily,
				size: getComputedStyle(node).fontSize,
				line: getComputedStyle(node).lineHeight,
				weight: getComputedStyle(node).fontWeight,
				background: getComputedStyle(node).backgroundColor,
			}));
			check(
				font.family.includes("Aptos") &&
					font.size === "14px" &&
					font.line === "20px" &&
					font.weight === "400" &&
					font.background === "rgb(47, 69, 92)",
				"Pill tab Aptos14/20 regular400 withbrandselectedfill"
			);
		}
		if (family === "334:2201")
			states.forEach((state) =>
				close(state.height, 52, state.id + " square header52high")
			);
		if (family === "347:2904")
			states.forEach((state) =>
				close(state.height, 52, state.id + " tool menu52high")
			);
	}
	check(
		errors.length === 0,
		"No browserconsole/page errors across21families"
	);
	await fs.writeFile(
		path.join(output, "navigation-qa.json"),
		JSON.stringify(evidence, null, 2)
	);
	if (evidence.failures.length) process.exitCode = 1;
	console.log(
		JSON.stringify({
			status: evidence.failures.length ? "failed" : "passed",
			failures: evidence.failures,
			families: evidence.families.length,
			variants: evidence.families.reduce(
				(sum, family) => sum + family.states.length,
				0
			),
			assertions: evidence.assertions.length,
			output,
		})
	);
} catch (error) {
	evidence.failure = error.message;
	await fs.writeFile(
		path.join(output, "navigation-qa.json"),
		JSON.stringify(evidence, null, 2)
	);
	console.error(error);
	process.exitCode = 1;
} finally {
	await browser.close();
}
