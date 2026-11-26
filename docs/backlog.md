# Backlog ogólny (poza mapą)

Pomysły i znane braki, które nie są częścią rozbudowy mapy (ta ma własny backlog: `docs/map-backlog.md`, prowadzi go agent `product-owner-mapy`). Stan na 26.11.2026. Pełny, priorytetyzowany plan: `docs/roadmap.md`. Kolejność nie jest priorytetem, o priorytetach decyduje właściciel.

## Do naprawy

| ID | Pozycja | Status | Uwagi |
|---|---|---|---|
| B1 | **Skaner nagłówków** (zakładka Newsy, krok 3) | **Schowany** (25.11.2026) | Właściciel: „nie działa”. **Nie odtworzyłem usterki w przeglądarce testowej**: wykrywa wzorce, pasek i etykieta reagują, bez błędów w konsoli. Do ustalenia: na jakim urządzeniu i jaki nagłówek. Znane wady kodu: reguły w `95-scanner.js` to proste wyrażenia regularne (możliwe fałszywe trafienia, np. „zapłacisz” zawsze jako „Zwrot do Ciebie”), liczba mnoga „6 wzorce” zamiast „6 wzorców”, brak testu jednostkowego reguł. Przed ponownym pokazaniem: reguły w danych (jak planowano w `components.md`), test z zestawem nagłówków (prawdziwy bez wzorców, klikbajt z wieloma), poprawna odmiana. Wejście ze Start zamienione na „Zobacz więcej sztuczek”. |
| B2 | Hasła glosariusza bez definicji (UE, CPN, WIG20, MFW, UKMTO, PIE, GW, VAT, FOMO, IEA, IRENA, KE, PMI, GPW) | Pomysł | Ostrzeżenia walidatora (zasada 7). Strony MFW, UKMTO i GPW blokują pobranie maszynowe, więc czekają na inne źródło pierwotne. 12 haseł z makiety jest „roboczych” (niepotwierdzonych w źródle). |
| B3 | Źródła pierwotne dla terminów RPP i GUS 30.11 w kalendarzu | Pomysł | Dziś źródła wtórne (strony NBP i GUS nie dały dat maszynowo). |
| B4 | Kontrola unikalności nazw klas CSS w lincie | Pomysł | Trzy kolizje nazw w tej sesji (`.lnk`, `.foot` i podobna). Prosta kontrola w `design-lint.py`. |
| B5 | Pary nagłówków w Newsy mają ok. 1160 px wysokości na telefonie | Pomysł | Rozważyć skrócenie lub zwijanie „Naprawdę znaczy” poza trybem zgadywania. |

## Pomysły (z `docs/expansion-ideas.md`)

Fala A zrobiona: Jak to sprawdzamy, kalendarz, słownik. Tryb spokojny i dostępność (#4) nie ruszone. Dalej: fala B (biblioteka „dwóch nagłówków”, „Uczę się”, profil lokalny, dane otwarte, RSS) i fala C (długi horyzont i UE, „Twoja inflacja”, tryb nauczyciela).
