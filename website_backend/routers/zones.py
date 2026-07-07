from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload

from database import get_db
from deps import lang_dep, media_url
from models import Zone
from schemas.common import loc
from schemas.zones import GalleryImageOut, ZoneDetailOut, ZoneFeatureOut, ZoneOut

router = APIRouter(prefix="/zones", tags=["Zones"])


def _build_zone(z: Zone, request: Request, lang: str) -> ZoneOut:
    return ZoneOut(
        id=z.id,
        name=loc(z, "name", lang),
        description=loc(z, "description", lang),
        cover_image_url=media_url(request, z.cover_image),
        video_tour_url=media_url(request, z.video_tour),
        order=z.order,
        features=[
            ZoneFeatureOut(
                id=f.id,
                icon=f.icon or "",
                text=loc(f, "text", lang),
                order=f.order,
            )
            for f in z.features
        ],
    )


@router.get("/", response_model=list[ZoneOut])
def list_zones(
    request: Request,
    lang: str = Depends(lang_dep),
    db: Session = Depends(get_db),
):
    zones = (
        db.query(Zone)
        .options(joinedload(Zone.features))
        .filter(Zone.is_published == True)
        .order_by(Zone.order)
        .all()
    )
    return [_build_zone(z, request, lang) for z in zones]


@router.get("/{zone_id}", response_model=ZoneDetailOut)
def get_zone(
    zone_id: int,
    request: Request,
    lang: str = Depends(lang_dep),
    db: Session = Depends(get_db),
):
    z = (
        db.query(Zone)
        .options(joinedload(Zone.features), joinedload(Zone.gallery_images))
        .filter(Zone.id == zone_id, Zone.is_published == True)
        .first()
    )
    if not z:
        raise HTTPException(status_code=404, detail="Зона не найдена")

    base = _build_zone(z, request, lang)
    return ZoneDetailOut(
        **base.model_dump(),
        gallery=[
            GalleryImageOut(
                id=img.id,
                image_url=media_url(request, img.image),
                caption=loc(img, "caption", lang),
                order=img.order,
            )
            for img in z.gallery_images
        ],
    )
