# Plan i priorytety (do decyzji właściciela)

Stan na 26.11.2026. Zbiera w jednym miejscu wszystko, co jest otwarte: backlog ogólny (`docs/backlog.md`), backlog mapy (`docs/map-backlog.md`), pomysły rozbudowy (`docs/expansion-ideas.md`, `docs/data-topics.md`), otwarte punkty z `docs/PLAN.md` i z decyzji oraz wyniki bramek jakości. **Priorytety są moją rekomendacją**, kolejność i zakres rozstrzyga właściciel.

## 1. Stan na dziś (liczby z bramek)

| Miara | Wynik | Uwaga |
|---|---|---|
| Testy jednostkowe / test w przeglądarce | 165 / 914 asercji, bez błędów | |
| Walidacja danych | 0 błędów, 62 ostrzeżenia | 18 skrótów bez hasła, 14 o rejestrze źródeł (m.in. 77 źródeł „roboczych”), 8 definicji z wieloma zdaniami, 6 o twierdzeniach |
| Weryfikacja twierdzeń kodem | 34 potwierdzone, **1 rozbieżne**, 8 niedostępnych | rozbieżne: Brent (patrz R1) |
| Kontrola spójności | 16 znalezisk (stan bazowy) | m.in. 6 twierdzeń bez źródła w treściach „mc” |
| Definicje w słowniku | 7 z 19 potwierdzonych w źródle | 12 „roboczych” |
| Zdalne gałęzie w repozytorium | 13 | do sprzątnięcia |

**Najważniejszy fakt:** dane na stronie są „z 24.11”, a Brent notuje się dziś na ok. **95,04 USD** (strona: „ok. 90 USD”). Weryfikator to wyłapał (źródło zmienne, twierdzenie rozbieżne). Strona **nie ma jeszcze regularnego cyklu aktualizacji danych**, a to jej główna obietnica.

## 2. Jak oceniam priorytet

Każdą pozycję oceniam w czterech wymiarach: **zaufanie** (czy usuwa ryzyko błędnej lub nieaktualnej informacji, najważniejsze dla tej strony), **wartość dla czytelnika** (zrozumienie i spokój), **koszt** (S: jeden mały PR, M: 1–2 PR, L: kilka PR lub dane zewnętrzne) i **zależności**.

- **P0:** zrobić teraz, bo dotyczy prawdziwości lub bieżącej użyteczności.
- **P1:** następne, wysoka wartość przy rozsądnym koszcie.
- **P2:** wartościowe, ale po P0 i P1 albo wymagają danych zewnętrznych.
- **P3:** później lub opcjonalnie.

## 3. Pozycje i priorytety

### A. Zaufanie i aktualność danych

