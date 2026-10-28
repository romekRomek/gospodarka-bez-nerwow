#!/usr/bin/env python3
"""Składa dist/index.html z src/: template.html + styles.css + data/*.json + app.js + geo.json (kształty map)."""
import json, math, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, DIST = ROOT / 'src', ROOT / 'dist'
CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>'

g = json.loads((SRC / 'geo.json').read_text(encoding='utf-8'))
tpl = (SRC / 'template.html').read_text(encoding='utf-8')
css = (SRC / 'styles.css').read_text(encoding='utf-8').rstrip('\n')
js = (SRC / 'app.js').read_text(encoding='utf-8').rstrip('\n')
# dane z src/data/*.json trafiają do obiektu DATA (klucz = nazwa pliku), z którego czyta app.js
data = {f.stem: json.loads(f.read_text(encoding='utf-8')) for f in sorted((SRC / 'data').glob('*.json'))}
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
