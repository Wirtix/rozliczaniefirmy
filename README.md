# Generator rachunków do umowy zlecenie

Aplikacja Next.js 14 w TypeScript do lokalnego wystawiania rachunków do umowy zlecenia. Dane pracowników są przechowywane w `localStorage`, a PDF odwzorowuje układ klasycznego rachunku.

## Funkcje
- Dodawanie, edycja i usuwanie pracowników (dane lokalne).
- Formularz wystawiania rachunku z numerem, okresem, godzinami/kwotą brutto.
- Podgląd HTML i eksport do PDF (@react-pdf/renderer) z danymi firmy:
  - **Korepetycje na już Oskar Skutnik**
  - **Traugutta 18/3A**
  - **16-020 Czarna Białostocka**
- Formatowanie PLN i kwota słownie po polsku.
- Automatyczne numerowanie rachunków (`R/RRRR/0001`).
- Render PDF korzysta z udostępnionych publicznie czcionek Noto Sans (pobieranych z repozytorium Google Fonts), dzięki czemu nie ma potrzeby
  trzymania binarnych plików czcionek w repozytorium.

## Uruchomienie
1. Zainstaluj zależności (np. `bun install`, `npm install` lub `pnpm install`).
2. Uruchom tryb deweloperski: `bun dev` / `npm run dev`.
3. Wejdź na `http://localhost:3000` aby wystawiać rachunki, a na `/workers` aby zarządzać pracownikami.

## Uwaga dotycząca plików binarnych
Repozytorium zawiera domyślne `.gitignore`, które wyklucza katalogi buildów (`.next`, `out`), zależności (`node_modules`) oraz inne potencjalnie binarne artefakty. Dzięki temu kolejne commity/PR-y nie powinny być blokowane komunikatem „Pliki binarne nie są obsługiwane”.
