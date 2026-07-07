from datetime import date, datetime, timedelta

from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from django_ckeditor_5.fields import CKEditor5Field


IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov']
MEDIA_EXTENSIONS = VIDEO_EXTENSIONS + IMAGE_EXTENSIONS + ['gif']

HELP_TEXT_MEDIA = 'Загрузите видео (mp4, webm, mov), GIF или изображение (jpg, png, webp).'


class SortableModel(models.Model):
    order = models.PositiveIntegerField(
        verbose_name='Порядок отображения',
        default=0,
        help_text='Чем меньше число, тем выше элемент будет расположен на сайте.'
    )

    class Meta:
        abstract = True
        ordering = ['order']


class SiteSettings(models.Model):
    logo = models.ImageField(verbose_name='Логотип', upload_to='site/', blank=True, null=True)

    hero_slogan_ru = models.CharField(verbose_name='Слоган (Hero) ru', max_length=255)
    hero_slogan_en = models.CharField(verbose_name='Слоган (Hero) en', max_length=255, blank=True)
    hero_slogan_kg = models.CharField(verbose_name='Слоган (Hero) kg', max_length=255, blank=True)
    hero_media = models.FileField(
        verbose_name='Фон Hero-секции',
        upload_to='site/hero/',
        validators=[FileExtensionValidator(allowed_extensions=MEDIA_EXTENSIONS)],
        help_text=HELP_TEXT_MEDIA,
        blank=True, null=True,
    )

    about_title_ru = models.CharField(verbose_name='Заголовок "О клубе" ru', max_length=255, blank=True)
    about_title_en = models.CharField(verbose_name='Заголовок "О клубе" en', max_length=255, blank=True)
    about_title_kg = models.CharField(verbose_name='Заголовок "О клубе" kg', max_length=255, blank=True)
    about_content_ru = CKEditor5Field(verbose_name='Текст "О клубе" ru', blank=True)
    about_content_en = CKEditor5Field(verbose_name='Текст "О клубе" en', blank=True)
    about_content_kg = CKEditor5Field(verbose_name='Текст "О клубе" kg', blank=True)

    address_ru = models.CharField(verbose_name='Адрес ru', max_length=255, blank=True)
    address_en = models.CharField(verbose_name='Адрес en', max_length=255, blank=True)
    address_kg = models.CharField(verbose_name='Адрес kg', max_length=255, blank=True)

    work_hours_ru = models.CharField(verbose_name='Режим работы ru', max_length=255, blank=True, help_text='Например: Ежедневно с 07:00 до 23:00')
    work_hours_en = models.CharField(verbose_name='Режим работы en', max_length=255, blank=True)
    work_hours_kg = models.CharField(verbose_name='Режим работы kg', max_length=255, blank=True)

    phone = models.CharField(
        verbose_name='Телефон', max_length=50, blank=True,
        help_text='Отображается в разделе контактов и CTA-секции.'
    )
    whatsapp_phone = models.CharField(
        verbose_name='Номер WhatsApp', max_length=50, blank=True,
        help_text='Номер в международном формате без плюса, например: 996700123456'
    )

    map_embed_url = models.URLField(
        verbose_name='Ссылка для встраивания карты (2GIS / Yandex)',
        blank=True,
        help_text='Вставьте ссылку из поля "src" iframe-кода карты 2GIS или Yandex.'
    )

    telegram_admin_chat_id = models.CharField(
        verbose_name='ID Telegram-чата администрации',
        max_length=200,
        blank=True,
        help_text='Начинается с -100. Сюда бот будет присылать заявки с сайта. Настраивается программистом.'
    )
    whatsapp_default_message_ru = models.CharField(
        verbose_name='Текст для WhatsApp (по умолчанию) ru', max_length=500, blank=True,
        help_text='Текст, который будет предзаполнен в WhatsApp, если для конкретной услуги/секции свой текст не указан.'
    )
    whatsapp_default_message_en = models.CharField(verbose_name='Текст для WhatsApp (по умолчанию) en', max_length=500, blank=True)
    whatsapp_default_message_kg = models.CharField(verbose_name='Текст для WhatsApp (по умолчанию) kg', max_length=500, blank=True)

    seo_title_ru = models.CharField(verbose_name='SEO Title ru', max_length=255, blank=True)
    seo_title_en = models.CharField(verbose_name='SEO Title en', max_length=255, blank=True)
    seo_title_kg = models.CharField(verbose_name='SEO Title kg', max_length=255, blank=True)
    seo_description_ru = models.TextField(verbose_name='SEO Description ru', blank=True)
    seo_description_en = models.TextField(verbose_name='SEO Description en', blank=True)
    seo_description_kg = models.TextField(verbose_name='SEO Description kg', blank=True)
    seo_og_image = models.ImageField(verbose_name='Изображение для соцсетей (OpenGraph)', upload_to='site/og/', blank=True, null=True)

    def clean(self):
        super().clean()
        if not self.pk and SiteSettings.objects.exists():
            raise ValidationError('Настройки сайта уже существуют. Пожалуйста, отредактируйте существующую запись.')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return 'Настройки сайта'

    class Meta:
        verbose_name = 'Настройки сайта'
        verbose_name_plural = 'Настройки сайта'


