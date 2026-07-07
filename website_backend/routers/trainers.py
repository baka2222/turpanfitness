from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session, joinedload

from database import get_db
from deps import lang_dep, media_url
from models import Stuff, StuffCategory, TrainerSpecialization
from schemas.common import loc
from schemas.trainers import (
    AchievementOut, CertificateOut, SpecializationOut,
    TrainerDetailOut, TrainerOut,
)

router = APIRouter(prefix="/trainers", tags=["Trainers"])


def _spec_out(sp: TrainerSpecialization, lang: str) -> SpecializationOut:
    return SpecializationOut(
        id=sp.id,
        name=loc(sp, "name", lang),
        icon=sp.icon or "",
        order=sp.order,
    )


def _build_trainer(t: Stuff, request: Request, lang: str) -> TrainerOut:
    category = t.stuff_category
    return TrainerOut(
        id=t.id,
        name=loc(t, "name", lang),
        position=loc(t, "position", lang),
        photo_url=media_url(request, t.photo),
        experience_years=t.experience_years,
        category_id=t.stuff_category_id,
        category_name=loc(category, "name", lang) if category else "",
        is_coach=bool(category and category.is_coaches),
        description=loc(t, "description", lang) or "",
        specializations=[_spec_out(sp, lang) for sp in t.specializations],
        achievements=[
            AchievementOut(id=a.id, text=loc(a, "text", lang), order=a.order)
            for a in t.achievements
        ],
        order=t.order,
    )


@router.get("/specializations", response_model=list[SpecializationOut])
def list_specializations(
    lang: str = Depends(lang_dep),
    db: Session = Depends(get_db),
):
    items = db.query(TrainerSpecialization).order_by(TrainerSpecialization.order).all()
    return [_spec_out(sp, lang) for sp in items]


@router.get("/", response_model=list[TrainerOut])
def list_trainers(
    request: Request,
    lang: str = Depends(lang_dep),
    specialization_id: Optional[int] = Query(default=None),
    category_id: Optional[int] = Query(default=None),
    coaches_only: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    q = (
        db.query(Stuff)
        .options(
            joinedload(Stuff.specializations),
            joinedload(Stuff.achievements),
            joinedload(Stuff.stuff_category),
        )
        .join(StuffCategory)
        .filter(Stuff.is_published == True)
    )
    if coaches_only:
        q = q.filter(StuffCategory.is_coaches == True)
    if category_id:
        q = q.filter(Stuff.stuff_category_id == category_id)
    if specialization_id:
        q = q.filter(
            Stuff.specializations.any(TrainerSpecialization.id == specialization_id)
        )
    trainers = q.order_by(Stuff.order).all()
    return [_build_trainer(t, request, lang) for t in trainers]


@router.get("/{trainer_id}", response_model=TrainerDetailOut)
def get_trainer(
    trainer_id: int,
    request: Request,
    lang: str = Depends(lang_dep),
    db: Session = Depends(get_db),
):
    t = (
        db.query(Stuff)
        .options(
            joinedload(Stuff.specializations),
            joinedload(Stuff.achievements),
            joinedload(Stuff.certificates),
            joinedload(Stuff.stuff_category),
        )
        .filter(Stuff.id == trainer_id, Stuff.is_published == True)
        .first()
    )
    if not t:
        raise HTTPException(status_code=404, detail="Сотрудник не найден")

    base = _build_trainer(t, request, lang)
    return TrainerDetailOut(
        **base.model_dump(),
        certificates=[
            CertificateOut(
                id=c.id,
                title=loc(c, "title", lang),
                image_url=media_url(request, c.image),
                order=c.order,
            )
            for c in t.certificates
        ],
    )
