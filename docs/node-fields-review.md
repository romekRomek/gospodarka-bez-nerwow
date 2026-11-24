# Przegląd pól węzłów: decides, concerns, watch, soon, conf, src

Stan: 24.11.2026. **To są treści robocze, napisane przez agenta (W3). Czekają na przegląd i zatwierdzenie przez człowieka-redaktora** (`reviewed: false` w rejestrze źródeł, treści pól do akceptacji). Nic tu nie zmienia liczb w `m`, `mc`, `f`, `i` ani dziennika zmian (`changelog.json`), bo nie zmieniła się żadna wartość liczbowa.

Zakres: 13 węzłów w `src/data/steps.json`. Zasady: `CLAUDE.md` (zasada 6), `docs/design/principles.md` (T1, T3, T7, I4), decyzje D5, D11, D13, D14.

## 1. Co dodano

| Pole | Znaczenie | Limit (sprawdza `validate.py`) |
|---|---|---|
| `decides` | kto lub co kształtuje wartość | ≤ 80 znaków |
| `concerns` | 2–3 konkretne grupy, oddzielone przecinkami | bez słowa „wszystkich” |
| `watch` | opcjonalnie: jedno konkretne wydarzenie lub wskaźnik | ≤ 90 znaków; pominięte w węźle `ukraine` (brak daty lub wskaźnika) |
| `soon.events` | 1–3 wydarzenia `{when, text}`, chronologicznie: daty, potem „co …”, na końcu „bez terminu” | `text` ≤ 110 znaków |
| `soon.question` | jedno pytanie „Dla Ciebie”, odpowiedź z głowy w 3 sekundy | ≤ 70 znaków, jedno „?” |
| `conf` | dane wejściowe wskaźnika pewności: `asof`, `kind`, `agree` | enumy, `asof` rrrr-mm-dd, nie późniejsze niż ostatni wpis dziennika |
| `src` | źródło liczby głównej (`m`), poziom 1 pierwszy | id z `sources.json` |

Ustalenia dotyczące `when`:
- Kolejność jest chronologiczna: daty i terminy, potem wydarzenia cykliczne („co tydzień”, „co miesiąc”, „co kwartał”), na końcu „bez terminu”. Makieta Brenta ma „do końca roku” przed „połową grudnia”. W danych jest odwrotnie, bo „połowa grudnia” jest wcześniej.
- Dopuszczone formy: `2.12`, `8–9.12`, `21.04.2027`, `połowa grudnia`, `grudzień` (sam miesiąc liczony jako jego koniec), `do końca roku`, `do 2028`, `co tydzień|miesiąc|kwartał`, `bez terminu`.
- `watch` jest zgodny z najwcześniejszym wydarzeniem w `soon` (tak jak w `components.md`, `WatchNote`), poza `shop` i `tree`, gdzie jest uzupełnieniem.

Ustalenia dotyczące `conf.asof`: dla danych miesięcznych i kwartalnych to **koniec okresu, którego dotyczy wartość** (np. październik = 2026-10-31, III kwartał = 2026-09-30), dla notowań dzień notowania, dla decyzji dzień decyzji, dla prognoz i planów data publikacji (gdy znana). Redaktor lub W2 może zmienić tę konwencję na „datę publikacji”. Wtedy trzeba przeliczyć `asof` w całym pliku.

`conf.kind`: `measurement` (pomiar lub fakt urzędowy), `calculation` (wyliczenie), `market` (cena rynkowa), `estimate` (szacunek), `forecast` (prognoza lub plan).
`conf.agree`: `agree` (źródła z `src` podają tę samą wartość), `small` (małe różnice), `differ`, `single` (jedno źródło podaje liczbę główną).

## 2. Węzły

Źródła zdarzeń: GUS = strona i komunikaty `stat.gov.pl`, wszystkie sprawdzone 24.11.2026 (status 200, tytuł zgodny z tematem). „Dane aplikacji” = tekst już obecny w `steps.json`, `news.json` lub `problems.json`.

### derrick (Ropa)

