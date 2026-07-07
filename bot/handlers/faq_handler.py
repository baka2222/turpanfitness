from aiogram import F, Router
from aiogram.types import CallbackQuery, InlineKeyboardButton
from aiogram_widgets.pagination import KeyboardPaginator

from database.repository import (
    get_faq_by_id,
    get_user_language,
    list_faq_categories,
    list_faqs_by_category,
)
from keyboards import back_to_menu_kb
from languages import loc, t

faq_router = Router()


@faq_router.callback_query(F.data == 'faq')
async def faq_categories(callback: CallbackQuery):
    lang = await get_user_language(callback)
    categories = await list_faq_categories()

    if not categories:
        await callback.message.delete()
        await callback.message.answer(
            t(lang, 'faq_no_categories'), reply_markup=back_to_menu_kb(lang)
        )
        await callback.answer()
        return

    buttons = [
        InlineKeyboardButton(
            text=loc(category, 'name', lang),
            callback_data=f'faq_category_{category.id}',
        )
        for category in categories
    ]

    paginator = KeyboardPaginator(router=faq_router, data=buttons, per_page=6, per_row=1)

    await callback.message.delete()
    await callback.message.answer(
        t(lang, 'faq_choose_category'), reply_markup=paginator.as_markup()
    )
    await callback.answer()


@faq_router.callback_query(F.data.startswith('faq_category_'))
async def faq_questions(callback: CallbackQuery):
    lang = await get_user_language(callback)
    category_id = int(callback.data.split('_')[-1])
    faqs = await list_faqs_by_category(category_id)

    if not faqs:
        await callback.message.delete()
        await callback.message.answer(
            t(lang, 'faq_no_questions'), reply_markup=back_to_menu_kb(lang)
        )
        await callback.answer()
        return

    buttons = [
        InlineKeyboardButton(
            text=loc(faq, 'question', lang),
            callback_data=f'faq_answer_{faq.id}',
        )
        for faq in faqs
    ]
    buttons.append(
        InlineKeyboardButton(text=t(lang, 'faq_back_categories'), callback_data='faq')
    )

    paginator = KeyboardPaginator(router=faq_router, data=buttons, per_page=6, per_row=1)

    await callback.message.delete()
    await callback.message.answer(
        t(lang, 'faq_choose_question'), reply_markup=paginator.as_markup()
    )
    await callback.answer()


@faq_router.callback_query(F.data.startswith('faq_answer_'))
async def faq_answer(callback: CallbackQuery):
    lang = await get_user_language(callback)
    faq_id = int(callback.data.split('_')[-1])
    faq = await get_faq_by_id(faq_id)

    if not faq:
        await callback.answer(t(lang, 'faq_no_questions'), show_alert=True)
        return

    question = loc(faq, 'question', lang)
    answer = loc(faq, 'answer', lang)

    await callback.message.answer(
        f"<b>{question}</b>\n\n{t(lang, 'faq_answer_prefix')} {answer}",
        reply_markup=back_to_menu_kb(lang),
    )
    await callback.answer()
