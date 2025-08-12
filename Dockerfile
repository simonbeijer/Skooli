FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm install

RUN npx prisma generate

COPY . .

# TypeScript type checking and build
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]