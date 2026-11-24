# Strategia treści i kierunek UX (szkic do wyboru)

Status: **zatwierdzone 24.11.2026** (decyzje D1–D10 w [`../decisions.md`](../decisions.md); sekcja 4 poniżej jest rozstrzygnięta). Dalsze szczegóły wdrożeniowe: `principles.md`, `components.md`, `content-model.md`. Założenia: dorosły laik, telefon najpierw, **mapa zależności zostaje rdzeniem produktu**.

Trzy cele treści:

1. **Edukacja warstwowa**: najpierw Podstawy i „Więcej", później tryby zaawansowane z większą liczbą szczegółów.
2. **Przeciwdziałanie dezinformacji i manipulacji** (zakładam, że to miałeś na myśli; jeśli chodziło o coś innego, popraw).
3. **Bez dobrych i złych wiadomości** (decyzja z 24.11.2026): nie oceniamy faktów. Pokazujemy, że „dobre” i „złe” to najczęściej ton autora albo sposób wywołania emocji, a ten sam fakt można opowiedzieć jako ulgę lub jako niepokój. Humor jest narzędziem tego samego celu.

## 1. Techniki, które proponuję (od najmocniejszej)

### T1. Warstwy głębokości (progressive disclosure) ★ fundament

Każda treść istnieje na trzech poziomach. Użytkownik wybiera poziom globalnie (przełącznik w nagłówku, zapamiętany lokalnie), a w każdej chwili może rozwinąć „Pokaż więcej" przy pojedynczym bloku.

| Poziom | Nazwa w UI | Co zawiera | Czas |
|---|---|---|---|
| 1 | **Podstawy** | 1 liczba z kontekstem + 1 zdanie „co to znaczy" + kierunek (↑↓→) | 10 s |
| 2 | **Więcej** | 2–3 fakty, interpretacja, wykres z kilku lat, „co to oznacza dla mojego portfela" | 1–2 min |
| 3 | **Szczegóły** | tabela danych, metodologia, definicje, pełne źródła, ograniczenia danych | do 10 min |
| 4 (później) | **Ekspert** | surowe szeregi, porównania międzynarodowe, eksport, linki do API | dowolnie |

Dlaczego to ważne dla skalowania: poziom jest **polem w danych**, nie osobnym projektem. Dodanie trybu Ekspert to dodanie bloków z `level: 4`, bez zmiany układu.

### T2. Modularna treść: typowane bloki

Zamiast ręcznego HTML: treść to lista bloków o typie, poziomie i źródle. Agenci dodają bloki, UI je renderuje komponentami z biblioteki.

```json
{ "type": "fact", "level": 1, "text": "Ropa Brent kosztuje ok. 90 USD.", "src": ["nbp-brent"], "grade": "confirmed" }
{ "type": "interp", "level": 2, "text": "Cena nadal zawiera premię za ryzyko wokół Iranu." }
{ "type": "frame", "level": 1, "fact": "...", "a": {"h": "...", "emotion": "ulga"}, "b": {"h": "...", "emotion": "niepokój"} }
{ "type": "myth", "level": 2, "fact": "...", "myth": "...", "fallacy": "...", "fact2": "..." }
{ "type": "chart", "level": 2, "ref": "charts.derrick" }
{ "type": "term", "id": "stopa-referencyjna" }
```

Typy na start: `fact`, `interp`, `chart`, `frame` (ta sama liczba, dwa nagłówki), `myth`, `term`, `forme` (co to znaczy dla mnie), `source`, `quiz`, `headline` (nagłówek dnia).

### T3. Liczba zawsze z kontekstem (stat tile z benchmarkiem)

