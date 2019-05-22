# Use an official Node.js runtime as a parent image
FROM node:22-alpine3.18 as build-stage

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn build

# configure nginx to serve production build
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# start nginx to serve the application
CMD ["nginx", "-g", "daemon off;"]