class SocialMedia(models.Model):
    HELP_TEXT_URL = 'URL - это ссылка, куда по нажатию будет перенаправлен пользователь. Для телефона используйте формат: tel:+1234567890'
    HELP_TEXT_NAME = 'Название - это отображаемое имя социальной сети, например: "Наш Instagram" или "Позвонить нам". Если оставить пустым, то будет отображаться чисто иконка.'
    SM_CHOICES = [
        ('facebook', 'Facebook'),
        ('twitter', 'Twitter'),
        ('instagram', 'Instagram'),
        ('linkedin', 'LinkedIn'),
        ('youtube', 'YouTube'),
        ('telegram', 'Telegram'),
        ('whatsapp', 'WhatsApp'),
        ('pinterest', 'Pinterest'),
        ('snapchat', 'Snapchat'),
        ('tiktok', 'TikTok'),
        ('phone', 'Phone'),
    ]

    type = models.CharField(verbose_name='Тип социальной сети', max_length=20, choices=SM_CHOICES)
    url = models.CharField(verbose_name='URL', max_length=1000, help_text=HELP_TEXT_URL)
    name_ru = models.CharField(verbose_name='Название ru', max_length=100, help_text=HELP_TEXT_NAME, blank=True, null=True)
    name_en = models.CharField(verbose_name='Название en', max_length=100, help_text=HELP_TEXT_NAME, blank=True, null=True)
    name_kg = models.CharField(verbose_name='Название kg', max_length=100, help_text=HELP_TEXT_NAME, blank=True, null=True)

    def __str__(self):
        return f"{self.get_type_display()} - {self.url}"

    class Meta:
        verbose_name = 'Социальная сеть'
        verbose_name_plural = 'Социальные сети'


class Advantage(SortableModel):
    icon = models.CharField(
        verbose_name='Иконка', max_length=50, blank=True,
        help_text='Название иконки, например fa-swimming-pool (FontAwesome - ищите в ChatGPT).'
    )
    title_ru = models.CharField(verbose_name='Заголовок ru', max_length=150)
    title_en = models.CharField(verbose_name='Заголовок en', max_length=150, blank=True)
    title_kg = models.CharField(verbose_name='Заголовок kg', max_length=150, blank=True)
    description_ru = models.CharField(verbose_name='Описание ru', max_length=255, blank=True)
    description_en = models.CharField(verbose_name='Описание en', max_length=255, blank=True)
    description_kg = models.CharField(verbose_name='Описание kg', max_length=255, blank=True)

    def __str__(self):
        return self.title_ru

    class Meta(SortableModel.Meta):
        verbose_name = 'Преимущество клуба'
        verbose_name_plural = 'Преимущества клуба'


