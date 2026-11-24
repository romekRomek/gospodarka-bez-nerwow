#!/usr/bin/env python3
"""Generuje docs/design/mockups/index.html.

Liczby, teksty i mapa pochodzą z src/ (data/*.json, geo.json, template.html), więc makiety
nie mają zmyślonych danych. Uruchom: python3 docs/design/mockups/build.py
Styl i szkielet strony są w mockups.tpl.html (tokeny w :root to szkic do przyszłego tokens.json).
"""
import json, math, pathlib, re, html

HERE = pathlib.Path(__file__).resolve().parent
import sys
sys.path.insert(0, str(HERE.parent))
import tokens as TOK
ROOT = HERE.parents[2]
SRC = ROOT / 'src'
E = html.escape

D = {f.stem: json.loads(f.read_text(encoding='utf-8')) for f in sorted((SRC / 'data').glob('*.json'))}
GEO = json.loads((SRC / 'geo.json').read_text(encoding='utf-8'))
TPL = (SRC / 'template.html').read_text(encoding='utf-8')
CSS = (SRC / 'styles.css').read_text(encoding='utf-8').split('\n')

STEPS = {s['id']: s for s in D['steps']}
ORDER = [s['id'] for s in D['steps']]
CHG = {c['id']: c for c in D['changelog'][0]['changes']}
ASOF = D['changelog'][0]['label']


# ---------- mapa: definicje (ikony, gradienty, filtry) i scena ----------
def catmull_rom(P, t=0.8):
    d = f'M{P[0][0]} {P[0][1]}'
    for i in range(len(P) - 1):
        p0 = P[i-1] if i > 0 else P[i]; p1 = P[i]; p2 = P[i+1]; p3 = P[i+2] if i + 2 < len(P) else P[i+1]
        c1 = (p1[0] + (p2[0]-p0[0])*t/3, p1[1] + (p2[1]-p0[1])*t/3)
        c2 = (p2[0] - (p3[0]-p1[0])*t/3, p2[1] - (p3[1]-p1[1])*t/3)
        d += f' C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]} {p2[1]}'
    return d

defs = re.search(r'<svg class="map".*?(<defs>.*?</defs>)', TPL, re.S).group(1)
cls = {'pl': 'land pl', 'west': 'land west', 'me': 'land me', 'oth': 'land oth'}
main = ''.join(f'<path class="{cls[x["c"]]}" d="{x["d"]}"/>' for x in GEO['main'] if x['n'] != 'Antarctica')
ins = ''.join(f'<path class="{cls[x["c"]]}" d="{x["d"]}"/>' for x in GEO['inset'])
route = catmull_rom(GEO['route'])
C, R, Pp = (790, 205), 205, tuple(GEO['polandMain'])
dx, dy = C[0]-Pp[0], C[1]-Pp[1]; dist = math.hypot(dx, dy)
a = math.atan2(dy, dx); b = math.asin(R/dist); L = math.sqrt(dist*dist - R*R)
t1 = (Pp[0] + L*math.cos(a+b), Pp[1] + L*math.sin(a+b)); t2 = (Pp[0] + L*math.cos(a-b), Pp[1] + L*math.sin(a-b))
conn = f'M{Pp[0]} {Pp[1]} L{t1[0]:.1f} {t1[1]:.1f} L{t2[0]:.1f} {t2[1]:.1f} Z'

def node_svg(n):
    i = ORDER.index(n['id']) + 1
    w = len(n['lb']) * 8 + 24
    lp = n['lp']
    lx, ly = {'r': (38, -14), 'l': (-38 - w, -14), 't': (-w / 2, -62)}.get(lp, (-w / 2, 36))
    chm = '<circle class="chm" cx="-24" cy="-24" r="7"/>' if n['id'] in CHG else ''
    return (f'<g class="node {n["cat"]}" transform="translate({n["x"]} {n["y"]})">'
            f'<g class="pop"><rect class="tile" x="-32" y="-32" width="64" height="64" rx="22" fill="url(#g-{n["cat"]})"/>'
            f'<use href="#i-{n["id"]}" x="-27" y="-27" width="54" height="54"/></g>{chm}'
            f'<circle class="bn" cx="24" cy="-24" r="11"/><text class="bt" x="24" y="-19.5">{i}</text>'
            f'<g class="lb" transform="translate({lx} {ly})"><rect class="lbbg" width="{w}" height="26" rx="13"/>'
            f'<text class="lbt" x="11" y="19">{E(n["lb"])}</text></g></g>')

