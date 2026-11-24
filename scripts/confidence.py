#!/usr/bin/env python3
"""Wskaźnik pewności danych (faza 0, decyzja D7). Liczony deterministycznie, bez modelu językowego.

  python3 scripts/confidence.py                        # tabela wszystkich węzłów
  python3 scripts/confidence.py --json                 # wynik maszynowy (JSON na stdout)
  python3 scripts/confidence.py --today 2026-11-24     # stała „dzisiejsza” data (testy, powtarzalność)
  python3 scripts/confidence.py --write                # zapis do src/data/confidence.json (plik pochodny)
  python3 scripts/confidence.py --data DIR             # inny katalog danych

Wejście: `src/data/sources.json` (rejestr: `tier`, `cadence`) oraz węzły z `src/data/steps.json`:
`src` (lista id z rejestru, źródło pierwotne pierwsze) i `conf`:
`{"asof": "rrrr-mm-dd", "kind": "measurement|calculation|market|estimate|forecast",
  "agree": "agree|small|single|differ"}`.

Reguła i mapowanie `cadence` są opisane w docs/design/content-model.md, sekcja „Wskaźnik pewności”.
Kod wyjścia: 1, gdy któryś węzeł ma niepoprawne dane wejściowe (np. nieznane id źródła, zła data);
brak pola `conf` to jeszcze nie błąd (wynik „brak danych wejściowych”, poziom null).
"""
import argparse, datetime, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / 'src' / 'data'

LEVELS = {'hi': 'Wysoka', 'mid': 'Średnia', 'lo': 'Niska'}
STATES = ('ok', 'mid', 'no')
RANK = {'ok': 0, 'mid': 1, 'no': 2}

KINDS = {'measurement': 'ok', 'calculation': 'mid', 'market': 'mid', 'estimate': 'no', 'forecast': 'no'}
AGREE = {'agree': 'ok', 'small': 'mid', 'single': 'mid', 'differ': 'no'}

# Mapowanie tekstu `cadence` na długość rytmu w dniach. Kolejność ma znaczenie („półroczny” zawiera „roczny”).
PERIODS = (
    ('dzienn', 1),
    ('tygodni', 7),
    ('miesięczn', 30),
    ('kwartaln', 91),
    ('półroczn', 182),
    ('roczn', 365),
)
LAG_RE = re.compile(r'opóźnieni\w*\s+(?:ok\.?\s*)?(\d+)\s*(dni|dzień|dnia|tyg\w*)', re.I)
MAX_WHY = 2  # ile fraz najsłabszego stanu trafia do krótkiego powodu
WEEKEND_DAYS = 3  # tolerancja dla notowań dziennych: piątek -> poniedziałek


def parse_cadence(text):
    """Zwraca (okres_w_dniach, opóźnienie_w_dniach) albo None, gdy brak lub nierozpoznany rytm."""
    if not isinstance(text, str) or not text.strip():
        return None
    low = text.lower()
    base = low.split('opóźnieni')[0]  # okres szukamy przed frazą o opóźnieniu („2 tygodnie” nie jest rytmem)
    period = None
    for key, days in PERIODS:
        if key in base:
            period = days
            break
    if period is None:
        return None
    lag = 0
    m = LAG_RE.search(low)
    if m:
        n = int(m.group(1))
        lag = n * 7 if m.group(2).startswith('tyg') else n
    return period, lag


def parse_date(s):
    if not isinstance(s, str) or not re.match(r'^\d{4}-\d{2}-\d{2}$', s):
        return None
    try:
        return datetime.date.fromisoformat(s)
    except ValueError:
        return None


def days_word(n):
    return '1 dzień' if n == 1 else f'{n} dni'


# ---------- czynniki ----------

def factor_source(node, sources_by_id):
    """Zwraca (czynnik, najlepsze_źródło, lista_problemów)."""
    ids = node.get('src')
    name = 'Źródło'
    if not ids:
        return mk(name, 'no', 'Brak źródła', 'Brak źródła'), None, []
    problems = [f'nieznane id źródła: {i}' for i in ids if i not in sources_by_id]
    if problems:
        return None, None, problems
    best = None
    for i in ids:  # pierwsze z najniższym poziomem (przy remisie liczy się kolejność na liście)
        s = sources_by_id[i]
        if best is None or s.get('tier', 3) < best.get('tier', 3):
            best = s
    tier = best.get('tier', 3)
    if tier == 1:
        f = mk(name, 'ok', 'Źródło pierwotne (poziom 1)', 'Źródło pierwotne')
    elif tier == 2:
        f = mk(name, 'mid', 'Agencja lub duża redakcja (poziom 2), nie dane pierwotne', 'Źródło poziomu 2, nie dane pierwotne')
    else:
        f = mk(name, 'no', 'Źródło wtórne (poziom 3)', 'Źródło wtórne (poziom 3)')
    return f, best, []


