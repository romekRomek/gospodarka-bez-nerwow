"""Testy wskaźnika pewności danych. Uruchomienie: python3 -m unittest discover -s tests -v

Reguła: docs/design/content-model.md, sekcja „Wskaźnik pewności”. Wszystkie testy mają stałą datę
„dzisiaj”, więc wynik nie zależy od zegara.
"""
import datetime, json, pathlib, subprocess, sys, tempfile, unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
import confidence as C  # noqa: E402

def _last_update():
    import json
    d, m, y = json.loads((pathlib.Path(__file__).resolve().parent.parent / 'src' / 'data' / 'changelog.json').read_text(encoding='utf-8'))[0]['label'].split('.')
    return datetime.date(int(y), int(m), int(d))


TODAY = _last_update()


def iso(days_ago):
    return (TODAY - datetime.timedelta(days=days_ago)).isoformat()


def src(id_, tier, cadence=None):
    return {'id': id_, 'tier': tier, 'cadence': cadence}


SOURCES = {s['id']: s for s in [
    src('t1', 1, 'miesięczny'),
    src('t1b', 1, 'miesięczny'),
    src('t2', 2, 'miesięczny'),
    src('t3', 3, 'miesięczny'),
    src('t1-nocad', 1, None),
    src('t1-daily', 1, 'dzienny'),
    src('t1-eia', 1, 'dzienny, z opóźnieniem ok. 7 dni'),
    src('t1-weekly', 1, 'tygodniowy'),
    src('t1-quarter', 1, 'kwartalny'),
    src('t1-half', 1, 'półroczny'),
    src('t1-year', 1, 'roczny'),
    src('t1-weird', 1, 'co jakiś czas'),
    src('t2-nocad', 2, None),
]}


def node(srcs=('t1',), asof=None, kind='measurement', agree='agree', conf=True, **extra):
    n = {'id': 'x'}
    if srcs is not None:
        n['src'] = list(srcs)
    if conf:
        n['conf'] = {'asof': asof or iso(1), 'kind': kind, 'agree': agree}
    n.update(extra)
    return n


def run(n):
    return C.compute_node(n, SOURCES, TODAY)


def states(r):
    return [f['state'] for f in r['factors']]


class SourceFactor(unittest.TestCase):
    def test_tier_table(self):
        cases = [
            (['t1'], 'ok'), (['t2'], 'mid'), (['t3'], 'no'),
            (['t1', 't3'], 'ok'),          # liczy się najlepszy poziom
            (['t3', 't2'], 'mid'),
            (['t3', 't2', 't1b'], 'ok'),
        ]
        for ids, want in cases:
            with self.subTest(ids=ids):
                self.assertEqual(states(run(node(ids)))[0], want)

    def test_missing_src_is_no(self):
        for n in (node(srcs=None), node(srcs=[])):
            r = run(n)
            self.assertEqual(states(r)[0], 'no')
            self.assertEqual(r['factors'][0]['text'], 'Brak źródła')
            self.assertEqual(r['problems'], [])

    def test_unknown_source_id_is_a_problem(self):
        r = run(node(['t1', 'nie-ma-takiego']))
        self.assertIsNone(r['level'])
        self.assertEqual(r['factors'], [])
        self.assertEqual(r['problems'], ['nieznane id źródła: nie-ma-takiego'])


