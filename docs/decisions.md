# Dziennik decyzji

Najnowsze na górze. Agent czyta ten plik przed propozycją zmiany i nie wraca do odrzuconych pomysłów bez nowego argumentu. Nowy wpis: data, decyzja, powód, skutek.

## 25.11.2026: D21, słownik pojęć (fala A, 3/4)

| # | Decyzja | Powód | Skutek |
|---|---|---|---|
| D21 | **Słownik pojęć jako okno** otwierane ze stopki (nagłówek na telefonie jest zajęty, piąta zakładka nawigacji zajęta przez Kalendarz). **Definicja jest „potwierdzona” tylko wtedy, gdy ma cytat ze strony źródła pierwotnego i twierdzenie sprawdzane kodem.** Potwierdzone: PKB, szybki szacunek (Eurostat), Fed, FOMC (Fed), EBC (EBC), EDP (Eurostat), SAFE (Komisja Europejska). 12 haseł z makiety pozostaje „roboczych”. | Wcześniej żadna z 14 definicji nie była potwierdzona, a słownik pokazujący je jako pewne łamałby zasadę 8. | **Backlog haseł** (ostrzeżenia walidatora, zasada 7): UE, CPN, WIG20, MFW, UKMTO, PIE, GW, VAT, FOMO, IEA, IRENA, KE, PMI, GPW. Strony MFW, UKMTO i GPW blokowały pobranie, więc ich definicje czekają na źródło. **Poprawka własna:** twierdzenia o datach z kalendarza (D20) łamały kontrolę spójności (5 nowych znalezisk); `consistency.py` zna teraz pola `soon` i `def`. |

## 25.11.2026: D20, zakładka „Kalendarz” (fala A, 2/4)

| # | Decyzja | Powód | Skutek |
|---|---|---|---|
| D20 | **Nowa zakładka „Kalendarz”** („Najbliższe 30 dni”), zasilana z `soon.events` (bez nowego pola z datą). **Termin trafia do kalendarza z oznaczeniem poziomu źródła** (pierwotne/wtórne); konkretna data bez źródła daje ostrzeżenie. Daty sprawdzone 25.11: EBC 16–17.12 oraz inflacja HICP 1.12 (szybki szacunek) i 17.12 (pełne dane) z kalendarzy EBC (poziom 1), Fed 8–9.12 (rejestr), RPP 1–2.12 (harmonogram za NBP, wtórne), GUS 30.11 (analizy.pl, wtórne). | Pozycja #3 z `docs/expansion-ideas.md`: znane daty uspokajają i pokazują „co może o tym zadecydować”. D19 dopuszcza nowe pozycje w nawigacji. | **Korekta danych:** węzły `bank` i `west` miały „grudzień” dla EBC (jest 16–17.12), a `west` tylko 17.12 jako „inflacja za listopad” (1.12 to szybki szacunek, 17.12 pełne dane). Strony NBP i GUS nie dały dat maszynowo, więc RPP i GUS są wtórne. Pozostałe wydarzenia z datą bez źródła to ostrzeżenia walidatora (backlog). |

## 25.11.2026: D24, zakładka Newsy: „jeden wpis naraz” zamiast karuzeli

