# ABBC Page Viewer

Pagina da A.B.B.C. com geracao de invoice, Pix, TED, DOC e checkout proprio com tokenizacao Cielo.

## Variaveis de ambiente

As credenciais da Cielo devem existir somente no servidor. A tokenizacao atual chama `/1/card/` por server function porque a Cielo exige `MerchantId` e `MerchantKey` nesse endpoint:

```bash
CIELO_MERCHANT_ID=seu-merchant-id
CIELO_MERCHANT_KEY=sua-merchant-key
CIELO_3DS_CLIENT_ID=seu-client-id-3ds
CIELO_3DS_CLIENT_SECRET=seu-client-secret-3ds
CIELO_ENV=production
SITE_URL=https://abbc-dw0f.onrender.com
```

Nunca use `VITE_` para `CIELO_MERCHANT_ID`, `CIELO_MERCHANT_KEY` ou secrets da Cielo, porque variaveis `VITE_` ficam disponiveis no frontend.
Provisoriamente, os dados do cartao passam pela server function apenas para gerar `PaymentToken`; a autorizacao usa esse token, bandeira, valor e dados do doador.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
