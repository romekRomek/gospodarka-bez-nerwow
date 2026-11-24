# Dziennik decyzji

Najnowsze na górze. Agent czyta ten plik przed propozycją zmiany i nie wraca do odrzuconych pomysłów bez nowego argumentu. Nowy wpis: data, decyzja, powód, skutek.

## 24.11.2026 (po zamknięciu U): D13, prostszy blok „Co może o tym zadecydować”

| # | Decyzja | Powód | Skutek |
|---|---|---|---|
| D13 | **Zastępuje blok z D12.** Zamiast „Do własnych wniosków” (perspektywy, pytanie, zaproszenie) jest **„Co może o tym zadecydować”**: lista najbliższych wydarzeń z datą (lub „bez terminu”) i jedno łatwe pytanie **„Dla Ciebie”**, na które laik odpowie z głowy w 3 sekundy. „Obserwuj” na poziomie Podstawy to najważniejsze z tych wydarzeń. | Poprzedni blok był zbyt wyrafinowany. Pytanie „jak Twoja sytuacja wypada na tle średniej” jest za trudne dla laika. Odrzucone też: blok „Z perspektywą” z otuchą i „Zdaniem na dziś” (za dużo kombinowania). | Pola `soon.events[]` i `soon.question` zamiast `own`. Zaktualizowane: makiety, `principles.md` (T7), `components.md` (`SoonBlock`), `content-model.md` (+ pomysł kalendarza z `cadence`), `content-strategy.md` (T4), `CLAUDE.md`. **Potwierdzone przez właściciela („lekko, przyjemnie i praktycznie”), uznajemy za zamrożone: nie przerabiać bez nowego argumentu.** |

## 24.11.2026 (po zamknięciu U): D12, zaproszenie zamiast nakłaniania

| # | Decyzja | Powód | Skutek |
|---|---|---|---|
| D12 | ~~**Zastępuje blok „Na co masz wpływ” z D11.** Nowy blok **„Do własnych wniosków”** (poziom Więcej): 2–3 perspektywy sytuacji jako opis („Dla kierowcy…”), jedno otwarte pytanie do czytelnika i najwyżej jedno opcjonalne zaproszenie („Jeśli chcesz, przelicz to na własne wydatki”). Zasada T7: zaproszenie, nie nakaz.~~ **Zastąpione przez D13** (zasada T7 zostaje). | Poprzedni blok powtarzał fakty pod nagłówkiem obiecującym sprawczość, a wersja „W praktyce / Sprawdź u siebie” skłaniała do działania, co męczy. Chodzi o łagodny kontekst i własne interpretacje, nie o wskazówki. | Pola `own.perspectives[]`, `own.question`, `own.invite` zamiast `can[]`. Zaktualizowane: makiety, `principles.md` (T3, T7), `components.md` (`OwnBlock`), `content-model.md`, `content-strategy.md` (T4), `CLAUDE.md`. |

## 24.11.2026 (po zamknięciu U): D11, wycofanie etykiet wpływu

| # | Decyzja | Powód | Skutek |
|---|---|---|---|
| D11 | **Zastępuje D6.** Zamiast etykiet „Mam wpływ / Częściowo / Nie mam wpływu” są: **„Decyduje”** (kto kształtuje wartość), **„Dotyczy”** (kogo), **„Obserwuj”** (tylko z konkretem, bez powtarzania „Decyduje”) i blok „Na co masz wpływ” rozpisany na sytuacje (ten blok zastąpiony przez D12). | Etykieta oceniała czytelnika i nie pasowała do różnych grup (kierowca, kredytobiorca, przedsiębiorca). „Nie mam wpływu” brzmiało fatalistycznie, „Częściowo” było mgliste. | Pola `decides`, `concerns`, `watch` (zamiast `influence`; blok `can[]` zastąpiony w D12). Później opcjonalny „Mój profil”. |

## 24.11.2026: zamknięcie fazy U (UX/UI)

Zatwierdzone przez właściciela na podstawie makiet `docs/design/mockups/index.html` (wersja 1.0). Pakiet: `docs/design/` (zasady, architektura informacji, tokeny, komponenty, wzorce, model treści).

