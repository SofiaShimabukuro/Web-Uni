from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    class Rol(models.TextChoices):
        ALUMNO = "alumno", "Alumno"
        DOCENTE = "docente", "Docente"
        ADMINISTRATIVO = "administrativo", "Administrativo"

    rol = models.CharField(max_length=20, choices=Rol.choices)

    class Meta:
        db_table = "usuario"

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.rol})"
