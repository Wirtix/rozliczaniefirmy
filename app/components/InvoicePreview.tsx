"use client";

import clsx from "clsx";
import { COMPANY_INFO } from "../lib/company";
import { amountToWords, formatCurrency, formatDateTime, wrapSignatureId } from "../lib/format";
import { InvoiceInput, SignatureInfo, Worker } from "../lib/types";

export type InvoicePreviewProps = {
  worker?: Worker;
  invoice: InvoiceInput;
  grossTotal: number;
  signature: SignatureInfo | null;
  className?: string;
};

export function InvoicePreview({ worker, invoice, grossTotal, signature, className }: InvoicePreviewProps) {
  const words = amountToWords(grossTotal || 0);
  const city = COMPANY_INFO.city || COMPANY_INFO.addressLine2;
  const signedAt = signature ? formatDateTime(new Date(signature.signedAtISO)) : "";
  const signatureIdWrapped = signature ? wrapSignatureId(signature.signatureId) : "";

  return (
    <div className={clsx("card p-6 space-y-6 max-w-[820px] mx-auto", className)}>
      <div className="flex justify-between items-start text-sm text-slate-600">
        {invoice.logoDataUrl ? (
          <img src={invoice.logoDataUrl} alt="Logo firmy" className="h-12 w-auto object-contain" />
        ) : (
          <div />
        )}
        <div>
          {city}, dn. {invoice.issueDate}
        </div>
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
          <p>{worker?.pesel || "................"}</p>
        </div>
        <p className="text-slate-700">
          za wykonanie prac zgodnie z umową nr: {worker?.contractNumber || "........"} z dnia {worker?.contractDate || "........"} w
          okresie od {invoice.period || "........"}
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
            <div className="mt-3 p-3 border border-dashed border-slate-300 rounded text-left text-[11px] leading-tight bg-slate-50">
              <p className="font-semibold text-slate-800">Podpisano elektronicznie</p>
              {signature ? (
                <>
                  <p>Przez: {signature.signerName}</p>
                  <p className="text-[10px] leading-tight text-slate-700">
                    <span className="block font-semibold text-slate-800">ID podpisu:</span>
                    <span className="block w-full break-all rounded bg-white/70 px-1 py-[2px] font-mono text-[9px] leading-snug text-slate-900 ring-1 ring-slate-200">
                      {signatureIdWrapped}
                    </span>
                  </p>
                  <p>Data: {signedAt}</p>
                </>
              ) : (
                <p className="text-slate-600">Trwa generowanie podpisu...</p>
              )}
            </div>
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
