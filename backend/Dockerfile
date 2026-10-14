##build
FROM node:24-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@12.11.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

##final image that uses the build 
FROM node:24-alpine
WORKDIR /app
RUN npm install -g pnpm@12.11.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 5000

USER node

CMD ["node", "dist/server.js"]
