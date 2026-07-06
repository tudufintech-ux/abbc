import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const cardPaymentInputSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(["credit", "debit"]),
  paymentToken: z.string().min(1),
  brand: z.string().min(1),
  installments: z.number().int().positive().optional(),
  donorName: z.string().optional(),
  donorEmail: z.string().email().optional().or(z.literal("")),
  donorPhone: z.string().optional(),
});

type ServerEnv = Record<string, string | undefined>;

type CieloSaleResponse = {
  Payment?: {
    PaymentId?: string;
    Status?: number;
    ReturnCode?: string;
    ReturnMessage?: string;
    AuthorizationCode?: string;
  };
};

function getRequiredEnv(env: ServerEnv, name: string) {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não configurada.`);
  }
  return value;
}

function getOptionalEnv(env: ServerEnv, name: string) {
  return env[name]?.trim() || "";
}

function getCieloSalesEndpoint(env: ServerEnv) {
  const cieloEnv = env.CIELO_ENV?.trim().toLowerCase() || "production";
  if (cieloEnv === "sandbox") {
    return "https://apisandbox.cieloecommerce.cielo.com.br/1/sales/";
  }
  return "https://api.cieloecommerce.cielo.com.br/1/sales/";
}

function toCents(amount: number) {
  return Math.round(amount * 100);
}

function getPaymentStatus(payment: CieloSaleResponse["Payment"]) {
  return typeof payment?.Status === "number" ? payment.Status : 0;
}

function isApprovedStatus(status: number) {
  return status === 1 || status === 2;
}

export const getCieloCardClientConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    const processModule = await import("node:process");
    const env = processModule.default.env;

    return {
      sopClientId: getOptionalEnv(env, "CIELO_SOP_CLIENT_ID"),
      threeDsClientId: getOptionalEnv(env, "CIELO_3DS_CLIENT_ID"),
      env: env.CIELO_ENV?.trim().toLowerCase() === "sandbox" ? "sandbox" : "production",
    };
  });

export const authorizeCieloCardPayment = createServerFn({ method: "POST" })
  .validator(cardPaymentInputSchema)
  .handler(async ({ data }) => {
    const processModule = await import("node:process");
    const env = processModule.default.env;
    const merchantId = getRequiredEnv(env, "CIELO_MERCHANT_ID");
    const merchantKey = getRequiredEnv(env, "CIELO_MERCHANT_KEY");
    const amountInCents = toCents(data.amount);
    const merchantOrderId = `ABBC${Date.now()}`;
    const installments = data.method === "credit" ? data.installments || 1 : undefined;

    if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
      throw new Error("Informe um valor válido para o pagamento.");
    }

    const payment = data.method === "credit"
      ? {
          Type: "CreditCard",
          Amount: amountInCents,
          Installments: installments,
          Capture: true,
          SoftDescriptor: "ABBC",
          CreditCard: {
            PaymentToken: data.paymentToken,
            Brand: data.brand,
          },
        }
      : {
          Type: "DebitCard",
          Amount: amountInCents,
          Capture: true,
          SoftDescriptor: "ABBC",
          DebitCard: {
            PaymentToken: data.paymentToken,
            Brand: data.brand,
          },
        };

    const response = await fetch(getCieloSalesEndpoint(env), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        MerchantId: merchantId,
        MerchantKey: merchantKey,
      },
      body: JSON.stringify({
        MerchantOrderId: merchantOrderId,
        Customer: {
          Name: data.donorName?.trim() || "Doador ABBC",
          Email: data.donorEmail?.trim() || undefined,
          Phone: data.donorPhone?.trim() || undefined,
        },
        Payment: payment,
      }),
    });

    const responseText = await response.text();
    let responseBody: CieloSaleResponse = {};
    if (responseText) {
      try {
        responseBody = JSON.parse(responseText) as CieloSaleResponse;
      } catch {
        responseBody = {};
      }
    }

    if (!response.ok) {
      console.error("[CIELO][authorize status]", response.status);
      console.error("[CIELO][authorize body]", responseBody);
    }

    const paymentResponse = responseBody.Payment;
    const status = getPaymentStatus(paymentResponse);
    const message = paymentResponse?.ReturnMessage || (response.ok ? "Pagamento processado." : "Pagamento recusado pela Cielo.");

    return {
      approved: response.ok && isApprovedStatus(status),
      status,
      paymentId: paymentResponse?.PaymentId || "",
      authorizationCode: paymentResponse?.AuthorizationCode || "",
      message,
    };
  });
