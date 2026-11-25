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


class DataCase(unittest.TestCase):
    """Kopia prawdziwych danych w katalogu tymczasowym, którą test psuje."""

    def setUp(self):
        self.tmp = pathlib.Path(tempfile.mkdtemp())
        self.data = self.tmp / 'data'
        shutil.copytree(DATA, self.data)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def reset(self):
        """Przywraca czyste dane (gdy test psuje je kilka razy)."""
        shutil.rmtree(self.data)
        shutil.copytree(DATA, self.data)

    def edit(self, name, fn):
        f = self.data / f'{name}.json'
        obj = json.loads(f.read_text(encoding='utf-8'))
        fn(obj)
        f.write_text(json.dumps(obj, ensure_ascii=False), encoding='utf-8')

    def run_v(self):
        return validate.run(self.data, TPL)

    def assert_error(self, r, fragment):
        self.assertTrue(any(fragment in e for e in r.errors), f'brak błędu z „{fragment}”: {r.errors}')


class ValidateTest(DataCase):

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

    def test_verified_term_needs_evidence(self):
        def bad(terms):
            x = next(x for x in terms if x['verified'])
            x.pop('evidence')
        self.edit('terms', bad)
        self.assert_error(self.run_v(), '„evidence”')

    def test_abbreviation_without_term_is_reported(self):
        self.edit('steps', lambda s: s[0]['f'].append('Dodatkowo ZZQQ coś mierzy.'))
        r = self.run_v()
        self.assertTrue(any('ZZQQ' in w and 'terms.json' in w for w in r.warnings), r.warnings[:3])
        self.assertEqual([e for e in r.errors if 'ZZQQ' in e], [])

    def test_abbreviation_with_term_is_not_reported(self):
        r = self.run_v()
        self.assertFalse(any('„FOMC”' in w for w in r.warnings))

    def test_event_affects_needs_source(self):
        def bad(steps):
            ev = next(e for s in steps for e in s['soon']['events'] if e.get('affects'))
            ev.pop('affects_src')
        self.edit('steps', bad)
        self.assert_error(self.run_v(), 'wymaga „affects_src”')

    def test_event_affects_source_must_exist(self):
        def bad(steps):
            ev = next(e for s in steps for e in s['soon']['events'] if e.get('affects'))
            ev['affects_src'] = ['nie-ma-takiego-zrodla']
        self.edit('steps', bad)
        self.assert_error(self.run_v(), 'nie ma wpisu w sources.json')

    def _links(self, fn):
        self.edit('links', lambda d: fn(d['links']))
        return self.run_v()

    def test_link_unknown_node(self):
        def bad(ls):
            ls[0]['to'] = 'nie-ma'
            ls[0]['id'] = ls[0]['from'] + '-nie-ma'
        self.assert_error(self._links(bad), 'nieznany węzeł')

    def test_link_quote_must_exist_in_node(self):
        self.assert_error(self._links(lambda ls: ls[0]['basis'].update(quote='tego nie ma w tekście węzła')), 'nie występuje w polu')

    def test_link_self_loop_and_duplicate(self):
        def bad(ls):
            ls.append(dict(ls[0]))
        self.assert_error(self._links(bad), 'powtórzona krawędź')

    def test_link_only_direct(self):
        self.assert_error(self._links(lambda ls: ls[0].update(sense='posrednie')), 'tylko krawędzie bezpośrednie')

    def test_link_why_limit(self):
        self.assert_error(self._links(lambda ls: ls[0].update(why='x' * 130)), 'jednym zdaniem')

    def test_link_degree_limit(self):
        def bad(ls):
            base = next(l for l in ls if l['to'] == 'shop')
            for k, n in enumerate(['derrick', 'gate', 'pump', 'worker', 'debt', 'tree', 'sun']):
                if n != 'shop' and not any(l['from'] == n and l['to'] == 'shop' for l in ls):
                    ls.append({**base, 'id': n + '-shop', 'from': n})
        self.assert_error(self._links(bad), 'limit 6')

    def test_event_src_must_exist_in_registry(self):
        def bad(steps):
            ev = steps[0]['soon']['events'][0]
            ev['src'] = ['nie-ma-takiego-zrodla']
        self.edit('steps', bad)
        self.assert_error(self.run_v(), 'nie ma wpisu w sources.json')

    def test_event_src_must_be_nonempty_list(self):
        def bad(steps):
            steps[0]['soon']['events'][0]['src'] = 'fed-fomc-kalendarz'
        self.edit('steps', bad)
        self.assert_error(self.run_v(), 'niepustą listą id źródeł')

    def test_method_corrections_must_be_newest_first(self):
        def swap(m):
            m['corrections'][0]['date'], m['corrections'][-1]['date'] = m['corrections'][-1]['date'], m['corrections'][0]['date']
        self.edit('method', swap)
        self.assert_error(self.run_v(), 'od najnowszej')

    def test_method_correction_needs_source(self):
        self.edit('method', lambda m: m['corrections'][0].__delitem__('u'))
        self.assert_error(self.run_v(), 'brak pola „u”')

    def test_method_correction_bad_date(self):
        self.edit('method', lambda m: m['corrections'][0].__setitem__('date', '2026-11-25'))
        self.assert_error(self.run_v(), 'dd.mm.rrrr')

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


