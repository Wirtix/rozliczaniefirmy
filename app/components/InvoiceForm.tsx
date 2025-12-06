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
    <div className="card p-5 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-title">Dane rachunku</p>
          <h2 className="text-lg font-semibold text-primary">Formularz generowania</h2>
        </div>
        <div className="rounded-xl bg-primary/10 px-4 py-3 text-right text-sm text-primary shadow-inner">
          <p className="text-xs uppercase tracking-wide text-primary/80">Kwota brutto</p>
          <p className="text-2xl font-bold leading-tight">{formatCurrency(grossValue)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-4 shadow-inner space-y-4">
        <div className="grid gap-3 xl:grid-cols-[1.1fr_1.5fr_1fr]">
          <div className="flex flex-col gap-2 rounded-xl border border-white/70 bg-white/80 p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="field-label">Pracownik</p>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">profil</span>
            </div>
            <select
              value={invoice.workerId}
              onChange={(e) => handleChange("workerId", e.target.value)}
              className="field-input bg-white/80 ring-1 ring-white"
            >
              {workers.length === 0 && <option>Brak pracowników</option>}
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.fullName}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Wybierz osobę z zapisanej listy pracowników.</p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-white/70 bg-white/80 p-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="field-label">Okres rozliczenia</p>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">{invoice.periodMode === "month" ? "Miesięczny" : "Własny zakres"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleMonthChange(invoice.periodMonth || currentMonth)}
                className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                  invoice.periodMode === "month"
                    ? "bg-primary text-white shadow"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Miesiąc
              </button>
              <button
                type="button"
                onClick={() =>
                  setInvoice((prev) => ({
                    ...prev,
                    periodMode: "custom",
                    period: customRangeLabel(prev.periodFrom, prev.periodTo),
                  }))
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                  invoice.periodMode === "custom"
                    ? "bg-primary text-white shadow"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Własny zakres
              </button>
            </div>
            {invoice.periodMode === "month" ? (
              <select
                value={invoice.periodMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="field-input bg-white/80 ring-1 ring-white"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <input
                  type="date"
                  value={invoice.periodFrom || ""}
                  onChange={(e) => handleCustomDateChange("periodFrom", e.target.value)}
                  className="field-input bg-white/80 ring-1 ring-white"
                />
                <input
                  type="date"
                  value={invoice.periodTo || ""}
                  onChange={(e) => handleCustomDateChange("periodTo", e.target.value)}
                  className="field-input bg-white/80 ring-1 ring-white"
                />
              </div>
            )}
          </div>

          <div className="grid gap-3 rounded-xl border border-white/70 bg-white/80 p-3 shadow-sm">
            <div className="space-y-1">
              <label className="field-label flex items-center justify-between">
                Numer rachunku
                <button
                  type="button"
                  className="text-xs font-semibold text-accent underline"
                  onClick={() => setInvoice((prev) => ({ ...prev, invoiceNumber: nextInvoiceNumber() }))}
                >
                  Generuj
                </button>
              </label>
              <input
                value={invoice.invoiceNumber}
                onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                className="field-input bg-white/80 ring-1 ring-white"
                placeholder="R/2025/0001"
              />
            </div>
            <div className="space-y-1">
              <label className="field-label">Data wystawienia</label>
              <input
                type="date"
                value={invoice.issueDate}
                onChange={(e) => handleChange("issueDate", e.target.value)}
                className="field-input bg-white/80 ring-1 ring-white"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-white/70 bg-white p-3 shadow-sm">
            <label className="field-label">Liczba godzin</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={invoice.hours ?? ""}
              onChange={(e) => handleChange("hours", e.target.value)}
              className="field-input bg-white"
              placeholder="np. 40"
            />
          </div>
          <div className="rounded-xl border border-white/70 bg-white p-3 shadow-sm">
            <label className="field-label">Stawka brutto (zł)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={invoice.rate ?? ""}
              onChange={(e) => handleChange("rate", e.target.value)}
              className="field-input bg-white"
              placeholder="np. 80"
            />
          </div>
          <div className="rounded-xl border border-white/70 bg-white p-3 shadow-sm">
            <label className="field-label">Kwota brutto (opcjonalnie)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={invoice.grossAmount ?? ""}
              onChange={(e) => handleChange("grossAmount", e.target.value)}
              className="field-input bg-white"
              placeholder="np. 3200"
            />
          </div>
          <div className="rounded-xl border border-white/70 bg-white p-3 shadow-sm">
            <p className="field-label">Aktualny zakres</p>
            <p className="mt-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              {invoice.period || "uzupełnij daty"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-2">
          <label className="field-label">Uwagi / opis</label>
          <textarea
            value={invoice.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            className="field-input min-h-[90px] rounded-xl"
            placeholder="Dodatkowe informacje do rachunku"
          />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="field-label">Logo firmy (opcjonalnie)</p>
            {invoice.logoDataUrl && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">dodano</span>}
          </div>
          <p className="text-xs text-slate-500">Dodaj znak graficzny, który pojawi się w PDF.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
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
                className="text-xs font-semibold text-red-500 underline"
              >
                Usuń logo
              </button>
            )}
          </div>
          {invoice.logoDataUrl && <p className="mt-2 text-xs text-green-700">Logo będzie dołączone do PDF i podglądu.</p>}
        </div>
      </div>
    </div>
  );
}