| # | Decyzja | Powód | Skutek |
|---|---|---|---|
| D1 | Kierunek **„Mapa + warstwy”**: mapa zostaje kręgosłupem, treść ma poziomy głębokości. | Mapa dobrze pokazuje zależności i jest lubiana. | Zakładki Start, Mapa, Newsy, Polska. |
| D2 | **Start** jest pierwszą zakładką („Dziś w 60 sekund”). Wariant B (mapa na otwarciu z paskiem „Dziś”) odrzucony jako domyślny, ale zostaje w makietach. | Start odpowiada „co się dzieje?” zanim ktoś otworzy mapę. | Komponenty Start zgodnie z `patterns.md`. |
| D3 | Poziomy treści: na start **dwa** (Podstawy, Więcej). Szczegóły i Ekspert później. | Prostota pierwszej wersji. | Pole `level` w danych od razu dopuszcza 1–4. |
| D4 | Zakładka **„Uczę się”** po ustabilizowaniu Startu i Mapy. | Nie rozpraszać pierwszej wersji. | Nie ma jej w nawigacji v1. |
| D5 | **Brak „dobrych” i „złych” wiadomości.** Pokazujemy, że to ton autora lub sposób wywołania emocji (ramowanie). | Etykiety oceniają fakty i bywają narzędziem manipulacji. | Karta „Ta sama liczba, dwa nagłówki”. Do przepisania: `good.json`, `news.json` (`pos`/`neg`), sekcja „Odtrutka”. |
| D6 | ~~Dawna skala wagi zastąpiona etykietami wpływu (Mam wpływ / Częściowo / Nie mam wpływu).~~ **Zastąpione przez D11.** Zostaje z D6: skala Tło / Obserwuj / Działaj jest wycofana, „Obserwuj” z konkretem. | Waga mieszała wpływ z nastrojem. | Patrz D11. |
| D7 | **Wskaźnik pewności danych** przy każdej liczbie (Wysoka / Średnia / Niska, cztery czynniki), liczony skryptem z rejestru źródeł. | Powtarzalność i sprawdzalność, uczciwość wobec rozbieżności źródeł. | `sources.json`, `scripts/confidence.py` w fazie 0. |
| D8 | **Nagłówek dnia**: tytułem jest absurdalna parodia (`abs`), pod nią klikbajt (`h`), odzwierciedlenie (`e`, `i`) i „Po ludzku” (`calm`). Bez przycisku „Podkręć”. | Humor ma uczyć rozpoznawać klikbajt. | Zasady humoru w `principles.md` (T4). |
| D9 | **Tokeny** w `docs/design/tokens.json` jako jedyne źródło prawdy. Dodany `--oil-ink` dla tekstu w kolorze energii (kontrast AA). Kontrast sprawdza `tokens.py check`. | Skalowalność i spójność. | design-lint w fazie 0 egzekwuje użycie tokenów. |
| D10 | Szczegóły węzła na telefonie w **dolnym panelu**, nie w oknie modalnym. | Mapa zostaje widoczna, strefa kciuka. | `NodePanel`. |

### Otwarte uwagi (do obserwacji w fazach budowy, nie blokują zamknięcia U)

- ~~Ton etykiet „Częściowo” i „Nie mam wpływu”~~: rozstrzygnięte w D11. Do sprawdzenia na odbiorcach: czy „Decyduje / Dotyczy” i „Co może o tym zadecydować” są zrozumiałe i trafiają do różnych grup, oraz czy pytanie „Dla Ciebie” nie jest uciążliwe.
- Poziom absurdu w parodiach (`abs`): część jest surrealistyczna (np. „PKB wyrósł z domu i nie odbiera telefonu”). Do potwierdzenia, czy to docelowy ton.
- Test z kilkoma osobami z grupy docelowej (zaplanowany w fazie U) nie został jeszcze przeprowadzony. Do wykonania na pierwszej działającej wersji Startu.
- Makiety sprawdzone w jasnym i ciemnym motywie na szerokościach od ok. 500 do 1280 px. Realne 360–390 px do sprawdzenia na urządzeniu lub w DevTools przy budowie.

### Do poprawy przy migracji danych (faza 0)

- Brent: dwie wartości w danych (ok. 90 USD i 92,6 USD).
- Etykieta „Reuters” prowadzi do domeny `daily-sun.com`.
- Źródła poziomu 3 przy kluczowych liczbach (do zastąpienia pierwotnymi, gdzie się da).
