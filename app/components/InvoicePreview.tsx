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
  const city = COMPANY_INFO.city || COMPANY_INFO.addressLine2;

  return (
    <div className="card p-6 space-y-6">
      <div className="flex justify-end text-sm text-slate-600">
        {city}, dn. {invoice.issueDate}
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">RACHUNEK DO UMOWY ZLECENIE</h2>
        <p className="text-sm text-slate-700">nr {invoice.invoiceNumber || ".........."} z dnia {invoice.issueDate} r.</p>
      </div>

      <div className="space-y-3 text-sm text-slate-800">
        <div>
          <p className="font-semibold">Zleceniodawca:</p>
          <p>{COMPANY_INFO.name}</p>
          <p>{COMPANY_INFO.addressLine1}</p>
          <p>{COMPANY_INFO.addressLine2}</p>
        </div>
        <div>
          <p className="font-semibold">Zleceniobiorca: {worker?.fullName || "................................"}</p>
          <p>{worker?.address || "........................................................"}</p>
          <p>PESEL: {worker?.pesel || "................"}</p>
        </div>
        <p className="text-slate-700">
          za wykonanie prac zgodnie z umową nr: {invoice.invoiceNumber || "........"} w okresie od {invoice.period || "........"}
        </p>
      </div>

      <div className="space-y-2 text-sm text-slate-800">
        <p className="text-center font-semibold">ROZLICZENIE</p>
        <div className="flex items-center gap-2">
          <span>1. Kwota brutto:</span>
          <div className="flex-1 border-b border-dashed border-slate-300" />
          <span className="font-semibold">{formatCurrency(grossTotal)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>2. Ubezpieczenie społeczne:</span>
          <div className="flex-1 border-b border-dashed border-slate-300" />
          <span>0,00 zł</span>
        </div>
        <div className="flex items-center gap-2">
          <span>3. Ubezpieczenie zdrowotne:</span>
          <div className="flex-1 border-b border-dashed border-slate-300" />
          <span>0,00 zł</span>
        </div>
        <div className="flex items-center gap-2">
          <span>4. Koszty uzyskania przychodu:</span>
          <div className="flex-1 border-b border-dashed border-slate-300" />
          <span>0,00 zł</span>
        </div>
        <div className="flex items-center gap-2">
          <span>5. Podstawa opodatkowania:</span>
          <div className="flex-1 border-b border-dashed border-slate-300" />
          <span>0,00 zł</span>
        </div>
        <div className="flex items-center gap-2">
          <span>6. Potrącenia:</span>
          <div className="flex-1 border-b border-dashed border-slate-300" />
          <span>0,00 zł</span>
        </div>
        <div className="flex items-center gap-2">
          <span>7. Do wypłaty:</span>
          <div className="flex-1 border-b border-dashed border-slate-300" />
          <span className="font-semibold">{formatCurrency(grossTotal)}</span>
        </div>
      </div>

      <div className="space-y-4 text-sm text-slate-800">
        <div>
          <p>Słownie: {words}</p>
          <div className="border-b border-dashed border-slate-300" />
        </div>
        <div className="grid grid-cols-2 gap-6 text-center">
          <div>
            <div className="h-10 border-b border-slate-400" />
            <p className="text-xs mt-2">Zleceniobiorca</p>
          </div>
          <div>
            <div className="h-10 border-b border-slate-400" />
            <p className="text-xs mt-2">Zleceniodawca</p>
          </div>
        </div>
        <div>
          <p>Upoważniony do odbioru wynagrodzenia przelewem:</p>
          <div className="border-b border-dashed border-slate-300" />
        </div>
      </div>
    </div>
  );
}
