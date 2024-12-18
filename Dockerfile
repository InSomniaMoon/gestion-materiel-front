FROM node:20-slim as base
ARG env
# Setup env
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Install binaries required for building
RUN mkdir /app && apt-get update -yq

# Specify where our app will live in the container
COPY package.json package-lock.json /app/
WORKDIR /app
# Copy the React App to the container
COPY . /app/

#
# Generate the production dependancies container
#
FROM base AS builder-app-prod

RUN npm ci --legacy-peer-deps \
  && npm run build

#
# Generate full runtime prod container
#
FROM nginx:stable-alpine AS runtime-prod
COPY --from=builder-app-prod /app/dist/frontend/browser /usr/share/nginx/html/
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
