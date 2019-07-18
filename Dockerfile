# Build stage
FROM node:22-bullseye-slim as builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY retry-yarn.sh ./

RUN chmod +x ./retry-yarn.sh && ./retry-yarn.sh

COPY . .

# Build the application
RUN yarn build

# Production stage
FROM nginx:stable-alpine as production

# Copy the built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]