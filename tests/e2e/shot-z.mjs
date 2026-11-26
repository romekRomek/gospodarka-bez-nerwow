import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlaywright, serveDist, requireDist } from './lib.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync(path.join(HERE, '.pw-browsers'))) process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(HERE, '.pw-browsers');
requireDist();
const pw = await loadPlaywright();
const server = await serveDist();
const browser = await pw.webkit.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1100 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(server.url);
  await page.click('[data-tab="map"]:visible');
  await page.waitForTimeout(1500);
  const b = await page.locator('.mapstack').boundingBox();
  const k = b.width / 1000;
  const [x,y,w,h]=process.argv[3].split(',').map(Number);
  await page.screenshot({ path: process.argv[2], clip: { x: b.x + x * k, y: b.y + y * k, width: w * k, height: h * k } });
} catch (e) { console.log(String(e).slice(0, 600)); } finally { await browser.close(); server.close(); }
