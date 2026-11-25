import sharp from 'sharp';

async function findPerfectFit() {
  // Try 3 scales/positions
  const tests = [
    { name: 'fit_A', width: 335, height: 448, left: 512, top: 228 },
    { name: 'fit_B', width: 345, height: 460, left: 507, top: 222 },
    { name: 'fit_C', width: 355, height: 472, left: 502, top: 216 },
  ];

  for (const t of tests) {
    const shirtResized = await sharp('public/images/shirt/shirt1_cutout.png')
      .resize(t.width, t.height, { fit: 'fill' })
      .png()
      .toBuffer();

    await sharp('public/images/showroom_master.jpg')
      .composite([
        {
          input: shirtResized,
          left: t.left,
          top: t.top,
        }
      ])
      .toFile(`public/images/test_${t.name}.jpg`);

    console.log(`Saved test_${t.name}.jpg`);
  }
}

findPerfectFit().catch(console.error);
