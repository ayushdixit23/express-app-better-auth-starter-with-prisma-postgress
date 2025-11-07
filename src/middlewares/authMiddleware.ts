import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import auth from "../lib/auth.js";
import { ErrorResponse } from "./responseHandler.js";

/**
 * Middleware to authenticate user using Better Auth session₹
 * Attaches user data to req.user if authenticated
 * 
 * @throws {ErrorResponse} 401 - If authentication fails
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if authorization header or cookie exists
    const authHeader = req.headers.authorization;
    const cookies = req.headers.cookie;
    
    if (!authHeader && !cookies) {
      throw new ErrorResponse(
        "Authentication required. Please provide valid credentials.",
        401
      );
    }

    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // Check if session exists
    if (!session) {
      throw new ErrorResponse(
        "Your session has expired or is invalid. Please sign in again.",
        401
      );
    }

    // Check if user exists in session
    if (!session.user) {
      throw new ErrorResponse(
        "Session is invalid. Please sign in again.",
        401
      );
    }

    // Attach user data to request
    (req as any).user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || null,
    };

    next();
  } catch (error) {
    if (error instanceof ErrorResponse) {
      next(error);
      return;
    }
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes("jwt")) {
        next(new ErrorResponse("Invalid authentication token. Please sign in again.", 401));
        return;
      }
      
      if (error.message.includes("expired")) {
        next(new ErrorResponse("Your session has expired. Please sign in again.", 401));
        return;
      }
    }

    // Default error response
    next(new ErrorResponse(
      "Authentication failed. Please try signing in again.",
      401
    ));
  }
};

/**
 * Optional authentication middleware
 * Attaches user data if authenticated, but doesn't block unauthenticated requests
 * Useful for routes that work for both authenticated and unauthenticated users
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {   
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session?.user) {
      (req as any).user =   {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || null,
      };
    }

    next();
  } catch (error) {
    next();
  }
};
