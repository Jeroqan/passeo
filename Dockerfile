# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Sadece bağımlılıkları ve prisma şemasını kopyala
COPY package*.json ./
COPY prisma ./prisma/

# Bağımlılıkları kur
RUN npm install

# Prisma Client'i generate et
RUN npx prisma generate

# Uygulama kodunun geri kalanını kopyala
COPY . .

# Uygulamayı build et (opsiyonel, dev için gerekmeyebilir)
# RUN npm run build

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "run", "dev"] 