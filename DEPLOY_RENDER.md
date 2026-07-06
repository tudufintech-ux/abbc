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
CIELO_MERCHANT_ID=seu-merchant-id
CIELO_MERCHANT_KEY=sua-merchant-key
CIELO_ENV=production
SITE_URL=https://associacaoabbc.com.br
```

Essas credenciais ficam apenas no servidor. Nao use prefixo `VITE_` para Merchant ID ou Merchant Key.

## Passo a passo

1. Suba este projeto para um repositorio no GitHub.
2. No Render, escolha **New +** e depois **Blueprint** se quiser usar `render.yaml`, ou **Web Service** para configurar manualmente.
3. Conecte o repositorio.
4. Configure as variaveis `CIELO_MERCHANT_ID`, `CIELO_MERCHANT_KEY`, `CIELO_ENV` e `SITE_URL`.
5. Faça o deploy.

Depois do deploy, teste as opcoes **Link de Pagamento**, **Credito** e **Debito** na secao **Formas de Pagamento**.
