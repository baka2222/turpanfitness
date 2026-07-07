from pydantic import BaseModel, field_validator
from typing import Optional
import re


class LeadCreate(BaseModel):
    name: str
    phone: str
    comment: Optional[str] = ""
    related_trainer_id: Optional[int] = None
    related_card_id: Optional[int] = None
    related_section_id: Optional[int] = None
    source_page: Optional[str] = ""

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Имя обязательно")
        return v

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        v = v.strip()
        digits = re.sub(r"\D", "", v)
        if len(digits) < 7:
            raise ValueError("Некорректный номер телефона")
        return v


class LeadCreateOut(BaseModel):
    id: int
    message: str
