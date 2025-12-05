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

## Stałe dane firmy
- **Koreptycje na już Oskar Skutnik**
- Traugutta 3a m 18, 16-020 Czarna Białostocka
- REGON: 540581214, NIP: 9661385512
- Telefon: 531 567 262