class FreshnessFactor(unittest.TestCase):
    def fresh(self, source, age):
        return run(node([source], asof=iso(age)))['factors'][1]['state']

    def test_cadence_parsing(self):
        cases = [
            ('miesięczny', (30, 0)), ('Miesięczny', (30, 0)), ('kwartalny', (91, 0)),
            ('dzienny', (1, 0)), ('tygodniowy', (7, 0)), ('półroczny', (182, 0)), ('roczny', (365, 0)),
            ('dzienny, z opóźnieniem ok. 7 dni', (1, 7)),
            ('miesięczny, z opóźnieniem 2 tygodnie', (30, 14)),
            ('co jakiś czas', None), ('', None), (None, None),
        ]
        for text, want in cases:
            with self.subTest(text=text):
                self.assertEqual(C.parse_cadence(text), want)

    def test_threshold_table(self):
        # (źródło, wiek w dniach, oczekiwany stan)
        cases = [
            # miesięczny: ok do 30, mid do 60
            ('t1', 0, 'ok'), ('t1', 30, 'ok'), ('t1', 31, 'mid'), ('t1', 60, 'mid'), ('t1', 61, 'no'),
            # kwartalny: 91 / 182
            ('t1-quarter', 91, 'ok'), ('t1-quarter', 92, 'mid'), ('t1-quarter', 182, 'mid'), ('t1-quarter', 183, 'no'),
            # tygodniowy: 7 / 14
            ('t1-weekly', 7, 'ok'), ('t1-weekly', 8, 'mid'), ('t1-weekly', 14, 'mid'), ('t1-weekly', 15, 'no'),
            # półroczny i roczny
            ('t1-half', 182, 'ok'), ('t1-half', 364, 'mid'), ('t1-half', 365, 'no'),
            ('t1-year', 365, 'ok'), ('t1-year', 730, 'mid'), ('t1-year', 731, 'no'),
            # dzienny: rytm 1 dzień + tolerancja weekendu 3 dni; ok do 1+3 = 4, mid do 2*1+3 = 5
            ('t1-daily', 0, 'ok'), ('t1-daily', 4, 'ok'), ('t1-daily', 5, 'mid'), ('t1-daily', 6, 'no'),
            # dzienny z opóźnieniem 7 dni (EIA): rytm 8 dni, ok do 8+3, mid do 16+3
            ('t1-eia', 7, 'ok'), ('t1-eia', 11, 'ok'), ('t1-eia', 12, 'mid'), ('t1-eia', 19, 'mid'), ('t1-eia', 20, 'no'),
        ]
        for source, age, want in cases:
            with self.subTest(source=source, age=age):
                self.assertEqual(self.fresh(source, age), want)

    def test_no_cadence_is_mid_with_reason(self):
        for s in ('t1-nocad', 't2-nocad'):
            r = run(node([s], asof=iso(1)))
            f = r['factors'][1]
            self.assertEqual(f['state'], 'mid')
            self.assertIn('Brak rytmu publikacji w rejestrze', f['text'])

    def test_no_cadence_ignores_age(self):
        self.assertEqual(self.fresh('t1-nocad', 1000), 'mid')

    def test_unrecognised_cadence_is_mid(self):
        f = run(node(['t1-weird']))['factors'][1]
        self.assertEqual(f['state'], 'mid')
        self.assertIn('Nierozpoznany rytm', f['text'])

    def test_cadence_comes_from_best_source(self):
        # t3 ma rytm miesięczny, ale najlepsze źródło (t1-nocad) go nie ma
        r = run(node(['t3', 't1-nocad']))
        self.assertEqual(r['factors'][1]['state'], 'mid')

    def test_age_in_text(self):
        f = run(node(['t1'], asof=iso(11)))['factors'][1]
        self.assertIn('11 dni', f['text'])
        f = run(node(['t1'], asof=iso(1)))['factors'][1]
        self.assertIn('1 dzień', f['text'])


class AgreeFactor(unittest.TestCase):
    def test_table(self):
        for agree, want in [('agree', 'ok'), ('small', 'mid'), ('single', 'mid'), ('differ', 'no')]:
            with self.subTest(agree=agree):
                self.assertEqual(states(run(node(agree=agree)))[2], want)


class KindFactor(unittest.TestCase):
    def test_table(self):
        cases = [('measurement', 'ok'), ('calculation', 'mid'), ('market', 'mid'), ('estimate', 'no'), ('forecast', 'no')]
        for kind, want in cases:
            with self.subTest(kind=kind):
                self.assertEqual(states(run(node(kind=kind)))[3], want)


