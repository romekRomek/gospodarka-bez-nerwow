"""Testy tokenów: src/tokens.css zgodny z docs/design/tokens.json, kontrast AA, brak zdublowanych wartości w styles.css."""
import contextlib, importlib.util, io, json, pathlib, re, unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location('tokens', ROOT / 'docs' / 'design' / 'tokens.py')
tokens = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(tokens)

TOKENS_CSS = (ROOT / 'src' / 'tokens.css').read_text(encoding='utf-8')
STYLES_CSS = (ROOT / 'src' / 'styles.css').read_text(encoding='utf-8')


def body_of(css):
    """tokens.css bez nagłówka-komentarza."""
    return re.sub(r'\A/\*.*?\*/\n', '', css, count=1, flags=re.S)


class TokensTest(unittest.TestCase):
    def setUp(self):
        self.tok = json.loads((ROOT / 'docs' / 'design' / 'tokens.json').read_text(encoding='utf-8'))

    def test_tokens_css_matches_tokens_json(self):
        # po zmianie tokens.json uruchom python3 scripts/build.py (odtwarza src/tokens.css)
        self.assertEqual(body_of(TOKENS_CSS), tokens.css(self.tok), 'src/tokens.css nieaktualny: uruchom python3 scripts/build.py')

    def test_tokens_css_has_generated_header(self):
        self.assertTrue(TOKENS_CSS.startswith('/* GENEROWANY'))

    def _vars(self, block):
        return dict(re.findall(r'--([\w-]+):([^;]+);', block))

    def test_every_token_defined_with_right_value(self):
        light = self._vars(re.search(r'^:root\{(.*?)\}', TOKENS_CSS, re.S | re.M).group(1))
        dark = self._vars(re.search(r':root\[data-theme="dark"\]\{(.*?)\}', TOKENS_CSS, re.S).group(1))
        media = self._vars(re.search(r'@media \(prefers-color-scheme:dark\)\{(.*?)\}\}', TOKENS_CSS, re.S).group(1))
        self.assertEqual(dark, media, 'ciemny w media query i w [data-theme] muszą być takie same')
        for k, c in self.tok['color'].items():
            self.assertEqual(light[k], c['light'], k)
            self.assertEqual(dark[k], c['dark'], k)
        for group, prefix in (('font', ''), ('type', 't-'), ('leading', 'lh-'), ('space', 'sp-'), ('radius', 'r-')):
            for k, v in self.tok[group].items():
                self.assertEqual(light[prefix + k], v['value'], prefix + k)

    def test_every_token_has_role(self):
        for group in ('color', 'font', 'type', 'leading', 'breakpoints'):
            for k, v in self.tok[group].items():
                self.assertTrue(v.get('role'), f'{group}.{k} bez pola role')

    def test_styles_css_does_not_redefine_tokens(self):
        # wartości kolorów i skal istnieją tylko w tokens.json (lokalne --c, --c2 w .node są dozwolone)
        names = set(self.tok['color']) | set(self.tok['font']) | {'t-' + k for k in self.tok['type']} \
            | {'lh-' + k for k in self.tok['leading']} | {'sp-' + k for k in self.tok['space']} | {'r-' + k for k in self.tok['radius']}
        defined = set(re.findall(r'(?<![\w-])--([\w-]+)\s*:', STYLES_CSS))
        self.assertEqual(defined & names, set(), 'styles.css nie może definiować tokenów')

    def test_contrast_passes_in_both_themes(self):
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            bad = tokens.check(self.tok)
        self.assertEqual(bad, 0, buf.getvalue())

    def test_contrast_detects_a_bad_pair(self):
        broken = json.loads(json.dumps(self.tok))
        broken['color']['mut']['light'] = broken['color']['bg']['light']
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertGreater(tokens.check(broken), 0)

    def test_stale_tokens_css_would_be_detected(self):
        changed = json.loads(json.dumps(self.tok))
        changed['color']['accent']['light'] = '#000000'
        self.assertNotEqual(body_of(TOKENS_CSS), tokens.css(changed))


if __name__ == '__main__':
    unittest.main()
