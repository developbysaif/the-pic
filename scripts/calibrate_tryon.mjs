import sharp from 'sharp';

async function calibrate() {
  const { data, info } = await sharp('public/images/showroom_raw.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;  // 446
  const h = info.height; // 325

  function getPx(x, y) {
    const cx = Math.max(0, Math.min(w - 1, Math.round(x)));
    const cy = Math.max(0, Math.min(h - 1, Math.round(y)));
    const idx = (cy * w + cx) * 3;
    return [data[idx], data[idx + 1], data[idx + 2]];
  }

  // Find chin: center x ~ 224, look from y = 90 down to 115
  console.log('Chin scan (x=224):');
  for (let y = 95; y <= 115; y++) {
    console.log(`y=${y}:`, getPx(224, y));
  }

  // Find cuffs/hands:
  // Left hand: x around 180..195, y around 200..225
  // Right hand: x around 250..265, y around 200..225
  console.log('Right hand scan (x=258):');
  for (let y = 200; y <= 225; y += 2) {
    console.log(`y=${y}:`, getPx(258, y));
  }

  // Waistband: x=224, y from 195 to 215
  console.log('Waist scan (x=224):');
  for (let y = 195; y <= 215; y += 2) {
    console.log(`y=${y}:`, getPx(224, y));
  }
}

calibrate().catch(console.error);
