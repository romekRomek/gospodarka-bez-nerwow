// Zrzuty „przed i po”: zakładki Mapa, Newsy, Polska i okno szczegółów jednego węzła,
// szerokości 360 / 768 / 1280 px, motyw jasny i ciemny.
//
// Użycie (z katalogu głównego repozytorium):
//   npm --prefix tests/e2e run shots -- [katalog] [--label przed|po|...] [--node id] [--live-cdn]
//   npm --prefix tests/e2e run shots -- --diff katalog/przed katalog/po
//
// Zrzuty trafiają do <katalog>/<label>/<zakładka>-<szerokość>-<motyw>.png.
// Domyślny katalog to katalog tymczasowy systemu (nigdy repozytorium), domyślna etykieta to „teraz”.
// Ten sam zestaw nazw w katalogach „przed” i „po” pozwala zestawić je parami (--diff wskazuje, co się zmieniło).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  EnvError, EXIT_ENV, ROOT, loadPlaywright, findBrowser, serveDist, requireDist, openPage, chartAvailable,
} from './lib.mjs';

// npm uruchamia skrypt z katalogu tests/e2e, więc ścieżki względne liczymy od miejsca wywołania polecenia
const BASE = process.env.INIT_CWD || process.cwd();
const WIDTHS = [360, 768, 1280];
const THEMES = [['light', 'jasny'], ['dark', 'ciemny']];
const TABS = [
  { file: 'mapa', btn: '#tb-map' },
  { file: 'newsy', btn: '#tb-emo' },
  { file: 'polska', btn: '#tb-pl' },
];

function parseArgs(argv) {
  const o = { out: null, label: 'teraz', node: 'derrick', liveCdn: false, diff: null };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--label') o.label = argv[++i];
    else if (a === '--node') o.node = argv[++i];
    else if (a === '--live-cdn') o.liveCdn = true;
    else if (a === '--diff') { o.diff = [argv[++i], argv[++i]]; }
    else if (a.startsWith('--')) throw new Error('Nieznana opcja: ' + a);
    else rest.push(a);
  }
  o.out = rest[0] ? path.resolve(BASE, rest[0]) : path.join(os.tmpdir(), 'gospodarka-zrzuty');
  return o;
}

function guardOutside(dir) {
  const rel = path.relative(ROOT, dir);
  if (rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))) {
    throw new Error('Katalog zrzutów jest w repozytorium (' + dir + '). Wskaż katalog poza nim, np. /tmp/zrzuty.');
  }
}

function diffDirs(a, b) {
  const list = (d) => fs.readdirSync(d).filter((f) => f.endsWith('.png')).sort();
  const la = list(a), lb = list(b);
  const all = [...new Set([...la, ...lb])].sort();
  let changed = 0;
  for (const f of all) {
    if (!la.includes(f)) { console.log('tylko w po:     ' + f); changed++; continue; }
    if (!lb.includes(f)) { console.log('tylko w przed:  ' + f); changed++; continue; }
    const same = Buffer.compare(fs.readFileSync(path.join(a, f)), fs.readFileSync(path.join(b, f))) === 0;
    console.log((same ? 'bez zmian:      ' : 'ZMIENIONE:      ') + f);
    if (!same) changed++;
  }
  console.log('\nRazem: ' + all.length + ' zrzutów, różnych lub brakujących: ' + changed);
}

async function main() {
  const opt = parseArgs(process.argv.slice(2));
  if (opt.diff) {
    if (!opt.diff[0] || !opt.diff[1]) throw new Error('--diff wymaga dwóch katalogów: --diff przed po');
    diffDirs(path.resolve(BASE, opt.diff[0]), path.resolve(BASE, opt.diff[1]));
    return;
  }
  guardOutside(opt.out);
  const dir = path.join(opt.out, opt.label);
  fs.mkdirSync(dir, { recursive: true });

  requireDist();
  const pw = await loadPlaywright();
  const exe = findBrowser(pw.chromium);
  const server = await serveDist();
  const browser = await pw.chromium.launch({ executablePath: exe, headless: true });
  const t0 = Date.now();
  let n = 0;
  const problems = [];
  try {
    for (const [theme, themePl] of THEMES) {
      for (const width of WIDTHS) {
        const { page, context, errors } = await openPage(browser, server.url, {
          width, height: width < 700 ? 800 : width < 1000 ? 1024 : 800, theme, liveCdn: opt.liveCdn,
        });
        try {
          if (!(await chartAvailable(page))) {
            throw new EnvError('Chart.js nie załadował się' + (opt.liveCdn ? ' z CDN (brak sieci?). Uruchom bez --live-cdn.' : '.'));
          }
          const shot = async (name, full) => {
            await page.waitForTimeout(700); // wykresy Chart.js kończą animację
            const file = path.join(dir, name + '-' + width + '-' + themePl + '.png');
            await page.screenshot({ path: file, fullPage: full });
            n++;
          };
          for (const t of TABS) {
            await page.click(t.btn);
            await shot(t.file, true);
          }
          await page.click(TABS[0].btn);
          const node = page.locator('#n-' + opt.node);
          if (!(await node.count())) throw new Error('Nie ma węzła o id „' + opt.node + '” (opcja --node).');
          await node.click();
          await shot('wezel-' + opt.node, false);
        } finally {
          if (errors.length) problems.push(width + ' px ' + themePl + ': ' + errors.slice(0, 2).join(' | '));
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }
  console.log('Zapisano ' + n + ' zrzutów w ' + dir + ' (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)');
  if (problems.length) {
    console.log('Uwaga: w trakcie robienia zrzutów były błędy konsoli (szczegóły daje test dymny):');
    for (const p of problems) console.log('  ' + p);
  }
}

main().catch((e) => {
  if (e instanceof EnvError) {
    console.error('PROBLEM ŚRODOWISKA: ' + e.message);
    process.exit(EXIT_ENV);
  }
  console.error(e.message || e);
  process.exit(1);
});
