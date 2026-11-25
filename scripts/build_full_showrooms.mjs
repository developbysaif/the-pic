import sharp from 'sharp';

async function buildFullShowrooms() {
  // Crop the 446x325 raw image to remove the top black bar (top: 22, height: 303)
  const { data, info } = await sharp('public/images/showroom_raw.jpg')
    .extract({ left: 0, top: 20, width: 446, height: 305 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;  // 446
  const h = info.height; // 305
  const out = Buffer.from(data);

  function getPx(x, y) {
    const cx = Math.max(0, Math.min(w - 1, Math.round(x)));
    const cy = Math.max(0, Math.min(h - 1, Math.round(y)));
    const idx = (cy * w + cx) * 3;
    return [data[idx], data[idx + 1], data[idx + 2]];
  }

  function setPx(x, y, r, g, b) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = (y * w + x) * 3;
    out[idx] = Math.round(r);
    out[idx + 1] = Math.round(g);
    out[idx + 2] = Math.round(b);
  }

  // 1. Inpaint mouse cursor near x: 305, y: 75 (previously 95)
  for (let y = 70; y < 90; y++) {
    for (let x = 300; x < 315; x++) {
      const orig = getPx(x, y);
      if (orig[0] < 110) {
        const wall = getPx(x, 65);
        setPx(x, y, wall[0], wall[1], wall[2]);
      }
    }
  }

  // 2. Inpaint audio volume circle on lower chinos (y: 242 to 292, x: 198 to 248)
  for (let y = 242; y < 292; y++) {
    for (let x = 198; x < 248; x++) {
      const orig = getPx(x, y);
      if (orig[0] < 100 && orig[1] < 100 && orig[2] < 100) {
        const chino = getPx(x, 235);
        setPx(x, y, chino[0], chino[1], chino[2]);
      }
    }
  }

  // 3. Inpaint bottom UI bar (y > 288)
  for (let y = 288; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x >= 195 && x <= 248 && y < 298) continue; // shoes
      const fl = getPx(x, 280);
      setPx(x, y, fl[0], fl[1], fl[2]);
    }
  }

  // 4. Inpaint left and right video cards cleanly so our live cards float on clean travertine wall!
  // Left wall: x from 25 to 174, y from 95 to 225
  for (let y = 95; y < 225; y++) {
    const wallRef = getPx(175, y);
    for (let x = 20; x < 174; x++) {
      if (y > 215 && x < 45) continue; // preserve bench
      setPx(x, y, wallRef[0], wallRef[1], wallRef[2]);
    }
  }

  // Right wall: x from 272 to 445, y from 95 to 225
  for (let y = 95; y < 225; y++) {
    const wallRef = getPx(272, y);
    for (let x = 272; x < w; x++) {
      if (x > 395 && y < 170) {
        const orig = getPx(x, y);
        if (orig[0] < 140 || orig[1] < 140) continue; // preserve olive leaves
      }
      setPx(x, y, wallRef[0], wallRef[1], wallRef[2]);
    }
  }

  // Upscale the clean showroom base to 1400 x 950
  const cleanShowroomBase = await sharp(out, { raw: { width: w, height: h, channels: 3 } })
    .resize(1400, 950, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.8, m1: 0.4, m2: 1.2 })
    .jpeg({ quality: 96 })
    .toBuffer();

  await sharp(cleanShowroomBase).toFile('public/images/showroom_studio_master.jpg');
  console.log('Saved showroom_studio_master.jpg');

  // In 1400 x 950:
  // Center is x = 700
  // Chin is y ~ 265
  // Chinos waistband is y ~ 580
  // Shirt size: width ~ 325, height ~ 390
  // Left = 700 - 162 = 538
  // Top = 265
  for (let idx = 1; idx <= 9; idx++) {
    const shirtCutout = `public/images/shirt/shirt${idx}_cutout.png`;

    const fittedShirt = await sharp(shirtCutout)
      .resize(325, 390, { fit: 'fill' })
      .png()
      .toBuffer();

    await sharp(cleanShowroomBase)
      .composite([
        {
          input: fittedShirt,
          left: 538,
          top: 265,
        }
      ])
      .jpeg({ quality: 95 })
      .toFile(`public/images/showroom_outfit_${idx}.jpg`);

    console.log(`Generated showroom_outfit_${idx}.jpg`);
  }
}

buildFullShowrooms().catch(console.error);
