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
  const dev = pw.devices[process.argv[3] || 'iPhone 15 Pro'] || pw.devices['iPhone 13'];
  const ctx = await browser.newContext({ ...dev, colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.goto(server.url);
  await page.tap('nav:visible [data-tab="map"]');
  await page.waitForTimeout(1200);
  const info = await page.evaluate(() => {
    const r = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
    return { vw: innerWidth, map: r(document.getElementById('map')), stack: r(document.querySelector('.mapstack')), base: r(document.querySelector('svg.base')), ov: r(document.getElementById('sv')), scrollW: document.getElementById('map').scrollWidth };
  });
  console.log(JSON.stringify(info));
  await page.screenshot({ path: process.argv[2] });
} catch (e) { console.log(String(e).slice(0, 500)); } finally { await browser.close(); server.close(); }
