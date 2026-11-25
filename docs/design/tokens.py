#!/usr/bin/env python3
"""Tokeny designu: generator CSS i kontrola kontrastu (WCAG AA).

  python3 docs/design/tokens.py css      # wypisuje CSS (:root jasny, ciemny w media i [data-theme])
  python3 docs/design/tokens.py check    # sprawdza kontrasty par tekst/tło w obu motywach

Źródło prawdy: docs/design/tokens.json. Makiety (docs/design/mockups/build.py) używają css().
W fazie 0 ten sam generator zasila src/tokens.css, a design-lint sprawdza, że CSS nie ma surowych wartości.
"""
import json, pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent


def load():
    return json.loads((HERE / 'tokens.json').read_text(encoding='utf-8'))


def _decls(tok, theme):
    out = []
    for name, c in tok['color'].items():
        out.append(f'--{name}:{c[theme]};')
    return out


def css(tok=None):
    tok = tok or load()
    base = _decls(tok, 'light')
    base += [f'--{k}:{v["value"]};' for k, v in tok['font'].items()]
    base += [f'--t-{k}:{v["value"]};' for k, v in tok['type'].items()]
    base += [f'--lh-{k}:{v["value"]};' for k, v in tok['leading'].items()]
    base += [f'--sp-{k}:{v["value"]};' for k, v in tok['space'].items()]
    base += [f'--r-{k}:{v["value"]};' for k, v in tok['radius'].items()]
    dark = _decls(tok, 'dark')
    nl, nd = '\n  ', '\n    '
    return (':root{' + nl + nl.join(base) + nl + 'color-scheme:light;\n}\n'
            '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){' + nd + nd.join(dark) + nd + 'color-scheme:dark;}}\n'
            ':root[data-theme="dark"]{' + nl + nl.join(dark) + nl + 'color-scheme:dark;}\n')


# ---------- kontrast ----------
def _rgb(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def _lum(c):
    def f(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (f(x) for x in c)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = _lum(a), _lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def mix(fg, bg, pct):
    return tuple(round(f * pct + b * (1 - pct)) for f, b in zip(fg, bg))


def pairs(tok, theme):
    col = {k: _rgb(v[theme]) for k, v in tok['color'].items() if v[theme].startswith('#')}
    res = []
    for fg in ('ink', 'mut', 'accent', 'interp'):
        for bg in ('bg', 'surface', 'surface-2'):
            res.append((f'{fg} na {bg}', col[fg], col[bg], 4.5))
    # chipy: kolor tekstu na tle 13% koloru nad powierzchnią
    for c in ('ok', 'est', 'dis', 'fc', 'interp', 'ind', 'ext', 'accent', 'mut', 'chain', 'oil-ink'):
        res.append((f'chip {c}', col[c], mix(col[c], col['surface'], 0.13), 4.5))
    res.append(('przycisk główny (bg na ink)', col['bg'], col['ink'], 4.5))
    res.append(('licznik (bg na accent)', col['bg'], col['accent'], 4.5))
    # elementy graficzne (kropki, słupki, obrysy): 3:1
    for c in ('accent', 'ok', 'dis', 'ext', 'interp'):
        res.append((f'grafika {c} na surface', col[c], col['surface'], 3.0))
    res.append(('obrys kontrolki (line-strong na surface)', col['line-strong'], col['surface'], 1.0))
    return res


def check(tok=None):
    tok = tok or load()
    bad = 0
    for theme in ('light', 'dark'):
        for name, fg, bg, need in pairs(tok, theme):
            r = ratio(fg, bg)
            ok = r >= need
            bad += 0 if ok else 1
            if not ok:
                print(f'[{theme}] {name}: {r:.2f} < {need}')
    print('kontrasty: ' + ('wszystkie pary w normie' if not bad else f'{bad} par poniżej progu'))
    return bad


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'css'
    if cmd == 'css':
        sys.stdout.write(css())
    elif cmd == 'check':
        sys.exit(1 if check() else 0)
    else:
        sys.exit('użycie: tokens.py css|check')
