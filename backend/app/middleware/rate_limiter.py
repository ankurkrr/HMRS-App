"""Token bucket rate limiter middleware.

Protects against accidental abuse from runaway scripts or misconfigured cron jobs.
Even internal tools benefit from rate limiting as a professional safety net.
"""

import time
from collections import defaultdict

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.config import settings


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Simple in-memory token bucket rate limiter per client IP.

    Limits:
        - General endpoints: RATE_LIMIT_PER_MINUTE (default 60)
        - Returns 429 with Retry-After header when exceeded

    Note: For multi-instance deployments, replace with Redis-backed limiter.
    """

    def __init__(self, app, requests_per_minute: int | None = None):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute or settings.RATE_LIMIT_PER_MINUTE
        self.window_seconds = 60
        # In-memory store: {ip: [(timestamp, ...),]}
        self._requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - self.window_seconds

        # Clean old entries
        self._requests[client_ip] = [
            ts for ts in self._requests[client_ip] if ts > window_start
        ]

        # Check rate limit
        if len(self._requests[client_ip]) >= self.requests_per_minute:
            retry_after = int(self._requests[client_ip][0] + self.window_seconds - now) + 1
            return JSONResponse(
                status_code=429,
                content={
                    "error_code": "RATE_LIMIT_EXCEEDED",
                    "message": "Too many requests. Please try again later.",
                    "details": {"retry_after_seconds": retry_after},
                },
                headers={"Retry-After": str(retry_after)},
            )

        # Record this request
        self._requests[client_ip].append(now)

        return await call_next(request)
