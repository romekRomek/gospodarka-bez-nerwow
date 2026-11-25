# Biblioteka komponentów

Wersja 1.0, 24.11.2026. Wzorzec wizualny: `docs/design/mockups/index.html` (klasy CSS w nawiasach). Tokeny: `tokens.json`. Zasady: `principles.md`.

Nowy komponent wchodzi tylko przez dopisanie go tutaj (cel, anatomia, dane, poziomy, stany, dostępność) i zatwierdzenie. Agent nie dodaje komponentów poza tą listą.

Poziomy: **P** = Podstawy (zawsze), **W** = Więcej (tylko przy poziomie 2 albo po „Pokaż więcej”).

## Ramy ekranu

| Komponent | Cel | Dane | Uwagi |
|---|---|---|---|
| `Screen` (`.scr`) | Kontener ekranu. Układ zależy od jego szerokości, próg 760 px | — | `container-type: inline-size`. Dolna nawigacja poniżej progu, górna powyżej. |
| `AppTop` (`.apptop`, `.asof`) | Logo, przełącznik poziomu, „Dane z…”, „Co się zmieniło” | `changelog[0].label`, liczba zmian | Przełącznik: `role=group`, `aria-pressed`. |
| `Nav` (`.bnav`, `.tnav`) | Start · Mapa · Kalendarz · Newsy · Polska | — | `aria-current="page"`, cel min. 44 px. |
| `LevelSwitch` (`.seg.g-level`) | Podstawy / Więcej | `level` w stanie | Zapis w pamięci lokalnej (try/catch). |

## Liczby i kontekst

| Komponent | Cel | Dane | P / W |
|---|---|---|---|
| `StatTile` (`.stat`) | Liczba główna z kontekstem | `label`, `value`, `unit`, `caption`, `delta`, `plain`, `decides`, `concerns`, `watch`, `viz`, `src`, `confidence`, `soon` | P: wszystko oprócz opisów rozszerzonych. W: `more`, rozbicie pewności, `Co może o tym zadecydować`. |
| `Delta` (`.delta`) | Kierunek zmiany (↑ ↓ →) i punkt odniesienia | `dir`, `text` | P. Kolor akcentu, nie alarmu. |
| `Sparkline` / `RangeBand` / `PairBars` (`.viz`) | Kontekst liczby: szereg, przedział celu, porównanie dwóch wartości | `series` / `band` / `pair` | P. Ma `aria-label` z opisem słownym. |
| `WhoBlock` (`.who`) | Kto o tym decyduje i kogo to dotyczy (opis świata, nie ocena czytelnika) | `decides` (tekst), `concerns` (tekst) | P. Dwa wiersze: „Decyduje”, „Dotyczy”. „Dotyczy” wymienia konkretne grupy (2–3), nie „wszystkich”. |
| `WatchNote` (`.watch`) | „Obserwuj: …”: jedno najważniejsze wydarzenie lub wskaźnik | `watch` (tekst; to samo co pierwsza pozycja `soon.events`, jeśli jest) | P. Pojawia się tylko, gdy jest `watch`. |
| `SoonBlock` (`.soon`) | „Co może o tym zadecydować”: najbliższe wydarzenia i jedno łatwe pytanie | `events[]`: `{when, text}` (`when`: data, „do końca roku”, „co miesiąc” albo „bez terminu”; chronologicznie), `question` (opcjonalne; 3 sekundy, z głowy) | W. Wydarzenia tylko z danych. Zasada T7. |
| `ConfidenceMeter` (`.conf`) | Pewność danych: 3 kropki, słowo, powód | `confidence.level`, `why`, `factors[4]` | P: kropki, słowo, powód. W: cztery czynniki. Liczony skryptem. |
| `ClaimChip` (`.chip.g-*`) | Rodzaj pojedynczego twierdzenia: Potwierdzone / Szacunek / Sporne / Prognoza | `grade` | Przy twierdzeniach w tekście. |
| `LimitsBlock` (`.limits`) | „Czego ta liczba nie mówi”: granica wskaźnika | `limits[]`: 1–3 zdania (definicja lub dane z aplikacji) | W. Bez ocen. Zasady w `principles.md` (I8). |
| `AlsoBlock` (`.also`, `.acell`) | „Spójrz też na”: 2–3 inne miary obok liczby | `also[]`: `{node, role}` (np. Kraj, Pracownik, Koszt); wartość i opis czyta z węzła docelowego | W. Każda komórka prowadzi do węzła. Podpis mówi, że to różne miary (nie jedna skala). |
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
| `GlossaryTerm` (`.term`, `.tpop`) | Skrót lub termin fachowy w tekście jako przycisk z definicją w jednym zdaniu | `terms.json`: `{id, forms[], name, def, src[]}`; mechanizm sam wyszukuje `forms` w tekście bloku | Pierwsze wystąpienie w bloku. Pomija nagłówki, etykiety, chipy i parodie nagłówków. `aria-expanded`, okienko `role=note`, Escape i klik poza nim zamykają, przycisk zamknięcia 44 px. |
| `Footer` (`.foot`, `.flnk`) | Dyskretna stopka z odnośnikami do okien: „Słownik pojęć”, „Jak to sprawdzamy” (nagłówek na telefonie jest zajęty przez dwa przyciski) | — | P. Cel dotykowy 44 px. |
| `GlossaryDialog` (`#gls`, `.gsearch`, `li.gt`) | „Słownik pojęć”: wszystkie hasła z `terms.json` alfabetycznie, wyszukiwarka (nazwa, skróty, definicja), przy każdym haśle źródło i status: „definicja potwierdzona w źródle (data)” albo „robocza”. To ten sam wzorzec okna co „Jak to sprawdzamy” | `terms.json`, `termsrc` z buildu | P. |
| `CalendarList` (`#tab-cal`, `.cal`, `.calday`, `.calund`) | Zakładka „Kalendarz”: „Najbliższe 30 dni”. Wydarzenia z `soon.events` z konkretną datą, w kolejności dat, jako równe karty dni; wydarzenia bez konkretnej daty osobno („Bez konkretnej daty”). Przy każdym wydarzeniu: których węzłów dotyczy, link do źródła terminu i oznaczenie „źródło pierwotne” lub „wtórne”. Okno 30 dni liczone od dzisiejszej daty w przeglądarce; poza zakresem danych stan pusty z datą ostatniej aktualizacji | `steps.json` (`soon.events[].when`, `.src`), `evsrc` z buildu | P. Bez przewidywania: tylko daty. |
| `MethodDialog` (`#mth`, `.mths`, `.mthl`, `.mthc`) | „Jak to sprawdzamy”: poziomy źródeł, zasady pewności, warstwy sprawdzania i dziennik korekt (błędy, które trafiły na stronę). To **ten sam wzorzec okna** co dziennik zmian, otwierany przyciskiem obok „Co się zmieniło”; bez nowej zakładki nawigacji | `method.json` | P. Korekty od najnowszej, każda z linkiem do źródła. |
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

