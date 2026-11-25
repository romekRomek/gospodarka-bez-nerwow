#!/usr/bin/env python3
"""Walidator danych aplikacji (faza 0, krok 1).

  python3 scripts/validate.py                 # błędy kończą się kodem 1, ostrzeżenia nie
  python3 scripts/validate.py --links         # dodatkowo sprawdza, czy linki ze źródeł działają (sieć)
  python3 scripts/validate.py --json          # podsumowanie maszynowe (dla scorecard)
  python3 scripts/validate.py --data DIR --template FILE   # inne dane (testy)

Sprawdza: poprawność JSON, spójność identyfikatorów między plikami, wymagane pola,
dziennik zmian, rejestr źródeł (src/data/sources.json) i to, że każdy adres URL w danych
i w szablonie jest w rejestrze. Sprawdza pola węzłów dla nowego designu (decides, concerns, watch, soon, conf).
Ostrzega o zaległościach migracji (zasada „nie ma dobrych i złych wiadomości”, brak pól src przy liczbach). Opis zasad: docs/design/principles.md.
"""
import argparse, datetime, importlib.util, json, pathlib, re, sys
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parent.parent
CATS = {'oil', 'chain', 'ind', 'ext'}
DIRS = {'up', 'down', 'flat'}
FETCH = {'page', 'pdf', 'api'}
DATE_RE = re.compile(r'^(\d{2})\.(\d{2})\.(\d{4})$')
URL_RE = re.compile(r'https?://[^"\s\\<>]+')
BANNED = re.compile(r'dobr(a|ą|e|ych|ej)\s+wiadomo|zł(a|ą|e|ych|ej)\s+wiadomo', re.I)
REQUIRED_FILES = ['nodes', 'steps', 'charts', 'news', 'changelog', 'headlines', 'techniques', 'good', 'cost', 'problems', 'terms', 'sources']

# Pola węzła dla nowego designu (docs/design/content-model.md, decyzje D11 i D13).
LIM_DECIDES, LIM_WATCH, LIM_QUESTION, LIM_EVENT = 80, 90, 70, 110
CONF_KINDS = {'measurement', 'calculation', 'market', 'estimate', 'forecast'}
CONF_AGREE = {'agree', 'small', 'differ', 'single'}
ASOF_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
# tryb rozkazujący, nakazy i porady (zasada T7: zaproszenie, nie nakaz)
COMMAND = re.compile(r'\b(powinien|powinna|powinni|powinieneś|powinnaś|musisz|musicie|należy|trzeba|koniecznie|'
                     r'nie przegap\w*|pamiętaj|sprawdź|zobacz|kup|sprzedaj|zainwestuj|zadbaj)\b', re.I)
MONTHS_GEN = {'stycznia': 1, 'lutego': 2, 'marca': 3, 'kwietnia': 4, 'maja': 5, 'czerwca': 6, 'lipca': 7,
              'sierpnia': 8, 'września': 9, 'października': 10, 'listopada': 11, 'grudnia': 12}
MONTHS_NOM = {'styczeń': 1, 'luty': 2, 'marzec': 3, 'kwiecień': 4, 'maj': 5, 'czerwiec': 6, 'lipiec': 7,
              'sierpień': 8, 'wrzesień': 9, 'październik': 10, 'listopad': 11, 'grudzień': 12}


class Report:
    def __init__(self):
        self.errors, self.warnings, self.info = [], [], []

    def err(self, where, msg):
        self.errors.append(f'{where}: {msg}')

    def warn(self, where, msg):
        self.warnings.append(f'{where}: {msg}')

    def note(self, msg):
        self.info.append(msg)


def is_str(x):
    return isinstance(x, str) and x.strip() != ''


def need(r, where, obj, keys):
    if not isinstance(obj, dict):
        r.err(where, 'oczekiwano obiektu')
        return False
    ok = True
    for k in keys:
        if k not in obj or obj[k] in (None, '', []):
            r.err(where, f'brak pola „{k}”')
            ok = False
    return ok


def parse_date(s):
    m = DATE_RE.match(s or '')
    if not m:
        return None
    try:
        return datetime.date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
    except ValueError:
        return None


