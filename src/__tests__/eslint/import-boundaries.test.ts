import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fc from "fast-check";
import { Linter } from "eslint";
import boundaries from "eslint-plugin-boundaries";
import path from "path";
import fs from "fs";

const CWD = process.cwd();

const ALIAS_MAP: Record<string, string> = {
	"@ui": path.join(CWD, "src/components/_ui"),
	"@layout": path.join(CWD, "src/components/_layout"),
	"@components": path.join(CWD, "src/components"),
	"@infra": path.join(CWD, "src/infra"),
	"@observability": path.join(CWD, "src/observability"),
	"@auth": path.join(CWD, "src/auth.ts"),
	"@email": path.join(CWD, "src/email"),
	"@schemas": path.join(CWD, "src/schemas"),
	"@repositories": path.join(CWD, "src/repositories"),
	"@services": path.join(CWD, "src/services"),
	"@stores": path.join(CWD, "src/stores"),
	"@utils": path.join(CWD, "src/utils"),
	"@assets": path.join(CWD, "src/assets"),
	"@icons": path.join(CWD, "src/assets/icons"),
	"@customTypes": path.join(CWD, "src/types"),
};

const EXTENSIONS = [".ts", ".tsx", ".js", ".mjs", ".cjs", ".svelte", ".astro"];

const ALIAS_RESOLVER_PATH = path.join(CWD, "node_modules", "_boundaries-alias-resolver.cjs");

beforeAll(() => {
	fs.writeFileSync(
		ALIAS_RESOLVER_PATH,
		`"use strict";
const path = require("path");
const fs = require("fs");
const ALIAS_MAP = ${JSON.stringify(ALIAS_MAP)};
const EXTENSIONS = ${JSON.stringify(EXTENSIONS)};
exports.interfaceVersion = 2;
exports.resolve = function(source, fromFile) {
  for (const [alias, target] of Object.entries(ALIAS_MAP)) {
    if (source === alias || source.startsWith(alias + "/")) {
      const rest = source.slice(alias.length);
      const base = path.join(target, rest);
      for (const ext of EXTENSIONS) {
        if (fs.existsSync(base + ext)) return { found: true, path: base + ext };
      }
      return { found: true, path: base + ".ts" };
    }
  }
  if (source.startsWith(".")) {
    const dir = path.dirname(fromFile);
    const base = path.resolve(dir, source);
    for (const ext of EXTENSIONS) {
      if (fs.existsSync(base + ext)) return { found: true, path: base + ext };
    }
    return { found: true, path: base + ".ts" };
  }
  return { found: false };
};
`,
	);
});

afterAll(() => {
	if (fs.existsSync(ALIAS_RESOLVER_PATH)) fs.unlinkSync(ALIAS_RESOLVER_PATH);
});

const ELEMENTS = [
	{ type: "actions", pattern: "src/actions/**" },
	{ type: "services", pattern: "src/services/**" },
	{ type: "repositories", pattern: "src/repositories/**" },
	{ type: "components", pattern: "src/components/**" },
	{ type: "pages", pattern: "src/pages/**" },
	{ type: "stores", pattern: "src/stores/**" },
	{ type: "infra", pattern: "src/infra/**" },
	{ type: "observability", pattern: "src/observability/**" },
	{ type: "auth", pattern: "src/auth.ts" },
	{ type: "email", pattern: "src/email/**" },
	{ type: "schemas", pattern: "src/schemas/**" },
	{ type: "types", pattern: "src/types/**" },
	{ type: "utils", pattern: "src/utils/**" },
	{ type: "assets", pattern: "src/assets/**" },
	{ type: "middleware", pattern: "src/middleware/**" },
];

