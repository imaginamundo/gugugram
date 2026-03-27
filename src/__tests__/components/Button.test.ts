// @vitest-environment jsdom
import { type Component } from "svelte";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import ButtonComponent from "../../components/_ui/Button.svelte";

const Button = ButtonComponent as unknown as Component;

describe("Button", () => {
	it("renders the text passed as children", () => {
		render(Button, {
			props: {
				children: createRawSnippet(() => ({ render: () => "Click me" })),
			},
		});
		expect(screen.getByRole("button")).toHaveTextContent("Click me");
	});

	it("is disabled when the disabled prop is set", () => {
		render(Button, { props: { disabled: true } });
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("applies additional class names", () => {
		render(Button, { props: { class: "primary" } });
		const btn = screen.getByRole("button");
		expect(btn).toHaveClass("button");
		expect(btn).toHaveClass("primary");
	});
});
