FROM node:22-alpine AS build
RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm ci --include=dev

COPY . .

RUN npm run build
RUN npx prisma generate
RUN npm prune --omit=dev && npm cache clean --force

FROM node:22-alpine AS runtime
RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app /app

EXPOSE 3000

ENV PORT=3000

# Health-Check (Render/Koyeb): die öffentliche Datenschutzseite antwortet ohne Login.
HEALTHCHECK --interval=60s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1 || exit 1

CMD ["npm", "run", "docker-start"]
