"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency, formatDateTime } from "../lib/format";
import { loadInvoices } from "../lib/storage";
import { InvoiceRecord } from "../lib/types";

const LazyPDFPreview = dynamic(() => import("../components/PDFGenerator").then((mod) => mod.PDFPreview), {
  ssr: false,
  loading: () => <div className="card p-6 text-sm text-slate-700">Ładowanie podglądu...</div>,
});

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadInvoices();
    setInvoices(stored);
    setSelectedId(stored[0]?.id ?? null);
  }, []);

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedId),
    [invoices, selectedId],
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="section-title">Lista rachunków</p>
        <h2 className="text-2xl font-semibold text-primary">Zapisane rachunki do podglądu</h2>
        <p className="mt-1 text-sm text-slate-700">
          Każdy pobrany rachunek trafia do lokalnej listy, dzięki czemu możesz wrócić do dokumentu i obejrzeć go ponownie bez
          ponownego wypełniania formularza.
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="card border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-700">
          <p className="text-lg font-semibold text-slate-900">Brak zapisanych rachunków</p>
          <p className="mt-2 text-sm">Wygeneruj i pobierz rachunek, aby pojawił się na tej liście.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.2fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Numer</th>
                    <th className="px-4 py-3 font-semibold">Pracownik</th>
                    <th className="px-4 py-3 font-semibold">Kwota</th>
                    <th className="px-4 py-3 font-semibold">Data</th>
                    <th className="px-4 py-3 font-semibold">Akcja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((item) => (
                    <tr
                      key={item.id}
                      className={selectedId === item.id ? "bg-amber-50" : "hover:bg-slate-50"}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">{item.invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-slate-800">{item.worker?.fullName || "(brak danych)"}</td>
                      <td className="px-4 py-3 text-slate-800">{formatCurrency(item.grossTotal)}</td>
                      <td className="px-4 py-3 text-slate-700">{formatDateTime(new Date(item.createdAt))}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold shadow-sm transition ${
                            selectedId === item.id
                              ? "bg-primary text-white shadow-amber-200"
                              : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          Podgląd
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <p className="section-title">Podgląd PDF</p>
            {selectedInvoice ? (
              <LazyPDFPreview
                worker={selectedInvoice.worker}
                invoice={selectedInvoice.invoice}
                grossTotal={selectedInvoice.grossTotal}
                signature={selectedInvoice.signature}
              />
            ) : (
              <div className="card p-6 text-sm text-slate-700">Wybierz rachunek z listy, aby zobaczyć podgląd PDF.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
