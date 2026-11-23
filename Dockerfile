FROM node:22-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force

COPY . .

RUN npm run build

ENV PORT=3000

# Health-Check (Render/Koyeb): die öffentliche Datenschutzseite antwortet ohne Login.
HEALTHCHECK --interval=60s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/privacy" >/dev/null 2>&1 || exit 1

CMD ["npm", "run", "docker-start"]
