import sharp from 'sharp';

async function testPerfectFitting() {
  // 1. Load shirt1_cutout and remove the inner mannequin neck fabric inside the collar
  const { data, info } = await sharp('public/images/shirt/shirt1_cutout.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const out = Buffer.from(data);

  // In shirt1_cutout (1086 x 1448):
  // Inner collar neck region is around x: 440 to 650, y: 80 to 220
  // Inside the collar, the fabric is slightly darker beige / collar lining
  for (let y = 80; y < 220; y++) {
    for (let x = 440; x < 650; x++) {
      // Check if it's inside the collar inner ellipse
      const dx = (x - 543) / 80;
      const dy = (y - 145) / 55;
      if (dx * dx + dy * dy <= 1.0) {
        // Inner neck area -> make transparent so model's real neck shows through!
        out[(y * w + x) * 4 + 3] = 0;
      }
    }
  }

  // Also remove the white bottom shadow sliver at the bottom curve (y > 1370)
  for (let y = 1350; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const minVal = Math.min(out[idx], out[idx+1], out[idx+2]);
      if (minVal > 215) {
        out[idx + 3] = 0;
      }
    }
  }

  // Resize the fitted shirt to width: 342, height: 442
  const fittedShirt = await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .resize(342, 442, { fit: 'fill' })
    .png()
    .toBuffer();

  // Also in showroom_master.jpg, let's clean any black sweater edges that might peek outside the shirt!
  // Sweater peeking: left side at x: 520..548, y: 380..580
  const bgData = await sharp('public/images/showroom_master.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bgW = bgData.info.width;
  const bgH = bgData.info.height;
  const bgOut = Buffer.from(bgData.data);

  // Inpaint the black peeking sweater on left and right sides
  for (let y = 300; y < 650; y++) {
    // Left side outside shirt boundary (x: 515..545)
    const wallLeft = [bgData.data[(y * bgW + 500) * 3], bgData.data[(y * bgW + 500) * 3 + 1], bgData.data[(y * bgW + 500) * 3 + 2]];
    for (let x = 510; x < 542; x++) {
      const idx = (y * bgW + x) * 3;
      if (bgData.data[idx] < 60) {
        bgOut[idx] = wallLeft[0];
        bgOut[idx+1] = wallLeft[1];
        bgOut[idx+2] = wallLeft[2];
      }
    }
    // Right side outside shirt boundary (x: 810..830)
    const wallRight = [bgData.data[(y * bgW + 840) * 3], bgData.data[(y * bgW + 840) * 3 + 1], bgData.data[(y * bgW + 840) * 3 + 2]];
    for (let x = 812; x < 835; x++) {
      const idx = (y * bgW + x) * 3;
      if (bgData.data[idx] < 60) {
        bgOut[idx] = wallRight[0];
        bgOut[idx+1] = wallRight[1];
        bgOut[idx+2] = wallRight[2];
      }
    }
  }

  // Composite fitted shirt onto cleaned showroom background
  const cleanedBg = await sharp(bgOut, { raw: { width: bgW, height: bgH, channels: 3 } })
    .jpeg({ quality: 95 })
    .toBuffer();

  await sharp(cleanedBg)
    .composite([
      {
        input: fittedShirt,
        left: 507,
        top: 242,
      }
    ])
    .toFile('public/images/test_model_shirt1_v2.jpg');

  console.log('Saved test_model_shirt1_v2.jpg');
}

testPerfectFitting().catch(console.error);
