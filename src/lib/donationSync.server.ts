import process from "node:process";

export type GoogleSheetsDonationPayload = {
  data_criacao: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  payment_terms: string;
  tipo_doacao: string;
  donor_name: string;
  donor_document_type: string;
  donor_document_number: string;
  donor_country: string;
  donor_email: string;
  donor_phone: string;
  amount: number;
  currency: string;
  purpose: string;
  notes: string;
  payment_method: string;
  payment_status: string;
  payment_reference: string;
  payment_page: string;
  pdf_generated: boolean;
  whatsapp_sent: boolean;
  created_from: string;
  status_operacional: string;
  observacoes_internas: string;
};

export async function registerDonationOnGoogleSheets(payload: GoogleSheetsDonationPayload) {
  const enabled = process.env.GOOGLE_SHEETS_ENABLED === "true";
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!enabled || !webhookUrl) {
    console.warn("[Donation Sync] Google Sheets disabled or webhook missing.");
    return {
      success: true,
      skipped: true,
      reason: "Google Sheets disabled or webhook missing",
    };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("[Donation Sync] Google Sheets error", data);
    return {
      success: false,
      error: data,
    };
  }

  return {
    success: true,
    data,
  };
}
