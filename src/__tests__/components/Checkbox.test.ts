// @vitest-environment jsdom
import { type Component } from "svelte";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import CheckboxComponent from "../../components/_ui/Checkbox.svelte";

const Checkbox = CheckboxComponent as unknown as Component;

describe("Checkbox", () => {
	it("renders an unchecked checkbox by default", () => {
		render(Checkbox);
		expect(screen.getByRole("checkbox")).not.toBeChecked();
	});

	it("renders checked when checked prop is true", () => {
		render(Checkbox, { props: { checked: true } });
		expect(screen.getByRole("checkbox")).toBeChecked();
	});

	it("reflects indeterminate state", () => {
		render(Checkbox, { props: { indeterminate: true } });
		expect(screen.getByRole("checkbox")).toHaveProperty("indeterminate", true);
	});

	it("toggles checked state on click", async () => {
		const user = userEvent.setup();
		render(Checkbox as unknown as Component);
		const checkbox = screen.getByRole("checkbox");

		expect(checkbox).not.toBeChecked();
		await user.click(checkbox);
		expect(checkbox).toBeChecked();
		await user.click(checkbox);
		expect(checkbox).not.toBeChecked();
	});

	it("applies additional class names", () => {
		render(Checkbox, { props: { class: "my-class" } });
		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).toHaveClass("checkbox");
		expect(checkbox).toHaveClass("my-class");
	});

	it("forwards extra props to the input element", () => {
		render(Checkbox, { props: { name: "agree", disabled: true } });
		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).toHaveAttribute("name", "agree");
		expect(checkbox).toBeDisabled();
	});
});
