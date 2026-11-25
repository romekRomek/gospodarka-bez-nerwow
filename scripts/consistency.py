#!/usr/bin/env python3
"""Spójność i wyliczenia (docs/verification.md, warstwa 1, bez modelu i bez sieci).

Kontrole (wszystkie zwracają ZNALEZISKA, validate.py pokazuje je jako OSTRZEŻENIA):
  1. rejestr twierdzeń (claims.json): węzeł, pole, źródła z rejestru, wartość widoczna w tekście węzła,
  2. wyliczenia: twierdzenia z `formula` (a/b-1 w %) przeliczane i porównywane z wartością,
  3. ta sama wielkość w wielu plikach: `groups` w claims.json (temat + okres => dozwolone wartości),
  4. język atrybucji („oczekiw…”, „według ekspertów”, „analitycy”, „prognozuj…”): wymaga twierdzenia
     kind=attribution z cytatem źródła (`file`, `text`, `quote`).
Użycie: python3 scripts/consistency.py [--data src/data] [--json]
"""
import argparse, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCAN = ['steps', 'news', 'headlines', 'problems', 'charts', 'changelog', 'techniques', 'good', 'cost']
ATTRIB = re.compile(r'oczekiw\w*|wed[łl]ug\s+(ekspert\w*|analityk\w*)|analityc\w*|ekonomi[śs]ci\s+(liczy\w*|spodziew\w*)|rynek\s+liczy\w*|prognozuj\w*', re.I)
NUM = re.compile(r'[+−-]?\d+(?:[  ]\d{3})*(?:,\d+)?\s?%')
LOCAL_SKIP = re.compile(r'wobec|wzgl[ęe]dem|k/k|m/m|od\s+pocz', re.I)


def _flat(s):
    return re.sub(r'[\s ]+', '', s)


def variants(v):
    a = abs(v)
    out = {f'{a:g}'.replace('.', ','), f'{a:.2f}'.replace('.', ','), f'{a:.1f}'.replace('.', ',')}
    if float(a).is_integer():
        out.add(str(int(a)))
    return out


def load(data_dir):
    D = {}
    for f in sorted(pathlib.Path(data_dir).glob('*.json')):
        try:
            D[f.stem] = json.loads(f.read_text(encoding='utf-8'))
        except json.JSONDecodeError:
            pass   # niepoprawny JSON zgłasza validate.py
    return D


def leaves(x, path=''):
    """Obiekty, których wartości są tekstami (jednostka tekstu do kontroli spójności)."""
    if isinstance(x, dict):
        strs = {k: v for k, v in x.items() if isinstance(v, str)}
        if strs:
            yield path, ' | '.join(strs.values())
        for k, v in x.items():
            if not isinstance(v, str):
                yield from leaves(v, f'{path}.{k}')
    elif isinstance(x, list):
        strs = [v for v in x if isinstance(v, str)]
        for i, v in enumerate(strs):
            yield path + f'[{i}]', v
        for i, v in enumerate(x):
            if not isinstance(v, str):
                yield from leaves(v, f'{path}[{i}]')


def check_claims(D, out):
    cl = D.get('claims', {}).get('claims', [])
    steps = {n['id']: n for n in D.get('steps', [])}
    reg = {s['id'] for s in D.get('sources', {}).get('sources', [])} if isinstance(D.get('sources'), dict) else set()
    seen = set()
    for c in cl:
        w = f'claims.json:{c.get("id")}'
        if c.get('id') in seen:
            out.append((w, 'powtórzone id twierdzenia'))
        seen.add(c.get('id'))
        for k in ('id', 'node', 'field', 'indicator', 'period', 'value', 'unit', 'src', 'kind'):
            if k not in c:
                out.append((w, f'brak pola „{k}”'))
        if c.get('kind') == 'attribution':
            continue
        if c.get('kind') == 'definition':   # definicja hasła glosariusza: node = id hasła, pole „def”
            terms = {t['id'] for t in D.get('terms', [])} if isinstance(D.get('terms'), list) else set()
            if c.get('node') not in terms:
                out.append((w, f'definicja dotyczy nieznanego hasła „{c.get("node")}”'))
            if c.get('field') != 'def':
                out.append((w, 'pole definicji musi być „def”'))
            for sid in c.get('src', []):
                if reg and sid not in reg:
                    out.append((w, f'źródło „{sid}” spoza rejestru'))
            if not c.get('src') or not c.get('anchor'):
                out.append((w, 'definicja bez źródła lub kotwicy (cytatu)'))
            continue
        n = steps.get(c.get('node'))
        if not n:
            out.append((w, f'nieznany węzeł „{c.get("node")}”'))
            continue
        if c.get('field') not in ('m', 'mc', 'soon'):
            out.append((w, 'pole musi być „m”, „mc” lub „soon” (termin wydarzenia)'))
            continue
        if c.get('field') == 'soon':        # termin wydarzenia: musi istnieć wydarzenie z tym źródłem w węźle
            evs = (n.get('soon') or {}).get('events', [])
            if not any(set(c.get('src', [])) & (set(e.get('src', [])) | set(e.get('affects_src', []))) for e in evs):
                out.append((w, f'węzeł {c["node"]} nie ma wydarzenia ze źródłem {c.get("src")} (soon.events[].src)'))
            if not c.get('src'):
                out.append((w, 'termin bez źródła'))
            continue
        for s in c.get('src', []):
            if reg and s not in reg:
                out.append((w, f'źródło „{s}” spoza rejestru'))
        if not c.get('src'):
            out.append((w, 'twierdzenie bez źródła (src puste): liczba bez dowodu'))
        text = _flat(n.get(c['field'], ''))
        v = c.get('value')
        if isinstance(v, (int, float)) and not any(_flat(x) in text for x in variants(v)):
            out.append((w, f'wartość {v} nie występuje w tekście pola „{c["field"]}” węzła {c["node"]}'))
        f = c.get('formula')
        if f:
            calc = (f['a'] / f['b'] - 1) * 100
            if abs(calc - v) > f.get('tol', 0.1):
                out.append((w, f'wyliczenie a/b−1 = {calc:.2f}%, a w danych {v}% (tolerancja {f.get("tol", 0.1)} pp)'))
    for nid in steps:
        if not any(c['node'] == nid and c['field'] == 'm' and c.get('kind') != 'attribution' for c in cl):
            out.append((f'steps.json:{nid}', 'liczba główna „m” bez twierdzenia w claims.json'))


