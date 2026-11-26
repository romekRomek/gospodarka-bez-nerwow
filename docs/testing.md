# Testy przeglądarkowe i zrzuty „przed i po”

Bramka jakości dla zmian interfejsu (także robionych przez agentów). Zasady: [`design/principles.md`](design/principles.md) (L3 brak poziomego przewijania, S4 zrzuty przed i po), plan: [`PLAN.md`](PLAN.md) (3.1).

Wszystko mieszka w `tests/e2e/` i ma osobny `package.json`. Główny `package.json` nie wie o tych zależnościach, a `node_modules` jest w `.gitignore`.

## Jak uruchomić

Jednorazowo (instalacja zależności testu):

```bash
npm --prefix tests/e2e install
```

Przeglądarka: test sam szuka Chromium w tej kolejności: zmienna `E2E_CHROME` (ścieżka do pliku wykonywalnego), przeglądarka wymagana przez zainstalowany `playwright-core`, dowolna wersja Chromium w cache Playwrighta (`~/Library/Caches/ms-playwright`, `~/.cache/ms-playwright`), systemowy Google Chrome. Jeśli nic nie ma, pobierz Chromium:

```bash
cd tests/e2e && npx playwright-core install chromium
```

Test (jedno polecenie, z katalogu głównego repozytorium):

```bash
python3 scripts/build.py        # test sprawdza aktualny dist/index.html, więc najpierw zbuduj
npm --prefix tests/e2e test
```

Czas: około 4 s lokalnie. Test sam stawia serwer HTTP dla `dist/` na wolnym porcie, nic nie trzeba uruchamiać w tle.

## Co sprawdza (`tests/e2e/smoke.mjs`)

Osiem przejść: szerokości 360, 390, 768 i 1280 px, każda w motywie jasnym i ciemnym. Motyw ustawia atrybut `data-theme` na `<html>` (oraz emulowany `prefers-color-scheme`). W każdym przejściu:

| Kontrola | Szczegół |
|---|---|
| Węzły i kroki | 13 węzłów w `#nodes`, 13 przycisków w `#steps` |
| Zakładki | Mapa, Newsy, Polska: po kliknięciu widoczny jest tylko właściwy panel, `aria-selected` się zgadza |
| Brak poziomego przewijania (L3) | `document.documentElement.scrollWidth <= innerWidth` po załadowaniu i na każdej zakładce (mapa i pasek kroków mogą przewijać się wewnątrz własnych kontenerów, to nie liczy się) |
| Konsola | brak `console.error`, nieobsłużonych wyjątków (`pageerror`) i nieudanych żądań |
| Sieć | strona nie sięga po inne adresy zewnętrzne niż Chart.js i czcionki Google |

Dodatkowo pełny scenariusz w dwóch skrajnych konfiguracjach (390 px jasny, 1280 px ciemny): klik w węzeł otwiera okno szczegółów (tytuł, wykres `canvas`), Escape je zamyka; klik w krok listy pokazuje panel i podświetla jeden węzeł, „Szczegóły i wykresy” otwiera okno tego samego kroku, przycisk ✕ je zamyka; „Następny” zmienia węzeł; wykresy zakładki Polska się rysują; brak poziomego przewijania także przy otwartym oknie. Na końcu: motyw jasny i ciemny faktycznie dają inne tło strony.

Poza zakresem (na razie): kontrast i a11y (osobno `docs/design/tokens.py check`), L2 (cele dotykowe, `design-lint`), wygląd (zrzuty ocenia człowiek lub tester UX).

## Sieć: decyzja

Strona ładuje Chart.js z cdnjs i czcionki z Google Fonts. Test **nie zależy od sieci** (decyzja): domyślnie

- żądanie Chart.js z CDN jest podmieniane lokalną kopią z npm (`chart.js` w `tests/e2e/package.json`, ta sama wersja 4.4.1 co w `scripts/build.py`),
- Google Fonts dostają pustą odpowiedź CSS, więc strona używa czcionek zapasowych (zrzuty wyglądają inaczej niż na produkcji, np. nagłówki szeryfowe, ale są powtarzalne),
- każdy inny adres zewnętrzny jest blokowany i zgłaszany jako błąd („strona sięga po nieznane adresy”).

Dzięki temu losowa niedostępność CDN nie wywala testu. Kompromis: test nie sprawdza, czy prawdziwy CDN odpowiada. Do tego jest opcja:

```bash
npm --prefix tests/e2e test -- --live-cdn
```

Z `--live-cdn` nic nie jest podmieniane. Jeśli Chart.js nie załaduje się z CDN, test kończy się czytelnym komunikatem „PROBLEM ŚRODOWISKA … Chart.js nie załadował się z CDN” i kodem wyjścia 2, zamiast lawiny błędów.

## Jak czytać wynik

```
390 px, motyw light (pełny scenariusz)
  BŁĄD  brak poziomego przewijania: Newsy bez nerwów  [scrollWidth=412 > innerWidth=390]
...
Asercje: 231, błędy: 1, czas: 3.4 s
Nie przeszło:
  - [390 px, motyw light] brak poziomego przewijania: Newsy bez nerwów (scrollWidth=412 > innerWidth=390)
```

| Kod wyjścia | Znaczenie |
|---|---|
| 0 | wszystko przeszło (ostatnia linia `OK`) |
| 1 | są błędy asercji: lista na końcu mówi, w której szerokości i motywie oraz co się zgadza lub nie |
| 2 | problem środowiska, nie aplikacji: brak `dist/index.html`, brak zależności, brak przeglądarki, brak Chart.js |