def factor_freshness(best, asof, today):
    name = 'Aktualność'
    age = (today - asof).days
    cadence_text = (best or {}).get('cadence')
    parsed = parse_cadence(cadence_text)
    if parsed is None:
        if isinstance(cadence_text, str) and cadence_text.strip():
            why = f'Nierozpoznany rytm publikacji w rejestrze („{cadence_text}”)'
        else:
            why = 'Brak rytmu publikacji w rejestrze'
        return mk(name, 'mid', f'{why}; wiek wartości: {days_word(age)}', why)
    period, lag = parsed
    rhythm = period + lag
    tol = WEEKEND_DAYS if period == 1 else 0
    label = f'rytm: {cadence_text}'
    if age <= rhythm + tol:
        return mk(name, 'ok', f'Wiek wartości: {days_word(age)}, {label}', 'Dane aktualne')
    if age <= 2 * rhythm + tol:
        return mk(name, 'mid', f'Wiek wartości: {days_word(age)}, starsza niż rytm publikacji ({cadence_text})', 'Dane starsze niż rytm publikacji')
    return mk(name, 'no', f'Wiek wartości: {days_word(age)}, więcej niż dwa rytmy publikacji ({cadence_text})', 'Dane nieaktualne')


AGREE_TEXT = {
    'agree': ('Źródła zgodne', 'Źródła zgodne'),
    'small': ('Małe różnice między źródłami', 'Małe różnice między źródłami'),
    'single': ('Jedno źródło, bez porównania', 'Jedno źródło'),
    'differ': ('Źródła podają różne wartości', 'Źródła podają różne wartości'),
}
KIND_TEXT = {
    'measurement': ('Pomiar, nie szacunek', 'Pomiar'),
    'calculation': ('Wyliczenie z innych danych', 'Wyliczenie'),
    'market': ('Cena rynkowa, zmienia się w czasie', 'Cena rynkowa, zmienna'),
    'estimate': ('Szacunek', 'Szacunek'),
    'forecast': ('Prognoza', 'Prognoza'),
}


def mk(name, state, text, why):
    # `why` to krótka fraza do powodu ogólnego; nie trafia do wyniku (patrz explain()).
    return {'name': name, 'state': state, 'text': text, '_why': why}


def explain(factors):
    """Powód: frazy z najsłabszego stanu (najwyżej dwie, w kolejności czynników). Gdy wszystko ok, stały tekst."""
    worst = max(RANK[f['state']] for f in factors)
    if worst == 0:
        return 'Źródło pierwotne, aktualne, zgodne, pomiar'
    parts = [f['_why'] for f in factors if RANK[f['state']] == worst][:MAX_WHY]
    out = parts[0]
    for p in parts[1:]:
        out += '; ' + p[0].lower() + p[1:]
    return out


def level_of(states):
    no = states.count('no')
    mid = states.count('mid')
    if no >= 2:
        return 'lo'
    if no == 1 or mid >= 2:
        return 'mid'
    return 'hi'


# ---------- węzeł ----------

def _empty(why, problems=None):
    return {'level': None, 'label': None, 'why': why, 'factors': [], 'problems': problems or []}


def _public(f):
    return {k: v for k, v in f.items() if not k.startswith('_')}


