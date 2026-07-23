-- Proceso 01 · Gestión de cursos y contenidos
-- Ver docs/procesos/01-gestion-cursos-contenidos.md para el diagrama y las
-- reglas de negocio detrás de este esquema.

CREATE TYPE rol_usuario AS ENUM ('alumno', 'docente', 'administrativo');
CREATE TYPE tipo_recurso AS ENUM ('archivo', 'video', 'link', 'texto');
CREATE TYPE estado_inscripcion AS ENUM ('activa', 'abandonada', 'aprobada', 'desaprobada');
CREATE TYPE estado_entrega AS ENUM ('pendiente', 'entregado', 'corregido');

CREATE TABLE usuario (
    id          SERIAL PRIMARY KEY,
    nombre      TEXT NOT NULL,
    apellido    TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    rol         rol_usuario NOT NULL
);

CREATE TABLE carrera (
    id      SERIAL PRIMARY KEY,
    nombre  TEXT NOT NULL
);

CREATE TABLE materia (
    id          SERIAL PRIMARY KEY,
    carrera_id  INTEGER NOT NULL REFERENCES carrera(id),
    codigo      TEXT NOT NULL UNIQUE,
    nombre      TEXT NOT NULL,
    creditos    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE comision (
    id          SERIAL PRIMARY KEY,
    materia_id  INTEGER NOT NULL REFERENCES materia(id),
    docente_id  INTEGER NOT NULL REFERENCES usuario(id),
    periodo     TEXT NOT NULL, -- ej. '2026-2S'
    cupo        INTEGER NOT NULL,
    aula        TEXT
);

CREATE TABLE modulo (
    id           SERIAL PRIMARY KEY,
    comision_id  INTEGER NOT NULL REFERENCES comision(id) ON DELETE CASCADE,
    titulo       TEXT NOT NULL,
    orden        INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE recurso (
    id                SERIAL PRIMARY KEY,
    modulo_id         INTEGER NOT NULL REFERENCES modulo(id) ON DELETE CASCADE,
    tipo              tipo_recurso NOT NULL,
    titulo            TEXT NOT NULL,
    url_o_contenido   TEXT NOT NULL,
    orden             INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE entrega (
    id               SERIAL PRIMARY KEY,
    modulo_id        INTEGER NOT NULL REFERENCES modulo(id) ON DELETE CASCADE,
    titulo           TEXT NOT NULL,
    descripcion      TEXT,
    fecha_limite     DATE NOT NULL,
    puntaje_maximo   NUMERIC(5,2) NOT NULL DEFAULT 100
);

CREATE TABLE inscripcion_comision (
    id                 SERIAL PRIMARY KEY,
    alumno_id          INTEGER NOT NULL REFERENCES usuario(id),
    comision_id        INTEGER NOT NULL REFERENCES comision(id),
    fecha_inscripcion  DATE NOT NULL DEFAULT CURRENT_DATE,
    estado             estado_inscripcion NOT NULL DEFAULT 'activa',
    UNIQUE (alumno_id, comision_id)
);

CREATE TABLE entrega_alumno (
    id            SERIAL PRIMARY KEY,
    entrega_id    INTEGER NOT NULL REFERENCES entrega(id),
    alumno_id     INTEGER NOT NULL REFERENCES usuario(id),
    fecha_envio   TIMESTAMP,
    archivo_url   TEXT,
    nota          NUMERIC(5,2),
    estado        estado_entrega NOT NULL DEFAULT 'pendiente',
    UNIQUE (entrega_id, alumno_id)
);

CREATE INDEX idx_materia_carrera ON materia(carrera_id);
CREATE INDEX idx_comision_materia ON comision(materia_id);
CREATE INDEX idx_comision_docente ON comision(docente_id);
CREATE INDEX idx_modulo_comision ON modulo(comision_id);
CREATE INDEX idx_recurso_modulo ON recurso(modulo_id);
CREATE INDEX idx_entrega_modulo ON entrega(modulo_id);
CREATE INDEX idx_inscripcion_comision ON inscripcion_comision(comision_id);
CREATE INDEX idx_entrega_alumno_entrega ON entrega_alumno(entrega_id);
