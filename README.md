# SpeakOps-Action-Automation-from-Spoken-Input

SpeakOps transforms spoken voice notes into automated actions. Using a custom SpeakSpace Action, it processes note text, extracts key details, and triggers workflows like task updates, content generation, or system actions—turning everyday speech into fast, efficient automation.

## Quick Start

```bash
# Clone and install
git clone https://github.com/SoliVox/SpeakOps-Action-Automation-from-Spoken-Input.git
cd SpeakOps-Action-Automation-from-Spoken-Input
npm install

# Configure environment
cp .env.example .env
# Edit .env and set SS_API_KEY=your-secret-key

# Start server
npm run dev    # development (auto-reload)
npm start      # production
```

Server runs on `http://localhost:3000`

## API Endpoints

### Health Check
```bash
curl http://localhost:3000/health
# Response: {"status":"ok"}
```

### Metrics
```bash
curl http://localhost:3000/metrics
# Response: {"counters":{...},"uptime":123.45,"memory":{...}}
```

### Process Voice Note
```bash
curl -X POST "http://localhost:3000/api/speakspace-action" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Workflow-Type: blog_post" \
  -d '{
    "prompt": "Convert this to a blog post",
    "note_id": "abc123",
    "timestamp": "2025-12-09T14:22:33Z"
  }'
```

**Workflow Types**: `blog_post`, `task_extraction`, `meeting_notes`, `email_draft`, or omit for generic processing.

## SpeakSpace Configuration

- **API URL**: `https://your-deployment.com/api/speakspace-action`
- **Auth Header**: `Authorization: Bearer YOUR_API_KEY` or `x-api-key: YOUR_API_KEY`
- **Prompt Template**: `Convert the following voice note into a 600–800 word SEO-friendly blog post: $PROMPT`

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design and flow diagrams.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for platform-specific deployment guides (Render, Heroku, Cloud Run, Vercel).

## Testing

Run the PowerShell test suite:
```powershell
.\test-api.ps1
```

Or manual curl tests:
```bash
# Auth failure (401)
curl -X POST "http://localhost:3000/api/speakspace-action" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","note_id":"123","timestamp":"2025-12-09T14:22:33Z"}'

# Validation failure (400)
curl -X POST "http://localhost:3000/api/speakspace-action" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"missing fields"}'
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SS_API_KEY` | Yes | - | API authentication key |
| `PORT` | No | 3000 | Server port |
| `RATE_LIMIT_PER_MIN` | No | 60 | Max requests per minute |
| `DEFAULT_WORKFLOW` | No | generic | Default workflow type |
| `LOG_FILE` | No | - | Path to log file (optional) |
| `WORDPRESS_URL` | No | - | WordPress site URL |
| `WORDPRESS_TOKEN` | No | - | WordPress auth token |
| `NOTION_TOKEN` | No | - | Notion integration token |
| `NOTION_DATABASE_ID` | No | - | Notion database ID |
| `ASANA_TOKEN` | No | - | Asana access token |
| `ASANA_WORKSPACE_ID` | No | - | Asana workspace ID |

## Built-in Workflows

The system includes 4 pre-built workflows you can activate via `X-Workflow-Type` header:

1. **blog_post** - Voice → SEO-optimized blog post → WordPress draft
2. **task_extraction** - Voice → Extract tasks → Create in Notion
3. **meeting_notes** - Voice → Structured notes → Asana tasks
4. **email_draft** - Voice → Professional email format

Configure the integrations via environment variables (see `.env.example`).

## Workflow Integration Examples

### WordPress Publishing
Add to `doSideEffects()`:
```javascript
const response = await fetch('https://yoursite.com/wp-json/wp/v2/posts', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer WP_TOKEN', 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Title', content: processed.promptSnippet, status: 'draft' })
});
```

### Notion Task Creation
```javascript
await fetch('https://api.notion.com/v1/pages', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer NOTION_TOKEN', 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
  body: JSON.stringify({ parent: { database_id: 'DB_ID' }, properties: { Name: { title: [{ text: { content: 'Task' } }] } } })
});
```

## Tech Stack

- **Express** - Web framework
- **Zod** - Schema validation
- **express-rate-limit** - Rate limiting
- **dotenv** - Environment configuration

## License

MIT - see [LICENSE](./LICENSE)

## Submission Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guides
- [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md) - Hackathon checklist
