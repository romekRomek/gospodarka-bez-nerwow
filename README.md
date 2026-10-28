# Gospodarka bez nerwów

Interaktywna strona edukacyjna o gospodarce Polski i Europy: mapa z łańcuchem cen (ropa → paliwa → ceny → stopy → pensje), węzłami Ukraina / USA / Chiny, oknami szczegółów z wykresami z kilku lat oraz zakładką „Newsy bez nerwów” (tłumacz nagłówków, koszt emocji, dobre wiadomości, skaner nagłówków) oraz zakładką „Z czym zmaga się Polska” (sondaż CBOS i dane o głównych problemach).

Wynik to jeden samodzielny plik `dist/index.html`, który można wrzucić na dowolny hosting statyczny albo opublikować jako artefakt.

## Szybki start

```bash
python3 scripts/build.py            # składa dist/index.html
python3 -m http.server -d dist 8080 # podgląd na http://localhost:8080
```

## Struktura

| Plik | Co zawiera |
|---|---|
| `src/template.html` | szkielet strony (nagłówek, SVG mapy, zakładki, okno szczegółów) |
| `src/styles.css` | cały wygląd: motyw jasny/ciemny, tokeny w `:root` |
| `src/data/*.json` | dane: węzły, wykresy, nagłówki, karty (patrz niżej) |
| `src/app.js` | logika strony; dane czyta z obiektu `DATA` |
| `src/geo.json` | kształty krajów (Natural Earth) już zrzutowane na układ 1000×900 |
| `scripts/build.py` | składanie plików w `dist/index.html` |
| `scripts/gen-geo.mjs` | generator `geo.json` (wymaga `npm i world-atlas topojson-client d3-geo`) |

## Gdzie są dane (`src/data/`)

`build.py` wczytuje każdy plik `src/data/*.json` do obiektu `DATA` (klucz = nazwa pliku) i wkleja go przed `app.js`, więc wynik nadal jest jednym plikiem.

- `nodes.json` – położenie i ikony 13 węzłów na mapie.
- `steps.json` – treść węzłów: fakty (`f`), interpretacja (`i`), metryka (`m`, `mc`).
- `charts.json` – wykresy w oknie szczegółów, klucz = id węzła.
- `headlines.json` – nagłówki w tłumaczu („co napisano” / „co naprawdę znaczy”).
- `cost.json`, `good.json`, `techniques.json` – karty kosztów emocji, dobrych wiadomości i technik.
- `news.json` – nagłówki w oknie szczegółów każdego węzła: `pos` (z haczykiem uczciwości `hk`), `neu`, `neg` (przerysowane, z faktem `f`).
- `problems.json` – zakładka „Z czym zmaga się Polska”: wykresy (`charts`), karty problemów (`cards`, każda z linkami w `src`) i interpretacja (`interp`).
- W `app.js` zostały elementy związane z wyglądem i logiką: ikony (`ICON`), emoji i cytaty węzłów (`EMO`, `Q`), reguły skanera (`RULES`).
- Liczby z daty 28.10.2026. Zaktualizuj `Dane z …` w `template.html` po odświeżeniu danych.

## Zasady redakcyjne (ważne przy rozwoju)

1. **Fakt vs interpretacja.** Fakty ciemnym tekstem, wnioski w kolorze morskim z etykietą „Interpretacja”.
2. **Liczba = źródło.** Każda liczba ma pochodzić ze źródła z linkiem (`Źródła` na dole strony). Nie wpisujemy liczb „z głowy”.
3. **Bez wskazywania serwisów i osób.** Przykłady nagłówków są wymyślone. Nie wskazujemy konkretnych redakcji ani autorów jako manipulatorów bez danych.
4. **Szanuj temat wojny.** Humor celuje w nagłówek, nie w wojnę.
5. **Dobre wiadomości też z „haczykiem uczciwości”.**

## Pomysły na dalszy rozwój

- Aktualizacja danych z GUS/NBP/Eurostat skryptem (zamiast ręcznie).
- Zapisywanie quizu/wyników, wersja dla młodzieży i dorosłych, tryb nauczyciela.
- Testy wizualne (Playwright) na desktopie i telefonie.

## Publikacja (GitHub Pages)

Workflow `.github/workflows/pages.yml` sam buduje stronę i publikuje `dist/` po każdym pushu na `main`.
Jednorazowo: Settings → Pages → Source: **GitHub Actions**. Adres: `https://<użytkownik>.github.io/gospodarka-bez-nerwow/`.
