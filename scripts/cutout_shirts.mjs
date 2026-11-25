import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

async function processShirts() {
  const shirtDir = 'public/images/shirt';

  for (let idx = 1; idx <= 9; idx++) {
    const inputPath = path.join(shirtDir, `shirt${idx}.jpeg`);
    const outputPath = path.join(shirtDir, `shirt${idx}_cutout.png`);

    const { data, info } = await sharp(inputPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const w = info.width;
    const h = info.height;
    const visited = new Uint8Array(w * h);
    const queue = [];

    // Push all border pixels to flood fill background
    for (let x = 0; x < w; x++) {
      queue.push(x);
      queue.push((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      queue.push(y * w);
      queue.push(y * w + (w - 1));
    }

    let head = 0;
    while (head < queue.length) {
      const p = queue[head++];
      if (visited[p]) continue;
      visited[p] = 1;

      const pxIdx = p * 4;
      const r = data[pxIdx];
      const g = data[pxIdx + 1];
      const b = data[pxIdx + 2];

      const minVal = Math.min(r, g, b);
      const maxVal = Math.max(r, g, b);

      // Clean background threshold
      // For white borders, brightness >= 242 and low color delta
      if (minVal >= 238 && (maxVal - minVal) <= 12) {
        data[pxIdx + 3] = 0;
        const x = p % w;
        const y = Math.floor(p / w);
        if (x > 0 && !visited[p - 1]) queue.push(p - 1);
        if (x < w - 1 && !visited[p + 1]) queue.push(p + 1);
        if (y > 0 && !visited[p - w]) queue.push(p - w);
        if (y < h - 1 && !visited[p + w]) queue.push(p + w);
      }
    }

    // Also remove bottom cast shadow outside the shirt bottom curve
    for (let y = Math.floor(h * 0.94); y < h; y++) {
      for (let x = 0; x < w; x++) {
        const p = y * w + x;
        const pxIdx = p * 4;
        const r = data[pxIdx];
        const g = data[pxIdx + 1];
        const b = data[pxIdx + 2];
        const minVal = Math.min(r, g, b);
        if (minVal > 220 && (x < w * 0.25 || x > w * 0.75 || y > h * 0.96)) {
          data[pxIdx + 3] = 0;
        }
      }
    }

    await sharp(data, { raw: { width: w, height: h, channels: 4 } })
      .png({ compressionLevel: 8 })
      .toFile(outputPath);

    console.log(`Processed shirt${idx}_cutout.png`);
  }
}

processShirts().catch(console.error);
