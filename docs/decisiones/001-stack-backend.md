# ADR 001 · Stack de backend

## Contexto

Web-Uni ya no es solo gestión institucional (cursos, inscripciones, legajo):
suma un módulo de **productividad y desempeño del estudiante** (planificador
de horas de estudio, recordatorios/hábitos, seguimiento de desempeño,
preparación activa para exámenes con repaso espaciado). Eso implica, además
del CRUD habitual:

- Tareas programadas y en segundo plano (recordatorios, repaso espaciado).
- Un panel de administración para el rol administrativo (alta de materias,
  comisiones) sin construir esa UI a mano.
- Dashboards de desempeño por alumno/materia.

## Decisión

**Python + Django + Django REST Framework**, sobre **PostgreSQL**, con
**Celery + Redis** para todo lo asíncrono/programado (recordatorios, cálculo
de próximo repaso espaciado, notificaciones).

| Pieza | Elección | Por qué |
|---|---|---|
| Lenguaje | Python 3.12 | Definido por preferencia del equipo |
| Framework web | Django 5 + DRF | Admin panel incluido (cubre al rol administrativo sin UI a medida), ORM maduro, auth y permisos por rol ya resueltos |
| Base de datos | PostgreSQL | Mismo motor que `db/01_gestion_cursos_contenidos.sql`; tipos `ENUM` y constraints ya pensados para Postgres |
| Jobs asíncronos | Celery + Redis + django-celery-beat | Recordatorios y repaso espaciado son tareas programadas recurrentes; es el patrón estándar en Django, no hay que inventar un scheduler |
| API | DRF (REST) | Suficiente para un frontend desacoplado; no hay necesidad de GraphQL con este volumen de entidades |

## Alternativas descartadas

- **FastAPI + SQLAlchemy**: más liviano y async-nativo, pero exige armar a
  mano panel de administración, auth y permisos — trabajo que Django ya
  resuelve, y este proyecto necesita ese panel administrativo.
- **Node.js/NestJS**: quedó descartado directamente por preferencia de
  lenguaje (Python).

## Consecuencias

- El módulo de cursos/contenidos (proceso 01) se implementa como app
  Django (`cursos`), usando el modelo ya definido en
  `docs/procesos/01-gestion-cursos-contenidos.md` vía el ORM de Django en
  vez del SQL crudo (el archivo `db/01_gestion_cursos_contenidos.sql` queda
  como referencia del modelo, las migraciones reales las genera Django).
- Cada proceso nuevo (inscripciones, legajo, productividad/desempeño) se
  modela como una app Django separada.
- Requiere correr Redis en desarrollo para probar recordatorios/jobs.
