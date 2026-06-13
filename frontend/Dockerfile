# Build Stage
FROM oven/bun:1-alpine as builder

WORKDIR /app

# Copy package files relative to workspace root
COPY frontend/package.json frontend/bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy frontend source files
COPY frontend/ .

# Build project (generates bundle in /app/dist)
RUN bun run build

# Serve Stage
FROM nginx:alpine

# Copy production build files to Nginx's public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default Nginx server configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