# ---------- wczytanie ----------
def load(data_dir, r):
    D = {}
    for name in REQUIRED_FILES:
        f = data_dir / f'{name}.json'
        if not f.exists():
            r.err(f'{name}.json', 'brak pliku')
            continue
        try:
            D[name] = json.loads(f.read_text(encoding='utf-8'))
        except json.JSONDecodeError as e:
            r.err(f'{name}.json', f'niepoprawny JSON: {e}')
    return D


# ---------- węzły, kroki, wykresy, newsy ----------
def check_nodes(D, r):
    nodes, steps, charts, news = D.get('nodes'), D.get('steps'), D.get('charts'), D.get('news')
    if not all(isinstance(x, (list, dict)) for x in (nodes, steps, charts, news)):
        return
    ids = []
    for n in nodes:
        if need(r, 'nodes.json', n, ['id', 'cat', 'ic', 'x', 'y', 'lb', 'lp']):
            if n['cat'] not in CATS:
                r.err('nodes.json', f'{n["id"]}: nieznana kategoria „{n["cat"]}”')
            ids.append(n['id'])
    if len(set(ids)) != len(ids):
        r.err('nodes.json', 'powtórzone identyfikatory')
    step_ids = []
    for s in steps:
        if need(r, 'steps.json', s, ['id', 'cat', 'tag', 't', 'm', 'mc', 'f', 'i']):
            step_ids.append(s['id'])
            if s['cat'] not in CATS:
                r.err('steps.json', f'{s["id"]}: nieznana kategoria „{s["cat"]}”')
            if not isinstance(s['f'], list) or not all(is_str(x) for x in s['f']):
                r.err('steps.json', f'{s["id"]}: „f” musi być listą niepustych tekstów')
    for label, got in (('steps.json', set(step_ids)), ('charts.json', set(charts)), ('news.json', set(news))):
        for missing in sorted(set(ids) - got):
            r.err(label, f'brak wpisu dla węzła „{missing}”')
        for extra in sorted(got - set(ids)):
            r.err(label, f'wpis „{extra}” nie ma węzła w nodes.json')
    reg_by_id = {x.get('id'): x for x in (D.get('sources') or {}).get('sources', []) if isinstance(x, dict)}
    covered = primary_cov = 0
    for s in steps:
        if 'src' not in s:
            continue
        if not (isinstance(s['src'], list) and s['src'] and all(is_str(x) for x in s['src'])):
            r.err('steps.json', f'{s.get("id")}: „src” musi być niepustą listą id źródeł')
            continue
        covered += 1
        tiers = []
        for sid in s['src']:
            if sid not in reg_by_id:
                r.err('steps.json', f'{s["id"]}: źródło „{sid}” nie ma wpisu w sources.json')
            elif isinstance(reg_by_id[sid].get('tier'), int):
                tiers.append(reg_by_id[sid]['tier'])
        if tiers and min(tiers) == 1:
            primary_cov += 1
    r.note(f'pokrycie źródłami liczb: {covered}/{len(steps)} węzłów w steps.json ma pole „src” (migracja: faza 0)')
    r.note(f'węzły z co najmniej jednym źródłem pierwotnym (poziom 1): {primary_cov}/{len(steps)}')
    for s in steps:
        if isinstance(s, dict) and 'src' not in s:
            r.warn('steps.json', f'{s.get("id")}: brak „src” przy liczbie głównej (zasada I4, zaległość migracji)')


def parse_when(when, year):
    """Termin wydarzenia z `soon.events[].when` na klucz porządkowy (grupa, data) albo None, gdy format nieznany.

    Grupy: 1 = konkretny termin (data, „połowa grudnia”, „grudzień”, „do końca roku”, „do 2028”),
    2 = cyklicznie („co tydzień”, „co miesiąc”, „co kwartał”), 3 = „bez terminu”."""
    w = (when or '').strip().lower()
    if w == 'bez terminu':
        return (3, datetime.date.max)
    if re.fullmatch(r'co (tydzień|miesiąc|kwartał)', w):
        return (2, datetime.date.max)
    if w == 'do końca roku':
        return (1, datetime.date(year, 12, 31))
    m = re.fullmatch(r'do (?:końca )?(\d{4})', w)
    if m:
        return (1, datetime.date(int(m.group(1)), 12, 31))
    m = re.fullmatch(r'połowa (\w+)', w)
    if m and m.group(1) in MONTHS_GEN:
        return (1, datetime.date(year, MONTHS_GEN[m.group(1)], 15))
    if w in MONTHS_NOM:  # sam miesiąc: liczymy jako jego koniec, żeby nie zakładać dnia
        mo = MONTHS_NOM[w]
        nxt = datetime.date(year + (mo == 12), mo % 12 + 1, 1)
        return (1, nxt - datetime.timedelta(days=1))
    m = re.fullmatch(r'(\d{1,2})(?:[–-]\d{1,2})?\.(\d{1,2})(?:\.(\d{4}))?', w)
    if m:
        try:
            return (1, datetime.date(int(m.group(3) or year), int(m.group(2)), int(m.group(1))))
        except ValueError:
            return None
    return None