| # | Decyzja | Powód | Skutek |
|---|---|---|---|
| D24 | **Newsy pokazują grupy kart po jednym wpisie naraz (FocusPager), nie klasyczną karuzelę.** Wybór po przeglądzie wytycznych: klasyczne karuzele z automatycznym przewijaniem są pomijane przez użytkowników i wymagają wstrzymania (WCAG 2.2.2), gest przeciągania wymaga przycisków jako alternatywy (WCAG 2.5.1), a dostęp „po kolei” jest nieefektywny przy ośmiu pozycjach ([NN/g](https://www.nngroup.com/articles/mobile-carousels/), [WebAIM](https://webaim.org/techniques/carousels/), [Smashing Magazine](https://www.smashingmagazine.com/2022/04/designing-better-carousel-ux)). Dlatego: bez automatu, z przyciskami i licznikiem, z przygaszonym skrajem następnej karty, z przełącznikiem „Pokaż wszystkie” (bezpośredni dostęp) i dużymi przyciskami „Następny” pod kartą (naturalne „kliknij dalej”). | Uwaga właściciela: czytelnik ma skupić się na jednym wpisie i kliknąć dalej, jeśli go to zainteresuje. Strona Newsy miała na telefonie 17 504 px; po zmianie ok. 6 600 px. | Zastosowane do 6 grup (8 par nagłówków, 4 koszty, 6 dobrych wiadomości, 8 sztuczek, 5 badań, 5 pytań). NN/g zaleca, by użytkownik dotarł do końca w 3–4 krokach, więc dla grup po 8 jest przełącznik „Pokaż wszystkie” i licznik pozycji. |

## 25.11.2026: D22, mapa z zależnościami i rozbudowa o codzienne tematy (plan)

| # | Decyzja | Powód | Skutek |
|---|---|---|---|
| D22 | **Mapa ma pokazywać zależności klikniętego węzła i rosnąć o codzienne tematy** (dom, jedzenie, usługi, auta, kredyty i pożyczki, praca). Wdrażaniem zarządza nowy agent **`product-owner-mapy`** (`.claude/agents/`), backlog w `docs/map-backlog.md`. **Zależności są danymi (`links.json`), zapisujemy tylko krawędzie bezpośrednie**, ścieżki wielokrokowe liczy kod. Proponowane (do potwierdzenia przez właściciela, pytania Q1-Q4): osobny widok „Codzienność”, kolejność fal M0 (zależności dla 13 węzłów), M1 (dom i kredyty), M2 (jedzenie), tematy wrażliwe z neutralnym tonem (D19), PO uruchamiany ręcznie. | Dziś zależności są tylko w grafice, więc nie da się ich podświetlić ani sprawdzić kodem. Research: GUS (CPI według grup, ceny detaliczne), NBP (MIR), MRiRW (ZSRIR) dają dane pierwotne dla większości tematów. Szczegóły: `docs/map-expansion.md`. | Nic nie jest jeszcze zbudowane. Pierwsza pozycja backlogu (M0-1) czeka na Q1-Q4. |

## 25.11.2026: D18 i D19, kierunek rozbudowy i nowe grupy tematów

| # | Decyzja | Powód | Skutek |
|---|---|---|---|
| D19 | **Nowe tematy (nieruchomości, ziemia, woda i pogoda) wchodzą jako osobne grupy w nawigacji obok łańcucha cen** (np. „Dom i pieniądze”, „Woda i pogoda”), nie jako kolejne węzły łańcucha. **Woda i susza wchodzą na równi z innymi tematami.** Zasada ogólna (właściciel, 25.11.2026): **ton strony się nie zmienia (neutralny, kierunek, skala, kontekst, okres odniesienia), a „ryzyko alarmowego odbioru” liczby nie jest powodem, żeby o niej nie mówić.** Zamiast pomijać, pokazujemy liczbę z kontekstem i definicją. **IMGW jest pilotażem danych odświeżanych automatycznie** (domyślne rozstrzygnięcie 25.11.2026, gdy właściciel nie ocenił tematu): pobieranie w workflow w czasie budowania (nie na żywo w przeglądarce), archiwizacja dowodu, kilka wybranych stacji. Warunek startu: przeczytany regulamin IMGW i ustalone definicje pól (np. od kiedy liczy się `suma_opadu`). Przy zakazie w regulaminie wracamy do danych ręcznych. Właściciel może to zmienić. | Nieruchomości łączą się bezpośrednio ze stopami i płacami, a woda i opady mają z cenami żywności dwa przejścia (test sensu: „graniczne”). Szczegóły: `docs/data-topics.md`. | Przed budową grup: krótka decyzja o układzie nawigacji, sprawdzenie licencji i dostępu (NBP, GUS, IMGW), zgodnie z `docs/data-topics.md` pkt 8. |
| D18 | **Rozbudowa idzie według `docs/expansion-ideas.md`, zaczynamy od fali A** (Jak to sprawdzamy + dziennik korekt, kalendarz 30 dni, słownik pojęć, tryb spokojny i dostępność). **Opinia odbiorców: zwykły feedback** (np. zwykły formularz lub kontakt z pytaniem otwartym), bez analityki zaangażowania i bez śledzenia. Dziennik korekt publikujemy jawnie (rekomendacja, do potwierdzenia). **Tryb nauczyciela: bez decyzji, odłożony.** | Badania: unikanie newsów wynika głównie z braku zaufania, więc przejrzystość najtaniej podnosi wartość. Właściciel wybrał zwykły feedback zamiast miar odbioru. | Fala B i C po fali A. Formę feedbacku (kanał, treść pytania) ustalamy przy wdrożeniu, bez zbierania danych bez zgody odbiorcy. |

## 24.11.2026 (faza 0): D17, weryfikacja treści bez udziału właściciela

| # | Decyzja | Powód | Skutek |
|---|---|---|---|
| D17 | **Treści (liczby, twierdzenia, pytania, teksty) mają być weryfikowalne automatycznie, z dowodem, bez udziału właściciela.** Trzy warstwy: kod (rejestr twierdzeń, weryfikacja ze źródłem, spójność plików, język atrybucji), niezależny agent z rubryką (`weryfikator-faktow`, `redaktor`) i człowiek tylko dla decyzji wartościowych, niezgodnych źródeł pierwotnych, niskiej pewności agenta lub źródeł niedostępnych automatycznie. Projekt: `docs/verification.md`. **Priorytet: wyłapywanie treści naciąganych lub bez większego sensu** („test sensu”: powiązanie uzasadnialne jednym zdaniem bez dodatkowych założeń; jednoznacznie naciągane agent odrzuca sam), a **przy większej niejasności decyzja trafia do właściciela** z propozycją i uzasadnieniem. Zastosowanie od razu: pytanie PKB zamienione na „Czy miejsce, w którym pracujesz, ostatnio się rozwija?”, pytanie przy długu usunięte (kryterium R1, powiązanie z liczbą). | Dotąd niezgodności w danych (np. „rynek oczekiwał +3,6%”, +3,9% vs +4,1%) wychodziły przy ręcznym przeglądzie. Właściciel nie ma być ostatnią linią obrony jakości. | Faza V1–V4 w `docs/verification.md`, rubryka R1–R6 dla pytań, złoty zbiór do kalibracji agentów. |

## 24.11.2026 (faza 0): D16, pytanie „Dla Ciebie” jest opcjonalne

| # | Decyzja | Powód | Skutek |
|---|---|---|---|
| D16 | Pole `soon.question` jest **opcjonalne**. Węzeł `ukraine` zostaje **bez pytania**, dopóki nie pojawi się dobre. | Pytanie „Czy w Twojej okolicy mieszkają osoby z Ukrainy?” dotyka wojny i uchodźców (zasada „szanuj temat wojny”). Lepszy brak pytania niż pytanie na siłę. | Walidator nie wymaga pola (jeśli jest, sprawdza T7), test zaktualizowany, `question` usunięte z `ukraine` w `steps.json`, opis w `content-model.md` i `components.md`. |

## 24.11.2026 (faza 0): D15, kontekst liczby i skróty z definicją

| # | Decyzja | Powód | Skutek |
|---|---|---|---|
| D15 | Dwa nowe bloki na poziomie „Więcej”: **„Czego ta liczba nie mówi”** (1–3 zdania o granicy wskaźnika, z definicji albo z danych aplikacji) i **„Spójrz też na”** (2–3 wskaźniki, które aplikacja już ma, każdy prowadzi do swojego węzła; to różne miary, więc nie leżą na jednej skali). Pierwszy przykład: PKB obok płac realnych i deficytu. **Własnego wskaźnika zbiorczego nie budujemy.** Drugi element: **każdy skrót i termin fachowy w tekście jest klikalny** i ma definicję w jednym zdaniu (pierwsze wystąpienie w bloku), z jednego glosariusza ze źródłem. | PKB mierzy wartość wytworzoną i sprzedaną, a nie to, czy ktoś zyskał ani ile wzrost kosztował. Laik nie zna skrótów (r/r, pp, CPI, GUS, PKB). Własny wskaźnik zbiorczy miałby subiektywną metodologię, której nie da się obronić. | Pola `limits` i `also` w węzłach, plik `src/data/terms.json`, komponenty `LimitsBlock`, `AlsoBlock`, `GlossaryTerm`, zasady I7 i A5. Makieta: sekcja 5 w `docs/design/mockups`. Dane i implementacja dopiero po scaleniu W3 (fala 2), bo W3 edytuje `steps.json`. |

## 24.11.2026 (faza 0): D14, miara ceny ropy Brent (opcja C)

| # | Decyzja | Powód | Skutek |
|---|---|---|---|
| D14 | **Kafelek i wykres 2026 zostają w mierze ICE (kontrakt terminowy), jawnie podpisanej. EIA (cena spot, źródło pierwotne) jest odniesieniem.** Wykres słupkowy podpisuje średnie roczne jako spot EIA, a ostatni słupek jako „(ICE)". Węzeł ropy dostał fakt z EIA (92,94 USD z 17.11 wobec 92,6 USD kontraktu z 23.11, różnice w kryzysie do ok. 26 USD). | Porównanie z EIA pokazało, że dane 2026 to kontrakt ICE, a średnie 2021–2024 to spot EIA (zgodne co do 0,04 USD), więc wykres mieszał miary. ICE to liczba znana z mediów i aktualna „dziś”, a EIA ma ok. tygodnia opóźnienia. | `steps.json` (podpis miary, dodatkowy fakt), `charts.json` (podpisy), EIA na liście „Źródła” w szablonie. Wskaźnik pewności Brenta zostaje „Średni” (kontrakt giełdowy z mediów). |

Świadome decyzje wykonawcze przy D14:
- **Nie zmieniono „ok. 90 USD" na „ok. 93 USD".** Zmiana wymagałaby poprawienia „ok. 30% więcej niż w lutym" (93 / 68 to ok. +37%) i kopii liczb w `news.json` i `problems.json`. Do osobnej decyzji.
- **Nie dodano wpisu do `changelog.json`.** Aplikacja bierze „ostatnią aktualizację" z pierwszego wpisu (`LAST = CL[0]`): z niego liczy kropki przy węzłach i przycisk „Co się zmieniło". Nowy wpis z jedną zmianą zastąpiłby w interfejsie dzisiejszą listę 10 zmian. Żadna wartość liczbowa się nie zmieniła (doprecyzowano opis miary i dodano fakt), więc wpis nie jest wymagany. Zasadę dopisano do `CLAUDE.md`.

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

- Brent: dwie wartości w danych (ok. 90 USD i 92,6 USD): **korekta 25.11.2026 (poprawia ocenę z D14)**. Wyjaśnienie „zaokrąglenie” było błędne: Trading Economics podaje 24.11 = 90,99 USD (+1,81% d/d), czyli 23.11 ok. 89,4 USD, więc „ok. 90” jest poprawne, a **92,6 przypisane do 23.11 było nieaktualne**. Poprawione: ostatni słupek i punkt wykresu 2026 (24.11: 91,0), tekst faktu z EIA, nowe źródło `tradingeconomics-brent` (poziom 3, strona zmienna, dowód w `docs/evidence/2026-11-25-brent-tradingeconomics.json`).
- Dziennik zmian: w najnowszym wpisie poprawiono notatkę przy inflacji (usunięto fałszywe „Niżej niż oczekiwane 3,7%”, bo 3,7% to średnia z trzech odczytów). Wpis `sun` „+3,9% (II kw.)” zostaje: aplikacja 28.10 faktycznie pokazywała +3,9%.
- **Niezgodności znalezione przez W3 (szczegóły w `docs/node-fields-review.md`, sekcja 5), do decyzji redaktora:**
  - `sun.f` oraz `news.json`: „rynek oczekiwał +3,6% r/r": w źródłach +3,6% to wzrost wyrównany sezonowo, nie konsensus rynku (prawdopodobna pomyłka, **treść widoczna na żywej stronie**);
  - PKB II kwartału: `steps.json` +4,1%, ale `changelog.json` +3,9%; jedna z wartości jest błędna lub dotyczy innego szacunku;
  - `west.f`: wartości dla Niemiec, Francji i Włoch w III kwartale niezweryfikowane;
  - `debt.mc`: „plan 2026 i 2027": 7,1% potwierdzone tylko dla 2026 r.;
  - deficyt 2025: 7,3% (GUS) vs 7,2% (Eurostat, po rewizji);
  - `worker.m` (+2,4% realnie): prosta różnica płac i CPI daje 2,5–2,6 pp, więc Finwire użył innej deflacji;
  - `tree.mc`: „od początku roku ok. +31%" wymaga przeliczenia (WNP: +26% do 20.11);
  - `ukraine.m`: 4,8% PKB (Pułaski) vs 4,81% (FZZ), dwie wartości jednego wskaźnika.
- ~~Pytanie „Dla Ciebie” przy węźle `ukraine`~~: rozstrzygnięte w D16 (bez pytania).
- Etykieta „Reuters” prowadzi do domeny `daily-sun.com`.
- Źródła poziomu 3 przy kluczowych liczbach (do zastąpienia pierwotnymi, gdzie się da).

## 25.11.2026: przegląd PR #1 i poprawki przed scaleniem

- **Poprawione:** nagłówek o inflacji w `news.json` („niżej niż oczekiwano”, „Rynek liczył na 3,7%”): źródło (Finwire) podaje 3,7% jako średnią z trzech ostatnich odczytów, a nie oczekiwanie rynku. Przepisane na „niżej niż we wrześniu” (4,1%). Starsza notatka w `changelog.json` („Niżej niż oczekiwane 3,7%”) to historia i nie jest edytowana, ale ma ten sam błąd.
- **Otwarte:** liczba główna Brenta „ok. 90 USD (23–24.11)” nie ma w rejestrze źródła, które by ją potwierdzało (`verify_claims.py`: rozbieżne). `tvn24-ropa-2-11` to artykuł z 2.11 (ok. 110 USD). Wyszukiwanie nie dało wiarygodnego źródła. Do uzupełnienia (np. strona z notowaniem ICE z 23–24.11).
- **Poprawione narzędzia:** panel węzła na telefonie nie zasłania już listy kroków (odstęp pod panelem), a `verify_claims.py` toleruje zaokrąglenia do precyzji wartości i grupy tysięcy (4170,92 → 4171). Po poprawkach: 16 potwierdzonych, 8 niedostępnych (blokady), 1 rozbieżne (Brent).
