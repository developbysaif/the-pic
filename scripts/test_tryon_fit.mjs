import sharp from 'sharp';

async function testTryonFit() {
  // Let's create a high-definition model dressed in shirt 1 and shirt 7!
  // Target canvas for the model: 500 px wide x 900 px tall (transparent PNG)
  const CANVAS_W = 500;
  const CANVAS_H = 900;

  // Let's load the clean showroom background as reference for compositing full scene
  // 1. Showroom background: public/images/showroom_bg_clean.jpg (1600 x 1020)
  const showroomBg = await sharp('public/images/showroom_bg_clean.jpg').toBuffer();

  // Model in 1600 x 1020 showroom coordinates:
  // Showroom center is x = 800. Floor contact shadow is at y = 730..800.
  // In 446x285 raw coordinates:
  // Center is x = 223. Model is from x = 174 to 273 (width 99).
  // Model height: hair at y = 24 (raw 64), shoes at y = 278 (raw 318). Height = 254 raw px.
  // Scale factor to 1600x1020: 1600 / 446 = 3.587!
  // So model width = 99 * 3.587 = 355 px.
  // Model height = 254 * 3.587 = 910 px.
  // Model center X in 1600x1020: 800 px. Left = 800 - 178 = 622 px.
  // Top: hair at y ~ 75 px. Shoes at y ~ 985 px.

  // Let's extract model parts from showroom_raw.jpg with highest possible quality:
  const rawBuf = await sharp('public/images/showroom_raw.jpg').raw().toBuffer({ resolveWithObject: true });
  const rw = rawBuf.info.width;
  const rh = rawBuf.info.height;
  const rData = rawBuf.data;

  function getRawPx(x, y) {
    const cx = Math.max(0, Math.min(rw - 1, Math.round(x)));
    const cy = Math.max(0, Math.min(rh - 1, Math.round(y)));
    const idx = (cy * rw + cx) * 3;
    return [rData[idx], rData[idx + 1], rData[idx + 2]];
  }

  // 1. Head & Face (x: 202 to 246, y: 64 to 107) -> width 44, height 43
  const headW = 44;
  const headH = 43;
  const headData = Buffer.alloc(headW * headH * 4);
  for (let y = 0; y < headH; y++) {
    for (let x = 0; x < headW; x++) {
      const srcX = 202 + x;
      const srcY = 64 + y;
      const p = getRawPx(srcX, srcY);
      const idx = (y * headW + x) * 4;
      headData[idx] = p[0];
      headData[idx + 1] = p[1];
      headData[idx + 2] = p[2];

      // Alpha mask: hair and face
      const dx = (x - headW * 0.5) / (headW * 0.44);
      const dy = (y - headH * 0.48) / (headH * 0.50);
      const d = dx * dx + dy * dy;
      if (d <= 0.85) {
        headData[idx + 3] = 255;
      } else if (d <= 1.05) {
        headData[idx + 3] = Math.round(255 * (1.05 - d) / 0.20);
      } else {
        headData[idx + 3] = 0;
      }
    }
  }

  // Upscale head to width: 158 px, height: 154 px with Lanczos3 and subtle sharpening
  const upscaledHead = await sharp(headData, { raw: { width: headW, height: headH, channels: 4 } })
    .resize(158, 154, { kernel: 'lanczos3' })
    .sharpen({ sigma: 1.2, m1: 0.6, m2: 2.2 })
    .png()
    .toBuffer();

  // 2. Chinos & Shoes (x: 188 to 258, y: 204 to 318) -> width 70, height 114
  const chinosW = 70;
  const chinosH = 114;
  const chinosData = Buffer.alloc(chinosW * chinosH * 4);
  for (let y = 0; y < chinosH; y++) {
    const srcY = 204 + y;
    for (let x = 0; x < chinosW; x++) {
      const srcX = 188 + x;
      let p = getRawPx(srcX, srcY);
      const idx = (y * chinosW + x) * 4;

      // Inpaint volume circle (srcY between 265 and 312, srcX between 200 and 248)
      if (srcY >= 265 && srcY <= 312 && srcX >= 200 && srcX <= 248) {
        if (p[0] < 110 && p[1] < 110 && p[2] < 110) {
          // sample chinos from y = 255
          p = getRawPx(srcX, 255);
        }
      }

      chinosData[idx] = p[0];
      chinosData[idx + 1] = p[1];
      chinosData[idx + 2] = p[2];

      // Alpha: exclude wall outside pants
      // Pants width at top: x from 6 to 64
      // Pants width at bottom: x from 10 to 60
      const isWall = (x < 5 || x > 65);
      const isFloor = (y > 106 && (x < 8 || x > 62));
      if (isWall || isFloor) {
        chinosData[idx + 3] = 0;
      } else {
        chinosData[idx + 3] = 255;
      }
    }
  }

  const upscaledChinos = await sharp(chinosData, { raw: { width: chinosW, height: chinosH, channels: 4 } })
    .resize(251, 410, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.9, m1: 0.5, m2: 1.8 })
    .png()
    .toBuffer();

  // 3. Hands:
  // Left hand: x: 180 to 195, y: 205 to 226 (width 15, height 21)
  const leftHandBuf = await sharp('public/images/showroom_raw.jpg')
    .extract({ left: 180, top: 205, width: 16, height: 22 })
    .resize(58, 80, { kernel: 'lanczos3' })
    .sharpen({ sigma: 1.0, m1: 0.5, m2: 2.0 })
    .png()
    .toBuffer();

  // Right hand: x: 250 to 266, y: 205 to 226 (width 16, height 22)
  const rightHandBuf = await sharp('public/images/showroom_raw.jpg')
    .extract({ left: 250, top: 205, width: 16, height: 22 })
    .resize(58, 80, { kernel: 'lanczos3' })
    .sharpen({ sigma: 1.0, m1: 0.5, m2: 2.0 })
    .png()
    .toBuffer();

  // 4. Neck skin gradient SVG to sit naturally inside collar opening
  const neckSvg = Buffer.from(`
    <svg width="120" height="80">
      <defs>
        <linearGradient id="neckGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#C88E6A" />
          <stop offset="60%" stop-color="#B77D59" />
          <stop offset="100%" stop-color="#9C6847" />
        </linearGradient>
      </defs>
      <polygon points="20,0 100,0 75,70 45,70" fill="url(#neckGrad)" />
    </svg>
  `);
  const neckBuf = await sharp(neckSvg).png().toBuffer();

  // Composite for Shirt 1 and Shirt 7
  for (const shirtIdx of [1, 7]) {
    const shirtPath = `public/images/shirt/shirt${shirtIdx}_cutout.png`;

    // Shirt width: 355 px, height: 405 px
    const upscaledShirt = await sharp(shirtPath)
      .resize(355, 405, { fit: 'fill' })
      .png()
      .toBuffer();

    // Model canvas: 460 x 860
    // Layout:
    // Head: left: (460 - 158)/2 = 151, top: 0
    // Neck: left: (460 - 120)/2 = 170, top: 110
    // Shirt: left: (460 - 355)/2 = 52, top: 125
    // Hands: left hand: left: 45, top: 480; right hand: left: 355, top: 480
    // Chinos: left: (460 - 251)/2 = 104, top: 450

    const modelCutout = await sharp({
      create: {
        width: 460,
        height: 860,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      // 1. Chinos (lower body)
      { input: upscaledChinos, left: 104, top: 450 },
      // 2. Neck skin (under collar)
      { input: neckBuf, left: 170, top: 115 },
      // 3. Hands (under cuffs)
      { input: leftHandBuf, left: 42, top: 485 },
      { input: rightHandBuf, left: 360, top: 485 },
      // 4. Shirt (worn naturally, collar wraps neck, hem covers top of chinos)
      { input: upscaledShirt, left: 52, top: 125 },
      // 5. Head (above collar)
      { input: upscaledHead, left: 151, top: 0 }
    ])
    .png()
    .toBuffer();

    await sharp(modelCutout).toFile(`public/images/test_model_fitted_${shirtIdx}.png`);
    console.log(`Saved test_model_fitted_${shirtIdx}.png`);

    // Also composite on top of the clean showroom background to view full scene!
    // In showroom (1600 x 1020):
    // Center is x = 800. Left = 800 - 230 = 570. Top = 100.
    await sharp(showroomBg)
      .composite([
        {
          input: modelCutout,
          left: 570,
          top: 100
        }
      ])
      .jpeg({ quality: 95 })
      .toFile(`public/images/test_full_scene_${shirtIdx}.jpg`);

    console.log(`Saved test_full_scene_${shirtIdx}.jpg`);
  }
}

testTryonFit().catch(console.error);
