# =============================================================================
# Folio Docker Image
# =============================================================================
# One container with the editor and the server that saves your boards in SQLite.
# The server has no authentication: use it on your machine or in a trusted network.
#
# Build: docker build -t folio .
# Run:   docker run -p 127.0.0.1:8080:8080 -v folio:/data folio
# =============================================================================

# -----------------------------------------------------------------------------
# Build the editor with the 'server' profile
# -----------------------------------------------------------------------------
FROM node:26-alpine AS build
WORKDIR /build
COPY . .
RUN yarn install --frozen-lockfile --network-timeout 300000
RUN FOLIO_PROFILE=server NODE_ENV=production yarn webpack build

# -----------------------------------------------------------------------------
# Production image: Node.js, the server (a single file) and the built editor
# -----------------------------------------------------------------------------
FROM node:26-alpine
ENV NODE_ENV=production \
    FOLIO_HOST=0.0.0.0 \
    FOLIO_PORT=8080 \
    FOLIO_DATABASE=/data/folio.sqlite \
    FOLIO_PUBLIC=/app/public
WORKDIR /app
COPY server/index.ts ./server/index.ts
COPY --from=build /build/www ./public

# the database lives in a volume
RUN mkdir -p /data && chown node:node /data
VOLUME /data
USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + process.env.FOLIO_PORT + '/api/status').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

LABEL org.opencontainers.image.title="Folio" \
      org.opencontainers.image.description="A minimalistic digital whiteboard for sketching and prototyping" \
      org.opencontainers.image.vendor="Josemi Juanes" \
      org.opencontainers.image.url="https://josemi.xyz/folio" \
      org.opencontainers.image.source="https://github.com/jmjuanes/folio"

CMD ["node", "--disable-warning=ExperimentalWarning", "server/index.ts"]
