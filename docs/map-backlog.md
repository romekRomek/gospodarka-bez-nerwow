# Backlog rozbudowy mapy (prowadzi agent `product-owner-mapy`)

Stan na 26.11.2026. Plan i uzasadnienia: `docs/map-expansion.md`. Statusy: **Pomysł** → **Gotowe** (spełnia Definition of Ready) → **W toku** → **Przegląd** (PR otwarty) → **Zrobione** (scalone i wdrożone). Decyzje właściciela: `docs/decisions.md`.

## Definition of Ready / Done

Pełne listy w `.claude/agents/product-owner-mapy.md`. Skrót: **Ready** = liczba główna ze źródłem (pierwotnym albo uczciwie oznaczonym), rytm, licencja i format, krawędzie bezpośrednie ze zdaniem „dlaczego”, ocena tonu, skróty do glosariusza. **Done** = dane i `conf`, źródła, twierdzenia sprawdzane kodem, krawędzie z testem sensu, hasła, walidacja i testy zielone, zrzuty, PR.

## Decyzje właściciela potrzebne do startu

| # | Pytanie | Rekomendacja | Odpowiedź |
|---|---|---|---|
| Q1 | Widoki: osobny „Codzienność” obok „Świat”, czy jedna mapa z warstwami? | Osobny widok | **Tak** (25.11.2026) |
| Q2 | Kolejność fal: M0, M1 (Dom i kredyty), M2 (Jedzenie)? | Tak | **Tak** (25.11.2026) |
| Q3 | Tematy wrażliwe (pożyczki pozabankowe, zdrowie) z neutralnym tonem (D19)? | Tak | **Tak** (25.11.2026) |
| Q4 | PO uruchamiany ręcznie czy harmonogram w chmurze? | Ręcznie na start | **Tak, ręcznie** (25.11.2026) |

## Fala M0: zależności i interakcja dla istniejących 13 węzłów

