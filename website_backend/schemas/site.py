from pydantic import BaseModel
from typing import Optional


class SiteSettingsOut(BaseModel):
    logo_url: Optional[str]
    hero_slogan: str
    hero_media_url: Optional[str]
    about_title: str
    about_content: str
    address: str
    phone: Optional[str] = None
    work_hours: str
    map_embed_url: str
    whatsapp_phone: Optional[str] = None
    whatsapp_default_message: str
    seo_title: str
    seo_description: str
    seo_og_image_url: Optional[str]


class SocialMediaOut(BaseModel):
    id: int
    type: str
    url: str
    name: Optional[str]


class AdvantageOut(BaseModel):
    id: int
    icon: str
    title: str
    description: str
    order: int


class ReviewOut(BaseModel):
    id: int
    author_name: str
    author_photo_url: Optional[str]
    rating: int
    source: str
    text: str
    created_at: str
    order: int