class NodeFieldsTest(DataCase):
    """Pola węzła dla nowego designu: decides, concerns, watch, soon, conf (D11, D13)."""

    def step(self, fn, node='derrick'):
        def apply(steps):
            fn(next(s for s in steps if s['id'] == node))
        self.edit('steps', apply)

    def test_decides_is_required(self):
        self.step(lambda s: s.pop('decides'))
        self.assert_error(self.run_v(), 'brak pola „decides”')

    def test_decides_length_limit(self):
        self.step(lambda s: s.__setitem__('decides', 'x' * 81))
        self.assert_error(self.run_v(), '„decides” ma 81 znaków')

    def test_concerns_must_not_say_everyone(self):
        self.step(lambda s: s.__setitem__('concerns', 'wszystkich kierowców, firmy'))
        self.assert_error(self.run_v(), 'wszystkich')

    def test_concerns_needs_two_or_three_groups(self):
        self.step(lambda s: s.__setitem__('concerns', 'kierowców'))
        self.assert_error(self.run_v(), '2–3')
        self.reset()
        self.step(lambda s: s.__setitem__('concerns', 'a, b, c, d'))
        self.assert_error(self.run_v(), '2–3')

    def test_watch_is_optional(self):
        self.step(lambda s: s.pop('watch'))
        self.assertEqual(self.run_v().errors, [])

    def test_watch_length_limit(self):
        self.step(lambda s: s.__setitem__('watch', 'x' * 91))
        self.assert_error(self.run_v(), '„watch” ma 91 znaków')

    def test_watch_must_not_repeat_decides(self):
        self.step(lambda s: s.__setitem__('watch', s['decides']))
        self.assert_error(self.run_v(), 'powtarza „decides”')

    def test_soon_is_required(self):
        self.step(lambda s: s.pop('soon'))
        self.assert_error(self.run_v(), 'brak pola „soon”')

    def test_soon_needs_one_to_three_events(self):
        self.step(lambda s: s['soon'].__setitem__('events', []))
        self.assert_error(self.run_v(), 'listą 1–3 wydarzeń')
        ev = {'when': 'co miesiąc', 'text': 'x'}
        self.step(lambda s: s['soon'].__setitem__('events', [ev, ev, ev, ev]))
        self.assert_error(self.run_v(), 'listą 1–3 wydarzeń')

    def test_event_needs_when_and_text(self):
        self.step(lambda s: s['soon']['events'][0].pop('text'))
        self.assert_error(self.run_v(), 'niepuste „when” i „text”')

    def test_event_when_format(self):
        self.step(lambda s: s['soon']['events'][0].__setitem__('when', 'niedługo'))
        self.assert_error(self.run_v(), 'oczekiwano daty')

    def test_events_must_be_chronological(self):
        def swap(s):
            s['soon']['events'] = [
                {'when': 'bez terminu', 'text': 'a'}, {'when': '2.12', 'text': 'b'}]
        self.step(swap)
        self.assert_error(self.run_v(), 'nie są chronologiczne')

    def test_dated_events_must_be_in_order(self):
        def swap(s):
            s['soon']['events'] = [
                {'when': 'do końca roku', 'text': 'a'}, {'when': 'połowa grudnia', 'text': 'b'}]
        self.step(swap)
        self.assert_error(self.run_v(), 'nie są chronologiczne')

    def test_question_is_optional_but_must_be_valid_when_present(self):
        self.step(lambda s: s['soon'].pop('question'))
        r = self.run_v()
        self.assertFalse([e for e in r.errors if 'soon.question' in e], r.errors)
        self.reset()
        self.step(lambda s: s['soon'].__setitem__('question', ''))
        self.assert_error(self.run_v(), 'soon.question')
        self.reset()
        self.step(lambda s: s['soon'].__setitem__('question', 'x' * 70 + '?'))
        self.assert_error(self.run_v(), 'limit 70')

    def test_question_must_be_one_question(self):
        self.step(lambda s: s['soon'].__setitem__('question', 'Tankujesz? Często?'))
        self.assert_error(self.run_v(), 'jednym pytaniem')
        self.reset()
        self.step(lambda s: s['soon'].__setitem__('question', 'Jak często tankujesz'))
        self.assert_error(self.run_v(), 'jednym pytaniem')

    def test_conf_is_required(self):
        self.step(lambda s: s.pop('conf'))
        self.assert_error(self.run_v(), 'brak pola „conf”')

    def test_conf_kind_enum(self):
        self.step(lambda s: s['conf'].__setitem__('kind', 'guess'))
        self.assert_error(self.run_v(), '„conf.kind”')

    def test_conf_agree_enum(self):
        self.step(lambda s: s['conf'].__setitem__('agree', 'maybe'))
        self.assert_error(self.run_v(), '„conf.agree”')

    def test_conf_asof_format(self):
        self.step(lambda s: s['conf'].__setitem__('asof', '23.11.2026'))
        self.assert_error(self.run_v(), 'rrrr-mm-dd')
        self.reset()
        self.step(lambda s: s['conf'].__setitem__('asof', '2026-13-40'))
        self.assert_error(self.run_v(), 'rrrr-mm-dd')

    def test_conf_asof_not_after_last_update(self):
        self.step(lambda s: s['conf'].__setitem__('asof', '2026-11-25'))
        self.assert_error(self.run_v(), 'późniejsze niż ostatnia aktualizacja')

    def test_good_bad_news_phrase_in_new_fields(self):
        self.step(lambda s: s.__setitem__('decides', 'to zła wiadomość dla rynku'))
        self.assert_error(self.run_v(), 'dobra/zła wiadomość')
        self.reset()
        self.step(lambda s: s['soon']['events'][0].__setitem__('text', 'dobra wiadomość o stopach'))
        self.assert_error(self.run_v(), 'dobra/zła wiadomość')

    def test_command_mood_in_new_fields(self):
        self.step(lambda s: s['soon'].__setitem__('question', 'Sprawdź swój rachunek za prąd?'))
        self.assert_error(self.run_v(), 'zaproszenie, nie nakaz')
        self.reset()
        self.step(lambda s: s.__setitem__('watch', 'Powinieneś śledzić decyzję w grudniu'))
        self.assert_error(self.run_v(), 'zaproszenie, nie nakaz')

    def test_missing_src_is_warning_not_error(self):
        self.step(lambda s: s.pop('src'), node='shop')
        r = self.run_v()
        self.assertEqual(r.errors, [])
        self.assertTrue(any('shop' in w and 'brak „src”' in w for w in r.warnings), r.warnings)

    def test_parse_when_forms(self):
        p = validate.parse_when
        self.assertLess(p('2.12', 2026), p('8–9.12', 2026))
        self.assertLess(p('8–9.12', 2026), p('połowa grudnia', 2026))
        self.assertLess(p('połowa grudnia', 2026), p('do końca roku', 2026))
        self.assertLess(p('do końca roku', 2026), p('21.04.2027', 2026))
        self.assertLess(p('21.04.2027', 2026), p('do 2028', 2026))
        self.assertLess(p('do 2028', 2026), p('co miesiąc', 2026))
        self.assertLess(p('co miesiąc', 2026), p('bez terminu', 2026))
        self.assertIsNone(p('kiedyś', 2026))
        self.assertIsNone(p('31.02', 2026))


