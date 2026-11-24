# Plan: samorozwijająca się „Gospodarka bez nerwów"

Status (24.11.2026): **faza U (UX/UI) zamknięta**, kolejny krok to faza 0 (fundament). Decyzje: [`decisions.md`](decisions.md). Pakiet designu: [`design/README.md`](design/README.md). Zasada nadrzędna: **agenci proponują, bramki sprawdzają, człowiek scala.**

## 1. Decyzje wyjściowe

| Obszar | Decyzja |
|---|---|
| Autonomia | Agent otwiera PR z raportem i dowodami. Merge robi człowiek (po merge Pages publikuje się samo). |
| Środowisko | Claude Code lokalnie (`.claude/skills`, `.claude/agents` w repo). Harmonogram dopiero po fazie 5. |
| Cele | (a) aktualność i poprawność danych, (b) jakość redakcyjna i edukacyjna, (c) UX i jakość techniczna, (d) rozwój produktu i odbiorców. |

## 2. Punkt wyjścia (stan repo)

- Dane w `src/data/*.json` → `scripts/build.py` → jeden plik `dist/index.html` → GitHub Pages.
- Dziennik zmian `changelog.json` (tylko dopisywanie na górze) zasila daty i znaczniki w UI.
- Zasady redakcyjne są w README (fakt vs interpretacja, liczba = źródło, bez wskazywania redakcji i osób, szacunek dla tematu wojny, „haczyk uczciwości").
- **Luki, które trzeba zamknąć, zanim agenci dostaną autonomię:**
  1. Brak testów i walidacji. Dziś jedyną bramką jest „build przechodzi".
  2. Lista źródeł jest wpisana na sztywno w `src/template.html` (sekcja „Źródła") i **nie jest powiązana z konkretnymi liczbami**. Reguły „liczba = źródło" nie da się więc sprawdzić maszynowo.
  3. Jakość źródeł jest nierówna (agregatory i serwisy wtórne obok pierwotnych). Do sprawdzenia, czy etykiety zgadzają się z domenami (np. „Reuters" prowadzi do `daily-sun.com`).
  4. Brak miary „czy jest lepiej", więc agent nie ma jak ocenić własnych zmian.
  5. Brak pamięci między cyklami (co już odrzucono, co się sprawdziło).

### 2.1 Audyt UX/UI obecnego stanu (24.11.2026)

Mocne strony: spójne tokeny kolorów w `:root` z motywem jasnym i ciemnym, `prefers-reduced-motion`, role ARIA dla zakładek, wyraźny podział fakt / interpretacja, sensowna typografia (Bricolage Grotesque, Geist, Caveat).

Problemy, które blokują skalowanie i spójność:

1. **Treść zaszyta w szablonie.** Zakładki „Newsy bez nerwów" i „Z czym zmaga się Polska" to ręcznie pisany HTML w `template.html` (ok. 30 KB). Nowa zakładka lub sekcja = edycja szablonu, CSS i `app.js`. Tylko zakładka „Mapa" ma układ sterowany danymi.
2. **Brak skali typografii i odstępów.** W CSS jest ok. 11 różnych rozmiarów czcionek (12, 12.5, 13, 13.5, 14, 14.5, …) i odstępy wpisane na sztywno. Tokeny istnieją tylko dla kolorów.
3. **66 kolorów wpisanych wprost (hex)** obok tokenów, z czego duża część to sama mapa i wykresy. Agent bez reguł będzie dokładał kolejne.
4. **Niespójne punkty zwrotne.** Breakpointy: 480 / 760 / 820 / 1020 px, bez jednej siatki. Każda zakładka ma własny układ.
5. **Logika w `app.js`** to długie funkcje z `innerHTML` (22 miejsca) i HTML składanym z tekstu. To utrudnia komponentowość, dostępność i testy.
6. **Przeciążenie informacją.** Zakładka „Newsy" ma 8 sekcji pod rząd, a zakładka „Mapa" łączy mapę, listę kroków, panel, okna i dziennik zmian. Brak jawnej hierarchii „co najważniejsze w 10 sekund".

### 2.2 Kierunek treści i UX

Szczegóły i warianty: [`docs/design/content-strategy.md`](design/content-strategy.md). Skrót: **„Mapa + warstwy"**. Mapa zostaje kręgosłupem, a każda treść ma poziom głębokości (Podstawy / Więcej / Szczegóły / później Ekspert), jest typowanym blokiem i ma źródło. Na pierwszym planie są liczby z kontekstem, ocena „co to znaczy dla mnie", prebunking manipulacji i uczciwe dobre wiadomości.

### 2.3 Wniosek

Przed budową trzeba mieć: **model informacji**, **design system** (tokeny + komponenty + wzorce) i **makiety kluczowych ekranów** (desktop i telefon). Design system jest kontraktem dla agentów: mogą dodawać treść i komponenty tylko z biblioteki.

## 3. Architektura: pętla rozwoju

```
OBSERWUJ → PROPONUJ → WERYFIKUJ → WDRÓŻ NA BRANCHU → BRAMKI → PR → (człowiek) MERGE → UCZ SIĘ
```

Każdy krok zostawia ślad w repo, więc kolejny cykl zaczyna od wiedzy z poprzednich.

### 3.1 Bramki deterministyczne (skrypty, nie LLM): fundament

Autonomia jest bezpieczna tylko wtedy, gdy część kontroli nie zależy od modelu.

- `scripts/validate.py`
  - schematy JSON dla każdego pliku w `src/data/` (wymagane pola, typy),
  - spójność identyfikatorów (`nodes` ↔ `steps` ↔ `charts` ↔ `news` ↔ `changelog`),
  - każda liczba/metryka ma `src` wskazujące wpis w rejestrze źródeł,
  - jeżeli dane się zmieniły, to na górze `changelog.json` jest nowy wpis, a stare wpisy są nietknięte,
  - daty w formacie i kolejności, brak martwych linków (HEAD/GET z retry, wynik jako ostrzeżenie).
- `scripts/scorecard.py` liczy tablicę wyników (patrz 5).
- `scripts/confidence.py` liczy wskaźnik pewności danych z rejestru źródeł (źródło, aktualność, zgodność, rodzaj danych) i zapisuje go w danych.
- Test dymny w Playwright: strona się ładuje, brak błędów w konsoli, zakładki i okna szczegółów działają, zrzuty desktop + telefon.
- Uprawnienia: agenci mogą zmieniać tylko `src/**`, `docs/**` i `.claude/**`. Nie dotykają `main`, `dist/` ani workflow.

### 3.2 Rejestr źródeł (`src/data/sources.json`)

Jedno miejsce prawdy: `id`, nazwa, URL, organizacja, **poziom** (1 = pierwotne: GUS, NBP, Eurostat, CBOS, ministerstwa; 2 = agencje i duże media; 3 = wtórne), sposób pobrania (API/strona/PDF), częstotliwość publikacji, data ostatniego sprawdzenia. Sekcja „Źródła" w UI generuje się z rejestru, a metryki i wykresy odwołują się po `id`. Liczby z poziomu 3 wymagają potwierdzenia z poziomu 1–2 albo oznaczenia w UI.

### 3.3 Subagenci (`.claude/agents/`)

Rozdzielone role = niezależne konteksty. Weryfikator nie widzi rozumowania badacza, tylko jego wynik.

| Agent | Rola | Narzędzia | Wyjście |
|---|---|---|---|
| `badacz-danych` | Dla każdej metryki szuka najnowszej wartości w źródle pierwotnym | WebSearch, WebFetch, Read | `proposal.json`: wartość, data, URL, cytat, pewność |
| `weryfikator-faktow` | Niezależnie powtarza ustalenia, liczy zmiany (z, do, kierunek), szuka niezgodności | WebFetch, Read | werdykt na pozycję: potwierdzone / sporne / odrzucone |
| `redaktor` | Sprawdza 5 zasad redakcyjnych, język, ton wobec wojny, „haczyk uczciwości", czytelność dla laika | Read | lista uwag z cytatem i poprawką |
| `tester-ux` | Playwright desktop i telefon, dostępność (kontrast, klawiatura, ARIA), wydajność, waga pliku | Bash, Read | raport + zrzuty ekranu |
| `strateg-produktu` | Backlog pomysłów, ocena (wpływ / wysiłek / ryzyko), propozycje eksperymentów | Read, WebSearch | uzupełniony `docs/backlog.json` |
| `implementator` | Wprowadza zatwierdzone zmiany kodu i treści na branchu | Read, Edit, Write, Bash | diff + uruchomione bramki |
| `strażnik-designu` | Pilnuje zgodności ze `principles.md`, tokenami i biblioteką komponentów; porównuje z makietami | Read, Bash (Playwright) | uwagi z odniesieniem do zasady i zrzutem |

### 3.4 Skille (`.claude/skills/`)

| Skill | Co robi |
|---|---|
| `/aktualizuj-dane` | Badacz → weryfikator → redaktor → wpis do changelogu → build → bramki → PR |
| `/zrodla` | Audyt rejestru źródeł: martwe linki, niezgodne etykiety, braki poziomu 1 |
| `/redakcja` | Przegląd redakcyjny wskazanego zakresu lub diffu |
| `/test-wizualny` | Zrzuty, a11y, wydajność, porównanie z poprzednim stanem |
| `/naglowek-dnia` | Dobiera z `headlines.json` lub pisze nowe przesadzone nagłówki do dzisiejszych liczb, z wersją „Po ludzku” i oceną przesadzenia; `redaktor` sprawdza zasady humoru |
| `/pomysly` | Przegląd backlogu, nowe pomysły, ranking, wybór eksperymentu |
| `/eksperyment` | Zmiana na branchu, pomiar tablicy wyników przed i po, rekomendacja zostaw/odrzuć |
| `/cykl` | Orkiestrator: odświeżenie danych + audyt + 1 eksperyment, jeden zbiorczy PR lub kilka małych |
| `/retro` | Po merge/odrzuceniu PR zapisuje wnioski do `docs/decisions.md` |

Skille dostają od razu prawdziwe zasady projektu (formaty, zakazy, nazewnictwo), żeby nie wymyślały konwencji.

### 3.5 Warstwa UX/UI: spójność w każdej fazie rozwoju

Cel: informacja przejrzysta i łatwa w odbiorze, a nowa treść lub sekcja nie wymaga projektowania od zera.

**Artefakty (źródło prawdy w repo, `docs/design/`):**

| Artefakt | Zawartość |
|---|---|
| `principles.md` (gotowe) | Zasady UX: np. „najważniejsza liczba w 3 sekundy", jedna idea na ekran, fakt przed interpretacją, nie więcej niż N sekcji na widok, język dla laika, ton bez alarmizmu |
| `information-architecture.md` (gotowe) | Mapa serwisu, nazwy zakładek, hierarchia treści, ścieżki użytkownika (np. „zaniepokojony nagłówkiem" → „rozumiem, co to znaczy dla mnie") |
| `tokens.json` (gotowe) → `src/tokens.css` (faza 0) | Kolory (semantyczne, nie surowe), typografia (skala modularna), odstępy, promienie, cienie, ruch, breakpointy, z jasnym i ciemnym motywem. Jedno źródło generuje CSS |
| `components.md` (gotowe) + implementacja w fazie 0 | Biblioteka: karta metryki, karta faktu/interpretacji, wykres (standardowa ramka), tag kategorii, lista nagłówków, kalkulator, okno szczegółów, stan pusty/ładowania/błędu. Każdy komponent: warianty, stany, zasady użycia, dostępność |
| `patterns.md` (gotowe) | Wzorce stron (dashboard, lista kart, eksplorator danych, artykuł), siatka, zachowanie na telefonie |
| `mockups/` (gotowe) | Makiety HTML kluczowych ekranów, desktop i telefon, jasny i ciemny |

**Skalowalność treści:** struktura treści staje się modelem (JSON). Zakładka = lista sekcji, sekcja = typ komponentu + dane. Dodanie nowej zakładki lub sekcji to zmiana w `src/data/`, a nie w szablonie. `build.py` renderuje z komponentów.

**Egzekwowanie spójności:**

- `scripts/design-lint.py`: zakaz surowych kolorów i rozmiarów poza tokenami (z listą wyjątków dla mapy), sprawdzenie breakpointów i użycia komponentów spoza biblioteki.
- `strażnik-designu` (subagent): porównuje zrzuty ekranu i diff z makietami oraz `principles.md`. Ocenia hierarchię, gęstość informacji, czytelność na telefonie, spójność komponentów.
- Kontrola kontrastu (WCAG AA) i dostępności w CI (axe).
- Nowy komponent lub wzorzec wchodzi tylko przez propozycję do `components.md` z uzasadnieniem, więc design system rośnie świadomie i nie „dryfuje".
- Każdy PR z UI zawiera zrzuty „przed i po" na 3 szerokościach (360 / 768 / 1280 px) w obu motywach.

### 3.6 Pamięć i ślad decyzji (`docs/`)

- `backlog.json`: pomysły, status, ocena, uzasadnienie.
- `decisions.md`: co zrobiono, co odrzucono i dlaczego (żeby agent nie wracał do odrzuconych pomysłów).
- `runs/RRRR-MM-DD.md`: raport z każdego cyklu (co sprawdzono, co zmieniono, wynik bramek, koszt).
- Opcjonalnie: wiedza trwała w pamięci Claude Code dla preferencji właściciela (ton, odbiorcy).

## 4. Miara postępu, czyli skąd agent wie, że jest „lepiej"

Tablica wyników (`scorecard`) liczona przy każdym PR i zapisywana w raporcie:

| Wymiar | Miernik | Próg PR |
|---|---|---|
| Aktualność | mediana wieku metryk względem częstotliwości publikacji źródła | nie gorzej |
| Źródła | % liczb powiązanych ze źródłem poziomu 1–2 | rośnie lub stały |
| Redakcja | liczba uwag `redaktora` o wadze „blokuje" | 0 |
| Dostępność | wyniki axe/Lighthouse a11y | ≥ obecny |
| Pewność danych | % liczb z policzonym wskaźnikiem pewności (skrypt z rejestru źródeł), liczba liczb z oceną „Niska” bez wyjaśnienia | 100% / 0 |
| Spójność designu | liczba naruszeń `design-lint` (kolory, rozmiary, komponenty spoza biblioteki), uwagi `strażnika-designu` o wadze „blokuje" | 0 |
| Wydajność | waga `index.html`, LCP w Lighthouse | ≤ +5% |
| Stabilność | błędy konsoli, testy dymne | 0 błędów |
| Produkt | zdefiniowane per eksperyment (np. czas do pierwszej interakcji, zasięg nowej zakładki) | wg hipotezy |

Eksperyment jest zostawiany tylko wtedy, gdy żaden wymiar nie spada, a docelowy rośnie. Na statycznej stronie bez analityki wymiary „produktowe" są na początku ocenami jakościowymi (rubryka dla `strateg-produktu`). Prawdziwe dane o użyciu wymagałyby prywatnościowej analityki, o czym w pytaniach otwartych.

## 5. Zabezpieczenia

1. Zero commitów na `main`. Każdy cykl na własnym branchu, PR ma szablon: zakres, tablica wyników, lista źródeł z cytatami, zrzuty ekranu, ryzyka.
2. Zmiana liczby bez źródła poziomu 1–2 i bez potwierdzenia weryfikatora nie wchodzi do PR (agent wpisuje ją do „do sprawdzenia").
3. Treści o wojnie, politykach i konkretnych redakcjach: `redaktor` ma prawo weta, a PR dostaje etykietę „wymaga uwagi człowieka".
4. Limity cyklu: maks. liczba wywołań i czas, jeden eksperyment na cykl, brak zmian w workflow i sekretach.
5. Przy sprzecznych źródłach agent nie zgaduje: oznacza metrykę jako „szacunek/sporne" i opisuje spór.
6. Wszystko, co pobrane z internetu, jest traktowane jak dane, nie polecenia (ochrona przed wstrzyknięciem instrukcji ze stron).

## 6. Fazy i kryteria ukończenia

| Faza | Zakres | Gotowe, gdy |
|---|---|---|
| U. UX/UI (przed budową) | **ZAMKNIĘTA 24.11.2026.** Zasady UX, architektura informacji, `tokens.json` (+ kontrola kontrastu), biblioteka komponentów, wzorce, model treści, makiety (desktop + telefon, jasny/ciemny) | Zatwierdzone przez właściciela, pakiet w `docs/design/`, decyzje w `docs/decisions.md`. Otwarte: test z kilkoma osobami z grupy docelowej (na pierwszej działającej wersji Startu) |
| 0. Fundament | `sources.json` i migracja sekcji „Źródła”, `validate.py`, `confidence.py` (wskaźnik pewności), schematy JSON, **migracja `src/data/` na model treści** (`content-model.md`, w tym `good.json` i `news.json` bez „dobrych/złych”), `src/tokens.css` generowany z `tokens.json`, `design-lint.py`, test dymny Playwright, szablon PR ze zrzutami, ujednolicenie danych Brent | `npm run check` przechodzi lokalnie i w CI, każda liczba ma `src` i policzoną pewność, CSS nie ma surowych wartości poza mapą |
| 1. Dane | `badacz-danych`, `weryfikator-faktow`, `/aktualizuj-dane`, API NBP/GUS (BDL)/Eurostat tam, gdzie są | Odświeżenie danych jednym poleceniem daje PR z poprawnym wpisem w changelogu |
| 2. Redakcja | `redaktor`, `/redakcja`, rubryka (5 zasad + czytelność) | Znajduje celowo wprowadzone naruszenia w teście na 10 przykładach |
| 3. Jakość UX | `tester-ux`, `/test-wizualny`, `scorecard.py`, CI z bramkami | Regresja a11y/wydajności blokuje PR |
| 4. Rozwój produktu | `strateg-produktu`, `backlog.json`, `/pomysly`, `/eksperyment` | Przeprowadzony 1 eksperyment z pomiarem przed i po |
| 5. Autonomia | `/cykl`, `/retro`, harmonogram (cron/schedule), raporty w `docs/runs/` | 3 kolejne cykle bez interwencji innej niż merge |

Faza 0 jest wąskim gardłem. Bez niej agenci nie mają czego sprawdzać.

### Postęp fazy 0 (branch `faza-0-fundament`)

| Krok | Stan |
|---|---|
| Rejestr źródeł `src/data/sources.json` (51 źródeł: 14 pierwotnych, 16 poziomu 2, 21 wtórnych, poziomy robocze) | **gotowe** |
| `scripts/validate.py` (schematy, spójność id, dziennik zmian, rejestr, pokrycie URL, zaległości migracji, `--links`) + 13 testów | **gotowe** |
| `npm run check` / `npm test`, walidacja w CI (Pages) | **gotowe** |
| Zestawienie źródeł poziomu 3 ([`sources-tier3-review.md`](sources-tier3-review.md)) | **gotowe** |
| Źródła pierwotne GUS (CPI, płace, PKB) w rejestrze, `primary` przy Finwire, `src` w 4 z 13 węzłów (`shop`, `pump`, `worker`, `sun`) | **gotowe** |
| EIA (Brent): źródło, porównanie i skrypt `check_brent_eia.py`, `src` dla `derrick`. Wniosek: dane to kontrakt ICE, EIA to spot (patrz [`brent-eia-check.md`](brent-eia-check.md)). Decyzja D14 (opcja C) wykonana: podpisy miar, fakt z EIA, poprawiony wykres, EIA na liście „Źródła” | **zrobione** |
| Pozostałe źródła pierwotne (Fed, Eurostat, KE, handel GUS, PNAS) i `src` przy 8 węzłach | do zrobienia |
| Przegląd poziomów źródeł przez redaktora, naprawa etykiety „Reuters” | do zrobienia |
| Generowana sekcja „Źródła” z rejestru | do zrobienia |
| Architektura źródeł danych i API ([`data-sources-architecture.md`](data-sources-architecture.md)) | osobne zadanie badawcze po fazie 0 |
| `confidence.py` (wskaźnik pewności z rejestru), 32 testy; czeka na pola `conf` w danych (W3) | **gotowe (skrypt)** |
| Migracja `src/data/` na model treści, w tym `good.json` i `news.json` (D5) | do zrobienia |
| `src/tokens.css` generowany z `tokens.json`, migracja `styles.css` na tokeny bez zmiany wyglądu, `design-lint.py` z testami i krokiem w CI (wyjątki z uzasadnieniem w `EXCEPTIONS`) | **gotowe** |
| Test dymny w przeglądarce (231 asercji), narzędzie zrzutów przed/po, szablon PR, workflow `e2e.yml` (nieuruchomiony w Actions) | **gotowe** |
| Ujednolicenie danych Brent (90 vs 92,6 USD) | do zrobienia |

## 7. Co zostaje ustalić

1. **Źródła i dostęp:** które dane mają API (NBP, GUS BDL, Eurostat)? CBOS bywa płatny lub w PDF, więc trzeba ustalić tryb półautomatyczny.
2. **Analityka:** czy chcesz dodać prywatnościową, bezcookiesową analitykę (np. Plausible/Umami), żeby eksperymenty produktowe miały twarde dane? Jeśli nie, oceny pozostają jakościowe.
3. **Odbiorcy:** młodzież, dorośli, nauczyciele. Od tego zależy kolejność w backlogu.
4. **Częstotliwość cyklu:** co tydzień dla danych, co miesiąc dla eksperymentów?
5. **Budżet:** limit kosztu/czasu na cykl.
6. **Język i zakres:** czy zostajemy przy PL i Europie, czy dochodzi wersja EN?
