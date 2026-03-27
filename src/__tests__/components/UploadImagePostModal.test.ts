// @vitest-environment jsdom
import { type Component } from "svelte";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

vi.mock("../../utils/draggableDialog.ts", () => ({
	draggableDialog: () => () => {},
}));

vi.mock("../../utils/image", () => ({
	drawImageToCanvas: vi.fn(),
	downloadImageFromSrc: vi.fn(),
	getCanvasBlob: vi.fn().mockResolvedValue(new Blob(["fake"], { type: "image/webp" })),
}));

vi.mock("astro:actions", () => ({
	actions: {
		uploadImagePost: vi.fn(),
	},
}));

import UploadImagePostModalComponent from "../../components/post/UploadImagePostModal/UploadImagePostModal.svelte";
import { actions } from "astro:actions";
import { getCanvasBlob, downloadImageFromSrc } from "../../utils/image";

const UploadImagePostModal = UploadImagePostModalComponent as unknown as Component;

function patchDialog() {
	HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
		this.setAttribute("open", "");
	});
	HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
		this.removeAttribute("open");
		this.dispatchEvent(new Event("close"));
	});
}

function selectFile(file = new File(["px"], "photo.png", { type: "image/png" })) {
	const input = document.querySelector('input[type="file"]') as HTMLInputElement;
	Object.defineProperty(input, "files", { value: [file], configurable: true });
	fireEvent.change(input);
	return file;
}

const authenticatedSession = { id: "user-1", name: "Test User" } as App.Locals["user"];

beforeEach(() => {
	patchDialog();
	vi.stubGlobal("URL", {
		createObjectURL: vi.fn(() => "blob:fake-url"),
		revokeObjectURL: vi.fn(),
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("UploadImagePostModal", () => {
	describe("initial render", () => {
		it("renders the trigger button", () => {
			render(UploadImagePostModal, { props: { session: authenticatedSession } });
			expect(screen.getByRole("button", { name: /adicionar foto/i })).toBeInTheDocument();
		});

		it("renders a hidden file input that accepts images", () => {
			render(UploadImagePostModal, { props: { session: authenticatedSession } });
			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			expect(input).toBeInTheDocument();
			expect(input.accept).toBe("image/*");
		});
	});

	describe("auth guard", () => {
		it("redirects to /entrar when session is null and trigger is clicked", async () => {
			const user = userEvent.setup();
			Object.defineProperty(window, "location", {
				value: { href: "/" },
				writable: true,
				configurable: true,
			});
			render(UploadImagePostModal, { props: { session: null } });
			await user.click(screen.getByRole("button", { name: /adicionar foto/i }));
			expect(window.location.href).toBe("/entrar");
		});
	});

	describe("file selection", () => {
		it("opens the modal when a file is selected", () => {
			render(UploadImagePostModal, { props: { session: authenticatedSession } });
			selectFile();
			expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
		});

		it("does not open the modal when no file is selected", () => {
			render(UploadImagePostModal, { props: { session: authenticatedSession } });
			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			Object.defineProperty(input, "files", { value: [], configurable: true });
			fireEvent.change(input);
			expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
		});
	});

	describe("modal content", () => {
		beforeEach(() => {
			render(UploadImagePostModal, { props: { session: authenticatedSession } });
			selectFile();
		});

		it("renders all five size radio options", () => {
			const radios = screen.getAllByRole("radio");
			expect(radios).toHaveLength(5);
			expect(screen.getByLabelText("5px²")).toBeInTheDocument();
			expect(screen.getByLabelText("60px²")).toBeInTheDocument();
		});

		it("renders the resize checkbox checked by default", () => {
			expect(screen.getByRole("checkbox", { name: /redimensionar/i })).toBeChecked();
		});

		it("renders the description textarea", () => {
			expect(screen.getByPlaceholderText(/coloque um texto para exibir/i)).toBeInTheDocument();
		});

		it("shows character count starting at 0 / 500", () => {
			expect(screen.getByText(/0 \/ 500 caracteres/i)).toBeInTheDocument();
			expect(screen.getByText(/500 restantes/i)).toBeInTheDocument();
		});

		it("updates character count as description is typed", async () => {
			const user = userEvent.setup();
			const textarea = screen.getByPlaceholderText(/coloque um texto para exibir/i);
			await user.type(textarea, "hello");
			expect(screen.getByText(/5 \/ 500 caracteres/i)).toBeInTheDocument();
			expect(screen.getByText(/495 restantes/i)).toBeInTheDocument();
		});

		it("renders the submit button with 'Publicar' label", () => {
			expect(screen.getByRole("button", { name: /publicar/i })).toBeInTheDocument();
		});
	});

	describe("form submission", () => {
		beforeEach(() => {
			render(UploadImagePostModal, { props: { session: authenticatedSession } });
			selectFile();
		});

		it("shows 'Publicando...' and disables submit while loading", async () => {
			vi.mocked(actions.uploadImagePost).mockImplementation(
				() => new Promise(() => {}), // never resolves
			);
			const form = document.querySelector("form")!;
			fireEvent.submit(form);
			await waitFor(() => {
				expect(screen.getByRole("button", { name: /publicando/i })).toBeDisabled();
			});
		});

		it("displays the error message when the action returns an error", async () => {
			vi.mocked(actions.uploadImagePost).mockResolvedValue({
				data: undefined,
				error: { message: "Arquivo muito grande" } as never,
			});
			const form = document.querySelector("form")!;
			fireEvent.submit(form);
			await waitFor(() => {
				expect(screen.getByRole("alert")).toHaveTextContent("Arquivo muito grande");
			});
		});

		it("redirects to the user profile on success", async () => {
			Object.defineProperty(window, "location", {
				value: { href: "/" },
				writable: true,
				configurable: true,
			});
			vi.mocked(actions.uploadImagePost).mockResolvedValue({
				data: { success: true, username: "testuser" } as never,
				error: undefined,
			});
			const form = document.querySelector("form")!;
			fireEvent.submit(form);
			await waitFor(() => {
				expect(window.location.href).toBe("/testuser");
			});
		});

		it("shows 'Erro inesperado' when getCanvasBlob throws", async () => {
			const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
			vi.mocked(getCanvasBlob).mockRejectedValueOnce(new Error("canvas error"));
			const form = document.querySelector("form")!;
			fireEvent.submit(form);
			await waitFor(() => {
				expect(screen.getByRole("alert")).toHaveTextContent("Erro inesperado");
			});
			consoleError.mockRestore();
		});
	});

	describe("modal close / state reset", () => {
		it("resets description after modal closes", async () => {
			const user = userEvent.setup();
			render(UploadImagePostModal, { props: { session: authenticatedSession } });
			selectFile();

			const textarea = screen.getByPlaceholderText(/coloque um texto para exibir/i);
			await user.type(textarea, "minha descrição");
			expect(screen.getByText(/15 \/ 500 caracteres/i)).toBeInTheDocument();

			const dialog = document.querySelector("dialog")!;
			dialog.dispatchEvent(new Event("close"));

			await waitFor(() => {
				expect(screen.getByText(/0 \/ 500 caracteres/i)).toBeInTheDocument();
			});
		});
	});

	describe("download button", () => {
		it("calls downloadImageFromSrc when 'Baixar original' is clicked", async () => {
			const user = userEvent.setup();
			render(UploadImagePostModal, { props: { session: authenticatedSession } });
			selectFile();
			await user.click(screen.getByRole("button", { name: /baixar original/i }));
			expect(downloadImageFromSrc).toHaveBeenCalledWith("blob:fake-url");
		});
	});
});
