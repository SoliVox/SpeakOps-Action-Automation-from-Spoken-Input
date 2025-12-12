# SpeakOps Architecture

## System Flow

```
┌─────────────────┐
│  SpeakSpace App │
│   (Mobile)      │
└────────┬────────┘
         │ POST /api/speakspace-action
         │ { prompt, note_id, timestamp }
         │ Authorization: Bearer <token>
         │
         ▼
┌─────────────────────────────────────────┐
│        API Gateway / Auth Layer         │
│  - Validate Bearer/x-api-key            │
│  - Rate limiting (60/min)               │
│  - JSON schema validation (Zod)         │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│      Processing Service (Node.js)       │
│  1. Parse prompt + note_id              │
│  2. Apply template transformation       │
│  3. Call LLM/NLP (optional)             │
│  4. Execute workflow logic              │
└────────┬────────────────────────────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         │              │              │              │
         ▼              ▼              ▼              ▼
    ┌────────┐    ┌─────────┐   ┌─────────┐   ┌──────────┐
    │Database│    │WordPress│   │  Notion │   │  Asana   │
    │ Logs   │    │   API   │   │   API   │   │   API    │
    └────────┘    └─────────┘   └─────────┘   └──────────┘
         │
         ▼
┌─────────────────┐
│  Return JSON    │
│  { status: ... }│
└─────────────────┘
```

## Components

### 1. API Layer (`src/server.js`)
- Express.js REST endpoint
- Auth middleware (Bearer/x-api-key)
- Rate limiting (express-rate-limit)
- Payload validation (Zod schema)

### 2. Processing Logic
- `processPrompt()`: Template application, LLM calls
- `doSideEffects()`: Downstream integrations

### 3. Deployment Options
- **Containerized**: Docker → Cloud Run / ECS / Render
- **Serverless**: Vercel Functions / AWS Lambda
- **Traditional**: Heroku / Railway

## Security
- Env-based secrets (`.env`)
- HTTPS/TLS enforcement
- Request validation
- Rate limiting
- PII redaction in logs
