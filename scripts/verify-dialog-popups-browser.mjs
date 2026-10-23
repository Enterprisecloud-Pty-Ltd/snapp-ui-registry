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
const tailwindcss = (
	await import(pathToFileURL(require.resolve("@tailwindcss/vite")))
).default;
const htmlFile = path.join(consumer, "__snapp_dialog_popups.html");
const sourceFile = path.join(consumer, "src/__snapp_dialog_popups.tsx");
const optionCount = 30;
// A small dialog (the Actions New Policy case), a dialog taller than the
// viewport, and the form size whose body scrolls between header and footer.
const cases = [
	{ name: "small", size: "default", lines: 0, height: 800 },
	{ name: "tall", size: "default", lines: 40, height: 600 },
	{ name: "form", size: "form", lines: 40, height: 600 },
];
let server;
let browser;
const createdFiles = [];
try {
	await fs.writeFile(
		htmlFile,
		'<div id="root"></div><script type="module" src="/src/__snapp_dialog_popups.tsx"></script>',
		{ flag: "wx" }
	);
	createdFiles.push(htmlFile);
	await fs.writeFile(
		sourceFile,
		`
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { SearchableCombobox } from "@/components/snapp/forms/searchable-combobox";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PortalContainerContext } from "@/runtime/PortalContainer";
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
function Probe() {
 return <Dialog open>
  <DialogContent size={size} aria-describedby={undefined}>
   <DialogHeader size={size}><DialogTitle size={size}>New policy</DialogTitle></DialogHeader>
   {size === "form" ? <DialogBody size="form"><Fields /></DialogBody> : <Fields />}
   <DialogFooter size={size}><button type="button">Create</button></DialogFooter>
  </DialogContent>
 </Dialog>;
}
// The app shell hands every popup a portal host outside the dialog, as in Dynamics.
function App() {
 const [host, setHost] = useState<HTMLDivElement | null>(null);
 return <>
  <PortalContainerContext.Provider value={host}>{host ? <Probe /> : null}</PortalContainerContext.Provider>
  <div ref={setHost} />
 </>;
}
createRoot(document.getElementById("root")!).render(<App />);
`,
		{ flag: "wx" }
	);
	createdFiles.push(sourceFile);
	server = await createServer({
		root: consumer,
		configFile: false,
		plugins: [react(), tailwindcss()],
		resolve: { alias: { "@": path.join(consumer, "src") } },
		logLevel: "error",
		server: { host: "127.0.0.1", port: 0, strictPort: false },
	});
	await server.listen();
	const address = server.httpServer.address();
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
			const reaches = (element, x, y) =>
				element.contains(document.elementFromPoint(x, y));
			const listbox = document.querySelector('[role="listbox"]');
			const popup = listbox.closest(
				'[data-slot="combobox-content"], [data-slot="select-content"]'
			);
			const dialogScroll = () =>
				[
					...document.querySelectorAll(
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
				count: options.length,
				unreachable,
				hiddenCorners,
				dialogScrolled: dialogScroll() !== scrollBefore,
				popup: { top: box.top, bottom: box.bottom, left: box.left },
			};
		});

	const checkPopup = async (page, label, trigger) => {
		// Measured before opening: an open Select aria-hides its trigger.
		await trigger.scrollIntoViewIfNeeded();
		const anchor = await trigger.boundingBox();
		await trigger.click();
		await page.getByRole("listbox").waitFor();
		const result = await hitTestOptions(page);
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
			`${base}/__snapp_dialog_popups.html?size=${testCase.size}&lines=${testCase.lines}`
		);
		const dialog = page.getByRole("dialog");
		await dialog.waitFor();
		const probe = page.locator("[data-probe]");
		const label = (name) => `${testCase.name} dialog ${name}`;

		const table = dialog.getByRole("combobox", { name: "Table" });
		await checkPopup(page, label("Table"), table);
		const search = page.getByLabel("Search", { exact: true });
		await search.focus();
		await page.waitForTimeout(100);
		check(
			await search.evaluate((input) => input === document.activeElement),
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
		await page.keyboard.press("Escape");
		await closed(page.getByRole("listbox"), label("Table popup"));

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
		})
	);
} finally {
	await browser?.close();
	await server?.close();
	for (const file of createdFiles) await fs.rm(file, { force: true });
}
