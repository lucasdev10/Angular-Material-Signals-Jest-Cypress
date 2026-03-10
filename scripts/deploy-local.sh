#!/bin/bash

# Local Deployment Script using Docker Compose
# Usage: ./scripts/deploy-local.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting local deployment with Docker Compose...${NC}"

# Stop and remove existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down

# Build and start containers
echo -e "${YELLOW}Building and starting containers...${NC}"
docker-compose up -d --build

# Wait for container to be healthy
echo -e "${YELLOW}Waiting for container to be healthy...${NC}"
sleep 5

# Check container status
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${YELLOW}📦 Application running at: http://localhost:8080${NC}"
    echo -e "${YELLOW}📊 View logs: docker-compose logs -f${NC}"
    echo -e "${YELLOW}🛑 Stop: docker-compose down${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    docker-compose logs
    exit 1
fi
