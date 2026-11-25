# Mapa interaktywna z zależnościami i rozbudowa o codzienne tematy

Status: **propozycja do decyzji** (25.11.2026). Research własny: wyszukiwania w sieci i stan repozytorium. Liczby z mediów są **orientacyjne**, każda przechodzi normalną ścieżkę (źródło poziomu 1, dowód, wskaźnik pewności) przed wejściem do aplikacji. Wdrażaniem zarządza agent `product-owner-mapy` (backlog: `docs/map-backlog.md`).

## 1. Stan obecny (sprawdzony w kodzie)

- Mapa ma **13 węzłów** (`nodes.json`: położenie, kategoria, ikona) i `steps.json` (treść). Kliknięcie węzła otwiera jego panel; jest też „Oprowadź mnie” i „Prześledź łańcuch”.
- **Zależności nie są w danych.** Strzałki łańcucha (Stacja → Sklep → Pensje …) są narysowane statycznie w grafice mapy. Jedyny zapis relacji to pole `also` („Spójrz też na”) przy PKB. Nie da się więc na ich podstawie podświetlić powiązań klikniętego węzła ani sprawdzić ich kodem.
- Wniosek: **żeby mapa pokazywała zależności, najpierw potrzebny jest model danych zależności** (jak mamy model liczb i źródeł), a dopiero potem interakcja i nowe węzły.

## 2. Model zależności (`links.json`)

Zależność to krawędź skierowana między dwoma węzłami. Reguły (z naszych zasad):

| Pole | Znaczenie |
|---|---|
| `from`, `to` | id węzłów; kierunek = „zmiana A przenosi się na B” |
| `kind` | `wplyw` (A wpływa na B) albo `skladnik` (B jest częścią A, np. paliwa w koszyku inflacji) |
| `why` | **jedno zdanie** (do 120 znaków) opisujące mechanizm. Bez ocen i bez „dobrze/źle” (zasada 5) |
| `src` | źródła potwierdzające związek (rejestr źródeł); przy `skladnik` z liczbą (np. waga w koszyku) źródło pierwotne |
| `sense` | wynik testu sensu: tylko **bezpośrednie** wchodzą do danych |
| `lag` | opcjonalnie: typowe opóźnienie, tylko gdy ma źródło |

1. **Zapisujemy tylko krawędzie bezpośrednie (jedno przejście).** Ścieżki wielokrokowe wyliczamy z grafu przy kliknięciu, nigdy ich nie wpisujemy ręcznie. To rozwiązuje problem „naciąganych” powiązań (test sensu, D17).
2. **Siła krawędzi tylko z liczby ze źródła** (np. udział paliw w koszyku GUS). Bez liczby pokazujemy sam kierunek, nie „mocno/słabo”.
3. **Pętle sprzężeń zwrotnych** (płace ↔ ceny) zapisujemy jako dwie osobne krawędzie.
4. **Walidacja kodem:** istniejące id, `why` ≤ 120 znaków, `src` z rejestru, brak duplikatów, limit krawędzi na węzeł (czytelność: do 6 w każdą stronę), każda krawędź ma twierdzenie w `claims.json` sprawdzane na stronie źródła, o ile źródło to umożliwia (jak teraz daty w kalendarzu).
5. **Agent `redaktor`** ocenia każdą krawędź testem sensu (bezpośrednie / naciągane / graniczne). Naciągane odrzuca sam, graniczne trafiają do właściciela.

## 3. Interakcja (to, o co prosisz)

Kliknięcie węzła:

