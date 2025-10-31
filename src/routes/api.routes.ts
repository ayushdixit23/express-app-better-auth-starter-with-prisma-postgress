import { Router, Request, Response } from "express";
import asyncHandler from "../middlewares/tryCatch.js";
import { SuccessResponse, ErrorResponse } from "../middlewares/responseHandler.js";

const router = Router();

/**
 * Sample data endpoint
 * GET /api/data
 */
router.get("/data", asyncHandler(async (_req: Request, res: Response) => {
  const data = {
    timestamp: new Date().toISOString(),
    info: "Sample data from server"
  };
  
  return new SuccessResponse("Data retrieved successfully", data).send(res);
}));

/**
 * Error demonstration endpoint
 * GET /api/error
 */
router.get("/error", asyncHandler(async (_req: Request, res: Response) => {
  // Throw error for demonstration
  throw new ErrorResponse("Something went wrong!", 400);
}));

/**
 * Sample async database query endpoint
 * GET /api/query
 */
router.get(
  "/query",
  asyncHandler(async (_req: Request, res: Response) => {
    // Simulate database query delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    const data = {
      id: 1,
      name: "Sample Data",
      timestamp: new Date().toISOString()
    };

    return new SuccessResponse("Data fetched from database", data).send(res);
  })
);

/**
 * Create resource example (201 Created)
 * POST /api/users
 */
router.post(
  "/users",
  asyncHandler(async (req: Request, res: Response) => {
    // Simulate user creation
    const newUser = {
      id: Math.floor(Math.random() * 1000),
      name: req.body.name || "John Doe",
      email: req.body.email || "john@example.com",
      createdAt: new Date().toISOString()
    };

    return new SuccessResponse("User created successfully", newUser, 201).send(res);
  })
);

/**
 * Paginated data example
 * GET /api/posts?page=1&limit=10
 */
router.get(
  "/posts",
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Simulate paginated data
    const posts = Array.from({ length: limit }, (_, i) => ({
      id: (page - 1) * limit + i + 1,
      title: `Post ${(page - 1) * limit + i + 1}`,
      content: "Sample post content",
      author: "Admin"
    }));

    const total = 100; // Simulate total records
    const totalPages = Math.ceil(total / limit);

    const responseData = {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    };

    return new SuccessResponse("Posts retrieved successfully", responseData).send(res);
  })
);

/**
 * Delete resource example
 * DELETE /api/users/:id
 */
router.delete(
  "/users/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ID
    if (!id || parseInt(id) <= 0) {
      throw new ErrorResponse("Invalid user ID", 400);
    }

    // Simulate deletion
    // In real app: await User.deleteOne({ _id: id })

    return new SuccessResponse(`User with ID ${id} deleted successfully`).send(res);
  })
);

/**
 * Update resource example
 * PUT /api/users/:id
 */
router.put(
  "/users/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ID
    if (!id || parseInt(id) <= 0) {
      throw new ErrorResponse("Invalid user ID", 400);
    }

    // Simulate update
    const updatedUser = {
      id: parseInt(id),
      name: req.body.name || "Updated Name",
      email: req.body.email || "updated@example.com",
      updatedAt: new Date().toISOString()
    };

    return new SuccessResponse("User updated successfully", updatedUser).send(res);
  })
);

/**
 * Statistics example
 * GET /api/stats
 */
router.get(
  "/stats",
  asyncHandler(async (_req: Request, res: Response) => {
    const stats = {
      totalUsers: 1250,
      activeUsers: 876,
      totalPosts: 3421,
      totalComments: 8765,
      generatedAt: new Date().toISOString()
    };

    return new SuccessResponse("Statistics retrieved successfully", stats).send(res);
  })
);

export default router;
