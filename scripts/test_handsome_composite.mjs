import sharp from 'sharp';

async function testHandsomeComposite() {
  // Let's cut out the head and neck of model_portrait_1.jpg
  // Dimensions of model_portrait_1.jpg:
  const headMeta = await sharp('public/images/model_portrait_1.jpg').metadata();
  console.log('Head meta:', headMeta);

  // Model's face and neck is roughly in the center-top
  // Let's extract head and neck from x: 250..950, y: 50..850 (roughly 700x800)
  const headCrop = await sharp('public/images/model_portrait_1.jpg')
    .extract({
      left: Math.floor(headMeta.width * 0.22),
      top: Math.floor(headMeta.height * 0.05),
      width: Math.floor(headMeta.width * 0.56),
      height: Math.floor(headMeta.height * 0.55),
    })
    .resize(220, 240, { fit: 'cover' })
    .toBuffer();

  // Let's create an alpha mask for the head (oval/soft feather)
  const maskSvg = `
    <svg width="220" height="240">
      <defs>
        <radialGradient id="feather" cx="50%" cy="45%" r="48%">
          <stop offset="70%" stop-color="#FFFFFF" stop-opacity="1" />
          <stop offset="90%" stop-color="#FFFFFF" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="110" cy="115" rx="90" ry="110" fill="url(#feather)" />
    </svg>
  `;

  const maskedHead = await sharp(headCrop)
    .ensureAlpha()
    .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Get chinos cutout from test_chinos.jpg
  const chinosMeta = await sharp('public/images/test_chinos.jpg').metadata();
  const chinosCrop = await sharp('public/images/test_chinos.jpg')
    .extract({
      left: Math.floor(chinosMeta.width * 0.35),
      top: Math.floor(chinosMeta.height * 0.48),
      width: Math.floor(chinosMeta.width * 0.32),
      height: Math.floor(chinosMeta.height * 0.27),
    })
    .resize(210, 280, { fit: 'fill' })
    .png()
    .toBuffer();

  // Shirt resized
  const shirtResized = await sharp('public/images/shirt/shirt1_cutout.png')
    .resize(380, 480, { fit: 'fill' })
    .png()
    .toBuffer();

  // Create clean showroom background canvas 1000 x 900
  const canvasW = 1000;
  const canvasH = 900;

  // Let's composite:
  // 1. Chinos at center-bottom: left: (1000 - 210)/2 = 395, top: 580
  // 2. Head at center-top: left: (1000 - 220)/2 = 390, top: 120
  // 3. Shirt overlapping head neck and chinos waist: left: (1000 - 380)/2 = 310, top: 220
  await sharp('public/images/showroom_background.png')
    .resize(canvasW, canvasH)
    .composite([
      { input: chinosCrop, left: 395, top: 560 },
      { input: maskedHead, left: 390, top: 105 },
      { input: shirtResized, left: 310, top: 200 },
    ])
    .jpeg({ quality: 95 })
    .toFile('public/images/test_handsome_model.jpg');

  console.log('Saved test_handsome_model.jpg');
}

testHandsomeComposite().catch(console.error);
