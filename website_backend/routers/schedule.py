from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session, joinedload

from database import get_db
from deps import lang_dep, media_url
from models import Section, SectionCategory, SectionSlot, Stuff
from schemas.common import loc
from schemas.schedule import ScheduleSessionOut, SessionCategoryOut, SessionCoachOut, SessionZoneOut

router = APIRouter(tags=["Schedule"])


def _week_dates(week_offset: int = 0) -> list[date]:
    today = date.today()
    monday = today - timedelta(days=today.weekday()) + timedelta(weeks=week_offset)
    return [monday + timedelta(days=i) for i in range(7)]


def _cat_out(cat: SectionCategory, lang: str) -> SessionCategoryOut:
    return SessionCategoryOut(
        id=cat.id,
        name=loc(cat, "name", lang),
        color=cat.color or "#E30613",
        icon=cat.icon or "",
    )


def _coach_out(coach: Stuff, request: Request, lang: str) -> SessionCoachOut:
    return SessionCoachOut(
        id=coach.id,
        name=loc(coach, "name", lang),
        photo_url=media_url(request, coach.photo),
    )


@router.get("/schedule", response_model=list[ScheduleSessionOut])
def get_schedule(
    request: Request,
    week_offset: int = Query(default=0, description="0=текущая, -1=прошлая, 1=следующая неделя"),
    day: Optional[int] = Query(default=None, ge=0, le=6, description="0=Пн, 6=Вс"),
    category_id: Optional[int] = Query(default=None),
    trainer_id: Optional[int] = Query(default=None),
    lang: str = Depends(lang_dep),
    db: Session = Depends(get_db),
):
    dates = _week_dates(week_offset)
    if day is not None:
        dates = [d for d in dates if d.weekday() == day]

    q = (
        db.query(SectionSlot)
        .options(
            joinedload(SectionSlot.section).joinedload(Section.section_category),
            joinedload(SectionSlot.section).joinedload(Section.coach),
            joinedload(SectionSlot.section).joinedload(Section.zone),
            joinedload(SectionSlot.exceptions),
        )
        .join(Section)
        .filter(SectionSlot.is_active == True, Section.is_published == True)
    )
    if category_id:
        q = q.filter(Section.section_category_id == category_id)
    if trainer_id:
        q = q.filter(Section.coach_id == trainer_id)

    slots = q.all()
    exceptions_map: dict[tuple[int, date], object] = {}
    for slot in slots:
        for exc in slot.exceptions:
            exceptions_map[(slot.id, exc.date)] = exc

    sessions: list[ScheduleSessionOut] = []
    for target_date in dates:
        dow = target_date.weekday()
        for slot in slots:
            if slot.day_of_week != dow:
                continue
            s = slot.section
            exc = exceptions_map.get((slot.id, target_date))
            sessions.append(
                ScheduleSessionOut(
                    slot_id=slot.id,
                    date=str(target_date),
                    day_of_week=dow,
                    start_time=str(slot.start_time)[:5] if slot.start_time else "",
                    end_time=str(slot.end_time)[:5] if slot.end_time else "",
                    section_id=s.id,
                    section_name=loc(s, "name", lang),
                    section_description=loc(s, "description", lang),
                    section_image_url=media_url(request, s.image),
                    category=_cat_out(s.section_category, lang),
                    coach=_coach_out(s.coach, request, lang),
                    zone=SessionZoneOut(id=s.zone.id, name=loc(s.zone, "name", lang)),
                    is_cancelled=exc is not None,
                    cancel_reason=loc(exc, "reason", lang) or "" if exc else "",
                )
            )

    sessions.sort(key=lambda x: (x.date, x.start_time))
    return sessions
