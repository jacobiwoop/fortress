# Stage 1: Build the frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json only (ignoring lock file for Alpine compatibility in build)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build Vite app
RUN npm run build

# Stage 2: Run the Server (Monolith)
FROM node:18-alpine

WORKDIR /app

# Copy server package dependencies if separate, or use root
# Here we assume root package.json has server deps or we install them globally/locally
# Better: Copy valid package.json for server or just run from root if unified.

# Create app directory
WORKDIR /app

# Copy dependencies from builder (cached)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server code
COPY --from=builder /app/server ./server

# Expose port (Render sets PORT env, default to 3001)
EXPOSE 3001

# Start the server
CMD ["node", "server/index.js"]
