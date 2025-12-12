import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import { z } from "zod";

const app = express();
app.use(bodyParser.json());

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
  const bearer = req.header("Authorization");
  const apiKey = req.header("x-api-key");
  const bearerToken = bearer?.startsWith("Bearer ") ? bearer.slice(7) : null;
  const provided = bearerToken || apiKey;
  if (!API_KEY) {
    console.warn("API key not configured; rejecting request");
    return res.status(500).json({ status: "error", message: "Server auth not configured" });
  }
  if (provided && provided === API_KEY) return next();
  return res.status(401).json({ status: "error", message: "Unauthorized" });
}

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/api/speakspace-action", checkAuth, async (req, res) => {
  try {
    const parsed = payloadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: "error", message: "Invalid payload", details: parsed.error.issues });
    }
    const { prompt, note_id, timestamp } = parsed.data;

    const processed = await processPrompt(prompt, note_id, timestamp);
    await doSideEffects(processed);

    return res.status(200).json({ status: "success", message: "Workflow executed" });
  } catch (err) {
    console.error("Processing error:", err);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

async function processPrompt(prompt, noteId, timestamp) {
  // placeholder for LLM/transcription/template logic
  return {
    noteId,
    timestamp,
    promptSnippet: prompt.slice(0, 200),
  };
}

async function doSideEffects(processed) {
  // stub: write to DB, call WordPress/Notion/Asana APIs, enqueue jobs, etc.
  void processed;
}

app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Server ready on http://localhost:${PORT}`);
});
