import sharp from 'sharp';

async function generateSeamlessShowroomAndModel() {
  const { data, info } = await sharp('public/images/showroom_raw.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;  // 446
  const h = info.height; // 325
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

  // 1. Smoothly inpaint the left wall (x: 0 to 174, y: 110 to 240)
  for (let y = 110; y < 240; y++) {
    const ref = getPx(175, y);
    for (let x = 0; x < 175; x++) {
      if (y > 230 && x < 50) continue; // Keep bench
      setPx(x, y, ref[0], ref[1], ref[2]);
    }
  }

  // 2. Smoothly inpaint the right wall (x: 272 to 445, y: 110 to 240)
  for (let y = 110; y < 240; y++) {
    const ref = getPx(272, y);
    for (let x = 272; x < w; x++) {
      if (x > 395 && y < 190) {
        const orig = getPx(x, y);
        if (orig[0] < 140 || orig[1] < 140) continue; // Keep olive leaves
      }
      setPx(x, y, ref[0], ref[1], ref[2]);
    }
  }

  // 3. Remove black sweater edges so nothing peeks out behind the shirt
  for (let y = 115; y < 205; y++) {
    const wallL = getPx(175, y);
    const wallR = getPx(272, y);
    for (let x = 176; x < 272; x++) {
      const orig = getPx(x, y);
      if (orig[0] < 60 && orig[1] < 60 && orig[2] < 60) {
        // Inpaint sweater with wall
        const t = (x - 176) / (272 - 176);
        setPx(x, y, wallL[0] * (1 - t) + wallR[0] * t, wallL[1] * (1 - t) + wallR[1] * t, wallL[2] * (1 - t) + wallR[2] * t);
      }
    }
  }

  // 4. Clean bottom overlays (y: 260 to 325)
  for (let y = 260; y < 315; y++) {
    for (let x = 198; x < 248; x++) {
      const orig = getPx(x, y);
      if (orig[0] < 100 && orig[1] < 100 && orig[2] < 100) {
        const chino = getPx(x, 252);
        setPx(x, y, chino[0], chino[1], chino[2]);
      }
    }
  }

  for (let y = 305; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x >= 195 && x <= 248 && y < 318) continue;
      const fl = getPx(x, 298);
      setPx(x, y, fl[0], fl[1], fl[2]);
    }
  }

  // Clean mouse cursor (x: 300 to 315, y: 92 to 112)
  for (let y = 92; y < 112; y++) {
    for (let x = 300; x < 315; x++) {
      const orig = getPx(x, y);
      if (orig[0] < 110) {
        const wall = getPx(x, 88);
        setPx(x, y, wall[0], wall[1], wall[2]);
      }
    }
  }

  // Save the master showroom base image at 1400 x 1020
  const masterBase = await sharp(out, { raw: { width: w, height: h, channels: 3 } })
    .resize(1400, 1020, { kernel: 'lanczos3' })
    .jpeg({ quality: 96 })
    .toBuffer();

  await sharp(masterBase).toFile('public/images/showroom_studio_bg.jpg');
  console.log('Saved showroom_studio_bg.jpg');

  // 5. Generate all 9 shirt composites on this master showroom!
  // In 1400 x 1020:
  // Center is x = 700. Chin is y ~ 328. Waist is y ~ 645.
  // Shirt size: width ~ 315, height ~ 395. Left = 700 - 157 = 543. Top = 325.
  for (let idx = 1; idx <= 9; idx++) {
    const shirtCutout = `public/images/shirt/shirt${idx}_cutout.png`;

    const fittedShirt = await sharp(shirtCutout)
      .resize(320, 395, { fit: 'fill' })
      .png()
      .toBuffer();

    await sharp(masterBase)
      .composite([
        {
          input: fittedShirt,
          left: 540,
          top: 325,
        }
      ])
      .jpeg({ quality: 95 })
      .toFile(`public/images/model_shirt_${idx}.jpg`);

    console.log(`Saved model_shirt_${idx}.jpg`);
  }
}

generateSeamlessShowroomAndModel().catch(console.error);
