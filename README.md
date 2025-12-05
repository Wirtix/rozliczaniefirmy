# Generator rachunków do umowy zlecenie

Prosta aplikacja Flask do lokalnego wystawiania rachunków PDF dla umowy zlecenie. Pozwala zapisać dane pracowników i generować estetyczne PDF-y z gotowymi polami.

## Jak uruchomić lokalnie
1. Utwórz i aktywuj wirtualne środowisko (opcjonalnie):
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```
2. Zainstaluj zależności:
   ```bash
   pip install -r requirements.txt
   ```
3. Uruchom serwer:
   ```bash
   python app.py
   ```
4. Wejdź na `http://127.0.0.1:5000` aby dodawać pracowników i pobierać rachunki PDF.

## Funkcje
- Zapisywanie listy pracowników w pliku `data/employees.json`.
- Formularz generowania rachunku z wyborem pracownika, numerem, datami i wartościami poszczególnych pozycji.
- PDF stylizowany na wzór załączonego rachunku z wypełnionymi danymi firmy.

## Dane firmy
Aplikacja wykorzystuje stałe dane zleceniodawcy:
- **Koreptycje na już Oskar Skutnik**
- Traugutta 3a m 18, 16-020 Czarna Białostocka
- REGON: 540581214, NIP: 9661385512
- Telefon: 531 567 262
