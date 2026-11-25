import sharp from 'sharp';

async function buildRealisticModel() {
  // Let's create a beautifully tailored model for each of the 9 shirts
  // Showroom base: 1600 x 1020
  const showroomBg = await sharp('public/images/showroom_bg_clean.jpg').toBuffer();

  // 1. Prepare the high-definition handsome model head & neck from model_portrait_1.jpg
  // Head in model_portrait_1.jpg: 1200 x 1800
  // Face center is x: 600, chin at y: 780, neck down to y: 1050
  // Let's extract head and neck: left: 340, top: 40, width: 520, height: 950
  const { data: headRaw, info: headInfo } = await sharp('public/images/model_portrait_1.jpg')
    .extract({ left: 340, top: 40, width: 520, height: 950 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const hw = headInfo.width;
  const hh = headInfo.height;
  const headMatte = Buffer.from(headRaw);

  // Clean matte for head & neck:
  // Black background has r < 30, g < 30, b < 30
  for (let y = 0; y < hh; y++) {
    for (let x = 0; x < hw; x++) {
      const idx = (y * hw + x) * 4;
      const r = headRaw[idx];
      const g = headRaw[idx + 1];
      const b = headRaw[idx + 2];
      const maxC = Math.max(r, g, b);

      // Distance from center of head (x=260, y=420)
      const dx = (x - 260) / 220;
      const dy = (y - 420) / 450;
      const dist = dx * dx + dy * dy;

      if (dist > 1.2 || (maxC < 30 && y < hh * 0.7)) {
        headMatte[idx + 3] = 0;
      } else if (dist > 0.95) {
        const t = (dist - 0.95) / 0.25;
        const alpha = Math.round(255 * Math.max(0, 1 - t));
        headMatte[idx + 3] = Math.min(headMatte[idx + 3], alpha);
      }

      // Soft vertical taper at bottom of neck (y > 800) so it blends seamlessly inside shirt collar
      if (y > 800) {
        const t = (y - 800) / (hh - 800);
        headMatte[idx + 3] = Math.round(headMatte[idx + 3] * Math.max(0, 1 - t * t));
      }
    }
  }

  // Resize head to target size for the showroom model: width 170, height 310
  const modelHead = await sharp(headMatte, { raw: { width: hw, height: hh, channels: 4 } })
    .resize(170, 310, { fit: 'fill', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.8, m1: 0.4, m2: 1.5 })
    .png()
    .toBuffer();

  // 2. Prepare the clean chinos & shoes from showroom_raw.jpg
  // x: 188 to 258, y: 202 to 318 (width 70, height 116)
  const { data: chinosRaw, info: chinosInfo } = await sharp('public/images/showroom_raw.jpg')
    .extract({ left: 188, top: 202, width: 70, height: 116 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cw = chinosInfo.width;
  const ch = chinosInfo.height;
  const chinosMatte = Buffer.from(chinosRaw);

  // Inpaint volume circle on lower chinos (srcX: 12..58, srcY: 60..108 relative to crop)
  for (let y = 60; y < 108; y++) {
    for (let x = 12; x < 58; x++) {
      const idx = (y * cw + x) * 4;
      if (chinosRaw[idx] < 110 && chinosRaw[idx + 1] < 110 && chinosRaw[idx + 2] < 110) {
        const topIdx = ((y - 25) * cw + x) * 4;
        chinosMatte[idx] = chinosRaw[topIdx];
        chinosMatte[idx + 1] = chinosRaw[topIdx + 1];
        chinosMatte[idx + 2] = chinosRaw[topIdx + 2];
      }
    }
  }

  // Soft feathered alpha mask for chinos silhouette
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const idx = (y * cw + x) * 4;
      // Leg bounds:
      // at top (y=0): x between 6 and 64
      // at knees (y=50): x between 8 and 62
      // at ankles (y=95): x between 10 and 60
      const leftEdge = 6 + (y / ch) * 4;
      const rightEdge = 64 - (y / ch) * 4;

      if (x < leftEdge - 3 || x > rightEdge + 3) {
        chinosMatte[idx + 3] = 0;
      } else if (x < leftEdge) {
        const t = (x - (leftEdge - 3)) / 3;
        chinosMatte[idx + 3] = Math.round(255 * t);
      } else if (x > rightEdge) {
        const t = ((rightEdge + 3) - x) / 3;
        chinosMatte[idx + 3] = Math.round(255 * t);
      } else {
        chinosMatte[idx + 3] = 255;
      }

      // Shoes bottom feathering onto floor (y > 110)
      if (y > 110) {
        const t = (y - 110) / 6;
        chinosMatte[idx + 3] = Math.round(chinosMatte[idx + 3] * Math.max(0, 1 - t * 0.3));
      }
    }
  }

  // Upscale chinos to width: 280, height: 464
  const modelChinos = await sharp(chinosMatte, { raw: { width: cw, height: ch, channels: 4 } })
    .resize(280, 464, { fit: 'fill', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.8, m1: 0.4, m2: 1.5 })
    .png()
    .toBuffer();

  // 3. Prepare realistic hands emerging from cuffs
  // Hands from showroom_raw.jpg with feathered alpha
  const leftHand = await sharp('public/images/showroom_raw.jpg')
    .extract({ left: 180, top: 206, width: 16, height: 21 })
    .resize(52, 68, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.8, m1: 0.4, m2: 1.5 })
    .png()
    .toBuffer();

  const rightHand = await sharp('public/images/showroom_raw.jpg')
    .extract({ left: 250, top: 206, width: 16, height: 21 })
    .resize(52, 68, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.8, m1: 0.4, m2: 1.5 })
    .png()
    .toBuffer();

  // 4. Generate all 9 bespoke fitted models!
  // Canvas dimensions for the transparent model: 480 wide x 920 tall
  for (let idx = 1; idx <= 9; idx++) {
    const shirtCutout = `public/images/shirt/shirt${idx}_cutout.png`;

    // Shirt size: width 380, height 470
    const fittedShirt = await sharp(shirtCutout)
      .resize(380, 470, { fit: 'fill' })
      .png()
      .toBuffer();

    // Composite Model Layers:
    // 1. Chinos trousers: left: (480 - 280)/2 = 100, top: 456
    // 2. Left hand: left: 40, top: 495
    // 3. Right hand: left: 388, top: 495
    // 4. Head & Neck: left: (480 - 170)/2 = 155, top: 0
    // 5. Shirt: left: (480 - 380)/2 = 50, top: 120 (collar wraps over neck, hem covers top of chinos)
    const dressedModel = await sharp({
      create: {
        width: 480,
        height: 920,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      { input: modelChinos, left: 100, top: 456 },
      { input: leftHand, left: 38, top: 495 },
      { input: rightHand, left: 390, top: 495 },
      { input: modelHead, left: 155, top: 0 },
      { input: fittedShirt, left: 50, top: 120 }
    ])
    .png()
    .toBuffer();

    // Save transparent model PNG: public/images/model_worn_${idx}.png
    await sharp(dressedModel).toFile(`public/images/model_worn_${idx}.png`);
    console.log(`Saved model_worn_${idx}.png`);

    // Also composite onto static showroom background for instant review
    await sharp(showroomBg)
      .composite([
        {
          input: dressedModel,
          left: 560,
          top: 60
        }
      ])
      .jpeg({ quality: 95 })
      .toFile(`public/images/showroom_worn_${idx}.jpg`);

    console.log(`Saved showroom_worn_${idx}.jpg`);
  }
}

buildRealisticModel().catch(console.error);
