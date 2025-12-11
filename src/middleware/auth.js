import { logger } from "../utils/logger.js";

const API_KEY = process.env.SS_API_KEY;
const BEARER_PREFIX = "Bearer ";

/**
 * Authentication middleware
 * Supports both Bearer token and x-api-key header authentication
 */
export function checkAuth(req, res, next) {
  const authHeader = req.header("Authorization");
  const apiKey = req.header("x-api-key");

  // Check Bearer token
  if (authHeader && authHeader.startsWith(BEARER_PREFIX)) {
    const token = authHeader.substring(BEARER_PREFIX.length);
    if (token === API_KEY) {
      logger.debug("Authentication successful via Bearer token");
      return next();
    }
  }

  // Check API key header
  if (apiKey === API_KEY) {
    logger.debug("Authentication successful via API key");
    return next();
  }

  // Authentication failed
  logger.warn("Unauthorized access attempt", {
    ip: req.ip,
    path: req.path,
    has_auth_header: !!authHeader,
    has_api_key: !!apiKey,
  });

  return res.status(401).json({
    status: "error",
    message: "Unauthorized - Invalid or missing credentials",
  });
}

/**
 * Optional: JWT-based authentication (for future enhancement)
 */
export function verifyJWT(token) {
  // Implement JWT verification if needed
  // import jwt from 'jsonwebtoken';
  // return jwt.verify(token, process.env.JWT_SECRET);
  throw new Error("JWT verification not yet implemented");
}
