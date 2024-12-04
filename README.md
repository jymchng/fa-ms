<div align="center">
  <img src="./assets/nestjs-project-logo.jpeg" width="200">
</div><p>


# Government Assistance Schemes API

A NestJS-based REST API for managing government assistance schemes and applications.

## Features

- 🔒 Secure authentication and authorization
- 📝 CRUD operations for schemes, applicants, and applications
- 🔍 Eligibility checking based on configurable criteria
- 📊 Swagger API documentation
- 🐳 Docker support for development and production
- 🗃️ PostgreSQL database with Prisma ORM
- 🧪 Comprehensive test coverage

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or later)
- npm (v9 or later)
- Docker and Docker Compose
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd govtech-assignment-01-dec-2024
```

### 2. Environment Setup

Create the necessary environment files:

```bash
# Development environment
cp .env.example .env.development
cp secrets/.db.example secrets/.db.development

# Production environment (if needed)
cp .env.example .env.production
cp secrets/.db.example secrets/.db.production
```

Update the environment files with your configuration:
- `.env.development`: Application configuration
- `secrets/.db.development`: Database credentials

### 3. Install Dependencies

```bash
npm install
```

### 4. Development Environment

#### Using Docker (Recommended)

1. Start PostgreSQL database:

```bash
# Start development containers
npm run docker:local-clean

# Stop development containers
npm run docker:dev:down
```

2. Run database migrations:
```bash
npm run db:migrate:dev
```

3. Seed the database (optional):
```bash
npm run db:seed:dev
```

4. Start the development server:
```bash
npm run watch:dev
```

### 5. Build and Run

```bash
# Development build
npm run build:dev
npm run run:dev

# Production build
npm run build:prod
npm run run:prod
```

## API Documentation

Once the server is running, access the Swagger documentation at:
- Development: http://localhost:3000/api
- Production: https://your-domain.com/api

## Database Management

```bash
# Generate Prisma client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate:dev

# Reset development database
npm run db:reset:dev

# View database GUI (Prisma Studio)
npm run prisma:studio
```

## Testing

```bash
# Run all tests
npm run test
```

## Project Structure

```
.
├── src/
│   ├── bin/                 # Application entry points
│   ├── core/               # Core business logic
│   │   ├── applicants/     # Applicants module
│   │   ├── applications/   # Applications module
│   │   ├── schemes/        # Schemes module
│   │   └── common/         # Shared utilities
│   ├── vendors/            # Third-party integrations
│   └── config/             # Configuration
├── prisma/                 # Database schema and migrations
├── scripts/               # Build and deployment scripts
├── test/                  # Test files
└── docker/                # Docker configuration
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run watch:dev` | Start development server with hot reload |
| `npm run run:dev` | Run development build |
| `npm run run:prod` | Run production build |
| `npm run docker:dev` | Start development environment in Docker |
| `npm run docker:dev:down` | Stop development Docker containers |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate:dev` | Create a new database migration |
| `npm run test` | Run tests |

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

