import sharp from 'sharp';

async function cleanShowroom() {
  const { data, info } = await sharp('public/images/showroom_raw.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const out = Buffer.from(data);

  // Helper to get pixel
  function getPx(x, y) {
    const idx = (y * w + x) * 3;
    return [data[idx], data[idx + 1], data[idx + 2]];
  }

  // Helper to set pixel
  function setPx(x, y, r, g, b) {
    const idx = (y * w + x) * 3;
    out[idx] = Math.round(r);
    out[idx + 1] = Math.round(g);
    out[idx + 2] = Math.round(b);
  }

  // The cards are roughly in regions:
  // Left side cards: x from 0 to 175, y from 120 to 235
  // Right side cards: x from 275 to 445, y from 120 to 235
  // Note: on the left, we preserve the bench at y > 230, x < 50
  // On the right, we preserve the olive tree branch at x > 390, y < 180

  // For any y between 110 and 240:
  // We can sample the clean wall strip at x = 174..179 (just to the left of the model)
  // and x = 271..276 (just to the right of the model).
  for (let y = 115; y < 240; y++) {
    // Left clean sample
    const leftSample = getPx(175, y);
    // Right clean sample
    const rightSample = getPx(272, y);

    // Clean left side cards (x from 40 to 172, but keep bench below 240)
    for (let x = 30; x < 174; x++) {
      // Don't overwrite the bench area at bottom-left
      if (y > 230 && x < 50) continue;
      // Slight horizontal variation so it looks natural
      const noise = ((x * 13 + y * 7) % 5) - 2;
      setPx(x, y, leftSample[0] + noise, leftSample[1] + noise, leftSample[2] + noise);
    }

    // Clean right side cards (x from 274 to 410, preserve olive tree at x > 400 and y < 185)
    for (let x = 274; x < 415; x++) {
      // Preserve olive leaves
      if (x > 395 && y < 190) {
        const orig = getPx(x, y);
        // If it's olive green/dark (leaf), skip
        if (orig[0] < 150 || orig[1] < 150) continue;
      }
      const noise = ((x * 11 + y * 17) % 5) - 2;
      setPx(x, y, rightSample[0] + noise, rightSample[1] + noise, rightSample[2] + noise);
    }
  }

  // Clean top pills / buttons (y from 15 to 45, x from 140 to 420 except skylight)
  // Also clean bottom overlay bar (y from 305 to 325)
  // The bottom bar is at y >= 305
  for (let y = 305; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // If it's the model's feet/shoes (around x=200..250), keep or blend floor
      if (x >= 195 && x <= 250) continue;
      const floorSample = getPx(x, 300);
      setPx(x, y, floorSample[0], floorSample[1], floorSample[2]);
    }
  }

  // Also clean the black volume icon circle at bottom (x from 200 to 250, y from 265 to 315)
  // This circle was the audio volume button on Instagram reel!
  // In `model_crop.jpg`, notice there was an audio speaker circle overlapping his lower chinos!
  // Let's restore the chinos fabric there!
  for (let y = 265; y < 312; y++) {
    for (let x = 195; x < 252; x++) {
      const orig = getPx(x, y);
      // Volume button is dark grey/black
      if (orig[0] < 110 && orig[1] < 110 && orig[2] < 110) {
        // Sample chinos color from above (y = 255)
        const chinoSample = getPx(x, 255);
        const noise = ((x * 7 + y * 3) % 4) - 2;
        setPx(x, y, chinoSample[0] + noise, chinoSample[1] + noise, chinoSample[2] + noise);
      }
    }
  }

  // Clean the top header UI pills: "REMANENCE SHOWROOM VIRTUAL", "Superior Inferior...", "Pruebatelo tu"
  // Above the skylight (y from 0 to 22)
  for (let y = 0; y < 22; y++) {
    for (let x = 0; x < w; x++) {
      setPx(x, y, 20, 20, 20); // clean dark top border or ceiling
    }
  }

  // Clean the cursor arrow near x=305, y=100
  for (let y = 92; y < 112; y++) {
    for (let x = 300; x < 315; x++) {
      const orig = getPx(x, y);
      if (orig[0] < 100 && orig[1] < 100) {
        const wall = getPx(x, 90);
        setPx(x, y, wall[0], wall[1], wall[2]);
      }
    }
  }

  // Clean the like button heart at bottom right (x > 380, y > 260)
  for (let y = 260; y < h; y++) {
    for (let x = 380; x < w; x++) {
      const floor = getPx(x, 250);
      setPx(x, y, floor[0], floor[1], floor[2]);
    }
  }

  // Save cleaned showroom
  await sharp(out, { raw: { width: w, height: h, channels: 3 } })
    .jpeg({ quality: 95 })
    .toFile('public/images/showroom_clean.jpg');

  console.log('Saved showroom_clean.jpg');
}

cleanShowroom().catch(console.error);
