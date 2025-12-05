import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generator rachunków do umowy zlecenie',
  description: 'Lokalny generator PDF z pamięcią pracowników',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <header>
          <h1>Generator rachunków do umowy zlecenie</h1>
          <p className="muted">Dane firmy są ustawione na stałe. Dodaj pracownika, wpisz wartości i pobierz gotowy PDF.</p>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