| ID | Pozycja | Priorytet | Koszt | Dlaczego i zależności |
|---|---|---|---|---|
| R1 | **Aktualizacja danych na dziś** (m.in. Brent ok. 95 USD, WIG20 i inne dzienne liczby) z wpisem w dzienniku zmian | **P0** | S–M | Strona pokazuje liczby sprzed dwóch dni. Zgodnie z regułami: nowy wpis w `changelog.json`, weryfikacja, PR. |
| R2 | **Regularny cykl aktualizacji** (np. raz w tygodniu): agent przygotowuje PR z nowymi liczbami i dowodami, weryfikator sprawdza, człowiek scala | **P0** | M | Bez tego strona się starzeje. Wymaga decyzji o koszcie (patrz pkt 5, D1). Szczegóły: fala R2a (ręcznie na polecenie) lub R2b (harmonogram w chmurze). |
| R3 | **Twierdzenia o zmiennych źródłach** weryfikować względem **zarchiwizowanego dowodu**, nie strony na żywo | **P1** | S | Dziś Brent daje fałszywą „rozbieżność”, bo strona Trading Economics się zmienia. Archiwum dowodów już mamy (`docs/evidence/`). |
| R4 | Przegląd 77 źródeł „roboczych” przez redaktora, naprawa etykiety „Reuters” (adres prowadzi do daily-sun.com) | **P1** | M | Dotyczy wiarygodności źródeł. Wymaga agenta `redaktor` (nieskalibrowany, patrz R6). |
| R5 | Hasła glosariusza: 14 skrótów bez definicji (UE, CPN, WIG20, MFW, UKMTO, PIE, GW, VAT, FOMO, IEA, IRENA, KE, PMI, GPW) i 12 haseł roboczych do potwierdzenia | **P1** | M | Zasada 7. Część stron (MFW, UKMTO, GPW) blokuje pobranie, więc potrzebne inne źródła pierwotne. |
| R6 | **Kalibracja agentów** `redaktor` i `weryfikator-faktow` na złotym zbiorze na żywo | **P1** | S–M | Agenci są napisani, ale nigdy nie przetestowani na żywo. Warunek rozsądnego użycia ich przy większej liczbie treści (mapa, M1+). |
| R7 | 8 twierdzeń niedostępnych maszynowo (strony blokujące boty): migawki/API (V4) | P2 | L | Zależy od `docs/data-sources-architecture.md` (zadanie badawcze). |
| R8 | Źródła pierwotne dla terminów RPP i GUS 30.11 w kalendarzu (B3) | P2 | S | Dziś źródła wtórne. Potrzebny stały adres kalendarza NBP i GUS. |
| R9 | Generowana sekcja „Źródła” z rejestru (dziś ręczna lista w szablonie) | P3 | S | Porządek, nie wartość dla czytelnika. |

### B. Mapa: zależności i codzienne tematy (backlog PO: `docs/map-backlog.md`)

| ID | Pozycja | Priorytet | Koszt | Dlaczego i zależności |
|---|---|---|---|---|
| M0-4 | „Pokaż 2 kroki” (ścieżki z grafu) | P2 | S | Fajny dodatek do już działającej interakcji. |
| M0-6, M0-7 | Zewnętrzne źródła mechanizmów krawędzi; zależności dla „Dług publiczny” | P2 | M | Wzmacnia zaufanie do mapy; „Dług” to dziś jedyny węzeł bez zależności. |
| M1-1 | **Zadanie badawcze NBP**: licencja i format (kredyty hipoteczne i konsumpcyjne, ceny mieszkań) | **P1** | S | Warunek całej fali M1. Najlepsze dane pierwotne spośród nowych tematów. |
| M1-0 | **Widok „Codzienność”** (plansza grup obok „Świat”) | **P1** | M–L | Warunek wszystkich nowych węzłów. Wymaga projektu komponentu, zrzutów i testów. |
| M1-2…6 | Węzły: kredyt hipoteczny, mieszkania, kredyt gotówkowy, lokaty, czynsze i najem | **P1** | L | Duża wartość dla laika. Po M1-0 i M1-1. Fala 3–5 węzłów. |
| M2 | Jedzenie: żywność ogółem, owoce i warzywa (GUS ceny detaliczne, MRiRW) | P1/P2 | L | Zależy od badania dostępu do danych GUS. |
| M3 | Usługi, zdrowie, restauracje, energia w domu (GUS CPI) | P2 | L | Najpierw potwierdzić liczby medialne w komunikatach GUS. |
| M4 | Auta, OC, obligacje, emerytury, płaca minimalna, pożyczki, podatki | P2/P3 | L | OC bez źródła, auta głównie dane prywatne, pożyczki wymagają decyzji o tonie (już: neutralny). |

### C. Nowe grupy poza łańcuchem cen (`docs/data-topics.md`, D19)

| ID | Pozycja | Priorytet | Koszt | Dlaczego i zależności |
|---|---|---|---|---|
| N4 | **IMGW jako pilotaż danych automatycznych** (stany rzek, opady) | P2 | M | Przetestowałoby model „dane odświeżane automatycznie” (łączy się z R2). Najpierw regulamin IMGW. |
| N5, N6 | Woda na mieszkańca, susza w skali roku | P2 | M | D19: wchodzą na równi z innymi, ton bez zmian. Po N4. |
| N3, N7 | Ziemia rolna, jakość powietrza | P3 | M | Pośrednie powiązanie z gospodarką (ryzyko „naciągane”). |

