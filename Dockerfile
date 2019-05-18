# Use an official Node.js runtime as a parent image
FROM node:22-alpine3.18 as build-stage

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code to the working directory
COPY . .

# Build the Vue.js application for production
RUN yarn build

# configure nginx to serve production build
FROM nginx:stable-alpine as production-stage

# copy artifact build from the 'build-stage' stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# copy default nginx.conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose the port your Vue.js app runs on
EXPOSE 80

# start nginx to serve the application
CMD ["nginx", "-g", "daemon off;"]