def check_node_fields(D, r):
    """Pola węzła dla nowego designu: decides, concerns, watch, soon, conf (decyzje D11, D13, zasady T3, T7)."""
    steps = D.get('steps')
    if not isinstance(steps, list):
        return
    year = 2026
    last_update = None
    cl = D.get('changelog')
    if isinstance(cl, list) and cl and isinstance(cl[0], dict):
        last_update = parse_date(cl[0].get('label'))
        if last_update:
            year = last_update.year
    for s in steps:
        if not isinstance(s, dict):
            continue
        w = f'steps.json {s.get("id")}'
        texts = []

        def text_field(key, limit, required):
            v = s.get(key)
            if v is None:
                if required:
                    r.err(w, f'brak pola „{key}”')
                return None
            if not is_str(v):
                r.err(w, f'„{key}” musi być niepustym tekstem')
                return None
            if len(v) > limit:
                r.err(w, f'„{key}” ma {len(v)} znaków, limit {limit}')
            texts.append((key, v))
            return v

        decides = text_field('decides', LIM_DECIDES, True)
        concerns = text_field('concerns', 10 ** 6, True)
        watch = text_field('watch', LIM_WATCH, False)
        if concerns:
            groups = [g for g in concerns.split(',') if g.strip()]
            if re.search(r'wszystkich', concerns, re.I):
                r.err(w, '„concerns” wymienia „wszystkich”: podaj 2–3 konkretne grupy (zasada T3)')
            if not 2 <= len(groups) <= 3:
                r.err(w, f'„concerns” ma {len(groups)} grup, oczekiwano 2–3 oddzielonych przecinkami (zasada T3)')
        if watch and decides and watch.strip().lower() == decides.strip().lower():
            r.err(w, '„watch” powtarza „decides” (obserwuj tylko z konkretem, zasada T3)')

        soon = s.get('soon')
        if soon is None:
            r.err(w, 'brak pola „soon”')
        elif not isinstance(soon, dict):
            r.err(w, '„soon” musi być obiektem {events, question}')
        else:
            events = soon.get('events')
            if not isinstance(events, list) or not 1 <= len(events) <= 3:
                r.err(w, '„soon.events” musi być listą 1–3 wydarzeń')
                events = []
            keys = []
            for k, e in enumerate(events):
                if not (isinstance(e, dict) and is_str(e.get('when')) and is_str(e.get('text'))):
                    r.err(w, f'„soon.events[{k}]” musi mieć niepuste „when” i „text”')
                    continue
                texts.append((f'soon.events[{k}].when', e['when']))
                texts.append((f'soon.events[{k}].text', e['text']))
                if len(e['text']) > LIM_EVENT:
                    r.err(w, f'„soon.events[{k}].text” ma {len(e["text"])} znaków, limit {LIM_EVENT}')
                key = parse_when(e['when'], year)
                if key is None:
                    r.err(w, f'„soon.events[{k}].when” = „{e["when"]}”: oczekiwano daty, „połowa grudnia”, „grudzień”, '
                             '„do końca roku”, „co miesiąc” albo „bez terminu”')
                else:
                    keys.append((k, e['when'], key))
            for (k1, w1, a), (k2, w2, b) in zip(keys, keys[1:]):
                if b < a:
                    r.err(w, f'„soon.events” nie są chronologiczne: „{w2}” po „{w1}” (cykliczne po datach, „bez terminu” na końcu)')
                    break
            if 'question' in soon:
                q = soon['question']
                if not is_str(q):
                    r.err(w, '„soon.question” musi być niepustym tekstem (pytanie „Dla Ciebie” jest opcjonalne: gdy nie ma dobrego, pomiń pole)')
                else:
                    texts.append(('soon.question', q))
                    if len(q) > LIM_QUESTION:
                        r.err(w, f'„soon.question” ma {len(q)} znaków, limit {LIM_QUESTION}')
                    if q.count('?') != 1 or not q.strip().endswith('?'):
                        r.err(w, '„soon.question” ma być jednym pytaniem zakończonym znakiem „?” (zasada T7)')

        conf = s.get('conf')
        if conf is None:
            r.err(w, 'brak pola „conf” (dane wejściowe wskaźnika pewności)')
        elif not isinstance(conf, dict):
            r.err(w, '„conf” musi być obiektem {asof, kind, agree}')
        else:
            asof = conf.get('asof')
            d = None
            if isinstance(asof, str) and ASOF_RE.match(asof):
                try:
                    d = datetime.date.fromisoformat(asof)
                except ValueError:
                    d = None
            if d is None:
                r.err(w, f'„conf.asof” = „{asof}”: oczekiwano daty rrrr-mm-dd')
            elif last_update and d > last_update:
                r.err(w, f'„conf.asof” ({asof}) jest późniejsze niż ostatnia aktualizacja danych ({cl[0]["label"]})')
            if conf.get('kind') not in CONF_KINDS:
                r.err(w, f'„conf.kind” = „{conf.get("kind")}” spoza {sorted(CONF_KINDS)}')
            if conf.get('agree') not in CONF_AGREE:
                r.err(w, f'„conf.agree” = „{conf.get("agree")}” spoza {sorted(CONF_AGREE)}')

        for key, v in texts:
            if BANNED.search(v):
                r.err(w, f'„{key}” zawiera ocenę „dobra/zła wiadomość” (zasada T1, decyzja D5)')
            m = COMMAND.search(v)
            if m:
                r.err(w, f'„{key}” zawiera nakaz lub poradę („{m.group(0)}”): zaproszenie, nie nakaz (zasada T7)')