| ID | Pozycja | Status | Zależność | Uwagi |
|---|---|---|---|---|
| M0-1 | Model `links.json`: schemat, walidacja (id, `why` ≤ 120, `src`, limit krawędzi), testy | Zrobione (PR #12, wdrożone) | Q1 nie blokuje | Schemat w `map-expansion.md` pkt 2 |
| M0-2 | Zapis krawędzi dla 13 węzłów (tylko bezpośrednie) z testem sensu i źródłem | Zrobione (PR #12, wdrożone) | M0-1 | Strzałki łańcucha z grafiki przenieść do danych |
| M0-3 | Komponent `LinkLayer` (podświetlenie krawędzi, wygaszanie węzłów) i `DepsBlock` (sekcja „Zależności” w panelu) | Zrobione (PR #12, wdrożone) | M0-1 | A2, A5, L6; telefon: dolny panel |
| M0-4 | Przełącznik „Pokaż 2 kroki” (ścieżki z grafu) | Pomysł | M0-3 | Oznaczone jako pośrednie |
| M0-5 | Testy w przeglądarce (klik, klawiatura, Esc, brak przewijania, kontrast) i zrzuty | Zrobione (PR #12, wdrożone) | M0-3 | S4 |
| M0-6 | Zewnętrzne źródła mechanizmów krawędzi (dziś oparcie to cytat z treści węzła, sprawdzany kodem) i twierdzenia w `claims.json` | Pomysł | M0-2 | Jak mechanizmy w kalendarzu (EBC, Fed) |
| M0-7 | Zależności dla węzła „Dług publiczny” (dziś bez krawędzi) i uzupełnienie brakujących | Pomysł | M0-2 | Wymaga cytowalnego związku w treści |

## Fala M1: Dom i kredyty (widok „Codzienność”)

| ID | Pozycja | Status | Zależność | Uwagi |
|---|---|---|---|---|
| M1-0 | Widok „Codzienność”: plansza grup, wspólne węzły z widokiem „Świat” | Pomysł | Q1, M0-3 | Komponent do `components.md` |
| M1-1 | Zadanie badawcze: NBP (MIR nowe umowy, ceny mieszkań): licencja, format, plik maszynowy | Pomysł | — | Blokuje M1-2..M1-5 |
| M1-2 | Węzeł: Kredyt hipoteczny (oprocentowanie nowych umów, przykładowa rata jawnie wyliczona) | Pomysł | M1-1 | D15 dla raty |
| M1-3 | Węzeł: Mieszkania (cena m², NBP kwartalnie) | Pomysł | M1-1 | Niska aktualność z natury |
| M1-4 | Węzeł: Kredyt gotówkowy | Pomysł | M1-1 | |
| M1-5 | Węzeł: Lokaty i oszczędności | Pomysł | M1-1 | |
| M1-6 | Węzeł: Czynsze i najem (CPI + ceny ofertowe jako wtórne) | Pomysł | M1-1 | |

## Fala M2: Jedzenie

| ID | Pozycja | Status | Zależność | Uwagi |
|---|---|---|---|---|
| M2-1 | Zadanie badawcze: GUS ceny detaliczne (lista pozycji, API, rytm), MRiRW ZSRIR (maszynowo?) | Pomysł | — | Blokuje M2-2, M2-3 |
| M2-2 | Węzeł: Żywność ogółem (CPI, udział w koszyku) | Pomysł | M2-1 | |
| M2-3 | Węzeł: Owoce i warzywa (ceny kg wybranych produktów) | Pomysł | M2-1 | Zależność od pogody/suszy: graniczna, do właściciela |

## Fala M3: Usługi i energia w domu

| ID | Pozycja | Status | Zależność | Uwagi |
|---|---|---|---|---|
| M3-1 | Potwierdzić liczby o usługach i grupach COICOP w komunikatach GUS | Pomysł | — | Dziś tylko z mediów |
| M3-2 | Węzły: Usługi ogółem, Zdrowie, Restauracje i hotele, Usługi osobiste | Pomysł | M3-1 | |
| M3-3 | Węzeł: Energia w domu (nośniki energii, taryfy URE) | Pomysł | M3-1 | |

## Fala M4: Auta, oszczędności, praca i podatki

| ID | Pozycja | Status | Zależność | Uwagi |
|---|---|---|---|---|
| M4-1 | Znaleźć pierwotne źródło średniej składki OC (KNF/UFG) | Pomysł | — | Bez źródła węzeł OC nie startuje |
| M4-2 | Węzły: Auta używane, Auta nowe (CEPiK pierwotne, ceny wtórne) | Pomysł | — | Oznaczenie pierwotne/wtórne |
| M4-3 | Węzły: Obligacje detaliczne, Emerytury (waloryzacja), Płaca minimalna | Pomysł | — | Związki z przepisów, bezpośrednie |
| M4-4 | Węzeł: Pożyczki pozabankowe (limit kosztów, RRSO) | Pomysł | Q3 | Limity potwierdzić w tekście ustawy |
| M4-5 | Węzeł: Podatki i składki | Pomysł | — | Ostrożny opis |

## Dziennik PO

- 26.11.2026: M0-1, M0-2, M0-3, M0-5 scalone i wdrożone (PR #12). Dalsze pozycje czekają na priorytety z `docs/roadmap.md`: najpierw jakość i aktualizacja danych (iteracje 1–3), potem M1.
- 25.11.2026: założono backlog i definicję roli (research i plan: `docs/map-expansion.md`). Właściciel odpowiedział „tak” na Q1–Q4. M0-1, M0-2, M0-3 i M0-5 zrobione w PR (16 krawędzi, `LinkLayer`, `DepsBlock`, testy); decyzja D25 zmienia klik na komputerze (zaznacza zamiast otwierać modal). Następne: M0-4 („Pokaż 2 kroki”), M0-6, M0-7, potem M1-1 (badanie NBP).