class LevelThresholds(unittest.TestCase):
    def test_level_of_table(self):
        cases = [
            (['ok', 'ok', 'ok', 'ok'], 'hi'),
            (['mid', 'ok', 'ok', 'ok'], 'hi'),       # jedno mid
            (['mid', 'mid', 'ok', 'ok'], 'mid'),     # dwa mid
            (['mid', 'mid', 'mid', 'mid'], 'mid'),
            (['no', 'ok', 'ok', 'ok'], 'mid'),       # jedno no
            (['no', 'mid', 'mid', 'mid'], 'mid'),    # jedno no i trzy mid
            (['no', 'no', 'ok', 'ok'], 'lo'),        # dwa no
            (['no', 'no', 'no', 'no'], 'lo'),
            (['no', 'no', 'mid', 'mid'], 'lo'),
        ]
        for st, want in cases:
            with self.subTest(states=st):
                self.assertEqual(C.level_of(st), want)

    def test_levels_end_to_end(self):
        # Jedno mid (rodzaj: wyliczenie) -> Wysoka
        r = run(node(kind='calculation'))
        self.assertEqual((r['level'], r['label']), ('hi', 'Wysoka'))
        # Dwa mid (wyliczenie + małe różnice) -> Średnia
        r = run(node(kind='calculation', agree='small'))
        self.assertEqual((r['level'], r['label']), ('mid', 'Średnia'))
        # Jedno no (szacunek) -> Średnia
        r = run(node(kind='estimate'))
        self.assertEqual((r['level'], r['label']), ('mid', 'Średnia'))
        # Dwa no (szacunek + różne wartości) -> Niska
        r = run(node(kind='estimate', agree='differ'))
        self.assertEqual((r['level'], r['label']), ('lo', 'Niska'))
        # Źródło poziomu 3 + prognoza -> Niska
        r = run(node(['t3'], kind='forecast'))
        self.assertEqual(r['level'], 'lo')


class MockExamples(unittest.TestCase):
    """Przykłady z makiet (docs/design/mockups/build.py)."""

    def test_brent_is_medium(self):
        # Źródła poziomu 2, cena rynkowa, małe różnice między miarami, cena z 23-24.11.
        sources = {'agencja': src('agencja', 2, 'dzienny')}
        n = {'id': 'derrick', 'src': ['agencja'], 'conf': {'asof': '2026-11-23', 'kind': 'market', 'agree': 'small'}}
        r = C.compute_node(n, sources, TODAY)
        self.assertEqual(states(r), ['mid', 'ok', 'mid', 'mid'])
        self.assertEqual((r['level'], r['label']), ('mid', 'Średnia'))
        self.assertEqual([f['name'] for f in r['factors']], ['Źródło', 'Aktualność', 'Zgodność źródeł', 'Rodzaj danych'])

    def test_cpi_is_high(self):
        # GUS, pomiar, źródła zgodne, odczyt finalny z 13.11, rytm miesięczny.
        sources = {'gus': src('gus', 1, 'miesięczny')}
        n = {'id': 'pump', 'src': ['gus'], 'conf': {'asof': '2026-11-13', 'kind': 'measurement', 'agree': 'agree'}}
        r = C.compute_node(n, sources, TODAY)
        self.assertEqual(states(r), ['ok', 'ok', 'ok', 'ok'])
        self.assertEqual((r['level'], r['label']), ('hi', 'Wysoka'))
        self.assertEqual(r['why'], 'Źródło pierwotne, aktualne, zgodne, pomiar')


class MissingAndInvalidInput(unittest.TestCase):
    def test_missing_conf_is_not_an_error(self):
        for n in (node(conf=False), node(conf=False, srcs=None), {'id': 'x', 'conf': {}}):
            r = run(n)
            self.assertIsNone(r['level'])
            self.assertIsNone(r['label'])
            self.assertEqual(r['factors'], [])
            self.assertEqual(r['problems'], [])
            self.assertIn('Brak danych wejściowych', r['why'])

    def test_invalid_input_table(self):
        base = {'asof': iso(1), 'kind': 'measurement', 'agree': 'agree'}
        cases = [
            ({'asof': '24.11.2026'}, 'conf.asof'),
            ({'asof': '2026-13-40'}, 'conf.asof'),
            ({'asof': iso(-1)}, 'w przyszłości'),
            ({'kind': 'rumor'}, 'conf.kind'),
            ({'agree': 'tak'}, 'conf.agree'),
            ({'asof': None}, 'brak conf.asof'),
        ]
        for patch, needle in cases:
            with self.subTest(patch=patch):
                c = dict(base)
                c.update(patch)
                r = run({'id': 'x', 'src': ['t1'], 'conf': c})
                self.assertIsNone(r['level'])
                self.assertTrue(any(needle in p for p in r['problems']), r['problems'])

    def test_missing_field_in_conf(self):
        r = run({'id': 'x', 'src': ['t1'], 'conf': {'asof': iso(1)}})
        self.assertIsNone(r['level'])
        self.assertEqual(len(r['problems']), 2)

    def test_conf_without_src_still_computes(self):
        r = run(node(srcs=None))
        self.assertEqual(states(r)[0], 'no')
        self.assertEqual(r['level'], 'mid')


