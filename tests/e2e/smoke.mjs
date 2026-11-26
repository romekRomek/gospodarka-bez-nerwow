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
  { id: 'cal', btn: 'nav:visible [data-tab="cal"]', panel: '#tab-cal', name: 'Kalendarz' },
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

    // rytm pionowy (L7, L8): bloki ekranu Start nie stykają się, a wieloliniowy tekst ma czytelną interlinię
    const rhythm = await page.evaluate(() => {
      const kids = [...document.querySelectorAll('#tab-start .scr-body > *')].filter(e => e.offsetParent);
      let minGap = 1e9;
      for (let i = 1; i < kids.length; i++) minGap = Math.min(minGap, kids[i].getBoundingClientRect().top - kids[i - 1].getBoundingClientRect().bottom);
      const tight = [];
      document.querySelectorAll('#tab-start *').forEach(el => {
        if (!el.offsetParent || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 25)) return;
        const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize), lh = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / fs;
        if (Math.round(el.getBoundingClientRect().height / (lh * fs)) < 2) return;
        if (lh < 1.2 || (fs <= 16 && lh < 1.4)) tight.push(el.tagName.toLowerCase() + '.' + el.className + ' ' + lh.toFixed(2));
      });
      return { minGap, tight };
    });
    check(rhythm.minGap >= 12, 'Start: odstęp między blokami min. 12 px (L8)', 'jest: ' + rhythm.minGap + ' px');
    check(rhythm.tight.length === 0, 'Start: wieloliniowy tekst ma czytelną interlinię (L7)', rhythm.tight.join(', '));

    // wyrównanie (L8): przyciski nagłówka mają tę samą wysokość, a kafelki obok siebie układają zawartość w jednej linii
    const al = await page.evaluate(() => {
      const r = s => document.querySelector(s).getBoundingClientRect();
      const a = r('#chgb'), b = r('#mthb');
      const tiles = [...document.querySelectorAll('#tab-start .stat')];
      const cols = getComputedStyle(document.querySelector('#tab-start .tiles')).gridTemplateColumns.split(' ').length;
      const spread = {};
      if (cols > 1) for (const sel of ['.who', '.watch', '.cmain', '.why']) {
        const ys = tiles.map(t => { const e = t.querySelector(sel); return e ? e.getBoundingClientRect().top - t.getBoundingClientRect().top : null; }).filter(y => y !== null);
        spread[sel] = Math.max(...ys) - Math.min(...ys);
      }
      return { dh: Math.abs(a.height - b.height), sameRow: Math.abs(a.top - b.top) < 2, dw: Math.abs(a.width - b.width), cols, spread };
    });
    check(al.dh < 1, 'nagłówek: „Co się zmieniło” i „Jak to sprawdzamy” mają tę samą wysokość', 'różnica: ' + al.dh + ' px');
    check(al.sameRow, 'nagłówek: oba przyciski w jednym wierszu');
    if (al.cols > 1) {
      for (const [sel, d] of Object.entries(al.spread)) check(d <= 1, 'kafelki obok siebie: ' + sel + ' w jednej linii (rozrzut ≤ 1 px)', 'rozrzut: ' + d + ' px');
    }

    // nawigacja: ikona i podpis wyśrodkowane w pionie względem przycisku (widoczny pasek, górny lub dolny)
    const navAl = await page.evaluate(() => {
      const nav = [...document.querySelectorAll('#tnav,#bnav')].find(n => n.offsetParent);
      const cy = e => { const r = e.getBoundingClientRect(); return r.top + r.height / 2; };
      return [...nav.querySelectorAll('.ni')].map(b => {
        const ic = b.querySelector('svg'), lb = b.querySelector('span:not(.navic)'), top = b.closest('#tnav') !== null;
        // górny pasek: ikona i podpis w jednym wierszu, oba na środku przycisku; dolny: ikona nad podpisem, para wyśrodkowana
        const mid = top ? Math.max(Math.abs(cy(ic) - cy(b)), Math.abs(cy(lb) - cy(b))) : Math.abs((ic.getBoundingClientRect().top + lb.getBoundingClientRect().bottom) / 2 - cy(b));
        return mid;
      });
    });
    check(navAl.every(d => d <= 1), 'nawigacja: ikona i podpis wyśrodkowane w pionie (≤ 1 px)', 'odchyłki: ' + navAl.map(d => d.toFixed(1)).join(', '));

    // kalendarz „Najbliższe 30 dni”: stały „dziś” (25.11.2026), daty w porządku, każda z linkiem do źródła i oznaczeniem poziomu
    await page.evaluate(() => window.calRender('2026-11-25'));
    const cal = await page.evaluate(() => ({
      days: [...document.querySelectorAll('#tab-cal .calday h3')].map(e => e.textContent),
      noSrc: [...document.querySelectorAll('#tab-cal .calev')].filter(e => !e.querySelector('a[href^="http"]')).length,
      tiers: [...document.querySelectorAll('#tab-cal .calev .calmeta')].every(e => /źródło (pierwotne|wtórne)/.test(e.textContent)),
      und: document.querySelectorAll('#tab-cal .calund .calu').length,
      kinds: document.querySelectorAll('#tab-cal .calund .calk').length,
      aff: document.querySelectorAll('#tab-cal .calev .calaff').length,
      affNoMech: [...document.querySelectorAll('#tab-cal .calev')].filter(e => e.querySelector('.calaff') && !/Mechanizm:/.test(e.textContent)).length,
      china: [...document.querySelectorAll('#tab-cal .calu')].some(e => /handlu zagranicznym/.test(e.textContent) && /Chiny/.test(e.textContent)),
    }));
    check(cal.days.length >= 5, 'Kalendarz: są dni z datą w oknie 30 dni', 'jest: ' + cal.days.length);
    check(cal.days[0].includes('30 listopada') && cal.days.some(d => d.includes('16–17 grudnia')), 'Kalendarz: GUS 30.11 na początku, EBC 16–17.12 w oknie', cal.days.join(' | '));
    check(cal.noSrc === 0 && cal.tiers, 'Kalendarz: każde wydarzenie ma link do źródła i oznaczenie poziomu (pierwotne/wtórne)', 'bez linku: ' + cal.noSrc);
    check(cal.und >= 12 && cal.kinds >= 3, 'Kalendarz: wpisy bez konkretnej daty w rodzajach (≥ 12 wpisów, ≥ 3 rodzaje)', 'wpisy: ' + cal.und + ', rodzaje: ' + cal.kinds);
    check(cal.china, 'Kalendarz: wpis bez daty nie scala się z innym (dane o handlu zagranicznym dotyczą Chin)');
    check(cal.aff >= 5 && cal.affNoMech === 0, 'Kalendarz: opis „Na co może wpłynąć” przy wydarzeniach, każdy ze źródłem mechanizmu', 'opisy: ' + cal.aff + ', bez źródła: ' + cal.affNoMech);
    await page.evaluate(() => window.calRender('2027-03-01'));
    check((await page.locator('#tab-cal .calempty').count()) === 1, 'Kalendarz: poza oknem danych pokazuje stan pusty z datą aktualizacji');
    await page.evaluate(() => window.calRender());

    // Newsy: „jeden wpis naraz” (FocusPager): licznik, przyciski, klawisze, przełącznik „Pokaż wszystkie”
    await page.click(TABS.find(t => t.id === 'emo').btn);
    await page.waitForTimeout(150);
    const fp0 = await page.evaluate(() => ({ n: document.querySelectorAll('#tab-emo .fp').length, c: document.querySelector('#tab-emo .fpc').textContent, total: document.querySelectorAll('#cmps > *').length }));
    check(fp0.n === 6 && fp0.c === '1 / ' + fp0.total && fp0.total === 8, 'Newsy: sześć grup „jeden wpis naraz”, pierwsza ma licznik 1 / 8', JSON.stringify(fp0));
    const order = await page.evaluate(() => ({
      steps: [...document.querySelectorAll('#tab-emo .nstep .nk')].map(e => e.textContent),
      nav: [...document.querySelectorAll('#tab-emo .npath a')].map(a => a.textContent),
      firstH2: document.querySelector('#tab-emo .nstep h2').textContent,
      firstLab: document.querySelector('#cmps .cmp .lab').textContent,
      firstAbs: !!document.querySelector('#cmps .cmp:first-child .w .absd'),
      humorBeforeOriginal: (() => { const c = document.querySelector('#cmps .cmp'); return c.querySelector('.w').compareDocumentPosition(c.querySelector('.o')) & Node.DOCUMENT_POSITION_FOLLOWING; })(),
      h2s: [...document.querySelectorAll('#tab-emo h2')].map(e => e.textContent),
    }));
    check(order.steps.length === 6 && order.steps[0].includes('Zobacz') && order.steps[1].includes('Rozpoznaj') && order.steps[2].includes('Sprawdź') && order.steps[3].includes('Zrozum') && order.steps[4].includes('Odtrutka') && order.steps[5].includes('Źródła'), 'Newsy: sześć kroków w kolejności Zobacz, Rozpoznaj, Sprawdź, Zrozum, Odtrutka, Źródła', order.steps.join(' | '));
    check(order.nav.length === 6, 'Newsy: nawigacja po ścieżce ma sześć odnośników');
    check(/Podkręcone/.test(order.firstH2) && order.firstLab === 'Podkręcony nagłówek' && order.firstAbs && order.humorBeforeOriginal, 'Newsy: zakładka zaczyna się od humoru, a karta od podkręconego nagłówka przed oryginałem', order.firstH2 + ' / ' + order.firstLab);
    const hi = order.h2s.map(t => t.replace(/\s+/g, ' '));
    check(await page.evaluate(() => { const sc = document.querySelector('#tab-emo .scan'); const sec = [...document.querySelectorAll('#tab-emo section')].find(s => /Skaner/.test(s.textContent)); return !!sc && sc.hidden && !sc.offsetParent && !!sec && sec.hidden && !sec.offsetParent; }), 'Newsy: skaner nagłówków jest schowany (do czasu naprawy, docs/backlog.md)');
    check(hi.findIndex(t => /sztuczek/.test(t)) < hi.findIndex(t => /Pięć pytań/.test(t)) && hi.findIndex(t => /Pięć pytań/.test(t)) < hi.findIndex(t => /Skaner/.test(t)) && hi.findIndex(t => /badania/.test(t)) < hi.findIndex(t => /kosztuje/.test(t)) && hi.findIndex(t => /Odtrutka/.test(t)) < hi.findIndex(t => /Narzędzia/.test(t)), 'Newsy: logiczna kolejność sekcji (sztuczki → pytania → skaner; badania → koszt; odtrutka → źródła)', hi.join(' | '));
    const fp = page.locator('#tab-emo .fp').first();
    await fp.locator('.fpbot .fpb2').nth(1).click();
    await page.waitForFunction(() => document.querySelector('#tab-emo .fpc').textContent === '2 / 8', null, { timeout: 3000 }).catch(() => {});
    check((await fp.locator('.fpc').textContent()) === '2 / 8', 'Newsy: przycisk „Następny” pod kartą przechodzi do wpisu 2 / 8');
    await fp.locator('.fp-on').focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('#tab-emo .fpc').textContent === '3 / 8', null, { timeout: 3000 }).catch(() => {});
    check((await fp.locator('.fpc').textContent()) === '3 / 8', 'Newsy: strzałka w prawo przechodzi do wpisu 3 / 8');
    check((await fp.locator('.fpb').first().isEnabled()) && !(await fp.locator('.fpbot .fpb2').first().isDisabled()), 'Newsy: przycisk „Poprzedni” dostępny po przejściu dalej');
    // ostatni wpis: przewija się do lewej krawędzi od jednego kliknięcia i licznik nie wraca do poprzedniego
    const total0 = fp0.total;
    for (let k = 3; k < total0; k++) { await fp.locator('.fpbot .fpb2').nth(1).click(); await page.waitForTimeout(450); }
    await page.waitForTimeout(500);
    const last = await fp.evaluate(el => { const box = el.querySelector('.fp-on'), cards = [...box.children], l = cards[cards.length - 1]; return { c: el.querySelector('.fpc').textContent, gap: Math.round(l.getBoundingClientRect().left - box.getBoundingClientRect().left), nextDisabled: el.querySelector('.fpbot .fpb2:last-child').disabled }; });
    check(last.c === total0 + ' / ' + total0 && Math.abs(last.gap) <= 3 && last.nextDisabled, 'Newsy: ostatni wpis staje przy lewej krawędzi po jednym kliknięciu (licznik ' + total0 + ' / ' + total0 + ', „Następny” wyłączony)', JSON.stringify(last));
    await fp.locator('.fpbot .fpb2').first().click(); await page.waitForTimeout(500);
    check((await fp.locator('.fpc').textContent()) === (total0 - 1) + ' / ' + total0, 'Newsy: z ostatniego wpisu „Poprzedni” wraca do przedostatniego');
    await fp.locator('.fpall').click();
    check(!(await fp.locator('.fpc').isVisible()) && (await fp.locator('.fp-on').count()) === 0 && (await fp.locator('.fpall').getAttribute('aria-pressed')) === 'true', 'Newsy: „Pokaż wszystkie” wyłącza pas i pokazuje całą listę');
    await fp.locator('.fpall').click();
    check((await fp.locator('.fp-on').count()) === 1 && (await fp.locator('.fpc').isVisible()), 'Newsy: „Wracaj do jednego wpisu” przywraca pas');
    await checkNoHScroll(page, 'Newsy z pasem wpisów');
    await page.click(TABS[0].btn);

    // słownik pojęć: wejście ze stopki, wyszukiwarka, status potwierdzenia definicji
    await page.click('#glsb');
    check(await page.evaluate(() => document.getElementById('gls').open), 'Słownik: okno otwiera się ze stopki');
    const total = await page.locator('#glsbody li.gt').count();
    check(total >= 19, 'Słownik: są wszystkie hasła (≥ 19)', 'jest: ' + total);
    check((await page.locator('#glsbody li.gt').filter({ hasText: /potwierdzona w źródle|robocza/ }).count()) === total, 'Słownik: każde hasło ma status potwierdzenia definicji');
    await page.fill('.gsearch', 'FOMC');
    check((await page.locator('#glsbody li.gt:not([hidden])').count()) === 1, 'Słownik: wyszukiwarka znajduje hasło po skrócie (FOMC)');
    await page.fill('.gsearch', 'zzzzqq');
    check(await page.locator('#glsbody li.gt:not([hidden])').count() === 0 && await page.locator('#glsbody p.cgs:not([hidden])').count() >= 2, 'Słownik: brak wyników pokazuje komunikat');
    await page.fill('.gsearch', '');
    await checkNoHScroll(page, 'okno Słownik pojęć');
    await page.keyboard.press('Escape');
    check(!(await page.evaluate(() => document.getElementById('gls').open)), 'Słownik: Escape zamyka okno');

    // okno „Jak to sprawdzamy”: otwiera się, ma dziennik korekt ze źródłami, zamyka się Escape
    await page.click('#mthb');
    check(await page.evaluate(() => document.getElementById('mth').open), 'Jak to sprawdzamy: okno się otwiera');
    check((await page.locator('#mthbody .mthc').count()) >= 1, 'Jak to sprawdzamy: dziennik korekt ma wpisy');
    check((await page.locator('#mthbody .mthc a[href^="http"]').count()) === (await page.locator('#mthbody .mthc').count()), 'Jak to sprawdzamy: każda korekta ma link do źródła');
    await checkNoHScroll(page, 'okno Jak to sprawdzamy');
    await page.keyboard.press('Escape');
    check(!(await page.evaluate(() => document.getElementById('mth').open)), 'Jak to sprawdzamy: Escape zamyka okno');

    // 13 węzłów na mapie, 13 kroków na liście
    const nodes = await page.locator('#nodes g.node').count();
    check(nodes === EXPECTED_NODES, 'węzły na mapie: ' + EXPECTED_NODES, 'jest: ' + nodes);
    const steps = await page.locator('#steps button.step').count();
    check(steps === EXPECTED_NODES, 'kroki na liście: ' + EXPECTED_NODES, 'jest: ' + steps);

    await checkNoHScroll(page, 'po załadowaniu strony');

    // wydajność mapy (Safari/iPhone): dwie warstwy (statyczna podstawa + nakładka) oraz tryb lekki na małych ekranach, bez filtrów i bez nieskończonych animacji
    const mp = await page.evaluate(() => {
      const base = document.querySelector('.mapstack > svg.base'), ov = document.getElementById('sv');
      const infinite = document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.getComputedTiming().iterations === Infinity && a.effect.target && a.effect.target.closest && a.effect.target.closest('.mapstack'));
      return {
        layers: document.querySelectorAll('.mapstack > svg').length,
        baseAria: base && base.getAttribute('aria-hidden'), baseNodes: base ? base.querySelectorAll('.node').length : -1,
        overlayNodes: ov ? ov.querySelectorAll('#nodes g.node').length : -1,
        lite: !!ov && ov.classList.contains('lite'), filters: document.querySelectorAll('svg.map [filter]').length, running: infinite.length,
      };
    });
    check(mp.layers === 2 && mp.baseAria === 'true' && mp.baseNodes === 0 && mp.overlayNodes === EXPECTED_NODES, 'Mapa: dwie warstwy (podstawa bez węzłów, ukryta dla czytników; nakładka z 13 węzłami)', JSON.stringify(mp));
    if (width <= 1020) {
      check(mp.lite && mp.filters === 0 && mp.running === 0, 'Mapa na małym ekranie: tryb lekki (bez filtrów SVG i bez działających nieskończonych animacji)', JSON.stringify(mp));
    }

    for (const t of TABS) {
      await activeTab(page, t);
      const lvlVisible = await page.locator('#lvl').isVisible();
      check(lvlVisible === (t.id === 'start' || t.id === 'map'), 'przełącznik Podstawy/Więcej jest widoczny tylko tam, gdzie działa (Start, Mapa): zakładka „' + t.name + '”', 'widoczny: ' + lvlVisible);
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
      } else {
        check(!(await modalIsOpen(page)), 'komputer: klik w węzeł nie otwiera okna modalnego, tylko zaznacza go i pokazuje panel obok mapy');
        check(await page.locator('#pv2 .who').isVisible() && await page.locator('#pv2 .deps').isVisible(), 'komputer: panel obok mapy ma „Decyduje” i „Zależności”');
      }
      await page.click('#more');
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

      // węzeł PKB: „Czego ta liczba nie mówi” i „Spójrz też na” (limits, also) na poziomie Więcej
      await page.click('#lvl button[data-level="2"]');
      await page.locator('#st-sun').click();
      check(await page.locator('#pv3 .limits li').count() === 3, 'PKB: trzy zdania „Czego ta liczba nie mówi”');
      check(await page.locator('#pv3 .acell').count() === 3, 'PKB: trzy komórki „Spójrz też na”');
      await page.click('#lvl button[data-level="1"]');
      await page.locator('#st-sun').click();
      check(!(await page.locator('#pv3 .limits').isVisible()), 'PKB, Podstawy: blok granic ukryty');
      await page.keyboard.press('Escape');

      // nawigacja Następny/Poprzedni nie psuje okna
      await page.locator('#nodes g.node').nth(2).click();
      await page.click('#more');
      const t1 = await page.locator('#mt-t').textContent();
      await page.click('#mnext');
      const t2 = await page.locator('#mt-t').textContent();
      check(t1 !== t2, 'przycisk „Następny” zmienia węzeł w oknie', '"' + t1 + '" → "' + t2 + '"');
      await page.keyboard.press('Escape');
      check(!(await modalIsOpen(page)), 'Escape zamyka okno także po nawigacji');

      // zależności: klik w węzeł podświetla jego krawędzie, wygasza resztę i pokazuje listy w panelu (bez okna modalnego)
      const deps = () => page.evaluate(() => ({
        modal: document.getElementById('md').open,
        on: document.querySelectorAll('#deps .dep.on').length, inn: document.querySelectorAll('#deps .dep.on.in').length,
        dim: document.querySelectorAll('#nodes .node.dim').length, rel: document.querySelectorAll('#nodes .node.rel').length,
        groups: [...document.querySelectorAll('#pv2 .dpg')].map(g => g.querySelector('h4').textContent + ':' + g.querySelectorAll('.dpi').length),
        title: document.getElementById('bt').textContent.trim(), note: (document.querySelector('#pv2 .deps .cgs') || {}).textContent || '',
        pressed: [...document.querySelectorAll('#nodes .node')].filter(n => n.getAttribute('aria-pressed') === 'true').map(n => n.id),
      }));
      await page.locator('#n-derrick').click();
      const d1 = await deps();
      check(!d1.modal, 'Zależności: klik w węzeł nie otwiera okna modalnego', JSON.stringify(d1));
      check(d1.on === 4 && d1.inn === 1 && d1.rel === 4 && d1.dim === 8, 'Zależności: Studnia ropy ma 4 krawędzie (3 wychodzące, 1 przychodząca), 4 powiązane węzły, 8 wygaszonych', JSON.stringify(d1));
      check(d1.groups.join('|') === 'Wpływa na:3|Zależy od:1' && d1.pressed.join() === 'n-derrick', 'Zależności: panel ma listy „Wpływa na” (3) i „Zależy od” (1), zaznaczony węzeł ma aria-pressed', JSON.stringify(d1));
      await page.locator('#pv2 .dpi').first().click();
      const d2 = await deps();
      check(d2.title === 'Stacja paliw' && d2.on === 2 && d2.dim === 10, 'Zależności: klik pozycji na liście przechodzi do tego węzła i przesuwa podświetlenie', JSON.stringify(d2));
      if (phone) {
        await page.locator('#n-derrick').click();
        await page.click('#pv2 .dpmap');
        const afterMap = await deps();
        check((await page.locator('#side.open').count()) === 0 && afterMap.on === 4 && afterMap.dim === 8, 'telefon: „Pokaż na mapie” zamyka panel i zostawia podświetlone zależności', JSON.stringify(afterMap));
      } else {
        check(!(await page.locator('#pv2 .dpmap').isVisible()), 'komputer: przycisk „Pokaż na mapie” jest ukryty (panel nie zasłania mapy)');
      }
      await page.locator('#n-debt').click();
      const d3 = await deps();
      check(d3.on === 0 && d3.dim === 0 && /nie mamy jeszcze/.test(d3.note), 'Zależności: węzeł bez zapisanych zależności nie wygasza mapy i mówi o braku wprost', JSON.stringify(d3));
      await checkNoHScroll(page, 'mapa z podświetlonymi zależnościami');

      // odznaczanie: klik w puste miejsce mapy wraca do stanu początkowego (bez zaznaczenia, bez zależności, panel startowy)
      await page.locator('#n-derrick').click();
      check((await deps()).on === 4, 'Odznaczanie: przed kliknięciem w puste miejsce węzeł jest zaznaczony');
      await page.locator('#map').click({ position: { x: 50, y: 30 } });
      const u1 = await page.evaluate(() => ({
        on: document.querySelectorAll('.node.on,.step.on').length, dep: document.querySelectorAll('#deps .dep.on').length,
        dim: document.querySelectorAll('#nodes .node.dim,#nodes .node.rel').length, pressed: document.querySelectorAll('#nodes [aria-pressed]').length,
        title: document.getElementById('bt').textContent.trim(), tag: document.getElementById('tag').textContent.trim(), sheet: document.body.classList.contains('sheet-open'),
        v2: document.getElementById('pv2').children.length,
      }));
      check(u1.on === 0 && u1.dep === 0 && u1.dim === 0 && u1.pressed === 0 && u1.title === 'Zacznij od ropy' && u1.tag === 'Start' && !u1.sheet && u1.v2 === 0, 'Odznaczanie: klik w puste miejsce mapy przywraca stan początkowy (bez zaznaczenia i zależności, panel startowy, zamknięty panel)', JSON.stringify(u1));
      await page.locator('#n-derrick').click();
      await page.locator('#n-derrick').click();
      check((await deps()).on === 4, 'Odznaczanie: ponowny wybór węzła po odznaczeniu znów podświetla zależności');
      if (!phone) {
        await page.keyboard.press('Escape');
        const u2 = await deps();
        check(u2.on === 0 && u2.dim === 0 && u2.title === 'Zacznij od ropy', 'Odznaczanie: Esc (bez otwartego okna) też wraca do stanu początkowego', JSON.stringify(u2));
      }
      // okno szczegółów zamyka się dotknięciem poza nim (także na telefonie, gdzie margines jest wąski)
      await page.click('#more');
      check(await modalIsOpen(page), 'Okno: otwarte przed próbą zamknięcia poza nim');
      await page.mouse.click(3, 3);
      check(!(await modalIsOpen(page)), 'Okno szczegółów: kliknięcie poza oknem (w tło) zamyka je');
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
