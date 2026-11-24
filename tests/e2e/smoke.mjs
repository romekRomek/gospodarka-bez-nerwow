// Test dymny: ładuje dist/index.html w prawdziwej przeglądarce i sprawdza podstawy.
// Użycie: npm --prefix tests/e2e test   (opcje: --live-cdn, patrz docs/testing.md)
// Kody wyjścia: 0 = wszystko przeszło, 1 = są błędy asercji, 2 = problem środowiska (brak przeglądarki, brak Chart.js).
import {
  EnvError, EXIT_ENV, loadPlaywright, findBrowser, serveDist, requireDist, openPage, chartAvailable,
} from './lib.mjs';

const WIDTHS = [360, 390, 768, 1280];
const THEMES = ['light', 'dark'];
const TABS = [
  { id: 'map', btn: '#tb-map', panel: '#tab-map', name: 'Mapa gospodarcza' },
  { id: 'emo', btn: '#tb-emo', panel: '#tab-emo', name: 'Newsy bez nerwów' },
  { id: 'pl', btn: '#tb-pl', panel: '#tab-pl', name: 'Z czym zmaga się Polska' },
];
const EXPECTED_NODES = 13;
const liveCdn = process.argv.includes('--live-cdn');

let total = 0;
const failures = [];
let scope = '';

function check(cond, msg, detail) {
  total++;
  if (cond) return true;
  failures.push({ scope, msg, detail });
  console.log('  BŁĄD  ' + msg + (detail ? '  [' + detail + ']' : ''));
  return false;
}

async function visible(page, sel) {
  return page.locator(sel).isVisible();
}

/** Poziome przewijanie strony (L3). Wewnętrzne kontenery (mapa, pasek kroków) nie są liczone. */
async function checkNoHScroll(page, what) {
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  check(m.sw <= m.iw, 'brak poziomego przewijania: ' + what, 'scrollWidth=' + m.sw + ' > innerWidth=' + m.iw);
}

async function activeTab(page, t) {
  await page.click(t.btn);
  for (const o of TABS) {
    const shown = await visible(page, o.panel);
    check(shown === (o.id === t.id), 'zakładka „' + t.name + '”: panel ' + o.panel + (o.id === t.id ? ' widoczny' : ' ukryty'));
  }
  const sel = await page.getAttribute(t.btn, 'aria-selected');
  check(sel === 'true', 'zakładka „' + t.name + '”: aria-selected=true');
}

async function modalIsOpen(page) {
  return page.evaluate(() => document.getElementById('md').open);
}

