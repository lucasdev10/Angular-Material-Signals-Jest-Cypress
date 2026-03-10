# 🚀 Deployment Guide

## Overview

This guide covers automated deployment strategies for the Coffee Workshop application using CI/CD pipelines.

---

## 🎯 Deployment Strategies

### 1. GitHub Actions (Recommended)

- Automated builds on push
- Multi-environment support
- Docker image publishing
- Platform deployments (Vercel, Netlify)

### 2. Docker Deployment

- Containerized application
- Easy scaling
- Consistent environments
- Cloud-agnostic

### 3. Platform Deployments

- Vercel (Recommended for Angular)
- Netlify
- AWS Amplify
- Azure Static Web Apps

---

## 🔄 CI/CD Workflows

### Workflow Overview

```
┌─────────────┐
│   Push to   │
│   GitHub    │
└──────┬──────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────┐                 ┌──────────────┐
│   Run Tests  │                 │ Build Docker │
│   & Lint     │                 │    Image     │
└──────┬───────┘                 └──────┬───────┘
       │                                 │
       ▼                                 ▼
┌──────────────┐                 ┌──────────────┐
│    Build     │                 │ Push to GHCR │
│ Application  │                 │              │
└──────┬───────┘                 └──────────────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────┐                 ┌──────────────┐
│  Deploy to   │                 │  Deploy to   │
│   Vercel     │                 │   Netlify    │
└──────────────┘                 └──────────────┘
```

---

## 📋 GitHub Actions Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers**: Push, Pull Request  
**Purpose**: Run tests and quality checks

```yaml
- Run unit tests (Vitest)
- Run E2E tests (Cypress)
- Run linter (ESLint)
- Check code coverage
- Build application
```

### 2. Docker Build (`.github/workflows/docker-build.yml`)

**Triggers**: Push to main/develop, Tags  
**Purpose**: Build and publish Docker images

```yaml
- Build multi-platform images (amd64, arm64)
- Push to GitHub Container Registry
- Tag with version/branch/sha
- Cache layers for faster builds
```

### 3. Deploy Production (`.github/workflows/deploy-production.yml`)

**Triggers**: Push to main, Tags  
**Purpose**: Deploy to production environment

```yaml
- Run tests
- Build application
- Deploy to Vercel (production)
- Deploy to Netlify (production)
- Notify on success/failure
```

### 4. Deploy Staging (`.github/workflows/deploy-staging.yml`)

**Triggers**: Push to develop, Pull Requests  
**Purpose**: Deploy to staging environment

```yaml
- Run tests
- Build application
- Deploy to Vercel (preview)
- Deploy to Netlify (preview)
- Comment PR with preview URL
```

---

## 🔐 Required Secrets

### GitHub Secrets

Configure these in: `Settings > Secrets and variables > Actions`

#### Vercel

```
VERCEL_TOKEN          # Vercel API token
VERCEL_ORG_ID         # Organization ID
VERCEL_PROJECT_ID     # Project ID
```

#### Netlify

```
NETLIFY_AUTH_TOKEN    # Netlify personal access token
NETLIFY_SITE_ID       # Site ID
```

#### Docker Registry

```
GITHUB_TOKEN          # Automatically provided
```

---

## 🌐 Platform Setup

### Vercel Deployment

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login and Link Project

```bash
vercel login
vercel link
```

#### 3. Get Project Details

```bash
vercel project ls
# Copy ORG_ID and PROJECT_ID
```

#### 4. Configure Build Settings

**Framework Preset**: Angular  
**Build Command**: `npm run build`  
**Output Directory**: `dist/Angular-Material-Signals-Vitest-Cypress/browser`  
**Install Command**: `npm ci --legacy-peer-deps`

#### 5. Environment Variables

```
NODE_ENV=production
```

---

### Netlify Deployment

#### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. Login and Initialize

```bash
netlify login
netlify init
```

#### 3. Configure Build Settings

**Build Command**: `npm run build`  
**Publish Directory**: `dist/Angular-Material-Signals-Vitest-Cypress/browser`  
**Production Branch**: `main`

