from django.contrib import admin

from .models import BotUser, FAQCategory, FAQ


class FAQInline(admin.StackedInline):
    model = FAQ
    extra = 0
    fields = (
        'order', 'is_published',
        'question_ru', 'question_en', 'question_kg',
        'answer_ru', 'answer_en', 'answer_kg',
    )


@admin.register(FAQCategory)
class FAQCategoryAdmin(admin.ModelAdmin):
    list_display = ('order', 'name_ru', 'items_count', 'is_published')
    list_display_links = ('name_ru',)
    list_editable = ('order', 'is_published')
    list_filter = ('is_published',)
    search_fields = ('name_ru', 'name_en', 'name_kg')
    inlines = [FAQInline]

    fieldsets = (
        ('Параметры', {'fields': ('is_published', 'order')}),
        ('Название категории', {'fields': ('name_ru', 'name_en', 'name_kg')}),
    )

    @admin.display(description='Вопросов')
    def items_count(self, obj):
        return obj.items.count()


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('order', 'question_ru', 'category', 'is_published')
    list_display_links = ('question_ru',)
    list_editable = ('order', 'is_published')
    list_filter = ('category', 'is_published')
    search_fields = ('question_ru', 'answer_ru')
    autocomplete_fields = ('category',)

    fieldsets = (
        ('Параметры', {'fields': ('category', 'is_published', 'order')}),
        ('Вопрос', {'fields': ('question_ru', 'question_en', 'question_kg')}),
        ('Ответ', {'fields': ('answer_ru', 'answer_en', 'answer_kg')}),
    )


@admin.register(BotUser)
class BotUserAdmin(admin.ModelAdmin):
    list_display = ('tg_id', 'name', 'language', 'created_at')
    list_filter = ('language', 'created_at')
    search_fields = ('name', 'tg_id')
    readonly_fields = ('tg_id', 'name', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False