class SectionCategory(models.Model):
    HELP_TEXT = 'Например: Йога, TRX, Cycle, Stretching'

    name_ru = models.CharField(verbose_name='Название направления ru', max_length=100, help_text=HELP_TEXT)
    name_en = models.CharField(verbose_name='Название направления en', max_length=100, blank=True)
    name_kg = models.CharField(verbose_name='Название направления kg', max_length=100, blank=True)

    color = models.CharField(
        verbose_name='Цвет в расписании', max_length=7, default='#E30613',
        help_text='HEX-цвет (например #E30613), которым направление будет выделено в сетке расписания.'
    )
    icon = models.CharField(verbose_name='Иконка', max_length=50, blank=True)
    order = models.PositiveIntegerField(verbose_name='Порядок отображения', default=0)

    def __str__(self):
        return self.name_ru

    class Meta:
        verbose_name = 'Направление программы'
        verbose_name_plural = 'Направления программ'
        ordering = ['order']


class Zone(models.Model):
    HELP_TEXT = 'Например: бассейн, тренажёрный зал или танцевальная комната'

    name_ru = models.CharField(verbose_name='Название зоны ru', max_length=100, help_text=HELP_TEXT)
    name_en = models.CharField(verbose_name='Название зоны en', max_length=100, blank=True)
    name_kg = models.CharField(verbose_name='Название зоны kg', max_length=100, blank=True)

    description_ru = CKEditor5Field(verbose_name='Описание зоны ru', blank=True)
    description_en = CKEditor5Field(verbose_name='Описание зоны en', blank=True)
    description_kg = CKEditor5Field(verbose_name='Описание зоны kg', blank=True)

    cover_image = models.ImageField(verbose_name='Обложка (для каталога)', upload_to='zones/covers/', blank=True, null=True)
    video_tour = models.FileField(
        verbose_name='Видео обзор зоны',
        upload_to='zones/',
        validators=[FileExtensionValidator(allowed_extensions=VIDEO_EXTENSIONS)],
        blank=True, null=True,
    )

    is_published = models.BooleanField(verbose_name='Опубликована', default=True)
    order = models.PositiveIntegerField(verbose_name='Порядок отображения', default=0)

    def __str__(self):
        return self.name_ru

    class Meta:
        verbose_name = 'Зона'
        verbose_name_plural = 'Зоны'
        ordering = ['order']


class ZoneFeature(SortableModel):
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name='features', verbose_name='Зона')
    icon = models.CharField(verbose_name='Иконка', max_length=50, blank=True)
    text_ru = models.CharField(verbose_name='Характеристика ru', max_length=150)
    text_en = models.CharField(verbose_name='Характеристика en', max_length=150, blank=True)
    text_kg = models.CharField(verbose_name='Характеристика kg', max_length=150, blank=True)

    def __str__(self):
        return f"{self.zone.name_ru} — {self.text_ru}"

    class Meta(SortableModel.Meta):
        verbose_name = 'Характеристика зоны'
        verbose_name_plural = 'Характеристики зон'


class GalleryImage(SortableModel):
    zone = models.ForeignKey(
        Zone, on_delete=models.SET_NULL, related_name='gallery_images',
        verbose_name='Зона', blank=True, null=True,
        help_text='Если выбрано — фото будет показано на странице этой зоны. Если не выбрано — только в общей галерее на главной.'
    )
    image = models.ImageField(verbose_name='Изображение', upload_to='gallery/')
    caption_ru = models.CharField(verbose_name='Подпись ru', max_length=255, blank=True)
    caption_en = models.CharField(verbose_name='Подпись en', max_length=255, blank=True)
    caption_kg = models.CharField(verbose_name='Подпись kg', max_length=255, blank=True)

    def __str__(self):
        return self.caption_ru or f"Фото #{self.pk}"

    class Meta(SortableModel.Meta):
        verbose_name = 'Фото галереи'
        verbose_name_plural = 'Фотогалерея'


