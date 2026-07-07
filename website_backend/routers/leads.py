from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import ClubCard, Lead, Section, Stuff
from schemas.leads import LeadCreate, LeadCreateOut
from services.telegram import send_lead_notification

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.post("/", response_model=LeadCreateOut, status_code=201)
async def create_lead(data: LeadCreate, db: Session = Depends(get_db)):
    lead = Lead(
        name=data.name,
        phone=data.phone,
        comment=data.comment or "",
        related_trainer_id=data.related_trainer_id,
        related_card_id=data.related_card_id,
        related_section_id=data.related_section_id,
        source_page=data.source_page or "",
        status="new",
        sent_to_telegram=False,
        created_at=datetime.now(tz=timezone.utc),
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    service_label = _resolve_service(data, db)

    sent = await send_lead_notification(
        name=data.name,
        phone=data.phone,
        comment=data.comment or "",
        service=service_label,
        source_page=data.source_page or "",
    )

    if sent:
        lead.sent_to_telegram = True
        db.commit()

    return LeadCreateOut(id=lead.id, message="Заявка принята. Мы свяжемся с вами в ближайшее время.")


def _resolve_service(data: LeadCreate, db: Session) -> str:
    if data.related_trainer_id:
        trainer = db.query(Stuff).filter(Stuff.id == data.related_trainer_id).first()
        if trainer:
            return f"Запись к тренеру: {trainer.name_ru}"
    if data.related_card_id:
        card = db.query(ClubCard).filter(ClubCard.id == data.related_card_id).first()
        if card:
            return f"Клубная карта: {card.name_ru}"
    if data.related_section_id:
        section = db.query(Section).filter(Section.id == data.related_section_id).first()
        if section:
            return f"Секция: {section.name_ru}"
    return ""
