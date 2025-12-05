"use client";

import { COMPANY_INFO } from "../lib/company";
import { amountToWords, formatCurrency } from "../lib/format";
import { InvoiceInput, Worker } from "../lib/types";

export type InvoicePreviewProps = {
  worker?: Worker;
  invoice: InvoiceInput;
  grossTotal: number;
};

export function InvoicePreview({ worker, invoice, grossTotal }: InvoicePreviewProps) {
  const words = amountToWords(grossTotal || 0);

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="section-title">Rachunek do umowy zlecenie</p>
          <h2 className="text-xl font-bold text-primary">{invoice.invoiceNumber}</h2>
          <p className="text-sm text-slate-500">Data wystawienia: {invoice.issueDate}</p>
        </div>
        <div className="text-right text-sm text-slate-600">
          <p>Kwota brutto</p>
          <p className="text-3xl font-semibold text-primary">{formatCurrency(grossTotal)}</p>
          <p className="text-xs text-slate-500">(słownie: {words})</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
          <p className="section-title mb-1">Zleceniodawca</p>
          <p className="font-semibold text-primary">{COMPANY_INFO.name}</p>
          <p className="text-sm text-slate-700">{COMPANY_INFO.addressLine1}</p>
          <p className="text-sm text-slate-700">{COMPANY_INFO.addressLine2}</p>
        </div>
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
          <p className="section-title mb-1">Zleceniobiorca</p>
          <p className="font-semibold text-primary">{worker?.fullName || "Wybierz pracownika"}</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{worker?.address}</p>
          <p className="text-sm text-slate-700">PESEL: {worker?.pesel}</p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="table-head grid grid-cols-12">
          <div className="table-cell col-span-6 font-semibold">Tytuł</div>
          <div className="table-cell col-span-2 font-semibold text-right">Liczba godzin</div>
          <div className="table-cell col-span-2 font-semibold text-right">Stawka</div>
          <div className="table-cell col-span-2 font-semibold text-right">Kwota</div>
        </div>
        <div className="grid grid-cols-12">
          <div className="table-cell col-span-6">
            {invoice.period || "Okres zlecenia"}
            {invoice.description ? (
              <p className="text-xs text-slate-500 mt-1">{invoice.description}</p>
            ) : null}
          </div>
          <div className="table-cell col-span-2 text-right">
            {invoice.hours ? `${invoice.hours} h` : "-"}
          </div>
          <div className="table-cell col-span-2 text-right">
            {invoice.rate ? formatCurrency(invoice.rate) : "-"}
          </div>
          <div className="table-cell col-span-2 text-right font-semibold">{formatCurrency(grossTotal)}</div>
        </div>
        <div className="grid grid-cols-12 bg-slate-50">
          <div className="table-cell col-span-10 text-right font-semibold">Razem do wypłaty</div>
          <div className="table-cell col-span-2 text-right font-semibold">{formatCurrency(grossTotal)}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="section-title">Kwota słownie</p>
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-sm text-primary font-semibold">
            {words}
          </div>
          <p className="text-xs text-slate-500">Kwota obejmuje wynagrodzenie brutto za wskazany okres zlecenia.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center items-end">
          <div className="space-y-8">
            <div className="h-12 border-b border-slate-300" />
            <p className="text-sm text-slate-600">Zleceniobiorca</p>
          </div>
          <div className="space-y-8">
            <div className="h-12 border-b border-slate-300" />
            <p className="text-sm text-slate-600">Zleceniodawca</p>
          </div>
        </div>
      </div>
    </div>
  );
}
