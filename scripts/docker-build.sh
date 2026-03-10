#!/bin/bash

# Docker Build Script for Coffee Workshop
# Usage: ./scripts/docker-build.sh [tag]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="coffee-workshop"
TAG="${1:-latest}"
REGISTRY="${DOCKER_REGISTRY:-ghcr.io}"
FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo -e "${GREEN}🐳 Building Docker image...${NC}"
echo -e "${YELLOW}Image: ${FULL_IMAGE_NAME}${NC}"

# Build the image
docker build \
  --tag "${IMAGE_NAME}:${TAG}" \
  --tag "${IMAGE_NAME}:latest" \
  --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
  --build-arg VCS_REF="$(git rev-parse --short HEAD)" \
  --file Dockerfile \
  .

echo -e "${GREEN}✅ Build completed successfully!${NC}"

# Show image size
echo -e "${YELLOW}📦 Image size:${NC}"
docker images "${IMAGE_NAME}:${TAG}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Optional: Run the container
read -p "Do you want to run the container? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${GREEN}🚀 Starting container...${NC}"
    docker run -d \
      --name coffee-workshop-test \
      -p 8080:80 \
      "${IMAGE_NAME}:${TAG}"

    echo -e "${GREEN}✅ Container started!${NC}"
    echo -e "${YELLOW}Access the app at: http://localhost:8080${NC}"
    echo -e "${YELLOW}Stop container: docker stop coffee-workshop-test${NC}"
    echo -e "${YELLOW}Remove container: docker rm coffee-workshop-test${NC}"
fi
