export const OG_CARD_WIDTH = 1280;
export const OG_CARD_HEIGHT = 640;

// Post images are always hosted on the uploadthing CDN. Fetching any other
// host here would be an SSRF vector, so keep the allowlist tight.
export const ALLOWED_IMAGE_HOSTS = /(^|\.)ufs\.sh$|(^|\.)utfs\.io$/;

export function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export function buildOgCardSvg(imageHref: string, username: string): string {
	const safeHref = escapeXml(imageHref);
	const safeUsername = escapeXml(username);

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_CARD_WIDTH}" height="${OG_CARD_HEIGHT}">
  <defs>
    <linearGradient id="title-bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000080"/>
      <stop offset="1" stop-color="#1084d0"/>
    </linearGradient>
  </defs>

  <!-- desktop background -->
  <rect width="1280" height="640" fill="#c0c0c0"/>

  <!-- window frame: raised bevel (top/left light, bottom/right dark) -->
  <rect x="40" y="40" width="1200" height="560" fill="#c0c0c0"/>
  <rect x="40" y="40" width="1200" height="1" fill="#dfdfdf"/>
  <rect x="40" y="40" width="1" height="560" fill="#dfdfdf"/>
  <rect x="40" y="599" width="1200" height="1" fill="#0a0a0a"/>
  <rect x="1239" y="40" width="1" height="560" fill="#0a0a0a"/>
  <rect x="41" y="41" width="1198" height="2" fill="#ffffff"/>
  <rect x="41" y="41" width="2" height="558" fill="#ffffff"/>
  <rect x="41" y="597" width="1198" height="2" fill="#808080"/>
  <rect x="1237" y="41" width="2" height="558" fill="#808080"/>

  	<!-- title bar -->
  	<rect x="44" y="44" width="1192" height="44" fill="url(#title-bar)"/>
  	<text x="56" y="74" font-size="24" font-weight="bold" fill="#ffffff">Gugugram - Imagem de ${safeUsername}</text>

	<!-- 1:1 image with the site's image-border (gray top/left, white bottom/right),
	     filling down to the window body bottom -->
	<rect x="52" y="109" width="480" height="1" fill="#808080"/>
	<rect x="52" y="109" width="1" height="480" fill="#808080"/>
	<rect x="52" y="588" width="480" height="1" fill="#ffffff"/>
	<rect x="531" y="109" width="1" height="480" fill="#ffffff"/>
	<rect x="53" y="110" width="478" height="478" fill="#000000"/>
	<image href="${safeHref}" x="53" y="110" width="478" height="478" preserveAspectRatio="xMidYMid slice" image-rendering="optimizeSpeed"/>

  <!-- profile header, matching the site's post page -->
  <text x="552" y="160" font-size="44" font-weight="bold" fill="#222222" letter-spacing="1">${safeUsername}</text>
  <text x="552" y="210" font-size="24" fill="#222222">Compartilhou uma foto!</text>

	<!-- comments-style sunken field, bottom-aligned with the loaded image -->
	<rect x="552" y="489" width="664" height="100" fill="#c0c0c0"/>
	<rect x="552" y="489" width="664" height="1" fill="#808080"/>
	<rect x="552" y="489" width="1" height="100" fill="#808080"/>
	<rect x="552" y="490" width="664" height="2" fill="#0a0a0a"/>
	<rect x="553" y="489" width="2" height="100" fill="#0a0a0a"/>
	<rect x="552" y="588" width="664" height="1" fill="#ffffff"/>
	<rect x="1215" y="489" width="1" height="100" fill="#ffffff"/>
	<rect x="552" y="586" width="664" height="2" fill="#dfdfdf"/>
	<rect x="1213" y="489" width="2" height="100" fill="#dfdfdf"/>
	<rect x="555" y="492" width="658" height="94" fill="#ffffff"/>
	<text x="580" y="550" font-size="22" fill="#222222">Veja a foto e os comentários na página!</text>
  </svg>`;
}
