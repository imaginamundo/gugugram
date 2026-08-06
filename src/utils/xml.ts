const XML_ENTITIES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&apos;",
};

/** Escapes text before it is interpolated into an XML document. */
export function escapeXml(value: string) {
	return value.replace(/[&<>"']/g, (char) => XML_ENTITIES[char]);
}
