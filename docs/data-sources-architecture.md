# Architektura źródeł danych (do przemyślenia)

Status: **otwarte zadanie**, 24.11.2026. Pytanie od właściciela: jaka jest najlepsza architektura źródeł danych, jakie źródła są dostępne i czy mają wystawione API. Dziś dane są wpisywane ręcznie (z weryfikacją przez agenta), a rejestr `src/data/sources.json` opisuje tylko, skąd się biorą. Ten dokument zbiera pytania i kandydatów. Niczego tu jeszcze nie rozstrzygnięto.

## Cel

Najlepsze rozwiązanie to takie, w którym agent `badacz-danych` pobiera liczby **maszynowo ze źródła pierwotnego**, zapisuje migawkę z datą i dowodem, a `confidence.py` liczy wskaźnik pewności z metadanych, bez ręcznego przepisywania.

## Pytania do rozstrzygnięcia

1. **Dostępność API.** Dla każdej serii (CPI, płace, PKB, stopy NBP, kursy, WIG20, ceny ropy, deficyt i dług, handel, MFW) czy istnieje oficjalne API, plik do pobrania (CSV, XLSX, JSON) albo tylko strona HTML lub PDF?
2. **Klucze i limity.** Które API wymagają klucza, jakie mają limity zapytań, gdzie trzymamy klucze (nie w repozytorium).
3. **Licencja i warunki użycia.** Czy dane wolno cytować i wyświetlać, jak wskazać autora.
4. **Rytm i opóźnienia.** Kiedy źródło publikuje (kalendarz wydań), jak szybko dane trafiają do API w porównaniu ze stroną. Z tego liczy się czynnik „Aktualność” i pole `cadence`.
5. **Migawki i powtarzalność.** Jak zapisać surową odpowiedź (data, adres, skrót), żeby liczbę dało się odtworzyć i obronić, gdy źródło zmieni wartość (rewizje GUS).
6. **Rewizje.** Jak oznaczać dane wstępne i skorygowane (np. szybki szacunek PKB vs wartość zaktualizowana). Dziś rozbieżność „+4,1% w II kw.” jest tego przykładem.
7. **Odporność.** Co robi agent, gdy API nie odpowiada, strona blokuje boty (NBP, GPW, MFW zwracały 403 lub blokadę) albo zmienia się układ strony.
8. **Warstwy.** Czy potrzebna jest warstwa pośrednia (cache lub plik `data/raw/` w repozytorium) oddzielająca pobieranie od budowania strony, żeby `build.py` nie zależał od sieci.
9. **Gdzie liczyć.** Czy wskaźnik pewności i bilans zmian liczymy w CI (po pobraniu), czy lokalnie przez agenta i commitujemy wynik.
10. **Weryfikacja liczb.** Jak automatycznie sprawdzać, że liczba w `src/data` zgadza się z wartością w migawce (dziś sprawdzam tylko obecność liczby w tekście strony).

## Kandydaci do zbadania (hipotezy, jeszcze niezweryfikowane)

Poniższa lista pochodzi z ogólnej wiedzy o tych serwisach, nie z weryfikacji w tej sesji. Każdą pozycję trzeba potwierdzić (dokumentacja, test zapytania, licencja).

| Seria | Źródło pierwotne | Kandydat na dostęp maszynowy | Do sprawdzenia |
|---|---|---|---|
| CPI, płace, PKB, zatrudnienie | GUS | API Banku Danych Lokalnych (BDL) GUS, pliki w załącznikach wydań, portal dane.gov.pl | zakres serii kwartalnych i miesięcznych, klucz, opóźnienie względem komunikatu |
| Stopa referencyjna, kursy | NBP | publiczne API NBP (kursy walut i złota), strony z decyzjami RPP | czy stopy procentowe są w API, czy tylko na stronie (strona blokuje boty) |
| Inflacja i PKB strefy euro, dług i deficyt UE, handel | Eurostat | Eurostat API (JSON-stat / SDMX), baza danych | kody zbiorów (np. HICP, PKB kwartalny, EDP), format odpowiedzi |
| Ceny ropy Brent | EIA, ew. giełda | EIA: tabela HTML dostępna bez klucza (**sprawdzone 24.11.2026**, opóźnienie ok. 7 dni, cena spot, nie kontrakt ICE); EIA Open Data API v2 (klucz, niesprawdzone) | zgodność z notowaniem giełdowym (różnice do 26 USD, patrz `brent-eia-check.md`); notowań ICE nie ma w źródłach otwartych |
| Stopy Fed | Fed, FRED | FRED API (St. Louis Fed) | klucz, seria stóp |
| Prognozy MFW | MFW | IMF DataMapper / WEO (pliki, API) | blokady botów (403), format |
| Indeksy giełdowe | GPW | strony i pliki GPW | blokada botów, licencja na dane notowań |
| Cła, decyzje UE | Komisja Europejska | Press corner (RSS, strony) | brak ustrukturyzowanych liczb, wymaga czytania komunikatów |
| Sondaże | CBOS | raporty PDF i strony | brak API, ręczne wprowadzanie z weryfikacją |

