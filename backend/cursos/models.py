from django.conf import settings
from django.db import models


class Carrera(models.Model):
    nombre = models.CharField(max_length=200)

    class Meta:
        db_table = "carrera"

    def __str__(self):
        return self.nombre


class Materia(models.Model):
    carrera = models.ForeignKey(Carrera, on_delete=models.PROTECT, related_name="materias")
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=200)
    creditos = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "materia"

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class Comision(models.Model):
    materia = models.ForeignKey(Materia, on_delete=models.PROTECT, related_name="comisiones")
    docente = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="comisiones_a_cargo"
    )
    periodo = models.CharField(max_length=20, help_text="ej. 2026-2S")
    cupo = models.PositiveSmallIntegerField()
    aula = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = "comision"

    def __str__(self):
        return f"{self.materia.codigo} ({self.periodo})"


class Modulo(models.Model):
    comision = models.ForeignKey(Comision, on_delete=models.CASCADE, related_name="modulos")
    titulo = models.CharField(max_length=200)
    orden = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "modulo"
        ordering = ["orden"]

    def __str__(self):
        return self.titulo


class Recurso(models.Model):
    class Tipo(models.TextChoices):
        ARCHIVO = "archivo", "Archivo"
        VIDEO = "video", "Video"
        LINK = "link", "Link"
        TEXTO = "texto", "Texto"

    modulo = models.ForeignKey(Modulo, on_delete=models.CASCADE, related_name="recursos")
    tipo = models.CharField(max_length=20, choices=Tipo.choices)
    titulo = models.CharField(max_length=200)
    url_o_contenido = models.TextField()
    orden = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "recurso"
        ordering = ["orden"]

    def __str__(self):
        return self.titulo


class Entrega(models.Model):
    modulo = models.ForeignKey(Modulo, on_delete=models.CASCADE, related_name="entregas")
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    fecha_limite = models.DateField()
    puntaje_maximo = models.DecimalField(max_digits=5, decimal_places=2, default=100)

    class Meta:
        db_table = "entrega"

    def __str__(self):
        return self.titulo


class InscripcionComision(models.Model):
    class Estado(models.TextChoices):
        ACTIVA = "activa", "Activa"
        ABANDONADA = "abandonada", "Abandonada"
        APROBADA = "aprobada", "Aprobada"
        DESAPROBADA = "desaprobada", "Desaprobada"

    alumno = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="inscripciones"
    )
    comision = models.ForeignKey(Comision, on_delete=models.PROTECT, related_name="inscripciones")
    fecha_inscripcion = models.DateField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.ACTIVA)

    class Meta:
        db_table = "inscripcion_comision"
        unique_together = ("alumno", "comision")

    def __str__(self):
        return f"{self.alumno} -> {self.comision}"


class EntregaAlumno(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        ENTREGADO = "entregado", "Entregado"
        CORREGIDO = "corregido", "Corregido"

    entrega = models.ForeignKey(Entrega, on_delete=models.PROTECT, related_name="entregas_alumnos")
    alumno = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="entregas_realizadas"
    )
    fecha_envio = models.DateTimeField(null=True, blank=True)
    archivo_url = models.TextField(blank=True)
    nota = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.PENDIENTE)

    class Meta:
        db_table = "entrega_alumno"
        unique_together = ("entrega", "alumno")

    def __str__(self):
        return f"{self.alumno} -> {self.entrega}"
