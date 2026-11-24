# Model treści (szkic do fazy 0)

Wersja 1.0, 24.11.2026. Cel: nowa sekcja, zakładka lub poziom to zmiana w `src/data/`, a nie w szablonie. Komponenty z `components.md` renderują bloki.

## Blok

Każda jednostka treści to blok:

```json
{
  "id": "pump-fact-1",
  "type": "fact",
  "level": 1,
  "text": "…",
  "src": ["gus-cpi-2026-10"],
  "grade": "confirmed"
}
```

| Pole | Znaczenie |
|---|---|
| `type` | `fact`, `interp`, `chart`, `frame`, `myth`, `headline`, `term`, `forme`, `can`, `watch`, `checklist`, `linklist`, `tool`, `quiz` |
| `level` | 1 Podstawy, 2 Więcej, 3 Szczegóły, 4 Ekspert |
| `src` | lista `id` z `sources.json`. Obowiązkowa dla `fact` i `chart` |
| `grade` | `confirmed`, `estimate`, `disputed`, `forecast` (rodzaj twierdzenia) |
| `decides`, `concerns` | tekst: kto kształtuje wartość i kogo dotyczy (na poziomie węzła i kafelka) |

## Węzeł / kafelek

```json
{
  "id": "derrick",
  "cat": "oil",
  "label": "Ropa Brent",
  "value": "ok. 90", "unit": "USD", "caption": "za baryłkę, 23–24.11",
  "delta": {"dir": "down", "text": "ok. 20% od 27.10 (114 USD)"},
  "plain": "Taniej niż miesiąc temu, ale drożej niż w lutym (68 USD).",
  "decides": "rynek światowy, negocjacje USA–Iran",
  "concerns": "kierowców, firm zależnych od paliw",
  "watch": "decyzja o programie na 2027 r. w połowie grudnia",
  "soon": {
    "events": [
      {"when": "do końca roku", "text": "obowiązuje limit cen na stacjach"},
      {"when": "połowa grudnia", "text": "decyzja o przedłużeniu programu na 2027 r."},
      {"when": "bez terminu", "text": "negocjacje USA–Iran i incydenty z tankowcami"}
    ],
    "question": "Jak często tankujesz?"
  },
  "viz": {"type": "spark", "series": "charts.derrick.0"},
  "blocks": [ … ],
  "confidence": {"inputs": {"sources": ["…"], "agree": false, "kind": "market"}}
}
```

`confidence.level` i `factors` nie są wpisywane ręcznie. Liczy je `scripts/confidence.py` z `sources.json` i pól `inputs`.

## Źródła przy liczbach (`src`)

Węzeł i kafelek ma pole `src`: niepusta lista id z `sources.json`, **źródło pierwotne (poziom 1) pierwsze**, potem pomocnicze. `confidence.py` liczy czynnik „Źródło” z najlepszego poziomu na liście. `validate.py` zgłasza błąd dla id spoza rejestru. Węzły bez `src` są raportowane jako zaległość migracji. `src` dotyczy **liczby głównej** węzła (`m`). Dodatkowe fakty z innych źródeł mają własne źródła w blokach (po migracji) i nie podnoszą poziomu liczby głównej.

## Rejestr źródeł (`sources.json`)

`id`, `name`, `url`, `org`, `tier` (1 pierwotne, 2 agencje i duże media, 3 wtórne), `fetch` (api / page / pdf), `cadence` (rytm publikacji), `checked` (data ostatniego sprawdzenia, rrrr-mm-dd), `cites` (kogo cytuje źródło wtórne), `primary` (lista id źródeł pierwotnych, które źródło wtórne przywołuje).

## Wskaźnik pewności (reguła do implementacji)

Cztery czynniki, każdy `ok` / `mid` / `no`:

| Czynnik | ok | mid | no |
|---|---|---|---|
| Źródło | `tier` 1 | `tier` 2 | `tier` 3 lub brak |
| Aktualność | w rytmie publikacji źródła | do 1 cyklu opóźnienia | starsze |
| Zgodność | wszystkie źródła zgodne | małe różnice | różne wartości |
| Rodzaj | pomiar | wyliczenie lub cena rynkowa | szacunek lub prognoza |

Wynik: **Wysoka** = brak `no` i najwyżej jedno `mid`; **Średnia** = jedno `no` lub dwa i więcej `mid`; **Niska** = dwa i więcej `no`. Reguła ma testy w `validate.py`, a progi można zmienić tylko decyzją w `docs/decisions.md`.

## Ramowanie (`frame`)

```json
{"type": "frame", "topic": "Inflacja CPI",
 "fact": "3,5% w październiku r/r, we wrześniu 4,1%. Cel NBP: 2,5% ±1 pp.",
 "a": {"h": "Inflacja hamuje: 3,5% zamiast 4,1%!", "accent": "spadek z 4,1%", "emotion": "ulga"},
 "b": {"h": "Inflacja wciąż powyżej celu NBP, ceny dalej rosną", "accent": "poziom ponad celem 2,5%", "emotion": "niepokój"},
 "calm": "…", "src": ["gus-cpi-2026-10"]}
```

Oba nagłówki muszą być prawdziwe wobec `fact`. Nagłówki są wymyślone i tak oznaczone. `redaktor` sprawdza, że żaden nie wskazuje redakcji ani osoby.

## Sekcje i zakładki

```json
{"tab": "newsy", "title": "Newsy bez nerwów",
 "sections": [{"title": "Nagłówek dnia", "component": "HeadlineOfDay", "source": "headlines"}, …]}
```

Zakładka to lista sekcji, a sekcja to komponent z biblioteki plus źródło danych.

## Migracja istniejących danych (zadania fazy 0)

| Dziś | Docelowo |
|---|---|
| `steps.json` (`f`, `i`, `m`, `mc`) | węzły z blokami `fact` i `interp` na poziomach 1–2, polami `decides`, `concerns`, `watch`, `soon` |
| `news.json` (`pos`, `neu`, `neg`) | bloki `frame` (pary ramowań), bez etykiet pozytywny/negatywny |
| `good.json` | przepisać na `frame` lub „kontekst długiego horyzontu”, bez etykiety „dobra wiadomość” |
| `headlines.json` | `headline` (`abs`, `h`, `e`, `i`, `calm`, `lol`, `f`, `q`, `t`) |
| `charts.json` | `chart` z `src` z rejestru i tabelą alternatywną |
| Sekcja „Źródła” w `template.html` | `sources.json` + generowany `SourceList` |
| Ręczny HTML zakładek w `template.html` | `sections[]` + bloki |

## Znane niezgodności w danych (do poprawy przy migracji)

- Ropa Brent ma dwie wartości w danych: „ok. 90 USD” (`steps.json`) i 92,6 USD (ostatni punkt w `charts.json`). Do ujednolicenia albo oznaczenia jako różnica źródeł (wskaźnik pewności już ją pokazuje).
- Etykieta źródła „Reuters” prowadzi do domeny `daily-sun.com`. Do zweryfikowania przy tworzeniu `sources.json`.

## Kalendarz wydarzeń (pomysł do fazy 0)

Daty „co miesiąc” i najbliższe terminy publikacji mogą wynikać z pola `cadence` w `sources.json` (rytm publikacji źródła), a wydarzenia jednorazowe (decyzje, terminy programów) wpisuje agent z udokumentowanego źródła. Dzięki temu „Co może o tym zadecydować” nie wymaga ręcznego pilnowania dat.
