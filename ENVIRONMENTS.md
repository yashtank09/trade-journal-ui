# Environment Configuration

This project uses different environment configurations for local development, staging, and production deployments.

## Environment Files

- `src/environments/environment.ts` - Local development environment
- `src/environments/environment.staging.ts` - Staging environment  
- `src/environments/environment.prod.ts` - Production environment

## Available Scripts

### Development
```bash
npm start                # Start local development server
```

### Staging
```bash
npm run start:staging    # Start staging server
npm run build:staging    # Build for staging
```

### Production
```bash
npm run build:prod       # Build for production
```

## Environment Variables

Each environment file contains:
- `production`: Boolean indicating production mode
- `apiUrl`: Base URL for API calls
- `environmentName`: Human-readable environment name

## Usage in Code

Import and use the environment in your services:

```typescript
import { environment } from '../../../environments/environment';

// Access environment variables
const apiUrl = environment.apiUrl;
const isProduction = environment.production;
```
