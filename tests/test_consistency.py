"""Testy V1 (consistency.py, verify_claims.py) na złotym zbiorze z docs/verification.md."""
import json, pathlib, shutil, sys, tempfile, unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
import consistency, verify_claims  # noqa: E402

DATA = ROOT / 'src' / 'data'


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = pathlib.Path(tempfile.mkdtemp())
        self.data = self.tmp / 'data'
        shutil.copytree(DATA, self.data)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def edit(self, name, fn):
        f = self.data / f'{name}.json'
        o = json.loads(f.read_text(encoding='utf-8'))
        fn(o)
        f.write_text(json.dumps(o, ensure_ascii=False), encoding='utf-8')

    def msgs(self):
        return [f'{w}: {m}' for w, m in consistency.run(self.data)]


class Golden(Base):
    def test_pkb_39_vs_41_wykryte_w_prawdziwych_danych(self):
        hit = [m for m in self.msgs() if m.startswith('changelog.json') and '3,9%' in m and '4,1%' in m]
        self.assertTrue(hit, 'niespójność +3,9% (dziennik) vs 4,1% (węzeł) musi być wykryta')

    def test_niezgodny_sens_oczekiwal(self):
        self.edit('news', lambda n: n['shop']['pos'].insert(0, {'h': 'PKB rośnie', 'hk': 'Rynek oczekiwał +3,6% r/r'}))
        self.assertTrue(any('oczekiwał' in m and 'konsensusem' in m for m in self.msgs()))

    def test_atrybucja_z_cytatem_przechodzi(self):
        def fn(n):
            n['shop']['pos'].insert(0, {'h': 'x', 'hk': 'Analitycy spodziewali się 3,7%'})
        self.edit('news', fn)
        before = [m for m in self.msgs() if 'Analitycy' in m or 'analityc' in m.lower()]
        self.assertTrue(before)
        def add(c):
            c['claims'].append({'id': 'attr-1', 'kind': 'attribution', 'file': 'news', 'text': 'Analitycy spodziewali się 3,7%', 'quote': 'cytat ze źródła'})
        self.edit('claims', add)
        self.assertFalse([m for m in self.msgs() if 'Analitycy spodziewali' in m])

    def test_deficyt_73_vs_72(self):
        def fn(c):
            c['groups'].append({'id': 'def', 'label': 'Deficyt 2025', 'topic': 'deficyt', 'period': '2025', 'canonical': [7.3]})
        self.edit('claims', fn)
        self.edit('changelog', lambda c: c[0]['changes'].append({'id': 'debt', 't': 'Deficyt', 'from': '7,2% PKB (2025)', 'to': 'x', 'dir': 'flat', 'note': ''}))
        self.assertTrue(any('Deficyt 2025' in m and '7,2%' in m for m in self.msgs()))

    def test_wyliczenie_20_proc_przy_187(self):
        def fn(c):
            for x in c['claims']:
                if x['id'] == 'derrick-mc-3':
                    x['formula'] = {'a': 92.6, 'b': 114, 'tol': 0.5}   # −18,8%, a w tekście „ok. 20%”
        self.edit('claims', fn)
        self.assertTrue(any('wyliczenie a/b−1' in m for m in self.msgs()))

    def test_wyliczenie_czyste_dane_ok(self):
        self.assertFalse([m for m in self.msgs() if 'wyliczenie' in m])

    def test_brak_twierdzenia_dla_m(self):
        self.edit('claims', lambda c: c.update(claims=[x for x in c['claims'] if x['node'] != 'sun' or x['field'] != 'm']))
        self.assertTrue(any('steps.json:sun' in m and 'bez twierdzenia' in m for m in self.msgs()))

    def test_wartosc_poza_tekstem(self):
        def fn(c):
            c['claims'][0]['value'] = 77
        self.edit('claims', fn)
        self.assertTrue(any('nie występuje w tekście' in m for m in self.msgs()))

    def test_zrodlo_spoza_rejestru(self):
        self.edit('claims', lambda c: c['claims'][0].update(src=['nie-ma-takiego']))
        self.assertTrue(any('spoza rejestru' in m for m in self.msgs()))


class WValidate(Base):
    def test_znaleziska_jako_ostrzezenia_nie_bledy(self):
        import validate
        r = validate.run(self.data, ROOT / 'src' / 'template.html')
        self.assertFalse(r.errors)
        self.assertTrue(any('+3,9%' in w for w in r.warnings))


class Evaluate(unittest.TestCase):
    C = {'value': 6.1, 'anchor': 'wynagrodzenie'}

    def test_potwierdzone(self):
        r, frag = verify_claims.evaluate(self.C, 'Przeciętne wynagrodzenie wzrosło o 6,1% r/r.')
        self.assertEqual(r, 'potwierdzone')
        self.assertIn('6,1', frag)

    def test_rozbiezne_inna_liczba_przy_kotwicy(self):
        r, _ = verify_claims.evaluate(self.C, 'Przeciętne wynagrodzenie wzrosło o 5,9% r/r.')
        self.assertEqual(r, 'rozbieżne')

    def test_brak_w_tekscie(self):
        self.assertEqual(verify_claims.evaluate(self.C, 'Zupełnie inna strona')[0], 'brak w tekście')

    def test_liczba_to_nie_ten_sam_ciag(self):
        r, _ = verify_claims.evaluate({'value': 3.5, 'anchor': ''}, 'wzrost o 13,5% oraz 3,55')
        self.assertEqual(r, 'brak w tekście')

    def test_duza_liczba_ze_spacja(self):
        self.assertEqual(verify_claims.evaluate({'value': 4171, 'anchor': 'WIG20'}, 'WIG20 zamknął się na 4 171 pkt')[0], 'potwierdzone')

    def test_niedostepne_nie_jest_werdyktem(self):
        rows = verify_claims.verify(DATA, fetcher=lambda u: (403, None, 'HTTP 403'))
        self.assertTrue(rows and all(r['result'] == 'niedostępne' for r in rows))
        self.assertTrue(any(e.get('detail') == 'HTTP 403' for r in rows for e in r['evidence']))

    def test_potwierdzone_przez_podstawiony_fetch(self):
        page = '<html><body><script>x=1</script><p>Inflacja CPI w październiku wyniosła 3,5% r/r. Wrzesień 4,1%.</p></body></html>'
        rows = verify_claims.verify(DATA, fetcher=lambda u: (200, page, None), only='shop')
        res = {r['id']: r['result'] for r in rows}
        self.assertEqual(res['shop-m-1'], 'potwierdzone')
        ev = rows[0]['evidence'][0]
        self.assertTrue(ev['sha256'] and ev['url'].startswith('http') and ev['fragment'])


if __name__ == '__main__':
    unittest.main()
