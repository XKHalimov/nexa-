# 1. Build bosqichi
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Prisma clientni generatsiya qilish
RUN npx prisma generate

RUN npm run build

# 2. Run bosqichi
FROM node:20 AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Port Render uchun
ENV PORT=4000
EXPOSE 4000

# Prisma client uchun ham kerak
RUN npx prisma generate

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
