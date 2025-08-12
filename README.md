# 🔥 Honoko Template

Production-ready TypeScript API template built with modern tooling and best practices.

## ✨ Features

- ⚡ **Lightning Fast** - Built with Hono, ultra-fast web framework
- 🔒 **Type Safe** - Full TypeScript support with Zod validation
- 🗃️ **Database Ready** - Prisma ORM with PostgreSQL support
- 📚 **Dual API Docs** - Auto-generated OpenAPI docs with Swagger UI & Fiberplane
- 🔄 **API Versioning** - Path-based versioning strategy (`/api/v1`)
- 🔑 **Auth Ready** - JWT authentication with refresh tokens
- 🚀 **Deploy Anywhere** - Works on Cloudflare Workers, Vercel, and more
- 🐳 **Docker Ready** - Production Dockerfile included
- 🪝 **Git Hooks** - Prettier, linting, and commit message validation
- 📝 **Advanced Logging** - Structured logging with file output and levels
- 🧪 **Testing Ready** - Pre-configured test setup

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/vlhsmylv/hono-template.git
cd hono-template

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secrets

# Set up database
bun run db:push    # Push schema to database
bun run db:generate # Generate Prisma client

# Set up git hooks (optional)
bun run prepare

# Run in development
bun dev

# Open in browser
open http://localhost:3000
```

## 📚 API Documentation

- **Swagger UI**: [http://localhost:3000/swagger](http://localhost:3000/swagger)
- **Fiberplane**: [http://localhost:3000/fp](http://localhost:3000/fp)

## 🔄 API Versioning - Third Form: Blazing Universe

The API uses URL path versioning for backward compatibility (_like mastering different flame forms_):

```
/api/v1/users     # First Form: Unknowing Fire
/api/v2/users     # Second Form: Rising Scorching Sun (future)
```

- **Current Version**: `v1` (_Master one form before moving to the next_)
- **Base URL**: `/api/v1`
- **Versioning Strategy**: Path-based versioning for clear separation (_Each form has its purpose_)
- **Backward Compatibility**: Previous versions remain available (_Honor the old ways_)

## 🛠️ Tech Stack - Fourth Form: Blooming Flame Undulation

- **Runtime**: Bun (_Swift as flame_)
- **Framework**: Hono (_The eternal flame_)
- **Database**: PostgreSQL + Prisma ORM (_Unyielding foundation_)
- **Validation**: Zod (_Pure intentions_)
- **Documentation**: OpenAPI + Swagger UI (_Clear as daylight_)
- **Code Quality**: Prettier + ESLint + Husky (_Discipline of a hashira_)
- **Deployment**: Docker (_Portable flames_)

## 📁 Project Structure

```
src/
├── modules/              # API modules with clean architecture
│   ├── auth/            # Authentication (login, register, logout)
│   ├── users/           # User management (CRUD operations)
│   ├── profile/         # User profile management
│   └── README.md        # Module development guide
├── middleware/          # Custom middleware
│   ├── auth.ts          # JWT authentication with refresh tokens
│   ├── logger.ts        # Production logging system
│   └── user-injection.ts # Automatic user context injection
├── prisma/             # Database client & utilities
│   └── index.ts        # Prisma client singleton
├── public/             # Static files & landing page
├── shared/             # Shared utilities & schemas
├── utils/              # Helper functions & configurations
├── versions/           # API versioning (v1, v2, etc.)
└── index.ts            # Application entry point
```

## 🔧 Development

```bash
# Development with hot reload
bun dev

# Database operations
bun run db:generate  # Generate Prisma client
bun run db:push      # Push schema changes
bun run db:migrate   # Create and run migrations
bun run db:studio    # Open Prisma Studio

# Code quality
bun run lint         # Lint TypeScript code
bun run lint:fix     # Fix auto-fixable lint errors
bun run format       # Format code with Prettier
bun run format:check # Check formatting
bun run type-check   # TypeScript type checking

# Testing
bun test            # Run tests
bun test:watch      # Run tests in watch mode
```

## 🐳 Docker

```bash
# Build image
docker build -t hono-template .

# Run container
docker run -p 3000:3000 hono-template

# With environment file
docker run -p 3000:3000 --env-file .env hono-template
```

## 🔗 Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/hono_template"

# JWT Authentication (generate strong secrets!)
ACCESS_TOKEN_SECRET="your-super-secret-access-token-key"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key"

# Application Settings
NODE_ENV="development"
PORT=3000
```

**🔒 Security Note**: Generate strong, unique secrets for production environments. Never commit real secrets to version control.

## 📝 Git Hooks

- **Pre-commit**: Auto-format code, run linting
- **Commit-msg**: Enforce conventional commit format
- **Pre-push**: Run tests and type checking

## 📋 Logging

The template includes a production-ready logging system:

### Features

- **File Output**: Daily log files in `logs/` directory
- **Multiple Levels**: `info`, `warn`, `error`, `debug`
- **Structured Format**: JSON format for easy parsing
- **Console Colors**: Color-coded console output
- **HTTP Logging**: Automatic request/response logging
- **Metadata Support**: IP, User-Agent, Request ID tracking

### Usage

```typescript
import { logger } from "@/middleware/logger";

// Basic logging
logger.info("User registered", { userId: "123", email: "user@example.com" });
logger.warn("Rate limit approaching", { attempts: 8 });
logger.error("Database connection failed", { error: "Connection timeout" });
logger.debug("Debug info", { data: processedData }); // Dev only

// HTTP request logging
logger.request("POST", "/api/users", 201, 145, {
  ip: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  requestId: "req-abc123",
});
```

### Log Files

```
logs/
├── 2025-01-14-info.log    # All logs (combined)
├── 2025-01-14-warn.log    # Warning logs only
├── 2025-01-14-error.log   # Error logs only
└── 2025-01-14-debug.log   # Debug logs only
```

## 🔐 Authentication & Authorization

The template includes a comprehensive auth system:

### Features

- **JWT Access Tokens** - Short-lived (1 hour) for security
- **Refresh Tokens** - Long-lived (7 days) for seamless UX
- **Automatic Refresh** - Middleware handles token renewal transparently
- **User Injection** - Decorator-like pattern for easy user access
- **Password Security** - Bcrypt hashing with salt rounds
- **Cookie-based** - HttpOnly, Secure, SameSite protection

### Usage

```typescript
// Apply auth middleware to protected routes
controller.use("/*", authMiddleware);
controller.use("/*", injectUser);

// Use decorator pattern for clean user access
controller.openapi(
  route,
  withUser(async (user, c) => {
    // User automatically injected!
    return c.json({ profile: user });
  })
);
```

## 🗄️ Database

### Setup

1. **Install PostgreSQL** or use a cloud provider
2. **Configure** `DATABASE_URL` in `.env`
3. **Push schema**: `bun run db:push`
4. **Generate client**: `bun run db:generate`

### Schema

Current models: User with authentication fields. Easily extendable for your needs.

### Migrations

```bash
# Create migration
bun run db:migrate

# Reset database (dev only)
bun run db:push --force-reset
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Built with ❤️ by [Valeh Ismayilov](https://www.valehismayilov.com)**

*Hono no Kokyu ;)*

---

⭐ Star this repository if you find it helpful!
