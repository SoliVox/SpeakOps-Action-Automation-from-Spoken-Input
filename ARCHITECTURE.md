# How SpeakOps Works

## The Flow

Pretty straightforward: SpeakSpace sends voice notes → our API processes them → GPT-4 does the magic → we send it to wherever you need (WordPress, Notion, etc).

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

## Main Parts

**API Layer** (`src/server.js`)
- Express handles requests
- Auth checks (Bearer token or x-api-key)
- Rate limiting so nobody ddos's us
- Validates payloads with Zod

**Processing**
- `processPrompt()` - templates + GPT-4 calls
- `doSideEffects()` - sends stuff to other services

**Deployment**
- Docker works anywhere (Cloud Run, ECS, Render)
- Serverless options (Vercel, Lambda)
- Regular hosting (Heroku, Railway)

## Security Stuff
- Secrets in `.env` (never commit these)
- HTTPS everywhere
- Validates all requests
- Rate limits to prevent abuse
- Redacts sensitive info from logs
