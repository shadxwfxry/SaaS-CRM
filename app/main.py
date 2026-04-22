from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Warehouse CRM API",
    description="SaaS-платформа",
    version="1.0.0"
)

# CORS для локальной разработки фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
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
