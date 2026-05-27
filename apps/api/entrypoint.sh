#!/bin/sh
set -e

echo "Running database migrations..."
node apps/api/dist/migrate.js

echo "Starting API server..."
exec node apps/api/dist/index.js
