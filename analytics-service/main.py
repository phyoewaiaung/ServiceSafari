from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uvicorn
from datetime import datetime
from typing import Dict, List, Any

from app.routers.analytics import router as analytics_router
from app.routers.health import router as health_router

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Analytics Service",
    description="Microservices Analytics Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analytics_router, prefix="/api/analytics", tags=["analytics"])
app.include_router(health_router, tags=["health"])

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "message": "📊 Analytics Service is running!",
        "service": "Microservices Analytics Service",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "analytics": "/api/analytics/*"
        }
    }

@app.get("/api/status")
async def service_status():
    """Service status endpoint"""
    return {
        "service": "Analytics Service",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "features": [
            "Data Analytics",
            "User Statistics",
            "Performance Metrics",
            "Database Integration"
        ]
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "service": "Analytics Service"
        }
    )

if __name__ == "__main__":
    port = int(os.getenv("ANALYTICS_PORT", 3003))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
