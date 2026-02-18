# Deployment Guide

## Project Structure (Monorepo)

```
quess_corp/
├── backend/          # FastAPI backend (deploy to Render)
│   ├── app/          # Application code
│   ├── asgi.py       # Production entry point
│   ├── render.yaml   # Render config
│   └── requirements.txt
└── frontend/         # React frontend (deploy to Vercel)
    ├── src/
    ├── vercel.json    # Vercel config
    └── package.json
```

---

## 1. Backend → Render

1. Push code to GitHub.
2. Go to [Render](https://render.com) → **New +** → **Web Service**.
3. Connect your GitHub repo.
4. Set **Root Directory** to `backend`.
5. Render should auto-detect `render.yaml`. If not, configure manually:
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -k uvicorn.workers.UvicornWorker asgi:app`
6. Add **Environment Variables**:
   - `DATABASE_URL` — Full MySQL connection string (`mysql://user:pass@host:port/db`)
   - `APP_ENV` — `production`

---

## 2. Frontend → Vercel

1. Go to [Vercel](https://vercel.com) → **Add New** → **Project**.
2. Import your GitHub repo.
3. Set **Root Directory** to `frontend`.
4. Framework should auto-detect as **Vite**.
5. Add **Environment Variable**:
   - `VITE_API_BASE_URL` — Your Render backend URL (e.g. `https://hrms-lite-backend.onrender.com`)
6. Click **Deploy**.