## Struktura kodu interfejsu (krok 2, 25.11.2026)

`src/app.js` zawiera tylko inicjalizację. Komponenty są w `src/components/*.js`, a `scripts/build.py` skleja je **w kolejności nazw plików** (stąd prefiksy liczbowe), a na końcu `app.js`, do jednego `<script>` w `dist/index.html`. Bez bundlera i bez nowych zależności: wszystkie pliki dzielą jeden zakres globalny, tak jak dotąd, więc kolejność plików to kolejność wykonania. Zmiana struktury nie zmienia wyglądu ani zachowania (test dymny: 231 asercji bez zmian).

| Plik | Komponent |
|---|---|
| `00-core.js` | wspólne: ikony SVG, dane (`DATA` → `NODES`, `STEPS`, `CL`), znaczniki zmian, pomocnik `el()`, indeks `byId` |
| `01-ui.js` | pomocniki v2: `h()`, poziom treści (localStorage w try/catch), `Delta`, `WhoBlock`, `WatchNote`, `ConfidenceMeter`, `SoonBlock`, `LimitsBlock`, `AlsoBlock` |
| `03-glossary.js` | `GlossaryTerm`: skróty z `terms.json`, okienko definicji (A5) |
| `04-start.js` | ekran Start: `StatTile`, `HeadlineOfDay`, `FrameCard`, `TechniqueCard`, `ChangeSummary` (dane: `start.json`) |
| `10-map.js` | mapa: węzły na mapie świata, podpis Polski |
| `20-steps-list.js` | lista kroków pod mapą |
| `30-node-panel.js` | panel węzła na stronie: `show()`, nawigacja, odtwarzanie |
| `40-charts.js` | wykresy (Chart.js): `mdChart`, wtyczka etykiet, tabela danych wykresu |
| `50-node-modal.js` | okno szczegółów węzła, nagłówki w oknie (pos/neu/neg) |
| `60-changelog.js` | dziennik zmian: przycisk „Co się zmieniło” i okno |
| `77-glossary-dialog.js` | `GlossaryDialog`: okno słownika, wyszukiwarka, stopka (przyciski wejścia) |
| `75-calendar.js` | `CalendarList`: zakładka Kalendarz (daty z `soon.events`, źródła z `DATA.evsrc`) |
| `65-method.js` | `MethodDialog`: okno „Jak to sprawdzamy” z dziennikiem korekt (dane: `method.json`) |
| `35-node-v2.js` | `NodePanel` v2: poziomy Podstawy/Więcej, dolny panel na telefonie (`#side.open`) |
| `70-tabs.js` | nawigacja `Nav` (Start / Mapa / Newsy / Polska): dolny pasek, górny od 760 px kontenera |
| `80-poland.js` | zakładka Polska |
| `90-headlines.js` | zakładka Newsy: tłumacz nagłówków i quiz |
| `91-cost-calc.js` | zakładka Newsy: koszt emocji i kalkulator |
| `92-good.js` | zakładka Newsy: dobre wiadomości |
| `93-techniques.js` | zakładka Newsy: techniki manipulacji |
| `95-scanner.js` | zakładka Newsy: skaner nagłówków |

Nowy komponent = nowy plik z prefiksem w odpowiednim miejscu kolejności. Ograniczenie świadome: brak izolacji zakresu (IIFE) i modułów, żeby krok pozostał czystym refaktorem.

### Odstępstwa od makiet w kroku 3 (do decyzji właściciela)

- Kafelki Startu nie mają wizualizacji (`Sparkline`, `RangeBand`, `PairBars`): nie ma dla nich pól w danych, a nie wymyślamy treści.
- Zdanie „plain” kafelka to nowe pole `plain` w `steps.json` (4 węzły, teksty z makiet); pozostałe węzły nie mają go i panel pokazuje wtedy resztę bloków.
- Etykieta kafelka i zdanie `Delta` pochodzą z najnowszego wpisu `changelog.json` (`t`, `from`), więc różnią się od ręcznych opisów w makiecie.
- Na komputerze klik w węzeł nadal otwiera okno szczegółów (jak dziś); dolny panel dotyczy telefonu (≤ 760 px okna).
- Próg układu to 760 px **kontenera** (`main`), więc przy oknie 768 px układ jest jeszcze telefonowy (dolna nawigacja).
