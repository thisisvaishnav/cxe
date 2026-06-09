# Use official lightweight Bun image
FROM oven/bun:1-alpine

# Set working directory
WORKDIR /app

# Copy package config files relative to workspace root
COPY backend/package.json backend/bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy Prisma schema definition
COPY backend/prisma ./prisma/

# Generate Prisma Client
RUN bunx prisma generate

# Copy the rest of the backend files
COPY backend/ .

# Expose backend service port
EXPOSE 3000

# Set node environment
ENV NODE_ENV=production

# Run backend server
CMD ["bun", "run", "src/index.ts"]
