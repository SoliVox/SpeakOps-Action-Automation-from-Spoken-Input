import { logger } from "../utils/logger.js";

/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  // Log the error
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json({
    status: "error",
    message: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

/**
 * Custom error class for workflow processing errors
 */
export class WorkflowError extends Error {
  constructor(message, statusCode = 422) {
    super(message);
    this.name = "WorkflowError";
    this.statusCode = statusCode;
  }
}
