# Build stage
FROM node:22 AS build-stage
WORKDIR /app

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using Bun
RUN if [ -f bun.lock ]; then bun install; \
    else bun install; \
    fi

# Copy project files and build
COPY . .
RUN bun run build

# Production stage
FROM nginx:1.27-alpine-slim AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]