from pydantic import BaseModel
from typing import Optional


class SpecializationOut(BaseModel):
    id: int
    name: str
    icon: str
    order: int


class AchievementOut(BaseModel):
    id: int
    text: str
    order: int


class CertificateOut(BaseModel):
    id: int
    title: str
    image_url: Optional[str]
    order: int


class TrainerOut(BaseModel):
    id: int
    name: str
    position: str
    photo_url: Optional[str]
    experience_years: Optional[int]
    category_id: int
    category_name: str
    is_coach: bool
    description: str
    specializations: list[SpecializationOut]
    achievements: list[AchievementOut]
    order: int


class TrainerDetailOut(TrainerOut):
    certificates: list[CertificateOut]
