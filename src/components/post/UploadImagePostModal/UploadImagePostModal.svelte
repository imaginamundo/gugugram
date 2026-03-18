<script lang="ts">
	import { onDestroy } from "svelte";
	import { actions } from "astro:actions";
	import { draggableDialog } from "@utils/draggableDialog.ts";
	import { drawImageToCanvas, downloadImageFromSrc, getCanvasBlob } from "src/utils/image";
	import Button from "@ui/Button.svelte";
	import Checkbox from "@ui/Checkbox.svelte";
	import Modal from "@ui/Modal.svelte";
	import Radio from "@ui/Radio.svelte";
	import Textarea from "@ui/Textarea.svelte";

	interface Props {
		session: App.Locals["user"];
	}
	const { session }: Props = $props();

	const DEFAULT_SIZE = 15;
	const SIZES = [5, 10, 15, 30, 60];
	const CHARACTER_COUNT_LIMIT = 500;

	let imageSrc = $state("");
	let imageSize = $state(DEFAULT_SIZE);
	let imageResize = $state(true);
	let imageDescription = $state("");
	let loading = $state(false);
	let actionError = $state("");

	let modalRef = $state<HTMLDialogElement | null>(null);
	let imageRef = $state<HTMLImageElement | null>(null);
	let canvasRef = $state<HTMLCanvasElement | null>(null);
	let inputFileRef: HTMLInputElement;

	function triggerFileInput() {
		if (!session) {
			window.location.href = "/entrar";
			return;
		}
		inputFileRef?.click();
	}

	function selectImage(e: Event & { currentTarget: HTMLInputElement }) {
		const file = e.currentTarget.files?.[0];
		if (file) {
			if (imageSrc) URL.revokeObjectURL(imageSrc);
			modalRef?.showModal();
			imageSrc = URL.createObjectURL(file);
		}
	}

	function onModalClose() {
		imageSize = DEFAULT_SIZE;
		imageDescription = "";
		imageResize = true;
		loading = false;
		actionError = "";
		if (imageSrc) URL.revokeObjectURL(imageSrc);
		if (inputFileRef) inputFileRef.value = "";
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!canvasRef) return;

		loading = true;

		try {
			const blob = await getCanvasBlob(canvasRef);
			if (!blob) throw new Error("Erro ao gerar imagem.");

			const file = new File([blob], `image-${imageSize}x${imageSize}.webp`, { type: "image/webp" });
			const formData = new FormData();
			formData.append("image", file);
			formData.append("description", imageDescription);

			const { data, error } = await actions.uploadImagePost(formData);

			if (error) {
				actionError = error.message;
				return;
			}

			if (data?.success) {
				modalRef?.close();
				window.location.href = `/${data.username}`;
			}
		} catch (error) {
			actionError = "Erro inesperado";
			console.error("Erro inesperado:", error);
		} finally {
			loading = false;
		}
	}

	async function drawCanvas() {
		const currentSize = imageSize;
		const currentResize = imageResize;

		if (!canvasRef || !imageRef || !imageSrc || !imageRef.complete) return;

		try {
			await imageRef.decode();
		} catch {}

		drawImageToCanvas({
			canvas: canvasRef,
			imageElement: imageRef,
			imageSize: currentSize,
			imageResize: currentResize,
		});
	}

	$effect(() => {
		drawCanvas();
	});

	onDestroy(() => {
		if (imageSrc) URL.revokeObjectURL(imageSrc);
	});
</script>

<Button
	class="button-grayscale button-borderless eader-button flex gap center p w-full justify-center"
	onclick={triggerFileInput}
>
	<img src="/icons/camera3_plus-3.png" width="32" height="32" alt="Ícone de casa" />
	Adicionar foto
</Button>
<input
	type="file"
	accept="image/*"
	onchange={selectImage}
	bind:this={inputFileRef}
	class="hidden"
	tabindex="-1"
	aria-hidden="true"
/>

<Modal bind:ref={modalRef} onclose={onModalClose}>
	<div class="title-bar" {@attach draggableDialog}><p><strong>Subir imagem</strong></p></div>
	<div class="window-body">
		{#if actionError}
			<p class="error mb flex center gap" role="alert">
				<img src="/icons/msg_error-0.png" alt="Ícone de erro" />
				{actionError}
			</p>
		{/if}

		<form onsubmit={handleSubmit}>
			<div class="flex flex-wrap start gap">
				<fieldset>
					<legend>Opções de imagem</legend>
					<div class="flex flex-col mb">
						{#each SIZES as size (size)}
							<label class="inline-label">
								<Radio name="image-size" value={size} bind:group={imageSize} />
								{size}px²
							</label>
						{/each}
					</div>
					<label class="inline-label">
						<Checkbox name="image-resize" bind:checked={imageResize} />
						Redimensionar
					</label>
				</fieldset>
				<div class="flex gap">
					<div>
						<p class="mb-sm">Zoom</p>
						<div
							class="canvas-print"
							role="img"
							aria-label={`Pré-visualização ${imageSize}x${imageSize}`}
						>
							<canvas bind:this={canvasRef}></canvas>
						</div>
					</div>
					<div>
						<p class="mb-sm">Original</p>
						<div class="image-print mb">
							<img
								bind:this={imageRef}
								src={imageSrc}
								alt="To be uploaded"
								width={imageSize || DEFAULT_SIZE}
								height={imageSize || DEFAULT_SIZE}
								onload={drawCanvas}
							/>
						</div>
					</div>
				</div>
				<fieldset class="grow">
					<legend>Campos opcionais</legend>
					<label class="label p-sm">
						Descrição
						<Textarea
							name="description"
							rows={5}
							class="w-full"
							maxlength={CHARACTER_COUNT_LIMIT}
							placeholder="Coloque um texto para exibir junto com a foto, campo opcional"
							bind:value={imageDescription}
						/>
						<span class="flex justify-between mt-sm">
							<span>{imageDescription.length} / {CHARACTER_COUNT_LIMIT} caracteres</span>
							<span>{CHARACTER_COUNT_LIMIT - imageDescription.length} restantes</span>
						</span>
					</label>
				</fieldset>
			</div>
			<div class="flex justify-between mt">
				<Button type="button" onclick={() => downloadImageFromSrc(imageSrc)}>Baixar original</Button
				>
				<Button type="submit" disabled={loading}>
					{loading ? "Publicando..." : "Publicar"}
				</Button>
			</div>
		</form>
	</div>
</Modal>

<style>
	.image-print {
		width: 60px;
		height: 60px;
		img {
			vertical-align: top;
			object-fit: cover;
		}
	}
	.canvas-print {
		canvas {
			width: 120px;
			height: 120px;
			vertical-align: top;
		}
	}
</style>
