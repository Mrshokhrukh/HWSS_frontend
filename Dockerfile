# Build stage
FROM node:22 AS build-stage
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using npm
RUN if [ -f yarn.lock ]; then yarn install --check-files; \
    else yarn install; \
    fi

# Copy project files and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:1.27-alpine-slim AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
