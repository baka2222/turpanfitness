from django.db import models


class BotUser(models.Model):
    class Language(models.TextChoices):
        RU = 'ru', 'Русский'
        EN = 'en', 'English'
        KG = 'kg', 'Кыргызча'

    tg_id = models.BigIntegerField(verbose_name='Telegram ID', unique=True)
    name = models.CharField(verbose_name='Имя', max_length=255, blank=True)
    language = models.CharField(
        verbose_name='Язык',
        max_length=2,
        choices=Language.choices,
        default=Language.RU
    )
    created_at = models.DateTimeField(verbose_name='Дата регистрации', auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name='Обновлён', auto_now=True)

    def __str__(self):
        return self.name or str(self.tg_id)

    class Meta:
        verbose_name = 'Пользователь бота'
        verbose_name_plural = 'Пользователи бота'
        ordering = ['-created_at']


class FAQCategory(models.Model):
    HELP_TEXT = 'Например: Абонементы, Расписание, Бассейн'

    name_ru = models.CharField(verbose_name='Название категории ru', max_length=100, help_text=HELP_TEXT)
    name_en = models.CharField(verbose_name='Название категории en', max_length=100, blank=True)
    name_kg = models.CharField(verbose_name='Название категории kg', max_length=100, blank=True)

    is_published = models.BooleanField(verbose_name='Показывать в боте', default=True)
    order = models.PositiveIntegerField(
        verbose_name='Порядок отображения',
        default=0,
        help_text='Чем меньше число, тем выше категория в списке.'
    )

    def __str__(self):
        return self.name_ru

    class Meta:
        verbose_name = 'Категория FAQ'
        verbose_name_plural = 'FAQ · Категории'
        ordering = ['order']


class FAQ(models.Model):
    category = models.ForeignKey(
        FAQCategory,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Категория'
    )

    question_ru = models.CharField(verbose_name='Вопрос ru', max_length=255)
    question_en = models.CharField(verbose_name='Вопрос en', max_length=255, blank=True)
    question_kg = models.CharField(verbose_name='Вопрос kg', max_length=255, blank=True)

    answer_ru = models.TextField(verbose_name='Ответ ru')
    answer_en = models.TextField(verbose_name='Ответ en', blank=True)
    answer_kg = models.TextField(verbose_name='Ответ kg', blank=True)

    is_published = models.BooleanField(verbose_name='Показывать в боте', default=True)
    order = models.PositiveIntegerField(
        verbose_name='Порядок отображения',
        default=0,
        help_text='Чем меньше число, тем выше вопрос в списке.'
    )

    def __str__(self):
        return self.question_ru

    class Meta:
        verbose_name = 'Вопрос-ответ'
        verbose_name_plural = 'FAQ · Вопросы и ответы'
        ordering = ['order']
