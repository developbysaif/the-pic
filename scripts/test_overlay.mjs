import sharp from 'sharp';

async function testOverlay() {
  // Let's resize shirt1_cutout to width 310
  const shirtResized = await sharp('public/images/shirt/shirt1_cutout.png')
    .resize(320, 426, { fit: 'fill' })
    .toBuffer();

  // In showroom_master.jpg:
  // Center is ~ 678
  // Left for 320px width: 678 - 160 = 518
  // Top around 260
  await sharp('public/images/showroom_master.jpg')
    .composite([
      {
        input: shirtResized,
        left: 518,
        top: 265,
      }
    ])
    .toFile('public/images/test_model_shirt1.jpg');

  console.log('Saved test_model_shirt1.jpg');
}

testOverlay().catch(console.error);
