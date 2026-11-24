# Architektura informacji

Wersja 1.0, 24.11.2026.

## Mapa serwisu

```
Start            „Dziś w 60 sekund”           nowy ekran, pierwsza zakładka
Mapa             mapa zależności              dzisiejsza zakładka „Mapa gospodarcza”
Newsy            „Newsy bez nerwów”           dzisiejsza zakładka, przebudowana (bez dobrych/złych wiadomości)
Polska           „Z czym zmaga się Polska”    dzisiejsza zakładka
(Uczę się)       ścieżki, słowniczek, quizy   po ustabilizowaniu Startu i Mapy, nie w pierwszej wersji
```

Nawigacja: dolny pasek na telefonie (Start · Mapa · Newsy · Polska), zakładki u góry na komputerze (próg kontenera 760 px). Przełącznik poziomu (Podstawy / Więcej) jest w nagłówku Startu i Mapy. Poziomy startują od dwóch (Podstawy, Więcej). Szczegóły i Ekspert dochodzą później bez zmiany układu.

## Ścieżki użytkownika

1. **„Zaniepokojony nagłówkiem.”** Start → liczby z kontekstem → „Nagłówek dnia” i „Ta sama liczba, dwa nagłówki” → rozumiem, co nagłówek robi → spokój.
2. **„Chcę zrozumieć, skąd się biorą ceny.”** Start → „Zobacz, jak to się łączy” → Mapa (Polska, krok po kroku, „Oprowadź mnie”) → panel węzła na Podstawach → „Pokaż więcej”.
3. **„Chcę sprawdzić, czy mogę zaufać liczbie.”** Dowolna liczba → wskaźnik pewności → rozwinięcie czterech czynników → źródło.
4. **„Czy to dotyczy mnie?”** „Dotyczy” i „Decyduje” → uwaga „Obserwuj” → „Co może o tym zadecydować”: najbliższe wydarzenia i jedno łatwe pytanie (Więcej).
5. **„Chcę nauczyć się rozpoznawać manipulację.”** Technika dnia → Newsy (skaner, 5 pytań) → (później) Uczę się.

## Mapowanie dzisiejszej aplikacji na nowe komponenty

| Dziś (element, plik) | Nowy komponent / miejsce | Zmiana |
|---|---|---|
| Nagłówek, „Dane z…”, przycisk „Co się zmieniło” (`changelog.json`) | `AppTop` + `ChangeSummary` (lista zmian + pasek ↓↑→) | Bilans zmian na Starcie w „Więcej”. |
| Mapa SVG (`geo.json`, `nodes.json`) | `MapView` (widoki Polska / Świat) | Dwa widoki na telefonie. Grafika bez zmian. |
| Lista kroków pod mapą | `StepChips` | Poziomy pasek z aktywnym krokiem. |
| Panel węzła: fakty, interpretacja, metryka (`steps.json`) | `NodePanel` (dolny panel / panel boczny) z poziomami | Podstawy: liczba + zdanie. Więcej: fakty, interpretacja, wykres, „Co może o tym zadecydować”. |
| Okno szczegółów z wykresami (`charts.json`) | `NodePanel` poziom Więcej + `ChartFrame`; poziom Szczegóły później | Brak okna modalnego na telefonie. |
| Nagłówki węzła `pos` / `neu` / `neg` (`news.json`) | `FrameCard` (ta sama liczba, dwa nagłówki) | Przepisanie `pos`/`neg` na pary ramowań. Zniknęły etykiety „pozytywny” i „negatywny”. |
| Tłumacz nagłówków (`headlines.json`) | `HeadlineOfDay` + pełna lista w Newsach | Tytuł = parodia (`abs`), obok klikbajt, odzwierciedlenie, „Po ludzku”. |
| „Ile Cię to kosztuje” (`cost.json`) | `Calculator` | Bez zmian funkcji. |
| „Odtrutka: dobre wiadomości” (`good.json`) | Do przepisania w fazie 0 na `FrameCard` lub „kontekst długiego horyzontu” | Usunąć etykietę „dobra wiadomość”. |
| „Osiem sztuczek w pigułce” (`techniques.json`) | `TechniqueCard` + lista | Technika dnia na Starcie. |
| „Co mówią badania”, „Pięć pytań…”, „Narzędzia i źródła…” (HTML w szablonie) | `ContentBlock` typów `fact`, `checklist`, `linklist` w `src/data/` | Wyjęte z szablonu do danych. |
| Skaner nagłówków (`RULES` w `app.js`) | `Tool` (skaner) | Dane reguł do `src/data/`. |
| Polska: sondaż i dane (`problems.json`) | `ChartFrame` + `ProblemCard` | Wzorzec eksploratora danych, z pewnością danych. |
| Sekcja „Źródła” w `template.html` | Rejestr `sources.json` + `SourceList` generowana | Fundament fazy 0. |

## Reguły nazewnictwa w interfejsie

- Zakładki: Start, Mapa, Newsy, Polska (krótko, bez „bez nerwów” w nawigacji).
- Poziomy: Podstawy, Więcej (później Szczegóły, Ekspert).
- Kontekst kto/co: „Decyduje”, „Dotyczy”. Uwaga: „Obserwuj”. Wydarzenia i pytanie: „Co może o tym zadecydować” (daty, „Dla Ciebie”).
- Nie używamy etykiet oceniających sprawczość czytelnika („Nie mam wpływu”, „Częściowo”).
- Pewność danych: Wysoka, Średnia, Niska, z czterema czynnikami: Źródło, Aktualność, Zgodność źródeł, Rodzaj danych.
- Pewność twierdzeń w tekście: Potwierdzone, Szacunek, Sporne, Prognoza.
- Nie używamy słów: „dobra wiadomość”, „zła wiadomość”, „katastrofa” (poza parodią w nagłówku dnia).
