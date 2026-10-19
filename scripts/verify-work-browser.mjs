import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = path.join(root, "artifacts", "figma-qa", "work");
const url = process.env.SNAPP_FIGMA_PREVIEW_URL || "http://127.0.0.1:4799/?group=work";
const referenceSizes = {
  "1:2165": [300, 113], "1:2182": [300, 113], "1:2198": [300, 113], "1:2214": [300, 100],
  "1:2224": [300, 113], "1:2234": [300, 60], "1:2242": [300, 44], "1:2248": [300, 20],
  "1:2290": [141.714, 90.333], "1:2297": [141.714, 90.333],
  "1:2305": [323.667, 90], "1:2332": [323.667, 90], "1:2359": [323.667, 90],
  "1:3056": [338, 1031], "1:3077": [52, 1031], "13:960": [338, 48],
  "48:4695": [394, 74], "48:4697": [394, 74], "48:4712": [394, 74],
  "49:5409": [456, 32], "49:4876": [456, 32], "49:4891": [312.5, 336],
  "49:4917": [312.5, 580], "49:4950": [312.5, 150],
  "61:6350": [333.667, 44], "61:6368": [333.667, 44], "61:6375": [333.667, 44], "61:6382": [333.667, 44],
  "219:2061": [297, 36], "219:2063": [297, 36], "219:2126": [874, 36], "219:2228": [648, 268],
  "226:2360": [298, 24], "228:2377": [298, 24], "228:2383": [298, 24], "230:2425": [298, 84], "230:2427": [298, 84],
  "236:2503": [136, 61], "239:2085": [136, 61], "236:2516": [136, 61], "239:2097": [136, 61],
  "236:2528": [136, 56], "239:2109": [136, 56], "294:2679": [240, 166], "294:2689": [420, 112],
  "49:4981": [400, 51.5846], "49:4986": [400, 51.5846], "267:2185": [196.66, 50.4], "279:2228": [47.9643, 50.4043],
};
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = {
  source: "https://www.figma.com/design/YUYB5jtCxUwT8OefeLP9f7/SNAPP-Component-Library",
  capturedAt: new Date().toISOString(),
  previewUrl: url,
  environment: { browser: "Chromium", viewport: { width: 1500, height: 1100 }, deviceScaleFactor: 1 },
  tolerance: "Less than 1/32 CSS pixel for Chromium 1/64 pixel layout quantization",
  components: [], screenshots: [], interactions: [], errors: [], failures: [],
  limits: [
    "Geometry, loaded fonts, local assets and interactions are automated. Reference PNG comparisons remain a separate manual check.",
    "Browser and Figma raster antialiasing differ; pixel-byte equality is not claimed.",
    "These fixtures preserve recorded Figma overflow and instance overrides. Product data integration remains feature-owned.",
    "This gate does not certify live Dynamics, Power Pages, PCF or Cabinet deployment.",
  ],
};
const save = () => fs.writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
try {
  const page = await browser.newPage({ viewport: report.environment.viewport, deviceScaleFactor: 1 });
  page.setDefaultTimeout(5000);
  page.on("pageerror", error => report.errors.push(error.message));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  report.components = await page.evaluate(() => {
    const styles = element => {
      const s = getComputedStyle(element), r = element.getBoundingClientRect();
      return { width: r.width, height: r.height, fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, color: s.color, background: s.backgroundColor, padding: [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft], gap: s.gap, radius: s.borderRadius, border: [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth], boxShadow: s.boxShadow };
    };
    return [...document.querySelectorAll("[data-figma-node]")].map((element, i) => {
      const owner = element.hasAttribute("data-slot") ? element : element.firstElementChild || element;
      const selector = "p,span,strong,h3,button,td,th";
      const leaves = [...(owner.matches(selector) ? [owner] : []), ...owner.querySelectorAll(selector)].filter(n => !n.children.length && n.textContent.trim() && getComputedStyle(n).position !== "absolute");
      return {
        node: element.getAttribute("data-figma-node"), variant: element.getAttribute("data-variant"), slot: owner.getAttribute("data-slot"),
        ...styles(owner), wrapper: styles(element),
        text: leaves.map((n, j) => {
          const key = `work-${i}-${j}`;
          n.setAttribute("data-work-qa-font", key);
          return { key, text: n.textContent.trim(), ...styles(n) };
        }),
        images: [...owner.querySelectorAll("img"), ...(owner.matches("img") ? [owner] : [])].map(n => ({ src: n.currentSrc.startsWith("data:") ? n.currentSrc.slice(0, n.currentSrc.indexOf(",")) : n.currentSrc, complete: n.complete, naturalWidth: n.naturalWidth, naturalHeight: n.naturalHeight, ...styles(n) })),
      };
    });
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
  const dom = await cdp.send("DOM.getDocument");
  for (const component of report.components) {
    const actual = component.variant === "all-properties" ? [component.wrapper.width, component.wrapper.height] : [component.width, component.height];
    const expected = referenceSizes[component.node];
    component.referenceSize = expected;
    if (!expected || actual.some((v, i) => Math.abs(v - expected[i]) >= 1 / 32)) report.failures.push({ check: "reference geometry", node: component.node, variant: component.variant, expected, actual });
    for (const text of component.text) {
      const found = await cdp.send("DOM.querySelector", { nodeId: dom.root.nodeId, selector: `[data-work-qa-font="${text.key}"]` });
      text.platformFonts = found.nodeId ? (await cdp.send("CSS.getPlatformFontsForNode", { nodeId: found.nodeId })).fonts : [];
      if (!text.platformFonts.length || text.platformFonts.some(f => !f.isCustomFont)) report.failures.push({ check: "actual custom font", node: component.node, text: text.text, faces: text.platformFonts });
      const expectedFamily = ["49:4891", "49:4917", "49:4950"].includes(component.node) && text.text === "SJ" ? "Inter" : "Aptos";
      if (!text.fontFamily.includes(expectedFamily) || text.platformFonts.some(f => !f.familyName.startsWith(expectedFamily))) report.failures.push({ check: "reference font family", node: component.node, text: text.text, expected: expectedFamily, computed: text.fontFamily, faces: text.platformFonts });
    }
    for (const image of component.images) if (!image.complete || !image.naturalWidth) report.failures.push({ check: "loaded asset", node: component.node, src: image.src });
    if (component.node === "1:3056") {
      // Figma Tree Item children explicitly use primary text; the panel headings use brand text.
      const rows = component.text.filter(text => /^(55145|56743|55167|Item Name 1)$/.test(text.text));
      const headings = component.text.filter(text => /^(Focus List|Overdue|24h 30m|09h 00m)$/.test(text.text));
      report.productivityTextColors = { rows: rows.map(({ text, color }) => ({ text, color })), headings: headings.map(({ text, color }) => ({ text, color })) };
      if (rows.length !== 8 || rows.some(text => text.color !== "rgb(42, 44, 46)")) report.failures.push({ check: "Figma productivity nested row text", sourceNodes: ["I1:3065;1:2580", "I1:3065;1:2582", "I1:3066;1:2580", "I1:3066;1:2582", "I1:3075;1:2580", "I1:3075;1:2582", "I1:3076;1:2580", "I1:3076;1:2582"], expectedCount: 8, expected: "rgb(42, 44, 46)", actual: report.productivityTextColors.rows });
      if (headings.length !== 4 || headings.some(text => text.color !== "rgb(47, 69, 92)")) report.failures.push({ check: "Figma productivity heading text", expectedCount: 4, expected: "rgb(47, 69, 92)", actual: report.productivityTextColors.headings });
    }
  }
  if (report.components.length !== 50) report.failures.push({ check: "complete state matrix", expected: 50, actual: report.components.length });
  await save();
  for (const section of await page.locator("section[aria-label]").all()) {
    const label = await section.getAttribute("aria-label");
    if (label === "Interaction verification") continue;
    const content = section.locator(":scope > div").first();
    if (!await content.count()) continue;
    const file = label.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".png";
    await content.screenshot({ path: path.join(output, file) });
    report.screenshots.push({ label, file });
  }
  const allProperties = page.locator('[data-figma-node="219:2063"][data-variant="all-properties"]');
  await allProperties.screenshot({ path: path.join(output, "table-cell-all-properties.png") });
  report.screenshots.push({ label: "TableCell optional properties", file: "table-cell-all-properties.png" });
  const equalTextWidths = await allProperties.locator('[data-slot="snapp-data-cell-content"] > span').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().width));
  if (equalTextWidths.length !== 2 || Math.abs(equalTextWidths[0] - equalTextWidths[1]) >= 1 / 32) report.failures.push({ check: "master dual text equal widths", actual: equalTextWidths });
  report.dualTextWidths = equalTextWidths;
  const propertyBackground = await allProperties.evaluate(element => getComputedStyle(element).backgroundColor);
  report.tablePropertyBackground = propertyBackground;
  if (propertyBackground !== "rgb(255, 255, 255)") report.failures.push({ check: "master cell surface", expected: "rgb(255, 255, 255)", actual: propertyBackground });
  await save();
  const scope = page.locator('section[aria-label="Interaction verification"]');
  async function action(name, expected, callback) {
    try {
      const result = await callback();
      report.interactions.push({ name, expected, result });
      if (Object.entries(expected).some(([key, value]) => result[key] !== value)) report.failures.push({ check: "interaction result", name, expected, result });
    } catch (error) {
      const failure = { check: "interaction execution", name, error: error.message };
      report.interactions.push(failure); report.failures.push(failure);
    }
  }
  await action("category selection", { current: "page" }, async () => { const control = scope.getByRole("button", { name: /Client Leads/ }); await control.click(); return { current: await control.getAttribute("aria-current") }; });
  await action("learning completion", { checked: "true" }, async () => { const control = scope.getByRole("checkbox", { name: "Complete Learning Item" }); await control.click(); return { checked: await control.getAttribute("aria-checked") }; });
  await action("employee collapse and expansion", { minimal: "minimal", expanded: "expanded" }, async () => { await scope.getByRole("button", { name: "Collapse Sarah Johnson" }).click(); const minimal = await scope.locator('[data-slot="snapp-employee-card"]').getAttribute("data-state"); await scope.getByRole("button", { name: "Expand Sarah Johnson" }).click(); await scope.getByRole("button", { name: /Optional Certification/ }).click(); return { minimal, expanded: await scope.locator('[data-slot="snapp-employee-card"]').getAttribute("data-state") }; });
  for (const [name, label, expected] of [["task time", "Track time for 55145", "task-time"], ["task menu", "Actions for 55145", "task-menu"], ["course overflow", "Actions for Interactive course", "course-more"], ["course drag handle", "Reorder Interactive course", "course-drag-handle"], ["focus row", "55145 Item Name 1", "focus-item"], ["condition success connection", "Condition: success connection", "node-success"]]) {
    await action(name, { actual: expected }, async () => { await scope.getByRole("button", { name: label, exact: true }).click(); return { actual: await scope.locator("[data-work-action]").textContent() }; });
  }
  await action("course completion", { checked: "true" }, async () => { const control = scope.getByRole("checkbox", { name: "Complete Interactive course" }); await control.click(); return { checked: await control.getAttribute("aria-checked") }; });
  await action("panel collapse and expansion", { collapsed: "collapsed", expanded: "open" }, async () => { await scope.getByRole("button", { name: "Collapse productivity panel" }).click(); const collapsed = await scope.locator('[data-slot="snapp-productivity-panel"]').getAttribute("data-state"); await scope.getByRole("button", { name: "Expand productivity panel" }).click(); return { collapsed, expanded: await scope.locator('[data-slot="snapp-productivity-panel"]').getAttribute("data-state") }; });
  await action("condition selection", { pressed: "true" }, async () => { const control = scope.locator('[data-slot="snapp-action-node"] > button').first(); await control.click(); return { pressed: await control.getAttribute("aria-pressed") }; });
  await action("catalogue activation", { actual: "catalogue-card" }, async () => { await scope.locator('[data-slot="snapp-catalogue-card"]').click(); return { actual: await scope.locator("[data-work-action]").textContent() }; });
  await action("inbox selection", { pressed: "true", actual: "inbox-item" }, async () => { const control = scope.locator('[data-slot="snapp-inbox-item"]'); await control.click(); return { pressed: await control.getAttribute("aria-pressed"), actual: await scope.locator("[data-work-action]").textContent() }; });
  await action("table sort callback", { actual: "table-sort" }, async () => { await scope.getByRole("button", { name: "Interactive sortable name" }).click(); return { actual: await scope.locator("[data-work-action]").textContent() }; });
  await action("keyboard learning completion", { checked: "false" }, async () => { const control = scope.getByRole("checkbox", { name: "Complete Learning Item" }); await control.focus(); await control.press("Space"); return { checked: await control.getAttribute("aria-checked") }; });
  await action("keyboard employee collapse", { state: "minimal" }, async () => { const control = scope.getByRole("button", { name: "Collapse Sarah Johnson" }); await control.focus(); await control.press("Enter"); return { state: await scope.locator('[data-slot="snapp-employee-card"]').getAttribute("data-state") }; });
  if (report.errors.length) report.failures.push({ check: "browser errors", errors: report.errors });
} catch (error) {
  report.failures.push({ check: "browser gate execution", error: error.message });
} finally {
  report.status = report.failures.length ? "failed" : "passed";
  await save();
  await browser.close();
}
console.log(JSON.stringify({ status: report.status, examples: report.components.length, fontSamples: report.components.reduce((sum, c) => sum + c.text.length, 0), screenshots: report.screenshots.length, interactions: report.interactions.length, failures: report.failures, artifact: path.relative(root, path.join(output, "report.json")) }, null, 2));
if (report.failures.length) process.exitCode = 1;
