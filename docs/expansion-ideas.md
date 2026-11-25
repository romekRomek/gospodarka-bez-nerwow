# Jak rozbudować stronę, trzymając się naszych zasad

Status: **propozycja do decyzji** (25.11.2026). Research własny (wyszukiwania + stan repozytorium), bez uruchamiania agentów. Wszystko, co jest tu faktem z badań, ma link. Gdzie szczegół wymaga sprawdzenia w źródle, jest to zaznaczone.

## 1. Co mówią badania (i co z tego wynika dla nas)

| Ustalenie | Źródło | Wniosek dla strony |
|---|---|---|
| **Szczepienie przed manipulacją (prebunking) działa.** Krótkie, zabawne filmy o *technikach* manipulacji (emocjonalny język, fałszywe dylematy, kozły ofiarne) poprawiły rozpoznawanie technik o ok. 5% w eksperymencie terenowym na YouTube (22 632 osoby) i w sześciu badaniach losowych (6 464 osoby). Przykłady były fikcyjne i niepolityczne, żeby nie wywoływać obrony. | [Science Advances 2022, Roozenbeek i in.](https://pmc.ncbi.nlm.nih.gov/articles/PMC9401631), [omówienie (Bristol)](https://www.bristol.ac.uk/news/2022/august/misinformation-media-release.html) | Mocno uzasadnia to, co już mamy: parodie nagłówków, „technika dnia", wymyślone przykłady. Kierunek „Uczę się" ma dowody. |
| **Unikanie newsów rośnie.** W raporcie z 2022 r. 38% badanych w wielu krajach czasem lub często unika wiadomości (29% w 2017). W Polsce głównym powodem unikania była według omówień nierzetelność lub stronniczość, a nie przygnębiający nastrój (do weryfikacji w raporcie). | [Reuters Institute, Digital News Report 2022](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2022/dnr-executive-summary), [WAN-IFRA](https://wan-ifra.org/2022/06/digital-news-report-2022-news-avoidance-is-rising-as-publishers-struggle-to-engage-the-young/) | Odbiorca nie potrzebuje więcej newsów, tylko **zaufania i spokoju**. Przejrzystość metodologii i korekt jest więc równie ważna jak treść. Dane są z 2022 r.; są nowsze edycje (nasza lista źródeł cytuje raport 2026). |
| **Dziennikarstwo konstruktywne poprawia nastrój, ale ma koszt.** W przeglądzie 14 badań 13 pokazało więcej pozytywnych i mniej negatywnych emocji. Wpływ na zaufanie jest mieszany, a jedno badanie wykazało **gorsze rozumienie** treści w wersji konstruktywnej. | [Constructive Institute, przegląd badań](https://constructiveinstitute.org/research-overview/), [systematyczny przegląd (Grady/UGA)](https://grady.uga.edu/?p=4404) | Potwierdza ostrożność z D5 (bez „dobrych i złych wiadomości") i z D17: nie dociskamy pozytywów, bo kosztem może być zrozumienie. Otucha ma wynikać z kontekstu i dat, nie z nastroju. |
| **GUS zapowiadał eksperymentalny kalkulator inflacji indywidualnej** (tylko informacyjny, nie oficjalny wskaźnik). Koszyk to ponad 800 pozycji w 12 grupach, wagi z badania budżetów gospodarstw domowych, aktualizowane co roku. | [PAP](https://www.pap.pl/aktualnosci/pod-koniec-roku-gus-ma-udostepnic-kalkulator-inflacji-indywidulanej), [GUS: komunikat o koszyku](https://stat.gov.pl/dla-mediow/komunikaty-prasowe/komunikat-w-zwiazku-z-powielaniem-w-mediach-nieprawdziwych-informacji-dotyczacych-obliczania-inflacji-w-szczegolnosci-doboru-koszyka-dobr-i-uslug,142,1.html) | „Twoja inflacja" ma sens, ale **najpierw trzeba sprawdzić, czy narzędzie GUS już działa** (wyniki mówią „miało być udostępnione", nie że jest). Jeśli tak, lepiej do niego prowadzić niż budować własne. |
| **Polska szkoła ma edukację ekonomiczną w podstawie programowej** („Podstawy przedsiębiorczości"), a NBP i inne instytucje publikują materiały dla nauczycieli. | [podstawa programowa (ZPE)](https://zpe.gov.pl/podstawa-programowa/szkola-ponadpodstawowa/podstawy-przedsiebiorczosci), [NBP: materiały](https://nbp.pl/wp-content/uploads/2023/03/dzialanosc-edukacyjna.pdf) | Tryb nauczyciela ma realny odbiorca, ale powiązania z podstawą programową trzeba zweryfikować w dokumencie, zanim cokolwiek obiecamy. |

## 2. Filtr: jak oceniamy pomysły

Pomysł wchodzi na listę tylko wtedy, gdy spełnia **wszystkie**:
1. Zgodny z zasadami z `CLAUDE.md` i `docs/design/principles.md`: fakt przed interpretacją (I3), liczba = źródło + pewność (I4), poziomy zamiast ściany tekstu (I5), bez dobrych i złych wiadomości (T1), zaproszenie, nie nakaz (T7), tylko tokeny i komponenty (S1, S2).
2. **Weryfikowalny automatycznie** (D17): da się go sprawdzić kodem i agentem z rubryką, bez udziału właściciela.
3. Nie wymaga kont, śledzenia ani miar zaangażowania (wartość strony to spokój, nie czas spędzony).
4. Ma niski koszt utrzymania świeżości danych (korzysta z tego, co już mamy, albo z dostępnych źródeł).

## 3. Pomysły (14), ocenione

Wartość: ★ niska, ★★ średnia, ★★★ wysoka dla celu „rozumieć gospodarkę bez nerwów". Wysiłek: S (dni), M (tydzień), L (kilka tygodni).

| # | Pomysł | Wartość | Wysiłek | Dane i zależności | Zgodność i ryzyko |
|---|---|---|---|---|---|
| 1 | **„Jak to sprawdzamy" + Dziennik korekt**: strona z metodologią (poziomy źródeł, wskaźnik pewności, dowody) i publiczną listą korekt (np. dwie dzisiejsze: „oczekiwał +3,6%", Brent 92,6) | ★★★ | S | `sources.json`, `docs/decisions.md`, `docs/evidence/`; już istnieje | Wprost odpowiada na przyczynę unikania newsów (zaufanie). Ryzyko: odsłania błędy, ale to jest cel. |
| 2 | **Słownik pojęć**: osobna strona ze wszystkich haseł `terms.json` (z linkiem do źródła definicji) | ★★ | S | `terms.json` (14 haseł, źródła do uzupełnienia) | Zero nowej treści redakcyjnej. Wymaga zweryfikowanych definicji. |
| 3 | **Kalendarz „Najbliższe 30 dni"**: zbiorczy widok wydarzeń z `soon.events` (RPP 2.12, Fed 8–9.12, Eurostat 17.12, koniec limitu cen…) | ★★★ | S | `soon` w 13 węzłach, `cadence` źródeł | Odpowiada „co może o tym zadecydować" i uspokaja (znane daty). Ryzyko: daty muszą być weryfikowalne (dziś RPP 2.12 jest niepotwierdzone). |
| 4 | **Tryb spokojny i dostępność**: wersje tekstowe wykresów, wysoki kontrast, bez animacji i emoji, większa czcionka, czytnik ekranu | ★★★ | M | tokeny, `prefers-reduced-motion` już respektowane | Zasady A1–A5. Ułatwia dotarcie do osób, które unikają newsów z powodu przeciążenia. |
| 5 | **Uczę się**: ścieżki po 2 minuty („jak czytać liczbę", „jak działa klikbajt", „co to inflacja"), każda z jednym pytaniem sprawdzającym, postęp lokalnie | ★★★ | L | techniki, ramowanie, parodie z `headlines.json`; nowa treść | Wsparte dowodami (prebunking). Ryzyko: duża nowa treść, więc potrzebna weryfikacja V2. Zaplanowane w D4. |
| 6 | **Biblioteka „Ta sama liczba, dwa nagłówki"**: rozbudowa karty ramowania do kilkunastu par, każda z faktem i źródłem | ★★★ | M | `news.json` (pary pos/neg do migracji), `headlines.json` | Rdzeń marki. Ryzyko: pary muszą być obie prawdziwe wobec faktu (test sensu). |
| 7 | **Mój profil (lokalny)**: kierowca, kredytobiorca, pracownik, przedsiębiorca; wyróżnia pasujące „Dotyczy" i wydarzenia | ★★ | M | pola `concerns` i `soon` (już są) | Bez kont, tylko pamięć lokalna. Ryzyko: nie wolno sugerować działań (T7). |
| 8 | **„Twoja inflacja"**: link do narzędzia GUS (jeśli działa) albo kalkulator z wagami GUS | ★★★ | M–L | wagi i indeksy grup z GUS (BDL), do zweryfikowania, czy narzędzie GUS istnieje | Praktyczne i edukacyjne. Ryzyko: własny kalkulator to „wskaźnik zbiorczy" (D15), więc wymaga jasnej etykiety „informacyjnie, nie oficjalnie". |
| 9 | **Długi horyzont i porównanie z UE**: 10 i 30 lat dla CPI, płac realnych, stóp; Polska na tle UE | ★★★ | L | API GUS, NBP, Eurostat (faza V4, `data-sources-architecture.md`) | Uspokaja (kontekst historyczny) bez oceniania. Zależy od maszynowego dostępu do źródeł. |
| 10 | **Tryb nauczyciela**: karty pracy, wydruk, scenariusz lekcji, powiązanie z podstawą programową | ★★ | L | `terms`, techniki, ścieżki z pkt 5; **do zweryfikowania** zapisy podstawy programowej | Realna grupa odbiorców. Ryzyko: obietnice zgodności z programem tylko po weryfikacji w dokumencie. |
| 11 | **Dane otwarte**: pobranie węzłów i źródeł jako JSON lub CSV z poziomem pewności | ★★ | S | `steps.json`, `sources.json`, pewność | Zwiększa weryfikowalność przez innych. Ryzyko: odpowiedzialność za cudze użycie, więc licencja i uwaga o charakterze edukacyjnym. |
| 12 | **Cotygodniowy digest (RSS)**: „Dziś w 60 sekund" jako plik RSS, bez powiadomień push | ★★ | S | `dist`, data z buildu | Dla osób, które chcą spokojnie, bez alarmów. Bez śledzenia. |
| 13 | **Pytanie zwrotne „Czy po lekturze czujesz się spokojniej?"** (jedno kliknięcie, lokalnie lub anonimowo) | ★★ | S | brak | Prywatna miara wartości zamiast analityki zaangażowania. Decyzja o formie zbierania odpowiedzi należy do właściciela. |
| 14 | **Wersja EN** | ★ | L | wszystkie teksty, źródła polskie | Najpierw dopracować PL i weryfikację. Nie teraz. |

## 4. Czego świadomie NIE robimy

- **Powiadomienia push o „alarmach"**, liczniki serii, gamifikacja czasu spędzonego (sprzeczne z „bez nerwów").
- **Komentarze użytkowników i media społecznościowe** (rodzą się w nich dokładnie te dynamiki, przed którymi strona ma chronić).
- **Reklamy i analityka zaangażowania** (zachęta do klikbajtu).
- **Własne prognozy, porady inwestycyjne, rekomendacje produktów** (nie mamy podstaw i naruszają zasady).
- **Własny wskaźnik zbiorczy** pokazywany jako oficjalna miara (D15). Dopuszczalne tylko narzędzia jawnie informacyjne, z wagami i źródłami (pkt 8).
- **Czat AI doradzający odbiorcy** (nie da się go zweryfikować automatycznie, a błąd kosztuje zaufanie).

## 5. Rekomendowana kolejność

**Fala A: małe, z istniejących danych, wysokie zaufanie (1–3 tygodnie pracy w sumie)**
1. **Jak to sprawdzamy + Dziennik korekt** (#1). Najtańsze i najsilniej odpowiada na wyniki badań o zaufaniu.
2. **Kalendarz 30 dni** (#3). Gotowe dane, od razu użyteczne.
3. **Słownik pojęć** (#2), wraz z uzupełnieniem źródeł definicji.
4. **Tryb spokojny i dostępność** (#4), zanim strona urośnie.

**Fala B: wartość edukacyjna (po weryfikacji V2, bo to dużo nowej treści)**
5. **Biblioteka dwóch nagłówków** (#6) i **Uczę się** (#5), obie z testem sensu i złotym zbiorem.
6. **Mój profil** (#7), **dane otwarte** (#11), **RSS** (#12).

**Fala C: wymaga dostępu do danych lub partnerów**
7. **Długi horyzont i UE** (#9) oraz **Twoja inflacja** (#8), po fazie V4 (API) i sprawdzeniu narzędzia GUS.
8. **Tryb nauczyciela** (#10), po zweryfikowaniu podstawy programowej i ewentualnej konsultacji z nauczycielami.
9. **Pytanie zwrotne** (#13), gdy zdecydujesz o formie zbierania. **EN** (#14) na końcu.

## 6. Do Twojej decyzji (tylko to, czego nie rozstrzygnie reguła)

1. **Kolejność:** czy fala A jako pierwsza, czy ważniejsze jest od razu „Uczę się" (największa wartość, największy koszt)?
2. **Pytanie zwrotne (#13):** czy chcesz w ogóle jakąkolwiek miarę odbioru (nawet anonimową), czy strona ma pozostać zupełnie bez zbierania danych?
3. **Dziennik korekt (#1):** czy publikujemy korekty jawnie na stronie (rekomendacja: tak, to buduje zaufanie), czy tylko w repozytorium?
4. **Tryb nauczyciela (#10):** czy to grupa, na której Ci zależy, czy zostawiamy na później?

## 7. Do sprawdzenia, zanim zaczniemy odpowiednie pozycje

- Czy narzędzie GUS „inflacja indywidualna" faktycznie działa i pod jakim adresem (wyszukiwanie mówi tylko o zapowiedzi).
- Dokładne zapisy podstawy programowej „Podstawy przedsiębiorczości" (które treści pokrywamy).
- Najnowsza edycja Digital News Report dla Polski (dane o unikaniu newsów w tym dokumencie są z 2022 r.).
- Dostępność i licencje API GUS (BDL), NBP i Eurostatu (zadanie badawcze w `data-sources-architecture.md`).