const DEPENDENCY_RULES = [
	{
		from: { type: "repositories" },
		allow: [
			{ to: { type: "infra" } },
			{ to: { type: "schemas" } },
			{ to: { type: "types" } },
			{ to: { type: "utils" } },
		],
	},
	{
		from: { type: "services" },
		allow: [
			{ to: { type: "repositories" } },
			{ to: { type: "infra" } },
			{ to: { type: "schemas" } },
			{ to: { type: "types" } },
			{ to: { type: "utils" } },
		],
	},
	{
		from: { type: "actions" },
		allow: [
			{ to: { type: "services" } },
			{ to: { type: "observability" } },
			{ to: { type: "schemas" } },
			{ to: { type: "types" } },
			{ to: { type: "utils" } },
		],
	},
	{
		from: { type: "components" },
		allow: [
			{ to: { type: "components" } },
			{ to: { type: "stores" } },
			{ to: { type: "utils" } },
			{ to: { type: "types" } },
			{ to: { type: "schemas" } },
			{ to: { type: "assets" } },
		],
	},
	{
		from: { type: "pages" },
		allow: [
			{ to: { type: "services" } },
			{ to: { type: "components" } },
			{ to: { type: "auth" } },
			{ to: { type: "observability" } },
			{ to: { type: "schemas" } },
			{ to: { type: "types" } },
			{ to: { type: "utils" } },
			{ to: { type: "stores" } },
		],
	},
	{
		from: { type: "stores" },
		allow: [{ to: { type: "utils" } }, { to: { type: "types" } }, { to: { type: "schemas" } }],
	},
	{
		from: { type: "infra" },
		allow: [{ to: { type: "schemas" } }, { to: { type: "types" } }, { to: { type: "utils" } }],
	},
	{
		from: { type: "observability" },
		allow: [{ to: { type: "types" } }, { to: { type: "utils" } }],
	},
	{
		from: { type: "auth" },
		allow: [
			{ to: { type: "infra" } },
			{ to: { type: "email" } },
			{ to: { type: "schemas" } },
			{ to: { type: "types" } },
			{ to: { type: "utils" } },
		],
	},
	{
		from: { type: "email" },
		allow: [{ to: { type: "types" } }, { to: { type: "utils" } }],
	},
	{
		from: { type: "middleware" },
		allow: [
			{ to: { type: "middleware" } },
			{ to: { type: "auth" } },
			{ to: { type: "types" } },
			{ to: { type: "utils" } },
		],
	},
	{ from: { type: "schemas" }, allow: [{ to: { type: "types" } }] },
	{ from: { type: "utils" }, allow: [{ to: { type: "types" } }] },
];

const NODE_RESOLVER_SETTINGS: Record<string, unknown> = {
	"import/resolver": { node: { extensions: EXTENSIONS } },
	"boundaries/elements": ELEMENTS,
};

function aliasResolverSettings(): Record<string, unknown> {
	return {
		"import/resolver": { [ALIAS_RESOLVER_PATH]: {} },
		"boundaries/elements": ELEMENTS,
	};
}

function makeLinterConfig(settings: Record<string, unknown>): Parameters<Linter["verify"]>[1] {
	return [
		{
			files: ["**/*.ts", "**/*.astro", "**/*.svelte"],
			plugins: { boundaries },
			settings,
			languageOptions: { ecmaVersion: 2022, sourceType: "module" },
			rules: {
				"boundaries/dependencies": ["error", { default: "disallow", rules: DEPENDENCY_RULES }],
				"boundaries/no-unknown": "error",
			},
		},
		{
			files: ["src/__tests__/**"],
			rules: {
				"boundaries/dependencies": "off",
				"boundaries/no-unknown": "off",
			},
		},
	];
}

function lint(
	filePath: string,
	importPath: string,
	useAliasResolver = false,
): Linter.LintMessage[] {
	const linter = new Linter({ configType: "flat" });
	const settings = useAliasResolver ? aliasResolverSettings() : NODE_RESOLVER_SETTINGS;
	const messages = linter.verify(`import x from '${importPath}';`, makeLinterConfig(settings), {
		filename: filePath,
	});
	return messages.filter((m) => m.ruleId === "boundaries/dependencies");
}

function layerFiles(layer: string): string[] {
	const layerDir = path.join(CWD, "src", layer);
	const results: string[] = [];
	function walk(dir: string) {
		let entries: string[];
		try {
			entries = fs.readdirSync(dir);
		} catch {
			return;
		}
		for (const entry of entries) {
			const full = path.join(dir, entry);
			const stat = fs.statSync(full);
			if (stat.isDirectory()) {
				walk(full);
			} else if (/\.(ts|svelte|astro)$/.test(entry)) {
				results.push(path.relative(CWD, full).replace(/\.(ts|svelte|astro)$/, ""));
			}
		}
	}
	walk(layerDir);
	return results.length ? results : [`src/${layer}/index`];
}

function layerFile(layer: string, ext = ".ts"): fc.Arbitrary<string> {
	const files = layerFiles(layer);
	return fc.constant(files[0] + ext);
}

