from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
)

from languages import t


def main_menu_kb(lang: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=f"❓ {t(lang, 'faq')}", callback_data='faq')],
            [InlineKeyboardButton(text=f"⭐ {t(lang, 'leave_review')}", callback_data='leave_review')],
            [InlineKeyboardButton(text=f"🌐 {t(lang, 'language_change')}", callback_data='language_change')],
        ]
    )


def menu_reply_kb(lang: str) -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text=t(lang, 'menu'))]],
        resize_keyboard=True,
    )


def language_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text='🇷🇺 Русский', callback_data='set_lang_ru')],
            [InlineKeyboardButton(text='🇬🇧 English', callback_data='set_lang_en')],
            [InlineKeyboardButton(text='🇰🇬 Кыргызча', callback_data='set_lang_kg')],
        ]
    )


def back_to_menu_kb(lang: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=t(lang, 'back_to_menu'), callback_data='back_to_menu')]
        ]
    )