nodes = ''.join(node_svg(n) for n in D['nodes'])
world = f'''<g id="world"><rect class="sea" width="1000" height="900"/>
<g filter="url(#rough2)">{main}</g>
<g filter="url(#rough)"><path class="rt" d="{route}"/></g>
<circle class="queue" cx="803" cy="579" r="4.5"/><circle class="queue" cx="815" cy="574" r="4.5"/><circle class="queue" cx="827" cy="570" r="4.5"/>
<g filter="url(#rough)"><path class="ext-arc" d="M104 132 Q 270 130 438 308"/><path class="ext-arc" d="M920 478 Q 700 505 466 330"/><path class="ext-arc" d="M545 372 L 472 334"/></g>
<path class="conn" d="{conn}" filter="url(#rough)"/><circle class="ringp" cx="{Pp[0]}" cy="{Pp[1]}" r="13"/>
<g clip-path="url(#insclip)"><g filter="url(#rough2)"><rect class="sea" x="585" y="0" width="410" height="410"/><g class="ins" transform="translate(790 205)">{ins}</g></g><rect class="shade" x="835" y="0" width="160" height="410"/><line class="div" x1="835" y1="0" x2="835" y2="410"/></g>
<circle class="insring" cx="790" cy="205" r="205" filter="url(#rough)"/>
<text class="cap" x="735" y="440">Łańcuch cen</text><text class="cap" x="905" y="440">Osobne wskaźniki</text>
<g filter="url(#rough)"><path class="link" d="M745 107 L745 150"/><path class="link" d="M716 185 L676 185"/><path class="link" d="M745 222 L745 262"/></g>
{nodes}</g>'''
MAPDEFS = defs.replace('</defs>', world + '</defs>')
# reguły CSS mapy z aplikacji, bez animacji
mapcss = '\n'.join(CSS[104:149])
mapcss = re.sub(r'animation(-[a-z]+)?:[^;}]*;?', '', mapcss)
mapcss = re.sub(r'@keyframes[^{]+\{(?:[^{}]|\{[^{}]*\})*\}', '', mapcss)
MAPCSS = mapcss

def pl(n, dec=1):
    return f'{n:.{dec}f}'.replace('.', ',')

# ---------- komponenty ----------
def chip(kind, text, tip=''):
    t = f' title="{E(tip)}"' if tip else ''
    return f'<span class="chip {kind}"{t}>{text}</span>'

def who(decides, concerns):
    return (f'<dl class="who"><dt>Decyduje</dt><dd>{E(decides)}</dd>'
            f'<dt>Dotyczy</dt><dd>{E(concerns)}</dd></dl>')

EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6.500 10-6.500S22 12 22 12s-3.500 6.500-10 6.500S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'
def watch(text):
    return f'<p class="watch">{EYE}<span><b>Obserwuj:</b> {E(text)}</span></p>'
def soon(events, question):
    li = ''.join(f'<li><span class="when">{E(w)}</span><span>{E(t)}</span></li>' for w, t in events)
    return (f'<div class="soon lv2"><b class="soonh">Co może o tym zadecydować</b><ul class="events">{li}</ul>'
            f'<p class="askme"><b>Dla Ciebie</b>{E(question)}</p></div>')

GR = {'ok': 'Potwierdzone', 'est': 'Szacunek', 'dis': 'Sporne', 'fc': 'Prognoza'}
def grade(k):
    return chip('g-' + k, GR[k])

ARW = {'down': '↓', 'up': '↑', 'flat': '→'}
def delta(d, text):
    return f'<span class="delta"><b aria-hidden="true">{ARW[d]}</b>{text}</span>'

def spark(vals, labels, W_=300, H_=64):
    lo, hi = min(vals) - 8, max(vals) + 8
    px = lambda i: 10 + i * (W_ - 20) / (len(vals) - 1)
    py = lambda v: 8 + (hi - v) / (hi - lo) * (H_ - 22)
    pts = ' '.join(f'{px(i):.1f},{py(v):.1f}' for i, v in enumerate(vals))
    area = f'{px(0):.1f},{H_-14} ' + pts + f' {px(len(vals)-1):.1f},{H_-14}'
    pk = max(range(len(vals)), key=lambda i: vals[i] if i < len(vals) - 1 else -1)
    lab = ''.join(f'<text x="{px(i):.1f}" y="{H_-2}" text-anchor="{"start" if i==0 else "end" if i==len(vals)-1 else "middle"}">{E(l)}</text>' for i, l in enumerate(labels))
    return (f'<svg class="viz" viewBox="0 0 {W_} {H_}" role="img" aria-label="Średnie roczne ceny ropy Brent 2021–2024 i cena dzisiejsza">'
            f'<line class="gl" x1="0" x2="{W_}" y1="{H_-14}" y2="{H_-14}"/>'
            f'<polygon class="ar" points="{area}"/><polyline class="ln" points="{pts}"/>'
            f'<circle class="pk" cx="{px(pk):.1f}" cy="{py(vals[pk]):.1f}" r="3"/>'
            f'<text class="pkl" x="{px(pk):.1f}" y="{py(vals[pk])-7:.1f}" text-anchor="middle">{pl(vals[pk])}</text>'
            f'<circle class="en" cx="{px(len(vals)-1):.1f}" cy="{py(vals[-1]):.1f}" r="5"/>{lab}</svg>')

