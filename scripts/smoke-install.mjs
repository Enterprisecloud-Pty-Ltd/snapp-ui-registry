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
			'import { StrictMode } from "react"',
			'import { createRoot } from "react-dom/client"',
			'import { LandingCard } from "@/components/snapp/catalogue/landing-card"',
			'import { LandingSkeleton } from "@/components/snapp/catalogue/landing-skeleton"',
			'import { FeatureShell, PageBody, SurfaceCard } from "@/components/snapp/layout/feature-layout"',
			'import { WorkItemCard } from "@/components/snapp/work-os/work-item-card"',
			'import { resolveShowNavBar } from "@/lib/snapp-feature-parameters"',
			'import "./index.css"',
			"",
			'const showNavBar = resolveShowNavBar(new URLSearchParams("showNavBar=false"))',
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
			"createRoot(document.getElementById(\"root\")!).render(",
			"  <StrictMode>",
			'    <FeatureShell navigation={<aside>Navigation</aside>} showNavBar={showNavBar}>',
			"      <PageBody>",
			'        <SurfaceCard><LandingCard icon={<span>+</span>}>Knowledge Base</LandingCard></SurfaceCard>',
			'        <LandingSkeleton aria-label="Loading knowledge base" itemCount={2} />',
			"        <WorkItemCard item={item} />",
			"      </PageBody>",
			"    </FeatureShell>",
			"  </StrictMode>,",
			")",
			"",
		].join("\n"),
	);

	const install = await execFileAsync(
		process.execPath,
		[
			shadcnCli,
			"add",
			"@snapp/snapp-landing-card",
			"@snapp/snapp-landing-skeleton",
			"@snapp/snapp-work-item-card",
			"@snapp/snapp-feature-parameters",
			"@snapp/snapp-feature-layout",
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
