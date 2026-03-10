#!/bin/bash

# Docker Push Script for Coffee Workshop
# Usage: ./scripts/docker-push.sh [tag]

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

echo -e "${GREEN}🚀 Pushing Docker image...${NC}"
echo -e "${YELLOW}Image: ${FULL_IMAGE_NAME}${NC}"

# Tag the image for registry
docker tag "${IMAGE_NAME}:${TAG}" "${FULL_IMAGE_NAME}"

# Push to registry
docker push "${FULL_IMAGE_NAME}"

echo -e "${GREEN}✅ Push completed successfully!${NC}"
echo -e "${YELLOW}Image available at: ${FULL_IMAGE_NAME}${NC}"
