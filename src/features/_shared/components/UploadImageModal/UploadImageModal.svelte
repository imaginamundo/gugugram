<script lang="ts">
	import { actions } from "astro:actions";
	import { draggableDialog } from '@utils/draggableDialog';
	import Button from "@components/_ui/Button.svelte";
	import Checkbox from "@components/_ui/Checkbox.svelte";
	import Modal from "@components/_ui/Modal.svelte";
	import Radio from "@components/_ui/Radio.svelte";
	import Textarea from "@components/_ui/Textarea.svelte";

	interface Props {
		session: App.Locals["user"];
	}
	const { session }: Props = $props();

	const DEFAULT_SIZE = 15;
	const sizes = [5, 10, 15, 30, 60];

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
	let formRef: HTMLFormElement;

	const characterCountLimit = 500;

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
			const reader = new FileReader();
			reader.onload = () => {
				imageSrc = reader.result?.toString() || "";
				modalRef?.showModal();
			};
			reader.readAsDataURL(file);
		}
	}

	const drawCrop = () => {
		const currentSize = imageSize || DEFAULT_SIZE;
		if (!imageRef || !canvasRef || !imageRef.complete || !imageSrc) return;
		if (!imageRef.complete || imageRef.naturalWidth === 0) return;

		const ctx = canvasRef.getContext("2d");
		if (!ctx) return;

		canvasRef.width = currentSize;
		canvasRef.height = currentSize;

		ctx.imageSmoothingEnabled = false;

		const { naturalWidth, naturalHeight } = imageRef;

		const options = calculateCrop(naturalWidth, naturalHeight);

		ctx.clearRect(0, 0, currentSize, currentSize);
		ctx.drawImage(imageRef, ...options);
	};

	$effect(() => {
		if (imageRef && imageSrc) {
			if (imageRef.complete && imageRef.naturalWidth > 0) {
				drawCrop();
			} else {
				imageRef.onload = drawCrop;
			}
		}
	});

	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/drawImage) */
	type CanvasOptions = [
		sourceX: number,
		sourceY: number,
		sourceWidth: number,
		sourceHeight: number,
		destinationX: number,
		destinationY: number,
		destinationWidth: number,
		destinationHeight: number,
	];

	function calculateCrop(nw: number, nh: number): CanvasOptions {
		if (imageResize) {
			const smallest = Math.min(nw, nh);
			const sx = (nw - smallest) / 2;
			const sy = (nh - smallest) / 2;
			return [sx, sy, smallest, smallest, 0, 0, imageSize, imageSize];
		}

		const sx = Math.floor((nw - imageSize) / 2);
		const sy = Math.floor((nh - imageSize) / 2);
		return [sx, sy, imageSize, imageSize, 0, 0, imageSize, imageSize];
	}

	function onModalClose() {
		imageSize = 15;
		imageSrc = "";
		imageDescription = "";
		imageResize = true;
		loading = false;
		actionError = "";

		if (inputFileRef) inputFileRef.value = "";
	}

	function downloadOriginal() {
		if (!imageSrc) return;
		const a = document.createElement("a");
		a.href = imageSrc;
		a.download = `gugugram.com_${Date.now()}.png`;
		document.body.appendChild(a);
		a.click();
		a.remove();
	}

	function getCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
		return new Promise((resolve) => {
			canvas.toBlob(
				(blob) => {
					resolve(blob);
				},
				"image/webp",
				1.0,
			);
		});
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!canvasRef) return;

		loading = true;

		try {
			const blob = await getCanvasBlob(canvasRef);
			if (!blob) throw new Error("Erro ao gerar imagem.");

			const file = new File([blob], `image-${imageSize}x${imageSize}.webp`, {
				type: "image/webp",
			});

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
</script>

<Button class="button-grayscale button-borderless eader-button flex gap center p w-full justify-center" onclick={triggerFileInput}>
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
	<div class="title-bar" use:draggableDialog><p><strong>Subir imagem</strong></p></div>
	<div class="window-body">
		{#if actionError}
			<p class="error mb flex center gap" role="alert">
				<img src="/icons/msg_error-0.png" alt="'Ícone de erro" />
				{actionError}
			</p>
		{/if}
		<form onsubmit={handleSubmit} bind:this={formRef}>
			<div class="flex flex-wrap start gap">
				<fieldset>
					<legend>Opções de imagem</legend>
					<div class="flex flex-col mb">
						{#each sizes as size}
							<label onchange={drawCrop} class="inline-label">
								<Radio name="image-size" value={size} bind:group={imageSize} />
								{size}px²
							</label>
						{/each}
					</div>
					<label onchange={drawCrop} class="inline-label">
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
							aria-label={`Pré-visualização da imagem no tamanho ${imageSize} por ${imageSize} pixels`}
						>
							<canvas
								bind:this={canvasRef}
								style:transform={`scale(${120 / (imageSize || DEFAULT_SIZE)})`}
								style:transform-origin="0 0"
							>
							</canvas>
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
								onload={drawCrop}
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
							maxlength={characterCountLimit}
							placeholder="Coloque um texto para exibir junto com a foto, campo opcional"
							bind:value={imageDescription}
						/>
						<span class="flex justify-between mt-sm">
							<span>{imageDescription.length} / {characterCountLimit} caracteres</span>
							<span>{characterCountLimit - imageDescription.length} restantes</span>
						</span>
					</label>
				</fieldset>
			</div>
			<div class="flex justify-between mt">
				<Button type="button" onclick={downloadOriginal}>Baixar original</Button>
				<Button type="submit">Publicar</Button>
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
		width: 120px;
		height: 120px;
		canvas {
			vertical-align: top;
		}
	}
</style>
