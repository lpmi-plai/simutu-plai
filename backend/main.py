# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# -----------------------------
# ROUTERS
# -----------------------------
from routers import (
    ketersediaan,
    indikator_lembaga,
)

app = FastAPI(title="SIMUTU PLAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://simutu-plai-lime.vercel.app",
        "https://simutu-plai-cgfkyxoqi-simutu-plai.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["GET", "PUT", "OPTIONS"],
    allow_headers=["*"],
)

# -----------------------------
# BASIC ENDPOINTS
# -----------------------------
@app.get("/")
def root():
    return {"message": "FastAPI is running"}

# -----------------------------
# REGISTER ROUTERS
# -----------------------------
app.include_router(ketersediaan.router)
app.include_router(indikator_lembaga.router)
