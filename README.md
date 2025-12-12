# SpeakOps-Action-Automation-from-Spoken-Input

SpeakOps transforms spoken voice notes into automated actions. Using a custom SpeakSpace Action, it processes note text, extracts key details, and triggers workflows like task updates, content generation, or system actions—turning everyday speech into fast, efficient automation.

## Step-by-step implementation guide — SpeakSpace Custom Action

The sequence below takes you from idea to working demo and submission-ready deliverables.

### 1) High-level architecture
- **Mobile (SpeakSpace)**: user selects an action and a voice note; the app POSTs `{ prompt, note_id, timestamp }` to your API.
- **API Gateway/Auth**: validates auth (Bearer token or x-api-key) and forwards to processing.
- **Processing Service**: fetches note/transcript, applies prompt template, triggers workflows (DB updates, HTTP calls, publishing, task creation, etc.).
- **Optional**: transcription (Whisper/STS), LLM/NLP for summarization/extraction, storage for logs/audit, webhooks to WordPress/Notion/Asana.
- **Response**: minimal JSON `{ status, message }`; keep details in internal logs.

### 2) API contract
**Request (SpeakSpace -> your API)**

`POST /api/speakspace-action`

Headers:
- `Content-Type: application/json`
- `Authorization: Bearer <token>` **or** `x-api-key: <key>`

Body:
```json
{
	"prompt": "Your configured instruction + note text",
	"note_id": "unique_identifier",
	"timestamp": "2025-12-09T14:22:33Z"
}
```

**Success response**
```json
{"status":"success","message":"Workflow executed"}
```

**Errors**
- 400 invalid payload
- 401/403 auth failure
- 422 processing error (e.g., transcription failed)
- 500 internal error (log details internally, keep response minimal)

### 3) Minimal Node.js/Express example
```js
// index.js
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch"; // or native fetch in Node 18+
import rateLimit from "express-rate-limit";

const app = express();
app.use(bodyParser.json());

// simple header auth - config via ENV
const API_KEY = process.env.SS_API_KEY || "replace_me";

const limiter = rateLimit({ windowMs: 60_000, max: 60 });
app.use(limiter);

function checkAuth(req, res, next) {
	const bearer = req.header("Authorization");
	const apiKey = req.header("x-api-key");
	if ((bearer && bearer.startsWith("Bearer ")) || apiKey === API_KEY) {
		return next();
	}
	return res.status(401).json({ status: "error", message: "Unauthorized" });
}

app.post("/api/speakspace-action", checkAuth, async (req, res) => {
	try {
		const { prompt, note_id, timestamp } = req.body;
		if (!prompt || !note_id || !timestamp) {
			return res.status(400).json({ status: "error", message: "Missing fields" });
		}

		// 1) Optionally fetch raw audio or transcript using note_id
		// 2) Run NLP/LLM pipeline
		const processed = await processPrompt(prompt, note_id);

		// 3) Perform side effects (DB write / post to WordPress / create tasks)
		// await doSideEffects(processed);

		return res.status(200).json({ status: "success", message: "Workflow executed" });
	} catch (err) {
		console.error("Processing error:", err);
		return res.status(500).json({ status: "error", message: "Internal server error" });
	}
});

async function processPrompt(prompt, note_id) {
	// stub: enrich prompt (transcription, templates, LLM)
	return { note_id, prompt_snippet: prompt.slice(0, 200) };
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server ready on", port));
```

Notes: keep secrets in env, add structured logging/monitoring, retry/backoff downstream calls.

### 4) Prompt template best practices
- Use persistent templates with `$PROMPT` placeholder.
- Example (voice -> WordPress blog):
	- Template: `Convert the following voice note into a 600–800 word SEO-friendly blog post with H2 headings and a meta description: $PROMPT`
- Extractive/structured tasks: request JSON output, e.g. `[{"task":"...","owner":"...","due":"YYYY-MM-DD"}]`.

### 5) SpeakSpace configuration example
- **Title**: Publish to WordPress
- **Description**: Convert voice note into a formatted blog post and draft on WordPress.
- **Prompt Template**: `Convert the following voice note into a 600–800 word SEO-friendly blog post with H2 headings and a meta description: $PROMPT`
- **Notes Selector**: user chooses
- **API URL**: `https://yourservice.com/api/speakspace-action`
- **Auth**: `Authorization: Bearer <token>` or `x-api-key: <key>`

**cURL test**
```bash
curl -X POST "https://yourservice.com/api/speakspace-action" \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer $MY_TOKEN" \
 -d '{"prompt":"This is my note text...", "note_id":"abc123", "timestamp":"2025-12-09T14:22:33Z"}'
```

### 6) Security and operational hygiene
- Prefer Bearer tokens or HMAC signed payloads; rotate keys, keep secrets in env/secret manager.
- Rate-limit public endpoints; enforce HTTPS/TLS.
- Strict JSON schema validation; redact PII in logs; keep idempotency keys and replay protection (timestamp skew + seen set on note_id).
- Add health checks and minimal surface area; least-privilege credentials.

### 7) Workflow examples
- WordPress publishing: transcribe -> LLM -> WordPress REST draft.
- Task creation (Asana/Notion): extract JSON actions -> create tasks -> return confirmation.
- Medication reminder: extract medication + schedule -> create calendar/reminder entries.
- Accessibility audit: spoken site description -> checklist JSON -> email stakeholder.

### 8) Testing and QA
- Unit: `processPrompt`, schema validation.
- Integration: POST sample notes (SpeakSpace-like payloads), assert 200 + side effects.
- E2E: simulate mobile flow via curl/Postman; include auth success/failure paths.
- Error-path tests: transcription fail, 3rd-party API error, auth failure.
- Observability: structured logs, Sentry, Prometheus metrics.

### 9) Deployment and infra
- Containerize (Docker). Host on Render/Heroku/Vercel (serverless)/Cloud Run/ECS.
- Managed secrets (AWS/GCP Secret Manager). HTTPS behind CDN (Cloudflare).
- Health/readiness endpoints; stateless workers; consider queue if heavy LLM/transcription.

### 10) Documentation and demo materials
- README: setup, env vars, run, test, endpoints.
- Architecture diagram (PNG or ASCII) and short demo script (curl + expected output).
- 1–2 minute video: mobile selection -> server logs -> final result (WordPress draft/Notion task).
- Security notes: auth, logging/redaction policy.
- Open-source list: libs/frameworks used and why.

### 11) Judging criteria mapping
- Innovation & complexity: unique use-case, context-aware prompts, multi-step automation, ML/NLP usage.
- Real-world viability: scalable design, clear user flow, adoption point.
- Technical execution: clean code, error handling, tests, security.
- Open-source usage: sensible frameworks (Whisper, Express, fetch, etc.).
- Documentation & presentation: README, demo video, easy reproduction steps.

### 12) Suggested deliverables
- Repo link with code and README, sample env file.
- Demo video (1–2 minutes).
- Architecture/flow diagram.
- One-page rubric mapping.
- Optional: live demo URL + short-lived test credentials.

### 13) Quick submission checklist
- API 200 on happy path.
- Auth works and documented.
- Template examples in README.
- Tests + sample curl included.
- Demo video ready highlighting workflow.
- Rubric mapping prepared.
