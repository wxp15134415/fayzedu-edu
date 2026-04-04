"""
成绩导入微服务 - FastAPI 入口
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import warnings
from io import BytesIO

from app.api.routes import router as api_router
from app.core.config import settings
from app.models.schemas import ParseResponse

warnings.filterwarnings('ignore')

app = FastAPI(
    title="成绩解析微服务",
    description="解析多系统考试成绩Excel文件",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "成绩解析微服务", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)