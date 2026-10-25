# Perfil Político

Teste político em 12 eixos calibrado para o Brasil e a América do Sul (estilo 12axes/8values). Protótipo:
Next.js (App Router) + TypeScript + Tailwind, sem backend de dados e sem banco. https://perfil.arvex.dev

- Pesquisa: `docs/pesquisa/` (inventário, extração e simulação, viés, base acadêmica). Proposta: `docs/PROPOSTA.md`.
  Decisões: `DECISOES.md`.
- Dados versionados: `data/{axes,questions,ideologies,figures,countries}.json`. `node scripts/tabelas.mjs` regenera
  `docs/TABELAS.md`.
- Motor: `lib/scoring.ts` (puro), testes em `lib/scoring.test.ts`.
- Rotas: `/`, `/teste`, `/teste/rapido`, `/r/<código>` (resultado; o código guarda só os scores),
  `/r/<código>/imagem` (PNG 1080×1920 via `next/og`), `/sobre`, `/api/health`.

```sh
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
pnpm install && pnpm dev     # @arvex-dev/* vem do GitHub Packages: ver .npmrc
pnpm test && pnpm typecheck
```

## Deploy (VPS ARVEX)

`pnpm ship` = `arvex ship-image` (`@arvex-dev/deploy`): testes + typecheck, `docker build --platform linux/amd64`,
`docker save | ssh docker load`, `deploy/compose.yaml` em `/srv/perfil-politico`, `up -d --wait`, health, smoke.
Atrás do Caddy do arvex-edge (`deploy/perfil-politico.caddy`). `arvex.config.json` e `deploy/known_hosts` têm o IP de
origem e ficam só na máquina de quem publica (modelo em `arvex.config.example.json`). Primeira vez (feito em 2026-10-25):

```sh
ssh deploy@$ARVEX_HOST 'sudo install -d -m 755 -o deploy -g deploy /srv/perfil-politico'
npx arvex edge cert perfil-politico perfil.arvex.dev
npx arvex edge site deploy/perfil-politico.caddy
# DNS: A perfil → $ARVEX_HOST, proxied (Cloudflare, zona arvex.dev)
```

Rollback: `ssh deploy@$ARVEX_HOST 'cd /srv/perfil-politico && IMAGE_TAG=$(cat .deploy/previous) docker compose up -d --wait perfil-politico'`.

## Licenças

Código: MIT ([LICENSE](LICENSE)). Perguntas, explicações, posições estimadas, pesquisa e textos (`data/`, `docs/`):
CC BY 4.0 ([LICENSE-DADOS.md](LICENSE-DADOS.md)). Dados extraídos de 8values, 9Axes e SapplyValues (MIT) em
`docs/pesquisa/dados/` mantêm a licença original; o 12axes ("All rights reserved") não é redistribuído.

## Contribuir

Viu um fato errado, uma fonte melhor ou uma posição mal estimada? Abra uma issue com a fonte. Mudanças nas perguntas
passam por `pnpm test` (equilíbrio por eixo, fontes, personas) e `pnpm piloto` (piloto simulado, docs/PILOTO.md).
