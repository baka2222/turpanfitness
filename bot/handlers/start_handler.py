from aiogram import F, Router
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from database.repository import get_or_create_user, get_user_language, set_user_language
from keyboards import language_kb, main_menu_kb, menu_reply_kb
from languages import MENU_LABELS, t

start_router = Router()


async def send_main_menu(message: Message, lang: str):
    await message.answer(t(lang, 'menu_title'), reply_markup=main_menu_kb(lang))


@start_router.message(Command('start'))
async def start_command(message: Message, state: FSMContext):
    await state.clear()
    user = await get_or_create_user(message.from_user.id, message.from_user.full_name or '')
    lang = user.language

    await message.answer(
        f"🌟 <b>{t(lang, 'welcome')}, {user.name or t(lang, 'friend')}!</b>\n"
        f"{t(lang, 'menu_activate')}",
        reply_markup=main_menu_kb(lang),
    )
    await message.answer(t(lang, 'menu_tip'), reply_markup=menu_reply_kb(lang))


@start_router.message(F.text.in_(MENU_LABELS))
async def menu_button(message: Message, state: FSMContext):
    await state.clear()
    lang = await get_user_language(message)
    await send_main_menu(message, lang)


@start_router.callback_query(F.data == 'back_to_menu')
async def back_to_menu(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    lang = await get_user_language(callback)
    await callback.message.delete()
    await send_main_menu(callback.message, lang)
    await callback.answer()


@start_router.callback_query(F.data == 'language_change')
async def language_change(callback: CallbackQuery):
    lang = await get_user_language(callback)
    await callback.message.delete()
    await callback.message.answer(t(lang, 'choose_language'), reply_markup=language_kb())
    await callback.answer()


@start_router.callback_query(F.data.startswith('set_lang_'))
async def set_language(callback: CallbackQuery):
    new_lang = callback.data.split('_')[-1]
    await set_user_language(callback.from_user.id, new_lang)

    await callback.message.delete()
    await callback.message.answer(t(new_lang, 'language_set'), reply_markup=menu_reply_kb(new_lang))
    await callback.message.answer(t(new_lang, 'menu_title'), reply_markup=main_menu_kb(new_lang))
    await callback.answer()
