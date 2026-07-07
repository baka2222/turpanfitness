from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


_CARD_TYPE_LABELS = {0: "monthly", 1: "half_year", 2: "annual", 3: "corporate"}


class CardFeatureOut(BaseModel):
    id: int
    text: str
    order: int


class ClubCardOut(BaseModel):
    id: int
    card_type: int
    card_type_label: str
    name: str
    description: str
    price: Decimal
    old_price: Optional[Decimal]
    is_popular: bool
    image_url: Optional[str]
    order: int
    features: list[CardFeatureOut]
