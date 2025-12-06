export type Worker = {
  id: string;
  fullName: string;
  address: string;
  pesel: string;
  contractNumber?: string;
  contractDate?: string;
};

export type InvoiceInput = {
  workerId: string;
  grossAmount: number | null;
  period: string;
  periodMode: "month" | "custom";
  periodMonth?: string;
  periodFrom?: string;
  periodTo?: string;
  issueDate: string;
  invoiceNumber: string;
  logoDataUrl?: string | null;
  description?: string;
};

export type CompanyInfo = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city?: string;
  signerName?: string;
};

export type SignatureInfo = {
  signerName: string;
  signatureId: string;
  signedAtISO: string;
};
