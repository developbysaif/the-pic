/**
 * build_showroom_outfits_v2.mjs
 * 
 * CORRECTED measurements based on calibration scan of test_model.jpg (1200×1800)
 * 
 * Key body measurements (in original 1200×1800 coords):
 *   Head: y=128..280 (face), center X ≈ 620
 *   Shoulders: y≈450, left=349, right=753, width=404, center=551
 *   Chest:     y≈550, left=312, right=823, width=511
 *   Waist:     y≈1000, left=356, right=738, width=382
 *   Hips:      y≈1150, left=344, right=684
 *   Feet:      y≈1731
 * 
 * The black t-shirt spans from ~y=350 (collar) to ~y=1050 (hem)
 * Arms extend much wider (to 823 at chest level)
 * 
 * Crop: left=180, right=1010, top=116, bottom=1741 → 830×1625
 * Target man: 419×820, placed at x=591, y=190 in 1600×1020 canvas
 *
 * Scale factor (crop→target): 820/1625 = 0.5046
 *
 * Shirt placement in CROP-SPACE (relative to left=180, top=116):
 *   shirtLeft = 349 - 180 = 169 (left shoulder)
 *   shirtRight = 753 - 180 = 573 (right shoulder)  
 *   shirtTop = 350 - 116 = 234 (collar area)
 *   shirtBottom = 1050 - 116 = 934 (shirt hem)
 * → W=404, H=700 in crop space
 * → After scale 0.5046: W=204, H=353 in man-target space
 * → Left in man target: 169 * 0.5046 = 85
 * → Top in man target: 234 * 0.5046 = 118
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';

const CANVAS_W = 1600;
const CANVAS_H = 1020;
const MODEL_SRC = 'public/images/test_model.jpg';
const BG_SRC = 'public/images/showroom_bg_clean.jpg';

// Body crop from original 1200×1800 (with generous padding)
const CROP_LEFT = 160;
const CROP_TOP = 116;
const CROP_RIGHT = 1020;
const CROP_BOTTOM = 1745;
const CROP_W = CROP_RIGHT - CROP_LEFT;   // 860
const CROP_H = CROP_BOTTOM - CROP_TOP;   // 1629

// Target man dimensions in final 1600×1020 canvas
const MAN_H = 820;
const MAN_W = Math.round(CROP_W * (MAN_H / CROP_H));  // ≈410
const MAN_X = Math.round((CANVAS_W - MAN_W) / 2);     // centered
const MAN_Y = CANVAS_H - MAN_H - 15;                  // feet near bottom

const SCALE = MAN_H / CROP_H; // ≈0.503

// Shirt coverage in original image coordinates → crop space → scaled man space
// Using shoulder-to-shoulder width and collar-to-hem height
// Original coords:
//   Collar (neckline): y≈350 → crop: 350-116=234 → man: 118
//   Hem (shirt bottom): y≈1060 → crop: 1060-116=944 → man: 475
//   Left shoulder: x≈310 → crop: 310-160=150 → man: 75
//   Right shoulder: x≈840 → crop: 840-160=680 → man: 342
// Shirt in man-space: left=75, top=118, right=342, bottom=475
// W=267, H=357

const SHIRT_LEFT  = Math.round(150 * SCALE);   // ≈75
const SHIRT_TOP   = Math.round(234 * SCALE);   // ≈118
const SHIRT_W     = Math.round(530 * SCALE);   // ≈267 (340..840 in orig = 530px)
const SHIRT_H     = Math.round(710 * SCALE);   // ≈357 (350..1060 in orig = 710px)

console.log(`Canvas: ${CANVAS_W}×${CANVAS_H}`);
console.log(`Crop: ${CROP_W}×${CROP_H} from (${CROP_LEFT},${CROP_TOP})`);
console.log(`Man target: ${MAN_W}×${MAN_H} at (${MAN_X},${MAN_Y}), scale=${SCALE.toFixed(4)}`);
console.log(`Shirt placement on man: left=${SHIRT_LEFT}, top=${SHIRT_TOP}, W=${SHIRT_W}, H=${SHIRT_H}`);

async function extractModelCutout() {
  console.log('\n[1] Extracting model from white background...');

  const { data, info } = await sharp(MODEL_SRC).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const ch = info.channels;

  // Create RGBA buffer
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4]     = data[i * ch];
    rgba[i * 4 + 1] = data[i * ch + 1];
    rgba[i * 4 + 2] = data[i * ch + 2];
    rgba[i * 4 + 3] = 255;
  }

  // BFS flood-fill from edges to remove white background
  const isBackground = (r, g, b) => r >= 238 && g >= 238 && b >= 238;
  const visited = new Uint8Array(w * h);
  const queue = [];

  const addSeed = (x, y) => {
    const idx = y * w + x;
    const pi = idx * ch;
    if (!visited[idx] && isBackground(data[pi], data[pi+1], data[pi+2])) {
      visited[idx] = 1;
      queue.push(idx);
    }
  };

  for (let x = 0; x < w; x++) { addSeed(x, 0); addSeed(x, h - 1); }
  for (let y = 0; y < h; y++) { addSeed(0, y); addSeed(w - 1, y); }

  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    rgba[idx * 4 + 3] = 0; // transparent
    const y = Math.floor(idx / w), x = idx % w;
    if (x > 0)     { const n=idx-1;   if (!visited[n]) { const pi=n*ch; if (isBackground(data[pi],data[pi+1],data[pi+2])) { visited[n]=1; queue.push(n); } } }
    if (x < w - 1) { const n=idx+1;   if (!visited[n]) { const pi=n*ch; if (isBackground(data[pi],data[pi+1],data[pi+2])) { visited[n]=1; queue.push(n); } } }
    if (y > 0)     { const n=idx-w;   if (!visited[n]) { const pi=n*ch; if (isBackground(data[pi],data[pi+1],data[pi+2])) { visited[n]=1; queue.push(n); } } }
    if (y < h - 1) { const n=idx+w;   if (!visited[n]) { const pi=n*ch; if (isBackground(data[pi],data[pi+1],data[pi+2])) { visited[n]=1; queue.push(n); } } }
  }

  const modelPng = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: CROP_LEFT, top: CROP_TOP, width: CROP_W, height: CROP_H })
    .resize(MAN_W, MAN_H, { fit: 'fill', kernel: 'lanczos3' })
    .png()
    .toBuffer();

  console.log(`   Model cutout: ${MAN_W}×${MAN_H}`);
  return modelPng;
}

async function buildOutfit(modelBuf, shirtIndex) {
  console.log(`\n[Shirt ${shirtIndex}] Compositing...`);

  const shirtSrc = `public/images/shirt/shirt${shirtIndex}_cutout.png`;

  // Resize shirt cutout to match torso dimensions
  const shirtBuf = await sharp(shirtSrc)
    .resize(SHIRT_W, SHIRT_H, { fit: 'fill', kernel: 'lanczos3' })
    .png()
    .toBuffer();

  // Overlay shirt on man
  const dressedBuf = await sharp(modelBuf)
    .composite([{
      input: shirtBuf,
      left: SHIRT_LEFT,
      top: SHIRT_TOP,
      blend: 'over',
    }])
    .png()
    .toBuffer();

  // Place on showroom background
  await sharp(BG_SRC)
    .resize(CANVAS_W, CANVAS_H, { fit: 'cover' })
    .composite([{
      input: dressedBuf,
      left: MAN_X,
      top: MAN_Y,
      blend: 'over',
    }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(`public/images/showroom_outfit_${shirtIndex}.jpg`);

  console.log(`   ✓ showroom_outfit_${shirtIndex}.jpg`);
}

async function main() {
  console.log('=== Vogue Atelier — Building 9 Showroom Outfits ===\n');
  
  const modelCutout = await extractModelCutout();
  
  // Save for inspection
  await fs.writeFile('public/images/model_cutout_v2.png', modelCutout);
  console.log('   ✓ Saved model_cutout_v2.png for inspection');

  for (let i = 1; i <= 9; i++) {
    await buildOutfit(modelCutout, i);
  }

  console.log('\n✅ All 9 outfit images generated!');
  console.log('Open http://localhost:3000/category/shirts to preview');
}

main().catch(console.error);
