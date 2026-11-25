import sharp from 'sharp';

async function perfectInpaintShowroom() {
  const { data, info } = await sharp('public/images/showroom_raw.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const out = Buffer.from(data);

  function getPx(x, y) {
    const clampedX = Math.max(0, Math.min(w - 1, Math.round(x)));
    const clampedY = Math.max(0, Math.min(h - 1, Math.round(y)));
    const idx = (clampedY * w + clampedX) * 3;
    return [data[idx], data[idx + 1], data[idx + 2]];
  }

  function setPx(x, y, r, g, b) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = (y * w + x) * 3;
    out[idx] = Math.max(0, Math.min(255, Math.round(r)));
    out[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
    out[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
  }

  // 1. Clean the left side floating cards (x: 25 to 175, y: 110 to 245)
  // Preserving bench at bottom left (y > 235 and x < 45)
  for (let y = 110; y < 242; y++) {
    // Reference pixel near the model at x = 175
    const ref = getPx(175, y);
    // Reference pixel at ceiling edge or wall top
    for (let x = 0; x < 175; x++) {
      if (y > 230 && x < 45) continue; // Keep stone bench
      // Distance to model clean strip
      const t = x / 175;
      // Ambient shadow factor: slightly darker towards corners
      const vignette = 1 - 0.04 * (1 - t);
      // Subtle pseudo-random micro grain for realism
      const grain = ((x * 17 + y * 23) % 7) - 3;
      setPx(x, y, ref[0] * vignette + grain, ref[1] * vignette + grain, ref[2] * vignette + grain);
    }
  }

  // 2. Clean the right side floating cards (x: 275 to 446, y: 110 to 245)
  // Preserving olive branch leaves at top right (x > 390 and y < 190)
  for (let y = 110; y < 242; y++) {
    const ref = getPx(273, y);
    for (let x = 273; x < w; x++) {
      // Preserve olive leaves
      if (x > 395 && y < 185) {
        const orig = getPx(x, y);
        // Olive leaves are darker / greenish
        if (orig[0] < 145 || orig[1] < 140) continue;
      }
      const t = (w - x) / (w - 273);
      const vignette = 1 - 0.04 * (1 - t);
      const grain = ((x * 19 + y * 29) % 7) - 3;
      setPx(x, y, ref[0] * vignette + grain, ref[1] * vignette + grain, ref[2] * vignette + grain);
    }
  }

  // 3. Clean floating left tool pill (vertical icons: x: 0 to 25, y: 140 to 220)
  for (let y = 135; y < 225; y++) {
    const ref = getPx(175, y);
    for (let x = 0; x < 28; x++) {
      const grain = ((x * 13 + y * 7) % 5) - 2;
      setPx(x, y, ref[0] * 0.96 + grain, ref[1] * 0.96 + grain, ref[2] * 0.96 + grain);
    }
  }

  // 4. Clean bottom overlay dock bar (y: 300 to 325)
  // Reconstruct clean floor across the bottom, preserving model feet at x: 200..245
  for (let y = 300; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x >= 195 && x <= 248 && y < 318) continue; // Model shoes
      const floorSample = getPx(x, 292);
      const grain = ((x * 11 + y * 13) % 5) - 2;
      setPx(x, y, floorSample[0] + grain, floorSample[1] + grain, floorSample[2] + grain);
    }
  }

  // 5. Clean black audio circle on lower chinos (x: 200 to 248, y: 260 to 312)
  for (let y = 260; y < 312; y++) {
    for (let x = 200; x < 248; x++) {
      const orig = getPx(x, y);
      if (orig[0] < 110 && orig[1] < 110 && orig[2] < 110) {
        // Sample chinos from y = 250
        const chino = getPx(x, 250);
        const grain = ((x * 7 + y * 5) % 4) - 2;
        setPx(x, y, chino[0] + grain, chino[1] + grain, chino[2] + grain);
      }
    }
  }

  // 6. Clean mouse cursor at x: 302, y: 100
  for (let y = 92; y < 112; y++) {
    for (let x = 300; x < 315; x++) {
      const orig = getPx(x, y);
      if (orig[0] < 110) {
        const wall = getPx(x, 88);
        setPx(x, y, wall[0], wall[1], wall[2]);
      }
    }
  }

  // 7. Clean top pills at ceiling
  for (let y = 0; y < 22; y++) {
    for (let x = 0; x < w; x++) {
      setPx(x, y, 18, 18, 18);
    }
  }

  // 8. Clean bottom right Instagram heart
  for (let y = 265; y < h; y++) {
    for (let x = 385; x < w; x++) {
      const fl = getPx(x, 258);
      setPx(x, y, fl[0], fl[1], fl[2]);
    }
  }

  // Upscale cleanly to high resolution (1338 x 975) with lanczos3
  await sharp(out, { raw: { width: w, height: h, channels: 3 } })
    .resize(1338, 975, { kernel: 'lanczos3' })
    .sharpen({ sigma: 1.0, m1: 0.5, m2: 1.5 })
    .jpeg({ quality: 95 })
    .toFile('public/images/showroom_master.jpg');

  console.log('Saved showroom_master.jpg');
}

perfectInpaintShowroom().catch(console.error);
