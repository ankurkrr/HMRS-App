"""Structured request/response logging middleware with slow query detection."""

import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.config import settings

logger = logging.getLogger("hrms.access")


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """Log every request with structured metadata.

    Features:
        - Request method, path, status code, duration
        - Slow request detection (>200ms threshold)
        - Request ID correlation
        - Never logs PII from request bodies
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.perf_counter()

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start_time) * 1000
        request_id = getattr(request.state, "request_id", "unknown")

        log_data = {
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": round(duration_ms, 2),
            "client_ip": request.client.host if request.client else "unknown",
        }

        # Slow request detection
        if duration_ms > settings.SLOW_QUERY_THRESHOLD_MS:
            logger.warning("SLOW REQUEST detected", extra=log_data)
        else:
            logger.info("Request completed", extra=log_data)

        return response
