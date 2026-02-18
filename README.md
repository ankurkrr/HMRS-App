# HRMS Lite

> **Enterprise-grade HR Management System** — employee management, attendance tracking, and dashboard analytics. Built with **FastAPI** + **React**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS v4, React Query, Zod |
| **Backend** | FastAPI, SQLAlchemy (Async), Pydantic v2 |
| **Database** | MySQL (aiomysql) |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## ⚡ Quick Start

### Backend
```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:create_app --factory --reload --port 8082
```
API docs → [http://localhost:8082/docs](http://localhost:8082/docs)

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App → [http://localhost:3000](http://localhost:3000)

> Set `VITE_API_BASE_URL=http://localhost:8082` in `frontend/.env`

---

## 🚢 Deployment

| Service | Platform | Root Directory |
|---------|----------|---------------|
| Backend | **Render** | `backend/` |
| Frontend | **Vercel** | `frontend/` |

👉 See [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) for step-by-step instructions.

---

## 📂 Structure

```
├── backend/              # FastAPI API
│   ├── app/              # Application package
│   ├── asgi.py           # Production entry point
│   ├── render.yaml       # Render deployment config
│   └── requirements.txt
│
├── frontend/             # React SPA
│   ├── src/
│   ├── vercel.json       # Vercel deployment config
│   └── package.json
│
└── README.md
```