def band(lo, hi, val, vmax, lbl, W_=300):
    x = lambda v: 8 + v / vmax * (W_ - 16)
    ticks = ''.join(f'<text x="{x(v):.1f}" y="46" text-anchor="middle">{pl(v,0)}%</text>' for v in range(0, int(vmax) + 1))
    return (f'<svg class="viz" viewBox="0 0 {W_} 54" role="img" aria-label="{E(lbl)}">'
            f'<rect class="trk" x="8" y="14" width="{W_-16}" height="12" rx="6"/>'
            f'<rect class="bnd" x="{x(lo):.1f}" y="10" width="{x(hi)-x(lo):.1f}" height="20" rx="6"/>'
            f'<line class="mk" x1="{x(val):.1f}" x2="{x(val):.1f}" y1="4" y2="36"/>'
            f'<circle class="en" cx="{x(val):.1f}" cy="20" r="6"/>{ticks}</svg>')

def bars2(rows, vmax, W_=300):
    out = ''
    for k, (name, v, cls_) in enumerate(rows):
        y = 4 + k * 26
        out += (f'<text class="bl" x="0" y="{y+11}">{E(name)}</text>'
                f'<rect class="trk" x="120" y="{y}" width="{W_-170}" height="14" rx="7"/>'
                f'<rect class="{cls_}" x="120" y="{y}" width="{v/vmax*(W_-170):.1f}" height="14" rx="7"/>'
                f'<text class="bv" x="{W_}" y="{y+11}" text-anchor="end">{E(pl(v))}%</text>')
    return f'<svg class="viz" viewBox="0 0 {W_} 56" role="img" aria-label="Płace nominalnie i ceny">{out}</svg>'

CL = {'hi': 'Wysoka', 'mid': 'Średnia', 'lo': 'Niska'}
FM = {'ok': ('✓', 'w porządku'), 'mid': ('~', 'z zastrzeżeniem'), 'no': ('!', 'problem')}
def conf(level, why, factors=None):
    fac = ''
    if factors:
        fac = '<dl class="cfac lv2">' + ''.join(
            f'<dt>{E(n)}</dt><dd class="f-{st}"><b aria-hidden="true">{FM[st][0]}</b><span class="sr">{FM[st][1]}: </span>{E(t)}</dd>'
            for n, st, t in factors) + '</dl>'
    return (f'<div class="conf c-{level}"><div class="cmain"><span class="cl">Pewność danych</span>'
            f'<span class="pips" aria-hidden="true"><i></i><i></i><i></i></span><b>{CL[level]}</b></div>'
            f'<span class="why">{E(why)}</span>{fac}</div>')

def tile(label, who_html, num, cap, dlt, plain, viz, more, note='', conf_html='', watch_html='', soon_html=''):
    return (f'<article class="stat"><header><span class="tl">{label}</span></header>'
            f'<div class="num">{num}</div><p class="cap-s">{cap}</p>{dlt}'
            f'<p class="plain">{plain}</p>{who_html}{watch_html}<div class="ctx">{viz}<p class="ctxl">{note}</p>{conf_html}</div>'
            f'<p class="more lv2">{more}</p>{soon_html}</article>')

brent = tile('Ropa Brent', who('rynek światowy, negocjacje USA–Iran', 'kierowców, firm zależnych od paliw'), 'ok. 90 <small>USD</small>', 'za baryłkę, 23–24.11',
             delta('down', 'ok. 20% od 27.10 (114 USD)'),
             'Taniej niż miesiąc temu, ale drożej niż w lutym (68 USD).',
             spark([70.9, 100.9, 82.5, 80.5, 92.6], ['2021', '2022', '2023', '2024', 'dziś']),
             'Cena nadal zawiera premię za ryzyko wokół Iranu. Porozumienie mogłoby ją obniżyć, a kolejne ataki na tankowce podbić.',
             'Średnie roczne 2021–2024: cena spot (EIA). Ostatnia wartość: kontrakt ICE z jednego dnia.',
             conf('mid', 'Kontrakt giełdowy z mediów, cena zmienna', [
                 ('Źródło', 'mid', 'Agencje i serwisy rynkowe, nie dane urzędowe'),
                 ('Aktualność', 'ok', 'Cena z 23–24.11'),
                 ('Zgodność źródeł', 'mid', 'Dwie miary (kontrakt ICE i spot EIA), w listopadzie zbliżone, w kryzysie różnice do 26 USD'),
                 ('Rodzaj danych', 'mid', 'Cena rynkowa, zmienia się codziennie')]),
             watch('decyzja o programie na 2027 r. w połowie grudnia'),
             soon([('do końca roku', 'obowiązuje limit cen na stacjach'), ('połowa grudnia', 'decyzja o przedłużeniu programu na 2027 r.'), ('bez terminu', 'negocjacje USA–Iran i incydenty z tankowcami')], 'Jak często tankujesz?'))
