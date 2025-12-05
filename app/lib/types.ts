export type Worker = {
  id: string;
  fullName: string;
  address: string;
  pesel: string;
};

export type InvoiceInput = {
  workerId: string;
  hours: number | null;
  rate: number | null;
  grossAmount: number | null;
  period: string;
  issueDate: string;
  invoiceNumber: string;
  description?: string;
};

export type CompanyInfo = {
  name: string;
  addressLine1: string;
  addressLine2: string;
};
