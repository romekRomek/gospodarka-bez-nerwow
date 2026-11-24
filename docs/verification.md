# Weryfikacja treści bez udziału właściciela

Status: **projekt** (24.11.2026), decyzja D17. Cel: informacje w aplikacji (liczby, twierdzenia, pytania, teksty) mają być sprawdzane automatycznie, **z dowodem**, a człowiek ma dostawać tylko decyzje, których nie da się podjąć regułą. Dziś robi to w większości ręcznie koordynator (tak wyszły niezgodności z `docs/node-fields-review.md`), więc potrzebujemy to zautomatyzować.

## Zasada

Każda treść wchodzi do aplikacji tylko wtedy, gdy przejdzie trzy warstwy: **kod** (deterministycznie), **niezależny agent** (z rubryką i dowodami) i dopiero w ostateczności **człowiek**. Wynik zawsze zawiera dowód (fragment źródła, data pobrania, adres), a nie samo „zgadza się".

## Warstwa 1: kod, bez modelu (powtarzalna, tania, w CI przy każdej zmianie)

| Kontrola | Co łapie | Stan |
|---|---|---|
| Schematy, id, pola, T7 formalnie (długość, jedno „?"), zakazane frazy, chronologia, źródła w rejestrze, `primary`, `conf` | błędy struktury i formy | **jest** (`validate.py`, 103 testy) |
| **Rejestr twierdzeń (`claims`)**: każda liczba z `m`, `mc`, `f`, nagłówków i wykresów ma wpis `{węzeł, pole, wskaźnik, okres, wartość, jednostka, src, anchor, rodzaj}` | liczby bez źródła, bez okresu, bez jednostki | do zrobienia |
| **`verify_claims.py`**: pobiera źródło (HTML, PDF, XLSX), szuka wskaźnika, okresu i wartości w tym samym fragmencie, zapisuje dowód (fragment, data, adres, skrót) | liczba, której nie ma w źródle (np. „9 405 zł" nie w tekście strony GUS) | do zrobienia (ręcznie robił to W3) |
| **Wyliczenia**: twierdzenie pochodne ma wzór, skrypt je przelicza | „ok. 20% mniej" przy faktycznych −18,7%, „+31%" przy +26% | do zrobienia |
| **Spójność między plikami**: ta sama wielkość (wskaźnik + okres) w `steps`, `news`, `headlines`, `problems`, `charts`, `changelog` ma jedną wartość | +3,9% w dzienniku zmian vs +4,1% w węźle; deficyt 7,3% vs 7,2% | do zrobienia |
| **Język atrybucji**: wzorce „oczekiwał", „według ekspertów", „analitycy", „prognozują" wymagają twierdzenia ze źródłem i cytatem | „rynek oczekiwał +3,6%" (w źródle to wzrost wyrównany sezonowo) | do zrobienia |
| **Aktualność**: wiek wartości względem `cadence`, alert, gdy źródło wydało nowszy odczyt | przestarzałe liczby | częściowo (`confidence.py`) |
| **Martwe i zmienione linki** (`validate.py --links`), zmiana treści strony względem skrótu z dowodu | zmiany i rewizje źródeł | częściowo |

## Warstwa 2: niezależny agent z rubryką (rozumie sens, ale może się mylić)

Agenty nie widzą rozumowania autora, dostają tylko treść, dowód i rubrykę. Wynik: werdykt, uzasadnienie z cytatem, pewność (wysoka / niska). Niska pewność przechodzi do człowieka.

**`weryfikator-faktow`**: czy znaleziony fragment dotyczy **tego samego wskaźnika, okresu i jednostki** (to, czego kod nie rozróżni: r/r czy wyrównany sezonowo, kontrakt czy spot, prognoza czy odczyt).

**`redaktor`**: rubryka dla każdej treści redakcyjnej, w tym dla pytań „Dla Ciebie":

| # | Kryterium pytania | Przykład złego → dobrego |
|---|---|---|
| R1 | **Powiązanie z liczbą:** odpowiedź czytelnika wskazuje, jak ta liczba go dotyczy | „Czy w okolicy trwają budowy?" przy PKB (słabe) → „Jak często tankujesz?" przy paliwach |
| R2 | **Z głowy w 3 s**, bez liczenia i porównań ze średnią | „Jak Twoja sytuacja wypada na tle średniej?" |
| R3 | **Jedno pytanie**, bez presji, rady i wartościowania | |
| R4 | **Nie dotyka tematów wrażliwych:** wojny, uchodźców, zdrowia, poglądów, pochodzenia, szczegółów finansów | „Czy mieszkają u Ciebie osoby z Ukrainy?" |
| R5 | **Nie zakłada sytuacji** (ma naturalną odpowiedź dla osoby, której to nie dotyczy) | „Jakim paliwem jeździ Twoje auto?" zakłada auto |
| R6 | **Bez „dobrych i złych wiadomości"**, zaproszenie a nie nakaz (zasady `CLAUDE.md`) | |

Te same zasady (zamiast pytań) stosuje agent do: parodii nagłówków (bez wskazywania serwisów i osób, bez żartów z wojny), „Czego ta liczba nie mówi" (granica wskaźnika, nie ocena), definicji skrótów (źródło, jedno zdanie) i do wszystkich nowych tekstów.

## Warstwa 3: człowiek (tylko to, czego nie rozstrzygnie reguła)

Do właściciela trafia **zbiorczy raport z propozycją i dowodem**, a nie surowe pytania, i tylko gdy:
1. decyzja jest **wartościowa lub redakcyjna** (nowa zasada, ton, granice tematu),
2. **źródła pierwotne się różnią** i żadne nie jest rewizją drugiego,
3. agent ma **niską pewność** albo dwóch niezależnych agentów się nie zgadza,
4. źródła nie da się sprawdzić automatycznie (np. NBP, GPW, MFW blokują boty, do czasu dostępu przez API; patrz `data-sources-architecture.md`).

## Jak to się uruchamia

- **W każdym PR i przy każdej zmianie danych:** warstwa 1 zawsze, warstwa 2 dla zmienionych treści. Błąd z dowodem blokuje PR, ostrzeżenie trafia do raportu.
- **Cyklicznie (np. co tydzień):** pełny przegląd wszystkich twierdzeń, wykrywanie nowszych wydań źródeł i zmienionych stron. Raport w `docs/runs/rrrr-mm-dd.md`.
- **Dowody** (fragment, data, adres, skrót) trzymamy w repozytorium, żeby każdą liczbę dało się obronić po fakcie, także gdy źródło zmieni stronę.

## Złoty zbiór (do kalibracji agentów)

Agenty testujemy na przypadkach, które już znamy. Agent musi je poprawnie ocenić, zanim dostanie prawo blokowania PR. Pierwsze przypadki (z 24.11.2026):

| Przypadek | Oczekiwany werdykt |
|---|---|
| „Rynek oczekiwał +3,6% r/r" (źródło: wartość wyrównana sezonowo) | błąd: niezgodny sens (nie konsensus) |
| PKB II kw. +4,1% w węźle vs +3,9% w dzienniku zmian | błąd: niespójność |
| „Czy w Twojej okolicy trwają jakieś budowy?" przy PKB | odrzuć (R1) |
| „Czy w Twojej okolicy mieszkają osoby z Ukrainy?" | odrzuć (R4) |
| „Jak często tankujesz?" przy ropie | zaakceptuj |
| „Z jakiej usługi publicznej korzystasz najczęściej?" przy długu | odrzuć (R1) |
| „Brent ok. 90 USD" przy wykresie z 92,6 | zaakceptuj z uwagą (zaokrąglenie) |

## Uczciwe ograniczenia

- **Obecność liczby w źródle nie dowodzi, że to ta sama wielkość.** Dlatego liczy się dowód z okresem i wskaźnikiem oraz agent-semantyk, a nie samo wyszukiwanie liczby.
- **Agent językowy też się myli.** Stąd kalibracja na złotym zbiorze, niezależny drugi agent przy twierdzeniach krytycznych i eskalacja przy niskiej pewności.
- **Pytań nie da się w pełni ocenić regułą.** Reguły łapią formę (długość, „?", frazy), a powiązanie z liczbą i wrażliwość tematu ocenia agent z rubryką. Dopiero zmiana rubryki (nowa zasada redakcyjna) wymaga człowieka.
- **Zablokowane źródła** (NBP, GPW, MFW) i pliki PDF lub XLSX wymagają osobnej obsługi (API, parsery).
- **Weryfikacja nie ocenia, czy samo źródło jest prawdziwe**, tylko czy treść zgadza się ze źródłem. Wiarygodność źródła opisuje poziom w rejestrze i wskaźnik pewności.

## Fazy wdrożenia

| Faza | Zakres | Gotowe, gdy |
|---|---|---|
| V1 | `claims` + `verify_claims.py` + spójność między plikami + język atrybucji + wyliczenia | skrypt wykrywa wszystkie przypadki ze złotego zbioru, które da się złapać kodem (3,9 vs 4,1; 7,3 vs 7,2; „oczekiwał") |
| V2 | agenty `weryfikator-faktow` i `redaktor` z rubrykami, złoty zbiór jako test kalibracyjny | agenci oceniają złoty zbiór poprawnie, a ich raport zawiera dowody |
| V3 | integracja z CI i PR, przegląd cykliczny, raporty `docs/runs/` | PR z błędną treścią jest blokowany z dowodem, a raport tygodniowy powstaje sam |
| V4 | dostęp do źródeł przez API i migawki | zniknięcie wyjątków dla zablokowanych źródeł |
