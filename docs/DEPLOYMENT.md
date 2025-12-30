# Platform Zero Deployment Guide

This guide covers how to deploy the Platform Zero application using two methods:
1. **Google Cloud Run** (Containerized)
2. **Vercel via GitHub** (Git Integration)

---

## Prerequisites

Before starting, ensure you have the following files in your project root (created automatically by the setup):
- `Dockerfile`
- `nginx.conf`
- `package.json`
- `vite.config.ts`

You also need to obtain your Gemini API Key.

---

## Option 1: Google Cloud Run

Google Cloud Run is a serverless platform for running containerized applications. It is ideal for production workloads.

### 1. Setup Google Cloud SDK
Ensure you have the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated.

```bash
gcloud auth login
gcloud config set project [YOUR_PROJECT_ID]
```

### 2. Enable Required Services
Enable the Cloud Run and Container Registry/Artifact Registry APIs in your Google Cloud Console.

### 3. Build and Submit the Container
Run the following command in your project root. Replace `[PROJECT_ID]` with your Google Cloud project ID.

```bash
gcloud builds submit --tag gcr.io/[PROJECT_ID]/platform-zero
```

*This command uses the `Dockerfile` to build the React app and package it with Nginx.*

### 4. Deploy to Cloud Run
Deploy the container you just built.

```bash
gcloud run deploy platform-zero \
  --image gcr.io/[PROJECT_ID]/platform-zero \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars API_KEY=[YOUR_GEMINI_API_KEY]
```

*Note: Replace `[YOUR_GEMINI_API_KEY]` with your actual API key.*

### 5. Access the App
The console will output a Service URL (e.g., `https://platform-zero-xyz-uc.a.run.app`). Click this link to view your deployed application.

---

## Option 2: Vercel via GitHub

Vercel is the industry standard for deploying React applications directly from GitHub.

### 1. Push Code to GitHub
1. Create a new repository on [GitHub](https://github.com).
2. Push your application code to this repository.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[YOUR_USERNAME]/platform-zero.git
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [Vercel.com](https://vercel.com) and sign up/log in.
2. Click **"Add New..."** -> **"Project"**.
3. Select **"Continue with GitHub"**.
4. Find your `platform-zero` repository and click **"Import"**.

### 3. Configure Deployment
Vercel will auto-detect that this is a Vite project.

1. **Framework Preset:** Vite
2. **Root Directory:** `./`
3. **Environment Variables:**
   - Expand the "Environment Variables" section.
   - Key: `API_KEY`
   - Value: `[YOUR_GEMINI_API_KEY]`
   - *Note: In Vite, client-side variables usually need `VITE_` prefix, but the Google GenAI SDK usage in this app relies on `process.env`. If using Vercel, you may need to update the `vite.config.ts` define settings (already included in the provided config).*

### 4. Deploy
Click **"Deploy"**. Vercel will build your application and provide a live URL (e.g., `https://platform-zero.vercel.app`).

---

## Troubleshooting

**Missing API Key:**
If the AI features (Market Analysis, Invoice Scanning) are not working, ensure you have set the `API_KEY` environment variable correctly in your deployment platform settings.

**Routing Issues (404 on refresh):**
- **Cloud Run:** The provided `nginx.conf` handles this by redirecting all requests to `index.html`.
- **Vercel:** Vercel handles SPA routing automatically.
