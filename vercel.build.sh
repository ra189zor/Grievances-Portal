#!/bin/bash

# Install dependencies
npm install

# Clean up any previous builds
rm -rf dist

# Build client
NODE_ENV=production npm run build:client

# Build server
NODE_ENV=production npm run build:server

# Ensure dist directory structure
mkdir -p dist/public
