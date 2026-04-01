# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies required for terminal emulation and file operations
RUN apk add --no-cache \
    python3 \
    bash \
    curl \
    git \
    build-base \
    df \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Start the server
CMD ["npm", "start"]
