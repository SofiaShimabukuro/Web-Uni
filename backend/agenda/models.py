import uuid
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.db import models

from cursos.models import Materia

EXTENSIONES_PERMITIDAS = [
    # apuntes
    "pdf", "doc", "docx", "odt", "ppt", "pptx", "xls", "xlsx", "csv", "txt", "md",
    "jpg", "jpeg", "png", "heic", "zip",
    # grabaciones
    "mp3", "m4a", "wav", "ogg", "opus", "mp4", "webm", "mov",
]


def ruta_archivo_apunte(instance, filename):
    """Guarda con un nombre opaco: la ruta no se puede adivinar desde afuera.

    El nombre original viaja en `Apunte.nombre_archivo` y se restituye al
    descargar (ver ApunteViewSet.archivo).
    """
    extension = Path(filename).suffix.lower()
    return f"apuntes/{instance.alumno_id}/{uuid.uuid4().hex}{extension}"


class EventoCalendario(models.Model):
    class Tipo(models.TextChoices):
        CLASE = "clase", "Clase"
        PARCIAL = "parcial", "Parcial"
        FINAL = "final", "Final"
        ENTREGA = "entrega", "Entrega"
        PERSONAL = "personal", "Personal"

    class Repeticion(models.TextChoices):
        NINGUNA = "ninguna", "No se repite"
        SEMANAL = "semanal", "Todas las semanas"

    alumno = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="eventos_calendario"
    )
    materia = models.ForeignKey(
        Materia, on_delete=models.SET_NULL, null=True, blank=True, related_name="eventos_calendario"
    )
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    tipo = models.CharField(max_length=20, choices=Tipo.choices, default=Tipo.PERSONAL)
    fecha = models.DateField(help_text="Fecha del evento; si se repite, la de la primera ocurrencia.")
    todo_el_dia = models.BooleanField(default=False)
    hora_inicio = models.TimeField(null=True, blank=True)
    hora_fin = models.TimeField(null=True, blank=True)
    lugar = models.CharField(max_length=120, blank=True)
    repeticion = models.CharField(
        max_length=20, choices=Repeticion.choices, default=Repeticion.NINGUNA
    )
    repetir_hasta = models.DateField(
        null=True, blank=True, help_text="Última fecha en la que se repite (inclusive)."
    )

    class Meta:
        db_table = "evento_calendario"
        ordering = ["fecha", "hora_inicio"]
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(todo_el_dia=True, hora_inicio__isnull=True, hora_fin__isnull=True)
                    | models.Q(todo_el_dia=False, hora_inicio__isnull=False, hora_fin__isnull=False)
                ),
                name="evento_calendario_horario_segun_todo_el_dia",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(hora_inicio__isnull=True)
                    | models.Q(hora_fin__gt=models.F("hora_inicio"))
                ),
                name="evento_calendario_hora_fin_gt_inicio",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(repeticion="ninguna", repetir_hasta__isnull=True)
                    | models.Q(repeticion="semanal", repetir_hasta__isnull=False)
                ),
                name="evento_calendario_repetir_hasta_si_repite",
            ),
        ]

    def __str__(self):
        return f"{self.titulo} · {self.fecha}"

    def ocurrencias(self, desde, hasta):
        """Fechas en las que cae el evento dentro de [desde, hasta].

        Los eventos semanales (la cursada típica) se guardan una sola vez y se
        expanden acá: no se materializa una fila por semana.
        """
        if self.repeticion == self.Repeticion.NINGUNA:
            return [self.fecha] if desde <= self.fecha <= hasta else []

        fin = min(hasta, self.repetir_hasta)
        if fin < self.fecha:
            return []
        # Primera ocurrencia >= desde, respetando el paso semanal.
        fecha = self.fecha
        if fecha < desde:
            semanas = ((desde - fecha).days + 6) // 7
            fecha += timedelta(weeks=semanas)
        fechas = []
        while fecha <= fin:
            fechas.append(fecha)
            fecha += timedelta(weeks=1)
        return fechas


class Apunte(models.Model):
    class Tipo(models.TextChoices):
        APUNTE = "apunte", "Apunte"
        GRABACION = "grabacion", "Grabación"
        ENLACE = "enlace", "Enlace"

    class Visibilidad(models.TextChoices):
        PRIVADO = "privado", "Privado"
        COMISION = "comision", "Compartido con la comisión"

    alumno = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="apuntes"
    )
    materia = models.ForeignKey(
        Materia, on_delete=models.SET_NULL, null=True, blank=True, related_name="apuntes"
    )
    evento = models.ForeignKey(
        EventoCalendario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="apuntes",
        help_text="Clase o examen del calendario al que pertenece el apunte.",
    )
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    tipo = models.CharField(max_length=20, choices=Tipo.choices, default=Tipo.APUNTE)
    archivo = models.FileField(
        upload_to=ruta_archivo_apunte,
        blank=True,
        validators=[FileExtensionValidator(EXTENSIONES_PERMITIDAS)],
    )
    nombre_archivo = models.CharField(max_length=255, blank=True)
    tamano_bytes = models.PositiveBigIntegerField(null=True, blank=True)
    enlace = models.URLField(blank=True, help_text="Alternativa al archivo: Drive, YouTube, etc.")
    visibilidad = models.CharField(
        max_length=20, choices=Visibilidad.choices, default=Visibilidad.PRIVADO
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "apunte"
        ordering = ["-creado_en", "-id"]
        constraints = [
            models.CheckConstraint(
                condition=~models.Q(archivo="") | ~models.Q(enlace=""),
                name="apunte_archivo_o_enlace",
            ),
            models.CheckConstraint(
                condition=models.Q(visibilidad="privado") | models.Q(materia__isnull=False),
                name="apunte_compartido_requiere_materia",
            ),
        ]

    def __str__(self):
        return self.titulo
