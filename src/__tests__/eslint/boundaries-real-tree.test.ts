import { describe, it, expect } from "vitest";
import { ESLint } from "eslint";

/**
 * `import-boundaries.test.ts` lints synthetic code strings against a hand-built
 * copy of the layer policy. That proves the *rules* are written correctly, but
 * it cannot notice if the shipped `eslint.config.js` fails to apply them — which
 * is exactly what happened when the config was missing its `import/resolver`
 * entry: every alias import resolved to nothing, so the plugin reported nothing
 * and twelve real violations passed CI.
 *
 * This test closes that gap by running the *real* ESLint with the *real* config
 * over the *real* `src/` tree.
 */
describe("boundaries policy, applied to the actual source tree", () => {
	it("reports no layer violations", async () => {
		const eslint = new ESLint();
		const results = await eslint.lintFiles(["src/**/*.{ts,js,svelte,astro}"]);

		const violations = results.flatMap((result) =>
			result.messages
				.filter((message) => message.ruleId?.startsWith("boundaries/"))
				.map(
					(message) => `${result.filePath}:${message.line} [${message.ruleId}] ${message.message}`,
				),
		);

		expect(violations).toEqual([]);
	}, 120_000);

	it("actually resolved the path aliases, so a clean run means something", async () => {
		// A config without `import/resolver` silently classifies every aliased
		// import as unresolvable and reports zero violations. Feed it a file that
		// must fail and assert it does, so the test above cannot pass vacuously.
		const eslint = new ESLint();
		const results = await eslint.lintText(
			`import { db } from "@infra/database";\nexport { db };\n`,
			{
				filePath: "src/components/__boundaries_probe__.ts",
			},
		);

		const violations = results
			.flatMap((result) => result.messages)
			.filter((message) => message.ruleId === "boundaries/dependencies");

		expect(violations).toHaveLength(1);
		expect(violations[0].message).toContain('elements of type "components"');
		expect(violations[0].message).toContain('elements of type "infra"');
	}, 60_000);
});
