#!/usr/bin/env python3
"""Weryfikacja V1 (docs/verification.md): sprawdza twierdzenia z src/data/claims.json w tekście źródeł.

Dla każdego twierdzenia pobiera strony z `src` (adres z rejestru sources.json), szuka kotwicy (anchor) i wartości
w tym samym fragmencie i zapisuje dowód (adres, data pobrania, skrót treści, fragment) do docs/evidence/rrrr-mm-dd.json.

Wynik dla twierdzenia:
  potwierdzone     kotwica i wartość w tym samym fragmencie (do 200 znaków), albo wartość w tekście, gdy kotwica jest pusta
  rozbieżne        kotwica jest, ale wartości obok niej nie ma (inna liczba, inny okres albo inna wielkość)
  brak w tekście   ani wartości, ani kotwicy w pobranym tekście
  niedostępne      401/403/429, błąd sieci, PDF/XLSX bez parsera, brak adresu: to NIE jest werdykt o treści

Sieć jest opcjonalna: CI od niej nie zależy (testy podstawiają własne pobieranie). Użycie:
  python3 scripts/verify_claims.py [--only węzeł] [--out docs/evidence] [--no-write]
"""
import argparse, datetime, hashlib, json, pathlib, re, ssl, sys, urllib.request, urllib.error
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
UA = 'Mozilla/5.0 (compatible; gospodarka-bez-nerwow-verify/1.0)'
WINDOW = 200
RESULTS = ('potwierdzone', 'rozbieżne', 'brak w tekście', 'niedostępne')
BLOCKED = {401, 403, 429}


class _Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts, self.skip = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'noscript'):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript') and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


def html_to_text(html):
    p = _Text()
    p.feed(html)
    return re.sub(r'\s+', ' ', ' '.join(p.parts).replace(' ', ' ')).strip()


def variants(v):
    if not isinstance(v, (int, float)):
        return []
    a = abs(v)
    s = {f'{a:g}', f'{a:.1f}', f'{a:.2f}'}
    out = set()
    for x in s:
        out.add(x.replace('.', ','))
        out.add(x)
    if float(a).is_integer():
        n = int(a)
        out.add(f'{n:,}'.replace(',', ' '))
        out.add(str(n))
    return sorted(out, key=len, reverse=True)


def _norm(s):
    """Scala grupy tysięcy zapisane ze spacją: „4 320” -> „4320”."""
    return re.sub(r'(?<=\d)[ \u00a0](?=\d{3}(?!\d))', '', s)


def _near_numbers(text, centers):
    out = []
    for a in centers:
        seg = text[max(0, a - WINDOW):a + WINDOW]
        for m in re.finditer(r'(?<![\d.,])\d+(?:[.,]\d+)?(?![\d])', seg):
            try:
                out.append(float(m.group(0).replace(',', '.')))
            except ValueError:
                pass
    return out


def _rounds_to(x, v):
    """Czy x po zaokrągleniu do precyzji wartości v daje v (np. 4170,92 -> 4171, 113,88 -> 114)."""
    s = repr(float(v))
    dec = len(s.split('.')[1].rstrip('0')) if '.' in s else 0
    return abs(round(x, dec) - float(v)) < 1e-9


def _find(text, needle):
    return [m.start() for m in re.finditer(r'(?<![\d,.])' + re.escape(needle) + r'(?![\d])', text)]


def evaluate(claim, text):
    """Czysta funkcja: (twierdzenie, tekst źródła) -> (wynik, fragment)."""
    text = _norm(text)
    low = text.lower()
    vals = variants(claim.get('value'))
    pos = sorted({p for v in vals for p in _find(text, v)})
    anchor = _norm((claim.get('anchor') or '').strip())
    if not anchor:
        if pos:
            return 'potwierdzone', text[max(0, pos[0] - 80):pos[0] + 80]
        return 'brak w tekście', ''
    apos = [m.start() for m in re.finditer(re.escape(anchor.lower()), low)]
    if not apos:
        return 'brak w tekście', ''
    for a in apos:
        for p in pos:
            if abs(p - a) <= WINDOW:
                lo = max(0, min(a, p) - 60)
                return 'potwierdzone', text[lo:max(a, p) + 100]
    if not vals:   # wartość nieliczbowa: sama kotwica
        return 'potwierdzone', text[max(0, apos[0] - 60):apos[0] + 120]
    v = claim.get('value')
    if isinstance(v, (int, float)) and any(_rounds_to(x, v) for x in _near_numbers(text, apos)):
        return 'potwierdzone', text[max(0, apos[0] - 60):apos[0] + 140]
    return 'rozbieżne', text[max(0, apos[0] - 60):apos[0] + 140]


