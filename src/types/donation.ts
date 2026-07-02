export type DonationInvoiceStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired";

export type DonationInvoice = {
  id: string;
  invoiceNumber: string;
  payerName: string;
  payerDocument: string;
  payerEmail: string;
  payerPhone: string;
  amount: number;
  description: string;
  installments: number;
  currency: "BRL";
  status: DonationInvoiceStatus;
  gateway: "cielo";
  cieloPaymentLinkId?: string;
  cieloPaymentLinkUrl?: string;
  cieloRawResponse?: unknown;
  createdAt: string;
};
