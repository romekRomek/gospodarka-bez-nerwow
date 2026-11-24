# Wzorce stron i układu

Wersja 1.0, 24.11.2026. Wzorzec wizualny: `docs/design/mockups/index.html`.

## Siatka i punkty zwrotne

- Ekran jest kontenerem. Układ zmienia się według szerokości kontenera, nie okna: **poniżej 760 px** układ telefonu (jedna kolumna, dolna nawigacja), **od 760 px** układ szeroki (kafelki w rzędzie, górna nawigacja).
- Maksymalna szerokość treści 1240 px. Boczny margines minimum 16 px na każdej szerokości.
- Odstępy tylko z tokenów `--sp-*` (4, 8, 12, 16, 24, 32, 48). Odstępy między kartami to `--sp-4`, w układzie szerokim `--sp-5`.
- Testowane szerokości: 360, 390, 768, 1280 px, jasny i ciemny motyw.
- Dzisiejsze progi (480 / 760 / 820 / 1020 px) są zastępowane jednym progiem kontenera 760 px plus progiem układu mapy (patrz niżej).

## Wzorce

### 1. Dashboard („Start”)

Kolejność na telefonie: `AppTop` → tytuł ekranu → trzy `StatTile` → `HeadlineOfDay` → (W) `ChangeSummary` → `FrameCard` + `TechniqueCard` → przycisk do Mapy → `Nav`. W układzie szerokim: kafelki w rzędzie po 3, `HeadlineOfDay` na całą szerokość, a `FrameCard` i `TechniqueCard` obok siebie (1,5 : 1). Liczba kafelków jest sterowana danymi (domyślnie 3, maksimum 4 przed przeglądem I6).

### 2. Mapa z panelem („Mapa”)

Telefon: `MapView` na górze (przełącznik Polska / Świat), `StepChips`, `TourControls`, `NodePanel` jako dolny panel nad `Nav`. Panel ma uchwyt, strzałki ‹ › do poprzedniego i następnego kroku, a „Pokaż więcej” rozwija poziom Więcej bez zamykania panelu. Komputer: mapa po lewej, panel po prawej (jak dziś, panel przyklejony). Wariant B (otwarcie na mapie) dodaje pasek „Dziś” nad mapą. Pasek jest w makietach, ale domyślnie nie wchodzi (decyzja: Start jest pierwszą zakładką).

### 3. Lista kart („Newsy”)

Sekcje jako lista kart jedna pod drugą, każda sekcja to nagłówek + `ContentBlock`-i. Sekcje są sterowane danymi (`sections[]` w danych zakładki). Na telefonie jedna sekcja na raz z listą skrótów u góry, żeby uniknąć ściany ośmiu sekcji.

### 4. Eksplorator danych („Polska”)

`ChartFrame` (sondaż CBOS, dane) z przełącznikiem zakresu, pod nim `ProblemCard` z linkami do źródeł i `Interp`. Każdy wykres ma `ConfidenceMeter` i tabelę alternatywną.

### 5. Artykuł / ścieżka (później: „Uczę się”)

Jedna kolumna do 65 znaków w linii, krok po kroku, pytanie sprawdzające na końcu, postęp lokalnie.

## Poziomy treści w układzie

- Poziom globalny (przełącznik) i lokalny (przycisk „Pokaż więcej” na panelu) działają niezależnie. Lokalny rozwija tylko ten element.
- Bloki wyższego poziomu nie zmieniają układu elementów poziomu 1. Dochodzą pod spodem (bez przeskoku liczby głównej).
- Poziom domyślny: Podstawy.

## Motyw

Trzy stany: automatyczny (prefers-color-scheme), jasny, ciemny. Wszystkie kolory przez tokeny. Zero kolorów zdefiniowanych wyłącznie w bloku motywu. Body ma jawne tło z tokenu.

## Ruch

Dozwolony: przejście dolnego panelu, rozwinięcie poziomu, ruch statków na trasie ropy (wyłączany przy `prefers-reduced-motion`). Niedozwolony: miganie, autoodtwarzanie poza „Oprowadź mnie”.

## Typografia

Skala: 12 / 14 / 16 / 20 / 26 / 34 / 40 px (`--t-xs` … `--t-num`). Tytuły i liczby w kroju `--head` (Bricolage Grotesque 800), tekst `--sans` (Geist), krótkie podpisy `--hand` (Caveat) oszczędnie: nagłówek „Dziś”, puenta w nagłówku dnia, przykłady technik. Linia tekstu maks. 65 znaków. Liczby w kolumnach z `tabular-nums`.