class RegistryConsistencyTest(unittest.TestCase):
    def test_every_template_source_is_registered(self):
        r = validate.run(DATA, TPL)
        self.assertFalse([e for e in r.errors if 'template.html' in e], r.errors)


if __name__ == '__main__':
    unittest.main()


class TermsTest(DataCase):
    def test_czyste_dane_bez_bledow(self):
        self.assertEqual(self.run_v().errors, [])

    def test_powtorzone_id(self):
        self.edit('terms', lambda t: t.append(dict(t[0], forms=['inna'])))
        self.assert_error(self.run_v(), 'powtórzone id')

    def test_powtorzona_forma(self):
        self.edit('terms', lambda t: t[1].update(forms=['PKB']))
        self.assert_error(self.run_v(), 'należy już do')

    def test_zrodlo_spoza_rejestru(self):
        self.edit('terms', lambda t: t[0].update(src=['nie-ma']))
        self.assert_error(self.run_v(), 'spoza rejestru')

    def test_niepotwierdzona_wymaga_notatki(self):
        def fn(t):
            next(x for x in t if not x['verified']).pop('note', None)
        self.edit('terms', fn)
        self.assert_error(self.run_v(), 'wymaga notatki')

    def test_potwierdzona_wymaga_zrodla(self):
        self.edit('terms', lambda t: next(x for x in t if x['verified']).update(src=[]))
        self.assert_error(self.run_v(), 'wymaga źródła')

    def test_za_dluga_definicja(self):
        self.edit('terms', lambda t: t[0].update({'def': 'x' * 250}))
        self.assert_error(self.run_v(), '220 znaków')

    def test_dwa_zdania_to_ostrzezenie(self):
        r = self.run_v()
        self.assertTrue(any('więcej niż jedno zdanie' in w for w in r.warnings))

    def test_brak_pola(self):
        self.edit('terms', lambda t: t[0].pop('name'))
        self.assert_error(self.run_v(), 'name')