class Review(SortableModel):
    SOURCE_CHOICES = [
        ('manual', 'Добавлен вручную'),
        ('google', 'Google'),
        ('2gis', '2ГИС'),
        ('instagram', 'Instagram'),
    ]
    RATING_CHOICES = [(i, f'{i}') for i in range(1, 6)]

    author_name = models.CharField(verbose_name='Имя автора', max_length=150)
    author_photo = models.ImageField(verbose_name='Фото автора', upload_to='reviews/', blank=True, null=True)
    rating = models.PositiveSmallIntegerField(verbose_name='Оценка', choices=RATING_CHOICES, default=5)
    source = models.CharField(verbose_name='Источник', max_length=20, choices=SOURCE_CHOICES, default='manual')

    text_ru = models.TextField(verbose_name='Текст отзыва ru')
    text_en = models.TextField(verbose_name='Текст отзыва en', blank=True)
    text_kg = models.TextField(verbose_name='Текст отзыва kg', blank=True)

    is_published = models.BooleanField(verbose_name='Опубликован', default=True)
    created_at = models.DateField(verbose_name='Дата отзыва', default=timezone.now)

    def __str__(self):
        return f"{self.author_name} — {self.rating}★"

    class Meta(SortableModel.Meta):
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        ordering = ['-created_at']


class StuffCategory(models.Model):
    HELP_TEXT = 'Например: тренера, администрация или охрана'

    is_coaches = models.BooleanField(verbose_name='Это категория тренеров?', default=False)

    name_ru = models.CharField(verbose_name='Название категории сотрудника ru', max_length=100, help_text=HELP_TEXT)
    name_en = models.CharField(verbose_name='Название категории сотрудника en', max_length=100, blank=True)
    name_kg = models.CharField(verbose_name='Название категории сотрудника kg', max_length=100, blank=True)

    def __str__(self):
        return self.name_ru

    class Meta:
        verbose_name = 'Категория сотрудника'
        verbose_name_plural = 'Категории сотрудников'


class TrainerSpecialization(SortableModel):
    name_ru = models.CharField(verbose_name='Название специализации ru', max_length=100)
    name_en = models.CharField(verbose_name='Название специализации en', max_length=100, blank=True)
    name_kg = models.CharField(verbose_name='Название специализации kg', max_length=100, blank=True)
    icon = models.CharField(verbose_name='Иконка', max_length=50, blank=True)

    def __str__(self):
        return self.name_ru

    class Meta(SortableModel.Meta):
        verbose_name = 'Специализация тренера (фильтр)'
        verbose_name_plural = 'Специализации тренеров (фильтры)'


class Stuff(models.Model):
    stuff_category = models.ForeignKey(
        StuffCategory,
        on_delete=models.PROTECT,
        related_name='stuff',
        verbose_name='Категория сотрудника'
    )
    specializations = models.ManyToManyField(
        TrainerSpecialization,
        related_name='trainers',
        verbose_name='Специализации (для фильтра в каталоге тренеров)',
        blank=True,
        help_text='Заполняется только для тренеров — используется для фильтрации в разделе "Тренеры".'
    )

    name_ru = models.CharField(verbose_name='Имя сотрудника ru', max_length=100)
    name_en = models.CharField(verbose_name='Имя сотрудника en', max_length=100, blank=True)
    name_kg = models.CharField(verbose_name='Имя сотрудника kg', max_length=100, blank=True)

    position_ru = models.CharField(verbose_name='Должность ru', max_length=255)
    position_en = models.CharField(verbose_name='Должность en', max_length=255, blank=True)
    position_kg = models.CharField(verbose_name='Должность kg', max_length=255, blank=True)

    photo = models.ImageField(verbose_name='Фото', upload_to='stuff/', blank=True, null=True)
    experience_years = models.PositiveSmallIntegerField(verbose_name='Стаж (лет)', blank=True, null=True)

    description_ru = CKEditor5Field(verbose_name='Описание сотрудника ru', blank=True, null=True)
    description_en = CKEditor5Field(verbose_name='Описание сотрудника en', blank=True, null=True)
    description_kg = CKEditor5Field(verbose_name='Описание сотрудника kg', blank=True, null=True)

    is_published = models.BooleanField(verbose_name='Опубликован на сайте', default=True)
    order = models.PositiveIntegerField(verbose_name='Порядок отображения', default=0)

    def __str__(self):
        return self.name_ru

    class Meta:
        verbose_name = 'Сотрудник'
        verbose_name_plural = 'Сотрудники'
        ordering = ['order']