def fetch(url, timeout=20):
    """Zwraca (status, tekst, błąd). Tekst tylko dla HTML/tekstu."""
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'text/html,*/*'})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ssl.create_default_context()) as r:
            ctype = r.headers.get('Content-Type', '')
            raw = r.read(5_000_000)
            if 'pdf' in ctype or url.lower().endswith(('.pdf', '.xlsx')):
                return r.status, None, 'PDF/XLSX bez parsera'
            enc = re.search(r'charset=([\w-]+)', ctype)
            return r.status, raw.decode(enc.group(1) if enc else 'utf-8', 'replace'), None
    except urllib.error.HTTPError as e:
        return e.code, None, f'HTTP {e.code}'
    except Exception as e:  # sieć, DNS, TLS, timeout
        return None, None, f'{type(e).__name__}: {e}'


def verify(data_dir, fetcher=fetch, only=None, now=None):
    now = now or datetime.datetime.now(datetime.timezone.utc)
    claims = json.loads((data_dir / 'claims.json').read_text(encoding='utf-8'))['claims']
    reg = {s['id']: s for s in json.loads((data_dir / 'sources.json').read_text(encoding='utf-8'))['sources']}
    cache, rows = {}, []
    for c in claims:
        if c.get('kind') == 'attribution' or (only and c['node'] != only):
            continue
        tries = []
        for sid in c.get('src', []):
            s = reg.get(sid)
            if not s:
                tries.append({'src': sid, 'result': 'niedostępne', 'detail': 'źródło spoza rejestru'})
                continue
            url = s['url']
            if url not in cache:
                st, body, err = fetcher(url)
                text = html_to_text(body) if body else None
                cache[url] = {'status': st, 'text': text, 'err': err, 'sha256': hashlib.sha256(text.encode()).hexdigest() if text else None}
            f = cache[url]
            if f['text'] is None:
                tries.append({'src': sid, 'url': url, 'result': 'niedostępne', 'detail': f['err'] or f'status {f["status"]}'})
                continue
            res, frag = evaluate(c, f['text'])
            tries.append({'src': sid, 'url': url, 'result': res, 'fragment': frag, 'sha256': f['sha256'], 'fetched': now.isoformat(timespec='seconds')})
        if not tries:
            final = 'niedostępne'
            tries = [{'result': 'niedostępne', 'detail': 'twierdzenie bez źródła (src puste)'}]
        else:
            order = {r: i for i, r in enumerate(RESULTS)}
            final = min((t['result'] for t in tries), key=order.get)
            if final == 'niedostępne' and any(t['result'] != 'niedostępne' for t in tries):
                final = min((t['result'] for t in tries if t['result'] != 'niedostępne'), key=order.get)
        rows.append({'id': c['id'], 'node': c['node'], 'field': c['field'], 'value': c.get('value'), 'unit': c.get('unit'),
                     'period': c.get('period'), 'result': final, 'evidence': tries})
    return rows


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--data', default=str(ROOT / 'src' / 'data'))
    ap.add_argument('--out', default=str(ROOT / 'docs' / 'evidence'))
    ap.add_argument('--only')
    ap.add_argument('--no-write', action='store_true')
    a = ap.parse_args(argv)
    rows = verify(pathlib.Path(a.data), only=a.only)
    summary = {r: sum(1 for x in rows if x['result'] == r) for r in RESULTS}
    for x in rows:
        print(f'{x["result"]:15} {x["id"]}')
    print('podsumowanie:', summary)
    if not a.no_write:
        out = pathlib.Path(a.out)
        out.mkdir(parents=True, exist_ok=True)
        day = datetime.date.today().isoformat()
        (out / f'{day}.json').write_text(json.dumps({'date': day, 'summary': summary, 'claims': rows}, ensure_ascii=False, indent=1), encoding='utf-8')
        print(f'dowód: {out / (day + ".json")}')
    return 0   # niedostępne i rozbieżne to raport, nie błąd (sieć opcjonalna)


if __name__ == '__main__':
    sys.exit(main())
