import sharp from 'sharp';

async function inspect() {
  const m = await sharp('public/images/test_model.jpg').metadata();
  console.log('test_model:', m.width, 'x', m.height);
  const bg = await sharp('public/images/showroom_bg_clean.jpg').metadata();
  console.log('showroom_bg_clean:', bg.width, 'x', bg.height);
  const s1 = await sharp('public/images/shirt/shirt1_cutout.png').metadata();
  console.log('shirt1_cutout:', s1.width, 'x', s1.height);

  // Sample pixels from test_model to find body boundaries
  const { data, info } = await sharp('public/images/test_model.jpg').raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const ch = info.channels;

  // Find head top (first non-white row in center column)
  let headTop = -1;
  for (let y = 0; y < h; y++) {
    const px = (y * w + Math.floor(w / 2)) * ch;
    const r = data[px], g = data[px+1], b = data[px+2];
    if (r < 230 || g < 230 || b < 230) { headTop = y; break; }
  }
  console.log('headTop y =', headTop);

  // Find feet bottom
  let feetBottom = -1;
  for (let y = h - 1; y >= 0; y--) {
    const px = (y * w + Math.floor(w / 2)) * ch;
    const r = data[px], g = data[px+1], b = data[px+2];
    if (r < 230 || g < 230 || b < 230) { feetBottom = y; break; }
  }
  console.log('feetBottom y =', feetBottom);

  // Find model width (shoulders area ~ headTop + 20% body height)
  const shoulderY = Math.floor(headTop + (feetBottom - headTop) * 0.15);
  let leftEdge = w, rightEdge = 0;
  for (let x = 0; x < w; x++) {
    const px = (shoulderY * w + x) * ch;
    const r = data[px], g = data[px+1], b = data[px+2];
    if (r < 230 || g < 230 || b < 230) { leftEdge = Math.min(leftEdge, x); rightEdge = Math.max(rightEdge, x); }
  }
  console.log('Shoulder row y=', shoulderY, 'left=', leftEdge, 'right=', rightEdge, 'width=', rightEdge - leftEdge);

  // Sample at waist
  const waistY = Math.floor(headTop + (feetBottom - headTop) * 0.5);
  let wLeft = w, wRight = 0;
  for (let x = 0; x < w; x++) {
    const px = (waistY * w + x) * ch;
    const r = data[px], g = data[px+1], b = data[px+2];
    if (r < 230 || g < 230 || b < 230) { wLeft = Math.min(wLeft, x); wRight = Math.max(wRight, x); }
  }
  console.log('Waist row y=', waistY, 'left=', wLeft, 'right=', wRight, 'width=', wRight - wLeft);

  // Model center X
  const centerX = Math.floor((leftEdge + rightEdge) / 2);
  console.log('Model center X =', centerX);
}

inspect().catch(console.error);