def compute_node(node, sources_by_id, today):
    """Wskaźnik pewności jednego węzła.

    Zwraca słownik {level: 'hi'|'mid'|'lo'|None, label, why, factors: [{name, state, text}] x4, problems: []}.
    Brak `conf` -> level None i „brak danych wejściowych” (problems puste). Niepoprawne dane
    wejściowe (zła data, nieznana wartość, nieznane id źródła) -> level None i niepuste `problems`.
    """
    conf = node.get('conf')
    if not conf:
        return _empty('Brak danych wejściowych (pole conf)')
    if not isinstance(conf, dict):
        return _empty('Niepoprawne dane wejściowe', ['conf nie jest obiektem'])

    problems = []
    asof = parse_date(conf.get('asof'))
    if conf.get('asof') is None:
        problems.append('brak conf.asof')
    elif asof is None:
        problems.append(f'conf.asof „{conf.get("asof")}” nie jest datą rrrr-mm-dd')
    elif asof > today:
        problems.append(f'conf.asof {asof.isoformat()} jest w przyszłości (dziś {today.isoformat()})')
    kind = conf.get('kind')
    if kind is None:
        problems.append('brak conf.kind')
    elif kind not in KINDS:
        problems.append(f'nieznany conf.kind „{kind}”')
    agree = conf.get('agree')
    if agree is None:
        problems.append('brak conf.agree')
    elif agree not in AGREE:
        problems.append(f'nieznany conf.agree „{agree}”')

    f_src, best, src_problems = factor_source(node, sources_by_id)
    problems.extend(src_problems)
    if problems:
        return _empty('Niepoprawne dane wejściowe', problems)

    f_fresh = factor_freshness(best, asof, today)
    long_a, short_a = AGREE_TEXT[agree]
    long_k, short_k = KIND_TEXT[kind]
    factors = [
        f_src,
        f_fresh,
        mk('Zgodność źródeł', AGREE[agree], long_a, short_a),
        mk('Rodzaj danych', KINDS[kind], long_k, short_k),
    ]
    level = level_of([f['state'] for f in factors])
    return {
        'level': level,
        'label': LEVELS[level],
        'why': explain(factors),
        'factors': [_public(f) for f in factors],
        'problems': [],
    }


# ---------- wczytywanie i CLI ----------

def load_json(path):
    return json.loads(pathlib.Path(path).read_text(encoding='utf-8'))


def load_sources(data_dir):
    reg = load_json(pathlib.Path(data_dir) / 'sources.json')
    return {s['id']: s for s in reg.get('sources', [])}


def load_nodes(data_dir):
    return load_json(pathlib.Path(data_dir) / 'steps.json')


def compute_all(nodes, sources_by_id, today):
    return {n['id']: compute_node(n, sources_by_id, today) for n in nodes}


def render_table(results):
    sym = {'ok': '✓', 'mid': '~', 'no': '!'}
    lines = []
    for nid, r in results.items():
        if r['level'] is None:
            tag = 'BŁĄD' if r['problems'] else '—'
            extra = '; '.join(r['problems']) if r['problems'] else ''
            lines.append(f'{nid:<10} {tag:<8} {r["why"]}' + (f' ({extra})' if extra else ''))
        else:
            fs = ' '.join(sym[f['state']] for f in r['factors'])
            lines.append(f'{nid:<10} {r["label"]:<8} {fs}   {r["why"]}')
    head = f'{"węzeł":<10} {"poziom":<8} Ź A Z R   powód\n' + '-' * 70
    return head + '\n' + '\n'.join(lines)


def main(argv=None):
    ap = argparse.ArgumentParser(description='Wskaźnik pewności danych (deterministyczny).')
    ap.add_argument('--json', action='store_true', help='wynik jako JSON na stdout')
    ap.add_argument('--today', help='data „dzisiaj” rrrr-mm-dd (domyślnie bieżąca)')
    ap.add_argument('--write', action='store_true', help='zapisz src/data/confidence.json (plik pochodny)')
    ap.add_argument('--data', default=str(DATA), help='katalog z danymi (domyślnie src/data)')
    args = ap.parse_args(argv)

    today = datetime.date.today()
    if args.today:
        today = parse_date(args.today)
        if today is None:
            print('--today wymaga daty rrrr-mm-dd', file=sys.stderr)
            return 2

    results = compute_all(load_nodes(args.data), load_sources(args.data), today)
    doc = {'computed': today.isoformat(), 'nodes': results}

    if args.write:
        out = pathlib.Path(args.data) / 'confidence.json'
        out.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        print(f'Zapisano {out}')
    elif args.json:
        print(json.dumps(doc, ensure_ascii=False, indent=1))
    else:
        print(render_table(results))
        missing = sum(1 for r in results.values() if r['level'] is None and not r['problems'])
        if missing:
            print(f'\nBez danych wejściowych (conf): {missing} z {len(results)} węzłów.')

    return 1 if any(r['problems'] for r in results.values()) else 0


if __name__ == '__main__':
    sys.exit(main())
