# Express App Template (TypeScript & MongoDB)

## Overview
A production-ready Express.js starter template with TypeScript and MongoDB. This template provides a solid foundation with modern best practices, class-based response system, comprehensive error handling, security enhancements, and graceful shutdown mechanisms.

---

## ✨ Features

### Core Technologies
- **TypeScript** (v5.9.3): Full type safety with modern JavaScript features
- **Express.js** (v5.1.0): Fast, unopinionated web framework
- **MongoDB**: NoSQL database with Mongoose ODM (v8.19.2)
- **Morgan** (v1.10.1): HTTP request logger
- **Node.js** (v16 or higher recommended, v18+ for optimal performance)

### Production-Ready Features
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

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB (local or remote instance)

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
   
   # MongoDB Configuration
   MONGO_URI=mongodb://localhost:27017/your-database
   
   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=400
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```
express-app/
├── src/
│   ├── helpers/              # Database and utility connections
│   │   └── connectDb.ts      # MongoDB connection with event handlers
│   ├── middlewares/          # Custom middleware
│   │   ├── errorMiddleware.ts    # Error handling middleware
│   │   ├── responseHandler.ts    # Success & Error response classes
│   │   └── tryCatch.ts       # Async error wrapper
│   ├── routes/               # Route definitions
│   │   ├── index.ts          # Main router
│   │   ├── api.routes.ts     # API routes
│   │   └── health.routes.ts  # Health check routes
│   ├── utils/                # Utility functions
│   │   ├── envConfig.ts      # Environment configuration
│   │   └── gracefulShutdown.ts   # Shutdown handler
│   └── index.ts              # Application entry point
├── dist/                     # Compiled JavaScript (generated)
├── env.example               # Environment variables template
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
  const user = await User.findById(req.params.id);
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
    "id": 1,
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

#### Status Codes
```typescript
// 200 OK - Success
new SuccessResponse("Operation successful", data).send(res);

// 201 Created - Resource created
new SuccessResponse("User created", newUser, 201).send(res);

// 400 Bad Request
throw new ErrorResponse("Invalid input", 400);

// 404 Not Found
throw new ErrorResponse("Resource not found", 404);

// 500 Internal Server Error
throw new ErrorResponse("Server error", 500);
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
| `MONGO_URI` | MongoDB connection string | - | Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `localhost:3000,localhost:3001` | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 min) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `400` | No |

---

## 💻 Usage Examples

### Creating a New Route

```typescript
import { Router } from "express";
import asyncHandler from "../middlewares/tryCatch.js";
import { SuccessResponse, ErrorResponse } from "../middlewares/responseHandler.js";

const router = Router();

router.get("/users/:id", asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }
  
  return new SuccessResponse("User found", user).send(res);
}));

export default router;
```

### Pagination Example

```typescript
router.get("/posts", asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const posts = await Post.find()
    .skip((page - 1) * limit)
    .limit(limit);
  
  const total = await Post.countDocuments();
  
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

---

## 🛡️ Security Features

- **Helmet.js**: Sets security-related HTTP headers
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Rate Limiting**: Prevents brute-force attacks (400 requests per 15 minutes)
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
2. Close database connections
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

# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Paginated posts
curl http://localhost:5000/api/posts?page=1&limit=5

# Error handling
curl http://localhost:5000/api/error
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
EXPOSE 5000
CMD ["npm", "start"]
```

> **Note**: Using Node.js 20 LTS for better performance and long-term support. Compatible with Node.js 18+.

### Environment Setup
- Set `NODE_ENV=production`
- Use environment-specific `.env` files
- Ensure MongoDB and other services are accessible

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload (tsx + nodemon) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server |
| `npm run clean` | Remove build artifacts |

---

## 🏗️ Architecture Highlights

### Middleware Stack
```
Request
  ↓
Security (Helmet)
  ↓
Rate Limiting
  ↓
Logging (Morgan)
  ↓
Compression
  ↓
Body Parsing
  ↓
CORS
  ↓
Routes
  ↓
asyncHandler (catches errors)
  ↓
Route Handler
  ├─→ Success → SuccessResponse.send(res) → Client ✅
  └─→ Error → throw ErrorResponse → errorMiddleware → Client ❌
```

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).

---

## 🙏 Acknowledgments

Built with best practices from the Node.js and Express.js communities.

---

## 📞 Support

If you encounter any issues:
1. Check the README.md for documentation
2. Verify your `.env` file is properly configured
3. Check the logs for detailed error messages
4. Ensure MongoDB is running and accessible

---

**Happy Coding! 🎉**
