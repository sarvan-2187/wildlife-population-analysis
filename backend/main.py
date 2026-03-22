from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router

app = FastAPI(
    title="Wildlife Population Analysis API",
    description="Backend for the Global Wildlife Intelligence dashboard and Portable RAG.",
    version="1.0.0"
)

# Configure CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "message": "Wildlife Engine is online."}
