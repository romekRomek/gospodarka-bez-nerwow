# Nowe tematy danych: nieruchomości, ziemia, woda i deszcz, oraz inne dane, które uświadamiają

Status: **propozycja do decyzji** (25.11.2026). Uzupełnia `docs/expansion-ideas.md` i `docs/data-sources-architecture.md`. Research własny: wyszukiwania w sieci, bez pobierania samych zbiorów danych. Liczby z przeglądu są **orientacyjne** i pochodzą w części z mediów, a nie ze źródeł pierwotnych. Przed wpisaniem do aplikacji każda przechodzi normalną ścieżkę (źródło poziomu 1, dowód, wskaźnik pewności).

## 1. Co wiemy o dostępności danych

| Temat | Źródło pierwotne | Dostęp | Częstotliwość | Co potwierdziło wyszukiwanie |
|---|---|---|---|---|
| **Ceny mieszkań** | NBP: „Informacja o cenach mieszkań i sytuacji na rynku nieruchomości” | PDF i zestawy danych na nbp.pl, bez API (do sprawdzenia) | kwartalnie | Dane dla 17 największych miast, rynek pierwotny i wtórny, ceny ofertowe i transakcyjne. Transakcyjne pochodzą z próby deweloperów i z rejestru cen nieruchomości prowadzonego przez starostów (akty notarialne). Raport za III kw. 2025 jest [dostępny jako PDF](https://nbp.pl/wp-content/uploads/2025/12/Informacja-o-cenach-mieszkan-w-III-2025.pdf). |
| **Wartość i liczba transakcji nieruchomości** | GUS na podstawie Rejestru Cen Nieruchomości (GUGiK) | publikacje GUS, RCN | kwartalnie, rocznie | Wg doniesień medialnych wartość transakcji w 2025 r. wzrosła o 3,7% r/r do 270 mld zł ([omówienie](https://comparic.pl/rynek-nieruchomosci-w-polsce-wart-270-mld-zl-gus-pokazuje-dane-za-2025-rok/)). Źródło wtórne, do sprawdzenia w GUS. |
| **Ceny ziemi rolnej** | GUS (Rejestr Cen Nieruchomości) | publikacje GUS | półrocznie | Wg mediów średnio 69 752 zł za hektar w I poł. 2025 r., największe wojewódzkie zróżnicowanie (Wielkopolska ok. 97 tys. zł) ([omówienie](https://wiescirolnicze.pl/analizy-rynkowe/tyle-kosztuje-dzis-hektar-ziemi-w-polsce-aktualne-ceny-2025,20956)). Źródło wtórne, do sprawdzenia w GUS. |
| **Opady, stany wód, ostrzeżenia** | IMGW-PIB | **publiczne API bez klucza** (JSON, XML, CSV): dane synoptyczne i meteorologiczne, hydrologiczne, ostrzeżenia. Dokumentacja i [regulamin](https://danepubliczne.imgw.pl/regulations) na danepubliczne.imgw.pl. Wymagana akceptacja regulaminu, więc **licencję trzeba przeczytać przed użyciem**. | bieżąco (obserwacje) | Zakres danych potwierdzony przez opisy bibliotek i dokumentację ([przegląd](https://apis.io/providers/imgw-pl/)). Nie sprawdzałem limitów zapytań ani CORS. |
| **Zasoby wodne** | GUS (raport SDG „Polska na drodze zrównoważonego rozwoju”) | publikacja roczna | rocznie | Wg doniesień odnawialne zasoby wody słodkiej na mieszkańca w latach 2015–2023 wynosiły 1,1–1,6 tys. m³ rocznie, poniżej progu bezpieczeństwa wodnego ONZ (1,7 tys. m³); Polska ok. 24. miejsce w UE ([omówienie](https://www.bankier.pl/wiadomosc/Kryzys-wodny-w-Polsce-staje-sie-faktem-Ponizej-progu-bezpieczenstwa-ONZ-9124733.html)). Źródło wtórne, **do sprawdzenia w raporcie GUS, w tym definicji wskaźnika**. |
| **Jakość powietrza** | GIOŚ | publiczne API (jako pierwsze w projekcie „Dane 3.0”) | bieżąco | Istnienie API potwierdzone ([przegląd](https://antyweb.pl/jak-darmowe-dane-hvd-moga-napedzic-twoj-projekt)). Szczegóły niesprawdzone. |
| **Bank Danych Lokalnych** | GUS | API GUS (nowe, w modernizacji) | zależnie od wskaźnika | Tysiące wskaźników od 1995 r., także na poziomie gmin i powiatów ([API GUS](https://api.stat.gov.pl/?lang=en)). To naturalna baza dla porównań regionalnych. |

## 2. Jak to się łączy z gospodarką (test sensu, D17)

Reguła z `docs/verification.md`: powiązanie musi dać się uzasadnić jednym zdaniem, bez dodatkowych założeń. Ocena wstępna:

| Temat | Powiązanie z istniejącymi węzłami | Wynik |
|---|---|---|
| Ceny mieszkań ↔ stopy i raty kredytów | „Stopy NBP” (węzeł `bank`): kredyt hipoteczny zależy od stóp | **bezpośrednie** |
| Ceny mieszkań ↔ płace | „Pensje” (węzeł `worker`): relacja ceny do wynagrodzeń | **bezpośrednie** (ale to wskaźnik pochodny, patrz D15 i pkt 4) |
| Ceny ziemi rolnej ↔ rolnictwo, żywność | żywność w koszyku inflacji (`shop`) | **graniczne**: ziemia rolna wpływa na koszty gospodarstw, a dopiero potem na ceny żywności; to więcej niż jedno przejście |
| Susza, opady ↔ ceny żywności | `shop` | **graniczne**: susza → plony → ceny, dwa przejścia i zmienność po drodze. Wolno pokazać jako „co obserwować”, nie jako przyczynę. |
| Poziom wody w rzekach ↔ energia, transport | brak węzła | **naciągane** w obecnej mapie; potrzebny osobny kontekst (np. chłodzenie elektrowni, żegluga) i sprawdzone źródła |
| Zasoby wodne na mieszkańca | osobny temat (środowisko), bez bezpośredniego węzła | **wypełniacz**, jeśli tylko liczba; wartościowe, jeśli ma kontekst „jak to się mierzy i co oznacza próg” |

Wniosek: **nieruchomości mają bezpośrednie powiązania z naszą mapą**, woda i deszcz wymagają **osobnej, jawnie oznaczonej grupy tematów** (np. „Woda i pogoda”) z własnym uzasadnieniem, a nie wciskania w łańcuch cen. To zgodne z zasadą „opis świata, nie ocena czytelnika”.

## 3. Propozycje nowych tematów

Ocena: wartość dla celu „rozumieć gospodarkę” (★ do ★★★), wysiłek (S/M/L), ryzyko dla zasad.

| # | Temat | Co pokazujemy | Źródła | Wartość | Wysiłek | Ryzyko i uwagi |
|---|---|---|---|---|---|---|
| N1 | **Mieszkania: cena i rata** | cena m² (rynek pierwotny i wtórny, transakcyjna), zmiana rok do roku, miasto vs średnia, wykres kilkulat | NBP | ★★★ | M | Dane kwartalne ze stałym opóźnieniem, więc „aktualność” będzie wyraźnie niższa niż w paliwach. Ceny ofertowe i transakcyjne to różne miary, jawny podpis (jak w D14). |
| N2 | **Ile pensji na metr?** | wskaźnik pochodny: cena m² ÷ przeciętne wynagrodzenie, z pełnym wzorem i dwoma źródłami | NBP, GUS | ★★★ | M | Wskaźnik pochodny, więc zasada D15 (wyraźna etykieta, wzór, bez nazywania „oficjalnym”). Uwaga na różnice w definicji „pensji” (brutto, przeciętne vs mediana). |
| N3 | **Ziemia rolna** | cena hektara, różnice między województwami, kierunek r/r | GUS | ★★ | S–M | Dane półroczne. Powiązanie z jedzeniem tylko jako „spójrz też na” z datą, bez przyczynowości. |
| N4 | **Woda w rzekach i opady** | bieżące stany wybranych rzek i opady vs wielolecie, ostrzeżenia | IMGW (API) | ★★ | M–L | Dane bieżące wymagają harmonogramu odświeżania (workflow) i oznaczenia aktualności. Sprawdzić CORS, regulamin i limity. To pierwszy temat o **danych odświeżanych automatycznie**, co dobrze pasuje do wizji „samorozwijającej się” aplikacji. |
| N5 | **Woda na mieszkańca** | jak się mierzy, ile jest w Polsce na tle UE, co oznacza próg ONZ | GUS, Eurostat | ★★ | M | Wysokie ryzyko wrażenia alarmu. Musi mieć kontekst definicji, zakresu lat i niepewności. Bez słów „kryzys” lub „katastrofa” (zasada 5). |
| N6 | **Susza w skali roku** | suma opadów i miesiące poniżej normy, mapa lub krótka seria | IMGW | ★★ | M | Powiązanie z cenami żywności tylko jako obserwacja, nie przyczyna. |
| N7 | **Jakość powietrza** | stan pyłów w regionie (opcjonalnie), roczne średnie | GIOŚ | ★★ | M | Powiązanie z gospodarką jest pośrednie (ogrzewanie, koszty zdrowia), więc ryzyko „naciągane”. Warto dopiero po N1–N4. |

## 4. Inne dane, które mogłyby uświadamiać (niesprawdzone w tym przeglądzie)

Poniższe to **propozycje z własnej wiedzy, bez weryfikacji dostępności**. Każda wymaga osobnego krótkiego sprawdzenia źródła przed decyzją.

- **Struktura wydatków gospodarstw domowych** (GUS, badanie budżetów): na co wydajemy i jak to się zmienia, dobre jako wprowadzenie do „Twojej inflacji” z `expansion-ideas.md` (#8).
- **Wskaźnik ceny do dochodu w UE** (Eurostat): Polska na tle sąsiadów, z jasną definicją.
- **Energia: miks i ceny hurtowe** (operator sieci, URE): skąd prąd i dlaczego rachunki się zmieniają. Powiązanie z węzłem energii jest bezpośrednie.
- **Demografia i migracje** (GUS, BDL): liczba ludności, wiek, saldo migracji. Powiązanie z rynkiem pracy (`worker`) i ukraine; temat wrażliwy, bez ocen.
- **Dane regionalne („Twoja okolica”)**: wynagrodzenia, bezrobocie, ceny mieszkań na poziomie powiatu, z BDL. Wartościowe, ale wymaga uważnego ujęcia, żeby nie oceniać miejsc ani ludzi.
- **Dług gospodarstw domowych i raty kredytów** (NBP): relacja do dochodów, kierunek zmian.

## 5. Ograniczenia dostępu do danych i ryzyka

- **Aktualność nieruchomości jest strukturalnie niska** (kwartały, publikacja z opóźnieniem miesięcy). Wskaźnik pewności „Aktualność” musi to uczciwie pokazywać, a ton ma być „kontekst”, nie „bieżący alarm”.
- **Różne miary tej samej rzeczy** (ceny ofertowe vs transakcyjne, rynek pierwotny vs wtórny, średnia vs mediana). Każdy kafelek podpisujemy tak jak w D14.
- **Woda i pogoda w mediach często służą emocjom.** Tu szczególnie przydają się nasze techniki („jak czytać liczbę”, ramowanie): jedna liczba o suszy może brzmieć jak katastrofa albo jak norma, zależnie od okresu odniesienia. To dobry materiał na parodie i „dwa nagłówki”.
- **Licencje**: IMGW wymaga akceptacji regulaminu. GUS, NBP i Eurostat zwykle zezwalają na ponowne wykorzystanie z podaniem źródła, ale **trzeba to potwierdzić w zadaniu badawczym**, a nie zakładać.
- **Pobieranie maszynowe**: część źródeł (jak GUS i NBP w poprzednich próbach) blokowała boty. Dla nieruchomości realistyczny jest początkowo tryb ręcznej aktualizacji z dowodem z kwartalnego PDF, a dla IMGW tryb automatyczny.

## 6. Rekomendacja

1. **Zacząć od N1 + N2 (mieszkania)** jako nowa grupa „Dom i pieniądze”: bezpośrednio powiązana ze stopami i pensjami, wartość wysoka, dane z jednego wiarygodnego źródła (NBP). Jeden węzeł lub dwa, bez nowych komponentów.
2. **N4 (IMGW) jako pilotaż automatycznych danych**, osobno od mapy łańcucha cen, w grupie „Woda i pogoda”. Wcześniej krótkie zadanie badawcze: regulamin, CORS, limity, struktura odpowiedzi.
3. **N3 (ziemia)** dołączyć do grupy „Dom i pieniądze” po sprawdzeniu danych GUS.
4. **N5, N6, N7** po N4, gdy będzie wiadomo, jak automatyczne dane sprawdzają się w praktyce.
5. Z pkt 4 zacząć od **struktury wydatków gospodarstw domowych**, bo łączy się z planowanym kalkulatorem inflacji.

## 7. Do Twojej decyzji

1. Czy wprowadzamy **nową grupę tematów poza łańcuchem cen** („Dom i pieniądze”, „Woda i pogoda”)? To wymaga decyzji o nawigacji, bo obecny model to jedna mapa z kategoriami cen. Rekomendacja: tak, jako osobne grupy w nawigacji.
2. Czy temat **wody i suszy** ma być częścią strony, czy tylko „na później”? Ryzyko tonu alarmowego jest tu najwyższe, a korzyść edukacyjna realna (okres odniesienia, definicje).
3. Czy **dane automatyczne z IMGW** to dobry pilotaż dla „samorozwijającej się” aplikacji (kosztem większej złożoności i konserwacji)?

## 8. Do sprawdzenia, zanim zaczniemy

- NBP: czy dane (nie tylko PDF) są dostępne w pliku maszynowym i na jakiej licencji; najnowszy kwartał dostępny na 25.11.2026 (znalazłem raport za III kw. 2025 i wzmiankę o I kw. 2026).
- GUS: dokładne definicje cen ziemi rolnej (grunty orne, łąki, klasy), źródło pierwotne liczby 69 752 zł.
- GUS (raport SDG): pełna definicja wskaźnika zasobów wodnych na mieszkańca i metoda liczenia.
- IMGW: regulamin, limity, format i stabilność odpowiedzi API, możliwość pobierania z przeglądarki (CORS) lub tylko w budowie.
- Każda liczba z tego dokumentu przed użyciem w aplikacji przechodzi `verify_claims.py` i ścieżkę poziomów źródeł.
