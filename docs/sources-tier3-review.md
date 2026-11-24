# Zestawienie źródeł poziomu 3

Stan: 24.11.2026, branch `faza-0-fundament`. Dotyczy 21 źródeł poziomu 3 z `src/data/sources.json` (poziomy robocze, `reviewed: false`). Cel: zdecydować, które zastąpić źródłem pierwotnym, które zostawić obok, a które usunąć. Wskaźnik pewności danych liczy się z poziomu źródła, więc od tych decyzji zależy, czy liczby dostaną „Wysoką" pewność.

## 0. Status realizacji (24.11.2026)

| Krok | Stan |
|---|---|
| Dopisano do rejestru źródła pierwotne GUS: CPI (`gus-cpi`), płace (`gus-wynagrodzenia-2026-10`), PKB (`gus-pkb-szybki-szacunek-2026-q3`) | **zrobione** |
| Pole `primary` przy 4 źródłach Finwire (wskazuje GUS) | **zrobione** |
| Pola `src` w `steps.json` dla węzłów `shop`, `pump`, `worker`, `sun` (źródło pierwotne pierwsze) | **zrobione** (4 z 13 węzłów) |
| Walidator sprawdza `src` i `primary` (+ 6 testów) | **zrobione** |
| EIA (cena Brent): źródło w rejestrze, porównanie z danymi, `src` dla `derrick` (poziom 2), skrypt kontrolny. Wynik: [`brent-eia-check.md`](brent-eia-check.md). Decyzja D14 (opcja C) wykonana: podpisy miar, fakt z EIA, poprawiony wykres | **zrobione** |
| Pozostałe źródła z sekcji 3 (Fed, Eurostat, KE, handel GUS, PNAS), `src` przy pozostałych 8 węzłach | do zrobienia |
| NBP, GPW, MFW (ręczne potwierdzenie adresów) | do zrobienia |
| Wyjaśnienie „+4,1% w II kw.", „9 405 zł", „59,7%" w załącznikach GUS | do zrobienia |
| Architektura źródeł danych i API | osobne zadanie: [`data-sources-architecture.md`](data-sources-architecture.md) |

## 1. Wnioski

- **Liczby w danych zgadzają się ze źródłami wtórnymi.** Z 18 stron, które sprawdzałem pod kątem liczb, 14 zawiera wszystkie oczekiwane wartości, 2 tylko część (patrz sekcja 4), a 2 były niedostępne dla skryptu.
- **Problemem nie jest poprawność, tylko pochodzenie.** CPI, płace i PKB opierają się na Finwire, a stopy, Fed, strefa euro, WIG20, MFW i dług na portalach branżowych. Same te portale wprost powołują się na GUS, NBP, Eurostat, MFW, GPW i Komisję Europejską.
- **Dla większości liczb istnieje źródło pierwotne, które da się podpiąć.** Zweryfikowałem 12 adresów (sekcja 3). Dla NBP, GPW i MFW strony blokują automatyczne zapytania, więc ich adresów nie potwierdziłem i muszą zostać sprawdzone ręcznie.
- **Realne luki:** brak potwierdzenia „+4,1% w II kwartale" (PKB), „59,7% PKB" (dług) i „9 405 zł" (płace) na stronach GUS (te liczby mogą być w załącznikach PDF/XLSX), źródło „Reuters" prowadzące do `daily-sun.com` (403) oraz `comparic.pl` (brak połączenia).
- **Efekt dla pewności:** po dopisaniu GUS jako źródła głównego, a portalu jako pomocniczego, kafelki CPI, płac i PKB zmieniają czynnik „Źródło" z „wtórne" na „pierwotne".

## 2. Metoda i ograniczenia

Co zrobiłem: pobrałem każdą stronę ze źródła poziomu 3 i sprawdziłem, czy liczby z danych aplikacji występują w jej tekście. Dla kandydatów na źródła pierwotne sprawdziłem, czy adres odpowiada (HTTP 200) i czy tytuł strony zgadza się z tematem. Na stronach wydań GUS sprawdziłem też obecność liczb.

