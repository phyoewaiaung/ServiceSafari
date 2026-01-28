from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random
import asyncio

router = APIRouter()

# Pydantic models
class UserStats(BaseModel):
    total_users: int
    active_users: int
    new_users_today: int
    user_growth_rate: float

class PerformanceMetrics(BaseModel):
    avg_response_time: float
    requests_per_minute: int
    error_rate: float
    uptime_percentage: float

class AnalyticsData(BaseModel):
    timestamp: datetime
    user_stats: UserStats
    performance_metrics: PerformanceMetrics
    top_endpoints: List[Dict[str, Any]]

# Mock data storage (in real app, this would come from database)
mock_data = {
    "users": [
        {"id": 1, "name": "John Doe", "email": "john@example.com", "created_at": "2024-01-01"},
        {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "created_at": "2024-01-02"},
        {"id": 3, "name": "Bob Johnson", "email": "bob@example.com", "created_at": "2024-01-03"},
    ],
    "requests": [
        {"endpoint": "/api/auth/login", "count": 150},
        {"endpoint": "/api/auth/register", "count": 89},
        {"endpoint": "/api/analytics/stats", "count": 45},
        {"endpoint": "/health", "count": 200},
    ]
}

@router.get("/stats", response_model=AnalyticsData)
async def get_analytics_stats():
    """Get comprehensive analytics statistics"""
    try:
        # Simulate some processing time
        await asyncio.sleep(0.1)
        
        # Generate user statistics
        total_users = len(mock_data["users"])
        active_users = int(total_users * 0.7)  # 70% active
        new_users_today = random.randint(1, 5)
        user_growth_rate = round(random.uniform(2.5, 8.0), 2)
        
        user_stats = UserStats(
            total_users=total_users,
            active_users=active_users,
            new_users_today=new_users_today,
            user_growth_rate=user_growth_rate
        )
        
        # Generate performance metrics
        performance_metrics = PerformanceMetrics(
            avg_response_time=round(random.uniform(50, 150), 2),
            requests_per_minute=random.randint(20, 100),
            error_rate=round(random.uniform(0.1, 2.0), 2),
            uptime_percentage=round(random.uniform(99.5, 99.9), 2)
        )
        
        # Get top endpoints
        top_endpoints = sorted(mock_data["requests"], key=lambda x: x["count"], reverse=True)[:3]
        
        analytics_data = AnalyticsData(
            timestamp=datetime.now(),
            user_stats=user_stats,
            performance_metrics=performance_metrics,
            top_endpoints=top_endpoints
        )
        
        return analytics_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

@router.get("/users")
async def get_user_analytics():
    """Get user-specific analytics"""
    try:
        # Simulate user analytics
        user_analytics = {
            "total_users": len(mock_data["users"]),
            "user_growth": {
                "last_7_days": 12,
                "last_30_days": 45,
                "last_90_days": 128
            },
            "user_demographics": {
                "by_region": {
                    "North America": 45,
                    "Europe": 32,
                    "Asia": 23
                },
                "by_device": {
                    "Desktop": 60,
                    "Mobile": 35,
                    "Tablet": 5
                }
            },
            "retention": {
                "day_1": 85,
                "day_7": 65,
                "day_30": 40
            }
        }
        
        return user_analytics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user analytics: {str(e)}")

@router.get("/performance")
async def get_performance_metrics():
    """Get performance metrics"""
    try:
        # Simulate performance metrics
        performance_data = {
            "response_times": {
                "avg": 125.5,
                "p50": 110,
                "p95": 250,
                "p99": 450
            },
            "throughput": {
                "requests_per_second": 15.5,
                "requests_per_minute": 930,
                "peak_rps": 45.2
            },
            "errors": {
                "total_errors": 12,
                "error_rate": 0.8,
                "error_types": {
                    "4xx": 8,
                    "5xx": 4
                }
            },
            "resources": {
                "cpu_usage": 45.2,
                "memory_usage": 62.8,
                "disk_usage": 23.1
            }
        }
        
        return performance_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get performance metrics: {str(e)}")

@router.get("/dashboard")
async def get_dashboard_data():
    """Get dashboard summary data"""
    try:
        # Combine multiple analytics for dashboard
        dashboard_data = {
            "overview": {
                "total_users": len(mock_data["users"]),
                "active_sessions": 234,
                "total_requests": 5432,
                "avg_response_time": 125.5
            },
            "trends": {
                "user_growth_trend": [12, 15, 18, 22, 28, 32, 35],
                "request_trend": [450, 480, 520, 490, 550, 580, 620],
                "performance_trend": [120, 125, 130, 125, 135, 140, 125]
            },
            "alerts": [
                {
                    "type": "warning",
                    "message": "Response time increased by 15%",
                    "timestamp": datetime.now().isoformat()
                },
                {
                    "type": "info", 
                    "message": "New user registration spike detected",
                    "timestamp": (datetime.now() - timedelta(hours=2)).isoformat()
                }
            ]
        }
        
        return dashboard_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard data: {str(e)}")
