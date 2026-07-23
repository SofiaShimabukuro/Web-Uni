from django.contrib import admin

from .models import (
    Carrera,
    Comision,
    Entrega,
    EntregaAlumno,
    InscripcionComision,
    Materia,
    Modulo,
    Recurso,
)


@admin.register(Carrera)
class CarreraAdmin(admin.ModelAdmin):
    list_display = ("nombre",)


@admin.register(Materia)
class MateriaAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre", "carrera", "creditos")
    list_filter = ("carrera",)
    search_fields = ("codigo", "nombre")


@admin.register(Comision)
class ComisionAdmin(admin.ModelAdmin):
    list_display = ("materia", "periodo", "docente", "cupo", "aula")
    list_filter = ("periodo",)


@admin.register(Modulo)
class ModuloAdmin(admin.ModelAdmin):
    list_display = ("titulo", "comision", "orden")


@admin.register(Recurso)
class RecursoAdmin(admin.ModelAdmin):
    list_display = ("titulo", "modulo", "tipo", "orden")
    list_filter = ("tipo",)


@admin.register(Entrega)
class EntregaAdmin(admin.ModelAdmin):
    list_display = ("titulo", "modulo", "fecha_limite", "puntaje_maximo")


@admin.register(InscripcionComision)
class InscripcionComisionAdmin(admin.ModelAdmin):
    list_display = ("alumno", "comision", "fecha_inscripcion", "estado")
    list_filter = ("estado",)


@admin.register(EntregaAlumno)
class EntregaAlumnoAdmin(admin.ModelAdmin):
    list_display = ("alumno", "entrega", "estado", "nota", "fecha_envio")
    list_filter = ("estado",)
