import typescript from "@rollup/plugin-typescript"
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

// rollup.config.js
/**
 * @type {import("rollup").RollupOptions}
 */
const config = [
	{
		input: "src/Server/app.ts",
		output: {
			file: "dist/app.cjs",
			format: "cjs"
		},
		plugins: [
			typescript()
		],
		external: [
			"express",
			"path",
			"fs"
		]
	},
	{
		input: "src/Client/app.ts",
		output: {
			file: "dist/public/europa/client.js",
			format: "iife",
			globals: {
				leaflet: "L"
			}
		},
		plugins: [
			typescript(),
			nodeResolve(),
			// terser()
		],
		external: [
			"leaflet"
		]
	}
];

export default config;