## Zakres zmiany

<!-- Co i dlaczego, w 2-4 zdaniach. Co celowo NIE jest w tym PR. -->

Rodzaj (zostaw jedno): `UI` / `dane` / `treść` / `skrypty i bramki` / `dokumentacja`

## Bramki

Wklej wynik (ostatnie linie) lub zaznacz, że nie dotyczy.

- [ ] `python3 scripts/validate.py` (dane i rejestr źródeł)
- [ ] `python3 -m unittest discover -s tests` (testy walidatora)
- [ ] `python3 docs/design/tokens.py check` (kontrast tokenów AA, oba motywy)
- [ ] `python3 scripts/design-lint.py` (tylko tokeny, bez surowych wartości w CSS)
- [ ] `python3 scripts/build.py` i test dymny: `npm --prefix tests/e2e test` (opis: [`docs/testing.md`](../docs/testing.md))

```
(wyniki)
```

## Dane i źródła

- [ ] Nie dotyczy (bez zmian w `src/data/`)
- [ ] Dopisany nowy wpis na górze `src/data/changelog.json` (tylko przy zmianie wartości liczbowych, stare wpisy nietknięte)
- [ ] Każdy nowy adres URL jest najpierw w `src/data/sources.json` z poziomem 1-3
- [ ] `src` przy liczbie głównej wskazuje źródło tej liczby (źródło pierwotne, poziom 1, pierwsze)

Zmienione lub dodane liczby i źródła:

| Węzeł / pole | Było | Jest | Źródło (id z rejestru, link) | Pewność |
|---|---|---|---|---|
| | | | | |

## Zrzuty przed i po (zmiany UI)

Wymagane dla zmian wyglądu (zasada S4). Jak zrobić: [`docs/testing.md`](../docs/testing.md), `npm --prefix tests/e2e run shots`. Nie dodawaj plików do repozytorium, wklej do opisu.

- [ ] Nie dotyczy (bez zmian wyglądu)

| | Przed | Po |
|---|---|---|
| 360 px, jasny | | |
| 360 px, ciemny | | |
| 768 px, jasny | | |
| 768 px, ciemny | | |
| 1280 px, jasny | | |
| 1280 px, ciemny | | |

## Ryzyka

<!-- Co może się zepsuć, czego nie sprawdzono, co wymaga uwagi przy scaleniu (np. zmiana dotyka wspólnego komponentu, danych używanych przez kilka węzłów). -->

## Lista kontrolna z zasad redakcyjnych (`CLAUDE.md`)

Zaznacz lub napisz „nie dotyczy”.

- [ ] **Fakt vs interpretacja.** Interpretacja ma etykietę i kolor `--interp`
- [ ] **Liczba = źródło + pewność.** Każda nowa liczba ma źródło z linkiem i wskaźnik pewności, nic „z głowy”
- [ ] **Bez wskazywania serwisów i osób** jako manipulatorów; przykładowe nagłówki są wymyślone i oznaczone
- [ ] **Szacunek dla tematu wojny.** Humor celuje w ton nagłówka, nie w wojnę ani ludzi
- [ ] **Bez dobrych i złych wiadomości.** Kierunek (↑ ↓ →), skala i kontekst; bez ocen „dobrze” i „źle”
- [ ] **Opis świata, nie ocena czytelnika.** Zaproszenie, nie nakaz: bez trybu rozkazującego, presji, porad i prognoz

Zasady projektu (`docs/design/`):

- [ ] Tylko tokeny z `tokens.json` i komponenty z `components.md`; brak nowych wzorców poza biblioteką, brak surowych wartości w CSS (wyjątek: grafika mapy)
- [ ] Treść jest w `src/data/`, nie w ręcznie pisanym HTML szablonu
- [ ] Nie wracam do decyzji odrzuconych w `docs/decisions.md` (albo podaję nowy argument)
