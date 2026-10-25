# Perfil Político: Next.js standalone (páginas, /r/<código> e a imagem /r/<código>/imagem). Sem banco, sem segredos.
# Construído no laptop por `arvex ship-image` (linux/amd64) e carregado no VPS com docker save | ssh docker load.
FROM node:24-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS build
WORKDIR /app
RUN corepack enable
ENV NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=1536
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
# @arvex-dev/* é privado (GitHub Packages): o token chega como segredo do BuildKit (npmrc do arvex ship-image), nunca
# numa camada.
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# standalone/ não inclui public/ nem .next/static; server.js os serve quando copiados ao lado.
FROM node:24-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53
LABEL app=perfil-politico
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER node
# HOSTNAME precisa ser 0.0.0.0: o Docker o define como o id do container e o server.js só escutaria nele.
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["node", "server.js"]
