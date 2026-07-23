from django.conf import settings
from django.db import models

from cursos.models import Materia


class MesaExamen(models.Model):
    class Tipo(models.TextChoices):
        FINAL = "final", "Final"
        RECUPERATORIO = "recuperatorio", "Recuperatorio"

    materia = models.ForeignKey(Materia, on_delete=models.PROTECT, related_name="mesas_examen")
    docente = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="mesas_presididas"
    )
    fecha = models.DateField()
    tipo = models.CharField(max_length=20, choices=Tipo.choices)

    class Meta:
        db_table = "mesa_examen"
        ordering = ["fecha"]

    def __str__(self):
        return f"{self.materia.codigo} · {self.fecha} ({self.tipo})"


class InscripcionMesa(models.Model):
    class Estado(models.TextChoices):
        INSCRIPTO = "inscripto", "Inscripto"
        AUSENTE = "ausente", "Ausente"
        APROBADO = "aprobado", "Aprobado"
        DESAPROBADO = "desaprobado", "Desaprobado"

    alumno = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="inscripciones_mesa"
    )
    mesa = models.ForeignKey(MesaExamen, on_delete=models.PROTECT, related_name="inscriptos")
    fecha_inscripcion = models.DateField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.INSCRIPTO)
    nota = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = "inscripcion_mesa"
        unique_together = ("alumno", "mesa")
        ordering = ["-fecha_inscripcion"]

    def __str__(self):
        return f"{self.alumno} -> {self.mesa}"


class SolicitudTramite(models.Model):
    class Tipo(models.TextChoices):
        CERTIFICADO_ALUMNO_REGULAR = "certificado_alumno_regular", "Certificado de alumno regular"
        CERTIFICADO_ANALITICO = "certificado_analitico", "Certificado analítico"
        CONSTANCIA_TITULO_EN_TRAMITE = "constancia_titulo_en_tramite", "Constancia de título en trámite"

    class Estado(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        EMITIDO = "emitido", "Emitido"
        RECHAZADO = "rechazado", "Rechazado"

    alumno = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="solicitudes_tramite"
    )
    tipo = models.CharField(max_length=40, choices=Tipo.choices)
    fecha_solicitud = models.DateField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.PENDIENTE)
    observaciones = models.TextField(blank=True)

    class Meta:
        db_table = "solicitud_tramite"
        ordering = ["-fecha_solicitud", "-id"]

    def __str__(self):
        return f"{self.alumno} · {self.tipo} · {self.estado}"
