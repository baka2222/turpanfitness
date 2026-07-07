from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.html import format_html

from .models import (
    SiteSettings, SocialMedia, Advantage,
    SectionCategory, Zone, ZoneFeature, GalleryImage, Review,
    StuffCategory, TrainerSpecialization, Stuff, Achievement, Certificate,
    Section, SectionSlot, SectionSlotException,
    ClubCard, ClubCardFeature,
    News, Lead,
)


def media_preview(file_field, width=200):
    if not file_field:
        return "Файл не загружен"
    url = file_field.url
    if url.lower().endswith(('.mp4', '.webm', '.mov')):
        return format_html(
            '<video width="{}" autoplay loop muted playsinline>'
            '<source src="{}"></video>', width, url
        )
    return format_html('<img src="{}" style="max-width: {}px; border-radius: 8px;" />', url, width)


class SingletonAdminMixin:
    def has_add_permission(self, request):
        return not self.model.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        obj = self.model.objects.first()
        url_name = f"admin:{self.model._meta.app_label}_{self.model._meta.model_name}_{'change' if obj else 'add'}"
        args = [obj.pk] if obj else []
        return redirect(reverse(url_name, args=args))


@admin.register(SiteSettings)
class SiteSettingsAdmin(SingletonAdminMixin, admin.ModelAdmin):
    readonly_fields = ('logo_preview', 'hero_media_preview', 'seo_og_image_preview')

    fieldsets = (
        ('Логотип', {
            'fields': ('logo', 'logo_preview')
        }),
        ('Hero-секция (главный экран)', {
            'fields': ('hero_slogan_ru', 'hero_slogan_en', 'hero_slogan_kg', 'hero_media', 'hero_media_preview')
        }),
        ('О клубе', {
            'fields': (
                'about_title_ru', 'about_title_en', 'about_title_kg',
                'about_content_ru', 'about_content_en', 'about_content_kg',
            )
        }),
        ('Контакты и карта', {
            'fields': ('phone', 'whatsapp_phone', 'address_ru', 'address_en', 'address_kg', 'work_hours_ru', 'work_hours_en', 'work_hours_kg', 'map_embed_url')
        }),
        ('Заявки и Telegram', {
            'fields': (
                'telegram_admin_chat_id',
                'whatsapp_default_message_ru', 'whatsapp_default_message_en', 'whatsapp_default_message_kg',
            )
        }),
        ('SEO по умолчанию', {
            'fields': (
                'seo_title_ru', 'seo_title_en', 'seo_title_kg',
                'seo_description_ru', 'seo_description_en', 'seo_description_kg',
                'seo_og_image', 'seo_og_image_preview',
            ),
            'classes': ('collapse',)
        }),
    )

    @admin.display(description="Превью лого")
    def logo_preview(self, obj):
        return media_preview(obj.logo, width=150)

    @admin.display(description="Превью фона")
    def hero_media_preview(self, obj):
        return media_preview(obj.hero_media)

    @admin.display(description="Превью OG-изображения")
    def seo_og_image_preview(self, obj):
        return media_preview(obj.seo_og_image, width=150)


@admin.register(SocialMedia)
class SocialMediaAdmin(admin.ModelAdmin):
    list_display = ('type', 'name_ru', 'url_clickable')
    list_filter = ('type',)
    search_fields = ('name_ru', 'url')

    @admin.display(description="Ссылка")
    def url_clickable(self, obj):
        return format_html('<a href="{}" target="_blank">Перейти</a>', obj.url)


@admin.register(Advantage)
class AdvantageAdmin(admin.ModelAdmin):
    list_display = ('order', 'title_ru', 'icon')
    list_display_links = ('title_ru',)
    list_editable = ('order',)
    search_fields = ('title_ru',)


@admin.register(SectionCategory)
class SectionCategoryAdmin(admin.ModelAdmin):
    list_display = ('order', 'name_ru', 'color_preview')
    list_display_links = ('name_ru',)
    list_editable = ('order',)
    search_fields = ('name_ru',)

    @admin.display(description="Цвет")
    def color_preview(self, obj):
        return format_html(
            '<span style="display:inline-block;width:18px;height:18px;border-radius:4px;'
            'background:{};border:1px solid #ccc;"></span> {}', obj.color, obj.color
        )


