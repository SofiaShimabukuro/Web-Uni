from django.conf import settings
from django.db import models

from cursos.models import Entrega, Materia, Recurso


class BloqueEstudio(models.Model):
    class Tipo(models.TextChoices):
        ESTUDIO = "estudio", "Estudio"
        REPASO = "repaso", "Repaso"
        ENTREGA = "entrega", "Entrega"
        EXAMEN = "examen", "Examen"

    class Estado(models.TextChoices):
        PLANIFICADO = "planificado", "Planificado"
        CUMPLIDO = "cumplido", "Cumplido"
        SALTEADO = "salteado", "Salteado"

    alumno = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bloques_estudio"
    )
    materia = models.ForeignKey(
        Materia, on_delete=models.SET_NULL, null=True, blank=True, related_name="bloques_estudio"
    )
    tipo = models.CharField(max_length=20, choices=Tipo.choices)
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.PLANIFICADO)

    class Meta:
        db_table = "bloque_estudio"
        ordering = ["fecha", "hora_inicio"]

    def __str__(self):
        return f"{self.alumno} · {self.fecha} {self.hora_inicio}-{self.hora_fin}"


class Habito(models.Model):
    class Frecuencia(models.TextChoices):
        DIARIA = "diaria", "Diaria"
        SEMANAL = "semanal", "Semanal"
        DIAS_ESPECIFICOS = "dias_especificos", "Días específicos"

    alumno = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="habitos"
    )
    nombre = models.CharField(max_length=200)
    frecuencia = models.CharField(max_length=20, choices=Frecuencia.choices)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = "habito"

    def __str__(self):
        return self.nombre


class RegistroHabito(models.Model):
    habito = models.ForeignKey(Habito, on_delete=models.CASCADE, related_name="registros")
    fecha = models.DateField()
    cumplido = models.BooleanField()

    class Meta:
        db_table = "registro_habito"
        unique_together = ("habito", "fecha")

    def __str__(self):
        return f"{self.habito} · {self.fecha} · {'✓' if self.cumplido else '✗'}"


class ItemRepaso(models.Model):
    alumno = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="items_repaso"
    )
    materia = models.ForeignKey(
        Materia, on_delete=models.SET_NULL, null=True, blank=True, related_name="items_repaso"
    )
    recurso = models.ForeignKey(
        Recurso, on_delete=models.SET_NULL, null=True, blank=True, related_name="items_repaso"
    )
    pregunta = models.TextField()
    respuesta = models.TextField()
    facilidad = models.DecimalField(max_digits=4, decimal_places=2, default=2.5)
    intervalo_dias = models.PositiveIntegerField(default=0)
    repeticiones = models.PositiveIntegerField(default=0)
    proxima_fecha_repaso = models.DateField()

    class Meta:
        db_table = "item_repaso"

    def __str__(self):
        return self.pregunta[:60]


class SesionRepaso(models.Model):
    class Calificacion(models.TextChoices):
        OTRA_VEZ = "otra_vez", "Otra vez"
        DIFICIL = "dificil", "Difícil"
        BIEN = "bien", "Bien"
        FACIL = "facil", "Fácil"

    item_repaso = models.ForeignKey(
        ItemRepaso, on_delete=models.CASCADE, related_name="sesiones"
    )
    fecha = models.DateField(auto_now_add=True)
    calificacion = models.CharField(max_length=20, choices=Calificacion.choices)

    class Meta:
        db_table = "sesion_repaso"

    def __str__(self):
        return f"{self.item_repaso} · {self.calificacion}"


class Autoevaluacion(models.Model):
    alumno = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="autoevaluaciones"
    )
    materia = models.ForeignKey(Materia, on_delete=models.PROTECT, related_name="autoevaluaciones")
    fecha = models.DateField(auto_now_add=True)
    puntaje = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    total_preguntas = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "autoevaluacion"

    def __str__(self):
        return f"{self.alumno} · {self.materia} · {self.fecha}"


class PreguntaAutoevaluacion(models.Model):
    autoevaluacion = models.ForeignKey(
        Autoevaluacion, on_delete=models.CASCADE, related_name="preguntas"
    )
    enunciado = models.TextField()
    respuesta_correcta = models.TextField()
    respuesta_alumno = models.TextField(blank=True)
    es_correcta = models.BooleanField(null=True, blank=True)

    class Meta:
        db_table = "pregunta_autoevaluacion"

    def __str__(self):
        return self.enunciado[:60]


class Recordatorio(models.Model):
    class Tipo(models.TextChoices):
        ENTREGA_PROXIMA = "entrega_proxima", "Entrega próxima"
        EXAMEN_PROXIMO = "examen_proximo", "Examen próximo"
        HABITO = "habito", "Hábito"
        REPASO_ESPACIADO = "repaso_espaciado", "Repaso espaciado"

    class Canal(models.TextChoices):
        PUSH = "push", "Push"
        EMAIL = "email", "Email"

    class Estado(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        ENVIADO = "enviado", "Enviado"
        LEIDO = "leido", "Leído"

    alumno = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="recordatorios"
    )
    tipo = models.CharField(max_length=20, choices=Tipo.choices)
    entrega = models.ForeignKey(
        Entrega, on_delete=models.CASCADE, null=True, blank=True, related_name="recordatorios"
    )
    habito = models.ForeignKey(
        Habito, on_delete=models.CASCADE, null=True, blank=True, related_name="recordatorios"
    )
    item_repaso = models.ForeignKey(
        ItemRepaso, on_delete=models.CASCADE, null=True, blank=True, related_name="recordatorios"
    )
    fecha_hora_envio = models.DateTimeField()
    canal = models.CharField(max_length=20, choices=Canal.choices, default=Canal.PUSH)
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.PENDIENTE)

    class Meta:
        db_table = "recordatorio"

    def __str__(self):
        return f"{self.alumno} · {self.tipo} · {self.fecha_hora_envio}"
