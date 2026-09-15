FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM alpine:3.20 AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
CMD ["sh", "-c", "cp -rf ./dist/. /frontend-dist/ && echo 'frontend build copied'"]
