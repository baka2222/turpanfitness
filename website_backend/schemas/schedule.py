from pydantic import BaseModel
from typing import Optional


class SessionCategoryOut(BaseModel):
    id: int
    name: str
    color: str
    icon: str


class SessionCoachOut(BaseModel):
    id: int
    name: str
    photo_url: Optional[str]


class SessionZoneOut(BaseModel):
    id: int
    name: str


class ScheduleSessionOut(BaseModel):
    slot_id: int
    date: str
    day_of_week: int
    start_time: str
    end_time: str
    section_id: int
    section_name: str
    section_description: str
    section_image_url: Optional[str]
    category: SessionCategoryOut
    coach: SessionCoachOut
    zone: SessionZoneOut
    is_cancelled: bool = False
    cancel_reason: str = ""
