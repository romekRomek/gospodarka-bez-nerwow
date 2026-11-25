"""Złoty zbiór (tests/golden/cases.json): poprawność formalna oraz zgodność z kodem tam, gdzie kod ma to łapać."""
import json, pathlib, sys, unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
import consistency  # noqa: E402

G = json.loads((ROOT / 'tests' / 'golden' / 'cases.json').read_text(encoding='utf-8'))
RULES = {'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'S1', 'S2', 'S3', 'S4'}


class Golden(unittest.TestCase):
    def test_unikalne_id_i_pola(self):
        ids = [c['id'] for c in G['cases']]
        self.assertEqual(len(ids), len(set(ids)))
        for c in G['cases']:
            for k in ('id', 'kind', 'text', 'context', 'expected'):
                self.assertIn(k, c, c['id'])
            self.assertIn(c['kind'], G['verdicts'], c['id'])
            self.assertIn(c['expected']['verdict'], G['verdicts'][c['kind']], c['id'])

    def test_pytania_maja_ocene_sensu_i_reguly(self):
        for c in G['cases']:
            if c['kind'] != 'question':
                continue
            e = c['expected']
            self.assertIn(e['sense'], G['verdicts']['sense'], c['id'])
            self.assertTrue(set(e['rules']) <= RULES, c['id'])
            self.assertIsInstance(e['escalate'], bool, c['id'])

    def test_zasady_eskalacji_i_odrzucenia(self):
        for c in G['cases']:
            if c['kind'] != 'question':
                continue
            e = c['expected']
            # graniczne zawsze eskaluje; naciągane i wypełniacz odrzuca się samodzielnie; bezpośrednie się przyjmuje
            self.assertEqual(e['escalate'], e['sense'] == 'graniczne', c['id'])
            if e['sense'] in ('naciągane', 'wypełniacz'):
                self.assertEqual(e['verdict'], 'odrzuć', c['id'])
            if e['sense'] == 'bezpośrednie':
                self.assertEqual(e['verdict'], 'zaakceptuj', c['id'])
            if e['sense'] == 'graniczne':
                self.assertEqual(e['verdict'], 'eskaluj', c['id'])

    def test_pokrycie_wszystkich_wynikow_testu_sensu(self):
        got = {c['expected']['sense'] for c in G['cases'] if c['kind'] == 'question'}
        self.assertTrue({'bezpośrednie', 'naciągane', 'graniczne'} <= got)

    def test_agenci_istnieja_z_rubrykami(self):
        for name, must in (('weryfikator-faktow', ['cytat', 'D17', 'niska']), ('redaktor', ['R1', 'R6', 'S4', 'graniczne', 'eskaluj'])):
            t = (ROOT / '.claude' / 'agents' / f'{name}.md').read_text(encoding='utf-8')
            self.assertTrue(t.startswith('---\nname: ' + name), name)
            for m in must:
                self.assertIn(m, t, f'{name}: brak „{m}”')

    def test_kod_lapie_przypadki_oznaczone_code(self):
        findings = ' '.join(m for _, m in consistency.run())
        self.assertIn('oczekiw', findings)       # g1: język atrybucji
        self.assertIn('+3,9%', findings)         # g2: niespójność PKB II kw.


if __name__ == '__main__':
    unittest.main()


class Raport(unittest.TestCase):
    def test_raport_jest_deterministyczny(self):
        import datetime, weekly_report
        d = datetime.date(2026, 11, 25)
        a, _ = weekly_report.build(d)
        b, _ = weekly_report.build(d)
        self.assertEqual(a, b)
        self.assertIn('## Wskaźnik pewności danych', a)
