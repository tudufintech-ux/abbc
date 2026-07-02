import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Landmark, QrCode } from "lucide-react";

import {
  formatCurrencyAmount,
  getCurrencyConfig,
  isBrlCurrency,
} from "@/config/currencies";
import {
  ABBC_PUBLIC_DETAILS,
  getStoredInvoice,
  type StoredDonationInvoice,
} from "@/lib/invoiceStorage";

export const Route = createFileRoute("/pay/$invoiceNumber")({
  component: PayInvoicePage,
});

function formatMoney(value: number, currency: StoredDonationInvoice["currency"]) {
  return formatCurrencyAmount(value, currency);
}

function createMockInvoice(invoiceNumber: string): StoredDonationInvoice {
  return {
    invoiceNumber,
    issueDate: new Date().toLocaleDateString("pt-BR"),
    donorName: "Invoice pending donor data",
    donorDocumentType: "",
    donorDocumentNumber: "",
    donorTaxId: "",
    country: "",
    donorEmail: "",
    donorPhone: "",
    amount: 0,
    currency: "BRL",
    purpose: "Donation to A.B.B.C. social projects",
    notes: "Mock invoice loaded locally. Future backend/Supabase lookup should replace this fallback.",
    status: "Awaiting Wire Transfer",
    paymentUrl: typeof window === "undefined" ? `/pay/${invoiceNumber}` : window.location.href,
    createdAt: new Date().toISOString(),
  };
}

