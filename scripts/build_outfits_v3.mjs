/**
 * build_outfits_v3.mjs
 * 
 * Improved approach with better shirt placement calibration.
 * 
 * Key insight: The shirt product photos (1086×1448) show a full shirt 
 * front-facing with collar at top and hem at bottom. The cutout preserves
 * the shirt shape including arm sleeves.
 *
 * We need to:
 * 1. Scale the shirt so its WIDTH matches the model's shoulder-to-shoulder width  
 * 2. Position shirt so collar aligns with model's neck
 * 
 * test_model.jpg body measurements (1200×1800):
 *   Head top: y=128, Head center X ≈ 620
 *   Shoulders (y=450): left=349, right=753 → width=404px, center=551
 *   Chest wide (y=550): left=312, right=823 → width=511px (includes arms)
 *   
 * Crop: left=160, top=116, W=860, H=1629 → man target W=433, H=820
 * Scale = 820/1629 = 0.5034
 *
 * In man-space coordinates:
 *   Shoulder width = 404 * 0.5034 ≈ 203px
 *   Shoulder left X in man = (349-160) * 0.5034 ≈ 95px 
 *   Shoulder right X in man = (753-160) * 0.5034 ≈ 298px
 *   
 *   Collar Y in man = (350-116) * 0.5034 ≈ 118px
 *   Neck Y in man = (280-116) * 0.5034 ≈ 82px
 *
 * For shirt, we want it wider to cover arms too:
 *   Full width coverage (y=550 level): 511 * 0.5034 ≈ 257px
 *   Start X: (312-160) * 0.5034 ≈ 76px
 *
 * Shirt proportions: 1086w × 1448h = 0.75 ratio
 * Target shirt W = 290px (wider than shoulder for natural arm coverage)
 * Target shirt H = 290 / 0.75 = 387px
 * Shirt left = 76px (from man edge)
 * Shirt top = 82px (neck level)
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';

const CANVAS_W = 1600;
const CANVAS_H = 1020;
const MODEL_SRC = 'public/images/test_model.jpg';
const BG_SRC = 'public/images/showroom_bg_clean.jpg';

// Crop region from original 1200×1800 model image
const CROP_LEFT = 160, CROP_TOP = 116;
const CROP_W = 860, CROP_H = 1629;

// Man in canvas
const MAN_H = 820;
const MAN_W = Math.round(CROP_W * (MAN_H / CROP_H));  // 433
const MAN_X = Math.round((CANVAS_W - MAN_W) / 2);      // 584
const MAN_Y = CANVAS_H - MAN_H - 15;                   // 185
const SCALE = MAN_H / CROP_H;                           // 0.5034

// Shirt placement on man
// Use the full chest width for shirt (includes sleeves) for natural look
// In original image, wide body from x=310 to x=840 at chest level
// In crop space: 310-160=150 to 840-160=680 → width 530
// In man space: 150*SCALE=75 to 680*SCALE=342 → width 267
// But shirt is at collar level, so collar is narrower:
// Add 20px extra on each side for natural shirt drape
const SHIRT_LEFT = Math.round(150 * SCALE) - 20;      // 55
const SHIRT_RIGHT_MAN = Math.round(680 * SCALE) + 20; // 362
const SHIRT_W = SHIRT_RIGHT_MAN - SHIRT_LEFT;         // 307
const SHIRT_H = Math.round(SHIRT_W / 0.75);           // 409 (maintaining aspect ratio)
const SHIRT_TOP = Math.round((265 - 116) * SCALE);    // collar at y≈75

console.log(`Man target: ${MAN_W}×${MAN_H} at (${MAN_X},${MAN_Y})`);
console.log(`Shirt placement: left=${SHIRT_LEFT}, top=${SHIRT_TOP}, W=${SHIRT_W}, H=${SHIRT_H}`);

async function extractModelCutout() {
  console.log('\n[1] Extracting model from white background...');

  const { data, info } = await sharp(MODEL_SRC).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;

  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4]     = data[i * ch];
    rgba[i * 4 + 1] = data[i * ch + 1];
    rgba[i * 4 + 2] = data[i * ch + 2];
    rgba[i * 4 + 3] = 255;
  }

  // BFS flood fill from edges
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
    const neighbors = [];
    if (x > 0)     neighbors.push(idx - 1);
    if (x < w - 1) neighbors.push(idx + 1);
    if (y > 0)     neighbors.push(idx - w);
    if (y < h - 1) neighbors.push(idx + w);
    for (const n of neighbors) {
      if (!visited[n]) {
        const pi = n * ch;
        if (isWhiteBg(data[pi], data[pi+1], data[pi+2])) {
          visited[n] = 1; queue.push(n);
        }
      }
    }
  }

  // Add slight feathering at the edges (1px border soft)
  // ... skip for now, do basic extraction

  const modelPng = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: CROP_LEFT, top: CROP_TOP, width: CROP_W, height: CROP_H })
    .resize(MAN_W, MAN_H, { fit: 'fill', kernel: 'lanczos3' })
    .png()
    .toBuffer();

  console.log(`   ✓ Model cutout: ${MAN_W}×${MAN_H}`);
  return modelPng;
}

async function buildOutfit(modelBuf, shirtIndex) {
  process.stdout.write(`[Shirt ${shirtIndex}] `);

  const shirtSrc = `public/images/shirt/shirt${shirtIndex}_cutout.png`;

  const shirtBuf = await sharp(shirtSrc)
    .resize(SHIRT_W, SHIRT_H, { fit: 'fill', kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const dressedBuf = await sharp(modelBuf)
    .composite([{ input: shirtBuf, left: SHIRT_LEFT, top: SHIRT_TOP, blend: 'over' }])
    .png()
    .toBuffer();

  await sharp(BG_SRC)
    .resize(CANVAS_W, CANVAS_H, { fit: 'cover' })
    .composite([{ input: dressedBuf, left: MAN_X, top: MAN_Y, blend: 'over' }])
    .jpeg({ quality: 92 })
    .toFile(`public/images/showroom_outfit_${shirtIndex}.jpg`);

  console.log(`✓ showroom_outfit_${shirtIndex}.jpg`);
}

async function main() {
  console.log('=== Vogue Atelier — Building Showroom Outfits v3 ===');
  const modelCutout = await extractModelCutout();
  await fs.writeFile('public/images/model_cutout_v3.png', modelCutout);
  
  for (let i = 1; i <= 9; i++) {
    await buildOutfit(modelCutout, i);
  }
  
  console.log('\n✅ Done! Open http://localhost:3000/category/shirts');
}

main().catch(console.error);
