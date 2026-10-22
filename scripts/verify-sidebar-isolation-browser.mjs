import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { createServer } from "vite";
import { chromium } from "playwright";

const consumer = path.resolve(
	process.argv[2] ?? process.env.SNAPP_CONSUMER_ROOT ?? ""
);
if (!process.argv[2] && !process.env.SNAPP_CONSUMER_ROOT) {
	throw new Error("Supply the retained complete-library consumer fixture.");
}
const require = createRequire(path.join(consumer, "package.json"));
const react = (
	await import(pathToFileURL(require.resolve("@vitejs/plugin-react")))
).default;
const htmlFile = path.join(consumer, "__snapp_sidebar_isolation.html");
const sourceFile = path.join(consumer, "src/__snapp_sidebar_isolation.tsx");
let server;
let browser;
const createdFiles = [];
try {
	await fs.writeFile(
		htmlFile,
		'<input aria-label="Outside provider"><div id="first"></div><div id="second"></div><script type="module" src="/src/__snapp_sidebar_isolation.tsx"></script>',
		{ flag: "wx" }
	);
	createdFiles.push(htmlFile);
	await fs.writeFile(
		sourceFile,
		`
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
function Probe({ name, block, toggleBlock, changes }: {name:string;block:boolean;toggleBlock:()=>void;changes:number}) {
 const sidebar = useSidebar();
 return <div data-probe={name} data-open={String(sidebar.open)} data-changes={changes}>
  <button type="button" aria-label={name+" toggle"} onClick={sidebar.toggleSidebar}>Toggle</button>
  <button type="button" aria-label={name+" block shortcut"} aria-pressed={block} onClick={toggleBlock}>Block</button>
 </div>;
}
function Instance({name, controlled=false}:{name:string;controlled?:boolean}) {
 const [open,setOpen]=useState(false);
 const [block,setBlock]=useState(false);
 const [changes,setChanges]=useState(0);
 return <SidebarProvider defaultOpen={!controlled} open={controlled?open:undefined} onOpenChange={controlled?value=>{setOpen(value);setChanges(count=>count+1)}:undefined} onKeyDown={event=>{if(block)event.preventDefault()}}>
  <Probe name={name} block={block} changes={changes} toggleBlock={()=>setBlock(value=>!value)}/>
 </SidebarProvider>;
}
createRoot(document.getElementById("first")!).render(<Instance name="First"/>);
createRoot(document.getElementById("second")!).render(<Instance name="Second" controlled/>);
`,
		{ flag: "wx" }
	);
	createdFiles.push(sourceFile);
	server = await createServer({
		root: consumer,
		configFile: false,
		plugins: [react()],
		resolve: { alias: { "@": path.join(consumer, "src") } },
		logLevel: "error",
		server: { host: "127.0.0.1", port: 0, strictPort: false },
	});
	await server.listen();
	const address = server.httpServer.address();
	const base = `http://127.0.0.1:${address.port}`;
	browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({
		viewport: { width: 1280, height: 800 },
	});
	await context.addCookies([
		{ name: "sidebar_state", value: "legacy-value", url: base },
	]);
	const page = await context.newPage();
	const errors = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto(`${base}/__snapp_sidebar_isolation.html`);
	const state = () =>
		page
			.locator("[data-probe]")
			.evaluateAll((elements) =>
				elements.map((element) => [
					element.dataset.open,
					element.dataset.changes,
				])
			);
	await page.locator('[data-probe="Second"]').waitFor();
	assert.deepEqual(await state(), [
		["true", "0"],
		["false", "0"],
	]);
	await page
		.getByRole("button", { name: "First toggle", exact: true })
		.focus();
	await page.keyboard.press("Control+b");
	assert.deepEqual(await state(), [
		["false", "0"],
		["false", "0"],
	]);
	await page
		.getByRole("button", { name: "Second toggle", exact: true })
		.focus();
	await page.keyboard.press("Control+b");
	assert.deepEqual(await state(), [
		["false", "0"],
		["true", "1"],
	]);
	await page.getByLabel("Outside provider").focus();
	await page.keyboard.press("Control+b");
	assert.deepEqual(await state(), [
		["false", "0"],
		["true", "1"],
	]);
	await page
		.getByRole("button", { name: "First toggle", exact: true })
		.click();
	assert.deepEqual(await state(), [
		["true", "0"],
		["true", "1"],
	]);
	await page
		.getByRole("button", { name: "Second block shortcut", exact: true })
		.click();
	await page
		.getByRole("button", { name: "Second toggle", exact: true })
		.focus();
	await page.keyboard.press("Control+b");
	assert.deepEqual(await state(), [
		["true", "0"],
		["true", "1"],
	]);
	assert.equal(
		await page.evaluate(() => document.cookie),
		"sidebar_state=legacy-value"
	);
	assert.deepEqual(errors, []);
	console.log(
		JSON.stringify({
			status: "passed",
			checks: 8,
			independentProviders: 2,
			controlledCallbacks: true,
			externalCancellation: true,
			legacyCookieUntouched: true,
		})
	);
} finally {
	await browser?.close();
	await server?.close();
	for (const file of createdFiles) await fs.rm(file, { force: true });
}
