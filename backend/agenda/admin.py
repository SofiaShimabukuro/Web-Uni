from django.contrib import admin

from .models import Apunte, EventoCalendario


@admin.register(EventoCalendario)
class EventoCalendarioAdmin(admin.ModelAdmin):
    list_display = ("titulo", "alumno", "materia", "tipo", "fecha", "repeticion")
    list_filter = ("tipo", "repeticion")


@admin.register(Apunte)
class ApunteAdmin(admin.ModelAdmin):
    list_display = ("titulo", "alumno", "materia", "tipo", "visibilidad", "creado_en")
    list_filter = ("tipo", "visibilidad")
