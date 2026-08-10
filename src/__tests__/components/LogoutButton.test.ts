// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import LogoutButton from "../../components/_layout/LogoutButton.svelte";

const { signOutMock } = vi.hoisted(() => ({ signOutMock: vi.fn() }));

vi.mock("../../auth-client", () => ({
	authClient: { signOut: signOutMock },
}));

vi.mock("../../utils/draggableDialog.ts", () => ({
	draggableDialog: vi.fn(),
}));

vi.mock("../../utils/tracking", () => ({
	trackEvent: vi.fn(),
	resetTracking: vi.fn(),
}));

function patchDialog() {
	HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
		this.setAttribute("open", "");
	});
	HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
		this.removeAttribute("open");
	});
}

describe("LogoutButton", () => {
	beforeEach(() => {
		signOutMock.mockReset();
		patchDialog();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("opens the confirmation dialog when 'Sair da conta' is clicked", async () => {
		const user = userEvent.setup();
		render(LogoutButton);

		await user.click(screen.getByRole("button", { name: "Sair da conta" }));

		expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
		expect(screen.getByText("Tem certeza que deseja sair da sua conta?")).toBeTruthy();
	});

	it("signs out through better-auth and navigates to the home page on success", async () => {
		const location = { href: "http://localhost:4321/dio" };
		vi.stubGlobal("location", location);

		signOutMock.mockResolvedValue({ success: true });
		const user = userEvent.setup();
		render(LogoutButton);

		await user.click(screen.getByRole("button", { name: "Sair da conta" }));
		await user.click(screen.getByRole("button", { name: "Sim, quero sair" }));

		expect(signOutMock).toHaveBeenCalledTimes(1);
		await vi.waitFor(() => {
			expect(location.href).toBe("/");
		});
	});
});
