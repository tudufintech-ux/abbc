# Deploy no Render

Este projeto deve ser publicado como **Web Service** no Render, porque o build do TanStack Start gera um servidor Nitro em `.output/server/index.mjs`.

## Configuracao

- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Runtime: `Node`
- Node: `22`

## Variavel da Cielo

Crie a variavel de ambiente abaixo no Render:

```bash
VITE_CIELO_PAYMENT_LINK=https://link.cielo.com.br/seu-link-de-pagamento
```

Troque o valor pelo link de pagamento real gerado no painel da Cielo.

## Passo a passo

1. Suba este projeto para um repositorio no GitHub.
2. No Render, escolha **New +** e depois **Blueprint** se quiser usar `render.yaml`, ou **Web Service** para configurar manualmente.
3. Conecte o repositorio.
4. Configure a variavel `VITE_CIELO_PAYMENT_LINK`.
5. Faça o deploy.

Depois do deploy, teste o botao **Doar com cartao** na secao **Como ajudar**.
