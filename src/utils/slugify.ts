/**
 * Converts a community title to a URL-safe slug.
 * "Pixel Art & Games!" → "pixel-art-games"
 */
export function slugify(title: string): string {
	return title
		.normalize("NFD") // decompose accented chars
		.replace(/[\u0300-\u036f]/g, "") // strip diacritics
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "") // remove special chars
		.trim()
		.replace(/[\s]+/g, "-") // spaces → hyphens
		.replace(/-+/g, "-"); // collapse multiple hyphens
}
