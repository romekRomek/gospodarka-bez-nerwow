# Research: tematy, które warto przybliżyć, i dane, które to umożliwiają

Status: **propozycja do decyzji** (26.11.2026). Research własny: wyszukiwania w sieci i stan repozytorium; nie pobierałem jeszcze samych zbiorów danych. **Liczby z mediów są orientacyjne** i oznaczone „do potwierdzenia w źródle pierwotnym” (jeden przykład niespójności jest w pkt 4, A1). Uzupełnia `docs/roadmap.md`, `docs/data-topics.md` i `docs/map-expansion.md`.

## 1. Cel i kryterium wyboru

Cel: pokazać odbiorcom to, co **poprawia świadomość i jakość życia**, a nie tylko to, co głośne. Wybierałem tematy według jednego pytania: *„czy zrozumienie tego realnie chroni pieniądze, ułatwia decyzję albo odbiera siłę dezinformacji?”* Trzy rodzaje tematów, o które prosiłeś:

- **A. Tematy polaryzujące**: często zniekształcane w politycznych narracjach z różnych stron, a fakty da się rozstrzygnąć danymi publicznymi.
- **B. „Trudne bez wprawy, a proste”**: umiejętność czytania liczb. Nie wymaga wykształcenia, tylko jednego wyjaśnienia. Tu leży duża część dezinformacji, bo ta sama liczba daje różne wrażenie zależnie od miary.
- **C. Praktyczne dla codzienności**: rachunki, kredyty, oszustwa, emerytura.

