# 🐳 Docker Guide

## Overview

This guide explains how to build, run, and deploy the Coffee Workshop application using Docker.

---

## 📋 Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git

---

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Start the application
docker-compose up -d

# Access the application
open http://localhost:8080

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Using Docker CLI

```bash
# Build the image
docker build -t coffee-workshop .

# Run the container
docker run -d -p 8080:80 --name coffee-workshop coffee-workshop

# Access the application
open http://localhost:8080

# Stop and remove
docker stop coffee-workshop
docker rm coffee-workshop
```

---

## 🏗️ Build Process

### Multi-Stage Build

The Dockerfile uses a multi-stage build for optimal image size:

**Stage 1: Build** (node:22-alpine)

- Install dependencies
- Build Angular application
- Output: Production-ready static files

**Stage 2: Serve** (nginx:alpine)

- Copy built files
- Configure Nginx
- Serve application

### Build Arguments

```bash
docker build \
  --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
  --build-arg VCS_REF="$(git rev-parse --short HEAD)" \
  -t coffee-workshop .
```

---

## 📦 Image Details

### Base Images

- **Build**: `node:22-alpine` (~180 MB)
- **Runtime**: `nginx:alpine` (~40 MB)

### Final Image Size

- **Uncompressed**: ~50 MB
- **Compressed**: ~20 MB

### Layers

1. Nginx base layer
2. Custom nginx.conf
3. Application files
4. Health check configuration

---

## ⚙️ Configuration

### Nginx Configuration

The `nginx.conf` includes:

- Gzip compression
- Cache headers for static assets
- Security headers
- Angular routing support
- Health check endpoint

### Environment Variables

```yaml
# docker-compose.yml
environment:
  - NODE_ENV=production
```

### Ports

- **Container**: 80
- **Host**: 8080 (configurable)

---

## 🔧 Scripts

### Build Script

```bash
./scripts/docker-build.sh [tag]

# Examples
./scripts/docker-build.sh latest
./scripts/docker-build.sh v1.0.0
```

### Push Script

```bash
./scripts/docker-push.sh [tag]

# Examples
./scripts/docker-push.sh latest
./scripts/docker-push.sh v1.0.0
```

### Local Deploy Script

```bash
./scripts/deploy-local.sh
```

---

## 🏥 Health Checks

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
```

### Nginx Health Endpoint

```bash
curl http://localhost:8080/health
# Response: healthy
```

### Check Container Health

```bash
docker ps
# Look for "healthy" status

docker inspect coffee-workshop | grep -A 5 Health
```

---

## 🔒 Security

### Security Headers

```nginx
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer-when-downgrade
Content-Security-Policy: default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';
```

### Best Practices

- ✅ Non-root user (nginx)
- ✅ Minimal base image (alpine)
- ✅ Multi-stage build
- ✅ .dockerignore file
- ✅ Health checks
- ✅ Security headers

---

## 📊 Performance

### Optimizations

1. **Multi-stage build**: Reduces final image size
2. **Alpine Linux**: Minimal base image
3. **Gzip compression**: Reduces bandwidth
4. **Cache headers**: Improves client-side caching
5. **Static file serving**: Fast Nginx delivery

### Benchmarks

```bash
# Image size
docker images coffee-workshop
# ~50 MB

# Build time
time docker build -t coffee-workshop .
# ~2-3 minutes (first build)
# ~30 seconds (cached)

# Startup time
time docker run -d -p 8080:80 coffee-workshop
# ~2 seconds
```

---

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker logs coffee-workshop

# Check if port is in use
lsof -i :8080

# Inspect container
docker inspect coffee-workshop
```

### Build fails

```bash
# Clear build cache
docker builder prune

# Build without cache
docker build --no-cache -t coffee-workshop .

# Check .dockerignore
cat .dockerignore
```

### Application not accessible

```bash
# Check container is running
docker ps

# Check port mapping
docker port coffee-workshop

# Test health endpoint
curl http://localhost:8080/health

# Check nginx logs
docker exec coffee-workshop cat /var/log/nginx/error.log
```

---

## 🚢 Deployment

### Docker Hub

```bash
# Login
docker login

# Tag image
docker tag coffee-workshop username/coffee-workshop:latest

# Push
docker push username/coffee-workshop:latest
```

### GitHub Container Registry

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag image
docker tag coffee-workshop ghcr.io/username/coffee-workshop:latest

# Push
docker push ghcr.io/username/coffee-workshop:latest
```

### Pull and Run

```bash
# Pull from registry
docker pull ghcr.io/username/coffee-workshop:latest

# Run
docker run -d -p 8080:80 ghcr.io/username/coffee-workshop:latest
```

---

## 🔄 Docker Compose

### Services

```yaml
services:
  app:
    build: .
    ports:
      - '8080:80'
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--quiet', '--tries=1', '--spider', 'http://localhost/health']
      interval: 30s
      timeout: 10s
      retries: 3
```

### Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Restart service
docker-compose restart app

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Scale services
docker-compose up -d --scale app=3
```

---

## 📈 Monitoring

### Container Stats

```bash
# Real-time stats
docker stats coffee-workshop

# Resource usage
docker inspect coffee-workshop | grep -A 10 Memory
```

### Logs

```bash
# Follow logs
docker logs -f coffee-workshop

# Last 100 lines
docker logs --tail 100 coffee-workshop

# Since timestamp
docker logs --since 2024-03-09T10:00:00 coffee-workshop
```

---

## 🧪 Testing

### Test Build

```bash
# Build test image
docker build -t coffee-workshop:test .

# Run tests in container
docker run --rm coffee-workshop:test npm test
```

### Integration Tests

```bash
# Start container
docker-compose up -d

# Wait for healthy
sleep 5

# Run tests
curl http://localhost:8080/health
curl http://localhost:8080/

# Cleanup
docker-compose down
```

---

## 📚 Resources

### Documentation

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Compose](https://docs.docker.com/compose/)

### Best Practices

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

**Last Updated**: March 2026  
**Docker Version**: 20.10+  
**Status**: ✅ Production Ready
