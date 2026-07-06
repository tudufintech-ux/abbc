import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const cieloPaymentInputSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(["link", "credit", "debit"]),
  donorName: z.string().optional(),
  donorEmail: z.string().email().optional().or(z.literal("")),
  donorPhone: z.string().optional(),
  invoiceNumber: z.string().optional(),
});

type CieloPaymentResponse = {
  paymentUrl?: unknown;
  PaymentUrl?: unknown;
  checkoutUrl?: unknown;
  CheckoutUrl?: unknown;
  Url?: unknown;
  url?: unknown;
  settings?: {
    checkoutUrl?: unknown;
    CheckoutUrl?: unknown;
  };
  links?: Array<{
    href?: unknown;
    rel?: unknown;
  }>;
};

type ServerEnv = Record<string, string | undefined>;

function getRequiredEnv(env: ServerEnv, name: string) {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não configurada.`);
  }
  return value;
}

function getSiteUrl(env: ServerEnv) {
  return (env.SITE_URL?.trim() || "https://associacaoabbc.com.br").replace(/\/$/, "");
}

function getCieloCheckoutEndpoint(env: ServerEnv) {
  const cieloEnv = env.CIELO_ENV?.trim().toLowerCase() || "production";
  if (cieloEnv === "sandbox") {
    return "https://cieloecommerce.cielo.com.br/api/public/v1/orders/";
  }
  return "https://cieloecommerce.cielo.com.br/api/public/v1/orders/";
}

function toCents(amount: number) {
  return Math.round(amount * 100);
}

function getMethodLabel(method: "link" | "credit" | "debit") {
  if (method === "credit") return "Cartão de crédito";
  if (method === "debit") return "Cartão de débito";
  return "Link de pagamento";
}

function asPaymentUrl(response: CieloPaymentResponse) {
  const candidates = [
    response.paymentUrl,
    response.PaymentUrl,
    response.checkoutUrl,
    response.CheckoutUrl,
    response.Url,
    response.url,
    response.settings?.checkoutUrl,
    response.settings?.CheckoutUrl,
    ...(response.links ?? []).map((link) => link.href),
  ];

  const paymentUrl = candidates.find(
    (candidate) => typeof candidate === "string" && /^https?:\/\//i.test(candidate),
  );

  return typeof paymentUrl === "string" ? paymentUrl : "";
}

export const createCieloPaymentRedirect = createServerFn({ method: "POST" })
  .validator(cieloPaymentInputSchema)
  .handler(async ({ data }) => {
    const processModule = await import("node:process");
    const env = processModule.default.env;
    const merchantId = getRequiredEnv(env, "CIELO_MERCHANT_ID");
    const merchantKey = getRequiredEnv(env, "CIELO_MERCHANT_KEY");
    const siteUrl = getSiteUrl(env);
    const amountInCents = toCents(data.amount);
    const merchantOrderId = `ABBC${Date.now()}`;
    const methodLabel = getMethodLabel(data.method);

    if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
      throw new Error("Informe um valor válido para o pagamento.");
    }

    const response = await fetch(getCieloCheckoutEndpoint(env), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        MerchantId: merchantId,
        MerchantKey: merchantKey,
      },
      body: JSON.stringify({
        MerchantOrderId: merchantOrderId,
        OrderNumber: merchantOrderId,
        SoftDescriptor: "ABBC",
        Customer: {
          Name: data.donorName?.trim() || "Doador ABBC",
          Email: data.donorEmail?.trim() || undefined,
          Phone: data.donorPhone?.trim() || undefined,
        },
        Cart: {
          Items: [
            {
              Name: `Doação ABBC - ${methodLabel}`,
              Description: data.invoiceNumber
                ? `Doação vinculada ao invoice ${data.invoiceNumber}`
                : "Doação para projetos sociais da ABBC",
              UnitPrice: amountInCents,
              Quantity: 1,
              Type: "Asset",
            },
          ],
        },
        Shipping: {
          Type: "WithoutShipping",
        },
        Payment: {
          Amount: amountInCents,
          Currency: "BRL",
          Method: data.method,
        },
        Options: {
          ReturnUrl: `${siteUrl}/obrigado`,
          CancelUrl: `${siteUrl}/pagamento-cancelado`,
        },
      }),
    });

    const responseText = await response.text();
    let responseBody: CieloPaymentResponse = {};
    if (responseText) {
      try {
        responseBody = JSON.parse(responseText) as CieloPaymentResponse;
      } catch {
        responseBody = {};
      }
    }

    if (!response.ok) {
      console.error("[CIELO][status]", response.status);
      console.error("[CIELO][body]", responseBody);
      throw new Error("A Cielo recusou a criação do pagamento. Verifique as credenciais e tente novamente.");
    }

    const paymentUrl = asPaymentUrl(responseBody);
    if (!paymentUrl) {
      throw new Error("A Cielo não retornou uma URL de pagamento.");
    }

    return {
      paymentUrl,
      merchantOrderId,
    };
  });
