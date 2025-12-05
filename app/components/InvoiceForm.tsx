"use client";

import { useEffect, useMemo, useState } from "react";
import { nextInvoiceNumber } from "../lib/storage";
import { formatCurrency } from "../lib/format";
import { InvoiceInput, Worker } from "../lib/types";

export type InvoiceFormProps = {
  workers: Worker[];
  onChange: (invoice: InvoiceInput, grossTotal: number) => void;
};

const today = new Date().toISOString().slice(0, 10);

export function InvoiceForm({ workers, onChange }: InvoiceFormProps) {
  const [invoice, setInvoice] = useState<InvoiceInput>({
    workerId: workers[0]?.id || "",
    hours: null,
    rate: null,
    grossAmount: null,
    period: "",
    description: "",
    issueDate: today,
    invoiceNumber: nextInvoiceNumber(),
  });

  useEffect(() => {
    setInvoice((prev) => ({ ...prev, workerId: workers[0]?.id || prev.workerId }));
  }, [workers]);

  const grossValue = useMemo(() => {
    if (invoice.grossAmount && invoice.grossAmount > 0) return invoice.grossAmount;
    if (invoice.hours && invoice.rate) return invoice.hours * invoice.rate;
    return 0;
  }, [invoice.grossAmount, invoice.hours, invoice.rate]);

  useEffect(() => {
    onChange(invoice, grossValue);
  }, [invoice, grossValue, onChange]);

  const handleChange = (field: keyof InvoiceInput, value: string) => {
    if (field === "hours" || field === "rate" || field === "grossAmount") {
      setInvoice((prev) => ({ ...prev, [field]: value ? Number(value) : null }));
    } else {
      setInvoice((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-title">Dane rachunku</p>
          <h2 className="text-lg font-semibold text-primary">Formularz generowania</h2>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>Kwota brutto</p>
          <p className="text-xl font-semibold text-primary">{formatCurrency(grossValue)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="field-label">Pracownik</label>
          <select
            value={invoice.workerId}
            onChange={(e) => handleChange("workerId", e.target.value)}
            className="field-input"
          >
            {workers.length === 0 && <option>Brak pracowników</option>}
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="field-label">Miesiąc / okres zlecenia</label>
          <input
            value={invoice.period}
            onChange={(e) => handleChange("period", e.target.value)}
            className="field-input"
            placeholder="np. Styczeń 2025"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="field-label">Liczba godzin</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={invoice.hours ?? ""}
            onChange={(e) => handleChange("hours", e.target.value)}
            className="field-input"
            placeholder="np. 40"
          />
        </div>
        <div className="space-y-1">
          <label className="field-label">Stawka brutto (zł)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={invoice.rate ?? ""}
            onChange={(e) => handleChange("rate", e.target.value)}
            className="field-input"
            placeholder="np. 80"
          />
        </div>
        <div className="space-y-1">
          <label className="field-label">Kwota brutto (opcjonalnie)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={invoice.grossAmount ?? ""}
            onChange={(e) => handleChange("grossAmount", e.target.value)}
            className="field-input"
            placeholder="np. 3200"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="field-label">Data wystawienia</label>
          <input
            type="date"
            value={invoice.issueDate}
            onChange={(e) => handleChange("issueDate", e.target.value)}
            className="field-input"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="field-label flex items-center justify-between">
            Numer rachunku
            <button
              type="button"
              className="text-xs text-accent underline"
              onClick={() => setInvoice((prev) => ({ ...prev, invoiceNumber: nextInvoiceNumber() }))}
            >
              Wygeneruj kolejny
            </button>
          </label>
          <input
            value={invoice.invoiceNumber}
            onChange={(e) => handleChange("invoiceNumber", e.target.value)}
            className="field-input"
            placeholder="R/2025/0001"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="field-label">Uwagi / opis</label>
        <textarea
          value={invoice.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          className="field-input min-h-[80px]"
          placeholder="Dodatkowe informacje do rachunku"
        />
      </div>
    </div>
  );
}