cpi = tile('Inflacja CPI', who('ceny w całej gospodarce, pośrednio NBP', 'robiących zakupy, oszczędzających, osoby z kredytem'), '3,5<small>%</small>', 'październik, r/r',
           delta('down', 'z 4,1% we wrześniu'),
           'Ceny rosną wolniej niż miesiąc wcześniej, głównie przez tańsze paliwa.',
           band(1.5, 3.5, 3.5, 5, 'Inflacja 3,5% na górnej granicy celu NBP 2,5% plus minus 1 punkt procentowy'),
           'Niżej niż oczekiwane 3,7%. Spadek to głównie efekt tańszych paliw.',
           'Na górnej granicy celu NBP (2,5% ±1 pp). Źródło: GUS.',
           conf('hi', 'GUS, odczyt finalny z 13.11', [
               ('Źródło', 'ok', 'GUS, dane pierwotne'),
               ('Aktualność', 'ok', 'Odczyt finalny za październik'),
               ('Zgodność źródeł', 'ok', 'Zgodne'),
               ('Rodzaj danych', 'ok', 'Pomiar, nie szacunek')]),
           soon_html=soon([('do końca roku', 'obowiązuje limit cen paliw, a tańsze paliwa obniżyły inflację'), ('co miesiąc', 'kolejny odczyt inflacji z GUS')], 'Na co wydajesz najwięcej w miesiącu?'))
wage = tile('Pensje i portfel', who('pracodawcy i rynek pracy', 'pracowników, firmy'), '+2,4<small>%</small>', 'realny wzrost płac, październik',
            delta('up', 'z +1,6% wcześniej'),
            'Płace rosną szybciej niż ceny, więc zakupów starcza na trochę więcej.',
            bars2([('Płace nominalnie', 6.1, 'bar-a'), ('Ceny (CPI)', 3.5, 'bar-b')], 7),
            'Płace nominalnie +6,1% (9 405 zł). Zatrudnienie w firmach spadło o 0,7% r/r.',
            'Różnica między słupkami to wzrost realny. Źródło: GUS.',
            conf('hi', 'GUS, październik; wzrost realny wyliczony', [
                ('Źródło', 'ok', 'GUS, dane pierwotne'),
                ('Aktualność', 'ok', 'Dane za październik'),
                ('Zgodność źródeł', 'ok', 'Zgodne'),
                ('Rodzaj danych', 'mid', 'Wzrost realny jest wyliczony (płace minus ceny)')]),
            watch_html=watch('zatrudnienie w firmach, spadło o 0,7% r/r'),
            soon_html=soon([('co miesiąc', 'kolejne dane GUS o płacach i zatrudnieniu')], 'Czy Twoja pensja wzrosła w tym roku?'))

EX = [
    dict(topic='Inflacja CPI', fact='3,5% w październiku r/r, we wrześniu 4,1%. Cel NBP: 2,5% ±1 pp.',
         a=('Inflacja hamuje: 3,5% zamiast 4,1%!', 'spadek z 4,1%', 'ulgę'),
         b=('Inflacja wciąż powyżej celu NBP, ceny dalej rosną', 'poziom ponad celem 2,5%', 'niepokój'),
         calm='Ceny rosną wolniej niż miesiąc wcześniej, ale nadal rosną. Ani powód do ulgi, ani do alarmu.',
         conf=conf('hi', 'GUS, odczyt finalny z 13.11', [('Źródło', 'ok', 'GUS, dane pierwotne'), ('Aktualność', 'ok', 'Odczyt finalny za październik'), ('Zgodność źródeł', 'ok', 'Zgodne'), ('Rodzaj danych', 'ok', 'Pomiar, nie szacunek')])),
    dict(topic='Ropa Brent', fact='ok. 90 USD: ok. 24 USD mniej niż 27.10 (114 USD) i ok. 22 USD więcej niż w lutym (68 USD).',
         a=('Ropa tanieje o ok. 24 USD w niecały miesiąc!', 'spadek od 27.10', 'ulgę'),
         b=('Ropa wciąż o ok. 22 USD droższa niż w lutym', 'wzrost od lutego', 'niepokój'),
         calm='Cena spadła od końca października, ale jest wyraźnie wyższa niż w lutym. Wniosek zależy od tego, od kiedy patrzysz.',
         conf=conf('mid', 'Kontrakt giełdowy z mediów, cena zmienna', [('Źródło', 'mid', 'Agencje i serwisy rynkowe'), ('Aktualność', 'ok', 'Cena z 23–24.11'), ('Zgodność źródeł', 'mid', 'Dwie miary (kontrakt ICE i spot EIA), w listopadzie zbliżone, w kryzysie różnice do 26 USD'), ('Rodzaj danych', 'mid', 'Cena rynkowa, zmienia się codziennie')])),
]
def frame_ex(x):
    def bub(k, cls_):
        h, acc, em = x[k]
        return (f'<div class="fb {cls_}"><span class="ftone">Wywołuje {em}</span><p class="fh">{E(h)}</p><small>Akcentuje: {E(acc)}</small></div>')
    return (f'<div class="fx"><div class="ftop">{chip("tlo", E(x["topic"]))}</div>'
            f'<div class="fpair">{bub("a", "a")}{bub("b", "b")}</div>'
            f'<div class="ffact"><b>Pod spodem ten sam fakt</b><p>{E(x["fact"])}</p></div>'
            f'<div class="polu"><b>Po ludzku</b><p>{E(x["calm"])}</p></div>{x["conf"]}</div>')

