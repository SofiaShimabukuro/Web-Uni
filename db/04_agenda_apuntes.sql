-- Proceso 04 · Calendario personal y biblioteca de apuntes
-- Ver docs/procesos/04-agenda-apuntes.md para el diagrama y las reglas de
-- negocio detrás de este esquema.
-- Depende de las tablas de db/01_gestion_cursos_contenidos.sql
-- (usuario, materia).

CREATE TYPE tipo_evento_calendario AS ENUM ('clase', 'parcial', 'final', 'entrega', 'personal');
CREATE TYPE repeticion_evento AS ENUM ('ninguna', 'semanal');
CREATE TYPE tipo_apunte AS ENUM ('apunte', 'grabacion', 'enlace');
CREATE TYPE visibilidad_apunte AS ENUM ('privado', 'comision');

CREATE TABLE evento_calendario (
    id             SERIAL PRIMARY KEY,
    alumno_id      INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    materia_id     INTEGER REFERENCES materia(id) ON DELETE SET NULL,
    titulo         TEXT NOT NULL,
    descripcion    TEXT NOT NULL DEFAULT '',
    tipo           tipo_evento_calendario NOT NULL DEFAULT 'personal',
    fecha          DATE NOT NULL,
    todo_el_dia    BOOLEAN NOT NULL DEFAULT FALSE,
    hora_inicio    TIME,
    hora_fin       TIME,
    lugar          TEXT NOT NULL DEFAULT '',
    repeticion     repeticion_evento NOT NULL DEFAULT 'ninguna',
    repetir_hasta  DATE,
    -- Un evento de todo el día no tiene horario; uno con horario lo tiene completo.
    CHECK (
        (todo_el_dia AND hora_inicio IS NULL AND hora_fin IS NULL)
        OR (NOT todo_el_dia AND hora_inicio IS NOT NULL AND hora_fin IS NOT NULL)
    ),
    CHECK (hora_inicio IS NULL OR hora_fin > hora_inicio),
    -- Si se repite, hay que decir hasta cuándo (fin de cuatrimestre).
    CHECK (
        (repeticion = 'ninguna' AND repetir_hasta IS NULL)
        OR (repeticion = 'semanal' AND repetir_hasta IS NOT NULL)
    )
);

CREATE INDEX evento_calendario_alumno_fecha_idx ON evento_calendario (alumno_id, fecha);

CREATE TABLE apunte (
    id              SERIAL PRIMARY KEY,
    alumno_id       INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    materia_id      INTEGER REFERENCES materia(id) ON DELETE SET NULL,
    evento_id       INTEGER REFERENCES evento_calendario(id) ON DELETE SET NULL,
    titulo          TEXT NOT NULL,
    descripcion     TEXT NOT NULL DEFAULT '',
    tipo            tipo_apunte NOT NULL DEFAULT 'apunte',
    -- Ruta relativa dentro de MEDIA_ROOT: apuntes/<alumno_id>/<uuid>.<ext>
    archivo         TEXT NOT NULL DEFAULT '',
    nombre_archivo  TEXT NOT NULL DEFAULT '',
    tamano_bytes    BIGINT,
    enlace          TEXT NOT NULL DEFAULT '',
    visibilidad     visibilidad_apunte NOT NULL DEFAULT 'privado',
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- O archivo subido o enlace externo, pero algo tiene que haber.
    CHECK (archivo <> '' OR enlace <> ''),
    -- Sin materia no hay comisión con la cual compartir.
    CHECK (visibilidad = 'privado' OR materia_id IS NOT NULL)
);

CREATE INDEX apunte_alumno_idx ON apunte (alumno_id);
CREATE INDEX apunte_materia_visibilidad_idx ON apunte (materia_id, visibilidad);
