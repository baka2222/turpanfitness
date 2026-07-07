from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session, joinedload

from database import get_db
from deps import lang_dep, media_url
from models import ClubCard
from schemas.cards import CardFeatureOut, ClubCardOut
from schemas.common import loc

router = APIRouter(prefix="/club-cards", tags=["Club Cards"])

_CARD_TYPE_LABEL = {0: "monthly", 1: "half_year", 2: "annual", 3: "corporate"}


@router.get("/", response_model=list[ClubCardOut])
def list_club_cards(
    request: Request,
    lang: str = Depends(lang_dep),
    db: Session = Depends(get_db),
):
    cards = (
        db.query(ClubCard)
        .options(joinedload(ClubCard.features))
        .filter(ClubCard.is_published == True)
        .order_by(ClubCard.order)
        .all()
    )
    return [
        ClubCardOut(
            id=c.id,
            card_type=c.card_type,
            card_type_label=_CARD_TYPE_LABEL.get(c.card_type, "unknown"),
            name=loc(c, "name", lang),
            description=loc(c, "description", lang),
            price=c.price,
            old_price=c.old_price,
            is_popular=c.is_popular,
            image_url=media_url(request, c.image),
            order=c.order,
            features=[
                CardFeatureOut(
                    id=f.id,
                    text=loc(f, "text", lang),
                    order=f.order,
                )
                for f in c.features
            ],
        )
        for c in cards
    ]
