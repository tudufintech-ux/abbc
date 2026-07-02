import type { CurrencyCode } from "@/config/currencies";

export type InvoiceCurrency = CurrencyCode;

export type StoredDonationInvoice = {
  invoiceNumber: string;
  issueDate: string;
  donorName: string;
  donorDocumentType: string;
  donorDocumentNumber: string;
  donorTaxId: string;
  country: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  currency: InvoiceCurrency;
  purpose: string;
  notes: string;
  status: "Awaiting Wire Transfer" | "Pending" | "Paid" | "Failed";
  paymentUrl: string;
  createdAt: string;
};

export const ABBC_PUBLIC_DETAILS = {
  beneficiaryName: "ASSOCIACAO BRASILEIRA DE BENEFICIO A COMUNIDADE",
  beneficiaryCnpj: "26.714.591/0001-52",
  pixKey: "26.714.591/0001-52",
  bankName: "BANCO DO BRASIL S.A.",
  bankCode: "001",
  bankAgency: "6934-5",
  bankAccount: "13.186-5",
  iban: "BR50000000000069340000131865C1",
  swiftBic: "BRASBRRJSBO",
  bankAddress: "Rua São Bento, 465, 5º andar - Centro - São Paulo/SP, Brazil",
  correspondentBank: "Not applicable",
  accountInternationalStatus: "Enabled for international wire transfers",
};

const INVOICE_STORAGE_PREFIX = "abbc-donation-invoice:";

export function getInvoiceStorageKey(invoiceNumber: string) {
  return `${INVOICE_STORAGE_PREFIX}${invoiceNumber}`;
}

export function saveStoredInvoice(invoice: StoredDonationInvoice) {
  window.localStorage.setItem(
    getInvoiceStorageKey(invoice.invoiceNumber),
    JSON.stringify(invoice),
  );
}

export function getStoredInvoice(invoiceNumber: string): StoredDonationInvoice | null {
  const raw = window.localStorage.getItem(getInvoiceStorageKey(invoiceNumber));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredDonationInvoice;
  } catch {
    return null;
  }
}