Sama liczba („3,5%") straszy albo nic nie mówi. Standardowy kafelek ma: wartość, **zmianę** (rok temu / poprzedni odczyt), **zakres historyczny** (mini-wykres z zaznaczonym „normalnym" pasmem) i etykietę słowną („wysoko / typowo / nisko względem ostatnich 10 lat"). Redukuje panikę i uczy czytania danych.

### T4. „Kto decyduje, kogo dotyczy”, „Obserwuj” i „Co może o tym zadecydować”

Dawna skala wagi (Tło / Obserwuj / Działaj) mieszała kilka spraw. Pierwsza poprawka (etykiety „Mam wpływ / Częściowo / Nie mam wpływu”) została wycofana 24.11.2026, bo oceniała czytelnika (nie pasuje do różnych grup: kierowca, kredytobiorca, przedsiębiorca) i brzmiała fatalistycznie. Obowiązuje model opisujący świat:

- **Decyduje**: kto lub co kształtuje wartość (rynek światowy, RPP, rząd, pracodawcy). Prawdziwe dla każdego odbiorcy.
- **Dotyczy**: kogo to odczuje (kierowców, kredytobiorców, pracowników, firmy).
- **Obserwuj**: tylko gdy jest konkret: wydarzenie z terminem albo wskaźnik (np. „decyzja o programie na 2027 r. w połowie grudnia”, „zatrudnienie w firmach”). Nie powtarza „Decyduje”.
- **Co może o tym zadecydować** (poziom Więcej; decyzja D13 zastąpiła „Do własnych wniosków” z D12, bo było zbyt wyrafinowane): lista najbliższych wydarzeń z datą (np. „połowa grudnia: decyzja o programie na 2027 r.”, „do końca roku: limit cen na stacjach”, „bez terminu: negocjacje USA–Iran”) i jedno łatwe pytanie „Dla Ciebie” (np. „Jak często tankujesz?”), na które laik odpowie z głowy w 3 sekundy. Bez perspektyw, instrukcji, porównań ze średnią i nakłaniania do działania. „Obserwuj” na poziomie Podstawy to najważniejsze z tych wydarzeń.
- Później (po v1): opcjonalny „Mój profil” zapisany lokalnie (kierowca, kredytobiorca, pracownik, przedsiębiorca), który wyróżnia pasujące sytuacje.

### T5. Mapa jako kręgosłup + narracja przewijana (scrollytelling) na telefonie

- Telefon: mapa przypięta u góry (zmniejszona), pod nią kroki łańcucha przewijane palcem. Aktywny krok podświetla węzeł i trasę na mapie.
- Szczegóły węzła w **dolnym panelu** (bottom sheet) zamiast okna modalnego: większa strefa kciuka, widać mapę w tle.
- Desktop: bez zmian układu (mapa + panel), ale z tymi samymi komponentami.
- „Prześledź łańcuch": podświetlenie ścieżki przyczynowej (ropa → paliwa → ceny → stopy → pensje) z jednym kliknięciem. Obecna autoprezentacja zostaje jako tryb „Oprowadź mnie".

### T6. Szczepienie przed manipulacją (prebunking) zamiast dementowania po fakcie

Badania nad odpornością na dezinformację pokazują, że skuteczniej uczyć **technik** wcześniej niż gasić pojedyncze mity.

- **Technika dnia**: krótka karta (jedna z ośmiu sztuczek) z przykładem w nagłówkach i „jak to rozpoznać".
- **Struktura dementi „fakt → mit → mechanizm → fakt"**: zaczynamy od prawdy, mit nazywamy raz, tłumaczymy, dlaczego działa, i wracamy do faktu (zgodnie z zaleceniami *Debunking Handbook*).
- **Oznaczenia pewności** przy twierdzeniach: *Potwierdzone / Szacunek / Sporne / Prognoza*. Pokazują uczciwie, co wiemy.
- **Czytanie poziome** („sprawdź w innym miejscu"): link do źródła pierwotnego przy każdej liczbie i krótkie „jak to sprawdzić w 30 s".
- Zostają: skaner nagłówków i „5 pytań, zanim klikniesz", ale jako narzędzia z poziomu „Więcej".

### T7. Ramowanie zamiast „dobrych i złych wiadomości"

Zmiana kierunku z 24.11.2026: w aplikacji nie ma kategorii „dobra” ani „zła” wiadomość. To oznacza, że:

- **Karta „Ta sama liczba, dwa nagłówki”**: jeden fakt, dwa prawdziwe nagłówki o przeciwnym tonie (np. „Inflacja hamuje: 3,5% zamiast 4,1%!” i „Inflacja wciąż powyżej celu NBP”). Pod spodem ten sam fakt, „Po ludzku” i co każdy nagłówek akcentuje oraz jaką emocję wywołuje. Uczy rozpoznawać ramowanie (*framing*).
- **Radość też bywa manipulacją.** Techniki typu „Pozytywny wykrzyknik” i „Prawdziwy, ale wybrany fakt” traktujemy tak samo jak katastrofizację.
- **Kierunek strzałką i słowem, bez wartościowania.** Kafelki i bilans zmian pokazują ↑ ↓ →, nie „lepiej” i „gorzej”.
- **Opis świata, nie ocena czytelnika:** „Decyduje”, „Dotyczy”, „Obserwuj” i „Co może o tym zadecydować” (T4) pokazują kontekst dla różnych sytuacji i zostawiają wnioski czytelnikowi, nie odpowiadają na „czy to dobre?” ani nie każą działać.
- **Haczyk uczciwości** zmienia się w „Czego nagłówek nie mówi”.
- **Szerokie ujęcie** zostaje (przełącznik „10 / 30 lat”), ale jako narzędzie kontekstu, nie pocieszenia.

Skutki dla istniejącej treści (do decyzji w fazie 0): zakładka „Newsy” ma dziś sekcję „Odtrutka: dobre wiadomości” (`good.json`), a `news.json` dzieli nagłówki na `pos` / `neu` / `neg`. Trzeba je przepisać na pary ramowań i techniki, albo świadomie zostawić jako przykłady ramowania.

### T11. Wskaźnik pewności danych

Przy każdej liczbie stoi wskaźnik (3 kropki i słowo: Wysoka / Średnia / Niska) z jednozdaniowym powodem. Po rozwinięciu (poziom Więcej) widać cztery czynniki:

| Czynnik | Wartości |
|---|---|
| Źródło | pierwotne (GUS, NBP, Eurostat, WHO) / agencje i duże media / wtórne |
| Aktualność | względem rytmu publikacji źródła, nie kalendarza |
| Zgodność źródeł | zgodne / małe różnice / podają różne wartości |
| Rodzaj danych | pomiar / wyliczenie / szacunek / prognoza |

Zasady: wynik liczy **skrypt** z rejestru źródeł (`sources.json`) i pól w danych, nie model, więc jest powtarzalny i sprawdzalny. Brak źródła pierwotnego albo rozbieżność źródeł obniża wynik, a nie jest ukrywana. Oznaczenia twierdzeń w tekście (Potwierdzone / Szacunek / Sporne / Prognoza) opisują rodzaj pojedynczego twierdzenia, wskaźnik opisuje całą liczbę. Przykład z danych z 24.11: Brent ma „Średnią” (dwie wartości w danych: ok. 90 i 92,6 USD, cena zmienna), CPI „Wysoką” (GUS, odczyt finalny).

### T12. Nagłówek dnia (humor)

Jeden z kilku wymyślonych, przesadzonych nagłówków powiązanych z dzisiejszymi liczbami (paliwa, giełda, PKB). **Tytułem karty jest absurdalna parodia klikbajtu** (pole `abs` w `headlines.json`, np. „dystrybutory same chodzą po stacji”). Pod nią widać „Parodiuje klikbajt” (pole `h`, typowy klikbajt), „Co odzwierciedla” (emocja `e` i wyjaśnienie `i`) oraz „Po ludzku” (fakt `calm` i puenta `lol`). Nie ma przycisku „Podkręć”, bo tytuł jest już maksymalnie przesadzony. Zasady: humor celuje w ton nagłówka, nie w ludzi, wojnę ani konkretne redakcje; nagłówki są wymyślone i tak oznaczone; liczby w wyjaśnieniu są prawdziwe i mają źródło. Baza treści jest już w `headlines.json` (pola `h`, `abs`, `lol`, `calm`), a nowe pozycje pisze agent i sprawdza `redaktor`.

### T8. Mikro-nauka w kontekście

- **Słowniczek w kontekście**: pojęcie (inflacja, stopa referencyjna, CPI) podkreślone, na tapnięcie wyskakuje definicja w jednym zdaniu (poziom Podstawy) z linkiem „więcej".
- **Ścieżki nauki**: np. „5 lekcji po 2 minuty: skąd bierze się cena paliw", każda kończy się jednym pytaniem sprawdzającym. Postęp lokalnie w przeglądarce, bez kont.
- **Quiz po fakcie**: 1–2 pytania po zakończeniu ścieżki, bez oceniania, z wyjaśnieniem.

### T9. Spokojny design (design for calm)

- Czerwień i ostrzegawcze akcenty tylko dla naprawdę ważnych sygnałów, kierunek zmian pokazujemy strzałką i słowem, nie kolorem alarmu.
- Zwarte akapity (max ok. 65 znaków w linii), jedna idea na ekran, dużo oddechu.
- Animacje wyłącznie funkcjonalne, `prefers-reduced-motion` respektowane.
- Język: krótkie zdania, bez żargonu na poziomach 1–2, poziom 3 ma terminologię z definicjami.

### T10. Wzorce mobilne

Dolna nawigacja (3–4 pozycje), dolny panel, przyklejony pasek „Dziś" z datą aktualizacji i przełącznikiem poziomu, cele dotykowe min. 44 px, brak poziomego przewijania poza samą mapą (która dostaje gest „przybliż/przesuń").

## 2. Rekomendowany kierunek (synteza)

**„Mapa + warstwy"**: mapa pozostaje głównym ekranem, a wszystko inne jest wejściem do niej lub uzupełnieniem.

```
┌ Start ("Dziś w 60 sekund") ────────────────────────────┐
│ 3 kafelki z kontekstem i pewnością (T3, T11) · nagłówek  │
│ dnia (T12) · dwa nagłówki, jeden fakt (T7) · technika    │
│ dnia (T6) · przełącznik poziomu (T1)                     │
└────────────────────────────────────────────────────────┘
     │            │               │               │
  Mapa         Newsy bez       Polska:         Uczę się
 (kręgosłup)   nerwów        problemy &     (ścieżki, słowniczek,
                             dane           quizy, T8)
```

Nawigacja: dolny pasek na telefonie (Start · Mapa · Newsy · Polska · Uczę się), zakładki u góry na desktopie. Obecne trzy zakładki zostają, dochodzą **Start** i **Uczę się**, oba zbudowane z istniejących danych i nowych bloków.

### Dlaczego tak

- Zachowuje to, co działa (mapa, charakter wizualny).
- Dwa poziomy na start (**Podstawy**, **Więcej**) wystarczą do pierwszej wersji. Poziomy 3–4 dochodzą bez zmiany układu.
- Spełnia cel przeciwdziałania manipulacji (ramowanie, humor, pewność danych) na pierwszym ekranie, nie w zakładce na końcu.
- Maksymalnie skalowalne: nowy temat = nowy zestaw bloków, nowa zakładka = lista sekcji.

## 3. Wpływ na pozostałą część planu

- **Model treści** (T2) staje się częścią fazy U i `validate.py`: każdy blok ma `level`, `src` (dla `fact`), `grade`.
- **Agenci** piszą w blokach i poziomach. `redaktor` ocenia osobno poziom 1 (zrozumiałość dla laika) i poziom 3 (precyzja).
- **Scorecard**: dodajemy „odsetek węzłów z kompletem poziomów 1–2" i „odsetek twierdzeń z oznaczeniem pewności".
- **Makiety** (kolejny krok): Start, Mapa (telefon: mapa przypięta + dolny panel), karta węzła na poziomach 1/2/3, ekran „Uczę się", karta dementi.

## 4. Do rozstrzygnięcia

1. Czy ekran **Start** ma być pierwszą zakładką, czy mapa dalej otwiera stronę, a „Dziś" jest paskiem nad nią?
2. Ile poziomów na start: 2 (Podstawy / Więcej) czy od razu 3?
3. Czy „Uczę się" (ścieżki i quizy) wchodzi do pierwszej wersji, czy dopiero po ustabilizowaniu mapy i Startu?
4. ~~Dobre wiadomości~~: rozstrzygnięte 24.11.2026, patrz T7. Zamiast nich ramowanie.
