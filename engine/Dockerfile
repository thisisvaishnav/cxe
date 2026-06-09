# Use official lightweight Bun image
FROM oven/bun:1-alpine

# Set working directory
WORKDIR /app

# Copy package config files relative to workspace root
COPY engine/package.json engine/bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy Prisma schema directly from the backend to resolve the symlink target
COPY backend/prisma/schema.prisma ./prisma/schema.prisma

# Generate Prisma Client
RUN bunx prisma generate

# Copy the rest of the engine files
COPY engine/ .

# Set node environment
ENV NODE_ENV=production

# Run matching engine worker
CMD ["bun", "run", "src/index.ts"]
