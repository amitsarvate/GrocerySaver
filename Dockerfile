FROM node:20-alpine

WORKDIR /app

# Install deps first (will succeed once package.json exists).
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