1. **Zaznacza go** i **podświetla jego krawędzie**: wychodzące (wpływa na) z grotem, przychodzące (zależy od) linią przerywaną. Rozróżnienie nie opiera się tylko na kolorze (zasada A2).
2. **Wygasza pozostałe węzły** (ok. 35% widoczności), żeby zależności były czytelne także przy kilkudziesięciu węzłach.
3. **W panelu pokazuje sekcję „Zależności”** w dwóch listach: „Na co wpływa” i „Od czego zależy”. Każda pozycja to nazwa węzła i jedno zdanie `why`, a kliknięcie przechodzi do tego węzła. Na telefonie lista jest w dolnym panelu, a podświetlona mapa zostaje widoczna nad nim.
4. **Przełącznik „Pokaż 2 kroki”** rozszerza podświetlenie o węzły drugiego rzędu (ścieżki wyliczone z grafu, oznaczone jako pośrednie).
5. **Dostępność:** klawiatura (Tab, Enter, Esc czyści zaznaczenie), `aria-pressed`, zmiana nie tylko kolorem, `prefers-reduced-motion` wyłącza animację strzałek.
6. **Najechanie na komputerze** pokazuje zapowiedź powiązań bez zaznaczania (opcjonalnie, po stabilizacji).

Nowy komponent: `LinkLayer` (warstwa krawędzi i wygaszanie) oraz `DepsBlock` (sekcja „Zależności” w panelu). Wchodzą do `components.md` przez ten dokument (zasada S2).

## 4. Skalowanie mapy: widoki zamiast upychania

Dziś mapa jest **geograficzna** (Ormuz, Polska, USA, Chiny). Codzienne tematy (czynsz, owoce, kredyt, fryzjer) nie mają położenia, więc upchnięcie ich na mapie świata zrobiłoby bałagan i sprzeczność z geografią.

**Rekomendacja:** dwa widoki tej samej mapy (przełącznik, jak dziś „Polska/Świat”):
- **Świat** (obecny): energia, łańcuch cen, otoczenie.
- **Codzienność** (nowy): schematyczna plansza „budżet domowy” z grupami: **Dom**, **Jedzenie**, **Usługi**, **Auta**, **Kredyty i pożyczki**, **Praca i podatki**. Węzły wspólne (Stacja paliw, Pensje, Bank i stopy) występują w obu widokach i są **tym samym węzłem w danych**, więc zależności działają ponad widokami.

Alternatywa (nierekomendowana): wszystko na jednej mapie z warstwami do włączania; przy ok. 35 węzłach i krawędziach staje się nieczytelna na telefonie.

## 5. Research: dane dla codziennych tematów

Dostępność źródeł (sprawdzone wyszukiwaniem; szczegóły techniczne do potwierdzenia w zadaniu badawczym każdego węzła):

