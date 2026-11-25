#!/usr/bin/env python3
"""Cykliczny raport warstwy 1 (docs/verification.md): deterministyczny, bez modelu językowego, bez sieci i kluczy.

Zbiera: błędy i ostrzeżenia validate.py, znaleziska consistency.py, tabelę pewności (confidence.py) i liczby pokrycia.
Ten sam stan danych i ta sama data = ten sam raport. Użycie: python3 scripts/weekly_report.py [--date rrrr-mm-dd] [--out docs/runs]
"""
import argparse, datetime, importlib.util, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def _load(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / f'{name}.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def build(today, data_dir=ROOT / 'src' / 'data'):
    validate, consistency, confidence = _load('validate'), _load('consistency'), _load('confidence')
    r = validate.run(data_dir, ROOT / 'src' / 'template.html')
    cons = consistency.run(data_dir)
    conf = confidence.compute_all(confidence.load_nodes(data_dir), confidence.load_sources(data_dir), today)
    L = [f'# Raport warstwy 1: {today.isoformat()}', '',
         'Wygenerowany deterministycznie przez `scripts/weekly_report.py` (bez modelu językowego, bez sieci). '
         'Czego raport **nie** robi: nie ocenia sensu treści (to `redaktor` i `weryfikator-faktow`, uruchamiani ręcznie), '
         'nie pobiera źródeł (to `scripts/verify_claims.py`, wymaga sieci) i nie sprawdza martwych linków (`validate.py --links`).', '',
         f'## Podsumowanie', '', f'- błędy walidacji: **{len(r.errors)}**', f'- ostrzeżenia walidacji: {len(r.warnings)} (w tym spójność i język atrybucji: {len(cons)})', '']
    L += ['## Błędy walidacji', ''] + ([f'- {e}' for e in r.errors] or ['brak']) + ['']
    L += ['## Spójność, wyliczenia, język atrybucji', ''] + ([f'- `{w}`: {m}' for w, m in cons] or ['brak']) + ['']
    other = [w for w in r.warnings if not any(w == f'{a}: {m}' for a, m in cons)]
    L += ['## Pozostałe ostrzeżenia walidacji', ''] + ([f'- {w}' for w in other] or ['brak']) + ['']
    L += ['## Wskaźnik pewności danych', '', '| węzeł | poziom | powód |', '|---|---|---|']
    for k, v in conf.items():
        L.append(f'| {k} | {v.get("label") or "brak"} | {v.get("why") or ""} |')
    L += ['', '## Informacje', ''] + [f'- {i}' for i in r.info] + ['']
    return '\n'.join(L), r


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--date')
    ap.add_argument('--out', default=str(ROOT / 'docs' / 'runs'))
    a = ap.parse_args(argv)
    today = datetime.date.fromisoformat(a.date) if a.date else datetime.date.today()
    text, r = build(today)
    out = pathlib.Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    f = out / f'{today.isoformat()}.md'
    f.write_text(text, encoding='utf-8')
    print(f'raport: {f} (błędów: {len(r.errors)})')
    return 1 if r.errors else 0


if __name__ == '__main__':
    sys.exit(main())
