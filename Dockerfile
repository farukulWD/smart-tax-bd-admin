# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

RUN npm install -g pnpm

# Install deps (cached unless lockfile changes)
COPY package.json ./
RUN pnpm install

# NEXT_PUBLIC_* are baked into the bundle at build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY . .
RUN pnpm run build

# Stage 2: Run (Next standalone output)
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