class Achievement(SortableModel):
    stuff = models.ForeignKey(Stuff, on_delete=models.CASCADE, related_name='achievements', verbose_name='Сотрудник')
    text_ru = models.CharField(verbose_name='Достижение ru', max_length=255)
    text_en = models.CharField(verbose_name='Достижение en', max_length=255, blank=True)
    text_kg = models.CharField(verbose_name='Достижение kg', max_length=255, blank=True)

    def __str__(self):
        return self.text_ru

    class Meta(SortableModel.Meta):
        verbose_name = 'Достижение'
        verbose_name_plural = 'Достижения'


class Certificate(SortableModel):
    stuff = models.ForeignKey(Stuff, on_delete=models.CASCADE, related_name='certificates', verbose_name='Сотрудник')
    title_ru = models.CharField(verbose_name='Название сертификата ru', max_length=255, blank=True)
    title_en = models.CharField(verbose_name='Название сертификата en', max_length=255, blank=True)
    title_kg = models.CharField(verbose_name='Название сертификата kg', max_length=255, blank=True)
    image = models.ImageField(verbose_name='Скан/фото сертификата', upload_to='certificates/')

    def __str__(self):
        return self.title_ru or f"Сертификат #{self.pk}"

    class Meta(SortableModel.Meta):
        verbose_name = 'Сертификат'
        verbose_name_plural = 'Сертификаты'


