<script lang="ts">
	let {
		name,
		value = null,
		width = 30,
		height = 30,
		quality = 0.9,
		previewAlt = "Prévia da imagem selecionada",
	}: {
		name: string;
		value?: string | null;
		width?: number;
		height?: number;
		quality?: number;
		previewAlt?: string;
	} = $props();

	const safeWidth = $derived(Math.max(1, Math.round(width)));
	const safeHeight = $derived(Math.max(1, Math.round(height)));
	const safeQuality = $derived(Math.min(1, Math.max(0, quality)));

	let canvas = $state<HTMLCanvasElement | null>(null);
	let previewUrl = $state<string | null>(null);
	let base64Output = $state<string>("");

	$effect(() => {
		if (!base64Output) {
			previewUrl = value;
		}
	});

	async function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;

		if (!files || files.length === 0) {
			base64Output = "";
			return;
		}

		const file = files[0];

		if (!file.type.startsWith("image/")) {
			target.value = "";
			return;
		}

		try {
			const rawBase64 = await fileToBase64(file);
			const img = await loadImage(rawBase64);
			processImage(img);
		} catch {
			previewUrl = null;
			base64Output = "";
		}
	}

	function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	function loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = src;
		});
	}

	function processImage(img: HTMLImageElement) {
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		canvas.width = safeWidth;
		canvas.height = safeHeight;

		let sourceX = 0;
		let sourceY = 0;
		let sourceWidth = img.width;
		let sourceHeight = img.height;

		const targetAspect = safeWidth / safeHeight;
		const sourceAspect = img.width / img.height;

		if (sourceAspect > targetAspect) {
			sourceWidth = img.height * targetAspect;
			sourceX = (img.width - sourceWidth) / 2;
		} else if (sourceAspect < targetAspect) {
			sourceHeight = img.width / targetAspect;
			sourceY = (img.height - sourceHeight) / 2;
		}

		ctx.clearRect(0, 0, safeWidth, safeHeight);
		ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, safeWidth, safeHeight);

		base64Output = canvas.toDataURL("image/png", safeQuality);
		previewUrl = base64Output;
	}
</script>

<span class="image-input-container">
	{#if previewUrl}
		<span class="flex gap center mb">
			Prévia:
			<img src={previewUrl} alt={previewAlt} class="avatar-preview" />
		</span>
	{/if}
	<input
		type="file"
		accept="image/png, image/jpeg, image/webp"
		onchange={handleFileChange}
		class="input block w-full"
	/>

	<input type="hidden" {name} value={base64Output} />

	<canvas bind:this={canvas} style="display: none;"></canvas>
</span>
