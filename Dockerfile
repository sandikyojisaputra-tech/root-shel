# 1. Gunakan Node.js 20 LTS Alpine (Ringan & Cepat)
FROM node:20-alpine

# 2. Set direktori kerja
WORKDIR /app

# 3. Install dependensi sistem dasar
# (df dilewati karena sudah built-in di BusyBox Alpine)
RUN apk add --no-cache \
    python3 \
    bash \
    curl \
    git \
    build-base \
    && rm -rf /var/cache/apk/*

# 4. Copy file package saja dulu (biar build cache lebih cepat)
COPY package*.json ./

# 5. Install dependensi
# (Karena tsx sudah ada di package.json, otomatis terinstall di sini)
RUN npm install

# 6. Copy seluruh source code
COPY . .

# 7. Jalankan build Vite (Ini wajib untuk file frontend kamu)
RUN npm run build

# 8. Konfigurasi Environment untuk Railway
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# 9. Ekspos Port
EXPOSE 3000

# 10. Jalankan perintah start yang ada di package.json
# Ini akan otomatis menjalankan "NODE_ENV=production tsx server.ts"
CMD ["npm", "start"]
