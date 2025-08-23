FROM node:20-alpine
WORKDIR /app

# Dépendances (sans lockfile)
COPY package.json ./
RUN npm install --omit=dev

# Code source
COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","src/index.js"]
