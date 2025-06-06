#!/bin/bash

# Install dependencies with legacy peer deps
npm install --legacy-peer-deps

# Clean up any previous builds
rm -rf dist

# Set production environment
export NODE_ENV=production

# Install specific versions of critical dependencies
npm install react@18.2.0 react-dom@18.2.0 @tanstack/react-query@5.24.1

# Create necessary directories
mkdir -p dist/public

# Build client
npm run build:client

# Build server
npm run build:server

# Verify build output
if [ ! -f "dist/index.js" ] || [ ! -d "dist/public" ]; then
    echo "Build failed: Missing expected output files"
    exit 1
fi
mkdir -p dist/public
