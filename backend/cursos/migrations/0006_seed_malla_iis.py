"""Seed del catálogo real: Ingeniería Industrial y de Sistemas, Malla 2024-2028.

Créditos por semestre verificados contra los totales de la malla
(I=21, II=21, III=22, IV=23, V=25, VI=23, VII=23, VIII=22, IX=20, X=22).
"""

from django.db import migrations

NOMBRE_CARRERA = "Ingeniería Industrial y de Sistemas"

# (código, nombre, créditos, semestre)
MATERIAS = [
    ("GAV", "Geometría analítica y vectorial", 5, 1),
    ("ALG", "Álgebra lineal", 4, 1),
    ("IRG", "Introducción a la Representación Gráfica", 5, 1),
    ("CEL", "Cálculo Elemental", 5, 1),
    ("ORU", "Orientación universitaria", 2, 1),
    ("F1", "Física General 1", 5, 2),
    ("PB", "Programación Básica", 4, 2),
    ("QG", "Química General", 4, 2),
    ("CUV", "Cálculo de una Variable", 5, 2),
    ("CV1", "Comunicación Verbal 1", 3, 2),
    ("F2", "Física General 2", 5, 3),
    ("MRA", "Mecánica Racional", 5, 3),
    ("IIS", "Introducción a la Ingeniería Industrial y de Sistemas", 4, 3),
    ("CMV", "Cálculo Multivariable", 5, 3),
    ("CV2", "Comunicación Verbal 2", 3, 3),
    ("STD", "Sistemas Termodinámicos", 4, 4),
    ("AGT", "Algorítmica", 4, 4),
    ("EDP", "Estadística y Probabilidad", 5, 4),
    ("MOP", "Métodos de Optimización en Ingeniería Industrial", 4, 4),
    ("HYC", "Historia y Cultura", 2, 4),
    ("GEM", "Gestión Empresarial", 4, 4),
    ("TEL", "Tecnología Eléctrica", 4, 5),
    ("DMP", "Diseño y Mejora de Procesos", 6, 5),
    ("MDE", "Modelización Estadística", 4, 5),
    ("MPI", "Métodos Probabilísticos para la Investigación de Operaciones", 4, 5),
    ("AF", "Antropología Filosófica", 3, 5),
    ("COS", "Costos", 4, 5),
    ("GER", "Gestión Ambiental y Energías Renovables", 6, 6),
    ("POP", "Planeamiento de Operaciones", 6, 6),
    ("EI", "Estadística Industrial", 4, 6),
    ("BD", "Base de Datos", 4, 6),
    ("RCT", "Realidad, Conocimiento y Trascendencia", 3, 6),
    ("EAU", "Electrotecnia Aplicada y Automatización", 5, 7),
    ("GCS", "Gestión de la Cadena de Suministro", 6, 7),
    ("EF", "Economía y Finanzas", 6, 7),
    ("ADS", "Análisis y Diseño de Sistemas", 4, 7),
    ("T1", "Introducción a la Teología", 2, 7),
    ("TFA", "Tecnología de Fabricación", 4, 8),
    ("SIG", "Sistemas Integrados de Gestión", 6, 8),
    ("EAG", "Emprendimiento y Agilidad Empresarial", 6, 8),
    ("ID", "Ingeniería de Datos", 4, 8),
    ("T2", "Teología y Vida Cristiana", 2, 8),
    ("OPR", "Operaciones y Procesos Industriales", 6, 9),
    ("ELE1", "Electivo 1", 4, 9),
    ("DPE", "Ética y Dirección de Personas", 4, 9),
    ("ELE2", "Electivo 2", 4, 9),
    ("DSO", "Doctrina Social de la Iglesia", 2, 9),
    ("ELE3", "Electivo 3", 4, 10),
    ("DPY", "Dirección de Proyectos", 8, 10),
    ("ELE4", "Electivo 4", 4, 10),
    ("DTI", "Dirección de Tecnologías de Información", 6, 10),
]


def cargar_malla(apps, schema_editor):
    Carrera = apps.get_model("cursos", "Carrera")
    Materia = apps.get_model("cursos", "Materia")

    carrera, _ = Carrera.objects.get_or_create(nombre=NOMBRE_CARRERA)
    for codigo, nombre, creditos, semestre in MATERIAS:
        Materia.objects.get_or_create(
            codigo=codigo,
            defaults={
                "carrera": carrera,
                "nombre": nombre,
                "creditos": creditos,
                "semestre": semestre,
            },
        )


def quitar_malla(apps, schema_editor):
    Materia = apps.get_model("cursos", "Materia")
    Carrera = apps.get_model("cursos", "Carrera")
    Materia.objects.filter(codigo__in=[codigo for codigo, *_ in MATERIAS]).delete()
    Carrera.objects.filter(nombre=NOMBRE_CARRERA).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("cursos", "0005_alter_materia_options_materia_semestre"),
    ]

    operations = [
        migrations.RunPython(cargar_malla, quitar_malla),
    ]