#### 4. Create `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist/Angular-Material-Signals-Vitest-Cypress/browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_ENV = "production"
```

---

## 🐳 Docker Deployment

### GitHub Container Registry

#### 1. Build and Push

```bash
# Automatic via GitHub Actions
# Or manually:
docker build -t ghcr.io/username/coffee-workshop:latest .
docker push ghcr.io/username/coffee-workshop:latest
```

#### 2. Pull and Run

```bash
docker pull ghcr.io/username/coffee-workshop:latest
docker run -d -p 8080:80 ghcr.io/username/coffee-workshop:latest
```

### Docker Hub

#### 1. Login

```bash
docker login
```

#### 2. Tag and Push

```bash
docker tag coffee-workshop username/coffee-workshop:latest
docker push username/coffee-workshop:latest
```

---

## ☁️ Cloud Deployments

### AWS Amplify

#### 1. Connect Repository

- Go to AWS Amplify Console
- Connect GitHub repository
- Select branch (main)

#### 2. Build Settings

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --legacy-peer-deps
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist/Angular-Material-Signals-Vitest-Cypress/browser
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Azure Static Web Apps

#### 1. Create Resource

```bash
az staticwebapp create \
  --name coffee-workshop \
  --resource-group myResourceGroup \
  --source https://github.com/username/repo \
  --location "East US 2" \
  --branch main \
  --app-location "/" \
  --output-location "dist/Angular-Material-Signals-Vitest-Cypress/browser"
```

#### 2. Configure Workflow

GitHub Actions workflow is auto-generated

---

## 🔄 Deployment Environments

### Development

- **Branch**: `develop`
- **URL**: `https://dev.coffee-workshop.com`
- **Auto-deploy**: On push to develop
- **Purpose**: Testing new features

### Staging

- **Branch**: `develop` / PR previews
- **URL**: `https://staging.coffee-workshop.com`
- **Auto-deploy**: On push to develop
- **Purpose**: Pre-production testing

### Production

- **Branch**: `main`
- **URL**: `https://coffee-workshop.com`
- **Auto-deploy**: On push to main or tags
- **Purpose**: Live application

---

## 📊 Deployment Monitoring

### Health Checks

```bash
# Check application health
curl https://coffee-workshop.com/health

# Check response time
curl -w "@curl-format.txt" -o /dev/null -s https://coffee-workshop.com
```

### Monitoring Tools

- **Vercel Analytics**: Built-in performance monitoring
- **Netlify Analytics**: Traffic and performance insights
- **Google Analytics**: User behavior tracking
- **Sentry**: Error tracking and monitoring

---

## 🔧 Rollback Strategies

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Netlify Rollback

```bash
# List deploys
netlify deploy:list

# Restore previous deploy
netlify deploy:restore [deploy-id]
```

### Docker Rollback

```bash
# Pull previous version
docker pull ghcr.io/username/coffee-workshop:v1.0.0

# Stop current container
docker stop coffee-workshop

# Start previous version
docker run -d -p 8080:80 --name coffee-workshop \
  ghcr.io/username/coffee-workshop:v1.0.0
```

---

## 🧪 Testing Deployments

### Smoke Tests

```bash
# Test homepage
curl -I https://coffee-workshop.com

# Test API endpoints
curl https://coffee-workshop.com/api/health

# Test routing
curl https://coffee-workshop.com/products
```

### E2E Tests Against Deployment

```bash
# Set base URL
export CYPRESS_BASE_URL=https://staging.coffee-workshop.com

# Run tests
npm run cypress:headless
```

---

## 📈 Performance Optimization

### CDN Configuration

- **Vercel**: Automatic global CDN
- **Netlify**: Automatic global CDN
- **CloudFlare**: Additional CDN layer

### Caching Strategy

```nginx
# Static assets: 1 year
Cache-Control: public, max-age=31536000, immutable

# HTML: No cache
Cache-Control: no-cache, must-revalidate

# API: 5 minutes
Cache-Control: public, max-age=300
```

---

## 🔒 Security

### HTTPS

- ✅ Automatic SSL certificates (Let's Encrypt)
- ✅ Force HTTPS redirect
- ✅ HSTS headers

### Security Headers

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer-when-downgrade
Content-Security-Policy: default-src 'self'
```

### Environment Variables

- Never commit secrets to repository
- Use platform secret management
- Rotate tokens regularly

---

## 📚 Resources

### Documentation

- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Netlify Deployment](https://docs.netlify.com/)
- [Docker Deployment](https://docs.docker.com/get-started/)

### Tools

- [Vercel CLI](https://vercel.com/cli)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [GitHub CLI](https://cli.github.com/)

---

**Last Updated**: March 2026  
**Deployment Status**: ✅ Automated  
**Environments**: Development, Staging, Production
