import { Worker } from "./types";

const WORKERS_KEY = "rf_workers";
const INVOICE_NUMBER_KEY = "rf_invoice_counter";
const LOGO_KEY = "rf_company_logo";

const isBrowser = typeof window !== "undefined";

export function loadWorkers(): Worker[] {
  if (!isBrowser) return [];
  const raw = window.localStorage.getItem(WORKERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Worker[];
    return parsed;
  } catch (error) {
    console.error("Nie udało się odczytać pracowników", error);
    return [];
  }
}

export function persistWorkers(workers: Worker[]) {
  if (!isBrowser) return;
  window.localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
}

export function nextInvoiceNumber(): string {
  if (!isBrowser) return "R/0000/0001";
  const current = Number(window.localStorage.getItem(INVOICE_NUMBER_KEY) || "0");
  const next = current + 1;
  window.localStorage.setItem(INVOICE_NUMBER_KEY, String(next));
  const year = new Date().getFullYear();
  return `R/${year}/${String(next).padStart(4, "0")}`;
}

export function loadLogo(): string | null {
  if (!isBrowser) return null;
  return window.localStorage.getItem(LOGO_KEY);
}

export function persistLogo(dataUrl: string | null) {
  if (!isBrowser) return;
  if (!dataUrl) {
    window.localStorage.removeItem(LOGO_KEY);
    return;
  }
  window.localStorage.setItem(LOGO_KEY, dataUrl);
}