def check_chart(r, where, c):
    xline = isinstance(c, dict) and c.get('type') == 'xline'
    if not need(r, where, c, ['t', 'type', 'pts' if xline else 'labels', 'ds']):
        return
    if xline:
        if not all(isinstance(p, list) and len(p) == 3 for p in c['pts']):
            r.err(where, 'punkty „pts” muszą mieć postać [x, y, etykieta]')
        return
    for i, ds in enumerate(c['ds']):
        if not need(r, f'{where} ds[{i}]', ds, ['n', 'd']):
            continue
        if len(ds['d']) != len(c['labels']):
            r.err(where, f'seria „{ds["n"]}” ma {len(ds["d"])} wartości, a etykiet jest {len(c["labels"])}')
    if not is_str(c.get('src')):
        r.warn(where, 'wykres bez pola „src” (opis źródła)')


def check_charts(D, r):
    for nid, lst in (D.get('charts') or {}).items():
        if not isinstance(lst, list) or not lst:
            r.err('charts.json', f'{nid}: oczekiwano niepustej listy wykresów')
            continue
        for k, c in enumerate(lst):
            check_chart(r, f'charts.json {nid}[{k}]', c)
    p = D.get('problems')
    if isinstance(p, dict):
        for k, c in enumerate(p.get('charts', [])):
            check_chart(r, f'problems.json charts[{k}]', c)
        for k, c in enumerate(p.get('cards', [])):
            if need(r, f'problems.json cards[{k}]', c, ['t', 'f', 'src']):
                for s in c['src']:
                    need(r, f'problems.json cards[{k}] src', s, ['l', 'u'])


def check_news(D, r):
    for nid, n in (D.get('news') or {}).items():
        where = f'news.json {nid}'
        for grp in ('pos', 'neu', 'neg'):
            if not isinstance(n.get(grp), list) or not n[grp]:
                r.err(where, f'brak listy „{grp}”')
        for h in n.get('pos', []):
            if need(r, f'{where} pos', h, ['h']) and not is_str(h.get('hk')):
                r.err(where, f'nagłówek „{h["h"][:40]}…” nie ma haczyka uczciwości („hk”)')
        for h in n.get('neg', []):
            if need(r, f'{where} neg', h, ['h']) and not is_str(h.get('f')):
                r.err(where, f'nagłówek „{h["h"][:40]}…” nie ma faktu („f”)')


