# HRMS Lite

> **Enterprise-grade HR Management System** featuring a modern dashboard, employee directory, attendance tracking, and comprehensive reporting. Built with **FastAPI** and **React**.

---

## 🚀 Features

- **Dashboard**: Real-time overview of workforce metrics, daily attendance stats, and department breakdowns.
- **Employee Management**: CRUD operations with search, filtering by department, and detailed profiles.
- **Attendance Tracking**: Mark check-in/out, view status history, and filter by date/status.
- **Modern UI**: Fully responsive, accessible, and clean interface built with **Tailwind CSS**.
- **Performance**: Optimized backend with async database operations and efficient frontend data fetching.

---

## 🛠️ Technology Stack

### Backend
- **FastAPI**: High-performance async Python framework.
- **SQLAlchemy (Async)**: ORM for database interactions.
- **MySQL (via aiomysql)**: Relational database.
- **Pydantic**: Data validation and settings management.
- **Alembic**: Database migrations.

### Frontend
- **React 18**: UI library.
- **Vite**: Next-generation build tool.
- **Tailwind CSS**: Utility-first styling.
- **React Query**: Server state management.
- **React Hook Form + Zod**: Form handling and validation.
- **Lucide React**: Iconography.

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL Database

### 1. Backend Setup

```bash
# Clone repository
git clone <repository-url>
cd quess_corp

# Create virtual environment
python -m venv venv
venv\Scripts\activate     # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure Environment
# Copy .env.example to .env and update DB credentials
copy .env.example .env
```

**Run Server:**
```bash
# Development mode
uvicorn app.main:create_app --factory --reload --port 8082

# Production mode
gunicorn -k uvicorn.workers.UvicornWorker asgi:app
```
*API docs available at [http://localhost:8082/docs](http://localhost:8082/docs)*

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure Environment
# Ensure .env has VITE_API_BASE_URL=http://localhost:8082

# Run Development Server
npm run dev
```
*Frontend running at [http://localhost:3000](http://localhost:3000)*

---

## 🚢 Deployment

This project is configured for split deployment:
- **Backend**: Deployed on **Render** (using `render.yaml`).
- **Frontend**: Deployed on **Vercel** (using `vercel.json`).

👉 **See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step deployment instructions.**

---

## 📂 Project Structure

```
├── app/                  # Backend Application
│   ├── main.py           # App entry point
│   ├── config.py         # Configuration & Settings
│   ├── models/           # SQLAlchemy Models
│   ├── schemas/          # Pydantic Schemas
│   ├── routes/           # API Endpoints
│   └── services/         # Business Logic
│
├── frontend/             # React Application
│   ├── src/
│   │   ├── components/   # UI Components
│   │   ├── features/     # Feature-based Modules (Dashboard, Employees)
│   │   ├── hooks/        # Custom React Hooks
│   │   └── services/     # API Client
│   └── index.html        # Entry HTML
│
├── tests/                # Backend Tests
├── requirements.txt      # Python Dependencies
├── render.yaml           # Render Deployment Config
└── asgi.py               # Production Entry Point
```

## 🧪 Testing

Run backend tests with Pytest:
```bash
pytest -v
```
