# ABBC Page Viewer

Pagina da A.B.B.C. com geracao de invoice, Pix, TED, DOC e redirecionamento seguro para pagamento Cielo.

## Variaveis de ambiente

As credenciais da Cielo devem existir somente no servidor:

```bash
CIELO_MERCHANT_ID=seu-merchant-id
CIELO_MERCHANT_KEY=sua-merchant-key
CIELO_ENV=production
SITE_URL=https://associacaoabbc.com.br
```

Nunca use `VITE_` para `CIELO_MERCHANT_ID` ou `CIELO_MERCHANT_KEY`, porque variaveis `VITE_` ficam disponiveis no frontend.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