def check_content(D, r):
    for i, h in enumerate(D.get('headlines') or []):
        if need(r, f'headlines.json[{i}]', h, ['h', 't', 'e', 'f', 'i', 'calm', 'q', 'abs', 'lol']):
            if not isinstance(h['t'], list) or not isinstance(h['f'], list):
                r.err(f'headlines.json[{i}]', '„t” i „f” muszą być listami')
    for i, t in enumerate(D.get('techniques') or []):
        if not (isinstance(t, list) and len(t) == 3 and all(is_str(x) for x in t)):
            r.err(f'techniques.json[{i}]', 'oczekiwano [nazwa, opis, przykłady]')
    for i, g in enumerate(D.get('good') or []):
        if need(r, f'good.json[{i}]', g, ['d', 'b', 'f', 'h', 'u', 'l']) and not str(g['u']).startswith('https://'):
            r.err(f'good.json[{i}]', 'adres „u” musi zaczynać się od https://')
    if not isinstance(D.get('cost'), list) or not D.get('cost'):
        r.err('cost.json', 'oczekiwano niepustej listy')


# ---------- dziennik zmian ----------
def check_terms(D, r):
    """Glosariusz (zasada redakcyjna 7): id, formy, nazwa, definicja w jednym zdaniu, źródło z rejestru albo notatka."""
    terms = D.get('terms')
    if terms is None:
        return
    if not isinstance(terms, list) or not terms:
        r.err('terms.json', 'oczekiwano niepustej listy')
        return
    reg = {x.get('id') for x in (D.get('sources') or {}).get('sources', [])} if isinstance(D.get('sources'), dict) else set()
    ids, forms = set(), {}
    for i, t in enumerate(terms):
        w = f'terms.json[{i}]'
        if not need(r, w, t, ['id', 'forms', 'name', 'def']):
            continue
        if 'src' not in t or 'verified' not in t:
            r.err(w, 'brak pola „src” lub „verified”')
            continue
        if not re.fullmatch(r'[a-z0-9-]+', str(t['id'])):
            r.err(w, 'id musi być małymi literami, cyframi i myślnikami')
        if t['id'] in ids:
            r.err(w, f'powtórzone id „{t["id"]}”')
        ids.add(t['id'])
        if not (isinstance(t['forms'], list) and t['forms'] and all(is_str(x) for x in t['forms'])):
            r.err(w, '„forms” musi być niepustą listą tekstów')
        else:
            for f in t['forms']:
                if f in forms and forms[f] != t['id']:
                    r.err(w, f'forma „{f}” należy już do „{forms[f]}”')
                forms[f] = t['id']
        if not is_str(t['def']) or len(t['def']) > 220:
            r.err(w, 'definicja: tekst do 220 znaków')
        elif len(re.findall(r'[.!?](?:\s|$)', t['def'])) > 1:
            r.warn(w, 'definicja ma więcej niż jedno zdanie (zasada 7: jedno zdanie)')
        if not isinstance(t['src'], list):
            r.err(w, '„src” musi być listą id z rejestru')
        else:
            for sid in t['src']:
                if reg and sid not in reg:
                    r.err(w, f'źródło „{sid}” spoza rejestru')
        if not isinstance(t['verified'], bool):
            r.err(w, '„verified” musi być true lub false')
        elif not t['verified'] and not is_str(t.get('note')):
            r.err(w, 'definicja niepotwierdzona wymaga notatki „note”')
        elif t['verified'] and not t['src']:
            r.err(w, 'definicja potwierdzona wymaga źródła w „src”')
    unv = sum(1 for t in terms if isinstance(t, dict) and t.get('verified') is False)
    if unv:
        r.warn('terms.json', f'{unv}/{len(terms)} definicji niepotwierdzonych w źródle')


def check_changelog(D, r):
    cl, nodes = D.get('changelog'), D.get('nodes')
    if not isinstance(cl, list) or not cl or not isinstance(nodes, list):
        r.err('changelog.json', 'oczekiwano niepustej listy wpisów')
        return
    node_ids = {n.get('id') for n in nodes if isinstance(n, dict)}
    prev = None
    for k, e in enumerate(cl):
        w = f'changelog.json[{k}]'
        if not need(r, w, e, ['label', 'summary']) or 'changes' not in e:
            if 'changes' not in e:
                r.err(w, 'brak pola „changes”')
            continue
        d = parse_date(e['label'])
        if d is None:
            r.err(w, f'etykieta „{e["label"]}” nie ma formatu dd.mm.rrrr')
        elif prev is not None and d > prev:
            r.err(w, 'wpisy muszą być od najnowszego (data nowsza niż poprzedniego wpisu)')
        prev = d or prev
        for c in e['changes']:
            if need(r, f'{w} change', c, ['id', 't', 'from', 'to', 'dir', 'note']):
                if c['dir'] not in DIRS:
                    r.err(w, f'{c["id"]}: kierunek „{c["dir"]}” spoza {sorted(DIRS)}')
                if c['id'] not in node_ids:
                    r.err(w, f'zmiana dotyczy nieistniejącego węzła „{c["id"]}”')


