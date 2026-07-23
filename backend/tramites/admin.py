from django.contrib import admin

from .models import InscripcionMesa, MesaExamen, SolicitudTramite


@admin.register(MesaExamen)
class MesaExamenAdmin(admin.ModelAdmin):
    list_display = ("materia", "fecha", "tipo", "docente")
    list_filter = ("tipo",)


@admin.register(InscripcionMesa)
class InscripcionMesaAdmin(admin.ModelAdmin):
    list_display = ("alumno", "mesa", "estado", "nota", "fecha_inscripcion")
    list_filter = ("estado",)


@admin.register(SolicitudTramite)
class SolicitudTramiteAdmin(admin.ModelAdmin):
    list_display = ("alumno", "tipo", "estado", "fecha_solicitud")
    list_filter = ("tipo", "estado")
