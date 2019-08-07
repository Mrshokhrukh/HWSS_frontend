# Build stage
FROM node:22 AS build-stage
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./
COPY yarn*.lock ./

# Install dependencies
RUN if [ -f yarn.lock ]; then yarn install; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; \
    fi

# Copy project files and build
COPY . .
RUN if [ -f yarn.lock ]; then yarn build; \
    else npm run build; \
    fi

# Production stage
FROM nginx:1.27-alpine-slim AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]