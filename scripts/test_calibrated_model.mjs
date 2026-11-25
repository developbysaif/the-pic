import sharp from 'sharp';

async function testCalibratedModel() {
  const shirtResized = await sharp('public/images/shirt/shirt1_cutout.png')
    .resize(330, 395, { fit: 'fill' })
    .png()
    .toBuffer();

  await sharp('public/images/showroom_raw.jpg')
    .resize(1338, 975, { kernel: 'lanczos3' })
    .composite([
      {
        input: shirtResized,
        left: 504,
        top: 308,
      }
    ])
    .toFile('public/images/test_calibrated_shirt1.jpg');

  console.log('Saved test_calibrated_shirt1.jpg');
}

testCalibratedModel().catch(console.error);