/** Jedno przejście po stronie w danym motywie i szerokości. */
async function runScenario(browser, base, width, theme, { functional }) {
  scope = width + ' px, motyw ' + theme;
  console.log('\n' + scope + (functional ? ' (pełny scenariusz)' : ' (układ i konsola)'));
  const { page, context, errors, net } = await openPage(browser, base, { width, theme, liveCdn });
  try {
    // Chart.js: brak oznacza problem środowiska (sieć/CDN), nie błąd aplikacji
    if (!(await chartAvailable(page))) {
      throw new EnvError(
        'Chart.js nie załadował się' + (liveCdn
          ? ' z CDN (cdnjs.cloudflare.com). Brak sieci? Uruchom bez --live-cdn, żeby użyć lokalnej kopii z npm.'
          : ' mimo lokalnej kopii (npm --prefix tests/e2e install).')
      );
    }
    const themeAttr = await page.getAttribute('html', 'data-theme');
    check(themeAttr === theme, 'atrybut data-theme na <html> to ' + theme, 'jest: ' + themeAttr);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    (runScenario.bg ||= {})[theme] = bg;

    // 13 węzłów na mapie, 13 kroków na liście
    const nodes = await page.locator('#nodes g.node').count();
    check(nodes === EXPECTED_NODES, 'węzły na mapie: ' + EXPECTED_NODES, 'jest: ' + nodes);
    const steps = await page.locator('#steps button.step').count();
    check(steps === EXPECTED_NODES, 'kroki na liście: ' + EXPECTED_NODES, 'jest: ' + steps);

    await checkNoHScroll(page, 'po załadowaniu strony');

    for (const t of TABS) {
      await activeTab(page, t);
      await checkNoHScroll(page, t.name);
      if (functional && t.id === 'pl') {
        const canvases = await page.locator('#plch canvas').count();
        check(canvases > 0, 'zakładka Polska: wykresy się narysowały (canvas w #plch)', 'jest: ' + canvases);
      }
    }
    await activeTab(page, TABS[0]);

    if (functional) {
      // okno szczegółów: otwarcie węzła z mapy, zamknięcie Escape
      const firstId = await page.locator('#nodes g.node').first().getAttribute('id');
      check(!(await modalIsOpen(page)), 'okno szczegółów jest zamknięte na starcie');
      await page.locator('#' + firstId).click();
      check(await modalIsOpen(page), 'klik w węzeł ' + firstId + ' otwiera okno szczegółów');
      const title = (await page.locator('#mt-t').textContent() || '').trim();
      check(title.length > 0, 'okno szczegółów ma tytuł', 'tytuł: "' + title + '"');
      const mcanv = await page.locator('#md canvas').count();
      check(mcanv > 0, 'okno szczegółów ma wykres (canvas)', 'jest: ' + mcanv);
      await checkNoHScroll(page, 'okno szczegółów otwarte');
      await page.keyboard.press('Escape');
      check(!(await modalIsOpen(page)), 'Escape zamyka okno szczegółów');

      // krok z listy pokazuje panel i podświetla węzeł, a „Szczegóły i wykresy” otwiera okno; zamknięcie przyciskiem ✕
      const stepId = await page.locator('#steps button.step').nth(5).getAttribute('id');
      await page.locator('#' + stepId).click();
      check(!(await modalIsOpen(page)), 'klik w krok listy ' + stepId + ' nie otwiera okna, tylko pokazuje panel');
      const onNode = await page.locator('#nodes g.node.on').count();
      check(onNode === 1, 'po kliknięciu kroku dokładnie jeden węzeł na mapie jest podświetlony', 'jest: ' + onNode);
      const panelTitle = (await page.locator('#bt').textContent() || '').trim();
      check(panelTitle.length > 0, 'panel kroku ma tytuł', 'tytuł: "' + panelTitle + '"');
      await page.click('#more');
      check(await modalIsOpen(page), 'przycisk „Szczegóły i wykresy” otwiera okno szczegółów');
      check((await page.locator('#mt-t').textContent()).trim() === panelTitle, 'okno pokazuje ten sam krok co panel');
      await page.click('#mx');
      check(!(await modalIsOpen(page)), 'przycisk ✕ zamyka okno szczegółów');

      // nawigacja Następny/Poprzedni nie psuje okna
      await page.locator('#nodes g.node').nth(2).click();
      const t1 = await page.locator('#mt-t').textContent();
      await page.click('#mnext');
      const t2 = await page.locator('#mt-t').textContent();
      check(t1 !== t2, 'przycisk „Następny” zmienia węzeł w oknie', '"' + t1 + '" → "' + t2 + '"');
      await page.keyboard.press('Escape');
      check(!(await modalIsOpen(page)), 'Escape zamyka okno także po nawigacji');
    }

    // konsola i wyjątki przez cały scenariusz
    check(errors.length === 0, 'brak błędów w konsoli i nieobsłużonych wyjątków', errors.slice(0, 5).join(' | '));
    check(net.blocked.length === 0, 'strona nie sięga po nieznane adresy zewnętrzne', net.blocked.slice(0, 5).join(', '));
  } finally {
    await context.close();
  }
}

async function main() {
  const t0 = Date.now();
  requireDist();
  const pw = await loadPlaywright();
  const exe = findBrowser(pw.chromium);
  console.log('Przeglądarka: ' + exe);
  console.log('Sieć: ' + (liveCdn
    ? 'prawdziwy CDN (--live-cdn)'
    : 'Chart.js z lokalnej kopii npm, czcionki Google puste, reszta zewnętrzna zablokowana'));
  const server = await serveDist();
  const browser = await pw.chromium.launch({ executablePath: exe, headless: true });
  try {
    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        // pełny scenariusz tylko w dwóch skrajnych konfiguracjach, reszta to układ i konsola
        const functional = (width === 390 && theme === 'light') || (width === 1280 && theme === 'dark');
        await runScenario(browser, server.url, width, theme, { functional });
      }
    }
    scope = 'motywy';
    const bg = runScenario.bg || {};
    check(bg.light && bg.dark && bg.light !== bg.dark, 'motyw jasny i ciemny dają różne tło strony', JSON.stringify(bg));
  } finally {
    await browser.close();
    await server.close();
  }
  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('\nAsercje: ' + total + ', błędy: ' + failures.length + ', czas: ' + sec + ' s');
  if (failures.length) {
    console.log('\nNie przeszło:');
    for (const f of failures) console.log('  - [' + f.scope + '] ' + f.msg + (f.detail ? ' (' + f.detail + ')' : ''));
    process.exit(1);
  }
  console.log('OK');
}

main().catch((e) => {
  if (e instanceof EnvError) {
    console.error('\nPROBLEM ŚRODOWISKA (to nie jest błąd aplikacji): ' + e.message);
    process.exit(EXIT_ENV);
  }
  console.error('\nNiespodziewany wyjątek testu: ' + (e.stack || e));
  process.exit(1);
});