**Skala skuteczności dezinformacji:** wg raportu „Dezinformacja oczami Polaków” (Fundacja Digital Poland i Demagog) 77% badanych deklaruje kontakt z fałszywymi informacjami, a prawie co piąta osoba jest na nie szczególnie podatna ([Demagog](https://demagog.org.pl/analizy_i_raporty/w-jakie-fake-newsy-wierzymy-nowa-edycja-raportu-dezinformacja-oczami-polakow/)). PAP/FakeHunter opisuje też narracje o gospodarce jako cel dezinformacji ([FakeHunter](https://fake-hunter.pap.pl/en/node/20)). **Nie przypisujemy pochodzenia** takich narracji (zasada 3), skupiamy się na liczbach.

## 2. Zasady neutralności (tematy polityczne wymagają dodatkowych bezpieczników)

Dotyczą klasy A i zostają dopisane do zasad redakcyjnych po akceptacji:

1. **Tylko dane pierwotne i jawne definicje** (GUS, Eurostat, MF, ZUS, NBP, OECD, Komisja Europejska). Źródła wtórne tylko jako wskazówka, jak w kalendarzu: oznaczone.
2. **Test dwustronności źródła:** czy osoby o różnych poglądach uznałyby to źródło za rzetelne? Jeśli nie, szukamy innego albo pokazujemy wiele.
3. **Stały schemat każdego tematu:** *co dane mówią* → *czego nie mówią* → *typowe uproszczenia* (opisane jako schematy myślowe, **bez nazw osób, partii i serwisów**) → *jak sprawdzić samemu*. Typowe uproszczenia pokazujemy **symetrycznie** (po jednym z każdej strony, gdy istnieją).
4. **Fakt, nie wartość.** Rozstrzygamy „ile”, nie „czy to dobrze”. Nie oceniamy programów, polityków ani partii, nie mówimy, co zrobić (zasada 6).
5. **Test lustrzany** (nowa rubryka dla agenta `redaktor`): czy tekst brzmiałby tak samo i z tą samą ostrożnością, gdyby zamienić stronę sporu? Jeśli nie, przepisać lub eskalować.
6. **Niepewność wprost:** dane mogą być rewidowane, mają okres i definicję; przy prognozach (np. ZUS) piszemy „symulacja instytucji”, nie „prognoza strony”.
7. **Weryfikacja kodem** jak dla reszty (cytaty ze źródeł, `verify_claims.py`); temat bez źródła pierwotnego nie wchodzi.

## 3. Dostępne publiczne dane (katalog)

Oznaczenie: ✓ potwierdzone w tym przeglądzie, ○ znane, **do sprawdzenia** (dostęp, licencja, format).

| Źródło | Co daje | Dostęp | Uwagi |
|---|---|---|---|
| **GUS**: BDL, struktura wynagrodzeń, budżety gospodarstw domowych, BAEL (rynek pracy), ceny | płace (przeciętne i **mediana**), nierówności, wydatki rodzin, bezrobocie wg metodologii badania, ceny detaliczne | ✓ strony i API BDL; część w publikacjach | Mediana wynagrodzeń publikowana okresowo; GUS sam komentował spór o „średnią płacę” ([komentarz GUS](https://stat.gov.pl/dla-mediow/komunikaty-prasowe/komentarz-do-artykulu-klamstwo-sredniej-placy-autorstwa-joanny-solskiej-polityka-z-11-12-2024-r-,137,1.html)) |
| **Ministerstwo Finansów** | budżet państwa, dług, deficyt, **transfery Polska–UE**, statystyki podatkowe | ✓ gov.pl ([Transfery Polska–UE](https://www.gov.pl/web/finanse/transfery-polska-ue-unia-europejska)) | Liczby w wynikach wyszukiwania są niespójne (patrz A1), więc tylko z pierwotnego dokumentu |
| **ZUS** | świadczenia, składki, **cudzoziemcy w systemie**, symulacje stopy zastąpienia | ✓ publikacje statystyczne | Dane o cudzoziemcach: patrz A2 |
| **Eurostat** | AROPE (zagrożenie ubóstwem), Gini, PKB per capita i PPP, finanse publiczne (COFOG), HICP | ✓ API/pliki | Wg Eurostatu (przez media) Polska miała w 2025 r. 16,0% zagrożonych ubóstwem lub wykluczeniem, czwarte najniższe w UE ([Bankier](https://www.bankier.pl/wiadomosc/Eurostat-co-piaty-Unijczyk-zagrozony-bieda-lub-wykluczeniem-spolecznym-9128612.html)); do potwierdzenia w Eurostacie |
| **OECD** | klin podatkowy (Taxing Wages), emerytury (Pensions at a Glance), edukacja finansowa | ✓ ([Taxing Wages 2025, Polska](https://www.oecd.org/en/publications/taxing-wages-2025-country-notes_d1a67ac1-en/poland_91763399-en.html)) | |
| **NBP** | stopy, oprocentowanie kredytów (MIR), kursy, ceny mieszkań | ✓ (patrz `docs/data-topics.md`) | API kursów NBP: ○ do sprawdzenia |
| **Komisja Europejska / Mapa Dotacji UE** | budżet UE, projekty dofinansowane | ○ do sprawdzenia | Pozwala sprawdzić „na co poszły fundusze” lokalnie |
| **CERT Polska, KNF, UOKiK, Policja** | listy ostrzeżeń przed fałszywymi stronami i podmiotami, raporty o oszustwach | ✓ ([KNF: raport CSIRT](https://cebrf.knf.gov.pl/images/Raporty/Raport_Roczny_CSIRT_KNF_97516.pdf), [poradnik gov.pl](https://www.gov.pl/web/cyfryzacja/phishing-i-falszywe-inwestycje-sprawdz-jak-nie-dac-sie-oszukac)) | Dane o kwotach strat w Polsce słabo dostępne (patrz C3) |
| **URE** | taryfy energii, składniki rachunku | ✓ ([omówienie rachunków](https://samorzad.gov.pl/web/gmina-sawin/rachunek-za-prad-pod-kontrola-konsumenta---za-co-i-komu-placimy)) | |
| **NIK** | kontrole wydatków publicznych | ○ | Do rozważenia przy tematach „na co idą pieniądze” |
| **Organizacje fact-checkingowe** (Demagog, FakeHunter PAP, Konkret24, OKO.press) | gotowe sprawdzenia konkretnych twierdzeń | ✓ | Poziom 2 w rejestrze; **nie wskazują manipulatorów**, więc cytujemy sprawdzenia, nie oceny osób |

## 4. Tematy (z oceną)

Wpływ na świadomość i życie: ★ niski, ★★ średni, ★★★ wysoki. Dane: **A** pierwotne i dostępne, **B** pierwotne ręczne, **C** słabe lub sporne. Ryzyko polityczne: n (niskie), ś (średnie), w (wysokie). „Typowe uproszczenia” to **schematy myślowe**, nie cytaty.

### A. Tematy polaryzujące

| # | Temat | Wpływ | Dane | Ryz. | Dane rozstrzygają… | Typowe uproszczenia (symetrycznie) | Czego dane nie mówią |
|---|---|---|---|---|---|---|---|
| A1 | **Fundusze UE: wpłaty i wpływy** | ★★ | A | ś | saldo netto wg MF (wpłaty vs transfery do Polski). Wg wyników: 2024 r. ok. 10,1 mld euro wpływów; składka podawana jako 7,6 **albo** 8,4 mld, saldo ok. 1,7 mld ([PAP](https://www.pap.pl/aktualnosci/niemcy-nadal-najwiekszym-platnikiem-netto-do-ue-jak-wypada-polska)) | „Płacimy do UE więcej, niż dostajemy” / „Dostajemy darmowe pieniądze” | efektów handlu i rynku wspólnego, wartości wspólnych zasad. **Liczby niespójne w wynikach: pokazuje, dlaczego bierzemy tylko dokument MF** |
| A2 | **Migracja a ZUS i budżet** | ★★★ | A | **w** | ZUS: ok. 1,29 mln ubezpieczonych cudzoziemców (koniec 2025), 21,5 mld zł składek (5,7% wpływów), 288,5 mln zł wypłat emerytur (media o danych ZUS: [Money.pl](https://www.money.pl/emerytury/zus-pokazal-najnowsze-dane-cudzoziemcy-wplacili-miliardy-7327807579433056a.html)) | „Wpłacają kilkadziesiąt razy więcej, niż wyciągają” / „Obciążają system” | **pełnego bilansu fiskalnego** (podatki, wydatki poza ZUS jak zdrowie i świadczenia rodzinne), przyszłych zobowiązań, skutków dla płac. Dane ZUS to tylko jedna część rachunku |
| A3 | **Dług i deficyt** | ★★★ | A | ś | dług sektora instytucji rządowych i samorządowych (EDP) ok. 55,6% PKB na koniec 2024 (MF/GUS); deficyt budżetu państwa to **nie** deficyt sektora finansów publicznych | „Żyjemy na kredyt, bankructwo” / „Dług jest mały, nie ma problemu” | kosztu obsługi długu w przyszłości, struktury wierzycieli, odpowiedzi na pytanie „ile to za dużo” |
| A4 | **Podatki, klin i świadczenia** | ★★★ | A | w | klin podatkowy dla osoby samotnej przy średniej płacy ok. 35%, o ok. 21 pp niższy dla rodzin (OECD, wg [omówienia](https://xyz.pl/?p=196917)); rozkład PIT wg MF | „Państwo zabiera większość” / „Podatki są niskie” | co za te podatki dostajemy, czy poziom jest „właściwy” |
| A5 | **Emerytury** | ★★★ | A | ś | stopa zastąpienia ok. 54% (2026), symulacja ZUS: spadek do ok. 43% (2040), 34% (2050), 24,5% (2080) (wg [omówienia](https://direct.money.pl/artykuly/porady/zus-prognozuje-emerytury-w-2080-r-przecietne-swiadczenie-to-tylko-24,5-proc-pensji)); średnia emerytura po waloryzacji 2026 ok. 4,4–4,5 tys. zł brutto (**dwa źródła podają różne liczby**) | „System się zawali” / „Wszystko w porządku” | przyszłych zmian przepisów, indywidualnej sytuacji |
| A6 | **Energia, ceny prądu, klimat** | ★★★ | A | w | z czego składa się rachunek (energia, dystrybucja, opłaty systemowe), taryfa URE 2026 średnio ok. 495 zł/MWh netto za energię, a droższa dystrybucja (ok. +7%) | „To wina polityki klimatycznej” / „Wszystko przez rynek” | ile z rachunku przypada na jedną przyczynę, co się stanie dalej |
| A7 | **Płace, płaca minimalna, rynek pracy** | ★★★ | A | ś | **mediana** wynagrodzeń 7 447 zł vs przeciętna 9 353 zł (styczeń 2026, o ok. 20% mniej; wg GUS przez media), bezrobocie rejestrowane a z badania BAEL | „Średnia płaca to ściema” / „Zarobki rosną, jest świetnie” | rozkładu płac w branżach, kosztów życia |
| A8 | **Rankingi i porównania** | ★★ | A | ś | PKB nominalnie vs PPP vs per capita; kolejność zależy od miary. Przykład sprawdzenia: ([Demagog](https://demagog.org.pl/fake_news/czy-pozycja-polskiej-gospodarki-spadla-w-rankingach-sprawdzamy-fake-newsa/)) | „Jesteśmy w czołówce” / „Spadliśmy w rankingach” | |
| A9 | **Inflacja, ceny i marże** | ★★★ | A | ś | koszyk i wagi GUS (12–13 grup), różnice między inflacją średnią a osobistą; udział usług vs towarów | „Ceny rosną bez końca” / „Inflacja już nie istnieje” | Twojego własnego koszyka |
| A10 | **Euro i złoty** | ★★ | B | w | inflacja, stopy i kursy w strefie euro vs w Polsce (Eurostat, NBP) | „Euro to drożyzna” / „Euro rozwiąże problemy” | decyzji suwerennych, wartości politycznych |

### B. „Trudne bez wprawy, a proste”: czytanie liczb

Każdy z tych tematów to jedno wyjaśnienie plus dwa przykłady **z naszych własnych danych** (np. „PKB 3,6% po wyrównaniu sezonowym a 3,5% bez”, błąd, który sami popełniliśmy i poprawiliśmy).

| # | Temat | Wpływ | Dane | Ryz. | Jedno zdanie | Dlaczego dezinformacja to wykorzystuje |
|---|---|---|---|---|---|---|
| B1 | **Średnia vs mediana** | ★★★ | A | ś | Mediana to wartość środkowa, średnią podnoszą najwyższe zarobki | Ta sama płaca „rośnie” albo „jest iluzją” zależnie od miary |
| B2 | **Realnie vs nominalnie** | ★★★ | A | n | Realnie = po odjęciu inflacji | Płaca „w górę o 6%” bywa realnie wzrostem o 2% |
| B3 | **„Inflacja spadła” ≠ „ceny spadły”** | ★★★ | A | n | Niższa inflacja to wolniejszy wzrost cen, nie ich spadek | Najczęstsze nieporozumienie w komentarzach o gospodarce |
| B4 | **Procenty vs punkty procentowe; r/r, m/m, kw/kw; wyrównanie sezonowe** | ★★★ | A | n | Nazwa miary decyduje o znaczeniu liczby | Pomyłka w jednej jednostce zmienia sens nagłówka |
| B5 | **% PKB i PKB na osobę (PPP)** | ★★ | A | n | Dzielimy przez PKB, żeby porównać kraje różnej wielkości | „Dług 2 bln zł” brzmi inaczej niż „55,6% PKB” |
| B6 | **Szybki szacunek i rewizje** | ★★ | A | n | Pierwsze dane są wstępne i bywają zmieniane | Nagłówek o „rekordzie” z szybkiego szacunku, potem cicha korekta |
| B7 | **Wykres: oś, okres, baza** | ★★★ | A | ś | Ta sama seria wygląda inaczej przy ucięciu osi i innym okresie | „Efekt bazy”, wybór okresu startowego |
| B8 | **Procent składany, RRSO, oprocentowanie** | ★★★ | A | n | Odsetki liczy się od salda, RRSO to pełny roczny koszt | Reklamy „0% prowizji” bez RRSO |

### C. Praktyczne dla jakości życia

| # | Temat | Wpływ | Dane | Ryz. | Co jest dostępne | Uwagi |
|---|---|---|---|---|---|---|
| **C3** | **Oszustwa finansowe i phishing** | ★★★ | A/B | n | CERT Orange zablokował w ubiegłym roku ponad 40 tys. stron z fałszywymi inwestycjami, ok. 70% wszystkich blokowanych stron; na Liście Ostrzeżeń CERT Polska 160,6 tys. adresów w I–IX 2025 (wg [Android.com.pl](https://android.com.pl/tech/1038970-raport-cert-orange-polska-2025/), [parkiet](https://www.parkiet.com/technologie/art44119121-fbi-i-cert-polska-alarmuja-internetowi-oszusci-kradna-coraz-wiecej)); lista ostrzeżeń publicznych KNF | **Najwyższy wpływ na jakość życia i zero ryzyka politycznego.** Brak wiarygodnych kwot strat w Polsce w dostępnych raportach; nie podajemy ich |
| C2 | **Kredyt i pożyczki: RRSO, stałe vs zmienne, limity kosztów** | ★★★ | A | n | NBP MIR, przepisy o kredycie konsumenckim (limit kosztów pozaodsetkowych), rejestr KNF | Łączy się z M1 na mapie |
| C1 | **Rachunek za prąd: z czego się składa** | ★★★ | A | ś | URE, taryfy | Konflikt narracji bierze się z tego, że cena energii spada, a opłaty rosną (A6) |
| C5 | **Emerytura: jak się liczy i co mówi konto w ZUS** | ★★★ | A | ś | wzór: kapitał ÷ średnie dalsze trwanie życia; stopa zastąpienia | Opis mechanizmu, **nie porada** |
| C4 | **Oszczędności a inflacja** (lokata, obligacje indeksowane) | ★★ | A | n | NBP MIR, MF (obligacje) | Opis, bez rekomendacji produktów (zasada 6) |
| C9 | **Budżet domowy: na co idą pieniądze rodzin** | ★★ | A | n | GUS budżety gospodarstw domowych | Baza dla „Twojej inflacji” |
| C6 | Prawa konsumenta (14 dni, reklamacje) | ★★ | A | n | UOKiK, kodeks | Poza ekonomią, ale mocno praktyczne |
| C8 | Zdrowie: wydatki, NFZ | ★★ | B | ś | NFZ, GUS | Wrażliwy temat, neutralny ton (D19) |
| C7 | Mieszkania i najem | ★★★ | B | ś | NBP | Już w planie (M1) |

## 5. Priorytety (wpływ na świadomość i jakość życia na pierwszym miejscu)

Ocena łączy wpływ (najważniejszy), dostępność danych i ryzyko polityczne. **P1** startuje najpierw, bo bezpiecznie i wysoko wpływa.

| Priorytet | Tematy | Uzasadnienie |
|---|---|---|
| **P1** | **C3** oszustwa finansowe; **B2, B3, B4** (realnie, „inflacja spadła”, procenty i punkty); **B1** (średnia a mediana); **B8 + C2** (RRSO, kredyt); **C1** (rachunek za prąd) | Najwyższy wpływ na życie lub na rozumienie wszystkich innych liczb, dane pierwotne dostępne, ryzyko polityczne niskie lub kontrolowalne. Każdy temat da się napisać na istniejących danych i źródłach |
| **P2** | **A3** (dług i deficyt, węzeł już istnieje), **A9** (inflacja i koszyk), **A5 + C5** (emerytura), **A1** (fundusze UE), **A4** (podatki i klin), **A7** (płace i rynek pracy), **B5–B7**, **C4**, **C9** | Wysoki wpływ, ale częściej polityczny albo wymaga starannej weryfikacji (A1 pokazało niespójność liczb) |
| **P3** | **A2** (migracja), **A10** (euro), **A8** (rankingi), **C6, C7, C8** | A2 i A10 mają najwyższe ryzyko polityczne: dopiero po wypracowaniu i przetestowaniu protokołu neutralności (pkt 2) na A1/A3/A4. C7 i C8 pokrywa plan mapy |

**Dlaczego A2 (migracja) jest P3, a nie pominięta:** to temat gęsto obsiany dezinformacją z obu stron, więc warto go opisać, ale dane ZUS dają tylko jedną część rachunku, więc łatwo o nadinterpretację. Wchodzi dopiero po przećwiczeniu protokołu na łatwiejszych tematach, z obowiązkową sekcją „czego dane nie mówią” i testem lustrzanym.

## 6. Jak to wprowadzić do aplikacji (bez nowych komponentów, jeśli się da)

| Klasa | Proponowana forma | Komponent |
|---|---|---|
| **B** (czytanie liczb) | Seria krótkich kart „Jak czytać tę liczbę” (jedno zdanie + przykład z naszych danych + „sprawdź sam”), jako krok w ścieżce Newsy lub osobna ścieżka „Szkoła liczb” w „Uczę się” (E5) | `MythCard` (Mit → mechanizm → fakt) i `LimitsBlock` („Czego ta liczba nie mówi”) już istnieją; wystarczy dołożyć dane |
| **A** (polaryzujące) | Nowa grupa na mapie „Państwo i podatki”: węzły budżet, dług, podatki, emerytury, UE, migracja z **zależnościami** (`links.json`) i sekcją „Czego dane nie mówią”; każdy z protokołem z pkt 2 | `LinkLayer`, `DepsBlock` (są), widok „Codzienność” (M1-0) |
| **C** (praktyczne) | Węzły w widoku „Codzienność” (kredyt, prąd, oszczędności) **oraz** wyróżniona karta „Uważaj na oszustwa” z linkami do list ostrzeżeń (CERT, KNF), niezależnie od mapy | `Card`, źródła w rejestrze |

Każdy temat przechodzi **Definition of Done** z `map-backlog.md`: źródło pierwotne, twierdzenia w `claims.json`, hasła w glosariuszu, test sensu, **test lustrzany** (A), zrzuty i testy.

## 7. Ryzyka

- **Zarzut stronniczości.** Protokół (pkt 2) i symetria uproszczeń są po to; mimo tego każdy temat klasy A powinien przejść przegląd właściciela przed publikacją (eskalacja zgodnie z D17).
- **Spór o definicje** (średnia płaca, saldo UE): GUS i MF same prostują nieporozumienia, więc cytujemy ich, nie spór.
- **Starzenie się liczb:** większość tematów to dane roczne lub kwartalne; wpisujemy do cyklu aktualizacji (R2 w `roadmap.md`).
- **Niepewne liczby z mediów.** Tabele tego dokumentu pokazują, że ta sama liczba bywa podawana różnie (składka UE 7,6 vs 8,4 mld euro; średnia emerytura 4,4 vs 4,5 tys. zł); do strony trafia tylko liczba z pierwotnego dokumentu.
- **Granica z poradą.** Tematy C4, C5, C2 opisują mechanizm, nie rekomendują produktów ani decyzji (zasada 6).

## 10. Standard zaufanych źródeł (obowiązuje dla każdej liczby, w tym ciekawostek)

Uwaga właściciela: **najważniejsze, żeby dane opierały się na jak najbardziej zaufanych źródłach.** Proponuję to jako twardą regułę, a nie dobre chęci.

| Poziom | Kto | Do czego wolno |
|---|---|---|
| **1: pierwotne** | instytucje, które same mierzą lub zbierają dane: GUS, NBP, Ministerstwo Finansów, ZUS, NFZ, NIZP-PZH (Narodowy Instytut Zdrowia Publicznego), Krajowy Rejestr Nowotworów, URE, KNF, UOKiK, CERT Polska; Eurostat, OECD, WHO, EBC, Fed, Komisja Europejska, ONZ; recenzowane publikacje naukowe | **jedyny poziom, z którego bierzemy liczbę główną ciekawostki, definicji i statystyki** |
| 2: pośrednie | agencje prasowe, duże redakcje, organizacje fact-checkingowe | wskazówka, tło, przykład twierdzenia do sprawdzenia. **Nie jako źródło liczby** |
| 3: wtórne | portale, agregatory, branżowe serwisy | tylko wskazówka, gdzie szukać; **nigdy źródło liczby** |

Reguły:

1. **Liczba ciekawostki ma źródło poziomu 1 z okresem, definicją i datą pobrania** oraz twierdzenie w `claims.json` sprawdzane kodem (`verify_claims.py`) z dowodem w `docs/evidence/`. Brak źródła pierwotnego = temat nie wchodzi.
2. **Gdy dwa źródła podają różne liczby**, pokazujemy tylko pierwotną i wyjaśniamy różnicę definicji (np. długość życia: GUS 75,4 / 82,5 lat dla mężczyzn i kobiet wg tablic, a OECD podaje 78,4 jako średnią obu płci, to **inne miary i okresy**). Jeśli różnicy nie umiemy wyjaśnić, nie publikujemy.
3. **Liczby, które brzmią nieprawdopodobnie, wymagają podwójnej kontroli.** W wynikach wyszukiwania pojawiło się np. twierdzenie, że Polska ma „dwie trzecie unijnej produkcji lodów”. Nie publikujemy go, dopóki nie sprawdzimy tabeli Eurostatu.
4. **Liczba zawsze z datą, okresem i oznaczeniem pewności** (jak w węzłach) i informacją, kiedy będzie następna publikacja.
5. **Fakt oddzielony od interpretacji** (kolor `--interp`), bez nagłówków emocjonalnych i bez „dobrych i złych wiadomości” (zasady 1 i 5).
6. **Walidator wymusza regułę** (do zrobienia): karta typu „ciekawostka” bez `src` poziomu 1 i `reviewed: true` jest błędem, nie ostrzeżeniem.

**Uczciwie o stanie obecnym:** strona **nie spełnia** tego standardu w całości. Część liczb głównych ma dziś źródła poziomu 2–3 (np. Brent ze strony notowań, patrz D14; 77 źródeł jest „roboczych”). To jest zaległość R4 z `roadmap.md`. Standard obowiązuje od teraz dla **nowych** treści, a istniejące doprowadzamy do niego w przeglądzie źródeł.

## 11. Panorama „co się dzieje”: ciekawostki z danych

Cel: pokazać odbiorcom, **że takie zjawiska istnieją i co się z nimi dzieje** (handel, zdrowie, demografia, środowisko), bez sensacji. Format: krótka karta „Co się dzieje” (jedna liczba, kierunek i skala, jedno zdanie kontekstu, czego liczba nie mówi, źródło i data), np. w rotacji na Start lub jako ścieżka w Newsy.

Poniżej **kandydaci**. Liczby pochodzą z wyników wyszukiwania (media i opracowania) i **są do potwierdzenia w źródle pierwotnym** wskazanym w ostatniej kolumnie; do aplikacji nie wchodzi żadna, dopóki tego nie zrobimy.

| # | Obszar | Co dane pokazują (wstępnie, do potwierdzenia) | Źródło pierwotne do pobrania | Uwagi |
|---|---|---|---|---|
| P1 | **Handel zagraniczny** | W 2025 r. eksport ok. 366 mld euro, import ok. 374 mld euro, deficyt towarowy ok. 7,7 mld euro; eksport +3,7%, import +6,1% r/r. Największy dostawca: Niemcy (ok. 19% importu), potem Chiny (ok. 15,5%) (wg [PAP](https://www.pap.pl/aktualnosci/polski-handel-zagraniczny-gus-podal-dane-za-2025-rok)) | GUS: „Handel zagraniczny” (komunikat roczny) | Łączy się z istniejącymi węzłami Chiny i Zachód Europy; „import rośnie szybciej niż eksport” to opis, nie ocena |
| P2 | **Długość życia** | W 2025 r. noworodek: mężczyźni 75,37, kobiety 82,48 lat (wzrost o 0,4 i 0,2 r.); najdłużej w Warszawie, najkrócej w Łodzi, różnica regionalna ok. 3 lat (wg [Rzeczpospolitej](https://www.rp.pl/gospodarka/art44896891-polacy-zyja-najdluzej-w-historii-ale-warszawe-i-lodz-dziela-ponad-4-lata)) | GUS: „Trwanie życia” (tablice) | Wiąże się z emeryturami (A5) i starzeniem się. OECD podaje inną liczbę (78,4, średnia obu płci), więc potrzebne wyjaśnienie definicji (reguła 2) |
| P3 | **Przyczyny zgonów (choroby cywilizacyjne)** | Choroby układu krążenia ok. 36–37% zgonów, nowotwory ok. 24% (dane za 2022), razem z chorobami układu oddechowego ok. 71% zgonów w 2023 (wg [Medycyny Praktycznej](https://www.mp.pl/pacjent/aktualnosci/353871,umieralnosc-w-polsce)); w odróżnieniu od chorób układu krążenia, zgonów z powodu nowotworów przybywa rok do roku | GUS „Zgony według przyczyn”; NIZP-PZH; Krajowy Rejestr Nowotworów ([publikacja 2025](https://onkologia.org.pl/sites/default/files/publications/2026-01/0.nowotwory-krn-2025-book-20260123.pdf)) | **Temat wrażliwy:** neutralny ton, bez straszenia (D19). Definicja „choroby cywilizacyjne” (niezakaźne, związane ze stylem życia i środowiskiem) wymaga źródła WHO |
| P4 | **Powietrze** | Średnie narażenie na pył PM2,5 w Polsce ok. 17,8 µg/m³ wobec ok. 11,2 średnio w OECD (OECD, [profil zdrowotny Polski 2025](https://www.oecd.org/en/publications/health-at-a-glance-2025_15a55280-en/poland_c3917772-en.html)) | OECD Health at a Glance 2025 (profil kraju); GIOŚ | Ma bezpośrednią linię do zdrowia i kosztów ogrzewania; pierwotne źródło mamy od razu (OECD) |
| P5 | **Pozycja gospodarcza** | W 2025 r. Polska szóstą gospodarką UE: PKB ok. 922,9 mld euro, 4,9% PKB UE (wg [Forsal](https://forsal.pl/gospodarka/aktualnosci/artykuly/11285261,polska-liderem-regionu-i-szosta-gospodarka-ue-sa-dane-eurostatu.html)) | Eurostat: PKB w cenach bieżących | Pasuje do tematu A8 (rankingi): ta sama kolejność nominalnie i w PPP bywa inna |
| P6 | **Co Polska produkuje najwięcej w UE** | Największy producent dyni w UE od 2020 r. (35% zbiorów, 436 tys. t w 2025) i jabłek (3,39 mln t, 29%) (wg [xyz.pl](https://xyz.pl/?p=254482)) | Eurostat: statystyki rolne | Lekka ciekawostka, łączy się z węzłem „Owoce i warzywa” (M2) |
| P7 | **Transport i handel w liczbach** | 20,2% unijnego transportu drogowego towarów; ok. 20% unijnego eksportu akumulatorów litowo-jonowych (wg [trade.gov.pl](https://www.trade.gov.pl/en/?p=231441)) | Eurostat; baza handlu (Comext/ONZ Comtrade) | Pokazuje, jak wygląda polska gospodarka „od środka” |
| P8 | **Demografia** | liczba urodzeń, struktura wieku, saldo migracji | GUS „Sytuacja demograficzna”; Eurostat | Dane do zebrania; temat wrażliwy (A2) |
| P9 | **Otyłość, cukrzyca, używki** | czynniki ryzyka i ich trend | WHO, OECD, NIZP-PZH, NFZ | Dane do zebrania; bez porad, sam opis |

**Czego tu świadomie nie ma:** liczby samobójstw ani danych o chorobach opisywanych w sposób, który mógłby szkodzić odbiorcom; takie tematy tylko z poradnikiem źródeł pomocy i po decyzji właściciela.

**Dlaczego to ma sens dla jakości życia:** ciekawostka z danych daje punkt zaczepienia („zobacz, jak to wygląda naprawdę”), a ścieżka prowadzi do praktyki (P3 i P4 do zdrowia i kosztów życia, P2 do emerytur, P1 do cen i płac).

## 8. Decyzje właściciela

1. **Czy zasady neutralności z pkt 2** (w tym test lustrzany jako nowa rubryka `redaktora`) przyjmujemy jako obowiązujące dla klasy A?
2. **Kolejność:** P1 jak w pkt 5 (oszustwa i „czytanie liczb” pierwsze)? Czy wolisz zacząć od któregoś tematu polaryzującego?
3. **Temat migracji (A2):** zostaje P3 po wypracowaniu protokołu, czy ma być wcześniej?
4. **Forma:** B jako „Szkoła liczb” (karty) i C3 jako wyróżniona karta „Uważaj na oszustwa”: akceptujesz?
5. **Standard zaufanych źródeł (pkt 10):** liczby tylko ze źródeł poziomu 1, bez wyjątków dla ciekawostek, walidator wymusza regułę? To zaostrza dzisiejszy stan strony (zaległość R4).
6. **Panorama „co się dzieje” (pkt 11):** w jakiej formie? Karta „Co się dzieje” w rotacji na Start (rekomendacja), osobny krok w Newsy czy oba? Które obszary na początek (rekomendacja: P1 handel, P2 długość życia, P4 powietrze, bo mają pierwotne źródło pod ręką)?

## 9. Do sprawdzenia przed startem

- MF: dokument z transferami Polska–UE (składka 2024: 7,6 czy 8,4 mld euro).
- GUS: mediana wynagrodzeń (okres, definicja), BAEL a bezrobocie rejestrowane.
- ZUS: dane o cudzoziemcach i symulacja stopy zastąpienia w publikacji pierwotnej; średnia emerytura po waloryzacji 2026.
- OECD: dokładna wartość klina podatkowego dla Polski.
- CERT Polska, KNF: adresy list ostrzeżeń, licencja i możliwość linkowania.
- Eurostat: AROPE 2025 dla Polski w tabeli pierwotnej.
