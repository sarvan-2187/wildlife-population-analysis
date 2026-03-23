import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="EcoDynamix Engine",
    description="Backend for the EcoDynamix Intelligence dashboard and Portable RAG.",
    version="1.0.0"
)

# Configure CORS for the Next.js frontend
allowed_origins = [
    "http://localhost:3000",  # Local development
    "http://localhost:3001",
    "https://ecodynamix-dashboard.vercel.app",  # Production Vercel
    os.getenv("FRONTEND_URL", ""),  # Environment variable for flexibility
]

# Filter out empty strings
allowed_origins = [origin for origin in allowed_origins if origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "message": "EcoDynamix Core is online."}
