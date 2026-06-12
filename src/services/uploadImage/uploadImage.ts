import { imageSize } from "image-size";
import { storage } from "@infra/storage";
import { ImageUploadErrors } from "@customTypes/errors";

const ALLOWED_DIMENSIONS = ["5x5", "10x10", "15x15", "30x30", "60x60"];

export async function checkImage(
	file: File,
	sizeLimit = 60000,
	allowedDimension = ALLOWED_DIMENSIONS,
) {
	if (file.size > sizeLimit) {
		throw new Error(ImageUploadErrors.FILE_TOO_LARGE);
	}

	const arrayBuffer = await file.arrayBuffer();
	const dimensions = imageSize(Buffer.from(arrayBuffer));

	if (!dimensions || dimensions.width === undefined || dimensions.height === undefined) {
		throw new Error(ImageUploadErrors.INVALID_IMAGE_FILE);
	}

	const isAllowedDimension = allowedDimension.includes(`${dimensions.width}x${dimensions.height}`);

	if (!isAllowedDimension) {
		throw new Error(ImageUploadErrors.INVALID_IMAGE_DIMENSIONS);
	}
}

export async function uploadImage(file: File): Promise<string> {
	const upload = await storage.upload(file);

	if (!upload.data?.ufsUrl) {
		throw new Error(ImageUploadErrors.UPLOAD_FAILED);
	}

	return upload.data.ufsUrl;
}
