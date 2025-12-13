# SpeakOps-Action-Automation-from-Spoken-Input

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-blue.svg)](https://openai.com)

SpeakOps transforms spoken voice notes into automated actions. Using a custom SpeakSpace Action, it processes note text, extracts key details, and triggers workflows like task updates, content generation, or system actions—turning everyday speech into fast, efficient automation.

**� Live Demo**: https://speakops-action-automation-from-spoken.onrender.com

## Quick Test 

Just open the **[live web interface](https://speakops-action-automation-from-spoken.onrender.com)** - no setup needed!

Try these workflows:
- **Blog Post** - throw an idea at it, get a full article back
- **Task Extractor** - paste meeting notes, extract actionable tasks
- **Meeting Notes** - transform messy transcripts into clean summaries  
- **Email Draft** - voice ideas → polished professional emails

### Want to test the API directly?
```bash
# Check if it's alive
curl https://speakops-action-automation-from-spoken.onrender.com/health

# Generate a blog post using GPT-4
curl -X POST "https://speakops-action-automation-from-spoken.onrender.com/api/speakspace-action" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo_secret_key_12345" \
  -H "X-Workflow-Type: blog_post" \
  -d '{
    "prompt": "Write about AI automation in content creation",
    "note_id": "judge_test_123",
    "timestamp": "2025-01-15T10:30:00Z"
  }'
```

### SpeakSpace Config (Copy-Paste Ready)
Just drop this into the SpeakSpace app:

```json
{
  "name": "SpeakOps Blog Generator",
  "method": "POST",
  "url": "https://speakops-action-automation-from-spoken.onrender.com/api/speakspace-action",
  "headers": {
    "Authorization": "Bearer demo_secret_key_12345",
    "X-Workflow-Type": "blog_post",
    "Content-Type": "application/json"
  },
  "body": {
    "prompt": "{{note_text}}",
    "note_id": "{{note_id}}",
    "timestamp": "{{timestamp}}"
  }
}
```

**Workflows**: `blog_post`, `task_extraction`, `meeting_notes`, `email_draft`

---

## Setup

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
| `OPENAI_API_KEY` | Recommended | - | OpenAI API key for LLM processing |
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

**Note**: Without `OPENAI_API_KEY`, workflows return mock responses. Get your API key at https://platform.openai.com/api-keys

## What It Does

4 workflows built-in (use the `X-Workflow-Type` header):

- **blog_post** - voice note → SEO blog post → WordPress
- **task_extraction** - voice note → extract tasks → Notion
- **meeting_notes** - voice note → clean notes → Asana
- **email_draft** - voice ideas → professional email

Just set the right env vars and you're good (check `.env.example`).

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

## More Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) - how everything works
- [DEPLOYMENT.md](./DEPLOYMENT.md) - deploy to various platforms

## Contributing

Issues and pull requests welcome! See [GitHub repository](https://github.com/SoliVox/SpeakOps-Action-Automation-from-Spoken-Input).

---

Built with Express + Zod + OpenAI GPT-4 • Deployed on Render • Made for SpeakSpace Hackathon
