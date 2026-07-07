from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from database import get_db
from deps import lang_dep, media_url
from models import News
from schemas.common import loc
from schemas.news import NewsDetailOut, NewsListItemOut, PaginatedNewsOut

router = APIRouter(prefix="/news", tags=["News"])


def _news_list_item(n: News, request: Request, lang: str) -> NewsListItemOut:
    return NewsListItemOut(
        id=n.id,
        slug=n.slug,
        category=n.category,
        title=loc(n, "title", lang),
        excerpt=loc(n, "excerpt", lang),
        cover_image_url=media_url(request, n.cover_image),
        published_at=str(n.published_at) if n.published_at else "",
    )
 

@router.get("/", response_model=PaginatedNewsOut)
def list_news(
    request: Request,
    lang: str = Depends(lang_dep),
    category: Optional[str] = Query(default=None, description="news | promo | event"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=9, ge=1, le=50),
    db: Session = Depends(get_db),
):
    q = db.query(News).filter(News.is_published == True)
    if category:
        q = q.filter(News.category == category)
    q = q.order_by(News.published_at.desc())

    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedNewsOut(
        total=total,
        page=page,
        page_size=page_size,
        results=[_news_list_item(n, request, lang) for n in items],
    )


@router.get("/{slug}", response_model=NewsDetailOut)
def get_news(
    slug: str,
    request: Request,
    lang: str = Depends(lang_dep),
    db: Session = Depends(get_db),
):
    n = db.query(News).filter(News.slug == slug, News.is_published == True).first()
    if not n:
        raise HTTPException(status_code=404, detail="Новость не найдена")

    base = _news_list_item(n, request, lang)
    return NewsDetailOut(
        **base.model_dump(),
        content=loc(n, "content", lang),
    )
