"use client";

import { useEffect, useMemo, useState } from "react";
import { nextInvoiceNumber } from "../lib/storage";
import { customRangeLabel, formatCurrency, monthRangeLabel } from "../lib/format";
import { InvoiceInput, Worker } from "../lib/types";

export type InvoiceFormProps = {
  workers: Worker[];
  onChange: (invoice: InvoiceInput, grossTotal: number) => void;
};

const today = new Date().toISOString().slice(0, 10);
const currentMonth = new Date().toISOString().slice(0, 7);
const bundledLogoPath = "/branding/logo-placeholder.png";

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
    grossAmount: null,
    period: monthRangeLabel(currentMonth).range,
    periodMode: "month",
    periodMonth: currentMonth,
    periodFrom: "",
    periodTo: "",
    description: "",
    issueDate: today,
    invoiceNumber: nextInvoiceNumber(),
    logoDataUrl: bundledLogoPath,
  });

  useEffect(() => {
    setInvoice((prev) => ({ ...prev, workerId: workers[0]?.id || prev.workerId }));
  }, [workers]);

  const grossValue = useMemo(() => {
    if (invoice.grossAmount && invoice.grossAmount > 0) return invoice.grossAmount;
    return 0;
  }, [invoice.grossAmount]);

  useEffect(() => {
    onChange(invoice, grossValue);
  }, [invoice, grossValue, onChange]);

  const handleChange = (field: keyof InvoiceInput, value: string) => {
    if (field === "grossAmount") {
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

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-5 shadow-lg shadow-amber-100/70">
      <div className="pointer-events-none absolute -right-12 -top-10 h-44 w-44 rounded-full bg-cyan-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-pink-200/50 blur-3xl" />

      <div className="relative space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-primary via-emerald-600 to-accent px-4 py-3 text-white shadow-lg shadow-emerald-200/30">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Dane rachunku</p>
            <h2 className="text-lg font-semibold">Formularz generowania</h2>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 text-right shadow-inner shadow-primary/20 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/80">Kwota brutto</p>
            <p className="text-3xl font-bold leading-tight drop-shadow-sm">{formatCurrency(grossValue)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-amber-50">
          <div className="grid gap-3 xl:grid-cols-[1.1fr_1.4fr_1fr]">
            <div className="flex flex-col gap-2 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-amber-100/60 p-3 shadow-sm shadow-amber-100">
              <div className="flex items-center justify-between">
                <p className="field-label text-amber-900">Pracownik</p>
                <span className="rounded-full bg-amber-200/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900">profil</span>
              </div>
              <select
                value={invoice.workerId}
                onChange={(e) => handleChange("workerId", e.target.value)}
                className="field-input bg-white/80 ring-1 ring-amber-100"
              >
                {workers.length === 0 && <option>Brak pracowników</option>}
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.fullName}
                  </option>
                ))}
              </select>
              <p className="text-xs text-amber-700">Wybierz osobę z zapisanej listy pracowników.</p>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-cyan-100/60 p-3 shadow-sm shadow-cyan-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="field-label text-cyan-900">Okres rozliczenia</p>
                <span className="rounded-full bg-cyan-600 px-3 py-1 text-[11px] font-semibold text-white shadow-md shadow-cyan-200">{invoice.periodMode === "month" ? "Miesięczny" : "Własny zakres"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleMonthChange(invoice.periodMonth || currentMonth)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold shadow-md shadow-amber-200 transition ${
                    invoice.periodMode === "month"
                      ? "bg-amber-500 text-white"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-200"
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
                  className={`rounded-full px-4 py-2 text-sm font-semibold shadow-md shadow-cyan-200 transition ${
                    invoice.periodMode === "custom"
                      ? "bg-cyan-600 text-white"
                      : "bg-cyan-100 text-cyan-900 hover:bg-cyan-200"
                  }`}
                >
                  Własny zakres
                </button>
              </div>
              {invoice.periodMode === "month" ? (
                <select
                  value={invoice.periodMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="field-input bg-white/80 ring-1 ring-cyan-100"
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
                    className="field-input bg-white/80 ring-1 ring-cyan-100"
                  />
                  <input
                    type="date"
                    value={invoice.periodTo || ""}
                    onChange={(e) => handleCustomDateChange("periodTo", e.target.value)}
                    className="field-input bg-white/80 ring-1 ring-cyan-100"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-3 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/60 p-3 shadow-sm shadow-emerald-100">
              <div className="space-y-1">
                <label className="field-label flex items-center justify-between text-emerald-900">
                  Numer rachunku
                  <button
                    type="button"
                    className="text-xs font-semibold text-emerald-700 underline"
                    onClick={() => setInvoice((prev) => ({ ...prev, invoiceNumber: nextInvoiceNumber() }))}
                  >
                    Generuj
                  </button>
                </label>
                <input
                  value={invoice.invoiceNumber}
                  onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                  className="field-input bg-white/80 ring-1 ring-emerald-100"
                  placeholder="R/2025/0001"
                />
              </div>
              <div className="space-y-1">
                <label className="field-label text-emerald-900">Data wystawienia</label>
                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => handleChange("issueDate", e.target.value)}
                  className="field-input bg-white/80 ring-1 ring-emerald-100"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-xl border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 via-white to-fuchsia-100/60 p-3 shadow-sm shadow-fuchsia-100">
              <label className="field-label text-fuchsia-900">Kwota brutto</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={invoice.grossAmount ?? ""}
                onChange={(e) => handleChange("grossAmount", e.target.value)}
                className="field-input bg-white/80 ring-1 ring-fuchsia-100"
                placeholder="np. 3200"
              />
              <p className="mt-2 text-xs text-fuchsia-800">
                Pole godzin i stawek zostało usunięte – wpisz bezpośrednio pełną kwotę brutto za zlecenie.
              </p>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-indigo-100/60 p-3 shadow-sm shadow-indigo-100">
              <p className="field-label text-indigo-900">Aktualny zakres</p>
              <p className="mt-2 rounded-lg border border-dashed border-indigo-100 bg-indigo-50/70 px-3 py-2 text-sm font-semibold text-indigo-900">
                {invoice.period || "uzupełnij daty"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-2 rounded-xl border border-primary/10 bg-white/90 p-4 shadow-md shadow-primary/5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <label className="field-label text-primary">Uwagi / opis</label>
            </div>
            <textarea
              value={invoice.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="field-input min-h-[90px] rounded-xl bg-white/80 ring-1 ring-primary/10"
              placeholder="Dodatkowe informacje do rachunku"
            />
            <p className="text-xs text-primary/70">Opis pojawi się w wydruku PDF.</p>
          </div>

          <div className="rounded-xl border border-lime-100 bg-gradient-to-br from-lime-50 via-white to-lime-100/60 p-4 shadow-md shadow-lime-100">
            <p className="field-label text-lime-900">Logo firmy</p>
            <p className="mt-1 text-sm text-lime-800">
              Logo jest już osadzone w plikach projektu i zostanie automatycznie dodane do PDF.
            </p>
            <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-xs font-semibold text-lime-900 shadow-inner shadow-lime-100">
              Jeśli podmienisz plik w <span className="font-mono">public/branding/logo-placeholder.svg</span>, nowa wersja pokaże się w podglądzie.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
