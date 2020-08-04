# Build stage using Bun 1.2.19 (new JSON bun.lock)
FROM oven/bun:1.2.19 AS build-stage
WORKDIR /app

# Copy only deps first for caching
COPY bun.lock package.json ./
RUN bun install --frozen-lockfile

# Copy rest of the project and build
COPY . .
RUN bun run build

# Serve with Nginx
FROM nginx:1.27-alpine-slim AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
