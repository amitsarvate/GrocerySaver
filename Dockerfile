FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Install deps first (so builds can cache layer).
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
