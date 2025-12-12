// Example workflow implementations
// Import these in server.js to enable specific workflows

import { createWordPressPost, createNotionPage, createAsanaTask, retryWithBackoff } from "../utils/integrations.js";
import { applyTemplate, TEMPLATES, safeJsonParse, extractDates } from "../utils/templates.js";

/**
 * Workflow: Voice note to WordPress blog post
 */
export async function workflowBlogPost(prompt, noteId) {
  // Apply template
  const enrichedPrompt = applyTemplate(TEMPLATES.blogPost, { PROMPT: prompt });
  
  // TODO: Call your LLM API here (OpenAI, Anthropic, etc.)
  // const blogContent = await callLLM(enrichedPrompt);
  
  // Mock response for demo
  const blogContent = {
    title: "Blog Post from Voice Note",
    content: `<h2>Introduction</h2><p>${prompt.slice(0, 200)}</p>`,
  };
  
  // Post to WordPress with retry
  if (process.env.WORDPRESS_URL && process.env.WORDPRESS_TOKEN) {
    const post = await retryWithBackoff(() =>
      createWordPressPost(
        process.env.WORDPRESS_URL,
        process.env.WORDPRESS_TOKEN,
        { ...blogContent, status: "draft" }
      )
    );
    console.log(`WordPress post created: ${post.id}`);
    return { noteId, workflowType: "blog_post", postId: post.id };
  }
  
  return { noteId, workflowType: "blog_post", result: blogContent };
}

/**
 * Workflow: Extract tasks and create in Notion
 */
export async function workflowTaskExtraction(prompt, noteId) {
  // Apply template for task extraction
  const enrichedPrompt = applyTemplate(TEMPLATES.taskList, { PROMPT: prompt });
  
  // TODO: Call LLM to extract tasks
  // const llmResponse = await callLLM(enrichedPrompt);
  // const tasks = safeJsonParse(llmResponse);
  
  // Mock tasks for demo
  const tasks = [
    { task: "Review project proposal", priority: "high", due_date: "2025-12-15" },
    { task: "Schedule team meeting", priority: "medium", due_date: null },
  ];
  
  const results = [];
  if (process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID) {
    for (const task of tasks) {
      const page = await createNotionPage(
        process.env.NOTION_TOKEN,
        process.env.NOTION_DATABASE_ID,
        {
          title: task.task,
          status: "Not Started",
          description: `Priority: ${task.priority}${task.due_date ? `\nDue: ${task.due_date}` : ""}`,
        }
      );
      results.push(page.id);
      console.log(`Notion task created: ${page.id}`);
    }
  }
  
  return { noteId, workflowType: "task_extraction", taskCount: tasks.length, notionPages: results };
}

/**
 * Workflow: Meeting notes to Asana tasks
 */
export async function workflowMeetingNotes(prompt, noteId) {
  // Apply meeting notes template
  const enrichedPrompt = applyTemplate(TEMPLATES.meetingNotes, { PROMPT: prompt });
  
  // TODO: Call LLM for structured notes
  // const notes = await callLLM(enrichedPrompt);
  
  // Extract dates from the prompt
  const dates = extractDates(prompt);
  
  // Mock action items
  const actionItems = [
    { name: "Follow up with client", notes: prompt.slice(0, 100), due_on: dates[0] || null },
  ];
  
  const results = [];
  if (process.env.ASANA_TOKEN && process.env.ASANA_WORKSPACE_ID) {
    for (const item of actionItems) {
      const task = await createAsanaTask(
        process.env.ASANA_TOKEN,
        process.env.ASANA_WORKSPACE_ID,
        item
      );
      results.push(task.data.gid);
      console.log(`Asana task created: ${task.data.gid}`);
    }
  }
  
  return { noteId, workflowType: "meeting_notes", actionItems: actionItems.length, asanaTasks: results };
}

/**
 * Workflow: Voice to email draft (save to file or send)
 */
export async function workflowEmailDraft(prompt, noteId) {
  const enrichedPrompt = applyTemplate(TEMPLATES.emailDraft, { PROMPT: prompt });
  
  // TODO: Call LLM
  // const emailContent = await callLLM(enrichedPrompt);
  
  // Mock email
  const email = {
    subject: "RE: Your Request",
    body: `Hi,\n\n${prompt.slice(0, 150)}\n\nBest regards`,
  };
  
  // Could integrate with SendGrid, Mailgun, etc.
  console.log("Email draft generated:", email.subject);
  
  return { noteId, workflowType: "email_draft", email };
}

/**
 * Workflow router - select workflow based on prompt or config
 */
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
    default:
      // Generic processing
      return { noteId, timestamp, promptSnippet: prompt.slice(0, 200) };
  }
}
