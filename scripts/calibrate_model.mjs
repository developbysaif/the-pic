/**
 * calibrate_model.mjs
 * Scan test_model.jpg to find precise body measurements for shirt placement
 */
import sharp from 'sharp';

const MODEL_SRC = 'public/images/test_model.jpg';

async function calibrate() {
  const { data, info } = await sharp(MODEL_SRC).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const ch = info.channels;

  const isWhite = (r, g, b) => r >= 235 && g >= 235 && b >= 235;
  const isSkin = (r, g, b) => r > 150 && r > g * 1.1 && r > b * 1.1 && g > 80;
  const isDark = (r, g, b) => r < 80 && g < 80 && b < 80;

  // Find non-white rows
  const rowHasContent = [];
  for (let y = 0; y < h; y++) {
    let hasContent = false;
    for (let x = 100; x < w - 100; x++) {
      const idx = (y * w + x) * ch;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (!isWhite(r, g, b)) { hasContent = true; break; }
    }
    rowHasContent.push(hasContent);
  }

  // Print content rows summary
  let inBlock = false;
  for (let y = 0; y < h; y++) {
    if (rowHasContent[y] && !inBlock) { console.log(`Content starts at y=${y}`); inBlock = true; }
    if (!rowHasContent[y] && inBlock) { console.log(`Content ends at y=${y-1}`); inBlock = false; }
  }
  if (inBlock) console.log(`Content ends at y=${h-1}`);

  // Sample specific y positions for color info
  const sampleYs = [150, 200, 300, 350, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500];
  console.log('\nColor samples at center X=600:');
  for (const y of sampleYs) {
    const idx = (y * w + 600) * ch;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    const type = isWhite(r,g,b) ? 'WHITE' : isSkin(r,g,b) ? 'SKIN' : isDark(r,g,b) ? 'DARK' : 'COLOR';
    console.log(`  y=${y}: RGB(${r},${g},${b}) [${type}]`);
  }

  // Find shirt region: scan for where black t-shirt starts and ends
  // Black t-shirt: dark pixels in mid-body region
  console.log('\nScanning for dark (t-shirt) region:');
  let darkStart = -1, darkEnd = -1;
  for (let y = 200; y < 1200; y++) {
    // Check center column band
    let darkCount = 0;
    for (let x = 400; x < 800; x++) {
      const idx = (y * w + x) * ch;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (isDark(r, g, b)) darkCount++;
    }
    if (darkCount > 50 && darkStart === -1) { darkStart = y; console.log(`  Dark (shirt) starts at y=${y}, darkPixels=${darkCount}`); }
    if (darkStart > 0 && darkCount < 10 && y > darkStart + 100) { darkEnd = y; console.log(`  Dark (shirt) ends at y=${y}, darkPixels=${darkCount}`); break; }
  }

  // Find shoulder width at y=400
  console.log('\nShoulder scan at various y:');
  for (const scanY of [300, 350, 380, 400, 420, 450]) {
    let leftX = -1, rightX = -1;
    for (let x = 0; x < w; x++) {
      const idx = (scanY * w + x) * ch;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (!isWhite(r, g, b)) { leftX = x; break; }
    }
    for (let x = w - 1; x >= 0; x--) {
      const idx = (scanY * w + x) * ch;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (!isWhite(r, g, b)) { rightX = x; break; }
    }
    if (leftX >= 0) console.log(`  y=${scanY}: left=${leftX}, right=${rightX}, width=${rightX-leftX}`);
  }
}

calibrate().catch(console.error);
