# Angular Material Signals Vitest Cypress

[![CI](https://github.com/lucasdev10/Angular-Material-Signals-Vitest-Cypress/actions/workflows/ci.yml/badge.svg)](https://github.com/lucasdev10/Angular-Material-Signals-Vitest-Cypress/actions/workflows/ci.yml)
[![Deploy](https://github.com/lucasdev10/Angular-Material-Signals-Vitest-Cypress/actions/workflows/deploy.yml/badge.svg)](https://github.com/lucasdev10/Angular-Material-Signals-Vitest-Cypress/actions/workflows/deploy.yml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

E-commerce study project built with Angular 21, demonstrating modern architecture, testing strategies, and best practices.

## 🏗️ Architecture

This project follows a **feature-based architecture** with clear separation of concerns:

```
src/app/
├── core/                    # Core functionality (singleton services)
│   ├── guards/             # Route guards (auth, role, unsaved-changes)
│   ├── interceptors/       # HTTP interceptors (auth, error handling)
│   ├── layout/             # Layout components (header, footer)
│   ├── storage/            # Storage service (localStorage wrapper)
│   └── http/               # HTTP client wrapper
│
├── features/               # Feature modules (lazy-loaded)
│   ├── products/          # Product management
│   │   ├── components/    # Feature-specific components
│   │   ├── pages/         # Route components
│   │   ├── store/         # State management (Signals)
│   │   ├── repositories/  # Data access layer
│   │   ├── models/        # TypeScript interfaces
│   │   └── integration/   # Integration tests
│   │
│   ├── cart/              # Shopping cart
│   ├── admin/             # Admin panel (protected)
│   ├── auth/              # Authentication
│   └── user/              # User management
│
└── shared/                 # Shared resources
    ├── components/        # Reusable components
    ├── directives/        # Custom directives
    ├── pipes/             # Custom pipes
    ├── validators/        # Form validators
    └── utils/             # Utility functions
```

### Key Architectural Decisions

**State Management**: Angular Signals (v16+)

- Reactive state with automatic change detection
- Computed values with automatic memoization
- Better performance than traditional RxJS BehaviorSubjects

**Lazy Loading**: All feature modules are lazy-loaded

- Reduces initial bundle size
- Improves application startup time
- Better code splitting

**Repository Pattern**: Separation of data access logic

- Abstracts API calls from business logic
- Easier to test and mock
- Centralized data transformation

**Guards & Interceptors**: Security and HTTP handling

- Authentication guard for protected routes
- Role-based access control
- Automatic token injection
- Global error handling

## 🚀 Tech Stack

- **Framework**: Angular 21
- **UI Library**: Angular Material 21
- **State Management**: Angular Signals
- **Forms**: Reactive Forms with Signal-based API
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router with lazy loading
- **Testing**: Vitest (unit) + Cypress (e2e)
- **Linting**: ESLint + Angular ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions

## 📦 Features

- ✅ Product catalog with filtering
- ✅ Shopping cart with persistence
- ✅ Admin panel (CRUD operations)
- ✅ Authentication & authorization
- ✅ Role-based access control
- ✅ Form validation
- ✅ Responsive design
- ✅ Lazy loading
- ✅ Performance optimizations

## 🛠️ Development

### Prerequisites

- Node.js 22+
- npm 10+

### Installation

```bash
npm install
```

### Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`

### Build

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

## 🧪 Testing

### Unit Tests (Vitest)

```bash
npm test                 # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

**Current Coverage**: ~70% (target: 80%)

### E2E Tests (Cypress)

```bash
npm run cypress          # Open Cypress UI
npm run cypress:headless # Run tests headlessly
```

**Test Suites**:

- User shopping flow
- Admin product management
- Cart calculations
- Product list preservation

## 📊 Code Quality

### Linting

```bash
npm run lint             # Check for linting errors
npm run lint:fix         # Fix linting errors automatically
```

**ESLint Configuration**:

- Angular ESLint rules
- TypeScript strict mode
- No `any` types (enforced)
- Consistent code style

### Formatting

```bash
npm run format           # Format all files
npm run format:check     # Check formatting
```

**Prettier Configuration**:

- Print width: 100
- Single quotes
- Angular HTML parser

### Pre-commit Hooks

Husky + lint-staged automatically run on commit:

- ESLint on `.ts` files
- Prettier on all files
- Prevents committing broken code

## 🔒 Security

- ✅ Protected admin routes with guards
- ✅ JWT token authentication (simulated)
- ✅ Role-based access control
- ✅ Input sanitization
- ✅ XSS protection (Angular built-in)
- ✅ HTTP interceptors for auth & errors

See [SECURITY_GUIDE.md](docs/SECURITY_GUIDE.md) for details.

## ♿ Accessibility

This project implements WCAG 2.1 Level AA accessibility standards:

- ✅ Semantic HTML with proper landmarks (main, nav, header)
- ✅ ARIA attributes for screen reader support
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus management and visible indicators
- ✅ Descriptive labels and alt text
- ✅ Live regions for dynamic content
- ✅ Form validation with accessible error messages
- ✅ Color contrast compliance

**Key Features**:

- All interactive elements keyboard accessible
- Dynamic aria-labels for context-aware descriptions
- Proper heading hierarchy throughout
- Screen reader tested with NVDA/VoiceOver

See [ACCESSIBILITY.md](docs/ACCESSIBILITY.md) for complete implementation guide.

### Testing Accessibility

```bash
npm run cypress          # Includes accessibility test suite
npm run test:a11y        # Run accessibility-specific tests
```

## ⚡ Performance

This project is optimized for excellent Lighthouse scores and fast user experience:

- ✅ Lighthouse Performance Score: 90+
- ✅ First Contentful Paint (FCP): < 1.8s
- ✅ Largest Contentful Paint (LCP): < 2.5s
- ✅ Time to Interactive (TTI): < 3.8s
- ✅ Cumulative Layout Shift (CLS): < 0.1

**Key Optimizations**:

- Code splitting and lazy loading for all routes
- Image lazy loading with Intersection Observer
- Zoneless change detection (experimental)
- OnPush change detection strategy
- Critical CSS inlining
- Async font loading with font-display: swap
- HTTP caching and Fetch API
- Web Vitals monitoring
- PWA-ready with manifest

See [PERFORMANCE.md](docs/PERFORMANCE.md) for complete optimization guide.

### Testing Performance

```bash
npm run build            # Build for production
npx lighthouse http://localhost:4200 --view  # Run Lighthouse audit
```

## 🐳 Docker

The application is fully containerized and ready for deployment:

- ✅ Multi-stage Dockerfile for optimal image size (~50 MB)
- ✅ Docker Compose for easy local deployment
- ✅ Nginx configuration with caching and security headers
- ✅ Health checks and monitoring
- ✅ GitHub Container Registry integration

**Quick Start**:

```bash
# Using Docker Compose
docker-compose up -d

# Using Docker CLI
docker build -t coffee-workshop .
docker run -d -p 8080:80 coffee-workshop

# Access application
open http://localhost:8080
```

See [DOCKER.md](docs/DOCKER.md) for complete Docker guide.

## 🚀 Automated Deployment

CI/CD pipelines configured for automated deployments:

- ✅ GitHub Actions workflows
- ✅ Automated testing before deployment
- ✅ Multi-environment support (dev, staging, production)
- ✅ Docker image building and publishing
- ✅ Platform deployments (Vercel, Netlify)
- ✅ Rollback strategies

**Deployment Environments**:

- **Development**: Auto-deploy on push to `develop`
- **Staging**: Preview deployments for PRs
- **Production**: Auto-deploy on push to `main` or tags

**Supported Platforms**:

- Vercel (Recommended)
- Netlify
- Docker (Self-hosted)
- AWS Amplify
- Azure Static Web Apps

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment guide.

## ⚡ Performance

- ✅ Lazy loading (all feature modules)
- ✅ Code splitting
- ✅ OnPush change detection strategy
- ✅ Computed signals (memoization)
- ✅ TrackBy functions in lists
- ✅ Optimized bundle size

See [PERFORMANCE_OPTIMIZATIONS.md](docs/PERFORMANCE_OPTIMIZATIONS.md) for details.

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

**CI Pipeline** (`ci.yml`):

- Runs on push/PR to main/develop
- Linting & formatting checks
- Unit tests
- Build verification
- Artifact upload

**Deploy Pipeline** (`deploy.yml`):

- Deploys to GitHub Pages
- Runs on push to main
- Automatic deployment

**PR Checks** (`pr-checks.yml`):

- Validates pull requests
- Detailed feedback on code quality

### Setting up GitHub Pages

1. Go to repository Settings → Pages
2. Source: GitHub Actions
3. The app will be deployed automatically on push to main

## 📚 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [Testing Strategy](docs/TESTING_STRATEGY.md)
- [Security Guide](docs/SECURITY_GUIDE.md)
- [Performance Optimizations](docs/PERFORMANCE_OPTIMIZATIONS.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Project Checklist](docs/PROJECT_CHECKLIST.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is for educational purposes.

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- Angular Material for the UI components
- Vitest for fast unit testing
- Cypress for reliable e2e testing
