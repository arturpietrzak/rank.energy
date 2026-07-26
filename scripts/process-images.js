#!/usr/bin/env node

/**
 * Processes Monster images from PNG source to WebP output.
 *
 * Usage: node scripts/process-images.js
 *
 * Reads: public/images/monsters_wip/{id}.png
 * Outputs:
 *   public/images/monsters/{id}.webp       — detail (original proportions, WebP)
 *   public/images/monsters/{id}-thumb.webp — square thumbnail (200×200, WebP)
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "..", "public", "images", "monsters_wip");
const OUT_DIR = path.join(__dirname, "..", "public", "images", "monsters");
const THUMB_SIZE = 200;

async function processImage(id) {
  const srcPath = path.join(SRC_DIR, `${id}.png`);
  if (!fs.existsSync(srcPath)) {
    console.log(`  SKIP: ${srcPath} not found`);
    return;
  }

  const detailOut = path.join(OUT_DIR, `${id}.webp`);
  const thumbOut = path.join(OUT_DIR, `${id}-thumb.webp`);

  // Get original metadata
  const meta = await sharp(srcPath).metadata();
  console.log(
    `  Processing #${id}: ${meta.width}×${meta.height} (${(meta.size / 1024).toFixed(0)}KB PNG)`
  );

  // --- Detail image: convert to WebP, keep original dimensions ---
  await sharp(srcPath)
    .webp({ quality: 85 })
    .toFile(detailOut);

  const detailStat = fs.statSync(detailOut);
  console.log(
    `    → detail: ${detailOut} (${(detailStat.size / 1024).toFixed(0)}KB WebP)`
  );

  // --- Thumbnail: fit within 200×200, center on transparent square ---
  // First, resize to fit within the thumbnail bounds, maintaining aspect ratio
  const thumbBuf = await sharp(srcPath)
    .resize(THUMB_SIZE, THUMB_SIZE, { fit: "inside", withoutEnlargement: true })
    .toBuffer();

  const thumbMeta = await sharp(thumbBuf).metadata();

  // Calculate position to center on a square canvas
  const left = Math.floor((THUMB_SIZE - thumbMeta.width) / 2);
  const top = Math.floor((THUMB_SIZE - thumbMeta.height) / 2);

  await sharp({
    create: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: thumbBuf, left, top }])
    .webp({ quality: 85 })
    .toFile(thumbOut);

  const thumbStat = fs.statSync(thumbOut);
  console.log(
    `    → thumb:  ${thumbOut} (${(thumbStat.size / 1024).toFixed(0)}KB WebP)`
  );
}

async function main() {
  console.log("Processing monster images...\n");

  // Find all {id}.png files in source dir
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`Source directory not found: ${SRC_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SRC_DIR);
  const ids = files
    .filter((f) => /^\d+\.png$/i.test(f))
    .map((f) => parseInt(f.replace(/\.png$/i, ""), 10))
    .sort((a, b) => a - b);

  if (ids.length === 0) {
    console.log("No images found in", SRC_DIR);
    process.exit(0);
  }

  console.log(`Found ${ids.length} image(s): IDs ${ids.join(", ")}\n`);

  for (const id of ids) {
    await processImage(id);
  }

  console.log(`\nDone. ${ids.length} image(s) processed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