def frame_card(first_only=True, fixed=False):
    extra = '' if first_only is False else f'<div class="lv2"><hr>{frame_ex(EX[1])}</div>'
    body = frame_ex(EX[0]) + extra if first_only else frame_ex(EX[1])
    return (f'<article class="card frame{" lv2-on" if fixed else ""}"><header><span class="lbl">Ta sama liczba, dwa nagłówki</span></header>'
            f'{body}<footer><span class="fake">Nagłówki wymyślone. Liczby i fakt są prawdziwe.</span></footer></article>')
good_start = frame_card(True)
good_card2 = frame_card(False, True)

HL = [(0, 3), (1, 3), (7, 2)]
def headline_card():
    items = ''
    for k, (i, n) in enumerate(HL):
        x = D['headlines'][i]
        tags = ''.join(chip('tlo', E(t)) for t in x['t'])
        items += (f'<div class="hli"{"" if k == 0 else " hidden"}>'
                  f'<h3 class="hype">{E(x["abs"])}</h3>'
                  f'<div class="parody"><span>Parodiuje klikbajt</span><q>{E(x["h"])}</q></div>'
                  f'<div class="tags">{tags}</div>'
                  f'<div class="hl-b"><div class="refl"><b>Co odzwierciedla</b><p class="emo">Emocja: {E(x["e"])}</p><p>{E(x["i"])}</p></div>'
                  f'<div class="polu"><b>Po ludzku</b><p>{E(x["calm"])}</p><p class="quip">{E(x["lol"])}</p></div></div>'
                  f'<div class="hook lv2"><b>Dzisiejszy kontekst</b><p>{E(x["f"][0])}</p></div>'
                  f'<p class="askq lv2"><b>Zadaj sobie pytanie:</b> {E(x["q"])}</p></div>')
    return (f'<article class="card hl"><header><span class="lbl">Nagłówek dnia</span>'
            f'<div class="hlpg"><button type="button" class="pv" aria-label="Poprzedni nagłówek">‹</button><span class="cnt">1 / {len(HL)}</span><button type="button" class="nx" aria-label="Następny nagłówek">›</button></div></header>'
            f'{items}<footer><span class="fake">Wymyślony nagłówek i wymyślony klikbajt. Żaden serwis ich nie napisał.</span></footer></article>')
headline = headline_card()

tq = D['techniques'][0]
technique = (f'<article class="card tech"><header><span class="lbl">Technika dnia</span></header>'
             f'<h3>{E(tq[0])}</h3><p>{E(tq[1])}</p><p class="ex">{E(tq[2])}</p>'
             f'<a class="lnk" href="#" onclick="return false">Sprawdź nagłówek w skanerze →</a></article>')

nd = {k: sum(1 for c in D['changelog'][0]['changes'] if c['dir'] == k) for k in ('down', 'up', 'flat')}
tot = sum(nd.values())
balance = (f'<div class="bal lv2"><div class="balh"><b>Co się zmieniło</b><span>{tot} zmian od ostatniej aktualizacji</span></div>'
           f'<div class="balb" role="img" aria-label="{nd["down"]} spadków, {nd["up"]} wzrostów, {nd["flat"]} bez zmian">'
           f'<i class="s1" style="flex:{nd["down"]}"></i><i class="s2" style="flex:{nd["up"]}"></i><i class="s3" style="flex:{nd["flat"]}"></i></div>'
           f'<div class="balk"><span><b>↓</b> {nd["down"]} niżej</span><span><b>↑</b> {nd["up"]} wyżej</span><span><b>→</b> {nd["flat"]} bez zmian</span></div></div>')