| Pole | Wartość |
|---|---|
| decides | rynek światowy, negocjacje USA–Iran |
| concerns | kierowców, firm zależnych od paliw |
| watch | decyzja o programie CPN na 2027 r. w połowie grudnia |
| soon | **połowa grudnia**: decyzja o dalszych losach programu CPN (ceny paliw); **do końca roku**: obowiązuje limit cen na stacjach; **bez terminu**: negocjacje USA–Iran i incydenty z tankowcami |
| question | Jak często tankujesz? |
| conf | `2026-11-23`, `market`, `small` |
| src | bez zmian (tvn24, Nation Thailand, poziom 2) |

Źródła wydarzeń: połowa grudnia i do końca roku: Interia (`interia-program-cpn-w-2027-r`): „obecna edycja programu CPN kończy się 31 grudnia”, minister energii: decyzja „najpewniej w połowie grudnia” (sprawdzone w tekście strony). Negocjacje i tankowce: dane aplikacji (`derrick.f`).
Uzasadnienie `conf`: wartość z 23.11 (notowanie), kontrakt giełdowy ICE, więc `market`. `small`, bo kontrakt ICE i cena spot EIA to dwie miary: 92,6 USD (ICE, 23.11) wobec 92,94 USD (EIA, 17.11) w listopadzie są zbliżone, ale w kryzysie różnice sięgały ok. 26 USD (`docs/brent-eia-check.md`, D14).

### gate (Cieśnina Ormuz)

| Pole | Wartość |
|---|---|
| decides | przebieg negocjacji USA–Iran i bezpieczeństwo żeglugi |
| concerns | kierowców, firm transportowych, importerów ropy |
| watch | cotygodniowy raport UKMTO o liczbie przejść przez cieśninę |
| soon | **co tydzień**: raport UKMTO o ruchu statków w cieśninie; **bez terminu**: negocjacje USA–Iran o nowej propozycji porozumienia |
| question | Czy na co dzień jeździsz samochodem? |
| conf | `2026-11-18`, `estimate`, `single` |
| src | **brak** (patrz sekcja 4) |

