from datetime import date, datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class BotUser(Base):
    __tablename__ = 'bot_app_botuser'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tg_id: Mapped[int] = mapped_column(BigInteger, unique=True)
    name: Mapped[str] = mapped_column(String(255), default='')
    language: Mapped[str] = mapped_column(String(2), default='ru')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class FAQCategory(Base):
    __tablename__ = 'bot_app_faqcategory'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name_ru: Mapped[str] = mapped_column(String(100))
    name_en: Mapped[str] = mapped_column(String(100), default='')
    name_kg: Mapped[str] = mapped_column(String(100), default='')
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    order: Mapped[int] = mapped_column('order', Integer, default=0)

    items = relationship('FAQ', back_populates='category')


class FAQ(Base):
    __tablename__ = 'bot_app_faq'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey('bot_app_faqcategory.id', ondelete='CASCADE')
    )
    question_ru: Mapped[str] = mapped_column(String(255))
    question_en: Mapped[str] = mapped_column(String(255), default='')
    question_kg: Mapped[str] = mapped_column(String(255), default='')
    answer_ru: Mapped[str] = mapped_column(Text)
    answer_en: Mapped[str] = mapped_column(Text, default='')
    answer_kg: Mapped[str] = mapped_column(Text, default='')
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    order: Mapped[int] = mapped_column('order', Integer, default=0)

    category = relationship('FAQCategory', back_populates='items')


class Review(Base):
    __tablename__ = 'website_app_review'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order: Mapped[int] = mapped_column('order', Integer, default=0)
    author_name: Mapped[str] = mapped_column(String(150))
    author_photo: Mapped[str] = mapped_column(String(100), nullable=True)
    rating: Mapped[int] = mapped_column(SmallInteger, default=5)
    source: Mapped[str] = mapped_column(String(20), default='manual')
    text_ru: Mapped[str] = mapped_column(Text, default='')
    text_en: Mapped[str] = mapped_column(Text, default='')
    text_kg: Mapped[str] = mapped_column(Text, default='')
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[date] = mapped_column(Date, default=date.today)
