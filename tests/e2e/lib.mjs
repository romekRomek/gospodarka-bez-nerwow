// Wspólne narzędzia testu dymnego i zrzutów: serwer statyczny, wybór przeglądarki,
// izolacja od sieci zewnętrznej (CDN, czcionki) i przygotowanie strony.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..', '..');
export const DIST = path.join(ROOT, 'dist');

/** Kod wyjścia dla problemów środowiska (brak przeglądarki, brak Chart.js). Różny od 1 (test nie przeszedł). */
export const EXIT_ENV = 2;

export class EnvError extends Error {}

export async function loadPlaywright() {
  try {
    return await import('playwright-core');
  } catch (e) {
    throw new EnvError(
      'Brak zależności playwright-core. Uruchom: npm --prefix tests/e2e install\n(' + e.message + ')'
    );
  }
}

/** Szuka Chromium: E2E_CHROME, cache Playwrighta (headless shell, potem pełne Chromium), Google Chrome. */
export function findBrowser(chromium) {
  const tried = [];
  const ok = (p) => {
    if (!p) return false;
    tried.push(p);
    try { return fs.statSync(p).isFile(); } catch { return false; }
  };
  if (process.env.E2E_CHROME) {
    if (ok(process.env.E2E_CHROME)) return process.env.E2E_CHROME;
    throw new EnvError('E2E_CHROME wskazuje nieistniejący plik: ' + process.env.E2E_CHROME);
  }
  // 1) przeglądarka dokładnie w wersji oczekiwanej przez playwright-core (np. po `npx playwright install chromium`)
  try { const p = chromium.executablePath(); if (ok(p)) return p; } catch { /* brak */ }
  // 2) dowolna wersja Chromium z cache Playwrighta (najnowsza rewizja)
  const caches = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright'),
    path.join(os.homedir(), '.cache', 'ms-playwright'),
  ].filter(Boolean);
  const rel = {
    chromium_headless_shell: [
      ['chrome-headless-shell-mac-arm64', 'chrome-headless-shell'],
      ['chrome-headless-shell-mac-x64', 'chrome-headless-shell'],
      ['chrome-headless-shell-linux64', 'chrome-headless-shell'],
      ['chrome-headless-shell-linux', 'chrome-headless-shell'],
    ],
    chromium: [
      ['chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
      ['chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
      ['chrome-linux64', 'chrome'],
      ['chrome-linux', 'chrome'],
    ],
  };
  for (const dir of caches) {
    let entries = [];
    try { entries = fs.readdirSync(dir); } catch { continue; }
    for (const kind of ['chromium_headless_shell', 'chromium']) {
      const revs = entries
        .filter((e) => e.startsWith(kind + '-'))
        .sort((a, b) => parseInt(b.split('-').pop(), 10) - parseInt(a.split('-').pop(), 10));
      for (const r of revs) for (const parts of rel[kind]) {
        const p = path.join(dir, r, ...parts);
        if (ok(p)) return p;
      }
    }
  }
  // 3) systemowy Chrome
  for (const p of [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ]) if (ok(p)) return p;
  throw new EnvError(
    'Nie znaleziono przeglądarki. Zainstaluj: npx --prefix tests/e2e playwright install chromium\n' +
    'albo wskaż plik zmienną E2E_CHROME. Sprawdzono:\n  ' + tried.join('\n  ')
  );
}

/** Serwer statyczny dla dist/ na wolnym porcie (strona w teście działa po http, jak na Pages). */
export function serveDist() {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent((req.url || '/').split('?')[0]);
    const rel = u === '/' ? 'index.html' : u.replace(/^\/+/, '');
    const file = path.resolve(DIST, rel);
    if (!file.startsWith(DIST + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404); res.end('nie ma'); return;
    }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({
      url: 'http://127.0.0.1:' + server.address().port + '/',
      close: () => new Promise((r) => server.close(r)),
    }));
  });
}

export function requireDist() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    throw new EnvError('Brak dist/index.html. Najpierw zbuduj stronę: python3 scripts/build.py');
  }
}

const CHART_URL = /^https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/Chart\.js\//;
const FONT_URL = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

/**
 * Izolacja od sieci. Domyślnie (bez --live-cdn):
 *  - Chart.js z CDN jest podmieniany lokalną kopią z npm (devDependency chart.js, ta sama wersja co w buildzie),
 *    więc test nie zależy od sieci i nie wysypuje się losowo;
 *  - Google Fonts dostają pustą odpowiedź CSS (strona użyje czcionek zapasowych, zrzuty są powtarzalne);
 *  - każde inne żądanie poza 127.0.0.1 jest odrzucane, a jego adres trafia do `ctx.blocked` i test o tym mówi.
 * Z --live-cdn nic nie jest podmieniane: sprawdzamy prawdziwy CDN, a jego niedostępność to błąd środowiska.
 */
export async function isolateNetwork(context, { liveCdn = false } = {}) {
  const state = { blocked: [], chartFromLocal: 0 };
  if (liveCdn) return state;
  let chartJs;
  try {
    chartJs = fs.readFileSync(path.join(HERE, 'node_modules', 'chart.js', 'dist', 'chart.umd.js'), 'utf8');
  } catch {
    throw new EnvError('Brak lokalnej kopii Chart.js. Uruchom: npm --prefix tests/e2e install (albo użyj --live-cdn).');
  }
  await context.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith('http://127.0.0.1') || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
    if (CHART_URL.test(url)) {
      state.chartFromLocal++;
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: chartJs });
    }
    if (FONT_URL.test(url)) {
      return route.fulfill({ status: 200, contentType: url.includes('/css') ? 'text/css' : 'font/woff2', body: '' });
    }
    state.blocked.push(url);
    return route.abort('blockedbyclient');
  });
  return state;
}

/** Otwiera stronę w zadanym motywie i szerokości. Zwraca { page, context, errors, net }. */
export async function openPage(browser, baseUrl, { width, height = 800, theme = 'light', liveCdn = false } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    colorScheme: theme,
    reducedMotion: 'reduce',
    locale: 'pl-PL',
    deviceScaleFactor: 1,
  });
  const net = await isolateNetwork(context, { liveCdn });
  // <html> bywa jeszcze nieobecny, gdy startuje skrypt inicjujący, więc czekamy na niego obserwatorem
  await context.addInitScript((t) => {
    const set = () => document.documentElement && (document.documentElement.setAttribute('data-theme', t), true);
    if (!set()) new MutationObserver((_, o) => { if (set()) o.disconnect(); }).observe(document, { childList: true });
  }, theme);
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + (e.stack || e.message)));
  page.on('requestfailed', (r) => {
    const u = r.url();
    // zablokowane przez nas własnych reguł nie liczymy jako błąd aplikacji (zgłaszamy je osobno w net.blocked)
    if (net.blocked.includes(u)) return;
    errors.push('requestfailed: ' + u + ' (' + (r.failure() || {}).errorText + ')');
  });
  await page.goto(baseUrl, { waitUntil: 'load' });
  return { page, context, errors, net };
}

/** Czy Chart.js jest dostępny na stronie (po załadowaniu skryptu z CDN lub z podmiany). */
export async function chartAvailable(page) {
  return page.evaluate(() => typeof window.Chart === 'function');
}

export function tmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}