Czego **nie** zrobiłem:
- Obecność liczby w tekście nie dowodzi, że dotyczy tego samego wskaźnika i okresu. To sprawdzenie wstępne, a nie weryfikacja redakcyjna.
- Nie czytałem załączników PDF i XLSX (wydania GUS zwykle mają tam tabele).
- NBP, GPW i MFW blokują boty (strona „Pardon Our Interruption", reset połączenia, 403), więc ich adresów nie potwierdziłem.
- Poziomy 1–3 w rejestrze są robocze i przypisane regułą po domenie.

## 3. Zweryfikowane źródła pierwotne (adresy istnieją)

| Źródło pierwotne | Adres | Zastępuje / uzupełnia | Liczby na stronie |
|---|---|---|---|
| GUS: wskaźniki cen towarów i usług konsumpcyjnych (strona tematyczna) | https://stat.gov.pl/obszary-tematyczne/ceny-handel/wskazniki-cen/wskazniki-cen-towarow-i-uslug-konsumpcyjnych-pot-inflacja-/ | Finwire CPI (wrzesień, październik) | strona tematyczna istnieje (200); konkretnego komunikatu za październik nie znalazłem automatycznie |
| GUS: przeciętne zatrudnienie i wynagrodzenie w sektorze przedsiębiorstw, październik 2026 | https://stat.gov.pl/obszary-tematyczne/rynek-pracy/pracujacy-zatrudnieni-wynagrodzenia-koszty-pracy/przecietne-zatrudnienie-i-wynagrodzenie-w-sektorze-przedsiebiorstw-w-pazdzierniku-2026-r-,3,179.html | Finwire płace | +6,1% ✓; „9 405 zł" nie w tekście strony |
| GUS: szybki szacunek PKB za 3 kwartał 2026 | https://stat.gov.pl/obszary-tematyczne/rachunki-narodowe/kwartalne-rachunki-narodowe/szybki-szacunek-produktu-krajowego-brutto-za-3-kwartal-2026-r-,1,55.html | Finwire PKB | +3,5% ✓ |
| GUS: wstępny szacunek PKB w 2 kwartale 2026 | https://stat.gov.pl/obszary-tematyczne/rachunki-narodowe/kwartalne-rachunki-narodowe/wstepny-szacunek-produktu-krajowego-brutto-w-2-kwartale-2026-r-,3,96.html | wartość „+4,1% w II kw." | 4,1% nie w tekście (też nie na stronie zaktualizowanego szacunku) |
| GUS: deficyt i dług sektora instytucji rządowych i samorządowych 2022–2025 | https://stat.gov.pl/obszary-tematyczne/rachunki-narodowe/statystyka-sektora-instytucji-rzadowych-i-samorzadowych/deficyt-i-dlug-sektora-instytucji-rzadowych-i-samorzadowych-w-latach-2022-2025,1,43.html | xyz.pl (EDP), dług | 59,7% i 7,3% nie w tekście (prawdopodobnie w załączniku) |
| GUS: obroty towarowe handlu zagranicznego według krajów, styczeń–wrzesień 2026 | https://stat.gov.pl/obszary-tematyczne/ceny-handel/handel/obroty-towarowe-handlu-zagranicznego-ogolem-i-wedlug-krajow-w-styczniu-wrzesniu-2026-r-,1,170.html | Wiadomości Handlowe i xyz.pl (Chiny) | tabela w załączniku |
| Fed: kalendarz posiedzeń FOMC i komunikaty | https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm | Manager Plus (Fed 28.10) | strona istnieje (200) |
| Eurostat: euro indicators | https://ec.europa.eu/eurostat/web/euro-indicators | Manager Plus (PKB strefy euro) | strona istnieje (200), konkretnego wydania nie wskazałem |
| Eurostat: handel międzynarodowy towarami (Comext) | https://ec.europa.eu/eurostat/web/international-trade-in-goods/overview | uzupełnienie dla Chin | strona istnieje (200) |
| EIA: cena spot ropy Brent (dzienna) | https://www.eia.gov/dnav/pet/hist/RBRTEd.htm | rozstrzygnięcie rozbieżności 90 vs 92,6 USD | seria dzienna, bywa opóźniona o kilka dni |
| Komisja Europejska: Press corner | https://ec.europa.eu/commission/presscorner/home/en | bank.pl i xyz.pl (cła USA) | strona istnieje; konkretny komunikat do znalezienia |
| PNAS: Rathje, Van Bavel, van der Linden (2021), „Out-group animosity drives engagement on social media" | https://doi.org/10.1073/pnas.2024292118 | streszczenie BPS Research Digest | DOI rozwiązuje się w Crossref, zgadza się z tematem streszczenia |

**Niepotwierdzone, bo blokują boty (do ręcznego sprawdzenia w przeglądarce):** NBP (decyzje RPP, stopy), GPW (notowania WIG20), MFW (World Economic Outlook, strona Polski). **Nieodnalezione:** raport UNHCR i Deloitte o uchodźcach z Ukrainy (cytowany przez xyz.pl), strona Eurostat z tabelami notyfikacji EDP (adres, który zgadłem, zwraca 404).

## 4. Zestawienie 21 źródeł poziomu 3

Legenda „Liczby na stronie": ✓ wszystkie oczekiwane liczby są w tekście, ½ część, ✗ brak, n/d strona niedostępna dla skryptu, — nie dotyczy (nie jest źródłem liczby).

### A. Źródła kluczowych liczb

| # | Źródło (id w rejestrze) | Za co odpowiada | Liczby | Cytuje | Proponowane źródło pierwotne | Rekomendacja |
|---|---|---|---|---|---|---|
| 1 | `finwire-inflacja-cpi-pazdziernik` | CPI 3,5% (paź.), 4,1% (wrz.) | ✓ | GUS | GUS, wskaźniki cen (strona tematyczna) | Dodać GUS jako źródło główne, Finwire zostaje pomocniczo. Znaleźć konkretny komunikat za październik. |
| 2 | `finwire-inflacja-cpi-wrzesien` | CPI 4,1% (wrz.) | ✓ | GUS | jak wyżej | jak wyżej |
| 3 | `finwire-wynagrodzenia-pazdziernik` | płace +6,1%, 9 405 zł | ✓ | GUS | GUS, wynagrodzenia, październik 2026 | Dodać GUS jako główne. Sprawdzić „9 405 zł" w załączniku GUS. |
| 4 | `finwire-pkb-iii-kwartal-szybki-szacunek` | PKB III kw. +3,5%, II kw. +4,1% | ½ (brak 4,1%) | GUS | GUS, szybki szacunek PKB, 3 kw. 2026 | Dodać GUS jako główne. **Wyjaśnić „+4,1% w II kw." (nie znalazłem go w tekście Finwire ani GUS).** |
| 5 | `finwire-decyzja-rpp-4-11` | stopa referencyjna 3,75% | ✓ | NBP/RPP (w tekście) | NBP, decyzje RPP (nie potwierdzono) | Dodać NBP po ręcznym potwierdzeniu adresu. |
| 6 | `manager-plus-decyzja-fed-28-10` | Fed 3,75–4,00% | ✓ | — | Fed, komunikaty FOMC | Dodać Fed jako główne. |
| 7 | `manager-plus-pkb-strefy-euro-iii-kwartal` | PKB strefy euro | ✓ (Eurostat) | Eurostat | Eurostat, euro indicators | Dodać Eurostat jako główne. |
| 8 | `wnp-wig20-zamkniecie-23-11` | WIG20 4 171 pkt | ✓ (4170,92) | GPW | GPW (nie potwierdzono) | Dodać GPW po ręcznym potwierdzeniu. |
| 9 | `wnp-rekord-wig20-z-13-11-i-sesja-z-20-11` | rekord 4 320, −4,5% | ✓ | GPW | GPW (nie potwierdzono) | jak wyżej |
| 10 | `xyz-pl-prognozy-mfw-dla-polski` | MFW: strefa euro 1,1%, Polska 3,4% | ✓ | MFW (World Economic Outlook), MF | MFW WEO (nie potwierdzono) | Dodać MFW po ręcznym potwierdzeniu. |
| 11 | `xyz-pl-notyfikacje-edp-deficyt-i-dlug` | deficyt 7,3% PKB, dług 59,7% | ½ (brak 59,7) | KE, Eurostat | GUS, deficyt i dług 2022–2025 (dług jest już w rejestrze jako źródło poziomu 1); Eurostat EDP (adres nieodnaleziony) | Pierwotnym dla długu jest GUS (już podpięty przy karcie „Finanse publiczne"). Potwierdzić 59,7% i 7,3% w załączniku GUS. |
| 12 | `xyz-pl-cla-usa-a-polscy-eksporterzy-pie` | cło USA 10%, skutki dla eksporterów | ✓ | PIE (analiza) | KE, Press corner (komunikat); PIE jako analiza | Zostawić jako analizę (PIE to instytut, poziom 2), dla liczby dodać komunikat KE. |
| 13 | `bank-pl-nowe-cla-usa` | cło USA 10% | ✓ | KE (przez PAP) | KE, Press corner | Dodać komunikat KE jako główne. |
| 14 | `wiadomosci-handlowe-chiny-dostawca-nr-1` | Chiny dostawcą nr 1 | ✓ (temat) | raporty własne WH MARKET | GUS, handel zagraniczny I–IX 2026 | Zastąpić GUS (tabela w załączniku). Dodać zastrzeżenie 12 mies. vs 9 mies. |
| 15 | `xyz-pl-import-z-chin` | import z Chin | ✓ (temat) | GUS (wspomniany raz) | GUS, handel zagraniczny; Eurostat Comext | Dodać GUS. |
| 16 | `xyz-pl-uchodzcy-z-ukrainy-2-4-pkb` | uchodźcy 2,4% PKB | ✓ | UNHCR i Deloitte | raport UNHCR i Deloitte (adres do ustalenia) | Znaleźć raport. Do tego czasu zostawić z oznaczeniem „szacunek". |
| 17 | `daily-sun-lokalne-zawieszenie-broni` | lokalne zawieszenie broni | n/d (403) | — | agencja lub oficjalny komunikat | **Poprawić etykietę „Reuters"** albo zastąpić prawdziwym źródłem. Nie da się zweryfikować. |

### B. Źródła kontekstu i narzędzia (nie liczby)

| # | Źródło | Rola | Proponowane źródło pierwotne | Rekomendacja |
|---|---|---|---|---|
| 18 | `british-psychological-society-bps-research` | streszczenie badania Rathje i in. | PNAS, doi.org/10.1073/pnas.2024292118 | Zastąpić publikacją (DOI zweryfikowany), streszczenie zostawić jako pomocnicze. |
| 19 | `media-bias-fact-check-media-bias-fact-check` | narzędzie na liście „Narzędzia i źródła do samodzielnego sprawdzania" | — | To narzędzie, nie źródło liczby. Zmienić `kind` na „narzędzie", zostawić poziom 3 z uwagą o metodologii. |
| 20 | `comparic-prognozy-i-obroty-biezace` | prognozy PKB a ceny paliw (karta w „Z czym zmaga się Polska") | — | Brak połączenia (n/d). Znaleźć działający adres albo zastąpić prognozą MF/MFW/KE. |
| 21 | `fzz-agenda-polityczna-i-gospodarcza-2026` | publikacja PDF (karta „Z czym zmaga się Polska") | — | Ustalić wydawcę i sklasyfikować. |

## 5. Propozycja zmian w rejestrze (do akceptacji)

1. Dopisać do `sources.json` źródła pierwotne z sekcji 3 (poziom 1, `reviewed: false`): 6 stron GUS, Fed, 2 strony Eurostatu, EIA, Press corner KE oraz PNAS (DOI).
2. Dodać do każdego źródła wtórnego pole `primary` (lista id źródeł pierwotnych, które ono przywołuje). Walidator sprawdzi, że id istnieją.
3. W `steps.json` dodać pola `src` przy liczbach: źródło główne (poziom 1, gdy jest) i pomocnicze. `confidence.py` liczy czynnik „Źródło" z najlepszego poziomu na liście.
4. Ręcznie potwierdzić adresy NBP, GPW i MFW w przeglądarce (strony blokują boty) i je dopisać.
5. Poprawić etykietę „Reuters" (źródło 17) i rozstrzygnąć „+4,1% w II kw.", „59,7%" oraz „9 405 zł" przez sprawdzenie załączników GUS.
6. Po przeglądzie ustawić `reviewed: true` i `tier_basis: "reviewed"` dla zatwierdzonych źródeł.

## 6. Kolejność prac (najpierw to, co najbardziej podnosi pewność)

| Priorytet | Co | Dlaczego |
|---|---|---|
| 1 | GUS: CPI, płace, PKB | Trzy główne kafelki ze Startu. Po tym mają źródło pierwotne. |
| 2 | Rozbieżność Brent (EIA) | Jedyny kafelek z „Średnią" pewnością przez zgodność źródeł. |
| 3 | NBP, Fed, Eurostat, GPW | Węzły banku, strefy euro i giełdy. |
| 4 | MFW, KE (cła), UNHCR i Deloitte | Węzły zewnętrzne. |
| 5 | Źródła kontekstu (18–21) | Karty „Z czym zmaga się Polska" i lista narzędzi. |
