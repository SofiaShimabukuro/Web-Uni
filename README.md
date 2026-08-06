# Web-Uni

Plataforma para organizar la vida universitaria: la cursada, el calendario,
los apuntes y grabaciones, el estudio y los trámites.

Backend en Django + DRF (`backend/`), frontend en React + Vite + MUI
(`frontend/`). El modelo de datos está documentado proceso por proceso en
`docs/procesos/`, con el esquema SQL equivalente en `db/`.

| Proceso | Qué cubre | Documento |
| ------- | --------- | --------- |
| 01 | Materias, comisiones, módulos, recursos y entregas | [docs/procesos/01](docs/procesos/01-gestion-cursos-contenidos.md) |
| 02 | Planificador, hábitos, repaso espaciado, autoevaluaciones | [docs/procesos/02](docs/procesos/02-productividad-desempeno.md) |
| 03 | Mesas de examen, legajo y trámites | [docs/procesos/03](docs/procesos/03-mesas-legajo-tramites.md) |
| 04 | Calendario personal y biblioteca de apuntes y grabaciones | [docs/procesos/04](docs/procesos/04-agenda-apuntes.md) |

## Uso personal: levantarlo en tu compu

Para usarlo vos sola no hace falta ni PostgreSQL ni Redis. Alcanza con
SQLite y los dos servidores de desarrollo.

```bash
# 1. Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

cd backend
echo "DB_ENGINE=sqlite" > .env
python manage.py migrate                 # crea la base y carga la malla de materias
python manage.py createsuperuser         # te va a pedir usuario, email, rol y contraseña
                                         # ⚠️ en "Rol" poné: alumno
python manage.py runserver
```

```bash
# 2. Frontend, en otra terminal
cd frontend
npm install
npm run dev
```

Entrás por http://localhost:5173 con el usuario que creaste. Ya vas a tener
las 51 materias de la malla cargadas, así que podés empezar a usar el
calendario y los apuntes sin configurar nada más.

Lo que **no** hace falta para el uso diario:

- **PostgreSQL**: con `DB_ENGINE=sqlite` la base es un archivo
  (`backend/db.sqlite3`). El esquema es el mismo, así que pasarte a Postgres
  después es exportar e importar, no rehacer nada.
- **Redis + Celery**: solo generan los recordatorios automáticos del Proceso
  02. Sin eso, todo el resto anda igual.
- **Comisiones y docentes**: el calendario y los apuntes son personales y no
  dependen de que haya una cursada cargada. Solo hacen falta si querés
  compartir apuntes con compañeros o usar las entregas y mesas.

Tus archivos quedan en `backend/media/` y la base en `backend/db.sqlite3`:
esos dos, copiados, son tu backup completo. Ninguno se sube a git.

## Qué faltaría para abrirlo a más gente

Hoy está pensado para correr en tu máquina. Antes de que lo use alguien más:

- **Deploy y HTTPS**: un servidor real con `DJANGO_DEBUG=False`,
  `DJANGO_SECRET_KEY` propia y `DJANGO_ALLOWED_HOSTS` configurado. Hoy los
  dos servidores son de desarrollo.
- **Registro de usuarios**: las cuentas se crean a mano por consola o desde
  `/admin/`. No hay alta propia, ni recuperación de contraseña, ni
  verificación de mail.
- **PostgreSQL**: SQLite aguanta un usuario, no varios escribiendo a la vez.
- **Almacenamiento de archivos**: con varias personas subiendo grabaciones,
  el disco del servidor se queda corto. `archivo` es un `FileField`, así que
  mover todo a S3 es cambiar el storage en `settings.py`, sin tocar la base.
- **Backups automáticos**: hoy el backup es copiar dos rutas a mano.

## Tests

```bash
cd backend && python manage.py test        # backend
cd frontend && npm run build && npm run lint  # frontend (typecheck + lint)
```
