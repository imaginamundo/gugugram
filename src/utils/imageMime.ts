function bytesEqual(data: Uint8Array, offset: number, seq: number[]): boolean {
	return data.length >= offset + seq.length && seq.every((byte, i) => data[offset + i] === byte);
}

/**
 * Sniffs the MIME type from an image's magic bytes. The uploadthing CDN serves
 * PNG files with a `Content-Type: image/webp` header, so the declared header
 * can't be trusted when embedding the image as a data URI — resvg's data-URI
 * decoder uses the declared media type to pick the decoder.
 */
export function detectImageMime(data: Uint8Array): string {
	if (bytesEqual(data, 0, [0x89, 0x50, 0x4e, 0x47])) return "image/png";
	if (bytesEqual(data, 0, [0xff, 0xd8, 0xff])) return "image/jpeg";
	if (
		bytesEqual(data, 0, [0x52, 0x49, 0x46, 0x46]) &&
		bytesEqual(data, 8, [0x57, 0x45, 0x42, 0x50])
	)
		return "image/webp";
	if (bytesEqual(data, 0, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61])) return "image/gif";
	if (bytesEqual(data, 0, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])) return "image/gif";
	if (bytesEqual(data, 0, [0x42, 0x4d])) return "image/bmp";
	return "application/octet-stream";
}
