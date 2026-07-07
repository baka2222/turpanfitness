from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message

from database.repository import create_review, get_user_language
from keyboards import back_to_menu_kb, main_menu_kb
from languages import MENU_LABELS, t

review_router = Router()


class ReviewStates(StatesGroup):
    waiting_rating = State()
    waiting_text = State()


def rating_kb(lang: str) -> InlineKeyboardMarkup:
    stars = [
        InlineKeyboardButton(text='⭐' * n, callback_data=f'review_rate_{n}')
        for n in range(1, 6)
    ]
    return InlineKeyboardMarkup(
        inline_keyboard=[[star] for star in stars]
        + [[InlineKeyboardButton(text=t(lang, 'review_cancel'), callback_data='review_cancel')]]
    )


def cancel_kb(lang: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=t(lang, 'review_cancel'), callback_data='review_cancel')]
        ]
    )


@review_router.callback_query(F.data == 'leave_review')
async def start_review(callback: CallbackQuery, state: FSMContext):
    lang = await get_user_language(callback)
    await state.set_state(ReviewStates.waiting_rating)
    await callback.message.delete()
    await callback.message.answer(t(lang, 'review_choose_rating'), reply_markup=rating_kb(lang))
    await callback.answer()


@review_router.callback_query(ReviewStates.waiting_rating, F.data.startswith('review_rate_'))
async def review_rating(callback: CallbackQuery, state: FSMContext):
    lang = await get_user_language(callback)
    rating = int(callback.data.split('_')[-1])
    await state.update_data(rating=rating)
    await state.set_state(ReviewStates.waiting_text)
    await callback.message.delete()
    await callback.message.answer(
        f"{'⭐' * rating}\n\n{t(lang, 'review_enter_text')}", reply_markup=cancel_kb(lang)
    )
    await callback.answer()


@review_router.callback_query(F.data == 'review_cancel')
async def review_cancel(callback: CallbackQuery, state: FSMContext):
    lang = await get_user_language(callback)
    await state.clear()
    await callback.message.delete()
    await callback.message.answer(t(lang, 'review_cancelled'), reply_markup=main_menu_kb(lang))
    await callback.answer()


@review_router.message(ReviewStates.waiting_text)
async def review_text(message: Message, state: FSMContext):
    lang = await get_user_language(message)

    if not message.text or message.text.startswith('/') or message.text in MENU_LABELS:
        await state.clear()
        await message.answer(t(lang, 'review_cancelled'), reply_markup=main_menu_kb(lang))
        return

    data = await state.get_data()
    rating = data.get('rating', 5)
    author_name = message.from_user.full_name or t(lang, 'friend')

    await create_review(author_name=author_name, rating=rating, text=message.text, language=lang)
    await state.clear()
    await message.answer(t(lang, 'review_thanks'), reply_markup=back_to_menu_kb(lang))
