# ABBC Page Viewer

Pagina da A.B.B.C. com geracao de invoice, Pix, TED, DOC, link manual e checkout proprio com tokenizacao Cielo.

## Variaveis de ambiente

As credenciais da Cielo devem existir somente no servidor:

```bash
CIELO_MERCHANT_ID=seu-merchant-id
CIELO_MERCHANT_KEY=sua-merchant-key
CIELO_SOP_CLIENT_ID=seu-client-id-sop
CIELO_3DS_CLIENT_ID=seu-client-id-3ds
CIELO_ENV=production
SITE_URL=https://abbc-dw0f.onrender.com
VITE_CIELO_PAYMENT_URL=
```

Nunca use `VITE_` para `CIELO_MERCHANT_ID` ou `CIELO_MERCHANT_KEY`, porque variaveis `VITE_` ficam disponiveis no frontend.
O checkout de cartao envia dados crus do cartao apenas para a Cielo para gerar `PaymentToken`; o backend da A.B.B.C. recebe somente token, bandeira, valor e dados do doador.
`VITE_CIELO_PAYMENT_URL` e opcional e serve apenas para a opcao manual de Link de Pagamento.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
