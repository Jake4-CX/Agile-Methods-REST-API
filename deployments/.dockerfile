FROM node:18-alpine as builder
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production

COPY . .

RUN npm run build && npm prune --production

# Production image
FROM node:18-alpine
ENV NODE_ENV=production

COPY --from=builder /app/build /app
COPY --from=builder /app/node_modules /app/node_modules

WORKDIR /app

EXPOSE 3000

CMD ["node", "index.js"]