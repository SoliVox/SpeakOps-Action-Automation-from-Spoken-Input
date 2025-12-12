# Quick Deployment Guide - Render (Free Tier)

## Prerequisites
- GitHub account
- Render account (sign up at https://render.com)

## Step 1: Push Code to GitHub

```bash
cd "c:\Users\NAYAN SHUKLA\Documents\GitHub\SpeakOps-Action-Automation-from-Spoken-Input"

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - SpeakOps implementation"

# Push to GitHub (already connected as SoliVox/SpeakOps-Action-Automation-from-Spoken-Input)
git branch -M main
git push -u origin main
```

## Step 2: Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository:
   - Select: `SoliVox/SpeakOps-Action-Automation-from-Spoken-Input`
4. Configure the service:

   **Basic Settings:**
   - Name: `speakops-action`
   - Region: `Oregon (US West)` or nearest
   - Branch: `main`
   - Root Directory: (leave blank)

   **Build Settings:**
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

   **Instance Type:**
   - Select: **Free** (0.1 CPU, 512 MB RAM)

5. Click **"Advanced"** to set environment variables

## Step 3: Configure Environment Variables

Click **"Add Environment Variable"** for each:

| Key | Value | Notes |
|-----|-------|-------|
| `SS_API_KEY` | `your_secret_api_key_12345` | Your API auth token |
| `OPENAI_API_KEY` | `sk-proj-...` | Get from https://platform.openai.com |
| `PORT` | `3000` | (Optional, Render sets automatically) |
| `NODE_ENV` | `production` | Enable production mode |
| `DEFAULT_WORKFLOW` | `generic` | Or: blog_post, task_extraction, etc. |

**Optional integrations** (add only if using):
- `WORDPRESS_URL` + `WORDPRESS_TOKEN`
- `NOTION_TOKEN` + `NOTION_DATABASE_ID`
- `ASANA_TOKEN` + `ASANA_WORKSPACE_ID`

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. Render will show you the URL: `https://speakops-action.onrender.com`

## Step 5: Test Deployment

```bash
# Test health endpoint
curl https://speakops-action.onrender.com/health

# Test API (replace with your SS_API_KEY and workflow)
curl -X POST "https://speakops-action.onrender.com/api/speakspace-action" \
  -H "Authorization: Bearer your_secret_api_key_12345" \
  -H "X-Workflow-Type: blog_post" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "I want to write about the future of AI automation",
    "note_id": "test123",
    "timestamp": "2025-12-12T10:00:00Z"
  }'
```

## Step 6: Configure SpeakSpace App

In the SpeakSpace mobile app:

1. **Action Name**: SpeakOps Blog Generator
2. **API URL**: `https://speakops-action.onrender.com/api/speakspace-action`
3. **HTTP Method**: POST
4. **Headers**:
   - `Authorization`: `Bearer your_secret_api_key_12345`
   - `X-Workflow-Type`: `blog_post` (or other workflow)
   - `Content-Type`: `application/json`
5. **Prompt Template**: `Convert this voice note into a blog post: $PROMPT`

## Monitoring & Logs

- **Logs**: Render Dashboard → Your Service → Logs tab
- **Metrics**: `/metrics` endpoint or Render dashboard
- **Health**: `/health` endpoint

## Troubleshooting

### Deployment fails
- Check build logs in Render dashboard
- Verify `package.json` scripts are correct
- Ensure all dependencies are in `package.json`

### API returns errors
- Check environment variables are set correctly
- View logs for detailed error messages
- Test `/health` endpoint first

### OpenAI errors
- Verify API key is valid: https://platform.openai.com/api-keys
- Check billing is enabled on OpenAI account
- Ensure sufficient credits/usage limits

### Free tier limitations
- Render free tier spins down after 15 min inactivity
- First request after spin-down takes ~30 seconds
- Upgrade to paid for always-on service

## Auto-Deploy on Git Push

Render automatically redeploys when you push to `main`:

```bash
# Make changes, then:
git add .
git commit -m "Update workflows"
git push
# Render will auto-deploy in ~2 minutes
```

## Cost

- **Free tier**: $0/month (with limitations)
- **Starter**: $7/month (always on, no sleep)
- **Pro**: $25/month (better performance)

For hackathon: **Free tier is sufficient!**

## Next Steps

1. ✅ Deploy to Render
2. ✅ Test all endpoints
3. ✅ Configure SpeakSpace app
4. 📹 Record demo video
5. 📝 Prepare submission with live URL
