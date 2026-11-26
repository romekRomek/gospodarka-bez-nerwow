// Zrzuty mapy w WebKit (iPhone) przy kilku pozycjach przewinięcia poziomego: widać, co użytkownik naprawdę widzi.
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
  const context = await browser.newContext({ ...pw.devices['iPhone 13'] });
  const page = await context.newPage();
  await page.route(/^(?!http:\/\/127\.0\.0\.1|http:\/\/localhost)/, (r) => r.abort());
  await page.goto(server.url);
  await page.click('nav:visible [data-tab="map"]');
  await page.waitForTimeout(1500);
  const out = process.argv[2] || '.';
  const info = await page.evaluate(() => { const m = document.getElementById('map'); return { scrollW: m.scrollWidth, clientW: m.clientWidth, scrollLeft: m.scrollLeft }; });
  console.log(JSON.stringify(info));
  for (const [name, frac] of [['lewo', 0], ['srodek', 0.5], ['prawo', 1]]) {
    await page.evaluate((f) => { const m = document.getElementById('map'); m.scrollLeft = (m.scrollWidth - m.clientWidth) * f; window.scrollTo(0, 0); }, frac);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(out, `route-${name}.png`) });
  }
  await context.close();
} finally {
  await browser.close();
  server.close();
}
