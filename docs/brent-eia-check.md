# Brent: porównanie danych aplikacji z EIA

Stan: 24.11.2026. Narzędzie: `python3 scripts/check_brent_eia.py` (sieć, bez klucza). Źródło pierwotne: EIA, seria dzienna „Europe Brent Spot Price FOB" (`eia-brent-spot` w rejestrze).

## 1. Wnioski

1. **Rozbieżność „ok. 90 USD" vs „92,6 USD" to zaokrąglenie, a nie konflikt.** Ostatnie notowanie EIA (17.11) to 92,94 USD, więc obie wartości opisują ten sam poziom, ok. 93 USD.
2. **Średnie roczne 2021–2024 zgadzają się z EIA co do 0,04 USD** (70,9; 100,9; 82,5; 80,5). To potwierdzenie źródłem pierwotnym.
3. **Wartości 2026 w aplikacji nie pochodzą z EIA.** Dla 14 porównanych dni średnia różnica to **−6,1 USD**, a największa **−25,8 USD** (7.10: aplikacja 100,2, EIA 126,00). Maksimum 2026 według EIA to 138,21 USD (7.04), a w aplikacji najwyższy punkt to 116,7 USD.
4. **Przyczyna jest widoczna w źródłach, z których biorą się wartości.** tvn24 pisze „Brent na ICE była wyceniana po około 110,09 dolara", a Nation Thailand „Brent settled at US$113.88". Wartości 2026 to więc **kontrakt terminowy ICE**, a EIA podaje **cenę spot (FOB)**. To dwie różne miary. W kryzysie spot może być znacznie wyższy niż kontrakt, co tłumaczy duże różnice w marcu, kwietniu i październiku. Mechanizmu nie badałem, wiem tylko, że miary są różne i że różnice są duże.
5. **Aplikacja miesza obie miary.** Wykres słupkowy „Ropa Brent w ostatnich latach" ma średnie roczne 2021–2024 z EIA (spot), a ostatni słupek (92,6 USD z 23.11) pochodzi z ICE. Podpis „Brent" nie mówi, o którą miarę chodzi.
6. **EIA nie nadaje się do wartości „dziś".** Opóźnienie to ok. tygodnia (ostatnie notowanie 17.11 przy sprawdzeniu 24.11).

## 2. Wyniki

Średnie roczne:

| Rok | Aplikacja | EIA | Różnica |
|---|---|---|---|
| 2021 | 70,9 | 70,86 | +0,04 |
| 2022 | 100,9 | 100,93 | −0,03 |
| 2023 | 82,5 | 82,49 | +0,01 |
| 2024 | 80,5 | 80,52 | −0,02 |

Wybrane punkty z wykresu „Brent w 2026 roku" (pełna lista: wynik skryptu):

| Data | Aplikacja (ICE) | EIA (spot) | Różnica |
|---|---|---|---|
| 13.02 | 67,6 | 69,96 | −2,4 |
| 27.03 | 112,6 | 121,47 | −8,9 |
| 30.04 | 110,5 | 124,24 | −13,7 |
| 7.10 | 100,2 | 126,00 | −25,8 |
| 27.10 | 113,9 | 123,10 | −9,2 |
| 2.11 | 110,1 | 107,39 | +2,7 |
| 12.11 | 91,3 | 95,42 | −4,1 |
| 16.11 | 95,3 | 92,90 | +2,4 |

W listopadzie, po załamaniu notowań, obie miary zbiegły się (różnice do ok. 4 USD).

Twierdzenia z tekstu aplikacji:

| Twierdzenie | W miarze ICE (aplikacja) | W miarze spot (EIA) |
|---|---|---|
| „ok. 90 USD" dziś | 92,6 (23.11) | 92,94 (17.11, ostatnie notowanie) |
| „ok. 20% mniej niż 27.10 (114 USD)" | −18,7% | −24,5% (17.11 wobec 123,10) |
| „W lutym było ok. 68 USD" | 67,6 (13.02) | średnia lutego 70,89, 13.02: 69,96 |
| „ok. 30% więcej niż w lutym" | +36% (92,6 / 67,6) | +31% (92,94 / 70,89) |

## 3. Opcje (decyzja redakcyjna)