function PayInvoicePage() {
  const { invoiceNumber } = Route.useParams();
  const [invoice, setInvoice] = useState<StoredDonationInvoice | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setInvoice(getStoredInvoice(invoiceNumber) ?? createMockInvoice(invoiceNumber));
  }, [invoiceNumber]);

  const isBrlInvoice = invoice ? isBrlCurrency(invoice.currency) : false;
  const canPayByPix = isBrlInvoice;
  const selectedCurrency = invoice ? getCurrencyConfig(invoice.currency) : null;

  const paymentReference = useMemo(
    () => invoice?.invoiceNumber ?? invoiceNumber,
    [invoice?.invoiceNumber, invoiceNumber],
  );

  function copyText(text: string, id: string) {
    const done = () => {
      setCopied(id);
      window.setTimeout(() => setCopied((current) => (current === id ? null : current)), 1600);
    };
    navigator.clipboard?.writeText(text).then(done).catch(done);
  }

  if (!invoice) {
    return (
      <main className="pay-page">
        <style>{PAY_CSS}</style>
        <section className="pay-shell">
          <p>Carregando invoice...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="pay-page">
      <style>{PAY_CSS}</style>
      <header className="pay-header">
        <a href="/" className="pay-brand">A.B.B.C</a>
        <span>Benefício à Comunidade</span>
      </header>

      <section className="pay-shell">
        <article className="invoice-card">
          <div className="invoice-top">
            <div>
              <span className="eyebrow">Payment Page</span>
              <h1>{invoice.invoiceNumber}</h1>
            </div>
            <span className="status">{invoice.status === "Awaiting Wire Transfer" ? "Pending / Awaiting Payment" : invoice.status}</span>
          </div>

          <div className="invoice-grid">
            <p><small>Doador</small><b>{invoice.donorName}</b></p>
            <p><small>País</small><b>{invoice.country || "-"}</b></p>
            <p><small>Valor</small><b>{formatMoney(invoice.amount, invoice.currency)}</b></p>
            <p><small>Moeda</small><b>{selectedCurrency ? `${selectedCurrency.flag} ${selectedCurrency.code} — ${selectedCurrency.name}` : invoice.currency}</b></p>
            <p className="wide"><small>Finalidade</small><b>{invoice.purpose}</b></p>
          </div>

          <div className="payment-options">
            <h2>Opções de pagamento</h2>

            {canPayByPix ? (
              <section className="payment-box">
                <div className="box-title"><QrCode size={20} /> PIX</div>
                <p><b>PIX CNPJ:</b> {ABBC_PUBLIC_DETAILS.pixKey}</p>
                <p>Use o CNPJ da ABBC como chave PIX.</p>
                <button type="button" onClick={() => copyText(ABBC_PUBLIC_DETAILS.pixKey, "pix")}>
                  {copied === "pix" ? <Check size={18} /> : <Copy size={18} />}
                  {copied === "pix" ? "Chave copiada" : "Copiar chave PIX"}
                </button>
              </section>
            ) : null}

            <section className="payment-box">
              <div className="box-title"><Landmark size={20} /> {isBrlInvoice ? "TED/Transferência" : "Wire Transfer (SWIFT)"}</div>
              {!isBrlInvoice ? (
                <p>Grandes doações internacionais são realizadas por transferência bancária internacional.</p>
              ) : null}
              <dl>
                <dt>Bank</dt><dd>{ABBC_PUBLIC_DETAILS.bankName}</dd>
                <dt>Bank Code</dt><dd>{ABBC_PUBLIC_DETAILS.bankCode}</dd>
                <dt>Agency</dt><dd>{ABBC_PUBLIC_DETAILS.bankAgency}</dd>
                <dt>Account</dt><dd>{ABBC_PUBLIC_DETAILS.bankAccount}</dd>
                {isBrlInvoice ? null : (
                  <>
                    <dt>IBAN</dt><dd>{ABBC_PUBLIC_DETAILS.iban}</dd>
                  </>
                )}
                {!isBrlInvoice ? <><dt>Beneficiary Name</dt><dd>{ABBC_PUBLIC_DETAILS.beneficiaryName}</dd></> : null}
                <dt>Beneficiary CNPJ</dt><dd>{ABBC_PUBLIC_DETAILS.beneficiaryCnpj}</dd>
                {!isBrlInvoice ? (
                  <>
                    <dt>SWIFT/BIC</dt><dd>{ABBC_PUBLIC_DETAILS.swiftBic}</dd>
                    <dt>Bank Address</dt><dd>{ABBC_PUBLIC_DETAILS.bankAddress}</dd>
                    <dt>Correspondent Bank</dt><dd>{ABBC_PUBLIC_DETAILS.correspondentBank}</dd>
                  </>
                ) : null}
                <dt>Payment Reference</dt><dd>{paymentReference}</dd>
              </dl>
              <button
                type="button"
                onClick={() => copyText([
                  `Beneficiary Name: ${ABBC_PUBLIC_DETAILS.beneficiaryName}`,
                  `Beneficiary CNPJ: ${ABBC_PUBLIC_DETAILS.beneficiaryCnpj}`,
                  `Bank: ${ABBC_PUBLIC_DETAILS.bankName}`,
                  `Bank Code: ${ABBC_PUBLIC_DETAILS.bankCode}`,
                  `Agency: ${ABBC_PUBLIC_DETAILS.bankAgency}`,
                  `Account: ${ABBC_PUBLIC_DETAILS.bankAccount}`,
                  ...(isBrlInvoice ? [
                    `CNPJ: ${ABBC_PUBLIC_DETAILS.beneficiaryCnpj}`,
                  ] : []),
                  ...(isBrlInvoice ? [] : [
                    `IBAN: ${ABBC_PUBLIC_DETAILS.iban}`,
                    `SWIFT/BIC: ${ABBC_PUBLIC_DETAILS.swiftBic}`,
                    `Bank Address: ${ABBC_PUBLIC_DETAILS.bankAddress}`,
                    `Correspondent Bank: ${ABBC_PUBLIC_DETAILS.correspondentBank}`,
                  ]),
                  `Payment Reference: ${paymentReference}`,
                ].join("\n"), "bank-details")}
              >
                {copied === "bank-details" ? <Check size={18} /> : <Copy size={18} />}
                {copied === "bank-details" ? "Dados copiados" : "Copy Bank Details"}
              </button>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}

const PAY_CSS = `
.pay-page{min-height:100vh;background:#f4f7f7;color:#1b2c47;font-family:Arial,sans-serif}
.pay-header{height:76px;background:#0e3f4b;color:#dcebed;display:flex;align-items:center;gap:14px;padding:0 max(24px,calc((100vw - 980px)/2));box-shadow:0 12px 30px rgba(14,63,75,.16)}
.pay-brand{font-weight:800;font-size:1.35rem;color:#fff;text-decoration:none}
.pay-shell{width:min(980px,calc(100% - 32px));margin:42px auto 72px}
.invoice-card{background:#fff;border:1px solid #dce6e7;border-radius:18px;padding:30px;box-shadow:0 22px 60px rgba(14,63,75,.12)}
.invoice-top{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;border-bottom:1px solid #dce6e7;padding-bottom:22px;margin-bottom:24px}
.eyebrow{display:block;color:#c47e1c;font-size:.74rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
h1{font-size:clamp(1.9rem,4vw,3rem);margin:0;color:#0e3f4b}
.status{background:#fff3dc;color:#855407;border:1px solid #efd2a2;border-radius:999px;padding:8px 13px;font-weight:800;font-size:.82rem;white-space:nowrap}
.invoice-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:30px}
.invoice-grid p{background:#f7faf9;border:1px solid #e3ecec;border-radius:12px;padding:14px;margin:0}
.invoice-grid .wide{grid-column:1/-1}
.invoice-grid small{display:block;color:#6c8085;font-weight:800;text-transform:uppercase;letter-spacing:.08em;font-size:.68rem;margin-bottom:7px}
.invoice-grid b{display:block;color:#1b2c47;overflow-wrap:anywhere}
.payment-options h2{font-size:1.4rem;color:#0e3f4b;margin:0 0 16px}
.payment-box{border:1px solid #dce6e7;border-radius:14px;padding:18px;margin-bottom:14px;background:#fbfdfd}
.box-title{display:flex;align-items:center;gap:9px;font-weight:900;color:#0e3f4b;margin-bottom:10px}
.payment-box p{color:#425a60;line-height:1.55;margin:8px 0}
.payment-box button{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#e0992e;color:#3a2705;border:none;border-radius:999px;padding:11px 16px;font-weight:900;cursor:pointer;margin-top:10px}
.payment-box button:disabled{opacity:.55;cursor:not-allowed}
.payment-box dl{display:grid;grid-template-columns:180px 1fr;gap:8px 16px;margin:14px 0;color:#263f46}
.payment-box dt{font-weight:900;color:#6c8085}
.payment-box dd{margin:0;overflow-wrap:anywhere}
.error{color:#a63636!important;font-weight:800}
@media(max-width:680px){.invoice-card{padding:22px}.invoice-top{display:grid}.invoice-grid,.payment-box dl{grid-template-columns:1fr}.status{white-space:normal}}
`;
