import assert from "node:assert/strict";
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifacts = path.join(root, "artifacts/figma-qa/forms");
await fs.mkdir(artifacts, { recursive: true });
const base = process.env.SNAPP_FIGMA_PREVIEW_URL ?? "http://127.0.0.1:4799";
const browser = await chromium.launch({ headless: true });
try {
	const page = await browser.newPage({
		viewport: { width: 1600, height: 1700 },
	});
	await page.goto(base + "/?group=forms");
	await page.locator('[data-figma-node="49:5158"]').waitFor();
	await page.evaluate(() => document.fonts.ready);
	const requiredLabel = await page
		.locator('[data-figma-node="13:1297"] label')
		.evaluate((label) => {
			const content = label.firstElementChild;
			const star = content.querySelector('[aria-hidden="true"]');
			const preceding = document.createRange();
			preceding.selectNodeContents(content);
			preceding.setEndBefore(star);
			const glyph = document.createRange();
			const textNodes = document.createTreeWalker(
				star,
				NodeFilter.SHOW_TEXT
			);
			let text = textNodes.nextNode();
			while (text && !text.textContent.includes("*"))
				text = textNodes.nextNode();
			if (!text) throw new Error("Required marker glyph is missing");
			const offset = text.textContent.indexOf("*");
			glyph.setStart(text, offset);
			glyph.setEnd(text, offset + 1);
			const canvas = document.createElement("canvas").getContext("2d");
			canvas.font = getComputedStyle(label).font;
			return {
				gap:
					glyph.getBoundingClientRect().left -
					preceding.getBoundingClientRect().right,
				sourceSpace: canvas.measureText(" ").width,
			};
		});
	assert.ok(
		Math.abs(requiredLabel.gap - requiredLabel.sourceSpace) < 0.05,
		"Required marker uses the actual font space from Figma"
	);
	const controls = await page.evaluate(() => {
		const fields = [
			["input", "13:1295", "input"],
			["textarea", "13:1355", "textarea"],
			["surface", "13:1301", '[data-slot="form-control-surface"]'],
			["upload", "19:1588", "button"],
			["date", "13:1413", "button"],
			["date-inter", "49:4992", "button"],
			["input-group-multiline", "49:5158", '[data-slot="input-group"]'],
			["number", "153:2212", 'input[type="number"]'],
			["combobox", "13:1305", '[data-slot="combobox-trigger"]'],
			["button", "1:3049", "button"],
		];
		return fields.map(([name, id, selector]) => {
			const element = document
				.querySelector(`[data-figma-node="${id}"]`)
				.querySelector(selector);
			const c = getComputedStyle(element),
				r = element.getBoundingClientRect();
			const child = element.querySelector("span,input") ?? element;
			const cr = child.getBoundingClientRect(),
				cs = getComputedStyle(child);
			return {
				name,
				width: r.width,
				height: r.height,
				padding: c.padding,
				border: c.borderWidth,
				gap: c.gap,
				childInset:
					cr.left -
					r.left +
					(child.matches("input,textarea")
						? parseFloat(cs.paddingLeft) +
							parseFloat(cs.borderLeftWidth)
						: 0),
				contentInset:
					parseFloat(c.paddingLeft) + parseFloat(c.borderLeftWidth),
				appearance: c.appearance,
			};
		});
	});
	await page
		.locator('[data-figma-node="49:5120"] [data-slot="select-trigger"]')
		.click();
	const select = await page
		.locator('[data-slot="select-content"]')
		.evaluate((element) => {
			const r = element.getBoundingClientRect(),
				label = element.querySelector('[data-slot="select-label"]'),
				item = element.querySelector('[data-slot="select-item"]');
			return {
				width: r.width,
				height: r.height,
				labelInset:
					label.getBoundingClientRect().left -
					r.left +
					parseFloat(getComputedStyle(label).paddingLeft),
				rowInset: item.getBoundingClientRect().left - r.left,
				padding: getComputedStyle(element).padding,
			};
		});
	await page.keyboard.press("Escape");
	const filterTrigger = page
		.locator('[data-figma-node="102:10662"] button')
		.first();
	await filterTrigger.click();
	const filterMeasure = () =>
		page.locator('[data-slot="popover-content"]').evaluate((element) => {
			const r = element.getBoundingClientRect(),
				c = getComputedStyle(element),
				tokens = element.querySelector(
					'[data-slot="filter-token-list"]'
				);
			return {
				width: r.width,
				height: r.height,
				gap: c.gap,
				padding: c.padding,
				children: element.children.length,
				tokenGap: tokens ? getComputedStyle(tokens).gap : undefined,
			};
		});
	const active = await filterMeasure();
	await page.getByRole("button", { name: "Clear All", exact: true }).click();
	const clear = await filterMeasure();
	await page.getByRole("button", { name: "Status", exact: true }).click();
	const choices = await filterMeasure();
	await page.keyboard.press("Escape");
	await page.locator('[data-figma-node="102:11018"] button').first().click();
	await page.getByRole("button", { name: "Add filter", exact: true }).click();
	const addExisting = await filterMeasure();
	await page.getByRole("button", { name: "Status", exact: true }).click();
	await page.getByRole("button", { name: "Completed", exact: true }).click();
	const two = await filterMeasure();
	await page.keyboard.press("Escape");
	await page.locator('[data-figma-node="102:10739"] button').first().click();
	await page.getByRole("button", { name: "Status", exact: true }).click();
	const fiveChoices = await filterMeasure();
	await page
		.getByRole("button", { name: "In Progress", exact: true })
		.click();
	const checkedFiveChoices = await filterMeasure();
	assert.match(
		await page
			.locator('[data-figma-node="102:10739"] button')
			.first()
			.innerText(),
		/Filter \(1\)/
	);
	assert.equal(
		await page
			.getByRole("button", { name: "In Progress", exact: true })
			.getAttribute("aria-pressed"),
		"true"
	);
	assert.equal(
		await page.locator('[data-slot="filter-token-list"]').count(),
		0
	);
	await page.locator('[data-slot="popover-content"]').screenshot({
		path: path.join(artifacts, "geometry-filter-selection-checked.png"),
		animations: "disabled",
	});
	await page
		.getByRole("button", { name: "Back to filters", exact: true })
		.click();
	const backRevealed = await filterMeasure();
	assert.equal(
		await page.locator('[data-slot="filter-token-list"]').count(),
		1
	);
	await page.keyboard.press("Escape");
	await page.locator('[data-figma-node="102:10739"] button').first().click();
	const reopened = await filterMeasure();
	assert.equal(reopened.height, 116);
	await page.getByRole("button", { name: "Clear All", exact: true }).click();
	await page.getByRole("button", { name: "Status", exact: true }).click();
	await page.getByRole("button", { name: "Ready", exact: true }).click();
	const afterClearSelection = await filterMeasure();
	assert.equal(afterClearSelection.height, 224);
	assert.equal(
		await page.locator('[data-slot="filter-token-list"]').count(),
		0
	);
	for (const name of [
		"input",
		"textarea",
		"surface",
		"upload",
		"date",
		"number",
	])
		assert.equal(
			controls.find((item) => item.name === name).contentInset,
			16
		);
	assert.equal(
		controls.find((item) => item.name === "combobox").childInset,
		16
	);
	assert.equal(
		controls.find((item) => item.name === "date-inter").childInset,
		12
	);
	assert.equal(
		controls.find((item) => item.name === "input-group-multiline").height,
		106
	);
	assert.ok(
		Math.abs(controls.find((item) => item.name === "number").width - 47) <
			0.1
	);
	assert.equal(select.width, 180);
	assert.equal(select.height, 196);
	assert.equal(select.labelInset, 12);
	assert.equal(select.rowInset, 4);
	assert.equal(active.height, 116);
	assert.equal(clear.height, 332);
	assert.equal(two.height, 412);
	assert.equal(fiveChoices.height, 224);
	assert.equal(checkedFiveChoices.height, 224);
	assert.equal(addExisting.height, 412);
	assert.equal(active.tokenGap, "12px");
	assert.equal(two.tokenGap, "8px");
	await page.keyboard.press("Escape");
	assert.equal(
		await page.getByLabel("Disabled lookup", { exact: true }).isDisabled(),
		true
	);
	assert.equal(
		await page.getByLabel("Disabled count", { exact: true }).isDisabled(),
		true
	);
	assert.equal(
		await page.getByLabel("Disabled colour", { exact: true }).isDisabled(),
		true
	);

	const legacyShadows = await page.evaluate(() =>
		[
			'[data-figma-node="49:5115"] [data-slot="select-trigger"]',
			'[data-figma-node="49:5144"] [data-slot="input-group"]',
			'[data-figma-node="49:5180"] [data-slot="checkbox"]',
		].map((selector) => ({
			selector,
			shadow: getComputedStyle(document.querySelector(selector))
				.boxShadow,
		}))
	);
	for (const item of legacyShadows)
		assert.ok(
			item.shadow.includes("rgba(0, 0, 0, 0.1) 0px 1px 2px"),
			item.selector + ": Figma shadow-xs is 10% opacity"
		);
	await page.locator('[data-figma-node="49:4999"] button').click();
	const calendarShadow = await page
		.locator('[data-slot="popover-content"]')
		.evaluate((element) => ({
			shadow: getComputedStyle(element).boxShadow,
			dropdownShadows: [
				...element.querySelectorAll(".rdp-dropdown_root"),
			].map((item) => getComputedStyle(item).boxShadow),
		}));
	assert.ok(
		calendarShadow.shadow.includes("rgba(0, 0, 0, 0.1) 0px 1px 3px"),
		"Calendar Figma shadow-sm"
	);
	assert.equal(
		calendarShadow.dropdownShadows.length,
		2,
		"Calendar month and year captions are both measured"
	);
	for (const shadow of calendarShadow.dropdownShadows)
		assert.ok(
			shadow.includes("rgba(0, 0, 0, 0.1) 0px 1px 2px"),
			"Calendar caption Figma shadow-xs"
		);
	await page.keyboard.press("Escape");
	const noticeIconInset = await page
		.locator('[data-figma-node="13:1383"] [data-slot="field-notice"]')
		.evaluate(
			(element) =>
				element.querySelector("img").getBoundingClientRect().top -
				element.getBoundingClientRect().top
		);
	assert.equal(
		noticeIconInset,
		13,
		"Multiple notice icon matches the source 1px holder inset"
	);
	const field = page.locator('[data-figma-node="23:1804"]');
	const input = field.locator("input[type=color]");
	await input.evaluate((i) => {
		window.__colorPointerEvents = 0;
		i.addEventListener("pointerdown", () => window.__colorPointerEvents++);
	});
	await input.click();
	await page.keyboard.press("Escape");
	assert.equal(
		await page.evaluate(() => window.__colorPointerEvents),
		1,
		"Native color input receives pointer activation"
	);
	await input.focus();
	await page.keyboard.press("Shift+Tab");
	await page.keyboard.press("Tab");
	const colorBefore = await field.evaluate((root) => {
		const i = root.querySelector("input"),
			s = root.querySelector('[data-slot="form-control-surface"]'),
			r = i.getBoundingClientRect(),
			sr = s.getBoundingClientRect();
		return {
			focused: document.activeElement === i,
			type: i.type,
			accessibleLabel: i.labels?.[0]?.textContent,
			visiblePlaceholder: s.querySelector("span")?.textContent,
			border: getComputedStyle(s).borderColor,
			inputWidth: r.width,
			inputHeight: r.height,
			surfaceWidth: sr.width,
			surfaceHeight: sr.height,
		};
	});
	assert.equal(colorBefore.focused, true);
	assert.equal(colorBefore.type, "color");
	assert.equal(colorBefore.accessibleLabel, "Cabinet Colour");
	assert.equal(colorBefore.visiblePlaceholder, "Colour Picker");
	assert.equal(colorBefore.border, "rgb(47, 69, 92)");
	assert.equal(colorBefore.surfaceHeight, 41);
	assert.ok(colorBefore.inputWidth > colorBefore.surfaceWidth - 4);
	assert.ok(colorBefore.inputHeight > colorBefore.surfaceHeight - 4);
	await input.evaluate((i) => {
		Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			"value"
		).set.call(i, "#12ab34");
		i.dispatchEvent(new Event("input", { bubbles: true }));
		i.dispatchEvent(new Event("change", { bubbles: true }));
	});
	await page.waitForFunction(
		() =>
			document.querySelector(
				'[data-figma-node="23:1804"] [data-selected-color]'
			)?.dataset.selectedColor === "#12ab34"
	);
	const colorAfter = await field.evaluate((root) => ({
		value: root.querySelector("input").value,
		visible: root.querySelector('[data-slot="form-control-surface"] span')
			.textContent,
		callbackValue: root.querySelector("[data-selected-color]").dataset
			.selectedColor,
		announcement: root.querySelector("output").textContent,
	}));
	assert.equal(colorAfter.value, "#12ab34");
	assert.equal(colorAfter.visible, "#12ab34");
	assert.equal(colorAfter.callbackValue, "#12ab34");
	const report = {
		capturedAt: new Date().toISOString(),
		passed: true,
		requiredLabel,
		controls,
		select,
		disabledContracts: true,
		legacyShadows,
		calendarShadow,
		noticeIconInset,
		colorPicker: {
			pointerActivation: true,
			before: colorBefore,
			after: colorAfter,
		},
		filters: {
			active,
			clear,
			choices,
			sixChoiceCount: 6,
			two,
			addExisting,
			fiveChoices,
			checkedFiveChoices,
			backRevealed,
			reopened,
			afterClearSelection,
		},
	};
	await fs.writeFile(
		path.join(artifacts, "geometry-review.json"),
		JSON.stringify(report, null, 2) + "\n"
	);
	console.log(JSON.stringify(report, null, 2));
} finally {
	await browser.close();
}
