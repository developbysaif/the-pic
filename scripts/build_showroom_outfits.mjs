/**
 * build_showroom_outfits.mjs
 * 
 * Generates 9 premium showroom outfit images for ShirtFittingRoomHeader.jsx
 * 
 * Strategy:
 * 1. Extract the man from test_model.jpg (white BG removal via flood-fill)
 * 2. Composite shirt cutout over his torso (cover the black t-shirt)
 * 3. Place dressed man on showroom_bg_clean.jpg
 * 4. Output: public/images/showroom_outfit_N.jpg (1600×1020) for N=1..9
 */

import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';

const CANVAS_W = 1600;
const CANVAS_H = 1020;

// test_model.jpg measurements (1200x1800):
//   headTop=131, feetBottom=1731, centerX=597
//   shoulders at y=371, left=534, right=660 (w=126 — just top of shoulders visible)
//   waist at y=931, left=327, right=783 (w=456)
// 
// We want the man to be ~760px tall in the final 1600x1020 canvas
// Scale factor: 760 / (1731 - 131) = 760/1600 = 0.475
// But we need to crop to just the body first, then resize.

const MODEL_SRC = 'public/images/test_model.jpg';
const BG_SRC = 'public/images/showroom_bg_clean.jpg';

// Body crop from test_model.jpg (with 10px padding around detected body)
const BODY_TOP = Math.max(0, 131 - 15);       // head top - little extra for head room
const BODY_BOTTOM = Math.min(1800, 1731 + 10);
const BODY_LEFT = Math.max(0, 180);            // slightly inset from edge for clean extraction
const BODY_RIGHT = Math.min(1200, 1010);

const CROP_W = BODY_RIGHT - BODY_LEFT;
const CROP_H = BODY_BOTTOM - BODY_TOP;

// Target man height in canvas (slightly below canvas height for natural look)
const MAN_H_TARGET = 820;
const MAN_W_TARGET = Math.round(CROP_W * (MAN_H_TARGET / CROP_H));

// Position man center-bottom: feet near canvas bottom
const MAN_X = Math.round((CANVAS_W - MAN_W_TARGET) / 2);
const MAN_Y = CANVAS_H - MAN_H_TARGET - 10; // 10px from canvas bottom

console.log(`Body crop: ${CROP_W}×${CROP_H} from (${BODY_LEFT},${BODY_TOP})`);
console.log(`Man target: ${MAN_W_TARGET}×${MAN_H_TARGET} at (${MAN_X},${MAN_Y})`);

// Scale factor for coordinates from original model image to final resized man
const SCALE = MAN_H_TARGET / CROP_H;

// Shirt placement on the MAN (after resize), relative to crop top-left:
// In original test_model.jpg: shirt covers from ~y=310 (collar) to ~y=940 (hem)
// In crop coords: (310 - BODY_TOP) to (940 - BODY_TOP)
// After SCALE: multiply by SCALE

const collarYOrig = 310;   // collar/neckline in original
const hemYOrig = 970;      // shirt hem in original
const shoulderLOrig = 480; // left shoulder edge in original
const shoulderROrig = 740; // right shoulder edge in original

// In crop space:
const collarYCrop = collarYOrig - BODY_TOP;
const hemYCrop = hemYOrig - BODY_TOP;
const shoulderLCrop = shoulderLOrig - BODY_LEFT;
const shoulderRCrop = shoulderROrig - BODY_LEFT;

// In man-resized space:
const shirtTop = Math.round(collarYCrop * SCALE);
const shirtBottom = Math.round(hemYCrop * SCALE);
const shirtLeft = Math.round(shoulderLCrop * SCALE);
const shirtRight = Math.round(shoulderRCrop * SCALE);
const shirtH = shirtBottom - shirtTop;
const shirtW = shirtRight - shirtLeft;

console.log(`Shirt placement on man: top=${shirtTop}, left=${shirtLeft}, W=${shirtW}, H=${shirtH}`);

