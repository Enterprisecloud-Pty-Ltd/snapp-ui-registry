import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createServer as createHttpServer } from "node:http";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { build, createServer } from "vite";
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
const tailwindcss = (
	await import(pathToFileURL(require.resolve("@tailwindcss/vite")))
).default;
const htmlFile = path.join(consumer, "__snapp_dialog_popups.html");
const sourceFile = path.join(consumer, "src/__snapp_dialog_popups.tsx");
const optionCount = 30;
const converted = process.argv.includes("--converted");
// A small dialog (the Actions New Policy case), a dialog taller than the
// viewport, and the form size whose body scrolls between header and footer.
const cases = [
	{ name: "small", size: "default", lines: 0, height: 800 },
	{ name: "tall", size: "default", lines: 40, height: 600 },
	{ name: "form", size: "form", lines: 40, height: 600 },
	{
		name: "forwarded-ref",
		size: "default",
		lines: 0,
		height: 800,
		ref: "object",
	},
];
if (converted) {
	cases.push(
		{
			name: "hosted-shadow",
			size: "default",
			lines: 0,
			height: 800,
			depth: 1,
		},
		{
			name: "cabinet-nested",
			size: "form",
			lines: 40,
			height: 600,
			depth: 3,
		},
		{
			name: "direct-pcf",
			size: "default",
			lines: 0,
			height: 800,
			external: true,
		}
	);
	cases.push({
		name: "callback-ref",
		size: "default",
		lines: 0,
		height: 800,
		ref: "callback",
	});
}
let server;
let browser;
let buildRoot;
let staticServer;
const createdFiles = [];
try {
	await fs.writeFile(
		htmlFile,
		'<button id="host-sentinel" style="color:rgb(10,20,30)">Host sentinel</button><div id="root"></div><div id="sibling"></div><script type="module" src="/src/__snapp_dialog_popups.tsx"></script>',
		{ flag: "wx" }
	);
	createdFiles.push(htmlFile);
	await fs.writeFile(
		sourceFile,
		`
import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { SearchableCombobox } from "@/components/snapp/forms/searchable-combobox";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PortalContainerContext } from "@/runtime/PortalContainer";
${converted ? 'import { EcAppShell } from "@/runtime/EcAppShell";\nimport { EcPortalContainerContext, useEcPortalContainer } from "@/runtime/EcAppShell.context";\nif (EcPortalContainerContext !== PortalContainerContext) throw new Error("Ec and registry portal contexts differ");' : ""}
import "./index.css";
const params = new URLSearchParams(location.search);
const size = params.get("size") === "form" ? "form" : "default";
const lines = Number(params.get("lines"));
const options = Array.from({ length: ${optionCount} }, (_, index) => ({ value: "table-" + (index + 1), label: "Table " + (index + 1) }));
function Fields() {
 const [table, setTable] = useState("");
 const [column, setColumn] = useState("");
 return <>
  {Array.from({ length: lines }, (_, index) => <p key={index}>Line {index + 1}</p>)}
  <SearchableCombobox aria-label="Table" searchPlacement="popup" options={options} value={table} onValueChange={setTable} />
  <Select value={column} onValueChange={setColumn}>
   <SelectTrigger aria-label="Column"><SelectValue placeholder="Select" /></SelectTrigger>
   <SelectContent>{options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
  </Select>
  <output data-probe="">{table + "|" + column}</output>
  <AlertDialog>
   <AlertDialogTrigger asChild><button type="button">Discard</button></AlertDialogTrigger>
   <AlertDialogContent>
    <AlertDialogTitle>Discard changes?</AlertDialogTitle>
    <AlertDialogDescription>Nothing has been saved.</AlertDialogDescription>
    <AlertDialogCancel>Keep editing</AlertDialogCancel>
   </AlertDialogContent>
  </AlertDialog>
 </>;
}
function ForwardedRefProbe({ element }: { element: { current: HTMLDivElement | null } }) {
 useEffect(() => { if (element.current) element.current.dataset.forwardedRef = "ready"; }, [element]);
 return null;
}
function Probe() {
 const [open, setOpen] = useState(true);
 const contentRef = useRef<HTMLDivElement | null>(null);
 const [refReleased, setRefReleased] = useState(false);
 const callbackRef = useCallback((node:HTMLDivElement | null) => {
  contentRef.current = node;
  if (node) return () => { contentRef.current = null; setRefReleased(true); };
 }, []);
 const forwardedRef = params.get("ref") === "object" ? { ref:contentRef } : params.get("ref") === "callback" ? { ref:callbackRef } : {};
 return <><Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild><button type="button">Open policy</button></DialogTrigger>
  <DialogContent size={size} aria-describedby={undefined} {...forwardedRef}>
   <ForwardedRefProbe element={contentRef} />
   <DialogHeader size={size}><DialogTitle size={size}>New policy</DialogTitle></DialogHeader>
   {size === "form" ? <DialogBody size="form"><Fields /></DialogBody> : <Fields />}
   <DialogFooter size={size}><button type="button">Create</button></DialogFooter>
  </DialogContent>
 </Dialog><output data-ref-cleanup="">{refReleased ? "released" : "pending"}</output></>;
}
// The app shell hands every popup a portal host outside the dialog, as in Dynamics.
function App() {
 const [host, setHost] = useState<HTMLDivElement | null>(null);
 return <>
  <PortalContainerContext.Provider value={host}>{host ? <Probe /> : null}</PortalContainerContext.Provider>
  <div ref={setHost} />
 </>;
}
const depth = Number(params.get("depth") || 0);
let mount = document.getElementById("root")!;
for (let index = 0; index < depth; index++) {
 const shadow = mount.attachShadow({ mode: "open" });
 const next = document.createElement("div");
 shadow.append(next);
 mount = next;
 if (index === depth - 1) {
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = document.querySelector<HTMLLinkElement>('link[rel="stylesheet"]')?.href || "/src/index.css?direct";
  shadow.prepend(css);
 }
}
${
	converted
		? `
function ContextProbe({ name }: { name:string }) {
 const portal = useEcPortalContainer();
 return <span data-context-probe={name} data-container={portal ? "ready" : "pending"} />;
}
createRoot(mount).render(<EcAppShell portalOwner={params.get("external") === "true" ? mount : undefined}><ContextProbe name="owner" /><Probe /></EcAppShell>);
createRoot(document.getElementById("sibling")!).render(<EcAppShell><ContextProbe name="sibling" /></EcAppShell>);
`
		: "createRoot(mount).render(<App />);"
}
`,
		{ flag: "wx" }
	);
	createdFiles.push(sourceFile);
	const modalPlugin = converted
		? (
				await import(
					pathToFileURL(
						path.join(consumer, "scripts/snapp-shadow-modal.mjs")
					)
				)
			).default
		: null;
	const configuration = {
		root: consumer,
		configFile: false,
		plugins: [
			react(),
			tailwindcss(),
			...(modalPlugin ? [modalPlugin()] : []),
		],
		resolve: { alias: { "@": path.join(consumer, "src") } },
		logLevel: "error",
		server: { host: "127.0.0.1", port: 0, strictPort: false },
	};
	let address;
	if (converted) {
		buildRoot = await fs.mkdtemp(
			path.join(os.tmpdir(), "snapp-converted-dialog-build-")
		);
		await build({
			...configuration,
			build: {
				outDir: buildRoot,
				emptyOutDir: false,
				rollupOptions: { input: htmlFile },
			},
		});
		const assets = path.join(buildRoot, "assets");
		const cssFiles = (await fs.readdir(assets)).filter((file) =>
			file.endsWith(".css")
		);
		assert.ok(cssFiles.length > 0, "Converted fixture must emit CSS");
		await fs.mkdir(path.join(buildRoot, "dist"));
		for (const file of cssFiles) {
			const finalCss = path.join(buildRoot, "dist/main.css");
			await fs.copyFile(path.join(assets, file), finalCss);
			execFileSync(
				process.execPath,
				[path.join(consumer, "scripts/snapp-host-overlay-css.mjs")],
				{ cwd: buildRoot, stdio: "pipe" }
			);
			await fs.copyFile(finalCss, path.join(assets, file));
		}
		staticServer = createHttpServer(async (request, response) => {
			try {
				const file = path.resolve(
					buildRoot,
					"." +
						decodeURIComponent(
							new URL(request.url, "http://localhost").pathname
						)
				);
				if (!file.startsWith(buildRoot + path.sep))
					throw new Error("Asset escapes fixture");
				const bytes = await fs.readFile(file);
				response.setHeader(
					"Content-Type",
					file.endsWith(".html")
						? "text/html"
						: file.endsWith(".css")
							? "text/css"
							: file.endsWith(".js")
								? "application/javascript"
								: "application/octet-stream"
				);
				response.end(bytes);
			} catch {
				response.writeHead(404).end();
			}
		});
		await new Promise((resolve) =>
			staticServer.listen(0, "127.0.0.1", resolve)
		);
		address = staticServer.address();
	} else {
		server = await createServer(configuration);
		await server.listen();
		address = server.httpServer.address();
	}
	const base = `http://127.0.0.1:${address.port}`;
	browser = await chromium.launch({ headless: true });
	const failures = [];
	const check = (condition, message) => {
		if (!condition) failures.push(message);
	};

	// Brings each option into view as hovering does (Radix Select scrolls its
	// focused item back into view), then asks the browser what a click at its
	// centre would hit. A popup the dialog clips shows as hidden corners, or
	// as the dialog itself scrolling to reveal an option.
	const hitTestOptions = (page) =>
		page.evaluate(async () => {
			const frame = () =>
				new Promise((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(resolve))
				);
			const find = (selector, root = document) => {
				const match = root.querySelector(selector);
				if (match) return match;
				for (const node of root.querySelectorAll("*")) {
					if (node.shadowRoot) {
						const nested = find(selector, node.shadowRoot);
						if (nested) return nested;
					}
				}
				return null;
			};
			const reaches = (element, x, y) =>
				element.contains(element.getRootNode().elementFromPoint(x, y));
			const listbox = find('[role="listbox"]');
			const popup = listbox.closest(
				'[data-slot="combobox-content"], [data-slot="select-content"]'
			);
			const dialogScroll = () =>
				[
					...listbox
						.getRootNode()
						.querySelectorAll(
							'[data-slot="dialog-content"], [data-slot="dialog-content"] *'
						),
				]
					.filter((element) => !popup.contains(element))
					.map((element) => element.scrollTop)
					.join();
			const box = popup.getBoundingClientRect();
			const hiddenCorners = [
				[box.left + 6, box.top + 6],
				[box.right - 6, box.top + 6],
				[box.left + 6, box.bottom - 6],
				[box.right - 6, box.bottom - 6],
			].filter(([x, y]) => !reaches(popup, x, y)).length;
			const scrollBefore = dialogScroll();
			const options = [...listbox.querySelectorAll('[role="option"]')];
			const unreachable = [];
			for (const option of options) {
				option.focus({ preventScroll: true });
				// Twice: the first scroll mounts Radix Select's scroll-up button,
				// which pushes the list down after it.
				for (const _ of [1, 2]) {
					option.scrollIntoView({ block: "nearest" });
					await frame();
				}
				const rect = option.getBoundingClientRect();
				if (
					!reaches(
						option,
						rect.left + rect.width / 2,
						rect.top + rect.height / 2
					)
				)
					unreachable.push(option.textContent.trim());
			}
			return {
				insideDialog: Boolean(
					popup.closest('[data-slot="dialog-content"]')
				),
				count: options.length,
				unreachable,
				hiddenCorners,
				dialogScrolled: dialogScroll() !== scrollBefore,
				popup: { top: box.top, bottom: box.bottom, left: box.left },
			};
		});

	const settleAnimations = async (locator) =>
		locator.evaluate(async (element) => {
			await new Promise((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(resolve))
			);
			const animations = new Set();
			for (let node = element; node; node = node.parentElement) {
				for (const animation of node.getAnimations()) {
					if (
						Number.isFinite(
							animation.effect?.getComputedTiming().endTime
						)
					)
						animations.add(animation);
				}
			}
			await Promise.all(
				[...animations].map((animation) =>
					animation.finished.catch(() => {})
				)
			);
		});
	const checkPopup = async (page, label, trigger) => {
		// Measured before opening: an open Select aria-hides its trigger.
		await trigger.scrollIntoViewIfNeeded();
		await settleAnimations(trigger);
		const anchor = await trigger.boundingBox();
		await trigger.click();
		await page.getByRole("listbox").waitFor();
		await settleAnimations(page.getByRole("listbox"));
		const result = await hitTestOptions(page);
		check(
			result.insideDialog,
			`${label}: popup bypassed the nearest dialog provider`
		);
		check(
			result.count === optionCount,
			`${label}: listed ${result.count} of ${optionCount} options`
		);
		check(
			result.unreachable.length === 0,
			`${label}: ${result.unreachable.length} of ${result.count} options cannot be clicked (${result.unreachable.slice(0, 3).join(", ")}...)`
		);
		check(
			result.hiddenCorners === 0,
			`${label}: ${result.hiddenCorners} of 4 popup corners are clipped or covered`
		);
		check(
			!result.dialogScrolled,
			`${label}: the dialog scrolled to reveal options`
		);
		const gap = Math.min(
			Math.abs(result.popup.top - (anchor.y + anchor.height)),
			Math.abs(anchor.y - result.popup.bottom)
		);
		check(
			gap <= 12 && Math.abs(result.popup.left - anchor.x) <= 2,
			`${label}: popup is not placed at its trigger (gap ${gap}px, left ${result.popup.left} vs ${anchor.x})`
		);
	};

	const tryClick = async (locator, label) => {
		try {
			await locator.click({ timeout: 2000 });
		} catch {
			failures.push(`${label}: a real click did not reach it`);
		}
	};

	const closed = (locator, label) =>
		locator
			.waitFor({ state: "detached", timeout: 2000 })
			.catch(() => failures.push(`${label}: did not close`));

	const runCase = async (testCase, page, errors) => {
		await page.goto(
			`${base}/__snapp_dialog_popups.html?size=${testCase.size}&lines=${testCase.lines}&depth=${testCase.depth || 0}&external=${Boolean(testCase.external)}&ref=${testCase.ref || ""}`
		);
		const dialog = page.getByRole("dialog");
		await dialog.waitFor();
		if (testCase.ref)
			check(
				(await dialog.getAttribute("data-forwarded-ref")) === "ready",
				`${testCase.name}: external ref was not forwarded`
			);
		const probe = page.locator("[data-probe]");
		const label = (name) => `${testCase.name} dialog ${name}`;

		const table = dialog.getByRole("combobox", { name: "Table" });
		await checkPopup(page, label("Table"), table);
		const search = page.getByLabel("Search", { exact: true });
		await search.focus();
		await page.waitForTimeout(100);
		check(
			await search.evaluate(
				(input) => input === input.getRootNode().activeElement
			),
			`${label("Table")}: the popup search input loses focus`
		);
		await page.keyboard.type("Table 3");
		check(
			(await search.inputValue({ timeout: 1000 }).catch(() => null)) ===
				"Table 3",
			`${label("Table")}: typing did not reach the popup search input`
		);
		await tryClick(
			page.getByRole("option", { name: "Table 30" }),
			label("Table 30 option")
		);
		check(
			(await probe.textContent()).startsWith("table-30|"),
			`${label("Table")}: choosing Table 30 did not set the value`
		);
		await closed(page.getByRole("listbox"), label("Table popup"));
		await table.click();
		await page.getByRole("listbox").waitFor();
		await page.keyboard.press("Escape");
		await closed(page.getByRole("listbox"), label("Escape popup"));
		check(
			(await dialog.count()) === 1,
			`${label("Escape")}: popup dismissal closed its dialog`
		);

		const column = dialog.getByRole("combobox", { name: "Column" });
		await checkPopup(page, label("Column"), column);
		await tryClick(
			page.getByRole("option", { name: "Table 30" }),
			label("Column Table 30 option")
		);
		check(
			(await probe.textContent()).endsWith("|table-30"),
			`${label("Column")}: choosing Table 30 did not set the value`
		);

		// A modal opened from inside the dialog still covers the viewport.
		await dialog.getByRole("button", { name: "Discard" }).click();
		const confirm = page.getByRole("alertdialog");
		await confirm.waitFor();
		const overlay = await page
			.locator('[data-slot="alert-dialog-overlay"]')
			.boundingBox();
		const confirmBox = await confirm.boundingBox();
		check(
			overlay.x === 0 &&
				overlay.y === 0 &&
				overlay.width === 1280 &&
				overlay.height === testCase.height,
			`${testCase.name} dialog: a nested alert dialog overlay does not cover the viewport`
		);
		check(
			Math.abs(confirmBox.x + confirmBox.width / 2 - 640) <= 1 &&
				Math.abs(
					confirmBox.y + confirmBox.height / 2 - testCase.height / 2
				) <= 1,
			`${testCase.name} dialog: a nested alert dialog is not centred in the viewport`
		);
		await tryClick(
			confirm.getByRole("button", { name: "Keep editing" }),
			label("nested alert dialog")
		);
		await closed(confirm, label("nested alert dialog"));

		const box = await dialog.boundingBox();
		check(
			box.y >= 0 && box.y + box.height <= testCase.height,
			`${testCase.name} dialog does not fit the viewport`
		);
		check(errors.length === 0, `${testCase.name}: ${errors.join("; ")}`);
		if (converted) {
			check(
				(await page
					.locator('[data-context-probe][data-container="ready"]')
					.count()) === 2,
				`${testCase.name}: separate roots did not receive their own portal containers`
			);
		}
		check(
			(await page
				.locator("#host-sentinel")
				.evaluate((node) => getComputedStyle(node).color)) ===
				"rgb(10, 20, 30)",
			`${testCase.name}: host styling changed`
		);
		await page.keyboard.press("Escape");
		await closed(dialog, label("outer dialog"));
		if (testCase.ref === "callback") {
			await page
				.locator("[data-ref-cleanup]")
				.filter({ hasText: "released" })
				.waitFor();
		}
		check(
			await page.getByRole("button", { name: "Open policy" }).evaluate(
				(button) =>
					new Promise((resolve) => {
						let frames = 0;
						function checkFocus() {
							if (button === button.getRootNode().activeElement)
								resolve(true);
							else if (++frames >= 30) resolve(false);
							else requestAnimationFrame(checkFocus);
						}
						checkFocus();
					})
			),
			`${testCase.name}: dialog dismissal did not restore trigger focus`
		);
	};

	for (const testCase of cases) {
		const page = await browser.newPage({
			viewport: { width: 1280, height: testCase.height },
		});
		page.setDefaultTimeout(5000);
		const errors = [];
		page.on("pageerror", (error) => errors.push(error.message));
		try {
			await runCase(testCase, page, errors);
		} catch (error) {
			failures.push(
				`${testCase.name} dialog stopped: ${error.message.split("\n")[0]}`
			);
		} finally {
			await page.close();
		}
	}
	assert.deepEqual(failures, []);
	console.log(
		JSON.stringify({
			status: "passed",
			dialogs: cases.map((testCase) => testCase.name),
			optionsPerPopup: optionCount,
			converted,
			productionBuild: converted,
			limits: "Chromium fixture using installed components; live Shell/Dynamics authorization remains unverified.",
		})
	);
} finally {
	await browser?.close();
	await server?.close();
	if (staticServer)
		await new Promise((resolve) => staticServer.close(resolve));
	if (buildRoot) {
		assert.equal(
			path.dirname(path.resolve(buildRoot)),
			path.resolve(os.tmpdir())
		);
		assert.ok(
			path.basename(buildRoot).startsWith("snapp-converted-dialog-build-")
		);
		await fs.rm(buildRoot, { recursive: true, force: true });
	}
	for (const file of createdFiles) await fs.rm(file, { force: true });
}
