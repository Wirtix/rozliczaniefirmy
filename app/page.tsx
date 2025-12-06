"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { InvoiceForm } from "./components/InvoiceForm";
import { InvoicePreview } from "./components/InvoicePreview";
import { loadWorkers } from "./lib/storage";
import { InvoiceInput, Worker } from "./lib/types";

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

  useEffect(() => {
    setWorkers(loadWorkers());
  }, []);

  const handleInvoiceChange = useCallback((data: InvoiceInput, total: number) => {
    setInvoice(data);
    setGrossTotal(total);
  }, []);

  const selectedWorker = useMemo(
    () => workers.find((w) => w.id === invoice?.workerId),
    [workers, invoice?.workerId],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-title">Wystaw rachunek</p>
          <h2 className="text-2xl font-semibold text-primary">Generator rachunków do umowy zlecenie</h2>
          <p className="text-slate-600 max-w-2xl mt-1">
            Uzupełnij dane pracownika oraz okres zlecenia, aby wygenerować rachunek i pobrać go jako PDF z układem odpowiadającym klasycznym formularzom.
          </p>
        </div>
        <Link
          href="/workers"
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"
        >
          Zarządzaj pracownikami
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2">
          <InvoiceForm workers={workers} onChange={handleInvoiceChange} />
        </div>
        <div className="space-y-4">
          <InvoicePreview worker={selectedWorker} invoice={invoice} grossTotal={grossTotal} />
          <div className="card p-4 flex items-center justify-between">
            <div>
              <p className="section-title">Eksport</p>
              <p className="font-semibold text-primary">Pobierz gotowy PDF</p>
            </div>
            <PDFGenerator worker={selectedWorker} invoice={invoice} grossTotal={grossTotal} />
          </div>
          <div className="card p-4 space-y-3">
            <p className="section-title">Przydatne wskazówki</p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              <li>Pracownicy są zapisywani w localStorage i dostępni tylko lokalnie.</li>
              <li>Kwota brutto może być wyliczona z godzin i stawki lub wpisana ręcznie.</li>
              <li>Numer rachunku generowany jest automatycznie i rośnie przy kolejnych dokumentach.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
