import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const cardPaymentInputSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(["credit", "debit"]),
  paymentToken: z.string().min(1),
  brand: z.enum(["Visa", "Master", "Elo", "Amex", "Hipercard", "Diners", "Discover"]),
  installments: z.number().int().positive().optional(),
  donorName: z.string().optional(),
  donorEmail: z.string().email().optional().or(z.literal("")),
  donorPhone: z.string().optional(),
});

const cieloCardBrandSchema = z.enum(["Visa", "Master", "Elo", "Amex", "Hipercard", "Diners", "Discover"]);

const cieloCardTokenInputSchema = z.object({
  cardNumber: z.string().regex(/^\d{13,19}$/),
  holder: z.string().trim().min(2),
  expirationDate: z.string().regex(/^\d{2}\/(\d{2}|\d{4})$/),
  securityCode: z.string().regex(/^\d{3,4}$/),
  brand: cieloCardBrandSchema,
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

type CieloCardTokenResponse = {
  PaymentToken?: unknown;
  paymentToken?: unknown;
  CardToken?: unknown;
  cardToken?: unknown;
  Token?: unknown;
  token?: unknown;
};

function getRequiredEnv(env: ServerEnv, name: string) {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não configurada.`);
  }
  return value;
}

function getCieloSalesEndpoint(env: ServerEnv) {
  const cieloEnv = env.CIELO_ENV?.trim().toLowerCase() || "production";
  if (cieloEnv === "sandbox") {
    return "https://apisandbox.cieloecommerce.cielo.com.br/1/sales/";
  }
  return "https://api.cieloecommerce.cielo.com.br/1/sales/";
}

function getCieloCardEndpoint(env: ServerEnv) {
  const cieloEnv = env.CIELO_ENV?.trim().toLowerCase() || "production";
  if (cieloEnv === "sandbox") {
    return "https://apisandbox.cieloecommerce.cielo.com.br/1/card/";
  }
  return "https://api.cieloecommerce.cielo.com.br/1/card/";
}

function toCents(amount: number) {
  return Math.round(amount * 100);
}

function normalizeExpirationDate(expirationDate: string) {
  const [month = "", year = ""] = expirationDate.split("/");
  return `${month.padStart(2, "0")}/${year.length === 2 ? `20${year}` : year}`;
}

function getTokenFromCieloResponse(response: CieloCardTokenResponse) {
  const token = response.PaymentToken
    ?? response.paymentToken
    ?? response.CardToken
    ?? response.cardToken
    ?? response.Token
    ?? response.token;

  return typeof token === "string" ? token : "";
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
      env: env.CIELO_ENV?.trim().toLowerCase() === "sandbox" ? "sandbox" : "production",
    };
  });

export const createCieloCardToken = createServerFn({ method: "POST" })
  .validator(cieloCardTokenInputSchema)
  .handler(async ({ data }) => {
    const processModule = await import("node:process");
    const env = processModule.default.env;
    const merchantId = getRequiredEnv(env, "CIELO_MERCHANT_ID");
    const merchantKey = getRequiredEnv(env, "CIELO_MERCHANT_KEY");
    const expirationDate = normalizeExpirationDate(data.expirationDate);

    const response = await fetch(getCieloCardEndpoint(env), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        MerchantId: merchantId,
        MerchantKey: merchantKey,
      },
      body: JSON.stringify({
        CardNumber: data.cardNumber,
        Holder: data.holder.trim(),
        ExpirationDate: expirationDate,
        SecurityCode: data.securityCode,
        Brand: data.brand,
      }),
    });

    const responseText = await response.text();
    let responseBody: CieloCardTokenResponse = {};
    if (responseText) {
      try {
        responseBody = JSON.parse(responseText) as CieloCardTokenResponse;
      } catch {
        responseBody = {};
      }
    }

    if (!response.ok) {
      console.error("[CIELO][card token status]", response.status);
      console.error("[CIELO][card token body]", responseBody);
      throw new Error("Não foi possível validar o cartão. Confira os dados e tente novamente.");
    }

    const token = getTokenFromCieloResponse(responseBody);
    if (!token) {
      console.error("[CIELO][card token status]", response.status);
      console.error("[CIELO][card token body]", responseBody);
      throw new Error("Não foi possível validar o cartão. Confira os dados e tente novamente.");
    }

    return {
      paymentToken: token,
      cardToken: token,
      ...(env.NODE_ENV === "development" ? { rawResponse: responseBody } : {}),
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
