# 1. Gunakan Node.js 20 LTS Alpine (Ringan)
FROM node:20-alpine

# 2. Set direktori kerja
WORKDIR /app

# 3. Install dependensi sistem 
# (df dihapus karena sudah bawaan, build-base untuk compile library)
RUN apk add --no-cache \
    python3 \
    bash \
    curl \
    git \
    build-base \
    && rm -rf /var/cache/apk/*

# 4. Copy file package
COPY package*.json ./

# 5. Install dependensi proyek + tsx secara eksplisit
# (tsx ditambahkan di sini agar Node.js bisa baca file .ts)
RUN npm install && npm install tsx

# 6. Copy seluruh source code
COPY . .

# 7. Jalankan build Vite (Ini akan memvalidasi index.css kamu)
RUN npm run build

# 8. Konfigurasi Environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# 9. Ekspos Port untuk Railway
EXPOSE 3000

# 10. Perintah Start (Solusi untuk ERR_UNKNOWN_FILE_EXTENSION)
# Kita panggil tsx yang ada di node_modules untuk menjalankan server.ts
CMD ["npx", "tsx", "server.ts"]
