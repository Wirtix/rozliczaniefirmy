import { Worker } from "./types";

const WORKERS_ENDPOINT = "/api/workers";
const INVOICE_NUMBER_KEY = "rf_invoice_counter";
const LOGO_KEY = "rf_company_logo";

const isBrowser = typeof window !== "undefined";

export async function loadWorkers(): Promise<Worker[]> {
  try {
    const response = await fetch(WORKERS_ENDPOINT, { cache: "no-store" });
    if (!response.ok) throw new Error(`Request failed with ${response.status}`);
    const data = (await response.json()) as Worker[];
    return data;
  } catch (error) {
    console.error("Nie udało się pobrać pracowników", error);
    return [];
  }
}

export async function persistWorkers(workers: Worker[]) {
  try {
    await fetch(WORKERS_ENDPOINT, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workers),
    });
  } catch (error) {
    console.error("Nie udało się zapisać pracowników", error);
  }
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
