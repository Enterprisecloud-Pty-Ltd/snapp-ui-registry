import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default defineConfig([
	{
		files: ["registry/radix-nova/tooling/*.mjs"],
		extends: [js.configs.recommended],
		languageOptions: { globals: globals.node },
	},
	{
		files: ["registry/radix-nova/**/*.{ts,tsx}"],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: { globals: globals.browser },
	},
	{
		// Primitive libraries expose recipes and controller helpers to composition.
		// Application and reusable Snapp component rules remain strict.
		files: ["registry/radix-nova/ui/**"],
		rules: {
			"react-refresh/only-export-components": "off",
			"react-hooks/set-state-in-effect": "off",
		},
	},
]);
