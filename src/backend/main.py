from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from database import init_db, get_db
from routers import auth_router, foods_router, records_router
from routers.auth import get_current_user
from models import User
from schemas import AIChatMessage, AIChatResponse
from services.ai_service import ai_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="营养管理API",
    description="智能营养管理后端服务",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(foods_router)
app.include_router(records_router)

@app.get("/")
def root():
    return {
        "message": "营养管理API服务",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/ai/chat", response_model=AIChatResponse)
async def ai_chat(
    message: AIChatMessage,
    current_user: User = Depends(get_current_user)
):
    context = message.context or {}
    
    context.update({
        "age": current_user.age,
        "gender": current_user.gender.value if current_user.gender else None,
        "height": current_user.height,
        "weight": current_user.weight,
        "activity_level": current_user.activity_level.value if current_user.activity_level else None,
        "goal_type": current_user.goal_type.value if current_user.goal_type else None,
        "daily_calorie_goal": current_user.daily_calorie_goal
    })
    
    try:
        response = await ai_service.chat(message.message, context)
        return AIChatResponse(
            response=response,
            model_used=ai_service.current_model
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI服务错误: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
