"""FastAPI application factory with middleware registration and route mounting."""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import dispose_db, init_db
from app.middleware.error_handler import register_error_handlers
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.request_logger import RequestLoggerMiddleware
from app.routes import attendance, dashboard, employee


def configure_logging() -> None:
    """Configure structured logging."""
    log_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
        format=log_format,
        stream=sys.stdout,
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — setup and teardown."""
    configure_logging()
    logger = logging.getLogger(__name__)
    logger.info(f"Starting {settings.APP_NAME} ({settings.APP_ENV})")

    # Create tables (dev only — production uses Alembic migrations)
    if settings.APP_ENV == "development":
        await init_db()
        logger.info("Database tables created (development mode)")

    yield

    await dispose_db()
    logger.info(f"{settings.APP_NAME} shut down")


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        description=(
            "Production-grade HRMS Lite system for employee management, "
            "attendance tracking, filtering, and summary dashboard."
        ),
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # --- Middleware (order matters: outermost first) ---
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RateLimiterMiddleware)
    app.add_middleware(RequestLoggerMiddleware)
    app.add_middleware(RequestIdMiddleware)

    # --- Error handlers ---
    register_error_handlers(app)

    # --- Routes ---
    app.include_router(employee.router, prefix=settings.API_V1_PREFIX)
    app.include_router(attendance.router, prefix=settings.API_V1_PREFIX)
    app.include_router(dashboard.router, prefix=settings.API_V1_PREFIX)

    # --- Health endpoint ---
    @app.get("/api/v1/health", tags=["Health"])
    async def health_check():
        return {"status": "ok", "app": settings.APP_NAME, "env": settings.APP_ENV}

    return app
