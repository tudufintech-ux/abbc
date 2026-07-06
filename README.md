# ABBC Page Viewer

Pagina da A.B.B.C. com geracao de invoice, Pix, TED, DOC e checkout proprio com tokenizacao Cielo.

## Variaveis de ambiente

As credenciais sensiveis da Cielo devem existir somente no servidor. Apenas o Client ID do SOP usa prefixo `VITE_`, porque ele e necessario no frontend para tokenizar o cartao diretamente com a Cielo:

```bash
VITE_CIELO_SOP_CLIENT_ID=seu-client-id-sop
CIELO_MERCHANT_ID=seu-merchant-id
CIELO_MERCHANT_KEY=sua-merchant-key
CIELO_SOP_CLIENT_SECRET=seu-client-secret-sop
CIELO_3DS_CLIENT_ID=seu-client-id-3ds
CIELO_3DS_CLIENT_SECRET=seu-client-secret-3ds
CIELO_ENV=production
SITE_URL=https://abbc-dw0f.onrender.com
```

Nunca use `VITE_` para `CIELO_MERCHANT_ID`, `CIELO_MERCHANT_KEY`, `CIELO_SOP_CLIENT_SECRET` ou `CIELO_3DS_CLIENT_SECRET`, porque variaveis `VITE_` ficam disponiveis no frontend.
O checkout de cartao envia dados crus do cartao apenas para a Cielo para gerar `PaymentToken`; o backend da A.B.B.C. recebe somente token, bandeira, valor e dados do doador.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
