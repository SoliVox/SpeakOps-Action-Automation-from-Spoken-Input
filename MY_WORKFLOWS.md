# My Custom Workflows

## Creating Your Own Workflow

This guide shows how to add custom workflows to SpeakOps.

## Existing Workflows

1. **blog_post** - Generate SEO blog posts
2. **task_extraction** - Extract tasks from notes
3. **meeting_notes** - Summarize meetings
4. **email_draft** - Create professional emails

## Adding a New Workflow

### Step 1: Add Workflow Function

Edit `src/workflows/index.js` and add your workflow function:

```javascript
export async function workflowMyCustom(prompt, noteId) {
  // Apply your custom template
  const enrichedPrompt = `Process this input: ${prompt}`;
  
  // Call GPT-4
  const result = await callOpenAI(enrichedPrompt, {
    systemPrompt: "Your custom instructions here",
    maxTokens: 1500,
  });
  
  // Process and return
  return { 
    noteId, 
    workflowType: "my_custom", 
    result: result 
  };
}
```

### Step 2: Register in Router

Add to the `routeWorkflow` function in `src/workflows/index.js`:

```javascript
export async function routeWorkflow(workflowType, prompt, noteId, timestamp) {
  switch (workflowType) {
    case "blog_post":
      return await workflowBlogPost(prompt, noteId);
    case "task_extraction":
      return await workflowTaskExtraction(prompt, noteId);
    case "meeting_notes":
      return await workflowMeetingNotes(prompt, noteId);
    case "email_draft":
      return await workflowEmailDraft(prompt, noteId);
    case "my_custom":  // Add this
      return await workflowMyCustom(prompt, noteId);
    default:
      return { noteId, timestamp, promptSnippet: prompt.slice(0, 200) };
  }
}
```

### Step 3: Test Your Workflow

```bash
curl -X POST "http://localhost:3000/api/speakspace-action" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Workflow-Type: my_custom" \
  -d '{
    "prompt": "Your test input",
    "note_id": "test_123",
    "timestamp": "2025-01-15T10:30:00Z"
  }'
```

## Workflow Template Examples

### Social Media Post
```javascript
export async function workflowSocialMedia(prompt, noteId) {
  const enrichedPrompt = `Create an engaging social media post from: ${prompt}. Include hashtags and emoji.`;
  
  const post = await callOpenAI(enrichedPrompt, {
    systemPrompt: "You create viral social media content. Be concise and engaging.",
    maxTokens: 500,
  });
  
  return { noteId, workflowType: "social_media", post };
}
```

### Code Snippet Generator
```javascript
export async function workflowCodeGen(prompt, noteId) {
  const enrichedPrompt = `Generate working code for: ${prompt}`;
  
  const code = await callOpenAI(enrichedPrompt, {
    systemPrompt: "You are an expert programmer. Generate clean, working code with comments.",
    maxTokens: 2000,
  });
  
  // Clean up markdown
  const cleanCode = code.replace(/```[\s\S]*?```/g, '').trim();
  
  return { noteId, workflowType: "code_gen", code: cleanCode };
}
```

### Translation
```javascript
export async function workflowTranslate(prompt, noteId) {
  const enrichedPrompt = `Translate this to Spanish: ${prompt}`;
  
  const translation = await callOpenAI(enrichedPrompt, {
    systemPrompt: "You are a professional translator. Maintain tone and context.",
    maxTokens: 1000,
  });
  
  return { noteId, workflowType: "translate", original: prompt, translation };
}
```

## Best Practices

1. **Keep it Simple**: Focus on one clear task per workflow
2. **Use Templates**: Create reusable templates in `src/utils/templates.js`
3. **Handle Errors**: Always wrap in try-catch and provide fallbacks
4. **Clean Output**: Strip markdown artifacts from GPT-4 responses
5. **Document**: Add comments explaining what your workflow does
6. **Test**: Always test with various inputs before deploying

## Integration with External Services

Add API calls after GPT-4 processing:

```javascript
// Example: Post to Slack
if (process.env.SLACK_WEBHOOK_URL) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: result })
  });
}
```

## Environment Variables

Add new variables to `.env.example`:

```
# My Custom Workflow
MY_SERVICE_API_KEY=your_api_key_here
MY_SERVICE_URL=https://api.example.com
```

## Deploying Custom Workflows

1. Commit your changes:
```bash
git add .
git commit -m "Add custom workflow"
git push origin main
```

2. Render will auto-deploy in 2-3 minutes

3. Test the live endpoint:
```bash
curl https://speakops-action-automation-from-spoken.onrender.com/health
```

## Need Help?

- Check existing workflows in `src/workflows/index.js`
- Read GPT-4 documentation at openai.com
- Test locally before deploying
- Use the web interface for quick testing