ICONS = {
 'start': '<path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/>',
 'map': '<path d="M9 5 3.5 7v12L9 17l6 2 5.500-2V5L15 7zM9 5v12M15 7v12"/>',
 'news': '<path d="M5 5h11v14H7a2 2 0 0 1-2-2zM16 9h3v8a2 2 0 0 1-2 2M8 9h5M8 12h5M8 15h3"/>',
 'pl': '<path d="M4 20V5M4 5h13l-2.500 4L17 13H4"/>',
}
def navitem(k, label, on):
    cur = ' aria-current="page"' if on else ''
    return (f'<a class="ni{" on" if on else ""}" href="#" onclick="return false"{cur}>'
            f'<svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[k]}</svg><span>{label}</span></a>')

def nav(active):
    items = [('start', 'Start'), ('map', 'Mapa'), ('news', 'Newsy'), ('pl', 'Polska')]
    inner = ''.join(navitem(k, l, k == active) for k, l in items)
    return f'<nav class="bnav" aria-label="Główna nawigacja">{inner}</nav><nav class="tnav" aria-label="Główna nawigacja">{inner}</nav>'

def topbar(withseg=True):
    seg = ('<div class="seg g-level" role="group" aria-label="Poziom szczegółów">'
           '<button type="button" data-level="1" aria-pressed="true">Podstawy</button>'
           '<button type="button" data-level="2" aria-pressed="false">Więcej</button></div>') if withseg else ''
    return (f'<header class="apptop"><div class="wm">Gospodarka<br>bez nerwów</div>{seg}</header>'
            f'<div class="asof"><i class="dot"></i><span>Dane z {E(ASOF)}</span><button class="chgb" type="button">Co się zmieniło <span class="n">{tot}</span></button></div>')

def start_screen():
    return (f'<div class="scr live lv-1 wide-able" data-live><div class="scr-body">{topbar()}'
            f'<div class="hello"><h2>Dziś w 60 sekund</h2><p>Trzy liczby z kontekstem, przesadzony nagłówek dla śmiechu i technika manipulacji. Tu nie ma dobrych i złych wiadomości, są fakty i sposoby ich opowiadania.</p></div>'
            f'<div class="tiles">{brent}{cpi}{wage}</div>{headline}{balance}'
            f'<div class="row2">{good_start}{technique}</div>'
            f'<a class="btn primary wide" href="#" onclick="return false">Zobacz, jak to się łączy na mapie →</a></div>'
            f'{nav("start")}</div>')

# ---------- mapa na telefonie ----------
def chips_steps(active):
    out = ''
    for i, sid in enumerate(ORDER):
        out += f'<button type="button" class="sc{" on" if sid == active else ""} {STEPS[sid]["cat"]}"><b>{i+1}</b>{E(STEPS[sid]["t"])}</button>'
    return f'<div class="schips" role="group" aria-label="Kroki">{out}</div>'

pump = STEPS['pump']
pc = CHG['pump']

def mapview(view):
    vb = '585 0 410 410' if view == 'pl' else '0 0 1000 900'
    sel = ''
    if view == 'pl':
        sel = ('<path class="mask" fill-rule="evenodd" d="M585 0H995V410H585Z M585 205a205 205 0 1 0 410 0a205 205 0 1 0 -410 0Z"/>'
               '<rect class="sel" x="-44" y="-44" width="88" height="88" rx="28" transform="translate(745 75)"/>')
    return (f'<svg class="mapv" data-view="{view}" viewBox="{vb}" role="img" aria-label="Mapa gospodarcza, widok {"Polska" if view=="pl" else "świat"}"'
            f'{"" if view=="pl" else " hidden"}><use href="#world"/>{sel}</svg>')

def sheet():
    facts = ''.join(f'<li>{E(f)}</li>' for f in pump['f'][:2])
    chart = D['charts']['pump'][0]
    mx = max(abs(v) for v in chart['ds'][0]['d'])
    rows = ''.join(f'<div class="hb"><span>{E(l)}</span><div class="ht"><i class="{"neg" if v<0 else ""}" style="width:{abs(v)/mx*100:.0f}%"></i></div><b>{pl(v)}%</b></div>'
                   for l, v in zip(chart['labels'], chart['ds'][0]['d']))
    return (f'<section class="sheet live lv-1" data-live aria-label="Szczegóły: Stacja paliw"><div class="grip" aria-hidden="true"></div>'
            f'<header class="sh"><div><span class="tag chain">{E(pump["tag"])}</span><h3>{E(pump["t"])}</h3></div>'
            f'<div class="arr"><button type="button" aria-label="Poprzedni krok">‹</button><button type="button" aria-label="Następny krok">›</button></div></header>'
            f'<div class="num">{E(pump["m"])}</div><p class="cap-s">{E(pump["mc"])}</p>'
            f'{delta("down", "z +24% w sierpniu")}'
            f'<p class="plain">W październiku paliwa potaniały o 9,7% m/m dzięki programowi „Ceny Paliwa Niżej”.</p>'
            f'{who("rząd (program „Ceny Paliwa Niżej”) i rynek ropy", "kierowców, firm zależnych od paliw")}{watch("decyzja o przedłużeniu programu na 2027 r. ma zapaść w połowie grudnia")}'
            f'<button class="btn lv1only more-btn" type="button">Pokaż więcej</button>'
            f'<div class="lv2"><h4>Fakty</h4><ul class="facts">{facts}</ul>'
            f'<div class="interp"><b>Interpretacja</b><p>{E(pump["i"])}</p></div>'
            f'<h4>Z czego bierze się inflacja</h4><div class="hbars">{rows}</div>'
            f'{conf("hi", "GUS, październik 2026", [("Źródło", "ok", "GUS, dane pierwotne"), ("Aktualność", "ok", "Dane za październik"), ("Zgodność źródeł", "ok", "Zgodne"), ("Rodzaj danych", "ok", "Pomiar")])}'
            f'<div class="forme"><b>Co to znaczy dla mnie</b><p>Maksymalna cena diesla wynosi 7,32 zł za litr (24.11), a limit cen obowiązuje do końca roku.</p></div>'
            f'<button class="btn ghost" type="button">Źródła i metodologia ▾</button></div></section>')