def check_groups(D, out):
    for g in D.get('claims', {}).get('groups', []):
        topic, period = re.compile(g['topic'], re.I), re.compile(g['period'], re.I)
        canon = [round(x, 2) for x in g['canonical']]
        for name in SCAN:
            for path, text in leaves(D.get(name, {})):
                if not topic.search(text):
                    continue
                if g.get('not') and re.search(g['not'], text, re.I):
                    continue
                ms = list(NUM.finditer(text))
                for i, m in enumerate(ms):
                    prev_end = ms[i - 1].end() if i else 0
                    nxt = ms[i + 1].start() if i + 1 < len(ms) else len(text)
                    tail = re.match(r'\s*\([^)\d]*\)', text[m.end():])  # nawias bez liczb należy do tej liczby
                    after = tail.group(0) if tail else text[m.end():min(nxt, m.end() + 30)]
                    # klauzula przed liczbą: po ostatnim ograniczniku (nawias, przecinek, „i”, „po” itp.)
                    before = re.split(r'[(,;.|:]|\s(?:i|oraz|po|a|wobec|względem)\s', text[prev_end:m.start()])[-1]
                    if not tail and text[m.end():].lstrip().startswith('('):
                        after = ''  # nawias z inną liczbą dotyczy tamtej liczby
                    ctx = before + ' ' + after
                    if not period.search(ctx) or LOCAL_SKIP.search(ctx):
                        continue
                    val = float(re.sub(r'[^\d,−-]', '', m.group(0)).replace('−', '-').replace(',', '.'))
                    if round(abs(val), 2) not in canon:
                        out.append((f'{name}.json{path}', f'„{g["label"]}”: {m.group(0).strip()} zamiast {", ".join(str(x).replace(".", ",") + "%" for x in canon)} (fragment: „{ctx.strip()[-60:]}”)'))


def check_attribution(D, out):
    claims = [c for c in D.get('claims', {}).get('claims', []) if c.get('kind') == 'attribution']
    for name in SCAN:
        for path, text in leaves(D.get(name, {})):
            for m in ATTRIB.finditer(text):
                ok = any(c.get('file') == name and c.get('text', '\0') in text and c.get('quote') for c in claims)
                if not ok:
                    hint = ' (ryzyko: wyrównanie sezonowe lub odczyt nie są konsensusem)' if m.group(0).lower().startswith('oczekiw') else ''
                    out.append((f'{name}.json{path}', f'język atrybucji „{m.group(0)}” bez twierdzenia z cytatem źródła{hint}'))


def run(data_dir=ROOT / 'src' / 'data'):
    D = load(data_dir)
    out = []
    if 'claims' not in D:
        return [('claims.json', 'brak pliku rejestru twierdzeń')]
    check_claims(D, out)
    check_groups(D, out)
    check_attribution(D, out)
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--data', default=str(ROOT / 'src' / 'data'))
    ap.add_argument('--json', action='store_true')
    ap.add_argument('--strict', action='store_true', help='kod 1, gdy są znaleziska')
    a = ap.parse_args(argv)
    f = run(pathlib.Path(a.data))
    if a.json:
        print(json.dumps([{'where': w, 'msg': m} for w, m in f], ensure_ascii=False, indent=1))
    else:
        for w, m in f:
            print(f'ZNALEZISKO {w}: {m}')
        print(f'\nznalezisk: {len(f)}')
    return 1 if (f and a.strict) else 0


if __name__ == '__main__':
    sys.exit(main())
