<script lang="ts">
  let {
    name,
    value = null,
  }: {
    name: string;
    value?: string | null;
  } = $props();

  let fileInput = $state<HTMLInputElement | null>(null);
  let canvas = $state<HTMLCanvasElement | null>(null);
  let previewUrl = $state<string | null>(value);
  let base64Output = $state<string>("");

  const TARGET_SIZE = 30;

  async function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0) {
      base64Output = "";
      previewUrl = value;
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
    } catch (e) {
      previewUrl = null;
      base64Output = "";
    } finally {
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

    canvas.width = TARGET_SIZE;
    canvas.height = TARGET_SIZE;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = img.width;
    let sourceHeight = img.height;

    const aspectRatio = img.width / img.height;

    if (aspectRatio > 1) {
      sourceWidth = img.height;
      sourceX = (img.width - img.height) / 2;
    } else if (aspectRatio < 1) {
      sourceHeight = img.width;
      sourceY = (img.height - img.width) / 2;
    }

    ctx.clearRect(0, 0, TARGET_SIZE, TARGET_SIZE);
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      TARGET_SIZE,
      TARGET_SIZE
    );

    base64Output = canvas.toDataURL("image/png", 0.9);
    previewUrl = base64Output;
  }
</script>

<span class="image-input-container">
  {#if previewUrl}
    <span class="flex gap center mb">
      Prévia:
      <img src={previewUrl} alt="Preview da foto de perfil" class="avatar-preview" />
    </span>
  {/if}
  <input
    type="file"
    accept="image/png, image/jpeg, image/webp"
    onchange={handleFileChange}
    bind:this={fileInput}
    class="input block w-full"
  />

  <input type="hidden" name={name} value={base64Output} />

  <canvas bind:this={canvas} style="display: none;"></canvas>
</span>