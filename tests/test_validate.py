"""Testy walidatora danych. Uruchomienie: python3 -m unittest discover -s tests -v

Każdy test kopiuje prawdziwe dane do katalogu tymczasowego, psuje jedną rzecz
i sprawdza, że walidator ją wykrywa (i że dane wyjściowe są czyste).
"""
import json, pathlib, shutil, sys, tempfile, unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
import validate  # noqa: E402

DATA = ROOT / 'src' / 'data'
TPL = ROOT / 'src' / 'template.html'


class ValidateTest(unittest.TestCase):
    def setUp(self):
        self.tmp = pathlib.Path(tempfile.mkdtemp())
        self.data = self.tmp / 'data'
        shutil.copytree(DATA, self.data)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def edit(self, name, fn):
        f = self.data / f'{name}.json'
        obj = json.loads(f.read_text(encoding='utf-8'))
        fn(obj)
        f.write_text(json.dumps(obj, ensure_ascii=False), encoding='utf-8')

    def run_v(self):
        return validate.run(self.data, TPL)

    def assert_error(self, r, fragment):
        self.assertTrue(any(fragment in e for e in r.errors), f'brak błędu z „{fragment}”: {r.errors}')

    def test_real_data_has_no_errors(self):
        r = self.run_v()
        self.assertEqual(r.errors, [])

    def test_missing_step_for_node(self):
        self.edit('steps', lambda s: s.__delitem__(slice(0, 1)))
        self.assert_error(self.run_v(), 'brak wpisu dla węzła')

    def test_changelog_must_be_newest_first(self):
        def swap(c):
            c[0]['label'], c[1]['label'] = c[1]['label'], c[0]['label']
        self.edit('changelog', swap)
        self.assert_error(self.run_v(), 'od najnowszego')

    def test_changelog_bad_direction(self):
        self.edit('changelog', lambda c: c[0]['changes'][0].__setitem__('dir', 'sideways'))
        self.assert_error(self.run_v(), 'kierunek')

    def test_changelog_unknown_node(self):
        self.edit('changelog', lambda c: c[0]['changes'][0].__setitem__('id', 'nie-ma-takiego'))
        self.assert_error(self.run_v(), 'nieistniejącego węzła')

    def test_positive_headline_needs_honesty_hook(self):
        def drop(n):
            first = next(iter(n))
            n[first]['pos'][0].pop('hk', None)
        self.edit('news', drop)
        self.assert_error(self.run_v(), 'haczyka uczciwości')

    def test_url_outside_registry(self):
        self.edit('good', lambda g: g[0].__setitem__('u', 'https://example.com/nowe-zrodlo'))
        self.assert_error(self.run_v(), 'spoza rejestru')

    def test_duplicate_source_id(self):
        def dup(reg):
            reg['sources'][1]['id'] = reg['sources'][0]['id']
        self.edit('sources', dup)
        self.assert_error(self.run_v(), 'powtórzony id')

    def test_source_tier_must_be_1_2_or_3(self):
        self.edit('sources', lambda reg: reg['sources'][0].__setitem__('tier', 4))
        self.assert_error(self.run_v(), 'poziom (tier)')

    def test_chart_series_length(self):
        def cut(c):
            for lst in c.values():
                for ch in lst:
                    if ch.get('type') != 'xline':
                        ch['ds'][0]['d'] = ch['ds'][0]['d'][:-1]
                        return
        self.edit('charts', cut)
        self.assert_error(self.run_v(), 'wartości, a etykiet')

    def test_invalid_json_reported(self):
        (self.data / 'cost.json').write_text('{ nie json', encoding='utf-8')
        self.assert_error(self.run_v(), 'niepoprawny JSON')

    def test_step_src_must_point_to_registry(self):
        def bad(steps):
            next(s for s in steps if s['id'] == 'shop')['src'] = ['nie-ma-takiego-zrodla']
        self.edit('steps', bad)
        self.assert_error(self.run_v(), 'nie ma wpisu w sources.json')

    def test_step_src_must_be_nonempty_list(self):
        def bad(steps):
            next(s for s in steps if s['id'] == 'shop')['src'] = []
        self.edit('steps', bad)
        self.assert_error(self.run_v(), 'niepustą listą')

    def test_primary_must_exist(self):
        def bad(reg):
            next(s for s in reg['sources'] if 'primary' in s)['primary'] = ['brak-takiego-id']
        self.edit('sources', bad)
        self.assert_error(self.run_v(), 'nieistniejące źródło')

    def test_primary_not_tier1_is_warning(self):
        def bad(reg):
            first = next(s for s in reg['sources'] if 'primary' in s)
            tier3 = next(s for s in reg['sources'] if s['tier'] == 3 and s['id'] != first['id'])
            first['primary'] = [tier3['id']]
        self.edit('sources', bad)
        r = self.run_v()
        self.assertEqual(r.errors, [])
        self.assertTrue(any('nie jest poziomu 1' in w for w in r.warnings))

    def test_checked_date_format(self):
        def bad(reg):
            reg['sources'][0]['checked'] = '24.11.2026'
        self.edit('sources', bad)
        self.assert_error(self.run_v(), 'rrrr-mm-dd')

    def test_primary_coverage_is_reported(self):
        r = self.run_v()
        self.assertTrue(any('źródłem pierwotnym' in i for i in r.info), r.info)

    def test_banned_phrase_is_warning_not_error(self):
        self.edit('headlines', lambda h: h[0].__setitem__('calm', 'To jest dobra wiadomość.'))
        r = self.run_v()
        self.assertEqual(r.errors, [])
        self.assertTrue(any('dobra/zła wiadomość' in w for w in r.warnings))


class RegistryConsistencyTest(unittest.TestCase):
    def test_every_template_source_is_registered(self):
        r = validate.run(DATA, TPL)
        self.assertFalse([e for e in r.errors if 'template.html' in e], r.errors)


if __name__ == '__main__':
    unittest.main()