# ---------- rejestr źródeł ----------
def check_sources(D, r):
    reg = D.get('sources')
    if not isinstance(reg, dict) or not isinstance(reg.get('sources'), list):
        r.err('sources.json', 'oczekiwano obiektu z listą „sources”')
        return {}
    by_id, urls = {}, {}
    for i, s in enumerate(reg['sources']):
        w = f'sources.json[{i}]'
        if not need(r, w, s, ['id', 'name', 'url', 'tier', 'fetch']):
            continue
        if s['id'] in by_id:
            r.err(w, f'powtórzony id „{s["id"]}”')
        by_id[s['id']] = s
        if s['tier'] not in (1, 2, 3):
            r.err(w, f'{s["id"]}: poziom (tier) musi być 1, 2 lub 3')
        if s['fetch'] not in FETCH:
            r.err(w, f'{s["id"]}: „fetch” spoza {sorted(FETCH)}')
        if not s['url'].startswith('https://'):
            r.err(w, f'{s["id"]}: adres musi zaczynać się od https://')
        if s['url'] in urls:
            r.err(w, f'adres {s["url"]} już jest w rejestrze jako „{urls[s["url"]]}”')
        urls[s['url']] = s['id']
    for s in by_id.values():
        if 'primary' in s:
            if not (isinstance(s['primary'], list) and s['primary']):
                r.err(f'sources.json {s["id"]}', '„primary” musi być niepustą listą id')
                continue
            for pid in s['primary']:
                if pid not in by_id:
                    r.err(f'sources.json {s["id"]}', f'„primary” wskazuje nieistniejące źródło „{pid}”')
                elif by_id[pid]['tier'] != 1:
                    r.warn(f'sources.json {s["id"]}', f'źródło pierwotne „{pid}” nie jest poziomu 1')
        if s.get('checked') and not re.match(r'^\d{4}-\d{2}-\d{2}$', str(s['checked'])):
            r.err(f'sources.json {s["id"]}', 'pole „checked” ma mieć format rrrr-mm-dd')
    tiers = [s['tier'] for s in by_id.values()]
    reviewed = sum(1 for s in by_id.values() if s.get('reviewed'))
    r.note('rejestr źródeł: %d (poziom 1: %d, 2: %d, 3: %d), przejrzane przez redaktora: %d/%d' % (
        len(by_id), tiers.count(1), tiers.count(2), tiers.count(3), reviewed, len(by_id)))
    if reviewed < len(by_id):
        r.warn('sources.json', f'{len(by_id) - reviewed} źródeł ma poziom roboczy (reviewed: false), czeka na przegląd redaktora')
    for s in by_id.values():
        if s.get('note'):
            r.warn('sources.json', f'{s["id"]}: {s["note"]}')
    return urls


def check_registry_coverage(D, urls, template, r):
    in_data = {}
    for name, obj in D.items():
        if name == 'sources':
            continue
        for u in URL_RE.findall(json.dumps(obj, ensure_ascii=False)):
            in_data.setdefault(u, name)
    for u, name in sorted(in_data.items()):
        if u not in urls:
            r.err(f'{name}.json', f'adres spoza rejestru źródeł: {u}')
    in_tpl = set()
    if template and template.exists():
        t = template.read_text(encoding='utf-8')
        a = t.find('<summary>Źródła</summary>')
        if a != -1:
            in_tpl = set(re.findall(r'<li><a href="([^"]+)"', t[a:a + 20000]))
        for u in sorted(in_tpl):
            if u not in urls:
                r.err('template.html', f'adres z sekcji „Źródła” spoza rejestru: {u}')
        for s in (D.get('sources') or {}).get('sources', []):
            if 'template' in (s.get('where') or []) and s['url'] not in in_tpl:
                r.warn('sources.json', f'{s["id"]}: oznaczone jako użyte w szablonie, ale nie ma go w sekcji „Źródła”')
    else:
        r.warn('template.html', 'brak szablonu, pominięto sprawdzenie sekcji „Źródła”')


