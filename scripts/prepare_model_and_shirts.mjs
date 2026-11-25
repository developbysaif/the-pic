import sharp from 'sharp';

async function prepareBaseModelAndShirting() {
  const { data, info } = await sharp('public/images/showroom_master.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const out = Buffer.from(data);

  function getPx(x, y) {
    const idx = (y * w + x) * 3;
    return [data[idx], data[idx + 1], data[idx + 2]];
  }

  function setPx(x, y, r, g, b) {
    const idx = (y * w + x) * 3;
    out[idx] = Math.round(r);
    out[idx + 1] = Math.round(g);
    out[idx + 2] = Math.round(b);
  }

  // 1. Remove black sweater completely:
  // For y between 210 and 640, x between 480 and 860:
  // If the pixel is dark (black sweater, r < 75 && g < 75 && b < 75):
  // Replace it with the warm travertine wall color at that height y!
  for (let y = 210; y < 640; y++) {
    // Get wall color from left (x = 440) and right (x = 880)
    const wallLeft = getPx(440, y);
    const wallRight = getPx(880, y);

    for (let x = 480; x < 860; x++) {
      const idx = (y * w + x) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // If it's the black sweater
      if (r < 75 && g < 75 && b < 75) {
        const t = (x - 480) / (860 - 480);
        const wallR = wallLeft[0] * (1 - t) + wallRight[0] * t;
        const wallG = wallLeft[1] * (1 - t) + wallRight[1] * t;
        const wallB = wallLeft[2] * (1 - t) + wallRight[2] * t;
        const grain = ((x * 13 + y * 17) % 5) - 2;
        setPx(x, y, wallR + grain, wallG + grain, wallB + grain);
      }
    }
  }

  // Also in the neck region (y from 195 to 235, x from 645 to 700):
  // Let's add a clean natural neck skin tone connecting his chin (y=195) down to the shirt collar (y=230)
  // Chin skin tone is around (195, 155, 130)
  for (let y = 195; y < 232; y++) {
    for (let x = 650; x < 698; x++) {
      const dx = (x - 674) / 20;
      if (dx * dx <= 1.0) {
        // Natural neck skin tone with soft ambient shadow
        const shadow = 1 - 0.15 * ((y - 195) / 37);
        setPx(x, y, 190 * shadow, 150 * shadow, 125 * shadow);
      }
    }
  }

  // Save the base showroom + model (head + neck + hands + chinos + shoes in showroom, with no sweater)
  const baseModelBuffer = await sharp(out, { raw: { width: w, height: h, channels: 3 } })
    .jpeg({ quality: 95 })
    .toFile('public/images/showroom_model_base.jpg');

  console.log('Saved showroom_model_base.jpg');

  // 2. Now generate 9 completed showroom images, one for each shirt!
  // `showroom_shirt1.jpg` ... `showroom_shirt9.jpg`
  for (let idx = 1; idx <= 9; idx++) {
    const shirtPath = `public/images/shirt/shirt${idx}_cutout.png`;

    // Process shirt cutout: remove any white edge fringe and soften collar
    const shirtResized = await sharp(shirtPath)
      .resize(345, 460, { fit: 'fill' })
      .png()
      .toBuffer();

    await sharp('public/images/showroom_model_base.jpg')
      .composite([
        {
          input: shirtResized,
          left: 507,
          top: 222,
        }
      ])
      .jpeg({ quality: 94 })
      .toFile(`public/images/showroom_shirt${idx}.jpg`);

    console.log(`Generated showroom_shirt${idx}.jpg`);
  }
}

prepareBaseModelAndShirting().catch(console.error);
