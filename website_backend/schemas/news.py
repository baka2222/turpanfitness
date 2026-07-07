from pydantic import BaseModel
from typing import Optional


class NewsListItemOut(BaseModel):
    id: int
    slug: str
    category: str
    title: str
    excerpt: str
    cover_image_url: Optional[str]
    published_at: str


class NewsDetailOut(NewsListItemOut):
    content: str


class PaginatedNewsOut(BaseModel):
    total: int
    page: int
    page_size: int
    results: list[NewsListItemOut]