# ---------- zasady redakcyjne (zaległości migracji) ----------
def walk_strings(x):
    if isinstance(x, str):
        yield x
    elif isinstance(x, list):
        for v in x:
            yield from walk_strings(v)
    elif isinstance(x, dict):
        for v in x.values():
            yield from walk_strings(v)


def check_policy(D, r):
    for name, obj in sorted(D.items()):
        if name in ('sources', 'changelog'):
            continue
        hits = [s for s in walk_strings(obj) if BANNED.search(s)]
        if hits:
            r.warn(f'{name}.json', f'{len(hits)} tekstów z oceną „dobra/zła wiadomość” (decyzja D5, do migracji), np. „{hits[0][:60]}”')
    if D.get('good'):
        r.warn('good.json', 'plik „dobrych wiadomości” czeka na migrację na karty ramowania (decyzja D5, docs/design/content-model.md)')
    p = (D.get('news') or {})
    if any(k for k in p.values() if isinstance(k, dict) and ('pos' in k or 'neg' in k)):
        r.warn('news.json', 'podział pos/neu/neg czeka na migrację na pary ramowań (decyzja D5)')


# ---------- linki (sieć) ----------
def check_links(D, r, timeout=10):
    import concurrent.futures, urllib.request, urllib.error
    srcs = (D.get('sources') or {}).get('sources', [])

    def probe(s):
        req = urllib.request.Request(s['url'], method='GET', headers={'User-Agent': 'Mozilla/5.0 (gospodarka-bez-nerwow validate)'})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return s, resp.status
        except urllib.error.HTTPError as e:
            return s, e.code
        except Exception as e:  # sieć, DNS, TLS
            return s, type(e).__name__

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
        results = list(ex.map(probe, srcs))
    ok = [s for s, st in results if isinstance(st, int) and 200 <= st < 400]
    blocked = [(s, st) for s, st in results if st in (401, 403, 429)]
    bad = [(s, st) for s, st in results if not (isinstance(st, int) and 200 <= st < 400) and st not in (401, 403, 429)]
    r.note(f'linki: {len(ok)}/{len(results)} działa, {len(blocked)} blokuje automatyczne zapytania (do ręcznego sprawdzenia), {len(bad)} nie odpowiada')
    for s, st in blocked:
        r.note(f'linki (blokada {st}, sprawdzić ręcznie): {s["id"]}')
    for s, st in bad:
        r.warn('linki', f'{s["id"]}: {st} ({s["url"][:90]})')


def check_consistency(data_dir, r):
    """Spójność, wyliczenia i język atrybucji (scripts/consistency.py), jako OSTRZEŻENIA."""
    spec = importlib.util.spec_from_file_location('consistency', ROOT / 'scripts' / 'consistency.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    for where, msg in mod.run(data_dir):
        r.warn(where, msg)


def run(data_dir, template, links=False):
    r = Report()
    D = load(data_dir, r)
    check_nodes(D, r)
    check_node_fields(D, r)
    check_charts(D, r)
    check_news(D, r)
    check_content(D, r)
    check_terms(D, r)
    check_changelog(D, r)
    urls = check_sources(D, r)
    check_registry_coverage(D, urls, template, r)
    check_policy(D, r)
    check_consistency(data_dir, r)
    if links:
        check_links(D, r)
    return r


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--data', default=str(ROOT / 'src' / 'data'))
    ap.add_argument('--template', default=str(ROOT / 'src' / 'template.html'))
    ap.add_argument('--links', action='store_true')
    ap.add_argument('--json', action='store_true')
    a = ap.parse_args(argv)
    r = run(pathlib.Path(a.data), pathlib.Path(a.template), a.links)
    if a.json:
        print(json.dumps({'errors': r.errors, 'warnings': r.warnings, 'info': r.info}, ensure_ascii=False, indent=1))
    else:
        for e in r.errors:
            print('BŁĄD     ' + e)
        for w in r.warnings:
            print('OSTRZEŻ. ' + w)
        for i in r.info:
            print('INFO     ' + i)
        print(f'\nwynik: {len(r.errors)} błędów, {len(r.warnings)} ostrzeżeń')
    return 1 if r.errors else 0


if __name__ == '__main__':
    sys.exit(main())
