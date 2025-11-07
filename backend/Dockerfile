FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema first
COPY src/prisma ./src/prisma

# Generate Prisma Client
RUN npx prisma generate --schema=./src/prisma/schema.prisma

# Copy rest of source code
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
