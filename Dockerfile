# =============================================================================
# Folio Docker Image
# =============================================================================
# This Dockerfile builds a production-ready container for the Folio whiteboard.
#
# Build: docker build -t folio .
# Run:   docker run -p 8080:8080 folio
# =============================================================================

# Use specific Node.js version with Alpine for minimal footprint and security
FROM node:26-alpine AS base

# install yarn using corepack
# RUN corepack enable && corepack prepare yarn@stable --activate
RUN npm install -g yarn

# Set environment variables
ENV FOLIO_APPDIR=/opt/folio \
    FOLIO_PORT=8080

# Install security updates and required packages
RUN apk update && \
    apk upgrade && \
    apk add --no-cache tini nginx supervisor && \
    rm -rf /var/cache/apk/*

# Create application directory with proper ownership
RUN mkdir -p $FOLIO_APPDIR && \
    chown -R node:node $FOLIO_APPDIR

# Set working directory
WORKDIR $FOLIO_APPDIR

# =============================================================================
# Server Build Stage
# =============================================================================
FROM base AS server

# Copy stuff from workers folder
COPY --chown=node:node workers/ .
COPY --chown=node:node docker/package.json ./package.json

# Install dependencies with security optimizations
RUN yarn install --frozen-lockfile --network-timeout 300000 && \
    yarn workspace folio-shared build && \
    yarn workspace folio-auth build && \
    yarn workspace folio-storage build && \
    yarn install --frozen-lockfile --production --network-timeout 300000 && \
    yarn cache clean && \
    find node_modules -name "*.md" -delete && \
    find node_modules -name "*.txt" -delete && \
    find node_modules -name "LICENSE*" -delete

# =============================================================================
# Application Build Stage
# =============================================================================
# FROM base AS app
# 
# # Copy workspace configuration files first
# COPY --chown=node:node . .
# 
# # Install root dependencies to set up workspaces
# RUN yarn install --frozen-lockfile
# 
# # Build the application
# RUN yarn build:studio

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

# Copy third-party configurations
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf

# Copy application files with proper ownership
COPY --chown=node:node folio.js ./folio.js
COPY --chown=node:node config.yaml ./config.yaml

# Copy builds from previous stage
COPY --from=server --chown=node:node $FOLIO_APPDIR/package.json ./package.json
COPY --from=server --chown=node:node $FOLIO_APPDIR/node_modules ./node_modules
COPY --from=server --chown=node:node $FOLIO_APPDIR/auth ./auth
COPY --from=server --chown=node:node $FOLIO_APPDIR/shared ./shared
COPY --from=server --chown=node:node $FOLIO_APPDIR/storage ./storage
# COPY --from=app --chown=node:node $FOLIO_APPDIR/apps/studio/www ./public

# Set proper permissions for executable files
RUN chmod +x folio.js

# Create data directory with proper ownership for SQLite
RUN mkdir -p $FOLIO_APPDIR/data && \
    chown -R node:node $FOLIO_APPDIR/data && \
    chmod 775 $FOLIO_APPDIR/data

# Create volume for persistent data
VOLUME [$FOLIO_APPDIR/data]

# Expose port (documented for users, not for security)
EXPOSE $FOLIO_PORT

# Add health check to monitor application status
# HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
#     CMD node ./folio.js ping

# Add labels for better container management
LABEL maintainer="Josemi Juanes <hello@josemi.xyz>"
LABEL description="A minimalistic digital whiteboard for sketching and prototyping"
LABEL org.opencontainers.image.title="Folio"
LABEL org.opencontainers.image.description="A minimalistic digital whiteboard for sketching and prototyping"
LABEL org.opencontainers.image.vendor="Josemi Juanes"
LABEL org.opencontainers.image.url="https://josemi.xyz/folio"
LABEL org.opencontainers.image.source="https://github.com/jmjuanes/folio"

# Use custom entrypoint for proper initialization
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
