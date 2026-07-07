from typing import List, Optional, Union

from aiogram.types import CallbackQuery, Message
from sqlalchemy import select

from config import DEFAULT_LANGUAGE, LANGUAGES
from .engine import async_session
from .models import FAQ, BotUser, FAQCategory, Review

TelegramEvent = Union[Message, CallbackQuery]


async def get_user_by_tg_id(tg_id: int) -> Optional[BotUser]:
    async with async_session() as session:
        result = await session.execute(
            select(BotUser).where(BotUser.tg_id == tg_id)
        )
        return result.scalars().first()


async def get_or_create_user(tg_id: int, name: str = '') -> BotUser:
    async with async_session() as session:
        result = await session.execute(
            select(BotUser).where(BotUser.tg_id == tg_id)
        )
        user = result.scalars().first()
        if user:
            if name and user.name != name:
                user.name = name
                await session.commit()
                await session.refresh(user)
            return user

        user = BotUser(tg_id=tg_id, name=name, language=DEFAULT_LANGUAGE)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


async def get_user_language(event: TelegramEvent) -> str:
    user = await get_user_by_tg_id(event.from_user.id)
    if user and user.language in LANGUAGES:
        return user.language
    return DEFAULT_LANGUAGE


async def set_user_language(tg_id: int, language: str) -> Optional[BotUser]:
    async with async_session() as session:
        result = await session.execute(
            select(BotUser).where(BotUser.tg_id == tg_id)
        )
        user = result.scalars().first()
        if not user:
            return None
        user.language = language
        await session.commit()
        await session.refresh(user)
        return user


async def list_faq_categories() -> List[FAQCategory]:
    async with async_session() as session:
        result = await session.execute(
            select(FAQCategory)
            .where(FAQCategory.is_published == True)
            .order_by(FAQCategory.order, FAQCategory.id)
        )
        return result.scalars().all()


async def list_faqs_by_category(category_id: int) -> List[FAQ]:
    async with async_session() as session:
        result = await session.execute(
            select(FAQ)
            .where(FAQ.category_id == category_id, FAQ.is_published == True)
            .order_by(FAQ.order, FAQ.id)
        )
        return result.scalars().all()


async def get_faq_by_id(faq_id: int) -> Optional[FAQ]:
    async with async_session() as session:
        result = await session.execute(select(FAQ).where(FAQ.id == faq_id))
        return result.scalars().first()


async def create_review(author_name: str, rating: int, text: str, language: str) -> Review:
    async with async_session() as session:
        review = Review(
            author_name=author_name,
            rating=rating,
            source='manual',
            is_published=False,
        )
        setattr(review, f'text_{language}', text)
        session.add(review)
        await session.commit()
        await session.refresh(review)
        return review
