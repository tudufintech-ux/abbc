# Deploy no Render

Este projeto deve ser publicado como **Web Service** no Render, porque o build do TanStack Start gera um servidor Nitro em `.output/server/index.mjs`.

## Configuracao

- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Runtime: `Node`
- Node: `22`

## Variaveis da Cielo

Crie as variaveis de ambiente abaixo no Render:

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

Somente `VITE_CIELO_SOP_CLIENT_ID` fica publico no frontend. Nao use prefixo `VITE_` para Merchant ID, Merchant Key ou secrets da Cielo.

## Passo a passo

1. Suba este projeto para um repositorio no GitHub.
2. No Render, escolha **New +** e depois **Blueprint** se quiser usar `render.yaml`, ou **Web Service** para configurar manualmente.
3. Conecte o repositorio.
4. Configure as variaveis `VITE_CIELO_SOP_CLIENT_ID`, `CIELO_MERCHANT_ID`, `CIELO_MERCHANT_KEY`, `CIELO_SOP_CLIENT_SECRET`, `CIELO_3DS_CLIENT_ID`, `CIELO_3DS_CLIENT_SECRET`, `CIELO_ENV` e `SITE_URL`.
5. Faça o deploy.

Depois do deploy, teste as opcoes **Credito** e **Debito** na secao **Formas de Pagamento**.