### D. Edukacja i doświadczenie czytelnika (`docs/expansion-ideas.md`)

| ID | Pozycja | Priorytet | Koszt | Dlaczego i zależności |
|---|---|---|---|---|
| E1 | **Tryb spokojny i dostępność** (wersje tekstowe wykresów, wysoki kontrast, bez animacji, większa czcionka, czytnik ekranu) | **P1** | M | Ostatnia niezrobiona pozycja fali A. Ułatwia dotarcie do osób przeciążonych i z niepełnosprawnościami. Lepiej zrobić, zanim strona urośnie. |
| E2 | **Kanał opinii** (zwykły feedback, D18) | **P1** | S | Decyzja jest, wdrożenia nie. Bez tego nie wiemy, czy strona pomaga. Wymaga wskazania kanału (patrz pkt 5, D4). |
| E3 | **Test na prawdziwych odbiorcach i urządzeniach** (krok 5 planu, po stronie właściciela): telefon, przeciąganie, zrozumiałość „Decyduje / Dotyczy” | **P1** | S (Twój czas) | Tylko Ty możesz to zrobić. Wiele rzeczy sprawdziłem testami, ale nie na prawdziwym telefonie. |
| E4 | Biblioteka „ta sama liczba, dwa nagłówki” (kilkanaście par z faktem i źródłem) | P2 | M | Rdzeń marki. Wymaga weryfikacji treści (test sensu) i kalibracji agentów (R6). |
| E5 | „Uczę się”: ścieżki po 2 minuty z pytaniem sprawdzającym | P2 | L | Największa wartość edukacyjna, największy koszt. Po R6. |
| E6 | Mój profil (lokalny), dane otwarte, RSS | P3 | S–M | Wygoda, nie fundament. |
| E7 | „Twoja inflacja” (wagi GUS), długi horyzont i UE | P3 | L | Wymaga danych z API (GUS BDL, Eurostat) i badania narzędzia GUS. |
| E8 | Tryb nauczyciela, wersja EN | P3 | L | Odłożone (D18). |

### D2. Tematy edukacyjne o największym wpływie (research 26.11.2026: `docs/topics-research.md`)

| ID | Pozycja | Priorytet | Koszt | Dlaczego i zależności |
|---|---|---|---|---|
| S1 | **Uważaj na oszustwa finansowe** (fałszywe inwestycje, phishing; linki do list ostrzeżeń CERT i KNF) | **P1** | S–M | Najwyższy wpływ na jakość życia, ryzyko polityczne zerowe, dane i źródła dostępne |
| S2 | **„Szkoła liczb”**: realnie vs nominalnie, „inflacja spadła ≠ ceny spadły”, procenty vs punkty procentowe, średnia vs mediana, RRSO | **P1** | M | Karty na istniejących komponentach; ta sama liczba daje różne wrażenie zależnie od miary |
| S3 | Rachunek za prąd i kredyt (składniki, RRSO) | **P1** | M | Łączy się z M1 i kalendarzem; dane URE i NBP |
| S4 | Tematy polaryzujące (dług i deficyt, emerytury, fundusze UE, podatki i klin) z **protokołem neutralności** i testem lustrzanym | P2 | L | Wymaga akceptacji zasad neutralności (D1 w topics-research) |
| S5 | Migracja a ZUS i budżet; euro | P3 | L | Najwyższe ryzyko polityczne, dopiero po przećwiczeniu protokołu |

### E. Jakość techniczna i porządek

