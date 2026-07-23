from django.contrib import admin

from .models import (
    Autoevaluacion,
    BloqueEstudio,
    Habito,
    ItemRepaso,
    PreguntaAutoevaluacion,
    Recordatorio,
    RegistroHabito,
    SesionRepaso,
)


@admin.register(BloqueEstudio)
class BloqueEstudioAdmin(admin.ModelAdmin):
    list_display = ("alumno", "materia", "tipo", "fecha", "hora_inicio", "hora_fin", "estado")
    list_filter = ("tipo", "estado")


@admin.register(Habito)
class HabitoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "alumno", "frecuencia", "activo")
    list_filter = ("frecuencia", "activo")


@admin.register(RegistroHabito)
class RegistroHabitoAdmin(admin.ModelAdmin):
    list_display = ("habito", "fecha", "cumplido")


@admin.register(ItemRepaso)
class ItemRepasoAdmin(admin.ModelAdmin):
    list_display = ("alumno", "materia", "proxima_fecha_repaso", "facilidad", "repeticiones")
    list_filter = ("materia",)


@admin.register(SesionRepaso)
class SesionRepasoAdmin(admin.ModelAdmin):
    list_display = ("item_repaso", "fecha", "calificacion")


@admin.register(Autoevaluacion)
class AutoevaluacionAdmin(admin.ModelAdmin):
    list_display = ("alumno", "materia", "fecha", "puntaje", "total_preguntas")


@admin.register(PreguntaAutoevaluacion)
class PreguntaAutoevaluacionAdmin(admin.ModelAdmin):
    list_display = ("autoevaluacion", "es_correcta")


@admin.register(Recordatorio)
class RecordatorioAdmin(admin.ModelAdmin):
    list_display = ("alumno", "tipo", "fecha_hora_envio", "canal", "estado")
    list_filter = ("tipo", "canal", "estado")
