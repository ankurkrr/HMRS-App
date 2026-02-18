"""Application-level exceptions with structured error codes."""


class AppException(Exception):
    """Base application exception that maps to HTTP error responses."""

    def __init__(self, error_code: str, message: str, status_code: int = 400, details: dict | None = None):
        self.error_code = error_code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class NotFoundException(AppException):
    """Resource not found — maps to HTTP 404."""

    def __init__(self, error_code: str = "RESOURCE_NOT_FOUND", message: str = "The requested resource does not exist", details: dict | None = None):
        super().__init__(error_code=error_code, message=message, status_code=404, details=details)


class ConflictException(AppException):
    """Duplicate / conflict — maps to HTTP 409."""

    def __init__(self, error_code: str = "CONFLICT", message: str = "Resource conflict", details: dict | None = None):
        super().__init__(error_code=error_code, message=message, status_code=409, details=details)


class ValidationException(AppException):
    """Business rule validation failure — maps to HTTP 422."""

    def __init__(self, error_code: str = "VALIDATION_ERROR", message: str = "Validation failed", details: dict | None = None):
        super().__init__(error_code=error_code, message=message, status_code=422, details=details)


class RateLimitException(AppException):
    """Rate limit exceeded — maps to HTTP 429."""

    def __init__(self, message: str = "Too many requests. Please try again later."):
        super().__init__(error_code="RATE_LIMIT_EXCEEDED", message=message, status_code=429)
