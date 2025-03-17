# Use a lightweight Node.js Alpine image as the base
FROM node:23-alpine AS builder

# Set the working directory
WORKDIR /usr/src/app

# Install only production dependencies first (for caching efficiency)
COPY package*.json ./
RUN npm install --production

# Install TypeScript and other build tools only temporarily
RUN npm install typescript ts-node --save-dev

# Copy the rest of the application
COPY . .

# Build the TypeScript code
RUN npm run build

# --- Create a lightweight runtime stage ---
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy only the built code and node_modules from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package.json ./

# Expose the port (defined in your .env)
EXPOSE 3000

# Start the app
CMD ["node", "dist/server.js"]