| Opcja | Co to znaczy | Zalety | Wady |
|---|---|---|---|
| **A. Zostać przy ICE** | Główna miara to kontrakt ICE, jawnie opisany („Brent, kontrakt ICE"). Poprawić wykres słupkowy, żeby nie mieszał miar. | Zgodne z tym, co podają media. Wartość „dziś". | Źródło pierwotne (ICE) jest płatne, więc podpinamy poziom 2 (agencje, tvn24). Pewność „Średnia". |
| **B. Przejść na EIA spot** | Cała seria z EIA (pierwotna, darmowa, powtarzalna skryptem). | Pewność „Wysoka", pełna weryfikowalność. | Liczby inne niż w mediach (np. 123 zamiast 114 z 27.10) i opóźnienie 7 dni, więc nie „dziś". |
| **C. ICE jako główna + EIA jako odniesienie (rekomendacja)** | Kafelek i wykres 2026 w ICE, z jawnym podpisem. W „Więcej" wiersz „Cena spot (EIA, 17.11): 92,94 USD". Średnie roczne podpisane jako spot EIA, a ostatni słupek jako ICE albo usunięty z tego wykresu. | Uczciwe wobec obu miar, aktualne, pokazuje źródło pierwotne i różnicę. | Więcej tekstu przy jednej liczbie (tylko w „Więcej"). |

**Rekomendacja: C.** Odbiorca zobaczy liczbę znaną z mediów (ICE), a „Więcej" pokaże, że istnieje druga miara i że w listopadzie zbiegły się. Wskaźnik pewności zostaje „Średni" z powodem „kontrakt giełdowy z agencji, cena zmienna", co jest prawdą. Do rozważenia przy okazji: „ok. 90" zmienić na „ok. 93", bo obie wartości w danych (92,6 i 92,94) bliższe są 93 niż 90.

## 4. Decyzja i wykonanie (D14, opcja C)

Wybrano opcję C (patrz `docs/decisions.md`, D14). Wykonano: podpis miary w `steps.json` („Brent (kontrakt ICE)") i dodatkowy fakt z EIA, wykres słupkowy z podpisem „średnie roczne ceny spot (EIA)" i ostatnim słupkiem „(ICE)", wykres 2026 z nazwą miary, EIA na liście „Źródła" w szablonie. **Nie zmieniono** „ok. 90" na „ok. 93" i **nie dodano** wpisu w dzienniku zmian (uzasadnienie w D14).

## 5. Co zrobiono wcześniej, a czego nie

Zrobione (bez zmiany liczb):
- Dopisano `eia-brent-spot` do rejestru (poziom 1) z opisem różnicy miar.
- Przy `tvn24-ropa-2-11` i `nation-thailand-brent-27-10` ustawiono `cites: ICE`.
- Węzeł `derrick` ma `src` z tymi dwoma źródłami (poziom 2). **EIA celowo nie jest w `src` tego węzła**, bo liczby w nim nie pochodzą z EIA. Wpisanie EIA podniosłoby pewność do „Wysokiej" wbrew faktom.
- Dodano `scripts/check_brent_eia.py`, żeby porównanie dało się powtórzyć.

Do zrobienia:
- Ewentualna zmiana „ok. 90" → „ok. 93" (wymaga poprawy „ok. 30% więcej niż w lutym" i kopii w `news.json`, `problems.json`).
- Wykres „Brent w 2026 roku" jest w danych pod węzłem `gate`, nie `derrick`. Jego źródła w polu `src` to tekst (Reuters, Trading Economics, Oil & Gas Middle East, tvn24, PAP). Trzeba je przenieść do rejestru (trzy z nich nie mają jeszcze wpisów).

## 6. Dla architektury źródeł

- Tabela EIA jest dostępna **bez klucza** jako HTML (sprawdzone 24.11.2026), a parser ma ok. 40 linii. API v2 EIA (z kluczem) nie było testowane.
- Opóźnienie ok. tygodnia i cena spot wymagają decyzji, czy EIA ma być źródłem głównym, czy kontrolnym. To przykład pytania 4 i 6 z `data-sources-architecture.md` (rytm, rewizje).
- Notowań giełdowych (kontrakt ICE) nie ma w źródłach otwartych. Dla „dziś" zostają agencje i serwisy poziomu 2.
