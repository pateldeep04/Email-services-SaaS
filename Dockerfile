# ==========================================
# Stage 1: Build Frontend Assets
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy full application source code
COPY . .

# Build the Vite static assets to dist/
RUN npm run build

# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set node environment to production
ENV NODE_ENV=production
ENV PORT=5000

# Copy package specs and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy backend server code and built static frontend from builder stage
COPY server ./server
COPY public ./public
COPY --from=builder /app/dist ./dist

# Expose server port
EXPOSE 5000

# Start Express server (serves both API endpoints and production React dist static files)
CMD ["npm", "start"]
