import sharp from 'sharp';

async function createTransparentModels() {
  // Let's create transparent PNGs of the model wearing each shirt
  // Model dimensions: width ~ 360, height ~ 820
  // In model_shirt_${idx}.jpg (1400 x 1020):
  // Model is from x: 520 to 880 (width 360)
  // y: from 215 (top of hair) to 1010 (shoes on floor) (height 795)

  for (let idx = 1; idx <= 9; idx++) {
    const inputPath = `public/images/model_shirt_${idx}.jpg`;
    const outputPath = `public/images/model_cutout_${idx}.png`;

    // Extract the model box
    const { data, info } = await sharp(inputPath)
      .extract({ left: 510, top: 215, width: 380, height: 795 })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const w = info.width;
    const h = info.height;

    // Mask out the beige wall outside the model silhouette
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idxPx = (y * w + x) * 4;
        const r = data[idxPx];
        const g = data[idxPx + 1];
        const b = data[idxPx + 2];

        // Model head is at top: x between 140 and 240, y < 115
        if (y < 110) {
          const dx = (x - 190) / 48;
          const dy = (y - 55) / 55;
          if (dx * dx + dy * dy > 1.05) {
            data[idxPx + 3] = 0; // Transparent outside head
          }
        }

        // Outside shoulders and arms (y between 110 and 420)
        if (y >= 110 && y < 420) {
          // If pixel is warm beige wall (r > 185 && g > 165 && b > 145 && low delta)
          const minC = Math.min(r, g, b);
          const maxC = Math.max(r, g, b);
          if (minC > 175 && (maxC - minC) < 30 && (x < 35 || x > 345)) {
            data[idxPx + 3] = 0;
          }
        }

        // Outside chinos (y >= 420)
        if (y >= 420) {
          if (x < 65 || x > 315) {
            data[idxPx + 3] = 0;
          }
        }
      }
    }

    await sharp(data, { raw: { width: w, height: h, channels: 4 } })
      .png()
      .toFile(outputPath);

    console.log(`Created model_cutout_${idx}.png`);
  }
}

createTransparentModels().catch(console.error);
