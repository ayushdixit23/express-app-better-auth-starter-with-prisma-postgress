import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from './responseHandler.js';

export const errorMiddleware = (
  err: Error | ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Convert to ErrorResponse if it's a generic error
  if (!(err instanceof ErrorResponse)) {
    err = new ErrorResponse(err.message || 'Internal Server Error', 500);
  }

  // Log the error (for debugging or tracking purposes)
  console.error(err);

  // Send error response using ErrorResponse properties
  const errorResponse = err as ErrorResponse;
  
  res.status(errorResponse.statusCode).json({
    success: errorResponse.success,
    message: errorResponse.message,
    statusCode: errorResponse.statusCode,
    ...(errorResponse.data && { data: errorResponse.data })
  });
};
