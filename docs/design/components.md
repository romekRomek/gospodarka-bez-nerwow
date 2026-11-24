# Biblioteka komponentów

Wersja 1.0, 24.11.2026. Wzorzec wizualny: `docs/design/mockups/index.html` (klasy CSS w nawiasach). Tokeny: `tokens.json`. Zasady: `principles.md`.

Nowy komponent wchodzi tylko przez dopisanie go tutaj (cel, anatomia, dane, poziomy, stany, dostępność) i zatwierdzenie. Agent nie dodaje komponentów poza tą listą.

Poziomy: **P** = Podstawy (zawsze), **W** = Więcej (tylko przy poziomie 2 albo po „Pokaż więcej”).

## Ramy ekranu

| Komponent | Cel | Dane | Uwagi |
|---|---|---|---|
| `Screen` (`.scr`) | Kontener ekranu. Układ zależy od jego szerokości, próg 760 px | — | `container-type: inline-size`. Dolna nawigacja poniżej progu, górna powyżej. |
| `AppTop` (`.apptop`, `.asof`) | Logo, przełącznik poziomu, „Dane z…”, „Co się zmieniło” | `changelog[0].label`, liczba zmian | Przełącznik: `role=group`, `aria-pressed`. |
| `Nav` (`.bnav`, `.tnav`) | Start · Mapa · Newsy · Polska | — | `aria-current="page"`, cel min. 44 px. |
| `LevelSwitch` (`.seg.g-level`) | Podstawy / Więcej | `level` w stanie | Zapis w pamięci lokalnej (try/catch). |

## Liczby i kontekst

| Komponent | Cel | Dane | P / W |
|---|---|---|---|
| `StatTile` (`.stat`) | Liczba główna z kontekstem | `label`, `value`, `unit`, `caption`, `delta`, `plain`, `decides`, `concerns`, `watch`, `viz`, `src`, `confidence`, `soon` | P: wszystko oprócz opisów rozszerzonych. W: `more`, rozbicie pewności, `Co może o tym zadecydować`. |
| `Delta` (`.delta`) | Kierunek zmiany (↑ ↓ →) i punkt odniesienia | `dir`, `text` | P. Kolor akcentu, nie alarmu. |
| `Sparkline` / `RangeBand` / `PairBars` (`.viz`) | Kontekst liczby: szereg, przedział celu, porównanie dwóch wartości | `series` / `band` / `pair` | P. Ma `aria-label` z opisem słownym. |
| `WhoBlock` (`.who`) | Kto o tym decyduje i kogo to dotyczy (opis świata, nie ocena czytelnika) | `decides` (tekst), `concerns` (tekst) | P. Dwa wiersze: „Decyduje”, „Dotyczy”. „Dotyczy” wymienia konkretne grupy (2–3), nie „wszystkich”. |
| `WatchNote` (`.watch`) | „Obserwuj: …”: jedno najważniejsze wydarzenie lub wskaźnik | `watch` (tekst; to samo co pierwsza pozycja `soon.events`, jeśli jest) | P. Pojawia się tylko, gdy jest `watch`. |
| `SoonBlock` (`.soon`) | „Co może o tym zadecydować”: najbliższe wydarzenia i jedno łatwe pytanie | `events[]`: `{when, text}` (`when`: data, „do końca roku”, „co miesiąc” albo „bez terminu”; chronologicznie), `question` (3 sekundy, z głowy) | W. Wydarzenia tylko z danych. Zasada T7. |
| `ConfidenceMeter` (`.conf`) | Pewność danych: 3 kropki, słowo, powód | `confidence.level`, `why`, `factors[4]` | P: kropki, słowo, powód. W: cztery czynniki. Liczony skryptem. |
| `ClaimChip` (`.chip.g-*`) | Rodzaj pojedynczego twierdzenia: Potwierdzone / Szacunek / Sporne / Prognoza | `grade` | Przy twierdzeniach w tekście. |
| `ChartFrame` | Standardowa ramka wykresu: tytuł, podtytuł, wykres, notatka, źródło, tabela alternatywna | `charts.json` | W. Wykres ma tabelę (A4). |

