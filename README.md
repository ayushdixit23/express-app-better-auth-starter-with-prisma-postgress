# Express App Template (TypeScript & PostgreSQL)

## Overview
A production-ready Express.js starter template with TypeScript, PostgreSQL, and Better-Auth. This template provides a solid foundation with modern best practices, authentication system, comprehensive error handling, security enhancements, and graceful shutdown mechanisms.

---

## ✨ Features

### Core Technologies
- **TypeScript** (v5.9.3): Full type safety with modern JavaScript features
- **Express.js** (v5.1.0): Fast, unopinionated web framework
- **PostgreSQL**: Relational database with Prisma ORM (v6.18.0)
- **Better-Auth** (v1.3.34): Modern authentication system with OAuth support
- **Nodemailer** (v7.0.10): Email sending for verification and password reset
- **Morgan** (v1.10.1): HTTP request logger
- **Node.js** (v18 or higher recommended)

### Production-Ready Features
- ✅ **Better-Auth Integration**: Complete authentication with email/password, OAuth (GitHub, Google), 2FA
- ✅ **Class-Based Response System**: Clean API responses with `SuccessResponse` and `ErrorResponse`
- ✅ **Environment Validation**: Type-safe configuration with validation
- ✅ **Security**: Helmet.js for security headers, CORS configuration
- ✅ **Rate Limiting**: Protection against brute-force attacks
- ✅ **Error Handling**: Centralized error handling with custom error classes
- ✅ **Compression**: HTTP response compression for better performance
- ✅ **Health Checks**: Kubernetes/Docker-ready health endpoints
- ✅ **Graceful Shutdown**: Proper cleanup of connections on termination
- ✅ **Request Logging**: Environment-based logging (dev/production)
- ✅ **Async Handler**: Automatic error catching for async routes
- ✅ **Modular Routes**: Clean, organized route structure
- ✅ **Email Verification**: Automatic email verification on signup
- ✅ **Password Reset**: Secure password reset via email
- ✅ **Two-Factor Authentication**: TOTP-based 2FA support
- ✅ **Authentication Middleware**: Protect routes with `authenticateUser` or optional auth with `optionalAuth`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- PostgreSQL (local or remote instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ayushdixit23/express-app
   cd express-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```
   
   - Update `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # PostgreSQL Database Configuration (Prisma)
   DATABASE_URL=postgresql://user:password@localhost:5432/mydb
   
   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=400
   
   # Better Auth Configuration
   BETTER_AUTH_SECRET=your-super-secret-key-min-32-characters
   BETTER_AUTH_URL=http://localhost:5000
   FRONTEND_URL=http://localhost:3000
   
   # OAuth Provider Configuration (Optional)
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Email Configuration (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@yourapp.com
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database (if not exists)
   createdb mydatabase
   
   # Or via psql
   psql -U postgres
   CREATE DATABASE mydatabase;
   ```

5. **Run Prisma migrations**
   ```bash
   npm run db:migrate
   ```
   This will create all necessary tables for Better-Auth.

6. **Run the application**
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```
express-app/
├── src/
│   ├── app.ts                # Express app configuration & middleware setup
│   ├── index.ts              # Application entry point (server startup)
│   ├── config/                # Configuration files
│   │   ├── database.ts       # PostgreSQL connection with Prisma
│   │   └── env.ts            # Environment variables configuration
│   ├── lib/                   # Core libraries
│   │   ├── auth.ts           # Better-Auth configuration
│   │   ├── email-templates.ts # Email template functions
│   │   └── send-mail.ts      # Email sending utility
│   ├── middlewares/           # Custom middleware
│   │   ├── authMiddleware.ts  # Authentication middleware (Better Auth)
│   │   ├── errorMiddleware.ts # Error handling middleware
│   │   ├── responseHandler.ts # Success & Error response classes
│   │   └── tryCatch.ts       # Async error wrapper
│   ├── routes/               # Route definitions
│   │   ├── index.ts          # Main router
│   │   ├── api.routes.ts     # API routes
│   │   └── health.routes.ts  # Health check routes
│   └── utils/                 # Utility functions
│       └── gracefulShutdown.ts # Graceful shutdown handler
├── prisma/                    # Prisma schema and migrations
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration files
├── dist/                      # Compiled JavaScript (generated)
├── env.example                # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎯 API Response System

### Class-Based Response Architecture

#### Success Response
```typescript
import { SuccessResponse } from "../middlewares/responseHandler.js";

router.get("/users/:id", asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id }
  });
  return new SuccessResponse("User retrieved successfully", user).send(res);
}));
```

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "statusCode": 200,
  "data": {
    "id": "1",
    "name": "John Doe"
  }
}
```

#### Error Response
```typescript
import { ErrorResponse } from "../middlewares/responseHandler.js";

if (!user) {
  throw new ErrorResponse("User not found", 404);
}
```

**Response:**
```json
{
  "success": false,
  "message": "User not found",
  "statusCode": 404
}
```

---

## 🔐 Better-Auth Endpoints

All authentication endpoints are available under `/api/auth/*`:

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sign-up` | POST | Register new user |
| `/api/auth/sign-in` | POST | Login user |
| `/api/auth/sign-out` | POST | Logout user |
| `/api/auth/session` | GET | Get current session |
| `/api/auth/verify-email` | POST | Verify email address |

### Password Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/forget-password` | POST | Request password reset |
| `/api/auth/reset-password` | POST | Reset password with token |

### Two-Factor Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/2fa/enable` | POST | Enable 2FA |
| `/api/auth/2fa/verify` | POST | Verify 2FA code |
| `/api/auth/2fa/disable` | POST | Disable 2FA |

### OAuth (GitHub & Google)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sign-in/github` | GET | GitHub OAuth login |
| `/api/auth/sign-in/google` | GET | Google OAuth login |
| `/api/auth/callback/github` | GET | GitHub OAuth callback |
| `/api/auth/callback/google` | GET | Google OAuth callback |

### Example Usage
```typescript
// Sign up
POST /api/auth/sign-up
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}

// Sign in
POST /api/auth/sign-in
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

---

## 📡 API Endpoints

### Health Checks
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Full health check with service status |
| `/health/live` | GET | Liveness probe (Kubernetes) |
| `/health/ready` | GET | Readiness probe (checks dependencies) |

### API Routes
| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/data` | GET | Sample data endpoint | 200 |
| `/api/query` | GET | Async database query example | 200 |
| `/api/users` | POST | Create user | 201 |
| `/api/users/:id` | PUT | Update user | 200 |
| `/api/users/:id` | DELETE | Delete user | 200 |
| `/api/posts` | GET | Paginated posts | 200 |
| `/api/stats` | GET | Statistics | 200 |
| `/api/error` | GET | Error handling demo | 400 |

### Root
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information and status |

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `5000` | No |
| `NODE_ENV` | Environment (development/production) | `development` | No |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `localhost:3000,localhost:3001` | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 min) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `400` | No |
| `BETTER_AUTH_SECRET` | Secret key for Better-Auth (min 32 chars) | - | Yes |
| `BETTER_AUTH_URL` | Base URL for Better-Auth | `http://localhost:5000` | Yes |
| `FRONTEND_URL` | Frontend URL for redirects | `http://localhost:3000` | Yes |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` | No |
| `SMTP_PORT` | SMTP server port | `587` | No |
| `SMTP_SECURE` | Use SSL/TLS | `false` | No |
| `SMTP_USER` | SMTP username | - | No |
| `SMTP_PASS` | SMTP password | - | No |
| `SMTP_FROM` | Email from address | - | No |

---

## 🗄️ Database Management (Prisma)

### Prisma Commands

| Command | Description |
|--------|-------------|
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema changes to database (prototyping) |
| `npm run db:pull` | Pull schema from database |
| `npm run db:migrate` | Create and apply migrations |
| `npm run db:migrate:deploy` | Deploy migrations (production) |
| `npm run db:migrate:status` | Check migration status |
| `npm run db:migrate:reset` | Reset database and rerun migrations |
| `npm run db:studio` | Open Prisma Studio (GUI) |
| `npm run db:format` | Format Prisma schema |
| `npm run db:validate` | Validate Prisma schema |
| `npm run db:reset` | Force reset database |

### Common Workflow

```bash
# 1. Update schema.prisma
# 2. Create migration
npm run db:migrate

# 3. View database in browser
npm run db:studio

# 4. Generate Prisma Client (auto on migrate)
npm run db:generate
```

---

## 💻 Usage Examples

### Creating a New Route with Prisma

```typescript
import { Router } from "express";
import asyncHandler from "../middlewares/tryCatch.js";
import { SuccessResponse, ErrorResponse } from "../middlewares/responseHandler.js";
import { prisma } from "../config/database.js";

const router = Router();

router.get("/users/:id", asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id }
  });
  
  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }
  
  return new SuccessResponse("User found", user).send(res);
}));

export default router;
```

### Pagination Example with Prisma

```typescript
router.get("/posts", asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.post.count()
  ]);
  
  const responseData = {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrevious: page > 1
    }
  };
  
  return new SuccessResponse("Posts retrieved", responseData).send(res);
}));
```

### Using Authentication Middleware

#### Protected Route (Required Authentication)

```typescript
import { Router } from "express";
import asyncHandler from "../middlewares/tryCatch.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { SuccessResponse } from "../middlewares/responseHandler.js";

const router = Router();

// This route requires authentication
router.get("/profile", authenticateUser, asyncHandler(async (req, res) => {
  // req.user is available after authenticateUser middleware
  const user = (req as any).user;
  
  return new SuccessResponse("Profile retrieved", {
    id: user.id,
    email: user.email,
    name: user.name,
  }).send(res);
}));

export default router;
```

#### Optional Authentication Route

```typescript
import { Router } from "express";
import asyncHandler from "../middlewares/tryCatch.js";
import { optionalAuth } from "../middlewares/authMiddleware.js";
import { SuccessResponse } from "../middlewares/responseHandler.js";

const router = Router();

// This route works for both authenticated and unauthenticated users
router.get("/posts", optionalAuth, asyncHandler(async (req, res) => {
  const user = (req as any).user; // May be undefined
  
  const posts = await prisma.post.findMany({
    // If user exists, show personalized content
    where: user ? { userId: user.id } : { published: true },
  });
  
  return new SuccessResponse("Posts retrieved", { posts, isAuthenticated: !!user }).send(res);
}));

export default router;
```

**Authentication Middleware Features:**
- `authenticateUser`: Requires valid session, throws 401 if not authenticated
- `optionalAuth`: Attaches user if authenticated, but doesn't block unauthenticated requests
- Automatically attaches `req.user` with `{ id, email, name }` for authenticated users
- Handles JWT errors and expired sessions gracefully

---

## 🛡️ Security Features

- **Helmet.js**: Sets security-related HTTP headers
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Rate Limiting**: Prevents brute-force attacks (400 requests per 15 minutes)
- **Better-Auth**: Secure authentication with bcrypt password hashing
- **Authentication Middleware**: Route protection with `authenticateUser` and `optionalAuth`
- **Email Verification**: Required email verification on signup
- **Two-Factor Authentication**: TOTP-based 2FA support
- **Secure Cookies**: HTTP-only, secure cookies for sessions
- **Input Validation**: Type-safe request handling with TypeScript
- **Error Sanitization**: Prevents information leakage

---

## 🔄 Graceful Shutdown

The application handles graceful shutdowns on:
- `SIGTERM` - Kubernetes/Docker termination
- `SIGINT` - Manual interruption (Ctrl+C)
- `uncaughtException` - Unhandled exceptions
- `unhandledRejection` - Unhandled promise rejections

**Shutdown Process:**
1. Stop accepting new requests
2. Close database connections (Prisma)
3. Exit process cleanly

---

## 🧪 Testing

### Start the server
```bash
npm run dev
```

### Test endpoints

```bash
# Health check
curl http://localhost:5000/health

# Get data
curl http://localhost:5000/api/data

# Sign up
curl -X POST http://localhost:5000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Sign in
curl -X POST http://localhost:5000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Paginated posts
curl http://localhost:5000/api/posts?page=1&limit=5
```

---

## 🚀 Deployment

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Docker Example
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npx prisma generate
RUN npx prisma migrate deploy
EXPOSE 5000
CMD ["npm", "start"]
```

> **Note**: Using Node.js 20 LTS for better performance and long-term support. Compatible with Node.js 18+.

### Environment Setup
- Set `NODE_ENV=production`
- Use environment-specific `.env` files
- Ensure PostgreSQL and other services are accessible
- Run migrations: `npm run db:migrate:deploy`

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload (tsx + nodemon) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server |
| `npm run clean` | Remove build artifacts |

See [Database Management](#-database-management-prisma) section for Prisma commands.

---

## 🏗️ Architecture Highlights

### Middleware Stack
```
Request
  ↓
Trust Proxy (production only)
  ↓
CORS
  ↓
Logging (Morgan)
  ↓
Security (Helmet)
  ↓
Compression
  ↓
Rate Limiting
  ↓
Better-Auth Handler (/api/auth/*)
  ↓
Body Parsing (JSON, URL-encoded)
  ↓
Routes
  ↓
asyncHandler (catches errors)
  ↓
Route Handler
  ├─→ Success → SuccessResponse.send(res) → Client ✅
  └─→ Error → throw ErrorResponse → errorMiddleware → Client ❌
```

**Note:** The Express app is configured in `src/app.ts` and initialized in `src/index.ts` (entry point).

### Response Flow
```
Success:
  return new SuccessResponse("message", data).send(res);
  → { success: true, message: "...", statusCode: 200, data: {...} }

Error:
  throw new ErrorResponse("message", 400);
  → errorMiddleware catches it
  → { success: false, message: "...", statusCode: 400 }
```

---

## 🔑 Authentication Setup

### OAuth Providers

1. **GitHub OAuth**
   - Go to https://github.com/settings/developers
   - Create new OAuth App
   - Set Authorization callback URL: `http://localhost:5000/api/auth/callback/github`
   - Copy Client ID and Secret to `.env`

2. **Google OAuth**
   - Go to https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID
   - Set Authorized redirect URIs: `http://localhost:5000/api/auth/callback/google`
   - Copy Client ID and Secret to `.env`

### Email Setup (Gmail)

1. Enable 2-Step Verification in Google Account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in `SMTP_PASS` (not your regular password)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).

---

## 🙏 Acknowledgments

Built with best practices from the Node.js and Express.js communities.
Powered by Prisma, Better-Auth, and PostgreSQL.

---

## 📞 Support

If you encounter any issues:
1. Check the README.md for documentation
2. Verify your `.env` file is properly configured
3. Check the logs for detailed error messages
4. Ensure PostgreSQL is running and accessible
5. Run `npm run db:migrate` if database schema is outdated

---

**Happy Coding! 🎉**
