import sharp from 'sharp';

async function buildCleanShowroomAndModel() {
  const { data, info } = await sharp('public/images/showroom_raw.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
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

  // 1. Inpaint the black sweater from y = 110 to 205 in raw (master y = 330 to 615)
  // Inside the sweater area: x = 175 to 270 (x = 180 to 266)
  // We can fill this area with the wall color and soft ambient shadow
  for (let y = 112; y <= 204; y++) {
    const wallLeft = getPx(160, y);
    const wallRight = getPx(285, y);
    for (let x = 176; x <= 268; x++) {
      const orig = getPx(x, y);
      // Black sweater pixel
      if (orig[0] < 55 && orig[1] < 55 && orig[2] < 55) {
        const t = (x - 176) / (268 - 176);
        const r = wallLeft[0] * (1 - t) + wallRight[0] * t;
        const g = wallLeft[1] * (1 - t) + wallRight[1] * t;
        const b = wallLeft[2] * (1 - t) + wallRight[2] * t;
        const grain = ((x * 13 + y * 17) % 5) - 2;
        setPx(x, y, r + grain, g + grain, b + grain);
      }
    }
  }

  // 2. Also clean the audio icon at bottom of chinos (y = 265 to 312, x = 200 to 248)
  for (let y = 260; y < 312; y++) {
    for (let x = 198; x < 248; x++) {
      const orig = getPx(x, y);
      if (orig[0] < 100 && orig[1] < 100 && orig[2] < 100) {
        const chino = getPx(x, 250);
        const grain = ((x * 7 + y * 5) % 4) - 2;
        setPx(x, y, chino[0] + grain, chino[1] + grain, chino[2] + grain);
      }
    }
  }

  // 3. Clean floating cards on left and right sides so the showroom is clean!
  // Left cards: x from 25 to 175, y from 115 to 240 (keep bench below 235, x < 45)
  for (let y = 115; y < 240; y++) {
    const wall = getPx(175, y);
    for (let x = 25; x < 175; x++) {
      if (y > 230 && x < 45) continue;
      const grain = ((x * 11 + y * 13) % 5) - 2;
      setPx(x, y, wall[0] + grain, wall[1] + grain, wall[2] + grain);
    }
  }

  // Right cards: x from 272 to 440, y from 115 to 240 (keep olive leaves at x > 395, y < 190)
  for (let y = 115; y < 240; y++) {
    const wall = getPx(272, y);
    for (let x = 272; x < w; x++) {
      if (x > 395 && y < 190) {
        const orig = getPx(x, y);
        if (orig[0] < 140 || orig[1] < 140) continue;
      }
      const grain = ((x * 17 + y * 19) % 5) - 2;
      setPx(x, y, wall[0] + grain, wall[1] + grain, wall[2] + grain);
    }
  }

  // 4. Clean bottom bar at y > 305
  for (let y = 305; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x >= 195 && x <= 248 && y < 318) continue;
      const floor = getPx(x, 298);
      setPx(x, y, floor[0], floor[1], floor[2]);
    }
  }

  // Save the master showroom scene (1338 x 975)
  const masterShowroom = await sharp(out, { raw: { width: w, height: h, channels: 3 } })
    .resize(1338, 975, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.8, m1: 0.4, m2: 1.2 })
    .jpeg({ quality: 95 })
    .toFile('public/images/showroom_model_canvas.jpg');

  console.log('Saved showroom_model_canvas.jpg');

  // 5. Test fitting shirt1 at calibrated size:
  // In master (1338 x 975):
  // Model head center is x ~ 669. Chin is at y ~ 315. Chinos waistband is at y ~ 615.
  // Shirt width ~ 305, height ~ 370. Left = 669 - 152 = 517. Top = 308.
  const shirtResized = await sharp('public/images/shirt/shirt1_cutout.png')
    .resize(305, 370, { fit: 'fill' })
    .png()
    .toBuffer();

  await sharp('public/images/showroom_model_canvas.jpg')
    .composite([
      {
        input: shirtResized,
        left: 517,
        top: 308,
      }
    ])
    .toFile('public/images/test_perfect_fit_final.jpg');

  console.log('Saved test_perfect_fit_final.jpg');
}

buildCleanShowroomAndModel().catch(console.error);
