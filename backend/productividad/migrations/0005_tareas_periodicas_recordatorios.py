from django.db import migrations

TAREAS = [
    (
        "web-uni: recordatorios de entregas próximas",
        "productividad.tasks.generar_recordatorios_entregas_proximas",
    ),
    (
        "web-uni: recordatorios de hábitos",
        "productividad.tasks.generar_recordatorios_habitos",
    ),
    (
        "web-uni: recordatorios de repaso espaciado",
        "productividad.tasks.generar_recordatorios_repaso_espaciado",
    ),
]


def crear_tareas_periodicas(apps, schema_editor):
    CrontabSchedule = apps.get_model("django_celery_beat", "CrontabSchedule")
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")

    crontab, _ = CrontabSchedule.objects.get_or_create(
        minute="0",
        hour="7",
        day_of_week="*",
        day_of_month="*",
        month_of_year="*",
        timezone="America/Argentina/Buenos_Aires",
    )
    for nombre, tarea in TAREAS:
        PeriodicTask.objects.get_or_create(
            name=nombre,
            defaults={"task": tarea, "crontab": crontab, "enabled": True},
        )


def eliminar_tareas_periodicas(apps, schema_editor):
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")
    PeriodicTask.objects.filter(name__in=[nombre for nombre, _ in TAREAS]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("productividad", "0004_alter_itemrepaso_proxima_fecha_repaso"),
        ("django_celery_beat", "0019_alter_periodictasks_options"),
    ]

    operations = [
        migrations.RunPython(crear_tareas_periodicas, eliminar_tareas_periodicas),
    ]
