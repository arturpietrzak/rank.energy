#!/usr/bin/env node

/**
 * Extracts Monster Energy product data from a saved product page HTML.
 *
 * Usage: node scripts/extract-products.js
 *
 * Input:  scripts/test.html
 * Output: config/monsters.json, messages/en.json (Monsters section), messages/pl.json (Monsters section)
 *         Downloads PNG images to public/images/monsters_wip/{id}.png
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const HTML_PATH = path.join(__dirname, "test.html");
const CONFIG_PATH = path.join(__dirname, "..", "config", "monsters.json");
const EN_PATH = path.join(__dirname, "..", "messages", "en.json");
const PL_PATH = path.join(__dirname, "..", "messages", "pl.json");
const IMG_DIR = path.join(__dirname, "..", "public", "images", "monsters_wip");

const CDN_BASE = "https://web-assests.monsterenergy.com/mnst";

// ---- Parse HTML ----

function extractProducts() {
  const html = fs.readFileSync(HTML_PATH, "utf-8");

  // Match each product card: <a class="...product-card..." data-product-id="..." href="...">...</a>
  // We need to find the closure. Use a simpler approach: match the anchor open tag,
  // then capture until the next </a>
  const cardRegex =
    /<a\b[^>]*class="[^"]*product-card[^"]*"[^>]*data-product-id="(\d+)"[^>]*>([\s\S]*?)<\/a>/gi;

  const products = [];
  let match;

  while ((match = cardRegex.exec(html)) !== null) {
    const productId = match[1];
    const inner = match[2];

    // Extract product name from <h3 class="product-name">
    const nameMatch = inner.match(
      /<h3\b[^>]*class="[^"]*product-name[^"]*"[^>]*>([\s\S]*?)<\/h3>/i
    );
    const name = nameMatch ? nameMatch[1].trim() : "";

    // Skip empty names
    if (!name) continue;

    // Decode HTML entities
    const decodedName = name
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      )
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
      .replace(/&#x9;/g, "") // remove tabs
      .trim();

    // Skip duplicates by original product-id
    if (products.some((p) => p.originalId === productId)) continue;

    // Extract category from <p class="category-name">
    const catMatch = inner.match(
      /<p\b[^>]*class="[^"]*category-name[^"]*"[^>]*>([\s\S]*?)<\/p>/i
    );
    const category = catMatch ? catMatch[1].trim() : "";

    // Extract image UUID from src="https://web-assests.monsterenergy.com/mnst/{uuid}.png"
    const imgMatch = inner.match(
      /https:\/\/web-assests\.monsterenergy\.com\/mnst\/([a-f0-9-]+)\.(?:png|webp)/i
    );
    const imageUuid = imgMatch ? imgMatch[1] : null;

    products.push({
      originalId: productId,
      name: decodedName,
      category,
      imageUuid,
      imageUrl: imageUuid ? `${CDN_BASE}/${imageUuid}.png` : null,
    });
  }

  return products;
}

// ---- Sort: Viking Berry first, then by appearance order ----

function sortProducts(products) {
  const vikingIdx = products.findIndex(
    (p) => p.name.toLowerCase() === "viking berry"
  );
  const result = [...products];

  if (vikingIdx > 0) {
    const [viking] = result.splice(vikingIdx, 1);
    result.unshift(viking);
  }

  return result;
}

// ---- Download image ----

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Follow redirect
          https.get(response.headers.location, (res) => {
            res.pipe(file);
            file.on("finish", () => {
              file.close();
              resolve();
            });
          });
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlinkSync(destPath);
        reject(err);
      });
  });
}

// ---- Main ----

async function main() {
  console.log("Extracting products from test.html...\n");

  const raw = extractProducts();
  console.log(`Found ${raw.length} products\n`);

  const products = sortProducts(raw);

  // Ensure output dir
  if (!fs.existsSync(IMG_DIR)) {
    fs.mkdirSync(IMG_DIR, { recursive: true });
  }

  // Download images
  console.log("Downloading images...\n");
  for (let i = 0; i < products.length; i++) {
    const id = i + 1;
    const p = products[i];
    const destPath = path.join(IMG_DIR, `${id}.png`);

    if (!p.imageUrl) {
      console.log(`  #${id} ${p.name} — NO IMAGE`);
      continue;
    }

    try {
      console.log(`  #${id} ${p.name} — downloading...`);
      await downloadImage(p.imageUrl, destPath);
      console.log(`    ✓ saved`);
    } catch (err) {
      console.log(`    ✗ failed: ${err.message}`);
    }
  }

  // ---- Write config ----
  const config = {
    monsters: products.map((p, i) => ({
      id: i + 1,
      image: `/images/monsters/${i + 1}-thumb.webp`,
      imageDetail: `/images/monsters/${i + 1}.webp`,
    })),
  };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
  console.log(`\n✓ config/monsters.json written`);

  // ---- Write i18n ----
  const monstersEn = {};
  const monstersPl = {};
  for (let i = 0; i < products.length; i++) {
    const id = i + 1;
    monstersEn[id] = { name: products[i].name };
    monstersPl[id] = { name: products[i].name };
  }

  // Update existing en.json (preserve other sections)
  const enRaw = JSON.parse(fs.readFileSync(EN_PATH, "utf-8"));
  enRaw.Monsters = monstersEn;
  fs.writeFileSync(EN_PATH, JSON.stringify(enRaw, null, 2) + "\n");
  console.log(`✓ messages/en.json updated`);

  // Update existing pl.json
  const plRaw = JSON.parse(fs.readFileSync(PL_PATH, "utf-8"));
  plRaw.Monsters = monstersPl;
  fs.writeFileSync(PL_PATH, JSON.stringify(plRaw, null, 2) + "\n");
  console.log(`✓ messages/pl.json updated`);

  console.log(`\nDone. ${products.length} products extracted.`);
  console.log(`Run: node scripts/process-images.js`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