async function extractModelCutout() {
  console.log('\n[1] Extracting model from white background...');
  
  // Get raw pixels
  const { data, info } = await sharp(MODEL_SRC)
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const w = info.width, h = info.height;
  const ch = info.channels; // 3 for RGB
  const alphaData = Buffer.alloc(w * h * 4);
  
  // Copy RGB + compute alpha via flood fill from all 4 edges (white bg removal)
  for (let i = 0; i < w * h; i++) {
    alphaData[i * 4]     = data[i * ch];
    alphaData[i * 4 + 1] = data[i * ch + 1];
    alphaData[i * 4 + 2] = data[i * ch + 2];
    alphaData[i * 4 + 3] = 255;
  }
  
  // Flood fill from edges to find background
  const visited = new Uint8Array(w * h);
  const queue = [];
  
  const isBackground = (r, g, b) => r >= 240 && g >= 240 && b >= 240;
  
  // Seed from all 4 edges
  for (let x = 0; x < w; x++) {
    for (const y of [0, h - 1]) {
      const idx = y * w + x;
      const r = data[idx * ch], g = data[idx * ch + 1], b = data[idx * ch + 2];
      if (isBackground(r, g, b) && !visited[idx]) {
        visited[idx] = 1;
        queue.push(idx);
      }
    }
  }
  for (let y = 0; y < h; y++) {
    for (const x of [0, w - 1]) {
      const idx = y * w + x;
      const r = data[idx * ch], g = data[idx * ch + 1], b = data[idx * ch + 2];
      if (isBackground(r, g, b) && !visited[idx]) {
        visited[idx] = 1;
        queue.push(idx);
      }
    }
  }
  
  // BFS flood fill
  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    alphaData[idx * 4 + 3] = 0; // make background transparent
    
    const y = Math.floor(idx / w);
    const x = idx % w;
    const neighbors = [
      x > 0 ? idx - 1 : -1,
      x < w - 1 ? idx + 1 : -1,
      y > 0 ? idx - w : -1,
      y < h - 1 ? idx + w : -1,
    ];
    
    for (const nIdx of neighbors) {
      if (nIdx < 0 || visited[nIdx]) continue;
      const r = data[nIdx * ch], g = data[nIdx * ch + 1], b = data[nIdx * ch + 2];
      if (isBackground(r, g, b)) {
        visited[nIdx] = 1;
        queue.push(nIdx);
      }
    }
  }
  
  // Build PNG with RGBA
  const modelPng = await sharp(alphaData, {
    raw: { width: w, height: h, channels: 4 }
  })
  .extract({ left: BODY_LEFT, top: BODY_TOP, width: CROP_W, height: CROP_H })
  .resize(MAN_W_TARGET, MAN_H_TARGET, { fit: 'fill' })
  .png()
  .toBuffer();
  
  console.log(`   Model cutout: ${MAN_W_TARGET}×${MAN_H_TARGET}`);
  return modelPng;
}

async function buildOutfit(modelCutoutBuf, shirtIndex) {
  console.log(`\n[Shirt ${shirtIndex}] Building outfit...`);
  
  const shirtSrc = `public/images/shirt/shirt${shirtIndex}_cutout.png`;
  
  // Resize shirt cutout to fit the torso region
  const shirtBuf = await sharp(shirtSrc)
    .resize(shirtW, shirtH, { fit: 'fill' })
    .png()
    .toBuffer();
  
  // Composite shirt over model (cover the black t-shirt)
  const dressedModelBuf = await sharp(modelCutoutBuf)
    .composite([{
      input: shirtBuf,
      left: shirtLeft,
      top: shirtTop,
      blend: 'over',
    }])
    .png()
    .toBuffer();
  
  // Composite dressed model onto showroom background
  const outputBuf = await sharp(BG_SRC)
    .resize(CANVAS_W, CANVAS_H, { fit: 'cover' })
    .composite([{
      input: dressedModelBuf,
      left: MAN_X,
      top: MAN_Y,
      blend: 'over',
    }])
    .jpeg({ quality: 90 })
    .toBuffer();
  
  const outPath = `public/images/showroom_outfit_${shirtIndex}.jpg`;
  await fs.writeFile(outPath, outputBuf);
  console.log(`   ✓ Saved ${outPath}`);
}

async function main() {
  console.log('=== Building Showroom Outfit Images ===\n');
  
  // Step 1: Extract model once (reuse for all 9 shirts)
  const modelCutout = await extractModelCutout();
  
  // Save model for inspection
  await fs.writeFile('public/images/model_extracted.png', modelCutout);
  console.log('   ✓ Saved model_extracted.png for inspection');
  
  // Step 2: Build each outfit
  for (let i = 1; i <= 9; i++) {
    await buildOutfit(modelCutout, i);
  }
  
  console.log('\n=== All 9 outfit images generated successfully! ===');
}

main().catch(console.error);
