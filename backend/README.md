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

Las tareas periódicas (`productividad/tasks.py`) ya quedan registradas al
correr `migrate` (migración de datos `0005_tareas_periodicas_recordatorios`),
corriendo todos los días a las 07:00 (hora Argentina):

- `generar_recordatorios_entregas_proximas` — un recordatorio por alumno
  inscripto activo que todavía no entregó, para entregas que vencen dentro
  de las próximas 24hs.
- `generar_recordatorios_habitos` — para hábitos diarios sin
  `registro_habito` cumplido el día anterior.
- `generar_recordatorios_repaso_espaciado` — para todo `item_repaso` con
  `proxima_fecha_repaso` ya vencida.

Los tres son idempotentes (no duplican un recordatorio ya pendiente) y
solo *crean* el registro en `pendiente` — no hay todavía un canal real de
entrega (push/email); eso queda para cuando se integre un proveedor.
`examen_proximo` no está implementado: depende de una entidad de mesa de
examen que todavía no existe (Proceso 03).

Para probar manualmente sin esperar al cron, desde `python manage.py shell`:

```python
from productividad.tasks import generar_todos_los_recordatorios
generar_todos_los_recordatorios()
```

## Estado actual

Modelos, admin, endpoints REST (con las reglas de negocio de los procesos
01 y 02 aplicadas) y las tareas de Celery que pueblan `recordatorio`. Falta
armar el Proceso 03 (inscripciones institucionales / legajo) y un frontend.