class V2Test(DataCase):
    def test_czyste_dane(self):
        self.assertEqual(self.run_v().errors, [])

    def test_limits_za_duzo(self):
        self.edit('steps', lambda s: [n.update(limits=['a', 'b', 'c', 'd']) for n in s if n['id'] == 'sun'])
        self.assert_error(self.run_v(), '„limits”')

    def test_also_nieznany_wezel(self):
        self.edit('steps', lambda s: [n['also'].__setitem__(0, {'node': 'nie-ma', 'role': 'x'}) for n in s if n['id'] == 'sun'])
        self.assert_error(self.run_v(), '„also”')

    def test_plain_za_dlugi(self):
        self.edit('steps', lambda s: s[0].update(plain='x' * 201))
        self.assert_error(self.run_v(), '„plain”')

    def test_start_nieznany_kafelek(self):
        self.edit('start', lambda s: s.update(tiles=['derrick', 'brak']))
        self.assert_error(self.run_v(), '„tiles”')

    def test_start_za_duzo_kafelkow(self):
        self.edit('start', lambda s: s.update(tiles=['derrick', 'shop', 'worker', 'pump', 'bank']))
        self.assert_error(self.run_v(), '„tiles”')

    def test_start_zly_indeks_naglowka(self):
        self.edit('start', lambda s: s.update(headlines=[99]))
        self.assert_error(self.run_v(), '„headlines”')

    def test_ramka_bez_pola(self):
        self.edit('start', lambda s: s['frames'][0].pop('calm'))
        self.assert_error(self.run_v(), 'calm')