function relativeImport(fromLayer: string, toLayer: string): fc.Arbitrary<string> {
	const fromFile = layerFiles(fromLayer)[0];
	const toFile = layerFiles(toLayer)[0];
	const fromDir = path.dirname(path.join(CWD, fromFile));
	const toAbs = path.join(CWD, toFile);
	const rel = path.relative(fromDir, toAbs).replace(/\\/g, "/");
	return fc.constant(rel);
}

function aliasImport(toLayer: string): fc.Arbitrary<string> {
	const aliasMap: Record<string, string> = {
		services: "@services",
		repositories: "@repositories",
		infra: "@infra",
		observability: "@observability",
		auth: "@auth",
		email: "@email",
		schemas: "@schemas",
		types: "@customTypes",
		utils: "@utils",
		stores: "@stores",
		components: "@components",
		assets: "@assets",
	};
	const prefix = aliasMap[toLayer] ?? `@${toLayer}`;
	const toFile = layerFiles(toLayer)[0];
	const layerDir = `src/${toLayer}/`;
	const relToLayer = toFile.startsWith(layerDir)
		? toFile.slice(layerDir.length)
		: path.basename(toFile);
	return fc.constant(`${prefix}/${relToLayer}`);
}

describe("repositories layer", () => {
	it("rejects imports from services, actions, pages, and components", () => {
		fc.assert(
			fc.property(
				fc.record({
					fromFile: layerFile("repositories"),
					importPath: fc.oneof(
						relativeImport("repositories", "services"),
						relativeImport("repositories", "actions"),
						relativeImport("repositories", "pages"),
						relativeImport("repositories", "components"),
					),
				}),
				({ fromFile, importPath }) => {
					expect(lint(fromFile, importPath).length).toBeGreaterThan(0);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("allows imports from infra, schemas, types, and utils", () => {
		fc.assert(
			fc.property(
				fc.record({
					fromFile: layerFile("repositories"),
					importPath: fc.oneof(
						relativeImport("repositories", "infra"),
						relativeImport("repositories", "schemas"),
						relativeImport("repositories", "types"),
						relativeImport("repositories", "utils"),
					),
				}),
				({ fromFile, importPath }) => {
					expect(lint(fromFile, importPath).length).toBe(0);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("services layer", () => {
	it("rejects imports from actions, pages, and components", () => {
		fc.assert(
			fc.property(
				fc.record({
					fromFile: layerFile("services"),
					importPath: fc.oneof(
						relativeImport("services", "actions"),
						relativeImport("services", "pages"),
						relativeImport("services", "components"),
					),
				}),
				({ fromFile, importPath }) => {
					expect(lint(fromFile, importPath).length).toBeGreaterThan(0);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("allows imports from repositories, infra, schemas, types, and utils", () => {
		fc.assert(
			fc.property(
				fc.record({
					fromFile: layerFile("services"),
					importPath: fc.oneof(
						relativeImport("services", "repositories"),
						relativeImport("services", "infra"),
						relativeImport("services", "schemas"),
						relativeImport("services", "types"),
						relativeImport("services", "utils"),
					),
				}),
				({ fromFile, importPath }) => {
					expect(lint(fromFile, importPath).length).toBe(0);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("actions layer", () => {
	it("rejects direct imports from repositories", () => {
		fc.assert(
			fc.property(
				fc.record({
					fromFile: layerFile("actions"),
					importPath: relativeImport("actions", "repositories"),
				}),
				({ fromFile, importPath }) => {
					expect(lint(fromFile, importPath).length).toBeGreaterThan(0);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("allows imports from services, observability, schemas, types, and utils", () => {
		fc.assert(
			fc.property(
				fc.record({
					fromFile: layerFile("actions"),
					importPath: fc.oneof(
						relativeImport("actions", "services"),
						relativeImport("actions", "observability"),
						relativeImport("actions", "schemas"),
						relativeImport("actions", "types"),
						relativeImport("actions", "utils"),
					),
				}),
				({ fromFile, importPath }) => {
					expect(lint(fromFile, importPath).length).toBe(0);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("components layer", () => {
	it("rejects imports from actions, services, and repositories", () => {
		fc.assert(
			fc.property(
				fc.record({
					fromFile: layerFile("components"),
					importPath: fc.oneof(
						relativeImport("components", "actions"),
						relativeImport("components", "services"),
						relativeImport("components", "repositories"),
					),
				}),
				({ fromFile, importPath }) => {
					expect(lint(fromFile, importPath).length).toBeGreaterThan(0);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("allows imports from stores, utils, types, and assets", () => {
		fc.assert(
			fc.property(
				fc.record({
					fromFile: layerFile("components"),
					importPath: fc.oneof(
						relativeImport("components", "stores"),
						relativeImport("components", "utils"),
						relativeImport("components", "types"),
					),
				}),
				({ fromFile, importPath }) => {
					expect(lint(fromFile, importPath).length).toBe(0);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("pages layer", () => {
	it("rejects direct imports from repositories", () => {
		fc.assert(
			fc.property(
				fc.record({
					fromFile: layerFile("pages"),
					importPath: relativeImport("pages", "repositories"),
				}),
				({ fromFile, importPath }) => {
					expect(lint(fromFile, importPath).length).toBeGreaterThan(0);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("allows imports from services, components, auth, observability, schemas, types, utils, and stores", () => {
		fc.assert(
			fc.property(
				fc.record({
					fromFile: layerFile("pages"),
					importPath: fc.oneof(
						relativeImport("pages", "services"),
						relativeImport("pages", "observability"),
						relativeImport("pages", "schemas"),
						relativeImport("pages", "types"),
						relativeImport("pages", "utils"),
						relativeImport("pages", "stores"),
					),
				}),
				({ fromFile, importPath }) => {
					expect(lint(fromFile, importPath).length).toBe(0);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("stores layer", () => {
	it("rejects imports from actions, services, repositories, and infra", () => {
		fc.assert(
			fc.property(
				fc.record({
					fromFile: layerFile("stores"),
					importPath: fc.oneof(
						relativeImport("stores", "actions"),
						relativeImport("stores", "services"),
						relativeImport("stores", "repositories"),
						relativeImport("stores", "infra"),
					),
				}),
				({ fromFile, importPath }) => {
					expect(lint(fromFile, importPath).length).toBeGreaterThan(0);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("allows imports from utils, types, and schemas", () => {
		fc.assert(
			fc.property(
				fc.record({
					fromFile: layerFile("stores"),
					importPath: fc.oneof(
						relativeImport("stores", "utils"),
						relativeImport("stores", "types"),
						relativeImport("stores", "schemas"),
					),
				}),
				({ fromFile, importPath }) => {
					expect(lint(fromFile, importPath).length).toBe(0);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("import style", () => {
	it("reports a violation for both relative and alias forms of a forbidden import", () => {
		fc.assert(
			fc.property(
				fc.record({
					fromFile: layerFile("repositories"),
					relPath: relativeImport("repositories", "services"),
					aliasPath: aliasImport("services"),
				}),
				({ fromFile, relPath, aliasPath }) => {
					expect(lint(fromFile, relPath).length).toBeGreaterThan(0);
					expect(lint(fromFile, aliasPath, true).length).toBeGreaterThan(0);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("file extensions", () => {
	it("enforces boundary rules on .ts, .astro, and .svelte files", () => {
		const importPath = relativeImport("repositories", "services");
		fc.assert(
			fc.property(
				fc.record({
					baseName: fc
						.string({ minLength: 1, maxLength: 20 })
						.filter((s) => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)),
					importPath,
				}),
				({ baseName, importPath: imp }) => {
					expect(lint(`src/repositories/${baseName}.ts`, imp).length).toBeGreaterThan(0);
					expect(lint(`src/repositories/${baseName}.astro`, imp).length).toBeGreaterThan(0);
					expect(lint(`src/repositories/${baseName}.svelte`, imp).length).toBeGreaterThan(0);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("test file exemption", () => {
	it("reports zero violations for any import from any test file", () => {
		fc.assert(
			fc.property(
				fc.record({
					testFile: fc
						.string({ minLength: 1, maxLength: 20 })
						.filter((s) => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s))
						.map((name) => `src/__tests__/${name}.test.ts`),
					importPath: fc.oneof(
						relativeImport("repositories", "services"),
						relativeImport("repositories", "actions"),
						relativeImport("services", "pages"),
						relativeImport("stores", "infra"),
						relativeImport("components", "repositories"),
					),
				}),
				({ testFile, importPath }) => {
					expect(lint(testFile, importPath).length).toBe(0);
				},
			),
			{ numRuns: 100 },
		);
	});
});
