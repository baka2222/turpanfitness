from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('website_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesettings',
            name='phone',
            field=models.CharField(blank=True, help_text='Отображается в разделе контактов и CTA-секции.', max_length=50, verbose_name='Телефон'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='whatsapp_phone',
            field=models.CharField(blank=True, help_text='Номер в международном формате без плюса, например: 996700123456', max_length=50, verbose_name='Номер WhatsApp'),
        ),
    ]
