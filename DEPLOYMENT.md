# Deployment Guide

## Quick Deploy Options

### 1. Render (Recommended - Free Tier Available)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo: `SoliVox/SpeakOps-Action-Automation-from-Spoken-Input`
4. Settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `SS_API_KEY`: your-secret-key
     - `PORT`: 3000
     - `RATE_LIMIT_PER_MIN`: 60
5. Deploy → get your URL: `https://your-app.onrender.com`

### 2. Heroku

```bash
# Install Heroku CLI, then:
heroku login
heroku create speakops-action
heroku config:set SS_API_KEY=your-secret-key
git push heroku main
heroku open
```

### 3. Google Cloud Run (Container)

```bash
# Build and push Docker image
gcloud builds submit --tag gcr.io/YOUR-PROJECT/speakops
gcloud run deploy speakops \
  --image gcr.io/YOUR-PROJECT/speakops \
  --platform managed \
  --region us-central1 \
  --set-env-vars SS_API_KEY=your-secret-key \
  --allow-unauthenticated
```

### 4. Vercel (Serverless)

1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [{ "src": "src/server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/server.js" }]
}
```
3. Deploy:
```bash
vercel --prod
vercel env add SS_API_KEY
```

### 5. AWS ECS (Advanced)

- Use the included Dockerfile
- Push to ECR
- Create ECS task definition with env vars
- Configure ALB with HTTPS

## Post-Deployment

1. **Test health check**:
   ```bash
   curl https://your-url.com/health
   ```

2. **Test API**:
   ```bash
   curl -X POST https://your-url.com/api/speakspace-action \
     -H "Authorization: Bearer YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"prompt":"test","note_id":"123","timestamp":"2025-12-09T14:22:33Z"}'
   ```

3. **Configure SpeakSpace**:
   - API URL: `https://your-url.com/api/speakspace-action`
   - Auth: `Authorization: Bearer YOUR_KEY`

## Environment Variables

Required:
- `SS_API_KEY` - API authentication key

Optional:
- `PORT` - Server port (default: 3000)
- `RATE_LIMIT_PER_MIN` - Max requests per minute (default: 60)
- `NODE_ENV` - Set to `production` for prod deployments

## Monitoring

Add application monitoring:
- Sentry: `npm install @sentry/node`
- LogTail: `npm install @logtail/node`
- Prometheus: `npm install prom-client`

## SSL/HTTPS

All platforms above provide automatic HTTPS. For custom domains:
- Render: Add custom domain in dashboard
- Heroku: `heroku certs:auto:enable`
- Cloud Run: Map custom domain in GCP Console
