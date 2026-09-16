FROM node:22-alpine AS builder

RUN corepack enable && apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN pnpm exec prisma generate
RUN pnpm build

FROM node:22-alpine AS production

RUN corepack enable && apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
COPY prisma ./prisma

RUN pnpm exec prisma generate

EXPOSE 3000

CMD ["node", "dist/src/server.js"]
