from sqlalchemy import (
    Boolean, Column, Date, DateTime, ForeignKey,
    Integer, Numeric, SmallInteger, String, Table, Text, Time,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


_stuff_specs = Table(
    "website_app_stuff_specializations",
    Base.metadata,
    Column("stuff_id", Integer, ForeignKey("website_app_stuff.id")),
    Column("trainerspecialization_id", Integer, ForeignKey("website_app_trainerspecialization.id")),
)


class SiteSettings(Base):
    __tablename__ = "website_app_sitesettings"

    id = Column(Integer, primary_key=True)
    logo = Column(String)
    hero_slogan_ru = Column(String)
    hero_slogan_en = Column(String)
    hero_slogan_kg = Column(String)
    hero_media = Column(String)
    about_title_ru = Column(String)
    about_title_en = Column(String)
    about_title_kg = Column(String)
    about_content_ru = Column(Text)
    about_content_en = Column(Text)
    about_content_kg = Column(Text)
    address_ru = Column(String)
    address_en = Column(String)
    address_kg = Column(String)
    work_hours_ru = Column(String)
    work_hours_en = Column(String)
    work_hours_kg = Column(String)
    map_embed_url = Column(String)
    telegram_admin_chat_id = Column(String)
    whatsapp_default_message_ru = Column(String)
    whatsapp_default_message_en = Column(String)
    whatsapp_default_message_kg = Column(String)
    seo_title_ru = Column(String)
    seo_title_en = Column(String)
    seo_title_kg = Column(String)
    seo_description_ru = Column(Text)
    seo_description_en = Column(Text)
    seo_description_kg = Column(Text)
    seo_og_image = Column(String)
    phone = Column(String, nullable=True)
    whatsapp_phone = Column(String, nullable=True)


class SocialMedia(Base):
    __tablename__ = "website_app_socialmedia"

    id = Column(Integer, primary_key=True)
    type = Column(String)
    url = Column(String)
    name_ru = Column(String, nullable=True)
    name_en = Column(String, nullable=True)
    name_kg = Column(String, nullable=True)


class Advantage(Base):
    __tablename__ = "website_app_advantage"

    id = Column(Integer, primary_key=True)
    order = Column(Integer, default=0)
    icon = Column(String)
    title_ru = Column(String)
    title_en = Column(String)
    title_kg = Column(String)
    description_ru = Column(String)
    description_en = Column(String)
    description_kg = Column(String)


class SectionCategory(Base):
    __tablename__ = "website_app_sectioncategory"

    id = Column(Integer, primary_key=True)
    name_ru = Column(String)
    name_en = Column(String)
    name_kg = Column(String)
    color = Column(String)
    icon = Column(String)
    order = Column(Integer, default=0)


class Zone(Base):
    __tablename__ = "website_app_zone"

    id = Column(Integer, primary_key=True)
    name_ru = Column(String)
    name_en = Column(String)
    name_kg = Column(String)
    description_ru = Column(Text)
    description_en = Column(Text)
    description_kg = Column(Text)
    cover_image = Column(String, nullable=True)
    video_tour = Column(String, nullable=True)
    is_published = Column(Boolean, default=True)
    order = Column(Integer, default=0)

    features = relationship("ZoneFeature", back_populates="zone", order_by="ZoneFeature.order")
    gallery_images = relationship("GalleryImage", back_populates="zone", order_by="GalleryImage.order")


class ZoneFeature(Base):
    __tablename__ = "website_app_zonefeature"

    id = Column(Integer, primary_key=True)
    zone_id = Column(Integer, ForeignKey("website_app_zone.id"))
    order = Column(Integer, default=0)
    icon = Column(String)
    text_ru = Column(String)
    text_en = Column(String)
    text_kg = Column(String)

    zone = relationship("Zone", back_populates="features")


class GalleryImage(Base):
    __tablename__ = "website_app_galleryimage"

    id = Column(Integer, primary_key=True)
    zone_id = Column(Integer, ForeignKey("website_app_zone.id"), nullable=True)
    order = Column(Integer, default=0)
    image = Column(String)
    caption_ru = Column(String)
    caption_en = Column(String)
    caption_kg = Column(String)

    zone = relationship("Zone", back_populates="gallery_images")


class Review(Base):
    __tablename__ = "website_app_review"

    id = Column(Integer, primary_key=True)
    order = Column(Integer, default=0)
    author_name = Column(String)
    author_photo = Column(String, nullable=True)
    rating = Column(SmallInteger)
    source = Column(String)
    text_ru = Column(Text)
    text_en = Column(Text)
    text_kg = Column(Text)
    is_published = Column(Boolean, default=True)
    created_at = Column(Date)


class StuffCategory(Base):
    __tablename__ = "website_app_stuffcategory"

    id = Column(Integer, primary_key=True)
    is_coaches = Column(Boolean, default=False)
    name_ru = Column(String)
    name_en = Column(String)
    name_kg = Column(String)


class TrainerSpecialization(Base):
    __tablename__ = "website_app_trainerspecialization"

    id = Column(Integer, primary_key=True)
    order = Column(Integer, default=0)
    name_ru = Column(String)
    name_en = Column(String)
    name_kg = Column(String)
    icon = Column(String)


class Stuff(Base):
    __tablename__ = "website_app_stuff"

    id = Column(Integer, primary_key=True)
    stuff_category_id = Column(Integer, ForeignKey("website_app_stuffcategory.id"))
    name_ru = Column(String)
    name_en = Column(String)
    name_kg = Column(String)
    position_ru = Column(String)
    position_en = Column(String)
    position_kg = Column(String)
    photo = Column(String, nullable=True)
    experience_years = Column(SmallInteger, nullable=True)
    description_ru = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
    description_kg = Column(Text, nullable=True)
    is_published = Column(Boolean, default=True)
    order = Column(Integer, default=0)

    stuff_category = relationship("StuffCategory")
    specializations = relationship("TrainerSpecialization", secondary=_stuff_specs)
    achievements = relationship("Achievement", back_populates="stuff", order_by="Achievement.order")
    certificates = relationship("Certificate", back_populates="stuff", order_by="Certificate.order")


class Achievement(Base):
    __tablename__ = "website_app_achievement"

    id = Column(Integer, primary_key=True)
    stuff_id = Column(Integer, ForeignKey("website_app_stuff.id"))
    order = Column(Integer, default=0)
    text_ru = Column(String)
    text_en = Column(String)
    text_kg = Column(String)

    stuff = relationship("Stuff", back_populates="achievements")


class Certificate(Base):
    __tablename__ = "website_app_certificate"

    id = Column(Integer, primary_key=True)
    stuff_id = Column(Integer, ForeignKey("website_app_stuff.id"))
    order = Column(Integer, default=0)
    title_ru = Column(String)
    title_en = Column(String)
    title_kg = Column(String)
    image = Column(String)

    stuff = relationship("Stuff", back_populates="certificates")


class Section(Base):
    __tablename__ = "website_app_section"

    id = Column(Integer, primary_key=True)
    section_category_id = Column(Integer, ForeignKey("website_app_sectioncategory.id"))
    coach_id = Column(Integer, ForeignKey("website_app_stuff.id"))
    zone_id = Column(Integer, ForeignKey("website_app_zone.id"))
    name_ru = Column(String)
    name_en = Column(String)
    name_kg = Column(String)
    description_ru = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
    description_kg = Column(Text, nullable=True)
    image = Column(String, nullable=True)
    background_video = Column(String, nullable=True)
    is_published = Column(Boolean, default=True)
    order = Column(Integer, default=0)

    section_category = relationship("SectionCategory")
    coach = relationship("Stuff", foreign_keys=[coach_id])
    zone = relationship("Zone")
    slots = relationship("SectionSlot", back_populates="section")


class SectionSlot(Base):
    __tablename__ = "website_app_sectionslot"

    id = Column(Integer, primary_key=True)
    section_id = Column(Integer, ForeignKey("website_app_section.id"))
    day_of_week = Column(Integer)
    start_time = Column(Time)
    end_time = Column(Time)
    is_active = Column(Boolean, default=True)

    section = relationship("Section", back_populates="slots")
    exceptions = relationship("SectionSlotException", back_populates="slot")


class SectionSlotException(Base):
    __tablename__ = "website_app_sectionslotexception"

    id = Column(Integer, primary_key=True)
    slot_id = Column(Integer, ForeignKey("website_app_sectionslot.id"))
    date = Column(Date)
    reason_ru = Column(String)
    reason_en = Column(String)
    reason_kg = Column(String)

    slot = relationship("SectionSlot", back_populates="exceptions")


class ClubCard(Base):
    __tablename__ = "website_app_clubcard"

    id = Column(Integer, primary_key=True)
    card_type = Column(Integer)
    name_ru = Column(String)
    name_en = Column(String)
    name_kg = Column(String)
    description_ru = Column(Text)
    description_en = Column(Text)
    description_kg = Column(Text)
    price = Column(Numeric(10, 2))
    old_price = Column(Numeric(10, 2), nullable=True)
    is_popular = Column(Boolean, default=False)
    image = Column(String, nullable=True)
    background_video = Column(String, nullable=True)
    is_published = Column(Boolean, default=True)
    order = Column(Integer, default=0)

    features = relationship("ClubCardFeature", back_populates="club_card", order_by="ClubCardFeature.order")


class ClubCardFeature(Base):
    __tablename__ = "website_app_clubcardfeature"

    id = Column(Integer, primary_key=True)
    club_card_id = Column(Integer, ForeignKey("website_app_clubcard.id"))
    order = Column(Integer, default=0)
    text_ru = Column(String)
    text_en = Column(String)
    text_kg = Column(String)

    club_card = relationship("ClubCard", back_populates="features")


class News(Base):
    __tablename__ = "website_app_news"

    id = Column(Integer, primary_key=True)
    category = Column(String)
    slug = Column(String, unique=True)
    title_ru = Column(String)
    title_en = Column(String)
    title_kg = Column(String)
    excerpt_ru = Column(String)
    excerpt_en = Column(String)
    excerpt_kg = Column(String)
    content_ru = Column(Text)
    content_en = Column(Text)
    content_kg = Column(Text)
    cover_image = Column(String)
    is_published = Column(Boolean, default=True)
    published_at = Column(DateTime)


class Lead(Base):
    __tablename__ = "website_app_lead"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    phone = Column(String)
    comment = Column(Text, default="")
    related_trainer_id = Column(Integer, ForeignKey("website_app_stuff.id"), nullable=True)
    related_card_id = Column(Integer, ForeignKey("website_app_clubcard.id"), nullable=True)
    related_section_id = Column(Integer, ForeignKey("website_app_section.id"), nullable=True)
    source_page = Column(String, default="")
    status = Column(String, default="new")
    sent_to_telegram = Column(Boolean, default=False)
    created_at = Column(DateTime)

    related_trainer = relationship("Stuff", foreign_keys=[related_trainer_id])
    related_card = relationship("ClubCard", foreign_keys=[related_card_id])
    related_section = relationship("Section", foreign_keys=[related_section_id])