| Obszar | Źródło pierwotne | Co mamy | Rytm | Uwagi |
|---|---|---|---|---|
| Ceny w koszyku, usługi, żywność, energia | GUS: wskaźniki cen towarów i usług konsumpcyjnych (CPI) | Inflacja według grup, **od 2026 r. w klasyfikacji COICOP 2018** (wydzielona grupa „ubezpieczenia i usługi finansowe”), wagi aktualizowane co roku ([GUS o COICOP 2018](https://stat.gov.pl/aktualnosci/informacja-na-temat-wdrozenia-klasyfikacji-coicop-2018-od-danych-za-2026-rok,649,1.html)) | miesięcznie | Już używamy ogólnej inflacji. Podział na grupy (żywność, mieszkanie i energia, transport, zdrowie, restauracje) daje dziesiątki węzłów z jednego źródła. |
| Średnie ceny detaliczne produktów i usług | GUS: ceny detaliczne wybranych towarów i usług | Ceny jednostkowe (np. jabłka za kg, chleb), także usługi; dostępne w serwisie GUS i Banku Danych Lokalnych ([przegląd](https://stat.gov.pl/infografiki-widzety/infografiki/infografika-srednie-ceny-detaliczne-wybranych-produktow,65,1.html)) | miesięcznie | Najlepsze źródło dla „owoce i warzywa” i drobnych usług; do potwierdzenia lista pozycji i dostęp przez API. |
| Owoce i warzywa (hurt) | MRiRW: biuletyny ZSRIR (notowania z Bronisz i innych targów) | Tygodniowe biuletyny z cenami hurtowymi owoców i warzyw ([przykład z gov.pl](https://www.gov.pl/attachment/66f2c3e3-4eeb-439a-8404-cece3a1a5786)) | tygodniowo | PDF, więc ekstrakcja wymaga parsowania; wartość: wcześniejszy sygnał niż GUS. |
| Kredyty hipoteczne i konsumpcyjne | NBP: statystyka stóp procentowych (MIR) | Oprocentowanie **nowych umów**: mieszkaniowych i konsumpcyjnych, tabele miesięczne ([instrukcja NBP](https://nbp.pl/wp-content/uploads/2024/04/instrukcja_mir.pdf)) | miesięcznie | Media podają np. spadek średniego oprocentowania nowych kredytów mieszkaniowych z 7,5% (XII 2024) do 6,5% (X 2025); do potwierdzenia w tabelach NBP. |
| Ceny mieszkań | NBP: informacja o cenach mieszkań | 17 największych miast, rynek pierwotny i wtórny (opis w `docs/data-topics.md`) | kwartalnie | Niska aktualność z natury. |
| Auta: rejestracje i rynek używanych | CEPiK (rejestry), raporty branżowe (Otomoto, AutoCentrum, Samar) | Rejestracje miesięczne (np. wg mediów w sierpniu 2026 zarejestrowano 224 196 aut używanych, +1,6% r/r), ceny w segmentach kwartalnie | miesięcznie i kwartalnie | **Źródła cen to głównie podmioty prywatne (poziom 3)**; pierwotne są rejestry CEPiK. Ubezpieczenie OC: nie znalazłem źródła w tym przeglądzie. |
| Pożyczki pozabankowe | UOKiK, KNF (rejestr instytucji pożyczkowych), przepisy o kredycie konsumenckim | Limity kosztów pozaodsetkowych (np. 10% kwoty plus 10% za każdy rok, wg opisów), obowiązek podania RRSO i formularza informacyjnego; raporty o szarej strefie (np. wg WEI 19% rynku) ([omówienie ustawy](https://direct.money.pl/artykuly/porady/ustawa-antylichwiarska)) | rocznie i zdarzeniowo | Temat wrażliwy: patrz pkt 8 (ton bez zmian, liczby nie są powodem pominięcia). Limity z ustawy wymagają potwierdzenia w tekście aktu. |
| Usługi, zdrowie, restauracje | GUS CPI | Wg mediów inflacja usług ok. 5% r/r wobec ok. 2% dla towarów w 2026 r. (marzec, lipiec); zdrowie ok. +5%, restauracje ok. +4,5% | miesięcznie | Liczby medialne, do potwierdzenia w komunikatach GUS. Wniosek: usługi to osobny, ważny temat dla codziennego budżetu. |

## 6. Katalog proponowanych węzłów (z oceną)

Wartość: ★ niska, ★★ średnia, ★★★ wysoka dla „rozumieć swój budżet”. Dane: **A** pierwotne i maszynowe, **B** pierwotne ręczne/PDF, **C** głównie prywatne. Krawędzie to przykłady **bezpośrednie** (do potwierdzenia testem sensu i źródłem).

| # | Węzeł (grupa) | Liczba główna | Dane | Wartość | Przykładowe krawędzie bezpośrednie | Uwagi |
|---|---|---|---|---|---|---|
| 1 | Żywność ogółem (Jedzenie) | inflacja żywności, udział w koszyku | A (GUS CPI) | ★★★ | Pensje → siła nabywcza zakupów; Żywność → Inflacja (składnik) | Największy udział w koszyku (wg zestawień ok. 1/4). |
| 2 | Owoce i warzywa (Jedzenie) | cena kg wybranych produktów | A/B (GUS, MRiRW) | ★★★ | Owoce i warzywa → Żywność (składnik) | Pogoda i susza → ceny: **graniczne** (dwa przejścia), do właściciela. |
| 3 | Mieszkania (Dom) | cena m² | B (NBP) | ★★★ | Cena mieszkania → kwota kredytu hipotecznego (do potwierdzenia testem sensu) | Dane kwartalne. |
| 4 | Kredyt hipoteczny (Kredyty) | oprocentowanie nowych umów, przykładowa rata | A (NBP MIR) | ★★★ | Stopy NBP → oprocentowanie kredytów | Rata to wyliczenie: etykieta i wzór (D15). |
| 5 | Kredyt gotówkowy (Kredyty) | oprocentowanie nowych umów | A (NBP MIR) | ★★ | Stopy NBP → oprocentowanie kredytów | |
| 6 | Pożyczki pozabankowe (Kredyty) | limit kosztów, RRSO, udział szarej strefy | B/C | ★★★ | Stopy NBP → koszt pożyczki (słabe: **graniczne**) | Edukacja o RRSO i limicie; ton bez zmian. |
| 7 | Czynsze i najem (Dom) | czynsze w CPI; ceny ofertowe najmu | A/C | ★★ | Mieszkania ↔ najem (graniczne) | Dane CPI pierwotne, ceny ofertowe prywatne. |
| 8 | Energia w domu (Dom) | nośniki energii w CPI, taryfy | A (GUS, URE) | ★★★ | Energia w domu → Inflacja (składnik) | Już wspomniane „nośniki energii +6,1%”. |
| 9 | Usługi ogółem (Usługi) | inflacja usług vs towarów | A (GUS) | ★★★ | Pensje → ceny usług (graniczne) | Ważny, medialnie nagłaśniany temat. |
| 10 | Zdrowie prywatne (Usługi) | inflacja w grupie zdrowie | A (GUS) | ★★ | Zdrowie → Inflacja (składnik) | |
| 11 | Restauracje i hotele (Usługi) | inflacja w grupie | A (GUS) | ★★ | Restauracje → Inflacja (składnik) | |
| 12 | Usługi osobiste (fryzjer itp.) (Usługi) | średnia cena usługi | A/B (GUS) | ★★ | Usługi → Inflacja (składnik) | Konkret zrozumiały dla laika. |
| 13 | Auta używane (Auta) | rejestracje, ceny segmentów | B/C | ★★ | Paliwo → koszt użytkowania auta; Ceny aut → rata kredytu auto | Źródła cen prywatne. |
| 14 | Auta nowe (Auta) | rejestracje | B (CEPiK/Samar) | ★ | | |
| 15 | Ubezpieczenie OC (Auta) | średnia składka | brak źródła | ★★ | | **Najpierw znaleźć źródło** (KNF/UFG). |
| 16 | Lokaty i oszczędności (Kredyty) | oprocentowanie nowych lokat | A (NBP MIR) | ★★ | Stopy NBP → oprocentowanie lokat | |
| 17 | Obligacje detaliczne (Kredyty) | oprocentowanie obligacji indeksowanych | B (MF) | ★★ | Inflacja → oprocentowanie obligacji indeksowanych | Związek wynika z warunków emisji. |
| 18 | Emerytury (Praca i podatki) | waloryzacja | B (ZUS) | ★★★ | Inflacja → waloryzacja emerytur | Związek z ustawy, wyraźnie bezpośredni. |
| 19 | Płaca minimalna (Praca i podatki) | kwota | A | ★★ | Płaca minimalna → Pensje | |
| 20 | Podatki i składki (Praca i podatki) | klin podatkowy | B | ★★ | | Wymaga ostrożnego opisu. |

Węzły wspólne istniejące: Stacja paliw, Sklep i ceny (Inflacja), Bank i stopy, Pensje i portfel, Studnia ropy.

## 7. Fale wdrożenia (kolejność dla PO)

Każdy węzeł przechodzi **Definition of Done** (patrz `docs/map-backlog.md`): źródło poziomu 1 (albo uczciwie oznaczone), twierdzenia w `claims.json`, hasła w glosariuszu, krawędzie z testem sensu, test w przeglądarce, zrzuty, PR.

| Fala | Cel | Zakres | Warunek startu |
|---|---|---|---|
| **M0** | Zależności i interakcja dla **istniejących 13 węzłów** | `links.json`, walidacja, `LinkLayer`, `DepsBlock`, podświetlanie, testy | Decyzja o widokach (pkt 4) |
| **M1** | Dom i kredyty | #3, #4, #5, #16, #7; nowy widok „Codzienność” | Licencje i format NBP (MIR, ceny mieszkań) |
| **M2** | Jedzenie | #1, #2 | Dostęp do cen detalicznych GUS (API lub tabele) |
| **M3** | Usługi i energia w domu | #9, #10, #11, #12, #8 | Potwierdzone liczby w komunikatach GUS |
| **M4** | Auta, oszczędności, praca i podatki | #13–#15, #17–#20, #6 | Źródło dla OC; decyzja o tonie dla pożyczek |

Dlaczego tak: M0 jest warunkiem wszystkiego i odpowiada wprost na Twoją prośbę. M1 i M2 mają najlepsze dane pierwotne (NBP, GUS) i największą wartość dla laika. M4 zostawia tematy z gorszymi danymi lub wrażliwe na koniec, gdy proces będzie wypracowany.

## 8. Ryzyka i zasady

- **Czytelność:** przy ok. 35 węzłach mapa musi być czytelna na telefonie: dwa widoki, wygaszanie, limit krawędzi.
- **Koszt na węzeł jest duży:** każdy węzeł to ok. 15 pól treści, źródła, twierdzenia, krawędzie, definicje i testy. Dlatego fale są małe (3–5 węzłów) i każdy węzeł jest oddzielnym zadaniem z checklistą.
- **Dane prywatne (poziom 3)** w autach i najmie oznaczamy uczciwie jako wtórne, tak jak w kalendarzu (pierwotne/wtórne).
- **Ton się nie zmienia.** Pożyczki pozabankowe, zdrowie i ceny jedzenia opisujemy neutralnie, z kierunkiem, skalą i kontekstem. Trudna liczba nie jest powodem pominięcia tematu (D19).
- **Bez przewidywania i porad.** Zależność mówi, jak zmiana A przenosi się na B, nie co zrobić ani co się stanie.
- **Własne wskaźniki** (np. rata przykładowa) tylko jawnie wyliczone, ze wzorem i etykietą (D15).

## 9. Decyzje właściciela

1. **Widoki:** osobny widok „Codzienność” obok „Świat” (rekomendacja) czy wszystko na jednej mapie z warstwami?
2. **Kolejność:** M0, potem M1 (Dom i kredyty), potem M2 (Jedzenie)? Czy chcesz inną kolejność (np. Jedzenie przed kredytami)?
3. **Tematy wrażliwe:** pożyczki pozabankowe i zdrowie wchodzą do planu z neutralnym tonem (zgodnie z D19). Potwierdzasz?
4. **PO:** uruchamiany ręcznie na Twoje polecenie (rekomendacja na start, żeby oszczędzać limit) czy harmonogram w chmurze, np. raz na tydzień?

## 10. Do sprawdzenia przed startem odpowiednich pozycji

- GUS: lista produktów i usług w cenach detalicznych, dostęp przez API, częstotliwość i licencja.
- NBP: format plików MIR (nowe umowy), licencja, ceny mieszkań w pliku maszynowym.
- MRiRW: czy biuletyny ZSRIR mają dane maszynowe poza PDF.
- Ubezpieczenie OC: pierwotne źródło średniej składki.
- Potwierdzić liczby medialne z pkt 5 w komunikatach GUS i w tabelach NBP.