class Section(models.Model):
    HELP_TEXT = 'Например: jiu-jitsu, айкидо или плавание'

    section_category = models.ForeignKey(
        SectionCategory,
        on_delete=models.PROTECT,
        related_name='sections',
        verbose_name='Направление'
    )
    coach = models.ForeignKey(
        Stuff,
        on_delete=models.PROTECT,
        related_name='sections',
        verbose_name='Тренер',
        limit_choices_to={'stuff_category__is_coaches': True}
    )
    zone = models.ForeignKey(
        Zone,
        on_delete=models.PROTECT,
        related_name='sections',
        verbose_name='Зона'
    )

    name_ru = models.CharField(verbose_name='Название секции ru', max_length=100, help_text=HELP_TEXT)
    name_en = models.CharField(verbose_name='Название секции en', max_length=100, blank=True)
    name_kg = models.CharField(verbose_name='Название секции kg', max_length=100, blank=True)

    description_ru = models.TextField(verbose_name='Описание секции ru', blank=True, null=True)
    description_en = models.TextField(verbose_name='Описание секции en', blank=True, null=True)
    description_kg = models.TextField(verbose_name='Описание секции kg', blank=True, null=True)

    image = models.ImageField(verbose_name='Изображение карточки', upload_to='sections/', blank=True, null=True)
    background_video = models.FileField(
        verbose_name='Задний фон (видео)',
        upload_to='backgrounds/video/',
        validators=[FileExtensionValidator(allowed_extensions=VIDEO_EXTENSIONS + ['gif'])],
        help_text='Загрузите видео (mp4, webm) или GIF для фона.',
        blank=True, null=True,
    )

    is_published = models.BooleanField(verbose_name='Опубликована', default=True)
    order = models.PositiveIntegerField(verbose_name='Порядок отображения', default=0)

    def clean(self):
        super().clean()
        if self.coach_id and not self.coach.stuff_category.is_coaches:
            raise ValidationError({'coach': 'Выбранный сотрудник не является тренером. Проверьте его категорию сотрудника.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.section_category.name_ru} - {self.name_ru}"

    class Meta:
        verbose_name = 'Секция'
        verbose_name_plural = 'Секции'
        ordering = ['order']


class SectionSlot(models.Model):
    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, 'Понедельник'
        TUESDAY = 1, 'Вторник'
        WEDNESDAY = 2, 'Среда'
        THURSDAY = 3, 'Четверг'
        FRIDAY = 4, 'Пятница'
        SATURDAY = 5, 'Суббота'
        SUNDAY = 6, 'Воскресенье'

    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='slots',
        verbose_name='Секция'
    )

    day_of_week = models.IntegerField(choices=DayOfWeek.choices, verbose_name="День недели")
    start_time = models.TimeField(verbose_name="Время начала (например, 09:00)")
    end_time = models.TimeField(verbose_name="Время конца (например, 11:00)")

    is_active = models.BooleanField(default=True, verbose_name="Шаблон активен?")

    def clean(self):
        super().clean()

        if self.start_time and self.end_time:
            if self.end_time <= self.start_time:
                raise ValidationError("Время окончания должно быть позже времени начала.")

            dummy_date = date.today()
            start_dt = datetime.combine(dummy_date, self.start_time)
            end_dt = datetime.combine(dummy_date, self.end_time)

            duration = end_dt - start_dt

            if duration < timedelta(minutes=1):
                raise ValidationError("Разница между началом и концом не может быть меньше 1 минуты.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Шаблон расписания"
        verbose_name_plural = "Шаблоны расписания"
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f"{self.get_day_of_week_display()} в {self.start_time} — {self.section.name_ru}"


class SectionSlotException(models.Model):
    slot = models.ForeignKey(
        SectionSlot,
        on_delete=models.CASCADE,
        related_name='exceptions',
        verbose_name='Слот расписания'
    )
    date = models.DateField(
        verbose_name='Дата отмены',
        help_text='Конкретная дата, когда это занятие не проводится.'
    )
    reason_ru = models.CharField(verbose_name='Причина ru', max_length=255, blank=True, help_text='Например: "Зал закрыт", "Праздничный день"')
    reason_en = models.CharField(verbose_name='Причина en', max_length=255, blank=True)
    reason_kg = models.CharField(verbose_name='Причина kg', max_length=255, blank=True)

    def clean(self):
        super().clean()
        if self.date and self.slot_id and self.date.weekday() != self.slot.day_of_week:
            raise ValidationError({
                'date': f'Эта дата не совпадает с днём недели слота. '
                        f'Слот проводится по {self.slot.get_day_of_week_display().lower()}м, '
                        f'а выбранная дата — {SectionSlot.DayOfWeek(self.date.weekday()).label.lower()}.'
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Отмена: {self.slot} — {self.date}"

    class Meta:
        verbose_name = 'Исключение в расписании'
        verbose_name_plural = 'Исключения в расписании'
        unique_together = ('slot', 'date')
        ordering = ['-date']


class ClubCard(models.Model):
    class CardType(models.IntegerChoices):
        MONTHLY = 0, 'Месячная'
        HALF_YEAR = 1, 'Полугодовая'
        ANNUAL = 2, 'Годовая'
        CORPORATE = 3, 'Корпоративная'

    card_type = models.IntegerField(verbose_name='Тип карты', choices=CardType.choices, default=CardType.MONTHLY)

    name_ru = models.CharField(verbose_name='Название клубной карты ru', max_length=100)
    name_en = models.CharField(verbose_name='Название клубной карты en', max_length=100, blank=True)
    name_kg = models.CharField(verbose_name='Название клубной карты kg', max_length=100, blank=True)

    description_ru = models.TextField(verbose_name='Описание клубной карты ru')
    description_en = models.TextField(verbose_name='Описание клубной карты en', blank=True)
    description_kg = models.TextField(verbose_name='Описание клубной карты kg', blank=True)

    price = models.DecimalField(verbose_name='Цена (сом)', max_digits=10, decimal_places=2)
    old_price = models.DecimalField(
        verbose_name='Старая цена (сом)', max_digits=10, decimal_places=2, blank=True, null=True,
        help_text='Заполните, если на карту действует акция — старая цена будет показана зачёркнутой.'
    )
    is_popular = models.BooleanField(verbose_name='Отметить как "Популярная"', default=False)

    image = models.ImageField(verbose_name='Изображение для каталога', upload_to='club_cards/', blank=True, null=True)
    background_video = models.FileField(
        verbose_name='Задний фон (видео)',
        upload_to='backgrounds/video/',
        validators=[FileExtensionValidator(allowed_extensions=VIDEO_EXTENSIONS + ['gif'])],
        help_text='Загрузите видео (mp4, webm) или GIF для фона.',
        blank=True, null=True,
    )

    is_published = models.BooleanField(verbose_name='Опубликована', default=True)
    order = models.PositiveIntegerField(verbose_name='Порядок отображения', default=0)

    def __str__(self):
        return self.name_ru

    class Meta:
        verbose_name = 'Клубная карта'
        verbose_name_plural = 'Клубные карты'
        ordering = ['order']


class ClubCardFeature(SortableModel):
    club_card = models.ForeignKey(ClubCard, on_delete=models.CASCADE, related_name='features', verbose_name='Клубная карта')
    text_ru = models.CharField(verbose_name='Опция ru', max_length=255)
    text_en = models.CharField(verbose_name='Опция en', max_length=255, blank=True)
    text_kg = models.CharField(verbose_name='Опция kg', max_length=255, blank=True)

    def __str__(self):
        return self.text_ru

    class Meta(SortableModel.Meta):
        verbose_name = 'Опция клубной карты'
        verbose_name_plural = 'Опции клубной карты'


class News(models.Model):
    CATEGORY_CHOICES = [
        ('news', 'Новость'),
        ('promo', 'Акция'),
        ('event', 'Мероприятие'),
    ]

    category = models.CharField(verbose_name='Категория', max_length=20, choices=CATEGORY_CHOICES, default='news')
    slug = models.SlugField(verbose_name='URL (slug)', max_length=255, unique=True, blank=True)

    title_ru = models.CharField(verbose_name='Заголовок ru', max_length=255)
    title_en = models.CharField(verbose_name='Заголовок en', max_length=255, blank=True)
    title_kg = models.CharField(verbose_name='Заголовок kg', max_length=255, blank=True)

    excerpt_ru = models.CharField(verbose_name='Короткое описание (для карточки) ru', max_length=300, blank=True)
    excerpt_en = models.CharField(verbose_name='Короткое описание (для карточки) en', max_length=300, blank=True)
    excerpt_kg = models.CharField(verbose_name='Короткое описание (для карточки) kg', max_length=300, blank=True)

    content_ru = CKEditor5Field(verbose_name='Текст новости ru')
    content_en = CKEditor5Field(verbose_name='Текст новости en', blank=True)
    content_kg = CKEditor5Field(verbose_name='Текст новости kg', blank=True)

    cover_image = models.ImageField(verbose_name='Обложка', upload_to='news/')

    is_published = models.BooleanField(verbose_name='Опубликована', default=True)
    published_at = models.DateTimeField(verbose_name='Дата публикации', default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title_ru) or 'news'
            slug = base_slug
            counter = 1
            while News.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                counter += 1
                slug = f"{base_slug}-{counter}"
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title_ru

    class Meta:
        verbose_name = 'Новость / Акция'
        verbose_name_plural = 'Новости и акции'
        ordering = ['-published_at']


class Lead(models.Model):
    class Status(models.TextChoices):
        NEW = 'new', 'Новая'
        IN_PROGRESS = 'in_progress', 'В обработке'
        CLOSED = 'closed', 'Закрыта'

    name = models.CharField(verbose_name='Имя', max_length=150)
    phone = models.CharField(verbose_name='Телефон', max_length=30)
    comment = models.TextField(verbose_name='Комментарий / интересующая услуга', blank=True)

    related_trainer = models.ForeignKey(
        Stuff, on_delete=models.SET_NULL, related_name='leads', verbose_name='Записался к тренеру',
        blank=True, null=True
    )
    related_card = models.ForeignKey(
        ClubCard, on_delete=models.SET_NULL, related_name='leads', verbose_name='Интересующая клубная карта',
        blank=True, null=True
    )
    related_section = models.ForeignKey(
        Section, on_delete=models.SET_NULL, related_name='leads', verbose_name='Интересующая секция',
        blank=True, null=True
    )

    source_page = models.CharField(verbose_name='Страница отправки', max_length=255, blank=True)
    status = models.CharField(verbose_name='Статус', max_length=20, choices=Status.choices, default=Status.NEW)
    sent_to_telegram = models.BooleanField(verbose_name='Отправлено в Telegram', default=False)
    created_at = models.DateTimeField(verbose_name='Дата заявки', auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.phone}) — {self.get_status_display()}"

    class Meta:
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'
        ordering = ['-created_at']
