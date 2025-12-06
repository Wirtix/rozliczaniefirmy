"use client";

import { useEffect, useMemo, useState } from "react";
import { nextInvoiceNumber, loadLogo, persistLogo } from "../lib/storage";
import { customRangeLabel, formatCurrency, monthRangeLabel } from "../lib/format";
import { InvoiceInput, Worker } from "../lib/types";

export type InvoiceFormProps = {
  workers: Worker[];
  onChange: (invoice: InvoiceInput, grossTotal: number) => void;
};

const today = new Date().toISOString().slice(0, 10);
const currentMonth = new Date().toISOString().slice(0, 7);

const monthOptions = Array.from({ length: 12 }).map((_, index) => {
  const date = new Date();
  date.setMonth(date.getMonth() - index);
  const value = date.toISOString().slice(0, 7);
  const { label } = monthRangeLabel(value);
  return { value, label };
});

export function InvoiceForm({ workers, onChange }: InvoiceFormProps) {
  const [invoice, setInvoice] = useState<InvoiceInput>({
    workerId: workers[0]?.id || "",
    hours: null,
    rate: null,
    grossAmount: null,
    period: monthRangeLabel(currentMonth).range,
    periodMode: "month",
    periodMonth: currentMonth,
    periodFrom: "",
    periodTo: "",
    description: "",
    issueDate: today,
    invoiceNumber: nextInvoiceNumber(),
    logoDataUrl: null,
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

  useEffect(() => {
    const savedLogo = loadLogo();
    if (savedLogo) {
      setInvoice((prev) => ({ ...prev, logoDataUrl: savedLogo }));
    }
  }, []);

  const handleChange = (field: keyof InvoiceInput, value: string) => {
    if (field === "hours" || field === "rate" || field === "grossAmount") {
      setInvoice((prev) => ({ ...prev, [field]: value ? Number(value) : null }));
    } else {
      setInvoice((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleMonthChange = (value: string) => {
    const { range } = monthRangeLabel(value);
    setInvoice((prev) => ({
      ...prev,
      periodMode: "month",
      periodMonth: value,
      periodFrom: "",
      periodTo: "",
      period: range,
    }));
  };

  const handleCustomDateChange = (field: "periodFrom" | "periodTo", value: string) => {
    setInvoice((prev) => {
      const updated = { ...prev, periodMode: "custom", [field]: value } as InvoiceInput;
      const range = customRangeLabel(updated.periodFrom, updated.periodTo);
      return { ...updated, period: range };
    });
  };

  const handleLogoUpload = (file: File | null) => {
    if (!file) {
      setInvoice((prev) => ({ ...prev, logoDataUrl: null }));
      persistLogo(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setInvoice((prev) => ({ ...prev, logoDataUrl: result }));
      persistLogo(result);
    };
    reader.readAsDataURL(file);
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
          <label className="field-label">Okres zlecenia</label>
          <div className="space-y-2">
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => handleMonthChange(invoice.periodMonth || currentMonth)}
                className={`px-3 py-1 rounded border text-left flex-1 ${
                  invoice.periodMode === "month"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                Pełny miesiąc
              </button>
              <button
                type="button"
                onClick={() =>
                  setInvoice((prev) => ({ ...prev, periodMode: "custom", period: customRangeLabel(prev.periodFrom, prev.periodTo) }))
                }
                className={`px-3 py-1 rounded border text-left flex-1 ${
                  invoice.periodMode === "custom"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                Własny zakres
              </button>
            </div>

            {invoice.periodMode === "month" ? (
              <select
                value={invoice.periodMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="field-input"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Data od</label>
                  <input
                    type="date"
                    value={invoice.periodFrom || ""}
                    onChange={(e) => handleCustomDateChange("periodFrom", e.target.value)}
                    className="field-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Data do</label>
                  <input
                    type="date"
                    value={invoice.periodTo || ""}
                    onChange={(e) => handleCustomDateChange("periodTo", e.target.value)}
                    className="field-input"
                  />
                </div>
              </div>
            )}
            <p className="text-xs text-slate-500">Wyświetlany okres: {invoice.period || "(uzupełnij daty)"}</p>
          </div>
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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="field-label">Logo firmy (opcjonalnie)</label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)}
              className="text-sm text-slate-600"
            />
            {invoice.logoDataUrl && (
              <button
                type="button"
                onClick={() => handleLogoUpload(null)}
                className="text-xs text-red-500 underline"
              >
                Usuń logo
              </button>
            )}
          </div>
          {invoice.logoDataUrl && <p className="text-xs text-green-700">Logo będzie dołączone do PDF i podglądu.</p>}
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
