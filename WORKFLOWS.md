# Workflow Configuration Guide

## Overview

SpeakOps includes 4 pre-built workflows that transform voice notes into actionable outputs. Each workflow can be activated by setting the `X-Workflow-Type` header in your API request.

## Available Workflows

### 1. Blog Post Generation (`blog_post`)

Converts voice notes into SEO-optimized blog posts and publishes to WordPress.

**Configuration:**
```bash
WORDPRESS_URL=https://yoursite.com
WORDPRESS_TOKEN=your_wordpress_application_password
```

**How to get WordPress token:**
1. WordPress admin → Users → Profile
2. Scroll to "Application Passwords"
3. Create new password
4. Use format: `username:password` as Bearer token

**Example request:**
```bash
curl -X POST "http://localhost:3000/api/speakspace-action" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Workflow-Type: blog_post" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "I want to talk about the benefits of automation...",
    "note_id": "note123",
    "timestamp": "2025-12-12T10:00:00Z"
  }'
```

### 2. Task Extraction (`task_extraction`)

Extracts action items from voice notes and creates tasks in Notion.

**Configuration:**
```bash
NOTION_TOKEN=secret_xxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**How to get Notion credentials:**
1. Create integration at https://www.notion.so/my-integrations
2. Copy "Internal Integration Token"
3. Share your database with the integration
4. Copy database ID from database URL

**Example request:**
```bash
curl -X POST "http://localhost:3000/api/speakspace-action" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Workflow-Type: task_extraction" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Need to review the proposal by Friday and schedule a team meeting next week",
    "note_id": "note124",
    "timestamp": "2025-12-12T10:00:00Z"
  }'
```

### 3. Meeting Notes (`meeting_notes`)

Converts meeting voice notes into structured action items in Asana.

**Configuration:**
```bash
ASANA_TOKEN=your_personal_access_token
ASANA_WORKSPACE_ID=your_workspace_gid
```

**How to get Asana credentials:**
1. Asana → Settings → Apps → Personal access tokens
2. Create token
3. Get workspace ID from Asana API console or workspace URL

**Example request:**
```bash
curl -X POST "http://localhost:3000/api/speakspace-action" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Workflow-Type: meeting_notes" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "In today meeting we decided to launch the new feature on December 20th...",
    "note_id": "note125",
    "timestamp": "2025-12-12T10:00:00Z"
  }'
```

### 4. Email Draft (`email_draft`)

Converts voice notes into professional email format.

**No configuration needed** - outputs formatted email text.

**Example request:**
```bash
curl -X POST "http://localhost:3000/api/speakspace-action" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Workflow-Type: email_draft" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "I need to follow up with the client about the contract terms...",
    "note_id": "note126",
    "timestamp": "2025-12-12T10:00:00Z"
  }'
```

## Adding Custom Workflows

Create a new workflow in `src/workflows/index.js`:

```javascript
export async function workflowCustom(prompt, noteId) {
  // 1. Apply template
  const enrichedPrompt = applyTemplate(YOUR_TEMPLATE, { PROMPT: prompt });
  
  // 2. Call LLM or processing logic
  const result = await processWithLLM(enrichedPrompt);
  
  // 3. Perform actions (API calls, DB writes, etc.)
  await performActions(result);
  
  return { noteId, workflowType: "custom", result };
}
```

Add to router in `routeWorkflow()`:
```javascript
case "custom":
  return await workflowCustom(prompt, noteId);
```

## Default Workflow

Set a default workflow type via environment variable:
```bash
DEFAULT_WORKFLOW=blog_post
```

If no `X-Workflow-Type` header is provided, the default will be used (or "generic" if not set).

## Testing Workflows

Use the provided test script:
```powershell
.\test-api.ps1
```

Or manually test each workflow with curl commands from this guide.
