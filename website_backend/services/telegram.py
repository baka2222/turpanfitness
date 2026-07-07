import httpx

from config import settings


async def send_lead_notification(
    name: str,
    phone: str,
    comment: str = "",
    service: str = "",
    source_page: str = "",
) -> bool:
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_ADMIN_CHAT_ID:
        return False

    lines = [
        "🔔 *Новая заявка с сайта*",
        "",
        f"👤 *Имя:* {name}",
        f"📞 *Телефон:* `{phone}`",
    ]
    if service:
        lines.append(f"🎯 *Услуга:* {service}")
    if comment:
        lines.append(f"💬 *Комментарий:* {comment}")
    if source_page:
        lines.append(f"📄 *Страница:* {source_page}")

    text = "\n".join(lines)

    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": settings.TELEGRAM_ADMIN_CHAT_ID,
        "text": text,
        "parse_mode": "Markdown",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=payload)
            return resp.status_code == 200
    except Exception:
        return False
