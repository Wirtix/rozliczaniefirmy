# Generator rachunków do umowy zlecenie (Next.js)

Lokalna aplikacja Next.js do wystawiania rachunków PDF dla umowy zlecenie. Umożliwia zapisywanie pracowników w pliku `data/employees.json`, wprowadzanie kwot i pobranie stylizowanego PDF z wypełnionymi danymi firmy.

## Szybki start
1. Zainstaluj zależności (wymagany Node 18+):
   ```bash
   npm install
   ```
2. Uruchom tryb deweloperski:
   ```bash
   npm run dev
   ```
3. Wejdź na `http://localhost:3000` i dodaj pracowników, a następnie wygeneruj rachunek PDF.

## Funkcje
- Zapisywanie listy pracowników na dysku (plik `data/employees.json`).
- Formularz generowania rachunku z wyborem pracownika, numerem, datami, kwotami oraz opisem wykonanych zleceń.
- Generowanie PDF po stronie serwera z zachowaniem firmowego layoutu i stałych danych zleceniodawcy.

### Czcionki
Generator PDF korzysta z czcionek DejaVu zakodowanych w Base64 w pliku `app/lib/fonts.ts`, co eliminuje binarne artefakty w repozytorium.
Fonty są rejestrowane bezpośrednio z bufora w trakcie tworzenia rachunku, dzięki czemu nie są potrzebne zewnętrzne pliki `.afm` i nie
wystąpi błąd "ENOENT" w środowisku buildu Next.js.

## Stałe dane firmy
- **Koreptycje na już Oskar Skutnik**
- Traugutta 3a m 18, 16-020 Czarna Białostocka
- REGON: 540581214, NIP: 9661385512
- Telefon: 531 567 262
