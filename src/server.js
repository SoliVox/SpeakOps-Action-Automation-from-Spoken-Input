import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { logger, requestLogger, metrics } from "./middleware/logger.js";
import { routeWorkflow } from "./workflows/index.js";

const app = express();
app.use(express.json());
app.use(requestLogger(logger));

const API_KEY = process.env.SS_API_KEY || "";
const PORT = process.env.PORT || 3000;
const RATE_LIMIT_PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN || 60);

const limiter = rateLimit({
  windowMs: 60_000,
  max: RATE_LIMIT_PER_MIN,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const payloadSchema = z.object({
  prompt: z.string().min(1),
  note_id: z.string().min(1),
  timestamp: z.string().datetime(),
});

function checkAuth(req, res, next) {
  const auth = req.header("Authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : req.header("x-api-key");
  
  if (!API_KEY) return res.status(500).json({ status: "error", message: "Server auth not configured" });
  if (token === API_KEY) return next();
  
  res.status(401).json({ status: "error", message: "Unauthorized" });
}

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/metrics", (_req, res) => res.json(metrics.getMetrics()));

app.post("/api/speakspace-action", checkAuth, async (req, res) => {
  const startTime = Date.now();
  metrics.increment("requests.total");
  
  try {
    const { success, data, error } = payloadSchema.safeParse(req.body);
    if (!success) {
      metrics.increment("requests.validation_failed");
      logger.warn("Validation failed", { errors: error.issues });
      return res.status(400).json({ status: "error", message: "Invalid payload", details: error.issues });
    }

    logger.info("Processing voice note", { note_id: data.note_id });
    
    // Get workflow type from header or default to generic
    const workflowType = req.header("X-Workflow-Type") || process.env.DEFAULT_WORKFLOW || "generic";
    
    const processed = await routeWorkflow(workflowType, data.prompt, data.note_id, data.timestamp);
    
    metrics.increment("requests.success");
    const duration = Date.now() - startTime;
    logger.info("Workflow completed", { note_id: data.note_id, duration: `${duration}ms`, workflowType });

    res.json({ status: "success", message: "Workflow executed", result: processed });
  } catch (err) {
    metrics.increment("requests.error");
    logger.error("Processing error", { error: err.message, stack: err.stack });
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

app.use((req, res) => res.status(404).json({ status: "error", message: "Not found" }));

app.listen(PORT, () => logger.info(`Server ready on http://localhost:${PORT}`))
  .on("error", (err) => {
    logger.error("Server error", { error: err.message });
    process.exit(1);
  });