def strip():
    items = [('Ropa', 'ok. 90 USD', 'down'), ('CPI', '3,5%', 'down'), ('Płace realnie', '+2,4%', 'up')]
    pills = ''.join(f'<span class="sp"><small>{n}</small><b>{v}</b><i aria-hidden="true">{ARW[d]}</i></span>' for n, v, d in items)
    return (f'<div class="strip" aria-label="Dziś"><span class="stl">Dziś</span>{pills}'
            f'<span class="sp tq"><small>Technika dnia</small><b>Luka ciekawości</b></span></div>')

def map_screen():
    return (f'<div class="scr live lv-1" data-live><div class="scr-body tight"><header class="apptop"><div class="wm">Gospodarka<br>bez nerwów</div>'
            f'<div class="seg g-level" role="group" aria-label="Poziom szczegółów"><button type="button" data-level="1" aria-pressed="true">Podstawy</button><button type="button" data-level="2" aria-pressed="false">Więcej</button></div></header>'
            f'<div class="variantb"><span class="vtag">Wariant B: pasek „Dziś” nad mapą</span>{strip()}</div>'
            f'<div class="mapcard"><div class="seg mapseg" role="group" aria-label="Widok mapy"><button type="button" data-view="pl" aria-pressed="true">Polska</button><button type="button" data-view="world" aria-pressed="false">Świat</button></div>'
            f'{mapview("pl")}{mapview("world")}</div>{chips_steps("pump")}'
            f'<div class="tour"><button class="btn" type="button">▶ Oprowadź mnie</button><button class="btn" type="button">Prześledź łańcuch</button></div></div>'
            f'{sheet()}{nav("map")}</div>')

# ---------- karta węzła na poziomach (statycznie) ----------
def node_card(level):
    s = STEPS['shop']; c = CHG['shop']
    facts = ''.join(f'<li>{E(f)}</li>' for f in s['f'][:2])
    cls_ = 'lv2-on' if level == 2 else ''
    return (f'<article class="ncard {cls_}"><header class="sh"><div><span class="tag chain">{E(s["tag"])}</span><h3>{E(s["t"])}</h3></div></header>'
            f'<div class="num">{E(s["m"])}</div><p class="cap-s">{E(s["mc"])}</p>{delta("down", "z 4,1% we wrześniu")}'
            f'<p class="plain">Ceny rosną wolniej niż miesiąc wcześniej, głównie przez tańsze paliwa.</p>'
            f'{who("ceny w całej gospodarce, pośrednio NBP", "robiących zakupy, oszczędzających, osoby z kredytem")}'
            f'<div class="lv2"><h4>Fakty</h4><ul class="facts">{facts}</ul>'
            f'<div class="interp"><b>Interpretacja</b><p>{E(s["i"])}</p></div>'
            f'<div class="forme"><b>Co to znaczy dla mnie</b><p>Ceny w sklepie nadal rosną, ale wolniej niż pensje (realnie +2,4%).</p></div>'
            f'{soon([("do końca roku", "obowiązuje limit cen paliw, a tańsze paliwa obniżyły inflację"), ("co miesiąc", "kolejny odczyt inflacji z GUS")], "Na co wydajesz najwięcej w miesiącu?")}'
            f'<button class="btn ghost" type="button">Źródła i metodologia ▾</button></div>'
            f'<footer class="levf"><span>Poziom: <b>{"Więcej" if level==2 else "Podstawy"}</b></span><span>{"ok. 80 słów" if level==2 else "do 40 słów, ok. 10 s"}</span></footer></article>')

