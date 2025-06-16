FROM node:18-alpine AS deps
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci --only=production

# Stage 2: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Thiết lập biến môi trường
ENV NODE_ENV=production

# Cài đặt PM2 toàn cục
RUN npm install pm2 -g

# Sao chép node_modules từ stage deps
COPY --from=deps /app/node_modules ./node_modules

# Sao chép source code
COPY ./src ./src
COPY package.json ./

# Expose port
EXPOSE 8000

# Khởi động ứng dụng với PM2
CMD ["pm2-runtime", "src/index.js"]