// Test dymny: ładuje dist/index.html w prawdziwej przeglądarce i sprawdza podstawy.
// Użycie: npm --prefix tests/e2e test   (opcje: --live-cdn, patrz docs/testing.md)
// Kody wyjścia: 0 = wszystko przeszło, 1 = są błędy asercji, 2 = problem środowiska (brak przeglądarki, brak Chart.js).
import {
  EnvError, EXIT_ENV, loadPlaywright, findBrowser, serveDist, requireDist, openPage, chartAvailable,
} from './lib.mjs';

const WIDTHS = [360, 390, 768, 1280];
const THEMES = ['light', 'dark'];
// nawigacja: dolny pasek (telefon) albo górny (komputer); widoczny jest zawsze jeden z nich
const TABS = [
  { id: 'start', btn: 'nav:visible [data-tab="start"]', panel: '#tab-start', name: 'Start' },
  { id: 'map', btn: 'nav:visible [data-tab="map"]', panel: '#tab-map', name: 'Mapa' },
  { id: 'emo', btn: 'nav:visible [data-tab="emo"]', panel: '#tab-emo', name: 'Newsy' },
  { id: 'pl', btn: 'nav:visible [data-tab="pl"]', panel: '#tab-pl', name: 'Polska' },
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
  const sel = await page.getAttribute(t.btn, 'aria-current');
  check(sel === 'page', 'zakładka „' + t.name + '”: aria-current=page');
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

    // Start jest pierwszą zakładką i jest widoczny na starcie
    const firstTab = await page.locator('nav:visible [data-tab]').first().getAttribute('data-tab');
    check(firstTab === 'start', 'pierwsza pozycja nawigacji to Start', 'jest: ' + firstTab);
    check(await visible(page, '#tab-start') && !(await visible(page, '#tab-map')), 'po załadowaniu widoczny jest ekran Start, nie Mapa');
    check((await page.locator('#tab-start .stat').count()) === 3, 'Start: trzy kafelki liczb');
    check(await page.locator('#tab-start .hld-card .hli:not([hidden])').count() === 1, 'Start: jeden widoczny nagłówek dnia (pager)');
    const mw = await page.evaluate(() => document.querySelector('main').clientWidth);
    const nav = await page.evaluate(() => ({ b: getComputedStyle(document.getElementById('bnav')).display, t: getComputedStyle(document.getElementById('tnav')).display }));
    check(mw < 760 ? (nav.b !== 'none' && nav.t === 'none') : (nav.t !== 'none' && nav.b === 'none'), 'nawigacja (próg 760 px kontenera, main ' + mw + ' px): ' + (mw < 760 ? 'dolny pasek na telefonie' : 'górny pasek na komputerze'), JSON.stringify(nav));

    // przełącznik poziomu Podstawy/Więcej: domyślnie Podstawy, „Więcej” pokazuje bloki poziomu 2, wybór jest zapamiętany
    check((await page.getAttribute('#lvl button[data-level="1"]', 'aria-pressed')) === 'true', 'poziom domyślny: Podstawy');
    check(!(await page.locator('#tab-start .stat .soon').first().isVisible()), 'Podstawy: blok „Co może o tym zadecydować” ukryty');
    await page.click('#lvl button[data-level="2"]');
    check(await page.locator('#tab-start .stat .soon').first().isVisible(), 'Więcej: blok „Co może o tym zadecydować” widoczny');
    check((await page.evaluate(() => localStorage.getItem('gbn-level'))) === '2', 'poziom Więcej zapamiętany w localStorage');
    await checkNoHScroll(page, 'Start, poziom Więcej');
    await page.click('#lvl button[data-level="1"]');

    // glosariusz: skrót to przycisk, klik otwiera definicję, Escape zamyka i zwraca fokus, klik poza też zamyka
    const term = page.locator('#tab-start .term').first();
    check((await term.count()) > 0, 'Start: są klikalne skróty (glosariusz)');
    await term.click();
    check((await term.getAttribute('aria-expanded')) === 'true', 'skrót: aria-expanded=true po kliknięciu');
    check(await page.locator('.tpop[role="note"]').isVisible(), 'okienko definicji (role=note) jest widoczne');
    await page.keyboard.press('Escape');
    check((await term.getAttribute('aria-expanded')) === 'false' && (await page.locator('.tpop').count()) === 0, 'Escape zamyka definicję');
    check(await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('term')), 'po Escape fokus wraca na skrót');
    await term.click();
    await page.mouse.click(5, 5);
    check((await page.locator('.tpop').count()) === 0, 'klik poza okienkiem zamyka definicję');

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
    await activeTab(page, TABS[1]);

    if (functional) {
      // okno szczegółów: otwarcie węzła z mapy, zamknięcie Escape
      const firstId = await page.locator('#nodes g.node').first().getAttribute('id');
      check(!(await modalIsOpen(page)), 'okno szczegółów jest zamknięte na starcie');
      const phone = width <= 760;
      await page.locator('#' + firstId).click();
      if (phone) {
        check(!(await modalIsOpen(page)), 'telefon: klik w węzeł nie otwiera okna modalnego');
        check(await page.locator('#side.open').count() === 1 && await visible(page, '#panel'), 'telefon: klik w węzeł otwiera dolny panel');
        check(await page.locator('#pv2 .who').isVisible(), 'panel węzła: „Decyduje” i „Dotyczy”');
        check(await page.locator('#pv2 .conf').isVisible(), 'panel węzła: wskaźnik pewności');
        await page.keyboard.press('Escape');
        check(await page.locator('#side.open').count() === 0, 'telefon: Escape zamyka dolny panel');
        await page.locator('#' + firstId).click();
        await page.click('#more');
      }
      check(await modalIsOpen(page), 'szczegóły węzła ' + firstId + ' otwierają okno z wykresem');
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
      if (phone) await page.click('#more');
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
