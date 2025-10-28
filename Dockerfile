# 1️⃣ Build bosqichi
FROM node:20 AS builder
WORKDIR /app

# package fayllarini ko‘chirish
COPY package*.json ./

# Prisma schema fayllarini oldinroq ko‘chirish (muhim)
COPY prisma ./prisma

# dependencies o‘rnatish
RUN npm install

# qolgan barcha fayllarni ko‘chirish
COPY . .

# Prisma clientni generatsiya qilish
RUN npx prisma generate

# build
RUN npm run build

# 2️⃣ Run bosqichi
FROM node:20 AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Port Render uchun
ENV PORT=4000
EXPOSE 4000

# Prisma clientni generatsiya qilish (agar kerak bo‘lsa)
RUN npx prisma generate

# Migratsiyalarni qo‘llash va serverni ishga tushurish
CMD npx prisma migrate deploy && npm run start:prod
