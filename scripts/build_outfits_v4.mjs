/**
 * build_outfits_v4.mjs
 * 
 * Final version with corrected shirt positioning.
 * 
 * Key fixes:
 * 1. Shirt placed 40px lower to avoid covering chin
 * 2. Shirt slightly wider to better cover arm areas
 * 3. Edge erosion on shirt cutout to remove white fringing
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

// CORRECTED Shirt placement on man-space
// Original image: collar/neckline at y≈350 (after inspecting, need to lower to ~y=380)
// In crop space: (380-116) = 264 → man: 264*0.5034 ≈ 133
// Wide body from x=310 to x=840 at chest → crop: 150..680 → man: 76..342
// Making shirt slightly wider (10px each side): left=66, right=352 → W=286
// Keep aspect ratio 0.75: H = 286/0.75 = 381

const SHIRT_LEFT = 60;    // slightly outside left shoulder
const SHIRT_TOP = 110;    // collar starts here (below chin, at neck)
const SHIRT_W = 310;      // full shoulder+arm width
const SHIRT_H = Math.round(SHIRT_W / 0.75); // 413 — maintain shirt aspect ratio

console.log(`Canvas: ${CANVAS_W}×${CANVAS_H}`);
console.log(`Man: ${MAN_W}×${MAN_H} at (${MAN_X},${MAN_Y})`);
console.log(`Shirt: left=${SHIRT_LEFT}, top=${SHIRT_TOP}, W=${SHIRT_W}, H=${SHIRT_H}`);

async function prepareShirtCutout(shirtIndex) {
  const src = `public/images/shirt/shirt${shirtIndex}_cutout.png`;
  
  // Load cutout, resize to target, then trim semi-transparent white fringing
  // by reducing alpha of near-white edge pixels
  const { data, info } = await sharp(src)
    .resize(SHIRT_W, SHIRT_H, { fit: 'fill', kernel: 'lanczos3' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const w = info.width, h = info.height, ch = info.channels;
  
  // Edge cleanup: reduce alpha for semi-transparent pixels near edges
  // and for pixels that look like white shadows/halos
  for (let i = 0; i < w * h; i++) {
    const r = data[i * ch], g = data[i * ch + 1], b = data[i * ch + 2];
    const a = ch === 4 ? data[i * ch + 3] : 255;
    
    if (ch === 4) {
      // Suppress near-white semi-transparent pixels (halo/fringing from product shadow)
      const brightness = (r + g + b) / 3;
      if (brightness > 230 && a < 200) {
        // This is a white halo pixel — make it more transparent
        data[i * ch + 3] = Math.round(a * 0.3);
      } else if (brightness > 240 && a < 255) {
        data[i * ch + 3] = 0;
      }
    }
  }
  
  return sharp(data, { raw: { width: w, height: h, channels: ch } }).png().toBuffer();
}

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
    if (x > 0)     { const n=idx-1;   if (!visited[n]) { const pi=n*ch; if (isWhiteBg(data[pi],data[pi+1],data[pi+2])) { visited[n]=1; queue.push(n); } } }
    if (x < w - 1) { const n=idx+1;   if (!visited[n]) { const pi=n*ch; if (isWhiteBg(data[pi],data[pi+1],data[pi+2])) { visited[n]=1; queue.push(n); } } }
    if (y > 0)     { const n=idx-w;   if (!visited[n]) { const pi=n*ch; if (isWhiteBg(data[pi],data[pi+1],data[pi+2])) { visited[n]=1; queue.push(n); } } }
    if (y < h - 1) { const n=idx+w;   if (!visited[n]) { const pi=n*ch; if (isWhiteBg(data[pi],data[pi+1],data[pi+2])) { visited[n]=1; queue.push(n); } } }
  }

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

  console.log(`✓`);
}

async function main() {
  console.log('=== Vogue Atelier — Building Showroom Outfits v4 ===');
  const modelCutout = await extractModelCutout();
  await fs.writeFile('public/images/model_cutout_v4.png', modelCutout);
  
  for (let i = 1; i <= 9; i++) {
    await buildOutfit(modelCutout, i);
  }
  
  console.log('\n✅ All 9 outfit images done!');
}

main().catch(console.error);
