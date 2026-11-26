// Izolacja kosztu kliknięcia węzła w WebKit (iPhone): które elementy malowania są drogie.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlaywright, serveDist, requireDist } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// lokalny katalog przeglądarek tylko gdy istnieje (w CI WebKit jest w domyślnej lokalizacji)
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync(path.join(HERE, '.pw-browsers'))) process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(HERE, '.pw-browsers');
requireDist();
const pw = await loadPlaywright();
const server = await serveDist();
const browser = await pw.webkit.launch();
const variants = [
  ['V1 stan wdrażany', ''],
  ['V2 bez wygaszania węzłów (opacity)', '#nodes .node.dim{opacity:1!important}'],
  ['V3 bez warstwy zależności', '#deps{display:none!important}'],
  ['V4 bez dolnego panelu i odstępu', 'body.sheet-open{padding-bottom:0!important}#side{display:none!important}'],
  ['V5 wszystko naraz (V2+V3+V4)', '#nodes .node.dim{opacity:1!important}#deps{display:none!important}body.sheet-open{padding-bottom:0!important}#side{display:none!important}'],
  ['V6 bez cienia ramki/kart (box-shadow, color-mix)', '*{box-shadow:none!important}'],
];
try {
  for (const [name, css] of variants) {
    const context = await browser.newContext({ ...pw.devices['iPhone 13'] });
    const page = await context.newPage();
    await page.route(/^(?!http:\/\/127\.0\.0\.1|http:\/\/localhost)/, (r) => r.abort());
    await page.goto(server.url);
    await page.click('nav:visible [data-tab="map"]');
    await page.waitForTimeout(2500);
    if (css) await page.addStyleTag({ content: css });
    await page.waitForTimeout(500);
    const r = [];
    for (const id of ['derrick', 'pump', 'shop', 'bank', 'tree']) {
      r.push(await page.evaluate((nid) => new Promise((res) => { const t0 = performance.now(); document.getElementById('n-' + nid).dispatchEvent(new MouseEvent('click', { bubbles: true })); requestAnimationFrame(() => requestAnimationFrame(() => res(Math.round(performance.now() - t0)))); }), id));
      await page.waitForTimeout(400);
    }
    const med = [...r].sort((a, b) => a - b)[Math.floor(r.length / 2)];
    console.log(name.padEnd(52), 'mediana', String(med).padStart(5), 'ms   ', r.join(' '));
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}
