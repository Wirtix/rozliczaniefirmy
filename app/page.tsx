"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { InvoiceForm } from "./components/InvoiceForm";
import { InvoicePreview } from "./components/InvoicePreview";
import { loadWorkers } from "./lib/storage";
import { InvoiceInput, SignatureInfo, Worker } from "./lib/types";
import { createSignatureInfo } from "./lib/signature";

const PDFGenerator = dynamic(() => import("./components/PDFGenerator").then((mod) => mod.PDFGenerator), {
  ssr: false,
  loading: () => (
    <button
      disabled
      className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-300 text-white font-semibold shadow-sm"
    >
      Ładowanie...
    </button>
  ),
});

export default function HomePage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [invoice, setInvoice] = useState<InvoiceInput>({
    workerId: "",
    hours: null,
    rate: null,
    grossAmount: null,
    period: "",
    periodMode: "month",
    periodMonth: new Date().toISOString().slice(0, 7),
    periodFrom: "",
    periodTo: "",
    description: "",
    issueDate: new Date().toISOString().slice(0, 10),
    invoiceNumber: "",
    logoDataUrl: null,
  });
  const [grossTotal, setGrossTotal] = useState(0);
  const [signature, setSignature] = useState<SignatureInfo | null>(null);

  useEffect(() => {
    setWorkers(loadWorkers());
  }, []);

  const handleInvoiceChange = useCallback((data: InvoiceInput, total: number) => {
    setInvoice(data);
    setGrossTotal(total);
  }, []);

  useEffect(() => {
    const seed = `${invoice.workerId || "no-worker"}|${invoice.invoiceNumber}|${invoice.issueDate}|${invoice.period}|${grossTotal}`;
    setSignature(createSignatureInfo(seed));
  }, [invoice.workerId, invoice.invoiceNumber, invoice.issueDate, invoice.period, grossTotal]);

  const selectedWorker = useMemo(
    () => workers.find((w) => w.id === invoice?.workerId),
    [workers, invoice?.workerId],
  );

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 -mx-4 mb-2 border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="section-title">Wystaw rachunek</p>
            <h2 className="text-2xl font-semibold text-primary">Generator rachunków do umowy zlecenie</h2>
            <p className="mt-1 max-w-2xl text-slate-600">
              Uzupełnij dane pracownika oraz okres zlecenia, aby wygenerować rachunek i pobrać go jako PDF z układem odpowiadającym klasycznym formularzom.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/workers"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-50"
            >
              Zarządzaj pracownikami
            </Link>
            <PDFGenerator worker={selectedWorker} invoice={invoice} grossTotal={grossTotal} signature={signature} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-4">
          <InvoiceForm workers={workers} onChange={handleInvoiceChange} />
          <div className="card p-4 space-y-3">
            <p className="section-title">Przydatne wskazówki</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
              <li>Pracownicy są zapisywani w localStorage i dostępni tylko lokalnie.</li>
              <li>Kwota brutto może być wyliczona z godzin i stawki lub wpisana ręcznie.</li>
              <li>Numer rachunku generowany jest automatycznie i rośnie przy kolejnych dokumentach.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <p className="section-title">Podgląd PDF (pełna szerokość A4)</p>
          <InvoicePreview
            worker={selectedWorker}
            invoice={invoice}
            grossTotal={grossTotal}
            signature={signature}
            className="mx-auto w-full max-w-[900px]"
          />
        </div>
      </div>
    </div>
  );
}
