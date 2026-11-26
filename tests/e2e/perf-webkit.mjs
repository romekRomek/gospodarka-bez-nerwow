// Pomiar płynności mapy w prawdziwym WebKit (silnik Safari) z emulacją iPhone'a.
// Użycie: PLAYWRIGHT_BROWSERS_PATH=tests/e2e/.pw-browsers node tests/e2e/perf-webkit.mjs
// Instalacja silnika (raz): PLAYWRIGHT_BROWSERS_PATH=tests/e2e/.pw-browsers npx playwright-core install webkit
// To pomiar względny (komputer jest szybszy niż telefon): porównujemy warianty między sobą, nie z limitem.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlaywright, serveDist, requireDist } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// lokalny katalog przeglądarek tylko gdy istnieje (w CI WebKit jest w domyślnej lokalizacji)
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync(path.join(HERE, '.pw-browsers'))) process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(HERE, '.pw-browsers');
requireDist();
const pw = await loadPlaywright();
const DESKTOP = process.env.DEVICE === 'desktop';
const device = DESKTOP ? { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 } : pw.devices['iPhone 13'];
const server = await serveDist();

async function frames(page, ms = 4000) {
  return page.evaluate((span) => new Promise((resolve) => {
    const t = []; let last = performance.now(); const end = last + span;
    function f(now) { t.push(now - last); last = now; if (now < end) requestAnimationFrame(f); else resolve(t); }
    requestAnimationFrame(f);
  }), ms);
}
const stat = (t) => {
  const s = [...t].sort((a, b) => a - b), n = s.length;
  return { klatek: n, srednia_ms: +(t.reduce((a, b) => a + b, 0) / n).toFixed(1), p95_ms: +s[Math.floor(n * 0.95)].toFixed(1), max_ms: +s[n - 1].toFixed(1), powyzej_50ms: t.filter((x) => x > 50).length, fps: +(n / (t.reduce((a, b) => a + b, 0) / 1000)).toFixed(1) };
};

const noAnim = (page) => page.addStyleTag({ content: '*{animation:none!important}' }).then(() => page.evaluate(() => { const sv = document.getElementById('sv'); sv.pauseAnimations(); document.querySelectorAll('animateMotion').forEach((e) => e.remove()); }));
const noFilter = (page) => page.evaluate(() => document.querySelectorAll('svg.map [filter]').forEach((e) => e.removeAttribute('filter')));
const variants = [
  ['A: stan obecny (filtry + animacje)', async () => {}],
  ['B: bez filtrów SVG', noFilter],
  ['C: filtry zostają, bez animacji', noAnim],
  ['D: bez filtrów i bez animacji', async (page) => { await noFilter(page); await noAnim(page); }],
  ['E: jak D, bez przejść przezroczystości węzłów', async (page) => { await noFilter(page); await noAnim(page); await page.addStyleTag({ content: '.node,#deps .dep{transition:none!important}' }); }],
];

const ONLY = process.env.ONLY;          // np. ONLY=A (tylko stan wdrażany)
const MIN_FPS = Number(process.env.MIN_FPS || 0);   // próg: poniżej kończy z błędem (strażnik regresji)
let failed = false;
const browser = await pw.webkit.launch();
try {
  for (const [name, prep] of variants.filter(([n]) => !ONLY || n.startsWith(ONLY))) {
    const context = await browser.newContext({ ...device });
    const page = await context.newPage();
    await page.route(/^(?!http:\/\/127\.0\.0\.1|http:\/\/localhost)/, (r) => r.abort());
    await page.goto(server.url);
    await page.waitForTimeout(1500);
    if (name.startsWith('A:')) console.log('KALIBRACJA, zakładka Start (lekka):', JSON.stringify(stat(await frames(page, 2500))));
    await page.click('nav:visible [data-tab="map"]');
    await page.waitForTimeout(800);
    if (DESKTOP && !name.startsWith('A:') && !name.startsWith('D:')) { await context.close(); continue; }
    await prep(page);
    await page.waitForTimeout(2500);
    const quiet = stat(await frames(page));
    // klik w węzeł (zaznaczenie + podświetlenie zależności), potem pomiar jeszcze raz
    const react = await page.evaluate(() => new Promise((res) => { const t0 = performance.now(); document.getElementById('n-derrick').dispatchEvent(new MouseEvent('click', { bubbles: true })); requestAnimationFrame(() => requestAnimationFrame(() => res(Math.round(performance.now() - t0)))); }));
    console.log('  czas reakcji na klik (do 2. klatki):', react, 'ms');
    await page.waitForTimeout(600);
    const afterClick = stat(await frames(page, 3000));
    console.log(name);
    console.log('  mapa w spoczynku:', JSON.stringify(quiet));
    console.log('  po kliknięciu węzła:', JSON.stringify(afterClick));
    if (MIN_FPS && (quiet.fps < MIN_FPS || afterClick.fps < MIN_FPS)) { failed = true; console.log('  BŁĄD: poniżej progu ' + MIN_FPS + ' klatek/s'); }
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (failed) process.exit(1);
