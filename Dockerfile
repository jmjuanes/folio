# =============================================================================
# Folio Docker Image
# =============================================================================
# This Dockerfile builds a production-ready container for the Folio whiteboard.
#
# Build: docker build -t folio .
# Run:   docker run -p 8080:8080 folio
# =============================================================================

# Use specific Node.js version with Alpine for minimal footprint and security
FROM node:22.12.0-alpine3.20 AS base

# Install security updates and required packages
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        dumb-init \
        tini && \
    rm -rf /var/cache/apk/*

# Create application directory with proper ownership
RUN mkdir -p /opt/folio && \
    chown -R node:node /opt/folio

# Set working directory
WORKDIR /opt/folio

# Switch to non-root user early for security
USER node

# =============================================================================
# Server Dependencies Stage
# =============================================================================
FROM base AS dependencies

# Copy package files first for better layer caching
COPY --chown=node:node server/package.json ./server/

# Install dependencies with security optimizations
RUN cd server && \
    yarn install --frozen-lockfile --production --network-timeout 300000 && \
    yarn cache clean && \
    # Remove unnecessary files to reduce image size
    find node_modules -name "*.md" -delete && \
    find node_modules -name "*.txt" -delete && \
    find node_modules -name "LICENSE*" -delete

# =============================================================================
# Application Build Stage
# =============================================================================
FROM base AS app

# Copy workspace configuration files first
COPY --chown=node:node . .

# Install root dependencies to set up workspaces
RUN yarn install --frozen-lockfile

# Build the application
RUN yarn build:app

# =============================================================================
# Production Stage
# =============================================================================
FROM base

# Set environment variables
ENV NODE_ENV=production \
    # Security headers
    NODE_OPTIONS="--max-old-space-size=512" \
    # Disable npm update check
    NO_UPDATE_NOTIFIER=true

# Copy application files with proper ownership
COPY --chown=node:node server/ ./server/
COPY --chown=node:node start.sh ./
COPY --chown=node:node .env.example ./.env

# Copy dependencies from previous stage
COPY --from=dependencies --chown=node:node /opt/folio/server/node_modules ./server/node_modules
COPY --from=app --chown=node:node /opt/folio/app/www ./www

# Set proper permissions for executable files
RUN chmod +x start.sh

# Create data directory with proper ownership for SQLite
RUN mkdir -p /opt/folio/data && \
    chown -R node:node /opt/folio/data && \
    chmod 775 /opt/folio/data

# Create volume for persistent data
VOLUME ["/opt/folio/data"]

# Expose port (documented for users, not for security)
EXPOSE 8080

# Add health check to monitor application status
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e " \
        const http = require('http'); \
        const options = { hostname: 'localhost', port: 8080, path: '/api/status', timeout: 5000 }; \
        const req = http.request(options, (res) => { \
            if (res.statusCode === 200) process.exit(0); \
            else process.exit(1); \
        }); \
        req.on('error', () => process.exit(1)); \
        req.on('timeout', () => process.exit(1)); \
        req.end(); \
    "

# Add labels for better container management
LABEL maintainer="Josemi Juanes <hello@josemi.xyz>"
LABEL description="A minimalistic digital whiteboard for sketching and prototyping"
LABEL org.opencontainers.image.title="Folio"
LABEL org.opencontainers.image.description="A minimalistic digital whiteboard for sketching and prototyping"
LABEL org.opencontainers.image.vendor="Josemi Juanes"
LABEL org.opencontainers.image.url="https://folio.josemi.xyz"
LABEL org.opencontainers.image.source="https://github.com/jmjuanes/folio"

# Use custom entrypoint for proper initialization
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["./start.sh"]
