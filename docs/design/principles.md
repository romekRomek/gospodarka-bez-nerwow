# Zasady UX i treści

Wersja 1.0, 24.11.2026. Obowiązują każdego, kto zmienia aplikację: człowieka i agenta. `strażnik-designu` ocenia zmiany względem tej listy i podaje numer zasady.

Odbiorca: dorosły laik, telefon najpierw, ok. 2 minuty. Cel: rozumieć gospodarkę bez nerwów.

## Zasady informacji

| # | Zasada | Jak to sprawdzić |
|---|---|---|
| I1 | **Jedna liczba na 3 sekundy.** Kafelek i panel mają jedną liczbę główną. Reszta jest kontekstem. | Na zrzucie widać jedną dominującą liczbę. |
| I2 | **Liczba zawsze z kontekstem.** Zmiana, zakres lub norma i słowna ocena. Sama liczba nie wchodzi na ekran. | Każda liczba główna ma pod sobą zmianę lub punkt odniesienia. |
| I3 | **Fakt przed interpretacją.** Interpretacja zawsze ma etykietę „Interpretacja” i kolor `--interp`. | Brak zdań interpretujących poza blokiem interpretacji. |
| I4 | **Liczba = źródło + pewność.** Każda liczba ma źródło z linkiem i wskaźnik pewności danych. | Brak liczby bez `src` i wskaźnika w danych. |
| I5 | **Poziomy zamiast ścian tekstu.** Podstawy: do 40 słów i ok. 10 s. Więcej: ok. 80 słów plus wykres. Szczegóły i Ekspert dopiero na życzenie. | Liczba słów bloków `level:1` ≤ 40 na kartę. |
| I6 | **Jedna idea na ekran.** Na ekranie telefonu nie więcej niż jedna karta „główna” i dwie pomocnicze. | Zrzut 390 px nie pokazuje więcej niż jednej głównej idei. |

## Zasady tonu (bez nerwów)

| # | Zasada | Jak to sprawdzić |
|---|---|---|
| T1 | **Nie ma dobrych i złych wiadomości.** Opisujemy kierunek (↑ ↓ →), skalę i kontekst, nie oceniamy faktu. Wolno pokazać, że „dobre” i „złe” to ton autora. | Brak słów „dobra/zła wiadomość”, brak zielono-czerwonej oceny faktów. |
| T2 | **Kierunek strzałką i słowem, nie alarmem.** Czerwień jest zarezerwowana (`--ext` tylko dla pewności „Niska” i kategorii). Wzrost cen nie jest „na czerwono”. | Przegląd kolorów na zrzucie. |
| T3 | **Opisujemy świat, nie oceniamy czytelnika.** „Decyduje” (kto kształtuje wartość) i „Dotyczy” (konkretne grupy, nie „wszystkich”) są prawdziwe dla każdego. „Obserwuj” tylko z konkretem (wydarzenie, termin, wskaźnik). Nie ma etykiet typu „nie masz wpływu”. | Brak zdań odbierających sprawczość, każda uwaga „Obserwuj” ma konkret. |
| T7 | **Zaproszenie, nie nakaz.** Blok „Co może o tym zadecydować” (poziom Więcej) pokazuje najbliższe wydarzenia z datą (albo „bez terminu”) i jedno łatwe pytanie „Dla Ciebie”. Pytanie musi dać się odpowiedzieć z głowy w 3 sekundy, bez liczenia i bez porównań ze średnią („Jak często tankujesz?”, nie „Jak Twoja sytuacja wypada na tle średniej?”). Bez trybu rozkazującego, presji czasu, porad, prognoz i rekomendacji produktów. | Wydarzenia mają źródło w danych, ≤ 1 pytanie, brak „powinieneś/musisz”. |
| T4 | **Humor celuje w nagłówek.** Nigdy w ludzi, wojnę ani konkretne redakcje. Nagłówki są wymyślone i tak oznaczone, a obok jest „Po ludzku”. | `redaktor` przegląda każdy nowy nagłówek. |
| T5 | **Radość też bywa manipulacją.** „Pozytywny wykrzyknik” traktujemy jak katastrofizację. | Techniki obejmują oba kierunki. |
| T6 | **Szanuj temat wojny.** Bez żartów z wojny, neutralny język. | Przegląd `redaktora`. |

## Zasady układu i interakcji

| # | Zasada | Jak to sprawdzić |
|---|---|---|
| L1 | **Telefon najpierw.** Projektujemy 390 px, potem rozszerzamy. Komponent układa się według szerokości własnego kontenera (container queries), nie szerokości okna. | Zrzuty 360, 390, 768, 1280 px. |
| L2 | **Cele dotykowe min. 44 px.** | design-lint, przegląd zrzutu. |
| L3 | **Brak poziomego przewijania strony.** Wyjątki: pasek kroków i mapa, każde w swoim kontenerze. | Test `scrollWidth ≤ innerWidth`. |
| L4 | **Szczegóły w dolnym panelu na telefonie** zamiast okna modalnego. Mapa zostaje widoczna. | Przegląd wzorca. |
| L5 | **Poziom treści zapamiętany lokalnie**, domyślnie Podstawy. | Test działania. |
| L6 | **Ruch tylko funkcjonalny.** `prefers-reduced-motion` respektowane. | design-lint, test. |

## Zasady dostępności

| # | Zasada | Jak to sprawdzić |
|---|---|---|
| A1 | **Kontrast WCAG AA** (4,5:1 tekst, 3:1 grafika) w obu motywach. | `python3 docs/design/tokens.py check`. |
| A2 | **Znaczenie nie tylko kolorem.** Pewność i kierunek mają też liczbę kropek, słowo lub strzałkę. | Przegląd w skali szarości. |
| A3 | **Klawiatura i czytnik.** Widoczny fokus, role ARIA, kolejność zgodna z wizualną, `aria-live` przy zmianie panelu. | axe w CI. |
| A4 | **Wykres ma tabelę lub opis.** | Każdy wykres ma alternatywę tekstową. |

## Zasady systemu (skalowalność)

| # | Zasada | Jak to sprawdzić |
|---|---|---|
| S1 | **Tylko tokeny.** Kolory, rozmiary czcionek, odstępy i promienie pochodzą z `tokens.json`. Nowa wartość = nowy token z uzasadnieniem. | design-lint: brak surowych wartości (wyjątek: grafika mapy). |
| S2 | **Tylko komponenty z biblioteki** (`components.md`). Nowy komponent wchodzi przez propozycję w tym pliku. | design-lint, `strażnik-designu`. |
| S3 | **Treść jest danymi.** Nowa sekcja lub zakładka to zmiana w `src/data/`, nie w szablonie. | Brak ręcznego HTML treści w szablonie po fazie 0. |
| S4 | **Zmiana UI ma zrzuty przed i po** w 3 szerokościach (360 / 768 / 1280) i obu motywach. | Szablon PR. |