Test nie zatrzymuje się na pierwszym błędzie, więc jedno uruchomienie pokazuje cały obraz. Gdy wynik jest niejasny, zrób zrzuty (niżej) w tej samej szerokości i motywie.

## Zrzuty przed i po (`tests/e2e/shots.mjs`)

Jedno polecenie robi 24 zrzuty: Mapa, Newsy, Polska (cała strona) i okno szczegółów jednego węzła (domyślnie `derrick`, opcja `--node id`), szerokości 360 / 768 / 1280, motyw jasny i ciemny. Zrzuty idą do katalogu z argumentu (domyślnie katalog tymczasowy systemu, zrzuty są odrzucane, jeśli katalog jest w repozytorium) do podkatalogu z etykietą:

```bash
python3 scripts/build.py
# na gałęzi bez zmiany (np. po git switch main) albo przed edycją:
npm --prefix tests/e2e run shots -- /tmp/zrzuty --label przed
# po wprowadzeniu zmiany:
python3 scripts/build.py
npm --prefix tests/e2e run shots -- /tmp/zrzuty --label po
# które zrzuty się różnią:
npm --prefix tests/e2e run shots -- --diff /tmp/zrzuty/przed /tmp/zrzuty/po
```

Nazwy plików są takie same w obu katalogach (`mapa-360-jasny.png`, `newsy-768-ciemny.png`, `polska-1280-jasny.png`, `wezel-derrick-360-ciemny.png`, ...), więc zestawienie parami jest wprost. `--diff` porównuje bajty: ten sam build daje identyczne zrzuty (animacje są wyłączone przez `prefers-reduced-motion`, czcionki zewnętrzne zastąpione zapasowymi), więc „ZMIENIONE” oznacza realną zmianę wyglądu. Ścieżki względne liczą się od miejsca wywołania polecenia.

Zrzuty dołącz do pull requesta (przeciągnij pliki do opisu PR; do repozytorium ich nie dodajemy). Workflow `e2e.yml` dodatkowo zapisuje zrzuty „po” jako załącznik przebiegu (`zrzuty-po`), więc zrzut „po” można pobrać bez lokalnego uruchamiania.

## CI

`.github/workflows/e2e.yml` uruchamia się dla pull requestów (push na `main` obsługuje `pages.yml`): buduje stronę, instaluje zależności z `tests/e2e/package-lock.json` (`npm ci`), pobiera Chromium (`playwright-core install --with-deps chromium`), uruchamia test i zapisuje zrzuty jako załącznik.

## Narzędzie i kompromisy

`playwright-core` (sam sterownik, bez pobierania wszystkich przeglądarek) plus Chromium z cache Playwrighta. Lokalnie cache ma starszą rewizję Chromium (1243) niż oczekuje zainstalowany `playwright-core` (1255), więc skrypt wskazuje plik wykonywalny jawnie. W CI jest zainstalowana dokładnie oczekiwana wersja. Różnice wersji przeglądarki mogą w teorii zmienić piksele zrzutów, ale nie wyniki testu.

## Aktualizacja

Zmiana liczby węzłów (13) lub identyfikatorów zakładek wymaga zmiany stałych na górze `smoke.mjs` (`EXPECTED_NODES`, `TABS`). Zaktualizuj też ten dokument, jeśli test zacznie sprawdzać coś nowego.

## Wydajność w WebKit (Safari i iPhone)

Test dymny używa **Chromium**, który radzi sobie z ciężką grafiką SVG, więc **nie wykrył** problemu z mapą na Safari (zawieszanie i błąd „wielokrotnie wystąpił problem” na iPhonie, ok. 1–4 klatek/s zamiast 30). Dlatego jest osobny pomiar w prawdziwym WebKit z emulacją iPhone'a (390 px, 3× DPR, dotyk):

```bash
# instalacja silnika w projekcie (raz, ok. 70 MB, katalog poza repozytorium)
cd tests/e2e && PLAYWRIGHT_BROWSERS_PATH=.pw-browsers npx playwright-core install webkit
# pomiar klatek na mapie: wszystkie warianty (A: stan wdrażany; B-E: bez filtrów, bez animacji itd.)
PLAYWRIGHT_BROWSERS_PATH=.pw-browsers node perf-webkit.mjs
# strażnik regresji: tylko stan wdrażany, poniżej progu kończy błędem; DEVICE=desktop dla Safari na Macu
ONLY=A MIN_FPS=8 PLAYWRIGHT_BROWSERS_PATH=.pw-browsers node perf-webkit.mjs
# koszt kliknięcia węzła (czas do drugiej klatki, kilka kliknięć) i izolacja przyczyn
PLAYWRIGHT_BROWSERS_PATH=.pw-browsers node prof-click2.mjs
```

To pomiar **względny**: komputer jest szybszy niż telefon, więc liczy się porównanie wariantów, a nie wartość bezwzględna. Lekka zakładka Start daje w tym środowisku ok. 30 klatek/s (limit), a wdrażana mapa tyle samo. W CI działa krok `perf-webkit` (na razie nieblokujący). **Każda zmiana grafiki mapy, filtrów lub animacji wymaga tego pomiaru.**

Pokazanie zakładki Mapa (od kliknięcia do trzeciej klatki, iPhone w WebKit): `MAX_MS=400 PLAYWRIGHT_BROWSERS_PATH=.pw-browsers node perf-tab.mjs`. Krok CI w `perf-webkit`. Test dymny sprawdza też, że na małym ekranie żaden element mapy nie ma filtra CSS.
