-- Proceso 03 · Mesas de examen, legajo y trámites
-- Ver docs/procesos/03-mesas-legajo-tramites.md para el diagrama y las
-- reglas de negocio detrás de este esquema.
-- Depende de las tablas de db/01_gestion_cursos_contenidos.sql
-- (usuario, materia).

CREATE TYPE tipo_mesa_examen AS ENUM ('final', 'recuperatorio');
CREATE TYPE estado_inscripcion_mesa AS ENUM ('inscripto', 'ausente', 'aprobado', 'desaprobado');
CREATE TYPE tipo_solicitud_tramite AS ENUM (
    'certificado_alumno_regular',
    'certificado_analitico',
    'constancia_titulo_en_tramite'
);
CREATE TYPE estado_solicitud_tramite AS ENUM ('pendiente', 'emitido', 'rechazado');

CREATE TABLE mesa_examen (
    id          SERIAL PRIMARY KEY,
    materia_id  INTEGER NOT NULL REFERENCES materia(id),
    docente_id  INTEGER NOT NULL REFERENCES usuario(id),
    fecha       DATE NOT NULL,
    tipo        tipo_mesa_examen NOT NULL
);

CREATE TABLE inscripcion_mesa (
    id                 SERIAL PRIMARY KEY,
    alumno_id          INTEGER NOT NULL REFERENCES usuario(id),
    mesa_id            INTEGER NOT NULL REFERENCES mesa_examen(id),
    fecha_inscripcion  DATE NOT NULL DEFAULT CURRENT_DATE,
    estado             estado_inscripcion_mesa NOT NULL DEFAULT 'inscripto',
    nota               NUMERIC(5,2),
    UNIQUE (alumno_id, mesa_id)
);

CREATE TABLE solicitud_tramite (
    id               SERIAL PRIMARY KEY,
    alumno_id        INTEGER NOT NULL REFERENCES usuario(id),
    tipo             tipo_solicitud_tramite NOT NULL,
    fecha_solicitud  DATE NOT NULL DEFAULT CURRENT_DATE,
    estado           estado_solicitud_tramite NOT NULL DEFAULT 'pendiente',
    observaciones    TEXT
);

CREATE INDEX idx_mesa_examen_materia ON mesa_examen(materia_id);
CREATE INDEX idx_mesa_examen_docente ON mesa_examen(docente_id);
CREATE INDEX idx_inscripcion_mesa_alumno ON inscripcion_mesa(alumno_id);
CREATE INDEX idx_inscripcion_mesa_mesa ON inscripcion_mesa(mesa_id);
CREATE INDEX idx_solicitud_tramite_alumno ON solicitud_tramite(alumno_id);
