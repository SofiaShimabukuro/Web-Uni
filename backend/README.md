# Web-Uni · backend

Django + Django REST Framework + PostgreSQL + Celery. Ver
`docs/decisiones/001-stack-backend.md` en la raíz del repo para el porqué.

Apps:

- `usuarios` — modelo de usuario custom con `rol` (alumno/docente/administrativo).
- `cursos` — Proceso 01: materia, comisión, módulo, recurso, entrega. Ver
  `docs/procesos/01-gestion-cursos-contenidos.md`.
- `productividad` — Proceso 02: planificador de estudio, hábitos, repaso
  espaciado, autoevaluaciones, recordatorios. Ver
  `docs/procesos/02-productividad-desempeno.md`.

## Setup local

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

cp backend/.env.example backend/.env
# completar backend/.env con los datos de tu Postgres y Redis locales

cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

El panel de administración queda en `/admin/`.

## Celery (recordatorios y repaso espaciado)

Requiere Redis corriendo. En dos terminales aparte, desde `backend/`:

```bash
celery -A config worker -l info
celery -A config beat -l info
```

## Estado actual

Scaffold inicial: modelos + admin de los Procesos 01 y 02, settings de
Postgres/DRF/Celery. Todavía faltan migraciones generadas contra una base
real, serializers/endpoints de la API y las tareas de Celery en sí
(`recordatorio` hoy es solo una tabla, el job que la puebla no está escrito).
