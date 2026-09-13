from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import User, Category, MenuItem
from app.routers import auth, categories, menu

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cafe Backend API",
    description="Cafe Kitchen Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(menu.router)


@app.get("/")
def root():
    return {
        "message": "Cafe Backend API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "UP"
    }