class ZoneFeatureInline(admin.TabularInline):
    model = ZoneFeature
    extra = 0
    fields = ('order', 'icon', 'text_ru', 'text_en', 'text_kg')


@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    list_display = ('order', 'name_ru', 'is_published', 'video_preview')
    list_display_links = ('name_ru',)
    list_editable = ('order', 'is_published')
    list_filter = ('is_published',)
    search_fields = ('name_ru',)
    readonly_fields = ('video_preview', 'cover_preview')
    inlines = [ZoneFeatureInline]

    fieldsets = (
        ('Параметры', {'fields': ('is_published', 'order')}),
        ('Название', {'fields': ('name_ru', 'name_en', 'name_kg')}),
        ('Описание', {'fields': ('description_ru', 'description_en', 'description_kg')}),
        ('Медиа', {'fields': ('cover_image', 'cover_preview', 'video_tour', 'video_preview')}),
    )

    @admin.display(description="Обзор зоны")
    def video_preview(self, obj):
        return media_preview(obj.video_tour)

    @admin.display(description="Превью обложки")
    def cover_preview(self, obj):
        return media_preview(obj.cover_image, width=150)


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('order', 'thumbnail', 'caption_ru', 'zone')
    list_display_links = ('caption_ru',)
    list_editable = ('order',)
    list_filter = ('zone',)
    readonly_fields = ('thumbnail',)

    @admin.display(description="Превью")
    def thumbnail(self, obj):
        return media_preview(obj.image, width=120)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('order', 'author_name', 'rating', 'source', 'is_published', 'created_at')
    list_display_links = ('author_name',)
    list_editable = ('order', 'is_published')
    list_filter = ('is_published', 'rating', 'source')
    search_fields = ('author_name', 'text_ru')


@admin.register(StuffCategory)
class StuffCategoryAdmin(admin.ModelAdmin):
    list_display = ('name_ru', 'is_coaches')
    list_filter = ('is_coaches',)
    search_fields = ('name_ru',)


@admin.register(TrainerSpecialization)
class TrainerSpecializationAdmin(admin.ModelAdmin):
    list_display = ('order', 'name_ru', 'icon')
    list_display_links = ('name_ru',)
    list_editable = ('order',)
    search_fields = ('name_ru',)


class AchievementInline(admin.TabularInline):
    model = Achievement
    extra = 0
    fields = ('order', 'text_ru', 'text_en', 'text_kg')


class CertificateInline(admin.TabularInline):
    model = Certificate
    extra = 0
    fields = ('order', 'title_ru', 'title_en', 'title_kg', 'image')
admin.site.enable_nav_sidebar = False


@admin.register(Stuff)
class StuffAdmin(admin.ModelAdmin):
    list_display = ('order', 'photo_thumbnail', 'name_ru', 'stuff_category', 'position_ru', 'experience_years', 'is_published')
    list_display_links = ('name_ru',)
    list_editable = ('order', 'is_published')
    list_filter = ('stuff_category', 'specializations', 'is_published')
    search_fields = ('name_ru', 'position_ru')
    autocomplete_fields = ('specializations',)
    readonly_fields = ('photo_preview',)
    inlines = [AchievementInline, CertificateInline]

    fieldsets = (
        ('Параметры', {'fields': ('stuff_category', 'specializations', 'is_published', 'order')}),
        ('Имя и должность', {
            'fields': ('name_ru', 'name_en', 'name_kg', 'position_ru', 'position_en', 'position_kg')
        }),
        ('Фото и стаж', {'fields': ('photo', 'photo_preview', 'experience_years')}),
        ('Описание', {
            'fields': ('description_ru', 'description_en', 'description_kg'),
            'classes': ('collapse',)
        }),
    )

    @admin.display(description="Фото")
    def photo_thumbnail(self, obj):
        return media_preview(obj.photo, width=50)

    @admin.display(description="Превью фото")
    def photo_preview(self, obj):
        return media_preview(obj.photo, width=150)


