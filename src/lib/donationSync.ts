import type { CurrencyCode } from "@/config/currencies";

export type DonationPayload = {
  invoiceNumber: string;
  createdAt: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  donorName: string;
  donorDocumentType: string;
  donorDocumentNumber: string;
  donorCountry: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  currency: CurrencyCode;
  purpose: string;
  notes: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference: string;
  paymentPage: string;
  pdfGenerated: boolean;
  whatsappSent: boolean;
};

export async function registerDonation(data: DonationPayload) {
  try {
    const response = await fetch("/api/donations/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      console.warn("[Donation Sync] Google Sheets registration pending.", payload);
      return {
        success: false,
        pendingIntegration: true,
        error: payload,
      };
    }

    return payload;
  } catch (error) {
    console.warn("[Donation Sync] Google Sheets registration pending.", error);
    return {
      pendingIntegration: true,
      success: false,
      error,
    };
  }
}
