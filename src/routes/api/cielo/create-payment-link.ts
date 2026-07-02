import { createFileRoute } from "@tanstack/react-router";

import { createCieloPayment } from "@/lib/cielo.server";

type DonationPaymentLinkRequest = {
  invoiceNumber?: unknown;
  payerName?: unknown;
  payerDocument?: unknown;
  payerEmail?: unknown;
  payerPhone?: unknown;
  amount?: unknown;
  description?: unknown;
  installments?: unknown;
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

function generateInvoiceNumber(now = new Date()): string {
  const year = now.getFullYear();
  const sequence = Math.floor(now.getTime() / 1000) % 10000;
  return `ABBC-INV-${year}-${String(sequence).padStart(4, "0")}`;
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

export const Route = createFileRoute("/api/cielo/create-payment-link")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: DonationPaymentLinkRequest;

        try {
          body = (await request.json()) as DonationPaymentLinkRequest;
        } catch {
          return json(
            { success: false, message: "JSON inválido." },
            { status: 400 },
          );
        }

        const payerName = asText(body.payerName);
        const payerDocument = asText(body.payerDocument);
        const payerEmail = asText(body.payerEmail);
        const payerPhone = asText(body.payerPhone);
        const description = asText(body.description);
        const amount = asAmount(body.amount);
        const requestedInvoiceNumber = asText(body.invoiceNumber);

        const missingFields = [
          ["payerName", payerName],
          ["payerDocument", payerDocument],
          ["payerEmail", payerEmail],
          ["payerPhone", payerPhone],
          ["description", description],
        ]
          .filter(([, value]) => !value)
          .map(([field]) => field);

        if (missingFields.length > 0) {
          return json(
            {
              success: false,
              message: "Preencha todos os campos obrigatórios.",
              fields: missingFields,
            },
            { status: 400 },
          );
        }

        if (!Number.isFinite(amount) || amount <= 0) {
          return json(
            {
              success: false,
              message: "Informe um valor de doação maior que zero.",
              fields: ["amount"],
            },
            { status: 400 },
          );
        }

        const invoiceNumber = requestedInvoiceNumber || generateInvoiceNumber();
        const cieloPayment = await createCieloPayment();

        return json({
          ...cieloPayment,
          invoiceNumber,
        });
      },
    },
  },
});
