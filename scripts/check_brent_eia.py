#!/usr/bin/env python3
"""Porównuje ceny Brent w danych aplikacji z serią dzienną EIA (cena spot FOB, źródło pierwotne).

  python3 scripts/check_brent_eia.py

Narzędzie kontrolne (sieć, bez klucza API): pobiera tabelę z
https://www.eia.gov/dnav/pet/hist/RBRTEd.htm i drukuje
  1. średnie roczne EIA vs wartości w aplikacji (wykres „Ropa Brent w ostatnich latach”),
  2. punkty wykresu „Brent w 2026 roku” vs notowania EIA z tego samego dnia.
Nie zmienia żadnych plików. Wynik z 24.11.2026 opisuje docs/brent-eia-check.md.
Uwaga: EIA publikuje z opóźnieniem ok. tygodnia i podaje cenę spot, a wartości 2026
w aplikacji pochodzą z kontraktu terminowego ICE, więc różnice są oczekiwane.
"""
import datetime, html, json, pathlib, re, statistics, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = 'https://www.eia.gov/dnav/pet/hist/RBRTEd.htm'
MON = {m: i + 1 for i, m in enumerate(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])}


def fetch_daily(url=URL):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (gospodarka-bez-nerwow check)'})
    with urllib.request.urlopen(req, timeout=30) as r:
        page = r.read(6_000_000).decode('utf-8', 'replace')
    return parse_daily(page)


def parse_daily(page):
    """Wiersz tabeli EIA: etykieta „2026 Jan- 5 to Jan- 9” i 5 notowań (pn–pt)."""
    daily = {}
    for row in re.findall(r'(?is)<tr>(.*?)</tr>', page):
        cells = [re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', c)).replace('\xa0', ' ')).strip()
                 for c in re.findall(r'(?is)<td[^>]*>(.*?)</td>', row)]
        m = cells and re.match(r'^(\d{4}) (\w{3})- ?(\d{1,2}) to (\w{3})- ?(\d{1,2})$', cells[0])
        if not m or m.group(2) not in MON:
            continue
        start = datetime.date(int(m.group(1)), MON[m.group(2)], int(m.group(3)))
        for i, v in enumerate(cells[1:6]):
            if re.match(r'^\d+(\.\d+)?$', v):
                daily[(start + datetime.timedelta(days=i)).isoformat()] = float(v)
    return daily


def main():
    daily = fetch_daily()
    if not daily:
        print('Nie udało się odczytać tabeli EIA (zmienił się układ strony?)')
        return 1
    last = max(daily)
    print(f'EIA: {len(daily)} notowań, ostatnie {last} = {daily[last]:.2f} USD (opóźnienie względem dziś: {(datetime.date.today() - datetime.date.fromisoformat(last)).days} dni)\n')

    charts = json.loads((ROOT / 'src/data/charts.json').read_text(encoding='utf-8'))
    for nid, lst in charts.items():
        for c in lst:
            if c.get('type') == 'bar' and c.get('labels', [])[:1] == ['2021'] and 'Brent' in c.get('t', ''):
                print(f'Średnie roczne ({c["t"]}):')
                for lab, val in zip(c['labels'], c['ds'][0]['d']):
                    ys = [v for k, v in daily.items() if k.startswith(lab)]
                    if ys:
                        print(f'  {lab}: aplikacja {val:6.1f} | EIA {statistics.mean(ys):6.2f} | różnica {val - statistics.mean(ys):+.2f}')
                    else:
                        print(f'  {lab}: aplikacja {val:6.1f} | EIA brak pełnego roku')
            if c.get('type') == 'xline':
                print(f'\nPunkty wykresu „{c["t"]}” (węzeł {nid}) vs EIA z tego samego dnia:')
                diffs = []
                for x, y, lab in c['pts']:
                    d = (datetime.date(2026, 1, 1) + datetime.timedelta(days=int(x) - 1)).isoformat()
                    e = daily.get(d)
                    if e is None:
                        print(f'  {lab:>11} {d} aplikacja {y:6.1f} | EIA brak notowania w tym dniu')
                    else:
                        diffs.append(y - e)
                        print(f'  {lab:>11} {d} aplikacja {y:6.1f} | EIA {e:6.2f} | {y - e:+.1f}')
                if diffs:
                    print(f'  porównano {len(diffs)} dni: średnia różnica {statistics.mean(diffs):+.2f}, największa co do modułu {max(abs(v) for v in diffs):.2f} USD')
    return 0


if __name__ == '__main__':
    sys.exit(main())
