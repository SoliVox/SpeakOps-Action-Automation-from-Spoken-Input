import Joi from "joi";
import { logger } from "../utils/logger.js";

// Define the schema for SpeakSpace action requests
const speakspaceActionSchema = Joi.object({
  prompt: Joi.string().required().min(1).max(50000),
  note_id: Joi.string().required().min(1).max(255),
  timestamp: Joi.string().isoDate().required(),
}).unknown(false); // Reject unknown fields

/**
 * Validation middleware for SpeakSpace action requests
 */
export function validateRequest(req, res, next) {
  const { error, value } = speakspaceActionSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorDetails = error.details.map((detail) => detail.message);
    
    logger.warn("Request validation failed", {
      errors: errorDetails,
      body: req.body,
    });

    return res.status(400).json({
      status: "error",
      message: "Invalid request payload",
      errors: errorDetails,
    });
  }

  // Replace body with validated and sanitized value
  req.body = value;
  next();
}

/**
 * Check timestamp validity (prevent replay attacks)
 * Ensures timestamp is within acceptable time window (e.g., ±5 minutes)
 */
export function validateTimestamp(timestamp, maxSkewMs = 300000) {
  const now = Date.now();
  const requestTime = new Date(timestamp).getTime();
  const skew = Math.abs(now - requestTime);

  if (skew > maxSkewMs) {
    throw new Error(`Timestamp skew too large: ${skew}ms (max: ${maxSkewMs}ms)`);
  }

  return true;
}
