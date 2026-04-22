from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.config import settings

app = FastAPI(
    title="Warehouse CRM API",
    description="SaaS-платформа",
    version="1.0.0"
)

# Rate Limiter
from app.core.limiter import limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS для локальной разработки фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"], # Строгі CORS правила (Security Fix)
)

from app.api.v1 import warehouses, products, movements, categories, dashboard, shipments, auth

app.include_router(auth.router, prefix="/api/v1")
app.include_router(warehouses.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(movements.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(shipments.router, prefix="/api/v1")

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running!"}
