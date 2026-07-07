from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from database import run_migrations
from routers import cards, leads, news, schedule, site, trainers, zones


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    yield


app = FastAPI(
    title="Turpan Fitness API",
    description="REST API для официального сайта фитнес-клуба Turpan Fitness",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|172\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media", StaticFiles(directory=settings.MEDIA_ROOT), name="media")

_PREFIX = "/api"

app.include_router(site.router, prefix=_PREFIX)
app.include_router(zones.router, prefix=_PREFIX)
app.include_router(trainers.router, prefix=_PREFIX)
app.include_router(schedule.router, prefix=_PREFIX)
app.include_router(cards.router, prefix=_PREFIX)
app.include_router(news.router, prefix=_PREFIX)
app.include_router(leads.router, prefix=_PREFIX)


@app.get("/", include_in_schema=False)
def root():
    return {"status": "ok", "docs": "/docs"}
