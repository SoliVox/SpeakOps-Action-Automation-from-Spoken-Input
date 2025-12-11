import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { logger } from "./utils/logger.js";
import { checkAuth } from "./middleware/auth.js";
import { validateRequest } from "./middleware/validation.js";
import { processWorkflow } from "./services/workflowProcessor.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 60,
  message: { status: "error", message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Main SpeakSpace action endpoint
app.post("/api/speakspace-action", checkAuth, validateRequest, async (req, res) => {
  const startTime = Date.now();
  const { prompt, note_id, timestamp } = req.body;

  logger.info("Received SpeakSpace action request", {
    note_id,
    timestamp,
    prompt_length: prompt?.length,
  });

  try {
    // Process the workflow
    const result = await processWorkflow({
      prompt,
      note_id,
      timestamp,
    });

    const duration = Date.now() - startTime;
    logger.info("Workflow executed successfully", {
      note_id,
      duration_ms: duration,
      workflow_type: result.workflow_type,
    });

    return res.status(200).json({
      status: "success",
      message: "Workflow executed",
      data: result.summary || null,
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.error("Workflow processing error", {
      note_id,
      duration_ms: duration,
      error: err.message,
      stack: err.stack,
    });

    if (err.statusCode) {
      return res.status(err.statusCode).json({
        status: "error",
        message: err.message,
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found",
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`SpeakSpace Action API server started`, {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

export default app;
