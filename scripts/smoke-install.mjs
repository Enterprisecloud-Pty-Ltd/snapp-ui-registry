import { execFile } from "node:child_process";
import {
	mkdtemp,
	mkdir,
	readFile,
	readdir,
	rm,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const execFileAsync = promisify(execFile);
const registryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = await mkdtemp(path.join(tmpdir(), "snapp-registry-smoke-"));
const sourceRoot = path.join(fixtureRoot, "src");
const shadcnCli = path.join(
	registryRoot,
	"node_modules",
	"shadcn",
	"dist",
	"index.js",
);
let server;

const writeJson = (filePath, value) =>
	writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);

try {
	await mkdir(sourceRoot, { recursive: true });
	server = await createServer({
		root: registryRoot,
		configFile: false,
		logLevel: "error",
		server: {
			host: "127.0.0.1",
			port: 0,
			strictPort: false,
		},
	});
	await server.listen();
	const address = server.httpServer?.address();
	if (!address || typeof address === "string") {
		throw new Error("Could not determine the local registry port");
	}
	const registryUrl = `http://127.0.0.1:${address.port}/r/{name}.json`;

	await writeJson(path.join(fixtureRoot, "package.json"), {
		name: "snapp-registry-smoke",
		private: true,
		version: "0.0.0",
		type: "module",
		dependencies: {
			"@tailwindcss/vite": "^4.3.1",
			"@types/react": "^19.2.17",
			"@types/react-dom": "^19.2.3",
			"@vitejs/plugin-react": "^6.0.3",
			react: "^19.2.7",
			"react-dom": "^19.2.7",
			shadcn: "4.12.0",
			tailwindcss: "^4.3.1",
			typescript: "^6.0.3",
			vite: "^8.1.0",
		},
	});
	await writeJson(path.join(fixtureRoot, "components.json"), {
		$schema: "https://ui.shadcn.com/schema.json",
		style: "radix-nova",
		rsc: false,
		tsx: true,
		tailwind: {
			config: "",
			css: "src/index.css",
			baseColor: "neutral",
			cssVariables: true,
			prefix: "ec",
		},
		iconLibrary: "lucide",
		rtl: false,
		aliases: {
			components: "@/components",
			utils: "@/lib/utils",
			ui: "@/components/ui",
			lib: "@/lib",
			hooks: "@/hooks",
		},
		registries: {
			"@snapp": registryUrl,
		},
	});
	await writeJson(path.join(fixtureRoot, "tsconfig.json"), {
		compilerOptions: {
			target: "ES2022",
			useDefineForClassFields: true,
			lib: ["ES2022", "DOM", "DOM.Iterable"],
			allowJs: false,
			skipLibCheck: true,
			esModuleInterop: true,
			allowSyntheticDefaultImports: true,
			strict: true,
			forceConsistentCasingInFileNames: true,
			module: "ESNext",
			moduleResolution: "Bundler",
			resolveJsonModule: true,
			isolatedModules: true,
			types: ["vite/client"],
			noEmit: true,
			jsx: "react-jsx",
			paths: {
				"@/*": ["./src/*"],
			},
		},
		include: ["src"],
	});
	await writeFile(
		path.join(fixtureRoot, "vite.config.ts"),
		[
			'import path from "node:path"',
			'import react from "@vitejs/plugin-react"',
			'import tailwindcss from "@tailwindcss/vite"',
			'import { defineConfig } from "vite"',
			"",
			"export default defineConfig({",
			"  plugins: [react(), tailwindcss()],",
			'  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },',
			"})",
			"",
		].join("\n"),
	);
	await writeFile(
		path.join(fixtureRoot, "index.html"),
		'<div id="root"></div><script type="module" src="/src/main.tsx"></script>\n',
	);
	await writeFile(
		path.join(sourceRoot, "index.css"),
		'@import "tailwindcss" prefix(ec);\n@import "shadcn/tailwind.css";\n',
	);
	await writeFile(
		path.join(sourceRoot, "main.tsx"),
		[
			'import { StrictMode, useState } from "react"',
			'import { createRoot } from "react-dom/client"',
			'import { EllipsisIcon, PuzzleIcon, SearchIcon } from "lucide-react"',
			'import { CatalogueHero, CatalogueResultCard, FeatureBreadcrumb, FeatureShell, FilterChip, FilterMenuSurface, FilterTokenList, HelpArticleAccordion, LandingCard, LandingSkeleton, PageBody, SurfaceCard, filterSearchCollection, matchesSearch, resolveShowNavBar } from "@/components/snapp/catalogue/catalogue-core"',
			'import { DragPreview, DropIndicator } from "@/components/snapp/drag/drag-feedback"',
			'import { WorkItemCard } from "@/components/snapp/work-os/work-item-card"',
			'import { Button } from "@/components/ui/button"',
			'import { Combobox, ComboboxCollection, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"',
			'import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"',
			'import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"',
			'import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"',
			'import { Input } from "@/components/ui/input"',
			'import { Textarea } from "@/components/ui/textarea"',
			'import "./index.css"',
			"",
			'const showNavBar = resolveShowNavBar(new URLSearchParams("showNavBar=false"))',
			'const searchMatches = matchesSearch("knowledge base", ["Knowledge Base"])',
			'const scopedSearchResults = filterSearchCollection([{ id: "article", title: "Knowledge article" }, { id: "category", title: "Access category" }], "knowledge", (item) => [item.title])',
			"",
			"const item = {",
			'  id: "55231",',
			'  action: "Test",',
			'  name: "Bug Name 3",',
			'  assignment: "Hard Booked - Leonard",',
			'  time: "144h 00m",',
			'  capacity: "144 hrs",',
			"  progress: 100,",
			'  tone: "red" as const,',
			'  icon: "bug" as const,',
			"}",
			"",
			'function RegistrySmoke() {',
			'  const [activeDialog, setActiveDialog] = useState<"edit" | "delete" | null>(null)',
			'',
			'  return (',
			'    <FeatureShell navigation={<aside>Navigation</aside>} showNavBar={showNavBar}>',
			"      <PageBody>",
			'        <FeatureBreadcrumb items={[{ id: "home", label: "Home", onSelect: () => undefined }, { id: "current", label: "Current", current: true }]} />',
			'        <CatalogueHero description="Browse shared content" onSearch={() => undefined} searchLabel="Search catalogue" searchPlaceholder="Search..." title="Catalogue">',
			'          <LandingCard icon={<span>+</span>}>Knowledge Base</LandingCard>',
			"        </CatalogueHero>",
			'        <SurfaceCard><LandingCard icon={<span>+</span>}>Knowledge Base</LandingCard></SurfaceCard>',
			'        <CatalogueResultCard description="Shared result" title={searchMatches && scopedSearchResults.length === 1 ? scopedSearchResults[0].title : "No result"} />',
			'        <HelpArticleAccordion articles={[{ id: "help", title: "Help", content: <p>Answer</p> }]} heading="Helpful information" />',
			'        <LandingSkeleton aria-label="Loading knowledge base" itemCount={2} />',
			'        <FilterMenuSurface><Combobox items={["HR", "IT"]}><ComboboxInput aria-label="Filter values" trailingIcon={<SearchIcon />} /><ComboboxContent data-snapp-filter-interaction=""><ComboboxList><ComboboxCollection>{(option) => <ComboboxItem key={option} value={option}>{option}</ComboboxItem>}</ComboboxCollection></ComboboxList></ComboboxContent></Combobox></FilterMenuSurface>',
			'        <FilterTokenList><FilterChip removeLabel="Remove Business Domain filter HR">Business Domain: HR</FilterChip></FilterTokenList>',
			"        <WorkItemCard item={item} />",
			'        <Input aria-label="Form input" variant="form" />',
			'        <Textarea aria-label="Form description" variant="form" />',
			'        <div className="relative"><DragPreview icon={<PuzzleIcon />}>Catalogue item</DragPreview><DropIndicator position="after" /></div>',
			'        <Button size="form" variant="form-primary">Save</Button>',
			'        <Button size="form" variant="form-secondary">Cancel</Button>',
			'        <Button size="form" variant="form-destructive">Delete</Button>',
			'        <Dialog open={activeDialog !== null} onOpenChange={(open) => { if (!open) setActiveDialog(null) }}>',
			'          <DialogContent size="form">',
			'            <DialogHeader size="form"><DialogTitle size="form">{activeDialog === "delete" ? "Delete item" : "Edit item"}</DialogTitle></DialogHeader>',
			'            <DialogBody size="form"><Input aria-label="Dialog input" variant="form" /></DialogBody>',
			'            <DialogFooter size="form"><Button onClick={() => setActiveDialog(null)} size="form" variant="form-secondary">Cancel</Button><Button size="form" variant="form-primary">Save</Button></DialogFooter>',
			"          </DialogContent>",
			"        </Dialog>",
			"        <DropdownMenu>",
			"          <DropdownMenuTrigger asChild>",
			'            <Button aria-label="Open actions for registry example" size="overflow" variant="overflow"><EllipsisIcon /></Button>',
			"          </DropdownMenuTrigger>",
			'          <DropdownMenuContent size="quick-actions">',
			'            <DropdownMenuItem onSelect={() => setActiveDialog("edit")} size="quick-actions">Edit</DropdownMenuItem>',
			'            <DropdownMenuItem onSelect={() => setActiveDialog("delete")} size="quick-actions">Delete</DropdownMenuItem>',
			"          </DropdownMenuContent>",
			"        </DropdownMenu>",
			"        <ContextMenu>",
			'          <ContextMenuTrigger><div>Right-click for actions</div></ContextMenuTrigger>',
			'          <ContextMenuContent size="quick-actions">',
			'            <ContextMenuItem onSelect={() => setActiveDialog("edit")} size="quick-actions">Configure</ContextMenuItem>',
			'            <ContextMenuItem onSelect={() => setActiveDialog("delete")} size="quick-actions">Remove</ContextMenuItem>',
			"          </ContextMenuContent>",
			"        </ContextMenu>",
			"      </PageBody>",
			"    </FeatureShell>",
			"  )",
			"}",
			"",
			"createRoot(document.getElementById(\"root\")!).render(",
			"  <StrictMode><RegistrySmoke /></StrictMode>,",
			")",
			"",
		].join("\n"),
	);

	const install = await execFileAsync(
		process.execPath,
		[
			shadcnCli,
			"add",
			"@snapp/snapp-catalogue-core",
			"@snapp/snapp-drag-feedback",
			"@snapp/snapp-work-item-card",
			"@snapp/snapp-button",
			"@snapp/snapp-combobox",
			"@snapp/snapp-context-menu",
			"@snapp/snapp-dropdown-menu",
			"@snapp/snapp-dialog",
			"@snapp/snapp-input",
			"@snapp/snapp-textarea",
			"-y",
			"-o",
		],
		{
			cwd: fixtureRoot,
			env: {
				...process.env,
				npm_config_audit: "false",
				npm_config_fund: "false",
			},
			maxBuffer: 10 * 1024 * 1024,
			timeout: 180_000,
		},
	);
	if (install.stdout) {
		process.stdout.write(install.stdout);
	}

	const packageJson = JSON.parse(
		await readFile(path.join(fixtureRoot, "package.json"), "utf8"),
	);
	for (const dependency of [
		"@fontsource/ibm-plex-sans",
		"@fontsource/judson",
		"clsx",
		"tailwind-merge",
		"zod",
	]) {
		if (!packageJson.dependencies?.[dependency]) {
			throw new Error(`Clean install did not add ${dependency}`);
		}
	}

	const indexCss = await readFile(path.join(sourceRoot, "index.css"), "utf8");
	const themeImport = '@import "./styles/snapp-theme.css"';
	if (!indexCss.includes(themeImport)) {
		throw new Error(`Clean install did not add ${themeImport}`);
	}
	const fontImport = '@import "./styles/snapp-fonts.css"';
	if (!indexCss.includes(fontImport)) {
		throw new Error(`Clean install did not add ${fontImport}`);
	}
	if (!indexCss.includes("--color-popover: var(--popover);")) {
		throw new Error(
			"Clean install did not register the semantic popover colour with Tailwind",
		);
	}

	const fontCss = await readFile(
		path.join(sourceRoot, "styles", "snapp-fonts.css"),
		"utf8",
	);
	for (const requiredSource of [
		"https://experience.snappcabinets.com/snapp/assets/fonts/",
		"https://fonts.gstatic.com/",
		"../../node_modules/@fontsource/",
	]) {
		if (!fontCss.includes(requiredSource)) {
			throw new Error(`Installed font CSS is missing ${requiredSource}`);
		}
	}

	const utils = await readFile(path.join(sourceRoot, "lib", "utils.ts"), "utf8");
	if (!utils.includes("extendTailwindMerge")) {
		throw new Error("Clean install did not install the SNAPP-aware utils");
	}

	const landingCard = await readFile(
		path.join(
			sourceRoot,
			"components",
			"snapp",
			"catalogue",
			"landing-card.tsx",
		),
		"utf8",
	);
	if (
		!landingCard.includes("ec:hover:bg-snapp-surface-primary") ||
		landingCard.includes("hover:ec:") ||
		!landingCard.includes("ec:rounded-snapp-m") ||
		!landingCard.includes("ec:border-snapp-card-border") ||
		!landingCard.includes("ec:box-border")
	) {
		throw new Error(
			"Clean prefixed install did not preserve the SNAPP card contract",
		);
	}

	const featureParameters = await readFile(
		path.join(sourceRoot, "lib", "snapp-feature-parameters.ts"),
		"utf8",
	);
	if (
		!featureParameters.includes("resolveShowNavBar") ||
		!featureParameters.includes("defaultValue = true")
	) {
		throw new Error("Clean install did not preserve feature parameter defaults");
	}

	const catalogueCore = await readFile(
		path.join(
			sourceRoot,
			"components",
			"snapp",
			"catalogue",
			"catalogue-core.ts",
		),
		"utf8",
	);
	for (const requiredExport of [
		"catalogue-hero",
		"catalogue-result-card",
		"help-article-accordion",
		"feature-breadcrumb",
		"snapp-feature-parameters",
	]) {
		if (!catalogueCore.includes(requiredExport)) {
			throw new Error(`Catalogue core is missing ${requiredExport}`);
		}
	}

	const featureBreadcrumb = await readFile(
		path.join(
			sourceRoot,
			"components",
			"snapp",
			"navigation",
			"feature-breadcrumb.tsx",
		),
		"utf8",
	);
	for (const className of [
		"ec:list-none",
		"ec:m-0",
		"ec:p-0",
		"ec:bg-snapp-skeleton-soft",
	]) {
		if (!featureBreadcrumb.includes(className)) {
			throw new Error(
				`Feature breadcrumb clean install is missing ${className}`,
			);
		}
	}
	if (featureBreadcrumb.includes("bg-snapp-surface-transparent")) {
		throw new Error(
			"Feature breadcrumb clean install uses the 30% transparent surface token",
		);
	}

	const helpAccordion = await readFile(
		path.join(
			sourceRoot,
			"components",
			"snapp",
			"catalogue",
			"help-article-accordion.tsx",
		),
		"utf8",
	);
	if (
		!helpAccordion.includes('ec:type="single"') &&
		!helpAccordion.includes('type="single"')
	) {
		throw new Error("Help article accordion did not preserve single expansion");
	}
	if (helpAccordion.includes("defaultValue={articles[0]")) {
		throw new Error("Help article accordion must load collapsed by default");
	}
	if (
		!helpAccordion.includes("ec:bg-transparent") ||
		!helpAccordion.includes("ec:hover:bg-transparent")
	) {
		throw new Error(
			"Help article accordion must keep Figma-aligned transparent rows",
		);
	}

	await execFileAsync(
		process.execPath,
		[path.join(fixtureRoot, "node_modules", "typescript", "bin", "tsc")],
		{ cwd: fixtureRoot, timeout: 120_000 },
	);
	await execFileAsync(
		process.execPath,
		[path.join(fixtureRoot, "node_modules", "vite", "bin", "vite.js"), "build"],
		{ cwd: fixtureRoot, timeout: 120_000 },
	);

	const distFiles = await readdir(path.join(fixtureRoot, "dist"), {
		recursive: true,
	});
	const bundledCss = (
		await Promise.all(
			distFiles
				.filter((fileName) => fileName.endsWith(".css"))
				.map((fileName) =>
					readFile(path.join(fixtureRoot, "dist", fileName), "utf8"),
				),
		)
	).join("\n");
	const compactCss = bundledCss.replace(/\s+/g, "");
	for (const contract of [
		"--radius:var(--snapp-radius-m)",
		"--background:var(--snapp-surface)",
		"background-color:var(--popover)",
		"box-sizing:border-box",
		"font:inherit",
	]) {
		if (!compactCss.includes(contract)) {
			throw new Error(`Production CSS is missing ${contract}`);
		}
	}
	const bundledFontFiles = distFiles.filter((fileName) =>
		/\.(woff2?|ttf)$/i.test(fileName),
	);
	if (
		bundledFontFiles.length !== 6 ||
		bundledFontFiles.some((fileName) => !fileName.endsWith(".woff2"))
	) {
		throw new Error(
			`Expected six bundled WOFF2 fallbacks, found: ${bundledFontFiles.join(", ")}`,
		);
	}

	console.log("Clean consumer install, type-check, and production build passed.");
} finally {
	await server?.close();
	const expectedPrefix = path.join(tmpdir(), "snapp-registry-smoke-");
	if (fixtureRoot.startsWith(expectedPrefix)) {
		await rm(fixtureRoot, { recursive: true, force: true });
	}
}
