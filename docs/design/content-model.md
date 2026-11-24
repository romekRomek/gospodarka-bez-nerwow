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
  "conf": {"asof": "2026-11-23", "kind": "market", "agree": "small"}
}
```

Poziom i czynniki pewności nie są wpisywane ręcznie. Liczy je `scripts/confidence.py` z `sources.json`, pola `src` i pól wejściowych `conf` (opis w sekcji „Wskaźnik pewności”).

## Źródła przy liczbach (`src`)

Węzeł i kafelek ma pole `src`: niepusta lista id z `sources.json`, **źródło pierwotne (poziom 1) pierwsze**, potem pomocnicze. `confidence.py` liczy czynnik „Źródło” z najlepszego poziomu na liście. `validate.py` zgłasza błąd dla id spoza rejestru. Węzły bez `src` są raportowane jako zaległość migracji. `src` dotyczy **liczby głównej** węzła (`m`). Dodatkowe fakty z innych źródeł mają własne źródła w blokach (po migracji) i nie podnoszą poziomu liczby głównej.

## Kontekst liczby i glosariusz

- `limits`: lista 1–3 zdań o granicy wskaźnika („Czego ta liczba nie mówi”). Zdanie pochodzi z definicji wskaźnika albo z danych aplikacji (np. deficyt przy PKB). Bez ocen.
- `also`: lista `{ "node": "worker", "role": "Pracownik" }` („Spójrz też na”). **Wartość i opis czyta się z węzła docelowego** (`m`, `mc`), a nie wpisuje drugi raz, żeby liczby się nie rozjeżdżały. Wskaźniki wybieramy spośród tych, które aplikacja już ma, albo zweryfikowanych źródeł. Własnego wskaźnika zbiorczego nie tworzymy.
- `src/data/terms.json` (glosariusz): lista `{ "id", "forms": ["PKB"], "name": "Produkt krajowy brutto", "def": "jedno zdanie", "src": ["id źródła"] }`. `forms` zawiera odmiany i warianty zapisu (np. „szybki szacunek”, „szybkiego szacunku”, „r/r”). Definicje mają źródło (np. słownik GUS, NBP). Mechanizm owija pierwsze wystąpienie każdej formy w bloku. Do dodania w walidatorze: skrót w tekście danych bez wpisu w glosariuszu jest ostrzeżeniem.
- Robocza lista glosariusza (14 haseł, definicje do zweryfikowania w źródle) jest w `docs/design/mockups/build.py`, zmienna `TERMS`, i trafi do `terms.json` w fali 2.

## Rejestr źródeł (`sources.json`)

`id`, `name`, `url`, `org`, `tier` (1 pierwotne, 2 agencje i duże media, 3 wtórne), `fetch` (api / page / pdf), `cadence` (rytm publikacji), `checked` (data ostatniego sprawdzenia, rrrr-mm-dd), `cites` (kogo cytuje źródło wtórne), `primary` (lista id źródeł pierwotnych, które źródło wtórne przywołuje).

## Wskaźnik pewności

Liczy go `scripts/confidence.py`, deterministycznie (bez modelu językowego), z rejestru źródeł (`sources.json`) i pól wejściowych węzła. Ten sam wynik dla tych samych danych i tej samej daty „dzisiaj”. Cztery czynniki, każdy `ok` / `mid` / `no`:

| Czynnik | ok | mid | no |
|---|---|---|---|
| Źródło | `tier` 1 | `tier` 2 | `tier` 3 lub brak `src` |
| Aktualność | wiek wartości w rytmie publikacji źródła | do dwóch rytmów lub brak rytmu w rejestrze | starsze |
| Zgodność | `agree`: wszystkie źródła zgodne | `small` (małe różnice) lub `single` (jedno źródło) | `differ`: różne wartości |
| Rodzaj | `measurement`: pomiar | `calculation`: wyliczenie, `market`: cena rynkowa | `estimate`: szacunek, `forecast`: prognoza |

Wynik: **Wysoka** = brak `no` i najwyżej jedno `mid`; **Średnia** = jedno `no` albo dwa i więcej `mid`; **Niska** = dwa i więcej `no`. Reguła ma testy w `tests/test_confidence.py`, a progi można zmienić tylko decyzją w `docs/decisions.md`.

### Pola wejściowe węzła

Do `src` (patrz „Źródła przy liczbach”) węzeł dopisuje obiekt `conf`:

```json
"conf": {"asof": "2026-11-23", "kind": "market", "agree": "small"}
```

| Pole | Wartości | Znaczenie |
|---|---|---|
| `asof` | `rrrr-mm-dd` | Data, której dotyczy liczba główna (`m`): dla notowań dzień notowania, dla danych okresowych data odczytu lub publikacji. Nie może być w przyszłości. |
| `kind` | `measurement`, `calculation`, `market`, `estimate`, `forecast` | Rodzaj liczby głównej: pomiar urzędowy lub instytucji, wyliczenie z innych danych, cena rynkowa, szacunek, prognoza. |
| `agree` | `agree`, `small`, `single`, `differ` | Zgodność źródeł liczby głównej: zgodne, małe różnice, jedno źródło (brak porównania), różne wartości. |

Wszystkie trzy pola są wymagane. Brak całego `conf` daje wynik „brak danych wejściowych” (`level: null`, bez błędu). Niepoprawna wartość, data w przyszłości albo nieznane id w `src` daje `level: null` i niepustą listę `problems` (kod wyjścia skryptu 1). Brak `src` przy poprawnym `conf` nie jest błędem: czynnik „Źródło” to `no`.

### Źródło

Liczy się najlepszy (najniższy) `tier` ze źródeł w `src`. Przy remisie „najlepsze” jest pierwsze na liście (stąd zasada: źródło pierwotne pierwsze). To źródło wyznacza też rytm publikacji w czynniku „Aktualność”.

### Aktualność i mapowanie `cadence`

Wiek = liczba dni od `conf.asof` do „dzisiaj”. Pole `cadence` najlepszego źródła jest tekstem. Skrypt rozpoznaje w nim okres (bez rozróżniania wielkości liter, po rdzeniu słowa, tylko w części przed frazą „opóźnieni…”) i opcjonalne opóźnienie publikacji:

| Fragment `cadence` | Okres (dni) |
|---|---|
| `dzienn…` | 1 |
| `tygodni…` | 7 |
| `miesięczn…` | 30 |
| `kwartaln…` | 91 |
| `półroczn…` | 182 |
| `roczn…` | 365 |

Opóźnienie: fraza `opóźnieni… [ok.] N dni` (lub `N tygodni`), np. „dzienny, z opóźnieniem ok. 7 dni” = okres 1 + opóźnienie 7. **Rytm** R = okres + opóźnienie. Tolerancja weekendu T = 3 dni tylko dla okresu dziennego (notowanie z piątku w poniedziałek), w pozostałych przypadkach 0.

| Stan | Warunek |
|---|---|
| `ok` | wiek ≤ R + T |
| `mid` | wiek ≤ 2 × R + T |
| `no` | wiek > 2 × R + T |
| `mid` (z powodem „Brak rytmu publikacji w rejestrze”) | `cadence` puste (`null`) |
| `mid` (z powodem „Nierozpoznany rytm…”) | `cadence` ma tekst, którego skrypt nie umie odczytać |

Przykłady: `miesięczny` ok do 30 dni, mid do 60; `dzienny` ok do 4 dni, mid do 5; `dzienny, z opóźnieniem ok. 7 dni` ok do 11 dni, mid do 19; `kwartalny` ok do 91 dni, mid do 182. Nowy opis rytmu w rejestrze trzeba najpierw dopisać do mapowania w `confidence.py` (z testem), inaczej wynik to „nierozpoznany rytm”.

### Powód (`why`)

Krótkie zdanie po polsku z najsłabszych czynników: fraza czynnika ze stanem `no`, a gdy takiego nie ma, ze stanem `mid` (najwyżej dwie, w kolejności Źródło, Aktualność, Zgodność, Rodzaj, połączone średnikiem). Gdy wszystko jest `ok`: „Źródło pierwotne, aktualne, zgodne, pomiar”. Pełny opis każdego czynnika jest w jego polu `text`.

### Wynik

`python3 scripts/confidence.py --write` zapisuje plik pochodny `src/data/confidence.json` (nie edytować ręcznie), `--json` drukuje to samo na stdout, a `--today rrrr-mm-dd` ustawia datę „dzisiaj” (testy). Struktura odpowiada argumentom `conf()` w makietach (`level` = `hi` / `mid` / `lo`, `why`, cztery czynniki z nazwą, stanem i tekstem):

```json
{
  "computed": "2026-11-24",
  "nodes": {
    "pump": {
      "level": "hi", "label": "Wysoka",
      "why": "Źródło pierwotne, aktualne, zgodne, pomiar",
      "factors": [
        {"name": "Źródło", "state": "ok", "text": "Źródło pierwotne (poziom 1)"},
        {"name": "Aktualność", "state": "ok", "text": "Wiek wartości: 11 dni, rytm: miesięczny"},
        {"name": "Zgodność źródeł", "state": "ok", "text": "Źródła zgodne"},
        {"name": "Rodzaj danych", "state": "ok", "text": "Pomiar, nie szacunek"}
      ],
      "problems": []
    },
    "gate": {"level": null, "label": null, "why": "Brak danych wejściowych (pole conf)", "factors": [], "problems": []}
  }
}
```

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
