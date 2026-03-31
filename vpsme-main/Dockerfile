FROM node:20-slim

# Install python3 and bash for PTY
RUN apt-get update && apt-get install -y python3 python3-pip nano bash && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the frontend
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the server
CMD ["npx", "tsx", "server.ts"]
