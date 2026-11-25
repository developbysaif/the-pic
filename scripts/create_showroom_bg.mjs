import sharp from 'sharp';

async function testComposite() {
  const CANVAS_W = 1200;
  const CANVAS_H = 800;

  // 1. Create a luxury architectural showroom background:
  // Skylight at top, warm plaster wall, concrete floor with light reflection
  const showroomSvg = `
    <svg width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Skylight Sky Gradient -->
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7BB4E3" />
          <stop offset="40%" stop-color="#A5CEF0" />
          <stop offset="85%" stop-color="#E2EEFA" />
          <stop offset="100%" stop-color="#FFFFFF" />
        </linearGradient>

        <!-- Wall Warm Travertine Gradient -->
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#CBBCAE" />
          <stop offset="25%" stop-color="#DFD4C7" />
          <stop offset="70%" stop-color="#EBE3D7" />
          <stop offset="100%" stop-color="#E3D7C9" />
        </linearGradient>

        <!-- Floor Concrete Ambient Light -->
        <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#D9CDBD" />
          <stop offset="40%" stop-color="#EADFCF" />
          <stop offset="80%" stop-color="#E4D6C4" />
          <stop offset="100%" stop-color="#D5C5B0" />
        </linearGradient>

        <!-- Soft Sunlight Beam from Skylight -->
        <linearGradient id="sunBeam" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stop-color="#FFFDF8" stop-opacity="0.45" />
          <stop offset="60%" stop-color="#FFF7EA" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#FFF5E5" stop-opacity="0" />
        </linearGradient>

        <!-- Model Ground Shadow -->
        <radialGradient id="modelShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#4A3F35" stop-opacity="0.45" />
          <stop offset="45%" stop-color="#6E5D4E" stop-opacity="0.25" />
          <stop offset="80%" stop-color="#A69482" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Background Wall -->
      <rect x="0" y="0" width="${CANVAS_W}" height="560" fill="url(#wallGrad)" />

      <!-- Floor -->
      <rect x="0" y="560" width="${CANVAS_W}" height="240" fill="url(#floorGrad)" />
      <!-- Floor Baseboard / shadow line -->
      <line x1="0" y1="560" x2="${CANVAS_W}" y2="560" stroke="#C2B29F" stroke-width="2" />
      <line x1="0" y1="561" x2="${CANVAS_W}" y2="561" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1" />

      <!-- Architectural Recessed Skylight Frame -->
      <path d="M 140 0 L 260 110 L 940 110 L 1060 0 Z" fill="#D3C5B5" />
      <path d="M 260 110 L 280 125 L 920 125 L 940 110 Z" fill="#B5A492" />
      <path d="M 140 0 L 280 125 L 920 125 L 1060 0 Z" fill="url(#skyGrad)" stroke="#4A4540" stroke-width="3" />

      <!-- Skylight Steel Mullions / Glass Panes -->
      <!-- Horizontal mullion -->
      <line x1="210" y1="62" x2="990" y2="62" stroke="#48423C" stroke-width="3.5" />
      <!-- Vertical mullions (perspective angled) -->
      <line x1="280" y1="125" x2="140" y2="0" stroke="#48423C" stroke-width="4" />
      <line x1="410" y1="125" x2="330" y2="0" stroke="#48423C" stroke-width="3" />
      <line x1="530" y1="125" x2="510" y2="0" stroke="#48423C" stroke-width="3" />
      <line x1="600" y1="125" x2="600" y2="0" stroke="#48423C" stroke-width="3.5" />
      <line x1="670" y1="125" x2="690" y2="0" stroke="#48423C" stroke-width="3" />
      <line x1="790" y1="125" x2="870" y2="0" stroke="#48423C" stroke-width="3" />
      <line x1="920" y1="125" x2="1060" y2="0" stroke="#48423C" stroke-width="4" />

      <!-- Soft Sunbeam down the wall -->
      <polygon points="260,110 940,110 1100,780 100,780" fill="url(#sunBeam)" />

      <!-- Minimalist Stone Travertine Bench on Left -->
      <rect x="50" y="520" width="130" height="24" rx="2" fill="#DFD4C6" stroke="#C7B9A7" stroke-width="1.5" />
      <rect x="65" y="544" width="28" height="42" fill="#CEBFAC" />
      <rect x="135" y="544" width="28" height="42" fill="#C2B29D" />

      <!-- Floor Contact Shadow for model -->
      <ellipse cx="${CANVAS_W / 2}" cy="740" rx="140" ry="24" fill="url(#modelShadow)" />
      <ellipse cx="${CANVAS_W / 2}" cy="735" rx="90" ry="12" fill="#3D3227" fill-opacity="0.25" />
    </svg>
  `;

  await sharp(Buffer.from(showroomSvg))
    .png()
    .toFile('public/images/showroom_background.png');

  console.log('Generated showroom_background.png');
}

testComposite().catch(console.error);
