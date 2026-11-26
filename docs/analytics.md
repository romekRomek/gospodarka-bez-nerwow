# Pomiary (analityka)

Status: **przygotowane, domyślnie wyłączone** (26.11.2026). Włącza je jeden kod konta w `src/data/analytics.json`. Decyzja: D28.

## Zasady

- **Anonimowo, bez cookies, bez danych osobowych**, bez niczego, co wpisuje czytelnik. Zapisujemy sam **opis zdarzenia** (np. `zakladka/mapa`).
- **Szanujemy sprzeciw:** przeglądarka z ustawieniem „Nie śledź” (DNT) nie wysyła niczego; dopisanie `#nietrack` do adresu wyłącza pomiary w tej przeglądarce na stałe (zapamiętane lokalnie).
- **Jawnie:** okno „Jak to sprawdzamy” ma sekcję „Prywatność i pomiary”, a stopka odnośnik „Prywatność”. To opis działania strony, nie porada prawna.
- **Pomiary nie są celem.** Służą do wykrywania, co jest niejasne lub pomijane. Nie optymalizujemy czasu spędzonego na stronie ani liczby kliknięć (zasady strony: spokój, nie zaangażowanie).
- **Domyślnie wyłączone:** bez kodu konta nie ładuje się żaden zewnętrzny skrypt (sprawdza to test w przeglądarce: „strona nie sięga po nieznane adresy zewnętrzne”).

## Dostawca

[GoatCounter](https://www.goatcounter.com/): prosty, bez cookies, otwarty kod, bezpłatny do użytku niekomercyjnego. Zdarzenia są wysyłane tylko z produkcyjnej strony (pomiary z `localhost` są pomijane). Dostawcę można zmienić: cała logika jest w `src/components/99-analytics.js`.

## Co mierzymy

Odsłony i unikalni odwiedzający (cookieless, przybliżone), źródła ruchu i wielkość ekranu dostarcza sam dostawca. Do tego zdarzenia (`zdarzenie/...`):

| Zdarzenie | Co mówi |
|---|---|
| `zakladka/start`, `mapa`, `cal`, `emo`, `pl` | które zakładki są używane |
| `wezel/<id>`, `wezel/szczegoly` | które tematy na mapie interesują, czy otwierane są szczegóły i wykresy |
| `zaleznosci/przejscie`, `zaleznosci/na-mapie` | czy działa nowa funkcja zależności |
| `poziom/podstawy`, `poziom/wiecej` | ilu czytelników chce więcej szczegółów |
| `okno/zmiany`, `okno/jak-sprawdzamy`, `okno/slownik`, `okno/prywatnosc` | zainteresowanie zaufaniem, słownikiem i prywatnością |
| `haslo/<id>` | które pojęcia wymagają wyjaśnienia (kolejność haseł w backlogu) |
| `zrodlo/<domena>` | czy czytelnicy sprawdzają źródła (miara zaufania); tylko **nazwa domeny**, bez adresu i parametrów |
| `karuzela/dalej`, `karuzela/koniec/<grupa>`, `karuzela/wszystkie/<grupa>` | czy czytelnicy dochodzą do końca wpisów w Newsy i czy wolą listę |
| `naglowek-dnia/zmiana`, `quiz` | użycie elementów edukacyjnych |
| `blad-js` | liczba błędów w przeglądarkach (sama liczba, bez treści) |

**Czego nie mierzymy:** tego, co wpisujesz, adresów odwiedzanych poza stroną, identyfikatorów osób, ani ścieżek jednej osoby.

## Jak włączyć (jednorazowo, ok. 2 minuty)

1. Załóż konto na goatcounter.com i wybierz **kod witryny** (np. `gospodarka-bez-nerwow`; adres pulpitu to `kod.goatcounter.com`).
2. Wpisz ten kod do `src/data/analytics.json` w polu `site` (sam kod, bez adresu).
3. Zbuduj i wdróż (PR, scalenie). Od tej chwili strona ładuje licznik i wysyła zdarzenia.
4. Sprawdź na pulpicie, czy po wejściu na stronę pojawia się odsłona i zdarzenia po kliknięciu zakładek.

## Jak czytać wyniki

- Raz w tygodniu: odsłony i źródła, udział zakładek, najczęściej otwierane węzły, `zrodlo/*`, `karuzela/koniec/*`, `haslo/*`.
- **Przy małych liczbach (poniżej ok. 30 wizyt) nie wyciągamy wniosków.** Unikalni odwiedzający bez cookies są szacunkiem.
- Wyniki uzupełniają, a nie zastępują opinie czytelników (kanał opinii: E2 w `docs/roadmap.md`).
