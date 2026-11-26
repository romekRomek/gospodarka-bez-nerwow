// Zrzut zakładki Mapa w WebKit z emulacją iPhone'a (pomocnicze do diagnozy; wynik w katalogu podanym jako argument).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlaywright, serveDist, requireDist } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(HERE, '.pw-browsers');
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
  await page.waitForTimeout(1000);
  const info = await page.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; };
    const sc = document.getElementById('map');
    return { viewport: [innerWidth, innerHeight], scroller: r('#map'), svg: r('#sv'), legend: r('.legend'), derrick: r('#n-derrick'), scrollerOverflow: getComputedStyle(sc).overflow + '/' + getComputedStyle(sc).overflowX, scrollW: sc.scrollWidth, clientW: sc.clientWidth };
  });
  console.log(JSON.stringify(info));
  await page.screenshot({ path: path.join(process.argv[2] || '.', 'webkit-map-iphone.png'), fullPage: false });
  await context.close();
} finally {
  await browser.close();
  server.close();
}
