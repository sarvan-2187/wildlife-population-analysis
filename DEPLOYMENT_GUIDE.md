# EcoDynamix Deployment Guide: Vercel + Render

## Frontend Deployment (Vercel) ✅ DONE
Your frontend is already deployed at: **https://ecodynamix-dashboard.vercel.app**

---

## Backend Deployment (Render) - NEXT STEPS

### Step 1: Prepare Your Repository
1. Commit all changes to GitHub:
   ```bash
   git add .gitignore backend/ render.yaml Procfile *.md
   git commit -m "Configure production deployment: Vercel + Render wiring"
   git push origin main
   ```

### Step 2: Deploy Backend on Render

1. Go to [render.com](https://render.com)
2. Sign in with GitHub (if not already)
3. Click **"New +"** → **"Web Service"**
4. Select your GitHub repository
5. Configure with these settings:
   - **Name:** `ecodynamix-backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free (or Starter+ for production)

### Step 3: Set Environment Variables in Render
In the Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://ecodynamix-dashboard.vercel.app` |
| `GROQ_API_KEY` | Your Groq API key (get from [console.groq.com](https://console.groq.com)) |
| `PYTHON_VERSION` | `3.11` |

### Step 4: Deploy!
- Click **"Create Web Service"**
- Render will automatically build and deploy your backend
- You'll get a URL like: `https://ecodynamix-backend.onrender.com`

### Step 5: Update Frontend Environment Variables

**Option A: Update in Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://ecodynamix-backend.onrender.com` (or your actual Render URL)
5. Redeploy: Go to **Deployments**, click the latest, and **Redeploy**

**Option B: Update locally and push**
1. Edit `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://ecodynamix-backend.onrender.com
   ```
2. Push to GitHub
3. Vercel will auto-deploy

---

## Verification

### Test Backend Health
```bash
curl https://ecodynamix-backend.onrender.com/health
# Expected: {"status":"ok","message":"EcoDynamix Core is online."}
```

### Test Frontend-Backend Connection
1. Visit: `https://ecodynamix-dashboard.vercel.app/`
2. Check browser console for errors
3. Navigate to **Dashboard** → should load species data
4. Try **Chat** → should connect to RAG service
5. Go to **Models** → should display metrics

### If You See CORS Errors
- Backend CORS is already configured to accept your Vercel URL ✅
- If still seeing errors, verify `FRONTEND_URL` env var in Render

---

## Important Notes

### ChromaDB & Data Storage
- **Issue:** Render's free tier has ephemeral storage (resets on redeploy)
- **Solution for Production:**
  1. Use Render's Managed PostgreSQL with pgvector
  2. Or use Render's persistent disk (paid tier)
  3. Or switch to a vector DB service (Pinecone, Weaviate)

### File Uploads & Data Files
- `data/` directory (CSV, JSON) will be lost on Render restart
- Move to a database or use Render's persistent storage

### Keep-Alive for Free Tier
- Free tier spins down after 15 min of inactivity
- First request will be slow (~30 sec)
- Upgrade to Starter+ for always-on

---

## Quick Reference: API Endpoints

Frontend calls backend at:
- `GET /api/v1/dashboard` → Dashboard data
- `GET /api/v1/summary` → Data summary  
- `GET /api/v1/model-metrics` → ML model metrics
- `POST /api/v1/chat?message=...` → RAG chat response
- `GET /health` → Health check

---

## Rollback / Troubleshooting

If deployment fails:
1. Check Render build logs for errors
2. Verify all environment variables are set
3. Ensure `backend/requirements.txt` is complete
4. Test locally: `uvicorn backend.main:app`

