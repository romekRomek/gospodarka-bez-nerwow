#!/usr/bin/env python3
"""design-lint: pilnuje zasady S1 (tylko tokeny) w src/styles.css.

  python3 scripts/design-lint.py [plik.css]     # domyślnie src/styles.css; kod 1 przy naruszeniach

Reguły (każda z numerem w komunikacie):
  kolor      surowe #hex, rgb(a), hsl(a) i inne funkcje kolorów poza blokiem mapy
  font-size  rozmiar czcionki w px (też w skrócie `font`) spoza skali --t-*
  odstęp     padding, margin, gap (też row-/column-gap) w px spoza skali --sp-*
  promień    border-radius w px spoza skali --r-*
  zmienna    var(--x) bez definicji (w tokenach albo lokalnie w CSS)
  wyjątek    wpis z EXCEPTIONS, który nic już nie dopuszcza (usuń go)

Blok mapy ograniczają komentarze `/* design-lint: map start */` i `/* design-lint: map end */`;
jego wnętrze jest pomijane (grafika SVG ma własne, nietokenowe wartości).

Wartości bez tokenu, które świadomie zostają w CSS, wpisujemy do EXCEPTIONS z uzasadnieniem.
Wyjątek dotyczy konkretnej wartości danego rodzaju (nie wyłącza reguły); każdy trzeba umieć obronić.
Python 3.9+.
"""
import importlib.util, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEFAULT_CSS = ROOT / 'src' / 'styles.css'

MAP_START, MAP_END = 'design-lint: map start', 'design-lint: map end'