## Wstępne zasady (do potwierdzenia przy projektowaniu)

- **Źródło pierwotne najpierw.** Jeśli istnieje API źródła pierwotnego, używamy jego, a portal wtórny zostaje jako pomocnicze.
- **Migawka zamiast zaufania.** Każda wartość zmieniona w `src/data` ma zapisaną migawkę (adres, data pobrania, fragment lub skrót) i trafia do dziennika zmian.
- **Człowiek zatwierdza.** Pobieranie jest zautomatyzowane, ale zmiana liczb idzie przez PR (zgodnie z `PLAN.md`).
- **Osobne warstwy:** pobieranie → migawka → walidacja → dane → build. Build nie robi zapytań sieciowych.
- **Brak API nie blokuje.** Dla źródeł bez API (CBOS, komunikaty KE) zostaje tryb półautomatyczny: agent czyta stronę lub PDF, a człowiek zatwierdza.

## Kolejny krok

Osobna faza badawcza (po fazie 0): przejść po liście kandydatów, sprawdzić dokumentację i zapytania testowe, wypełnić pola `fetch` i `cadence` w `sources.json`, zdecydować o warstwie migawek i zaprojektować `badacz-danych` na tym fundamencie.

## Badanie API: próba z 25.11.2026 (krok 1C)

**Wynik: nic nie zweryfikowano.** Środowisko agenta (sesja chmurowa) ma ograniczoną listę dozwolonych hostów. Każde zapytanie testowe zakończyło się odmową sieci (curl: kod 000, proxy: `connect_rejected 403`; WebFetch: `ENOTFOUND`), więc nie wiadomo, czy API działają bez klucza, jaki mają format i limity. Poniższa tabela zawiera **tylko hipotezy** (adresy i założenia z ogólnej wiedzy, nie z odpowiedzi serwera) oraz zapis, co próbowano. Do ponowienia po dopuszczeniu hostów w ustawieniach sieci środowiska (albo lokalnie przez właściciela).

| Źródło | Adres testowy (hipoteza, niesprawdzony) | Próba 25.11.2026 | Status | Do sprawdzenia |
|---|---|---|---|---|
| GUS BDL | `https://bdl.stat.gov.pl/api/v1/subjects?format=json&page-size=1` | host niedostępny z sesji | **niezweryfikowane** | czy działa bez klucza, limity, id zmiennej CPI, warunki licencji (strona API BDL) |
| dane.gov.pl | `https://api.dane.gov.pl/1.4/datasets?per_page=1` | host niedostępny | **niezweryfikowane** | format, limity, licencja zbiorów (różna per zbiór) |
| NBP | `https://api.nbp.pl/api/exchangerates/rates/a/eur/?format=json` | host niedostępny (WebFetch: `ENOTFOUND`) | **niezweryfikowane** | czy stopa referencyjna jest w API, limity, warunki użycia |
| Eurostat | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_manr?format=JSON&geo=PL&coicop=CP00&lastTimePeriod=1` | host niedostępny | **niezweryfikowane** | kody zbiorów (HICP, PKB, EDP), format JSON-stat, limity, licencja ponownego użycia |
| EIA | strona historii `https://www.eia.gov/dnav/pet/hist/RBRTEd.htm` (tabela, sprawdzona ręcznie 24.11.2026 wg [`brent-eia-check.md`](brent-eia-check.md)); API v2 wymaga klucza (hipoteza) | host niedostępny | tabela HTML: sprawdzona wcześniej (inna sesja), **API: niezweryfikowane** | klucz, limity, licencja |
| FRED | `https://api.stlouisfed.org/fred/series?series_id=FEDFUNDS` | host niedostępny | **niezweryfikowane** | wymóg klucza (hipoteza: tak), limity, warunki użycia |
| MFW | `https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH/POL` | host niedostępny | **niezweryfikowane** | blokady botów, format, warunki użycia |

Reguła z `verification.md` zostaje: bez odpowiedzi serwera i linku do warunków licencji nie wpisujemy `fetch: api` ani `cadence` w `sources.json`. Z tego powodu w kroku 1B nie uzupełniono pól `cadence`.
