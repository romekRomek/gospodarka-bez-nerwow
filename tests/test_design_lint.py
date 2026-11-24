"""Testy design-lint (scripts/design-lint.py): wykrywa celowo zepsuty CSS i przepuszcza poprawny."""
import importlib.util, pathlib, subprocess, sys, tempfile, unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location('design_lint', ROOT / 'scripts' / 'design-lint.py')
dl = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dl)

GOOD = """
body{margin:0;background:var(--bg);color:var(--ink);font:var(--t-md)/1.5 var(--sans);padding:var(--sp-4) var(--sp-5)}
.a{font-size:var(--t-sm);padding:0 var(--sp-3);margin:0 auto;gap:var(--sp-2) var(--sp-4);border-radius:var(--r-pill)}
.b{font:800 34px/1.1 var(--head);padding:12px 16px;border-radius:50%;box-shadow:0 1px 2px var(--shadow)}
.c{background:color-mix(in srgb,var(--ext) 12%,transparent);width:calc(100vw - 24px);min-height:210px}
.n{--c:var(--oil);color:var(--c)}
@media (max-width:760px){.a{font-size:12px;gap:0}}
"""


def kinds(css, **kw):
    return [k for _, k, _ in dl.lint(css, exceptions=kw.get('exceptions', {}))]


class DesignLintTest(unittest.TestCase):
    def test_good_css_passes(self):
        self.assertEqual(dl.lint(GOOD, exceptions={}), [])

    def test_real_styles_pass(self):
        res = dl.lint((ROOT / 'src' / 'styles.css').read_text(encoding='utf-8'))
        self.assertEqual(res, [], res)

    def test_raw_hex_color(self):
        self.assertEqual(kinds('.a{color:#fff}'), ['kolor'])
        self.assertEqual(kinds('.a{background:#2F5BEA}'), ['kolor'])

    def test_rgb_hsl_and_named_colors(self):
        self.assertEqual(kinds('.a{box-shadow:0 1px rgba(0,0,0,.2)}'), ['kolor'])
        self.assertEqual(kinds('.a{color:hsl(10 20% 30%)}'), ['kolor'])
        self.assertEqual(kinds('.a{color:white}'), ['kolor'])

    def test_color_in_gradient(self):
        self.assertEqual(kinds('.a{background:linear-gradient(90deg,#000,var(--bg))}'), ['kolor'])

    def test_font_size_outside_scale(self):
        self.assertEqual(kinds('.a{font-size:13px}'), ['font-size'])
        self.assertEqual(kinds('.a{font:600 12.5px var(--sans)}'), ['font-size'])
        self.assertEqual(kinds('.a{font:700 15px/1.55 var(--sans)}'), ['font-size'])

    def test_font_size_in_scale_passes(self):
        for px in (12, 14, 16, 20, 26, 34, 40):
            self.assertEqual(kinds(f'.a{{font-size:{px}px}}'), [], px)

    def test_spacing_outside_scale(self):
        self.assertEqual(kinds('.a{padding:7px 16px}'), ['odstęp'])
        self.assertEqual(kinds('.a{gap:6px}'), ['odstęp'])
        self.assertEqual(kinds('.a{margin-top:-6px}'), ['odstęp'])
        self.assertEqual(kinds('.a{margin-bottom:10px}'), ['odstęp'])
        self.assertEqual(kinds('.a{column-gap:28px}'), ['odstęp'])

    def test_spacing_on_scale_and_non_spacing_px_pass(self):
        self.assertEqual(kinds('.a{padding:4px 8px 12px 16px;margin:24px 32px 48px 0}'), [])
        # szerokości, wysokości i minmax to nie odstępy
        self.assertEqual(kinds('.a{width:340px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));height:3px}'), [])

    def test_radius_outside_scale(self):
        self.assertEqual(kinds('.a{border-radius:28px}'), ['promień'])
        self.assertEqual(kinds('.a{border-radius:10px}'), [])
        self.assertEqual(kinds('.a{border-radius:999px}'), [])

    def test_undefined_variable(self):
        self.assertEqual(kinds('.a{color:var(--nie-ma-takiego)}'), ['zmienna'])

    def test_locally_defined_variable_passes(self):
        self.assertEqual(kinds('.n{--c:var(--oil)}.n b{fill:var(--c)}'), [])

    def test_map_block_is_skipped(self):
        css = ('.a{color:var(--ink)}\n/* design-lint: map start */\n.sea{fill:#fff;font-size:13px;padding:7px}\n'
               '/* design-lint: map end */\n.b{color:#fff}\n')
        res = dl.lint(css, exceptions={})
        self.assertEqual([k for _, k, _ in res], ['kolor'])
        self.assertEqual(res[0][0], 5, 'numer linii liczy się z całego pliku')

    def test_unclosed_map_block(self):
        self.assertEqual(kinds('/* design-lint: map start */\n.sea{fill:#fff}'), ['mapa'])
        self.assertEqual(kinds('.a{color:var(--ink)}\n/* design-lint: map end */'), ['mapa'])

    def test_comments_are_ignored(self):
        self.assertEqual(kinds('/* kolor #fff i padding:7px */ .a{color:var(--ink)}'), [])

    def test_exception_allows_only_that_value(self):
        exc = {('font-size', '13'): 'test'}
        self.assertEqual(kinds('.a{font-size:13px}', exceptions=exc), [])
        self.assertEqual(sorted(kinds('.a{font-size:13.5px}', exceptions=exc)), ['font-size', 'wyjątek'])

    def test_unused_exception_is_reported(self):
        self.assertEqual(kinds('.a{color:var(--ink)}', exceptions={('font-size', '13'): 'test'}), ['wyjątek'])

    def test_real_exceptions_all_have_reason(self):
        for key, why in dl.EXCEPTIONS.items():
            self.assertTrue(why.strip(), key)

    def test_cli_exit_codes(self):
        with tempfile.TemporaryDirectory() as d:
            bad = pathlib.Path(d) / 'bad.css'
            bad.write_text('.a{color:#fff}', encoding='utf-8')
            r = subprocess.run([sys.executable, str(ROOT / 'scripts' / 'design-lint.py'), str(bad)], capture_output=True, text=True)
            self.assertEqual(r.returncode, 1, r.stdout)
            self.assertIn('[kolor]', r.stdout)
            good = pathlib.Path(d) / 'good.css'
            good.write_text('.a{color:var(--ink)}', encoding='utf-8')
            r = subprocess.run([sys.executable, str(ROOT / 'scripts' / 'design-lint.py'), str(good)], capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stdout)

    def test_cli_default_file_passes(self):
        r = subprocess.run([sys.executable, str(ROOT / 'scripts' / 'design-lint.py')], capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stdout)


if __name__ == '__main__':
    unittest.main()
