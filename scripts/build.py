#!/usr/bin/env python3
"""Składa dist/index.html z src/: template.html + tokens.css + styles.css + data/*.json + components/*.js + app.js + geo.json (kształty map).

src/tokens.css jest generowany z docs/design/tokens.json (docs/design/tokens.py, funkcja css()). Plik jest commitowany,
a build zawsze go odtwarza; test tests/test_tokens.py pilnuje, że wersja w repo zgadza się z tokens.json.
"""
import importlib.util, json, math, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, DIST = ROOT / 'src', ROOT / 'dist'
CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>'

_spec = importlib.util.spec_from_file_location('tokens', ROOT / 'docs' / 'design' / 'tokens.py')
tokens = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(tokens)
TOKENS_HEADER = '/* GENEROWANY z docs/design/tokens.json (python3 scripts/build.py). Nie edytuj ręcznie; zmień tokens.json. */\n'
(SRC / 'tokens.css').write_text(TOKENS_HEADER + tokens.css(), encoding='utf-8')

g = json.loads((SRC / 'geo.json').read_text(encoding='utf-8'))
tpl = (SRC / 'template.html').read_text(encoding='utf-8')
css = ((SRC / 'tokens.css').read_text(encoding='utf-8') + (SRC / 'styles.css').read_text(encoding='utf-8')).rstrip('\n')
# komponenty interfejsu (src/components/*.js) w kolejności nazw plików, potem app.js (inicjalizacja); jeden wspólny zakres globalny
COMPONENTS = sorted((SRC / 'components').glob('*.js'), key=lambda f: f.name)
js = '\n'.join(f.read_text(encoding='utf-8').rstrip('\n') for f in COMPONENTS + [SRC / 'app.js'])
# dane z src/data/*.json trafiają do obiektu DATA (klucz = nazwa pliku), z którego czyta app.js
# sources.json to rejestr dla walidatora i wskaźnika pewności; do strony trafi dopiero z generowaną listą „Źródła”
NOT_SHIPPED = {'sources', 'claims'}   # rejestr źródeł i twierdzeń to dane dla bramek, nie dla strony
data = {f.stem: json.loads(f.read_text(encoding='utf-8')) for f in sorted((SRC / 'data').glob('*.json')) if f.stem not in NOT_SHIPPED}
# wskaźnik pewności (scripts/confidence.py) liczony w buildzie, z „dzisiaj” = data najnowszego wpisu dziennika zmian,
# żeby build był powtarzalny (ta sama data i dane = ten sam wynik)
_cs = importlib.util.spec_from_file_location('confidence', ROOT / 'scripts' / 'confidence.py')
confidence = importlib.util.module_from_spec(_cs)
_cs.loader.exec_module(confidence)
_d, _m, _y = data['changelog'][0]['label'].split('.')
_today = confidence.parse_date(f'{_y}-{_m}-{_d}')
_conf = confidence.compute_all(confidence.load_nodes(SRC / 'data'), confidence.load_sources(SRC / 'data'), _today)
data['confidence'] = {'computed': _today.isoformat(), 'nodes': _conf}
# źródła haseł glosariusza (nazwa i adres z rejestru) dla okienka definicji; reszta rejestru nie trafia na stronę
_reg = {x['id']: x for x in json.loads((SRC / 'data' / 'sources.json').read_text(encoding='utf-8'))['sources']}
data['termsrc'] = {i: {'name': _reg[i]['name'], 'url': _reg[i]['url']} for t in data['terms'] for i in t['src'] if i in _reg}
# źródła terminów wydarzeń (soon.events[].src): nazwa, adres i poziom z rejestru, dla kalendarza
data['evsrc'] = {i: {'name': _reg[i]['name'], 'url': _reg[i]['url'], 'tier': _reg[i]['tier']}
                 for s in data['steps'] for e in (s.get('soon') or {}).get('events', []) for i in e.get('src', []) + e.get('affects_src', []) if i in _reg}
js = 'var DATA=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + ';\n' + js

cls = {'pl': 'land pl', 'west': 'land west', 'me': 'land me', 'oth': 'land oth'}
main = ''.join(f'<path class="{cls[x["c"]]}" d="{x["d"]}"/>' for x in g['main'] if x['n'] != 'Antarctica')
ins = ''.join(f'<path class="{cls[x["c"]]}" d="{x["d"]}"/>' for x in g['inset'])

def catmull_rom(P, t=0.8):
    d = f'M{P[0][0]} {P[0][1]}'
    for i in range(len(P) - 1):
        p0 = P[i-1] if i > 0 else P[i]; p1 = P[i]; p2 = P[i+1]; p3 = P[i+2] if i + 2 < len(P) else P[i+1]
        c1 = (p1[0] + (p2[0]-p0[0])*t/3, p1[1] + (p2[1]-p0[1])*t/3)
        c2 = (p2[0] - (p3[0]-p1[0])*t/3, p2[1] - (p3[1]-p1[1])*t/3)
        d += f' C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]} {p2[1]}'
    return d

route = catmull_rom(g['route'])
C, R, Pp = (790, 205), 205, tuple(g['polandMain'])   # środek i promień lupy, położenie Polski na mapie głównej
dx, dy = C[0]-Pp[0], C[1]-Pp[1]; d = math.hypot(dx, dy)
a = math.atan2(dy, dx); b = math.asin(R/d); L = math.sqrt(d*d - R*R)
def tangent(sg):
    ang = a + sg*b
    return (Pp[0] + L*math.cos(ang), Pp[1] + L*math.sin(ang))
t1, t2 = tangent(1), tangent(-1)
conn = f'M{Pp[0]} {Pp[1]} L{t1[0]:.1f} {t1[1]:.1f} L{t2[0]:.1f} {t2[1]:.1f} Z'

out = (tpl.replace('/*__STYLE__*/', '<style>\n' + css + '\n</style>')
          .replace('/*__CDN__*/', CDN)
          .replace('/*__SCRIPT__*/', '<script>\n' + js + '\n</script>')
          .replace('__MAIN__', main).replace('__INSET__', ins).replace('__ROUTE__', route)
          .replace('__CONN__', conn).replace('__PX__', str(Pp[0])).replace('__PY__', str(Pp[1])))
DIST.mkdir(exist_ok=True)
(DIST / 'index.html').write_text(out, encoding='utf-8')
print('dist/index.html', len(out), 'znaków')