class Reason(unittest.TestCase):
    def test_source_tier3(self):
        self.assertEqual(run(node(['t3']))['why'], 'Źródło wtórne (poziom 3)')

    def test_worst_state_wins_over_mid(self):
        r = run(node(['t2'], kind='estimate'))
        self.assertEqual(r['why'], 'Szacunek')

    def test_two_no_are_joined(self):
        r = run(node(['t3'], kind='forecast'))
        self.assertEqual(r['why'], 'Źródło wtórne (poziom 3); prognoza')

    def test_why_is_limited_to_two_phrases(self):
        r = run(node(['t2'], kind='calculation', agree='small'))  # trzy mid z czterech? źródło, zgodność, rodzaj
        self.assertEqual(r['why'].count(';'), 1)

    def test_missing_source(self):
        self.assertEqual(run(node(srcs=None))['why'], 'Brak źródła')

    def test_all_ok(self):
        self.assertEqual(run(node())['why'], 'Źródło pierwotne, aktualne, zgodne, pomiar')

    def test_no_cadence_reason(self):
        self.assertEqual(run(node(['t1-nocad']))['why'], 'Brak rytmu publikacji w rejestrze')

    def test_result_shape_matches_mockups(self):
        r = run(node())
        self.assertEqual(set(r), {'level', 'label', 'why', 'factors', 'problems'})
        self.assertEqual(len(r['factors']), 4)
        for f in r['factors']:
            self.assertEqual(set(f), {'name', 'state', 'text'})
            self.assertIn(f['state'], C.STATES)
        json.dumps(r, ensure_ascii=False)  # serializowalne


class RealData(unittest.TestCase):
    """Test dymny: prawdziwe dane repo. Nie może się wysypać, także gdy `conf` jeszcze nie istnieje."""

    def test_compute_all_on_repo_data(self):
        sources = C.load_sources(C.DATA)
        nodes = C.load_nodes(C.DATA)
        results = C.compute_all(nodes, sources, TODAY)
        self.assertEqual(set(results), {n['id'] for n in nodes})
        for nid, r in results.items():
            with self.subTest(node=nid):
                self.assertEqual(r['problems'], [], r)
                self.assertIn(r['level'], ('hi', 'mid', 'lo', None))
                if r['level'] is None:
                    self.assertIn('Brak danych wejściowych', r['why'])
                else:
                    self.assertEqual(len(r['factors']), 4)

    def test_cli_json_and_table(self):
        script = str(ROOT / 'scripts' / 'confidence.py')
        for extra in ([], ['--json']):
            p = subprocess.run([sys.executable, script, '--today', TODAY.isoformat()] + extra,
                               capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(p.returncode, 0, p.stderr)
            self.assertTrue(p.stdout.strip())
        doc = json.loads(p.stdout)
        self.assertEqual(doc['computed'], TODAY.isoformat())
        self.assertIn('derrick', doc['nodes'])

    def test_cli_write_to_other_dir(self):
        import shutil
        tmp = pathlib.Path(tempfile.mkdtemp())
        try:
            shutil.copytree(C.DATA, tmp / 'data')
            p = subprocess.run([sys.executable, str(ROOT / 'scripts' / 'confidence.py'), '--today', TODAY.isoformat(),
                                '--data', str(tmp / 'data'), '--write'], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(p.returncode, 0, p.stderr)
            doc = json.loads((tmp / 'data' / 'confidence.json').read_text(encoding='utf-8'))
            self.assertEqual(doc['computed'], TODAY.isoformat())
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

    def test_cli_is_deterministic(self):
        a = C.compute_all(C.load_nodes(C.DATA), C.load_sources(C.DATA), TODAY)
        b = C.compute_all(C.load_nodes(C.DATA), C.load_sources(C.DATA), TODAY)
        self.assertEqual(a, b)


if __name__ == '__main__':
    unittest.main()
