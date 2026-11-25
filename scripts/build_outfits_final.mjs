/**
 * build_outfits_final.mjs
 * 
 * Final version with:
 * 1. Shirt trimmed to remove bottom shadow and side halo
 * 2. Correct collar-to-neck alignment
 * 3. Full shoulder coverage
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';

const CANVAS_W = 1600;
const CANVAS_H = 1020;
const MODEL_SRC = 'public/images/test_model.jpg';
const BG_SRC = 'public/images/showroom_bg_clean.jpg';

// Model crop from 1200×1800 original
const CROP_LEFT = 160, CROP_TOP = 116;
const CROP_W = 860, CROP_H = 1629;

// Man in canvas
const MAN_H = 820;
const MAN_W = Math.round(CROP_W * (MAN_H / CROP_H));  // 433
const MAN_X = Math.round((CANVAS_W - MAN_W) / 2);      // 584
const MAN_Y = CANVAS_H - MAN_H - 15;                   // 185
const SCALE = MAN_H / CROP_H;

// In the original shirt cutout (1086×1448):
// - Top of collar: y≈60 (collar point at ~y=100)
// - Hem bottom (before shadow): y≈1375 (actual shirt fabric ends)
// - Shadow/gray starts: y≈1380
// - Left sleeve edge: x≈15 (left cuff), right sleeve: x≈1070
// - To trim: use y: 0..1370 (94.6%), x: 20..1066 (97.6%)
// After trim: 1046×1370, ratio = 0.763

// When we resize to fit the man's torso:
// Shirt should span from x=50 (left) to x=383 (right) in man-space (W=333)
// And from y=108 (collar) to y=445 (hem) in man-space (H=337)
// But our shirt is 0.763 ratio, so if W=333, H = 333/0.763 = 436
// Let's use W=320, H=420

const SHIRT_LEFT = 57;   // left edge of shirt in man-space
const SHIRT_TOP = 108;   // top of collar in man-space
const SHIRT_W = 320;     // shirt width in man-space
const SHIRT_H = 420;     // shirt height in man-space (covers waist)

// Trim from shirt cutout (1086×1448 original)
const TRIM_TOP = 0;
const TRIM_LEFT = 20;
const TRIM_RIGHT = 20;
const TRIM_BOTTOM = 85;  // remove bottom shadow (last ~6%)

console.log(`Man: ${MAN_W}×${MAN_H} at (${MAN_X},${MAN_Y})`);
console.log(`Shirt: left=${SHIRT_LEFT}, top=${SHIRT_TOP}, W=${SHIRT_W}, H=${SHIRT_H}`);
console.log(`Shirt trim: remove ${TRIM_BOTTOM}px from bottom, ${TRIM_LEFT}px from each side`);

async function prepareShirtCutout(shirtIndex) {
  const src = `public/images/shirt/shirt${shirtIndex}_cutout.png`;
  const { width, height } = await sharp(src).metadata();
  
  // Trim and resize
  return sharp(src)
    .extract({
      left: TRIM_LEFT,
      top: TRIM_TOP,
      width: width - TRIM_LEFT - TRIM_RIGHT,
      height: height - TRIM_BOTTOM,
    })
    .resize(SHIRT_W, SHIRT_H, { fit: 'fill', kernel: 'lanczos3' })
    .png()
    .toBuffer();
}

async function extractModelCutout() {
  console.log('\n[1] Extracting model cutout...');

  const { data, info } = await sharp(MODEL_SRC).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;

  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4]     = data[i * ch];
    rgba[i * 4 + 1] = data[i * ch + 1];
    rgba[i * 4 + 2] = data[i * ch + 2];
    rgba[i * 4 + 3] = 255;
  }

  const isWhiteBg = (r, g, b) => r >= 236 && g >= 236 && b >= 236;
  const visited = new Uint8Array(w * h);
  const queue = [];

  const addSeed = (x, y) => {
    const idx = y * w + x;
    const pi = idx * ch;
    if (!visited[idx] && isWhiteBg(data[pi], data[pi+1], data[pi+2])) {
      visited[idx] = 1; queue.push(idx);
    }
  };

  for (let x = 0; x < w; x++) { addSeed(x, 0); addSeed(x, h - 1); }
  for (let y = 0; y < h; y++) { addSeed(0, y); addSeed(w - 1, y); }

  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    rgba[idx * 4 + 3] = 0;
    const y = Math.floor(idx / w), x = idx % w;
    if (x > 0)     { const n=idx-1; if (!visited[n]) { const pi=n*ch; if (isWhiteBg(data[pi],data[pi+1],data[pi+2])) { visited[n]=1; queue.push(n); } } }
    if (x < w - 1) { const n=idx+1; if (!visited[n]) { const pi=n*ch; if (isWhiteBg(data[pi],data[pi+1],data[pi+2])) { visited[n]=1; queue.push(n); } } }
    if (y > 0)     { const n=idx-w; if (!visited[n]) { const pi=n*ch; if (isWhiteBg(data[pi],data[pi+1],data[pi+2])) { visited[n]=1; queue.push(n); } } }
    if (y < h - 1) { const n=idx+w; if (!visited[n]) { const pi=n*ch; if (isWhiteBg(data[pi],data[pi+1],data[pi+2])) { visited[n]=1; queue.push(n); } } }
  }

  const modelPng = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: CROP_LEFT, top: CROP_TOP, width: CROP_W, height: CROP_H })
    .resize(MAN_W, MAN_H, { fit: 'fill', kernel: 'lanczos3' })
    .png()
    .toBuffer();

  console.log(`   ✓ ${MAN_W}×${MAN_H}`);
  return modelPng;
}

async function buildOutfit(modelBuf, shirtIndex) {
  process.stdout.write(`  Shirt ${shirtIndex}: `);

  const shirtBuf = await prepareShirtCutout(shirtIndex);

  const dressedBuf = await sharp(modelBuf)
    .composite([{ input: shirtBuf, left: SHIRT_LEFT, top: SHIRT_TOP, blend: 'over' }])
    .png()
    .toBuffer();

  await sharp(BG_SRC)
    .resize(CANVAS_W, CANVAS_H, { fit: 'cover' })
    .composite([{ input: dressedBuf, left: MAN_X, top: MAN_Y, blend: 'over' }])
    .jpeg({ quality: 92 })
    .toFile(`public/images/showroom_outfit_${shirtIndex}.jpg`);

  console.log(`✓ saved`);
}

async function main() {
  console.log('=== Vogue Atelier — Final Showroom Outfits ===');
  
  const modelCutout = await extractModelCutout();
  await fs.writeFile('public/images/model_cutout_final.png', modelCutout);
  
  for (let i = 1; i <= 9; i++) {
    await buildOutfit(modelCutout, i);
  }
  
  console.log('\n✅ All 9 outfit images generated!');
}

main().catch(console.error);
