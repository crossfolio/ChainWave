#!/bin/bash

echo "Building Docker images..."
if ! docker-compose build; then
    echo "Build failed. Please check the Dockerfile and docker-compose.yml configuration."
    exit 1
fi

echo "Starting Docker containers..."
if ! docker-compose up -d; then
    echo "Failed to start containers. Please check the container configuration and port settings."
    exit 1
fi

echo "Application is running. Access it at http://localhost:3000 (or the corresponding server IP)."