# (rodzaj, wartość) -> uzasadnienie. Rodzaje: font-size, odstęp, promień, kolor.
# Wartość to liczba px bez jednostki dla font-size/odstęp/promień. Decyzje człowieka: patrz raport migracji.
EXCEPTIONS = {
    ('font-size', '12.5'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 12 (--t-xs)',
    ('font-size', '13'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 12 (--t-xs) albo 14 (--t-sm)',
    ('font-size', '13.5'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 14 (--t-sm)',
    ('font-size', '14.5'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 14 (--t-sm)',
    ('font-size', '15'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 16 (--t-md)',
    ('font-size', '17'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 16 (--t-md)',
    ('font-size', '18'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 20 (--t-lg)',
    ('font-size', '19'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 20 (--t-lg)',
    ('font-size', '21'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 20 (--t-lg)',
    ('font-size', '22'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 20 (--t-lg) albo 26 (--t-xl)',
    ('font-size', '24'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 26 (--t-xl)',
    ('font-size', '27'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 26 (--t-xl)',
    ('font-size', '28'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 26 (--t-xl) albo 34 (--t-2xl)',
    ('font-size', '30'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 26 (--t-xl) albo 34 (--t-2xl)',
    ('font-size', '36'): 'rozmiar spoza skali --t-*; do decyzji człowieka, propozycja: 34 (--t-2xl) albo 40 (--t-num)',
    ('odstęp', '2'): 'odstęp spoza skali --sp-*; do decyzji człowieka, propozycja: nowy token --sp-0 = 2px albo 4 (--sp-1)',
    ('odstęp', '3'): 'odstęp spoza skali --sp-*; do decyzji człowieka, propozycja: 4 (--sp-1)',
    ('odstęp', '5'): 'odstęp spoza skali --sp-*; do decyzji człowieka, propozycja: 4 (--sp-1)',
    ('odstęp', '6'): 'odstęp spoza skali --sp-*; do decyzji człowieka, propozycja: 8 (--sp-2) albo nowy token 6px',
    ('odstęp', '7'): 'odstęp spoza skali --sp-*; do decyzji człowieka, propozycja: 8 (--sp-2)',
    ('odstęp', '9'): 'odstęp spoza skali --sp-*; do decyzji człowieka, propozycja: 8 (--sp-2)',
    ('odstęp', '10'): 'odstęp spoza skali --sp-*; do decyzji człowieka, propozycja: 8 (--sp-2) albo 12 (--sp-3)',
    ('odstęp', '14'): 'odstęp spoza skali --sp-*; do decyzji człowieka, propozycja: 12 (--sp-3) albo 16 (--sp-4)',
    ('odstęp', '18'): 'odstęp spoza skali --sp-*; do decyzji człowieka, propozycja: 16 (--sp-4)',
    ('odstęp', '28'): 'odstęp spoza skali --sp-*; do decyzji człowieka, propozycja: 24 (--sp-5) albo 32 (--sp-6)',
    ('promień', '3'): 'promień spoza skali --r-*; do decyzji człowieka, propozycja: połowa wysokości paska 3px; zostawić albo dodać token',
    ('promień', '12'): 'promień spoza skali --r-*; do decyzji człowieka, propozycja: 10 (--r-sm)',
    ('promień', '18'): 'promień spoza skali --r-*; do decyzji człowieka, propozycja: 16 (--r-md)',
    ('promień', '20'): 'promień spoza skali --r-*; do decyzji człowieka, propozycja: 16 (--r-md) albo 24 (--r-lg)',
    ('promień', '28'): 'promień spoza skali --r-*; do decyzji człowieka, propozycja: 24 (--r-lg)',
}

SPACING_PROPS = {
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'padding-inline', 'padding-block',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'margin-inline', 'margin-block',
    'gap', 'row-gap', 'column-gap',
}
RADIUS_PROPS = {
    'border-radius', 'border-top-left-radius', 'border-top-right-radius',
    'border-bottom-left-radius', 'border-bottom-right-radius',
}
COLOR_RE = re.compile(
    r'#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|'
    r'(?<![\w-])(?:white|black|red|green|blue|gray|grey|orange|yellow|purple|pink)(?![\w-])')
PX_RE = re.compile(r'(?<![\w.-])(-?\d*\.?\d+)px\b')
DECL_RE = re.compile(r'([a-zA-Z-]+)\s*:\s*([^;{}]+?)\s*(?=;|\})')
VAR_USE_RE = re.compile(r'var\(\s*(--[\w-]+)')
VAR_DEF_RE = re.compile(r'(?<![\w-])(--[\w-]+)\s*:')


def _load_tokens():
    spec = importlib.util.spec_from_file_location('tokens', ROOT / 'docs' / 'design' / 'tokens.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.load()


def _num(px):
    n = float(px)
    return int(n) if n == int(n) else n


def scales(tok):
    def px_set(group):
        return {_num(v['value'][:-2]) for v in group.values() if v['value'].endswith('px')}
    return {'font-size': px_set(tok['type']), 'odstęp': px_set(tok['space']) | {0},
            'promień': px_set(tok['radius']) | {0}}


def defined_vars(tok):
    names = set('--' + k for k in tok['color']) | set('--' + k for k in tok['font'])
    names |= {'--t-' + k for k in tok['type']} | {'--lh-' + k for k in tok['leading']} | {'--sp-' + k for k in tok['space']} | {'--r-' + k for k in tok['radius']}
    return names


def strip(css):
    """Zwraca CSS bez komentarzy i bez bloku mapy; zachowuje numery linii (zastępuje znakami spacji/nowej linii).
    Drugi wynik to lista błędów składni znaczników mapy (linia, komunikat)."""
    errs, out, pos = [], [], 0
    in_map, map_line = False, 0

    def blank(s):
        return re.sub(r'[^\n]', ' ', s)

    for m in re.finditer(r'/\*(.*?)\*/', css, re.S):
        out.append(css[pos:m.start()] if not in_map else blank(css[pos:m.start()]))
        out.append(blank(m.group(0)))
        line = css.count('\n', 0, m.start()) + 1
        if MAP_START in m.group(1):
            if in_map:
                errs.append((line, 'drugi znacznik „map start” bez „map end”'))
            in_map, map_line = True, line
        elif MAP_END in m.group(1):
            if not in_map:
                errs.append((line, '„map end” bez „map start”'))
            in_map = False
        pos = m.end()
    out.append(css[pos:] if not in_map else blank(css[pos:]))
    if in_map:
        errs.append((map_line, '„map start” bez „map end”'))
    return ''.join(out), errs


def lint(css, tok=None, exceptions=None, check_unused=True):
    """Zwraca listę (linia, rodzaj, komunikat). Pusta lista = czysto.
    check_unused=False pomija zgłaszanie nieużytych wyjątków (dla plików innych niż src/styles.css)."""
    tok = tok or _load_tokens()
    exceptions = EXCEPTIONS if exceptions is None else exceptions
    sc = scales(tok)
    body, errs = strip(css)
    res = [(ln, 'mapa', msg) for ln, msg in errs]
    used_exc = set()

    def line_of(off):
        return css.count('\n', 0, off) + 1

    def check_px(kind, val, off, prop):
        for m in PX_RE.finditer(val):
            n = _num(m.group(1))
            if abs(n) in sc[kind] and (kind != 'font-size' or n > 0):
                continue
            key = (kind, str(abs(n)))
            if key in exceptions:
                used_exc.add(key)
                continue
            res.append((line_of(off), kind, f'{prop}: {m.group(0)} spoza skali tokenów ({sorted(sc[kind])}); użyj var(--…) albo dodaj token'))

    for m in DECL_RE.finditer(body):
        prop, val, off = m.group(1).lower(), m.group(2), m.start(2)
        if prop.startswith('--'):
            continue
        for c in COLOR_RE.finditer(val):
            key = ('kolor', c.group(0).lower())
            if key in exceptions:
                used_exc.add(key)
                continue
            res.append((line_of(off), 'kolor', f'{prop}: surowy kolor „{c.group(0)}”; użyj var(--…)'))
        if prop == 'font-size':
            check_px('font-size', val, off, prop)
        elif prop == 'font':
            # skrót: tylko część przed ostatnią rodziną (var(--head) itd.); rozmiar to pierwsza liczba px
            sz = PX_RE.search(re.sub(r'var\([^)]*\)', '', val))
            if sz:
                check_px('font-size', sz.group(0), off, prop)
        elif prop in SPACING_PROPS:
            check_px('odstęp', val, off, prop)
        elif prop in RADIUS_PROPS:
            check_px('promień', val, off, prop)

    # zmienne: użyte vs zdefiniowane (tokeny albo lokalnie w CSS, np. --c w .node)
    known = defined_vars(tok) | set(VAR_DEF_RE.findall(body))
    for m in VAR_USE_RE.finditer(body):
        if m.group(1) not in known:
            res.append((line_of(m.start()), 'zmienna', f'{m.group(1)} nie ma definicji w tokenach ani w CSS'))

    for key in sorted(set(exceptions) - used_exc if check_unused else ()):
        res.append((0, 'wyjątek', f'wyjątek {key} nic nie dopuszcza; usuń go z EXCEPTIONS'))
    return sorted(res)


def main(argv):
    path = pathlib.Path(argv[1]) if len(argv) > 1 else DEFAULT_CSS
    css = path.read_text(encoding='utf-8')
    res = lint(css, check_unused=path.resolve() == DEFAULT_CSS.resolve())
    try:
        shown = path.relative_to(ROOT)
    except ValueError:
        shown = path
    for ln, kind, msg in res:
        print(f'{shown}:{ln}: [{kind}] {msg}')
    print('design-lint: ' + ('czysto' if not res else f'{len(res)} naruszeń'))
    return 1 if res else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