class SectionSlotInline(admin.TabularInline):
    model = SectionSlot
    extra = 0
    fields = ('day_of_week', 'start_time', 'end_time', 'is_active')


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('order', 'name_ru', 'section_category', 'coach', 'zone', 'is_published')
    list_display_links = ('name_ru',)
    list_editable = ('order', 'is_published')
    list_filter = ('section_category', 'zone', 'coach', 'is_published')
    search_fields = ('name_ru',)
    autocomplete_fields = ('coach',)
    readonly_fields = ('media_preview',)
    inlines = [SectionSlotInline]

    fieldsets = (
        ('Параметры секции', {'fields': ('section_category', 'coach', 'zone', 'is_published', 'order')}),
        ('Название', {'fields': ('name_ru', 'name_en', 'name_kg')}),
        ('Описание', {
            'fields': ('description_ru', 'description_en', 'description_kg'),
            'classes': ('collapse',)
        }),
    )

    @admin.display(description="Превью фона")
    def media_preview(self, obj):
        return media_preview(obj.background_video)


class SectionSlotExceptionInline(admin.TabularInline):
    model = SectionSlotException
    extra = 0
    fields = ('date', 'reason_ru', 'reason_en', 'reason_kg')


@admin.register(SectionSlot)
class SectionSlotAdmin(admin.ModelAdmin):
    list_display = ('section', 'day_of_week', 'start_time', 'end_time', 'is_active')
    list_filter = ('day_of_week', 'is_active', 'section__section_category')
    search_fields = ('section__name_ru',)
    autocomplete_fields = ('section',)
    inlines = [SectionSlotExceptionInline]


@admin.register(SectionSlotException)
class SectionSlotExceptionAdmin(admin.ModelAdmin):
    list_display = ('slot', 'date', 'reason_ru')
    list_filter = ('date',)
    search_fields = ('slot__section__name_ru', 'reason_ru')
    autocomplete_fields = ('slot',)
    date_hierarchy = 'date'


class ClubCardFeatureInline(admin.TabularInline):
    model = ClubCardFeature
    extra = 0
    fields = ('order', 'text_ru', 'text_en', 'text_kg')


@admin.register(ClubCard)
class ClubCardAdmin(admin.ModelAdmin):
    list_display = ('order', 'name_ru', 'card_type', 'price', 'old_price', 'is_popular', 'is_published')
    list_display_links = ('name_ru',)
    list_editable = ('order', 'is_popular', 'is_published')
    list_filter = ('card_type', 'is_popular', 'is_published')
    search_fields = ('name_ru',)
    readonly_fields = ('media_preview',)
    inlines = [ClubCardFeatureInline]

    fieldsets = (
        ('Параметры', {'fields': ('card_type', 'price', 'old_price', 'is_popular', 'is_published', 'order')}),
        ('Названия', {'fields': ('name_ru', 'name_en', 'name_kg')}),
        ('Описания', {'fields': ('description_ru', 'description_en', 'description_kg')}),
        ('Медиа', {'fields': ('image', 'media_preview')}),
    )

    @admin.display(description="Превью фона")
    def media_preview(self, obj):
        return media_preview(obj.background_video)


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title_ru', 'category', 'is_published', 'published_at')
    list_editable = ('is_published',)
    list_filter = ('category', 'is_published')
    search_fields = ('title_ru', 'content_ru')
    prepopulated_fields = {'slug': ('title_ru',)}
    readonly_fields = ('cover_preview',)
    date_hierarchy = 'published_at'

    fieldsets = (
        ('Параметры', {'fields': ('category', 'is_published', 'published_at', 'slug')}),
        ('Заголовок', {'fields': ('title_ru', 'title_en', 'title_kg')}),
        ('Короткое описание', {'fields': ('excerpt_ru', 'excerpt_en', 'excerpt_kg')}),
        ('Текст', {'fields': ('content_ru', 'content_en', 'content_kg')}),
        ('Обложка', {'fields': ('cover_image', 'cover_preview')}),
    )

    @admin.display(description="Превью обложки")
    def cover_preview(self, obj):
        return media_preview(obj.cover_image, width=150)


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'name', 'phone', 'status', 'related_trainer', 'related_card', 'related_section', 'sent_to_telegram')
    list_editable = ('status',)
    list_filter = ('status', 'sent_to_telegram', 'created_at')
    search_fields = ('name', 'phone', 'comment')
    autocomplete_fields = ('related_trainer', 'related_card', 'related_section')
    readonly_fields = ('created_at', 'sent_to_telegram', 'source_page')
    date_hierarchy = 'created_at'
