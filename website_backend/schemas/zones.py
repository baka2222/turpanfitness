from pydantic import BaseModel
from typing import Optional


class ZoneFeatureOut(BaseModel):
    id: int
    icon: str
    text: str
    order: int


class GalleryImageOut(BaseModel):
    id: int
    image_url: Optional[str]
    caption: str
    order: int


class ZoneOut(BaseModel):
    id: int
    name: str
    description: str
    cover_image_url: Optional[str]
    video_tour_url: Optional[str]
    order: int
    features: list[ZoneFeatureOut]


class ZoneDetailOut(ZoneOut):
    gallery: list[GalleryImageOut]
