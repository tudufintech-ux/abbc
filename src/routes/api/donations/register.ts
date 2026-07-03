import { createFileRoute } from "@tanstack/react-router";

import {
  registerDonationOnGoogleSheets,
  type GoogleSheetsDonationPayload,
} from "@/lib/donationSync.server";

type DonationRegisterRequest = {
  invoiceNumber?: unknown;
  createdAt?: unknown;
  issueDate?: unknown;
  dueDate?: unknown;
  paymentTerms?: unknown;
  donorName?: unknown;
  donorDocumentType?: unknown;
  donorDocumentNumber?: unknown;
  donorCountry?: unknown;
  donorEmail?: unknown;
  donorPhone?: unknown;
  amount?: unknown;
  currency?: unknown;
  purpose?: unknown;
  notes?: unknown;
  paymentMethod?: unknown;
  paymentStatus?: unknown;
  paymentReference?: unknown;
  paymentPage?: unknown;
  pdfGenerated?: unknown;
  whatsappSent?: unknown;
};

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asAmount(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return Number.NaN;
  const normalized = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : value;
  return Number(normalized);
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

function toGoogleSheetsPayload(body: DonationRegisterRequest): GoogleSheetsDonationPayload {
  const invoiceNumber = asText(body.invoiceNumber);
  const createdAt = asText(body.createdAt) || new Date().toISOString();
  const paymentReference = asText(body.paymentReference) || invoiceNumber;

  return {
    data_criacao: createdAt,
    invoice_number: invoiceNumber,
    issue_date: asText(body.issueDate) || createdAt,
    due_date: asText(body.dueDate),
    payment_terms: asText(body.paymentTerms) || "Net 30 Days",
    tipo_doacao: "internacional",
    donor_name: asText(body.donorName),
    donor_document_type: asText(body.donorDocumentType),
    donor_document_number: asText(body.donorDocumentNumber),
    donor_country: asText(body.donorCountry),
    donor_email: asText(body.donorEmail),
    donor_phone: asText(body.donorPhone),
    amount: asAmount(body.amount),
    currency: asText(body.currency),
    purpose: asText(body.purpose),
    notes: asText(body.notes),
    payment_method: asText(body.paymentMethod) || "wire_swift",
    payment_status: asText(body.paymentStatus) || "awaiting_wire_transfer",
    payment_reference: paymentReference,
    payment_page: asText(body.paymentPage),
    pdf_generated: asBoolean(body.pdfGenerated),
    whatsapp_sent: asBoolean(body.whatsappSent),
    created_from: "site_abbc",
    status_operacional: "novo",
    observacoes_internas: "",
  };
}

export const Route = createFileRoute("/api/donations/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: DonationRegisterRequest;

        try {
          body = (await request.json()) as DonationRegisterRequest;
        } catch {
          return json(
            { success: false, message: "JSON inválido." },
            { status: 400 },
          );
        }

        const payload = toGoogleSheetsPayload(body);
        const missingFields = [
          ["invoiceNumber", payload.invoice_number],
          ["createdAt", payload.data_criacao],
          ["donorName", payload.donor_name],
          ["amount", Number.isFinite(payload.amount) && payload.amount > 0 ? String(payload.amount) : ""],
          ["currency", payload.currency],
          ["paymentReference", payload.payment_reference],
          ["paymentPage", payload.payment_page],
        ]
          .filter(([, value]) => !value)
          .map(([field]) => field);

        if (missingFields.length > 0) {
          return json(
            {
              success: false,
              message: "Campos obrigatórios ausentes para registrar a doação.",
              fields: missingFields,
            },
            { status: 400 },
          );
        }

        try {
          const result = await registerDonationOnGoogleSheets(payload);
          return json(result, result.success ? undefined : { status: 502 });
        } catch (error) {
          console.warn("[Donation Sync] Google Sheets registration failed.", error);
          return json(
            {
              success: false,
              error: error instanceof Error ? error.message : String(error),
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
