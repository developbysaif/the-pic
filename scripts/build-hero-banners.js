const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createBanners() {
  const bgPath = 'public/images/showroom_bg_clean.jpg';
  const bgMeta = await sharp(bgPath).metadata();
  console.log('Showroom size:', bgMeta.width, 'x', bgMeta.height);

  const suits = [
    {
      file: 'header_suit_1.png',
      name: 'hero_clothes_magenta.jpg',
      title: 'Gul-e-Noor Magenta Embroidered 3-Piece Lawn Suit',
    },
    {
      file: 'header_suit_2.png',
      name: 'hero_clothes_mint.jpg',
      title: 'Zeenat Mint Aqua Embroidered 3-Piece Lawn Suit',
    },
    {
      file: 'header_suit_3.png',
      name: 'hero_clothes_violet.jpg',
      title: 'Banafsha Royal Violet 3-Piece Lawn Suit',
    },
    {
      file: 'header_suit_4.png',
      name: 'hero_clothes_amber.jpg',
      title: 'Amber Ochre Golden 3-Piece Lawn Suit',
    },
  ];

  for (const s of suits) {
    const inputPath = path.join('public/images/clothes', s.file);
    const modelHeight = Math.round(bgMeta.height * 0.84); // 84% height, grand full-length view

    // Trim model and resize to target height
    const model = await sharp(inputPath)
      .trim()
      .resize({ height: modelHeight, fit: 'inside' })
      .toBuffer({ resolveWithObject: true });

    // Position model at 50% width (center-right), leaving the left half clear for typography & CTAs
    const left = Math.round(bgMeta.width * 0.50);
    const top = bgMeta.height - model.info.height - 35;

    // Build realistic soft floor shadow under feet
    const shadowW = Math.round(model.info.width * 0.7);
    const shadowH = 24;
    const shadowSvg = `
      <svg width="${shadowW}" height="${shadowH}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#1A120B" stop-opacity="0.45" />
            <stop offset="60%" stop-color="#1A120B" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#1A120B" stop-opacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="${shadowW / 2}" cy="${shadowH / 2}" rx="${shadowW * 0.48}" ry="${shadowH * 0.45}" fill="url(#grad)" />
      </svg>
    `;
    const shadowPng = await sharp(Buffer.from(shadowSvg)).png().toBuffer();
    const shadowLeft = left + Math.round((model.info.width - shadowW) / 2);
    const shadowTop = top + model.info.height - 12;

    const outputPath = path.join('public/images/clothes', s.name);
    await sharp(bgPath)
      .composite([
        { input: shadowPng, left: shadowLeft, top: shadowTop },
        { input: model.data, left: left, top: top },
      ])
      .jpeg({ quality: 94 })
      .toFile(outputPath);

    console.log(`Created banner for ${s.title} -> ${outputPath}`);
  }

  // Also build an ultra-luxury Watch showroom banner for Royal Obsidian Chronograph X
  const watchPath = 'public/images/watches/watch_obsidian_cutout.png';
  const watchHeight = Math.round(bgMeta.height * 0.62);
  const watchModel = await sharp(watchPath)
    .trim()
    .resize({ height: watchHeight, fit: 'inside' })
    .toBuffer({ resolveWithObject: true });

  const watchLeft = Math.round(bgMeta.width * 0.52);
  const watchTop = Math.round((bgMeta.height - watchModel.info.height) / 2) + 20;

  const watchShadowW = Math.round(watchModel.info.width * 0.85);
  const watchShadowH = 28;
  const watchShadowSvg = `
    <svg width="${watchShadowW}" height="${watchShadowH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="wgrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0F0B08" stop-opacity="0.55" />
          <stop offset="65%" stop-color="#0F0B08" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#0F0B08" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="${watchShadowW / 2}" cy="${watchShadowH / 2}" rx="${watchShadowW * 0.48}" ry="${watchShadowH * 0.45}" fill="url(#wgrad)" />
    </svg>
  `;
  const watchShadowPng = await sharp(Buffer.from(watchShadowSvg)).png().toBuffer();
  const watchShadowLeft = watchLeft + Math.round((watchModel.info.width - watchShadowW) / 2);
  const watchShadowTop = watchTop + watchModel.info.height - 10;

  const watchOutputPath = 'public/images/watches/hero_watch_obsidian.jpg';
  await sharp(bgPath)
    .composite([
      { input: watchShadowPng, left: watchShadowLeft, top: watchShadowTop },
      { input: watchModel.data, left: watchLeft, top: watchTop },
    ])
    .jpeg({ quality: 94 })
    .toFile(watchOutputPath);

  console.log(`Created watch banner -> ${watchOutputPath}`);
}

createBanners().catch(console.error);
