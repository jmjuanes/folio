#!/bin/sh

# =============================================================================
# Folio Server Startup Script
# =============================================================================

set -e  # Exit on any error

# Set default environment if not specified
NODE_ENV=${NODE_ENV:-production}

# Log startup information
echo "=================================================="
echo "Starting Folio Server"
echo "Environment: $NODE_ENV"
echo "Time: $(date)"
echo "=================================================="

# Validate server directory exists
if [ ! -d "server" ]; then
    echo "ERROR: Server directory not found!"
    exit 1
fi

# Validate package.json exists
if [ ! -f "server/package.json" ]; then
    echo "ERROR: Server package.json not found!"
    exit 1
fi

# Start the server with proper error handling
echo "Starting server..."
cd server

# Export environment variables for the Node.js process
export NODE_ENV

# Execute the server
exec yarn start