## Karty treści

| Komponent | Cel | Dane | P / W |
|---|---|---|---|
| `NodePanel` (`.sheet`, `.ncard`) | Szczegóły węzła mapy. Telefon: dolny panel. Komputer: panel boczny | `steps.json` + pola poziomów | P: tag, tytuł, liczba, delta, zdanie, „Decyduje / Dotyczy”, „Obserwuj”. W: fakty, interpretacja, wykres, „Co to znaczy dla mnie”, `Co może o tym zadecydować`, źródła. |
| `Interp` (`.interp`) | Interpretacja z etykietą | `i` | W. Kolor `--interp`. |
| `ForMe` (`.forme`) | „Co to znaczy dla mnie” | `forme` | W. |
| `HeadlineOfDay` (`.hl`) | Humorystyczny nagłówek dnia | `headlines.json`: `abs` (tytuł), `h` (klikbajt), `e`, `i`, `calm`, `lol`, `f`, `q`, `t` | P: tytuł, klikbajt, techniki, odzwierciedlenie, „Po ludzku”. W: dzisiejszy kontekst, pytanie. Pager ‹ ›. Oznaczenie „wymyślony”. |
| `FrameCard` (`.frame`) | Ta sama liczba, dwa nagłówki o różnym tonie | `topic`, `fact`, `a{h,accent,emotion}`, `b{...}`, `calm`, `confidence` | P: pierwszy przykład. W: kolejne. |
| `MythCard` (`.myth`) | Dementi: fakt → mit → mechanizm → fakt | `headlines.json` | P. |
| `TechniqueCard` (`.tech`) | Technika dnia | `techniques.json` | P. |
| `Term` (`.term`, `.pop-t`) | Pojęcie z definicją w jednym zdaniu | `terms` | `aria-expanded`, definicja jako `role=note`. |
| `ChangeSummary` (`.bal`) | Bilans zmian z aktualizacji (↓ ↑ →) | `changelog[0].changes` | W. Kolory neutralne (bez oceny). |
| `Calculator` | „Ile Cię to kosztuje” | `cost.json` | P. |
| `ScannerTool` | Skaner nagłówków | reguły w danych | P. |

## Mapa

| Komponent | Cel | Uwagi |
|---|---|---|
| `MapView` (`.mapv`) | Widoki Polska / Świat z tej samej grafiki | Przełącznik `Polska / Świat`. Węzły = `<use>` ikon z `geo.json` i `nodes.json`. |
| `StepChips` (`.schips`) | Kroki jako poziomy pasek | Aktywny krok ma `aria-current` i jest przewijany do widoku. |
| `TourControls` (`.tour`) | „Oprowadź mnie”, „Prześledź łańcuch” | Respektuje `prefers-reduced-motion`. |

## Elementy wspólne

`Card` (`.card`), `Chip` (`.chip`), `Tag` (`.tag`), `Btn` (`.btn`, warianty: główny, zwykły, ghost), `Hook` (`.hook`), `SourceLink`, `Expander` („Źródła i metodologia”, miejsce na poziom Szczegóły).

## Stany obowiązkowe

Każdy komponent z danymi ma: **pusty** (brak danych: nazwany powód i co zrobić), **ładowania** (szkielet, bez migotania), **błędu** (komunikat po ludzku, bez przepraszania) oraz **nieaktualny** (dane starsze niż rytm publikacji źródła: wskaźnik pewności spada, a komponent pokazuje datę).

## Reguły użycia

1. Jedna główna karta na ekran telefonu (zasada I6).
2. Kolor kategorii (`oil`, `chain`, `ind`, `ext`) oznacza kategorię węzła, nie ocenę.
3. Pewność i kierunek są oznaczone liczbą kropek, słowem lub strzałką, nie tylko kolorem (A2).
4. Treść nie jest wpisywana w komponent. Komponent czyta blok z danych (`content-model.md`).
