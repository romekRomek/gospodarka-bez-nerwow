// Czas pokazania zakładki Mapa w WebKit (iPhone): od kliknięcia do trzeciej klatki, mediana z 5 prób. Strażnik: powyżej MAX_MS kończy błędem.
// Wykrył, że filtry CSS (drop-shadow, url(#rough)) na węzłach mapy kosztowały ok. 600 ms mimo trybu lekkiego.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlaywright, serveDist, requireDist } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync(path.join(HERE, '.pw-browsers'))) process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(HERE, '.pw-browsers');
const MAX_MS = Number(process.env.MAX_MS || 400);
requireDist();
const pw = await loadPlaywright();
const server = await serveDist();
const browser = await pw.webkit.launch();
let fail = false;
try {
  const context = await browser.newContext({ ...pw.devices['iPhone 13'] });
  const page = await context.newPage();
  await page.goto(server.url, { waitUntil: 'load' });
  const times = [];
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => document.querySelector('nav [data-tab="cal"]').click());
    await page.waitForTimeout(500);
    times.push(await page.evaluate(() => new Promise((res) => {
      const t = performance.now(); document.querySelector('nav [data-tab="map"]').click();
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => res(Math.round(performance.now() - t)))));
    })));
    await page.waitForTimeout(400);
  }
  const med = [...times].sort((a, b) => a - b)[2];
  console.log(`Pokazanie zakładki Mapa (iPhone, WebKit): mediana ${med} ms (${times.join(' ')}), próg ${MAX_MS} ms`);
  if (med > MAX_MS) { console.log('BŁĄD: za wolno'); fail = true; }
  await context.close();
} finally {
  await browser.close();
  server.close();
}
process.exit(fail ? 1 : 0);
