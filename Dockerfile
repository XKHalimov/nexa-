# 1. Base image
FROM node:18-alpine

# 2. Working directory
WORKDIR /app

# 3. Package.json copy and install
COPY package*.json ./
RUN npm install

# 4. Prisma generate
RUN npx prisma generate

# 5. Copy all source files
COPY . .

# 6. Build the NestJS project
RUN npm run build

# 7. Expose port
EXPOSE 4000

# 8. Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
