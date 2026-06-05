# -------------------------
# Stage 1 - Builder
# -------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy entire application
COPY . .

# -------------------------
# Stage 2 - Runner
# -------------------------
FROM node:18-alpine AS runner

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy application from builder
COPY --from=builder --chown=appuser:appgroup /app ./

# Switch to non-root user
USER appuser

EXPOSE 3000

CMD ["node", "index.js"]