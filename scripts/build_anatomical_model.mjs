import sharp from 'sharp';

async function buildAnatomicalModel() {
  const CANVAS_W = 600;
  const CANVAS_H = 960;

  // 1. Prepare clean Head & Neck from model_portrait_1.jpg
  // Head in portrait: center face x=600, chin y=780, neck y=1050
  const headCrop = await sharp('public/images/model_portrait_1.jpg')
    .extract({ left: 360, top: 80, width: 480, height: 860 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const hw = headCrop.info.width;
  const hh = headCrop.info.height;
  const headData = Buffer.alloc(hw * hh * 4);

  for (let y = 0; y < hh; y++) {
    for (let x = 0; x < hw; x++) {
      const srcIdx = (y * hw + x) * 3;
      const dstIdx = (y * hw + x) * 4;
      const r = headCrop.data[srcIdx];
      const g = headCrop.data[srcIdx + 1];
      const b = headCrop.data[srcIdx + 2];
      const maxC = Math.max(r, g, b);

      headData[dstIdx] = r;
      headData[dstIdx + 1] = g;
      headData[dstIdx + 2] = b;

      // Distance from center of face (x = 240, y = 380)
      const dx = (x - 240) / 195;
      const dy = (y - 380) / 410;
      const d = dx * dx + dy * dy;

      if (d > 1.15 || (maxC < 30 && y < hh * 0.72)) {
        headData[dstIdx + 3] = 0;
      } else if (d > 0.95) {
        headData[dstIdx + 3] = Math.round(255 * (1.15 - d) / 0.20);
      } else {
        headData[dstIdx + 3] = 255;
      }

      // Smooth taper at bottom of neck (y > 700)
      if (y > 700) {
        const t = (y - 700) / (hh - 700);
        headData[dstIdx + 3] = Math.round(headData[dstIdx + 3] * Math.max(0, 1 - t * t));
      }
    }
  }

  // Target head dimensions: 130 wide x 190 tall
  const headFinal = await sharp(headData, { raw: { width: hw, height: hh, channels: 4 } })
    .resize(130, 190, { fit: 'fill', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.8, m1: 0.4, m2: 1.5 })
    .png()
    .toBuffer();

  // 2. Prepare clean chinos trousers and shoes from showroom_raw.jpg
  // In showroom_raw.jpg, trousers are from x: 190 to 255, y: 204 to 318
  const chinosCrop = await sharp('public/images/showroom_raw.jpg')
    .extract({ left: 190, top: 204, width: 66, height: 114 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cw = chinosCrop.info.width;
  const ch = chinosCrop.info.height;
  const chinosData = Buffer.alloc(cw * ch * 4);

  // Inpaint volume circle (y: 60..106, x: 10..56)
  for (let y = 60; y < 106; y++) {
    for (let x = 10; x < 56; x++) {
      const idx = (y * cw + x) * 3;
      if (chinosCrop.data[idx] < 110 && chinosCrop.data[idx + 1] < 110 && chinosCrop.data[idx + 2] < 110) {
        const topIdx = ((y - 26) * cw + x) * 3;
        chinosCrop.data[idx] = chinosCrop.data[topIdx];
        chinosCrop.data[idx + 1] = chinosCrop.data[topIdx + 1];
        chinosCrop.data[idx + 2] = chinosCrop.data[topIdx + 2];
      }
    }
  }

  // Alpha mask with natural edge feathering
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const srcIdx = (y * cw + x) * 3;
      const dstIdx = (y * cw + x) * 4;
      chinosData[dstIdx] = chinosCrop.data[srcIdx];
      chinosData[dstIdx + 1] = chinosCrop.data[srcIdx + 1];
      chinosData[dstIdx + 2] = chinosCrop.data[srcIdx + 2];

      const leftMargin = 5 + (y / ch) * 3;
      const rightMargin = 61 - (y / ch) * 3;

      if (x < leftMargin - 2 || x > rightMargin + 2) {
        chinosData[dstIdx + 3] = 0;
      } else if (x < leftMargin) {
        chinosData[dstIdx + 3] = Math.round(255 * (x - (leftMargin - 2)) / 2);
      } else if (x > rightMargin) {
        chinosData[dstIdx + 3] = Math.round(255 * ((rightMargin + 2) - x) / 2);
      } else {
        chinosData[dstIdx + 3] = 255;
      }
    }
  }

  // Target chinos: width 260, height 330
  const chinosFinal = await sharp(chinosData, { raw: { width: cw, height: ch, channels: 4 } })
    .resize(260, 330, { fit: 'fill', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.8, m1: 0.4, m2: 1.5 })
    .png()
    .toBuffer();

  // 3. Hands
  const leftHand = await sharp('public/images/showroom_raw.jpg')
    .extract({ left: 180, top: 206, width: 15, height: 20 })
    .resize(42, 65, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const rightHand = await sharp('public/images/showroom_raw.jpg')
    .extract({ left: 251, top: 206, width: 15, height: 20 })
    .resize(42, 65, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  // 4. Build models for shirt 1 and shirt 7
  const showroomBg = await sharp('public/images/showroom_bg_clean.jpg').toBuffer();

  for (const idx of [1, 7]) {
    const shirtCutout = `public/images/shirt/shirt${idx}_cutout.png`;

    // Resize shirt: width 410, height 500
    const fittedShirt = await sharp(shirtCutout)
      .resize(410, 500, { fit: 'fill' })
      .png()
      .toBuffer();

    // Composite:
    // Canvas: 600 x 960
    // Head: left: (600 - 130)/2 = 235, top: 35 (chin at ~175)
    // Chinos: left: (600 - 260)/2 = 170, top: 625 (shoes at 955)
    // Left hand: left: 95, top: 650
    // Right hand: left: 462, top: 650
    // Shirt: left: (600 - 410)/2 = 95, top: 165 (collar wraps neck, cuffs at 665, hem at 665)
    const model = await sharp({
      create: {
        width: CANVAS_W,
        height: CANVAS_H,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      // 1. Chinos (lower layer)
      { input: chinosFinal, left: 170, top: 625 },
      // 2. Hands (under cuffs)
      { input: leftHand, left: 96, top: 650 },
      { input: rightHand, left: 462, top: 650 },
      // 3. Head & Neck
      { input: headFinal, left: 235, top: 35 },
      // 4. Shirt (worn over neck and over waist)
      { input: fittedShirt, left: 95, top: 165 }
    ])
    .png()
    .toBuffer();

    await sharp(model).toFile(`public/images/model_anatomical_${idx}.png`);
    console.log(`Saved model_anatomical_${idx}.png`);

    // Review on showroom background
    // In 1600 x 1020 showroom:
    // Center is x = 800. Left = 800 - 300 = 500. Top = 50.
    await sharp(showroomBg)
      .composite([
        {
          input: model,
          left: 500,
          top: 45
        }
      ])
      .jpeg({ quality: 95 })
      .toFile(`public/images/showroom_anatomical_${idx}.jpg`);

    console.log(`Saved showroom_anatomical_${idx}.jpg`);
  }
}

buildAnatomicalModel().catch(console.error);
