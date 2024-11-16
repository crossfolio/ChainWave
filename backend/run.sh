#!/bin/bash

echo "Building and starting Docker container with docker-compose..."

# Build and run the container
docker-compose up -d --build

if [ $? -eq 0 ]; then
  echo "Docker container is built and running."
else
  echo "Failed to build and start Docker container."
  exit 1
fi
