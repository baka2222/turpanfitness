import asyncio

from bot import bot, dp
from handlers.faq_handler import faq_router
from handlers.review_handler import review_router
from handlers.start_handler import start_router


async def main():
    dp.include_router(start_router)
    dp.include_router(faq_router)
    dp.include_router(review_router)
    await dp.start_polling(bot, skip_updates=True)


if __name__ == '__main__':
    asyncio.run(main())