Źródła wydarzeń: raport UKMTO jest tygodniowy: Gulf News z 10.11.2026 („UKMTO's latest weekly report”, sprawdzone, ale to artykuł o raporcie z tygodnia do 10.11, a nie do 18.11) oraz dane aplikacji (`gate.f`: „UKMTO, tydzień do 18.11”). Negocjacje: dane aplikacji (`derrick.f`).
Uzasadnienie `conf`: liczba pochodzi z szacunku ruchu statków (dane AIS, „ok. 65% mniej”), więc `estimate`. `single`, bo żadne źródło z rejestru nie podaje tej liczby.

### pump (Stacja paliw)

| Pole | Wartość |
|---|---|
| decides | rząd (limit cen, VAT i akcyza) oraz ceny ropy |
| concerns | kierowców, firm transportowych, osoby dojeżdżające autem do pracy |
| watch | decyzja o programie CPN na 2027 r. w połowie grudnia |
| soon | **połowa grudnia**: decyzja o dalszych losach programu CPN; **do końca roku**: obowiązuje limit cen na stacjach (CPN do 31.12); **co miesiąc**: kolejny odczyt cen paliw w inflacji GUS |
| question | Jakim paliwem jeździ Twoje auto? |
| conf | `2026-10-31`, `measurement`, `agree` |
| src | `gus-cpi-2026-10` (nowe, poziom 1), `finwire-inflacja-cpi-pazdziernik` |

Źródła wydarzeń: Interia (jak wyżej); „co miesiąc”: rytm komunikatów GUS o inflacji (archiwum 2026 na stronie GUS zawiera wydanie dla każdego miesiąca).
Uzasadnienie `conf`: GUS podaje tę liczbę w załączniku XLSX do komunikatu z 13.11.2026 (paliwa i smary: 121,7 r/r, 90,3 m/m), to pomiar. `agree`: Finwire podaje 21,7% r/r i −9,7% m/m (po sprostowaniu z 21.11 z 21,8 i −9,8) i powołuje się na tę samą tablicę GUS.

### shop (Sklep i ceny)

| Pole | Wartość |
|---|---|
| decides | ceny w całej gospodarce, pośrednio NBP i program CPN |
| concerns | robiących zakupy, oszczędzających, osoby z kredytem |
| watch | program CPN obowiązuje do końca roku i wpływa na ceny paliw w CPI |
| soon | **do końca roku**: obowiązuje limit cen paliw (program CPN); **co miesiąc**: kolejny odczyt inflacji z GUS |
| question | Na co wydajesz najwięcej w miesiącu? |
| conf | `2026-10-31`, `measurement`, `agree` |
| src | `gus-cpi-2026-10` (zamiast tematycznej strony `gus-cpi`), Finwire (październik, wrzesień) |

Uzasadnienie `conf`: GUS 13.11.2026: „ceny wzrosły o 3,5% r/r, spadły o 0,4% m/m” (w tekście strony komunikatu). Finwire podaje te same wartości.

### bank (Bank i stopy)

| Pole | Wartość |
|---|---|
| decides | Rada Polityki Pieniężnej (NBP), w tle Fed, EBC i inflacja |
| concerns | osoby z kredytem, oszczędzających, firmy finansujące się kredytem |
| watch | posiedzenie RPP 2.12 (stopy 3,75% od marca) |
| soon | **2.12**: posiedzenie RPP, decyzja o stopach; **8–9.12**: posiedzenie Fed (FOMC) w sprawie stóp; **grudzień**: posiedzenie EBC w sprawie stóp |
| question | Masz kredyt albo lokatę w banku? |
| conf | `2026-11-04`, `measurement`, `single` |
| src | `finwire-decyzja-rpp-4-11` (poziom 3) |

Źródła wydarzeń: **2.12**: Finwire („Kiedy kolejna decyzja RPP? 2 grudnia 2026 … według harmonogramu NBP”). To źródło wtórne, **nie potwierdziłem terminu w NBP** (strona blokuje boty). **8–9.12**: Fed, kalendarz FOMC (`fed-fomc-kalendarz`, poziom 1, sprawdzone: „December 8-9*”). **grudzień** (EBC): dane aplikacji (`bank.f`, `west.f`: komentatorzy spodziewają się podwyżki w grudniu); **dokładnej daty posiedzenia EBC nie potwierdziłem** (kalendarz EBC ładuje się skryptem), dlatego wpis jest na poziomie miesiąca.
Uzasadnienie `conf`: stopa referencyjna to wartość urzędowa (pomiar), potwierdzona decyzją RPP z 4.11 (dzień w `asof`). `single`, bo liczbę podaje tylko Finwire (NBP niepotwierdzony). Fakty z komunikatu Fed z 28.10 (`fed-fomc-2026-10-28`: przedział 3-3/4 do 4%, głosowanie 10–2, dwoje członków za podwyżką) i EBC (stopa depozytowa 2,50% od 16.09 według strony EBC z oficjalnymi stopami) potwierdzone w źródłach pierwotnych, ale dotyczą `mc` i `f`, nie liczby głównej, więc nie ma ich w `src`.

### worker (Pensje i portfel)

| Pole | Wartość |
|---|---|
| decides | pracodawcy i rynek pracy, a realnie także inflacja |
| concerns | pracowników, pracodawców, osoby szukające pracy |
| watch | zatrudnienie w firmach, spadło o 0,7% r/r |
| soon | **co miesiąc**: kolejne dane GUS o płacach i zatrudnieniu |
| question | Czy Twoja pensja wzrosła w tym roku? |
| conf | `2026-10-31`, `calculation`, `agree` |
| src | bez zmian (`gus-wynagrodzenia-2026-10`, Finwire) |

Uzasadnienie `conf`: liczba główna (+2,4% realnie) jest wyliczona z płac nominalnych i inflacji (Finwire podaje „po uwzględnieniu inflacji płace realnie wzrosły o 2,4% r/r”), więc `calculation`. GUS (tekst strony): +6,1% r/r nominalnie, +1,5% wobec września, zatrudnienie −0,7% r/r. Finwire potwierdza te wartości.

### debt (Dług publiczny)

| Pole | Wartość |
|---|---|
| decides | rząd i parlament (budżet), rynek obligacji (rentowności) |
| concerns | podatników, odbiorców wydatków publicznych, inwestorów w obligacje |
| watch | kolejna notyfikacja deficytu i długu (EDP) w kwietniu 2027 r. |
| soon | **21.04.2027**: kolejna notyfikacja deficytu i długu do KE (dane Eurostatu); **do 2028**: termin zejścia deficytu poniżej 3% PKB (procedura nadmiernego deficytu) |
| question | Z jakiej usługi publicznej korzystasz najczęściej? |
| conf | `2026-10-21`, `forecast`, `single` |
| src | `xyz-pl-notyfikacje-edp-deficyt-i-dlug` (poziom 3) |

Źródła wydarzeń: 21.04.2027: strona Eurostatu z 21.10.2026 („Next release: 21 April 2027”, `eurostat-edp-2026-10-21`, sprawdzone). Do 2028: dane aplikacji (`problems.json`: „Do 2028 r. deficyt ma spaść poniżej 3% PKB”); KE w danych aplikacji, **terminu nie potwierdziłem na stronie PAP** (strona ładuje się skryptem).
Uzasadnienie `conf`: 7,1% PKB to prognoza deficytu na 2026 r. z jesiennej notyfikacji EDP (xyz.pl z 21.10.2026: „w 2026 r. prognozowany jest jego nieznaczny spadek do 7,1 proc. PKB”), więc `forecast`. `single`: tylko ten artykuł podaje 7,1%. Źródła pierwotne (Eurostat, GUS) nie zawierają tej liczby: GUS ma 7,3% za 2025 r. (22.04.2026), Eurostat 7,2% za 2025 r. (21.10.2026). Dlatego **nie ma ich w `src`** (zawyżyłyby pewność).

### tree (Giełda)

| Pole | Wartość |
|---|---|
| decides | inwestorzy; zyski banków i energetyki, nastroje wokół ropy |
| concerns | inwestorów indywidualnych, akcjonariuszy banków i spółek energetycznych |
| watch | decyzja RPP 2.12 (banki mają duży udział w rekordzie WIG20) |
| soon | **2.12**: posiedzenie RPP: stopy wpływają na zyski banków; **bez terminu**: rozmowy USA–Iran i ceny ropy, wokół których jest nerwowo na giełdzie |
| question | Czy masz konto maklerskie lub fundusze? |
| conf | `2026-11-23`, `market`, `single` |
| src | `wnp-wig20-zamkniecie-23-11`, `wnp-rekord-wig20-z-13-11-i-sesja-z-20-11` (poziom 3) |

Źródła wydarzeń: 2.12: Finwire (jak w `bank`); związek stóp z zyskami banków: dane aplikacji (`tree.i`). Ropa i giełda: dane aplikacji (`tree.i`: „nerwowość wokół ropy”).
Uzasadnienie `conf`: zamknięcie sesji 23.11, cena rynkowa. WNP (PAP) podaje 4170,92 pkt (sprawdzone w tabeli „GPW SA, wartość indeksów na zamknięciu sesji”). GPW nie jest w `src`, bo nie potwierdziłem adresu z wartością (strona archiwum notowań ładuje dane skryptem).

### sun (PKB)

| Pole | Wartość |
|---|---|
| decides | firmy, konsumenci i państwo (inwestycje, konsumpcja, eksport) |
| concerns | przedsiębiorców, pracowników, budżet państwa |
| watch | 30.11: GUS poda pełne dane o strukturze PKB za III kwartał |
| soon | **30.11**: GUS publikuje pierwszy regularny szacunek PKB za III kwartał (struktura); **co kwartał**: kolejny szybki szacunek PKB z GUS |
| question | Czy w Twojej okolicy trwają jakieś budowy? |
| conf | `2026-09-30`, `estimate`, `agree` |
| src | bez zmian (GUS poziom 1, Finwire) |

Źródła wydarzeń: 30.11: Money.pl (`money-pl-pkb-iii-kwartal-2026`, poziom 2): „pierwszy regularny szacunek PKB za trzeci kwartał 2026 r. … zostanie opublikowany 30 listopada 2026 r.”. Termin nie jest w tekście strony GUS, a GUS-owy kalendarz w sieci jest niepełny. „co kwartał”: archiwum szybkich szacunków na stronie GUS (jedno wydanie na kwartał).
Uzasadnienie `conf`: to szybki szacunek (po 30.11 może być zrewidowany), więc `estimate`. GUS 13.11.2026: +3,5% r/r niewyrównane sezonowo, Finwire zgodnie.

### west (Zachód Europy)

| Pole | Wartość |
|---|---|
| decides | gospodarki Niemiec i Francji, EBC, ceny energii |
| concerns | eksporterów do Niemiec i Francji, producentów podzespołów, pracowników przemysłu |
| watch | 17.12: Eurostat poda inflację strefy euro za listopad |
| soon | **17.12**: Eurostat publikuje inflację strefy euro za listopad (w październiku 4,0%); **grudzień**: posiedzenie EBC w sprawie stóp |
| question | Czy rozliczasz coś w euro? |
| conf | `2026-10-13`, `forecast`, `single` |
| src | `xyz-pl-prognozy-mfw-dla-polski` (poziom 3) |

Źródła wydarzeń: 17.12: Eurostat, wydanie z 18.11.2026 (`eurostat-hicp-2026-10`, „Next release: 17 December 2026”). To termin odczytu finalnego za listopad. Szybki szacunek za listopad wychodzi wcześniej, ale jego daty nie sprawdzałem. Grudzień (EBC): jak w `bank`, data niepotwierdzona.
Uzasadnienie `conf`: 1,1% to prognoza MFW na 2026 r. (`forecast`), `asof` = data artykułu xyz.pl o prognozach MFW (13.10.2026), nie data publikacji MFW. **W tekście xyz.pl nie znalazłem liczby 1,1% dla całej strefy euro**, a tylko Niemcy 1,3% i Francja 0,4% (zgodnie z `mc`). Dlatego `single`, a liczba główna czeka na potwierdzenie w MFW (strona blokuje boty). Fakty w `f` potwierdzone w Eurostacie: inflacja 4,0% w październiku i 3,8% we wrześniu (`eurostat-hicp-2026-10`), PKB strefy euro +0,4% k/k (`eurostat-pkb-flash-2026-q3`). Nie ma ich w `src`, bo nie stoją za liczbą główną.

### ukraine (Ukraina)

| Pole | Wartość |
|---|---|
| decides | rozmowy pokojowe, rząd (budżet obronny) i UE (pożyczka SAFE) |
| concerns | podatników, firmy zbrojeniowe i ich dostawców, pracodawców zatrudniających uchodźców |
| watch | (pominięte: brak daty ani wskaźnika) |
| soon | **bez terminu**: kolejna runda rozmów USA–Ukraina–Rosja po spotkaniu w Abu Dhabi (10–11.11) |
| question | Czy w Twojej okolicy mieszkają osoby z Ukrainy? |
| conf | `2026-07-01`, `estimate`, `single` |
| src | `fundacja-pulaskiego-wydatki-obronne-2026` (poziom 2) |

Źródła wydarzeń: CBS News (`cbs-news-rozmowy-w-abu-dhabi`, sprawdzone): to pierwsza runda w ok. 9 miesięcy, Kushner nazwał ją „początkowym krokiem”, który może „zbudować rozpęd” dla dalszych negocjacji. Terminu następnej rundy w źródłach nie ma.
Uzasadnienie `conf`: liczba to plan wydatków obronnych na 2026 r. (nie pomiar), więc `estimate`. Pułaski (PDF, wydanie lipiec 2026): „budżet obronny osiągnął rekordowy poziom 201 mld zł (co stanowi 4,83% PKB)” (wyciągnąłem tekst z PDF skryptem). `asof` = 2026-07-01 to **przybliżenie** (miesiąc z nazwy pliku `Lipiec2026`, dnia nie znam). Pytanie o osoby z Ukrainy jest zwykłym faktem o okolicy, bez oceny. Redaktor może je uznać za zbyt osobiste.

### usa (USA)

| Pole | Wartość |
|---|---|
| decides | administracja USA (cła), Fed (stopy), rozmowy UE–USA |
| concerns | eksporterów do USA, producentów dla motoryzacji, osoby rozliczające się w dolarach |
| watch | 8–9.12: posiedzenie Fed (FOMC) w sprawie stóp |
| soon | **8–9.12**: posiedzenie Fed (FOMC) w sprawie stóp; **bez terminu**: rozmowy UE–USA o kolejnych zwolnieniach z ceł |
| question | Czy kupujesz produkty z USA przez internet? |
| conf | `2026-07-24`, `measurement`, `agree` |
| src | `bank-pl-nowe-cla-usa`, `xyz-pl-cla-usa-a-polscy-eksporterzy-pie` (poziom 3) |

Źródła wydarzeń: 8–9.12: Fed, kalendarz FOMC (poziom 1, sprawdzone). Rozmowy: bank.pl/PAP z 24.07.2026 (rzecznik KE: decyzja „stwarza korzystne warunki do dalszych rozmów na temat kolejnych zwolnień taryfowych”).
Uzasadnienie `conf`: stawka celna 10% to wartość z aktu prawnego (fakt, nie szacunek), obowiązuje od 24.07 (`asof`). bank.pl (PAP): „Unii Europejskiej dotyczą taryfy w wysokości 10 proc.”, xyz.pl (PIE) potwierdza opis ceł z 24.07, więc `agree`. Źródło pierwotne (rozporządzenie USA lub komunikat KE) niepodpięte: komunikat KE w Press corner to wypowiedź rzecznika przekazana przez PAP, a nie osobny dokument, którego mógłbym sprawdzić.

### china (Chiny)

| Pole | Wartość |
|---|---|
| decides | importerzy i konsumenci (wybór dostawców), popyt w Chinach |
| concerns | importerów i sklepy, polski przemysł konkurujący z importem, kupujących samochody |
| watch | kolejne dane GUS o handlu zagranicznym (styczeń–październik) |
| soon | **co miesiąc**: kolejne dane GUS o handlu zagranicznym według krajów |
| question | Czy kupujesz rzeczy z Chin, np. online? |
| conf | `2026-07-31`, `calculation`, `single` |
| src | `wiadomosci-handlowe-chiny-dostawca-nr-1` (poziom 3) |

Źródła wydarzeń: GUS, archiwum wydań „Obroty towarowe handlu zagranicznego ogółem i według krajów” (`gus-handel-2026-i-ix`): wydanie dla każdego miesiąca od stycznia do września 2026 (ostatnie z 13.11.2026).
Uzasadnienie `conf`: „nr 1 w lipcu” to ranking wyliczony z danych handlowych (`calculation`), przytoczony przez Wiadomości Handlowe za analizą PKO BP („Makro Flash”). GUS (źródło pierwotne danych) nie jest w `src`, bo nie sprawdziłem w jego załącznikach miesięcznego rankingu za lipiec.

## 3. Źródła dopisane do `sources.json` (wszystkie sprawdzone 24.11.2026)

| Id | Poziom | Co potwierdza | Gdzie użyte |
|---|---|---|---|
| `gus-cpi-2026-10` | 1 | CPI 3,5% r/r, −0,4% m/m (tekst); paliwa +21,7% r/r i −9,7% m/m, energia +6,1%, żywność −0,1% (załącznik XLSX) | `src` węzłów `pump`, `shop`; lista „Źródła” |
| `gus-handel-2026-i-ix` | 1 | wydanie z 13.11.2026, rytm miesięczny (archiwum) | zdarzenie w `china`, nie w `src` |
| `money-pl-pkb-iii-kwartal-2026` | 2 | termin 30.11, PKB II kw. 4,1% r/r | zdarzenie w `sun`; lista „Źródła” |
| `fed-fomc-2026-10-28` | 1 | stopy bez zmian (przedział 3-3/4 do 4%), głosowanie 10–2 | lista „Źródła”; tekst `bank.mc`, `bank.f` |
| `fed-fomc-kalendarz` | 1 | posiedzenie 8–9.12.2026 | zdarzenia w `bank`, `usa` |
| `eurostat-hicp-2026-10` | 1 | inflacja strefy euro 4,0% (paź.), 3,8% (wrz.), następne wydanie 17.12 | zdarzenie w `west`; lista „Źródła” |
| `eurostat-pkb-flash-2026-q3` | 1 | PKB strefy euro +0,4% k/k (30.10 i 13.11) | lista „Źródła”; tekst `west.f` |
| `eurostat-edp-2026-10-21` | 1 | deficyt Polski 2025: −7,2% PKB, następne wydanie 21.04.2027 | zdarzenie w `debt`; `primary` dla xyz.pl (EDP) |

Zmiany w istniejących wpisach: `gus-cpi` (usunięta notatka „nie znaleziono komunikatu”, bo komunikat jest teraz w `gus-cpi-2026-10`), `finwire-inflacja-cpi-pazdziernik` (`primary` → `gus-cpi-2026-10`), `xyz-pl-notyfikacje-edp-deficyt-i-dlug` (`primary`, `cites`), `bank-pl-nowe-cla-usa` (`cites`: PAP, rzecznik KE), `where` dla trzech wpisów GUS (dopisane „template”).

Na liście „Źródła” w `template.html` dopisano 7 pozycji: GUS (CPI, wynagrodzenia, PKB), Money.pl, Fed (komunikat), Eurostat (inflacja, PKB). To źródła faktów z widocznego dziś tekstu (`mc`, `f`) albo terminu „30.11”. Nie dopisano Fed (kalendarz), Eurostat (EDP) i GUS (handel), bo stoją tylko za wydarzeniami z `soon`, których interfejs jeszcze nie pokazuje. Po wdrożeniu bloku „Co może o tym zadecydować” trzeba je dopisać do listy (`where: template`).

## 4. Węzły i źródła do decyzji redaktora

- **`gate` bez `src`.** Nie znalazłem źródła potwierdzającego „65% mniej niż przed wojną, tydzień do 18.11”. Kandydat: Gulf News z 10.11.2026 (https://gulfnews.com/world/mena/hormuz-shipping-below-normal-but-not-stalled-ukmto-1.500741839): „najnowszy tygodniowy raport UKMTO … ok. 65% poniżej poziomu sprzed konfliktu”, ale dla tygodnia do 10.11. Nie dopisałem go do rejestru. Redaktor decyduje, czy ten tydzień wystarcza, albo szuka raportu UKMTO z 18.11.
- **Węzły z `src` tylko poziomu 3:** `bank` (Finwire), `debt` (xyz.pl), `tree` (WNP), `west` (xyz.pl), `usa` (bank.pl, xyz.pl), `china` (Wiadomości Handlowe). Wskaźnik pewności dla nich nie osiągnie poziomu „Wysoka”, dopóki nie zostaną podpięte źródła pierwotne (NBP, GPW, MFW, KE).
- **NBP, GPW, MFW** nie są dopisane: strony blokują zapytania (NBP: „Pardon Our Interruption”, MFW: 403, GPW: 200, ale wartości WIG20 nie ma w pobranym HTML). Do ręcznego sprawdzenia w przeglądarce.

## 5. Niezgodności znalezione w danych (nie zmieniałem, do decyzji)

1. **`sun.f`: „rynek oczekiwał +3,6% r/r”.** GUS i Finwire podają +3,6% jako wzrost **wyrównany sezonowo** r/r, a nie jako oczekiwanie rynku (konsensusu w źródłach nie znalazłem). Prawdopodobne pomylenie wartości. Ta sama liczba w `news.json` (`sun`).
2. **PKB II kw.:** `steps.json` i Money.pl podają +4,1%, a `changelog.json` „+3,9% (II kw.)” w zmianie węzła `sun`. Jedna z wartości jest błędna lub dotyczy innego szacunku.
3. **`debt.mc`: „plan 2026 i 2027”.** Potwierdziłem 7,1% dla 2026 r. (xyz.pl, notyfikacja EDP). Dla 2027 r. xyz.pl (o MFW) podaje deficyt 7,0% PKB, a nie 7,1%, więc „7,1% w 2027” nie jest potwierdzone.
4. **Deficyt 2025:** wykres w `charts.json` ma 7,3% (GUS, 22.04.2026), a jesienna notyfikacja (Eurostat, 21.10.2026) podaje 7,2%. Zrewidowano w dół o 0,1 pp.
5. **`west.m`: 1,1% dla strefy euro (MFW)** nie występuje w tekście xyz.pl (są Niemcy 1,3% i Francja 0,4%, zgodnie z `mc`). Inna para wartości w tym artykule (Niemcy 1,1%, Francja 0,7%) dotyczy najpewniej 2027 r.
6. **`west.f`: „Niemcy +0,2%, Francja −0,1%, Włochy bez zmian” (III kw.).** Strona Eurostatu z 13.11 podaje strefę euro (+0,4% k/k), ale nie rozbicie na kraje. Manager Plus pisze tylko, że Niemcy odnotowały „niewielki wzrost”, a Francja spadek. Konkretne wartości niezweryfikowane.
7. **`bank.mc`: „Fed: 3,75–4,00%”** zgodne z komunikatem Fed (3-3/4 do 4%). „EBC: 2,50%” zgodne ze stroną oficjalnych stóp EBC (stopa depozytowa od 16.09.2026). Bez zastrzeżeń.
8. **`worker.m`: +2,4%.** Finwire podaje tę wartość jako realną. Prosta różnica 6,1 − 3,5 daje 2,6 pp, a iloraz (1,061 / 1,035) 2,5%, więc wartość z Finwire to inna deflacja (prawdopodobnie inny wskaźnik cen). Nie sprawdzałem tego w załączniku GUS.
9. **`tree.mc`: „od początku roku ok. +31%”.** WNP z 20.11 podaje „WIG20 +26 proc.” do 20.11. Po wzroście o 3,85% z 23.11 daje to ok. +30%, więc rząd wielkości się zgadza, a „+31%” wymaga przeliczenia.
10. **`ukraine.m`: 4,8% PKB (201 mld zł)** zgodne z Pułaskim (4,83%, 201 mld zł). FZZ w `problems.json` podaje 4,81% (200,1 mld zł). Różnica niewielka, ale to dwie wartości dla jednego wskaźnika.

## 6. Lista rzeczy niezweryfikowanych

- Termin posiedzenia RPP 2.12 (tylko Finwire, bez NBP).
- Termin grudniowego posiedzenia EBC (tylko „w grudniu” z danych aplikacji).
- „Do 2028” dla deficytu poniżej 3% PKB (dane aplikacji, nie sprawdzone u źródła; PAP ładuje treść skryptem).
- Rytm „co miesiąc” dla komunikatów GUS o płacach, zatrudnieniu i inflacji (wynika z `cadence` w rejestrze i z archiwum 2026 na stronie GUS), konkretnych dat w kalendarzu GUS nie udało się odczytać.
- Szybki szacunek inflacji za listopad (zwykle ostatniego dnia miesiąca): nie wpisano go jako wydarzenia, bo daty nie potwierdziłem.
- Szybki szacunek HICP strefy euro za listopad (data nieznana, wpisany tylko odczyt finalny 17.12).
- Tygodniowy raport UKMTO „do 18.11” (Gulf News potwierdza raport z 10.11).
- Wartość 1,1% MFW dla strefy euro i rozbicie PKB III kw. na kraje (patrz sekcja 5).
- „Chiny nr 1 w lipcu” w załącznikach GUS.
- Konwencja `conf.asof` (koniec okresu) i klasyfikacja `kind` dla: PKB (`estimate`, bo szybki szacunek), stopy NBP (`measurement`), ceł (`measurement`), planu wydatków obronnych (`estimate`), rankingu Chin (`calculation`). To decyzje robocze do akceptacji (patrz też `docs/design/content-model.md`, wskaźnik pewności).
- Ton pytań „Dla Ciebie” (zwłaszcza `ukraine`, `debt`, `tree`) i dobór grup w `concerns` wymagają oceny redaktora (zasady T3, T7).
