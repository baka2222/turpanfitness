from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from database import get_db
from deps import lang_dep, media_url
from models import Advantage, Review, SiteSettings, SocialMedia
from schemas.common import loc
from schemas.site import AdvantageOut, ReviewOut, SiteSettingsOut, SocialMediaOut

router = APIRouter(tags=["Site"])


@router.get("/settings", response_model=SiteSettingsOut)
def get_settings(
    request: Request,
    lang: str = Depends(lang_dep),
    db: Session = Depends(get_db),
):
    s = db.query(SiteSettings).first()
    if not s:
        return SiteSettingsOut(
            logo_url=None, hero_slogan="", hero_media_url=None,
            about_title="", about_content="", address="", work_hours="",
            map_embed_url="", whatsapp_default_message="",
            seo_title="", seo_description="", seo_og_image_url=None,
        )
    return SiteSettingsOut(
        logo_url=media_url(request, s.logo),
        hero_slogan=loc(s, "hero_slogan", lang),
        hero_media_url=media_url(request, s.hero_media),
        about_title=loc(s, "about_title", lang),
        about_content=loc(s, "about_content", lang),
        address=loc(s, "address", lang),
        phone=getattr(s, "phone", None) or None,
        work_hours=loc(s, "work_hours", lang),
        map_embed_url=s.map_embed_url or "",
        whatsapp_phone=getattr(s, "whatsapp_phone", None) or None,
        whatsapp_default_message=loc(s, "whatsapp_default_message", lang),
        seo_title=loc(s, "seo_title", lang),
        seo_description=loc(s, "seo_description", lang),
        seo_og_image_url=media_url(request, s.seo_og_image),
    )


@router.get("/social-media", response_model=list[SocialMediaOut])
def get_social_media(
    lang: str = Depends(lang_dep),
    db: Session = Depends(get_db),
):
    items = db.query(SocialMedia).all()
    return [
        SocialMediaOut(
            id=sm.id,
            type=sm.type,
            url=sm.url,
            name=loc(sm, "name", lang) or None,
        )
        for sm in items
    ]


@router.get("/advantages", response_model=list[AdvantageOut])
def get_advantages(
    lang: str = Depends(lang_dep),
    db: Session = Depends(get_db),
):
    items = db.query(Advantage).order_by(Advantage.order).all()
    return [
        AdvantageOut(
            id=a.id,
            icon=a.icon or "",
            title=loc(a, "title", lang),
            description=loc(a, "description", lang),
            order=a.order,
        )
        for a in items
    ]


@router.get("/reviews", response_model=list[ReviewOut])
def get_reviews(
    request: Request,
    lang: str = Depends(lang_dep),
    db: Session = Depends(get_db),
):
    items = (
        db.query(Review)
        .filter(Review.is_published == True)
        .order_by(Review.order, Review.created_at.desc())
        .all()
    )
    return [
        ReviewOut(
            id=r.id,
            author_name=r.author_name,
            author_photo_url=media_url(request, r.author_photo),
            rating=r.rating,
            source=r.source,
            text=loc(r, "text", lang),
            created_at=str(r.created_at) if r.created_at else "",
            order=r.order,
        )
        for r in items
    ]
