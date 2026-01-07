import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import routes_food, routes_regions, routes_trends, routes_analysis


app = FastAPI(
    title="FOODINSIGHTPH API",
    description="Backend for food inflation visualization",
)

cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000")
allow_origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_food.router)
app.include_router(routes_regions.router)
app.include_router(routes_trends.router)
app.include_router(routes_analysis.router)
