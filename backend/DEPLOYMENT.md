# Deployment Guide

## 1. Backend Deployment (Render)

This project is configured for deployment on **Render** as a Python Web Service.

### Prerequisites
- A **MySQL Database** is required. You can use:
  - **PlanetScale** (Recommended for MySQL)
  - **Aiven for MySQL**
  - **Render MySQL** (Docker/Managed, if available)
  - OR use Render's managed PostgreSQL (requires changing `requirements.txt` to use `asyncpg` instead of `aiomysql` and updating the driver string).

### Steps
1. Push your code to GitHub.
2. Log in only to [Render](https://render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Render should auto-detect the configuration from `render.yaml`. If not:
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -k uvicorn.workers.UvicornWorker asgi:app`
6. **Environment Variables** (Add these manually in the Render dashboard under "Environment"):
   - `DATABASE_URL`: Your full MySQL connection string.
     - Format: `mysql://user:password@host:port/database_name`
     - *Note: The app will automatically convert `mysql://` to `mysql+aiomysql://` for async compatibility.*
   - `SECRET_KEY`: A random strong string (e.g., generate with `openssl rand -hex 32`).
   - `APP_ENV`: `production`

---

## 2. Frontend Deployment (Vercel)

This project is configured for deployment on **Vercel**.

### Steps
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. **Framework Preset**: Vercel should auto-detect **Vite**.
5. **Root Directory**: Click "Edit" and select `frontend`.
6. **Environment Variables**:
   - `VITE_API_BASE_URL`: The URL of your deployed Render backend (e.g., `https://hrms-lite-backend.onrender.com`).
     - *Important: Do not add a trailing slash.*
7. Click **Deploy**.

### Verification
- Open your Vercel URL.
- Check the browser console if API calls fail; ensure `VITE_API_BASE_URL` matches your Render URL exactly.