# ---------- dementi ----------
h0 = D['headlines'][0]
myth = (f'<article class="card myth"><header><span class="lbl">Dementi w 4 krokach</span>{grade("ok")}</header>'
        f'<div class="step"><b class="k fact">1 Fakt</b><p>{E(h0["calm"])}</p></div>'
        f'<div class="step"><b class="k mit">2 Mit (nagłówek)</b><p class="q">{E(h0["h"])}</p><small>Przykładowy, wymyślony nagłówek.</small></div>'
        f'<div class="step"><b class="k mech">3 Dlaczego działa</b><div class="tags">{"".join(chip("tlo", E(t)) for t in h0["t"])}</div><p>{E(h0["i"])}</p></div>'
        f'<div class="step"><b class="k fact">4 Fakt jeszcze raz</b><p>{E(h0["f"][0])}</p></div>'
        f'<footer class="ask"><span>Zadaj sobie pytanie</span><b>{E(h0["q"])}</b></footer></article>')

bank = STEPS['bank']
terms = (f'<article class="card terms"><header><span class="lbl">Słowniczek w kontekście</span></header>'
         f'<p class="tp">Rada Polityki Pieniężnej zostawiła <button class="term" type="button" aria-expanded="true" aria-controls="tp1">stopę referencyjną</button> bez zmian.</p>'
         f'<div class="pop-t" id="tp1" role="note"><b>Stopa referencyjna</b><p>Podstawowa stopa procentowa banku centralnego. Od niej zależy oprocentowanie kredytów i lokat. Teraz: {E(bank["m"])}.</p>'
         f'<a class="lnk" href="#" onclick="return false">Więcej o stopach →</a></div></article>')

conf_demo = ('<article class="card confdemo lv2-on"><header><span class="lbl">Wskaźnik pewności danych</span></header>'
             + conf('hi', 'Dane urzędowe, odczyt finalny, zgodne źródła', [('Źródło', 'ok', 'GUS, NBP, Eurostat'), ('Aktualność', 'ok', 'Najnowszy odczyt'), ('Zgodność źródeł', 'ok', 'Zgodne'), ('Rodzaj danych', 'ok', 'Pomiar')])
             + '<hr>' + conf('mid', 'Cena rynkowa albo wyliczenie', [('Źródło', 'mid', 'Agencje i serwisy rynkowe'), ('Aktualność', 'ok', 'Dzisiejszy odczyt'), ('Zgodność źródeł', 'mid', 'Małe różnice między źródłami'), ('Rodzaj danych', 'mid', 'Cena zmienna lub wartość wyliczona')])
             + '<hr>' + conf('lo', 'Przykład ilustracyjny: prognoza z jednego źródła', [('Źródło', 'no', 'Jedno źródło wtórne'), ('Aktualność', 'mid', 'Starsze niż rytm publikacji'), ('Zgodność źródeł', 'no', 'Brak drugiego źródła do porównania'), ('Rodzaj danych', 'no', 'Prognoza, nie pomiar')])
             + '</article>')

# ---------- złożenie ----------
tpl = (HERE / 'mockups.tpl.html').read_text(encoding='utf-8')
subs = {'__TOKENS__': TOK.css(), '__MAPDEFS__': MAPDEFS, '__MAPCSS__': MAPCSS, '__START__': start_screen(), '__STARTWIDE__': start_screen(), '__MAPSCREEN__': map_screen(),
        '__NCARD1__': node_card(1), '__NCARD2__': node_card(2), '__MYTH__': myth, '__GOOD__': good_card2, '__CONFDEMO__': conf_demo, '__TERMS__': terms,
        '__ASOF__': E(ASOF),
        '__GR__': ''.join(f'<li>{grade(k)}<span>{t}</span></li>' for k, t in
                          [('ok', 'liczba z danych pierwotnych (GUS, NBP, Eurostat)'), ('est', 'szacunek lub dane wstępne'),
                           ('dis', 'źródła podają różne wartości'), ('fc', 'prognoza, nie fakt')]),
        '__WT__': ''.join(f'<li><b class="lg">{k}</b><span>{v}</span></li>' for k, v in [
            ('Decyduje', 'kto lub co kształtuje wartość: rynek, bank centralny, rząd, pracodawcy'),
            ('Dotyczy', 'grupy, które to odczują: kierowcy, kredytobiorcy, pracownicy, firmy'),
            ('Obserwuj', 'konkretne wydarzenie lub wskaźnik do śledzenia, tylko gdy jest konkret'),
            ('Co może o tym zadecydować', 'najbliższe wydarzenia z datą (lub „bez terminu”) i jedno łatwe pytanie „Dla Ciebie”')])}
for k, v in subs.items():
    tpl = tpl.replace(k, v)
(HERE / 'index.html').write_text(tpl, encoding='utf-8')
print('docs/design/mockups/index.html', len(tpl), 'znaków')
