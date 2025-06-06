#!/bin/bash

# Install dependencies with exact versions
npm ci

# Clean up any previous builds
rm -rf dist

# Force clear npm cache
npm cache clean --force

# Install peer dependencies explicitly
npm install react@latest react-dom@latest @tanstack/react-query@5.24.1

# Build client
NODE_ENV=production npm run build:client

# Build server
NODE_ENV=production npm run build:server

# Ensure dist directory structure
mkdir -p dist/public
