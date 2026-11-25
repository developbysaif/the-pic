/**
 * fix_shirt_halo.mjs
 * 
 * Removes the white/gray shadow halo from shirt cutouts.
 * The product photos have a gray shadow at the bottom hem that appears
 * as a white crescent when composited.
 * 
 * Fix: Scan each shirt cutout, find border pixels (alpha=255 but gray/near-white),
 * and either remove them or replace with the dominant shirt color.
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';

async function fixShirtHalo(shirtIndex) {
  const src = `public/images/shirt/shirt${shirtIndex}_cutout.png`;
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  
  if (ch !== 4) {
    console.log(`shirt${shirtIndex}: no alpha channel, skipping`);
    return;
  }
  
  // For each opaque pixel, check if it's a gray/near-white "shadow" pixel
  // at the edges of the shirt silhouette.
  // Gray shadow pixels: R≈G≈B (neutral gray) AND near outer boundary of the silhouette
  // We identify them by checking if they're at the border of opaque region (neighbor has alpha=0)
  
  // Build a copy
  const out = Buffer.from(data);
  
  // First pass: identify border pixels (opaque pixels with at least one transparent neighbor)
  // Second pass: for border pixels, check if they're gray shadow → make transparent
  
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * ch;
      const a = data[idx + 3];
      if (a < 255) continue; // skip transparent
      
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      
      // Check if this is a gray/near-white pixel
      const isGray = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && r > 150;
      if (!isGray) continue;
      
      // Check if it's near the border (has at least one transparent neighbor in 3x3 area)
      let isBorder = false;
      for (let dy = -3; dy <= 3 && !isBorder; dy++) {
        for (let dx = -3; dx <= 3 && !isBorder; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny < 0 || ny >= h || nx < 0 || nx >= w) { isBorder = true; break; }
          const nIdx = (ny * w + nx) * ch;
          if (data[nIdx + 3] === 0) isBorder = true;
        }
      }
      
      if (isBorder) {
        // Gray border pixel — make transparent to remove shadow fringe
        out[idx + 3] = 0;
      }
    }
  }
  
  const fixedBuf = await sharp(out, { raw: { width: w, height: h, channels: ch } })
    .png()
    .toBuffer();
  
  // Save fixed cutout
  const fixedPath = `public/images/shirt/shirt${shirtIndex}_cutout_halo_fixed.png`;
  await fs.writeFile(fixedPath, fixedBuf);
  console.log(`  shirt${shirtIndex}: saved ${fixedPath}`);
  return fixedPath;
}

async function main() {
  console.log('=== Fixing shirt halo on all 9 shirts ===');
  for (let i = 1; i <= 9; i++) {
    await fixShirtHalo(i);
  }
  console.log('Done!');
}

main().catch(console.error);
