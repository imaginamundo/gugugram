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

export interface CropperConfig {
	imageElement: HTMLImageElement | null;
	imageSize: number;
	imageResize: boolean;
}

export function imageCropper(config: CropperConfig) {
	return (canvas: HTMLCanvasElement) => {
		const { imageElement, imageSize, imageResize } = config;

		if (!imageElement) return;

		function drawCrop() {
			if (!imageElement || !imageElement.complete || imageElement.naturalWidth === 0) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			canvas.width = imageSize;
			canvas.height = imageSize;
			ctx.imageSmoothingEnabled = false;

			const nw = imageElement.naturalWidth;
			const nh = imageElement.naturalHeight;

			let options: CanvasOptions;

			if (imageResize) {
				const smallest = Math.min(nw, nh);
				const sx = (nw - smallest) / 2;
				const sy = (nh - smallest) / 2;
				options = [sx, sy, smallest, smallest, 0, 0, imageSize, imageSize];
			} else {
				const sx = Math.floor((nw - imageSize) / 2);
				const sy = Math.floor((nh - imageSize) / 2);
				options = [sx, sy, imageSize, imageSize, 0, 0, imageSize, imageSize];
			}

			ctx.clearRect(0, 0, imageSize, imageSize);
			ctx.drawImage(imageElement, ...options);
		}

		if (imageElement.complete) {
			drawCrop();
		} else {
			imageElement.onload = drawCrop;
		}
	};
}

export function downloadImageFromSrc(imageSrc: string) {
	if (!imageSrc) return;
	const a = document.createElement("a");
	a.href = imageSrc;
	a.download = `gugugram.com_${Date.now()}.png`;
	document.body.appendChild(a);
	a.click();
	a.remove();
}

export function getCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
	return new Promise((resolve) => {
		canvas.toBlob((blob) => resolve(blob), "image/webp", 1.0);
	});
}
