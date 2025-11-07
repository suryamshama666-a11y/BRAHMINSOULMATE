# Use minimal Node image
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev && mv node_modules /app/node_modules

# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY backend/ .
RUN npm ci && npm run build

# Runtime stage
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY backend/package.json ./package.json

EXPOSE 3001
CMD ["node", "dist/server.js"]

