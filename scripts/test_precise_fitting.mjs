import sharp from 'sharp';

async function testPreciseFitting() {
  const shirtResized = await sharp('public/images/shirt/shirt1_cutout.png')
    .resize(275, 345, { fit: 'fill' })
    .png()
    .toBuffer();

  await sharp('public/images/showroom_raw.jpg')
    .resize(1338, 975, { kernel: 'lanczos3' })
    .composite([
      {
        input: shirtResized,
        left: 535,
        top: 312,
      }
    ])
    .toFile('public/images/test_precise_shirt1.jpg');

  console.log('Saved test_precise_shirt1.jpg');
}

testPreciseFitting().catch(console.error);
