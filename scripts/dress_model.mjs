import sharp from 'sharp';

async function testDressModel() {
  // 1. Extract head from showroom_raw.jpg: x: 204, top: 64, width: 40, height: 44
  const headBuffer = await sharp('public/images/showroom_raw.jpg')
    .extract({ left: 204, top: 64, width: 40, height: 44 })
    .resize(130, 142, { kernel: 'lanczos3' })
    .sharpen({ sigma: 1.0, m1: 0.5, m2: 2.0 })
    .png()
    .toBuffer();

  const headMaskSvg = Buffer.from(
    '<svg width="130" height="142"><ellipse cx="65" cy="65" rx="55" ry="65" fill="white" /></svg>'
  );
  const maskedHead = await sharp(headBuffer)
    .ensureAlpha()
    .composite([{ input: headMaskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 2. Extract chinos & shoes from showroom_raw.jpg
  const rawChinos = await sharp('public/images/showroom_raw.jpg')
    .extract({ left: 188, top: 200, width: 68, height: 118 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cw = rawChinos.info.width;
  const ch = rawChinos.info.height;
  const cData = Buffer.from(rawChinos.data);

  // Inpaint volume circle
  for (let y = 40; y < 85; y++) {
    for (let x = 10; x < 55; x++) {
      const idx = (y * cw + x) * 3;
      if (cData[idx] < 110 && cData[idx + 1] < 110 && cData[idx + 2] < 110) {
        const topPx = ((y - 20) * cw + x) * 3;
        cData[idx] = cData[topPx];
        cData[idx + 1] = cData[topPx + 1];
        cData[idx + 2] = cData[topPx + 2];
      }
    }
  }

  // Alpha mask for chinos
  const chinosDataWithAlpha = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const srcIdx = (y * cw + x) * 3;
      const dstIdx = (y * cw + x) * 4;
      chinosDataWithAlpha[dstIdx] = cData[srcIdx];
      chinosDataWithAlpha[dstIdx + 1] = cData[srcIdx + 1];
      chinosDataWithAlpha[dstIdx + 2] = cData[srcIdx + 2];

      const isSide = x < 6 || x > 61;
      const isFloor = y > 108 && (x < 10 || x > 58);
      if (isSide || isFloor) {
        chinosDataWithAlpha[dstIdx + 3] = 0;
      } else {
        chinosDataWithAlpha[dstIdx + 3] = 255;
      }
    }
  }

  const chinosUpscaled = await sharp(chinosDataWithAlpha, {
    raw: { width: cw, height: ch, channels: 4 },
  })
    .resize(230, 400, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.8, m1: 0.4, m2: 1.5 })
    .png()
    .toBuffer();

  // 3. Shirt 1 cutout
  const shirtResized = await sharp('public/images/shirt/shirt1_cutout.png')
    .resize(360, 460, { fit: 'fill' })
    .png()
    .toBuffer();

  // 4. Composite onto a transparent canvas: 500 wide x 880 tall
  await sharp({
    create: {
      width: 500,
      height: 880,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: chinosUpscaled, left: 135, top: 460 },
      { input: shirtResized, left: 70, top: 95 },
      { input: maskedHead, left: 185, top: 8 },
    ])
    .png()
    .toFile('public/images/test_model_dressed_1.png');

  console.log('Saved test_model_dressed_1.png');
}

testDressModel().catch(console.error);
