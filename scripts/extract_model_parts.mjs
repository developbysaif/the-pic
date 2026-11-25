import sharp from 'sharp';

async function extractModelParts() {
  const { data, info } = await sharp('public/images/showroom_raw.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;

  function getPx(x, y) {
    const idx = (y * w + x) * 3;
    return [data[idx], data[idx + 1], data[idx + 2]];
  }

  // 1. Extract Head (x: 200 to 246, y: 65 to 116)
  const headW = 56;
  const headH = 55;
  const headData = Buffer.alloc(headW * headH * 4);

  for (let y = 0; y < headH; y++) {
    const srcY = 64 + y;
    for (let x = 0; x < headW; x++) {
      const srcX = 196 + x;
      const px = getPx(srcX, srcY);
      const dstIdx = (y * headW + x) * 4;
      headData[dstIdx] = px[0];
      headData[dstIdx + 1] = px[1];
      headData[dstIdx + 2] = px[2];

      // Circular/oval mask around head
      const cx = (x - headW / 2) / (headW * 0.44);
      const cy = (y - headH * 0.48) / (headH * 0.52);
      const dist = cx * cx + cy * cy;
      if (dist <= 0.85) {
        headData[dstIdx + 3] = 255;
      } else if (dist <= 1.05) {
        const t = (dist - 0.85) / 0.20;
        headData[dstIdx + 3] = Math.round(255 * (1 - t));
      } else {
        headData[dstIdx + 3] = 0;
      }
    }
  }

  // Upscale head with lanczos3
  await sharp(headData, { raw: { width: headW, height: headH, channels: 4 } })
    .resize(headW * 4, headH * 4, { kernel: 'lanczos3' })
    .sharpen({ sigma: 1.2, m1: 0.6, m2: 2.0 })
    .png()
    .toFile('public/images/model_head.png');

  console.log('Saved model_head.png');

  // 2. Extract Legs & Chinos (x: 190 to 255, y: 202 to 318)
  const legsW = 68;
  const legsH = 118;
  const legsData = Buffer.alloc(legsW * legsH * 4);

  for (let y = 0; y < legsH; y++) {
    const srcY = 202 + y;
    for (let x = 0; x < legsW; x++) {
      const srcX = 189 + x;
      const px = getPx(srcX, srcY);
      const dstIdx = (y * legsW + x) * 4;

      legsData[dstIdx] = px[0];
      legsData[dstIdx + 1] = px[1];
      legsData[dstIdx + 2] = px[2];

      // Alpha: exclude wall and floor
      // Legs are beige chinos: check difference with adjacent floor/wall
      const isWall = srcY < 235 && (srcX < 196 || srcX > 250);
      const isFloor = srcY >= 235 && (srcX < 192 || srcX > 252);
      if (isWall || isFloor) {
        legsData[dstIdx + 3] = 0;
      } else {
        legsData[dstIdx + 3] = 255;
      }
    }
  }

  await sharp(legsData, { raw: { width: legsW, height: legsH, channels: 4 } })
    .resize(legsW * 4, legsH * 4, { kernel: 'lanczos3' })
    .sharpen({ sigma: 1.0, m1: 0.5, m2: 1.5 })
    .png()
    .toFile('public/images/model_legs.png');

  console.log('Saved model_legs.png');
}

extractModelParts().catch(console.error);
