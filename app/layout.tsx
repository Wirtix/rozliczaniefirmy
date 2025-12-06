import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rachunki do umowy zlecenie",
  description: "Generator rachunków do umowy zlecenie dla pracowników",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-white shadow-sm">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Panel rozliczeń</p>
                <h1 className="text-xl font-semibold text-primary">Rachunki do umowy zlecenie</h1>
              </div>
              <nav className="flex items-center gap-4 text-sm font-medium">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-slate-700"
                >
                  Wystaw rachunek
                </Link>
                <Link
                  href="/invoices"
                  className="px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-slate-700"
                >
                  Lista rachunków
                </Link>
                <Link
                  href="/workers"
                  className="px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-slate-700"
                >
                  Pracownicy
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 max-w-6xl mx-auto px-6 py-10">{children}</main>
          <footer className="border-t bg-white text-center py-4 text-sm text-slate-500">
            Rachunki generowane lokalnie • Dane pozostają w Twojej przeglądarce
          </footer>
        </div>
      </body>
    </html>
  );
}