| ID | Pozycja | Priorytet | Koszt | Dlaczego |
|---|---|---|---|---|
| T1 | **Skaner nagłówków** (B1): ustalić, co nie działa, naprawić i pokazać | P2 | S–M | Schowany. Nie odtworzyłem usterki, potrzebne szczegóły od właściciela. |
| T2 | Sprzątanie 13 zdalnych gałęzi (po scaleniu są niepotrzebne) | P2 | S | Porządek w repozytorium. |
| T3 | Kontrola unikalności klas CSS w lincie (B4) | P3 | S | Trzy kolizje nazw w tej sesji, więc tania ochrona. |
| T4 | Skrócenie wysokości kart par nagłówków na telefonie (B5, ok. 1160 px) | P3 | S–M | Czytelność. |
| T5 | Aktualizacja wersji akcji w CI (ostrzeżenie o wycofaniu Node 20) | P3 | S | Na razie tylko ostrzeżenie. |

## 4. Rekomendowana kolejność (iteracje)

Iteracja to zestaw małych PR-ów, nie czas kalendarzowy.

| Iteracja | Zakres | Cel |
|---|---|---|
| **1: zaufanie teraz** | R1 (aktualizacja danych), R3 (dowody dla zmiennych źródeł), E3 (Twój test na telefonie), T2 (sprzątanie gałęzi) | Strona znów jest aktualna i uczciwie to pokazuje; wiemy, jak działa na prawdziwym urządzeniu |
| **2: fundament jakości** | R2 (cykl aktualizacji, wariant wg decyzji D1), R6 (kalibracja agentów), E1 (tryb spokojny i dostępność), E2 (kanał opinii) | Strona utrzymuje się sama, mierzymy jakość, zamykamy falę A |
| **3: rzetelność treści** | R4 (przegląd źródeł), R5 (hasła), R8 (źródła terminów) | Domknięte zaległości zasady 7 i 8 |
| **4: Dom i kredyty** | M1-1 (badanie NBP), M1-0 (widok „Codzienność”), M1-2…6 (3–5 węzłów) | Pierwsza duża wartość nowych tematów |
| **5: Jedzenie i dalej** | M2, M0-4, M0-6/7, N4 (pilotaż IMGW) | Kolejne tematy i dane automatyczne |
| **6: nauka i usługi** | M3, E4 (biblioteka dwóch nagłówków), E5 („Uczę się”) | Wartość edukacyjna |
| **później** | M4, N5–N7, E6–E8, T1, T3–T5, R7, R9 | |

**Dlaczego tak:** strona obiecuje aktualne, sprawdzone dane. Wszystko, co zwiększa liczbę tematów (mapa), mnoży też to, co trzeba aktualizować i weryfikować, więc najpierw cykl aktualizacji i jakość (iteracje 1–3), a potem rozbudowa (4+). Dostępność (E1) i kanał opinii (E2) są tanie względem wartości, a później ich brak będzie kosztować więcej.

## 5. Decyzje właściciela

| # | Pytanie | Rekomendacja |
|---|---|---|
| D1 | Aktualizacja danych: **R2a** (uruchamiana ręcznie na Twoje polecenie, np. raz w tygodniu) czy **R2b** (harmonogram w chmurze)? | R2a na start (oszczędza limit), R2b po kalibracji agentów (R6) |
| D2 | Kolejność: **jakość najpierw** (iteracje 1–3) czy **mapa najpierw** (iteracja 4 wcześniej)? | Jakość najpierw |
| D3 | Wykonać R1 (aktualizacja danych) **teraz**? | Tak, to P0 |
| D4 | Kanał opinii (E2): jaki? (np. adres e-mail do kontaktu, formularz zewnętrzny, link do zgłoszeń w repozytorium). Nie wymyślam adresu | Zwykły link/e-mail wskazany przez Ciebie, bez zbierania danych |
| D5 | Skaner (T1): na jakim urządzeniu i z jakim nagłówkiem nie działał? | Bez tego zostaje schowany |
| D6 | Czy pytanie o język EN i analitykę zostaje „nie” (PLAN §7)? | Tak: PL, bez analityki (zgodnie z D18) |

## 6. Czego ten plan nie obejmuje

Czas kalendarzowy (nie znam Twojej dostępności i limitu użycia), koszt hostingu (Pages jest bezpłatne) oraz pozycje, które pojawią się po testach z odbiorcami (E3), bo mogą zmienić priorytety.
