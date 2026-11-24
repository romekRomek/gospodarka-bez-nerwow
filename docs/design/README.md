# Design: pakiet fazy U

Wersja 1.0, zamknięta 24.11.2026 (decyzje: [`../decisions.md`](../decisions.md)).

| Plik | Co zawiera |
|---|---|
| [`principles.md`](principles.md) | Zasady informacji, tonu, układu, dostępności i systemu, każda ze sposobem sprawdzenia |
| [`information-architecture.md`](information-architecture.md) | Mapa serwisu, ścieżki użytkownika, mapowanie dzisiejszych sekcji na komponenty, nazewnictwo |
| [`tokens.json`](tokens.json) | Jedyne źródło prawdy: kolory (jasny/ciemny), kroje, skala typografii, odstępy, promienie |
| [`tokens.py`](tokens.py) | Generator CSS z `tokens.json` i kontrola kontrastu WCAG AA |
| [`components.md`](components.md) | Biblioteka komponentów: cel, dane, poziomy, stany, dostępność |
| [`patterns.md`](patterns.md) | Wzorce stron, siatka, punkty zwrotne, motyw, ruch, typografia |
| [`content-model.md`](content-model.md) | Model treści (bloki, poziomy, źródła, pewność, ramowanie) i plan migracji danych |
| [`content-strategy.md`](content-strategy.md) | Uzasadnienie kierunku i technik treści (T1–T12) |
| [`mockups/`](mockups/) | Makiety HTML kluczowych ekranów na prawdziwych danych |

## Jak z tego korzystać

- **Zmieniasz wygląd lub dodajesz treść?** Zacznij od `principles.md`, potem `components.md`. Nie dodawaj kolorów, rozmiarów ani komponentów poza listą.
- **Potrzebna nowa wartość designu?** Dopisz token do `tokens.json` z rolą, uruchom `python3 docs/design/tokens.py check`.
- **Potrzebny nowy komponent?** Zaproponuj go w `components.md` (cel, dane, poziomy, stany, dostępność) i zaktualizuj makiety.
- **Zmiana treści lub struktury danych?** Najpierw `content-model.md`.

## Makiety

Plik `mockups/index.html` jest generowany. Nie edytuj go ręcznie.

```bash
python3 docs/design/mockups/build.py   # czyta src/data/*.json, src/geo.json, tokens.json i szablon mockups.tpl.html
python3 docs/design/tokens.py check    # kontrast par kolorów w obu motywach
```

Dane w makietach pochodzą z aplikacji (stan z 24.11.2026). Opisy „Decyduje / Dotyczy”, uwagi „Obserwuj”, wydarzenia i pytania w „Co może o tym zadecydować” i oceny pewności w makietach to przykłady redakcyjne do potwierdzenia przy migracji danych.

## Co dalej (faza 0)

Wdrożenie systemu w aplikacji: `sources.json`, `validate.py`, `confidence.py`, migracja `src/data/` na model treści, `src/tokens.css` generowany z `tokens.json`, `design-lint.py`, szablon PR ze zrzutami.
